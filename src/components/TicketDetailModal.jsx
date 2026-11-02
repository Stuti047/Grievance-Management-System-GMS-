import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X, Clock, ThumbsUp, MessageSquare, Lock, Send, Hash,
  ShieldCheck, AlertTriangle, Flag, ChevronDown, CheckCircle2,
  RefreshCw, Star, FileText, Image, Paperclip, Eye, EyeOff,
  Info, Users, Building2, Calendar, MapPin, Badge, ArrowRight
} from 'lucide-react';
import { STATUS_META, COMPLAINT_STATUSES, FSM_TRANSITIONS } from '../utils/fsm';
import StatusTimeline from './StatusTimeline';

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
}

function relativeTime(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function TicketDetailModal() {
  const {
    selectedGrievance,
    setSelectedGrievance,
    currentUser,
    toggleSupport,
    updateStatus,
    addComment,
    addInternalNote,
    reopenGrievance,
    submitFeedback,
    flagGrievance
  } = useApp();

  const [activeTab, setActiveTab] = useState('comments'); // 'comments' | 'history'
  const [newComment, setNewComment] = useState('');
  const [isAnonComment, setIsAnonComment] = useState(false);
  const [transitionNote, setTransitionNote] = useState('');
  const [selectedNextStatus, setSelectedNextStatus] = useState('');
  const [showStatusPanel, setShowStatusPanel] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [showFeedbackPanel, setShowFeedbackPanel] = useState(false);
  const [feedbackOk, setFeedbackOk] = useState(null);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [showReopenPanel, setShowReopenPanel] = useState(false);
  const [reopenNote, setReopenNote] = useState('');
  const [loading, setLoading] = useState(false);

  const g = selectedGrievance;
  if (!g) return null;

  const isStudent = currentUser?.role === 'student';
  const isAuthority = currentUser?.role === 'authority';
  const isAdmin = currentUser?.role === 'admin';
  const isAuthoritative = isAuthority || isAdmin;
  const isOwner = currentUser?.id === g.author_id;

  const meta = STATUS_META[g.status] || {};
  const nextStatuses = FSM_TRANSITIONS[g.status] || [];

  const canSupport = currentUser && !isOwner;
  const canReopen = isOwner && g.status === 'Closed';
  const canFeedback = isOwner && (g.status === 'Resolved' || g.status === 'Closed') && !g.feedback;
  const canFlag = currentUser && g.status !== 'Closed' && g.status !== 'Rejected';

  // Actions
  const handleStatusTransition = async () => {
    if (!selectedNextStatus) return;
    setLoading(true);
    await updateStatus(g.id, selectedNextStatus, transitionNote);
    setShowStatusPanel(false);
    setTransitionNote('');
    setSelectedNextStatus('');
    setLoading(false);
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setLoading(true);
    await addComment(g.id, newComment, isAnonComment);
    setNewComment('');
    setLoading(false);
  };

  const handleFlag = async () => {
    if (!flagReason.trim()) return;
    setLoading(true);
    await flagGrievance(g.id, flagReason);
    setShowFlagModal(false);
    setFlagReason('');
    setLoading(false);
  };

  const handleFeedback = async () => {
    if (feedbackOk === null) return;
    setLoading(true);
    await submitFeedback(g.id, feedbackOk, feedbackComment);
    setShowFeedbackPanel(false);
    setLoading(false);
  };

  const handleReopen = async () => {
    setLoading(true);
    await reopenGrievance(g.id, reopenNote);
    setShowReopenPanel(false);
    setLoading(false);
  };

  const slaElapsed = g.sla_hours
    ? ((Date.now() - new Date(g.created_at)) / 3600000).toFixed(1)
    : null;
  const slaBreached = slaElapsed && !g.resolved_at && parseFloat(slaElapsed) > g.sla_hours;

  const publicComments = (g.comments || []).filter(c => !c.is_internal);
  const internalNotes = (g.comments || []).filter(c => c.is_internal);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-start justify-center pt-4 pb-4 overflow-y-auto">
      <div className="relative bg-[#0b1424] border border-slate-800 rounded-3xl shadow-2xl w-full max-w-3xl mx-3 flex flex-col overflow-hidden">
        
        {/* ── Manga-Inspired Modal Header ───────────────────────────────────── */}
        <div className="bg-[#080e1a] border-b border-slate-800 px-6 py-4.5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <code className="text-xs font-mono font-bold text-blue-300 bg-blue-950/80 px-2.5 py-0.5 rounded border border-blue-800">
                  {g.grievance_code}
                </code>
                <span className={`inline-flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${
                  g.status === 'Resolved'
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                    : g.status === 'Escalated'
                    ? 'bg-rose-950/80 text-rose-300 border-rose-700/60'
                    : 'bg-blue-950/80 text-blue-300 border-blue-700/60'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  {g.status}
                </span>
                {g.is_anonymous && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                    <Lock className="w-3 h-3 text-amber-400" /> Anonymous
                  </span>
                )}
                {slaBreached && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-700 animate-pulse">
                    <AlertTriangle className="w-3 h-3 text-rose-400" /> SLA Breached
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-black text-white leading-snug pr-2">
                {g.title}
              </h2>
            </div>
            
            <button
              onClick={() => setSelectedGrievance(null)}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0 border border-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <span className="flex items-center gap-1 font-medium"><Building2 className="w-3.5 h-3.5 text-blue-400" />{g.category_name}</span>
            <span className="flex items-center gap-1 font-medium"><Users className="w-3.5 h-3.5 text-blue-400" />{g.sub_authority_name}</span>
            {g.location && <span className="flex items-center gap-1 font-medium"><MapPin className="w-3.5 h-3.5 text-rose-400" />{g.location}</span>}
            <span className="flex items-center gap-1 font-mono text-[11px]"><Calendar className="w-3.5 h-3.5 text-slate-500" />{formatDate(g.created_at)}</span>
          </div>
        </div>

        {/* ── Body ────────────────────────────────────────────────────────── */}
        <div className="overflow-y-auto flex-1 max-h-[70vh]">
          <div className="px-6 py-5 space-y-4">

            {/* Author row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black text-white shadow-xs border ${
                  g.is_anonymous ? 'bg-amber-950 border-amber-800 text-amber-300' : 'bg-blue-600 border-blue-400'
                }`}>
                  {g.is_anonymous ? <Lock className="w-4 h-4" /> : g.author_name?.[0] || '?'}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{g.author_name}</p>
                  {g.author_department && <p className="text-xs text-slate-400">{g.author_department}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <button
                  onClick={() => toggleSupport(g.id)}
                  disabled={!canSupport}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold text-xs transition-all ${
                    canSupport
                      ? 'border-blue-700 bg-blue-950/60 text-blue-300 hover:bg-blue-900/60 cursor-pointer shadow-xs'
                      : 'border-slate-800 bg-slate-900 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{g.supports_count} Endorsements</span>
                </button>
                {canFlag && (
                  <button
                    onClick={() => setShowFlagModal(true)}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <Flag className="w-3.5 h-3.5" /> Flag
                  </button>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-[#080e1a] rounded-2xl p-4.5 border border-slate-800">
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{g.description}</p>
            </div>

            {/* Evidence */}
            {g.evidence_urls && g.evidence_urls.length > 0 && (
              <div>
                <p className="text-xs font-mono font-bold text-slate-400 mb-2 flex items-center gap-1 uppercase tracking-wider">
                  <Paperclip className="w-3.5 h-3.5 text-blue-400" /> Evidence Attached ({g.evidence_urls.length})
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {g.evidence_urls.map((url, i) => (
                    url.startsWith('data:image') ? (
                      <img key={i} src={url} alt={`evidence-${i}`} className="w-24 h-24 object-cover rounded-xl border border-slate-700 cursor-pointer hover:border-blue-400 transition-all" />
                    ) : (
                      <a key={i} href={url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-blue-300 bg-blue-950/80 border border-blue-800 px-3 py-2 rounded-xl hover:bg-blue-900/80 transition-colors">
                        <FileText className="w-3.5 h-3.5 text-blue-400" /> File {i + 1}
                      </a>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Tracking token — only visible to the reporter if anon */}
            {g.tracking_token && isOwner && g.is_anonymous && (
              <div className="flex items-center gap-2 bg-amber-950/40 border border-amber-700/60 rounded-xl px-4 py-2.5">
                <Hash className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs text-amber-300">Your secret tracking token: </span>
                <code className="text-xs font-mono font-bold text-amber-200 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">{g.tracking_token}</code>
              </div>
            )}

            {/* SLA chip */}
            {g.sla_hours && !g.resolved_at && (
              <div className={`flex items-center gap-2 text-xs px-3.5 py-2.5 rounded-xl border ${slaBreached ? 'bg-rose-950/40 border-rose-800 text-rose-300' : 'bg-blue-950/40 border-blue-800 text-blue-300'}`}>
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>SLA: {g.sla_hours}h target &bull; {slaElapsed}h elapsed {slaBreached ? '— OVERDUE' : ''}</span>
              </div>
            )}

            {/* Status Change Panel (authority/admin) */}
            {isAuthoritative && nextStatuses.length > 0 && (
              <div className="border border-indigo-800/60 rounded-2xl overflow-hidden bg-[#080e1a]">
                <button
                  onClick={() => setShowStatusPanel(p => !p)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-indigo-950/60 text-xs font-black uppercase tracking-wider text-indigo-300 hover:bg-indigo-900/60 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-indigo-400" /> Transition FSM Status</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showStatusPanel ? 'rotate-180' : ''}`} />
                </button>
                {showStatusPanel && (
                  <div className="p-4 space-y-3 border-t border-indigo-800/60">
                    <div className="flex flex-wrap gap-2">
                      {nextStatuses.map(ns => (
                        <button
                          key={ns}
                          onClick={() => setSelectedNextStatus(ns)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                            selectedNextStatus === ns
                              ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30'
                              : 'bg-[#0b1424] text-slate-300 border-slate-700 hover:border-slate-500'
                          }`}
                        >
                          {ns}
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={transitionNote}
                      onChange={e => setTransitionNote(e.target.value)}
                      placeholder="Add an official note for this status change (recorded on audit trail)..."
                      rows={2}
                      className="w-full text-xs bg-[#0b1424] border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 resize-none"
                    />
                    <button
                      onClick={handleStatusTransition}
                      disabled={!selectedNextStatus || loading}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black uppercase tracking-wider rounded-xl disabled:opacity-50 hover:from-blue-500 hover:to-indigo-500 transition-all cursor-pointer border border-blue-400/30"
                    >
                      {loading ? 'Updating…' : `Confirm Transition to ${selectedNextStatus || '…'}`}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Feedback panel (owner, after resolve) */}
            {canFeedback && (
              <div className="border border-emerald-800/60 rounded-2xl overflow-hidden bg-[#080e1a]">
                <button
                  onClick={() => setShowFeedbackPanel(p => !p)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-emerald-950/60 text-xs font-black uppercase tracking-wider text-emerald-300 hover:bg-emerald-900/60 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2"><Star className="w-4 h-4 text-emerald-400" /> Submit Feedback on Resolution</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFeedbackPanel ? 'rotate-180' : ''}`} />
                </button>
                {showFeedbackPanel && (
                  <div className="p-4 space-y-3 border-t border-emerald-800/60">
                    <p className="text-xs text-slate-300">Was your grievance resolved satisfactorily?</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setFeedbackOk(true)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${feedbackOk === true ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-[#0b1424] border-slate-700 text-slate-300'}`}
                      >
                        <CheckCircle2 className="w-4 h-4" /> Yes, resolved
                      </button>
                      <button
                        onClick={() => setFeedbackOk(false)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${feedbackOk === false ? 'bg-rose-600 text-white border-rose-500' : 'bg-[#0b1424] border-slate-700 text-slate-300'}`}
                      >
                        <AlertTriangle className="w-4 h-4" /> Not resolved
                      </button>
                    </div>
                    <textarea
                      value={feedbackComment}
                      onChange={e => setFeedbackComment(e.target.value)}
                      placeholder="Any additional feedback? (optional)"
                      rows={2}
                      className="w-full text-xs bg-[#0b1424] border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 resize-none"
                    />
                    <button
                      onClick={handleFeedback}
                      disabled={feedbackOk === null || loading}
                      className="px-4 py-2 bg-emerald-600 text-white text-xs font-black uppercase tracking-wider rounded-xl disabled:opacity-50 hover:bg-emerald-500 transition-colors cursor-pointer"
                    >
                      {loading ? 'Submitting…' : 'Submit Feedback'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Existing feedback display */}
            {g.feedback && (
              <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${g.feedback.resolved_ok ? 'bg-emerald-950/30 border-emerald-800' : 'bg-amber-950/30 border-amber-800'}`}>
                {g.feedback.resolved_ok
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  : <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                }
                <div>
                  <p className={`text-xs font-bold ${g.feedback.resolved_ok ? 'text-emerald-300' : 'text-amber-300'}`}>
                    Student Feedback: {g.feedback.resolved_ok ? 'Confirmed Resolved' : 'Issue Persists'}
                  </p>
                  {g.feedback.comment && <p className="text-xs text-slate-300 mt-0.5">{g.feedback.comment}</p>}
                </div>
              </div>
            )}

            {/* Reopen panel */}
            {canReopen && (
              <div className="border border-violet-800/60 rounded-2xl overflow-hidden bg-[#080e1a]">
                <button
                  onClick={() => setShowReopenPanel(p => !p)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-violet-950/60 text-xs font-black uppercase tracking-wider text-violet-300 hover:bg-violet-900/60 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 text-violet-400" /> Reopen Grievance</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showReopenPanel ? 'rotate-180' : ''}`} />
                </button>
                {showReopenPanel && (
                  <div className="p-4 space-y-3 border-t border-violet-800/60">
                    <p className="text-xs text-slate-300">Please explain why the issue persists.</p>
                    <textarea
                      value={reopenNote}
                      onChange={e => setReopenNote(e.target.value)}
                      placeholder="Describe why this grievance should be reopened..."
                      rows={2}
                      className="w-full text-xs bg-[#0b1424] border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-violet-400 resize-none"
                    />
                    <button
                      onClick={handleReopen}
                      disabled={loading}
                      className="px-4 py-2 bg-violet-600 text-white text-xs font-black uppercase tracking-wider rounded-xl disabled:opacity-50 hover:bg-violet-500 transition-colors cursor-pointer"
                    >
                      {loading ? 'Reopening…' : 'Reopen Grievance'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── Tabs: Comments / History ─────────────────────────────── */}
            <div className="border-b border-slate-800 flex gap-2 pt-2">
              {['comments', 'history'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  {tab === 'comments' ? (
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                      Comments
                      {publicComments.length > 0 && (
                        <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-1.5 py-0.5 rounded-full font-mono">
                          {publicComments.length}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Status Timeline
                      <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded-full font-mono">
                        {(g.history || []).length}
                      </span>
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Comments Tab */}
            {activeTab === 'comments' && (
              <div className="space-y-4">
                {/* Internal notes (authority/admin only) */}
                {isAuthoritative && internalNotes.length > 0 && (
                  <div>
                    <p className="text-[10px] font-mono font-black uppercase tracking-wider text-amber-400 flex items-center gap-1 mb-2">
                      <Lock className="w-3 h-3" /> INTERNAL NOTES (Officer-Only View)
                    </p>
                    <div className="space-y-2">
                      {internalNotes.map(note => (
                        <div key={note.id} className="bg-amber-950/30 border border-amber-700/60 rounded-xl px-3.5 py-2.5">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-amber-300">{note.author_name}</span>
                            <span className="text-[10px] text-amber-400 font-mono">{relativeTime(note.created_at)}</span>
                          </div>
                          <p className="text-xs text-amber-200 leading-relaxed">{note.body}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Public comments */}
                <div className="space-y-3">
                  {publicComments.length === 0 ? (
                    <p className="text-center text-xs text-slate-500 py-6">No public comments yet. Post an update below.</p>
                  ) : (
                    publicComments.map(c => (
                      <div key={c.id} className="flex gap-3">
                        <div className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center text-xs font-bold text-white border ${
                          c.author_role === 'authority' || c.author_role === 'admin' 
                            ? 'bg-indigo-600 border-indigo-400' 
                            : 'bg-slate-800 border-slate-700'
                        }`}>
                          {c.is_anonymous ? <Lock className="w-3.5 h-3.5" /> : c.author_name?.[0] || '?'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-white">{c.author_name}</span>
                            {(c.author_role === 'authority' || c.author_role === 'admin') && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-mono text-indigo-300 bg-indigo-950/80 border border-indigo-800 px-1.5 py-0.2 rounded">
                                <ShieldCheck className="w-2.5 h-2.5" /> Official
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-slate-500 ml-auto">{relativeTime(c.created_at)}</span>
                          </div>
                          <div className="bg-[#080e1a] rounded-xl rounded-tl-sm px-3.5 py-2.5 border border-slate-800">
                            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{c.body}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Comment input */}
                {currentUser && (
                  <div className="border border-slate-800 rounded-2xl p-3.5 space-y-2.5 bg-[#080e1a]">
                    {isAuthoritative && (
                      <div className="flex gap-2 mb-1">
                        <button
                          onClick={() => setIsAnonComment(false)}
                          className={`text-xs px-3 py-1 rounded-lg border font-bold transition-all cursor-pointer ${!isAnonComment ? 'bg-blue-600 text-white border-blue-400' : 'border-slate-700 text-slate-400'}`}
                        >
                          <Eye className="w-3 h-3 inline mr-1" /> Public Response
                        </button>
                        <button
                          onClick={() => setIsAnonComment(true)}
                          className={`text-xs px-3 py-1 rounded-lg border font-bold transition-all cursor-pointer ${isAnonComment ? 'bg-amber-600 text-white border-amber-400' : 'border-slate-700 text-slate-400'}`}
                        >
                          <Lock className="w-3 h-3 inline mr-1" /> Internal Note
                        </button>
                      </div>
                    )}
                    {isStudent && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsAnonComment(p => !p)}
                          className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${isAnonComment ? 'bg-slate-700 text-white border-slate-600' : 'border-slate-800 text-slate-400 hover:border-slate-600'}`}
                        >
                          {isAnonComment ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          {isAnonComment ? 'Posting anonymously' : 'Post anonymously'}
                        </button>
                      </div>
                    )}
                    <form onSubmit={handlePostComment} className="flex gap-2">
                      <textarea
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        placeholder={isAnonComment && isAuthoritative ? 'Internal note (only visible to authority & admin)...' : 'Add a comment…'}
                        rows={2}
                        className="flex-1 text-xs sm:text-sm bg-[#0b1424] border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 resize-none"
                      />
                      <button
                        type="submit"
                        disabled={!newComment.trim() || loading}
                        className="self-end px-3.5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl disabled:opacity-40 transition-colors cursor-pointer border border-blue-400/30"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <StatusTimeline history={g.history || []} currentStatus={g.status} />
            )}
          </div>
        </div>
      </div>

      {/* Flag Modal */}
      {showFlagModal && (
        <div className="fixed inset-0 bg-black/80 z-60 flex items-center justify-center p-4" onClick={() => setShowFlagModal(false)}>
          <div className="bg-[#0b1424] border border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-5 space-y-3" onClick={e => e.stopPropagation()}>
            <h3 className="font-black text-sm uppercase tracking-wider text-white flex items-center gap-2"><Flag className="w-4 h-4 text-rose-400" /> Flag Grievance</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Please explain why this grievance is being flagged for admin review.</p>
            <textarea
              value={flagReason}
              onChange={e => setFlagReason(e.target.value)}
              placeholder="Reason for flagging..."
              rows={3}
              className="w-full text-xs bg-[#080e1a] border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-rose-400 resize-none"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowFlagModal(false)} className="flex-1 py-2 text-xs font-bold border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-800 cursor-pointer">Cancel</button>
              <button onClick={handleFlag} disabled={!flagReason.trim() || loading} className="flex-1 py-2 text-xs font-black uppercase tracking-wider bg-rose-600 text-white rounded-xl disabled:opacity-50 hover:bg-rose-500 transition-colors cursor-pointer">
                {loading ? 'Flagging…' : 'Submit Flag'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
