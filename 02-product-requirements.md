# 02 - Product Requirements Document (PRD)

## 1. Pendahuluan
Dokumen Kebutuhan Produk (*Product Requirements Document* / PRD) ini menetapkan spesifikasi fungsional dan nonfungsional untuk Website Portofolio Personal dan Admin CMS milik **Muhammad Fauzan Al Hafizh**. Dokumen ini menjadi acuan mutlak bagi implementasi arsitektur, basis data, antarmuka, dan pengujian sistem.

---

## 2. Kebutuhan Fungsional (Functional Requirements)

### 2.1. Modul Publik (Public Portal)
* **FR-PUB-01 (Hero Section):**
  * Menampilkan nama lengkap: **Muhammad Fauzan Al Hafizh**.
  * Menampilkan headline profesional dinamis (dapat diubah via admin).
  * Menampilkan ringkasan bio singkat, tombol CTA "Lihat Proyek" (*scroll* ke `#projects`) dan "Hubungi Saya" (*scroll* ke `#contact`).
  * Menampilkan status ketersediaan kerja (*badge* seperti "Tersedia untuk Pekerjaan / Freelance").
  * Menyediakan tautan cepat ke profil media sosial/profesional (GitHub, LinkedIn, WhatsApp, Email).
* **FR-PUB-02 (About Section):**
  * Menampilkan narasi profil personal lengkap, latar belakang, dan etos rekayasa perangkat lunak.
  * Menampilkan tombol unduh/lihat Resume/CV jika URL resume tersedia.
  * Menampilkan statistik ringkas (contoh: tahun pengalaman, total proyek terselesaikan) yang dihitung atau dikonfigurasi dinamis.
* **FR-PUB-03 (Education Section):**
  * Menampilkan riwayat institusi pendidikan dalam bentuk kartu atau linimasa (*timeline*).
  * Menampilkan nama institusi, gelar, bidang studi, tahun mulai - tahun selesai (atau "Sekarang").
  * Menampilkan deskripsi pencapaian/kegiatan relevan (opsional).
  * Hanya menampilkan data yang berstatus `is_published = true`, terurut berdasarkan `order_index` atau tanggal terbaru.
* **FR-PUB-04 (Skills Section):**
  * Menampilkan daftar keterampilan teknis dan non-teknis yang dikelompokkan berdasarkan kategori (contoh: Frontend, Backend, Database, Cloud & DevOps, Tools).
  * Menampilkan ikon Font Awesome yang sesuai untuk setiap keterampilan.
  * Menampilkan tingkat kemahiran (*proficiency level*, e.g. persentase atau badge level: Beginner/Intermediate/Advanced) jika data diaktifkan.
* **FR-PUB-05 (Projects Section):**
  * Menampilkan etalase proyek dalam tata letak kartu grid responsif.
  * Setiap kartu memuat: gambar thumbnail, judul proyek, deskripsi ringkas, daftar tag teknologi (badges), tombol demo langsung (*live demo*), dan tautan repositori kode (*source code*).
  * Mendukung penanda *Featured Project* (ditampilkan pada posisi teratas atau dengan penekanan visual khusus).
  * Mendukung filter kategori teknologi atau status publikasi.
* **FR-PUB-06 (Experience Section):**
  * Menampilkan riwayat kerja, magang, atau organisasi dalam format linimasa terstruktur (*vertical timeline*).
  * Memuat nama perusahaan/organisasi, posisi/peran, tipe pekerjaan (Full-time, Contract, Internship), periode tanggal, lokasi, dan poin-poin tanggung jawab/prestasi.
* **FR-PUB-07 (Certificates Section):**
  * Menampilkan sertifikat kompetensi/kursus profesional.
  * Memuat judul sertifikat, organisasi penerbit, tanggal terbit, tanggal kadaluarsa (jika ada), ID kredensial, dan tombol verifikasi langsung ke situs penerbit.
* **FR-PUB-08 (Contact Section):**
  * Menyediakan formulir kontak publik yang memuat input: Nama Pengirim, Alamat Email, Subjek, dan Isi Pesan.
  * Mengintegrasikan perlindungan honeypot dan batasan laju (*rate limiting*) berbasis IP untuk mencegah *spam bot*.
  * Menyimpan pesan yang valid secara langsung ke tabel `contact_messages` di Neon PostgreSQL.
  * Memberikan *feedback* langsung berupa notifikasi sukses (*Vuetify-style snackbar*) atau pesan galat yang jelas.

