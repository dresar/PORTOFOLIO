import React from 'react';
import { Metadata } from 'next';
import { LoginForm } from '@/components/admin/login-form';
import { getAdminSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Login Admin | Muhammad Fauzan Al Hafizh',
  description: 'Halaman autentikasi administrator Content Management System',
};

export default async function LoginPage() {
  const session = await getAdminSession();
  if (session) {
    redirect('/admin/dashboard');
  }

  const isDevMode = process.env.NODE_ENV === 'development';

  return <LoginForm isDevMode={isDevMode} />;
}
