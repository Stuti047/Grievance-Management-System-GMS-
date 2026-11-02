import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Building2,
  Phone,
  PhoneOff,
  UserCheck,
  Edit3,
  Link2,
  CheckCircle2,
  Clock,
  Filter,
  RefreshCw,
  Plus,
  History,
  Lock,
  ExternalLink,
  ChevronRight,
  BookOpen,
  Info
} from 'lucide-react';

export default function ResponsibleAuthoritiesView() {
  const { currentUser, categories, addToast } = useApp();
  const isAdmin = currentUser?.role === 'admin';

  const [authorities, setAuthorities] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [viewTab, setViewTab] = useState('directory'); // 'directory' | 'audit'

  // Modals for admin operations
  const [editingAuth, setEditingAuth] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  const [mappingCategory, setMappingCategory] = useState(null);
  const [selectedAuthorityForMapping, setSelectedAuthorityForMapping] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch authorities from PostgreSQL backend
  const loadAuthorities = async () => {
    setIsLoading(true);
    try {
      const res = await api.authorities.getAll();
      setAuthorities(res.data.authorities || []);
    } catch (err) {
      console.error('Failed to load authorities:', err);
      addToast?.('Failed to load authorities directory from database', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch audit logs for admin
  const loadAuditLogs = async () => {
    if (!isAdmin) return;
    try {
      const res = await api.client.get('/authorities/audit-logs');
      setAuditLogs(res.data.logs || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    }
  };

  useEffect(() => {
    loadAuthorities();
    if (isAdmin) {
      loadAuditLogs();
    }
  }, [isAdmin]);

  // Filtered authorities list
  const filteredAuthorities = useMemo(() => {
    return authorities.filter(a => {
      const matchesSearch = 
        (a.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.department || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.designation || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.responsibilities || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSection = sectionFilter === 'all' || a.section === sectionFilter;
      return matchesSearch && matchesSection;
    });
  }, [authorities, searchTerm, sectionFilter]);

  // Handle Edit Submit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingAuth) return;
    setIsSubmitting(true);
    try {
      await api.client.put(`/authorities/${editingAuth.id}`, {
        name: editingAuth.name,
        designation: editingAuth.designation,
        department: editingAuth.department,
        responsibilities: editingAuth.responsibilities,
        contact_number: editingAuth.contact_number,
        section: editingAuth.section,
        status: editingAuth.status
      });
      addToast?.('Authority record updated and audit log saved', 'success');
      setIsEditModalOpen(false);
      setEditingAuth(null);
      loadAuthorities();
      loadAuditLogs();
    } catch (err) {
      console.error('Update failed:', err);
      addToast?.(err.response?.data?.error || 'Failed to update authority', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Category Mapping Submit
  const handleSaveMapping = async (e) => {
    e.preventDefault();
    if (!mappingCategory) return;
    setIsSubmitting(true);
    try {
      await api.client.post('/authorities/map-category', {
        category_id: mappingCategory.id,
        authority_id: selectedAuthorityForMapping || null
      });
      addToast?.(`Category "${mappingCategory.name}" mapped successfully`, 'success');
      setIsMappingModalOpen(false);
      setMappingCategory(null);
      loadAuthorities();
      loadAuditLogs();
    } catch (err) {
      console.error('Mapping failed:', err);
      addToast?.('Failed to map category', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Building2 className="w-48 h-48 text-indigo-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                Official Directory
              </span>
              <span className="font-accent text-indigo-400 text-lg font-bold">
                Madhav Institute of Technology & Science
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Responsible Authorities Directory
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Institutional grievance redressing officers, department in-charges, and administrative committee coordinators.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700">
                <button
                  onClick={() => setViewTab('directory')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewTab === 'directory'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Directory ({authorities.length})
                </button>
                <button
                  onClick={() => setViewTab('audit')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewTab === 'audit'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Audit Logs</span>
                </button>
              </div>
            )}

            <button
              onClick={() => {
                loadAuthorities();
                if (isAdmin) loadAuditLogs();
              }}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
              title="Refresh Directory"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Security & Confidentiality Notice Badge */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-xs text-slate-400">
          <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            {isAdmin ? (
              <strong className="text-emerald-400">Administrator Access Active:</strong>
            ) : (
              <strong className="text-indigo-400">Student Privacy Shield Active:</strong>
            )}
            {' '}
            {isAdmin 
              ? 'Confidential phone numbers are visible for verified administrators. All administrative edits are recorded in PostgreSQL audit logs.'
              : 'Direct personal contact numbers are kept strictly confidential to protect faculty privacy. All grievances are routed securely through the GMS platform.'}
          </span>
        </div>
      </div>

      {/* Directory Tab View */}
      {viewTab === 'directory' && (
        <>
          {/* Search & Filter Bar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search official, role, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs text-slate-400 font-medium shrink-0 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Section:
              </span>
              {['all', 'college', 'academic', 'hostel', 'administrative'].map(sec => (
                <button
                  key={sec}
                  onClick={() => setSectionFilter(sec)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer shrink-0 ${
                    sectionFilter === sec
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                      : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                  }`}
                >
                  {sec}
                </button>
              ))}
            </div>
          </div>

          {/* Directory Cards Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-56 bg-slate-900/40 rounded-xl border border-slate-800 animate-pulse p-5" />
              ))}
            </div>
          ) : filteredAuthorities.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center">
              <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-300">No authorities match your search</h3>
              <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAuthorities.map((auth, idx) => (
                <div 
                  key={auth.id || idx}
                  className="portal-card p-5 flex flex-col justify-between group relative"
                >
                  <div>
                    {/* Top Row: Department badge + Status / Admin actions */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {auth.department}
                      </span>
                      
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          auth.status === 'active' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-slate-800 text-slate-500'
                        }`}>
                          {auth.status || 'Active'}
                        </span>
                        
                        {isAdmin && (
                          <button
                            onClick={() => {
                              setEditingAuth({ ...auth });
                              setIsEditModalOpen(true);
                            }}
                            className="p-1 rounded bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-400 border border-slate-700 transition-colors cursor-pointer"
                            title="Edit Authority Record"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Authority Name & Designation */}
                    <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {auth.name}
                    </h3>
                    <p className="text-xs font-semibold text-indigo-400 mt-0.5">
                      {auth.designation || 'Authority Officer'}
                    </p>

                    {/* Responsibilities */}
                    <div className="mt-3 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed min-h-[52px]">
                      <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider mb-0.5">
                        Responsibilities
                      </span>
                      {auth.responsibilities || 'Official Institutional Grievance & Academic Oversight'}
                    </div>

                    {/* Mapped Categories */}
                    {auth.categories && auth.categories.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {auth.categories.map(cat => (
                          <span 
                            key={cat.id}
                            className="px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                          >
                            {cat.name} ({cat.sla_hours}h SLA)
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer Contact Info */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    {isAdmin ? (
                      <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-semibold">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{auth.contact_number || 'No contact registered'}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Contact via GMS Ticket</span>
                      </div>
                    )}

                    <span className="text-[10px] text-slate-500 capitalize">
                      {auth.section} wing
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Audit Logs View (Admin Only) */}
      {viewTab === 'audit' && isAdmin && (
        <div className="portal-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-400" />
                Directory & Administrative Audit Trail
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Immutable chronological log of authority modifications, category re-mappings, and status adjustments.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {auditLogs.length} Logged Actions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Entity Type</th>
                  <th className="py-2.5 px-3">Administrator</th>
                  <th className="py-2.5 px-3">Details / Diff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No administrative changes recorded yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">
                        {log.entity_type}
                      </td>
                      <td className="py-2.5 px-3 text-slate-200">
                        {log.user?.name || log.user?.email || 'System'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 max-w-xs truncate">
                        {log.details ? JSON.stringify(log.details) : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Authority Modal (Admin Only) */}
      {isEditModalOpen && editingAuth && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-1">
              Edit Authority Record
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              All edits are logged with your administrator user ID in PostgreSQL.
            </p>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Official Name</label>
                <input
                  type="text"
                  required
                  value={editingAuth.name || ''}
                  onChange={(e) => setEditingAuth({ ...editingAuth, name: e.target.value })}
                  className="portal-input w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Designation</label>
                  <input
                    type="text"
                    value={editingAuth.designation || ''}
                    onChange={(e) => setEditingAuth({ ...editingAuth, designation: e.target.value })}
                    className="portal-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={editingAuth.department || ''}
                    onChange={(e) => setEditingAuth({ ...editingAuth, department: e.target.value })}
                    className="portal-input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Responsibilities</label>
                <textarea
                  rows={3}
                  value={editingAuth.responsibilities || ''}
                  onChange={(e) => setEditingAuth({ ...editingAuth, responsibilities: e.target.value })}
                  className="portal-input w-full text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Contact Number (Confidential)
                  </label>
                  <input
                    type="text"
                    value={editingAuth.contact_number || ''}
                    onChange={(e) => setEditingAuth({ ...editingAuth, contact_number: e.target.value })}
                    className="portal-input w-full font-mono text-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Section</label>
                  <select
                    value={editingAuth.section || 'college'}
                    onChange={(e) => setEditingAuth({ ...editingAuth, section: e.target.value })}
                    className="portal-input w-full text-xs"
                  >
                    <option value="college">College</option>
                    <option value="academic">Academic</option>
                    <option value="hostel">Hostel</option>
                    <option value="mess">Mess</option>
                    <option value="administrative">Administrative</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save & Log Audit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
