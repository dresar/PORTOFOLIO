import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import { db } from '@/db';
import { contactMessages } from '@/db/schema';
import { eq, count } from 'drizzle-orm';
import { AdminLayoutShell } from '@/components/admin/admin-layout-shell';

export const metadata: Metadata = {
  title: 'Admin CMS Dashboard | Muhammad Fauzan Al Hafizh',
  description: 'Sistem manajemen konten portofolio',
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) {
    redirect('/login');
  }

  // Hitung jumlah pesan belum dibaca
  const unreadResult = await db
    .select({ value: count() })
    .from(contactMessages)
    .where(eq(contactMessages.isRead, false));

  const unreadCount = Number(unreadResult[0]?.value || 0);

  return (
    <AdminLayoutShell username={session.username} unreadCount={unreadCount}>
      {children}
    </AdminLayoutShell>
  );
}
