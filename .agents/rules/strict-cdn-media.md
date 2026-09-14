---
description: Aturan ketat larangan folder gambar lokal dan kewajiban 100% menggunakan CDN jsDelivr / R2 untuk semua media
globs: **/*
alwaysApply: true
---

# STRICT CDN MEDIA ENFORCEMENT RULE

1. **NO LOCAL IMAGE/MEDIA STORAGE**:
   - DILARANG membuat atau menyimpan gambar/media (`.png`, `.jpg`, `.jpeg`, `.webp`, `.svg`, `.mp4`) di folder lokal (`asset/`, `images/`, `public/images/`, root folder, dll).
   - Codebase project ini murni untuk code frontend, backend functions, config, dan documentation.

2. **100% MEDIA HOSTED ON CDN**:
   - Storage Repo: `ekasyarifmaulana10-crypto/PORTOFOLIO-assets` (branch: `main`)
   - Direct CDN URL Format:
     `https://cdn.jsdelivr.net/gh/ekasyarifmaulana10-crypto/PORTOFOLIO-assets@main/public/uploads/<filename>`
   - Fallback R2 URL:
     `https://r2.ekasyarif.my.id/<filename>`

3. **API RESPONSE STANDARD**:
   - API endpoints (`/api/media/list`, `/api/media/upload`) WAJIB selalu mengembalikan `url` dan `secure_url` dalam bentuk full CDN URL (`https://cdn.jsdelivr.net/...`).
   - DILARANG KERAS mengembalikan `/media/uploads/...` atau localhost URL.

4. **AUTO COMPRESSION**:
   - Setiap berkas gambar yang diunggah wajib di-compress ke format WebP ringan dan jernih sebelum disimpan ke storage CDN.
