/**
 * Formats a grievance object for the requesting user's role.
 * Masks author identity if is_anonymous is true and viewer is not an admin.
 */
export function formatGrievance(g, viewer = null) {
  if (!g) return null;

  const viewerRole = viewer?.role || 'public';
  const isAdmin = viewerRole === 'admin';
  const isAuthor = viewer && viewer.id === g.submitted_by;
  const showAuthor = (!g.is_anonymous || isAdmin || isAuthor);

  // Map history with actor name masking
  const history = (g.history || []).map(h => {
    const isActorAuthor = h.updated_by === g.submitted_by;
    let actorName = h.updater?.name || 'System';
    if (isActorAuthor && g.is_anonymous && !isAdmin && !isAuthor) {
      actorName = 'Anonymous Student';
    }
    return {
      id: h.id,
      grievance_id: h.grievance_id,
      from_status: h.previous_status,
      to_status: h.new_status,
      actor_id: (isActorAuthor && g.is_anonymous && !isAdmin && !isAuthor) ? null : h.updated_by,
      actor_name: actorName,
      actor_role: h.updater?.role || 'system',
      note: h.remarks,
      remarks: h.remarks,
      created_at: h.created_at
    };
  });

  // Map comments with anonymous comment masking & internal note filtering
  const comments = (g.comments || [])
    .filter(c => {
      if (c.is_internal) {
        return viewerRole === 'authority' || viewerRole === 'admin';
      }
      return true;
    })
    .map(c => {
      const isCommentAuthor = viewer && viewer.id === c.user_id;
      let authorName = c.user?.name || 'Unknown User';
      if (c.is_anonymous && !isAdmin && !isCommentAuthor) {
        authorName = 'Anonymous Student';
      }
      return {
        id: c.id,
        grievance_id: c.grievance_id,
        author_id: (c.is_anonymous && !isAdmin && !isCommentAuthor) ? null : c.user_id,
        author_name: authorName,
        author_role: c.user?.role || 'student',
        body: c.comment_text,
        comment_text: c.comment_text,
        is_internal: c.is_internal,
        is_anonymous: c.is_anonymous,
        created_at: c.created_at
      };
    });

  const supportsCount = g._count?.upvotes !== undefined ? g._count.upvotes : (g.upvotes?.length || 0);
  const isSupportedByViewer = Boolean(
    viewer && g.upvotes && g.upvotes.some(u => u.user_id === viewer.id)
  );

  return {
    id: g.id,
    grievance_code: g.ticket_number,
    ticket_number: g.ticket_number,
    ticketId: g.ticket_number,
    title: g.title,
    description: g.description,
    category_id: g.category_id,
    category_name: g.category?.name || 'General',
    category_section: g.category?.section || 'college',
    sub_authority_id: g.assigned_authority_id,
    sub_authority_name: g.assigned_authority?.department || g.category?.authority?.department || 'Administration',
    priority: g.priority,
    status: g.status,
    location: g.location || 'MITS Campus',
    is_anonymous: g.is_anonymous,
    tracking_token: (isAuthor || isAdmin) ? g.tracking_token : null,
    sla_hours: g.sla_hours,
    evidence_urls: g.evidence_urls || [],
    created_at: g.created_at,
    updated_at: g.updated_at,
    resolved_at: g.resolved_at,
    is_deleted: g.is_deleted,
    supports_count: supportsCount,
    is_supported: isSupportedByViewer,
    history,
    comments,
    feedback: g.feedback ? {
      id: g.feedback.id,
      grievance_id: g.feedback.grievance_id,
      rating: g.feedback.rating,
      resolved_ok: g.feedback.resolved_ok,
      comment: g.feedback.feedback_text,
      feedback_text: g.feedback.feedback_text,
      created_at: g.feedback.created_at
    } : null,
    flags: isAdmin ? (g.flags || []).map(f => ({
      id: f.id,
      grievance_id: f.grievance_id,
      reason: f.reason,
      resolved: f.resolved,
      reported_by: f.reported_by,
      reported_by_name: f.reporter?.name || 'User',
      created_at: f.created_at
    })) : [],
    // Author information (protected according to role & anonymity)
    author_id: showAuthor ? g.submitted_by : null,
    author_name: g.is_anonymous
      ? (isAdmin ? (g.author?.name || 'Anonymous Student') : 'Anonymous Student')
      : (g.author?.name || 'Unknown Student'),
    author_email: (showAuthor && isAdmin) ? g.author?.email : null,
    author_department: showAuthor ? g.author?.department : null,
    author_enrollment: (showAuthor && viewerRole !== 'authority') ? g.author?.enrollment_no : null,
    author_avatar: showAuthor ? g.author?.avatar : null
  };
}

export function formatUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    college_email: user.email, // for frontend compatibility
    role: user.role,
    department: user.department,
    enrollment_no: user.enrollment_no,
    enrollmentNo: user.enrollment_no,
    hostel: user.hostel,
    room_no: user.room_no,
    avatar: user.avatar,
    status: user.status,
    sub_authority_id: user.authority_profile?.id || null,
    designation: user.authority_profile?.designation || null,
    created_at: user.created_at,
    updated_at: user.updated_at
  };
}
