'use client';

import React, { useState } from 'react';
import { updateProfileAction } from '@/actions/content.actions';
import { Profile } from '@/db/schema';
import { VCard, VCardHeader, VCardTitle, VCardSubtitle, VCardContent, VCardActions } from '@/components/ui/v-card';
import { VTextField, VTextarea } from '@/components/ui/v-text-field';
import { VImageUploader } from '@/components/ui/v-image-uploader';
import { VBtn } from '@/components/ui/v-btn';
import { VSnackbar } from '@/components/ui/v-snackbar';

export function ProfileEditor({ profile }: { profile: Profile | null }) {
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });
  const [isAvailable, setIsAvailable] = useState(profile?.isAvailable ?? true);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      fullName: formData.get('fullName') as string,
      headline: formData.get('headline') as string,
      bio: formData.get('bio') as string,
      avatarUrl: formData.get('avatarUrl') as string,
      resumeUrl: formData.get('resumeUrl') as string,
      location: formData.get('location') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      githubUrl: formData.get('githubUrl') as string,
      linkedinUrl: formData.get('linkedinUrl') as string,
      whatsappUrl: formData.get('whatsappUrl') as string,
      isAvailable,
    };

    const res = await updateProfileAction(data);
    setLoading(false);

    if (res.success) {
      setSnackbar({ show: true, message: 'Data profil berhasil diperbarui!', type: 'success' });
    } else {
      setSnackbar({ show: true, message: res.error || 'Gagal menyimpan profil.', type: 'error' });
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <VCard elevation={1}>
          <VCardHeader>
            <div>
              <VCardTitle>Identitas Diri & Pengenalan</VCardTitle>
              <VCardSubtitle>Informasi utama yang tampil pada Hero Section dan About</VCardSubtitle>
            </div>
          </VCardHeader>
          <VCardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <VTextField
                label="Nama Lengkap (Opsional)"
                name="fullName"
                defaultValue={profile?.fullName || 'Muhammad Fauzan Al Hafizh'}
                placeholder="Muhammad Fauzan Al Hafizh"
                prependInnerIcon="fa-solid fa-user"
              />
              <VTextField
                label="Headline Profesional (Opsional)"
                name="headline"
                defaultValue={profile?.headline || ''}
                placeholder="Contoh: Software Engineer & Full-Stack Developer"
                prependInnerIcon="fa-solid fa-code"
              />
            </div>

            <VTextarea
              label="Biografi Lengkap / Filosofi Rekayasa (Opsional)"
              name="bio"
              defaultValue={profile?.bio || ''}
              placeholder="Ceritakan latar belakang, fokus teknologi, dan etos kerja Anda..."
              rows={5}
            />

            <div className="space-y-4">
              <VImageUploader
                label="Foto Profil / Avatar (GitHub CDN)"
                name="avatarUrl"
                value={profile?.avatarUrl || ''}
                placeholder="https://raw.githubusercontent.com/dresar/PORTOFOLIO/main/asset/..."
                hint="Pilih gambar untuk langsung diunggah ke GitHub CDN dresar/PORTOFOLIO."
              />

              <VTextField
                label="URL Dokumen Resume / CV (PDF)"
                name="resumeUrl"
                defaultValue={profile?.resumeUrl || ''}
                placeholder="https://... (Google Drive / Cloud Storage)"
                prependInnerIcon="fa-solid fa-download"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 bg-slate-950 border-slate-700 focus:ring-blue-500"
                />
                <span className="text-xs font-semibold text-slate-200">
                  Tandai status sebagai &quot;Tersedia untuk Pekerjaan / Open to Work&quot;
                </span>
              </label>
            </div>
          </VCardContent>
        </VCard>

        <VCard elevation={1}>
          <VCardHeader>
            <div>
              <VCardTitle>Informasi Kontak & Media Sosial</VCardTitle>
              <VCardSubtitle>Tautan komunikasi yang tertera di navigasi dan bagian kontak</VCardSubtitle>
            </div>
          </VCardHeader>
          <VCardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <VTextField
                label="Alamat Email Publik"
                name="email"
                type="email"
                defaultValue={profile?.email || ''}
                placeholder="email@domain.com"
                prependInnerIcon="fa-solid fa-envelope"
              />
              <VTextField
                label="Lokasi Domisili"
                name="location"
                defaultValue={profile?.location || ''}
                placeholder="Contoh: Jakarta, Indonesia"
                prependInnerIcon="fa-solid fa-location-dot"
              />
              <VTextField
                label="Nomor Kontak / WhatsApp"
                name="phone"
                defaultValue={profile?.phone || ''}
                placeholder="+62 8..."
                prependInnerIcon="fa-solid fa-phone"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <VTextField
                label="URL Repositori GitHub"
                name="githubUrl"
                defaultValue={profile?.githubUrl || ''}
                placeholder="https://github.com/username"
                prependInnerIcon="fa-brands fa-github"
              />
              <VTextField
                label="URL Profil LinkedIn"
                name="linkedinUrl"
                defaultValue={profile?.linkedinUrl || ''}
                placeholder="https://linkedin.com/in/username"
                prependInnerIcon="fa-brands fa-linkedin"
              />
              <VTextField
                label="Tautan WhatsApp Direct"
                name="whatsappUrl"
                defaultValue={profile?.whatsappUrl || ''}
                placeholder="https://wa.me/628..."
                prependInnerIcon="fa-brands fa-whatsapp"
              />
            </div>
          </VCardContent>
          <VCardActions className="justify-end">
            <VBtn type="submit" variant="primary" size="md" loading={loading} prependIcon="fa-solid fa-circle-check">
              Simpan Perubahan Profil
            </VBtn>
          </VCardActions>
        </VCard>
      </form>

      <VSnackbar
        show={snackbar.show}
        message={snackbar.message}
        type={snackbar.type}
        onClose={() => setSnackbar((prev) => ({ ...prev, show: false }))}
      />
    </>
  );
}
