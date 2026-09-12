# 04 - UI/UX Design System & Component Guidelines

## 1. Filosofi Desain & Evaluasi Arsitektur Vuetify

### 1.1. Evaluasi Kompatibilitas VuetifyJS pada Next.js
* **Analisis Masalah:** VuetifyJS merupakan pustaka komponen berbasis framework **Vue 3**. Secara fundamental, Vuetify bergantung pada runtime Vue (`vue`, `createApp`, `v-model`, Vue reactivity engine). Mengimpor Vuetify secara mentah ke dalam Next.js (yang merupakan ekosistem React) tidak didukung dan secara teknis tidak mungkin dilakukan tanpa *wrapper* emulasi runtime yang sangat berat, lambat, dan merusak fitur React Server Components (RSC) serta SEO.
* **Keputusan Arsitektur:** Kami membangun **Vuetify-Inspired React Design System** kustom. Sistem ini mengadopsi secara setia seluruh prinsip visual, hierarki elevasi (*elevation levels*), sistem grid, pola interaksi (*ripple/micro-feedback*), dan struktur komponen Vuetify (seperti `v-btn`, `v-card`, `v-navigation-drawer`, `v-data-table`, `v-dialog`, `v-snackbar`, dan `v-chip`), namun diimplementasikan 100% menggunakan **React, TypeScript, Tailwind CSS**, dan komponen aksesibel headless (*primitives*).
* **Keuntungan Pendekatan:**
  1. *Zero Runtime Overhead:* Tidak ada ketergantungan lintas-framework.
  2. *Full SSR / RSC Compatibility:* Komponen dapat di-render langsung di server untuk performa maksimum.
  3. *Consistent Visual Language:* Menghadirkan estetika Vuetify yang terstruktur, elegan, dan presisi.

---

## 2. Sistem Tipografi (Typography System)

Kami menetapkan perpaduan tipografi modern menggunakan font Google yang dimuat secara optimal via `next/font/google`:
* **Font Utama (Headings & Body):** **Plus Jakarta Sans** (atau **Inter**)
  * Karakteristik: Geometris, keterbacaan tinggi pada layar digital kecil maupun besar, tampilan modern dan profesional.
  * Weights: Regular (400), Medium (500), SemiBold (600), Bold (700), ExtraBold (800).
* **Font Monospace (Kode, Tag Teknologi, & Kredensial):** **JetBrains Mono**
  * Digunakan pada: Tech stack badges, file paths, ID kredensial sertifikat.

### Skala Hirarki Tipografi
| Token Hirarki | Ukuran Font / Line Height | Font Weight | Penggunaan Utama |
| :--- | :--- | :--- | :--- |
| **Display 1** | `48px` (3rem) / `1.15` | ExtraBold (800) | Hero Headline Utama |
| **Heading 1 (H1)** | `36px` (2.25rem) / `1.2` | Bold (700) | Judul Section Utama |
| **Heading 2 (H2)** | `28px` (1.75rem) / `1.25` | Bold (700) | Judul Kartu Proyek, Sub-section |
| **Heading 3 (H3)** | `20px` (1.25rem) / `1.3` | SemiBold (600) | Judul Kartu Keterampilan, Modal Title |
| **Subtitle / Lead**| `18px` (1.125rem) / `1.5` | Medium (500) | Deskripsi Lead Hero & About |
| **Body Regular** | `15px` (0.9375rem) / `1.6` | Regular (400) | Konten Paragraf, Keterangan |
| **Body Small** | `13px` (0.8125rem) / `1.5` | Regular / Medium | Meta informasi, Tanggal, Form label |
| **Caption / Badge**| `11px` (0.6875rem) / `1.4` | SemiBold (600) | Tag teknologi, Status indikator |

---

## 3. Palet Warna & Token Tema (Color Tokens)

Sistem mengadopsi tema gelap (*Dark Mode*) sebagai standar utama bagi developer showcase kelas premium, dilengkapi dukungan tema terang (*Light Mode*) dengan rasio kontras ketat sesuai standar WCAG AA.

