'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { VIcon } from './v-icon';

interface VChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: 'primary' | 'success' | 'warning' | 'error' | 'default';
  size?: 'sm' | 'md';
  icon?: string;
  closable?: boolean;
  onClose?: () => void;
}

export function VChip({
  children,
  className,
  color = 'default',
  size = 'md',
  icon,
  closable = false,
  onClose,
  ...props
}: VChipProps) {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  const colorClasses = {
    default: 'bg-slate-800 text-slate-300 border border-slate-700/80',
    primary: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
    error: 'bg-red-500/10 text-red-400 border border-red-500/30',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-md tracking-wide select-none',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      {...props}
    >
      {icon && <VIcon name={icon} className="w-3 h-3" />}
      <span>{children}</span>
      {closable && (
        <button
          type="button"
          onClick={onClose}
          className="ml-0.5 hover:text-white rounded focus:outline-none"
        >
          <VIcon name="fa-solid fa-xmark" className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}
