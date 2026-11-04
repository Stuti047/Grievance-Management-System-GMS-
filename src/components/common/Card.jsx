import React from 'react';

export default function Card({
  children,
  title,
  subtitle,
  tag,
  action,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  variant = 'default',
  ...props
}) {
  const panelStyles = variant === 'dark'
    ? 'bg-[#0b1322] text-white border-2 border-slate-800 shadow-[3px_3px_0px_#030712]'
    : variant === 'accent'
    ? 'bg-blue-50/50 border-2 border-slate-900 shadow-[3px_3px_0px_#2563eb]'
    : 'bg-white border-2 border-slate-900 shadow-[3.5px_3.5px_0px_#0f172a]';

  return (
    <div className={`rounded-sm overflow-hidden ${panelStyles} ${className}`} {...props}>
      {(title || subtitle || action || tag) && (
        <div className={`px-5 py-3.5 border-b-2 border-slate-900 flex flex-wrap items-center justify-between gap-3 bg-slate-50/90 ${headerClassName}`}>
          <div className="flex items-center gap-2.5">
            {tag && (
              <span className="text-[10px] font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded-xs select-none">
                {tag}
              </span>
            )}
            <div>
              {title && (
                <h3 className="text-sm font-extrabold uppercase tracking-tight text-slate-900">
                  {title}
                </h3>
              )}
              {subtitle && <p className="text-[11px] text-slate-500">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={`p-5 ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
}
