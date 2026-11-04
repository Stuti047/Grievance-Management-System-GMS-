import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  icon: Icon,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-bold tracking-tight border-2 border-slate-900 transition-all select-none cursor-pointer disabled:opacity-50 disabled:pointer-events-none active:translate-x-0.5 active:translate-y-0.5';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 rounded-sm gap-1.5 shadow-[2px_2px_0px_#0f172a] active:shadow-[1px_1px_0px_#0f172a]',
    md: 'text-sm px-4 py-2 rounded-sm gap-2 shadow-[3px_3px_0px_#0f172a] active:shadow-[1px_1px_0px_#0f172a]',
    lg: 'text-base px-5 py-2.5 rounded-md gap-2.5 shadow-[3.5px_3.5px_0px_#0f172a] active:shadow-[1.5px_1.5px_0px_#0f172a]'
  };

  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-500 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#0f172a]',
    institutional: 'bg-[#0b1322] text-white hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#0f172a]',
    manga: 'bg-amber-400 text-slate-950 hover:bg-amber-300 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#0f172a]',
    secondary: 'bg-white text-slate-900 hover:bg-slate-50 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#0f172a]',
    outline: 'bg-transparent text-slate-900 hover:bg-white/80 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#0f172a]',
    danger: 'bg-rose-600 text-white hover:bg-rose-500 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#0f172a]',
    success: 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#0f172a]',
    ghost: 'border-transparent shadow-none hover:bg-slate-200/70 text-slate-800 active:translate-x-0 active:translate-y-0',
    google: 'bg-white text-slate-700 hover:bg-slate-50 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#0f172a]'
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${className}`}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : variant === 'google' ? (
        <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
      ) : Icon ? (
        <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      ) : null}
      {children}
    </button>
  );
}
