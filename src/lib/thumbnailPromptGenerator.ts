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

  let primaryColorName = 'Modern Matte Obsidian';
  let primaryHex = '#0B0F19';
  let accentColorName = 'Crisp Emerald Jade';
  let accentHex = '#059669';
  let accentSecondaryHex = '#10B981';
  let domainArchetype = 'Modern Cloud Web Application';
  let studioAtmosphereDesc = 'Bright, clean, natural Scandinavian studio daylight with soft diffused ambient light';

  if (/pesantren|santri|rapor|alma|sira|islamic|pondok|madrasah/i.test(combinedContext)) {
    primaryColorName = 'Deep Forest Charcoal';
    primaryHex = '#0A1813';
    accentColorName = 'Deep Heritage Forest Jade';
    accentHex = '#065F46';
    accentSecondaryHex = '#059669';
    domainArchetype = 'Sistem Informasi Akademik & Pesantren Terpadu';
    studioAtmosphereDesc = 'Bright architectural daylight studio with neutral matte ambient illumination and subtle emerald warmth';
  } else if (/pajak|brevet|tax|finance|dana|donasi|keuangan|payment/i.test(combinedContext)) {
    primaryColorName = 'Deep Slate Obsidian';
    primaryHex = '#0B0F19';
    accentColorName = 'Crisp Financial Emerald & Teal';
    accentHex = '#059669';
    accentSecondaryHex = '#0D9488';
    domainArchetype = 'Platform Pembelajaran & Perpajakan Digital';
    studioAtmosphereDesc = 'Bright, clean studio daylight with diffused overhead softbox illumination and subtle organic teal ambient tone';
  } else if (/pertamina|oil|gas|monitoring|telemetry|iot|sensor|factory|industrial/i.test(combinedContext)) {
    primaryColorName = 'Industrial Deep Navy Slate';
    primaryHex = '#0A1124';
    accentColorName = 'Industrial Cobalt Blue & Signal Red';
    accentHex = '#1D4ED8';
    accentSecondaryHex = '#DC2626';
    domainArchetype = 'Sistem Monitoring & Arsip Digital Industri';
    studioAtmosphereDesc = 'Bright modern engineering design studio with neutral matte daylight and subtle cobalt atmosphere';
  } else if (/wedding|undangan|invitation|cinta|nikah/i.test(combinedContext)) {
    primaryColorName = 'Rich Warm Charcoal';
    primaryHex = '#161414';
    accentColorName = 'Warm Champagne & Amber';
    accentHex = '#B45309';
    accentSecondaryHex = '#D97706';
    domainArchetype = 'Platform Undangan Pernikahan Digital Elegan';
    studioAtmosphereDesc = 'Bright luxury product studio with soft natural warm daylight and satin matte backdrop';
  } else if (/shoope|ecommerce|shop|toko|marketplace|pos|kasir/i.test(combinedContext)) {
    primaryColorName = 'Modern Charcoal';
    primaryHex = '#121316';
    accentColorName = 'Crisp Tangerine Orange';
    accentHex = '#C2410C';
    accentSecondaryHex = '#EA580C';
    domainArchetype = 'Multi-Vendor E-Commerce & Marketplace Platform';
    studioAtmosphereDesc = 'Bright, crisp modern product photography studio with clean diffused daylight';
  } else if (/ai|agent|prompt|gpt|llm|workflow|machine learning/i.test(combinedContext)) {
    primaryColorName = 'Deep Slate Charcoal';
    primaryHex = '#0B0F19';
    accentColorName = 'Refined Indigo & Violet';
    accentHex = '#4F46E5';
    accentSecondaryHex = '#6366F1';
    domainArchetype = 'AI Workflow & Prompt Engineering Studio';
    studioAtmosphereDesc = 'Bright, minimalist engineering studio with crisp natural overhead lighting and neutral matte backdrop';
  }

  const cleanDescription = description.length > 105 
    ? description.slice(0, 102) + '...' 
    : description;

  const prompt = `Create image: An authentic, world-class 16:9 widescreen product presentation photograph and executive showcase graphic in HIGH-CRAFT HUMAN DESIGN AESTHETICS (Apple Keynote, Stripe, Linear, Vercel caliber) for the Indonesian web application titled "${title}".

================================================================================
[SECTION 1: HIGH-CRAFT HUMAN DESIGN PHILOSOPHY — AUTHENTIC & ZERO-SLOP]
================================================================================
You are strictly commanded to act as a World-Class Principal Brand Director and Senior UI Designer.
CRITICAL MANDATE: ELIMINATE ALL GENERIC "AI-GENERATED" TROPES.
- The user demands a realistic, authentic, human-designed masterpiece that looks like an official executive press showcase from Apple, Stripe, or Linear.
- STRICT PROHIBITION OF NEON: Absolutely NO neon glow, NO neon contour lines, NO glowing neon borders, NO electric cyber-glow, NO radioactive blooms.
- STRICT PROHIBITION OF BADGES & PILL CAPSULES ("BUDGE / BADGE DI LARANG KERAS"):
  * Absolutely NEVER render pill capsules or badge chips around categories or features.
  * Absolutely NO "✦ CATEGORY" pill badges.
  * Absolutely NO "✓ FEATURE" pill badges.
  * All text must be rendered as PURE, UNBOXED, commandingly elegant typography floating directly on the surface without enclosing pills or badge outlines!
- STRICT PROHIBITION OF AI CLUTTER:
  * Absolutely NO glowing microchips with "AI" stamped on them.
  * Absolutely NO floating glowing crystal spheres, floating diamonds, or glowing orbs.
  * Absolutely NO fake piles of labeled books (NO "PPh, PPN, PBB" book stacks), NO random physical pens, NO desk potted plants.
- PURE HIGH-CRAFT TYPOGRAPHY: The left side is defined exclusively by magnificent, clean, massive modern typography with generous breathing space.

================================================================================
[SECTION 2: COMPOSITION LAYOUT — FULL-WIDTH SPLIT STAGE (92% CANVAS WIDTH)]
================================================================================
The entire presentation is anchored by an expansive, full-width matte dark obsidian showcase container (${primaryHex}) spanning 90% to 94% of the 16:9 widescreen canvas, resting on a bright, clean, diffused daylight studio floor:
1. LEFT HALF (55% Width — PURE COMMANDING DISPLAY TYPOGRAPHY, ZERO BADGES):
   - Category Sub-Heading: Crisp, unboxed, tracking-widest uppercase text in clean slate (#94A3B8): "${categoryName.toUpperCase()}". Rendered as plain typography with NO pill badge, NO border, NO background box.
   - Massive Display Headline: The title "${title}" in EXTRA-LARGE, ULTRA-BOLD geometric sans-serif typography (Inter Display / SF Pro / Neue Haas Grotesk). The brand name is rendered in solid, crisp, non-glowing ${accentSecondaryHex}, while the descriptive title is in stark, solid, matte white (#FFFFFF). Razor-sharp, vector-clean, completely unboxed.
   - Concise Indonesian Value Proposition: A clean, readable paragraph of authentic Indonesian copywriting in subtle slate grey (#CBD5E1): "${cleanDescription}".
   - Tech & Architecture Line: A simple, elegant typographic line: "Arsitektur Modern: React 19 • TypeScript • PostgreSQL • Tailwind CSS". Pure text, NO pills.
2. RIGHT HALF (45% Width — AUTHENTIC SOFTWARE UI WINDOW, ZERO PHYSICAL LAPTOPS):
   - A floating, borderless, matte dark-mode digital application dashboard interface showing the genuine software workflow:
     * Clean header with minimal controls and real application navigation.
     * Clean financial / data analytics graphs with solid, matte, elegant data lines in ${accentHex} (NO neon glow).
     * Minimalist white/slate KPI statistics cards with clean percentages (+94%).
     * A clean, floating matte conversational card: "AI Tax Assistant" showing a realistic interactive chat bubble with natural typography.
   - This right-side element is PURELY a floating 2D/2.5D software interface window. Absolutely NO physical laptop body, NO keyboard keys, NO hinges, NO desk clutter.

================================================================================
[SECTION 3: MANDATORY SOCIAL BRANDING DOCK (BOTTOM CENTER — 100% COMPLETE)]
================================================================================
At the bottom center of the 16:9 canvas (X: 50%, Y: 88%), floating with generous vertical clearance beneath the showcase container, render the creator's official social branding dock:
- Form: A refined, minimalist matte charcoal dock (height: 44px, width: ~480px, background: rgba(15, 23, 42, 0.96), border: 1px solid #334155, shadow: 0 12px 28px rgba(0, 0, 0, 0.16)).
- Complete Text & Icon Hierarchy from Left to Right (Strictly plain typography and official monochrome icons, zero neon):
  1. The official black/white GitHub Octocat glyph followed by clean, bold text "dresar"
  2. A centered divider bullet dot "•" in slate (#64748B)
  3. The author's full legal name in crisp, solid white typography: "Eka Syarif Maulana"
  4. A centered divider bullet dot "•" in slate (#64748B)
  5. The official Instagram camera glyph followed by clean, bold text "@arif_ex21"
- Crucial Mandate: Every single element ("dresar", "Eka Syarif Maulana", "@arif_ex21") MUST be rendered completely, legibly, and sharply. Do NOT omit or crop this dock.

================================================================================
[SECTION 4: NATURAL STUDIO LIGHTING & AUTHENTIC COLOR SCIENCE]
================================================================================
- Lighting Atmosphere: ${studioAtmosphereDesc}.
- Lighting Physics: Pure photographic daylight softbox (5500K daylight temperature) positioned above and slightly to the left, casting natural, realistic soft contact shadows beneath the floating showcase container.
- Surface Texture: Premium satin-matte anti-reflective texture on all surfaces; ZERO plastic glossy shine, ZERO blinding specular reflections, ZERO fluorescent neon light spill.
- Background: A bright, elegant, modern architectural studio backdrop in soft light grey / off-white with gentle natural daylight gradients that match the project's authentic domain palette without synthetic neon glows.

================================================================================
[SECTION 5: STRICT NEGATIVE PROMPTS & PROHIBITED ELEMENTS (CRITICAL)]
================================================================================
The user strictly enforces the following negative constraints to avoid tacky AI tropes:
1. STRICTLY NO NEON: Absolutely NO neon glow, NO neon outlines, NO neon borders, NO cyber-glow, NO electric blue/green lasers, NO radioactive halos, NO neon light strips.
2. STRICTLY NO BADGES / PILL CAPSULES ("BUDGE / BADGE DI LARANG KERAS"): Absolutely NO pill-shaped badges, NO category capsules, NO tag buttons, NO checkmark pills. All text must be pure unboxed typography!
3. STRICTLY NO GENERIC AI ICONS: Absolutely NO square microchips with "AI" printed on them, NO glowing circuit boards, NO floating crystal spheres, NO floating gems/diamonds.
4. STRICTLY NO PHYSICAL LAPTOPS & DESK CLUTTER: Absolutely NO laptop keyboards, NO laptop trackpads, NO laptop clamshell hinges, NO desktop computers, NO piles of physical books, NO pens, NO potted plants, NO coffee cups.
5. STRICTLY NO ANNOTATIONS OR WIREFRAME TEXT: Absolutely NEVER print words like "FLOATING DOCK", "BRANDING DOCK", "Creator Name:", "Window 1", or diagram arrows on the background.

================================================================================
[SECTION 6: FINAL PRODUCTION VERIFICATION CHECKLIST]
================================================================================
Before rendering, verify compliance with every single requirement:
✓ 1. Canvas format is exactly 16:9 widescreen, clean and expansive.
✓ 2. Full-width showcase container occupying 90% to 94% canvas width.
✓ 3. Left side features EXTRA-LARGE, ULTRA-BOLD typography (Title: "${title}"), completely unboxed (ZERO BADGES).
✓ 4. Right side displays a realistic, sleek digital software UI dashboard without physical laptop hardware.
✓ 5. Bottom center prominently features the complete social branding dock: GitHub "dresar" • "Eka Syarif Maulana" • Instagram "@arif_ex21".
✓ 6. STRICTLY ZERO NEON: Natural, diffused studio daylight lighting with matte textures.
✓ 7. All UI copy is in clear, correct Bahasa Indonesia.

Generate the final 16:9 ultra-clean, authentic human-designed showcase thumbnail now adhering strictly to every single parameter specified above.`;

  return prompt;
}

export function countWords(str: string): number {
  if (!str) return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
}
