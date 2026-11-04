import prisma from '../config/db.js';

export async function listCategories(req, res, next) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        authority: {
          select: {
            id: true,
            name: true,
            department: true,
            designation: true,
            official_emails: true,
            email: true,
            status: true
          }
        },
        escalation_authority: {
          select: {
            id: true,
            name: true,
            department: true,
            designation: true,
            official_emails: true,
            email: true,
            status: true
          }
        }
      }
    });

    return res.status(200).json({
      categories: categories.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        section: c.section,
        sla_hours: c.sla_hours,
        department: c.department || c.authority?.department || 'General Administration',
        responsible_designation: c.responsible_designation || c.authority?.designation || 'Nodal Authority',
        is_active: c.is_active,
        authority_id: c.authority_id,
        sub_authority_id: c.authority_id,
        sub_authority_name: c.authority?.name || c.authority?.department || 'Administration',
        authority: c.authority,
        escalation_authority_id: c.escalation_authority_id,
        escalation_authority: c.escalation_authority
      }))
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCategoryRouting(req, res, next) {
  try {
    const { id } = req.params;
    const {
      authority_id,
      escalation_authority_id,
      department,
      responsible_designation,
      sla_hours,
      is_active
    } = req.body;

    const existing = await prisma.category.findUnique({
      where: { id },
      include: { authority: true, escalation_authority: true }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Grievance category not found' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const cat = await tx.category.update({
        where: { id },
        data: {
          authority_id: authority_id !== undefined ? authority_id : existing.authority_id,
          escalation_authority_id: escalation_authority_id !== undefined ? escalation_authority_id : existing.escalation_authority_id,
          department: department !== undefined ? department.trim() : existing.department,
          responsible_designation: responsible_designation !== undefined ? responsible_designation.trim() : existing.responsible_designation,
          sla_hours: sla_hours !== undefined ? parseInt(sla_hours, 10) : existing.sla_hours,
          is_active: is_active !== undefined ? Boolean(is_active) : existing.is_active
        },
        include: {
          authority: true,
          escalation_authority: true
        }
      });

      // Audit log entry
      await tx.auditLog.create({
        data: {
          user_id: req.user?.id || null,
          action: 'UPDATE_CATEGORY_ROUTING',
          entity_type: 'category',
          entity_id: id,
          details: {
            category_name: existing.name,
            old_authority_id: existing.authority_id,
            new_authority_id: cat.authority_id,
            old_escalation_id: existing.escalation_authority_id,
            new_escalation_id: cat.escalation_authority_id,
            new_sla_hours: cat.sla_hours,
            is_active: cat.is_active,
            updated_by_role: req.user?.role || 'admin',
            timestamp: new Date().toISOString()
          }
        }
      });

      return cat;
    });

    return res.status(200).json({
      message: `Routing mapping updated successfully for "${updated.name}"`,
      category: updated
    });
  } catch (error) {
    next(error);
  }
}

export async function createCategory(req, res, next) {
  try {
    const {
      name,
      description = '',
      section = 'college',
      sla_hours = 48,
      authority_id,
      escalation_authority_id,
      department,
      responsible_designation,
      is_active = true
    } = req.body;

    const existing = await prisma.category.findUnique({
      where: { name: name.trim() }
    });

    if (existing) {
      return res.status(409).json({ error: 'A category with this name already exists' });
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        section,
        sla_hours: parseInt(sla_hours, 10),
        authority_id: authority_id || null,
        escalation_authority_id: escalation_authority_id || null,
        department: department?.trim() || null,
        responsible_designation: responsible_designation?.trim() || null,
        is_active: Boolean(is_active)
      },
      include: {
        authority: true,
        escalation_authority: true
      }
    });

    return res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    next(error);
  }
}
