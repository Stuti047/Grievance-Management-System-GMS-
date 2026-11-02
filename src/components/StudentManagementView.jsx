import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Search,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Ban,
  CheckCircle2,
  FileText,
  Building,
  GraduationCap,
  Mail,
  MoreVertical,
  X,
  RotateCcw,
  UserCheck,
  UserX,
  Home,
  Hash,
  AlertCircle
} from 'lucide-react';

export default function StudentManagementView() {
  const { adminUsers, fetchAdminUsers, setUserStatus } = useApp();

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'warned' | 'blocked'

  // Modal states for Warn / Block / Unblock actions
  const [selectedStudentForAction, setSelectedStudentForAction] = useState(null);
  const [actionType, setActionType] = useState(null); // 'warn' | 'block' | 'unblock'
  const [actionReason, setActionReason] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [actionMenuOpenId, setActionMenuOpenId] = useState(null);

  // ─── Fetch on Mount ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetchAdminUsers({ role: 'student' });
  }, [fetchAdminUsers]);

  // Extract student list (fallback to empty array)
  const students = useMemo(() => {
    if (!adminUsers) return [];
    return adminUsers.filter(u => u.role === 'student');
  }, [adminUsers]);

  // Tab counts
  const countAll = students.length;
  const countActive = useMemo(() => students.filter(s => s.status === 'active').length, [students]);
  const countWarned = useMemo(() => students.filter(s => s.status === 'warned').length, [students]);
  const countBlocked = useMemo(() => students.filter(s => s.status === 'blocked').length, [students]);

  // Filtered students list
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      if (statusFilter !== 'all' && student.status !== statusFilter) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = student.name?.toLowerCase().includes(q);
        const matchesEmail = (student.college_email || student.email)?.toLowerCase().includes(q);
        const matchesEnroll = student.enrollment_no?.toLowerCase().includes(q);
        const matchesDept = student.department?.toLowerCase().includes(q);
        const matchesHostel = student.hostel?.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesEnroll && !matchesDept && !matchesHostel) {
          return false;
        }
      }

      return true;
    });
  }, [students, statusFilter, searchQuery]);

  // Helper to extract initials
  const getInitials = (name) => {
    if (!name || !name.trim()) return 'ST';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Open action modal
  const openActionModal = (student, type) => {
    if (student.role === 'admin') return;

    setSelectedStudentForAction(student);
    setActionType(type);
    setActionReason('');
    setActionMenuOpenId(null);
  };

  const closeActionModal = () => {
    setSelectedStudentForAction(null);
    setActionType(null);
    setActionReason('');
    setIsProcessingAction(false);
  };

  // Preset reasons for quick selection
  const presetReasons = {
    warn: [
      'Lodging duplicate or spam complaints repeatedly',
      'Inappropriate language used in complaint description or comments',
      'Unsubstantiated claims against campus authorities',
      'Misuse of anonymous grievance tokens'
    ],
    block: [
      'Serious violation of MITS institute code of conduct',
      'Malicious abuse of grievance portal after formal warning',
      'Identity fraud or submitting false official documentation',
      'Harassment of students, staff, or faculty members'
    ]
  };

  // Execute status change
  const handleConfirmAction = async () => {
    if (!selectedStudentForAction || !actionType) return;

    const targetStatus = actionType === 'warn' ? 'warned' : actionType === 'block' ? 'blocked' : 'active';
    const finalReason = actionReason.trim() || (
      actionType === 'unblock'
        ? 'Account access restored by administrator'
        : `${actionType.toUpperCase()} status applied by proctorial board`
    );

    setIsProcessingAction(true);
    try {
      await setUserStatus(selectedStudentForAction.id, targetStatus, finalReason);
      await fetchAdminUsers({ role: 'student' });
      closeActionModal();
    } finally {
      setIsProcessingAction(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 space-y-6">
      
      {/* ─── Manga-Inspired Header Banner ─────────────────────────────────── */}
      <div className="bg-[#0b1424] rounded-2xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute inset-0 manga-halftone opacity-20 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-black uppercase tracking-widest bg-amber-950/80 text-amber-300 border border-amber-700/60 shadow-xs">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                MITS // DISCIPLINARY MANAGEMENT
              </span>
              <span className="text-xs text-slate-400">
                Central Proctorial Oversight
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white uppercase">
              Student Accounts & Disciplinary Control
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Monitor student engagement, track submitted complaints, and enforce disciplinary actions (Warn / Block / Unblock) with transparent reason logging.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => fetchAdminUsers({ role: 'student' })}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#080e1a] hover:bg-slate-800 text-blue-300 text-xs font-black uppercase tracking-wider border border-slate-700 transition-all cursor-pointer shadow-xs"
              title="Refresh students list"
            >
              <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
              <span>Refresh Roster</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Search Bar & Filter Tabs ──────────────────────────────────────── */}
      <div className="bg-[#0b1424] rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-lg space-y-4">
        
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search students by name, email, enrollment number (0901MC...), or branch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-3 bg-[#080e1a] border border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-xs text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {/* All */}
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 border ${
                statusFilter === 'all'
                  ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30'
                  : 'bg-[#080e1a] text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
              }`}
            >
              <span>All Students</span>
              <span className="px-1.5 py-0.2 rounded font-mono text-[10px] bg-white/20 text-white">
                {countAll}
              </span>
            </button>

            {/* Active */}
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 border ${
                statusFilter === 'active'
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-600/30'
                  : 'bg-[#080e1a] text-emerald-400 border-slate-800 hover:border-emerald-700/60'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Active</span>
              <span className="px-1.5 py-0.2 rounded font-mono text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                {countActive}
              </span>
            </button>

            {/* Warned */}
            <button
              onClick={() => setStatusFilter('warned')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 border ${
                statusFilter === 'warned'
                  ? 'bg-amber-600 text-white border-amber-400 shadow-md shadow-amber-600/30'
                  : 'bg-[#080e1a] text-amber-400 border-slate-800 hover:border-amber-700/60'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Warned</span>
              <span className="px-1.5 py-0.2 rounded font-mono text-[10px] bg-amber-950 text-amber-300 border border-amber-800">
                {countWarned}
              </span>
            </button>

            {/* Blocked */}
            <button
              onClick={() => setStatusFilter('blocked')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 border ${
                statusFilter === 'blocked'
                  ? 'bg-rose-600 text-white border-rose-400 shadow-md shadow-rose-600/30'
                  : 'bg-[#080e1a] text-rose-400 border-slate-800 hover:border-rose-700/60'
              }`}
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Blocked</span>
              <span className="px-1.5 py-0.2 rounded font-mono text-[10px] bg-rose-950 text-rose-300 border border-rose-800">
                {countBlocked}
              </span>
            </button>
          </div>

          <span className="text-xs font-mono text-slate-500">
            Showing {filteredStudents.length} of {countAll} accounts
          </span>
        </div>

      </div>

      {/* ─── Student Cards Grid ────────────────────────────────────────────── */}
      <div className="space-y-4">
        
        {filteredStudents.length === 0 ? (
          <div className="bg-[#0b1424] rounded-2xl border border-slate-800 p-12 text-center space-y-3 shadow-xl">
            <Users className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-black uppercase tracking-wider text-white">No student records found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              {searchQuery ? `No students match "${searchQuery}". Clear your search query.` : 'No student accounts currently match this disciplinary filter.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map(student => {
              const isBlocked = student.status === 'blocked';
              const isWarned = student.status === 'warned';
              const isActive = student.status === 'active';

              const cardBorderClass = isBlocked
                ? 'border border-rose-700/70 bg-[#0b1424] shadow-rose-950/20'
                : isWarned
                ? 'border border-amber-600/70 bg-[#0b1424] shadow-amber-950/20'
                : 'border border-slate-800 bg-[#0b1424] hover:border-slate-700';

              const statusBadgeConfig = {
                active: {
                  badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
                  dot: 'bg-emerald-400',
                  label: 'Active'
                },
                warned: {
                  badge: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
                  dot: 'bg-amber-400',
                  label: 'Warned'
                },
                blocked: {
                  badge: 'bg-rose-950/80 text-rose-300 border-rose-700/60',
                  dot: 'bg-rose-400',
                  label: 'Blocked'
                }
              };

              const currentBadge = statusBadgeConfig[student.status] || statusBadgeConfig.active;

              return (
                <div
                  key={student.id}
                  className={`rounded-2xl p-4 sm:p-5 transition-all flex flex-col justify-between space-y-4 shadow-lg ${cardBorderClass}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {student.avatar ? (
                          <img
                            src={student.avatar}
                            alt={student.name}
                            className="w-11 h-11 rounded-xl object-cover border border-slate-700 shrink-0"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black shrink-0 border ${
                            isBlocked
                              ? 'bg-rose-950 text-rose-300 border-rose-800'
                              : isWarned
                              ? 'bg-amber-950 text-amber-300 border-amber-800'
                              : 'bg-blue-950 text-blue-300 border-blue-800'
                          }`}>
                            {getInitials(student.name)}
                          </div>
                        )}

                        <div className="min-w-0">
                          <h3 className="text-sm sm:text-base font-extrabold text-white truncate">
                            {student.name}
                          </h3>
                          <p className="text-xs text-slate-400 truncate flex items-center gap-1 font-mono">
                            <Mail className="w-3 h-3 text-slate-500" />
                            <span>{student.college_email || student.email}</span>
                          </p>
                        </div>
                      </div>

                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border shrink-0 ${currentBadge.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${currentBadge.dot}`}></span>
                        <span>{currentBadge.label}</span>
                      </span>
                    </div>

                    {/* Student Metadata Box */}
                    <div className="p-3 rounded-xl bg-[#080e1a] border border-slate-800 space-y-2 text-xs">
                      {/* Enrollment Number */}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 flex items-center gap-1 text-[11px] font-mono">
                          <Hash className="w-3 h-3" /> Enrollment:
                        </span>
                        <span className="font-mono font-bold text-blue-300 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800 text-[11px]">
                          {student.enrollment_no || 'Pending ID'}
                        </span>
                      </div>

                      {/* Department */}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                          <GraduationCap className="w-3 h-3" /> Branch:
                        </span>
                        <span className="font-semibold text-slate-300 truncate max-w-[170px]">
                          {student.department || 'General Engineering'}
                        </span>
                      </div>

                      {/* Hostel */}
                      {student.hostel && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                            <Home className="w-3 h-3" /> Hostel:
                          </span>
                          <span className="font-semibold text-slate-300 text-right truncate max-w-[170px]">
                            {student.hostel} {student.room_no ? `(Rm ${student.room_no})` : ''}
                          </span>
                        </div>
                      )}

                      {/* Grievance Count */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                        <span className="text-slate-400 font-medium text-[11px] flex items-center gap-1">
                          <FileText className="w-3 h-3 text-slate-500" /> Filed Complaints:
                        </span>
                        <span className="font-mono font-bold text-white bg-[#0b1424] px-2 py-0.5 rounded border border-slate-700 text-[11px]">
                          {student.grievance_count || 0} Grievance{(student.grievance_count !== 1) ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Menu Bar */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-500 tracking-wider">
                      Actions:
                    </span>

                    <div className="flex items-center gap-1.5">
                      {isActive && (
                        <>
                          <button
                            type="button"
                            onClick={() => openActionModal(student, 'warn')}
                            className="px-2.5 py-1 rounded-lg bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-700/60 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1"
                            title="Issue official warning"
                          >
                            <AlertTriangle className="w-3 h-3" />
                            <span>Warn</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openActionModal(student, 'block')}
                            className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-700/60 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1"
                            title="Block student portal access"
                          >
                            <Ban className="w-3 h-3" />
                            <span>Block</span>
                          </button>
                        </>
                      )}

                      {isWarned && (
                        <>
                          <button
                            type="button"
                            onClick={() => openActionModal(student, 'unblock')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1"
                            title="Clear warning"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Clear</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openActionModal(student, 'block')}
                            className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-700/60 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1"
                            title="Escalate disciplinary action"
                          >
                            <Ban className="w-3 h-3" />
                            <span>Block</span>
                          </button>
                        </>
                      )}

                      {isBlocked && (
                        <button
                          type="button"
                          onClick={() => openActionModal(student, 'unblock')}
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                          title="Restore student account access"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Unblock</span>
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ─── Reason Input Modal (for Warn / Block / Unblock) ────────────────── */}
      {selectedStudentForAction && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div
            className="bg-[#0b1424] rounded-3xl shadow-2xl border border-slate-800 w-full max-w-lg overflow-hidden animate-in zoom-in-95 space-y-4 p-5 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  actionType === 'block'
                    ? 'bg-rose-950 text-rose-300 border-rose-800'
                    : actionType === 'warn'
                    ? 'bg-amber-950 text-amber-300 border-amber-800'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                }`}>
                  {actionType === 'block' && <Ban className="w-5 h-5" />}
                  {actionType === 'warn' && <AlertTriangle className="w-5 h-5" />}
                  {actionType === 'unblock' && <UserCheck className="w-5 h-5" />}
                </div>

                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wider">
                    {actionType === 'block' && 'Block Student Account'}
                    {actionType === 'warn' && 'Issue Disciplinary Warning'}
                    {actionType === 'unblock' && 'Confirm Account Restoration'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {actionType === 'block' && 'Revokes login & complaint filing privileges'}
                    {actionType === 'warn' && 'Marks record with formal behavioral notice'}
                    {actionType === 'unblock' && 'Restores full student portal access'}
                  </p>
                </div>
              </div>

              <button
                onClick={closeActionModal}
                className="p-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student Summary Card */}
            <div className="p-3 rounded-xl bg-[#080e1a] border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-white">{selectedStudentForAction.name}</p>
                <p className="text-slate-400 text-[11px] font-mono">{selectedStudentForAction.college_email || selectedStudentForAction.email}</p>
              </div>
              <div className="text-right">
                <span className="font-mono text-[10px] font-bold text-blue-300 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800">
                  {selectedStudentForAction.enrollment_no}
                </span>
                <p className="text-[10px] text-slate-500 mt-0.5 capitalize">Status: {selectedStudentForAction.status}</p>
              </div>
            </div>

            {/* Unblock Confirmation Dialog Content */}
            {actionType === 'unblock' ? (
              <div className="space-y-3 py-2 text-xs text-slate-300">
                <p className="leading-relaxed">
                  Are you sure you want to restore <strong>{selectedStudentForAction.name}</strong> to <span className="font-bold text-emerald-400">Active</span> status?
                </p>
                <p className="text-slate-400 text-[11px]">
                  The student will be permitted to log in with their college credentials and file campus grievances again.
                </p>
              </div>
            ) : (
              /* Warn / Block Reason Form */
              <div className="space-y-3">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
                  Select or Enter Disciplinary Reason <span className="text-rose-400">*</span>
                </label>

                {/* Quick Presets */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-500 block">
                    Quick Preset Reasons:
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {presetReasons[actionType]?.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActionReason(preset)}
                        className={`text-left text-xs p-2 rounded-xl border transition-all cursor-pointer ${
                          actionReason === preset
                            ? 'bg-blue-950/80 border-blue-500 text-blue-200 font-bold'
                            : 'bg-[#080e1a] border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        • {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Reason Textarea */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-500 block">
                    Custom Formal Reason / Notes:
                  </span>
                  <textarea
                    rows={3}
                    placeholder="Provide specific incident details, report reference, or warning note..."
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    className="w-full p-2.5 bg-[#080e1a] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 resize-none"
                  />
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeActionModal}
                disabled={isProcessingAction}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={isProcessingAction}
                className={`px-5 py-2 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center gap-1.5 ${
                  actionType === 'block'
                    ? 'bg-rose-600 hover:bg-rose-500'
                    : actionType === 'warn'
                    ? 'bg-amber-600 hover:bg-amber-500'
                    : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                {isProcessingAction ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating Status...</span>
                  </>
                ) : (
                  <>
                    {actionType === 'block' && <Ban className="w-3.5 h-3.5" />}
                    {actionType === 'warn' && <AlertTriangle className="w-3.5 h-3.5" />}
                    {actionType === 'unblock' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>
                      {actionType === 'block' && 'Confirm & Block Student'}
                      {actionType === 'warn' && 'Confirm & Issue Warning'}
                      {actionType === 'unblock' && 'Confirm & Restore Active'}
                    </span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
