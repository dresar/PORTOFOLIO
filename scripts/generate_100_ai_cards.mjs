import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import pg from 'pg';

const DATABASE_URL = 'postgresql://neondb_owner:npg_4IsokTFSh0Gf@ep-lucky-meadow-a93qe14n-pooler.gwc.azure.neon.tech/neondb?sslmode=require';

const CATEGORY_CONFIG = {
  'ai-ml': {
    color: '#10b981',
    bgBadge: 'rgba(16, 185, 129, 0.15)',
    metric: 'AI Model Inference < 50ms',
    assets: ['ai-ml-1.jpg', 'ai-ml-2.jpg', 'ai-ml-3.jpg', 'ai-ml-4.jpg', 'ai-ml-5.jpg', 'flux-ai-copilot.jpg']
  },
  'automation-bots': {
    color: '#f59e0b',
    bgBadge: 'rgba(245, 158, 11, 0.15)',
    metric: 'Autonomous Webhooks • 24/7',
    assets: ['automation-1.jpg', 'automation-2.jpg', 'automation-3.jpg', 'automation-4.jpg', 'automation-5.jpg', 'flux-automation-n8n.jpg']
  },
  'backend-apis': {
    color: '#6366f1',
    bgBadge: 'rgba(99, 102, 241, 0.15)',
    metric: 'High Throughput • REST/SQL',
    assets: ['backend-1.jpg', 'backend-2.jpg', 'backend-3.jpg', 'backend-4.jpg', 'backend-5.jpg']
  },
  'iot-hardware': {
    color: '#ec4899',
    bgBadge: 'rgba(236, 72, 153, 0.15)',
    metric: 'Real-time Telemetry • ESP32',
    assets: ['iot-1.jpg', 'iot-2.jpg', 'iot-3.jpg', 'iot-4.jpg', 'flux-iot-circuit.jpg']
  },
  'mobile-app': {
    color: '#8b5cf6',
    bgBadge: 'rgba(139, 92, 246, 0.15)',
    metric: '60 FPS Smooth UI • Native',
    assets: ['mobile-app-1.jpg', 'mobile-app-2.jpg', 'mobile-app-4.jpg', 'mobile-app-5.jpg', 'flux-mobile-fintech.jpg']
  },
  'ui-ux': {
    color: '#06b6d4',
    bgBadge: 'rgba(6, 182, 212, 0.15)',
    metric: 'Modern Design System • 8px Grid',
    assets: ['ui-ux-1.jpg', 'ui-ux-2.jpg', 'ui-ux-3.jpg', 'ui-ux-4.jpg']
  },
  'web-app': {
    color: '#3b82f6',
    bgBadge: 'rgba(59, 130, 246, 0.15)',
    metric: 'Edge Optimized • 99.9% Uptime',
    assets: ['web-dashboard-1.jpg', 'web-dashboard-2.jpg', 'web-dashboard-3.jpg', 'web-dashboard-4.jpg', 'web-dashboard-5.jpg', 'flux-ecommerce-pos.jpg']
  }
};

