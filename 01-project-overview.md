# 01 - Project Overview

## 1. Identitas Proyek & Pemilik
* **Nama Proyek:** Website Portofolio Personal & Admin CMS Muhammad Fauzan Al Hafizh
* **Nama Pemilik:** Muhammad Fauzan Al Hafizh
* **Peran Pemilik:** Software Engineer / Full-Stack Developer
* **Arsitektur Utama:** Next.js (App Router), React, TypeScript, Drizzle ORM, Neon PostgreSQL
* **Gaya Desain Antarmuka:** VuetifyJS-inspired Design System (Clean, Elevated, Structured, Accessible)
* **Pustaka Ikon:** Font Awesome 6 (Strict: Tanpa penggunaan emoji sebagai ikon UI)

---

## 2. Visi Produk
Membangun platform website portofolio profesional kelas premium yang tidak hanya berfungsi sebagai etalase showcase karya statis, melainkan sebagai sistem aplikasi web full-stack modern dengan Content Management System (CMS) mandiri. Platform ini dirancang untuk merefleksikan kompetensi teknis tingkat tinggi dari Muhammad Fauzan Al Hafizh, memberikan impresi visual elegan kepada rekruter dan klien potensial, serta memudahkan pembaruan seluruh konten portofolio secara dinamis dan aman secara real-time.

---

## 3. Tujuan Strategis Proyek
1. **Representasi Profesional & Personal Branding:** Menyajikan profil, riwayat pendidikan, keahlian teknis, portofolio proyek unggulan, riwayat pengalaman profesional, dan sertifikasi keahlian dalam tata letak yang rapi, modern, dan interaktif.
2. **Pengelolaan Konten Mandiri (Zero-Code Maintenance):** Mengeliminasi kebutuhan pengubahan kode program (*hardcoded update*) dan *re-deployment* setiap kali ada pembaruan proyek, pengalaman baru, atau sertifikat baru melalui Admin Panel yang intuitif.
3. **Penyaluran Komunikasi Terstruktur (Lead Generation):** Menyediakan saluran interaksi pengunjung/rekruter melalui formulir kontak terproteksi yang menyimpan pesan langsung ke basis data Neon PostgreSQL dan dapat dikelola melalui inbox admin.
4. **Keunggulan Teknis & Performa (Engineering Excellence):** Memastikan performa optimal (PageSpeed 90+), SEO-friendly dengan metadata dinamis, OpenGraph lengkap, waktu muat instan (*instant load*), dan aksesibilitas tinggi (WCAG 2.1 AA).

---

## 4. Target Pengguna & Persona
Platform ini melayani dua persona utama:

### A. Pengguna Publik (Visitor Persona)
* **Profil:** Technical Recruiter, Engineering Manager, HR Specialist, Klien Potensial (Freelance/Contract), dan Komunitas Pengembang.
* **Tujuan Pengguna:**
  * Memverifikasi kredensial akademik dan sertifikasi teknis Muhammad Fauzan Al Hafizh.
  * Mengeksplorasi proyek-proyek yang telah dikerjakan beserta *stack* teknologi, demo langsung (*live demo*), dan repositori kode.
  * Menghubungi pemilik portofolio secara cepat dan aman melalui formulir kontak.
* **Karakteristik Akses:** Mengakses melalui perangkat mobile, tablet, maupun desktop; menuntut navigasi cepat dan tampilan profesional tanpa hambatan (*frictionless*).

### B. Administrator (Owner Persona)
* **Profil:** Muhammad Fauzan Al Hafizh sebagai pemilik tunggal platform.
* **Tujuan Pengguna:**
  * Melakukan autentikasi aman ke Admin Panel.
  * Memantau ringkasan statistik (jumlah proyek, keterampilan, pesan baru) pada dashboard.
  * Melakukan operasi Create, Read, Update, Delete (CRUD) pada setiap entitas konten.
  * Meninjau dan menindaklanjuti pesan masuk dari pengunjung.
  * Menguji fitur secara cepat di lingkungan lokal melalui opsi *Dev Login*.

---

## 5. Masalah yang Diselesaikan
| Masalah Portofolio Konvensional | Solusi pada Portofolio Muhammad Fauzan Al Hafizh |
| :--- | :--- |
| **Konten Statis & Kaku:** Pembaruan proyek atau sertifikat memerlukan pengeditan kode sumber dan proses *deploy* ulang. | **Full-Stack CMS Dinamis:** Seluruh entitas disimpan di Neon PostgreSQL dan dapat dimodifikasi kapan saja melalui Admin Panel responsif. |
| **Pesan Kontak Hilang / Tidak Terorganisir:** Mengandalkan *mailto link* atau layanan pihak ketiga yang lambat dan rentan spam. | **Database-Backed Inbox:** Formulir kontak divalidasi dengan Zod, diproteksi honeypot/rate-limit, dan disimpan terstruktur di database dengan penanda status baca. |
| **Desain Generik & Berantakan:** Penggunaan template generik yang tidak proporsional dan tidak mencerminkan standar rekayasa modern. | **Vuetify-Inspired Precision Design:** Mengadopsi struktur elevasi, grid 8px, tipografi presisi, dan kartu konsisten yang memberikan impresi profesional premium. |
| **Kurangnya Keamanan:** Banyak portofolio membocorkan token API atau kredensial di sisi klien (*client-side*). | **Arsitektur Server-Side Strict:** Drizzle ORM berjalan 100% pada server; rute admin diproteksi oleh HTTP-Only Session Cookie dan Middleware. |

