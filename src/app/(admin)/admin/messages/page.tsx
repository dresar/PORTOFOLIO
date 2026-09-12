import React from 'react';
import { db } from '@/db';
import { contactMessages } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { MessagesManager } from '@/components/admin/messages-manager';

export default async function AdminMessagesPage() {
  const allMessages = await db
    .select()
    .from(contactMessages)
    .orderBy(desc(contactMessages.createdAt));

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Kotak Masuk Pesan</h1>
        <p className="text-xs text-slate-400 mt-1">
          Tinjau, baca, dan kelola pesan yang dikirimkan oleh pengunjung melalui formulir kontak.
        </p>
      </div>

      <MessagesManager initialMessages={allMessages} />
    </div>
  );
}
