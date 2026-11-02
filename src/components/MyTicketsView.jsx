import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileText, 
  PlusCircle, 
  CheckCircle, 
  Clock, 
  ThumbsUp, 
  ExternalLink, 
  ShieldCheck, 
  KeyRound, 
  Filter,
  ArrowRight
} from 'lucide-react';

export default function MyTicketsView() {
  const { 
    currentUser, 
    complaints = [], 
    setSelectedTicket, 
    setActiveTab, 
    upvoteComplaint 
  } = useApp();

  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'resolved' | 'upvoted'

  // Complaints submitted by user
  const userSubmitted = currentUser 
    ? complaints.filter(c => !c.isDeleted && c.submittedBy?.email === currentUser.email)
    : [];

  // Complaints upvoted by user
  const userUpvoted = currentUser
    ? complaints.filter(c => !c.isDeleted && c.upvotes?.includes(currentUser.id))
    : [];

  const displayedTickets = complaints.filter(c => {
    if (c.isDeleted) return false;
    const isOwner = currentUser && c.submittedBy?.email === currentUser.email;
    const isUpvoted = currentUser && c.upvotes?.includes(currentUser.id);

    if (filter === 'all') return isOwner;
    if (filter === 'active') return isOwner && c.status !== 'Resolved';
    if (filter === 'resolved') return isOwner && c.status === 'Resolved';
    if (filter === 'upvoted') return isUpvoted;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      
      {/* ─── Manga-Inspired Page Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-black uppercase tracking-widest bg-blue-900/60 text-blue-300 border border-blue-700/60 shadow-xs">
              MITS // PERSONAL LOG
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {currentUser?.enrollmentNo || currentUser?.email || 'STUDENT-SESSION'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
            My Lodged Grievances & Watchlist
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Real-time status tracking, authority assignment, and cryptographically stamped updates.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('submit')}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg shadow-blue-900/30 flex items-center gap-2 transition-all cursor-pointer border border-blue-400/30 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Lodge New Grievance</span>
        </button>
      </div>

      {/* ─── Manga-Style Filter Tabs ─── */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800/80 pb-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
            filter === 'all' 
              ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30' 
              : 'bg-[#0b1424] text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
          }`}
        >
          My Submissions ({userSubmitted.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
            filter === 'active' 
              ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30' 
              : 'bg-[#0b1424] text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
          }`}
        >
          Under Investigation ({userSubmitted.filter(c => c.status !== 'Resolved').length})
        </button>
        <button
          onClick={() => setFilter('resolved')}
          className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
            filter === 'resolved' 
              ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30' 
              : 'bg-[#0b1424] text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
          }`}
        >
          Resolved ({userSubmitted.filter(c => c.status === 'Resolved').length})
        </button>
        <button
          onClick={() => setFilter('upvoted')}
          className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
            filter === 'upvoted' 
              ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30' 
              : 'bg-[#0b1424] text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
          }`}
        >
          Upvoted by Me ({userUpvoted.length})
        </button>
      </div>

      {/* ─── Tickets List ─── */}
      <div className="space-y-3">
        {displayedTickets.length === 0 ? (
          <div className="bg-[#0b1424] rounded-2xl border border-slate-800 p-12 text-center space-y-3 relative overflow-hidden">
            <div className="absolute inset-0 manga-halftone opacity-20 pointer-events-none" />
            <div className="relative z-10">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-2" />
              <h4 className="text-sm font-black uppercase tracking-wider text-slate-300">No tickets found in this tab</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                If you have recently submitted a complaint or anonymous ticket, check with your secret token or lodge a new one.
              </p>
              <button
                onClick={() => setActiveTab('submit')}
                className="mt-4 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md cursor-pointer transition-colors border border-blue-400/30"
              >
                Lodge a Grievance Now
              </button>
            </div>
          </div>
        ) : (
          displayedTickets.map(ticket => {
            const isOwner = currentUser && ticket.submittedBy?.email === currentUser.email;

            return (
              <div
                key={ticket.ticketId}
                className="bg-[#0b1424] rounded-2xl border border-slate-800 hover:border-blue-500/60 p-4 sm:p-5 shadow-lg transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div 
                  onClick={() => setSelectedTicket(ticket)}
                  className="flex-1 min-w-0 cursor-pointer"
                >
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-blue-300 bg-blue-950/80 px-2.5 py-0.5 rounded border border-blue-800">
                      #{ticket.ticketId}
                    </span>
                    <span className="text-xs font-bold text-slate-300">{ticket.category}</span>
                    <span className="text-xs font-medium text-slate-400">• {ticket.priority} Priority</span>
                    {isOwner && (
                      <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                        OWNER
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm sm:text-base font-extrabold text-white group-hover:text-blue-400 transition-colors">
                    {ticket.title}
                  </h3>

                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {ticket.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 mt-2.5">
                    <span>Location: <strong className="text-slate-300">{ticket.locationDetails?.block || 'Campus'}</strong></span>
                    <span>Created: <strong className="text-slate-300">{new Date(ticket.createdAt).toLocaleDateString()}</strong></span>
                    <span>Audit Steps: <strong className="text-blue-400">{ticket.history?.length || 1}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`px-3 py-1 rounded text-xs font-mono font-bold border ${
                    ticket.status === 'Resolved'
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                      : ticket.status === 'Escalated'
                      ? 'bg-rose-950/80 text-rose-300 border-rose-700/60'
                      : 'bg-blue-950/80 text-blue-300 border-blue-700/60'
                  }`}>
                    {ticket.status}
                  </span>

                  <button
                    onClick={() => setSelectedTicket(ticket)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer border border-blue-400/30 flex items-center gap-1.5"
                  >
                    <span>Timeline</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
