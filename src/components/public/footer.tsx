'use client';

import React from 'react';
import Link from 'next/link';
import { VIcon } from '@/components/ui/v-icon';

export function PublicFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 py-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/20">
            H
          </div>
          <div>
            <div className="font-bold text-white text-sm">Muhammad Fauzan Al Hafizh</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Full-Stack Software Engineer &bull; Portofolio Profesional
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs">
          <button
            onClick={scrollToTop}
            className="hover:text-blue-400 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Kembali ke Atas</span>
            <VIcon name="fa-solid fa-house" className="w-3 h-3" />
          </button>

          <Link href="/login" className="hover:text-blue-400 transition-colors flex items-center gap-1">
            <VIcon name="fa-solid fa-user-gear" className="w-3 h-3" />
            <span>Admin Portal</span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
        <div>
          &copy; {new Date().getFullYear()} Muhammad Fauzan Al Hafizh. Hak cipta dilindungi undang-undang.
        </div>
        <div>
          Dibangun dengan Next.js App Router, TypeScript, Drizzle ORM, &amp; Neon PostgreSQL.
        </div>
      </div>
    </footer>
  );
}
