# 07 - Admin Panel Architecture & Authentication System

## 1. Ikhtisar Sistem Autentikasi Admin
Admin Panel dirancang untuk memberikan kendali mutlak kepada **Muhammad Fauzan Al Hafizh** dalam mengelola konten portofolio tanpa campur tangan kode. Keamanan menjadi prioritas utama: seluruh rute administrasi (`/admin/*`) berada di balik barikade otorisasi berlapis yang memverifikasi keabsahan sesi secara *server-side* sebelum merender antarmuka apapun.

---

## 2. Alur Autentikasi & Rute `/login`

```
                                  RUTE /login
                                       │
                ┌──────────────────────┴──────────────────────┐
                ▼                                             ▼
        [Form Login Reguler]                        [Tombol Dev Login]
    (Email/Username & Password)               (Hanya aktif jika NODE_ENV===dev)
                │                                             │
                ▼                                             ▼
   Server Action: loginAction()                 Server Action: devLoginAction()
                │                                             │
      Validasi Skema Zod                               Cek Ketat: NODE_ENV
                │                                  (Tolak jika 'production')
                ▼                                             │
Cek Akun & Hash Bcrypt di Neon DB                             ▼
                │                                Terbitkan Sesi Dev Admin Sah
                └──────────────────────┬──────────────────────┘
                                       │
                                       ▼
                       Set HTTP-Only Encrypted Cookie
                                       │
                                       ▼
                         Redirect ke /admin/dashboard
```

### 2.1. Login Reguler
* Menggunakan formulir presisi dengan validasi Zod sisi klien dan sisi server.
* Password diverifikasi terhadap hash bcrypt yang tersimpan di tabel `admin_users`.
* Mengimplementasikan proteksi *rate-limiting* dasar untuk mencegah serangan brute force pada upaya login berulang yang gagal.

### 2.2. Tombol Dev Login (Eksklusif Development Mode)
Sesuai instruksi khusus pengguna, disediakan tombol **"Dev Login"** untuk mempercepat proses pengetesan lokal tanpa perlu memasukkan kredensial manual berulang kali:
1. **Pengecekan Komponen Antarmuka:**
   Komponen tombol Dev Login dibungkus dalam kondisi lingkungan:
   ```tsx
   {process.env.NODE_ENV === 'development' && (
     <DevLoginButton />
   )}
   ```
2. **Penegakan Keamanan di Server Action:**
   Eksekusi Server Action `devLoginAction` tidak sekadar mempercayai klien, melainkan memeriksa langsung runtime server:
   ```ts
   export async function devLoginAction() {
     if (process.env.NODE_ENV !== 'development') {
       return { success: false, error: 'Akses terlarang. Dev Login hanya tersedia di mode development.' };
     }
     // Buat sesi admin sah untuk pengguna lokal
     await createAdminSession({ userId: 'dev-admin-id', username: 'hafizh' });
     redirect('/admin/dashboard');
   }
   ```
3. **Jaminan Produksi:**
   Pada saat aplikasi di-build untuk production (`NODE_ENV === 'production'`), Next.js compiler melakukan *dead-code elimination* sehingga tombol ini tidak akan terkirim ke browser publik sama sekali.

---

## 3. Desain Shell Template Admin (Vuetify-Style Admin Template)

### 3.1. Struktur Template Dashboard
Mengadopsi pola template admin modern profesional yang setara dengan dashboard berbasis Vuetify/Material UI:

```
┌────────────────────────────────────────────────────────────────────────┐
│ [TOPBAR]  [≡ Toggle]  Dashboard > Proyek              [Status DB: Aktif]  [Logout ↪] │
├───────────────┬────────────────────────────────────────────────────────┤
│ [SIDEBAR]     │ [PAGE HEADER]  Manajemen Proyek Portofolio             │
│               │               [+ Tambah Proyek Baru]                   │
│ • Dashboard   ├────────────────────────────────────────────────────────┤
│ • Profil      │ [SEARCH & FILTER BAR]                                  │
│ • Pendidikan  │ [Cari proyek...] [Filter Kategori ▾]                   │
│ • Keterampilan├────────────────────────────────────────────────────────┤
│ • Proyek      │ [DATA TABLE CONTAINER]                                 │
│ • Pengalaman  │ ┌────────────────────────────────────────────────────┐ │
│ • Sertifikat  │ │ Thumbnail │ Judul      │ Teknologi │ Status │ Aksi │ │
│ • Pesan (3)   │ ├───────────┼────────────┼───────────┼────────┼──────┤ │
│               │ │ [Img]     │ Aksara App │ React, PS │ [Aktif]│ ✎ 🗑 │ │
│ [Collapse <]  │ └────────────────────────────────────────────────────┘ │
└───────────────┴────────────────────────────────────────────────────────┘
```

### 3.2. Komponen Struktural Admin
1. **Admin Sidebar (Navigation Drawer):**
   * Menampilkan avatar ringkas dan nama Muhammad Fauzan Al Hafizh.
   * Menu terstruktur dengan ikon Font Awesome solid:
     * Dashboard (`faHouse` / `faGaugeHigh`)
     * Profil & About (`faUserGear`)
     * Pendidikan (`faGraduationCap`)
     * Keterampilan (`faCode`)
     * Proyek (`faLaptopCode`)
     * Pengalaman (`faBriefcase`)
     * Sertifikat (`faCertificate`)
     * Kotak Masuk Pesan (`faInbox` / `faEnvelope`) dilengkapi lencana hitung pesan unread.
   * Kemampuan di-minimize menjadi mini-drawer dengan animasi lebar CSS yang mulus.