function escapeXml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function pickAsset(project, categorySlug) {
  const titleLower = (project.title || '').toLowerCase();
  const slugLower = (project.slug || '').toLowerCase();
  const cacheDir = path.resolve('scratch_hero_cache');

  // Keyword-based precision matching
  if (titleLower.includes('pos') || titleLower.includes('kios') || titleLower.includes('shoope') || titleLower.includes('toko') || titleLower.includes('kasir')) {
    return path.join(cacheDir, 'flux-ecommerce-pos.jpg');
  }
  if (titleLower.includes('esp32') || titleLower.includes('cam') || titleLower.includes('sensor') || titleLower.includes('corn') || titleLower.includes('iot')) {
    return path.join(cacheDir, 'flux-iot-circuit.jpg');
  }
  if (titleLower.includes('n8n') || titleLower.includes('workflow') || titleLower.includes('automation')) {
    return path.join(cacheDir, 'flux-automation-n8n.jpg');
  }
  if (titleLower.includes('copilot') || titleLower.includes('prompt') || titleLower.includes('gemini') || titleLower.includes('poster prompt')) {
    return path.join(cacheDir, 'flux-ai-copilot.jpg');
  }
  if (titleLower.includes('flutter') || titleLower.includes('mobile') || titleLower.includes('wallet') || slugLower.includes('dana')) {
    return path.join(cacheDir, 'flux-mobile-fintech.jpg');
  }
  if (titleLower.includes('analytics') || titleLower.includes('stream') || titleLower.includes('monitoring') || titleLower.includes('report')) {
    return path.join(cacheDir, 'web-dashboard-1.jpg');
  }

  // Fallback to category asset pool rotated by project ID
  const conf = CATEGORY_CONFIG[categorySlug] || CATEGORY_CONFIG['web-app'];
  const assetList = conf.assets;
  const chosenName = assetList[project.id % assetList.length];
  return path.join(cacheDir, chosenName);
}

export function buildOverlaySvg({ title, categoryName, categorySlug, techList }) {
  const conf = CATEGORY_CONFIG[categorySlug] || CATEGORY_CONFIG['web-app'];
  const color = conf.color;
  const metric = conf.metric;

  const safeCategory = escapeXml(categoryName.toUpperCase());
  
  const trimmedTitle = (title || 'Project').trim();
  const displayTitle = trimmedTitle.length > 42 ? trimmedTitle.slice(0, 42).trim() + '...' : trimmedTitle;
  const safeTitle = escapeXml(displayTitle);

  const badges = (techList || []).slice(0, 5).map((t, i) => {
    const x = 32 + (i * 122);
    const safeT = escapeXml(t);
    return `
      <rect x="${x}" y="594" width="112" height="32" rx="8" fill="#0f172a" fill-opacity="0.9" stroke="#334155" stroke-width="1"/>
      <text x="${x + 56}" y="615" fill="#e2e8f0" font-size="12" font-weight="600" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">${safeT}</text>
    `;
  }).join('');

  return Buffer.from(`
    <svg width="1200" height="675" viewBox="0 0 1200 675" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="topVignette" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#020617" stop-opacity="0.95"/>
          <stop offset="60%" stop-color="#020617" stop-opacity="0.55"/>
          <stop offset="100%" stop-color="#020617" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="bottomVignette" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#020617" stop-opacity="0"/>
          <stop offset="25%" stop-color="#020617" stop-opacity="0.75"/>
          <stop offset="100%" stop-color="#020617" stop-opacity="0.98"/>
        </linearGradient>
      </defs>

      <!-- Top Vignette & Mac Window Chrome -->
      <rect width="1200" height="110" fill="url(#topVignette)"/>
      
      <!-- Mac Window Dots -->
      <circle cx="36" cy="30" r="6" fill="#ef4444"/>
      <circle cx="56" cy="30" r="6" fill="#f59e0b"/>
      <circle cx="76" cy="30" r="6" fill="#10b981"/>
      
      <!-- Address Bar -->
      <rect x="110" y="16" width="300" height="28" rx="8" fill="#1e293b" fill-opacity="0.8" stroke="#334155" stroke-width="1"/>
      <circle cx="126" cy="30" r="3.5" fill="${color}"/>
      <text x="140" y="35" fill="#94a3b8" font-size="12" font-family="system-ui, sans-serif">ekasyarif.my.id/projects/${categorySlug}</text>

      <!-- Live Verified Badge -->
      <rect x="1030" y="16" width="138" height="28" rx="8" fill="#10b981" fill-opacity="0.15" stroke="#10b981" stroke-width="1"/>
      <circle cx="1048" cy="30" r="4" fill="#10b981"/>
      <text x="1114" y="35" fill="#34d399" font-size="12" font-weight="700" font-family="system-ui, sans-serif" text-anchor="middle">LIVE VERIFIED</text>

      <!-- Bottom Gradient & Floating Frosted Card -->
      <rect y="430" width="1200" height="245" fill="url(#bottomVignette)"/>

      <rect x="24" y="475" width="1152" height="175" rx="16" fill="#090d16" fill-opacity="0.88" stroke="#1e293b" stroke-width="1.5"/>
      
      <!-- Category Pill -->
      <rect x="44" y="495" width="210" height="26" rx="13" fill="${color}" fill-opacity="0.18" stroke="${color}" stroke-width="1"/>
      <text x="149" y="513" fill="${color}" font-size="11" font-weight="800" font-family="system-ui, sans-serif" text-anchor="middle" letter-spacing="1">${safeCategory}</text>

      <!-- Metric Badge on Right of Card -->
      <rect x="910" y="495" width="242" height="26" rx="8" fill="#1e293b" fill-opacity="0.8" stroke="#334155" stroke-width="1"/>
      <text x="1031" y="513" fill="#94a3b8" font-size="11" font-weight="600" font-family="system-ui, sans-serif" text-anchor="middle">⚡ ${escapeXml(metric)}</text>

      <!-- Project Title -->
      <text x="44" y="560" fill="#ffffff" font-size="30" font-weight="800" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">${safeTitle}</text>
      
      <!-- Tech Badges -->
      <g transform="translate(12, -22)">
        ${badges}
      </g>
    </svg>
  `);
}

