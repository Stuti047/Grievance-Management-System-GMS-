import React from 'react';

export default function FormTextarea({
  label,
  id,
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
  required = false,
  disabled = false,
  maxLength,
  error,
  helperText,
  className = '',
  textareaClassName = '',
  ...props
}) {
  const textareaId = id || name;

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center justify-between">
        {label && (
          <label htmlFor={textareaId} className="block text-xs font-black uppercase tracking-wider text-slate-800 font-mono">
            {label} {required && <span className="text-rose-600">*</span>}
          </label>
        )}
        {maxLength && (
          <span className="text-[10px] font-mono font-bold text-slate-400">
            {(value || '').length}/{maxLength}
          </span>
        )}
      </div>
      <textarea
        id={textareaId}
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full text-sm bg-white border-2 border-slate-900 rounded-sm py-2 px-3 text-slate-900 placeholder-slate-400 font-medium transition-all focus:outline-hidden focus:border-blue-600 shadow-[2px_2px_0px_#0f172a] focus:shadow-[3px_3px_0px_#2563eb] ${
          error
            ? 'border-rose-600 focus:border-rose-600 focus:shadow-[3px_3px_0px_#e11d48]'
            : ''
        } disabled:bg-slate-100 disabled:opacity-60 ${textareaClassName}`}
        {...props}
      />
      {error ? (
        <p className="text-xs text-rose-600 font-bold">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-500 font-mono">{helperText}</p>
      ) : null}
    </div>
  );
}
