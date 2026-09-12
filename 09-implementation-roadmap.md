# 09 - Implementation Roadmap & Phase-by-Phase Checklist

## 1. Ikhtisar Peta Jalan Pengembangan
Peta jalan implementasi ini dirancang secara sistematis dengan pendekatan modular agar setiap tahapan rekayasa dapat diverifikasi kualitasnya sebelum melangkah ke tahap berikutnya. Pengembangan dibagi menjadi **8 Fase Berurutan**.

```
Fase 1: Inisialisasi Proyek, Konfigurasi Tooling & Standar Lingkungan
   │
   ▼
Fase 2: Integrasi Basis Data Neon PostgreSQL & Drizzle ORM
   │
   ▼
Fase 3: Sistem Autentikasi Admin, Sesi Terenkripsi & Dev Login Bypass
   │
   ▼
Fase 4: Desain Sistem Vuetify-Style, Font Awesome & Komponen UI Inti
   │
   ▼
Fase 5: Pembangunan Halaman Publik (Showcase Portofolio Lengkap)
   │
   ▼
Fase 6: Pembangunan Template Admin & Seluruh Modul CRUD CMS
   │
   ▼
Fase 7: Pengujian Terpadu, Validasi Keamanan, Aksesibilitas & SEO
   │
   ▼
Fase 8: Finalisasi Produksi, Dokumentasi Setup & Deployment Readiness
```

---

## 2. Rincian Fase Implementasi & Checklist Verifikasi

### Fase 1: Inisialisasi Proyek, Tooling & Konfigurasi Lingkungan
* **Tujuan:** Menyiapkan struktur proyek Next.js, compiler TypeScript, utilitas Tailwind CSS, dan sistem pengelolaan variabel lingkungan.
* **Tugas Terperinci:**
  - [ ] Inisialisasi Next.js App Router dengan TypeScript Strict Mode.
  - [ ] Konfigurasi Tailwind CSS v3.4+/v4 dengan token tema (Dark/Light palette, radius presisi 6px/8px, elevasi Vuetify-style).
  - [ ] Instalasi pustaka Font Awesome (`@fortawesome/react-fontawesome`, solid & brands icons).
  - [ ] Pembuatan berkas `.env.example` dan konfigurasi `.env.local` dengan string koneksi Neon PostgreSQL.
  - [ ] Konfigurasi `tsconfig.json` dengan path alias `@/*` -> `./src/*`.
* **Kriteria Kelulusan:** Server pengembangan lokal (`npm run dev`) dapat dijalankan tanpa peringatan linting atau kesalahan kompilasi.

### Fase 2: Integrasi Basis Data Neon PostgreSQL & Drizzle ORM
* **Tujuan:** Menghubungkan aplikasi ke Neon Cloud PostgreSQL melalui connection pooler dan mendefinisikan skema data.
* **Tugas Terperinci:**
  - [ ] Instalasi dependensi Drizzle ORM (`drizzle-orm`, `drizzle-kit`, driver `@neondatabase/serverless` / `pg`).
  - [ ] Konfigurasi berkas `drizzle.config.ts` yang mengarah ke URL pooler Neon.
  - [ ] Penulisan skema lengkap di `src/db/schema.ts` (8 tabel: `admin_users`, `profiles`, `educations`, `skills`, `projects`, `experiences`, `certificates`, `contact_messages`).
  - [ ] Eksekusi migrasi skema via `npx drizzle-kit push` ke database Neon.
  - [ ] Pembuatan script seeding `src/db/seed.ts` (membuat akun admin awal dan data contoh bertanda transparan `[DATA CONTOH]`).
  - [ ] Verifikasi koneksi dan pembacaan tabel dari Neon.
* **Kriteria Kelulusan:** Seluruh 8 tabel berhasil terbentuk di Neon PostgreSQL dan seed data awal berhasil di-commit.

### Fase 3: Sistem Autentikasi Admin, Sesi Terenkripsi & Dev Login Bypass
* **Tujuan:** Membangun rute `/login` yang aman dengan proteksi middleware pada rute admin.
* **Tugas Terperinci:**
  - [ ] Implementasi hashing kata sandi aman via `bcryptjs`.
  - [ ] Pembuatan utilitas sesi cookie HTTP-Only (`jose` / session library) dengan atribut `Secure` dan `SameSite: Lax`.
  - [ ] Pembuatan halaman login `/login` dengan desain kartu elevasi terpusat.
  - [ ] Implementasi tombol **Dev Login** yang hanya tampil dan hanya dapat dieksekusi jika `NODE_ENV === 'development'`.
  - [ ] Pembuatan Next.js Middleware (`src/middleware.ts`) untuk memblokir akses ke rute `/admin/*` bagi pengguna tanpa sesi valid.
* **Kriteria Kelulusan:** Akses langsung ke `/admin/dashboard` tanpa login dialihkan ke `/login`. Dev Login berhasil memberikan akses instan di mode development.

### Fase 4: Desain Sistem Vuetify-Style & Komponen UI Inti
* **Tujuan:** Membangun lapisan komponen yang dapat digunakan ulang (*reusable primitives*) yang mencerminkan estetika Vuetify.
* **Tugas Terperinci:**
  - [ ] Pembuatan komponen tombol presisi `VBtn` (varian: primary, tonal, outlined, danger; ukuran normal & compact).
  - [ ] Pembuatan komponen kartu `VCard` dengan kontrol elevasi bayangan bertingkat.
  - [ ] Pembuatan komponen input formulir `VTextField` dan `VTextarea` dengan pesan kesalahan validasi Zod.
  - [ ] Pembuatan komponen modal dialog `VDialog` (modal form & modal konfirmasi hapus).
  - [ ] Pembuatan komponen notifikasi `VSnackbar` / Toast untuk feedback aksi CRUD.
  - [ ] Pembuatan komponen `VChip` untuk tag teknologi dan status badges.
  - [ ] Pembuatan tabel data responsif `VDataTable` dengan header terstruktur.
