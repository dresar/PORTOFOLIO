# Eka Syarif Maulana - Web Portofolio Dinamis dengan CMS (Admin Panel) Terintegrasi

**Deskripsi Singkat:**
Sebuah platform portofolio web modern, interaktif, dan sepenuhnya dinamis yang dibangun untuk menampilkan identitas profesional secara elegan. Proyek ini dilengkapi dengan sistem manajemen konten (CMS) khusus yang memungkinkan administrator untuk mengelola data profil, proyek, keahlian, hingga artikel blog secara *real-time* tanpa harus menyentuh kode.

**Tech Stack:**
React.js, Vite, Tailwind CSS, Framer Motion, Radix UI, Lucide React, Zustand, TanStack React Query, React Router DOM, React Hook Form, Zod, PostgreSQL, Neon Database, Drizzle ORM, Tiptap, UIW MD Editor

---

## Deskripsi Lengkap Proyek

Proyek ini bermula dari kebutuhan akan sebuah web portofolio yang tidak hanya berfungsi sebagai etalase karya statis, melainkan sebuah platform hidup yang dapat dengan mudah diperbarui seiring dengan berkembangnya karir dan keahlian. Berbeda dengan portofolio konvensional yang mengharuskan pengembang untuk melakukan *commit* dan *deploy* ulang setiap kali ada perubahan kecil, web portofolio ini hadir dengan solusi Panel Admin (CMS) yang dirancang secara khusus. Melalui antarmuka admin yang intuitif, segala bentuk pembaruan konten dapat dilakukan secara langsung, memberikan kebebasan dan fleksibilitas penuh dalam mengelola identitas digital.

Dari segi arsitektur antarmuka pengguna (UI), proyek ini sangat menitikberatkan pada estetika, kenyamanan pengguna (User Experience/UX), serta tingkat responsivitas yang tinggi di berbagai perangkat. Penggunaan palet warna yang modern dipadukan dengan tipografi yang bersih menciptakan kesan profesional sejak pandangan pertama. Transisi halaman dan interaksi elemen dibangun menggunakan Framer Motion, memberikan sentuhan mikro-animasi yang halus namun berdampak besar pada pengalaman penelusuran yang dinamis. Elemen-elemen antarmuka dioptimalkan menggunakan komponen Radix UI untuk memastikan tingkat aksesibilitas (a11y) yang berstandar tinggi bagi seluruh pengunjung.

Di balik tampilan depan yang menawan, sistem ini didukung oleh infrastruktur *backend* yang tangguh. Basis data relasional menggunakan PostgreSQL yang dihosting pada arsitektur *serverless* Neon Database, memastikan kecepatan akses dan skalabilitas aplikasi yang luar biasa. Interaksi dengan basis data ditangani secara langsung menggunakan Drizzle ORM, sebuah alat pemetaan objek-relasional modern yang memberikan keamanan tipe (type-safety) penuh di dalam ekosistem TypeScript, sehingga meminimalisir potensi kesalahan (bug) pada saat eksekusi. Untuk perlindungan dan manajemen form pada panel admin, kombinasi canggih antara React Hook Form dan Zod menjamin bahwa setiap input data divalidasi secara ketat dan aman sebelum dikirim ke peladen.

Fitur-fitur utama dalam sistem ini dirancang dengan sangat komprehensif. Mulai dari pengelolaan halaman *Tentang Saya* untuk merangkum perjalanan karir, fitur *Pendidikan* guna menyoroti latar belakang akademis, modul *Keahlian Teknis* yang menampilkan tingkat kemahiran pada berbagai alat, hingga *Proyek Unggulan* yang berfungsi sebagai bukti nyata kompetensi teknis. Selain itu, tersedia pula fitur *Artikel Blog* yang terintegrasi dengan Rich Text Editor (Tiptap) agar pengelola dapat dengan bebas berbagi wawasan secara mendalam, serta fitur *Kotak Masuk (Inbox)* yang memungkinkan perekrut atau pengunjung untuk meninggalkan pesan langsung dari platform web.

Secara keseluruhan, proyek portofolio dinamis ini bukan sekadar sekumpulan halaman web biasa, melainkan sebuah rekayasa perangkat lunak (software engineering) yang utuh. Platform ini berhasil mendemonstrasikan kemampuan teknis dari hulu ke hilir (full-stack development), penguasaan tingkat lanjut terhadap ekosistem pengembangan web modern, serta pemahaman yang mendalam mengenai arsitektur sistem dan prinsip desain antarmuka yang berpusat pada kepuasan pengguna.

## Tantangan dan Solusi

Selama proses pengembangan, salah satu tantangan paling menonjol adalah merancang antarmuka admin yang mampu menangani input data yang kompleks—seperti pembuatan artikel berbasis *Rich Text* dan pengunggahan media—tanpa mengorbankan performa aplikasi web. Tantangan ini dipecahkan dengan mengimplementasikan TanStack React Query untuk manajemen *state* asinkron dan *caching*, sehingga pertukaran data antara sisi admin dan sisi publik selalu tersinkronisasi tanpa memerlukan pemuatan ulang halaman (page reload) yang memberatkan browser.

## Hasil dan Dampak

Dengan rampungnya portofolio ini, pembaruan rekam jejak karir kini dapat dilakukan secara instan hanya dalam hitungan menit dari perangkat mana saja yang memiliki akses internet. Platform ini tidak hanya sukses memamerkan hasil karya dengan cara yang paling estetis dan meyakinkan, tetapi kodenya yang bersih dan modular juga menjadi representasi dari standar pemrograman berkualitas tinggi (clean code architecture).
