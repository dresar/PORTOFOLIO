# 10 - Testing Strategy, Acceptance Criteria & Definition of Done

## 1. Ikhtisar Strategi Pengujian
Untuk memastikan Website Portofolio Personal dan Admin CMS milik **Muhammad Fauzan Al Hafizh** beroperasi dengan stabilitas kelas industri, strategi pengujian disusun secara komprehensif mencakup aspek fungsional, keamanan, integrasi basis data, aksesibilitas, performa, dan pengalaman pengguna (*UI/UX*).

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PIRAMIDA PENGUJIAN SISTEM                       │
└────────────────────────────────────────────────────────────────────────┘

                         ▲
                        / \
                       /   \   End-to-End User Flow Testing
                      / E2E \  (Alur Publik, Kontak, Admin Login & CRUD)
                     /───────\
                    /         \   Integration Testing
                   / Integrasi \  (Server Actions, Drizzle ORM, Neon Pooler)
                  /─────────────\
                 /               \   Unit & Schema Validation Testing
                /   Unit / Skema  \  (Zod Schemas, Password Hashing, Sessions)
               /───────────────────\
              /                     \ Non-Functional & Security Testing
             /  A11y, Sec, Perf, SEO \ (Lighthouse 90+, OWASP, Middleware, DevLogin)
            └─────────────────────────┘
