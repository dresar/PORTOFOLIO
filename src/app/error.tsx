'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { VBtn } from '@/components/ui/v-btn';
import { VIcon } from '@/components/ui/v-icon';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="text-center space-y-5 max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-red-600/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto text-2xl font-black">
          <VIcon name="fa-solid fa-circle-xmark" className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-white">Terjadi Kendala Teknis</h1>
        <p className="text-xs text-slate-400 leading-relaxed">
          Sistem mendeteksi galat saat memproses permintaan Anda. Kami telah mencatat kejadian ini untuk segera ditangani.
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <VBtn variant="primary" size="md" onClick={() => reset()} prependIcon="fa-solid fa-rotate-right">
            Muat Ulang Halaman
          </VBtn>
          <Link href="/">
            <VBtn variant="outlined" size="md">
              Beranda
            </VBtn>
          </Link>
        </div>
      </div>
    </div>
  );
}