* **Kriteria Kelulusan:** Seluruh komponen inti lulus uji interaktivitas papan ketik (*keyboard accessible*), memiliki status hover/active/focus, dan bebas dari bentuk pill bundar yang dilarang.

### Fase 5: Pembangunan Halaman Publik (Showcase Portofolio Lengkap)
* **Tujuan:** Membangun satu halaman portofolio dinamis dengan navigasi mulus dan performa tinggi.
* **Tugas Terperinci:**
  - [ ] Implementasi Topbar Navbar dengan efek kaca (*backdrop blur*) dan tombol Dark/Light toggle.
  - [ ] Implementasi Mobile Navigation Drawer (Vuetify-style) dengan ikon Font Awesome.
  - [ ] Pembangunan **Hero Section:** Nama Muhammad Fauzan Al Hafizh, headline, availability badge, CTA buttons.
  - **About Section:** Narasi profil, statistik ringkas, tombol unduh resume.
  - **Education Section:** Linimasa riwayat akademik yang membaca data `educations` aktif dari Neon DB.
  - **Skills Section:** Matriks keahlian per kategori dengan ikon Font Awesome dan filter kategori.
  - **Projects Section:** Grid portofolio dengan tag teknologi, thumbnail, link live demo, dan repositori GitHub.
  - **Experience Section:** Linimasa vertikal pengalaman kerja/organisasi.
  - **Certificates Section:** Kartu sertifikat dengan tautan verifikasi kredensial.
  - **Contact Section:** Formulir pesan dengan validasi Zod, honeypot anti-spam, dan penyimpanan langsung ke Neon DB.
  - Pembangunan Footer dengan tautan media sosial eksternal resmi.
* **Kriteria Kelulusan:** Halaman publik memuat seluruh data dari Neon PostgreSQL secara server-side dan responsif sempurna di layar ponsel hingga monitor 4K.

### Fase 6: Pembangunan Template Admin & Modul CRUD CMS
* **Tujuan:** Membangun dashboard manajemen konten terpadu untuk pemilik portofolio.
* **Tugas Terperinci:**
  - [ ] Implementasi Shell Template Admin: Collapsible Sidebar dengan ikon Font Awesome, Topbar dengan status koneksi DB, dan Breadcrumbs.
  - [ ] Modul **Dashboard Overview:** Metrik ringkasan (total proyek, keahlian, pengalaman, sertifikat) dan widget pesan masuk terbaru.
  - [ ] Modul **CRUD Profil:** Form pengeditan bio, headline, URL avatar, dan tautan sosial media.
  - [ ] Modul **CRUD Pendidikan:** Tabel, modal tambah/edit, dan dialog konfirmasi hapus.
  - [ ] Modul **CRUD Keterampilan:** Tabel, filter kategori, pemilih kelas ikon Font Awesome, dan slider kemahiran.
  - [ ] Modul **CRUD Proyek:** Tabel, input tag teknologi interaktif, sakelar *featured*, dan kontrol urutan.
  - [ ] Modul **CRUD Pengalaman:** Tabel linimasa karier dan formulir mutasi.
  - [ ] Modul **CRUD Sertifikat:** Tabel kredensial dan validasi URL verifikasi.
  - [ ] Modul **Inbox Pesan Masuk:** Tabel pesan masuk, indikator status baca, modal pembaca isi pesan, dan aksi hapus spam.
  - [ ] Pengikatan `revalidatePath('/')` pada setiap aksi mutasi agar perubahan langsung tercermin di web publik.
* **Kriteria Kelulusan:** Seluruh operasi penambahan, pengubahan, dan penghapusan data pada 8 modul berhasil dieksekusi dan tersinkronisasi instan ke halaman publik.

### Fase 7: Pengujian Terpadu, Validasi Keamanan, Aksesibilitas & SEO
* **Tujuan:** Memastikan keandalan, performa, dan keamanan sistem sebelum peluncuran.
* **Tugas Terperinci:**
  - [ ] Pengujian fungsional formulir kontak dan pencegahan spam.
  - [ ] Pengujian rute middleware (memastikan halaman `/admin/*` tidak dapat dibobol tanpa login).
  - [ ] Verifikasi bahwa tombol Dev Login dinonaktifkan secara otomatis saat `NODE_ENV === 'production'`.
  - [ ] Audit aksesibilitas (kontras warna, navigasi tab, atribut ARIA, alt text gambar).
  - [ ] Konfigurasi SEO: Metadata dinamis, OpenGraph tags, Twitter cards, `sitemap.xml`, dan `robots.txt`.
  - [ ] Optimasi performa dan audit Google PageSpeed / Lighthouse (target skor 90+).
* **Kriteria Kelulusan:** Tidak ada kebocoran rahasia, audit keamanan lulus, dan skor performa memenuhi standar.

### Fase 8: Finalisasi Produksi, Dokumentasi Setup & Deployment
* **Tujuan:** Memastikan proyek siap dijalankan di lingkungan hosting manapun (Vercel, Cloudflare Pages, atau VPS) dengan dokumentasi yang lengkap.
* **Tugas Terperinci:**
  - [ ] Uji build produksi Next.js (`npm run build`) dengan zero lint/type errors.
  - [ ] Pembuatan panduan setup ringkas untuk inisialisasi basis data Neon dan menjalankan dev server.
  - [ ] Penyusunan ringkasan arsitektur final untuk pengguna.
* **Kriteria Kelulusan:** Build produksi sukses 100% tanpa galat kompilasi TypeScript atau bundling.
