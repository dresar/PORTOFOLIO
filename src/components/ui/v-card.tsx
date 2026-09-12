'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface VCardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: 0 | 1 | 2 | 3 | 4;
  hoverElevation?: boolean;
}

export function VCard({
  children,
  className,
  elevation = 1,
  hoverElevation = false,
  ...props
}: VCardProps) {
  const elevationClasses = {
    0: 'shadow-none border border-slate-800/80 bg-slate-900/60',
    1: 'shadow-sm border border-slate-800 bg-slate-900/90',
    2: 'shadow-md border border-slate-700/80 bg-slate-900',
    3: 'shadow-lg border border-slate-700 bg-slate-850',
    4: 'shadow-xl shadow-black/40 border border-slate-600/80 bg-slate-900',
  };

  return (
    <div
      className={cn(
        'rounded-xl text-slate-100 transition-all duration-200',
        elevationClasses[elevation],
        hoverElevation && 'hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function VCardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-6 py-5 border-b border-slate-800 flex items-center justify-between', className)} {...props}>
      {children}
    </div>
  );
}

export function VCardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-lg font-bold tracking-tight text-white', className)} {...props}>
      {children}
    </h3>
  );
}

export function VCardSubtitle({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-xs text-slate-400 mt-0.5', className)} {...props}>
      {children}
    </p>
  );
}

export function VCardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-6', className)} {...props}>
      {children}
    </div>
  );
}

export function VCardActions({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-6 py-4 border-t border-slate-800 flex items-center gap-3', className)} {...props}>
      {children}
    </div>
  );
}
