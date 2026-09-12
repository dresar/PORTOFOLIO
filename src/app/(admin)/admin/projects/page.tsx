import React from 'react';
import { db } from '@/db';
import { projects } from '@/db/schema';
import { desc, asc } from 'drizzle-orm';
import { ProjectsManager } from '@/components/admin/projects-manager';

export default async function AdminProjectsPage() {
  const allProjects = await db
    .select()
    .from(projects)
    .orderBy(asc(projects.orderIndex), desc(projects.createdAt));

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Manajemen Proyek</h1>
        <p className="text-xs text-slate-400 mt-1">
          Kelola katalog karya dan proyek rekayasa perangkat lunak Muhammad Fauzan Al Hafizh.
        </p>
      </div>

      <ProjectsManager initialProjects={allProjects} />
    </div>
  );
}
