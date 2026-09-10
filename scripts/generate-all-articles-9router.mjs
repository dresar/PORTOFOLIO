import fs from 'fs';
import path from 'path';

const API_BASE = 'https://9router.serverinka.cloud/v1';
const API_KEY = 'sk-7016dd129191d903-u8emvi-c0b721b9';
const MODELS = ['gemini/gemini-3.6-flash', 'cbai/deepseek-v4-flash', 'kr/deepseek-3.2'];

const blogPostsPath = path.resolve('src/data/blogPosts.json');
const articlesDir = path.resolve('public/uploads/articles');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function call9Router(prompt, modelIdx = 0) {
  const model = MODELS[modelIdx % MODELS.length];
  const res = await fetch(`${API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`9Router error ${res.status} [${model}]: ${errText}`);
  }

  const text = await res.text();
  const lines = text.split('\n');
  let full = '';
  for (const line of lines) {
    if (line.startsWith('data: ') && line.trim() !== 'data: [DONE]') {
      try {
        const json = JSON.parse(line.slice(6));
        full += json.choices?.[0]?.delta?.content || '';
      } catch {}
    }
  }
  return full.trim();
}

function cleanHtml(raw) {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```html')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

async function generateArticleWithRetry(post, index, total) {
  // Check if post already has rich deep content (> 7000 chars and no Founder Inka)
  if (
    post.content && 
    post.content.length > 7000 && 
    post.content.includes('Eka Syarif Maulana, S.Kom') && 
    !post.content.includes('Founder Inka')
  ) {
    console.log(`⏩ [${index + 1}/${total}] ${post.slug} already has rich content (${post.content.length} chars). Skipping.`);
    return true;
  }

  console.log(`⏳ [${index + 1}/${total}] Generating: ${post.slug} (${post.title})...`);

  const prompt = `Anda adalah Eka Syarif Maulana, S.Kom (Senior Fullstack Web & Mobile Developer & AI Systems Engineer, Sarjana Komputer UMSU).
Tuliskan artikel edukasi teknologi dan keamanan siber yang SUPER LENGKAP, MENDALAM, SANGAT DETAIL, DAN CANTIK dalam format HTML semantik (langsung dibuka dengan <div class="blog-rich-content space-y-8"> tanpa wrapper html/head/body).

Judul: "${post.title}"
Topik/Slug: "${post.slug}"
Kategori: "${post.category?.name || 'Cybersecurity & Tech'}"
Ringkasan: "${post.excerpt || ''}"

ATURAN WAJIB & STRICT:
1. IDENTITAS PENULIS: Eka Syarif Maulana, S.Kom (Senior Fullstack Web & Mobile Developer & AI Systems Engineer, Sarjana Komputer UMSU).
   LARANGAN KERAS: JANGAN menyebut atau menulis "Founder Inka.tech"! Identitas adalah Senior Fullstack Web & Mobile Developer & AI Systems Engineer.
2. SLIDE GAMBAR: JANGAN menyematkan gambar slide di dalam artikel ini (karena 6 slide sudah ada di Slide Player samping/atas).
3. STRUKTUR ARTIKEL LENGKAP:
   A. <div class="direct-answer-box p-6 rounded-2xl border border-primary/30 bg-primary/5 shadow-xs">
      - Badge AI-SEO Quick Summary dengan ikon ⚡
      - Direct Answer 3-4 kalimat komprehensif mengupas masalah dan solusi utama untuk AI Search & Pembaca.
   B. <h2>🔬 Analisis Mendalam & Latar Belakang Masalah</h2>
      - Penjelasan konseptual dan arsitektur teknis (OSI layer, firmware, hardware pinout, atau protokol aplikasi).
   C. <div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
      - 2 kartu analisis teknis (bg-card border border-border/60 p-5 rounded-xl) menguraikan anatomi sistem dan vektor risiko.
   D. <h2>🛡️ Anatomi Vektor Serangan / Masalah di Lapangan</h2>
      - Skenario eksploitasi nyata, kerentanan (CVE / standar industri), dan bukti lapangan.
   E. <h2>📊 Tabel Perbandingan & Evaluasi Teknis</h2>
      - Tabel HTML rapi (border border-border rounded-xl) dengan header berlatar bg-muted/60.
   F. <h2>⚙️ Panduan Solusi & Mitigasi Langkah-demi-Langkah</h2>
      - Panduan langkah konkret yang dapat langsung dipraktekkan, sertakan blok kode/perintah konfigurasi bila relevan.
   G. <div class="checklist-box p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 shadow-xs my-8">
      - 🛡️ Checklist Perlindungan & Best Practice (5-7 poin penting).
   H. <h2>❓ Pertanyaan yang Sering Diajukan (FAQ)</h2>
      - 4-5 pertanyaan mendalam dan jawaban edukatif tuntas.
   I. <div class="author-attribution-card p-6 rounded-2xl border border-border/60 bg-muted/20 my-8">
      - Tentang Penulis: Eka Syarif Maulana, S.Kom | Senior Fullstack Web & Mobile Developer & AI Systems Engineer lulusan Sarjana Komputer UMSU.
4. Output HANYA kode HTML mentah di dalam <div class="blog-rich-content space-y-8">...</div> tanpa markdown backticks \`\`\`html.`;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`🔄 Retry attempt ${attempt + 1} for ${post.slug}...`);
        await sleep(2500 * attempt);
      }

      const raw = await call9Router(prompt, attempt);
      const content = cleanHtml(raw);

      if (content && content.length > 3000) {
        post.content = content;
        post.author = 'Eka Syarif Maulana, S.Kom';
        post.author_role = 'Senior Fullstack Web & Mobile Developer & AI Systems Engineer';
        console.log(`✅ [${index + 1}/${total}] Successfully generated ${post.slug} (${content.length} chars)`);

        // Generate Markdown file
        const mdContent = `---
title: "${post.title.replace(/"/g, '\\"')}"
slug: "${post.slug}"
category: "${post.category?.name || 'Cybersecurity'}"
date: "${post.published_at || new Date().toISOString()}"
author: "Eka Syarif Maulana, S.Kom"
author_role: "Senior Fullstack Web & Mobile Developer & AI Systems Engineer"
author_degree: "Sarjana Komputer (S.Kom), Universitas Muhammadiyah Sumatera Utara (UMSU)"
excerpt: "${(post.excerpt || '').replace(/"/g, '\\"')}"
---

# ${post.title}

> Ditulis & diteliti oleh **Eka Syarif Maulana, S.Kom**  
> *Senior Fullstack Web & Mobile Developer & AI Systems Engineer (S.Kom, UMSU)*  
> Publikasi Resmi: [https://etech.my.id/id/blog/${post.slug}](https://etech.my.id/id/blog/${post.slug})

---

${content}
`;
        const targetDir = path.join(articlesDir, post.slug);
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
        fs.writeFileSync(path.join(targetDir, `${post.slug}.md`), mdContent, 'utf8');
        fs.writeFileSync(path.join(targetDir, 'README.md'), mdContent, 'utf8');
        return true;
      }
    } catch (err) {
      console.warn(`Attempt ${attempt + 1} failed for ${post.slug}:`, err.message);
    }
  }

  console.error(`❌ Failed all attempts for ${post.slug}`);
  return false;
}

async function main() {
  const rawPosts = JSON.parse(fs.readFileSync(blogPostsPath, 'utf8'));
  console.log(`Running resilient sequential generation for ${rawPosts.length} articles...`);

  for (let i = 0; i < rawPosts.length; i++) {
    const post = rawPosts[i];
    await generateArticleWithRetry(post, i, rawPosts.length);

    // Save checkpoint after each article
    fs.writeFileSync(blogPostsPath, JSON.stringify(rawPosts, null, 2), 'utf8');

    // Politeness delay
    await sleep(1200);
  }

  console.log('🎉 All 20 articles process finished!');
}

main();
