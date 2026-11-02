import prisma from '../config/db.js';

export async function toggleSupport(req, res, next) {
  try {
    const { id: grievance_id } = req.params;
    const user = req.user;

    const grievance = await prisma.grievance.findUnique({
      where: { id: grievance_id }
    });

    if (!grievance) {
      return res.status(404).json({ error: 'Grievance not found' });
    }

    const existing = await prisma.upvote.findUnique({
      where: {
        grievance_id_user_id: {
          grievance_id,
          user_id: user.id
        }
      }
    });

    let supported = false;
    if (existing) {
      await prisma.upvote.delete({
        where: { id: existing.id }
      });
      supported = false;
    } else {
      await prisma.upvote.create({
        data: {
          grievance_id,
          user_id: user.id
        }
      });
      supported = true;
    }

    const count = await prisma.upvote.count({
      where: { grievance_id }
    });

    return res.status(200).json({
      message: supported ? 'Support recorded' : 'Support removed',
      supported,
      supports_count: count
    });
  } catch (error) {
    next(error);
  }
}

export async function removeSupport(req, res, next) {
  try {
    const { id: grievance_id } = req.params;
    const user = req.user;

    const existing = await prisma.upvote.findUnique({
      where: {
        grievance_id_user_id: {
          grievance_id,
          user_id: user.id
        }
      }
    });

    if (existing) {
      await prisma.upvote.delete({
        where: { id: existing.id }
      });
    }

    const count = await prisma.upvote.count({
      where: { grievance_id }
    });

    return res.status(200).json({
      message: 'Support removed',
      supported: false,
      supports_count: count
    });
  } catch (error) {
    next(error);
  }
}
