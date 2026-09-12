# 08 - API Contracts, Server Actions & Data Flow

## 1. Arsitektur Komunikasi & Aliran Data
Aplikasi memanfaatkan paradigma modern **Next.js Server Actions** sebagai mekanisme utama mutasi data dan interaksi formulir. Pendekatan ini menghilangkan kebutuhan menulis *boilerplate REST endpoints* terpisah, menjamin keamanan tingkat tinggi karena kode eksekusi berjalan 100% di server, serta menyediakan *type-safety* ujung-ke-ujung (*end-to-end*) antara komponen antarmuka dan basis data Neon PostgreSQL.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ALIRAN DATA END-TO-END                          │
└────────────────────────────────────────────────────────────────────────┘

[Browser: React Component]
         │ 1. Form Submit / Tombol Aksi (FormData / Payload Objek)
         ▼
[Next.js Server Action]
         │ 2. Autentikasi & Verifikasi Sesi (jika rute admin)
         ▼
[Zod Schema Validator]
         │ 3. Validasi Tipe Data & Sanitasi Input
         ├───► [Gagal Validasi] ──► Return { success: false, errors: [...] }
         ▼
[Drizzle ORM Query Layer]
         │ 4. Eksekusi SQL Parameterized Query
         ▼
[Neon PostgreSQL (Connection Pooler)]
         │ 5. Commit Data Transaksi Basis Data
         ▼
[Cache Invalidation Layer]
         │ 6. revalidatePath('/') / revalidatePath('/admin/...')
         ▼
[Browser: UI Update]
         ▲ 7. Return Result Payload & Tampilkan Vuetify-style Snackbar
