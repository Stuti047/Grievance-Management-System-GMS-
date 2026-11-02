import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  ShieldCheck, 
  Search, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  Lock, 
  FileText, 
  RefreshCw,
  Phone,
  Tag,
  History,
  X
} from 'lucide-react';
import api from '../api';

export default function FacultyDirectoryView() {
  const { currentUser, addToast } = useApp();
  const isAdmin = currentUser?.role === 'admin';

  const [authorities, setAuthorities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');

  // Admin edit modal
  const [editingAuth, setEditingAuth] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDesignation, setEditDesignation] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editResponsibilities, setEditResponsibilities] = useState('');
  const [editContact, setEditContact] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Admin audit logs modal
  const [isAuditLogsOpen, setIsAuditLogsOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const fetchAuthorities = async () => {
    setLoading(true);
    try {
      const res = await api.authorities.list();
      setAuthorities(res.authorities || []);
    } catch (err) {
      console.error('Failed to load faculty directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthorities();
  }, [currentUser]);

  const departments = ['all', ...new Set(authorities.map(a => a.department).filter(Boolean))];

  const filteredAuthorities = authorities.filter(a => {
    const matchesSearch = 
      (a.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.responsibilities || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.designation || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.department || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDept = selectedDept === 'all' || a.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const openEditModal = (auth) => {
    setEditingAuth(auth);
    setEditName(auth.name || '');
    setEditDesignation(auth.designation || '');
    setEditDepartment(auth.department || '');
    setEditResponsibilities(auth.responsibilities || '');
    setEditContact(auth.contact_number || auth.confidential_phone || '');
  };

  const handleSaveAuthority = async (e) => {
    e.preventDefault();
    if (!editingAuth) return;
    setIsSaving(true);
    try {
      const token = localStorage.getItem('mits_gms_auth_token_v1');
      const response = await fetch(`http://localhost:5000/api/authorities/${editingAuth.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editName,
          designation: editDesignation,
          department: editDepartment,
          responsibilities: editResponsibilities,
          contact_number: editContact
        })
      });

      const data = await response.json();
      if (response.ok) {
        addToast('Updated', `Responsibilities updated for ${editName}`, 'success');
        setEditingAuth(null);
        fetchAuthorities();
      } else {
        addToast('Update Failed', data.error || 'Failed to update authority', 'error');
      }
    } catch (err) {
      addToast('Error', err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const openAuditLogs = async () => {
    setIsAuditLogsOpen(true);
    setLoadingLogs(true);
    try {
      const token = localStorage.getItem('mits_gms_auth_token_v1');
      const res = await fetch('http://localhost:5000/api/authorities/audit-logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setAuditLogs(data.audit_logs || []);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 mb-1">
            <Building2 className="w-3.5 h-3.5" />
            <span>Institutional Governance</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Responsible Authorities & Faculty Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Designated officers and committee heads for grievance resolution at MITS Gwalior.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={openAuditLogs}
              className="px-3 py-1.5 text-xs font-semibold bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <History className="w-3.5 h-3.5" />
              <span>Change History</span>
            </button>
          )}

          <button
            onClick={fetchAuthorities}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by faculty name, designation, or responsibility..."
            className="w-full pl-10 pr-4 py-2 bg-[#0c1629] border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="px-3 py-2 bg-[#0c1629] border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {departments.map((dept) => (
            <option key={dept} value={dept} className="bg-slate-900 text-white">
              {dept === 'all' ? 'All Departments' : dept}
            </option>
          ))}
        </select>
      </div>

      {/* Faculty Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading MITS Responsible Authorities...</span>
        </div>
      ) : filteredAuthorities.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-xs bg-slate-900/40 rounded-2xl border border-slate-800">
          No faculty members matched your filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAuthorities.map((auth) => (
            <div
              key={auth.id}
              className="p-5 rounded-2xl bg-[#0c1629] border border-slate-800 hover:border-slate-700 transition-all shadow-md flex flex-col justify-between space-y-3 relative overflow-hidden group"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                      {auth.name}
                    </h3>
                    <p className="text-xs text-blue-300 font-medium">
                      {auth.designation}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider shrink-0">
                    Active
                  </span>
                </div>

                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{auth.department}</span>
                </div>

                {/* Assigned Responsibilities */}
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                    Assigned Responsibilities
                  </span>
                  <p className="text-xs text-slate-300 leading-snug line-clamp-3">
                    {auth.responsibilities || 'Responsible Authority for Grievance Redressal'}
                  </p>
                </div>

                {/* Handled Categories */}
                {auth.categories && auth.categories.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                      Categories Handled
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {auth.categories.map((c, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/25"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Confidential Phone (Admin Only) */}
                {isAdmin && auth.contact_number && (
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-amber-300 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-amber-400" />
                      <span className="font-mono">{auth.contact_number}</span>
                    </span>
                    <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      Confidential
                    </span>
                  </div>
                )}
              </div>

              {/* Admin Actions */}
              {isAdmin && (
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => openEditModal(auth)}
                    className="px-2.5 py-1 text-xs font-semibold text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-600 rounded-lg border border-blue-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Responsibilities</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          ADMIN EDIT AUTHORITY MODAL
          ───────────────────────────────────────────────────────────── */}
      {editingAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#0c1629] border border-slate-700 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-400" />
                <span>Edit Faculty Responsibilities</span>
              </h3>
              <button
                onClick={() => setEditingAuth(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAuthority} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Faculty Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-[#080f1c] border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={editDesignation}
                    onChange={(e) => setEditDesignation(e.target.value)}
                    className="w-full px-3 py-2 bg-[#080f1c] border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-[#080f1c] border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Assigned Responsibilities
                </label>
                <textarea
                  value={editResponsibilities}
                  onChange={(e) => setEditResponsibilities(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-[#080f1c] border border-slate-700 rounded-xl text-xs text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-300 mb-1 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Confidential Contact Number (Admin Only)</span>
                </label>
                <input
                  type="text"
                  value={editContact}
                  onChange={(e) => setEditContact(e.target.value)}
                  placeholder="e.g. 9425122675"
                  className="w-full px-3 py-2 bg-[#080f1c] border border-slate-700 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingAuth(null)}
                  className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all cursor-pointer disabled:opacity-60"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          ADMIN AUDIT LOGS MODAL
          ───────────────────────────────────────────────────────────── */}
      {isAuditLogsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#0c1629] border border-slate-700 rounded-2xl p-6 max-w-2xl w-full shadow-2xl relative space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-purple-400" />
                <span>Faculty Responsibility Change History</span>
              </h3>
              <button
                onClick={() => setIsAuditLogsOpen(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {loadingLogs ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading audit trail...</div>
              ) : auditLogs.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">No modification logs recorded yet.</div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-[#080f1c] border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-purple-400">{log.action}</span>
                      <span className="text-slate-500 font-mono">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-300">
                      Modified by: <span className="font-semibold text-white">{log.changed_by_name}</span>
                    </p>
                    {log.details?.faculty_name && (
                      <p className="text-slate-400 text-[11px]">
                        Target Faculty: <span className="text-blue-300 font-medium">{log.details.faculty_name}</span>
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
