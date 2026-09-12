'use client';

import React, { useState } from 'react';
import { Profile } from '@/db/schema';
import { submitContactMessageAction } from '@/actions/contact.actions';
import { VCard, VCardHeader, VCardTitle, VCardSubtitle, VCardContent } from '@/components/ui/v-card';
import { VTextField, VTextarea } from '@/components/ui/v-text-field';
import { VBtn } from '@/components/ui/v-btn';
import { VIcon } from '@/components/ui/v-icon';
import { VSnackbar } from '@/components/ui/v-snackbar';

export function ContactSection({ profile }: { profile: Profile | null }) {
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const res = await submitContactMessageAction(formData);
    setLoading(false);

    if (res.success) {
      setSnackbar({
        show: true,
        message: res.message || 'Pesan Anda berhasil terkirim!',
        type: 'success',
      });
      form.reset();
    } else {
      setSnackbar({
        show: true,
        message: res.error || 'Gagal mengirim pesan. Silakan periksa kembali isian Anda.',
        type: 'error',
      });
    }
  };

  return (
    <section id="contact" className="py-20 bg-slate-900/40 border-t border-slate-800/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <VIcon name="fa-solid fa-envelope" className="w-3 h-3" />
            <span>Koneksi & Kolaborasi</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Mari Terhubung
          </h2>
          <p className="text-sm text-slate-400">
            Punya tawaran proyek, peluang karier, atau pertanyaan? Kirimkan pesan langsung melalui formulir di bawah ini.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Kolom Kiri: Informasi Kontak */}
          <div className="lg:col-span-5 space-y-4">
            <VCard elevation={1} className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Informasi Kontak Langsung</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Saya selalu terbuka untuk berdiskusi seputar peluang rekayasa perangkat lunak, tantangan arsitektur sistem, dan inovasi web.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                {profile?.email && (
                  <div className="flex items-center gap-3.5 p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                    <div className="w-9 h-9 rounded-lg bg-blue-600/15 border border-blue-500/30 text-blue-400 flex items-center justify-center flex-shrink-0">
                      <VIcon name="fa-solid fa-envelope" className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px]">Email:</div>
                      <a href={`mailto:${profile.email}`} className="text-white font-semibold hover:text-blue-400 transition-colors">
                        {profile.email}
                      </a>
                    </div>
                  </div>
                )}

                {profile?.whatsappUrl && (
                  <div className="flex items-center gap-3.5 p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                    <div className="w-9 h-9 rounded-lg bg-emerald-600/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center flex-shrink-0">
                      <VIcon name="fa-brands fa-whatsapp" className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px]">WhatsApp:</div>
                      <a
                        href={profile.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white font-semibold hover:text-emerald-400 transition-colors"
                      >
                        Kirim Pesan WhatsApp Langsung
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3.5 p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                  <div className="w-9 h-9 rounded-lg bg-purple-600/15 border border-purple-500/30 text-purple-400 flex items-center justify-center flex-shrink-0">
                    <VIcon name="fa-solid fa-location-dot" className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px]">Domisili:</div>
                    <div className="text-white font-semibold">{profile?.location || 'Indonesia'}</div>
                  </div>
                </div>
              </div>
            </VCard>
          </div>

          {/* Kolom Kanan: Formulir Pesan Interaktif */}
          <div className="lg:col-span-7">
            <VCard elevation={1}>
              <VCardHeader>
                <div>
                  <VCardTitle>Kirimkan Pesan Anda</VCardTitle>
                  <VCardSubtitle>Pesan akan tersimpan aman di database dan langsung dinotifikasikan ke admin</VCardSubtitle>
                </div>
              </VCardHeader>

              <VCardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Honeypot Spam Protection (Tersembunyi dari manusia) */}
                  <div className="hidden" aria-hidden="true">
                    <input
                      type="text"
                      name="website_url_honey"
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <VTextField
                      label="Nama Lengkap Anda"
                      name="name"
                      placeholder="Contoh: Budi Santoso"
                      required
                      prependInnerIcon="fa-solid fa-user"
                    />
                    <VTextField
                      label="Alamat Email Anda"
                      name="email"
                      type="email"
                      placeholder="budi@example.com"
                      required
                      prependInnerIcon="fa-solid fa-envelope"
                    />
                  </div>

                  <VTextField
                    label="Subjek / Topik Pembicaraan"
                    name="subject"
                    placeholder="Contoh: Diskusi Proyek Web Application / Peluang Karier"
                    required
                    prependInnerIcon="fa-solid fa-pen-to-square"
                  />

                  <VTextarea
                    label="Isi Pesan Lengkap"
                    name="message"
                    placeholder="Tuliskan pesan, pertanyaan, atau detail peluang kolaborasi Anda..."
                    rows={5}
                    required
                  />

                  <div className="pt-2 flex items-center justify-end">
                    <VBtn
                      type="submit"
                      variant="primary"
                      size="lg"
                      loading={loading}
                      prependIcon="fa-solid fa-envelope"
                      className="w-full sm:w-auto"
                    >
                      Kirim Pesan Sekarang
                    </VBtn>
                  </div>
                </form>
              </VCardContent>
            </VCard>
          </div>
        </div>
      </div>

      <VSnackbar
        show={snackbar.show}
        message={snackbar.message}
        type={snackbar.type}
        onClose={() => setSnackbar((prev) => ({ ...prev, show: false }))}
      />
    </section>
  );
}
