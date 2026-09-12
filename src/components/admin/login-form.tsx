'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginAction, devLoginAction } from '@/actions/auth.actions';
import { VCard, VCardHeader, VCardTitle, VCardSubtitle, VCardContent } from '@/components/ui/v-card';
import { VTextField } from '@/components/ui/v-text-field';
import { VBtn } from '@/components/ui/v-btn';
import { VIcon } from '@/components/ui/v-icon';
import { VChip } from '@/components/ui/v-chip';

interface LoginFormProps {
  isDevMode: boolean;
}

export function LoginForm({ isDevMode }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/admin/dashboard';

  const [loading, setLoading] = useState(false);
  const [devLoading, setDevLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    const res = await loginAction(formData);

    if (res.success) {
      router.push(redirectPath);
      router.refresh();
    } else {
      setErrorMsg(res.error || 'Terjadi kesalahan saat login.');
      setLoading(false);
    }
  };

  const handleDevLogin = async () => {
    setDevLoading(true);
    setErrorMsg(null);

    const res = await devLoginAction();
    if (res.success) {
      router.push(redirectPath);
      router.refresh();
    } else {
      setErrorMsg(res.error || 'Dev login gagal.');
      setDevLoading(false);
    }
  };

  return (
    <VCard elevation={3} className="w-full border-slate-800 bg-slate-900/90 backdrop-blur-md">
      <VCardHeader className="flex flex-col items-center text-center pb-3">
        <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
          <VIcon name="fa-solid fa-user-gear" className="w-6 h-6" />
        </div>
        <VCardTitle className="text-xl">Admin CMS Portal</VCardTitle>
        <VCardSubtitle className="text-slate-400 text-xs">
          Portofolio Muhammad Fauzan Al Hafizh
        </VCardSubtitle>
      </VCardHeader>

      <VCardContent className="pt-2">
        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <VIcon name="fa-solid fa-circle-xmark" className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <VTextField
            label="Username atau Email"
            name="usernameOrEmail"
            placeholder="Masukkan username atau email admin"
            required
            autoComplete="username"
            prependInnerIcon="fa-solid fa-user"
          />

          <VTextField
            label="Password"
            name="password"
            type="password"
            placeholder="Masukkan kata sandi"
            required
            autoComplete="current-password"
            prependInnerIcon="fa-solid fa-code"
          />

          <VBtn
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full mt-1"
            prependIcon="fa-solid fa-right-from-bracket"
          >
            Masuk ke Admin Panel
          </VBtn>
        </form>

        {/* Tombol Dev Login (Khusus Mode Development) */}
        {isDevMode && (
          <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <VChip color="warning" size="sm" icon="fa-solid fa-sliders">
                DEV ENVIRONMENT
              </VChip>
            </div>
            <p className="text-[11px] text-slate-400 text-center">
              Tombol ini hanya aktif di mode pengembangan lokal.
            </p>
            <VBtn
              type="button"
              variant="tonal"
              size="md"
              loading={devLoading}
              onClick={handleDevLogin}
              className="w-full border border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
              prependIcon="fa-solid fa-gauge-high"
            >
              Login Dev / Demo Bypass
            </VBtn>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-blue-400 transition-colors inline-flex items-center gap-1.5"
          >
            <VIcon name="fa-solid fa-house" className="w-3.5 h-3.5" />
            <span>Kembali ke Halaman Utama</span>
          </Link>
        </div>
      </VCardContent>
    </VCard>
  );
}