### 3.1. Dark Mode Tokens (Default & Rekomendasi)
* **Background Utama (`bg-surface-ground`):** `#0B0F19` (Deep Blue-Black, mewah dan ramah di mata).
* **Surface Card (`bg-surface`):** `#111827` (Slate Gray yang kontras terhadap latar belakang).
* **Elevated Surface (`bg-surface-elevated`):** `#1F2937` (Untuk modal, dropdown, dan kartu interaktif).
* **Border & Divider (`border-subtle`):** `#374151` / `rgba(255, 255, 255, 0.08)`.
* **Primary Brand Accent (`primary`):** `#3B82F6` (Electric Azure Blue, energetik dan profesional).
* **Primary Hover (`primary-hover`):** `#2563EB`.
* **Secondary Accent (`secondary`):** `#10B981` (Emerald Green - melambangkan status aktif, ketersediaan kerja, dan verifikasi).
* **Text High-Emphasis (`text-primary`):** `#F9FAFB` (Putih terang, kontras > 12:1).
* **Text Medium-Emphasis (`text-secondary`):** `#9CA3AF` (Abu-abu netral yang lembut).
* **Text Muted (`text-muted`):** `#6B7280` (Placeholder dan teks pendukung).
* **Error / Destructive (`error`):** `#EF4444` (Aksi hapus, notifikasi galat).
* **Warning (`warning`):** `#F59E0B` (Indikator draft atau perhatian).

### 3.2. Light Mode Tokens
* **Background Utama:** `#F8FAFC` (Off-white bersih).
* **Surface Card:** `#FFFFFF` (Putih murni).
* **Elevated Surface:** `#F1F5F9`.
* **Border & Divider:** `#E2E8F0`.
* **Primary Brand Accent:** `#2563EB`.
* **Text High-Emphasis:** `#0F172A`.
* **Text Medium-Emphasis:** `#475569`.

---

## 4. Sistem Elevasi, Radius & Spacing (Vuetify-Style)

### 4.1. Elevation Tokens (Shadow Hierarchy)
Mengikuti tingkatan elevasi Vuetify Material Design untuk memberikan persepsi kedalaman visual (*visual depth*):
* **`elevation-0`:** `box-shadow: none;` (Elemen datar).
* **`elevation-1`:** `box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);` (Kartu statis).
* **`elevation-2`:** `box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.15), 0 2px 4px -2px rgba(0, 0, 0, 0.1);` (Hover state kartu, tabel).
* **`elevation-3`:** `box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -4px rgba(0, 0, 0, 0.15);` (Dropdowns, Topbar).
* **`elevation-4`:** `box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2);` (Modal dialog, Drawer).

### 4.2. Border Radius Presisi (Non-Pill Policy)
* **Aturan Khusus:** Mengikuti standar *precision-card-button-ui* dan *button-presisi*. Tombol dan kartu **DILARANG** menggunakan bentuk kapsul/pill bundar berlebihan (`rounded-full` pada tombol kotak dilarang keras).
* **Radius Standar:**
  * **Buttons & Inputs:** `rounded-[6px]` s/d `rounded-lg (8px)` - memberikan sudut tegas, rapi, dan compact.
  * **Cards & Containers:** `rounded-xl (12px)` - modern dengan batas lengkungan elegan.
  * **Modals & Dialogs:** `rounded-2xl (16px)`.
  * **Badges / Chips:** `rounded-md (6px)` dengan padding ringkas.

### 4.3. Spacing Grid (8pt Grid Standard)
Semua jarak antarelemen mengikuti kelipatan 4px / 8px:
* `4px` (gap-1), `8px` (gap-2), `12px` (gap-3), `16px` (gap-4), `24px` (gap-6), `32px` (gap-8), `48px` (gap-12), `64px` (gap-16).

---

## 5. Sistem Ikonografi: Font Awesome 6
Sesuai instruksi mutlak proyek, **semua ikon antarmuka wajib menggunakan Font Awesome**. Dilarang keras menggunakan karakter emoji sebagai pengganti ikon UI.

### 5.1. Pustaka & Konfigurasi
* Menggunakan paket resmi `@fortawesome/react-fontawesome` yang dipadukan dengan:
  * `@fortawesome/free-solid-svg-icons` (Navigasi, aksi, dashboard, utilitas).
  * `@fortawesome/free-brands-svg-icons` (Brand teknologi: React, Node, GitHub, LinkedIn, Python, Docker, dsb).

