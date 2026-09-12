'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Profile } from '@/db/schema';
import { VBtn } from '@/components/ui/v-btn';
import { VIcon } from '@/components/ui/v-icon';

export function HeroSection({ profile }: { profile: Profile | null }) {
  const fullName = profile?.fullName || 'Muhammad Fauzan Al Hafizh';
  const headline = profile?.headline || 'Full-Stack Software Engineer';
  const bio =
    profile?.bio ||
    'Membangun aplikasi web modern, skalabel, dan berkinerja tinggi dengan arsitektur rekayasa perangkat lunak terstandarisasi.';

  const initialAvatar = profile?.avatarUrl || '/avatar.jpg';
  const [imgSrc, setImgSrc] = useState(initialAvatar);
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <section id="hero" className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-16 overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-blue-600/15 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-12 lg:gap-16">
          {/* Kolom Kiri: Teks & Aksi */}
          <div className="flex-1 text-center lg:text-left space-y-6">
            {/* Availability Status Badge */}
            {profile?.isAvailable !== false && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold select-none">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Tersedia untuk Pekerjaan / Freelance</span>
              </div>
            )}

            {/* Nama & Headline */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                Halo, Saya <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-blue-500 bg-clip-text text-transparent">
                  {fullName}
                </span>
              </h1>
              <p className="text-lg sm:text-xl font-bold text-slate-300">
                {headline}
              </p>
            </div>

            {/* Deskripsi Singkat */}
            <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {bio}
            </p>

            {/* Tombol Call to Action */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              <a href="#projects">
                <VBtn variant="primary" size="lg" prependIcon="fa-solid fa-laptop-code" className="shadow-lg shadow-blue-500/20">
                  Lihat Proyek Saya
                </VBtn>
              </a>
              <a href="#contact">
                <VBtn variant="outlined" size="lg" prependIcon="fa-solid fa-envelope">
                  Hubungi Saya
                </VBtn>
              </a>
            </div>

            {/* Tautan Media Sosial Resmi */}
            <div className="pt-4 flex items-center justify-center lg:justify-start gap-3 text-slate-400">
              <span className="text-xs text-slate-500 font-semibold mr-1">Temukan Saya:</span>
              {profile?.githubUrl && (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:text-white hover:border-slate-700 transition-colors"
                  title="GitHub"
                >
                  <VIcon name="fa-brands fa-github" className="w-4 h-4" />
                </a>
              )}
              {profile?.linkedinUrl && (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:text-blue-400 hover:border-slate-700 transition-colors"
                  title="LinkedIn"
                >
                  <VIcon name="fa-brands fa-linkedin" className="w-4 h-4" />
                </a>
              )}
              {profile?.whatsappUrl && (
                <a
                  href={profile.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:text-emerald-400 hover:border-slate-700 transition-colors"
                  title="WhatsApp"
                >
                  <VIcon name="fa-brands fa-whatsapp" className="w-4 h-4" />
                </a>
              )}
              {profile?.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:text-red-400 hover:border-slate-700 transition-colors"
                  title="Email"
                >
                  <VIcon name="fa-solid fa-envelope" className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Kolom Kanan: Avatar & Visual Badge */}
          <div className="relative flex justify-center items-center">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-2xl p-2 bg-gradient-to-b from-blue-500/20 to-slate-900/50 border border-slate-700/60 shadow-2xl shadow-blue-500/10 backdrop-blur-md">
              {!imgFailed ? (
                <div className="relative w-full h-full rounded-xl overflow-hidden bg-slate-900">
                  <Image
                    src={imgSrc}
                    alt={fullName}
                    fill
                    sizes="(max-width: 640px) 256px, 320px"
                    className="object-cover"
                    priority
                    onError={() => {
                      if (imgSrc !== '/avatar.jpg') {
                        setImgSrc('/avatar.jpg');
                      } else {
                        setImgFailed(true);
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-full rounded-xl bg-slate-900 flex flex-col items-center justify-center text-blue-400">
                  <VIcon name="fa-solid fa-user" className="w-24 h-24 text-slate-700" />
                </div>
              )}

              {/* Floating Vuetify-style Tech Badges */}
              <div className="absolute -bottom-4 -left-4 bg-slate-900/90 border border-slate-700/80 rounded-lg px-3 py-2 shadow-xl backdrop-blur-md flex items-center gap-2 text-xs">
                <div className="w-6 h-6 rounded-md bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <VIcon name="fa-brands fa-react" className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Stack Utama</div>
                  <div className="font-bold text-white">Next.js & React</div>
                </div>
              </div>

              <div className="absolute -top-3 -right-3 bg-slate-900/90 border border-slate-700/80 rounded-lg px-3 py-2 shadow-xl backdrop-blur-md flex items-center gap-2 text-xs">
                <div className="w-6 h-6 rounded-md bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                  <VIcon name="fa-solid fa-database" className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Basis Data</div>
                  <div className="font-bold text-white">Neon PostgreSQL</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
