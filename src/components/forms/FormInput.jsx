import React from 'react';

export default function FormInput({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  helperText,
  icon: Icon,
  endAdornment,
  className = '',
  inputClassName = '',
  ...props
}) {
  const inputId = id || name;

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-black uppercase tracking-wider text-slate-800 font-mono">
          {label} {required && <span className="text-rose-600">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 text-slate-500 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full text-sm bg-white border-2 border-slate-900 rounded-sm py-2 px-3 text-slate-900 placeholder-slate-400 font-medium transition-all focus:outline-hidden focus:border-blue-600 shadow-[2px_2px_0px_#0f172a] focus:shadow-[3px_3px_0px_#2563eb] ${
            Icon ? 'pl-9' : ''
          } ${endAdornment ? 'pr-10' : ''} ${
            error
              ? 'border-rose-600 focus:border-rose-600 focus:shadow-[3px_3px_0px_#e11d48]'
              : ''
          } disabled:bg-slate-100 disabled:opacity-60 ${inputClassName}`}
          {...props}
        />
        {endAdornment && (
          <div className="absolute right-2.5 flex items-center">
            {endAdornment}
          </div>
        )}
      </div>
      {error ? (
        <p className="text-xs text-rose-600 font-bold">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-500 font-mono">{helperText}</p>
      ) : null}
    </div>
  );
}
