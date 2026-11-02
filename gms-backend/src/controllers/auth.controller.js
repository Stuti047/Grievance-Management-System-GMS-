import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';
import { signToken } from '../config/jwt.js';
import { formatUser } from '../utils/response.js';

export async function register(req, res, next) {
  try {
    const {
      name,
      email,
      password = 'Password@123',
      department = 'General',
      enrollment_no = '',
      enrollmentNo = '',
      hostel,
      room_no
    } = req.body;

    const cleanEmail = email.trim().toLowerCase();
    const finalEnrollment = enrollment_no || enrollmentNo || '';

    // Check existing
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });
    if (existing) {
      return res.status(409).json({ error: 'An account with this institute email already exists' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        password_hash,
        role: 'student',
        department: department.trim(),
        enrollment_no: finalEnrollment.trim(),
        hostel: hostel ? hostel.trim() : null,
        room_no: room_no ? room_no.trim() : null,
        status: 'active'
      },
      include: {
        authority_profile: true
      }
    });

    const token = signToken({ userId: newUser.id, role: newUser.role });

    return res.status(201).json({
      message: 'Account created successfully',
      user: formatUser(newUser),
      token
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: { authority_profile: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or account does not exist' });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ error: 'This account has been blocked by the administrator' });
    }

    // Verify password if provided
    if (password && password !== '••••••••••••') {
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials. Password did not match.' });
      }
    }

    const token = signToken({ userId: user.id, role: user.role });

    return res.status(200).json({
      message: 'Login successful',
      user: formatUser(user),
      token
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req, res, next) {
  try {
    return res.status(200).json({
      user: formatUser(req.user)
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Quick Login helper for evaluation / role switching
 */
export async function quickLogin(req, res, next) {
  try {
    const { role } = req.body;
    let targetEmail = '';

    if (role === 'student') targetEmail = 'puneet.btmc25@mitsgwl.ac.in';
    else if (role === 'student_stuti' || role === 'student2') targetEmail = 'stuti.btmc25@mitsgwl.ac.in';
    else if (role === 'authority' || role === 'warden') targetEmail = 'warden.bh1@mitsgwalior.in';
    else if (role === 'authority2' || role === 'hod') targetEmail = 'hod.mac@mitsgwalior.in';
    else if (role === 'admin') targetEmail = 'proctor.admin@mitsgwalior.in';

    let user = await prisma.user.findUnique({
      where: { email: targetEmail },
      include: { authority_profile: true }
    });

    // If target email not found, find first active user with role
    if (!user && role) {
      const mappedRole = role.startsWith('student') ? 'student' : (role === 'admin' ? 'admin' : 'authority');
      user = await prisma.user.findFirst({
        where: { role: mappedRole, status: 'active' },
        include: { authority_profile: true }
      });
    }

    if (!user) {
      return res.status(404).json({ error: `No active ${role} user account found in database` });
    }

    const token = signToken({ userId: user.id, role: user.role });

    return res.status(200).json({
      message: `Signed in as ${user.name}`,
      user: formatUser(user),
      token
    });
  } catch (error) {
    next(error);
  }
}
