import React from 'react';
import { db } from '@/db';
import { skills } from '@/db/schema';
import { asc } from 'drizzle-orm';
import { SkillsManager } from '@/components/admin/skills-manager';

export default async function AdminSkillsPage() {
  const allSkills = await db
    .select()
    .from(skills)
    .orderBy(asc(skills.orderIndex), asc(skills.name));

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Manajemen Keterampilan</h1>
        <p className="text-xs text-slate-400 mt-1">
          Kelola keahlian teknis, kategori, ikon Font Awesome, dan tingkat kemahiran.
        </p>
      </div>

      <SkillsManager initialSkills={allSkills} />
    </div>
  );
}
