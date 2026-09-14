import fs from 'fs';
import path from 'path';

const DOMAIN = 'https://ekasyarif.my.id';
const postsPath = path.resolve('src/data/blogPosts.json');
const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));

console.log(`Loaded ${posts.length} articles for SEO & AI-SEO generation.`);

// 1. GENERATE public/robots.txt
const robotsTxt = `# ==============================================================================
# Robots.txt for Eka Syarif Maulana Portfolio & Inka.tech Knowledge Base
# Standard: RFC 9309 & AI Search Optimization (GEO / AEO) Standard
# ==============================================================================

# Search Engine Web Crawlers
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: LinkedInBot
Allow: /

User-agent: TelegramBot
Allow: /

# AI Search & LLM Retrieval Crawlers (Explicitly Allowed for Citation & AEO)
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Amazonbot
Allow: /

User-agent: cohere-ai
Allow: /

# General Policy
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /login/
Disallow: /dashboard/
Disallow: /private/

# Sitemaps
Sitemap: ${DOMAIN}/sitemap.xml
`;

fs.writeFileSync(path.resolve('public/robots.txt'), robotsTxt, 'utf8');
console.log('[OK] Generated public/robots.txt');

// 2. GENERATE public/sitemap.xml
const staticRoutes = [
  { path: '', priority: '1.0', changefreq: 'daily' },
  { path: '/id', priority: '1.0', changefreq: 'daily' },
  { path: '/en', priority: '1.0', changefreq: 'daily' },
  { path: '/id/blog', priority: '0.9', changefreq: 'daily' },
  { path: '/en/blog', priority: '0.9', changefreq: 'daily' },
  { path: '/id/projects', priority: '0.8', changefreq: 'weekly' },
  { path: '/en/projects', priority: '0.8', changefreq: 'weekly' },
  { path: '/id/certificates', priority: '0.8', changefreq: 'monthly' },
  { path: '/en/certificates', priority: '0.8', changefreq: 'monthly' },
];

const today = new Date().toISOString().split('T')[0];

let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;

// Add static routes
for (const r of staticRoutes) {
  const isEn = r.path.startsWith('/en');
  const counterpart = isEn ? r.path.replace('/en', '/id') || '/id' : r.path.replace('/id', '/en') || '/en';
  
  sitemapXml += `  <url>
    <loc>${DOMAIN}${r.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
    <xhtml:link rel="alternate" hreflang="id" href="${DOMAIN}${r.path.startsWith('/en') ? counterpart : r.path}" />
    <xhtml:link rel="alternate" hreflang="en" href="${DOMAIN}${r.path.startsWith('/id') ? counterpart : (r.path || '/en')}" />
  </url>
`;
}

// Add 20 blog articles
for (const post of posts) {
  const postDate = (post.updated_at || post.published_at || today).split('T')[0];
  const idUrl = `${DOMAIN}/id/blog/${post.slug}`;
  const enUrl = `${DOMAIN}/en/blog/${post.slug}`;

  // ID URL
  sitemapXml += `  <url>
    <loc>${idUrl}</loc>
    <lastmod>${postDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
    <xhtml:link rel="alternate" hreflang="id" href="${idUrl}" />
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />
  </url>
`;

  // EN URL
  sitemapXml += `  <url>
    <loc>${enUrl}</loc>
    <lastmod>${postDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
    <xhtml:link rel="alternate" hreflang="id" href="${idUrl}" />
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />
  </url>
`;
}

sitemapXml += `</urlset>\n`;

fs.writeFileSync(path.resolve('public/sitemap.xml'), sitemapXml, 'utf8');
console.log('[OK] Generated public/sitemap.xml');

