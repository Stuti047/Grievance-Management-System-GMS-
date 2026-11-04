import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export default function Toast() {
  const { toasts, removeToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-3">
      {toasts.map(toast => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
          error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
          info: <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        };

        const borderStyles = {
          success: 'bg-emerald-50 border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] text-slate-900',
          error: 'bg-rose-50 border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] text-slate-900',
          warning: 'bg-amber-50 border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] text-slate-900',
          info: 'bg-blue-50 border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] text-slate-900'
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-sm border text-sm transition-all duration-300 animate-in slide-in-from-top-2 ${borderStyles[toast.type] || borderStyles.info}`}
          >
            {icons[toast.type] || icons.info}
            <div className="flex-1 min-w-0">
              <p className="font-black text-slate-950 font-mono text-xs uppercase tracking-tight">{toast.title}</p>
              <p className="text-slate-700 text-xs mt-0.5 leading-relaxed font-medium break-words">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-500 hover:text-slate-900 p-0.5 rounded cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
