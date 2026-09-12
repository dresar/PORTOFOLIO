import React from 'react';
import { db } from '@/db';
import { profiles } from '@/db/schema';
import { ProfileEditor } from '@/components/admin/profile-editor';

export default async function AdminProfilePage() {
  const profileList = await db.select().from(profiles).limit(1);
  const profile = profileList[0] || null;

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Manajemen Profil & Bio</h1>
        <p className="text-xs text-slate-400 mt-1">
          Perbarui informasi personal, headline profesional, dan tautan sosial media Anda.
        </p>
      </div>

      <ProfileEditor profile={profile} />
    </div>
  );
}
