import React, { useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { STATUS_META, COMPLAINT_STATUSES } from '../utils/fsm';
import {
  ShieldAlert,
  Users,
  UserPlus,
  BarChart3,
  TrendingUp,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ChevronRight,
  ShieldCheck,
  Building2,
  RefreshCw,
  ExternalLink,
  Lock,
  UserCheck,
  UserX,
  Activity,
  Tag,
  Sparkles,
  Layers,
  Award
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

export default function AdminDashboardView() {
  const {
    currentUser,
    analyticsData,
    fetchAnalytics,
    grievanceList,
    fetchGrievances,
    adminFlags,
    fetchAdminFlags,
    adminUsers,
    fetchAdminUsers,
    setActiveTab,
    openGrievanceDetail,
    resolveFlag
  } = useApp();

  // On mount: call fetch functions
  useEffect(() => {
    fetchAnalytics();
    fetchGrievances();
    fetchAdminFlags();
    fetchAdminUsers();
  }, [fetchAnalytics, fetchGrievances, fetchAdminFlags, fetchAdminUsers]);

  // Top stats calculations
  const totalGrievances = useMemo(() => {
    return analyticsData?.total ?? grievanceList.length;
  }, [analyticsData, grievanceList]);

  const activeGrievances = useMemo(() => {
    if (analyticsData?.active !== undefined) return analyticsData.active;
    return grievanceList.filter(
      (g) => !['Resolved', 'Closed', 'Rejected'].includes(g.status)
    ).length;
  }, [analyticsData, grievanceList]);

  const resolvedGrievances = useMemo(() => {
    if (analyticsData?.resolved !== undefined) return analyticsData.resolved;
    return grievanceList.filter(
      (g) => g.status === 'Resolved' || g.status === 'Closed'
    ).length;
  }, [analyticsData, grievanceList]);

  const unresolvedFlags = useMemo(() => {
    return (adminFlags || []).filter((f) => !f.resolved);
  }, [adminFlags]);

  const unresolvedFlagsCount = useMemo(() => {
    return analyticsData?.flags ?? unresolvedFlags.length;
  }, [analyticsData, unresolvedFlags]);

  const topFlags = useMemo(() => {
    return unresolvedFlags.slice(0, 3);
  }, [unresolvedFlags]);

  const recentGrievances = useMemo(() => {
    return (grievanceList || []).slice(0, 5);
  }, [grievanceList]);

  // User status breakdown
  const userStats = useMemo(() => {
    const total = adminUsers?.length || 0;
    const active = adminUsers?.filter((u) => u.status === 'active').length || 0;
    const warned = adminUsers?.filter((u) => u.status === 'warned').length || 0;
    const blocked = adminUsers?.filter((u) => u.status === 'blocked').length || 0;

    const students = adminUsers?.filter((u) => u.role === 'student').length || 0;
    const authorities = adminUsers?.filter((u) => u.role === 'authority').length || 0;
    const admins = adminUsers?.filter((u) => u.role === 'admin').length || 0;

    const activePct = total > 0 ? Math.round((active / total) * 100) : 0;
    const warnedPct = total > 0 ? Math.round((warned / total) * 100) : 0;
    const blockedPct = total > 0 ? Math.round((blocked / total) * 100) : 0;

    return { total, active, warned, blocked, students, authorities, admins, activePct, warnedPct, blockedPct };
  }, [adminUsers]);

  const resolutionRate = useMemo(() => {
    return totalGrievances > 0
      ? Math.round((resolvedGrievances / totalGrievances) * 100)
      : 0;
  }, [totalGrievances, resolvedGrievances]);

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 space-y-6 sm:space-y-8">
      
      {/* ─────────────────────────────────────────────────────────────
          ADMIN HERO BANNER: Deep Navy & Purple Institutional Header
          ───────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0c1629] text-white shadow-xl border border-slate-700/80 p-6 sm:p-8">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                CENTRAL PROCTORIAL BOARD
              </span>
              <span className="text-xs text-slate-400 font-medium">
                GMS Governance & Compliance Console
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>{currentUser?.name || 'Central Administrator'}</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              Real-time oversight of institutional complaint volume, compliance SLA performance,
              authority assignments, and campus-wide flagged grievances.
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => {
                fetchAnalytics();
                fetchGrievances();
                fetchAdminFlags();
                fetchAdminUsers();
              }}
              className="px-4 py-2.5 rounded-xl bg-[#121f38] hover:bg-[#162746] text-slate-200 border border-slate-700 font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-purple-400" />
              <span>Refresh Metrics</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-600/25 transition-all flex items-center gap-2 cursor-pointer border border-purple-500/30"
            >
              <BarChart3 className="w-4 h-4 text-amber-300" />
              <span>Full Analytics</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. TOP STATS ROW (4 BORDERED CARDS)
          ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Total Grievances */}
        <div className="bg-[#0b1424] rounded-xl p-5 border border-slate-800 hover:border-blue-500/40 transition-colors shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Grievances
            </span>
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
              {totalGrievances}
            </h3>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+12% MoM</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Intake across campus departments
          </p>
        </div>

        {/* Active Grievances */}
        <div className="bg-[#0b1424] rounded-xl p-5 border border-slate-800 hover:border-amber-500/40 transition-colors shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active Investigation
            </span>
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-tight">
              {activeGrievances}
            </h3>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              <Activity className="w-3.5 h-3.5" />
              <span>In Queue</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Awaiting resolution or field check
          </p>
        </div>

        {/* Resolved Grievances */}
        <div className="bg-[#0b1424] rounded-xl p-5 border border-slate-800 hover:border-emerald-500/40 transition-colors shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Resolved & Closed
            </span>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight">
              {resolvedGrievances}
            </h3>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{resolutionRate}% Rate</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Verified with student feedback
          </p>
        </div>

        {/* Unresolved Flags */}
        <div className="bg-[#0b1424] rounded-xl p-5 border border-slate-800 hover:border-rose-500/40 transition-colors shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Unresolved Flags
            </span>
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-2xl sm:text-3xl font-black text-rose-400 font-mono tracking-tight">
              {unresolvedFlagsCount}
            </h3>
            <span
              className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded border ${
                unresolvedFlagsCount > 0
                  ? 'text-rose-300 bg-rose-500/20 border-rose-500/30 animate-pulse'
                  : 'text-slate-400 bg-slate-800 border-slate-700'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{unresolvedFlagsCount > 0 ? 'Action Needed' : 'Clear'}</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Content moderation & safety flags
          </p>
        </div>

      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. QUICK ACTION CARDS (4 ACTIONS)
          ───────────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            Administrative Command Actions
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Centralized Access
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Action 1: Manage Accounts */}
          <button
            onClick={() => setActiveTab('admin_add_account')}
            className="p-4 rounded-xl bg-[#0b1424] hover:bg-[#0e1a30] border border-slate-800 hover:border-purple-500/40 transition-all text-left group cursor-pointer flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors flex items-center justify-center">
                <UserPlus className="w-4 h-4" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                Manage Accounts
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Provision authority officers & departments.
              </p>
            </div>
          </button>

          {/* Action 2: Authorities Directory & Category Mapping */}
          <button
            onClick={() => setActiveTab('authorities')}
            className="p-4 rounded-xl bg-[#0b1424] hover:bg-[#0e1a30] border border-slate-800 hover:border-indigo-500/40 transition-all text-left group cursor-pointer flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                Authority Directory
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Configure MITS officials, contact info & category mapping.
              </p>
            </div>
          </button>

          {/* Action 3: Student Management */}
          <button
            onClick={() => setActiveTab('student_management')}
            className="p-4 rounded-xl bg-[#0b1424] hover:bg-[#0e1a30] border border-slate-800 hover:border-blue-500/40 transition-all text-left group cursor-pointer flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                Student Directory
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Review accounts, audit activity & status.
              </p>
            </div>
          </button>

          {/* Action 4: Review Flags */}
          <button
            onClick={() => setActiveTab('admin_complaints')}
            className="p-4 rounded-xl bg-[#0b1424] hover:bg-[#0e1a30] border border-slate-800 hover:border-rose-500/40 transition-all text-left group cursor-pointer flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 group-hover:bg-rose-600 group-hover:text-white transition-colors flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-rose-300 transition-colors">
                Review Flags
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Content moderation & safety reports.
              </p>
            </div>
          </button>

          {/* Action 5: View Analytics */}
          <button
            onClick={() => setActiveTab('analytics')}
            className="p-4 rounded-xl bg-[#0b1424] hover:bg-[#0e1a30] border border-slate-800 hover:border-emerald-500/40 transition-all text-left group cursor-pointer flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                SLA Analytics
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Turnaround metrics & export reports.
              </p>
            </div>
          </button>

        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. USER STATUS BREAKDOWN & RECENT FLAGS (DUAL SECTION)
          ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (1 col): User Status Breakdown */}
        <div className="bg-[#0b1424] rounded-xl border border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                User Status Breakdown
              </h3>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#080f1c] text-slate-300 border border-slate-700">
                {userStats.total} Total
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Active account health monitoring across verified MITS domain accounts.
            </p>

            {/* Stat Numbers with Colored Indicators */}
            <div className="grid grid-cols-3 gap-2.5 mt-5">
              
              {/* Active */}
              <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-300 uppercase">Active</span>
                </div>
                <p className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                  {userStats.active}
                </p>
                <span className="text-[10px] font-semibold text-emerald-500">
                  {userStats.activePct}% of users
                </span>
              </div>

              {/* Warned */}
              <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-[10px] font-bold text-amber-300 uppercase">Warned</span>
                </div>
                <p className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                  {userStats.warned}
                </p>
                <span className="text-[10px] font-semibold text-amber-500">
                  {userStats.warnedPct}% of users
                </span>
              </div>

              {/* Blocked */}
              <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  <span className="text-[10px] font-bold text-rose-300 uppercase">Blocked</span>
                </div>
                <p className="text-xl sm:text-2xl font-black text-rose-400 font-mono">
                  {userStats.blocked}
                </p>
                <span className="text-[10px] font-semibold text-rose-500">
                  {userStats.blockedPct}% of users
                </span>
              </div>

            </div>

            {/* Visual Multi-Segment Bar */}
            <div className="mt-5 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>Account Ratio</span>
                <span className="font-semibold text-slate-300">
                  {userStats.active} active • {userStats.warned + userStats.blocked} restricted
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex border border-slate-700/50">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${userStats.activePct}%` }}
                  title={`Active: ${userStats.active}`}
                />
                <div
                  className="h-full bg-amber-500"
                  style={{ width: `${userStats.warnedPct}%` }}
                  title={`Warned: ${userStats.warned}`}
                />
                <div
                  className="h-full bg-rose-500"
                  style={{ width: `${userStats.blockedPct}%` }}
                  title={`Blocked: ${userStats.blocked}`}
                />
              </div>
            </div>

            {/* Role Breakdown Pills */}
            <div className="mt-5 pt-4 border-t border-slate-800 space-y-2 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                User Role Distribution
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-[#080f1c] text-slate-300 font-semibold border border-slate-700">
                  Students: <strong className="text-white">{userStats.students}</strong>
                </span>
                <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300 font-semibold border border-indigo-500/30">
                  Authorities: <strong className="text-white">{userStats.authorities}</strong>
                </span>
                <span className="px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-300 font-semibold border border-purple-500/30">
                  Admins: <strong className="text-white">{userStats.admins}</strong>
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('student_management')}
            className="w-full py-2.5 rounded-lg bg-[#0f1b33] hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Manage All Accounts &rarr;</span>
          </button>
        </div>

        {/* Right Column (2 cols): Recent Flags Section */}
        <div className="lg:col-span-2 bg-[#0b1424] rounded-xl border border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                    Recent Flags Pending Review
                  </h3>
                  <p className="text-xs text-slate-400">
                    Showing top {topFlags.length} unresolved flagged complaints requiring proctorial decision
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('admin_complaints')}
                className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
              >
                <span>View All ({unresolvedFlags.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List of Flags */}
            <div className="space-y-3 mt-4">
              {topFlags.length === 0 ? (
                <div className="p-8 rounded-lg bg-[#080f1c] border border-slate-800 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="text-xs font-bold text-white">
                    No Unresolved Flags
                  </p>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                    All student reports and compliance flags have been addressed by the proctorial board.
                  </p>
                </div>
              ) : (
                topFlags.map((flag) => (
                  <div
                    key={flag.id}
                    className="p-4 rounded-lg bg-rose-950/20 border border-rose-500/30 hover:border-rose-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {flag.grievance_code && (
                          <span className="font-mono text-xs font-bold text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                            {flag.grievance_code}
                          </span>
                        )}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 uppercase">
                          Violation Flag
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatRelativeTime(flag.created_at)}</span>
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-rose-300 transition-colors line-clamp-1">
                        {flag.grievance_title || 'Reported Grievance'}
                      </h4>

                      <p className="text-xs text-rose-200/90 leading-relaxed font-medium bg-[#080f1c]/80 p-2 rounded border border-rose-500/20">
                        <strong className="text-rose-400">Reason: </strong>
                        {flag.reason}
                      </p>

                      {flag.flagged_by_name && (
                        <p className="text-[11px] text-slate-400 pt-0.5">
                          Flagged by: <strong className="text-slate-300">{flag.flagged_by_name}</strong>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                      <button
                        onClick={() => {
                          if (flag.grievance_id) {
                            openGrievanceDetail(flag.grievance_id);
                          } else {
                            setActiveTab('admin_complaints');
                          }
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 border border-rose-500/30"
                      >
                        <span>Review</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800">
            <span>Proctorial Audit: Strictly confidential</span>
            <button
              onClick={() => setActiveTab('admin_complaints')}
              className="font-bold text-purple-400 hover:text-purple-300"
            >
              Open Complaints Console &rarr;
            </button>
          </div>
        </div>

      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. RECENT GRIEVANCES TABLE (LAST 5 GRIEVANCES)
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#0b1424] rounded-xl border border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              Recent Campus Grievances (Central Feed)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Latest 5 incoming submissions across all college, hostel, and mess departments
            </p>
          </div>

          <button
            onClick={() => setActiveTab('community')}
            className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>Explore All Grievances</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Table Container with visible borders and separators */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#080f1c] border-b border-slate-800 text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 sm:px-6">Grievance Code</th>
                <th className="py-3 px-4">Title & Context</th>
                <th className="py-3 px-4">Category & Section</th>
                <th className="py-3 px-4">FSM Status</th>
                <th className="py-3 px-4 sm:px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs">
              {recentGrievances.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No grievances recorded in the database.
                  </td>
                </tr>
              ) : (
                recentGrievances.map((grievance) => {
                  const statusMeta =
                    STATUS_META[grievance.status] ||
                    STATUS_META[COMPLAINT_STATUSES.SUBMITTED];

                  return (
                    <tr
                      key={grievance.id}
                      onClick={() => openGrievanceDetail(grievance.id)}
                      className="hover:bg-[#0e1a30] transition-colors cursor-pointer group"
                    >
                      {/* Monospace Grievance Code */}
                      <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                        <span className="font-mono text-xs font-bold text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-md border border-purple-500/30">
                          {grievance.grievance_code}
                        </span>
                      </td>

                      {/* Title (Truncated) */}
                      <td className="py-3.5 px-4 max-w-xs md:max-w-md">
                        <p className="font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                          {grievance.title}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span>{formatRelativeTime(grievance.created_at)}</span>
                          {grievance.is_anonymous ? (
                            <span className="flex items-center gap-1 text-amber-400 font-semibold">
                              <Lock className="w-3 h-3" /> Anonymous
                            </span>
                          ) : (
                            <span>by {grievance.author_name}</span>
                          )}
                        </div>
                      </td>

                      {/* Category & Section */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-slate-200">
                            {grievance.category_name}
                          </span>
                          <span className="text-[10px] text-slate-500 uppercase font-medium">
                            {grievance.category_section || 'college'}
                          </span>
                        </div>
                      </td>

                      {/* Status Badge per STATUS_META */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusMeta.badge}`}
                        >
                          {statusMeta.label}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openGrievanceDetail(grievance.id);
                          }}
                          className="px-3 py-1.5 rounded-md bg-[#0f1b33] hover:bg-purple-600/20 text-purple-300 border border-purple-500/30 font-bold text-xs transition-colors cursor-pointer"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3.5 sm:p-4 bg-[#080f1c] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Showing 5 most recent submissions</span>
          <span className="font-semibold text-slate-300">
            MITS GMS Central Proctorial Console
          </span>
        </div>
      </div>

    </div>
  );
}
