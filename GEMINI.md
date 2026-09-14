# ATURAN KETAT SISTEM & MEDIA UNTUK AI

## KEBIJAKAN ZERO LOCAL MEDIA (WAJIB 100% CDN)
1. **DILARANG MENYIMPAN GAMBAR DI FOLDER LOKAL**:
   - Dilarang membuat folder `asset/`, `assets/`, `images/`, atau meletakkan file `.webp`, `.png`, `.jpg`, `.jpeg`, `.mp4` secara lokal di dalam folder project ini.
   - Codebase ini harus murni kode dan teks.

2. **SEMUA ASSET MEDIA WAJIB MELALUI CDN**:
   - Sumber Storage: Repositori GitHub `ekasyarifmaulana10-crypto/PORTOFOLIO-assets` (branch: `main`).
   - Format URL yang wajib dipakai:
     `https://cdn.jsdelivr.net/gh/ekasyarifmaulana10-crypto/PORTOFOLIO-assets@main/public/uploads/<nama_file>`
   - Format R2:
     `https://r2.ekasyarif.my.id/<nama_file>`

3. **STANDAR BACKEND & API MEDIA**:
   - Setiap API Media (`/api/media/list`, `/api/media/upload`) WAJIB mengembalikan URL CDN jsDelivr absolut (`https://cdn.jsdelivr.net/...`).
   - DILARANG mengembalikan URL relatif `/media/uploads/...` atau localhost.

4. **KOMPRESI WEBP & PEMBERSIHAN**:
   - Semua upload baru wajib dikonversi ke WebP ringan & jernih.
   - Hapus segera file gambar lokal jika ada yang terbuat secara tidak sengaja.
