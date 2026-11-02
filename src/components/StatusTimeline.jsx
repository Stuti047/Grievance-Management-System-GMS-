import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Lock, 
  ShieldCheck, 
  ArrowRight, 
  Hash, 
  User, 
  Calendar,
  AlertCircle,
  FileText
} from 'lucide-react';
import { STATUS_META } from '../utils/fsm';

/**
 * Format ISO date string into Indian Standard Time (IST)
 * Example: "19 Oct 2026, 01:14 PM IST"
 */
function formatIST(isoDate) {
  if (!isoDate) return 'Pending timestamp';
  try {
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return String(isoDate);

    const formatted = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(d);

    return `${formatted} IST`;
  } catch {
    return String(isoDate);
  }
}

/**
 * Robust STATUS_META lookup with case insensitivity and fallback
 */
function getStatusMeta(status) {
  if (!status) {
    return {
      label: 'Status Update',
      badge: 'bg-slate-900 text-slate-300 border-slate-700',
      dot: 'bg-slate-500',
      text: 'text-slate-300',
      bg: 'bg-slate-900',
      border: 'border-slate-800',
      description: ''
    };
  }

  if (STATUS_META && STATUS_META[status]) {
    return STATUS_META[status];
  }

  if (STATUS_META) {
    const key = Object.keys(STATUS_META).find(
      k => k.toLowerCase() === String(status).toLowerCase()
    );
    if (key && STATUS_META[key]) {
      return STATUS_META[key];
    }
  }

  return {
    label: status,
    badge: 'bg-blue-950/80 text-blue-300 border-blue-800',
    dot: 'bg-blue-500',
    text: 'text-blue-300',
    bg: 'bg-blue-950/40',
    border: 'border-blue-800',
    description: ''
  };
}

/**
 * Visual pill styling for actor roles
 */
function getActorRoleMeta(role) {
  const r = (role || '').toLowerCase();
  if (r === 'admin') {
    return {
      label: 'Admin / Proctor',
      pillClass: 'bg-purple-950/80 text-purple-300 border-purple-700/60'
    };
  }
  if (r === 'authority') {
    return {
      label: 'Department Authority',
      pillClass: 'bg-blue-950/80 text-blue-300 border-blue-700/60'
    };
  }
  if (r === 'student') {
    return {
      label: 'Student',
      pillClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
    };
  }
  return {
    label: role ? (role.charAt(0).toUpperCase() + role.slice(1)) : 'System',
    pillClass: 'bg-slate-800 text-slate-300 border-slate-700'
  };
}

/**
 * StatusTimeline
 * 
 * Reusable vertical timeline component for complaint/grievance audit trails.
 */