```

---

## 2. Standar Kontrak Respons (Response Wrapper Contract)

Semua Server Actions mengembalikan objek respons dengan struktur konsisten:

```typescript
export type ActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};
```

---

## 3. Spesifikasi Skema Validasi Zod (`src/schemas/`)

### 3.1. Skema Autentikasi (`auth.schema.ts`)
```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  usernameOrEmail: z
    .string()
    .min(3, 'Username atau email minimal 3 karakter')
    .max(255, 'Maksimal 255 karakter'),
  password: z
    .string()
    .min(6, 'Password minimal 6 karakter')
    .max(100, 'Password maksimal 100 karakter'),
});
```

### 3.2. Skema Profil (`profile.schema.ts`)
```typescript
export const profileSchema = z.object({
  fullName: z.string().min(2, 'Nama lengkap minimal 2 karakter').max(150),
  headline: z.string().min(5, 'Headline minimal 5 karakter').max(255),
  bio: z.string().min(10, 'Bio minimal 10 karakter'),
  avatarUrl: z.string().url('URL Avatar tidak valid').or(z.literal('')).optional(),
  resumeUrl: z.string().url('URL Resume tidak valid').or(z.literal('')).optional(),
  location: z.string().max(100).optional(),
  email: z.string().email('Format email tidak valid').or(z.literal('')).optional(),
  phone: z.string().max(50).optional(),
  githubUrl: z.string().url('URL GitHub tidak valid').or(z.literal('')).optional(),
  linkedinUrl: z.string().url('URL LinkedIn tidak valid').or(z.literal('')).optional(),
  whatsappUrl: z.string().url('URL WhatsApp tidak valid').or(z.literal('')).optional(),
  isAvailable: z.boolean().default(true),
});
```

### 3.3. Skema Proyek (`project.schema.ts`)
```typescript
export const projectSchema = z.object({
  title: z.string().min(3, 'Judul proyek minimal 3 karakter').max(200),
  slug: z.string().min(3, 'Slug minimal 3 karakter').regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan strip'),
  description: z.string().min(10, 'Deskripsi singkat minimal 10 karakter'),
  content: z.string().optional(),
  thumbnailUrl: z.string().url('URL Thumbnail tidak valid').or(z.literal('')).optional(),
  technologies: z.array(z.string()).min(1, 'Minimal satu teknologi dicantumkan'),
  demoUrl: z.string().url('URL Demo tidak valid').or(z.literal('')).optional(),
  repoUrl: z.string().url('URL Repositori tidak valid').or(z.literal('')).optional(),
  isFeatured: z.boolean().default(false),
  orderIndex: z.number().int().default(0),
  isPublished: z.boolean().default(true),
});
```

### 3.4. Skema Keterampilan (`skill.schema.ts`)
```typescript
export const skillSchema = z.object({
  name: z.string().min(2, 'Nama keahlian minimal 2 karakter').max(100),
  category: z.enum(['Frontend', 'Backend', 'Database', 'Cloud & DevOps', 'Tools', 'Lainnya']),
  iconClass: z.string().min(2, 'Kelas ikon Font Awesome wajib diisi (e.g. fa-brands fa-react)'),
  proficiencyLevel: z.number().min(1).max(100).default(80),
  orderIndex: z.number().int().default(0),
  isPublished: z.boolean().default(true),
});
```

### 3.5. Skema Formulir Kontak Publik (`contact.schema.ts`)
```typescript
export const contactMessageSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(150, 'Nama terlalu panjang'),
  email: z.string().email('Format email tidak valid').max(255),
  subject: z.string().min(3, 'Subjek minimal 3 karakter').max(255),
  message: z.string().min(10, 'Pesan minimal 10 karakter').max(5000, 'Pesan maksimal 5000 karakter'),
  // Honeypot field (wajib kosong, jika terisi berarti bot spam)
  websiteUrlHoneypot: z.string().max(0, 'Spam bot terdeteksi').optional(),
});
```

---

## 4. Daftar Server Actions & Rincian Operasi

### 4.1. Modul Autentikasi (`src/actions/auth.actions.ts`)
1. `loginAction(payload: LoginInput): Promise<ActionResponse>`
   * Melakukan verifikasi password bcrypt terhadap tabel `admin_users`.
   * Menerbitkan cookie sesi terenkripsi jika cocok.
2. `devLoginAction(): Promise<ActionResponse>`
   * Memvalidasi `NODE_ENV === 'development'`.
   * Membuat sesi bypass admin development dan me-redirect ke `/admin/dashboard`.
3. `logoutAction(): Promise<ActionResponse>`
   * Menghapus cookie sesi dan me-redirect pengguna ke `/login`.

### 4.2. Modul Konten Admin (`src/actions/*.actions.ts`)
* `updateProfileAction(payload: ProfileInput): Promise<ActionResponse>`
* `createEducationAction(payload: EducationInput): Promise<ActionResponse>`
* `updateEducationAction(id: string, payload: EducationInput): Promise<ActionResponse>`
* `deleteEducationAction(id: string): Promise<ActionResponse>`
* `createSkillAction(payload: SkillInput): Promise<ActionResponse>`
* `updateSkillAction(id: string, payload: SkillInput): Promise<ActionResponse>`
* `deleteSkillAction(id: string): Promise<ActionResponse>`
* `createProjectAction(payload: ProjectInput): Promise<ActionResponse>`
* `updateProjectAction(id: string, payload: ProjectInput): Promise<ActionResponse>`
* `deleteProjectAction(id: string): Promise<ActionResponse>`
* `createExperienceAction(payload: ExperienceInput): Promise<ActionResponse>`
* `updateExperienceAction(id: string, payload: ExperienceInput): Promise<ActionResponse>`
* `deleteExperienceAction(id: string): Promise<ActionResponse>`
* `createCertificateAction(payload: CertificateInput): Promise<ActionResponse>`
* `updateCertificateAction(id: string, payload: CertificateInput): Promise<ActionResponse>`
* `deleteCertificateAction(id: string): Promise<ActionResponse>`
* `markMessageAsReadAction(id: string): Promise<ActionResponse>`
* `deleteMessageAction(id: string): Promise<ActionResponse>`

Setiap Server Action yang melakukan mutasi data otomatis memanggil `revalidatePath('/')` guna memperbarui tampilan halaman publik secara instan.

### 4.3. Modul Kontak Publik (`src/actions/message.actions.ts`)
1. `sendContactMessageAction(payload: ContactInput): Promise<ActionResponse>`
   * Memvalidasi field honeypot (jika ada nilai, eksekusi dihentikan diam-diam).
   * Validasi skema Zod.
   * Simpan ke tabel `contact_messages` dengan status default `is_read = false`.
   * Revalidasi path `/admin/messages` dan `/admin/dashboard` agar counter pesan admin langsung bertambah.

---

## 5. Mekanisme Penanganan Galat & Keamanan Data
1. **Pencegahan Kebocoran Pesan Galat Database:**
   Semua Server Action dibungkus dalam blok `try...catch`. Jika terjadi kesalahan koneksi atau query basis data dari Neon, pesan galat internal (seperti string koneksi atau nama tabel) diisolasi di server log. Pesan yang dikembalikan ke antarmuka klien hanyalah pesan ramah seperti: *"Terjadi kendala saat memproses permintaan. Silakan coba kembali."*
2. **Perlindungan Injeksi SQL:**
   Drizzle ORM mengonversi semua pemanggilan metode (seperti `.where(eq(projects.id, id))`) menjadi kueri berparameter (*parameterized query*), sehingga aman dari teknik eksploitasi SQL Injection konvensional.
3. **Pembersihan String (Sanitasi Input):**
   Input teks disaring secara otomatis dari tag HTML berbahaya untuk mencegah injeksi script tersimpan (*Stored XSS*).