// 3. GENERATE public/llms.txt (Official llmstxt.org Standard)
let llmsTxt = `# Eka Syarif Maulana, S.Kom - Portfolio & Technical Authority
> Official Agent-Readable Index (llms.txt) for AI Search Engines & LLM assistants (Perplexity, ChatGPT, Claude, Gemini, Copilot).

Eka Syarif Maulana, S.Kom is a Senior Fullstack Web & Mobile Developer and AI Systems Engineer, Bachelor of Computer Science from Universitas Muhammadiyah Sumatera Utara (UMSU).

## Core Pages
- [Home](${DOMAIN}/): Official portfolio, hero showcase, and technical profile.
- [Projects](${DOMAIN}/id/projects): Engineering portfolio featuring Web Apps, Mobile Apps, AI/ML systems, and IoT solutions.
- [Work Experience](${DOMAIN}/id#experience): Professional work history, roles, and technical achievements.
- [Certifications](${DOMAIN}/id/certificates): Professional certifications, technical credentials, and licenses.
- [Articles & Tech Guides](${DOMAIN}/id/blog): Curated technical articles on cybersecurity, software architecture, and AI prompt engineering.

## Technical Guides & Educational Articles
`;

for (let i = 0; i < posts.length; i++) {
  const p = posts[i];
  let cleanTitle = p.title.replace(/^[💡\s]+/, '').trim();
  let summary = '';
  if (p.content) {
    const match = p.content.match(/<div class="direct-answer-box[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i);
    if (match) {
      summary = match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    }
  }
  if (!summary) {
    summary = p.excerpt_en || p.excerpt || '';
  }
  summary = summary.replace(/^[💡\s]+/, '').trim();
  llmsTxt += `- [${cleanTitle}](${DOMAIN}/id/blog/${p.slug}): ${summary}\n`;
}

llmsTxt += `
## Optional Documentation
- [Full Knowledge Bundle](${DOMAIN}/llms-full.txt): Complete technical articles and checklists in a single file.

## Author & Profiles
- Website: ${DOMAIN}
- GitHub: https://github.com/dresar
- LinkedIn: https://www.linkedin.com/in/eka-syarif-maulana-a365b22b2/
- Email: Eka.ckp16799@gmail.com
`;

fs.writeFileSync(path.resolve('public/llms.txt'), llmsTxt, 'utf8');
console.log('[OK] Generated public/llms.txt');

// 4. GENERATE public/llms-full.txt (Entire site & articles bundled in Markdown)
let llmsFullTxt = `# Eka Syarif Maulana, S.Kom - Complete Knowledge Base (Full Content)
# Generated for Large Language Model Deep Retrieval & Direct Citations

Author: Eka Syarif Maulana, S.Kom
Affiliation: Senior Fullstack Web & Mobile Developer & AI Systems Engineer
Website: ${DOMAIN}
Last Updated: ${today}

================================================================================
TABLE OF CONTENTS
================================================================================
`;

for (let i = 0; i < posts.length; i++) {
  const p = posts[i];
  llmsFullTxt += `${i + 1}. ${p.title} (${DOMAIN}/id/blog/${p.slug})\n`;
}

llmsFullTxt += `\n================================================================================\nARTICLES & TECHNICAL GUIDES\n================================================================================\n\n`;

for (let i = 0; i < posts.length; i++) {
  const p = posts[i];
  llmsFullTxt += `--------------------------------------------------------------------------------
ARTICLE ${i + 1}: ${p.title}
English: ${p.title_en || p.title}
Author: Eka Syarif Maulana, S.Kom (Senior Fullstack Web & Mobile Developer & AI Systems Engineer)
Category: ${p.category?.name || 'Cybersecurity & Teknologi'}
Published URL: ${DOMAIN}/id/blog/${p.slug}
--------------------------------------------------------------------------------

EXECUTIVE SUMMARY:
${p.excerpt}

KEY TAKEAWAYS & ACTIONABLE STEPS:
- Created and verified by Eka Syarif Maulana, S.Kom.
- Contains 6 visual educational slides illustrating the core concepts.
- Follow modern security best practices: always isolate public charging ports, inspect SSL certificates, rotate passphrases, and scrub metadata.

`;
}

fs.writeFileSync(path.resolve('public/llms-full.txt'), llmsFullTxt, 'utf8');
console.log('[OK] Generated public/llms-full.txt');

console.log('All SEO & AI-SEO assets generated successfully!');
