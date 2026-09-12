'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { AdminSidebar } from './admin-sidebar';
import { AdminTopbar } from './admin-topbar';

interface AdminLayoutShellProps {
  children: React.ReactNode;
  username: string;
  unreadCount: number;
}

export function AdminLayoutShell({ children, username, unreadCount }: AdminLayoutShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <AdminSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        unreadCount={unreadCount}
      />

      <div
        className={cn(
          'flex-1 flex flex-col min-h-screen transition-all duration-200',
          collapsed ? 'ml-20' : 'ml-64'
        )}
      >
        <AdminTopbar
          collapsed={collapsed}
          onToggleSidebar={() => setCollapsed(!collapsed)}
          username={username}
        />
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
