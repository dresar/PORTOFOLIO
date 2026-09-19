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

  let primaryColorName = 'Modern Slate Charcoal';
  let primaryHex = '#0F172A';
  let accentColorName = 'Vibrant Indigo, Electric Cyan & Cobalt';
  let accentHex = '#4F46E5';
  let accentSecondaryHex = '#06B6D4';
  let accentTertiaryHex = '#3B82F6';
  let lightAccentBg = '#EEF2FF';
  let lightAccentBorder = '#C7D2FE';
  let domainArchetype = 'Modern Cloud Web Application';
  let metricLabel = 'Efisiensi Alur Kerja';
  let metricValue = '+92%';
  let bgAmbientDesc = 'Luminous cobalt blue, electric cyan, and soft violet chromatic mesh gradient smoothly diffusing behind the floating windows';

  if (/pesantren|santri|rapor|alma|sira|islamic|pondok|madrasah/i.test(combinedContext)) {
    primaryColorName = 'Heritage Deep Emerald & Forest Pine';
    primaryHex = '#064E3B';
    accentColorName = 'Vibrant Islamic Emerald, Radiant Jade & Golden Amber';
    accentHex = '#059669';
    accentSecondaryHex = '#10B981';
    accentTertiaryHex = '#F59E0B';
    lightAccentBg = '#ECFDF5';
    lightAccentBorder = '#A7F3D0';
    domainArchetype = 'Sistem Informasi Akademik & Pesantren Terpadu';
    metricLabel = 'Akurasi Rekap Santri';
    metricValue = '99.8%';
    bgAmbientDesc = 'Rich emerald green, radiant jade teal, and soft warm amber ambient mesh glowing organically across the studio background';
  } else if (/pajak|brevet|tax|finance|dana|donasi|keuangan|payment/i.test(combinedContext)) {
    primaryColorName = 'Trustworthy Deep Slate & Navy';
    primaryHex = '#0F172A';
    accentColorName = 'Vibrant Emerald Jade, Radiant Cyan & Electric Blue';
    accentHex = '#059669';
    accentSecondaryHex = '#06B6D4';
    accentTertiaryHex = '#2563EB';
    lightAccentBg = '#F0FDFA';
    lightAccentBorder = '#99F6E4';
    domainArchetype = 'Platform Finansial & Perpajakan Digital';
    metricLabel = 'Kecepatan Hitung Pajak';
    metricValue = '+94%';
    bgAmbientDesc = 'Lush emerald green, radiant turquoise cyan, and soft royal sapphire blue gradient mesh glowing vibrantly behind the floating windows';
  } else if (/pertamina|oil|gas|monitoring|telemetry|iot|sensor|factory|industrial/i.test(combinedContext)) {
    primaryColorName = 'Industrial Sapphire Blue';
    primaryHex = '#1E3A8A';
    accentColorName = 'Pertamina Signal Crimson, Royal Cobalt & Cyan';
    accentHex = '#DC2626';
    accentSecondaryHex = '#2563EB';
    accentTertiaryHex = '#38BDF8';
    lightAccentBg = '#EFF6FF';
    lightAccentBorder = '#BFDBFE';
    domainArchetype = 'Sistem Monitoring & Arsip Digital Industri';
    metricLabel = 'Uptime Monitoring';
    metricValue = '99.99%';
    bgAmbientDesc = 'Dynamic industrial royal cobalt blue, electric cyan, and warm energy crimson gradient aura diffusing across the studio background';
  } else if (/wedding|undangan|invitation|cinta|nikah/i.test(combinedContext)) {
    primaryColorName = 'Champagne Noir & Rich Charcoal';
    primaryHex = '#1C1917';
    accentColorName = 'Warm Champagne Gold, Rose Quartz & Coral';
    accentHex = '#D97706';
    accentSecondaryHex = '#E11D48';
    accentTertiaryHex = '#F43F5E';
    lightAccentBg = '#FFFBEB';
    lightAccentBorder = '#FDE68A';
    domainArchetype = 'Platform Undangan Pernikahan Digital Elegan';
    metricLabel = 'Tingkat Konfirmasi RSVP';
    metricValue = '98.5%';
    bgAmbientDesc = 'Lush champagne gold, soft rose quartz, and radiant peach aurora gradient mesh illuminating the backdrop with warm luxury';
  } else if (/shoope|ecommerce|shop|toko|marketplace|pos|kasir/i.test(combinedContext)) {
    primaryColorName = 'Modern Charcoal';
    primaryHex = '#18181B';
    accentColorName = 'Vibrant Sunset Tangerine, Coral & Violet';
    accentHex = '#EA580C';
    accentSecondaryHex = '#F97316';
    accentTertiaryHex = '#8B5CF6';
    lightAccentBg = '#FFF7ED';
    lightAccentBorder = '#FED7AA';
    domainArchetype = 'Multi-Vendor E-Commerce & Marketplace Platform';
    metricLabel = 'Kecepatan Transaksi';
    metricValue = '0.3s';
    bgAmbientDesc = 'Vibrant sunset tangerine, electric coral, and soft purple ambient backlight creating warm modern energy in the studio';
  } else if (/ai|agent|prompt|gpt|llm|workflow|machine learning/i.test(combinedContext)) {
    primaryColorName = 'Cosmic Slate Charcoal';
    primaryHex = '#0F172A';
    accentColorName = 'Electric Violet, Sapphire Indigo & Neon Cyan';
    accentHex = '#7C3AED';
    accentSecondaryHex = '#3B82F6';
    accentTertiaryHex = '#06B6D4';
    lightAccentBg = '#F5F3FF';
    lightAccentBorder = '#DDD6FE';
    domainArchetype = 'AI Workflow & Prompt Engineering Studio';
    metricLabel = 'Akurasi Inferensi AI';
    metricValue = '99.4%';
    bgAmbientDesc = 'Futuristic electric violet, deep indigo, and luminous cyan aurora mesh gradient softly diffusing behind the cards';
  }

  const techFormatted = techList.slice(0, 6).join(' • ');

  const cdnListText = mediaUrls.length > 0
    ? mediaUrls.map((url, i) => `  * CDN Source Screenshot ${i + 1}: ${url}`).join('\n')
    : '  * Primary Source: Synthesize the authentic functional interface, interactive data visualizations, modular bento cells, and precision table controls.';

  const cleanDescription = description.length > 110 
    ? description.slice(0, 107) + '...' 
    : description;

  const prompt = `Create image: A world-class, ultra-clean 16:9 widescreen SaaS product presentation photograph and multi-screen master showcase graphic in a VIBRANT MODERN LIGHT THEME for the Indonesian web application titled "${title}".

================================================================================
[SECTION 1: MASTER COMPOSITION BLUEPRINT & MANDATORY VISIBLE ELEMENTS]
================================================================================
You are commanded to act as a World-Class Lead UI/UX Product Designer and Executive Brand Art Director (at the caliber of Stripe, Linear, Apple Keynote, and Vercel Design Labs).
MANDATORY VISIBLE ELEMENTS THAT MUST BE RENDERED ON CANVAS:
1. Triple-Window Cascading Architecture: 3 cascading, layered light-mode software application windows spanning 88% to 92% of the canvas width, filling the horizontal space without empty margins.
2. Vibrant Chromatic Ambient Background: The background is NOT a flat or boring white sheet. It is enriched with a luminous multi-tone gradient mesh in ${accentColorName} (${accentHex}, ${accentSecondaryHex}, ${accentTertiaryHex}) glowing softly behind the windows, accompanied by faint engineering dot matrix patterns and subtle floating frosted glass accents.
3. Prominent Social Branding Dock at Bottom Center: A sleek, high-contrast floating pill bar containing:
   [GitHub Logo] dresar  •  Eka Syarif Maulana  •  [Instagram Logo] @arif_ex21
   This dock MUST be fully visible, uncropped, and centered in the bottom 20% zone of the canvas.
4. Floating Metric Badge: Positioned at top-right of the main window showing bold "${metricValue}" with label "${metricLabel}".
5. Floating Tech Stack Capsule: Positioned at bottom-left showing "${techFormatted}".

================================================================================
[SECTION 2: VIBRANT COLORFUL AMBIENT BACKGROUND & STUDIO ATMOSPHERE]
================================================================================
The background must feel high-end, colorful, and engaging while preserving a clean, bright, modern aesthetic:
- Luminous Studio Atmosphere: Bright modern studio environment with smooth, diffused daylight illumination.
- Colorful Gradient Mesh & Aurora Glow: ${bgAmbientDesc}. Soft, organic pools of vibrant light in ${accentHex} and ${accentSecondaryHex} radiate from behind the application windows, casting soft colored halos onto the studio backdrop.
- Subtle Background Textures & Accents:
  * In the far background, render a delicate, ultra-faint isometric engineering dot-matrix grid (micro-dots at 4% to 6% opacity) that adds structural sophistication without visual clutter.
  * 2 to 3 small, out-of-focus translucent frosted glass spheres and smooth geometric prisms hover softly in the background atmosphere, catching and refracting the colorful ambient lighting.
  * Soft colored rim light (colored contour glow) outlines the floating windows, giving them dramatic 3D separation and tactile floating presence.

================================================================================
[SECTION 3: STRICT VERTICAL FRAMING & TRIPLE-WINDOW CASCADE]
================================================================================
CRITICAL VERTICAL ZONING (AVOID BOTTOM CROPPING):
- Top Zone (Y: 0% to 14%): Ambient colorful background glow and upper window chrome headers.
- Central Window Stage (Y: 14% to 78%): The 3 cascading software application windows float strictly within this middle 64% height zone. The bottom edge of all three windows MUST terminate at Y: 78%. Under no circumstances should the windows touch or exceed Y: 80%.
- Dedicated Bottom Showcase Zone (Y: 80% to 100%): A generous 20% vertical clearance specifically reserved for the Floating Social Branding Dock. This guarantees that the GitHub and Instagram handles are NEVER pushed off or cropped out.

WINDOW SPECIFICATIONS:
1. PRIMARY HERO WINDOW (Center Foreground, Y: 16% to 78%, Width: 60%):
   - Surface: Crisp pure white (#FFFFFF) light-mode application dashboard bordered by a razor-thin 1px border (#E2E8F0).
   - Drop Shadow: Soft, diffused multi-tier studio ambient shadow (0 24px 48px -12px rgba(15, 23, 42, 0.14), 0 4px 12px rgba(15, 23, 42, 0.05)).
   - Top Header Bar: Clean light grey window chrome (#F8FAFC, height: 38px) with 3 macOS traffic light dots (ruby #EF4444, amber #F59E0B, emerald #10B981) and a centered dummy address pill: "https://${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.app".
   - Internal UI Content: Rich, fully designed production light-mode dashboard featuring vibrant line charts in ${accentHex} with soft gradients, 4 clean white KPI metric cards with green +12% badges, and structured functional data workspaces.
2. SECONDARY WORKSPACE WINDOW (Left Wing Layer, Offset Behind Left Edge):
   - Positioned to the left, slightly offset behind the primary hero window (-130px to -170px X-offset), filling the left margin of the canvas.
   - Surface: Immaculate light-mode white container (#FFFFFF) with subtle border (#E2E8F0).
   - Content: Displays the application's secondary functional module: an in-depth data table, case simulation catalog, or filtering workspace with clean typography and status pills.
3. TERTIARY COMPANION WINDOW (Right Wing Layer, Offset Behind Right Edge):
   - Positioned to the right, slightly offset behind the primary hero window (+130px to +170px X-offset), filling the right margin of the canvas.
   - Surface: Crisp white panel (#FFFFFF) with delicate border (#E2E8F0).
   - Content: Displays the application's interactive feature workspace: an active AI Assistant chat panel with suggested prompt pills, live calculation records, or a detailed audit feed.

================================================================================
[SECTION 4: MANDATORY SOCIAL BRANDING DOCK & FLOATING WIDGETS]
================================================================================
1. FLOATING SOCIAL BRANDING DOCK (Mandatory Bottom Showcase):
   - Position: Centered horizontally at bottom (X: 50%, Y: 88%), floating distinctly in the clear open space beneath the central application window.
   - Form: Refined floating frosted-glass capsule dock with high-contrast readability (height: 42px, width: ~380px, background: rgba(255, 255, 255, 0.95), border: 1.5px solid rgba(15, 23, 42, 0.15), shadow: 0 10px 25px rgba(0, 0, 0, 0.08)).
   - Readable Content from Left to Right (Strictly text and icons ONLY, NO labels like "Creator Name:"):
     * The crisp black GitHub Octocat icon followed by bold text "dresar"
     * A centered divider dot "•"
     * Author name in sharp dark charcoal text: "Eka Syarif Maulana"
     * A centered divider dot "•"
     * The crisp Instagram camera icon followed by bold text "@arif_ex21"
   - Mandatory Priority: This dock is an essential brand asset of the presentation. It MUST be fully rendered, sharp, legible, and uncropped.
2. FLOATING METRIC CARD (Top-Right Accent):
   - Position: Hovering near the top-right corner of the primary hero window (X: 78%, Y: 22%).
   - Clean white card with subtle border (#E2E8F0), soft shadow, a vibrant green sparkline curve in ${accentHex}, bold metric "${metricValue}", and concise label "${metricLabel}" with a small green status indicator "● Terverifikasi".
3. FLOATING TECH STACK CAPSULE (Bottom-Left Accent):
   - Position: Hovering near the bottom-left edge of the primary hero window (X: 14%, Y: 75%).
   - Sleek white capsule pill containing clean monochrome micro-badges:
     "${techFormatted}"

================================================================================
[SECTION 5: CRITICAL ANTI-ANNOTATION & ANTI-TEXT-LEAK DIRECTIVE (STRICT)]
================================================================================
Under NO circumstances should you render diagram titles, section names, explanatory text boxes, or UI annotation labels onto the canvas.
- STRICT NEGATIVE CONSTRAINT ON TEXT LABELS:
  * Absolutely NEVER write words like "FLOATING STATUS PILL" on the background.
  * Absolutely NEVER write words like "FLOATING METRIC MICRO-CARD" on the background.
  * Absolutely NEVER write words like "FLOATING TECH STACK DOCK" on the background.
  * Absolutely NEVER write words like "FLOATING FROSTED GLASS BRANDING DOCK" on the background.
  * Absolutely NEVER write words like "Creator Name:" or "Author:" or "Window 1" or "Tab 1".
- You are creating a real, polished product showcase photograph, NOT a labeled infographic, NOT an annotated wireframe diagram.
- Every widget and pill must exist naturally within the scene WITHOUT any external text arrows, category captions, or title tags printed above or below them.

================================================================================
[SECTION 6: ABSOLUTE NEGATIVE CONSTRAINTS & ZERO-DEVICE MANDATE (STRICT)]
================================================================================
The user strictly enforces an absolute, non-negotiable rule forbidding all physical electronic hardware devices:
- ZERO LAPTOPS: Absolutely NO MacBook Pros, MacBook Airs, Windows laptops, laptop keyboards, trackpads, laptop screens, or notebook clamshell hinges.
- ZERO SMARTPHONES & TABLETS: Absolutely NO iPhones, Android phones, iPads, tablets, mobile bezels, screen notches, camera dynamic islands, or handheld frames.
- ZERO MONITORS & PHYSICAL COMPUTERS: Absolutely NO desktop monitors, iMac stands, PC display bezels, cables, or physical desk setups.
- ZERO ISOMETRIC ROOMS & DESK ACCESSORIES: Absolutely NO wooden desks, coffee mugs, potted succulents, reading glasses, external keyboards, mice, or tabletop props.
- FORM FACTOR IS PURELY FLOATING SOFTWARE CONTAINERS: Every interface element exists purely as refined, floating 2D/2.5D software card windows with precision rounded corners, existing solely in software UI space.

================================================================================
[SECTION 7: REAL GITHUB CDN ASSETS SYNTHESIS]
================================================================================
The creator has uploaded authentic production assets to their official GitHub CDN repository. You MUST analyze and reproduce the genuine interface visual design from these URLs:
${cdnListText}
- Fidelity Mandate: Extract the real color accents, dashboard density, table row structures, and domain workflows from these genuine CDN screenshots. Distribute these authentic features across the 3 cascading light-mode windows to truthfully represent this exact software.

================================================================================
[SECTION 8: TYPOGRAPHIC SYSTEM & MANDATORY INDONESIAN COPYWRITING]
================================================================================
All readable text embedded into the user interface MUST be rendered in crisp, grammatically correct Bahasa Indonesia using modern geometric sans-serif typography (Inter, Plus Jakarta Sans, or SF Pro):
1. Domain Category Kicker (Badge Kategori):
   - Text: "✦ ${categoryName.toUpperCase()}"
   - Style: Small, tracking-widest, uppercase micro-badge in ${accentHex} on soft tint background (${lightAccentBg}).
2. Main Project Headline (Judul Proyek):
   - Text: "${title}"
   - Style: Bold, commanding headline in Deep Charcoal (#0F172A), razor-sharp rendering with zero distortion.
3. Concise Indonesian Value Proposition (Deskripsi Singkat):
   - Text: "${cleanDescription}"
   - Style: Clean, readable Indonesian copy in Slate Grey (#334155).
4. Feature Bullet Chips:
   - Text: "✓ 100+ Kasus Praktik" • "✓ Analisis Instan" • "✓ Sertifikasi Terintegrasi"
5. Text Legibility Mandate: Every Indonesian word must be 100% legible, vector-sharp, with zero broken characters, zero gibberish, and zero overlapping glyphs.

================================================================================
[SECTION 9: LIGHTING, RENDERING ENGINE & FINAL QUALITY CHECKLIST]
================================================================================
- Lighting Architecture: Diffused overhead studio daylight softbox combined with colorful chromatic rim lighting from the background aurora mesh.
- Surface Texture: Satin matte anti-reflective coating across all software card surfaces; zero blown-out white glares; zero oily plastic reflections.
- Depth of Field: Deep and razor-sharp depth of field (f/11 optical equivalent); every single letter, badge, graph line, and icon is in pin-sharp focus.
- Color Science: Rec.709 color gamut, vibrant yet balanced color saturation, natural contrast curve, true sRGB fidelity.
- Final Verification:
  ✓ 1. Canvas is exactly 16:9 widescreen with vibrant colorful ambient mesh and subtle geometric accents in the background (NOT a plain flat dead white sheet).
  ✓ 2. 100% LIGHT THEME across all 3 software windows (crisp white card surfaces, zero dark mode).
  ✓ 3. Exactly 3 cascading, layered windows/tabs spanning ~90% canvas width (ZERO dead empty horizontal space).
  ✓ 4. Windows vertically confined between Y: 14% and Y: 78%, leaving a dedicated 20% bottom zone.
  ✓ 5. Bottom center clearly displays the prominent, fully visible social branding dock with GitHub "dresar" and Instagram "@arif_ex21".
  ✓ 6. Absolutely NO laptops, NO phones, NO physical monitors.
  ✓ 7. Absolutely NO diagram labels or annotation text printed on the background.
  ✓ 8. All UI copy is in clear, correct Bahasa Indonesia ("${title}").

Generate the final 16:9 triple-window showcase image now adhering strictly to every single parameter specified above.`;

  return prompt;
}

export function countWords(str: string): number {
  if (!str) return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
}
