import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const HERO_ASSETS = [
  // Web Dashboards & SaaS
  { key: 'web-dashboard-1', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1280&h=720&fit=crop&q=85' },
  { key: 'web-dashboard-2', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1280&h=720&fit=crop&q=85' },
  { key: 'web-dashboard-3', url: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1280&h=720&fit=crop&q=85' },
  { key: 'web-dashboard-4', url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1280&h=720&fit=crop&q=85' },
  { key: 'web-dashboard-5', url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1280&h=720&fit=crop&q=85' },

  // Mobile Apps
  { key: 'mobile-app-1', url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1280&h=720&fit=crop&q=85' },
  { key: 'mobile-app-2', url: 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=1280&h=720&fit=crop&q=85' },
  { key: 'mobile-app-3', url: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=1280&h=720&fit=crop&q=85' },
  { key: 'mobile-app-4', url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1280&h=720&fit=crop&q=85' },
  { key: 'mobile-app-5', url: 'https://images.unsplash.com/photo-1522199755839-a2bacb67c546?w=1280&h=720&fit=crop&q=85' },

  // AI & Machine Learning
  { key: 'ai-ml-1', url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1280&h=720&fit=crop&q=85' },
  { key: 'ai-ml-2', url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1280&h=720&fit=crop&q=85' },
  { key: 'ai-ml-3', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1280&h=720&fit=crop&q=85' },
  { key: 'ai-ml-4', url: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=1280&h=720&fit=crop&q=85' },
  { key: 'ai-ml-5', url: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=1280&h=720&fit=crop&q=85' },

  // Automation & Bots
  { key: 'automation-1', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1280&h=720&fit=crop&q=85' },
  { key: 'automation-2', url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1280&h=720&fit=crop&q=85' },
  { key: 'automation-3', url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1280&h=720&fit=crop&q=85' },
  { key: 'automation-4', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1280&h=720&fit=crop&q=85' },
  { key: 'automation-5', url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1280&h=720&fit=crop&q=85' },

  // Backend & APIs
  { key: 'backend-1', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1280&h=720&fit=crop&q=85' },
  { key: 'backend-2', url: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=1280&h=720&fit=crop&q=85' },
  { key: 'backend-3', url: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=1280&h=720&fit=crop&q=85' },
  { key: 'backend-4', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1280&h=720&fit=crop&q=85' },
  { key: 'backend-5', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1280&h=720&fit=crop&q=85' },

  // IoT & Hardware
  { key: 'iot-1', url: 'https://images.unsplash.com/photo-1517055729445-fa7d27394b48?w=1280&h=720&fit=crop&q=85' },
  { key: 'iot-2', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1280&h=720&fit=crop&q=85' },
  { key: 'iot-3', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1280&h=720&fit=crop&q=85' },
  { key: 'iot-4', url: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=1280&h=720&fit=crop&q=85' },

  // UI/UX Design
  { key: 'ui-ux-1', url: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=1280&h=720&fit=crop&q=85' },
  { key: 'ui-ux-2', url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1280&h=720&fit=crop&q=85' },
  { key: 'ui-ux-3', url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1280&h=720&fit=crop&q=85' },
  { key: 'ui-ux-4', url: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?w=1280&h=720&fit=crop&q=85' }
];

async function main() {
  const cacheDir = path.resolve('scratch_hero_cache');
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

  console.log(`Downloading and caching ${HERO_ASSETS.length} high-definition hero assets...`);
  
  let success = 0;
  for (let i = 0; i < HERO_ASSETS.length; i++) {
    const item = HERO_ASSETS[i];
    const targetFile = path.join(cacheDir, `${item.key}.jpg`);
    if (fs.existsSync(targetFile) && fs.statSync(targetFile).size > 10000) {
      success++;
      continue;
    }
    try {
      const res = await fetch(item.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      // Standardize size to 1280x720
      await sharp(buf)
        .resize(1280, 720, { fit: 'cover' })
        .jpeg({ quality: 88 })
        .toFile(targetFile);
      success++;
      process.stdout.write(`[✓] ${item.key} (${i + 1}/${HERO_ASSETS.length})\n`);
    } catch (err) {
      console.warn(`[!] Failed ${item.key}:`, err.message);
    }
  }

  // Also copy any existing Flux AI generation from scratch_ai_cache
  const fluxDir = path.resolve('scratch_ai_cache');
  if (fs.existsSync(fluxDir)) {
    const files = fs.readdirSync(fluxDir);
    for (const f of files) {
      if (f.endsWith('.png')) {
        const dest = path.join(cacheDir, `flux-${f.replace('.png', '.jpg')}`);
        await sharp(path.join(fluxDir, f)).jpeg({ quality: 90 }).toFile(dest);
        console.log(`[✓] Included Flux AI: flux-${f}`);
      }
    }
  }

  console.log(`\n🎉 Cached ${success} high-resolution visual assets!`);
}

main().catch(console.error);
