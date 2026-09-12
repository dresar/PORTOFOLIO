'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Project } from '@/db/schema';
import { VCard, VCardContent, VCardActions } from '@/components/ui/v-card';
import { VBtn } from '@/components/ui/v-btn';
import { VIcon } from '@/components/ui/v-icon';
import { VChip } from '@/components/ui/v-chip';

export function ProjectsSection({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<'all' | 'featured'>('all');

  if (projects.length === 0) return null;

  const filteredProjects = projects.filter((p) =>
    filter === 'featured' ? p.isFeatured : true
  );

  return (
    <section id="projects" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <VIcon name="fa-solid fa-laptop-code" className="w-3 h-3" />
            <span>Karya & Proyek</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Portofolio Unggulan
          </h2>
          <p className="text-sm text-slate-400">
            Jelajahi implementasi solusi perangkat lunak yang telah saya bangun beserta repositori dan live demo.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Semua Proyek ({projects.length})
          </button>
          <button
            onClick={() => setFilter('featured')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filter === 'featured'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Proyek Unggulan (Featured)
          </button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <VCard
              key={project.id}
              elevation={1}
              hoverElevation
              className="flex flex-col justify-between overflow-hidden group"
            >
              {/* Thumbnail Image */}
              <div className="relative w-full h-48 bg-slate-800 border-b border-slate-800/80 overflow-hidden">
                {project.thumbnailUrl ? (
                  <Image
                    src={project.thumbnailUrl}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600">
                    <VIcon name="fa-solid fa-laptop-code" className="w-12 h-12" />
                  </div>
                )}

                {project.isFeatured && (
                  <div className="absolute top-3 right-3">
                    <VChip color="warning" size="sm" icon="fa-solid fa-circle-check">
                      Featured
                    </VChip>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <VCardContent className="p-5 flex-1 space-y-3">
                <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                  {project.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {project.description}
                </p>

                {/* Tech Chips */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {(Array.isArray(project.technologies) ? project.technologies : []).map((tech) => (
                    <VChip key={tech} size="sm" color="default">
                      {tech}
                    </VChip>
                  ))}
                </div>
              </VCardContent>

              {/* Action Buttons */}
              <VCardActions className="px-5 py-3.5 bg-slate-950/40 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {project.demoUrl && (
                    <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                      <VBtn variant="primary" size="sm" prependIcon="fa-solid fa-arrow-up-right-from-square">
                        Live Demo
                      </VBtn>
                    </a>
                  )}
                  {project.repoUrl && (
                    <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                      <VBtn variant="outlined" size="sm" prependIcon="fa-brands fa-github">
                        Source Code
                      </VBtn>
                    </a>
                  )}
                </div>
              </VCardActions>
            </VCard>
          ))}
        </div>
      </div>
    </section>
  );
}
