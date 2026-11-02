import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/mockData';
import { 
  PlusCircle, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ThumbsUp, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ShieldAlert, 
  Sparkles, 
  KeyRound, 
  ChevronRight,
  TrendingUp,
  Building2,
  UserCheck,
  MapPin,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function DashboardView() {
  const { 
    currentUser, 
    complaints, 
    setActiveTab, 
    setSelectedTicket, 
    upvoteComplaint, 
    setIsChatbotOpen, 
    setIsAnonymousTrackerOpen 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Filter complaints
  const visibleComplaints = complaints.filter(c => {
    if (c.isDeleted) return false;
    
    const matchesSearch = 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || c.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate Metrics
  const totalCount = complaints.filter(c => !c.isDeleted).length;
  const inProgressCount = complaints.filter(c => !c.isDeleted && (c.status === 'In progress' || c.status === 'Assigned' || c.status === 'Under review')).length;
  const resolvedCount = complaints.filter(c => !c.isDeleted && (c.status === 'Resolved' || c.status === 'Closed')).length;
  const resolutionRate = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0;

  // Student specific tickets
  const myComplaints = currentUser 
    ? complaints.filter(c => !c.isDeleted && c.submittedBy?.email === currentUser.email)
    : [];

  const statusStyles = {
    Submitted: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    'Under review': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    Assigned: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    'In progress': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    Resolved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    Closed: 'bg-slate-500/10 text-slate-300 border-slate-600/40',
    Reopened: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    Escalated: 'bg-red-500/10 text-red-400 border-red-500/30'
  };

  const priorityStyles = {
    Low: 'text-slate-400 border-slate-700 bg-slate-800/40',
    Medium: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    High: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    Urgent: 'text-rose-400 border-rose-500/30 bg-rose-500/10 font-bold'
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 space-y-6 sm:space-y-8">
      
      {/* ─────────────────────────────────────────────────────────────
          1. HERO BANNER: Institutional Greeting & Action Hub
          ───────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0c1629] border border-slate-700/80 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-300 border border-blue-500/30">
                MITS-DU GRIEVANCE PORTAL
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Academic Session 2026-27
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome, {currentUser ? currentUser.name : 'MITS Member'}
            </h2>
            
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {currentUser?.role === 'student' && (
                <>Enrolled in <span className="font-semibold text-white">{currentUser.department}</span> ({currentUser.enrollmentNo}). Track your lodged grievances, explore community issues, or report anonymously with zero-knowledge keys.</>
              )}
              {currentUser?.role === 'authority' && (
                <>Assigned to <span className="font-semibold text-white">{currentUser.department}</span>. Review pending student tickets, take action via the FSM workflow, and log internal notes.</>
              )}
              {currentUser?.role === 'admin' && (
                <>Administrator view. Oversee campus SLA compliance, prevent complaint tampering, and monitor institutional analytics.</>
              )}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setActiveTab('submit')}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer border border-blue-500/30"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Lodge Grievance</span>
            </button>

            <button
              onClick={() => setIsChatbotOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#121f38] hover:bg-[#162746] text-slate-200 border border-slate-700 font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Ask GMS Assistant</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. KPI STATISTICS (4 BORDERED CARDS)
          ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        
        <div className="bg-[#0b1424] rounded-xl p-4 sm:p-5 border border-slate-800 hover:border-blue-500/40 transition-colors shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Total Campus Grievances</p>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">{totalCount}</h3>
            <p className="text-[10px] text-emerald-400 font-bold mt-0.5">Centralized MITS Intake</p>
          </div>
        </div>

        <div className="bg-[#0b1424] rounded-xl p-4 sm:p-5 border border-slate-800 hover:border-amber-500/40 transition-colors shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Active In Progress</p>
            <h3 className="text-xl sm:text-2xl font-black text-amber-400 mt-0.5">{inProgressCount}</h3>
            <p className="text-[10px] text-amber-400 font-bold mt-0.5">In Investigation Queue</p>
          </div>
        </div>

        <div className="bg-[#0b1424] rounded-xl p-4 sm:p-5 border border-slate-800 hover:border-emerald-500/40 transition-colors shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Resolution Rate</p>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">{resolutionRate}%</h3>
            <p className="text-[10px] text-emerald-400 font-bold mt-0.5">{resolvedCount} Tickets Resolved</p>
          </div>
        </div>

        <div className="bg-[#0b1424] rounded-xl p-4 sm:p-5 border border-slate-800 hover:border-purple-500/40 transition-colors shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Avg SLA Turnaround</p>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">18.4 hrs</h3>
            <p className="text-[10px] text-purple-400 font-bold mt-0.5">92% On-Time SLA</p>
          </div>
        </div>

      </div>

      {/* ─────────────────────────────────────────────────────────────
          INSTITUTIONAL AUTHORITIES BANNER
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#0b1424] border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">MITS Responsible Authorities Directory</h4>
              <span className="font-accent text-indigo-400 text-sm font-semibold">33 Redressing Officers</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Contact designations, grievance committee in-charges, and departmental SLA assignments.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('authorities')}
          className="px-3.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <span>Browse Directory</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. STUDENT BORDERED BANNER: MY RECENT GRIEVANCES
          ───────────────────────────────────────────────────────────── */}
      {currentUser?.role === 'student' && myComplaints.length > 0 && (
        <div className="bg-[#0b1424] border border-blue-900/50 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse"></span>
              <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                My Lodged Grievances ({myComplaints.length})
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('my_tickets')}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {myComplaints.slice(0, 3).map(ticket => (
              <div
                key={ticket.ticketId}
                onClick={() => setSelectedTicket(ticket)}
                className="bg-[#0e1a30] p-3.5 rounded-lg border border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-mono font-bold text-blue-400">#{ticket.ticketId}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusStyles[ticket.status] || statusStyles.Submitted}`}>
                    {ticket.status}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white group-hover:text-blue-300 line-clamp-1 transition-colors">
                  {ticket.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  {ticket.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. MAIN SECTION: SEARCH, FILTERS & GRIEVANCE FEED
          ───────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        
        {/* Search & Filter Bar */}
        <div className="bg-[#0b1424] p-3.5 sm:p-4 rounded-xl border border-slate-800 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
          
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by ticket ID, keyword, hostel, room..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#080f1c] border border-slate-700 rounded-lg text-xs sm:text-sm text-white placeholder-slate-500 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-[#080f1c] border border-slate-700 rounded-lg text-xs font-semibold text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-[#080f1c] border border-slate-700 rounded-lg text-xs font-semibold text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under review">Under Review</option>
              <option value="Assigned">Assigned</option>
              <option value="In progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

        </div>

        {/* Complaints Feed List */}
        <div className="space-y-3">
          {visibleComplaints.length === 0 ? (
            <div className="bg-[#0b1424] rounded-xl border border-slate-800 p-12 text-center space-y-3">
              <FileText className="w-12 h-12 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-white">No grievances match the search filter</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try selecting a different category or clearing search terms.
              </p>
            </div>
          ) : (
            visibleComplaints.map(ticket => {
              const hasUpvoted = currentUser && ticket.upvotes.includes(currentUser.id);

              return (
                <div
                  key={ticket.ticketId}
                  className="bg-[#0b1424] hover:bg-[#0e1a30] rounded-xl border border-slate-800 hover:border-blue-500/40 p-4 sm:p-5 transition-all duration-150 flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  <div 
                    onClick={() => setSelectedTicket(ticket)} 
                    className="flex-1 min-w-0 cursor-pointer space-y-1.5"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                        #{ticket.ticketId}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">
                        {ticket.category}
                      </span>
                      <span className={`text-[11px] px-2 py-0.2 rounded border font-semibold ${priorityStyles[ticket.priority] || priorityStyles.Medium}`}>
                        {ticket.priority} Priority
                      </span>
                      {ticket.isAnonymous && (
                        <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/30">
                          Anonymous
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                      {ticket.title}
                    </h4>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {ticket.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <strong className="text-slate-300 font-normal">{ticket.locationDetails.block}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <strong className="text-slate-300 font-normal">{new Date(ticket.createdAt).toLocaleDateString('en-IN')}</strong>
                      </span>
                      {ticket.assignedTo && (
                        <span className="flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-indigo-400" />
                          <span>Assigned: <strong className="text-indigo-300 font-medium">{ticket.assignedTo.name}</strong></span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions & Upvote Box */}
                  <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800 justify-between md:justify-end">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${statusStyles[ticket.status] || statusStyles.Submitted}`}>
                      {ticket.status}
                    </span>

                    <button
                      onClick={() => upvoteComplaint(ticket.ticketId)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                        hasUpvoted
                          ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                          : 'bg-[#080f1c] hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700'
                      }`}
                      title="Support this grievance"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{ticket.upvotes.length}</span>
                    </button>

                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="px-3 py-1.5 rounded-lg bg-[#0f1b33] hover:bg-blue-600/20 text-blue-300 border border-blue-500/30 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
}
