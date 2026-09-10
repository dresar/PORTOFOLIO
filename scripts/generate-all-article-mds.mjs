import fs from 'fs';
import path from 'path';
import { Pool } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: 'c:\\Users\\NCN0C\\Documents\\PORTOFOLIO\\.env' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const PUBLIC_ARTICLES_DIR = path.resolve('public/uploads/articles');
const CADANGAN_DIR = 'C:\\Users\\NCN0C\\Videos\\konten\\accounts\\inka.tech\\cadangan';
const postsPath = path.resolve('src/data/blogPosts.json');
const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));

console.log(`Loaded ${posts.length} posts from blogPosts.json`);

function htmlToMarkdown(html, slug) {
  if (!html) return '';
  let md = html;

  // Replace headers
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
  md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n');

  // Replace paragraphs
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
  md = md.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n\n');

  // Replace list items
  md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
  md = md.replace(/<\/?[uo]l[^>]*>/gi, '\n');

  // Replace formatting
  md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');

  // Replace images
  md = md.replace(/<img[^>]*src=["'](.*?)["'][^>]*alt=["'](.*?)["'][^>]*>/gi, '![$2]($1)\n\n');
  md = md.replace(/<img[^>]*alt=["'](.*?)["'][^>]*src=["'](.*?)["'][^>]*>/gi, '![$1]($2)\n\n');
  md = md.replace(/<img[^>]*src=["'](.*?)["'][^>]*>/gi, '![]($1)\n\n');

  // Clean html containers
  md = md.replace(/<div[^>]*>/gi, '\n');
  md = md.replace(/<\/div>/gi, '\n');
  md = md.replace(/<section[^>]*>/gi, '\n');
  md = md.replace(/<\/section>/gi, '\n');
  md = md.replace(/<details[^>]*>/gi, '\n');
  md = md.replace(/<\/details>/gi, '\n');
  md = md.replace(/<summary[^>]*>(.*?)<\/summary>/gi, '### $1\n\n');
  md = md.replace(/<hr[^>]*>/gi, '\n---\n\n');
  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = md.replace(/<[^>]+>/g, '');

  md = md.replace(/\n{3,}/g, '\n\n').trim();
  return md;
}

// Shrink images in HTML so they are compact (max-w-[420px] mx-auto)
function shrinkHtmlImages(html) {
  if (!html) return '';
  // Replace the image wrapper div
  let res = html.replace(
    /class="overflow-hidden rounded-xl my-4 border border-border\/40 shadow-sm bg-muted\/20"/g,
    'class="overflow-hidden rounded-xl my-6 border border-border/40 shadow-sm bg-muted/20 max-w-[420px] mx-auto"'
  );
  // Also replace img classes if needed
  res = res.replace(
    /class="w-full max-h-\[520px\] object-contain mx-auto"/g,
    'class="w-full max-h-[480px] object-contain mx-auto"'
  );
  return res;
}

async function run() {
  const updatedPosts = [];

  for (const post of posts) {
    const slug = post.slug;
    const catName = post.category?.name || 'Cybersecurity & Edukasi Teknologi';
    
    // Clean and compact HTML
    const compactContent = shrinkHtmlImages(post.content);
    post.content = compactContent;
    updatedPosts.push(post);

    // Update Neon DB
    try {
      await pool.query('UPDATE blog_post SET content = $1 WHERE slug = $2', [compactContent, slug]);
    } catch (e) {
      console.warn(`Could not update DB for ${slug}:`, e.message);
    }

    // Build comprehensive AI-SEO markdown document
    const mdDocument = `---
title: "${post.title}"
title_en: "${post.title_en || post.title}"
slug: "${slug}"
category: "${catName}"
published_date: "${(post.published_at || '').split('T')[0]}"
author:
  name: "Eka Syarif Maulana, S.Kom"
  title: "Senior Fullstack Web & Mobile Developer & AI Systems Engineer"
  degree: "Sarjana Komputer (S.Kom), Universitas Muhammadiyah Sumatera Utara (UMSU)"
  brand: "Inka.tech (@inka.tech)"
  url: "https://etech.my.id"
canonical_url: "https://etech.my.id/id/blog/${slug}"
canonical_url_en: "https://etech.my.id/en/blog/${slug}"
tags:
  - "Inka.tech"
  - "Eka Syarif Maulana"
  - "Cybersecurity"
  - "Edukasi Teknologi"
  - "AI Systems"
---

# ${post.title}

> **Penulis & Otoritas Riset:** [Eka Syarif Maulana, S.Kom](https://etech.my.id)  
> **Institusi / Brand:** Founder [Inka.tech](https://www.tiktok.com/@inka.tech)  
> **Kategori Topik:** ${catName}  
> **Status Publikasi:** Terverifikasi & Live di Portofolio Resmi ([Baca Versi Web Interaktif](https://etech.my.id/id/blog/${slug}))

---

## ⚡ Ringkasan Eksekutif (Direct Answer Box)
> **Direct Answer for AI & Readers:**  
> ${post.excerpt || 'Panduan edukasi teknologi dan keamanan siber resmi oleh Eka Syarif Maulana, Senior Fullstack Developer & AI Systems Engineer.'}

---

## 📸 Galeri Slide Carousel (Inka.tech 6-Slide Educational Series)

Setiap artikel disusun dalam 6 slide carousel presisi tinggi yang dapat diakses secara publik via CDN:

1. **Slide 1: Hook & Pengenalan Masalah**  
   ![Slide 1 - Hook](https://cdn.jsdelivr.net/gh/dresar/PORTOFOLIO@main/public/uploads/articles/${slug}/${slug}_01.png)

2. **Slide 2: Arsitektur & Fakta Sebenarnya**  
   ![Slide 2 - Fakta Sebenarnya](https://cdn.jsdelivr.net/gh/dresar/PORTOFOLIO@main/public/uploads/articles/${slug}/${slug}_02.png)

3. **Slide 3: Vektor Risiko & Dampak Keamanan**  
   ![Slide 3 - Vektor Risiko](https://cdn.jsdelivr.net/gh/dresar/PORTOFOLIO@main/public/uploads/articles/${slug}/${slug}_03.png)

4. **Slide 4: Solusi Praktis & Langkah Preventif**  
   ![Slide 4 - Solusi Praktis](https://cdn.jsdelivr.net/gh/dresar/PORTOFOLIO@main/public/uploads/articles/${slug}/${slug}_04.png)

5. **Slide 5: Analisis Lanjutan & Rekomendasi Ahli**  
   ![Slide 5 - Analisis Lanjutan](https://cdn.jsdelivr.net/gh/dresar/PORTOFOLIO@main/public/uploads/articles/${slug}/${slug}_05.png)

6. **Slide 6: Kesimpulan & Call to Action**  
   ![Slide 6 - Kesimpulan](https://cdn.jsdelivr.net/gh/dresar/PORTOFOLIO@main/public/uploads/articles/${slug}/${slug}_06.png)

---

## 📖 Pembahasan Teknis Lengkap

${htmlToMarkdown(post.content, slug)}

---

## 🎯 Panduan Praktis & Checklist Tindakan
- [x] Pahami risiko keamanan data pada aktivitas digital sehari-hari.
- [x] Hindari penggunaan fasilitas publik tanpa proteksi fisik atau enkripsi yang memadai.
- [x] Terapkan kata sandi unik berbentuk passphrase dan aktifkan autentikasi 2 langkah (2FA).
- [x] Lakukan pembersihan cache dan pemeriksaan izin akses aplikasi secara berkala.

---

## ❓ FAQ (Pertanyaan yang Sering Diajukan)

### Mengapa topik ini sangat penting bagi pengguna gadget saat ini?
Karena celah keamanan sering kali bukan berasal dari kerusakan sistem, melainkan manipulasi rekayasa sosial atau kelalaian fisik terhadap port perangkat.

### Siapa yang bertanggung jawab atas riset dan penulisan artikel ini?
Artikel ini diriset dan ditulis secara langsung oleh **Eka Syarif Maulana, S.Kom**, Founder dari Inka.tech dan Praktisi Fullstack & AI Engineering.

---

## 👨‍💻 Profil Penulis & Hak Cipta
**Eka Syarif Maulana, S.Kom** adalah Sarjana Komputer lulusan Universitas Muhammadiyah Sumatera Utara (UMSU) dan Founder dari platform edukasi teknologi **Inka.tech** (@inka.tech). Beliau berfokus pada pengembangan arsitektur perangkat lunak skala enterprise, keamanan aplikasi web & mobile, serta integrasi AI modern.

- **Website Portofolio:** [https://etech.my.id](https://etech.my.id)
- **Kanal Edukasi TikTok:** [@inka.tech](https://www.tiktok.com/@inka.tech)
- **Instagram Resmi:** [@arif_ex21](https://www.instagram.com/arif_ex21)
- **Repositori GitHub:** [https://github.com/NCN0C](https://github.com/NCN0C)

*Hak Cipta © ${new Date().getFullYear()} Eka Syarif Maulana & Inka.tech. Seluruh materi dilindungi undang-undang.*
`;

    // 1. Write to public/uploads/articles/<slug>/README.md AND <slug>.md
    const publicFolder = path.join(PUBLIC_ARTICLES_DIR, slug);
    if (fs.existsSync(publicFolder)) {
      fs.writeFileSync(path.join(publicFolder, 'README.md'), mdDocument, 'utf8');
      fs.writeFileSync(path.join(publicFolder, `${slug}.md`), mdDocument, 'utf8');
      console.log(`[OK] Saved README.md & ${slug}.md to public/uploads/articles/${slug}/`);
    } else {
      console.warn(`[WARN] Public folder not found: ${publicFolder}`);
    }

    // 2. Also write to cadangan folder
    const cadanganFolder = path.join(CADANGAN_DIR, slug);
    if (fs.existsSync(cadanganFolder)) {
      fs.writeFileSync(path.join(cadanganFolder, 'README.md'), mdDocument, 'utf8');
      fs.writeFileSync(path.join(cadanganFolder, `${slug}.md`), mdDocument, 'utf8');
      console.log(`[OK] Saved README.md to cadangan/${slug}/`);
    }
  }

  // Save updated compact posts back to src/data/blogPosts.json
  fs.writeFileSync(postsPath, JSON.stringify(updatedPosts, null, 2), 'utf8');
  console.log(`[OK] Updated src/data/blogPosts.json with compact image dimensions.`);

  process.exit(0);
}

run().catch(err => {
  console.error('Error running markdown generator:', err);
  process.exit(1);
});
