import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { STATUS_META, COMPLAINT_STATUSES } from '../utils/fsm';
import {
  Search,
  Filter,
  Flag,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ThumbsUp,
  Building,
  User,
  Lock,
  Unlock,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Eye,
  FileText,
  Layers,
  Sparkles,
  Inbox
} from 'lucide-react';

export default function AdminComplaintsView() {
  const {
    currentUser,
    grievanceList,
    fetchGrievances,
    openGrievanceDetail,
    adminFlags,
    fetchAdminFlags,
    resolveFlag,
    loading,
    categories
  } = useApp();

  // ─── Filter States ───────────────────────────────────────────────────────────
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');
  const [anonymousOnly, setAnonymousOnly] = useState(false);
  const [resolvingFlagId, setResolvingFlagId] = useState(null);

  // ─── Initial Fetch on Mount ──────────────────────────────────────────────────
  useEffect(() => {
    fetchGrievances();
    fetchAdminFlags();
  }, [fetchGrievances, fetchAdminFlags]);

  // ─── Filtered Grievance List ─────────────────────────────────────────────────
  const filteredGrievances = useMemo(() => {
    return grievanceList.filter(g => {
      if (g.is_deleted) return false;

      // Search filter
      if (searchText.trim()) {
        const q = searchText.toLowerCase().trim();
        const matchesCode = g.grievance_code?.toLowerCase().includes(q);
        const matchesTitle = g.title?.toLowerCase().includes(q);
        const matchesDesc = g.description?.toLowerCase().includes(q);
        const matchesAuthor = g.author_name?.toLowerCase().includes(q);
        const matchesLocation = g.location?.toLowerCase().includes(q);
        if (!matchesCode && !matchesTitle && !matchesDesc && !matchesAuthor && !matchesLocation) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'all') {
        if (g.category_id !== selectedCategory && g.category_name !== selectedCategory) {
          return false;
        }
      }

      // Status filter
      if (selectedStatus !== 'all') {
        if (g.status !== selectedStatus) {
          return false;
        }
      }

      // Section filter (hostel / mess / college)
      if (selectedSection !== 'all') {
        if (g.category_section?.toLowerCase() !== selectedSection.toLowerCase()) {
          return false;
        }
      }

      // Anonymous toggle
      if (anonymousOnly && !g.is_anonymous) {
        return false;
      }

      return true;
    });
  }, [grievanceList, searchText, selectedCategory, selectedStatus, selectedSection, anonymousOnly]);

  // ─── Summary Metrics ─────────────────────────────────────────────────────────
  const totalShown = filteredGrievances.length;
  const totalLoaded = grievanceList.length;
  const anonymousCount = useMemo(() => {
    return filteredGrievances.filter(g => g.is_anonymous).length;
  }, [filteredGrievances]);

  const flaggedGrievanceCount = useMemo(() => {
    return filteredGrievances.filter(g => (g.flags && g.flags.length > 0)).length;
  }, [filteredGrievances]);

  const unresolvedFlagsCount = adminFlags?.length || 0;

  // Handle flag resolution
  const handleResolveFlag = async (flagId, e) => {
    e.stopPropagation();
    try {
      setResolvingFlagId(flagId);
      await resolveFlag(flagId);
      await fetchAdminFlags();
      await fetchGrievances();
    } finally {
      setResolvingFlagId(null);
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchText('');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSelectedSection('all');
    setAnonymousOnly(false);
  };

  const hasActiveFilters = Boolean(
    searchText ||
    selectedCategory !== 'all' ||
    selectedStatus !== 'all' ||
    selectedSection !== 'all' ||
    anonymousOnly
  );

  // Format date helper
  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    try {
      return new Date(isoString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 space-y-6">
      
      {/* ─── Header Banner ─────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#0d2238] via-[#12304f] to-[#1e4570] rounded-2xl p-6 sm:p-7 text-white shadow-lg relative overflow-hidden border border-blue-900/40">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-300/30">
                <ShieldAlert className="w-3.5 h-3.5" />
                CENTRAL PROCTORIAL & ADMIN VIEW
              </span>
              <span className="text-xs text-blue-200">
                Full Grievance Audit & Content Governance
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white">
              Admin Grievance Operations & Moderation
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/80 mt-1 max-w-2xl leading-relaxed">
              Full unmasked student identity disclosure for institutional accountability, cross-department triage, and community flag resolution.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => { fetchGrievances(); fetchAdminFlags(); }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 backdrop-blur-xs transition-all hover:scale-102 active:scale-98 cursor-pointer"
              title="Reload all grievances and flags from database"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Records</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Top Summary KPI Bar ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Shown */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Grievances Listed
            </p>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">{totalShown}</span>
              <span className="text-xs text-slate-400">/ {totalLoaded} total</span>
            </div>
            <p className="text-[10px] text-blue-600 font-semibold mt-0.5">
              Across all MITS branches
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Anonymous Count */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Anonymous Submissions
            </p>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-amber-700">{anonymousCount}</span>
              <span className="text-xs text-slate-400">shielded</span>
            </div>
            <p className="text-[10px] text-amber-600 font-semibold mt-0.5 flex items-center gap-1">
              <Unlock className="w-3 h-3" /> Author visible to Admin
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
        </div>

        {/* Flagged Count */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Flagged in Feed
            </p>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-rose-700">{flaggedGrievanceCount}</span>
              <span className="text-xs text-slate-400">tickets</span>
            </div>
            <p className="text-[10px] text-rose-600 font-semibold mt-0.5">
              Reported by community
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Flag className="w-5 h-5" />
          </div>
        </div>

        {/* Moderation Queue */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Unresolved Flags
            </p>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className={`text-2xl sm:text-3xl font-black ${unresolvedFlagsCount > 0 ? 'text-rose-600 animate-pulse' : 'text-emerald-700'}`}>
                {unresolvedFlagsCount}
              </span>
              <span className="text-xs text-slate-400">in queue</span>
            </div>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
              {unresolvedFlagsCount > 0 ? 'Requires moderation' : 'Clean moderation queue'}
            </p>
          </div>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${unresolvedFlagsCount > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* ─── Top Filter Bar ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3.5">
        
        {/* Row 1: Search + Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          
          {/* Search Input (5 cols) */}
          <div className="lg:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by code (GRV-...), title, author name, or location..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
            {searchText && (
              <button
                onClick={() => setSearchText('')}
                className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Dropdown (3 cols) */}
          <div className="lg:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">All Categories ({categories?.length || 0})</option>
              {categories && categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.section})
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown (2 cols) */}
          <div className="lg:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              {Object.values(COMPLAINT_STATUSES).map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Section Selector (2 cols) */}
          <div className="lg:col-span-2">
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">All Sections</option>
              <option value="hostel">Hostels (BH & GH)</option>
              <option value="mess">Mess & Catering</option>
              <option value="college">Academic & Campus</option>
            </select>
          </div>

        </div>

        {/* Row 2: Secondary Filters & Anonymous Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-medium">Quick Filters:</span>

            {/* Section Quick Pills */}
            {['all', 'hostel', 'mess', 'college'].map(sec => (
              <button
                key={sec}
                type="button"
                onClick={() => setSelectedSection(sec)}
                className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-colors cursor-pointer ${
                  selectedSection === sec
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sec === 'all' ? 'All Sections' : sec}
              </button>
            ))}

            <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block"></div>

            {/* Anonymous Only Toggle */}
            <label className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer select-none transition-colors">
              <input
                type="checkbox"
                checked={anonymousOnly}
                onChange={(e) => setAnonymousOnly(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
              />
              <span className="font-bold text-slate-700 flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-600" />
                Anonymous Only ({grievanceList.filter(g => g.is_anonymous).length})
              </span>
            </label>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

      </div>

      {/* ─── Main Content Split: Left 65% List, Right 35% Flag Panel ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ── Left 65% (Grievance List Cards) ──────────────────────────────── */}
        <div className="lg:col-span-8 space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-700" />
              <span>Grievance Master List ({filteredGrievances.length})</span>
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              Click any card to inspect full timeline & FSM transitions
            </span>
          </div>

          {/* Loading Skeleton */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs animate-pulse space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                  <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredGrievances.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
              <Inbox className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-700">No grievances match the criteria</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No tickets found with the current search query or status filter. Try clearing filters to inspect all student submissions.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            /* Grievances List */
            filteredGrievances.map(grievance => {
              const meta = STATUS_META[grievance.status] || {
                label: grievance.status,
                badge: 'bg-slate-100 text-slate-700 border-slate-200',
                dot: 'bg-slate-400'
              };

              const hasFlags = grievance.flags && grievance.flags.length > 0;

              return (
                <div
                  key={grievance.id}
                  onClick={() => openGrievanceDetail(grievance.id)}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-md p-4 sm:p-5 transition-all cursor-pointer group space-y-3 relative overflow-hidden"
                >
                  {/* Flag Accent Stripe if Flagged */}
                  {hasFlags && (
                    <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-rose-500"></div>
                  )}

                  {/* Top Bar: Code, Category, Status, Flag Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Grievance Code */}
                      <span className="font-mono text-xs font-extrabold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                        {grievance.grievance_code}
                      </span>

                      {/* Category Badge */}
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {grievance.category_name}
                      </span>

                      {/* Section tag */}
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        • {grievance.category_section}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Flag Count Badge */}
                      {hasFlags && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>{grievance.flags.length} Flag{grievance.flags.length > 1 ? 's' : ''}</span>
                        </span>
                      )}

                      {/* Status Badge */}
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${meta.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`}></span>
                        <span>{meta.label}</span>
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                      {grievance.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {grievance.description}
                    </p>
                  </div>

                  {/* Admin Reveal Box: Author Details (Full Name Shown Since Admin) */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <span className="font-bold text-slate-800">{grievance.author_name}</span>
                        {grievance.is_anonymous ? (
                          <span className="ml-1.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            Anonymous (Identity Unmasked for Admin)
                          </span>
                        ) : (
                          grievance.author_email && (
                            <span className="ml-1.5 text-[11px] text-slate-400 hidden sm:inline">
                              ({grievance.author_email})
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 font-medium">
                      Location: <strong className="text-slate-700">{grievance.location || 'Campus'}</strong>
                    </div>
                  </div>

                  {/* Bottom Metadata & Supports */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-slate-500 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDate(grievance.created_at)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-bold text-blue-700">
                        <ThumbsUp className="w-3 h-3" />
                        {grievance.supports_count || 0} student endorsements
                      </span>
                      {grievance.sla_hours && (
                        <>
                          <span>•</span>
                          <span>SLA: <strong>{grievance.sla_hours} hrs</strong></span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-blue-700 font-bold group-hover:translate-x-0.5 transition-transform">
                      <span>Review Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Right 35% (Flag Review Panel) ─────────────────────────────────── */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 sticky top-20">
            
            {/* Panel Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  <Flag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Flag Review Queue
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Community content moderation
                  </p>
                </div>
              </div>

              <span className={`px-2 py-0.5 rounded-full text-xs font-black border ${
                adminFlags?.length > 0
                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}>
                {adminFlags?.length || 0} Open
              </span>
            </div>

            {/* Subtitle / Policy note */}
            <p className="text-xs text-slate-600 leading-relaxed bg-amber-50/60 p-3 rounded-xl border border-amber-200">
              Students & staff can flag grievances containing offensive language, duplicate spam, or private personal data. Review the report and click <strong>Resolve</strong> once addressed.
            </p>

            {/* List of Unresolved Flags */}
            <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
              {!adminFlags || adminFlags.length === 0 ? (
                /* Zero Backlog Empty State */
                <div className="p-8 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <h4 className="text-xs font-bold text-slate-800">No Pending Flags</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    All flagged complaints have been cleared. Zero moderation backlog across campus.
                  </p>
                </div>
              ) : (
                adminFlags.map(flag => (
                  <div
                    key={flag.id}
                    className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/30 hover:bg-rose-50/70 transition-all space-y-2.5"
                  >
                    {/* Header: Grievance Reference */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-block">
                          {flag.grievance_code || 'Grievance'}
                        </span>
                        <h4
                          onClick={() => flag.grievance_id && openGrievanceDetail(flag.grievance_id)}
                          className="text-xs font-bold text-slate-900 mt-1 hover:text-blue-700 transition-colors cursor-pointer line-clamp-1"
                          title="Open flagged grievance details"
                        >
                          {flag.grievance_title || 'Untitled grievance'}
                        </h4>
                      </div>

                      <button
                        onClick={() => flag.grievance_id && openGrievanceDetail(flag.grievance_id)}
                        className="text-slate-400 hover:text-blue-700 p-1 cursor-pointer"
                        title="View Grievance"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Reported Reason Box */}
                    <div className="p-2.5 rounded-lg bg-white border border-rose-200/80 text-xs">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-rose-700 mb-0.5 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        Report Reason
                      </p>
                      <p className="text-slate-800 leading-relaxed font-medium">
                        "{flag.reason}"
                      </p>
                    </div>

                    {/* Flagger Info & Action */}
                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                      <div>
                        <span>Flagger: </span>
                        <strong className="text-slate-700">{flag.flagged_by_name || 'Campus Student'}</strong>
                      </div>

                      <button
                        onClick={(e) => handleResolveFlag(flag.id, e)}
                        disabled={resolvingFlagId === flag.id}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all hover:scale-102 active:scale-98 disabled:opacity-50 cursor-pointer flex items-center gap-1"
                      >
                        {resolvingFlagId === flag.id ? (
                          <>
                            <RotateCcw className="w-3 h-3 animate-spin" />
                            <span>Resolving...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Resolve</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Panel Footer */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>MITS Anti-Abuse System</span>
              <span className="font-semibold text-slate-600">Admin Clearance Level</span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
