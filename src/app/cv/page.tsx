import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { VBtn } from '@/components/ui/v-btn';
import { VIcon } from '@/components/ui/v-icon';
import { VCard, VCardHeader, VCardTitle, VCardSubtitle, VCardContent } from '@/components/ui/v-card';
import { VChip } from '@/components/ui/v-chip';

export const metadata: Metadata = {
  title: 'Curriculum Vitae (CV) | Muhammad Fauzan Al Hafizh',
  description:
    'Lihat dan unduh Curriculum Vitae (CV) resmi Muhammad Fauzan Al Hafizh - Mahasiswa D3 Teknik Informatika Universitas Sumatera Utara.',
};

export default function CvPage() {
  const pdfUrl = '/cv-hafizh.pdf';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Sticky Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-3.5 shadow-lg shadow-black/20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <Link href="/">
              <VBtn variant="outlined" size="sm" prependIcon="fa-solid fa-arrow-left">
                Kembali ke Portofolio
              </VBtn>
            </Link>
            <div className="hidden md:block">
              <h1 className="text-sm font-bold text-white tracking-tight">Curriculum Vitae (CV)</h1>
              <p className="text-[11px] text-slate-400">Muhammad Fauzan Al Hafizh &bull; D3 Teknik Informatika USU</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" title="Buka PDF di tab baru">
              <VBtn variant="outlined" size="sm" prependIcon="fa-solid fa-arrow-up-right-from-square">
                Buka Tab Baru
              </VBtn>
            </a>

            <a href={pdfUrl} download="CV_Muhammad_Fauzan_Al_Hafizh.pdf" title="Unduh berkas PDF resmi">
              <VBtn variant="primary" size="sm" prependIcon="fa-solid fa-download" className="shadow-md shadow-blue-500/20">
                Unduh PDF
              </VBtn>
            </a>

            <a
              href="https://wa.me/6285363520813?text=Halo%20Muhammad%20Fauzan%20Al%20Hafizh,%20saya%20tertarik%20dengan%20CV%20Anda."
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex"
            >
              <VBtn variant="tonal" size="sm" prependIcon="fa-brands fa-whatsapp" className="text-emerald-400 border border-emerald-500/30">
                WhatsApp
              </VBtn>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* PDF Viewer Container */}
        <div className="relative w-full rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/70 border-b border-slate-800 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <VIcon name="fa-solid fa-file-pdf" className="text-red-400 w-4 h-4" />
              <span className="font-semibold text-slate-200">CV HAFIZH.pdf</span>
              <VChip size="sm" color="default">312 KB</VChip>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span>Format Dokumen Resmi</span>
            </div>
          </div>

          <div className="w-full h-[75vh] sm:h-[82vh] bg-slate-950 flex flex-col">
            <iframe
              src={`${pdfUrl}#toolbar=1&navpanes=0`}
              title="Curriculum Vitae Muhammad Fauzan Al Hafizh"
              className="w-full h-full border-none"
            />
            {/* Fallback jika browser mobile tidak dapat merender iframe PDF langsung */}
            <noscript>
              <div className="p-8 text-center space-y-3">
                <p className="text-sm text-slate-300">
                  Peramban Anda tidak mendukung penampil PDF langsung. Silakan klik tombol di bawah untuk mengunduh.
                </p>
                <a href={pdfUrl} download="CV_Muhammad_Fauzan_Al_Hafizh.pdf">
                  <VBtn variant="primary" size="md" prependIcon="fa-solid fa-download">
                    Unduh CV HAFIZH.pdf
                  </VBtn>
                </a>
              </div>
            </noscript>
          </div>
        </div>

        {/* Ringkasan Data Riil dari CV */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <VCard elevation={1}>
            <VCardHeader>
              <div>
                <VCardTitle className="text-base flex items-center gap-2">
                  <VIcon name="fa-solid fa-user-graduate" className="text-blue-400 w-4 h-4" />
                  <span>Pendidikan Resmi</span>
                </VCardTitle>
                <VCardSubtitle>Riwayat akademik terverifikasi</VCardSubtitle>
              </div>
            </VCardHeader>
            <VCardContent className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                <div className="font-bold text-white text-sm">Universitas Sumatera Utara</div>
                <div className="text-blue-400 font-medium">D3 Teknik Informatika &bull; Fakultas Vokasi</div>
                <div className="text-slate-500 text-[11px] mt-0.5">2026 - Sekarang</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                <div className="font-bold text-white text-sm">MAS Raudhatussalam</div>
                <div className="text-slate-300">Jurusan IPA (Ilmu Pengetahuan Alam)</div>
                <div className="text-slate-500 text-[11px] mt-0.5">Lulus Tahun 2025</div>
              </div>
            </VCardContent>
          </VCard>

          <VCard elevation={1}>
            <VCardHeader>
              <div>
                <VCardTitle className="text-base flex items-center gap-2">
                  <VIcon name="fa-solid fa-users" className="text-emerald-400 w-4 h-4" />
                  <span>Pengalaman Organisasi</span>
                </VCardTitle>
                <VCardSubtitle>Kepemimpinan & keaktifan sosial</VCardSubtitle>
              </div>
            </VCardHeader>
            <VCardContent className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                <div className="font-bold text-white text-sm">Pengurus Asrama</div>
                <div className="text-emerald-400 font-medium">Pondok Pesantren Raudhatussalam</div>
                <div className="text-slate-500 text-[11px] mt-0.5">2022 - 2025</div>
                <p className="text-slate-400 mt-1 leading-relaxed text-[11px]">
                  Berpartisipasi dalam pembinaan anggota, koordinasi tim, melatih kedisiplinan & tanggung jawab.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                <div className="font-bold text-white text-sm">Turnamen Futsal & Mini Soccer</div>
                <div className="text-slate-400 text-[11px] mt-0.5">Antarsekolah & Antardesa</div>
                <p className="text-slate-400 mt-1 leading-relaxed text-[11px]">
                  Mengembangkan sportivitas, disiplin, dan kerja sama tim yang solid.
                </p>
              </div>
            </VCardContent>
          </VCard>

          <VCard elevation={1}>
            <VCardHeader>
              <div>
                <VCardTitle className="text-base flex items-center gap-2">
                  <VIcon name="fa-solid fa-laptop-code" className="text-purple-400 w-4 h-4" />
                  <span>Keahlian & Kontak</span>
                </VCardTitle>
                <VCardSubtitle>Perkakas dan saluran komunikasi</VCardSubtitle>
              </div>
            </VCardHeader>
            <VCardContent className="space-y-3 text-xs">
              <div>
                <div className="text-slate-400 text-[11px] mb-1.5 font-semibold uppercase tracking-wider">Hard Skills</div>
                <div className="flex flex-wrap gap-1">
                  {['Python', 'HTML', 'C / C++', 'Basis Data', 'VS Code', 'Code::Blocks', 'MS Office', 'Canva', 'Photoshop'].map((s) => (
                    <VChip key={s} size="sm" color="default">
                      {s}
                    </VChip>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-slate-300">
                  <VIcon name="fa-solid fa-location-dot" className="text-purple-400 w-3.5 h-3.5" />
                  <span>Lubuk Pakam, Sumatera Utara</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <VIcon name="fa-solid fa-envelope" className="text-red-400 w-3.5 h-3.5" />
                  <span>fauzanalhafiz1007@gmail.com</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <VIcon name="fa-solid fa-phone" className="text-emerald-400 w-3.5 h-3.5" />
                  <span>0853-6352-0813</span>
                </div>
              </div>
            </VCardContent>
          </VCard>
        </div>
      </main>
    </div>
  );
}
