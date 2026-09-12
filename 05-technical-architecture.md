# 05 - Technical Architecture & Engineering Standards

## 1. Ikhtisar Arsitektur Sistem
Sistem Website Portofolio Personal Muhammad Fauzan Al Hafizh dirancang menggunakan arsitektur modern full-stack berbasis **Next.js (App Router)** yang memanfaatkan kapabilitas **React Server Components (RSC)** dan **Server Actions**. Pendekatan ini memungkinkan pemisahan yang bersih antara logika komputasi server yang aman dan antarmuka klien yang responsif, terintegrasi langsung dengan basis data **Neon PostgreSQL** melalui **Drizzle ORM**.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        KLIEN (BROWSER)                                 │
│  - Public Pages (RSC HTML + Islands of Interactivity)                 │
│  - Admin Dashboard (Vuetify-Style Client UI + Server Actions)          │
│  - Font Awesome 6 Icons / Tailwind CSS Responsive Layout              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / HTTPS (SSR / Actions / API)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   NEXT.JS SERVER RUNTIME (NODE.JS)                     │
│  ├── Middleware (Session Verification & Route Protection)              │
│  ├── App Router:                                                       │
│  │   ├── (public)/page.tsx  --> Server-rendered portfolio sections     │
│  │   ├── (auth)/login/page.tsx                                         │
│  │   └── (admin)/admin/...  --> Protected CMS views                    │
│  ├── Server Actions & Route Handlers:                                  │
│  │   ├── Auth Actions (Login, Dev Login Bypass, Logout)               │
│  │   ├── Content CRUD Actions (Profile, Projects, Skills, etc.)        │
│  │   └── Public Submission Actions (Contact Form + Anti-Spam)          │
│  ├── Security Layer (Zod Validation, Bcrypt Hash, Encrypted Cookies)   │
│  └── Data Access Layer (Drizzle ORM Client)                            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Neon Serverless Pooled Connection
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   NEON POSTGRESQL CLOUD DATABASE                       │
│  - PostgreSQL 16+ Engine (AWS ap-southeast-1 Singapore)                │
│  - Connection Pooler (PgBouncer-backed) for zero connection drop       │
│  - Normalized Tables: profiles, educations, skills, projects, etc.    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Stack Teknologi & Versi Rekomendasi
* **Framework Inti:** Next.js v15.x / v14.x (App Router murni).
* **Library UI:** React v19.x / v18.x.
* **Bahasa Pemrograman:** TypeScript (Strict Mode aktif: `"strict": true`).
* **Styling:** Tailwind CSS v3.4+ / v4.x dipadukan dengan PostCSS & Autoprefixer.
* **Desain Sistem & Komponen:** Vuetify-Inspired custom component layer dibangun di atas Tailwind CSS dan utilitas aksesibel.
* **Ikonografi:** `@fortawesome/react-fontawesome`, `@fortawesome/free-solid-svg-icons`, `@fortawesome/free-brands-svg-icons`.
* **Database Driver & ORM:**
  * `drizzle-orm` (TypeScript ORM tercepat, type-safe, zero overhead).
  * `drizzle-kit` (CLI migrasi basis data).
  * `@neondatabase/serverless` dan `pg` / `postgres` driver yang kompatibel dengan Neon Connection Pooling.
* **Validasi Skema:** `zod` (Validasi tipe data input end-to-end).
* **Autentikasi & Kriptografi:** `bcryptjs` (password hashing) + `jose` / `iron-session` (enkripsi sesi cookie stateless).

---

## 3. Strategi Koneksi Basis Data Neon PostgreSQL

### 3.1. Pemilihan Pola Koneksi (Pooling vs Direct)
Lingkungan Next.js (terutama serverless/edge functions) secara konstan membuka dan menutup koneksi basis data. Untuk mencegah kehabisan batas koneksi (*connection exhaustion*), aplikasi wajib menggunakan **Connection Pooler URL** yang telah disediakan oleh Neon.
* **Pooler Endpoint:** `ep-purple-base-b35a361f-pooler.c-4.ap-southeast-1.aws.neon.tech`
* **Format Variabel Lingkungan:**
  `DATABASE_URL=postgresql://Hafizh_owner:npg_Ilu6tVa8GTDB@ep-purple-base-b35a361f-pooler.c-4.ap-southeast-1.aws.neon.tech/Hafizh?sslmode=require&channel_binding=require`
