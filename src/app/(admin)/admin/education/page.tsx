import React from 'react';
import { db } from '@/db';
import { educations } from '@/db/schema';
import { asc, desc } from 'drizzle-orm';
import { EducationManager } from '@/components/admin/education-manager';

export default async function AdminEducationPage() {
  const allEducations = await db
    .select()
    .from(educations)
    .orderBy(asc(educations.orderIndex), desc(educations.createdAt));

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Manajemen Pendidikan</h1>
        <p className="text-xs text-slate-400 mt-1">
          Kelola riwayat pendidikan formal dan program studi akademik.
        </p>
      </div>

      <EducationManager initialEducations={allEducations} />
    </div>
  );
}
