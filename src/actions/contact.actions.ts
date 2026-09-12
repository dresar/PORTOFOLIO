'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { contactMessages } from '@/db/schema';
import { contactMessageSchema } from '@/schemas';

export interface ActionResponse<T = unknown> {
  success: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  data?: T;
}

export async function submitContactMessageAction(formData: FormData): Promise<ActionResponse> {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const subject = formData.get('subject') as string;
  const message = formData.get('message') as string;
  const honeypot = (formData.get('website_url_honey') as string) || '';

  // 1. Honeypot check: Jika ada robot spam yang mengisi field tersembunyi
  if (honeypot && honeypot.trim().length > 0) {
    // Return pura-pura sukses agar bot tidak mencoba cara lain
    return {
      success: true,
      message: 'Pesan Anda telah berhasil dikirim! Terima kasih.',
    };
  }

  // 2. Validasi Skema Zod
  const validation = contactMessageSchema.safeParse({
    name,
    email,
    subject,
    message,
    honeypot,
  });

  if (!validation.success) {
    return {
      success: false,
      error: 'Harap periksa kembali isian formulir Anda.',
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  try {
    // 3. Simpan ke basis data Neon PostgreSQL
    await db.insert(contactMessages).values({
      name: validation.data.name,
      email: validation.data.email,
      subject: validation.data.subject,
      message: validation.data.message,
      isRead: false,
    });

    // 4. Invalidate cache admin agar notifikasi pesan langsung terbarui
    revalidatePath('/admin/messages');
    revalidatePath('/admin/dashboard');

    return {
      success: true,
      message: 'Terima kasih! Pesan Anda telah berhasil dikirim ke Muhammad Fauzan Al Hafizh.',
    };
  } catch (error) {
    console.error('Submit contact message error:', error);
    return {
      success: false,
      error: 'Terjadi kendala saat mengirim pesan. Silakan coba beberapa saat lagi.',
    };
  }
}
