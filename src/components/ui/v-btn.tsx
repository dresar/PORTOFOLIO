'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { VIcon } from './v-icon';

export interface VBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'tonal' | 'outlined' | 'danger' | 'text';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  prependIcon?: string;
  appendIcon?: string;
}

export function VBtn({
  children,
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  prependIcon,
  appendIcon,
  ...props
}: VBtnProps) {
  const sizeClasses = {
    sm: 'h-8 px-3 text-xs gap-1.5 font-medium',
    md: 'h-9 px-4 text-sm gap-2 font-medium',
    lg: 'h-11 px-6 text-base gap-2.5 font-semibold',
  };

  const variantClasses = {
    primary:
      'bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-500/20 border border-blue-500/30 hover:border-blue-400',
    tonal:
      'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20',
    outlined:
      'bg-transparent hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600',
    danger:
      'bg-red-600 hover:bg-red-500 text-white shadow-sm shadow-red-500/20 border border-red-500/30',
    text: 'bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white',
  };

  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-lg transition-all duration-150 select-none cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
        'active:scale-[0.98]',
        'disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {loading ? (
        <VIcon name="fa-solid fa-spinner" className="w-4 h-4 animate-spin" />
      ) : prependIcon ? (
        <VIcon name={prependIcon} className="w-4 h-4" />
      ) : null}
      {children}
      {!loading && appendIcon ? (
        <VIcon name={appendIcon} className="w-4 h-4" />
      ) : null}
    </button>
  );
}
