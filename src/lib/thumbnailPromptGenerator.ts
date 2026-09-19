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

  let canvasBgHex = '#0B0F19';
  let accentName = 'Crisp Emerald Jade';
  let accentHex = '#059669';
  let accentSecondaryHex = '#10B981';
  let domainArchetype = 'Modern Cloud Web Application';
  let ambientAtmosphere = 'Subtle, dark, organic emerald-slate atmospheric ambient gradient within the canvas';

  if (/pesantren|santri|rapor|alma|sira|islamic|pondok|madrasah/i.test(combinedContext)) {
    canvasBgHex = '#071A14';
    accentName = 'Deep Heritage Forest Jade';
    accentHex = '#059669';
    accentSecondaryHex = '#10B981';
    domainArchetype = 'Sistem Informasi Akademik & Pesantren Terpadu';
    ambientAtmosphere = 'Subtle dark forest green atmospheric gradient with warm golden amber tones within the dark canvas';
  } else if (/pajak|brevet|tax|finance|dana|donasi|keuangan|payment/i.test(combinedContext)) {
    canvasBgHex = '#0B0F19';
    accentName = 'Crisp Financial Emerald & Teal';
    accentHex = '#059669';
    accentSecondaryHex = '#0D9488';
    domainArchetype = 'Platform Pembelajaran & Perpajakan Digital';
    ambientAtmosphere = 'Subtle dark obsidian slate background infused with soft, deep emerald and teal atmospheric tones';
  } else if (/pertamina|oil|gas|monitoring|telemetry|iot|sensor|factory|industrial/i.test(combinedContext)) {
    canvasBgHex = '#081022';
    accentName = 'Industrial Cobalt Blue & Signal Red';
    accentHex = '#1D4ED8';
    accentSecondaryHex = '#DC2626';
    domainArchetype = 'Sistem Monitoring & Arsip Digital Industri';
    ambientAtmosphere = 'Subtle deep industrial sapphire atmosphere within the dark canvas';
  } else if (/wedding|undangan|invitation|cinta|nikah/i.test(combinedContext)) {
    canvasBgHex = '#140F13';
    accentName = 'Warm Champagne & Amber';
    accentHex = '#B45309';
    accentSecondaryHex = '#D97706';
    domainArchetype = 'Platform Undangan Pernikahan Digital Elegan';
    ambientAtmosphere = 'Subtle dark luxury espresso charcoal background with delicate warm champagne ambient lighting';
  } else if (/shoope|ecommerce|shop|toko|marketplace|pos|kasir/i.test(combinedContext)) {
    canvasBgHex = '#101014';
    accentName = 'Crisp Tangerine Orange';
    accentHex = '#C2410C';
    accentSecondaryHex = '#EA580C';
    domainArchetype = 'Multi-Vendor E-Commerce & Marketplace Platform';
    ambientAtmosphere = 'Subtle dark charcoal background with warm tangerine ambient tones';
  } else if (/ai|agent|prompt|gpt|llm|workflow|machine learning/i.test(combinedContext)) {
    canvasBgHex = '#0B0F19';
    accentName = 'Refined Indigo & Violet';
    accentHex = '#4F46E5';
    accentSecondaryHex = '#6366F1';
    domainArchetype = 'AI Workflow & Prompt Engineering Studio';
    ambientAtmosphere = 'Subtle dark slate background with deep indigo atmospheric gradient';
  }

  const cleanDescription = description.length > 110 
    ? description.slice(0, 107) + '...' 
    : description;

  const prompt = `Create image: A 100% FULL-BLEED, EDGE-TO-EDGE 16:9 widescreen digital product showcase graphic and executive master presentation banner (Apple Keynote, Stripe, Linear, Vercel design caliber) for the Indonesian web application titled "${title}".

================================================================================
[SECTION 1: MANDATORY FULL-BLEED SPECIFICATION — ZERO WHITE MARGINS & ZERO ROOMS]
================================================================================
CRITICAL CANVAS INSTRUCTION (FULL BLEED / EDGE-TO-EDGE ONLY):
- The dark background (${canvasBgHex}) MUST cover 100% OF THE ENTIRE 16:9 CANVAS from corner to corner (0px margin, full bleed, edge-to-edge).
- STRICT NEGATIVE CONSTRAINT AGAINST WHITE SURROUNDINGS:
  * Absolutely NO white borders, NO white margins, NO white background surrounding the graphic!
  * Absolutely NO 3D physical rooms, NO photography studio floors, NO white walls, NO pedestals, NO podiums, NO concrete blocks, NO architectural pillars, NO daylight windows!
  * You are NOT taking a photo of a card sitting inside a room. The entire 16:9 image IS the high-resolution digital master graphic itself!
  * Every single pixel from X: 0% to 100% and Y: 0% to 100% is part of the sleek dark presentation banner!

================================================================================
[SECTION 2: MASTER FULL-CANVAS LAYOUT (SPLIT HERO ARCHITECTURE)]
================================================================================
The graphic spans 100% of the widescreen canvas in a commanding split layout:
1. LEFT HALF (52% Canvas Width — MASSIVE DISPLAY TYPOGRAPHY, PURE & UNBOXED):
   - Category Sub-Heading: Crisp, unboxed, tracking-widest uppercase typography in clean slate (#94A3B8): "${categoryName.toUpperCase()}". Rendered as clean text with ZERO pill badges, ZERO borders, ZERO enclosing boxes.
   - Massive Display Headline: The title "${title}" in EXTRA-LARGE, ULTRA-BOLD geometric sans-serif typography (Inter Display / SF Pro / Neue Haas Grotesk). The brand name is rendered in solid, crisp ${accentSecondaryHex}, while the descriptive title is in stark, solid, matte white (#FFFFFF). Massive scale, razor-sharp vector clarity, completely unboxed.
   - Concise Indonesian Value Proposition: A clean, perfectly readable paragraph of authentic Indonesian copywriting in subtle slate grey (#CBD5E1): "${cleanDescription}".
   - Tech & Architecture Line: A simple, elegant typographic line: "Arsitektur Modern: React 19 • TypeScript • PostgreSQL • Tailwind CSS". Pure text, ZERO pills.
2. RIGHT HALF (48% Canvas Width — AUTHENTIC HIGH-TECH SOFTWARE DASHBOARD):
   - A full-height, borderless, dark-mode software application interface showing the authentic application workflow:
     * Dark dashboard panel with clean navigation header and user profile ("Selamat Datang").
     * Real-time financial / data analytics graphs with solid, crisp data curves in ${accentHex} (solid matte color, ZERO neon glow).
     * Minimalist KPI metric cards with clean white typography and +12% status numbers.
     * An interactive conversational card: "AI Tax Assistant" displaying a realistic chat prompt bubble with crisp typography.
   - PURE SOFTWARE SCREEN: This is strictly a high-resolution 2D/2.5D software interface screenshot. Absolutely NO physical laptop body, NO keyboard keys, NO trackpads, NO hinges, NO desk clutter.

================================================================================
[SECTION 3: MANDATORY SOCIAL BRANDING DOCK (BOTTOM CENTER)]
================================================================================
At the bottom center of the 16:9 canvas (X: 50%, Y: 90%), integrated seamlessly with generous breathing room beneath the text and dashboard:
- Form: A refined, minimalist matte dark capsule dock (height: 46px, width: ~480px, background: rgba(15, 23, 42, 0.96), border: 1.5px solid #334155, shadow: 0 12px 30px rgba(0, 0, 0, 0.3)).
- Complete Text & Icon Hierarchy from Left to Right (Strictly plain typography and official monochrome icons):
  1. The official black/white GitHub Octocat glyph followed by clean, bold text "dresar"
  2. A centered divider bullet dot "•" in slate (#64748B)
  3. The author's full legal name in crisp, solid white typography: "Eka Syarif Maulana"
  4. A centered divider bullet dot "•" in slate (#64748B)
  5. The official Instagram camera glyph followed by clean, bold text "@arif_ex21"
- Mandatory Priority: This dock is an essential brand asset. Every character and icon MUST be rendered completely, legibly, and sharply.

================================================================================
[SECTION 4: ATMOSPHERIC COLOR SCIENCE & MATTE FINISH]
================================================================================
- Base Canvas Color: Deep obsidian slate (${canvasBgHex}) covering 100% of the canvas.
- Background Atmosphere: ${ambientAtmosphere}. Soft, deep, organic light gradients that live naturally within the dark digital canvas.
- Surface Texture: Satin-matte anti-reflective finish across all UI surfaces; ZERO blinding plastic glares, ZERO radioactive neon light spills.
- Lighting: Clean studio overhead softbox illumination focused directly onto the typography and UI dashboard.

================================================================================
[SECTION 5: STRICT NEGATIVE PROMPTS & ZERO-TOLERANCE PROHIBITIONS]
================================================================================
1. STRICTLY NO WHITE BORDERS OR MARGINS: Absolutely NO white borders, NO white padding, NO white background framing the image!
2. STRICTLY NO 3D ROOMS OR FLOORS: Absolutely NO photography studio rooms, NO floors, NO walls, NO pedestals, NO podiums, NO concrete blocks, NO physical studio props!
3. STRICTLY NO NEON: Absolutely NO neon glow, NO neon outlines, NO neon borders, NO cyber-glow, NO radioactive blooms!
4. STRICTLY NO BADGES / PILL CAPSULES ("BUDGE / BADGE DI LARANG KERAS"): Absolutely NO pill-shaped badges, NO category capsules, NO tag buttons, NO checkmark pills. All text must be pure unboxed typography!
5. STRICTLY NO PHYSICAL LAPTOPS & DESK JUNK: Absolutely NO laptop bodies, NO keyboards, NO laptop hinges, NO piles of physical books, NO pens, NO potted plants!
6. STRICTLY NO ANNOTATIONS OR WIREFRAME LABELS: Absolutely NEVER print words like "FLOATING DOCK", "BRANDING DOCK", "Creator Name:", "Window 1", or diagram arrows.

================================================================================
[SECTION 6: FINAL PRODUCTION VERIFICATION CHECKLIST]
================================================================================
✓ 1. Format is 100% FULL-BLEED 16:9 widescreen digital banner (dark background fills 100% of the image from edge to edge with ZERO white margins).
✓ 2. Absolutely NO 3D studio rooms, NO floors, NO pedestals.
✓ 3. Left side features EXTRA-LARGE, ULTRA-BOLD typography (Title: "${title}"), completely unboxed (ZERO BADGES).
✓ 4. Right side displays a realistic, full-height dark digital software UI dashboard without physical laptop hardware.
✓ 5. Bottom center clearly displays the complete social branding dock: GitHub "dresar" • "Eka Syarif Maulana" • Instagram "@arif_ex21".
✓ 6. STRICTLY ZERO NEON: Matte, sophisticated, natural executive presentation aesthetics.
✓ 7. All UI copy is in clear, correct Bahasa Indonesia.

Generate the 100% full-bleed, edge-to-edge 16:9 master showcase banner now adhering strictly to every single parameter specified above.`;

  return prompt;
}

export function countWords(str: string): number {
  if (!str) return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
}
