# STRICT RULES FOR AI CODING ASSISTANTS

## 1. MEDIA & ASSETS POLICY: 100% CDN MANDATORY (ZERO LOCAL IMAGES)
- **LARANGAN KERAS FOLDER GAMBAR LOKAL**:
  - **DILARANG KERAS** membuat atau menyimpan gambar/media di folder lokal seperti `asset/`, `assets/`, `images/`, `public/images/`, `public/media/`, dsb.
  - Jangan pernah menyimpan screenshot, mockup, cover, foto, avatar, atau video ke dalam repository/project lokal ini. Codebase ini harus tetap ringan dan bersih.

- **SEMUA MEDIA WAJIB MENGGUNAKAN LINK CDN GLOBAL**:
  - **GitHub Assets Repo**: `ekasyarifmaulana10-crypto/PORTOFOLIO-assets` branch `main`
  - **CDN Endpoint**:
    ```text
    https://cdn.jsdelivr.net/gh/ekasyarifmaulana10-crypto/PORTOFOLIO-assets@main/public/uploads/<filename>
    ```
  - **R2 CDN Endpoint (Fallback/Alternative)**:
    ```text
    https://r2.ekasyarif.my.id/<filename>
    ```

- **ATURAN UPLOAD & RESPONSE MEDIA API**:
  - Semua upload baru wajib dikompresi ke format `.webp` berkualitas tinggi (sharp & lightweight) sebelum dikirim.
  - Endpoint Media Library (`/api/media/upload`, `/api/media/list`) **WAJIB SELALU** mengembalikan direct public CDN URL (`https://cdn.jsdelivr.net/...`).
  - **DILARANG KERAS** mengembalikan relative path lokal seperti `/media/uploads/...` atau domain server lokal `http://localhost:.../media/uploads/...`.

- **PEMBERSIHAN OTOMATIS**:
  - Jika menemukan file gambar/video baru di filesystem root atau folder lokal, unggah file tersebut ke repositori GitHub storage CDN (`ekasyarifmaulana10-crypto/PORTOFOLIO-assets`) lalu **segera hapus file lokalnya**.
