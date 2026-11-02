/**
 * RCMS Unified API Module — src/api/index.js
 *
 * Real PostgreSQL REST API client connecting frontend to Express backend.
 * All operations communicate with persistent PostgreSQL database.
 * No mock data, no in-memory storage, no fake records.
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const TOKEN_KEY = 'mits_gms_auth_token_v1';
const USER_KEY  = 'mits_gms_current_user_v1';

// Create Axios Client
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

// Attach JWT Token to every outgoing request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response interceptor for error normalization
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If unauthorized, clean stale local session
      const currentToken = localStorage.getItem(TOKEN_KEY);
      if (currentToken && !error.config.url.includes('/auth/login')) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Data normalization for backward & forward component compatibility
// ─────────────────────────────────────────────────────────────────────────────
function normalizeGrievance(g) {
  if (!g) return null;
  const ticketCode = g.ticket_number || g.grievance_code || g.ticketId || g.id;
  const catName = g.category_name || g.category || 'General';

  return {
    ...g,
    ticketId: ticketCode,
    grievance_code: ticketCode,
    ticket_number: ticketCode,
    category: catName,
    category_name: catName,
    locationDetails: { block: g.location || 'MITS Campus' },
    location: g.location || 'MITS Campus',
    submittedBy: {
      id: g.author_id,
      name: g.author_name || 'Student',
      email: g.author_email,
      department: g.author_department,
      enrollmentNo: g.author_enrollment
    },
    // Ensure comments and history arrays exist
    comments: (g.comments || []).map(c => ({
      ...c,
      author: { name: c.author_name, role: c.author_role }
    })),
    history: g.history || [],
    supports_count: typeof g.supports_count === 'number' ? g.supports_count : 0
  };
}

// In-memory cache for fast synchronous lookup calls
let cachedCategories = [];
let cachedSubAuthorities = [];

// ─────────────────────────────────────────────────────────────────────────────
// AUTH API
// ─────────────────────────────────────────────────────────────────────────────
export const auth = {
  getCurrentUser() {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  async login(email, password = 'Password@123') {
    try {
      const res = await apiClient.post('/auth/login', {
        email: email.trim(),
        password
      });

      if (res.data.token && res.data.user) {
        localStorage.setItem(TOKEN_KEY, res.data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
        return { user: res.data.user, token: res.data.token };
      }
      return { error: 'Invalid response from server' };
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Login failed. Please check credentials.';
      return { error: msg };
    }
  },

  async quickLogin(role) {
    try {
      const res = await apiClient.post('/auth/quick-login', { role });
      if (res.data.token && res.data.user) {
        localStorage.setItem(TOKEN_KEY, res.data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
        return { user: res.data.user, token: res.data.token };
      }
      return { error: 'Failed to switch role' };
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Quick login failed';
      return { error: msg };
    }
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  async register({ name, college_email, email, department, enrollment_no, enrollmentNo, password = 'Password@123', hostel, room_no }) {
    try {
      const targetEmail = college_email || email;
      const res = await apiClient.post('/auth/register', {
        name,
        email: targetEmail,
        password,
        department: department || 'General',
        enrollment_no: enrollment_no || enrollmentNo || '',
        hostel,
        room_no
      });

      if (res.data.token && res.data.user) {
        localStorage.setItem(TOKEN_KEY, res.data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
        return { user: res.data.user, token: res.data.token };
      }
      return { error: 'Registration failed to return session' };
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Registration failed';
      return { error: msg };
    }
  },

  async getMe() {
    try {
      const res = await apiClient.get('/auth/me');
      if (res.data.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
        return { user: res.data.user };
      }
      return { user: null };
    } catch (err) {
      return { error: err.response?.data?.error || err.message };
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GRIEVANCES API
// ─────────────────────────────────────────────────────────────────────────────
export const grievances = {
  async list({ category_id, sub_authority_id, status, section, search, page = 1, limit = 50 } = {}) {
    try {
      const params = {};
      if (category_id) params.category_id = category_id;
      if (sub_authority_id) params.sub_authority_id = sub_authority_id;
      if (status && status !== 'All') params.status = status;
      if (section && section !== 'All') params.section = section;
      if (search) params.search = search;
      params.page = page;
      params.limit = limit;

      const res = await apiClient.get('/grievances', { params });
      const rawList = res.data.grievances || [];
      const normalized = rawList.map(normalizeGrievance);

      return {
        grievances: normalized,
        total: res.data.total || normalized.length
      };
    } catch (err) {
      console.error('Failed to list grievances:', err);
      return {
        grievances: [],
        total: 0,
        error: err.response?.data?.error || err.message
      };
    }
  },

  async getById(id) {
    try {
      const res = await apiClient.get(`/grievances/${id}`);
      return { grievance: normalizeGrievance(res.data.grievance) };
    } catch (err) {
      return { error: err.response?.data?.error || 'Grievance not found' };
    }
  },

  async getMine() {
    try {
      const res = await apiClient.get('/grievances/mine');
      const rawList = res.data.grievances || [];
      return { grievances: rawList.map(normalizeGrievance) };
    } catch (err) {
      return {
        grievances: [],
        error: err.response?.data?.error || err.message
      };
    }
  },

  async create({ title, description, category_id, location, is_anonymous, priority = 'Medium', evidence_urls = [] }) {
    try {
      const res = await apiClient.post('/grievances', {
        title,
        description,
        category_id,
        location,
        is_anonymous: Boolean(is_anonymous),
        priority,
        evidence_urls
      });

      return {
        grievance: normalizeGrievance(res.data.grievance),
        tracking_token: res.data.tracking_token
      };
    } catch (err) {
      return { error: err.response?.data?.error || err.message || 'Failed to submit grievance' };
    }
  },

  async toggleSupport(grievance_id) {
    try {
      const res = await apiClient.post(`/grievances/${grievance_id}/upvote`);
      return {
        supported: res.data.supported,
        supports_count: res.data.supports_count
      };
    } catch (err) {
      return { error: err.response?.data?.error || err.message || 'Failed to update support' };
    }
  },

  async updateStatus(grievance_id, new_status, note = '') {
    try {
      const res = await apiClient.put(`/grievances/${grievance_id}/status`, {
        status: new_status,
        note
      });
      return { grievance: normalizeGrievance(res.data.grievance) };
    } catch (err) {
      return { error: err.response?.data?.error || err.message || 'Failed to update status' };
    }
  },

  async addComment(grievance_id, body, is_anonymous = false) {
    try {
      const res = await apiClient.post(`/grievances/${grievance_id}/comments`, {
        body,
        is_anonymous
      });
      return { comment: res.data.comment };
    } catch (err) {
      return { error: err.response?.data?.error || err.message || 'Failed to post comment' };
    }
  },

  async addInternalNote(grievance_id, body) {
    try {
      const res = await apiClient.post(`/grievances/${grievance_id}/internal-notes`, {
        body
      });
      return { comment: res.data.comment };
    } catch (err) {
      return { error: err.response?.data?.error || err.message || 'Failed to post internal note' };
    }
  },

  async reopen(grievance_id, note = '') {
    try {
      const res = await apiClient.post(`/grievances/${grievance_id}/reopen`, { note });
      return { grievance: normalizeGrievance(res.data.grievance) };
    } catch (err) {
      return { error: err.response?.data?.error || err.message || 'Failed to reopen grievance' };
    }
  },

  async submitFeedback(grievance_id, resolved_ok, comment = '') {
    try {
      const res = await apiClient.post(`/grievances/${grievance_id}/feedback`, {
        resolved_ok: Boolean(resolved_ok),
        comment
      });
      return { feedback: res.data.feedback };
    } catch (err) {
      return { error: err.response?.data?.error || err.message || 'Failed to submit feedback' };
    }
  },

  async flag(grievance_id, reason) {
    try {
      const res = await apiClient.post(`/grievances/${grievance_id}/flag`, { reason });
      return { flag: res.data.flag };
    } catch (err) {
      return { error: err.response?.data?.error || err.message || 'Failed to flag grievance' };
    }
  },

  async trackByToken(token) {
    try {
      const res = await apiClient.get(`/grievances/track/${encodeURIComponent(token.trim())}`);
      return { grievance: normalizeGrievance(res.data.grievance) };
    } catch (err) {
      return { error: err.response?.data?.error || 'No grievance found for this tracking token.' };
    }
  },

  async getDuplicates(title, description, category_id) {
    try {
      const res = await apiClient.get('/grievances/check-duplicates', {
        params: { title, description, category_id }
      });
      return { duplicates: res.data.duplicates || [] };
    } catch (err) {
      return { duplicates: [] };
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN API
// ─────────────────────────────────────────────────────────────────────────────
export const admin = {
  async listUsers({ role, status, search } = {}) {
    try {
      const params = {};
      if (role && role !== 'all') params.role = role;
      if (status && status !== 'all') params.status = status;
      if (search) params.search = search;

      const res = await apiClient.get('/users', { params });
      return { users: res.data.users || [] };
    } catch (err) {
      return {
        users: [],
        error: err.response?.data?.error || 'Admin access required'
      };
    }
  },

  async createAuthority({ name, college_email, email, sub_authority_id, designation, department }) {
    try {
      const res = await apiClient.post('/authorities', {
        name,
        email: college_email || email,
        sub_authority_id,
        designation,
        department
      });
      return {
        authority: res.data.authority,
        profile: res.data.profile
      };
    } catch (err) {
      return { error: err.response?.data?.error || err.message || 'Failed to create authority account' };
    }
  },

  async setUserStatus(user_id, status, reason = '') {
    try {
      const res = await apiClient.put(`/users/${user_id}/status`, { status, reason });
      return { user: res.data.user, profile: res.data.user };
    } catch (err) {
      return { error: err.response?.data?.error || err.message || 'Failed to update user status' };
    }
  },

  async listFlags({ resolved } = {}) {
    try {
      const params = {};
      if (resolved !== undefined) params.resolved = resolved;
      const res = await apiClient.get('/flags', { params });
      return { flags: res.data.flags || [] };
    } catch (err) {
      return { flags: [], error: err.response?.data?.error };
    }
  },

  async resolveFlag(flag_id) {
    try {
      const res = await apiClient.put(`/flags/${flag_id}/resolve`);
      return { flag: res.data.flag };
    } catch (err) {
      return { error: err.response?.data?.error || 'Failed to resolve flag' };
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ANALYTICS API
// ─────────────────────────────────────────────────────────────────────────────
export const analytics = {
  async summary() {
    try {
      const res = await apiClient.get('/analytics/summary');
      return res.data;
    } catch (err) {
      console.error('Failed to fetch analytics summary:', err);
      return {
        total: 0,
        active: 0,
        resolved: 0,
        flags: 0,
        byStatus: [],
        byCategory: [],
        bySection: [],
        ageBuckets: [],
        sla: { avg_hours: 0, breach_count: 0, on_time: 0 },
        bySubAuthority: []
      };
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// LOOKUP API (categories, sub-authorities)
// ─────────────────────────────────────────────────────────────────────────────
export const lookup = {
  async fetchCategories() {
    try {
      const res = await apiClient.get('/categories');
      cachedCategories = res.data.categories || [];
      return cachedCategories;
    } catch (err) {
      console.warn('Could not fetch categories from backend:', err);
      return cachedCategories;
    }
  },

  async fetchSubAuthorities() {
    try {
      const res = await apiClient.get('/authorities');
      cachedSubAuthorities = res.data.authorities || [];
      return cachedSubAuthorities;
    } catch (err) {
      console.warn('Could not fetch authorities from backend:', err);
      return cachedSubAuthorities;
    }
  },

  categories() {
    return cachedCategories;
  },

  subAuthorities() {
    return cachedSubAuthorities;
  },

  subAuthorityForCategory(category_id) {
    const cat = cachedCategories.find(c => c.id === category_id);
    if (!cat) return null;
    return cachedSubAuthorities.find(s => s.id === cat.sub_authority_id) || null;
  }
};

export const authorities = {
  getAll() {
    return apiClient.get('/authorities');
  },
  update(id, data) {
    return apiClient.put(`/authorities/${id}`, data);
  },
  mapCategory(category_id, authority_id) {
    return apiClient.post('/authorities/map-category', { category_id, authority_id });
  },
  getAuditLogs() {
    return apiClient.get('/authorities/audit-logs');
  }
};

export function resetDatabase() {
  console.info('Database reset requested. Local auth token cleared.');
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

const api = { auth, grievances, admin, analytics, lookup, authorities, client: apiClient, resetDatabase };
export { api, apiClient };
export default api;