---

## 6. Ruang Lingkup Proyek (Scope of Work)

### A. Dalam Cakupan (In-Scope)
1. **Public Showcase Application:**
   * **Hero Section:** Headline profesional, pengenalan singkat, tombol Call-to-Action (CTA), dan indikator ketersediaan kerja (*availability badge*).
   * **About Section:** Profil diri, filosofi rekayasa, minat teknis, dan tautan dokumen resume/CV.
   * **Education Section:** Riwayat pendidikan dalam format kartu/linimasa terstruktur.
   * **Skills Section:** Pengelompokan keahlian teknis & non-teknis berdasarkan kategori dengan ikon Font Awesome.
   * **Projects Section:** Grid proyek dengan tag teknologi, tautan repositori, tautan demo langsung, dan indikator *featured*.
   * **Experience Section:** Linimasa riwayat kerja, magang, atau organisasi.
   * **Certificates Section:** Kartu sertifikasi dengan tanggal, penerbit, nomor kredensial, dan tautan verifikasi.
   * **Contact Section:** Formulir pesan terintegrasi database dengan validasi real-time.
   * **Global Layout & Navigation:** Navbar tetap (*sticky blur*), drawer navigasi mobile, pemilih tema (Dark/Light mode), dan footer.
2. **Admin Management System (CMS):**
   * Halaman login terproteksi (`/login`) dengan dukungan *Dev Login Bypass* (eksklusif mode development).
   * Dashboard ringkasan metrik statistik dan pesan terbaru.
   * Modul CRUD Profile/About.
   * Modul CRUD Riwayat Pendidikan.
   * Modul CRUD Kategori & Daftar Keterampilan.
   * Modul CRUD Portofolio Proyek.
   * Modul CRUD Riwayat Pengalaman.
   * Modul CRUD Sertifikat & Lisensi.
   * Modul Manajemen Pesan Masuk (Inbox) dengan aksi tandai terbaca/hapus.
3. **Infrastruktur & Keamanan:**
   * Database serverless Neon PostgreSQL dengan Drizzle ORM.
   * Autentikasi sesi terenkripsi (HTTP-Only cookies).
   * Proteksi middleware pada rute admin (`/admin/*`).
   * Validasi skema Zod pada setiap mutasi data.

### B. Di Luar Cakupan (Out-of-Scope v1)
* Sistem multi-user / multi-role (hanya mendukung akun administrator tunggal).
* Sistem pembayaran / langganan komersial.
* Obrolan langsung (*live chat*) berbasis WebSocket secara real-time.
* Editor konten rich-text berbasis WYSIWYG berat (menggunakan Markdown atau plain text terstruktur untuk performa optimal).

---

## 7. Indikator Keberhasilan (Key Performance Indicators)
1. **Performa & Kecepatan:** Skor Google PageSpeed Insights minimal **90+** untuk metrik Desktop dan Mobile pada halaman publik.
2. **Kualitas Desain & Responsivitas:** Tata letak bebas *horizontal overflow*, adaptif sempurna pada resolusi Mobile (360px - 480px), Tablet (768px - 1024px), dan Desktop (1280px+).
3. **Integritas Fungsional:** 100% operasi CRUD pada Admin Panel berhasil menyimpan data ke Neon PostgreSQL dan langsung terfleksi pada halaman publik tanpa kesalahan (*zero data loss*).
4. **Keamanan & Privasi:** Zero leak pada kredensial basis data Neon (`DATABASE_URL`), tidak ada password plaintext, dan tombol *Dev Login* terbukti secara otomatis nonaktif pada lingkungan produksi.

---

## 8. Asumsi dan Batasan Rekayasa
1. **Kerahasiaan Data Pribadi:** Data riwayat pendidikan, pengalaman, proyek, dan kontak Muhammad Fauzan Al Hafizh yang belum disediakan secara spesifik oleh pengguna tidak akan dikarang secara fiktif. Sistem menggunakan penanda placeholder eksplisit seperti `[ISI EMAIL]`, `[ISI LINK GITHUB]`, `[ISI NO TELEPON]`, atau data contoh berlabel `[DATA CONTOH]` agar mudah diganti saat sistem beroperasi.
2. **Kompatibilitas Komponen UI:** Karena VuetifyJS secara native dirancang khusus untuk ekosistem Vue 3, proyek Next.js ini mengadopsi prinsip desain, token elevasi, tata letak, dan sistem komponen Vuetify yang direka ulang secara presisi (*custom crafted*) menggunakan React, Tailwind CSS, dan komponen aksesibel headless tanpa mengorbankan performa SSR.
3. **Koneksi Database:** Koneksi ke Neon PostgreSQL memanfaatkan *Connection Pooling* (`-pooler.c-4.ap-southeast-1.aws.neon.tech`) guna mendukung arsitektur *serverless function* Next.js tanpa menimbulkan *connection exhaustion*.
