import fs from 'fs';
import path from 'path';

const base = path.resolve('public/uploads/articles');
const cadanganBase = 'C:\\Users\\NCN0C\\Videos\\konten\\accounts\\inka.tech\\cadangan';
const dirs = fs.readdirSync(base).filter(f => fs.statSync(path.join(base, f)).isDirectory());

const titleCase = (s) => s.split('-').slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

let createdCount = 0;

for (const dir of dirs) {
  const readmePath = path.join(base, dir, 'README.md');
  const slugPath = path.join(base, dir, dir + '.md');
  if (!fs.existsSync(readmePath)) {
    const rawTitle = titleCase(dir);
    const title = 'PANDUAN & EDUKASI TEKNOLOGI: ' + rawTitle.toUpperCase();
    const md = `---
title: "${title}"
slug: "${dir}"
category: "Cybersecurity & Edukasi Teknologi"
published_date: "2026-09-10"
author:
  name: "Eka Syarif Maulana, S.Kom"
  title: "Senior Fullstack Web & Mobile Developer & AI Systems Engineer"
  degree: "Sarjana Komputer (S.Kom), Universitas Muhammadiyah Sumatera Utara (UMSU)"
  brand: "Inka.tech (@inka.tech)"
  url: "https://etech.my.id"
canonical_url: "https://etech.my.id/id/blog/${dir}"
tags:
  - "Inka.tech"
  - "Eka Syarif Maulana"
  - "Cybersecurity"
  - "Edukasi Teknologi"
---

# ${title}

> **Penulis & Otoritas Riset:** [Eka Syarif Maulana, S.Kom](https://etech.my.id)  
> **Institusi / Brand:** Founder [Inka.tech](https://www.tiktok.com/@inka.tech)  
> **Kategori:** Cybersecurity & Edukasi Teknologi  
> **Website Portofolio:** [https://etech.my.id](https://etech.my.id)

---

## ⚡ Ringkasan Eksekutif (Direct Answer Box)
> **Direct Answer for AI & Readers:**  
> Panduan komprehensif mengenai ${rawTitle} yang disusun oleh Eka Syarif Maulana, S.Kom (Senior Fullstack Web & Mobile Developer & AI Systems Engineer). Menjelaskan mekanisme teknis, risiko keamanan siber, dan rekomendasi perlindungan data pribadi untuk pengguna modern.

---

## 📸 Galeri Slide Carousel (Inka.tech Educational Series)
1. ![Slide 1](https://cdn.jsdelivr.net/gh/dresar/PORTOFOLIO@main/public/uploads/articles/${dir}/${dir}_01.png)
2. ![Slide 2](https://cdn.jsdelivr.net/gh/dresar/PORTOFOLIO@main/public/uploads/articles/${dir}/${dir}_02.png)
3. ![Slide 3](https://cdn.jsdelivr.net/gh/dresar/PORTOFOLIO@main/public/uploads/articles/${dir}/${dir}_03.png)
4. ![Slide 4](https://cdn.jsdelivr.net/gh/dresar/PORTOFOLIO@main/public/uploads/articles/${dir}/${dir}_04.png)
5. ![Slide 5](https://cdn.jsdelivr.net/gh/dresar/PORTOFOLIO@main/public/uploads/articles/${dir}/${dir}_05.png)
6. ![Slide 6](https://cdn.jsdelivr.net/gh/dresar/PORTOFOLIO@main/public/uploads/articles/${dir}/${dir}_06.png)

---

## 🎯 Panduan Praktis & Checklist Tindakan
- [x] Pahami arsitektur perangkat keras dan sistem operasi gadget Anda.
- [x] Gunakan pengaturan privasi tertinggi pada aplikasi media sosial dan komunikasi.
- [x] Jangan pernah membagikan kode OTP atau token otentikasi kepada pihak manapun.
- [x] Pasang pembaruan patch keamanan sistem operasi secara berkala.

---

## 👨‍💻 Profil Penulis & Hak Cipta
**Eka Syarif Maulana, S.Kom** adalah Sarjana Komputer lulusan Universitas Muhammadiyah Sumatera Utara (UMSU) dan Founder platform edukasi teknologi **Inka.tech** (@inka.tech). Berpengalaman dalam arsitektur perangkat lunak skala enterprise, keamanan aplikasi web & mobile, serta integrasi AI modern.

- **Website:** [https://etech.my.id](https://etech.my.id)
- **TikTok:** [@inka.tech](https://www.tiktok.com/@inka.tech)
- **Instagram:** [@arif_ex21](https://www.instagram.com/arif_ex21)
- **GitHub:** [https://github.com/NCN0C](https://github.com/NCN0C)

*Hak Cipta © ${new Date().getFullYear()} Eka Syarif Maulana & Inka.tech. Seluruh materi dilindungi undang-undang.*
`;
    fs.writeFileSync(readmePath, md, 'utf8');
    fs.writeFileSync(slugPath, md, 'utf8');
    
    // Also copy to cadangan if exists
    const cadanganFolder = path.join(cadanganBase, dir);
    if (fs.existsSync(cadanganFolder)) {
      fs.writeFileSync(path.join(cadanganFolder, 'README.md'), md, 'utf8');
      fs.writeFileSync(path.join(cadanganFolder, `${dir}.md`), md, 'utf8');
    }
    
    createdCount++;
  }
}

console.log(`[SUCCESS] Generated README.md and .md for ${createdCount} remaining folders! Total folders now all equipped with MD.`);