---

### 2.2. Modul Autentikasi & Keamanan (Authentication & Access Control)
* **FR-AUTH-01 (Admin Authentication):**
  * Halaman login khusus pada rute `/login`.
  * Form input kredensial (Username/Email dan Password).
  * Validasi kredensial di sisi server menggunakan *salted password hash* (bcryptjs).
  * Penyimpanan sesi terautentikasi melalui *HTTP-Only secure cookie* dengan enkripsi token (iron-session / JWT).
* **FR-AUTH-02 (Dev Login Bypass):**
  * Menyediakan tombol "Dev Login" / "Quick Admin Login" pada halaman `/login`.
  * **Kondisi Ketat:** Tombol ini hanya di-render dan hanya dapat diproses apabila `process.env.NODE_ENV === 'development'`.
  * Apabila dieksekusi, sistem secara otomatis menerbitkan sesi autentikasi admin development yang sah dan mengarahkan pengguna ke `/admin/dashboard`.
  * Pada mode produksi (`NODE_ENV === 'production'`), rute dan Server Action bypass ini wajib menolak eksekusi dengan status `403 Forbidden` dan elemen tombol tidak boleh ada dalam bundle HTML client.
* **FR-AUTH-03 (Route Protection Middleware):**
  * Seluruh permintaan ke rute `/admin/*` wajib dicek melalui Next.js Middleware.
  * Permintaan tanpa sesi valid langsung dialihkan (*redirect*) ke `/login` dengan parameter pesan galat atau *returnUrl*.
  * Permintaan logout menghancurkan sesi cookie dan mengalihkan pengguna kembali ke `/login`.

---

### 2.3. Modul Admin Panel (Content Management System)
* **FR-ADM-01 (Dashboard Overview):**
  * Menampilkan ringkasan metrik statistik: Total Proyek (Aktif vs Draft), Total Keterampilan, Total Pengalaman, Total Sertifikat, dan Total Pesan Masuk (dengan indikator pesan belum dibaca).
  * Menampilkan daftar 5 pesan kontak terbaru dengan akses cepat untuk membaca atau membalas via email klien.
  * Menyediakan tombol aksi cepat (*Quick Actions*): Tambah Proyek Baru, Tambah Sertifikat, dsb.
* **FR-ADM-02 (Manajemen Profil & About):**
  * Formulir pembaruan data diri: Nama Lengkap, Headline, Bio, Lokasi, Email Kontak Publik, Nomor WhatsApp, Tautan GitHub, Tautan LinkedIn, URL Avatar, dan URL Dokumen Resume/CV.
* **FR-ADM-03 (Manajemen Pendidikan - CRUD):**
  * Menampilkan tabel riwayat pendidikan.
  * Menambah dan mengedit entitas pendidikan (Nama Institusi, Gelar, Jurusan, Tanggal Mulai, Tanggal Selesai, Status Sedang Berjalan, Deskripsi, Urutan, dan Sakelar Publikasi).
  * Menghapus entitas pendidikan dengan modal dialog konfirmasi (*destructive confirmation dialog*).
* **FR-ADM-04 (Manajemen Keterampilan - CRUD):**
  * Menampilkan daftar keterampilan dengan opsi filter kategori.
  * Menambah/mengedit keterampilan: Nama, Kategori, Nama Kelas Ikon Font Awesome (contoh: `fa-brands fa-react`), Tingkat Kemahiran (1-100), Urutan, dan Sakelar Publikasi.
  * Menghapus keterampilan dengan dialog konfirmasi.
* **FR-ADM-05 (Manajemen Proyek - CRUD):**
  * Menampilkan daftar proyek dalam bentuk kartu/tabel.
  * Menambah/mengedit proyek: Judul, Slug, Deskripsi Singkat, Deskripsi Detail (Markdown), URL Thumbnail, Tag Teknologi (array teks), URL Demo, URL Repositori, Status *Featured*, Urutan, dan Sakelar Publikasi.
  * Menghapus proyek dengan dialog konfirmasi.
