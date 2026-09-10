import fs from 'fs';
import path from 'path';

const posts = JSON.parse(fs.readFileSync('src/data/blogPosts.json', 'utf8'));
const articlesDir = path.resolve('public/uploads/articles');

posts.forEach((post) => {
  const targetDir = path.join(articlesDir, post.slug);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

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

${post.content}
`;

  fs.writeFileSync(path.join(targetDir, `${post.slug}.md`), mdContent, 'utf8');
  fs.writeFileSync(path.join(targetDir, 'README.md'), mdContent, 'utf8');
});

console.log(`Synchronized all ${posts.length} markdown files successfully!`);
