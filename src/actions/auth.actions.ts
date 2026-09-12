'use server';

import bcrypt from 'bcryptjs';
import { eq, or } from 'drizzle-orm';
import { db } from '@/db';
import { adminUsers } from '@/db/schema';
import { loginSchema } from '@/schemas';
import { createAdminSession, destroyAdminSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export interface ActionResponse<T = unknown> {
  success: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  data?: T;
}

export async function loginAction(formData: FormData): Promise<ActionResponse> {
  const usernameOrEmail = formData.get('usernameOrEmail') as string;
  const password = formData.get('password') as string;

  const validation = loginSchema.safeParse({ usernameOrEmail, password });
  if (!validation.success) {
    return {
      success: false,
      error: 'Data yang dimasukkan tidak valid.',
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  try {
    const user = await db
      .select()
      .from(adminUsers)
      .where(
        or(
          eq(adminUsers.username, validation.data.usernameOrEmail),
          eq(adminUsers.email, validation.data.usernameOrEmail)
        )
      )
      .limit(1);

    if (!user || user.length === 0) {
      return {
        success: false,
        error: 'Kredensial login tidak cocok.',
      };
    }

    const isMatch = await bcrypt.compare(validation.data.password, user[0].passwordHash);
    if (!isMatch) {
      return {
        success: false,
        error: 'Kredensial login tidak cocok.',
      };
    }

    await createAdminSession({
      userId: user[0].id,
      username: user[0].username,
    });

    return {
      success: true,
      message: 'Login berhasil! Mengarahkan ke dashboard...',
    };
  } catch (error) {
    console.error('Login action error:', error);
    return {
      success: false,
      error: 'Terjadi kesalahan sistem saat memproses login. Silakan coba kembali.',
    };
  }
}

export async function devLoginAction(): Promise<ActionResponse> {
  // STRICT CHECK: Hanya diizinkan jika mode development
  if (process.env.NODE_ENV !== 'development') {
    return {
      success: false,
      error: 'Akses ditolak. Fitur Dev Login hanya diizinkan pada mode development.',
    };
  }

  try {
    const users = await db.select().from(adminUsers).limit(1);
    const userId = users[0]?.id || 'dev-admin-id';
    const username = users[0]?.username || 'hafizh';

    await createAdminSession({
      userId,
      username,
    });

    return {
      success: true,
      message: 'Dev Login berhasil! Mengarahkan ke dashboard...',
    };
  } catch (error) {
    console.error('Dev Login error:', error);
    return {
      success: false,
      error: 'Gagal melakukan dev login.',
    };
  }
}

export async function logoutAction(): Promise<void> {
  await destroyAdminSession();
  redirect('/login');
}