2. **Admin Topbar:**
   * Tombol pemicu Drawer (hamburger).
   * Breadcrumbs navigasi hierarkis.
   * Indikator status koneksi pooler Neon PostgreSQL (berwarna hijau ketika aktif).
   * Tombol pintas "Kunjungi Web Publik" yang membuka tab baru.
   * Tombol Logout dengan konfirmasi.

---

## 4. Rincian Modul CRUD Admin Panel

### 4.1. Modul Dashboard (`/admin/dashboard`)
* **Metrik Cards (Statistik Cepat):**
  * Kartu Total Proyek (menampilkan perbandingan proyek terbit vs draft).
  * Kartu Total Keterampilan (dikelompokkan per kategori).
  * Kartu Total Pengalaman Kerja & Sertifikasi.
  * Kartu Pesan Kontak Masuk (menyorot jumlah pesan belum dibaca).
* **Widget Pesan Terbaru:**
  * Menampilkan 5 pesan terakhir yang masuk.
  * Opsi cepat untuk membaca pesan langsung dari modal dashboard.

### 4.2. Modul Profil (`/admin/profile`)
* Formulir pembaruan identitas lengkap:
  * Nama Lengkap, Headline, Bio Panjang.
  * Tautan: URL Resume PDF, Profil GitHub, LinkedIn, WhatsApp, Email Publik.
  * Status sakelar "Tersedia untuk Kerja / Open to Work".
  * Notifikasi snackbar instan saat pembaruan berhasil disimpan.

### 4.3. Modul Pendidikan (`/admin/education`)
* **Tampilan:** Data Table dengan kolom Institusi, Gelar, Jurusan, Periode, Status Terbit, dan Aksi.
* **Modal Tambah/Edit:** Form dialog yang memvalidasi tanggal mulai/selesai, checkbox "Masih Berjalan", serta urutan penataan.
* **Modal Hapus:** Dialog konfirmasi destruktif untuk mencegah penghapusan tidak disengaja.

### 4.4. Modul Keterampilan (`/admin/skills`)
* **Tampilan:** Tabel yang dapat difilter berdasarkan tab kategori (Frontend, Backend, Database, Tools).
* **Fitur Input Ikon:** Pemilih ikon Font Awesome (mengetikkan kelas ikon seperti `fa-brands fa-react`, `fa-solid fa-database`) dengan pratinjau ikon langsung (*live icon preview*).
* **Slider Kemahiran:** Kontrol slider 1-100% untuk tingkat kemahiran teknis.

### 4.5. Modul Proyek (`/admin/projects`)
* **Tampilan:** Data Table & Grid Switcher.
* **Input Tag Teknologi:** Komponen badge input interaktif di mana admin dapat mengetik nama teknologi dan menekan enter untuk membuat chip/badge baru.
* **Sakelar Unggulan (`is_featured`):** Mengatur proyek untuk mendapat sorotan khusus di halaman utama.
* **Kontrol Slug:** Pembuatan slug otomatis dari judul proyek (*auto-generate slug*) yang tetap dapat diedit manual.

### 4.6. Modul Pengalaman (`/admin/experience`)
* **Tampilan:** Data Table linimasa karier.
* **Formulir:** Input Perusahaan, Jabatan, Tipe Pekerjaan, Rentang Waktu, Deskripsi Tanggung Jawab, dan urutan tampilan.

### 4.7. Modul Sertifikat (`/admin/certificates`)
* **Tampilan:** Data Table sertifikat dengan kolom Judul, Penerbit, Tanggal Terbit, ID Kredensial, dan URL Verifikasi.
* **Validasi Tautan:** Memastikan URL verifikasi yang dimasukkan memiliki format valid (`http://` atau `https://`).

### 4.8. Modul Pesan Masuk (`/admin/messages`)
* **Tampilan:** Tabel daftar pesan dengan visual baris tegas antara pesan yang *Unread* (teks tebal dengan background aksen) dan *Read*.
* **Aksi Modal Detail:** Membuka isi pesan utuh pengirim, alamat email, subjek, dan waktu penerimaan.
* **Aksi Tandai Terbaca:** Secara otomatis menandai pesan sebagai telah dibaca saat modal detail dibuka, mengurangi counter notifikasi secara real-time.
* **Aksi Hapus Pesan:** Menghapus pesan spam secara permanen dari basis data.

---

## 5. Pola Pengalaman Pengguna (UX Feedback Patterns)
* **Loading State:** Menggunakan skeleton loaders dengan proporsi tinggi yang sama dengan tabel atau kartu konten, mencegah pergeseran tata letak (*layout shift*).
* **Empty State:** Menampilkan ikon Font Awesome yang relevan (`faFolderOpen`, `faInbox`) dengan pesan informatif dan tombol CTA untuk segera menambah data pertama.
* **Error State:** Menampilkan banner peringatan ramah pengguna dengan tombol coba lagi (*Retry*), tanpa mengekspos jejak teknis database internal.
* **Confirmation Dialog:** Dialog konfirmasi wajib muncul sebelum aksi permanen dieksekusi (terutama operasi *Delete*).
* **Snackbar Feedback:** Notifikasi Vuetify-style muncul di sudut layar setiap kali operasi CRUD berhasil atau gagal, dengan durasi otomatis 4 detik.