export default function StatusTimeline({ history = [], currentStatus = '' }) {
  const safeHistory = Array.isArray(history) ? history : [];
  const currentMeta = getStatusMeta(currentStatus);

  if (safeHistory.length === 0) {
    return (
      <div className="py-8 px-4 text-center rounded-2xl bg-[#080e1a] border border-dashed border-slate-800">
        <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-60" />
        <p className="text-sm font-semibold text-slate-300">No audit trail records yet</p>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Transitions will be permanently recorded here with cryptographic hashes as authorities act on this ticket.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Timeline Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl bg-[#080e1a] border border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs border border-blue-400/30">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                Lifecycle & Immutable Audit Trail
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold border border-slate-700">
                {safeHistory.length} {safeHistory.length === 1 ? 'event' : 'events'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Append-only state machine ledger ordered chronologically
            </p>
          </div>
        </div>

        {currentStatus && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[11px] font-medium text-slate-400">Active State:</span>
            <span className="px-2.5 py-1 rounded text-xs font-mono font-bold border inline-flex items-center gap-1.5 bg-blue-950/80 text-blue-300 border-blue-800 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-blue-400 ring-2 ring-blue-900" />
              {currentStatus}
            </span>
          </div>
        )}
      </div>

      {/* Vertical Stepper Timeline */}
      <div className="relative pl-2 sm:pl-3">
        {safeHistory.map((item, index) => {
          const toStatus = item.to_status || item.toStatus || item.status || 'Updated';
          const fromStatus = item.from_status || item.fromStatus || null;
          const actorName = item.actor_name || item.actor || 'System Officer';
          const actorRole = item.actor_role || item.role || 'system';
          const noteText = item.note || item.text || item.comment || '';
          const timestamp = item.created_at || item.timestamp || item.date;
          const isInternal = Boolean(item.is_internal || item.isInternal);
          const hashValue = item.hash || item.sha256;

          const toMeta = getStatusMeta(toStatus);
          const fromMeta = fromStatus ? getStatusMeta(fromStatus) : null;
          const roleMeta = getActorRoleMeta(actorRole);
          const isLatest = index === safeHistory.length - 1;
          const isInitial = index === 0 && !fromStatus;

          return (
            <div 
              key={item.id || `hist-${index}`}
              className="relative pl-6 sm:pl-9 pb-8 last:pb-2 group transition-all duration-300 animate-in fade-in"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              {/* Connecting Vertical Line */}
              {!isLatest && (
                <div 
                  className="absolute left-[11px] sm:left-[17px] top-6 bottom-0 w-0.5 bg-slate-800 group-hover:bg-blue-500/50 transition-colors"
                  aria-hidden="true"
                />
              )}

              {/* Status Colored Dot */}
              <div 
                className={`absolute left-[5px] sm:left-[11px] top-1.5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full ring-4 ring-[#080e1a] shadow-xs flex items-center justify-center transition-transform group-hover:scale-110 ${
                  isInternal ? 'bg-amber-400' : 'bg-blue-500'
                }`}
                title={`Status: ${toStatus}`}
              >
                {isLatest && (
                  <span className={`absolute -inset-1 rounded-full animate-ping opacity-40 ${isInternal ? 'bg-amber-400' : 'bg-blue-400'}`} />
                )}
              </div>

              {/* Row Container Card */}
              <div 
                className={`rounded-2xl border p-4 sm:p-5 transition-all shadow-md ${
                  isInternal
                    ? 'bg-amber-950/30 border-amber-700/60 text-amber-200'
                    : isLatest
                    ? 'bg-[#0b1424] border-blue-500/60 shadow-blue-900/10'
                    : 'bg-[#0b1424] border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header Row: Status & Timestamp */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5 pb-2.5 border-b border-slate-800 border-dashed">
                  
                  {/* Status Transition Badge */}
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    {isInternal && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-mono font-black uppercase tracking-wider bg-amber-950 text-amber-300 border border-amber-700">
                        <Lock className="w-3 h-3 text-amber-400" />
                        Internal Note
                      </span>
                    )}

                    {fromStatus ? (
                      <div className="flex items-center flex-wrap gap-1.5 text-xs font-bold">
                        <span className="px-2 py-0.5 rounded border text-[11px] bg-slate-900 text-slate-300 border-slate-700">
                          {fromStatus}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="px-2 py-0.5 rounded border text-[11px] bg-blue-950/80 text-blue-300 border-blue-700">
                          {toStatus}
                        </span>
                      </div>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded border text-xs font-mono font-bold inline-flex items-center gap-1.5 bg-blue-950/80 text-blue-300 border-blue-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        {toStatus}
                      </span>
                    )}

                    {isInitial && (
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                        • Initial Lodging
                      </span>
                    )}
                  </div>

                  {/* IST Timestamp */}
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 shrink-0">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{formatIST(timestamp)}</span>
                  </div>
                </div>

                {/* Actor Identification Pill */}
                <div className="flex flex-wrap items-center gap-2 mb-2 text-xs">
                  <div className="inline-flex items-center gap-1.5 font-bold text-white">
                    <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                      <User className="w-3 h-3" />
                    </div>
                    <span>{actorName}</span>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border tracking-wide uppercase ${roleMeta.pillClass}`}>
                    {roleMeta.label}
                  </span>
                </div>

                {/* Note / Action Description */}
                {noteText ? (
                  <p className={`text-xs sm:text-sm leading-relaxed mt-1 whitespace-pre-wrap ${
                    isInternal ? 'text-amber-200' : 'text-slate-300'
                  }`}>
                    {noteText}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 italic mt-1">
                    No transition remarks logged for this state change.
                  </p>
                )}

                {/* Cryptographic SHA-256 Hash Display */}
                {hashValue && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center gap-2 text-[10px] text-slate-400 font-mono bg-[#080e1a] -mx-1 px-2.5 py-1.5 rounded border border-slate-800">
                    <Hash className="w-3 h-3 text-blue-400 shrink-0" />
                    <span className="text-blue-300 font-bold shrink-0">SHA-256:</span>
                    <span className="truncate text-slate-300 selection:bg-blue-900" title={hashValue}>
                      {hashValue}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Append-Only Cryptographic Ledger Guarantee Footer */}
      <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-center sm:justify-start gap-2 text-[11px] text-slate-400">
        <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
        <span className="font-medium text-slate-400">
          Audit trail is cryptographically immutable — protected by SHA-256 ledger chaining
        </span>
      </div>
    </div>
  );
}
