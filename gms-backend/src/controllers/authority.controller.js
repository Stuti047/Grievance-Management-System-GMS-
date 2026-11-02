/**
 * authority.controller.js
 * Controller for MITS Responsible Authorities Directory & Category Mapping.
 * Enforces strict confidentiality of contact numbers for non-administrators.
 */

import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';

/**
 * List all authorities in the MITS Responsible Authorities Directory.
 * Security enforcement:
 * - If caller is Admin: Return full details including confidential contact numbers.
 * - If caller is Student / Authority / Public: Mask contact_number as null/Confidential.
 */
export async function listAuthorities(req, res, next) {
  try {
    const isAdmin = req.user && req.user.role === 'admin';

    const authorities = await prisma.authority.findMany({
      orderBy: [
        { status: 'asc' },
        { department: 'asc' },
        { name: 'asc' }
      ],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
            avatar: true
          }
        },
        categories: {
          select: {
            id: true,
            name: true,
            section: true,
            sla_hours: true
          }
        }
      }
    });

    const sanitized = authorities.map(a => ({
      id: a.id,
      user_id: a.user_id,
      name: a.name || a.user?.name || a.department,
      designation: a.designation || 'Authority Officer',
      responsibilities: a.responsibilities || 'Institutional Oversight',
      department: a.department,
      section: a.section || 'college',
      status: a.status || 'active',
      email: a.email || a.user?.email || null,
      // CONFIDENTIAL CONTACT NUMBER: Strictly hidden from students
      contact_number: isAdmin ? (a.contact_number || null) : null,
      is_contact_confidential: !isAdmin,
      categories: a.categories,
      created_at: a.created_at,
      updated_at: a.updated_at
    }));

    return res.status(200).json({
      authorities: sanitized,
      is_admin_view: isAdmin
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new authority record (Admin only).
 */
export async function createAuthority(req, res, next) {
  try {
    const {
      name,
      designation = 'Authority Officer',
      responsibilities,
      department,
      contact_number,
      email,
      section = 'college',
      category_id
    } = req.body;

    if (!name || !department) {
      return res.status(400).json({ error: 'Name and Department are required fields' });
    }

    const authority = await prisma.authority.create({
      data: {
        name: name.trim(),
        designation: designation?.trim() || null,
        responsibilities: responsibilities?.trim() || null,
        department: department.trim(),
        contact_number: contact_number?.trim() || null,
        email: email ? email.trim().toLowerCase() : null,
        section,
        status: 'active'
      }
    });

    if (category_id) {
      await prisma.category.update({
        where: { id: category_id },
        data: { authority_id: authority.id }
      });
    }

    // Record audit log
    await prisma.auditLog.create({
      data: {
        user_id: req.user.id,
        action: 'CREATE_AUTHORITY',
        entity_type: 'Authority',
        entity_id: authority.id,
        details: {
          name: authority.name,
          department: authority.department,
          designation: authority.designation,
          section: authority.section
        },
        ip_address: req.ip
      }
    });

    return res.status(201).json({
      message: 'Authority entry created successfully',
      authority
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update an existing authority entry (Admin only).
 */
export async function updateAuthority(req, res, next) {
  try {
    const { id } = req.params;
    const {
      name,
      designation,
      responsibilities,
      department,
      contact_number,
      email,
      section,
      status
    } = req.body;

    const existing = await prisma.authority.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Authority record not found' });
    }

    const updated = await prisma.authority.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(designation !== undefined && { designation: designation?.trim() }),
        ...(responsibilities !== undefined && { responsibilities: responsibilities?.trim() }),
        ...(department !== undefined && { department: department.trim() }),
        ...(contact_number !== undefined && { contact_number: contact_number?.trim() }),
        ...(email !== undefined && { email: email ? email.trim().toLowerCase() : null }),
        ...(section !== undefined && { section }),
        ...(status !== undefined && { status })
      }
    });

    // Record audit log with changes
    await prisma.auditLog.create({
      data: {
        user_id: req.user.id,
        action: 'UPDATE_AUTHORITY',
        entity_type: 'Authority',
        entity_id: id,
        details: {
          before: {
            name: existing.name,
            designation: existing.designation,
            department: existing.department,
            status: existing.status
          },
          after: {
            name: updated.name,
            designation: updated.designation,
            department: updated.department,
            status: updated.status
          }
        },
        ip_address: req.ip
      }
    });

    return res.status(200).json({
      message: 'Authority updated successfully',
      authority: updated
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Deactivate / Toggle an authority entry status (Admin only).
 */
export async function toggleAuthorityStatus(req, res, next) {
  try {
    const { id } = req.params;

    const existing = await prisma.authority.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Authority not found' });
    }

    const newStatus = existing.status === 'active' ? 'inactive' : 'active';
    const updated = await prisma.authority.update({
      where: { id },
      data: { status: newStatus }
    });

    await prisma.auditLog.create({
      data: {
        user_id: req.user.id,
        action: 'TOGGLE_AUTHORITY_STATUS',
        entity_type: 'Authority',
        entity_id: id,
        details: {
          name: existing.name,
          newStatus
        },
        ip_address: req.ip
      }
    });

    return res.status(200).json({
      message: `Authority marked as ${newStatus}`,
      authority: updated
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Map a Category to an Authority (Admin only).
 */
export async function mapCategoryToAuthority(req, res, next) {
  try {
    const { category_id, authority_id } = req.body;

    if (!category_id) {
      return res.status(400).json({ error: 'category_id is required' });
    }

    const category = await prisma.category.findUnique({ where: { id: category_id } });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    let authorityName = 'Unassigned';
    if (authority_id) {
      const auth = await prisma.authority.findUnique({ where: { id: authority_id } });
      if (!auth) {
        return res.status(404).json({ error: 'Authority not found' });
      }
      authorityName = auth.name;
    }

    const updatedCat = await prisma.category.update({
      where: { id: category_id },
      data: { authority_id: authority_id || null }
    });

    await prisma.auditLog.create({
      data: {
        user_id: req.user.id,
        action: 'MAP_CATEGORY',
        entity_type: 'Category',
        entity_id: category_id,
        details: {
          categoryName: category.name,
          previousAuthorityId: category.authority_id,
          newAuthorityId: authority_id,
          newAuthorityName: authorityName
        },
        ip_address: req.ip
      }
    });

    return res.status(200).json({
      message: `Category "${category.name}" mapped to "${authorityName}"`,
      category: updatedCat
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get system audit logs (Admin only).
 */
export async function getAuditLogs(req, res, next) {
  try {
    const { limit = 50, entity_type } = req.query;

    const where = {};
    if (entity_type) {
      where.entity_type = entity_type;
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: Math.min(parseInt(limit, 10) || 50, 100),
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    return res.status(200).json({ logs });
  } catch (error) {
    next(error);
  }
}
