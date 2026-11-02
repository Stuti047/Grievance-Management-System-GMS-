import prisma from '../config/db.js';
import { COMPLAINT_STATUSES } from '../utils/fsm.js';

export async function submitFeedback(req, res, next) {
  try {
    const { id: grievance_id } = req.params;
    const { resolved_ok = true, rating = 5, comment = '', feedback_text = '' } = req.body;
    const finalText = comment || feedback_text || '';
    const user = req.user;

    const grievance = await prisma.grievance.findUnique({
      where: { id: grievance_id }
    });

    if (!grievance) {
      return res.status(404).json({ error: 'Grievance not found' });
    }

    if (user.role === 'student' && grievance.submitted_by !== user.id) {
      return res.status(403).json({ error: 'Only the original student reporter can submit feedback' });
    }

    const feedback = await prisma.feedback.upsert({
      where: { grievance_id },
      create: {
        grievance_id,
        user_id: user.id,
        rating: typeof rating === 'number' ? rating : 5,
        resolved_ok: Boolean(resolved_ok),
        feedback_text: finalText.trim()
      },
      update: {
        rating: typeof rating === 'number' ? rating : 5,
        resolved_ok: Boolean(resolved_ok),
        feedback_text: finalText.trim()
      }
    });

    // Auto-close grievance if student confirms resolution
    if (resolved_ok && grievance.status === COMPLAINT_STATUSES.RESOLVED) {
      await prisma.$transaction(async (tx) => {
        await tx.grievance.update({
          where: { id: grievance_id },
          data: { status: COMPLAINT_STATUSES.CLOSED }
        });

        await tx.statusHistory.create({
          data: {
            grievance_id,
            previous_status: COMPLAINT_STATUSES.RESOLVED,
            new_status: COMPLAINT_STATUSES.CLOSED,
            updated_by: user.id,
            remarks: 'Student confirmed satisfactory resolution. Ticket officially closed.'
          }
        });
      });
    }

    return res.status(200).json({
      message: 'Feedback recorded successfully',
      feedback: {
        id: feedback.id,
        grievance_id: feedback.grievance_id,
        rating: feedback.rating,
        resolved_ok: feedback.resolved_ok,
        comment: feedback.feedback_text,
        feedback_text: feedback.feedback_text,
        created_at: feedback.created_at
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function listFeedback(req, res, next) {
  try {
    const feedbackList = await prisma.feedback.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        grievance: {
          select: {
            id: true,
            ticket_number: true,
            title: true,
            category: { select: { name: true } }
          }
        },
        user: {
          select: { id: true, name: true, role: true }
        }
      }
    });

    return res.status(200).json({ feedback: feedbackList });
  } catch (error) {
    next(error);
  }
}
