'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { VIcon } from './v-icon';

export interface VTextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  prependInnerIcon?: string;
}

export function VTextField({
  label,
  error,
  hint,
  prependInnerIcon,
  className,
  id,
  ...props
}: VTextFieldProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-slate-300">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prependInnerIcon && (
          <div className="absolute left-3 text-slate-400 pointer-events-none">
            <VIcon name={prependInnerIcon} className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          className={cn(
            'w-full h-10 px-3.5 text-sm rounded-lg bg-slate-950 border transition-colors',
            'placeholder:text-slate-500 text-slate-100',
            'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500',
            prependInnerIcon ? 'pl-9' : '',
            error ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : 'border-slate-800 hover:border-slate-700',
            className
          )}
          {...props}
        />
      </div>
      {error ? (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <VIcon name="fa-solid fa-circle-xmark" className="w-3 h-3" />
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

export interface VTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function VTextarea({
  label,
  error,
  hint,
  className,
  id,
  rows = 4,
  ...props
}: VTextareaProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-slate-300">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        className={cn(
          'w-full p-3 text-sm rounded-lg bg-slate-950 border transition-colors',
          'placeholder:text-slate-500 text-slate-100 resize-y',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500',
          error ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : 'border-slate-800 hover:border-slate-700',
          className
        )}
        {...props}
      />
      {error ? (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <VIcon name="fa-solid fa-circle-xmark" className="w-3 h-3" />
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}
