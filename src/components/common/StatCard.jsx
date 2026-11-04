import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  badgeText,
  badgeVariant = 'default',
  watermark = 'METRIC',
  onClick,
  className = ''
}) {
  const badgeColors = {
    default: 'bg-slate-100 text-slate-800 border-slate-900',
    amber: 'bg-amber-300 text-slate-950 border-slate-900',
    blue: 'bg-blue-300 text-slate-950 border-slate-900',
    emerald: 'bg-emerald-300 text-slate-950 border-slate-900',
    purple: 'bg-purple-300 text-slate-950 border-slate-900',
    rose: 'bg-rose-300 text-slate-950 border-slate-900'
  };

  return (
    <div
      onClick={onClick}
      className={`relative bg-white border-2 border-slate-900 rounded-sm p-4 shadow-[3px_3px_0px_#0f172a] transition-all overflow-hidden ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-[4.5px_4.5px_0px_#0f172a]' : ''
      } ${className}`}
    >
      {/* Subtle Halftone Dot Layer */}
      <div className="absolute inset-0 manga-halftone pointer-events-none" />

      {/* Watermark in the background */}
      <div className="absolute -right-1 -bottom-3 text-5xl font-black text-slate-900/[0.04] select-none pointer-events-none font-mono uppercase">
        {watermark}
      </div>

      <div className="relative z-10 flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-wider text-slate-600 font-mono">
          {title}
        </p>
        {Icon && (
          <div className="w-8 h-8 rounded-sm bg-slate-100 border-2 border-slate-900 text-slate-900 flex items-center justify-center shadow-[1.5px_1.5px_0px_#0f172a]">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="relative z-10 mt-3 flex items-baseline justify-between gap-2">
        <p className="text-3xl font-black text-slate-900 tracking-tight font-mono">
          {value ?? 0}
        </p>
        {badgeText && (
          <span className={`text-[10px] px-2 py-0.5 rounded font-black border-2 shadow-[1px_1px_0px_#0f172a] uppercase ${badgeColors[badgeVariant] || badgeColors.default}`}>
            {badgeText}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="relative z-10 text-[11px] font-medium text-slate-500 mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
}
