import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';
import { formatUser } from '../utils/response.js';

/**
 * List Faculty Authorities Directory.
 * STRICT PRIVACY RULE: Do NOT expose faculty Gmail / personal email addresses to students or public.
 * Contact numbers are confidential and only accessible to administrators.
 */
export async function listAuthorities(req, res, next) {
  try {
    const viewerRole = req.user?.role || 'public';
    const isAdmin = viewerRole === 'admin';
    const showAll = isAdmin || req.query.include_inactive === 'true' || req.query.all === 'true';

    const where = showAll ? {} : { status: 'active' };

    const authorities = await prisma.authority.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            assigned_grievances: true
          }
        },
        categories: {
          select: {
            id: true,
            name: true,
            sla_hours: true,
            department: true,
            is_active: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            status: true,
            avatar: true,
            email: true
          }
        }
      }
    });

    return res.status(200).json({
      authorities: authorities.map(a => {
        const displayName = a.name && a.name !== 'MITS Authority' ? a.name : (a.user?.name || a.department);
        
        const base = {
          id: a.id,
          user_id: a.user_id,
          name: displayName,
          faculty_name: displayName,
          department: a.department,
          designation: a.designation || 'Faculty Member',
          responsibilities: a.responsibilities || 'Responsible Authority',
          assigned_responsibilities: a.responsibilities || 'Responsible Authority',
          official_emails: a.official_emails && a.official_emails.length > 0 ? a.official_emails : (a.email ? [a.email] : []),
          email: a.email || (a.official_emails && a.official_emails[0]) || null,
          category_group: a.category_group || 'academic_student',
          assigned_grievances_count: a._count?.assigned_grievances || 0,
          categories: (a.categories || []).map(c => c.name),
          category_objects: a.categories || [],
          section: a.section || 'college',
          status: a.status
        };

        // Confidential fields accessible only to verified administrators
        if (isAdmin) {
          base.contact_number = a.contact_number || null;
          base.confidential_phone = a.contact_number || null;
          base.created_at = a.created_at;
          base.updated_at = a.updated_at;
          base.user_email = a.user?.email || null;
        }

        return base;
      })
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update Faculty / Responsible Authority details.
 * Admin-only operation.
 * Allows updating name, responsibilities, department, designation, contact number,
 * and reassigning grievance categories.
 * Records all changes in audit_logs.
 */
export async function updateAuthority(req, res, next) {
  try {
    const { id } = req.params;
    const {
      name,
      responsibilities,
      department,
      designation,
      contact_number,
      official_emails,
      email,
      category_group,
      status,
      section,
      category_ids = []
    } = req.body;

    const existing = await prisma.authority.findUnique({
      where: { id },
      include: { categories: true }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Faculty / Authority record not found' });
    }

    const oldValues = {
      name: existing.name,
      responsibilities: existing.responsibilities,
      department: existing.department,
      designation: existing.designation,
      contact_number: existing.contact_number,
      official_emails: existing.official_emails,
      email: existing.email,
      category_group: existing.category_group,
      status: existing.status,
      category_ids: existing.categories.map(c => c.id)
    };

    const newValues = {
      name: name !== undefined ? name.trim() : existing.name,
      responsibilities: responsibilities !== undefined ? responsibilities.trim() : existing.responsibilities,
      department: department !== undefined ? department.trim() : existing.department,
      designation: designation !== undefined ? designation.trim() : existing.designation,
      contact_number: contact_number !== undefined ? contact_number.trim() : existing.contact_number,
      official_emails: Array.isArray(official_emails) ? official_emails : existing.official_emails,
      email: email !== undefined ? (email ? email.trim() : null) : existing.email,
      category_group: category_group !== undefined ? category_group : existing.category_group,
      status: status !== undefined ? status : existing.status,
      section: section !== undefined ? section : existing.section
    };

    // Perform atomic update and audit logging
    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update Authority record
      const authRecord = await tx.authority.update({
        where: { id },
        data: {
          name: newValues.name,
          responsibilities: newValues.responsibilities,
          department: newValues.department,
          designation: newValues.designation,
          contact_number: newValues.contact_number,
          official_emails: newValues.official_emails,
          email: newValues.email,
          category_group: newValues.category_group,
          status: newValues.status,
          section: newValues.section
        }
      });

      // 2. Also update associated User name if linked
      if (existing.user_id && name) {
        await tx.user.update({
          where: { id: existing.user_id },
          data: {
            name: newValues.name,
            department: newValues.department
          }
        });
      }

      // 3. Reassign categories if provided
      if (Array.isArray(category_ids) && category_ids.length > 0) {
        await tx.category.updateMany({
          where: { authority_id: id, id: { notIn: category_ids } },
          data: { authority_id: null }
        });
        await tx.category.updateMany({
          where: { id: { in: category_ids } },
          data: { authority_id: id }
        });
      }

      // 4. Create Audit Log entry
      await tx.auditLog.create({
        data: {
          user_id: req.user?.id || null,
          action: 'UPDATE_FACULTY_RESPONSIBILITIES',
          entity_type: 'authority',
          entity_id: id,
          details: {
            faculty_id: id,
            faculty_name: newValues.name,
            old: oldValues,
            new: newValues,
            updated_by_role: req.user?.role || 'admin',
            timestamp: new Date().toISOString()
          }
        }
      });

      return authRecord;
    });

    return res.status(200).json({
      message: `Successfully updated responsibilities for ${updated.name}`,
      authority: updated
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get Audit Logs of Faculty / Responsibility Changes.
 * Admin-only operation.
 */
export async function getAuthorityAuditLogs(req, res, next) {
  try {
    const logs = await prisma.auditLog.findMany({
      where: { entity_type: 'authority' },
      orderBy: { created_at: 'desc' },
      take: 50,
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

    return res.status(200).json({
      audit_logs: logs.map(l => ({
        id: l.id,
        action: l.action,
        entity_id: l.entity_id,
        changed_by_name: l.user?.name || 'Administrator',
        changed_by_email: l.user?.email || null,
        details: l.details,
        created_at: l.created_at
      }))
    });
  } catch (error) {
    next(error);
  }
}

export async function createAuthority(req, res, next) {
  try {
    const {
      name,
      email,
      official_emails = [],
      category_group = 'academic_student',
      create_user_account = false,
      password = 'Authority@123',
      department,
      designation = 'Authority Officer',
      responsibilities,
      contact_number,
      section = 'college',
      status = 'active'
    } = req.body;

    const finalDepartment = department?.trim() || 'Campus Administration';
    const emailsList = Array.isArray(official_emails) && official_emails.length > 0 
      ? official_emails 
      : (email ? [email.trim()] : []);

    let createdUser = null;
    let userId = null;

    if (create_user_account && email) {
      const cleanEmail = email.trim().toLowerCase();
      const existing = await prisma.user.findUnique({
        where: { email: cleanEmail }
      });
      if (existing) {
        return res.status(409).json({ error: 'A login account with this email already exists' });
      }

      const password_hash = await bcrypt.hash(password, 10);
      createdUser = await prisma.user.create({
        data: {
          name: name.trim(),
          email: cleanEmail,
          password_hash,
          role: 'authority',
          department: finalDepartment,
          status: 'active'
        }
      });
      userId = createdUser.id;
    }

    const authority = await prisma.authority.create({
      data: {
        user_id: userId,
        name: name.trim(),
        department: finalDepartment,
        designation: designation?.trim() || 'Authority Officer',
        responsibilities: responsibilities?.trim() || null,
        contact_number: contact_number?.trim() || null,
        official_emails: emailsList,
        email: email ? email.trim() : (emailsList[0] || null),
        category_group,
        section,
        status
      }
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        user_id: req.user?.id || null,
        action: 'CREATE_INSTITUTIONAL_AUTHORITY',
        entity_type: 'authority',
        entity_id: authority.id,
        details: {
          name: authority.name,
          designation: authority.designation,
          department: authority.department,
          category_group: authority.category_group,
          has_login_account: Boolean(userId),
          timestamp: new Date().toISOString()
        }
      }
    });

    return res.status(201).json({
      message: 'Institutional authority registered successfully',
      authority
    });
  } catch (error) {
    next(error);
  }
}