### 5.2. Pemetaan Ikon Standar Antarmuka
| Elemen / Aksi | Nama Ikon Font Awesome | Representasi Visual |
| :--- | :--- | :--- |
| **Navigasi Beranda** | `faHouse` (`fa-solid fa-house`) | Beranda / Hero |
| **Navigasi Profil** | `faUser` (`fa-solid fa-user`) | Profil / About |
| **Navigasi Pendidikan**| `faGraduationCap` (`fa-solid fa-graduation-cap`) | Riwayat Pendidikan |
| **Navigasi Keterampilan**| `faCode` (`fa-solid fa-code`) | Keahlian Teknis |
| **Navigasi Proyek** | `faLaptopCode` (`fa-solid fa-laptop-code`) | Portofolio Karya |
| **Navigasi Pengalaman** | `faBriefcase` (`fa-solid fa-briefcase`) | Riwayat Karier |
| **Navigasi Sertifikat** | `faCertificate` (`fa-solid fa-certificate`) | Lisensi & Kredensial |
| **Navigasi Kontak** | `faEnvelope` (`fa-solid fa-envelope`) | Pesan / Kotak Masuk |
| **Tombol Tambah** | `faPlus` (`fa-solid fa-plus`) | Aksi Create Data |
| **Tombol Edit** | `faPenToSquare` (`fa-solid fa-pen-to-square`) | Aksi Edit Data |
| **Tombol Hapus** | `faTrashCan` (`fa-solid fa-trash-can`) | Aksi Delete Data |
| **Indikator Sukses** | `faCircleCheck` (`fa-solid fa-circle-check`) | Status Berhasil / Terbit |
| **Tautan Eksternal** | `faArrowUpRightFromSquare` (`fa-solid fa-arrow-up-right-from-square`) | Live Demo Link |
| **GitHub Brand** | `faGithub` (`fa-brands fa-github`) | Repositori Kode |
| **LinkedIn Brand** | `faLinkedin` (`fa-brands fa-linkedin`) | Jejaring Profesional |

---

## 6. Spesifikasi Komponen Inti (Core Components)

### 6.1. Tombol (`VBtn` Equivalent)
* **Karakteristik:** Ketinggian presisi `h-9` (36px) untuk ukuran default, `h-8` (32px) untuk ukuran compact/tabel, dan `h-11` (44px) untuk CTA Hero utama.
* **Variant:**
  * `primary`: Background solid primary, teks putih, border halus, bayangan elevasi.
  * `tonal` (Vuetify tonal style): Background `rgba(59, 130, 246, 0.12)`, teks primary, tanpa border tebal.
  * `outlined`: Background transparan, border `border-subtle`, teks primer/sekunder.
  * `danger`: Background merah solid/tonal untuk aksi destruktif.
* **State Behavior:**
  * Hover: Sedikit peningkatan keterangan warna (+5% brightness) dan kenaikan bayangan.
  * Active: Micro-click scale `active:scale-[0.98]`.
  * Disabled: Opasitas 50%, kursor `not-allowed`.
  * Loading: Ikon spinner berputar (`faSpinner fa-spin`) menggantikan ikon aksi.

### 6.2. Kartu (`VCard` Equivalent)
* Struktur modul: `VCardHeader`, `VCardTitle`, `VCardSubtitle`, `VCardContent`, `VCardActions`.
* Latar belakang `bg-surface`, border 1px `border-subtle`, radius `rounded-xl`, dan transisi elevasi halus saat di-hover (`hover:border-primary/50 hover:shadow-lg transition-all duration-200`).

### 6.3. Tabel Data (`VDataTable` Equivalent)
* Digunakan pada seluruh modul Admin Panel.
* Fitur wajib: Header kolom dengan sorting, striping baris yang halus, status badge warna-warni, sel aksi ringkas (Edit/Hapus), state kosong (*empty state*) dengan ilustrasi/ikon ramah, dan skeleton saat memuat data.

### 6.4. Dialog & Modal Konfirmasi (`VDialog` Equivalent)
* Overlay gelap dengan efek kabur `backdrop-blur-sm`.
* Modal berada di tengah layar, memiliki tombol tutup silang (`faXmark`), judul tegas, deskripsi aksi, dan tombol konfirmasi yang jelas (contoh: merah tegas "Ya, Hapus Data" untuk aksi destruktif).

### 6.5. Notifikasi Toast (`VSnackbar` Equivalent)
* Notifikasi mengambang di pojok kanan bawah atau atas tengah.
* Warna disesuaikan dengan konteks (Hijau sukses, Merah gagal, Biru informasi).
* Dilengkapi tombol dismiss dan auto-close setelah 4 detik.

---

## 7. Prinsip Aksesibilitas & Responsivitas (A11y)
* **Keyboard Focus Ring:** Semua elemen interaktif memiliki outline fokus yang kontras (`focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none`).
* **Semantic Landmark Elements:** Menggunakan tag HTML5 murni (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`).
* **Motion Sensitivity:** Mengimplementasikan kelas Tailwind `motion-reduce:transition-none` dan `motion-reduce:animate-none` agar menghormati pengaturan OS pengguna yang sensitif terhadap animasi.
