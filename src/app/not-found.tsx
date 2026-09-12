import React from 'react';
import Link from 'next/link';
import { VBtn } from '@/components/ui/v-btn';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="text-center space-y-5 max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto text-2xl font-black">
          404
        </div>
        <h1 className="text-2xl font-black text-white">Halaman Tidak Ditemukan</h1>
        <p className="text-xs text-slate-400 leading-relaxed">
          Halaman yang Anda tuju tidak tersedia atau telah dipindahkan. Silakan kembali ke beranda portofolio Muhammad Fauzan Al Hafizh.
        </p>
        <div className="pt-2">
          <Link href="/">
            <VBtn variant="primary" size="md" prependIcon="fa-solid fa-house">
              Kembali ke Beranda
            </VBtn>
          </Link>
        </div>
      </div>
    </div>
  );
}
