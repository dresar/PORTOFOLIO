# PORTOFOLIO EKA SYARIF MAULANA

Dokumentasi resmi untuk proyek Web Portofolio dinamis beserta Panel Admin (CMS).
Website ini dirancang untuk menampilkan profil profesional, pengalaman, proyek unggulan, keahlian, sertifikasi, serta artikel blog dengan antarmuka yang modern, responsif, dan interaktif.

- **Live Demo**: [https://www.inka.my.id/](https://www.inka.my.id/)
- **GitHub Repository**: [https://github.com/dresar/PORTOFOLIO](https://github.com/dresar/PORTOFOLIO)

---

## 1. Arsitektur Teknologi (Tech Stack)

Proyek ini dibangun menggunakan teknologi web modern:
- **Frontend Framework**: React.js (v18) + Vite
- **Styling**: Tailwind CSS + Framer Motion (untuk animasi)
- **UI Components**: Radix UI + Lucide React
- **State Management**: Zustand + TanStack React Query
- **Routing**: React Router DOM
- **Form & Validasi**: React Hook Form + Zod
- **Database & ORM**: PostgreSQL (Neon Database) + Drizzle ORM
- **Rich Text Editor**: Tiptap & UIW MD Editor

---

## 2. Diagram Alur Sistem (System Flowchart)

Berikut adalah alur kerja utama aplikasi dari sisi publik dan sisi admin:

```mermaid
flowchart TD
    A[Pengunjung Web] -->|Akses URL| B(Halaman Utama / Landing Page)
    B --> C{Pilih Menu}
    C -->|Tentang| D[Lihat Profil]
    C -->|Pendidikan| E[Lihat Riwayat Pendidikan]
    C -->|Keahlian| F[Lihat Daftar Keahlian]
    C -->|Proyek| G[Lihat Portofolio Proyek]
    C -->|Pengalaman| H[Lihat Pengalaman Kerja]
    C -->|Sertifikat| I[Lihat Sertifikasi]
    C -->|Blog| J[Baca Artikel]
    C -->|Kontak| K[Kirim Pesan / WhatsApp]
    
    K --> L[(Database)]
    
    M[Admin] -->|Login| N(Admin Dashboard)
    N --> O{Kelola Data Utama}
    O --> P[Manajemen Konten CRUD]
    P -->|Simpan/Hapus| L
    
    O --> Q[Manajemen Pesan Masuk]
    Q -->|Baca/Hapus| L
```

---

## 3. Diagram Entity-Relationship Database (ERD)

Struktur tabel database dalam sistem panel admin ini:

```mermaid
erDiagram
    USERS {
        int id PK
        string username
        string password
        string role
    }
    
    PROJECTS {
        int id PK
        string title
        string description
        string image_url
        string link
        string tech_stack
    }
    
    EXPERIENCES {
        int id PK
        string company
        string role
        string date_range
        string description
    }
    
    SKILLS {
        int id PK
        string name
        int proficiency
        string category
    }
    
    EDUCATIONS {
        int id PK
        string school_name
        string degree
        string date_range
    }
    
    CERTIFICATES {
        int id PK
        string name
        string issuer
        string image_url
    }
    
    BLOG_POSTS {
        int id PK
        string title
        text content
        string cover_image
        date created_at
    }
    
    MESSAGES {
        int id PK
        string sender_name
        string email
        text message
        boolean is_read
        date created_at
    }

    USERS ||--o{ PROJECTS : manages
    USERS ||--o{ EXPERIENCES : manages
    USERS ||--o{ SKILLS : manages
    USERS ||--o{ BLOG_POSTS : publishes
```

---

## 4. Panduan Instalasi (Installation Guide)

Ikuti langkah-langkah berikut untuk menjalankan proyek secara lokal:

1. **Clone Repository**
   ```bash
   git clone https://github.com/dresar/PORTOFOLIO.git
   cd PORTOFOLIO
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Atur Environment Variables (.env)**
   Buat file `.env` dan konfigurasikan koneksi database Anda:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/dbname
   ```

4. **Jalankan Aplikasi**
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan (menjalankan Frontend & Server secara bersamaan).

5. **Build untuk Produksi**
   ```bash
   npm run build
   ```

---

## 5. Tampilan Antarmuka (UI Showcase)

### Halaman Publik (Landing Page)

![Hero Section](asset/home_hero.png)
*Gambar: Hero Section / Beranda Utama*

![Tentang Saya](asset/home_about.png)
*Gambar: Bagian Tentang Saya (About)*

![Pendidikan](asset/home_education.png)
*Gambar: Riwayat Pendidikan*

![Keahlian Teknis](asset/home_skills.png)
*Gambar: Daftar Keahlian Teknis (Skills)*

![Proyek Unggulan](asset/home_projects.png)
*Gambar: Daftar Proyek (Projects)*

![Pengalaman Kerja](asset/home_experience.png)
*Gambar: Riwayat Pengalaman Kerja*

![Sertifikasi](asset/home_certifications.png)
*Gambar: Daftar Sertifikasi*

![Artikel Blog](asset/home_articles.png)
*Gambar: Artikel Terbaru (Blog)*

![Kontak](asset/home_contact.png)
*Gambar: Hubungi Saya (Contact)*

![Kontak WhatsApp](asset/home_contact_whatsapp.png)
*Gambar: Hubungi Saya via WhatsApp Modal*

### Panel Admin (Admin Dashboard)

![Dashboard Utama](asset/admin_dashboard.png)
*Gambar: Admin Panel - Dashboard*

![Pesan Masuk](asset/admin_inbox.png)
*Gambar: Admin Panel - Kotak Masuk (Inbox)*

![Kelola Tentang Saya](asset/admin_about.png)
*Gambar: Admin Panel - Tentang Saya*

![Kelola Pengalaman](asset/admin_experience.png)
*Gambar: Admin Panel - Pengalaman Kerja*

![Kelola Proyek](asset/admin_projects.png)
*Gambar: Admin Panel - Proyek*

![Kelola Keahlian](asset/admin_skills.png)
*Gambar: Admin Panel - Keahlian*

![Kelola Pendidikan](asset/admin_education.png)
*Gambar: Admin Panel - Pendidikan*

![Kelola Sertifikat](asset/admin_certificates.png)
*Gambar: Admin Panel - Sertifikat*

![Kelola Artikel Blog](asset/admin_articles.png)
*Gambar: Admin Panel - Artikel Blog*

![Kelola Media Cloudinary](asset/admin_cloudinary.png)
*Gambar: Admin Panel - Media Cloudinary*
