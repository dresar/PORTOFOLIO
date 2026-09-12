'use client';

import React from 'react';
import { Experience } from '@/db/schema';
import { VCard, VCardContent } from '@/components/ui/v-card';
import { VIcon } from '@/components/ui/v-icon';
import { VChip } from '@/components/ui/v-chip';

export function ExperienceSection({ experiences }: { experiences: Experience[] }) {
  if (experiences.length === 0) return null;

  return (
    <section id="experience" className="py-20 bg-slate-900/30 border-t border-b border-slate-800/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider">
            <VIcon name="fa-solid fa-briefcase" className="w-3 h-3" />
            <span>Pengalaman Profesional</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Linimasa Karier & Kontribusi
          </h2>
          <p className="text-sm text-slate-400">
            Riwayat posisi teknis, tanggung jawab rekayasa, dan dampak yang dihasilkan di berbagai organisasi.
          </p>
        </div>

        <div className="max-w-3xl mx-auto relative pl-6 sm:pl-8 border-l-2 border-slate-800 space-y-8">
          {experiences.map((exp) => (
            <div key={exp.id} className="relative group">
              {/* Timeline Indicator Dot */}
              <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-slate-950 border-2 border-blue-500 group-hover:bg-blue-500 transition-colors shadow-sm shadow-blue-500/50" />

              <VCard elevation={1} hoverElevation className="p-6">
                <VCardContent className="p-0 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                        {exp.role}
                      </h3>
                      <div className="text-sm font-semibold text-slate-300 mt-0.5 flex items-center gap-2">
                        <span>{exp.company}</span>
                        {exp.location && (
                          <>
                            <span className="text-slate-600">&bull;</span>
                            <span className="text-xs text-slate-400 font-normal">{exp.location}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <VChip color="primary" size="sm">
                        {exp.employmentType}
                      </VChip>
                      <VChip color={exp.isCurrent ? 'success' : 'default'} size="sm">
                        {exp.startDate} - {exp.isCurrent ? 'Sekarang' : exp.endDate || '-'}
                      </VChip>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pt-3 border-t border-slate-800 whitespace-pre-wrap">
                    {exp.description}
                  </p>
                </VCardContent>
              </VCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
