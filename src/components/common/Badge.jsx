import React from 'react';

export function StatusBadge({ status }) {
  const normalized = (status || '').toLowerCase();
  
  let styles = 'bg-slate-100 text-slate-800 border-slate-900';
  let tag = 'LOG';

  if (normalized.includes('submitted')) {
    styles = 'bg-blue-100 text-blue-950 border-slate-900';
    tag = 'RECEIVED';
  } else if (normalized.includes('review') || normalized.includes('pending')) {
    styles = 'bg-amber-100 text-amber-950 border-slate-900';
    tag = 'IN REVIEW';
  } else if (normalized.includes('assigned')) {
    styles = 'bg-purple-100 text-purple-950 border-slate-900';
    tag = 'ASSIGNED';
  } else if (normalized.includes('progress')) {
    styles = 'bg-cyan-100 text-cyan-950 border-slate-900';
    tag = 'IN ACTION';
  } else if (normalized.includes('resolved') || normalized.includes('closed')) {
    styles = 'bg-emerald-100 text-emerald-950 border-slate-900';
    tag = 'RESOLVED';
  } else if (normalized.includes('escalated')) {
    styles = 'bg-orange-100 text-orange-950 border-slate-900';
    tag = 'ESCALATED';
  } else if (normalized.includes('reject')) {
    styles = 'bg-rose-100 text-rose-950 border-slate-900';
    tag = 'REJECTED';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold border-2 shadow-[2px_2px_0px_#0f172a] ${styles}`}>
      <span className="text-[10px] font-mono opacity-70 border-r border-slate-900/30 pr-1 select-none font-bold">
        {tag}
      </span>
      <span>{status || 'Unknown'}</span>
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const p = (priority || '').toLowerCase();
  let styles = 'bg-slate-100 text-slate-800 border-slate-900';
  let tag = 'NORM';
  
  if (p === 'critical' || p === 'urgent') {
    styles = 'bg-red-500 text-white border-slate-900';
    tag = 'URGENT';
  } else if (p === 'high') {
    styles = 'bg-orange-400 text-slate-950 border-slate-900';
    tag = 'HIGH';
  } else if (p === 'medium') {
    styles = 'bg-amber-200 text-slate-950 border-slate-900';
    tag = 'MED';
  } else if (p === 'low') {
    styles = 'bg-slate-200 text-slate-800 border-slate-900';
    tag = 'LOW';
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold border-2 shadow-[1.5px_1.5px_0px_#0f172a] ${styles}`}>
      <span className="text-[10px] select-none opacity-80 font-mono">[{tag}]</span>
      <span>{priority || 'Normal'}</span>
    </span>
  );
}

export function RoleBadge({ role }) {
  const r = (role || '').toLowerCase();
  let styles = 'bg-slate-100 text-slate-900 border-slate-900';
  let label = role;
  let tag = 'MEMBER';

  if (r === 'admin') {
    styles = 'bg-purple-200 text-purple-950 border-slate-900';
    label = 'Administrator';
    tag = 'ADMIN';
  } else if (r === 'authority' || r === 'faculty') {
    styles = 'bg-blue-200 text-blue-950 border-slate-900';
    label = 'Faculty / Warden';
    tag = 'FACULTY';
  } else if (r === 'student') {
    styles = 'bg-emerald-200 text-emerald-950 border-slate-900';
    label = 'Student';
    tag = 'STUDENT';
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold border-2 shadow-[1.5px_1.5px_0px_#0f172a] ${styles}`}>
      <span className="text-[10px] select-none font-mono opacity-70">[{tag}]</span>
      <span>{label}</span>
    </span>
  );
}

export default StatusBadge;
