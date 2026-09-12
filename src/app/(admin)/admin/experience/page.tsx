import React from 'react';
import { db } from '@/db';
import { experiences } from '@/db/schema';
import { asc, desc } from 'drizzle-orm';
import { ExperienceManager } from '@/components/admin/experience-manager';

export default async function AdminExperiencePage() {
  const allExperiences = await db
    .select()
    .from(experiences)
    .orderBy(asc(experiences.orderIndex), desc(experiences.createdAt));

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Manajemen Pengalaman</h1>
        <p className="text-xs text-slate-400 mt-1">
          Kelola riwayat karier, pekerjaan, magang, dan tanggung jawab profesional.
        </p>
      </div>

      <ExperienceManager initialExperiences={allExperiences} />
    </div>
  );
}
