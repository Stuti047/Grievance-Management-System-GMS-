import prisma from '../config/db.js';

export async function flagGrievance(req, res, next) {
  try {
    const { id: grievance_id } = req.params;
    const { reason } = req.body;
    const user = req.user;

    const grievance = await prisma.grievance.findUnique({
      where: { id: grievance_id }
    });

    if (!grievance) {
      return res.status(404).json({ error: 'Grievance not found' });
    }

    const existing = await prisma.flag.findUnique({
      where: {
        grievance_id_reported_by: {
          grievance_id,
          reported_by: user.id
        }
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'You have already flagged this grievance for administrator review' });
    }

    const flag = await prisma.flag.create({
      data: {
        grievance_id,
        reported_by: user.id,
        reason: reason.trim(),
        resolved: false
      }
    });

    return res.status(201).json({
      message: 'Grievance flagged for administrative review',
      flag: {
        id: flag.id,
        grievance_id: flag.grievance_id,
        flagged_by: flag.reported_by,
        reason: flag.reason,
        resolved: flag.resolved,
        created_at: flag.created_at
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function listFlags(req, res, next) {
  try {
    const { resolved } = req.query;
    const where = {};

    if (resolved !== undefined) {
      where.resolved = resolved === 'true' || resolved === true;
    }

    const flags = await prisma.flag.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        grievance: {
          select: {
            id: true,
            ticket_number: true,
            title: true
          }
        },
        reporter: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return res.status(200).json({
      flags: flags.map(f => ({
        id: f.id,
        grievance_id: f.grievance_id,
        grievance_code: f.grievance?.ticket_number,
        grievance_title: f.grievance?.title,
        flagged_by: f.reported_by,
        flagged_by_name: f.reporter?.name || 'User',
        reason: f.reason,
        resolved: f.resolved,
        created_at: f.created_at
      }))
    });
  } catch (error) {
    next(error);
  }
}

export async function resolveFlag(req, res, next) {
  try {
    const { id } = req.params;

    const flag = await prisma.flag.findUnique({
      where: { id }
    });

    if (!flag) {
      return res.status(404).json({ error: 'Flag record not found' });
    }

    const updated = await prisma.flag.update({
      where: { id },
      data: {
        resolved: true,
        status: 'resolved'
      }
    });

    return res.status(200).json({
      message: 'Flag marked as resolved',
      flag: updated
    });
  } catch (error) {
    next(error);
  }
}
