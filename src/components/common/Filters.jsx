import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

export default function Filters({
  filters = {},
  onChange,
  onReset,
  categories = [],
  departments = [],
  statuses = [
    'Submitted',
    'Under review',
    'Assigned',
    'In progress',
    'Resolved',
    'Escalated',
    'Closed'
  ],
  priorities = ['Low', 'Medium', 'High', 'Critical'],
  className = ''
}) {
  const handleChange = (key, value) => {
    onChange && onChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = Object.values(filters).some(v => Boolean(v) && v !== 'All');

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {/* Status Filter */}
      <div className="flex items-center gap-1.5 text-xs text-slate-600">
        <label className="font-medium text-slate-700">Status:</label>
        <select
          value={filters.status || 'All'}
          onChange={(e) => handleChange('status', e.target.value)}
          className="text-xs bg-white border border-slate-300 rounded px-2 py-1.5 text-slate-700 focus:outline-hidden focus:border-slate-500"
        >
          <option value="All">All Statuses</option>
          {statuses.map((st) => (
            <option key={st} value={st}>{st}</option>
          ))}
        </select>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <label className="font-medium text-slate-700">Category:</label>
          <select
            value={filters.category || 'All'}
            onChange={(e) => handleChange('category', e.target.value)}
            className="text-xs bg-white border border-slate-300 rounded px-2 py-1.5 text-slate-700 focus:outline-hidden focus:border-slate-500"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => {
              const name = typeof c === 'string' ? c : (c.name || c.id);
              return <option key={name} value={name}>{name}</option>;
            })}
          </select>
        </div>
      )}

      {/* Priority Filter */}
      {priorities.length > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <label className="font-medium text-slate-700">Priority:</label>
          <select
            value={filters.priority || 'All'}
            onChange={(e) => handleChange('priority', e.target.value)}
            className="text-xs bg-white border border-slate-300 rounded px-2 py-1.5 text-slate-700 focus:outline-hidden focus:border-slate-500"
          >
            <option value="All">All Priorities</option>
            {priorities.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      )}

      {/* Reset button */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 px-2 py-1.5 rounded hover:bg-slate-100 transition-colors"
          title="Reset filters"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      )}
    </div>
  );
}

