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
          success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />,
          error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />,
          info: <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        };

        const borderStyles = {
          success: 'border-emerald-500/60 bg-[#0b1424] shadow-lg shadow-emerald-950/40 text-emerald-300',
          error: 'border-rose-500/60 bg-[#0b1424] shadow-lg shadow-rose-950/40 text-rose-300',
          warning: 'border-amber-500/60 bg-[#0b1424] shadow-lg shadow-amber-950/40 text-amber-300',
          info: 'border-blue-500/60 bg-[#0b1424] shadow-lg shadow-blue-950/40 text-blue-300'
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border text-sm transition-all duration-300 animate-in slide-in-from-top-2 ${borderStyles[toast.type] || borderStyles.info}`}
          >
            {icons[toast.type] || icons.info}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-xs sm:text-sm tracking-tight">{toast.title}</p>
              <p className="text-slate-300 text-xs mt-0.5 leading-relaxed break-words">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-0.5 rounded transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