* **FR-ADM-06 (Manajemen Pengalaman - CRUD):**
  * Menampilkan tabel riwayat pengalaman kerja/organisasi.
  * Menambah/mengedit pengalaman: Nama Instansi/Perusahaan, Posisi, Tipe Pekerjaan, Lokasi, Tanggal Mulai, Tanggal Selesai, Status Masih Aktif Bekerja, Deskripsi Pekerjaan, Urutan, dan Sakelar Publikasi.
  * Menghapus pengalaman dengan dialog konfirmasi.
* **FR-ADM-07 (Manajemen Sertifikat - CRUD):**
  * Menampilkan tabel sertifikasi.
  * Menambah/mengedit sertifikat: Judul Sertifikat, Organisasi Penerbit, Tanggal Terbit, Tanggal Kadaluarsa, ID Kredensial, URL Verifikasi, URL Gambar/Badge, Urutan, dan Sakelar Publikasi.
  * Menghapus sertifikat dengan dialog konfirmasi.
* **FR-ADM-08 (Manajemen Pesan Kontak - Inbox):**
  * Menampilkan tabel seluruh pesan kontak masuk dari publik.
  * Indikator status baca (*Read / Unread*).
  * Modal penampil detail pesan lengkap beserta waktu pengiriman (*timestamp*).
  * Kemampuan menandai pesan sebagai terbaca/belum terbaca.
  * Kemampuan menghapus pesan spam dengan konfirmasi.

---

## 3. Kebutuhan Nonfungsional (Non-Functional Requirements)

### 3.1. Performa (Performance)
* **NFR-PERF-01:** Skor Google Lighthouse / PageSpeed minimal 90 untuk Performa, Aksesibilitas, Best Practices, dan SEO.
* **NFR-PERF-02:** First Contentful Paint (FCP) < 1.2 detik dan Largest Contentful Paint (LCP) < 2.0 detik pada koneksi 4G standar.
* **NFR-PERF-03:** Data publik memanfaatkan React Server Components (RSC) dengan *On-Demand Incremental Static Regeneration* / `revalidatePath` saat terjadi mutasi data di admin panel.

### 3.2. Keamanan (Security)
* **NFR-SEC-01:** Kredensial database Neon (`DATABASE_URL`) dan kunci rahasia (`SESSION_SECRET`) wajib disimpan dalam *environment variables* server-side dan tidak pernah terekspos ke bundle JavaScript browser.
* **NFR-SEC-02:** Password admin di-hash menggunakan algoritma kriptografi yang kuat (bcrypt dengan salt minimal 10 putaran).
* **NFR-SEC-03:** Perlindungan terhadap Cross-Site Scripting (XSS) melalui sanitasi output Next.js dan validasi tipe data Zod pada seluruh input.
* **NFR-SEC-04:** Perlindungan terhadap SQL Injection secara native menggunakan parameterized queries dari Drizzle ORM.
* **NFR-SEC-05:** Perlindungan terhadap CSRF pada seluruh Server Actions melalui verifikasi *origin header* bawaan Next.js.

### 3.3. Aksesibilitas & Kompatibilitas (Accessibility & Compatibility)
* **NFR-ACC-01:** Mematuhi standar WCAG 2.1 Level AA (kontras rasio teks minimal 4.5:1 untuk teks normal).
* **NFR-ACC-02:** Seluruh tombol, formulir, dan link dapat diakses serta dioperasikan secara penuh menggunakan papan ketik (*full keyboard navigation*).
* **NFR-ACC-03:** Seluruh elemen non-teks (gambar proyek, avatar) wajib memiliki atribut `alt` deskriptif.
* **NFR-ACC-04:** Mendukung preferensi gerak sistem operasi pengguna (`prefers-reduced-motion: reduce`).

### 3.4. Keandalan & Skalabilitas (Reliability & Scalability)
* **NFR-REL-01:** Sistem basis data memanfaatkan Neon PostgreSQL Serverless yang memiliki kapabilitas auto-scaling dan ketersediaan tinggi (*high availability*).
* **NFR-REL-02:** Penanganan galat terisolasi menggunakan React Error Boundaries (`error.tsx`) dan Fallback Skeletons (`loading.tsx`) sehingga kegagalan satu komponen tidak menyebabkan aplikasi *crash* secara total.

