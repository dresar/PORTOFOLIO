export interface ThumbnailProjectInput {
  id?: number | string;
  title: string;
  description?: string;
  categoryName?: string;
  tech?: string[] | string;
  coverImage?: string | null;
  gallery?: string[] | string | null;
  repoUrl?: string | null;
  demoUrl?: string | null;
}

export function generateThumbnailMegaPrompt(project: ThumbnailProjectInput): string {
  const title = project.title?.trim() || 'Portfolio Project';
  const description = project.description?.trim() || 'Sistem Informasi dan Aplikasi Web Modern Berperforma Tinggi';
  const categoryName = project.categoryName?.trim() || 'Full-Stack Web Application';

  let techList: string[] = [];
  if (Array.isArray(project.tech)) {
    techList = project.tech;
  } else if (typeof project.tech === 'string') {
    try {
      const parsed = JSON.parse(project.tech);
      if (Array.isArray(parsed)) techList = parsed;
      else techList = project.tech.split(',').map(s => s.trim());
    } catch {
      techList = project.tech.split(',').map(s => s.trim());
    }
  }
  if (techList.length === 0) {
    techList = ['React 19', 'TypeScript', 'Tailwind CSS', 'PostgreSQL Neon', 'Vite'];
  }

  const mediaUrls: string[] = [];
  if (project.coverImage) mediaUrls.push(project.coverImage);

  if (Array.isArray(project.gallery)) {
    project.gallery.forEach(item => {
      const u = typeof item === 'string' ? item : (item as any)?.url;
      if (u && !mediaUrls.includes(u)) mediaUrls.push(u);
    });
  } else if (typeof project.gallery === 'string') {
    try {
      const parsedG = JSON.parse(project.gallery);
      if (Array.isArray(parsedG)) {
        parsedG.forEach((item: any) => {
          const u = typeof item === 'string' ? item : item?.url;
          if (u && !mediaUrls.includes(u)) mediaUrls.push(u);
        });
      }
    } catch {}
  }

  const combinedContext = `${title} ${description} ${categoryName} ${techList.join(' ')}`.toLowerCase();

  let primaryColorName = 'Modern Obsidian Slate';
  let primaryHex = '#0B0F19';
  let accentColorName = 'Electric Cyan, Vibrant Indigo & Cobalt';
  let accentHex = '#06B6D4';
  let accentSecondaryHex = '#4F46E5';
  let accentTertiaryHex = '#3B82F6';
  let domainArchetype = 'Modern Cloud Web Application';
  let metricLabel = 'Efisiensi Alur Kerja';
  let metricValue = '+92%';
  let featureBadge = '100% Automasi Cloud & Real-Time Sync';
  let bgAmbientDesc = 'Luminous electric cyan, vibrant cobalt blue, and soft lavender chromatic gradient mesh smoothly diffusing across the bright studio backdrop';

  if (/pesantren|santri|rapor|alma|sira|islamic|pondok|madrasah/i.test(combinedContext)) {
    primaryColorName = 'Deep Islamic Emerald Charcoal';
    primaryHex = '#06281E';
    accentColorName = 'Vibrant Jade Emerald & Radiant Amber Gold';
    accentHex = '#10B981';
    accentSecondaryHex = '#059669';
    accentTertiaryHex = '#F59E0B';
    domainArchetype = 'Sistem Informasi Akademik & Pesantren Terpadu';
    metricLabel = 'Akurasi Rekap Santri';
    metricValue = '99.8%';
    featureBadge = 'Manajemen Santri & Rapor Digital Terpadu';
    bgAmbientDesc = 'Lush emerald green, radiant jade teal, and soft warm golden amber ambient mesh glowing organically across the bright studio background';
  } else if (/pajak|brevet|tax|finance|dana|donasi|keuangan|payment/i.test(combinedContext)) {
    primaryColorName = 'Deep Financial Obsidian';
    primaryHex = '#0B0F19';
    accentColorName = 'Vibrant Emerald Jade, Radiant Cyan & Sapphire Blue';
    accentHex = '#10B981';
    accentSecondaryHex = '#06B6D4';
    accentTertiaryHex = '#2563EB';
    domainArchetype = 'Platform Pembelajaran & Perpajakan Digital';
    metricLabel = 'Kecepatan Hitung Pajak';
    metricValue = '+94%';
    featureBadge = '100+ Kasus Praktik & AI Tax Assistant';
    bgAmbientDesc = 'Lush emerald green, radiant turquoise cyan, and soft royal sapphire blue gradient mesh glowing vibrantly across the bright illuminated studio background';
  } else if (/pertamina|oil|gas|monitoring|telemetry|iot|sensor|factory|industrial/i.test(combinedContext)) {
    primaryColorName = 'Industrial Obsidian Navy';
    primaryHex = '#0A1128';
    accentColorName = 'Pertamina Signal Crimson, Royal Cobalt & Electric Sky';
    accentHex = '#DC2626';
    accentSecondaryHex = '#2563EB';
    accentTertiaryHex = '#38BDF8';
    domainArchetype = 'Sistem Monitoring & Arsip Digital Industri';
    metricLabel = 'Uptime Monitoring';
    metricValue = '99.99%';
    featureBadge = 'Telemetri Real-Time & Arsip Digital Terpadu';
    bgAmbientDesc = 'Dynamic industrial royal cobalt blue, electric cyan, and warm energy crimson gradient aura diffusing across the bright studio background';
  } else if (/wedding|undangan|invitation|cinta|nikah/i.test(combinedContext)) {
    primaryColorName = 'Rich Champagne Noir';
    primaryHex = '#140E14';
    accentColorName = 'Warm Champagne Gold, Rose Quartz & Coral';
    accentHex = '#D97706';
    accentSecondaryHex = '#E11D48';
    accentTertiaryHex = '#F43F5E';
    domainArchetype = 'Platform Undangan Pernikahan Digital Elegan';
    metricLabel = 'Tingkat Konfirmasi RSVP';
    metricValue = '98.5%';
    featureBadge = 'Musik Otomatis & Amplop Digital Terintegrasi';
    bgAmbientDesc = 'Lush champagne gold, soft rose quartz, and radiant peach aurora gradient mesh illuminating the bright studio backdrop with warm luxury';
  } else if (/shoope|ecommerce|shop|toko|marketplace|pos|kasir/i.test(combinedContext)) {
    primaryColorName = 'Modern Charcoal Obsidian';
    primaryHex = '#121216';
    accentColorName = 'Vibrant Sunset Tangerine, Electric Coral & Violet';
    accentHex = '#EA580C';
    accentSecondaryHex = '#F97316';
    accentTertiaryHex = '#8B5CF6';
    domainArchetype = 'Multi-Vendor E-Commerce & Marketplace Platform';
    metricLabel = 'Kecepatan Transaksi';
    metricValue = '0.3s';
    featureBadge = 'Payment Gateway & Manajemen Stok Multi-Cabang';
    bgAmbientDesc = 'Vibrant sunset tangerine, electric coral, and soft purple ambient backlight creating warm modern energy in the bright studio';
  } else if (/ai|agent|prompt|gpt|llm|workflow|machine learning/i.test(combinedContext)) {
    primaryColorName = 'Cosmic Obsidian Slate';
    primaryHex = '#0B0F19';
    accentColorName = 'Electric Violet, Neon Cyan & Sapphire Indigo';
    accentHex = '#7C3AED';
    accentSecondaryHex = '#06B6D4';
    accentTertiaryHex = '#3B82F6';
    domainArchetype = 'AI Workflow & Prompt Engineering Studio';
    metricLabel = 'Akurasi Inferensi AI';
    metricValue = '99.4%';
    featureBadge = 'Multi-Agent Orchestration & Smart Pipelines';
    bgAmbientDesc = 'Futuristic electric violet, deep indigo, and luminous cyan aurora mesh gradient softly diffusing behind the showcase stage in the bright studio';
  }

  const techFormatted = techList.slice(0, 5).join(' • ');

  const cleanDescription = description.length > 95 
    ? description.slice(0, 92) + '...' 
    : description;

  const prompt = `Create image: A world-class, ultra-premium 16:9 widescreen showcase photograph and portfolio presentation graphic with EXTRA-LARGE BOLD TYPOGRAPHY and HIGH-CONTRAST AESTHETICS for the Indonesian web application titled "${title}".

================================================================================
[SECTION 1: HIGH-IMPACT THUMBNAIL PHILOSOPHY — LARGE BOLD TEXT OVER TINY DETAILS]
================================================================================
You are commanded to act as a World-Class Executive Creative Director and Lead Product Art Director (at the caliber of Apple Keynote, Stripe, Linear, and Vercel).
CRITICAL THUMBNAIL DESIGN DIRECTIVE (ANTI-CLUTTER & ANTI-TINY-TEXT):
- STRICT PROHIBITION OF TINY UNREADABLE UI TABLES: Under NO circumstances should you render tiny, dense dashboard tables, microscopic spreadsheet rows, tiny sidebars with 10 menu items, or illegible micro-text. In a thumbnail, tiny UI details look like blurry clutter.
- MANDATORY LARGE BOLD TYPOGRAPHY: This thumbnail MUST be instantly readable, commanding, and magnetic when viewed as a thumbnail card on mobile or desktop screens:
  1. MASSIVE COMMANDING DISPLAY TITLE: Render the project name "${title}" in EXTRA-LARGE, ULTRA-BOLD modern geometric sans-serif typography (occupying the upper-central focal point of the showcase). It must be huge, razor-sharp, and legible from across the room.
  2. BOLD INDONESIAN CATEGORY KICKER: A large, eye-catching badge positioned directly above or beside the title: "✦ ${categoryName.toUpperCase()}".
  3. PROMINENT VALUE PROPOSITION: Large, crisp, perfectly readable Indonesian subtitle copy in clean slate/white: "${cleanDescription}".
  4. LARGE FEATURE HIGHLIGHT CHIP: A bold interactive pill in ${accentHex} showing "✓ ${featureBadge}".
  5. PROMINENT BOTTOM BRANDING DOCK: An unmistakable, large floating pill dock centered at the bottom margin:
     [GitHub Logo] dresar  •  Eka Syarif Maulana  •  [Instagram Logo] @arif_ex21

================================================================================
[SECTION 2: BRIGHT VIBRANT STUDIO BACKGROUND vs HIGH-CONTRAST SLEEK SHOWCASE]
================================================================================
The user explicitly demands that the BRIGHT THEME belongs to the BACKGROUND ATMOSPHERE, while the inner showcase container boasts HIGH CONTRAST for maximum punch and legibility:
1. BRIGHT LUMINOUS STUDIO BACKGROUND (Latar Belakang Terang & Berwarna Hidup):
   - The overall studio environment is bright, airy, and luminous with diffused daylight illumination.
   - Infused with a rich, vibrant multi-tone chromatic gradient mesh and organic aurora backlighting: ${bgAmbientDesc}.
   - Soft, organic pools of vibrant glowing light in ${accentHex} and ${accentSecondaryHex} radiate outward, creating colorful atmospheric depth.
   - Architectural Detail: In the far background, render a delicate, faint isometric dot-matrix pattern (micro-dots at 4% opacity) and 2 to 3 out-of-focus translucent frosted glass geometric spheres/prisms that catch and refract the colorful ambient backlight.
2. HIGH-CONTRAST SLEEK HERO SHOWCASE CONTAINER (Isi Dalam Kontras Tinggi & Tajam):
   - Floating prominently in the center of the bright colorful studio is a magnificent, sleek modern showcase window/card crafted in deep obsidian slate (${primaryHex}) with smooth glass reflections and a glowing 2px colored neon rim in ${accentHex}.
   - Because the background is bright and colorful, this deep high-contrast showcase window pops forward with incredible 3D punch, dramatic presence, and razor-sharp clarity!
   - All large white and neon text printed inside this showcase stands out with breathtaking 4K contrast and zero eye fatigue.

================================================================================
[SECTION 3: STRICT VERTICAL FRAMING & AMPLE BOTTOM CLEARANCE (ANTI-CROPPING)]
================================================================================
CRITICAL VERTICAL CANVAS ZONING (16:9 Widescreen):
- Top Zone (Y: 0% to 15%): Bright ambient background mesh, colorful soft lighting, and upper window controls.
- Central Showcase Stage (Y: 15% to 76%): The main high-contrast showcase window floats strictly within this 61% vertical zone. The bottom edge of the window MUST terminate cleanly at Y: 76%. Under no circumstances should the window extend below Y: 78%.
- Dedicated Bottom Showcase Zone (Y: 78% to 98%): A generous 22% vertical clearance reserved exclusively for the Large Floating Social Branding Dock and Tech Stack pill. This guarantees that GitHub "dresar" and Instagram "@arif_ex21" are NEVER pushed off or cropped out!

================================================================================
[SECTION 4: MANDATORY LARGE-SCALE SOCIAL BRANDING DOCK (BOTTOM CENTER)]
================================================================================
Centered horizontally at the bottom of the canvas (X: 50%, Y: 88%), floating distinctly in the clear open space beneath the showcase container:
- Form: A refined, large-format floating capsule dock (height: 48px, width: ~460px, background: rgba(11, 15, 25, 0.94), border: 1.5px solid ${accentHex}, shadow: 0 16px 36px rgba(0, 0, 0, 0.18)).
- Readable Elements from Left to Right (Rendered in LARGE, razor-sharp typography with crisp official monochrome icons):
  1. The official black/white GitHub Octocat logo followed by bold text "dresar"
  2. A vibrant centered bullet dot "•" in ${accentHex}
  3. Author name in sharp, commanding white text: "Eka Syarif Maulana"
  4. A vibrant centered bullet dot "•" in ${accentHex}
  5. The official Instagram camera glyph followed by bold text "@arif_ex21"
- Critical Mandate: This social branding dock is an un-skippable, mandatory element of the thumbnail. Every single character and icon MUST be rendered in large, clear, vector-sharp typography.

================================================================================
[SECTION 5: HIGH-IMPACT FLOATING ACCENT CARDS]
================================================================================
1. Top-Right Floating Metric Card (X: 80%, Y: 22%, Hovering Over Upper Right Corner):
   - A sleek floating card in ${primaryHex} with glowing border in ${accentHex} (0 12px 28px rgba(0,0,0,0.2)).
   - Displays a massive, bold numeric statistic in vibrant neon: "${metricValue}"
   - Accompanied by a crisp Indonesian label: "${metricLabel}" with a pulsing green indicator dot "● Terverifikasi".
2. Bottom-Left Floating Tech Stack Pill (X: 16%, Y: 74%, Hovering Over Lower Left Corner):
   - A wide, elegant frosted-glass capsule pill containing bold monochrome micro-badges:
     "${techFormatted}"

================================================================================
[SECTION 6: DIRECT DOMAIN SYNTHESIS & INDEPENDENCE FROM EXTERNAL CRAWLERS]
================================================================================
IMPORTANT DIRECTIVE ON ASSET SYNTHESIS:
External web image URLs cannot be crawled or downloaded by text-to-image AI diffusion engines during generation. Therefore, you are commanded to synthesize the authentic visual DNA of this application directly from this authoritative specification:
- Project Domain: ${domainArchetype}
- Core Color Palette: ${accentColorName} (Hero Accent: ${accentHex}, Secondary: ${accentSecondaryHex}, Foundation: ${primaryHex})
- Visual Metaphor: High-performance modern web application, clean geometric card grids, interactive simulated workflows, and real-time metric indicators.
- Graphic Focus: Bold typography, clean card hierarchy, prominent data visualization sparklines, and modern Indonesian copywriting.

================================================================================
[SECTION 7: CRITICAL ANTI-ANNOTATION & ANTI-TEXT-LEAK DIRECTIVE (STRICT)]
================================================================================
Under NO circumstances should you render diagram titles, section names, explanatory text boxes, or UI annotation labels onto the canvas:
- STRICT NEGATIVE CONSTRAINT ON TEXT LABELS:
  * Absolutely NEVER write words like "FLOATING STATUS PILL" on the background.
  * Absolutely NEVER write words like "FLOATING METRIC CARD" on the background.
  * Absolutely NEVER write words like "FLOATING TECH STACK DOCK" on the background.
  * Absolutely NEVER write words like "FLOATING SOCIAL BRANDING DOCK" on the background.
  * Absolutely NEVER write words like "Creator Name:" or "Author:" or "Window 1".
- Every widget, pill, and card must exist naturally within the scene WITHOUT any external text arrows, category captions, or wireframe title tags printed above or below them.

================================================================================
[SECTION 8: ABSOLUTE NEGATIVE CONSTRAINTS & ZERO-DEVICE MANDATE (STRICT)]
================================================================================
The user strictly enforces an absolute, non-negotiable rule forbidding all physical electronic hardware devices:
- ZERO LAPTOPS: Absolutely NO MacBook Pros, MacBook Airs, Windows laptops, keyboards, trackpads, or clamshell hinges.
- ZERO SMARTPHONES & TABLETS: Absolutely NO iPhones, Android phones, iPads, mobile bezels, screen notches, or camera cutouts.
- ZERO MONITORS & PHYSICAL COMPUTERS: Absolutely NO desktop PC monitors, iMac stands, display bezels, cables, or desk setups.
- ZERO ROOMS & DESK ACCESSORIES: Absolutely NO wooden desks, coffee mugs, potted plants, reading glasses, external mice, or physical props.
- FORM FACTOR IS PURELY FLOATING SOFTWARE CONTAINERS: Every interface element exists purely as refined, floating 2.5D software card windows with precision rounded corners, suspended weightlessly in studio space.

================================================================================
[SECTION 9: LIGHTING, RENDERING ENGINE & FINAL QUALITY CHECKLIST]
================================================================================
- Lighting Architecture: Bright studio daylight softbox with vibrant chromatic rim lighting from the background aurora mesh.
- Surface Texture: Satin matte anti-reflective finish across all surfaces; zero blown-out white glares; crisp geometric reflections.
- Depth of Field: Deep and razor-sharp depth of field (f/11 optical equivalent); every single letter, badge, graph line, and icon is in pin-sharp focus.
- Color Science: Rec.709 color gamut, high dynamic range contrast, vibrant yet balanced saturation, true sRGB fidelity.
- Final Verification Checklist:
  ✓ 1. Canvas is exactly 16:9 widescreen with a bright, luminous, colorful ambient gradient mesh background.
  ✓ 2. High-contrast sleek dark obsidian showcase container (${primaryHex}) providing massive contrast against the bright background.
  ✓ 3. Project title "${title}" is rendered in EXTRA-LARGE, ULTRA-BOLD, razor-sharp typography (NO tiny micro-text or cluttered tables).
  ✓ 4. Showcase window stops cleanly at Y: 76%, leaving a generous 22% bottom margin.
  ✓ 5. Bottom center clearly displays the large, prominent floating social branding dock with GitHub "dresar" and Instagram "@arif_ex21".
  ✓ 6. Absolutely NO laptops, NO phones, NO physical monitors.
  ✓ 7. Absolutely NO diagram labels or annotation text printed on the background.
  ✓ 8. All UI copy is in clear, correct Bahasa Indonesia.

Generate the final 16:9 high-contrast showcase thumbnail now adhering strictly to every single parameter specified above.`;

  return prompt;
}

export function countWords(str: string): number {
  if (!str) return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
}
