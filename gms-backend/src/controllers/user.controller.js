import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';
import { formatUser } from '../utils/response.js';

export async function getProfile(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        authority_profile: true,
        _count: {
          select: {
            submitted_grievances: { where: { is_deleted: false } },
            upvotes: true,
            comments: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      user: {
        ...formatUser(user),
        stats: {
          grievances_count: user._count.submitted_grievances,
          upvotes_count: user._count.upvotes,
          comments_count: user._count.comments
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const { name, department, enrollment_no, hostel, room_no, avatar, password } = req.body;
    const updateData = {};

    if (name) updateData.name = name.trim();
    if (department !== undefined) updateData.department = department.trim();
    if (enrollment_no !== undefined) updateData.enrollment_no = enrollment_no.trim();
    if (hostel !== undefined) updateData.hostel = hostel.trim();
    if (room_no !== undefined) updateData.room_no = room_no.trim();
    if (avatar !== undefined) updateData.avatar = avatar;
    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      include: { authority_profile: true }
    });

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: formatUser(updated)
    });
  } catch (error) {
    next(error);
  }
}

export async function listUsers(req, res, next) {
  try {
    const { role, status, search } = req.query;
    const where = {};

    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { enrollment_no: { contains: q, mode: 'insensitive' } },
        { department: { contains: q, mode: 'insensitive' } }
      ];
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        authority_profile: true,
        _count: {
          select: {
            submitted_grievances: { where: { is_deleted: false } }
          }
        }
      }
    });

    return res.status(200).json({
      users: users.map(u => ({
        ...formatUser(u),
        grievance_count: u._count.submitted_grievances
      })),
      total: users.length
    });
  } catch (error) {
    next(error);
  }
}

export async function setUserStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    const targetUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'User account not found' });
    }

    if (targetUser.role === 'admin') {
      return res.status(403).json({ error: 'Cannot modify administrative accounts' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { status },
      include: { authority_profile: true }
    });

    return res.status(200).json({
      message: `User status changed to ${status}`,
      user: formatUser(updated),
      reason
    });
  } catch (error) {
    next(error);
  }
}
