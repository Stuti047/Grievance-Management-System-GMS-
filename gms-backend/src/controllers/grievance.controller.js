import prisma from '../config/db.js';
import { generateTicketNumber, generateTrackingToken } from '../utils/token.js';
import { isValidTransition, COMPLAINT_STATUSES } from '../utils/fsm.js';
import { formatGrievance } from '../utils/response.js';

const grievanceInclude = {
  category: {
    include: {
      authority: true
    }
  },
  author: true,
  assigned_authority: true,
  history: {
    include: { updater: true },
    orderBy: { created_at: 'asc' }
  },
  comments: {
    include: { user: true },
    orderBy: { created_at: 'asc' }
  },
  upvotes: true,
  feedback: true,
  flags: {
    include: { reporter: true }
  },
  _count: {
    select: { upvotes: true }
  }
};

export async function createGrievance(req, res, next) {
  try {
    const {
      title,
      description,
      category_id,
      priority = 'Medium',
      location = 'MITS Campus',
      is_anonymous = false,
      evidence_urls = []
    } = req.body;

    const user = req.user;
    if (user.status === 'blocked') {
      return res.status(403).json({ error: 'Your account has been blocked' });
    }

    // Verify category
    const category = await prisma.category.findUnique({
      where: { id: category_id }
    });
    if (!category) {
      return res.status(400).json({ error: 'Invalid category selected' });
    }

    const ticket_number = await generateTicketNumber();
    const tracking_token = is_anonymous ? await generateTrackingToken() : null;

    const created = await prisma.$transaction(async (tx) => {
      const grievance = await tx.grievance.create({
        data: {
          ticket_number,
          title: title.trim(),
          description: description.trim(),
          category_id,
          priority,
          status: COMPLAINT_STATUSES.SUBMITTED,
          location: location.trim(),
          is_anonymous: Boolean(is_anonymous),
          tracking_token,
          sla_hours: category.sla_hours || 48,
          evidence_urls,
          submitted_by: user.id,
          assigned_authority_id: category.authority_id || null
        }
      });

      // Audit status history entry
      await tx.statusHistory.create({
        data: {
          grievance_id: grievance.id,
          previous_status: null,
          new_status: COMPLAINT_STATUSES.SUBMITTED,
          updated_by: user.id,
          remarks: is_anonymous
            ? 'Grievance submitted anonymously with zero-knowledge tracking token.'
            : 'Grievance officially filed through verified MITS student account.'
        }
      });

      // Auto-upvote by author
      await tx.upvote.create({
        data: {
          grievance_id: grievance.id,
          user_id: user.id
        }
      });

      return grievance;
    });

    const fullGrievance = await prisma.grievance.findUnique({
      where: { id: created.id },
      include: grievanceInclude
    });

    return res.status(201).json({
      message: 'Grievance submitted successfully',
      grievance: formatGrievance(fullGrievance, user),
      tracking_token
    });
  } catch (error) {
    next(error);
  }
}

export async function listGrievances(req, res, next) {
  try {
    const {
      category_id,
      sub_authority_id,
      status,
      section,
      search,
      page = 1,
      limit = 20
    } = req.query;

    const viewer = req.user;
    const viewerRole = viewer?.role || 'public';

    const where = {
      is_deleted: false
    };

    // Authority role scope: scope to assigned authority department if requested on authority view
    if (viewerRole === 'authority' && viewer?.authority_profile?.id && sub_authority_id === viewer.authority_profile.id) {
      where.assigned_authority_id = viewer.authority_profile.id;
    } else if (sub_authority_id) {
      where.assigned_authority_id = sub_authority_id;
    }

    if (category_id) where.category_id = category_id;
    if (status) where.status = status;

    if (section) {
      where.category = { section };
    }

    if (search) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { ticket_number: { contains: q, mode: 'insensitive' } },
        { location: { contains: q, mode: 'insensitive' } }
      ];
    }

    const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const [total, items] = await Promise.all([
      prisma.grievance.count({ where }),
      prisma.grievance.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take,
        include: grievanceInclude
      })
    ]);

    return res.status(200).json({
      grievances: items.map(g => formatGrievance(g, viewer)),
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / take)
    });
  } catch (error) {
    next(error);
  }
}

export async function getGrievanceById(req, res, next) {
  try {
    const { id } = req.params;
    const viewer = req.user;

    const grievance = await prisma.grievance.findFirst({
      where: {
        OR: [
          { id },
          { ticket_number: id },
          { tracking_token: id }
        ],
        is_deleted: false
      },
      include: grievanceInclude
    });

    if (!grievance) {
      return res.status(404).json({ error: 'Grievance not found' });
    }

    return res.status(200).json({
      grievance: formatGrievance(grievance, viewer)
    });
  } catch (error) {
    next(error);
  }
}