async function renderCard(project, categoryName, categorySlug, techList, outputPath) {
  const assetPath = pickAsset(project, categorySlug);
  if (!fs.existsSync(assetPath)) {
    throw new Error(`Asset not found: ${assetPath}`);
  }

  const baseBuf = fs.readFileSync(assetPath);
  const overlaySvg = buildOverlaySvg({
    title: project.title,
    categoryName,
    categorySlug,
    techList
  });

  await sharp(baseBuf)
    .resize(1200, 675, { fit: 'cover' })
    .composite([{ input: overlaySvg, top: 0, left: 0 }])
    .png({ quality: 90, compressionLevel: 8 })
    .toFile(outputPath);
}

async function main() {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();

  const categoriesRes = await client.query('SELECT id, name, slug FROM project_category');
  const catMap = new Map();
  categoriesRes.rows.forEach(c => catMap.set(c.id, c));

  const projectsRes = await client.query('SELECT id, title, slug, "categoryId", tech, "coverImage" FROM project WHERE "coverImage" LIKE \'%uploads/projects%\' ORDER BY id ASC');
  const projects = projectsRes.rows;
  console.log(`🚀 Memproses generasi ${projects.length} project cards dengan visual AI/HD nyata...`);

  const outDir = path.resolve('public/uploads/projects');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  let completed = 0;
  const start = Date.now();

  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];
    const cat = catMap.get(p.categoryId) || { name: 'Web App', slug: 'web-app' };
    const tech = typeof p.tech === 'string' ? JSON.parse(p.tech) : (p.tech || []);
    
    const filename = `${p.slug}-preview.png`;
    const targetPath = path.join(outDir, filename);

    try {
      await renderCard(p, cat.name, cat.slug, tech, targetPath);
      completed++;
      if ((i + 1) % 10 === 0 || i === projects.length - 1) {
        const elapsed = ((Date.now() - start) / 1000).toFixed(1);
        console.log(`[✓] ${i + 1}/${projects.length} cards selesai (${elapsed}s) -> ${p.title.slice(0, 35)}...`);
      }
    } catch (err) {
      console.error(`[X] Error on ${p.slug}:`, err.message);
    }
  }

  const totalTime = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n🎉 Selesai! Berhasil meng-generate ${completed}/${projects.length} realistic AI project visuals dalam ${totalTime} detik!`);
  await client.end();
}

main().catch(console.error);
