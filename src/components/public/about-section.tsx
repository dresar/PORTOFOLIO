'use client';

import React from 'react';
import { Profile } from '@/db/schema';
import { VCard } from '@/components/ui/v-card';
import { VBtn } from '@/components/ui/v-btn';
import { VIcon } from '@/components/ui/v-icon';

export function AboutSection({
  profile,
  projectCount,
  skillCount,
  certCount,
}: {
  profile: Profile | null;
  projectCount: number;
  skillCount: number;
  certCount: number;
}) {
  const bio =
    profile?.bio ||
    'Saya adalah seorang Software Engineer yang berfokus pada arsitektur web modern, keandalan performa basis data, dan antarmuka berpusat pada pengguna. Berkomitmen untuk menghasilkan kode bersih, type-safe, dan teruji secara menyeluruh.';

  return (
    <section id="about" className="py-20 bg-slate-900/40 border-t border-b border-slate-800/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <VIcon name="fa-solid fa-user" className="w-3 h-3" />
            <span>Tentang Saya</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Profil & Filosofi Rekayasa
          </h2>
          <p className="text-sm text-slate-400">
            Mengenal lebih dekat latar belakang profesional, fokus kompetensi, dan nilai kerja saya.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Kolom Narasi */}
          <div className="lg:col-span-7 space-y-6">
            <VCard elevation={1} className="p-6 sm:p-8 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <VIcon name="fa-solid fa-code" className="text-blue-400 w-4 h-4" />
                <span>Pengembangan Full-Stack Berstandar Tinggi</span>
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                {bio}
              </p>
              <p className="text-sm text-slate-400 leading-relaxed">
                Pendekatan saya terhadap rekayasa perangkat lunak mengutamakan struktur yang bersih, keamanan berlapis, modularitas komponen, dan pemanfaatan kapabilitas basis data relasional secara optimal melalui Drizzle ORM dan PostgreSQL.
              </p>

              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <VIcon name="fa-solid fa-location-dot" className="text-blue-400 w-3.5 h-3.5" />
                  <span>Domisili: {profile?.location || 'Indonesia'}</span>
                </div>

                {profile?.resumeUrl ? (
                  <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer">
                    <VBtn variant="tonal" size="sm" prependIcon="fa-solid fa-download">
                      Unduh Resume / CV
                    </VBtn>
                  </a>
                ) : (
                  <span className="text-xs text-slate-500 italic">Dokumen resume dapat diminta via kontak</span>
                )}
              </div>
            </VCard>
          </div>

          {/* Kolom Kartu Statistik */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
            <VCard elevation={1} hoverElevation className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600/15 border border-blue-500/30 text-blue-400 flex items-center justify-center flex-shrink-0">
                <VIcon name="fa-solid fa-laptop-code" className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-white">{projectCount}</div>
                <div className="text-xs text-slate-400 font-medium">Proyek Terselesaikan</div>
              </div>
            </VCard>

            <VCard elevation={1} hoverElevation className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <VIcon name="fa-solid fa-code" className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-white">{skillCount}+</div>
                <div className="text-xs text-slate-400 font-medium">Keahlian & Perkakas Teknis</div>
              </div>
            </VCard>

            <VCard elevation={1} hoverElevation className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-600/15 border border-amber-500/30 text-amber-400 flex items-center justify-center flex-shrink-0">
                <VIcon name="fa-solid fa-certificate" className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-white">{certCount}</div>
                <div className="text-xs text-slate-400 font-medium">Sertifikasi Kompetensi</div>
              </div>
            </VCard>
          </div>
        </div>
      </div>
    </section>
  );
}
