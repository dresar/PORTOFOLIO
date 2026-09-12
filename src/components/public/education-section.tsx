'use client';

import React from 'react';
import { Education } from '@/db/schema';
import { VCard, VCardContent } from '@/components/ui/v-card';
import { VIcon } from '@/components/ui/v-icon';
import { VChip } from '@/components/ui/v-chip';

export function EducationSection({ educations }: { educations: Education[] }) {
  if (educations.length === 0) return null;

  return (
    <section id="education" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <VIcon name="fa-solid fa-graduation-cap" className="w-3 h-3" />
            <span>Pendidikan Formal</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Latar Belakang Akademik
          </h2>
          <p className="text-sm text-slate-400">
            Riwayat institusi dan fondasi keilmuan yang mendasari kompetensi rekayasa perangkat lunak saya.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {educations.map((edu) => (
            <VCard key={edu.id} elevation={1} hoverElevation className="p-6">
              <VCardContent className="p-0 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <VIcon name="fa-solid fa-graduation-cap" className="text-cyan-400 w-4 h-4" />
                      <span>{edu.institution}</span>
                    </h3>
                    <div className="text-sm font-semibold text-blue-400 mt-0.5">
                      {edu.degree} &bull; <span className="text-slate-300 font-normal">{edu.fieldOfStudy}</span>
                    </div>
                  </div>

                  <VChip color={edu.isCurrent ? 'success' : 'default'} size="sm">
                    {edu.startDate} - {edu.isCurrent ? 'Sekarang' : edu.endDate || '-'}
                  </VChip>
                </div>

                {edu.description && (
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pt-2 border-t border-slate-800">
                    {edu.description}
                  </p>
                )}
              </VCardContent>
            </VCard>
          ))}
        </div>
      </div>
    </section>
  );
}
