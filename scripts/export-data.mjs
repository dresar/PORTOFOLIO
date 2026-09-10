import { Pool } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: 'c:\\Users\\NCN0C\\Documents\\PORTOFOLIO\\.env' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const CADANGAN_DIR = 'C:\\Users\\NCN0C\\Videos\\konten\\accounts\\inka.tech\\cadangan';

function htmlToMarkdown(html, slug) {
  if (!html) return '';
  let md = html;
  
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
  md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n');

  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
  md = md.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n\n');

  md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
  md = md.replace(/<\/?[uo]l[^>]*>/gi, '\n');

  md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');

  md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');

  md = md.replace(/<img[^>]*src=["'](.*?)["'][^>]*alt=["'](.*?)["'][^>]*>/gi, '![$2]($1)\n\n');
  md = md.replace(/<img[^>]*alt=["'](.*?)["'][^>]*src=["'](.*?)["'][^>]*>/gi, '![$1]($2)\n\n');
  md = md.replace(/<img[^>]*src=["'](.*?)["'][^>]*>/gi, '![]($1)\n\n');

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

async function main() {
  console.log('Connecting to Neon database...');
  const catRes = await pool.query('SELECT * FROM blog_category');
  const categories = catRes.rows;
  const catMap = {};
  categories.forEach(c => { catMap[c.id] = c.name; });

  const postRes = await pool.query('SELECT * FROM blog_post ORDER BY id ASC');
  const posts = postRes.rows;
  console.log(`Found ${posts.length} posts in database.`);

  const enPath = 'c:\\Users\\NCN0C\\Documents\\PORTOFOLIO\\src\\locales\\db_en.json';
  const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

  const staticBlogPosts = [];

  for (const post of posts) {
    const slug = post.slug;
    const catName = catMap[post.category_id || post.categoryId] || 'Teknologi & Keamanan Digital';
    const enPost = enData.blog_posts?.[String(post.id)] || {};
    
    const blogItem = {
      id: post.id,
      slug: post.slug,
      title: post.title,
      title_en: enPost.title || post.title,
      excerpt: post.excerpt || '',
      excerpt_en: enPost.excerpt || post.excerpt || '',
      content: post.content || '',
      cover_image: post.cover_image || post.coverImage || `https://cdn.jsdelivr.net/gh/dresar/PORTOFOLIO@main/public/uploads/articles/${slug}/${slug}_01.png`,
      category_id: post.category_id || post.categoryId || 1,
      category: {
        id: post.category_id || post.categoryId || 1,
        name: catName,
        slug: 'edukasi-teknologi'
      },
      views: post.views || 100,
      likes: post.likes || 0,
      author: 'Eka Syarif Maulana, S.Kom',
      author_role: 'Senior Fullstack Web & Mobile Developer & AI Systems Engineer',
      published_at: post.published_at || post.publishedAt || post.created_at || new Date().toISOString(),
      created_at: post.created_at || new Date().toISOString(),
      updated_at: post.updated_at || new Date().toISOString(),
      tags: ['Inka.tech', 'Eka Syarif Maulana', 'Cyber Security', 'Edukasi Teknologi', 'Tips Gadget']
    };

    staticBlogPosts.push(blogItem);

    const targetFolder = path.join(CADANGAN_DIR, slug);
    if (fs.existsSync(targetFolder)) {
      const mdContent = `# ${post.title}

> **Penulis:** Eka Syarif Maulana, S.Kom  
> **Posisi:** Senior Fullstack Web & Mobile Developer & AI Systems Engineer  
> **Kategori:** ${catName}  
> **Publikasi:** ${new Date(blogItem.published_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}  
> **Website Portofolio:** [https://etech.my.id/id/blog/${slug}](https://etech.my.id/id/blog/${slug})

---

## Ringkasan Eksekutif (Direct Answer)
${post.excerpt || 'Artikel panduan edukasi teknologi dan keamanan digital resmi oleh Eka Syarif Maulana, Senior Fullstack Developer & AI Systems Engineer.'}

---

## Galeri Slide Carousel (Inka.tech 6-Slide Series)

1. ![Slide 1](https://cdn.jsdelivr.net/gh/dresar/PORTOFOLIO@main/public/uploads/articles/${slug}/${slug}_01.png)
2. ![Slide 2](https://cdn.jsdelivr.net/gh/dresar/PORTOFOLIO@main/public/uploads/articles/${slug}/${slug}_02.png)
3. ![Slide 3](https://cdn.jsdelivr.net/gh/dresar/PORTOFOLIO@main/public/uploads/articles/${slug}/${slug}_03.png)
4. ![Slide 4](https://cdn.jsdelivr.net/gh/dresar/PORTOFOLIO@main/public/uploads/articles/${slug}/${slug}_04.png)
5. ![Slide 5](https://cdn.jsdelivr.net/gh/dresar/PORTOFOLIO@main/public/uploads/articles/${slug}/${slug}_05.png)
6. ![Slide 6](https://cdn.jsdelivr.net/gh/dresar/PORTOFOLIO@main/public/uploads/articles/${slug}/${slug}_06.png)

---

## Pembahasan Lengkap

${htmlToMarkdown(post.content, slug)}

---

## Profil Penulis & Hak Cipta
**Eka Syarif Maulana, S.Kom** adalah Founder dari platform edukasi teknologi **Inka.tech** (@inka.tech) dan Senior Fullstack Web & Mobile Developer serta AI Systems Engineer. Berpengalaman dalam arsitektur perangkat lunak skala enterprise, keamanan siber modern, dan otomatisasi berbasis AI.

- **Portofolio:** [https://etech.my.id](https://etech.my.id)
- **TikTok Edukasi:** [@inka.tech](https://www.tiktok.com/@inka.tech)
- **Instagram:** [@arif_ex21](https://www.instagram.com/arif_ex21)
- **GitHub:** [https://github.com/NCN0C](https://github.com/NCN0C)

*© ${new Date().getFullYear()} Eka Syarif Maulana & Inka.tech. All rights reserved.*
`;

      const targetReadme = path.join(targetFolder, 'README.md');
      fs.writeFileSync(targetReadme, mdContent, 'utf8');
      console.log(`[OK] Wrote README.md to ${targetFolder}`);
    } else {
      console.warn(`[WARN] Folder not found: ${targetFolder}`);
    }
  }

  const dataDir = 'c:\\Users\\NCN0C\\Documents\\PORTOFOLIO\\src\\data';
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(dataDir, 'blogPosts.json'),
    JSON.stringify(staticBlogPosts, null, 2),
    'utf8'
  );
  console.log(`[OK] Successfully saved ${staticBlogPosts.length} posts to src/data/blogPosts.json`);

  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