export async function getMine(req, res, next) {
  try {
    const user = req.user;
    const items = await prisma.grievance.findMany({
      where: {
        submitted_by: user.id,
        is_deleted: false
      },
      orderBy: { created_at: 'desc' },
      include: grievanceInclude
    });

    return res.status(200).json({
      grievances: items.map(g => formatGrievance(g, user)),
      total: items.length
    });
  } catch (error) {
    next(error);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status: new_status, note = '', remarks = '', assigned_authority_id } = req.body;
    const finalNote = note || remarks || '';
    const user = req.user;

    if (user.role === 'student') {
      return res.status(403).json({ error: 'Students cannot alter grievance resolution status (403 Forbidden)' });
    }

    const grievance = await prisma.grievance.findUnique({
      where: { id },
      include: { category: true }
    });

    if (!grievance) {
      return res.status(404).json({ error: 'Grievance record not found' });
    }

    // Authority permission check: must match assigned authority or be admin
    if (user.role === 'authority' && user.authority_profile) {
      if (grievance.assigned_authority_id && grievance.assigned_authority_id !== user.authority_profile.id) {
        return res.status(403).json({ error: 'You are only authorized to update grievances assigned to your department' });
      }
    }

    // FSM Transition verification (Admin can override when exceptional administrative intervention is required)
    if (user.role !== 'admin' && !isValidTransition(grievance.status, new_status)) {
      return res.status(400).json({
        error: `Invalid transition from "${grievance.status}" to "${new_status}". State progression must follow official protocol.`
      });
    }

    const updateData = {
      status: new_status
    };
    if (new_status === COMPLAINT_STATUSES.RESOLVED) {
      updateData.resolved_at = new Date();
    }

    // Support reassignment and escalation
    if (assigned_authority_id && user.role === 'admin') {
      updateData.assigned_authority_id = assigned_authority_id;
    } else if (new_status === COMPLAINT_STATUSES.ESCALATED) {
      if (grievance.category?.escalation_authority_id) {
        updateData.assigned_authority_id = grievance.category.escalation_authority_id;
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.grievance.update({
        where: { id },
        data: updateData
      });

      await tx.statusHistory.create({
        data: {
          grievance_id: id,
          previous_status: grievance.status,
          new_status,
          updated_by: user.id,
          remarks: finalNote || `Status updated from ${grievance.status} to ${new_status}`
        }
      });
    });

    const updated = await prisma.grievance.findUnique({
      where: { id },
      include: grievanceInclude
    });

    return res.status(200).json({
      message: `Status updated to ${new_status}`,
      grievance: formatGrievance(updated, user)
    });
  } catch (error) {
    next(error);
  }
}

export async function reopenGrievance(req, res, next) {
  try {
    const { id } = req.params;
    const { note = '' } = req.body;
    const user = req.user;

    const grievance = await prisma.grievance.findUnique({
      where: { id }
    });

    if (!grievance) {
      return res.status(404).json({ error: 'Grievance record not found' });
    }

    if (grievance.status !== COMPLAINT_STATUSES.CLOSED) {
      return res.status(400).json({ error: 'Only Closed grievances can be reopened' });
    }

    if (user.role === 'student' && grievance.submitted_by !== user.id) {
      return res.status(403).json({ error: 'Only the original student reporter or an admin can reopen this grievance' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.grievance.update({
        where: { id },
        data: { status: COMPLAINT_STATUSES.REOPENED }
      });

      await tx.statusHistory.create({
        data: {
          grievance_id: id,
          previous_status: COMPLAINT_STATUSES.CLOSED,
          new_status: COMPLAINT_STATUSES.REOPENED,
          updated_by: user.id,
          remarks: note || 'Student reopened grievance as the issue persists.'
        }
      });
    });

    const updated = await prisma.grievance.findUnique({
      where: { id },
      include: grievanceInclude
    });

    return res.status(200).json({
      message: 'Grievance reopened successfully',
      grievance: formatGrievance(updated, user)
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteGrievance(req, res, next) {
  try {
    const { id } = req.params;
    const user = req.user;

    // Strict audit requirement: only admin can soft delete
    if (user.role !== 'admin') {
      return res.status(403).json({
        error: 'Students and authorities cannot delete grievances (403 Forbidden). Tamper-evident audit trail enforced.'
      });
    }

    await prisma.grievance.update({
      where: { id },
      data: { is_deleted: true }
    });

    return res.status(200).json({ message: 'Grievance removed by administrator' });
  } catch (error) {
    next(error);
  }
}

export async function trackByToken(req, res, next) {
  try {
    const { token } = req.params;
    const grievance = await prisma.grievance.findFirst({
      where: {
        OR: [
          { tracking_token: token.trim() },
          { ticket_number: token.trim() }
        ],
        is_deleted: false
      },
      include: grievanceInclude
    });

    if (!grievance) {
      return res.status(404).json({ error: 'No grievance found matching this tracking token' });
    }

    return res.status(200).json({
      grievance: formatGrievance(grievance, null)
    });
  } catch (error) {
    next(error);
  }
}

export async function checkDuplicates(req, res, next) {
  try {
    const { title = '', description = '', category_id } = req.query;
    if (!title && !description) {
      return res.status(200).json({ duplicates: [] });
    }

    const queryTokens = `${title} ${description}`
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !['with', 'from', 'this', 'that', 'have', 'there', 'please', 'need'].includes(w.toLowerCase()));

    const candidates = await prisma.grievance.findMany({
      where: {
        is_deleted: false,
        status: {
          notIn: [COMPLAINT_STATUSES.RESOLVED, COMPLAINT_STATUSES.CLOSED, COMPLAINT_STATUSES.REJECTED]
        }
      },
      include: {
        _count: { select: { upvotes: true } }
      }
    });

    const scored = candidates.map(c => {
      let score = 0;
      if (category_id && c.category_id === category_id) score += 0.3;
      const text = `${c.title} ${c.description} ${c.location || ''}`.toLowerCase();
      queryTokens.forEach(t => {
        if (text.includes(t.toLowerCase())) score += 0.2;
      });
      return {
        id: c.id,
        ticketId: c.ticket_number,
        grievance_code: c.ticket_number,
        title: c.title,
        status: c.status,
        supports_count: c._count.upvotes,
        category_id: c.category_id,
        score
      };
    })
    .filter(c => c.score >= 0.4)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

    return res.status(200).json({ duplicates: scored });
  } catch (error) {
    next(error);
  }
}
