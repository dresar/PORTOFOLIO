'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { VIcon } from './v-icon';

export interface VSnackbarProps {
  show: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export function VSnackbar({ show, message, type = 'success', onClose }: VSnackbarProps) {
  if (!show) return null;

  const typeConfig = {
    success: {
      bg: 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200',
      icon: 'fa-solid fa-circle-check',
    },
    error: {
      bg: 'bg-red-950/90 border-red-500/50 text-red-200',
      icon: 'fa-solid fa-circle-xmark',
    },
    info: {
      bg: 'bg-blue-950/90 border-blue-500/50 text-blue-200',
      icon: 'fa-solid fa-circle-check',
    },
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-lg border shadow-xl backdrop-blur-md text-sm',
          typeConfig[type].bg
        )}
      >
        <VIcon name={typeConfig[type].icon} className="w-4 h-4 flex-shrink-0" />
        <span className="font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 text-slate-400 hover:text-white transition-colors"
        >
          <VIcon name="fa-solid fa-xmark" className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
