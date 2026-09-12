import { z } from 'zod';

export const loginSchema = z.object({
  usernameOrEmail: z.string().min(3, 'Username atau email minimal 3 karakter').max(255),
  password: z.string().min(6, 'Password minimal 6 karakter').max(100),
});

export const profileSchema = z.object({
  fullName: z.string().min(2, 'Nama lengkap minimal 2 karakter').max(150),
  headline: z.string().min(3, 'Headline minimal 3 karakter').max(255),
  bio: z.string().min(10, 'Biografi minimal 10 karakter'),
  avatarUrl: z.string().url('URL avatar tidak valid').or(z.literal('')).optional().nullable(),
  resumeUrl: z.string().url('URL resume tidak valid').or(z.literal('')).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  email: z.string().email('Format email tidak valid').or(z.literal('')).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  githubUrl: z.string().url('URL GitHub tidak valid').or(z.literal('')).optional().nullable(),
  linkedinUrl: z.string().url('URL LinkedIn tidak valid').or(z.literal('')).optional().nullable(),
  whatsappUrl: z.string().url('URL WhatsApp tidak valid').or(z.literal('')).optional().nullable(),
  isAvailable: z.boolean().default(true),
});

export const educationSchema = z.object({
  institution: z.string().min(2, 'Nama institusi minimal 2 karakter').max(200),
  degree: z.string().min(2, 'Gelar akademik minimal 2 karakter').max(100),
  fieldOfStudy: z.string().min(2, 'Jurusan minimal 2 karakter').max(150),
  startDate: z.string().min(1, 'Tanggal mulai wajib diisi').max(50),
  endDate: z.string().max(50).optional().nullable(),
  isCurrent: z.boolean().default(false),
  description: z.string().optional().nullable(),
  orderIndex: z.coerce.number().int().default(0),
  isPublished: z.boolean().default(true),
});

export const skillSchema = z.object({
  name: z.string().min(2, 'Nama keahlian minimal 2 karakter').max(100),
  category: z.string().min(2, 'Kategori minimal 2 karakter').max(100),
  iconClass: z.string().min(2, 'Kelas ikon Font Awesome wajib diisi (contoh: fa-brands fa-react)'),
  proficiencyLevel: z.coerce.number().min(1).max(100).default(80),
  orderIndex: z.coerce.number().int().default(0),
  isPublished: z.boolean().default(true),
});

export const projectSchema = z.object({
  title: z.string().min(3, 'Judul proyek minimal 3 karakter').max(200),
  slug: z.string().min(3, 'Slug minimal 3 karakter').regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung (-)'),
  description: z.string().min(10, 'Deskripsi singkat minimal 10 karakter'),
  content: z.string().optional().nullable(),
  thumbnailUrl: z.string().url('URL thumbnail tidak valid').or(z.literal('')).optional().nullable(),
  technologies: z.array(z.string()).default([]),
  demoUrl: z.string().url('URL Demo tidak valid').or(z.literal('')).optional().nullable(),
  repoUrl: z.string().url('URL Repositori tidak valid').or(z.literal('')).optional().nullable(),
  isFeatured: z.boolean().default(false),
  orderIndex: z.coerce.number().int().default(0),
  isPublished: z.boolean().default(true),
});

export const experienceSchema = z.object({
  company: z.string().min(2, 'Nama perusahaan minimal 2 karakter').max(200),
  role: z.string().min(2, 'Posisi/jabatan minimal 2 karakter').max(150),
  employmentType: z.string().default('Full-time'),
  location: z.string().max(100).optional().nullable(),
  startDate: z.string().min(1, 'Tanggal mulai wajib diisi').max(50),
  endDate: z.string().max(50).optional().nullable(),
  isCurrent: z.boolean().default(false),
  description: z.string().min(5, 'Deskripsi tanggung jawab minimal 5 karakter'),
  orderIndex: z.coerce.number().int().default(0),
  isPublished: z.boolean().default(true),
});

export const certificateSchema = z.object({
  title: z.string().min(2, 'Judul sertifikat minimal 2 karakter').max(200),
  issuer: z.string().min(2, 'Lembaga penerbit minimal 2 karakter').max(150),
  issueDate: z.string().min(1, 'Tanggal terbit wajib diisi').max(50),
  expirationDate: z.string().max(50).optional().nullable(),
  credentialId: z.string().max(150).optional().nullable(),
  credentialUrl: z.string().url('URL verifikasi tidak valid').or(z.literal('')).optional().nullable(),
  imageUrl: z.string().url('URL gambar tidak valid').or(z.literal('')).optional().nullable(),
  orderIndex: z.coerce.number().int().default(0),
  isPublished: z.boolean().default(true),
});

export const contactMessageSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(150),
  email: z.string().email('Format email tidak valid').max(255),
  subject: z.string().min(3, 'Subjek minimal 3 karakter').max(255),
  message: z.string().min(10, 'Pesan minimal 10 karakter').max(5000),
  honeypot: z.string().max(0, 'Spam terdeteksi').optional(),
});
