'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { VIcon } from '@/components/ui/v-icon';
import { VChip } from '@/components/ui/v-chip';

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  unreadCount?: number;
}

const MENU_ITEMS = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: 'fa-solid fa-gauge-high' },
  { label: 'Profil & Bio', href: '/admin/profile', icon: 'fa-solid fa-user-gear' },
  { label: 'Pendidikan', href: '/admin/education', icon: 'fa-solid fa-graduation-cap' },
  { label: 'Keterampilan', href: '/admin/skills', icon: 'fa-solid fa-code' },
  { label: 'Proyek', href: '/admin/projects', icon: 'fa-solid fa-laptop-code' },
  { label: 'Pengalaman', href: '/admin/experience', icon: 'fa-solid fa-briefcase' },
  { label: 'Sertifikat', href: '/admin/certificates', icon: 'fa-solid fa-certificate' },
  { label: 'Pesan Masuk', href: '/admin/messages', icon: 'fa-solid fa-inbox', hasBadge: true },
];

export function AdminSidebar({ collapsed, unreadCount = 0 }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 z-40 h-screen bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-200',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 border-b border-slate-800 flex items-center justify-between">
        {!collapsed ? (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20 flex-shrink-0">
              H
            </div>
            <div className="flex flex-col truncate">
              <span className="text-sm font-bold text-white tracking-tight truncate">
                Fauzan Al Hafizh
              </span>
              <span className="text-[11px] text-blue-400 font-medium">Admin CMS Panel</span>
            </div>
          </div>
        ) : (
          <div className="w-9 h-9 mx-auto rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20">
            H
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                isActive
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60',
                collapsed && 'justify-center px-0'
              )}
              title={collapsed ? item.label : undefined}
            >
              <VIcon
                name={item.icon}
                className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200')}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}

              {!collapsed && item.hasBadge && unreadCount > 0 && (
                <VChip color="primary" size="sm" className="ml-auto px-1.5 py-0">
                  {unreadCount}
                </VChip>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Navigation */}
      <div className="p-3 border-t border-slate-800">
        <Link
          href="/"
          target="_blank"
          className={cn(
            'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-blue-400 hover:bg-slate-800/60 transition-colors',
            collapsed && 'justify-center px-0'
          )}
          title="Buka Website Publik"
        >
          <VIcon name="fa-solid fa-arrow-up-right-from-square" className="w-3.5 h-3.5" />
          {!collapsed && <span>Buka Web Publik</span>}
        </Link>
      </div>
    </aside>
  );
}
