import React from 'react';
import { Check, AlertTriangle, AlertCircle } from 'lucide-react';

const DEFAULT_STAGES = [
  { id: 'Submitted', label: 'Submitted', phase: 'Phase 01 // Filed' },
  { id: 'Under review', label: 'Under Review', phase: 'Phase 02 // Scrutiny' },
  { id: 'Assigned', label: 'Assigned', phase: 'Phase 03 // Routing' },
  { id: 'In progress', label: 'In Progress', phase: 'Phase 04 // Remediation' },
  { id: 'Resolved', label: 'Resolved', phase: 'Phase 05 // Certified' },
  { id: 'Closed', label: 'Closed', phase: 'Final // Complete' }
];

export default function StatusTimeline({ currentStatus = 'Submitted', history = [] }) {
  const normCurrent = (currentStatus || '').toLowerCase();

  let currentIndex = DEFAULT_STAGES.findIndex(s => s.id.toLowerCase() === normCurrent);
  if (currentIndex === -1) {
    if (normCurrent.includes('progress')) currentIndex = 3;
    else if (normCurrent.includes('resolved')) currentIndex = 4;
    else if (normCurrent.includes('closed')) currentIndex = 5;
    else currentIndex = 0;
  }

  const isRejected = normCurrent.includes('reject');
  const isEscalated = normCurrent.includes('escalat');

  return (
    <div className="w-full py-2">
      {/* Alert banner for special statuses like Rejected or Escalated */}
      {isRejected && (
        <div className="mb-4 p-3.5 bg-rose-50 border-2 border-slate-900 rounded-sm text-xs text-rose-900 font-bold flex items-center gap-2 shadow-[2px_2px_0px_#000]">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>Case rejected by authority. Grievance closed with formal justification on file.</span>
        </div>
      )}

      {isEscalated && (
        <div className="mb-4 p-3.5 bg-amber-50 border-2 border-slate-900 rounded-sm text-xs text-amber-950 font-bold flex items-center gap-2 shadow-[2px_2px_0px_#000]">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>Case escalated to Central Proctorial Board due to resolution timeline threshold!</span>
        </div>
      )}

      {/* Progress Steps Timeline */}
      <div className="relative">
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[550px] flex items-center justify-between relative py-2">
            {/* Background connecting bar */}
            <div className="absolute top-7 left-6 right-6 h-1 bg-slate-900 -z-0" />

            {DEFAULT_STAGES.map((stage, idx) => {
              const isPast = idx < currentIndex;
              const isCurrent = idx === currentIndex;

              return (
                <div key={stage.id} className="flex flex-col items-center relative z-10 px-2 text-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-sm flex items-center justify-center text-xs font-black border-2 border-slate-900 transition-all font-mono ${
                      isPast
                        ? 'bg-emerald-400 text-slate-950 shadow-[2px_2px_0px_#000]'
                        : isCurrent
                        ? 'bg-blue-600 text-white shadow-[3px_3px_0px_#000] scale-110'
                        : 'bg-white text-slate-400 shadow-[1px_1px_0px_#000]'
                    }`}
                  >
                    {isPast ? <Check className="w-5 h-5 stroke-[3]" /> : `0${idx + 1}`}
                  </div>
                  <span
                    className={`mt-2 text-xs font-black uppercase font-mono ${
                      isCurrent
                        ? 'text-blue-700 underline underline-offset-2'
                        : isPast
                        ? 'text-slate-900'
                        : 'text-slate-400'
                    }`}
                  >
                    {stage.label}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">
                    {stage.phase}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* History timeline list if available */}
      {history.length > 0 && (
        <div className="mt-6 border-t-2 border-slate-900 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 font-mono">
              AUDIT TRAIL LOG // TIMELINE HISTORY
            </h4>
            <span className="text-[10px] font-mono text-slate-500">TAMPER-EVIDENT</span>
          </div>

          <div className="space-y-3">
            {history.map((h, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs bg-slate-50 border-2 border-slate-900 p-2.5 rounded-sm shadow-[1.5px_1.5px_0px_#000]">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 border border-slate-900 mt-1 shrink-0" />
                <div className="flex-1">
                  <p className="text-slate-900 font-bold">
                    {h.status || h.action} — <span className="font-medium text-slate-600">{h.note || h.comment || 'Status transitioned'}</span>
                  </p>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                    Authorized by {h.by || h.updatedBy || 'Authority'} on {h.timestamp || h.date || 'Record Date'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
