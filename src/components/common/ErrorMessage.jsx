import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export default function ErrorMessage({
  title,
  message,
  variant = 'error',
  onDismiss,
  className = ''
}) {
  if (!message && !title) return null;

  const styles = {
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
    },
    warning: {
      container: 'bg-amber-50 border-amber-200 text-amber-800',
      icon: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
    },
    success: {
      container: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
    }
  };

  const current = styles[variant] || styles.error;

  return (
    <div className={`p-3 rounded border text-xs flex items-start justify-between gap-2.5 ${current.container} ${className}`}>
      <div className="flex items-start gap-2">
        {current.icon}
        <div>
          {title && <p className="font-semibold">{title}</p>}
          {message && <p className={title ? 'mt-0.5' : ''}>{message}</p>}
        </div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="p-0.5 opacity-60 hover:opacity-100 transition-opacity"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

