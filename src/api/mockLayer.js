// In-memory Mock Fixture Server for MITS GMS
// Implements the entire API contract so the frontend is 100% demoable offline
// Persists in localStorage for a seamless interactive experience.

import { SEED_USERS, SEED_COMPLAINTS, DEPARTMENTS, CATEGORIES } from '../data/seedData';
import { isValidTransition, COMPLAINT_STATUSES } from '../utils/fsm';

const STORAGE_KEY = 'mits_gms_db_v1';
const AUTH_USER_KEY = 'mits_gms_current_user_v1';
const AUTH_TOKEN_KEY = 'mits_gms_auth_token_v1';

// Initialize or load mock database from localStorage
function getDb() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to parse cached GMS database, resetting to seed', e);
  }

  const initial = {
    users: [...SEED_USERS],
    complaints: [...SEED_COMPLAINTS]
  };
  saveDb(initial);
  return initial;
}

function saveDb(db) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.error('Failed to save GMS database to localStorage', e);
  }
}

export function resetMockDatabase() {
  const initial = {
    users: [...SEED_USERS],
    complaints: [...SEED_COMPLAINTS]
  };
  saveDb(initial);
  return initial;
}

// Current logged in user helpers
export function getStoredAuth() {
  try {
    const userRaw = localStorage.getItem(AUTH_USER_KEY);
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    return {
      user: userRaw ? JSON.parse(userRaw) : null,
      token: token || null
    };
  } catch {
    return { user: null, token: null };
  }
}

export function setStoredAuth(user, token) {
  if (user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_USER_KEY);
  }
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

// Helper delay to simulate authentic network latency
const delay = (ms = 200) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Handle incoming Axios request with mock router
 */
