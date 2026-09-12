import { z } from 'zod';

export const loginSchema = z.object({
  usernameOrEmail: z.string().min(1, 'Username atau email wajib diisi').max(255),
  password: z.string().min(1, 'Password wajib diisi').max(100),
});

export const profileSchema = z.object({
  fullName: z.string().optional().nullable().transform((v) => (v && v.trim() ? v.trim() : 'Muhammad Fauzan Al Hafizh')),
  headline: z.string().optional().nullable().transform((v) => v?.trim() || ''),
  bio: z.string().optional().nullable().transform((v) => v?.trim() || ''),
  avatarUrl: z.string().url('URL avatar tidak valid').or(z.literal('')).optional().nullable(),
  resumeUrl: z.string().url('URL resume tidak valid').or(z.literal('')).optional().nullable(),
  location: z.string().max(100).optional().nullable().transform((v) => v?.trim() || ''),
  email: z.string().email('Format email tidak valid').or(z.literal('')).optional().nullable(),
  phone: z.string().max(50).optional().nullable().transform((v) => v?.trim() || ''),
  githubUrl: z.string().url('URL GitHub tidak valid').or(z.literal('')).optional().nullable(),
  linkedinUrl: z.string().url('URL LinkedIn tidak valid').or(z.literal('')).optional().nullable(),
  whatsappUrl: z.string().url('URL WhatsApp tidak valid').or(z.literal('')).optional().nullable(),
  isAvailable: z.boolean().default(true),
});

export const educationSchema = z.object({
  institution: z.string().min(1, 'Nama institusi wajib diisi').max(200),
  degree: z.string().optional().nullable().transform((v) => v?.trim() || '-'),
  fieldOfStudy: z.string().optional().nullable().transform((v) => v?.trim() || '-'),
  startDate: z.string().optional().nullable().transform((v) => v?.trim() || '-'),
  endDate: z.string().max(50).optional().nullable().transform((v) => v?.trim() || null),
  isCurrent: z.boolean().default(false),
  description: z.string().optional().nullable().transform((v) => v?.trim() || null),
  orderIndex: z.coerce.number().int().default(0),
  isPublished: z.boolean().default(true),
});

export const skillSchema = z.object({
  name: z.string().min(1, 'Nama keahlian wajib diisi').max(100),
  category: z.string().optional().nullable().transform((v) => v?.trim() || 'Frontend'),
  iconClass: z.string().optional().nullable().transform((v) => v?.trim() || 'fa-solid fa-code'),
  proficiencyLevel: z.coerce.number().min(0).max(100).default(80),
  orderIndex: z.coerce.number().int().default(0),
  isPublished: z.boolean().default(true),
});

export const projectSchema = z.object({
  title: z.string().min(1, 'Judul proyek wajib diisi').max(200),
  slug: z.string().optional().nullable().transform((v) => v?.trim() || ''),
  description: z.string().optional().nullable().transform((v) => v?.trim() || ''),
  content: z.string().optional().nullable().transform((v) => v?.trim() || null),
  thumbnailUrl: z.string().url('URL thumbnail tidak valid').or(z.literal('')).optional().nullable(),
  technologies: z.array(z.string()).default([]),
  demoUrl: z.string().url('URL Demo tidak valid').or(z.literal('')).optional().nullable(),
  repoUrl: z.string().url('URL Repositori tidak valid').or(z.literal('')).optional().nullable(),
  isFeatured: z.boolean().default(false),
  orderIndex: z.coerce.number().int().default(0),
  isPublished: z.boolean().default(true),
});

export const experienceSchema = z.object({
  company: z.string().min(1, 'Nama perusahaan wajib diisi').max(200),
  role: z.string().optional().nullable().transform((v) => v?.trim() || '-'),
  employmentType: z.string().default('Full-time'),
  location: z.string().max(100).optional().nullable().transform((v) => v?.trim() || null),
  startDate: z.string().optional().nullable().transform((v) => v?.trim() || '-'),
  endDate: z.string().max(50).optional().nullable().transform((v) => v?.trim() || null),
  isCurrent: z.boolean().default(false),
  description: z.string().optional().nullable().transform((v) => v?.trim() || ''),
  orderIndex: z.coerce.number().int().default(0),
  isPublished: z.boolean().default(true),
});

export const certificateSchema = z.object({
  title: z.string().min(1, 'Judul sertifikat wajib diisi').max(200),
  issuer: z.string().optional().nullable().transform((v) => v?.trim() || '-'),
  issueDate: z.string().optional().nullable().transform((v) => v?.trim() || '-'),
  expirationDate: z.string().max(50).optional().nullable().transform((v) => v?.trim() || null),
  credentialId: z.string().max(150).optional().nullable().transform((v) => v?.trim() || null),
  credentialUrl: z.string().url('URL verifikasi tidak valid').or(z.literal('')).optional().nullable(),
  imageUrl: z.string().url('URL gambar tidak valid').or(z.literal('')).optional().nullable(),
  orderIndex: z.coerce.number().int().default(0),
  isPublished: z.boolean().default(true),
});

export const contactMessageSchema = z.object({
  name: z.string().min(1, 'Nama lengkap wajib diisi').max(150),
  email: z.string().email('Format email tidak valid').max(255),
  subject: z.string().optional().nullable().transform((v) => v?.trim() || 'Pesan Baru dari Website'),
  message: z.string().min(1, 'Pesan tidak boleh kosong').max(5000),
  honeypot: z.string().max(0, 'Spam terdeteksi').optional(),
});
