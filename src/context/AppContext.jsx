/**
 * RCMS Application Context
 * All data access goes through src/api/index.js — zero direct mock imports.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api';
import confetti from 'canvas-confetti';
import { ORDERED_HAPPY_PATH, STATUS_META } from '../utils/fsm';

const AppContext = createContext();

export function AppProvider({ children }) {
  // ─── Auth ───────────────────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState(() => api.auth.getCurrentUser());

  // ─── UI State ────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [isAnonymousTrackerOpen, setIsAnonymousTrackerOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatbotPrefillData, setChatbotPrefillData] = useState(null);
  const [toasts, setToasts] = useState([]);

  // ─── Data Cache ───────────────────────────────────────────────────────────
  const [grievanceList, setGrievanceList] = useState([]);
  const [myGrievances, setMyGrievances] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subAuthorities, setSubAuthorities] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminFlags, setAdminFlags] = useState([]);
  const [loading, setLoading] = useState(false);

  // ─── Toast helper ────────────────────────────────────────────────────────
  const addToast = useCallback((title, message, type = 'info') => {
    const id = Date.now().toString() + Math.random();
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // ─── Fetch grievances list (public feed / authority inbox) ───────────────
  const fetchGrievances = useCallback(async (filters = {}) => {
    setLoading(true);
    const res = await api.grievances.list(filters);
    if (res.grievances) setGrievanceList(res.grievances);
    setLoading(false);
    return res;
  }, []);

  // ─── Fetch my grievances ─────────────────────────────────────────────────
  const fetchMine = useCallback(async () => {
    if (!currentUser) return;
    const res = await api.grievances.getMine();
    if (res.grievances) setMyGrievances(res.grievances);
    return res;
  }, [currentUser]);

  // ─── Fetch analytics ─────────────────────────────────────────────────────
  const fetchAnalytics = useCallback(async () => {
    const res = await api.analytics.summary();
    setAnalyticsData(res);
    return res;
  }, []);

  // ─── Fetch admin users ───────────────────────────────────────────────────
  const fetchAdminUsers = useCallback(async (filters = {}) => {
    const res = await api.admin.listUsers(filters);
    if (res.users) setAdminUsers(res.users);
    return res;
  }, []);

  // ─── Fetch admin flags ───────────────────────────────────────────────────
  const fetchAdminFlags = useCallback(async () => {
    const res = await api.admin.listFlags({ resolved: false });
    if (res.flags) setAdminFlags(res.flags);
    return res;
  }, []);

  // ─── Bootstrap lookup data & verify session ──────────────────────────────
  useEffect(() => {
    async function initLookups() {
      try {
        const [cats, subs] = await Promise.all([
          api.lookup.fetchCategories(),
          api.lookup.fetchSubAuthorities()
        ]);
        if (cats && cats.length > 0) setCategories(cats);
        if (subs && subs.length > 0) setSubAuthorities(subs);
      } catch (e) {
        console.error('Failed to load initial lookups:', e);
      }
    }
    initLookups();
  }, []);

  // ─── Auto-fetch grievances on session change ─────────────────────────────
  useEffect(() => {
    fetchGrievances();
    if (currentUser) {
      fetchMine();
      if (currentUser.role === 'admin') {
        fetchAdminUsers();
        fetchAdminFlags();
      }
    }
    fetchAnalytics();
  }, [currentUser, fetchGrievances, fetchMine, fetchAnalytics, fetchAdminUsers, fetchAdminFlags]);

  // ─── Auth actions ────────────────────────────────────────────────────────
  const loginWithEmail = async (email, password) => {
    const res = await api.auth.login(email, password);
    if (res.user) {
      setCurrentUser(res.user);
      setActiveTab('dashboard');
      addToast('Signed In', `Welcome back, ${res.user.name}`, 'success');
      fetchGrievances();
      fetchMine();
      return true;
    }
    addToast('Login Failed', res.error || 'Authentication failed', 'error');
    return false;
  };

  const register = async (payload) => {
    const res = await api.auth.register(payload);
    if (res.user) {
      setCurrentUser(res.user);
      setActiveTab('dashboard');
      addToast('Account Created', `Welcome to GMS, ${res.user.name}!`, 'success');
      fetchGrievances();
      fetchMine();
      return true;
    }
    addToast('Registration Failed', res.error || 'Registration failed', 'error');
    return false;
  };

  const quickLoginAs = async (role) => {
    const res = await api.auth.quickLogin(role);
    if (res.user) {
      setCurrentUser(res.user);
      setActiveTab('dashboard');
      addToast('Role Switched', `Active as: ${res.user.name} [${res.user.role.toUpperCase()}]`, 'info');
      fetchGrievances();
      fetchMine();
    } else {
      addToast('Role Switch Failed', res.error, 'error');
    }
  };

  const logout = () => {
    api.auth.logout();
    setCurrentUser(null);
    setGrievanceList([]);
    setMyGrievances([]);
    setSelectedGrievance(null);
    addToast('Signed Out', 'You have been logged out.', 'info');
  };

  // ─── Grievance actions ───────────────────────────────────────────────────
  const createGrievance = async (payload) => {
    const res = await api.grievances.create(payload);
    if (res.error) {
      addToast('Submission Failed', res.error, 'error');
      return null;
    }
    try {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    } catch { /* ignore */ }

    const msg = res.tracking_token
      ? `Ticket ${res.grievance.grievance_code} created anonymously. Save your token: ${res.tracking_token}`
      : `Ticket ${res.grievance.grievance_code} filed successfully!`;
    addToast('Grievance Registered!', msg, 'success');

    // Refresh both public/dashboard grievances and my grievances
    fetchGrievances();
    fetchMine();
    fetchAnalytics();
    return res.grievance;
  };

  const toggleSupport = async (grievance_id) => {
    if (!currentUser) {
      addToast('Login Required', 'Please sign in to support a grievance.', 'warning');
      return;
    }
    const res = await api.grievances.toggleSupport(grievance_id);
    if (res.error) { addToast('Error', res.error, 'error'); return; }

    // Update in all lists
    const update = g => g.id === grievance_id
      ? { ...g, supports_count: res.supports_count }
      : g;
    setGrievanceList(prev => prev.map(update));
    setMyGrievances(prev => prev.map(update));
    if (selectedGrievance?.id === grievance_id) {
      setSelectedGrievance(prev => ({ ...prev, supports_count: res.supports_count }));
    }
    addToast(
      res.supported ? 'Supported!' : 'Support Removed',
      res.supported ? 'Your support has been recorded.' : 'Support removed.',
      'info'
    );
  };

  const updateStatus = async (grievance_id, new_status, note = '') => {
    const res = await api.grievances.updateStatus(grievance_id, new_status, note);
    if (res.error) { addToast('Error', res.error, 'error'); return false; }
    const updated = res.grievance;
    const update = g => g.id === grievance_id ? updated : g;
    setGrievanceList(prev => prev.map(update));
    setMyGrievances(prev => prev.map(update));
    if (selectedGrievance?.id === grievance_id) setSelectedGrievance(updated);
    addToast('Status Updated', `Grievance moved to "${new_status}".`, 'success');
    return true;
  };

  const addComment = async (grievance_id, body, is_anonymous = false) => {
    const res = await api.grievances.addComment(grievance_id, body, is_anonymous);
    if (res.error) { addToast('Error', res.error, 'error'); return false; }
    // Refresh detail
    if (selectedGrievance?.id === grievance_id) {
      const detail = await api.grievances.getById(grievance_id);
      if (detail.grievance) setSelectedGrievance(detail.grievance);
    }
    addToast('Comment Posted', 'Your comment has been added.', 'info');
    return true;
  };

  const addInternalNote = async (grievance_id, body) => {
    const res = await api.grievances.addInternalNote(grievance_id, body);
    if (res.error) { addToast('Error', res.error, 'error'); return false; }
    if (selectedGrievance?.id === grievance_id) {
      const detail = await api.grievances.getById(grievance_id);
      if (detail.grievance) setSelectedGrievance(detail.grievance);
    }
    addToast('Internal Note Saved', 'Confidential note logged.', 'info');
    return true;
  };

  const reopenGrievance = async (grievance_id, note) => {
    const res = await api.grievances.reopen(grievance_id, note);
    if (res.error) { addToast('Error', res.error, 'error'); return false; }
    const update = g => g.id === grievance_id ? res.grievance : g;
    setGrievanceList(prev => prev.map(update));
    setMyGrievances(prev => prev.map(update));
    if (selectedGrievance?.id === grievance_id) setSelectedGrievance(res.grievance);
    addToast('Grievance Reopened', 'Your grievance has been reopened for review.', 'info');
    return true;
  };

  const submitFeedback = async (grievance_id, resolved_ok, comment) => {
    const res = await api.grievances.submitFeedback(grievance_id, resolved_ok, comment);
    if (res.error) { addToast('Error', res.error, 'error'); return false; }
    // Refresh
    const detail = await api.grievances.getById(grievance_id);
    if (detail.grievance) {
      const updated = detail.grievance;
      setSelectedGrievance(updated);
      const update = g => g.id === grievance_id ? updated : g;
      setGrievanceList(prev => prev.map(update));
      setMyGrievances(prev => prev.map(update));
    }
    addToast('Feedback Submitted', resolved_ok ? 'Thank you! Grievance closed.' : 'Thank you. Grievance will remain open.', 'success');
    return true;
  };

  const flagGrievance = async (grievance_id, reason) => {
    const res = await api.grievances.flag(grievance_id, reason);
    if (res.error) { addToast('Error', res.error, 'error'); return false; }
    addToast('Flagged', 'This grievance has been flagged for admin review.', 'warning');
    return true;
  };

  const openGrievanceDetail = async (grievance_or_id) => {
    const id = typeof grievance_or_id === 'string' ? grievance_or_id : grievance_or_id.id;
    const res = await api.grievances.getById(id);
    if (res.grievance) setSelectedGrievance(res.grievance);
  };

  // ─── Admin actions ───────────────────────────────────────────────────────
  const createAuthority = async (payload) => {
    const res = await api.admin.createAuthority(payload);
    if (res.error) { addToast('Error', res.error, 'error'); return false; }
    addToast('Account Created', `Authority account for ${res.profile.name} is ready.`, 'success');
    fetchAdminUsers();
    return true;
  };

  const setUserStatus = async (user_id, status, reason) => {
    const res = await api.admin.setUserStatus(user_id, status, reason);
    if (res.error) { addToast('Error', res.error, 'error'); return false; }
    addToast('User Updated', `Account status set to "${status}".`, status === 'blocked' ? 'error' : 'warning');
    fetchAdminUsers();
    return true;
  };

  const resolveFlag = async (flag_id) => {
    const res = await api.admin.resolveFlag(flag_id);
    if (res.error) { addToast('Error', res.error, 'error'); return false; }
    setAdminFlags(prev => prev.filter(f => f.id !== flag_id));
    addToast('Flag Resolved', 'The flag has been marked as resolved.', 'success');
    return true;
  };

  return (
    <AppContext.Provider value={{
      // Auth
      currentUser, loginWithEmail, loginWithGoogle: loginWithEmail, register, quickLoginAs, logout,
      // UI
      activeTab, setActiveTab,
      selectedGrievance, setSelectedGrievance, openGrievanceDetail,
      isAnonymousTrackerOpen, setIsAnonymousTrackerOpen,
      isChatbotOpen, setIsChatbotOpen,
      chatbotPrefillData, setChatbotPrefillData,
      toasts, addToast, removeToast,
      loading,
      // Data
      grievanceList, myGrievances, analyticsData,
      categories, subAuthorities,
      adminUsers, adminFlags,
      // Fetch actions
      fetchGrievances, fetchMine, fetchAnalytics,
      fetchAdminUsers, fetchAdminFlags,
      // Grievance actions
      createGrievance, toggleSupport, updateStatus,
      addComment, addInternalNote,
      reopenGrievance, submitFeedback,
      flagGrievance,
      // Admin actions
      createAuthority, setUserStatus, resolveFlag,
      // Legacy compatibility aliases
      complaints: grievanceList,
      selectedTicket: selectedGrievance,
      setSelectedTicket: setSelectedGrievance,
      updateComplaintStatus: updateStatus,
      upvoteComplaint: toggleSupport,
      stages: ORDERED_HAPPY_PATH.map((s) => ({ id: s, label: STATUS_META[s]?.label || s })),
      attemptDeleteComplaint: () => {
        addToast('Action Prohibited', 'Students and authorities cannot delete grievances (403 Forbidden). Tamper-evident log enforced.', 'error');
      },
      // Lookup
      api
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