export async function handleMockRequest(config) {
  await delay(120);

  const { method, url, data, params, headers } = config;
  const db = getDb();
  const parsedData = typeof data === 'string' && data ? JSON.parse(data) : (data || {});

  // Extract auth user from token if available
  const authHeader = headers?.Authorization || headers?.authorization;
  let currentUser = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '').trim();
    currentUser = db.users.find(u => u.id === token || `mock_jwt_${u.id}` === token) || null;
  }
  if (!currentUser) {
    // Fallback to active stored user for demo convenience
    const stored = getStoredAuth();
    currentUser = stored.user;
  }

  const cleanUrl = url.split('?')[0];

  // -------------------------------------------------------------
  // AUTH ROUTES
  // -------------------------------------------------------------
  if (cleanUrl === '/auth/register' && method.toLowerCase() === 'post') {
    const { name, email, password, department, enrollmentNo } = parsedData;

    // Validate email domain
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail.endsWith('@mitsgwl.ac.in') && !cleanEmail.endsWith('@mitsgwalior.in')) {
      return [400, {
        error: 'Registration requires an official MITS college email ending with @mitsgwl.ac.in or @mitsgwalior.in'
      }];
    }

    // Check duplicate
    if (db.users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return [400, { error: 'An account with this institute email already exists. Please log in.' }];
    }

    const newUser = {
      id: 'usr_student_' + Date.now(),
      name: name || 'Student',
      email: cleanEmail,
      hashedPassword: `sha256$mits2026$${password || 'password123'}`,
      role: 'student',
      department: department || 'Mathematics and Computing',
      enrollmentNo: enrollmentNo || '0901MC251000',
      emailVerified: false,
      verificationCode: '123456' // Static demo OTP
    };

    db.users.push(newUser);
    saveDb(db);

    return [201, {
      message: 'Registration initiated. Verification code sent to your official MITS email address.',
      email: cleanEmail,
      pendingVerification: true,
      demoCode: '123456'
    }];
  }

  if (cleanUrl === '/auth/verify-email' && method.toLowerCase() === 'post') {
    const { email, code } = parsedData;
    const cleanEmail = (email || '').trim().toLowerCase();
    const user = db.users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return [404, { error: 'No account found matching this email address.' }];
    }

    // Accept demo OTP '123456' or whatever was assigned
    if (code !== '123456' && code !== user.verificationCode) {
      return [400, { error: 'Invalid verification code. Please enter the 6-digit OTP sent to your email.' }];
    }

    user.emailVerified = true;
    saveDb(db);

    const token = `mock_jwt_${user.id}`;
    setStoredAuth(user, token);

    return [200, {
      message: 'College email verified successfully. Welcome to GMS MITS!',
      user,
      token,
      refreshToken: `mock_refresh_${user.id}`
    }];
  }

  if (cleanUrl === '/auth/login' && method.toLowerCase() === 'post') {
    const { email } = parsedData;
    const cleanEmail = (email || '').trim().toLowerCase();
    const user = db.users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return [401, { error: 'Invalid email or password. Please check your credentials or register.' }];
    }

    const token = `mock_jwt_${user.id}`;
    setStoredAuth(user, token);

    return [200, {
      message: 'Login successful',
      user,
      token,
      refreshToken: `mock_refresh_${user.id}`
    }];
  }

  if (cleanUrl === '/auth/refresh' && method.toLowerCase() === 'post') {
    if (!currentUser) {
      return [401, { error: 'Unauthorized session' }];
    }
    const token = `mock_jwt_${currentUser.id}`;
    return [200, { token }];
  }

  if (cleanUrl === '/auth/me' && method.toLowerCase() === 'get') {
    if (!currentUser) {
      return [401, { error: 'Not authenticated' }];
    }
    const freshUser = db.users.find(u => u.id === currentUser.id) || currentUser;
    return [200, { user: freshUser }];
  }

  // -------------------------------------------------------------
  // COMPLAINTS DUPLICATE CHECK
  // -------------------------------------------------------------
  if (cleanUrl === '/complaints/check-duplicates' && method.toLowerCase() === 'get') {
    const searchParams = params || {};
    const title = (searchParams.title || '').toLowerCase();
    const description = (searchParams.description || '').toLowerCase();
    const category = searchParams.category || '';

    if (!title && !description) {
      return [200, { duplicates: [] }];
    }

    // Tokenize meaningful words
    const queryTokens = `${title} ${description}`
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !['with', 'from', 'this', 'that', 'have', 'there', 'please', 'need', 'very', 'room'].includes(w));

    const duplicates = db.complaints
      .filter(c => !c.isDeleted && c.status !== COMPLAINT_STATUSES.RESOLVED && c.status !== COMPLAINT_STATUSES.REJECTED)
      .map(c => {
        let matchScore = 0;
        const cText = `${c.title} ${c.description} ${c.location || ''}`.toLowerCase();
        
        if (category && c.category === category) {
          matchScore += 0.3;
        }

        queryTokens.forEach(token => {
          if (cText.includes(token)) {
            matchScore += 0.2;
          }
        });

        return {
          id: c.id,
          ticketId: c.ticketId,
          title: c.title,
          category: c.category,
          status: c.status,
          upvotesCount: c.upvotes ? c.upvotes.length : 0,
          location: c.location,
          description: c.description,
          createdAt: c.createdAt,
          matchScore
        };
      })
      .filter(c => c.matchScore >= 0.4)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 4);

    return [200, { duplicates }];
  }

  // -------------------------------------------------------------
  // COMPLAINT TRACK (PUBLIC)
  // -------------------------------------------------------------
  if (cleanUrl.startsWith('/complaints/track/') && method.toLowerCase() === 'get') {
    const trackingKey = cleanUrl.replace('/complaints/track/', '').trim();
    const complaint = db.complaints.find(c => 
      c.trackingKey === trackingKey || 
      c.ticketId.toUpperCase() === trackingKey.toUpperCase()
    );

    if (!complaint) {
      return [404, { error: 'No complaint found matching tracking key: ' + trackingKey }];
    }

    // Public view: NEVER expose internal notes to anonymous or public users
    const sanitized = {
      ...complaint,
      comments: (complaint.comments || []).filter(c => !c.isInternal)
    };

    return [200, { complaint: sanitized }];
  }

  // -------------------------------------------------------------
  // COMPLAINTS MINE (STUDENT)
  // -------------------------------------------------------------
  if (cleanUrl === '/complaints/mine' && method.toLowerCase() === 'get') {
    if (!currentUser) {
      return [401, { error: 'Authentication required' }];
    }

    const mine = db.complaints
      .filter(c => !c.isDeleted && c.submittedBy && c.submittedBy.id === currentUser.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return [200, { complaints: mine }];
  }

  // -------------------------------------------------------------
  // COMPLAINT STATUS (FSM ENFORCEMENT)
  // -------------------------------------------------------------
  const statusMatch = cleanUrl.match(/^\/complaints\/([^/]+)\/status$/);
  if (statusMatch && method.toLowerCase() === 'patch') {
    const id = statusMatch[1];
    const { status, note } = parsedData;

    const complaint = db.complaints.find(c => c.id === id || c.ticketId === id);
    if (!complaint) {
      return [404, { error: 'Complaint not found' }];
    }

    // Strict Finite-State Machine verification
    if (!isValidTransition(complaint.status, status)) {
      return [400, {
        error: `Invalid status transition. Cannot move directly from "${complaint.status}" to "${status}". State machine rules strictly prohibit skipping stages.`
      }];
    }

    const previousStatus = complaint.status;
    complaint.status = status;
    complaint.updatedAt = new Date().toISOString();

    if (status === COMPLAINT_STATUSES.RESOLVED) {
      complaint.resolvedAt = new Date().toISOString();
    }

    const actor = currentUser
      ? { name: currentUser.name, role: currentUser.role }
      : { name: 'Authority Officer', role: 'authority' };

    complaint.history.push({
      status,
      actor,
      timestamp: new Date().toISOString(),
      note: note || `Status transitioned from ${previousStatus} to ${status}`
    });

    saveDb(db);
    return [200, { complaint }];
  }

  // -------------------------------------------------------------
  // COMPLAINT ASSIGN
  // -------------------------------------------------------------
  const assignMatch = cleanUrl.match(/^\/complaints\/([^/]+)\/assign$/);
  if (assignMatch && method.toLowerCase() === 'patch') {
    const id = assignMatch[1];
    const { assignedToId, note } = parsedData;

    const complaint = db.complaints.find(c => c.id === id || c.ticketId === id);
    if (!complaint) {
      return [404, { error: 'Complaint not found' }];
    }

    const targetUser = db.users.find(u => u.id === assignedToId);
    if (!targetUser) {
      return [400, { error: 'Designated authority user does not exist' }];
    }

    complaint.assignedTo = {
      id: targetUser.id,
      name: targetUser.name,
      role: targetUser.role,
      department: targetUser.department
    };
    complaint.updatedAt = new Date().toISOString();

    complaint.history.push({
      status: complaint.status,
      actor: currentUser ? { name: currentUser.name, role: currentUser.role } : { name: 'Admin', role: 'admin' },
      timestamp: new Date().toISOString(),
      note: note || `Assigned to ${targetUser.name} (${targetUser.department})`
    });

    saveDb(db);
    return [200, { complaint }];
  }

  // -------------------------------------------------------------
  // COMPLAINT UPVOTE
  // -------------------------------------------------------------
  const upvoteMatch = cleanUrl.match(/^\/complaints\/([^/]+)\/upvote$/);
  if (upvoteMatch && method.toLowerCase() === 'post') {
    const id = upvoteMatch[1];
    const complaint = db.complaints.find(c => c.id === id || c.ticketId === id);
    if (!complaint) {
      return [404, { error: 'Complaint not found' }];
    }

    const userId = currentUser ? currentUser.id : 'usr_guest_' + Date.now();
    if (!Array.isArray(complaint.upvotes)) {
      complaint.upvotes = [];
    }

    const index = complaint.upvotes.indexOf(userId);
    let hasUpvoted = false;
    if (index > -1) {
      complaint.upvotes.splice(index, 1);
      hasUpvoted = false;
    } else {
      complaint.upvotes.push(userId);
      hasUpvoted = true;
    }

    saveDb(db);
    return [200, {
      upvotesCount: complaint.upvotes.length,
      hasUpvoted,
      upvotes: complaint.upvotes
    }];
  }

  // -------------------------------------------------------------
  // COMPLAINT WITHDRAW (SOFT-DELETE ONLY)
  // -------------------------------------------------------------
  const withdrawMatch = cleanUrl.match(/^\/complaints\/([^/]+)\/withdraw$/);
  if (withdrawMatch && method.toLowerCase() === 'post') {
    const id = withdrawMatch[1];
    const complaint = db.complaints.find(c => c.id === id || c.ticketId === id);
    if (!complaint) {
      return [404, { error: 'Complaint not found' }];
    }

    // Verify ownership if student
    if (currentUser && currentUser.role === 'student' && complaint.submittedBy?.id !== currentUser.id) {
      return [403, {
        error: 'Only the original student reporter or an administrator can withdraw this complaint.'
      }];
    }

    // Strictly soft-delete
    complaint.isDeleted = true;
    complaint.updatedAt = new Date().toISOString();
    complaint.history.push({
      status: complaint.status,
      actor: currentUser ? { name: currentUser.name, role: currentUser.role } : { name: 'Student', role: 'student' },
      timestamp: new Date().toISOString(),
      note: 'Complaint withdrawn by reporter. Soft-deleted from active triage queue.'
    });

    saveDb(db);
    return [200, {
      success: true,
      message: 'Complaint withdrawn successfully. Records are safely archived in accordance with institutional policy.'
    }];
  }

  // Intercept any DELETE attempts to show specific policy message per requirements
  if (cleanUrl.startsWith('/complaints/') && method.toLowerCase() === 'delete') {
    return [403, {
      error: 'Only soft-delete is available — records are never fully removed in accordance with MITS University audit policy.'
    }];
  }

  // -------------------------------------------------------------
  // COMPLAINT COMMENTS
  // -------------------------------------------------------------
  const commentsMatch = cleanUrl.match(/^\/complaints\/([^/]+)\/comments$/);
  if (commentsMatch && method.toLowerCase() === 'post') {
    const id = commentsMatch[1];
    const complaint = db.complaints.find(c => c.id === id || c.ticketId === id);
    if (!complaint) {
      return [404, { error: 'Complaint not found' }];
    }

    const { text, isInternal } = parsedData;
    if (!text || !text.trim()) {
      return [400, { error: 'Comment text cannot be empty' }];
    }

    // Role check: Students CANNOT create internal notes
    if (isInternal && currentUser && currentUser.role === 'student') {
      return [403, { error: 'Students cannot create internal notes. Only Authority and Admin roles can post internal memos.' }];
    }

    const newComment = {
      id: 'cmt_' + Date.now(),
      complaintRef: complaint.id,
      author: currentUser ? currentUser.name : 'Anonymous Reporter',
      authorRole: currentUser ? currentUser.role : 'student',
      isInternal: Boolean(isInternal),
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    if (!Array.isArray(complaint.comments)) {
      complaint.comments = [];
    }
    complaint.comments.push(newComment);
    complaint.updatedAt = new Date().toISOString();

    saveDb(db);
    return [201, { comment: newComment }];
  }

  // -------------------------------------------------------------
  // SINGLE COMPLAINT DETAIL
  // -------------------------------------------------------------
  const singleMatch = cleanUrl.match(/^\/complaints\/([^/]+)$/);
  if (singleMatch && method.toLowerCase() === 'get') {
    const id = singleMatch[1];
    const complaint = db.complaints.find(c => c.id === id || c.ticketId === id);
    if (!complaint) {
      return [404, { error: 'Complaint not found with ID: ' + id }];
    }

    // Filter comments based on role: students never see internal notes
    let comments = complaint.comments || [];
    if (!currentUser || currentUser.role === 'student') {
      comments = comments.filter(c => !c.isInternal);
    }

    return [200, { complaint: { ...complaint, comments } }];
  }

  // -------------------------------------------------------------
  // LIST COMPLAINTS (AUTHORITY & ADMIN & PUBLIC FEED)
  // -------------------------------------------------------------
  if (cleanUrl === '/complaints' && method.toLowerCase() === 'get') {
    const searchParams = params || {};
    let list = db.complaints.filter(c => !c.isDeleted);

    if (searchParams.department) {
      list = list.filter(c => c.department === searchParams.department);
    }

    if (searchParams.category) {
      list = list.filter(c => c.category === searchParams.category);
    }

    if (searchParams.status) {
      list = list.filter(c => c.status === searchParams.status);
    }

    if (searchParams.priority) {
      list = list.filter(c => c.priority === searchParams.priority);
    }

    if (searchParams.search) {
      const q = searchParams.search.toLowerCase();
      list = list.filter(c => 
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.ticketId.toLowerCase().includes(q) ||
        (c.location && c.location.toLowerCase().includes(q))
      );
    }

    // Sort newest first
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return [200, { complaints: list, total: list.length }];
  }

  // -------------------------------------------------------------
  // CREATE COMPLAINT
  // -------------------------------------------------------------
  if (cleanUrl === '/complaints' && method.toLowerCase() === 'post') {
    const { title, description, category, priority, isAnonymous, department, location } = parsedData;

    if (!title || !description || !category) {
      return [400, { error: 'Title, description, and category are mandatory fields.' }];
    }

    const nextNumber = db.complaints.length + 107;
    const ticketId = `GMS-2026-${nextNumber}`;
    const id = `cmp_${nextNumber}`;
    const now = new Date().toISOString();

    let trackingKey = null;
    let submittedBy = null;

    if (isAnonymous) {
      // Generate one-time secret key
      const randPart = Math.random().toString(36).substring(2, 7).toUpperCase();
      trackingKey = `TRK-${Math.floor(1000 + Math.random() * 9000)}-${randPart}`;
      submittedBy = null;
    } else {
      submittedBy = currentUser ? {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        department: currentUser.department
      } : {
        id: 'usr_guest',
        name: 'MITS Student',
        email: 'student@mitsgwl.ac.in',
        department: department || 'General'
      };
    }

    // Determine target department and SLA
    const catObj = CATEGORIES.find(c => c.name === category);
    const resolvedDept = department || (catObj ? catObj.department : 'Central Proctorial Board');
    const slaTargetHours = catObj ? catObj.targetHours : 48;

    const newComplaint = {
      id,
      ticketId,
      title: title.trim(),
      description: description.trim(),
      category,
      department: resolvedDept,
      location: location ? location.trim() : 'MITS Campus',
      priority: priority || 'Medium',
      status: COMPLAINT_STATUSES.SUBMITTED,
      isAnonymous: Boolean(isAnonymous),
      submittedBy,
      assignedTo: null,
      upvotes: currentUser ? [currentUser.id] : [],
      isDeleted: false,
      trackingKey,
      createdAt: now,
      updatedAt: now,
      resolvedAt: null,
      slaTargetHours,
      history: [
        {
          status: COMPLAINT_STATUSES.SUBMITTED,
          actor: isAnonymous ? { name: 'Anonymous Student', role: 'student' } : { name: submittedBy.name, role: 'student' },
          timestamp: now,
          note: isAnonymous
            ? 'Complaint submitted anonymously with secured tracking key.'
            : 'Complaint officially submitted through MITS student account.'
        }
      ],
      comments: []
    };

    db.complaints.unshift(newComplaint);
    saveDb(db);

    return [201, {
      complaint: newComplaint,
      trackingKey,
      message: 'Complaint submitted successfully.'
    }];
  }

  // -------------------------------------------------------------
  // AI CHATBOT DRAFT
  // -------------------------------------------------------------
  if (cleanUrl === '/chatbot/draft' && method.toLowerCase() === 'post') {
    const { prompt, conversationHistory } = parsedData;

    if (!prompt && (!conversationHistory || conversationHistory.length === 0)) {
      return [400, { isFallback: true, error: 'Empty prompt provided.' }];
    }

    // Combine conversational context
    const fullText = [
      ...(conversationHistory || []).map(m => m.content || m.text || ''),
      prompt || ''
    ].join(' ').toLowerCase();

    // Classification heuristics tailored for MITS Gwalior
    let category = 'Campus Infrastructure';
    let department = 'Campus Infrastructure & Estate';
    let priority = 'Medium';
    let title = 'Maintenance issue reported in campus facility';
    let location = 'MITS Campus, Gwalior';

    if (fullText.includes('mess') || fullText.includes('food') || fullText.includes('dinner') || fullText.includes('lunch') || fullText.includes('breakfast') || fullText.includes('chapati') || fullText.includes('cater')) {
      category = 'Hostel & Mess';
      department = 'Hostel Administration';
      priority = fullText.includes('ill') || fullText.includes('poison') || fullText.includes('vomit') || fullText.includes('stomach') ? 'Critical' : 'High';
      title = 'Substandard mess food quality & catering hygiene concern';
      location = fullText.includes('bh-2') ? 'Boys Hostel 2 (BH-2) Mess' : (fullText.includes('gh') ? 'Girls Hostel (GH) Mess' : 'Boys Hostel 1 (BH-1) Mess');
    } else if (fullText.includes('wifi') || fullText.includes('wi-fi') || fullText.includes('internet') || fullText.includes('router') || fullText.includes('network') || fullText.includes('lan')) {
      category = 'IT & Network';
      department = 'Campus Infrastructure & Estate';
      priority = 'High';
      title = 'Campus Wi-Fi connectivity downtime and network disruption';
      location = 'Hostel Wi-Fi Zone & Computer Center';
    } else if (fullText.includes('exam') || fullText.includes('marks') || fullText.includes('grade') || fullText.includes('result') || fullText.includes('mid-sem') || fullText.includes('ams')) {
      category = 'Examination & Grading';
      department = 'Examination Cell';
      priority = 'Medium';
      title = 'Examination evaluation discrepancy and marks correction request';
      location = 'Examination Section / AMS Portal';
    } else if (fullText.includes('projector') || fullText.includes('class') || fullText.includes('lecture') || fullText.includes('faculty') || fullText.includes('lab') || fullText.includes('attendance')) {
      category = 'Academic & Faculty';
      department = 'Mathematics and Computing';
      priority = 'Medium';
      title = 'Classroom instructional equipment malfunction during lectures';
      location = 'New Academic Block, Classrooms';
    } else if (fullText.includes('water') || fullText.includes('washroom') || fullText.includes('toilet') || fullText.includes('clean') || fullText.includes('garbage') || fullText.includes('leak')) {
      category = 'Sanitation & Hygiene';
      department = 'Sanitation & Grounds';
      priority = 'High';
      title = 'Sanitation and water filtration maintenance needed';
      location = 'Department Restrooms & Drinking Water Station';
    }

    // Extract detailed summary for description
    const userPrompt = prompt || (conversationHistory && conversationHistory[conversationHistory.length - 1]?.content) || '';
    const description = `Issue observed: ${userPrompt}\n\nImpact on students: Academic activities and daily campus routine are disrupted. Immediate inspection and corrective action by the designated ${department} committee is requested.`;

    return [200, {
      category,
      department,
      title,
      description,
      location,
      priority,
      isFallback: false
    }];
  }

  // -------------------------------------------------------------
  // ANALYTICS SUMMARY
  // -------------------------------------------------------------
  if (cleanUrl === '/analytics/summary' && method.toLowerCase() === 'get') {
    const complaints = db.complaints.filter(c => !c.isDeleted);

    const statusCounts = {
      [COMPLAINT_STATUSES.SUBMITTED]: 0,
      [COMPLAINT_STATUSES.UNDER_REVIEW]: 0,
      [COMPLAINT_STATUSES.ASSIGNED]: 0,
      [COMPLAINT_STATUSES.IN_PROGRESS]: 0,
      [COMPLAINT_STATUSES.RESOLVED]: 0,
      [COMPLAINT_STATUSES.REJECTED]: 0
    };

    complaints.forEach(c => {
      if (statusCounts[c.status] !== undefined) {
        statusCounts[c.status]++;
      }
    });

    // Category distribution
    const categoryMap = {};
    complaints.forEach(c => {
      categoryMap[c.category] = (categoryMap[c.category] || 0) + 1;
    });
    const categoryCounts = Object.entries(categoryMap).map(([category, count]) => ({ category, count }));

    // Department distribution
    const deptMap = {};
    complaints.forEach(c => {
      const dept = c.department || 'Central Administration';
      deptMap[dept] = (deptMap[dept] || 0) + 1;
    });
    const departmentCounts = Object.entries(deptMap).map(([department, count]) => ({ department, count }));

    // SLA metrics calculation
    const resolvedComplaints = complaints.filter(c => c.status === COMPLAINT_STATUSES.RESOLVED);
    let withinSla = 0;
    let breachedSla = 0;
    let totalResolutionHours = 0;

    resolvedComplaints.forEach(c => {
      const created = new Date(c.createdAt).getTime();
      const resolved = c.resolvedAt ? new Date(c.resolvedAt).getTime() : new Date(c.updatedAt).getTime();
      const diffHours = (resolved - created) / (1000 * 60 * 60);
      totalResolutionHours += diffHours;

      const target = c.slaTargetHours || 48;
      if (diffHours <= target) {
        withinSla++;
      } else {
        breachedSla++;
      }
    });

    // Also assess in-progress complaints for active SLA breaches
    const activeComplaints = complaints.filter(c => c.status !== COMPLAINT_STATUSES.RESOLVED && c.status !== COMPLAINT_STATUSES.REJECTED);
    const now = Date.now();
    activeComplaints.forEach(c => {
      const created = new Date(c.createdAt).getTime();
      const elapsedHours = (now - created) / (1000 * 60 * 60);
      const target = c.slaTargetHours || 48;
      if (elapsedHours > target) {
        breachedSla++;
      } else {
        withinSla++;
      }
    });

    const totalEvaluated = withinSla + breachedSla;
    const adherenceRate = totalEvaluated > 0 ? Math.round((withinSla / totalEvaluated) * 100) : 92;
    const avgResolutionHours = resolvedComplaints.length > 0
      ? Number((totalResolutionHours / resolvedComplaints.length).toFixed(1))
      : 18.5;

    return [200, {
      totalComplaints: complaints.length,
      activeComplaints: activeComplaints.length,
      resolvedComplaints: resolvedComplaints.length,
      statusCounts,
      categoryCounts,
      departmentCounts,
      slaMetrics: {
        adherenceRate,
        avgResolutionHours,
        withinSla,
        breachedSla,
        targetSlaHours: 48
      }
    }];
  }

  // -------------------------------------------------------------
  // ADMIN USERS MANAGEMENT
  // -------------------------------------------------------------
  if (cleanUrl === '/admin/users' && method.toLowerCase() === 'get') {
    return [200, { users: db.users }];
  }

  const userRoleMatch = cleanUrl.match(/^\/admin\/users\/([^/]+)\/role$/);
  if (userRoleMatch && method.toLowerCase() === 'patch') {
    const id = userRoleMatch[1];
    const { role, department } = parsedData;
    const user = db.users.find(u => u.id === id);
    if (!user) {
      return [404, { error: 'User not found' }];
    }
    if (role) user.role = role;
    if (department) user.department = department;
    saveDb(db);
    return [200, { user }];
  }

  // Fallback for unhandled mock route
  return [404, { error: `Mock endpoint not found: ${method.toUpperCase()} ${cleanUrl}` }];
}
