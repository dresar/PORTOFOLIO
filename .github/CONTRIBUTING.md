# Panduan Kontribusi (Contributing Guidelines)

Terima kasih atas ketertarikan Anda untuk berkontribusi pada repositori portofolio resmi **Eka Syarif Maulana, S.Kom** ([ekasyarif.my.id](https://ekasyarif.my.id)).

---

## 1. Standar Rekayasa Kode

1. **Clean Code & Zero Comments**:
   - Kode harus jelas, ekspresif, dan *self-documenting* melalui penamaan fungsi, variabel, dan tipe yang presisi.
   - Hindari meninggalkan komentar penjelasan kode yang tidak esensial.

2. **Keamanan Kredensial**:
   - Dilarang keras melakukan commit atau hardcode terhadap API key, password database, bearer token, atau rahasia apapun.
   - Semua konfigurasi sensitif wajib menggunakan variabel lingkungan (`.env` dan `process.env`).

3. **Performa & Ukuran Aset**:
   - Seluruh aset visual harus dioptimalkan (WebP/SVG/AVIF) dan tidak melebihi dimensi rendering yang diperlukan.
   - Jaga skor performa Google PageSpeed / Lighthouse tetap di atas 90+.

4. **Aksesibilitas (A11y)**:
   - Setiap elemen tombol interaktif wajib memiliki `aria-label` yang dapat dibaca screen reader dan AI crawler.
   - Gunakan semantik HTML5 yang tepat (`<nav>`, `<main>`, `<section>`, `<article>`).

---

## 2. Alur Kerja Pengembangan Lokal

1. **Clone Repositori**:
   ```bash
   git clone https://github.com/dresar/PORTOFOLIO.git
   cd PORTOFOLIO
   ```

2. **Install Dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan Server Pengembangan**:
   ```bash
   npm run dev
   ```

4. **Uji Build Produksi**:
   ```bash
   npm run build
   ```
   Pastikan tidak ada error kompilasi TypeScript maupun Vite build error sebelum mengajukan Pull Request.

---

## 3. Konvensi Pesan Commit (Conventional Commits)

Gunakan format standar pesan commit:
- `feat(scope): deskripsi fitur baru`
- `fix(scope): perbaikan bug`
- `perf(scope): optimasi kecepatan atau ukuran bundle`
- `refactor(scope): perubahan struktur tanpa mengubah fungsi`
- `chore(scope): pembaruan dependensi atau pembersihan script`
