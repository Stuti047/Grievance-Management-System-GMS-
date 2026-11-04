import React from 'react';
import { Clock } from 'lucide-react';

export default function RecentActivity({ activities = [] }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="py-8 text-center text-xs font-mono text-slate-500">
        No recent activity logged in this ledger.
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-6">
        {activities.map((act, actIdx) => {
          const isLast = actIdx === activities.length - 1;
          return (
            <li key={act.id || actIdx} className="relative pb-6">
              {!isLast && (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-900"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex items-start space-x-3">
                <div className="relative">
                  <div className="h-8 w-8 rounded-sm bg-amber-300 border-2 border-slate-900 flex items-center justify-center text-slate-950 shadow-[1.5px_1.5px_0px_#000]">
                    <Clock className="h-4 w-4" />
                  </div>
                </div>
                <div className="min-w-0 flex-1 pt-0.5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase tracking-tight">
                      {act.title || act.action || 'Activity recorded'}
                    </p>
                    <p className="text-[11px] text-slate-600 mt-0.5 font-medium leading-relaxed">
                      {act.description || act.note}
                    </p>
                    {act.ticketId && (
                      <span className="inline-block mt-1 text-[10px] font-mono font-bold text-blue-900 bg-blue-100 px-1.5 py-0.5 rounded border border-slate-900 shadow-[1px_1px_0px_#000]">
                        #{act.ticketId}
                      </span>
                    )}
                  </div>
                  <div className="whitespace-nowrap text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                    {act.timestamp || act.time || 'Recently'}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
