import React from 'react';
import { Sparkles } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  title = 'No records in this panel!',
  description = 'Everything is currently peaceful and up-to-date in this section.',
  actionLabel,
  onAction,
  speechText = 'Nothing to report! All clear!',
  className = ''
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center max-w-sm mx-auto ${className}`}>
      {/* Manga Speech Bubble */}
      <div className="relative mb-6">
        <div className="manga-bubble px-4 py-2.5 bg-white text-xs font-bold text-slate-800 tracking-tight">
          <span className="text-blue-600 mr-1.5">💬</span>
          <span>{speechText}</span>
        </div>
      </div>

      {/* Comic character / icon emblem */}
      <div className="w-14 h-14 rounded-full bg-amber-300 border-2 border-slate-900 text-slate-950 flex items-center justify-center mb-3 shadow-[2.5px_2.5px_0px_#0f172a] transform -rotate-3 hover:rotate-0 transition-transform">
        <Sparkles className="w-7 h-7 text-slate-950" />
      </div>

      <h4 className="text-sm font-extrabold uppercase tracking-wide text-slate-900">{title}</h4>
      <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