---

## 4. User Stories & Kriteria Penerimaan (Acceptance Criteria)

### Story 1: Menjelajah Portofolio (Pengunjung / Rekruter)
* **Sebagai:** Rekruter Teknis atau Klien Potensial.
* **Saya ingin:** Menjelajah proyek, keahlian, dan riwayat pengalaman Muhammad Fauzan Al Hafizh secara terstruktur dan cepat.
* **Sehingga:** Saya dapat segera menilai kesesuaian kualifikasinya dengan posisi atau proyek yang sedang saya buka.
* **Kriteria Penerimaan:**
  1. Halaman publik memuat seluruh data yang berstatus aktif tanpa *delay* yang mengganggu.
  2. Kartu proyek memiliki tautan hidup ke demo langsung dan repositori GitHub.
  3. Desain tampil konsisten dan elegan di layar ponsel maupun monitor desktop.

### Story 2: Mengirim Pesan Kontak (Pengunjung)
* **Sebagai:** Pengunjung website.
* **Saya ingin:** Mengirimkan pesan melalui formulir kontak langsung di website.
* **Sehingga:** Saya dapat memulai komunikasi tanpa harus membuka aplikasi email eksternal secara manual.
* **Kriteria Penerimaan:**
  1. Validasi formulir mendeteksi email tidak valid atau pesan kosong sebelum pengiriman.
  2. Setelah tombol kirim ditekan, muncul indikator loading dan snackbar pesan berhasil.
  3. Data tersimpan secara instan di tabel `contact_messages` basis data Neon.

### Story 3: Manajemen Konten Tanpa Koding (Admin)
* **Sebagai:** Muhammad Fauzan Al Hafizh (Admin).
* **Saya ingin:** Menambah proyek baru atau mengubah ringkasan profil melalui Admin Panel.
* **Sehingga:** Portofolio saya selalu terbarui dengan karya-karya terbaru tanpa perlu mengubah kode sumber dan melakukan deploy ulang.
* **Kriteria Penerimaan:**
  1. Admin dapat login menggunakan akun kredensial atau tombol *Dev Login* (di lingkungan development).
  2. Formulir tambah/edit proyek berhasil menyimpan data ke Neon PostgreSQL.
  3. Halaman publik langsung menampilkan proyek baru tersebut secara otomatis (*cache revalidation*).

---

## 5. Matriks Prioritas Fitur (MoSCoW Matrix)

| Kategori Prioritas | Fitur / Kebutuhan | Alasan Rasional |
| :--- | :--- | :--- |
| **Must Have (Wajib)** | - Public Portfolio: Hero, About, Education, Skills, Projects, Experience, Certificates, Contact.<br>- Database Neon PostgreSQL + Drizzle ORM.<br>- Admin Auth (Login, Session, Protected Middleware, Dev Login bypass lokal).<br>- Admin CRUD untuk seluruh 7 entitas konten.<br>- Inbox pesan masuk kontak.<br>- Responsive Vuetify-style UI & Font Awesome icons. | Fondasi fungsional inti yang disyaratkan agar portofolio berfungsi sebagai full-stack application mandiri. |
| **Should Have (Sangat Dianjurkan)** | - Tombol filter kategori pada bagian Skills & Projects.<br>- Toggle tema Dark/Light mode yang tersimpan di localStorage.<br>- Indikator live status "Open to Work".<br>- Honeypot anti-spam pada form kontak. | Meningkatkan kualitas interaksi dan kenyamanan pengguna secara signifikan. |
| **Could Have (Pelengkap)** | - Integrasi pengiriman notifikasi email otomatis via Resend/Nodemailer (opsional jika API key tersedia di masa depan).<br>- Ekspor data pesan masuk ke format CSV. | Fitur tambahan yang mempermudah administrasi jika kebutuhan meningkat. |
| **Won't Have (v1)** | - Sistem multi-user dengan role permission bertingkat.<br>- Sistem pembayaran / checkout online.<br>- Live chat websocket realtime. | Berada di luar cakupan kebutuhan portofolio personal. |
