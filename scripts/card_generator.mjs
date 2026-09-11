import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

export function createProjectSvg({ title, categoryName, categorySlug, tech, tagline, accentColor }) {
  const trimmedTitle = (title || 'Project').trim();
  const displayTitle = trimmedTitle.length > 36 ? trimmedTitle.slice(0, 36).trim() + '...' : trimmedTitle;
  const safeTitle = displayTitle
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  
  const trimmedTagline = (tagline || '').trim();
  const displayTagline = trimmedTagline.length > 90 ? trimmedTagline.slice(0, 90).trim() + '...' : trimmedTagline;
  const safeTagline = displayTagline
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const safeCategory = (categoryName || 'Web App')
    .toUpperCase()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const primaryColor = accentColor || (
    categorySlug === 'ai-ml' ? '#10b981' :
    categorySlug === 'automation-bots' ? '#f59e0b' :
    categorySlug === 'backend-apis' ? '#6366f1' :
    categorySlug === 'iot-hardware' ? '#ec4899' :
    categorySlug === 'mobile-app' ? '#8b5cf6' :
    categorySlug === 'ui-ux' ? '#06b6d4' : '#3b82f6'
  );

  const techBadges = (tech || []).slice(0, 5).map((t, i) => {
    const x = 64 + (i * 125);
    const safeT = t.replace(/&/g, '&amp;');
    return `
      <rect x="${x}" y="560" width="112" height="34" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1"/>
      <text x="${x + 56}" y="582" fill="#e2e8f0" font-size="13" font-weight="600" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" text-anchor="middle">${safeT}</text>
    `;
  }).join('');

  return `
  <svg width="1200" height="675" viewBox="0 0 1200 675" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#090d16"/>
        <stop offset="50%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#030712"/>
      </linearGradient>
      <linearGradient id="accentGlow" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${primaryColor}" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.05"/>
      </linearGradient>
      <radialGradient id="cornerGlow" cx="90%" cy="15%" r="40%">
        <stop offset="0%" stop-color="${primaryColor}" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" stroke-width="0.75" stroke-opacity="0.6"/>
      </pattern>
    </defs>

    <!-- Background Base -->
    <rect width="1200" height="675" fill="url(#bgGradient)"/>
    <rect width="1200" height="675" fill="url(#grid)"/>
    <circle cx="1050" cy="150" r="350" fill="url(#cornerGlow)"/>

    <!-- Main Container Window Frame -->
    <rect x="40" y="40" width="1120" height="595" rx="20" fill="#0b1120" fill-opacity="0.9" stroke="#1e293b" stroke-width="2"/>

    <!-- Browser Header Bar -->
    <rect x="40" y="40" width="1120" height="54" rx="20" fill="#0f172a"/>
    <rect x="40" y="74" width="1120" height="20" fill="#0f172a"/>
    <line x1="40" y1="94" x2="1160" y2="94" stroke="#1e293b" stroke-width="1.5"/>

    <!-- Window Dots -->
    <circle cx="70" cy="67" r="6" fill="#ef4444"/>
    <circle cx="92" cy="67" r="6" fill="#f59e0b"/>
    <circle cx="114" cy="67" r="6" fill="#10b981"/>

    <!-- Address Bar Pill -->
    <rect x="150" y="52" width="340" height="28" rx="7" fill="#1e293b" stroke="#334155" stroke-width="1"/>
    <circle cx="168" cy="66" r="3.5" fill="${primaryColor}"/>
    <text x="184" y="71" fill="#94a3b8" font-size="12" font-family="-apple-system, sans-serif">ekasyarif.my.id/projects/${categorySlug}</text>

    <!-- Category Pill -->
    <rect x="64" y="130" width="200" height="32" rx="16" fill="${primaryColor}" fill-opacity="0.15" stroke="${primaryColor}" stroke-opacity="0.4" stroke-width="1"/>
    <text x="164" y="151" fill="${primaryColor}" font-size="13" font-weight="700" font-family="-apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">${safeCategory}</text>

    <!-- Title & Description -->
    <text x="64" y="225" fill="#ffffff" font-size="38" font-weight="800" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
      ${safeTitle}
    </text>
    <text x="64" y="275" fill="#94a3b8" font-size="18" font-family="-apple-system, sans-serif" font-weight="400">
      ${safeTagline}
    </text>

    <!-- Decorative Metric / Showcase Cards Inside Frame -->
    <g transform="translate(680, 130)">
      <!-- Inner Showcase Card 1 -->
      <rect x="0" y="0" width="440" height="420" rx="16" fill="#131d33" stroke="#233554" stroke-width="1.5"/>
      <rect x="24" y="24" width="392" height="44" rx="8" fill="#1b2845"/>
      <circle cx="48" cy="46" r="5" fill="${primaryColor}"/>
      <text x="66" y="51" fill="#f8fafc" font-size="14" font-weight="700" font-family="-apple-system, sans-serif">System Architecture &amp; Metrics</text>
      
      <!-- Metrics Boxes -->
      <rect x="24" y="88" width="186" height="85" rx="10" fill="#0f172a" stroke="#1e293b" stroke-width="1"/>
      <text x="40" y="115" fill="#64748b" font-size="12" font-family="-apple-system, sans-serif">STATUS</text>
      <text x="40" y="145" fill="#10b981" font-size="18" font-weight="700" font-family="-apple-system, sans-serif">Active • Verified</text>

      <rect x="230" y="88" width="186" height="85" rx="10" fill="#0f172a" stroke="#1e293b" stroke-width="1"/>
      <text x="246" y="115" fill="#64748b" font-size="12" font-family="-apple-system, sans-serif">PERFORMANCE</text>
      <text x="246" y="145" fill="${primaryColor}" font-size="18" font-weight="700" font-family="-apple-system, sans-serif">Ultra Low Latency</text>

      <!-- Code / Visual snippet preview -->
      <rect x="24" y="193" width="392" height="195" rx="10" fill="#0b1120" stroke="#1e293b" stroke-width="1"/>
      <text x="44" y="225" fill="#38bdf8" font-size="13" font-family="monospace">// Core Engine Configuration</text>
      <text x="44" y="255" fill="#e2e8f0" font-size="13" font-family="monospace">deploy({</text>
      <text x="64" y="285" fill="#94a3b8" font-size="13" font-family="monospace">  target: <tspan fill="#f59e0b">"Edge Network"</tspan>,</text>
      <text x="64" y="315" fill="#94a3b8" font-size="13" font-family="monospace">  cdn: <tspan fill="#10b981">"jsDelivr Global"</tspan>,</text>
      <text x="64" y="345" fill="#94a3b8" font-size="13" font-family="monospace">  status: <tspan fill="${primaryColor}">"100% Production Ready"</tspan></text>
      <text x="44" y="375" fill="#e2e8f0" font-size="13" font-family="monospace">});</text>
    </g>

    <!-- Tech Stack Label & Badges -->
    <text x="64" y="535" fill="#64748b" font-size="12" font-weight="700" font-family="-apple-system, sans-serif" letter-spacing="1">BUILT WITH</text>
    ${techBadges}
  </svg>
  `;
}

export async function renderAndSaveCard({ svgContent, outputPath }) {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const pngBuffer = await sharp(Buffer.from(svgContent)).png({ quality: 90, compressionLevel: 8 }).toBuffer();
  fs.writeFileSync(outputPath, pngBuffer);
  return pngBuffer;
}
