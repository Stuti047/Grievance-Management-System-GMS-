import prisma from '../config/db.js';

export async function addComment(req, res, next) {
  try {
    const { id: grievance_id } = req.params;
    const { body, comment_text, is_anonymous = false, is_internal = false } = req.body;
    const text = body || comment_text;
    const user = req.user;

    const grievance = await prisma.grievance.findUnique({
      where: { id: grievance_id }
    });

    if (!grievance) {
      return res.status(404).json({ error: 'Grievance not found' });
    }

    // Internal note security check
    if (is_internal && user.role === 'student') {
      return res.status(403).json({ error: 'Students cannot create confidential internal notes' });
    }

    const comment = await prisma.comment.create({
      data: {
        grievance_id,
        user_id: user.id,
        comment_text: text.trim(),
        is_internal: Boolean(is_internal),
        is_anonymous: Boolean(is_anonymous) && user.role === 'student'
      },
      include: {
        user: true
      }
    });

    // Touch updated_at on grievance
    await prisma.grievance.update({
      where: { id: grievance_id },
      data: { updated_at: new Date() }
    });

    return res.status(201).json({
      message: 'Comment added successfully',
      comment: {
        id: comment.id,
        grievance_id: comment.grievance_id,
        author_id: (comment.is_anonymous && user.role !== 'admin') ? null : user.id,
        author_name: (comment.is_anonymous && user.role !== 'admin') ? 'Anonymous Student' : user.name,
        author_role: user.role,
        body: comment.comment_text,
        comment_text: comment.comment_text,
        is_internal: comment.is_internal,
        is_anonymous: comment.is_anonymous,
        created_at: comment.created_at
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function addInternalNote(req, res, next) {
  try {
    const { id: grievance_id } = req.params;
    const { body, comment_text } = req.body;
    const text = body || comment_text;
    const user = req.user;

    if (user.role === 'student') {
      return res.status(403).json({ error: 'Only authorities and administrators can add internal notes' });
    }

    const grievance = await prisma.grievance.findUnique({
      where: { id: grievance_id }
    });

    if (!grievance) {
      return res.status(404).json({ error: 'Grievance not found' });
    }

    if (user.role === 'authority' && user.authority_profile) {
      if (grievance.assigned_authority_id && grievance.assigned_authority_id !== user.authority_profile.id) {
        return res.status(403).json({ error: 'You are only authorized for your department grievances' });
      }
    }

    const comment = await prisma.comment.create({
      data: {
        grievance_id,
        user_id: user.id,
        comment_text: text.trim(),
        is_internal: true,
        is_anonymous: false
      },
      include: { user: true }
    });

    await prisma.grievance.update({
      where: { id: grievance_id },
      data: { updated_at: new Date() }
    });

    return res.status(201).json({
      message: 'Internal note saved',
      comment: {
        id: comment.id,
        grievance_id: comment.grievance_id,
        author_id: user.id,
        author_name: user.name,
        author_role: user.role,
        body: comment.comment_text,
        comment_text: comment.comment_text,
        is_internal: true,
        is_anonymous: false,
        created_at: comment.created_at
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function listComments(req, res, next) {
  try {
    const { id: grievance_id } = req.params;
    const user = req.user;
    const isAuthorityOrAdmin = user && (user.role === 'authority' || user.role === 'admin');

    const where = { grievance_id };
    if (!isAuthorityOrAdmin) {
      where.is_internal = false;
    }

    const comments = await prisma.comment.findMany({
      where,
      orderBy: { created_at: 'asc' },
      include: { user: true }
    });

    return res.status(200).json({
      comments: comments.map(c => {
        const isAuthor = user && user.id === c.user_id;
        const isAnon = c.is_anonymous && !isAuthor && user?.role !== 'admin';
        return {
          id: c.id,
          grievance_id: c.grievance_id,
          author_id: isAnon ? null : c.user_id,
          author_name: isAnon ? 'Anonymous Student' : (c.user?.name || 'User'),
          author_role: c.user?.role || 'student',
          body: c.comment_text,
          comment_text: c.comment_text,
          is_internal: c.is_internal,
          is_anonymous: c.is_anonymous,
          created_at: c.created_at
        };
      })
    });
  } catch (error) {
    next(error);
  }
}