```

---

## 2. Rencana Pengujian Fungsional & Integrasi

### 2.1. Pengujian Validasi Skema Zod
* **Target:** Seluruh skema di `src/schemas/` (`auth`, `profile`, `project`, `skill`, `education`, `experience`, `certificate`, `contact`).
* **Skenario Uji:**
  * Validasi field wajib (*required fields*): Menolak payload jika field wajib dikosongkan.
  * Validasi batas panjang karakter (*min/max length*).
  * Validasi format email pada form kontak publik dan kredensial admin.
  * Validasi format URL pada tautan GitHub, LinkedIn, Demo, Repositori, dan Verifikasi Kredensial.
  * Validasi honeypot field: Memastikan jika field `websiteUrlHoneypot` terisi nilai, permintaan ditandai sebagai spam dan tidak diproses.

### 2.2. Pengujian Basis Data Neon PostgreSQL & Drizzle ORM
* **Target:** Operasi kueri dan transaksi data.
* **Skenario Uji:**
  * Verifikasi koneksi pooler Neon: Tidak terjadi *timeout* atau pemutusan koneksi saat eksekusi kueri beruntun.
  * Operasi Create: Data tersimpan lengkap dengan UUID unik dan timestamp `created_at`.
  * Operasi Read: Kueri publik hanya mengambil baris dengan kriteria `is_published = true` dan terurut sesuai `order_index`.
  * Operasi Update: Memperbarui kolom spesifik tanpa merusak kolom lainnya serta membarui timestamp `updated_at`.
  * Operasi Delete: Menghapus baris secara permanen dari basis data.

### 2.3. Pengujian Autentikasi & Rute Terproteksi
* **Target:** Halaman `/login`, Middleware Next.js, dan Server Action autentikasi.
* **Skenario Uji:**
  1. *Login Gagal:* Memasukkan password salah menghasilkan notifikasi galat yang ramah tanpa memberi tahu apakah username atau password yang salah (mencegah *username enumeration*).
  2. *Login Berhasil:* Memasukkan kredensial yang tepat menerbitkan HTTP-Only Cookie dan mengalihkan pengguna ke `/admin/dashboard`.
  3. *Dev Login Bypass (Mode Development):* Tombol Dev Login tampil dan dapat diklik saat `NODE_ENV === 'development'`, langsung memberikan sesi admin yang sah.
  4. *Dev Login Blockade (Mode Produksi):* Memastikan tombol Dev Login tidak di-render di antarmuka dan jika Server Action `devLoginAction` dipanggil secara paksa pada mode produksi, server mengembalikan status `403 Forbidden`.
  5. *Middleware Guarding:* Mengakses URL langsung seperti `/admin/projects` tanpa cookie sesi langsung dialihkan (*redirect 307/302*) ke `/login`.
  6. *Logout:* Menghancurkan cookie sesi dan mencegah tombol 'Back' browser memunculkan data rahasia dari cache.

---

## 3. Matriks Pengujian UI/UX, Aksesibilitas & Responsivitas

### 3.1. Pengujian Lintas Perangkat & Resolusi Layar
| Perangkat / Resolusi | Viewport Target | Checklist Evaluasi |
| :--- | :--- | :--- |
| **Mobile Phone** | `360px - 480px` | - Hamburger menu drawer berfungsi mulus tanpa lag.<br>- Kartu proyek tersusun 1 kolom rapi.<br>- Tidak ada *horizontal scrolling* atau elemen yang terpotong.<br>- Tombol memiliki area sentuh minimal 44x44px. |
| **Tablet** | `768px - 1024px` | - Grid proyek tersusun 2 kolom.<br>- Sidebar admin dapat dibuka/tutup dengan nyaman.<br>- Modal dialog berukuran proporsional di tengah layar. |
| **Desktop / Laptop** | `1280px - 1920px` | - Grid proyek tersusun 3 kolom.<br>- Sidebar admin dalam kondisi fixed/expanded.<br>- Navbar desktop transparan-blur menampilkan menu lengkap. |

### 3.2. Aksesibilitas (WCAG 2.1 Level AA)
- [ ] **Rasio Kontras Warna:** Semua teks pada mode Gelap maupun Terang memiliki kontras rasio minimal 4.5:1 terhadap latar belakang.
- [ ] **Navigasi Papan Ketik (Keyboard Only):** Pengguna dapat menekan tombol `Tab` untuk berpindah antarlink/tombol secara berurutan dengan indikator cincin fokus (*focus ring*) yang terlihat jelas.
- [ ] **Screen Reader Attributes:** Semua ikon Font Awesome dekoratif memiliki atribut `aria-hidden="true"`, sedangkan tombol aksi berikon memiliki `aria-label` yang deskriptif.
- [ ] **Atribut Alt Gambar:** Semua thumbnail proyek dan foto profil memiliki teks alternatif (*alt text*).

---

## 4. Pengujian Keamanan (Security Audit Checklist)
- [ ] **Kerahasiaan Kredensial:** Variabel lingkungan `DATABASE_URL` dan rahasia sesi tidak pernah bocor ke sisi klien (*client-side bundle*).
- [ ] **Penolakan SQL Injection:** Upaya memasukkan karakter kutip (`' OR '1'='1`) pada formulir input dinetralkan oleh Drizzle ORM parameterized queries.
- [ ] **Penolakan Stored XSS:** Upaya memasukkan tag `<script>` pada deskripsi proyek atau formulir kontak di-*escape* secara otomatis oleh engine React Next.js.
- [ ] **Sanitasi Pesan Galat:** Kegagalan koneksi basis data tidak mengekspos detail kredensial atau struktur internal tabel ke browser pengguna.

---

## 5. Pengujian Performa & SEO (Search Engine Optimization)
- [ ] **Audit Google Lighthouse:**
  - Skor Performa: **≥ 90**
  - Skor Aksesibilitas: **≥ 90**
  - Skor Praktik Terbaik (*Best Practices*): **≥ 95**
  - Skor SEO: **100**
- [ ] **Core Web Vitals:**
  - First Contentful Paint (FCP) < 1.2s.
  - Largest Contentful Paint (LCP) < 2.0s.
  - Cumulative Layout Shift (CLS) = 0.00 (Zero layout jump).
- [ ] **Kelengkapan Metadata SEO:**
  - Tag `<title>` memuat nama "Muhammad Fauzan Al Hafizh - Full-Stack Engineer Portfolio".
  - Meta description deskriptif dan padat.
  - Tag OpenGraph (`og:title`, `og:description`, `og:image`, `og:type`) lengkap untuk pratinjau media sosial.
  - File `sitemap.xml` dan `robots.txt` tersedia dan valid.

---

## 6. Kriteria Penerimaan Akhir (Acceptance Criteria Checklist)
Proyek dinyatakan memenuhi kualifikasi dan siap diluncurkan apabila memenuhi seluruh daftar periksa berikut:

### Bagian Publik
- [ ] Hero section menampilkan nama **Muhammad Fauzan Al Hafizh**, headline, ringkasan diri, dan tombol CTA yang berfungsi mulus.
- [ ] About section menampilkan biografi, statistik ringkas, dan tombol unduh resume.
- [ ] Education section menampilkan riwayat pendidikan terstruktur yang ditarik dari database Neon.
- [ ] Skills section menampilkan daftar keahlian per kategori berikon Font Awesome murni tanpa emoji antarmuka.
- [ ] Projects section menampilkan galeri proyek dengan thumbnail, tag teknologi, link demo, dan link repositori GitHub.
- [ ] Experience section menampilkan riwayat pengalaman kerja dalam format linimasa terstruktur.
- [ ] Certificates section menampilkan sertifikat kompetensi dengan tautan verifikasi kredensial.
- [ ] Contact section menyediakan form pesan dengan validasi Zod dan proteksi spam; data tersimpan ke database Neon.
- [ ] Tema Dark Mode dan Light Mode dapat berganti mulus tanpa berkedip (*no flash of unstyled content*).

### Bagian Admin CMS
- [ ] Halaman login `/login` melindungi dashboard admin dari akses publik yang tidak terotorisasi.
- [ ] Tombol Dev Login hanya aktif dan hanya dapat digunakan di mode development; nonaktif total di production.
- [ ] Dashboard menampilkan ringkasan metrik statistik real-time dan pesan masuk terbaru.
- [ ] Modul CRUD Profile, Education, Skills, Projects, Experience, dan Certificates berfungsi 100% (Create, Read, Update, Delete).
- [ ] Modul Pesan Masuk memungkinkan admin melihat isi pesan lengkap, status baca, dan menghapus pesan spam.
- [ ] Setiap perubahan data di Admin Panel langsung tercermin secara instan di halaman publik (*cache revalidation*).

---

## 7. Definisi Selesai (Definition of Done / DoD)
Pekerjaan rekayasa dinyatakan **SELESAI (DONE)** apabila:
1. Seluruh 10 berkas dokumen perencanaan proyek telah dibuat secara lengkap, rapi, dan saling selaras tanpa kontradiksi.
2. Tidak ada data riwayat hidup fiktif yang dikarang (menggunakan placeholder transparan berlabel jelas `[DATA CONTOH]` atau `[ISI ...]`).
3. Seluruh dependensi (Next.js App Router, TypeScript, Tailwind, Font Awesome, Drizzle ORM, Neon DB driver, Zod) terpasang dan terkonfigurasi dengan benar.
4. Skema database berhasil dimigrasikan ke Neon PostgreSQL Cloud.
5. Pembangunan kode aplikasi lulus pemeriksaan linting (`npm run lint`), kompilasi TypeScript (`tsc --noEmit`), dan build produksi (`npm run build`).
6. Dokumentasi panduan instalasi dan pengoperasian lokal tersedia secara jelas di berkas proyek.
