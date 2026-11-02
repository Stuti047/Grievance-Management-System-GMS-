import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  ThumbsUp, 
  Flame, 
  Search, 
  Filter, 
  MessageSquare, 
  ArrowUpRight, 
  Clock, 
  Building,
  CheckCircle2
} from 'lucide-react';

export default function CommunityFeedView() {
  const { 
    currentUser, 
    complaints = [], 
    upvoteComplaint, 
    setSelectedTicket 
  } = useApp();

  const [sortBy, setSortBy] = useState('upvotes'); // 'upvotes' | 'newest' | 'priority'
  const [filterBlock, setFilterBlock] = useState('All');

  // Filter out soft-deleted
  let activeList = complaints.filter(c => !c.isDeleted);

  if (filterBlock !== 'All') {
    activeList = activeList.filter(c => c.locationDetails?.block?.toLowerCase().includes(filterBlock.toLowerCase()));
  }

  // Sort
  activeList.sort((a, b) => {
    if (sortBy === 'upvotes') {
      return (b.upvotes?.length || 0) - (a.upvotes?.length || 0);
    }
    if (sortBy === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    if (sortBy === 'priority') {
      const pMap = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
      return (pMap[b.priority] || 1) - (pMap[a.priority] || 1);
    }
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      
      {/* ─── Manga-Inspired Page Header ─── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-black uppercase tracking-widest bg-amber-950/80 text-amber-300 border border-amber-700/60 flex items-center gap-1 shadow-xs">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              COMMUNITY VOICE & ENDORSEMENTS
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
            Campus Grievance Board
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Upvote issues that affect you too. Highly-endorsed grievances receive priority SLA escalation.
          </p>
        </div>

        {/* Sorting & Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3.5 py-2 bg-[#0b1424] border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 shadow-xs focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
          >
            <option value="upvotes" className="bg-[#0b1424] text-white">Sort: Most Upvoted (Trending)</option>
            <option value="newest" className="bg-[#0b1424] text-white">Sort: Recently Logged</option>
            <option value="priority" className="bg-[#0b1424] text-white">Sort: Urgency / Priority</option>
          </select>

          <select
            value={filterBlock}
            onChange={(e) => setFilterBlock(e.target.value)}
            className="px-3.5 py-2 bg-[#0b1424] border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 shadow-xs focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
          >
            <option value="All" className="bg-[#0b1424] text-white">All Locations</option>
            <option value="BH-1" className="bg-[#0b1424] text-white">Boys Hostel 1</option>
            <option value="BH-2" className="bg-[#0b1424] text-white">Boys Hostel 2</option>
            <option value="GH-1" className="bg-[#0b1424] text-white">Girls Hostel 1</option>
            <option value="Mathematics" className="bg-[#0b1424] text-white">Math & Computing</option>
            <option value="SAC" className="bg-[#0b1424] text-white">Student Activity Centre</option>
          </select>
        </div>
      </div>

      {/* ─── Grid of Community Cards ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeList.map(ticket => {
          const hasUpvoted = currentUser && ticket.upvotes?.includes(currentUser.id);

          return (
            <div
              key={ticket.ticketId}
              className="bg-[#0b1424] rounded-2xl border border-slate-800 hover:border-blue-500/50 p-5 shadow-lg transition-all flex flex-col justify-between space-y-4 group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-300 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800">
                      #{ticket.ticketId}
                    </span>
                    <span className="text-xs font-bold text-slate-300">
                      {ticket.category}
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                    ticket.status === 'Resolved'
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                      : ticket.status === 'Escalated'
                      ? 'bg-rose-950/80 text-rose-300 border-rose-700/60'
                      : 'bg-blue-950/80 text-blue-300 border-blue-700/60'
                  }`}>
                    {ticket.status}
                  </span>
                </div>

                <h3 
                  onClick={() => setSelectedTicket(ticket)}
                  className="text-sm sm:text-base font-extrabold text-white group-hover:text-blue-400 transition-colors cursor-pointer leading-snug"
                >
                  {ticket.title}
                </h3>

                <p className="text-xs text-slate-400 mt-1.5 line-clamp-3 leading-relaxed">
                  {ticket.description}
                </p>

                <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-800">
                  <span className="flex items-center gap-1 font-semibold text-slate-300">
                    <Building className="w-3.5 h-3.5 text-slate-500" />
                    {ticket.locationDetails?.block || 'Campus'}
                  </span>
                  <span>•</span>
                  <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <MessageSquare className="w-3 h-3 text-slate-500" />
                    {ticket.comments?.length || 0} notes
                  </span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => upvoteComplaint(ticket.ticketId)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer border ${
                    hasUpvoted
                      ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30'
                      : 'bg-[#080e1a] hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700'
                  }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? 'text-white' : 'text-blue-400'}`} />
                  <span>{ticket.upvotes?.length || 0} Endorsements</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTicket(ticket)}
                  className="text-xs font-black uppercase tracking-wider text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>View Details</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
