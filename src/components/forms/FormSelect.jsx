import React from 'react';

export default function FormSelect({
  label,
  id,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  required = false,
  disabled = false,
  error,
  helperText,
  className = '',
  selectClassName = '',
  ...props
}) {
  const selectId = id || name;

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label htmlFor={selectId} className="block text-xs font-black uppercase tracking-wider text-slate-800 font-mono">
          {label} {required && <span className="text-rose-600">*</span>}
        </label>
      )}
      <select
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`w-full text-sm bg-white border-2 border-slate-900 rounded-sm py-2 px-3 text-slate-900 font-medium transition-all focus:outline-hidden focus:border-blue-600 shadow-[2px_2px_0px_#0f172a] focus:shadow-[3px_3px_0px_#2563eb] ${
          error
            ? 'border-rose-600 focus:border-rose-600 focus:shadow-[3px_3px_0px_#e11d48]'
            : ''
        } disabled:bg-slate-100 disabled:opacity-60 ${selectClassName}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => {
          const val = typeof opt === 'object' ? (opt.value ?? opt.id) : opt;
          const text = typeof opt === 'object' ? (opt.label ?? opt.name) : opt;
          return (
            <option key={val} value={val}>
              {text}
            </option>
          );
        })}
      </select>
      {error ? (
        <p className="text-xs text-rose-600 font-bold">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-500 font-mono">{helperText}</p>
      ) : null}
    </div>
  );
}
