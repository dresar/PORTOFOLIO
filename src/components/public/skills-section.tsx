'use client';

import React, { useState } from 'react';
import { Skill } from '@/db/schema';
import { VCard } from '@/components/ui/v-card';
import { VIcon } from '@/components/ui/v-icon';
import { VChip } from '@/components/ui/v-chip';

export function SkillsSection({ skills }: { skills: Skill[] }) {
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  if (skills.length === 0) return null;

  // Extract unique categories
  const categories = ['Semua', ...Array.from(new Set(skills.map((s) => s.category)))];

  const filteredSkills = skills.filter((s) =>
    selectedCategory === 'Semua' ? true : s.category === selectedCategory
  );

  return (
    <section id="skills" className="py-20 bg-slate-900/30 border-t border-b border-slate-800/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <VIcon name="fa-solid fa-code" className="w-3 h-3" />
            <span>Keahlian Teknis</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Tech Stack & Perkakas
          </h2>
          <p className="text-sm text-slate-400">
            Teknologi, bahasa pemrograman, framework, dan sistem basis data yang saya gunakan dalam pengembangan perangkat lunak.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Skills Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredSkills.map((skill) => (
            <VCard
              key={skill.id}
              elevation={1}
              hoverElevation
              className="p-4 flex flex-col justify-between group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700/80 flex items-center justify-center text-blue-400 text-base group-hover:scale-110 group-hover:text-blue-300 transition-all flex-shrink-0">
                  <VIcon name={skill.iconClass} className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-white truncate">{skill.name}</h3>
                  <VChip color="primary" size="sm" className="mt-1">
                    {skill.category}
                  </VChip>
                </div>
              </div>

              {/* Progress Bar Kemahiran */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span>Tingkat Kemahiran</span>
                  <span className="font-mono text-slate-200">{skill.proficiencyLevel}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${skill.proficiencyLevel}%` }}
                  />
                </div>
              </div>
            </VCard>
          ))}
        </div>
      </div>
    </section>
  );
}
