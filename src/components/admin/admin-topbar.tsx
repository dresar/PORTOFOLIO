'use client';

import React from 'react';
import { logoutAction } from '@/actions/auth.actions';
import { VBtn } from '@/components/ui/v-btn';
import { VIcon } from '@/components/ui/v-icon';
import { VChip } from '@/components/ui/v-chip';

interface AdminTopbarProps {
  collapsed: boolean;
  onToggleSidebar: () => void;
  username: string;
}

export function AdminTopbar({ collapsed, onToggleSidebar, username }: AdminTopbarProps) {
  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors focus:outline-none"
          title={collapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
        >
          <VIcon name="fa-solid fa-bars" className="w-4 h-4" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <span>CMS</span>
          <span>/</span>
          <span className="text-slate-200 font-medium capitalize">Admin Portal</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Indikator Status Neon DB */}
        <VChip color="success" size="sm" icon="fa-solid fa-database" className="hidden md:inline-flex">
          Neon PostgreSQL: Connected
        </VChip>

        {/* Profil Admin & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-7 h-7 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xs font-semibold">
            {username.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs font-medium text-slate-300 hidden sm:inline-block">
            {username}
          </span>

          <form action={logoutAction}>
            <VBtn
              type="submit"
              variant="text"
              size="sm"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 px-2.5"
              title="Keluar / Logout"
            >
              <VIcon name="fa-solid fa-right-from-bracket" className="w-3.5 h-3.5 mr-1" />
              <span className="hidden sm:inline">Keluar</span>
            </VBtn>
          </form>
        </div>
      </div>
    </header>
  );
}
