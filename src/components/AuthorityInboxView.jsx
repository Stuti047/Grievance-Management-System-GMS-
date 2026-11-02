import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { STATUS_META, COMPLAINT_STATUSES, getNextValidStatuses, ACTIVE_STATUSES } from '../utils/fsm';
import {
  Building2,
  ShieldCheck,
  Users,
  Clock,
  Lock,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Search,
  Filter,
  RefreshCw,
  Send,
  MessageSquare,
  AlertTriangle,
  FileText,
  ChevronRight,
  X,
  ExternalLink,
  Sparkles,
  Check,
  Tag,
  MapPin,
  Calendar
} from 'lucide-react';

/**
 * Format date string into relative time e.g. "2 days ago", "just now"
 */
function formatRelativeTime(dateString) {
  if (!dateString) return 'recently';
  const now = new Date();
  const past = new Date(dateString);
  const diffSec = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (isNaN(diffSec) || diffSec < 0) return 'just now';
  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 30) return `${diffDays} days ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return '1 month ago';
  if (diffMonths < 12) return `${diffMonths} months ago`;
  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears}y ago`;
}

/**
 * Format section label into user-friendly badge
 */
function formatSectionBadge(section) {
  switch (section?.toLowerCase()) {
    case 'hostel':
      return { label: 'Hostel', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'mess':
      return { label: 'Mess & Food', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'college':
    default:
      return { label: 'College', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
  }
}

export default function AuthorityInboxView() {
  const {
    currentUser,
    grievanceList,
    fetchGrievances,
    openGrievanceDetail,
    updateStatus,
    addComment,
    addInternalNote,
    loading
  } = useApp();

  // Active filter tab: 'all' | 'active' | 'escalated' | 'resolved'
  const [activeTab, setActiveTab] = useState('active');

  // Search and dropdown status filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Quick Action State
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [statusModalGrievance, setStatusModalGrievance] = useState(null);
  const [targetStatus, setTargetStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Quick Response Modal State
  const [responseModalGrievance, setResponseModalGrievance] = useState(null);
  const [responseBody, setResponseBody] = useState('');
  const [responseType, setResponseType] = useState('public'); // 'public' | 'internal'
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);

  const dropdownRef = useRef(null);

  // On mount: fetch grievances (API layer automatically scopes to authority's sub_authority_id)
  useEffect(() => {
    fetchGrievances();
  }, [fetchGrievances]);

  // Close dropdown on outside click or escape key
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdownId(null);
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setOpenDropdownId(null);
        setStatusModalGrievance(null);
        setResponseModalGrievance(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Compute metrics for the authority
  const activeCount = useMemo(() => {
    return grievanceList.filter(g =>
      ACTIVE_STATUSES.includes(g.status) ||
      (!['Resolved', 'Closed', 'Rejected'].includes(g.status))
    ).length;
  }, [grievanceList]);

  const escalatedCount = useMemo(() => {
    return grievanceList.filter(g => g.status === COMPLAINT_STATUSES.ESCALATED).length;
  }, [grievanceList]);

  const resolvedCount = useMemo(() => {
    return grievanceList.filter(g =>
      g.status === COMPLAINT_STATUSES.RESOLVED || g.status === COMPLAINT_STATUSES.CLOSED
    ).length;
  }, [grievanceList]);

  // Tab & search filtering
  const filteredGrievances = useMemo(() => {
    return grievanceList.filter(grievance => {
      // 1. Tab filtering
      if (activeTab === 'active') {
        const isActive =
          ACTIVE_STATUSES.includes(grievance.status) ||
          (!['Resolved', 'Closed', 'Rejected'].includes(grievance.status));
        if (!isActive) return false;
      } else if (activeTab === 'escalated') {
        if (grievance.status !== COMPLAINT_STATUSES.ESCALATED) return false;
      } else if (activeTab === 'resolved') {
        if (
          grievance.status !== COMPLAINT_STATUSES.RESOLVED &&
          grievance.status !== COMPLAINT_STATUSES.CLOSED
        ) {
          return false;
        }
      }

      // 2. Dropdown status filter
      if (statusFilter !== 'All' && grievance.status !== statusFilter) {
        return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = grievance.title?.toLowerCase().includes(q);
        const matchesCode = grievance.grievance_code?.toLowerCase().includes(q);
        const matchesDesc = grievance.description?.toLowerCase().includes(q);
        const matchesCategory = grievance.category_name?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCode && !matchesDesc && !matchesCategory) {
          return false;
        }
      }

      return true;
    });
  }, [grievanceList, activeTab, statusFilter, searchQuery]);

  // Authority department display name
  const authorityDepartment = useMemo(() => {
    return (
      currentUser?.department ||
      grievanceList[0]?.sub_authority_name ||
      'Department Authority Cell'
    );
  }, [currentUser, grievanceList]);

  // Handle status update submission
  const handleConfirmStatusChange = async (e) => {
    e.preventDefault();
    if (!statusModalGrievance || !targetStatus) return;

    setIsUpdatingStatus(true);
    const success = await updateStatus(statusModalGrievance.id, targetStatus, statusNote.trim());
    setIsUpdatingStatus(false);

    if (success) {
      setStatusModalGrievance(null);
      setTargetStatus('');
      setStatusNote('');
      setOpenDropdownId(null);
    }
  };

  // Handle quick response submission
  const handleConfirmResponse = async (e) => {
    e.preventDefault();
    if (!responseModalGrievance || !responseBody.trim()) return;

    setIsSubmittingResponse(true);
    let success = false;
    if (responseType === 'internal') {
      success = await addInternalNote(responseModalGrievance.id, responseBody.trim());
    } else {
      success = await addComment(responseModalGrievance.id, responseBody.trim(), false);
    }
    setIsSubmittingResponse(false);

    if (success) {
      setResponseModalGrievance(null);
      setResponseBody('');
      setOpenDropdownId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 space-y-6">
      
      {/* ─────────────────────────────────────────────────────────────
          1. TOP BANNER: Authority Scoped Information
          ───────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white shadow-xl border border-indigo-800/40 p-6 sm:p-8">
        {/* Glow ambient background elements */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-300" />
                DEPARTMENT AUTHORITY INBOX
              </span>
              <span className="text-xs text-indigo-200/80 font-medium">
                MITS-DU Governance & SLA Portal
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>{currentUser?.name || 'Authority Officer'}</span>
            </h1>

            <div className="flex flex-wrap items-center gap-2 text-xs text-indigo-100/90 pt-0.5">
              <div className="flex items-center gap-1.5 font-semibold text-white">
                <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>{authorityDepartment}</span>
              </div>
              {currentUser?.designation && (
                <>
                  <span className="text-indigo-400">•</span>
                  <span className="text-indigo-200 font-medium">
                    {currentUser.designation}
                  </span>
                </>
              )}
            </div>

            <p className="text-xs sm:text-sm text-indigo-200/75 leading-relaxed pt-1">
              Grievances are automatically scoped to your department. Manage assigned student issues,
              advance the finite-state machine (FSM), and post official or internal resolution updates.
            </p>
          </div>

          {/* Quick Metrics & Refresh */}
          <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 bg-white/5 p-4 sm:p-5 rounded-2xl border border-white/10 backdrop-blur-xs shrink-0">
            <div className="text-left md:text-right">
              <p className="text-[11px] font-semibold text-indigo-200 uppercase tracking-wider">
                Active Pending Action
              </p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl sm:text-4xl font-black text-amber-300 font-mono">
                  {activeCount}
                </span>
                <span className="text-xs text-indigo-200 font-medium">
                  grievance{activeCount === 1 ? '' : 's'}
                </span>
              </div>
            </div>

            <button
              onClick={() => fetchGrievances()}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 hover:scale-[1.02] cursor-pointer"
              title="Refresh inbox data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Refreshing...' : 'Refresh Feed'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. TAB BAR: All | Active | Escalated | Resolved
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#0b1424] rounded-xl border border-slate-800 shadow-xs p-1.5 flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
            activeTab === 'active'
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border-transparent'
          }`}
        >
          <span>Active</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'active'
                ? 'bg-indigo-700 text-white'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}
          >
            {activeCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('escalated')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
            activeTab === 'escalated'
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border-transparent'
          }`}
        >
          <span>Escalated</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'escalated'
                ? 'bg-indigo-700 text-white'
                : escalatedCount > 0
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {escalatedCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('resolved')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
            activeTab === 'resolved'
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border-transparent'
          }`}
        >
          <span>Resolved</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'resolved'
                ? 'bg-indigo-700 text-white'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            {resolvedCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
            activeTab === 'all'
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border-transparent'
          }`}
        >
          <span>All Grievances</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'all'
                ? 'bg-indigo-700 text-white'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {grievanceList.length}
          </span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. FILTER BAR: Search by title & Filter by status
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#0b1424] p-3.5 sm:p-4 rounded-xl border border-slate-800 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by title, code (GRV-...), or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-[#080f1c] border border-slate-700 rounded-lg text-xs sm:text-sm text-white placeholder-slate-500 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown status selector */}
        <div className="flex items-center gap-2">
          <div className="relative shrink-0">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto appearance-none pl-3 pr-8 py-2 bg-[#080f1c] border border-slate-700 rounded-lg text-xs font-semibold text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="All">All Specific Statuses</option>
              {Object.values(COMPLAINT_STATUSES).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>

          {(searchQuery || statusFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('All');
              }}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 px-2 py-2 cursor-pointer shrink-0"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. GRIEVANCE CARDS LIST
          ───────────────────────────────────────────────────────────── */}
      <div className="space-y-3.5">
        {loading && grievanceList.length === 0 ? (
          <div className="bg-[#0b1424] rounded-xl border border-slate-800 p-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-medium">Loading scoped department grievances...</p>
          </div>
        ) : filteredGrievances.length === 0 ? (
          /* ─────────────────────────────────────────────────────────────
              5. EMPTY STATES FOR EACH TAB
              ───────────────────────────────────────────────────────────── */
          <div className="bg-[#0b1424] rounded-xl border border-slate-800 p-12 text-center space-y-3 shadow-xs">
            {activeTab === 'active' && (
              <>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  No Active Grievances Pending Action
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  All grievances assigned to {authorityDepartment} have been addressed or resolved. Great work maintaining institutional turnaround!
                </p>
              </>
            )}

            {activeTab === 'escalated' && (
              <>
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Zero Escalated Grievances
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  There are no escalated complaints in your department scope. SLA response times are well within compliance thresholds.
                </p>
              </>
            )}

            {activeTab === 'resolved' && (
              <>
                <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  No Resolved Grievances Yet
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Completed complaints that reach 'Resolved' or 'Closed' will be archived in this view.
                </p>
              </>
            )}

            {activeTab === 'all' && (
              <>
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  No Grievances Found
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {searchQuery || statusFilter !== 'All'
                    ? 'No grievances match your search query or status filter. Try clearing filters.'
                    : `No grievances have been registered under ${authorityDepartment}.`}
                </p>
              </>
            )}
          </div>
        ) : (
          filteredGrievances.map((grievance) => {
            const statusConfig = STATUS_META[grievance.status] || STATUS_META[COMPLAINT_STATUSES.SUBMITTED];
            const sectionConfig = formatSectionBadge(grievance.category_section);
            const validNextStatuses = getNextValidStatuses(grievance.status);
            const isDropdownOpen = openDropdownId === grievance.id;

            return (
              <div
                key={grievance.id}
                onClick={() => openGrievanceDetail(grievance.id)}
                className="bg-[#0b1424] hover:bg-[#0e1a30] rounded-xl border border-slate-800 hover:border-indigo-500/50 p-4 sm:p-5 shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer group relative"
              >
                {/* Left Section: Details */}
                <div className="flex-1 min-w-0 space-y-2">
                  {/* Top line badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Grievance code in monospace */}
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50/90 px-2.5 py-0.5 rounded-lg border border-indigo-200/80">
                      {grievance.grievance_code}
                    </span>

                    {/* Category badge */}
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      <Tag className="w-3 h-3 text-slate-400" />
                      <span>{grievance.category_name}</span>
                    </span>

                    {/* Section badge */}
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${sectionConfig.bg}`}
                    >
                      {sectionConfig.label}
                    </span>

                    {/* Status badge per STATUS_META */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusConfig.badge}`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>

                  {/* Title (truncated) */}
                  <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {grievance.title}
                  </h3>

                  {/* Description snippet */}
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {grievance.description}
                  </p>

                  {/* Bottom Meta Bar: Anonymity, Supports, Location, Relative Time */}
                  <div className="flex flex-wrap items-center gap-3.5 text-xs text-slate-400 pt-1">
                    {/* Anonymity / Author Info: NEVER show email/id if anonymous */}
                    {grievance.is_anonymous ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Anonymous Student</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 font-medium text-slate-300">
                        <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-[10px]">
                          {(grievance.author_name || 'S').charAt(0)}
                        </span>
                        <span>{grievance.author_name || 'Student'}</span>
                        {grievance.author_department && (
                          <span className="text-slate-500 text-[11px]">
                            • {grievance.author_department}
                          </span>
                        )}
                      </span>
                    )}

                    {/* Location */}
                    {grievance.location && (
                      <span className="inline-flex items-center gap-1 text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{grievance.location}</span>
                      </span>
                    )}

                    {/* Supports count with Users icon */}
                    <span className="inline-flex items-center gap-1.5 font-semibold text-slate-300">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{grievance.supports_count || 0} support{grievance.supports_count === 1 ? '' : 's'}</span>
                    </span>

                    {/* Relative time */}
                    <span className="inline-flex items-center gap-1 text-slate-500 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{formatRelativeTime(grievance.created_at)}</span>
                    </span>

                    {/* SLA alert indicator if active */}
                    {grievance.sla_hours && (
                      <span className="text-[11px] text-indigo-300 font-semibold bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 rounded">
                        SLA: {grievance.sla_hours}h
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Section: Actions & Dropdown Menu */}
                <div
                  className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800 justify-end shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* View Details Quick Button */}
                  <button
                    onClick={() => openGrievanceDetail(grievance.id)}
                    className="px-3 py-1.5 rounded-lg bg-[#0f1b33] hover:bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>View Details</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  {/* Quick-Action Dropdown Menu */}
                  <div className="relative">
                    <button
                      onClick={() =>
                        setOpenDropdownId(isDropdownOpen ? null : grievance.id)
                      }
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer border border-indigo-500/30"
                    >
                      <span>Quick Action</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${
                          isDropdownOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Dropdown Menu Panel */}
                    {isDropdownOpen && (
                      <div
                        ref={dropdownRef}
                        className="absolute right-0 mt-2 w-72 bg-[#0c1629] rounded-xl shadow-2xl border border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95"
                      >
                        <div className="px-3.5 py-1.5 border-b border-slate-800">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Authority Decision Actions
                          </p>
                          <p className="font-mono text-xs font-bold text-indigo-400">
                            {grievance.grievance_code}
                          </p>
                        </div>

                        {/* 1. Change Status options based on FSM */}
                        <div className="p-2 border-b border-slate-800">
                          <span className="block text-[11px] font-bold text-slate-300 px-1.5 mb-1.5">
                            Transition FSM Status:
                          </span>

                          {validNextStatuses.length === 0 ? (
                            <div className="p-2 bg-[#080f1c] rounded-lg text-[11px] text-slate-400 italic border border-slate-800">
                              Terminal state: No further transitions allowed.
                            </div>
                          ) : (
                            <div className="space-y-1">
                              {validNextStatuses.map((nextStatus) => {
                                const nextMeta = STATUS_META[nextStatus] || {};
                                return (
                                  <button
                                    key={nextStatus}
                                    onClick={() => {
                                      setStatusModalGrievance(grievance);
                                      setTargetStatus(nextStatus);
                                      setStatusNote('');
                                      setOpenDropdownId(null);
                                    }}
                                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-indigo-900/30 text-slate-200 flex items-center justify-between transition-colors cursor-pointer group/item"
                                  >
                                    <span className="flex items-center gap-2">
                                      <span
                                        className={`w-2 h-2 rounded-full ${nextMeta.dot || 'bg-indigo-500'}`}
                                      />
                                      <span>{nextStatus}</span>
                                    </span>
                                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover/item:text-indigo-400 transition-colors" />
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* 2. Add Response */}
                        <div className="p-2">
                          <button
                            onClick={() => {
                              setResponseModalGrievance(grievance);
                              setResponseBody('');
                              setResponseType('public');
                              setOpenDropdownId(null);
                            }}
                            className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-bold text-indigo-300 hover:bg-indigo-900/30 flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Add Official Response / Note</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MODAL 1: STATUS CHANGE CONFIRMATION (WITH FSM NOTE)
          ───────────────────────────────────────────────────────────── */}
      {statusModalGrievance && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div
            className="bg-[#0c1629] rounded-xl shadow-2xl border border-slate-700 w-full max-w-lg p-6 space-y-4 animate-in zoom-in-95 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 rounded uppercase">
                  FSM Status Transition
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  Move to &ldquo;{targetStatus}&rdquo;
                </h3>
                <p className="text-xs text-slate-400">
                  Ticket: <span className="font-mono font-bold text-indigo-300">{statusModalGrievance.grievance_code}</span>
                </p>
              </div>
              <button
                onClick={() => setStatusModalGrievance(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmStatusChange} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Action Audit Note (Appended to Immutable History)
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder={`Describe reason or field action taken for moving to ${targetStatus}...`}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-700 bg-[#080f1c] text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 resize-none placeholder-slate-500"
                />
              </div>

              <div className="p-3 rounded-lg bg-[#080f1c] border border-slate-800 text-xs text-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Current State:</span>
                  <span className="font-bold text-slate-200">{statusModalGrievance.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Target State:</span>
                  <span className="font-bold text-indigo-400">{targetStatus}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusModalGrievance(null)}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingStatus || !statusNote.trim()}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow-sm border border-indigo-500/30"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isUpdatingStatus ? 'Updating...' : 'Confirm Status Change'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 2: ADD OFFICIAL RESPONSE / INTERNAL NOTE
          ───────────────────────────────────────────────────────────── */}
      {responseModalGrievance && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div
            className="bg-[#0c1629] rounded-xl shadow-2xl border border-slate-700 w-full max-w-lg p-6 space-y-4 animate-in zoom-in-95 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 rounded uppercase">
                  Department Response
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  Post Update for {responseModalGrievance.grievance_code}
                </h3>
              </div>
              <button
                onClick={() => setResponseModalGrievance(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmResponse} className="space-y-4">
              {/* Note Visibility Selector */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setResponseType('public')}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                    responseType === 'public'
                      ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300 font-bold shadow-xs'
                      : 'border-slate-800 bg-[#080f1c] text-slate-400'
                  }`}
                >
                  <span className="block font-bold">Public Response</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    Visible to student & community
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setResponseType('internal')}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                    responseType === 'internal'
                      ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-bold shadow-xs'
                      : 'border-slate-800 bg-[#080f1c] text-slate-400'
                  }`}
                >
                  <span className="block font-bold">Internal Note</span>
                  <span className="text-[11px] text-amber-400/80 font-normal">
                    Hidden from student (authorities only)
                  </span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Message Body
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder={
                    responseType === 'internal'
                      ? 'Log contractor notices, inspection notes, or committee deliberations...'
                      : 'Enter official departmental update or instructions for the student...'
                  }
                  value={responseBody}
                  onChange={(e) => setResponseBody(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-700 bg-[#080f1c] text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 resize-none placeholder-slate-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setResponseModalGrievance(null)}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingResponse || !responseBody.trim()}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow-sm border border-indigo-500/30"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingResponse ? 'Posting...' : 'Post Response'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
