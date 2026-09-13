import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log('--- Migrating Database for /kerja Feature ---');

  // 1. Create kerja_config table
  await sql`
    CREATE TABLE IF NOT EXISTS kerja_config (
      id SERIAL PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    );
  `;
  console.log('✓ Table kerja_config ready');

  // 2. Create kerja_items table
  await sql`
    CREATE TABLE IF NOT EXISTS kerja_items (
      id SERIAL PRIMARY KEY,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      content_html TEXT NOT NULL,
      content_raw TEXT NOT NULL,
      "order" INTEGER DEFAULT 0 NOT NULL,
      is_active BOOLEAN DEFAULT TRUE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    );
  `;
  console.log('✓ Table kerja_items ready');

  // 3. Create kerja_documents table
  await sql`
    CREATE TABLE IF NOT EXISTS kerja_documents (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      file_url TEXT NOT NULL,
      file_type TEXT DEFAULT 'pdf' NOT NULL,
      file_size INTEGER DEFAULT 0 NOT NULL,
      description TEXT,
      "order" INTEGER DEFAULT 0 NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    );
  `;
  console.log('✓ Table kerja_documents ready');

  // 4. Seed default PIN: 280219 (Anti-duplicate / Upsert)
  await sql`
    INSERT INTO kerja_config (key, value, updated_at)
    VALUES ('pin', '280219', NOW())
    ON CONFLICT (key) DO UPDATE
    SET updated_at = NOW();
  `;
  console.log('✓ Default PIN configured: 280219');

  // 5. Seed Interview Script & Coaching Items (Anti-duplicate check)
  const scriptItemTitle = 'Elevator Pitch: Perkenalan Diri Wawancara Kerja';
  const existingScript = await sql`
    SELECT id FROM kerja_items WHERE title = ${scriptItemTitle} LIMIT 1;
  `;

  const scriptHtml = `
<div class="space-y-4 text-sm leading-relaxed text-slate-200">
  <div class="p-4 rounded-xl border border-sky-500/20 bg-sky-500/5 backdrop-blur-sm">
    <div class="flex items-center gap-2 mb-2">
      <span class="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-sky-500/20 text-sky-400 border border-sky-500/30">1. Identitas & Domisili</span>
      <span class="text-[11px] text-muted-foreground font-mono">[Tempo: Tenang & Ramah]</span>
    </div>
    <p class="text-base text-white">
      "Perkenalkan, nama saya <strong class="text-sky-400 font-semibold">Eka Syarif Maulana</strong>. Saya berdomisili di <span class="bg-sky-500/20 text-sky-200 px-1.5 py-0.5 rounded">Torgamba, Labuhanbatu Selatan, Sumatera Utara</span>."
    </p>
  </div>

  <div class="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm">
    <div class="flex items-center gap-2 mb-2">
      <span class="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">2. Latar Belakang Pendidikan</span>
      <span class="text-[11px] text-muted-foreground font-mono">[Tegaskan Prestasi]</span>
    </div>
    <p class="text-base text-white">
      "Saya merupakan lulusan Program Studi <strong class="text-emerald-400 font-semibold">Teknologi Informasi</strong> dari <strong class="text-emerald-300">Universitas Muhammadiyah Sumatera Utara</strong> dengan IPK <span class="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">3,68</span>. Saya memiliki minat besar di bidang teknologi informasi, khususnya dalam <span class="text-emerald-200 underline decoration-emerald-500/50">pengembangan aplikasi dan website</span>."
    </p>
  </div>

  <div class="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 backdrop-blur-sm">
    <div class="flex items-center gap-2 mb-2">
      <span class="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30">3. Pengalaman Kerja Praktik</span>
      <span class="text-[11px] text-muted-foreground font-mono">[Fokus Pada Solusi & Teknologi]</span>
    </div>
    <p class="text-base text-white">
      "Saya pernah menjalani kerja praktik sebagai <strong class="text-blue-400 font-semibold">Web Developer Intern</strong> di <strong class="text-blue-300">PT Pertamina Hulu Rokan, Rantau Field 1, Aceh Tamiang</strong>. Di sana, saya terlibat langsung dalam pengembangan website profil perusahaan dan sistem inventaris menggunakan framework modern <span class="bg-blue-500/20 text-blue-200 px-1.5 py-0.5 rounded font-mono font-bold">Next.js</span>. Dari pengalaman nyata tersebut, saya belajar bagaimana membangun aplikasi yang andal dan bekerja secara terstruktur dalam lingkungan profesional."
    </p>
  </div>

  <div class="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 backdrop-blur-sm">
    <div class="flex items-center gap-2 mb-2">
      <span class="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-purple-500/20 text-purple-400 border border-purple-500/30">4. Organisasi & Sertifikasi</span>
      <span class="text-[11px] text-muted-foreground font-mono">[Integritas & Kredensial]</span>
    </div>
    <p class="text-base text-white">
      "Selain di bidang teknis, saya pernah aktif memegang amanah organisasi sebagai <span class="bg-purple-500/20 text-purple-200 px-1.5 py-0.5 rounded">sekretaris sekaligus bendahara di OPPM</span>. Saya juga telah mengantongi sertifikat kompetensi resmi <span class="bg-purple-500/20 text-purple-200 px-1.5 py-0.5 rounded">Operator Komputer</span> dan <span class="bg-purple-500/20 text-purple-200 px-1.5 py-0.5 rounded">Microsoft Office</span>."
    </p>
  </div>

  <div class="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 backdrop-blur-sm">
    <div class="flex items-center gap-2 mb-2">
      <span class="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30">5. Komitmen & Penutup</span>
      <span class="text-[11px] text-muted-foreground font-mono">[Tegas, Antusias, & Santun]</span>
    </div>
    <p class="text-base text-white">
      "Saya adalah pribadi yang <strong class="text-rose-400">cepat belajar, bertanggung jawab, dan mudah beradaptasi</strong> dengan lingkungan baru. Saya siap mempelajari tumpukan teknologi yang digunakan perusahaan dan berkomitmen memberikan kontribusi nyata terbaik bagi tim."
    </p>
    <p class="text-base text-rose-300 font-semibold mt-2.5">
      "Terima kasih, Pak/Bu."
    </p>
  </div>
</div>
  `.trim();

  const scriptRaw = `Perkenalkan, nama saya Eka Syarif Maulana. Saya berdomisili di Torgamba, Labuhanbatu Selatan, Sumatera Utara.
Saya merupakan lulusan Program Studi Teknologi Informasi dari Universitas Muhammadiyah Sumatera Utara dengan IPK 3,68. Saya memiliki minat di bidang teknologi informasi, khususnya pengembangan aplikasi dan website.
Saya pernah menjalani kerja praktik sebagai Web Developer Intern di PT Pertamina Hulu Rokan, Rantau Field 1, Aceh Tamiang. Di sana, saya terlibat dalam pengembangan website profil perusahaan dan sistem inventaris menggunakan Next.js. Dari pengalaman tersebut, saya belajar bagaimana mengembangkan aplikasi dan bekerja dalam lingkungan profesional.
Selain itu, saya pernah aktif sebagai sekretaris sekaligus bendahara di OPPM. Saya juga memiliki sertifikat Operator Komputer dan Microsoft Office.
Saya orangnya mau belajar, bertanggung jawab, dan mudah beradaptasi. Saya siap mempelajari teknologi yang digunakan perusahaan dan berharap bisa memberikan kontribusi yang baik.
Terima kasih, Pak/Bu.`;

  if (existingScript.length === 0) {
    await sql`
      INSERT INTO kerja_items (category, title, content_html, content_raw, "order", is_active)
      VALUES (
        'perkenalan',
        ${scriptItemTitle},
        ${scriptHtml},
        ${scriptRaw},
        1,
        TRUE
      );
    `;
    console.log('✓ Seeded: Elevator pitch perkenalan diri');
  } else {
    await sql`
      UPDATE kerja_items
      SET content_html = ${scriptHtml}, content_raw = ${scriptRaw}, updated_at = NOW()
      WHERE id = ${existingScript[0].id};
    `;
    console.log('✓ Updated existing elevator pitch script');
  }

  // 6. Seed Coaching Advice Item (Anti-duplicate check)
  const coachingTitle = 'Panduan & Tips Wawancara HRD';
  const existingCoaching = await sql`
    SELECT id FROM kerja_items WHERE title = ${coachingTitle} LIMIT 1;
  `;

  const coachingHtml = `
<div class="space-y-4 text-sm text-slate-200">
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <div class="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
      <div class="flex items-center gap-2 mb-1.5 text-amber-400 font-semibold text-xs">
        <span>⏱️</span>
        <span>TEMPO BICARA (PACING)</span>
      </div>
      <p class="text-xs text-slate-300">
        Pas membaca atau memperkenalkan diri, <strong class="text-amber-300">jangan terlalu cepat</strong>. Anggap sedang ngobrol profesional secara natural dan santai. Berikan jeda sejenak antar paragraf untuk kontak mata.
      </p>
    </div>

    <div class="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
      <div class="flex items-center gap-2 mb-1.5 text-emerald-400 font-semibold text-xs">
        <span>🤝</span>
        <span>ETIKA PENUTUPAN</span>
      </div>
      <p class="text-xs text-slate-300">
        Jika HRD atau pewawancara belum mempersilakan Anda untuk bertanya balik, <strong class="text-emerald-300">cukup tutup dengan ucapan "Terima kasih, Pak/Bu"</strong>. Jangan mendahului alur wawancara sebelum diarahkan.
      </p>
    </div>

    <div class="p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5">
      <div class="flex items-center gap-2 mb-1.5 text-cyan-400 font-semibold text-xs">
        <span>🎯</span>
        <span>STRATEGI JAWABAN Q&A</span>
      </div>
      <p class="text-xs text-slate-300">
        Bila nanti muncul pertanyaan lanjutan dari pewawancara, jawablah secara <strong class="text-cyan-300">singkat, jelas, to the point, dan tetap tenang</strong> tanpa berbelit-belit.
      </p>
    </div>

    <div class="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5">
      <div class="flex items-center gap-2 mb-1.5 text-indigo-400 font-semibold text-xs">
        <span>💪</span>
        <span>SIKAP & ATITUDE</span>
      </div>
      <p class="text-xs text-slate-300">
        Tunjukkan kerendahan hati untuk terus belajar dipadukan dengan rasa percaya diri atas pengalaman nyata yang telah Anda selesaikan di Pertamina Hulu Rokan.
      </p>
    </div>
  </div>
</div>
  `.trim();

  const coachingRaw = `Pas bacanya jangan terlalu cepat, anggap lagi ngenalin diri biasa saja. Kalau HRD belum mempersilakan tanya balik, cukup tutup dengan "terima kasih". Nanti kalau ada pertanyaan, Mas jawab singkat, jelas, dan tetap tenang.`;

  if (existingCoaching.length === 0) {
    await sql`
      INSERT INTO kerja_items (category, title, content_html, content_raw, "order", is_active)
      VALUES (
        'tips',
        ${coachingTitle},
        ${coachingHtml},
        ${coachingRaw},
        2,
        TRUE
      );
    `;
    console.log('✓ Seeded: Tips & Panduan wawancara');
  } else {
    await sql`
      UPDATE kerja_items
      SET content_html = ${coachingHtml}, content_raw = ${coachingRaw}, updated_at = NOW()
      WHERE id = ${existingCoaching[0].id};
    `;
    console.log('✓ Updated existing tips & coaching item');
  }

  // 7. Seed BAN-PT UMSU Certificate Document (Anti-duplicate check)
  const docTitle = 'Sertifikat Akreditasi BAN-PT Baik Sekali (2025 - 2030)';
  const existingDoc = await sql`
    SELECT id FROM kerja_documents WHERE title = ${docTitle} LIMIT 1;
  `;

  if (existingDoc.length === 0) {
    await sql`
      INSERT INTO kerja_documents (title, category, file_url, file_type, file_size, description, "order")
      VALUES (
        ${docTitle},
        'sertifikat',
        '/media/uploads/TEKNOLOGI-INFORMASI-BAIK-SEKALI-2025-2030.pdf',
        'pdf',
        772205,
        'Sertifikat Akreditasi Resmi BAN-PT Program Studi Teknologi Informasi UMSU periode 2025 hingga 2030.',
        1
      );
    `;
    console.log('✓ Seeded: Dokumen Akreditasi BAN-PT TI UMSU');
  } else {
    console.log('✓ Dokumen Akreditasi BAN-PT sudah terdaftar (skip duplicate)');
  }

  console.log('\n--- Migration for /kerja Completed Successfully! ---');
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
