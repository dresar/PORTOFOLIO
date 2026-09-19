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

  let brandColor = '#059669';
  let lightGradientMesh = 'a luminous light-mode gradient blending smooth porcelain white (#FFFFFF) into subtle mint emerald (#ECFDF5) and soft crystal cyan (#F0FDFA)';
  let domainArchetype = 'Modern Cloud Web Application';

  if (/pesantren|santri|rapor|alma|sira|islamic|pondok|madrasah/i.test(combinedContext)) {
    brandColor = '#065F46';
    lightGradientMesh = 'a luminous light-mode gradient blending crisp white (#FFFFFF) into delicate sage pine (#ECFDF5) and soft warm ivory (#FFFBEB)';
    domainArchetype = 'Sistem Informasi Akademik & Pesantren Terpadu';
  } else if (/pajak|brevet|tax|finance|dana|donasi|keuangan|payment/i.test(combinedContext)) {
    brandColor = '#059669';
    lightGradientMesh = 'a luminous light-mode gradient blending pristine white (#FFFFFF) into soft mint emerald (#ECFDF5), delicate turquoise cyan (#F0FDFA), and pale sky blue (#F8FAFC)';
    domainArchetype = 'Platform Pembelajaran & Perpajakan Digital';
  } else if (/pertamina|oil|gas|monitoring|telemetry|iot|sensor|factory|industrial/i.test(combinedContext)) {
    brandColor = '#1D4ED8';
    lightGradientMesh = 'a luminous light-mode gradient blending crisp white (#FFFFFF) into soft icy sky blue (#EFF6FF) and pale cobalt mist (#DBEAFE)';
    domainArchetype = 'Sistem Monitoring & Arsip Digital Industri';
  } else if (/wedding|undangan|invitation|cinta|nikah/i.test(combinedContext)) {
    brandColor = '#B45309';
    lightGradientMesh = 'a luminous light-mode gradient blending pure ivory (#FFFFFF) into delicate champagne cream (#FFFBEB) and subtle warm blush (#FFF1F2)';
    domainArchetype = 'Platform Undangan Pernikahan Digital Elegan';
  } else if (/shoope|ecommerce|shop|toko|marketplace|pos|kasir/i.test(combinedContext)) {
    brandColor = '#C2410C';
    lightGradientMesh = 'a luminous light-mode gradient blending crisp white (#FFFFFF) into soft sunlit peach (#FFF7ED) and delicate lavender (#F5F3FF)';
    domainArchetype = 'Multi-Vendor E-Commerce & Marketplace Platform';
  } else if (/ai|agent|prompt|gpt|llm|workflow|machine learning/i.test(combinedContext)) {
    brandColor = '#4F46E5';
    lightGradientMesh = 'a luminous light-mode gradient blending pristine white (#FFFFFF) into subtle electric lavender (#F5F3FF) and pale cyan (#ECFEFF)';
    domainArchetype = 'AI Workflow & Prompt Engineering Studio';
  }

  const cleanDescription = description.length > 115 
    ? description.slice(0, 112) + '...' 
    : description;

  const prompt = `Create image: A 100% FULL-BLEED, EDGE-TO-EDGE 16:9 widescreen digital product presentation master graphic in a PRISTINE BRIGHT LIGHT THEME WITH LUMINOUS GRADIENTS (caliber of Stripe, Apple Keynote, Linear, and Vercel design) for the Indonesian web application titled "${title}".

================================================================================
[SECTION 1: 100% BRIGHT LIGHT THEME & FULL-BLEED CANVAS DIRECTIVE]
================================================================================
MANDATORY MASTER STYLE: BRIGHT LIGHT THEME WITH LUMINOUS GRADIENTS (TEMA TERANG BERGRADIASI).
- The entire 16:9 canvas from corner to corner (0px margin, full bleed, edge-to-edge) is an immaculate, bright, luminous digital graphic canvas:
  * Canvas Background: ${lightGradientMesh}. It is airy, bright, clean, and vibrant with soft organic pastel light washes.
  * Absolutely NO dark mode, NO black backgrounds, NO gloomy dark rooms.
- STRICT NEGATIVE CONSTRAINT AGAINST 3D ROOMS & MARGINS:
  * Absolutely NO 3D physical rooms, NO studio floors, NO pedestals, NO podiums, NO concrete blocks, NO physical walls, NO daylight windows!
  * You are NOT photographing a poster sitting inside a room. The entire 16:9 image IS the high-resolution digital master graphic itself, covering 100% of the canvas from edge to edge!
  * Zero outer frames, zero drop-shadow margins around the canvas.

================================================================================
[SECTION 2: COMMANDING FULL-WIDTH SPLIT LAYOUT (92% CANVAS COVERAGE)]
================================================================================
The graphic is structured in a magnificent, balanced split presentation:
1. LEFT HALF (52% Canvas Width — EXTRA-LARGE BOLD TYPOGRAPHY, PURE & UNBOXED):
   - Category Sub-Heading: Crisp, unboxed, tracking-widest uppercase typography in refined slate grey (#64748B): "${categoryName.toUpperCase()}". Plain typography, ZERO pill badges, ZERO enclosing boxes.
   - Massive Display Headline: The title "${title}" in EXTRA-LARGE, ULTRA-BOLD modern geometric sans-serif typography (Inter Display / SF Pro / Neue Haas Grotesk). The brand name is rendered in solid, rich ${brandColor}, while the rest of the headline is in commanding deep charcoal (#0F172A). It is huge, razor-sharp, vector-clean, and completely unboxed.
   - Concise Indonesian Value Proposition: A clean, perfectly readable paragraph of authentic Indonesian copywriting in balanced slate grey (#334155): "${cleanDescription}".
   - Tech & Architecture Line: A simple, elegant typographic line in slate (#64748B): "Arsitektur Modern: React 19 • TypeScript • PostgreSQL • Tailwind CSS". Pure text, ZERO pills.
2. RIGHT HALF (48% Canvas Width — PRISTINE LIGHT-MODE APPLICATION DASHBOARD):
   - A full-height, borderless, crisp light-mode digital application dashboard interface showing the genuine software workflow:
     * Clean white dashboard surface (#FFFFFF) with delicate 1px border (#E2E8F0) and soft subtle ambient shadow (0 20px 40px -15px rgba(0,0,0,0.06)).
     * Minimalist navigation header with clean user profile ("Selamat Datang").
     * Real-time financial / data analytics graphs with solid, crisp, vibrant data lines in ${brandColor} (solid matte color, ZERO neon glow).
     * Minimalist KPI metric cards with clean dark charcoal typography and +12% status numbers.
     * An interactive conversational card: "AI Tax Assistant" displaying a realistic chat prompt bubble with crisp, natural typography.
   - PURE SOFTWARE SCREEN: This is strictly a high-resolution 2D/2.5D software interface screenshot. Absolutely NO physical laptop body, NO keyboard keys, NO trackpads, NO hinges, NO desk clutter.

================================================================================
[SECTION 3: MANDATORY SOCIAL BRANDING DOCK (BOTTOM CENTER — 100% COMPLETE)]
================================================================================
At the bottom center of the 16:9 canvas (X: 50%, Y: 90%), integrated seamlessly with generous breathing room beneath the text and dashboard:
- Form: A refined, minimalist light-mode capsule dock (height: 46px, width: ~480px, background: rgba(255, 255, 255, 0.95), border: 1.5px solid #CBD5E1, shadow: 0 10px 25px rgba(15, 23, 42, 0.08)).
- Complete Text & Icon Hierarchy from Left to Right (Strictly plain typography and official monochrome icons):
  1. The official black GitHub Octocat glyph followed by clean, bold text "dresar"
  2. A centered divider bullet dot "•" in slate (#94A3B8)
  3. The author's full legal name in crisp, commanding dark charcoal typography: "Eka Syarif Maulana"
  4. A centered divider bullet dot "•" in slate (#94A3B8)
  5. The official Instagram camera glyph followed by clean, bold text "@arif_ex21"
- Mandatory Priority: This dock is an essential brand asset. Every character and icon MUST be rendered completely, legibly, and sharply.

================================================================================
[SECTION 4: NATURAL DAYLIGHT AESTHETICS & ZERO-NEON MANDATE]
================================================================================
- Lighting Physics: Clean, diffused natural daylight (5500K daylight temperature) casting soft, organic contact shadows beneath the dashboard cards.
- Surface Texture: Satin-matte anti-reflective finish across all UI surfaces; ZERO plastic glossy shine, ZERO blinding specular reflections, ZERO fluorescent neon light spill.
- Color Fidelity: Clean sRGB and Rec.709 color gamut, natural contrast curve, crisp legibility.

================================================================================
[SECTION 5: STRICT NEGATIVE PROMPTS & ZERO-TOLERANCE PROHIBITIONS]
================================================================================
1. STRICTLY NO DARK THEMES OR BLACK BACKGROUNDS: The entire image must be in a bright, luminous light theme with soft gradients!
2. STRICTLY NO 3D ROOMS OR FLOORS: Absolutely NO photography studio rooms, NO floors, NO walls, NO pedestals, NO podiums, NO concrete blocks, NO physical studio props!
3. STRICTLY NO NEON: Absolutely NO neon glow, NO neon outlines, NO neon borders, NO cyber-glow, NO radioactive blooms!
4. STRICTLY NO BADGES / PILL CAPSULES ("BUDGE / BADGE DI LARANG KERAS"): Absolutely NO pill-shaped badges, NO category capsules, NO tag buttons, NO checkmark pills. All text must be pure unboxed typography!
5. STRICTLY NO PHYSICAL LAPTOPS & DESK JUNK: Absolutely NO laptop bodies, NO keyboards, NO laptop hinges, NO piles of physical books, NO pens, NO potted plants!
6. STRICTLY NO ANNOTATIONS OR WIREFRAME LABELS: Absolutely NEVER print words like "FLOATING DOCK", "BRANDING DOCK", "Creator Name:", "Window 1", or diagram arrows.

================================================================================
[SECTION 6: FINAL PRODUCTION VERIFICATION CHECKLIST]
================================================================================
✓ 1. 100% FULL-BLEED 16:9 widescreen digital graphic in a BRIGHT LIGHT THEME with luminous gradients (ZERO white borders, ZERO dark mode).
✓ 2. Absolutely NO 3D studio rooms, NO floors, NO pedestals.
✓ 3. Left side features EXTRA-LARGE, ULTRA-BOLD typography (Title: "${title}") in deep charcoal, completely unboxed (ZERO BADGES).
✓ 4. Right side displays a realistic, full-height light-mode digital software UI dashboard without physical laptop hardware.
✓ 5. Bottom center clearly displays the complete social branding dock: GitHub "dresar" • "Eka Syarif Maulana" • Instagram "@arif_ex21".
✓ 6. STRICTLY ZERO NEON: Natural, diffused daylight aesthetic.
✓ 7. All UI copy is in clear, correct Bahasa Indonesia.

Generate the 100% full-bleed, edge-to-edge 16:9 bright light-mode master showcase graphic now adhering strictly to every single parameter specified above.`;

  return prompt;
}

export function countWords(str: string): number {
  if (!str) return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
}