* **Inisialisasi Klien Drizzle (`src/db/index.ts`):**
  Menggunakan singleton pattern untuk menghindari duplikasi koneksi pool pada masa development akibat *Hot Module Reloading* (HMR).

---

## 4. Arsitektur Autentikasi & Otorisasi Admin

### 4.1. Manajemen Sesi
* **Pola:** Stateless Encrypted Cookie Session menggunakan `jose` (JSON Web Token yang ditandatangani dan dienkripsi) atau `iron-session`.
* **Atribut Cookie:**
  * `HttpOnly: true` (Mencegah serangan pembacaan token via XSS).
  * `Secure: true` (Hanya ditransmisikan melalui protokol HTTPS pada production).
  * `SameSite: 'lax'` (Mencegah serangan CSRF).
  * `Path: '/'`.
  * `Max-Age: 60 * 60 * 24 * 7` (Sesi bertahan 7 hari).

### 4.2. Logika Dev Login Bypass (Development Mode Only)
* **Kebutuhan Pengguna:** Memungkinkan akses instan ke dashboard admin saat pengujian lokal tanpa mengetik ulang password berulang kali.
* **Mekanisme Keamanan:**
  1. Komponen tombol Dev Login pada halaman `/login` hanya di-render jika `process.env.NODE_ENV === 'development'`.
  2. Server Action `devLoginAction` melakukan pengecekan tegas:
     ```ts
     if (process.env.NODE_ENV !== 'development') {
       throw new Error('Akses ditolak. Fitur ini hanya tersedia di lingkungan development.');
     }
     ```
  3. Setelah validasi lolos, Server Action membuat sesi resmi untuk user admin development (menggunakan ID admin default) dan menyimpan cookie sesi yang sama persis dengan login reguler.
  4. Pengguna di-redirect secara aman ke `/admin/dashboard`.

### 4.3. Middleware Route Protection (`src/middleware.ts`)
* Bertugas menyaring setiap permintaan yang mengarah ke `/admin/*`.
* Membaca cookie sesi, memverifikasi tanda tangan kriptografis.
* Jika token valid -> permintaan dilanjutkan (`NextResponse.next()`).
* Jika token tidak ada atau invalid -> langsung mengalihkan ke `/login?redirect=/admin/...`.

---

## 5. Struktur Direktori Proyek (Clean Scalable Layout)

