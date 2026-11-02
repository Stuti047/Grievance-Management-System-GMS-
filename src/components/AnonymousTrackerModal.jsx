import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import api from '../api';
import { 
  KeyRound, 
  Search, 
  X, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight, 
  Lock, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';

export default function AnonymousTrackerModal() {
  const { 
    isAnonymousTrackerOpen, 
    setIsAnonymousTrackerOpen, 
    complaints = [], 
    setSelectedTicket 
  } = useApp();

  const [inputKey, setInputKey] = useState('');
  const [searched, setSearched] = useState(false);
  const [foundTicket, setFoundTicket] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  if (!isAnonymousTrackerOpen) return null;

  const handleLookup = async (e) => {
    e.preventDefault();
    const key = inputKey.trim();
    if (!key) return;

    setIsSearching(true);
    // Search local complaints cache first
    let match = complaints.find(c => 
      !c.isDeleted && (
        (c.anonymousToken && c.anonymousToken.toLowerCase() === key.toLowerCase()) ||
        (c.tracking_token && c.tracking_token.toLowerCase() === key.toLowerCase()) ||
        (c.grievance_code && c.grievance_code.toLowerCase() === key.toLowerCase()) ||
        (c.ticketId && c.ticketId.toLowerCase() === key.toLowerCase())
      )
    );

    // If not found in memory, query PostgreSQL backend
    if (!match) {
      try {
        const res = await api.grievances.trackByToken(key);
        if (res.grievance) {
          match = res.grievance;
        }
      } catch (err) {
        console.error('Anonymous tracking error:', err);
      }
    }

    setFoundTicket(match || null);
    setSearched(true);
    setIsSearching(false);
  };

  const handleOpenTicket = () => {
    if (foundTicket) {
      setSelectedTicket(foundTicket);
      setIsAnonymousTrackerOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div 
        className="bg-[#0b1424] rounded-3xl shadow-2xl border border-slate-800 w-full max-w-lg overflow-hidden animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-[#080e1a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-600/90 text-white flex items-center justify-center shadow-xs border border-amber-500/40">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white">Zero-Knowledge Anonymous Tracker</h3>
              <p className="text-[11px] text-slate-400">Track sensitive grievances via SHA-256 tokens</p>
            </div>
          </div>

          <button
            onClick={() => setIsAnonymousTrackerOpen(false)}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <p className="text-xs text-slate-300 leading-relaxed">
            Enter the 12-character <strong className="text-amber-300">Secret Key</strong> or <strong className="text-blue-300">Ticket ID</strong> received upon lodging your anonymous complaint. No personal credentials are required.
          </p>

          <form onSubmit={handleLookup} className="space-y-3">
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="e.g. GMS-SEC-710492 or MITS-2026-105"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-[#080e1a] border border-slate-700 rounded-xl text-xs sm:text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-900/30 flex items-center justify-center gap-2 transition-all cursor-pointer border border-amber-400/30"
            >
              <Search className="w-4 h-4" />
              <span>Verify Secret Key & Fetch Status</span>
            </button>
          </form>

          {/* Quick Demo Key Chip */}
          <div className="p-3 bg-[#080e1a] rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Demo Secret Token:</span>
            <button
              type="button"
              onClick={() => { setInputKey('RCMS-SEC-710492'); }}
              className="font-mono font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
            >
              RCMS-SEC-710492
            </button>
          </div>

          {/* Search Result */}
          {searched && (
            <div className="pt-2 animate-in fade-in">
              {foundTicket ? (
                <div className="p-4 bg-emerald-950/30 border border-emerald-700/60 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-emerald-300">
                      Verified Match: #{foundTicket.ticketId || foundTicket.grievance_code}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-900/80 text-emerald-300 border border-emerald-700">
                      {foundTicket.status}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white">
                    "{foundTicket.title}"
                  </h4>

                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                    {foundTicket.description}
                  </p>

                  <div className="text-[10px] text-slate-400 space-y-1 pt-2 border-t border-emerald-900/60">
                    <p>Current Step: <strong className="text-emerald-300">{foundTicket.status}</strong></p>
                    <p>Audit trail entries: <strong className="text-blue-400">{(foundTicket.history || []).length} logged</strong></p>
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenTicket}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
                  >
                    <span>View Investigation Details & Timeline</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-rose-950/30 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>No active anonymous grievance found matching this token. Please verify the key.</span>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3.5 bg-[#080e1a] border-t border-slate-800 text-center text-[10px] text-slate-500 font-mono">
          Shielded with SHA-256 Hashing • MITS Grievance Management System (GMS)
        </div>

      </div>
    </div>
  );
}
