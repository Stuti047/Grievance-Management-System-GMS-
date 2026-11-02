import prisma from '../config/db.js';
import { verifyToken } from '../config/jwt.js';

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication token required' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired authentication token' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId || decoded.id },
      include: { authority_profile: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'User account not found' });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ error: 'This account has been suspended by the administrator' });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

export async function optionalAuthenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = verifyToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId || decoded.id },
        include: { authority_profile: true }
      });
      req.user = user && user.status !== 'blocked' ? user : null;
    } catch {
      req.user = null;
    }

    next();
  } catch (error) {
    next(error);
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access forbidden: requires one of [${roles.join(', ')}] role`
      });
    }

    next();
  };
}