```
c:\Users\NCN0C\Downloads\hafiz\
├── .env.example                     # Contoh variabel lingkungan publik tanpa rahasia
├── .env.local                       # Variabel lingkungan aktual (di-git-ignore)
├── .gitignore                       # Berkas pengecualian Git
├── drizzle.config.ts                # Konfigurasi Drizzle Kit untuk Neon
├── next.config.mjs                  # Konfigurasi Next.js
├── package.json                     # Daftar paket dan dependensi
├── postcss.config.mjs               # Konfigurasi PostCSS & Tailwind
├── tailwind.config.ts               # Konfigurasi Tema, Warna & Elevasi Vuetify-style
├── tsconfig.json                    # Konfigurasi TypeScript Strict
├── src/
│   ├── app/                         # App Router Next.js
│   │   ├── (public)/                # Route Group Halaman Publik
│   │   │   ├── layout.tsx           # Public Layout (Navbar, Drawer, Footer)
│   │   │   └── page.tsx             # One-Page Portfolio (Hero, About, etc.)
│   │   ├── (auth)/                  # Route Group Autentikasi
│   │   │   ├── layout.tsx           # Minimalist Auth Layout
│   │   │   └── login/
│   │   │       └── page.tsx         # Login Form (+ Dev Login Button)
│   │   ├── (admin)/                 # Route Group Admin CMS (Protected)
│   │   │   └── admin/
│   │   │       ├── layout.tsx       # Admin Dashboard Shell (Drawer, Topbar)
│   │   │       ├── dashboard/page.tsx
│   │   │       ├── profile/page.tsx
│   │   │       ├── education/page.tsx
│   │   │       ├── skills/page.tsx
│   │   │       ├── projects/page.tsx
│   │   │       ├── experience/page.tsx
│   │   │       ├── certificates/page.tsx
│   │   │       └── messages/page.tsx
│   │   ├── api/                     # Route Handlers opsional
│   │   │   └── health/route.ts      # Health check endpoint
│   │   ├── globals.css              # Global styles & font imports
│   │   ├── not-found.tsx            # Custom 404 Page
│   │   └── error.tsx                # Global Error Boundary
│   ├── actions/                     # Next.js Server Actions (Type-safe mutations)
│   │   ├── auth.actions.ts          # Login, Dev Login, Logout
│   │   ├── profile.actions.ts       # Update profil
│   │   ├── education.actions.ts     # CRUD Pendidikan
│   │   ├── skill.actions.ts         # CRUD Keterampilan
│   │   ├── project.actions.ts       # CRUD Proyek
│   │   ├── experience.actions.ts    # CRUD Pengalaman
│   │   ├── certificate.actions.ts   # CRUD Sertifikat
│   │   └── message.actions.ts       # Kirim pesan publik, status baca, hapus
│   ├── components/                  # Komponen Reusable
│   │   ├── ui/                      # Primitive Design System (Vuetify-style)
│   │   │   ├── v-btn.tsx            # Tombol presisi varian
│   │   │   ├── v-card.tsx           # Kartu elevasi
│   │   │   ├── v-data-table.tsx     # Tabel data responsif
│   │   │   ├── v-dialog.tsx         # Modal dialog konfirmasi/form
│   │   │   ├── v-snackbar.tsx       # Toast notifikasi
│   │   │   ├── v-text-field.tsx     # Form input presisi
│   │   │   └── v-chip.tsx           # Tag / badge
│   │   ├── public/                  # Komponen Halaman Publik
│   │   │   ├── navbar.tsx
│   │   │   ├── navigation-drawer.tsx
│   │   │   ├── hero-section.tsx
│   │   │   ├── about-section.tsx
│   │   │   ├── education-section.tsx
│   │   │   ├── skills-section.tsx
│   │   │   ├── projects-section.tsx
│   │   │   ├── experience-section.tsx
│   │   │   ├── certificates-section.tsx
│   │   │   ├── contact-section.tsx
│   │   │   └── footer.tsx
│   │   └── admin/                   # Komponen Admin Dashboard
│   │       ├── admin-sidebar.tsx
│   │       ├── admin-topbar.tsx
│   │       ├── metric-card.tsx
│   │       └── delete-confirm-modal.tsx
│   ├── db/                          # Database Layer
│   │   ├── index.ts                 # Koneksi Drizzle ke Neon
│   │   ├── schema.ts                # Definisi Tabel Drizzle ORM
│   │   └── seed.ts                  # Script Seeding Data Development
│   ├── lib/                         # Utilities & Libraries
│   │   ├── auth.ts                  # Helper enkripsi token & sesi
│   │   ├── fontawesome.ts           # Konfigurasi Font Awesome
│   │   └── utils.ts                 # Formatting helper (tanggal, kelas CSS)
│   ├── schemas/                     # Validasi Zod
│   │   ├── auth.schema.ts
│   │   ├── profile.schema.ts
│   │   ├── project.schema.ts
│   │   └── contact.schema.ts
│   └── middleware.ts                # Next.js Route Guard Middleware
```

---

## 6. Tata Kelola Variabel Lingkungan (Environment Variables)

Sesuai standar keamanan, seluruh kredensial disimpan dalam berkas `.env.local` yang tidak boleh di-commit ke Git. Disediakan berkas contoh `.env.example` sebagai dokumentasi:

```bash
# Basis Data Neon PostgreSQL (Wajib)
DATABASE_URL="postgresql://Hafizh_owner:npg_Ilu6tVa8GTDB@ep-purple-base-b35a361f-pooler.c-4.ap-southeast-1.aws.neon.tech/Hafizh?sslmode=require&channel_binding=require"

# Rahasia Sesi Autentikasi (Minimal 32 karakter acak)
SESSION_SECRET="super_secret_session_key_replace_in_production_min_32_chars"

# Kredensial Akun Admin Awal (Digunakan saat Seeding Development)
INITIAL_ADMIN_USERNAME="hafizh"
INITIAL_ADMIN_EMAIL="hafizh@example.com"
INITIAL_ADMIN_PASSWORD="password_dev_change_me"

# Mode Lingkungan
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 7. Strategi Hydration, Caching & Revalidasi
* **Static Generation dengan On-Demand Revalidation:** Bagian publik di-render di server sebagai HTML statis super cepat. Ketika admin melakukan penambahan atau modifikasi data (misalnya menambah proyek baru), Server Action memanggil fungsi `revalidatePath('/')`.
* Hal ini secara otomatis memperbarui cache HTML di server Next.js seketika (*instant cache purge*), sehingga pengunjung langsung melihat konten termutakhir tanpa mengorbankan kecepatan akses.
