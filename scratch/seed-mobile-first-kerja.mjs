import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function seedMobileFirstKerja() {
  console.log('--- Seeding Mobile-First Super-Compact Data for /kerja ---');

  await sql`DELETE FROM kerja_items WHERE category = 'perkenalan';`;

  const perkenalanHtml = `
<div class="text-slate-200 space-y-4 text-xs sm:text-sm">

  <!-- ================= PROFILE HERO COMPACT ================= -->
  <div class="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-sky-500/10 via-slate-900/90 to-slate-900 border border-sky-500/20 space-y-3">
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30">
          INTERVIEW PREP
        </span>
        <span class="text-[10px] text-slate-400">Personal Learning</span>
      </div>
      <span class="text-[10px] text-emerald-400 font-mono">Durasi ± 1–2 menit</span>
    </div>

    <div>
      <h1 class="text-base sm:text-lg font-bold text-white tracking-tight">
        Perkenalan Diri <span class="text-sky-400">Eka Syarif Maulana</span>
      </h1>
      <p class="mt-1 text-[11px] sm:text-xs text-slate-400 leading-relaxed">
        Lulusan S1 Teknologi Informasi UMSU (IPK 3,68) dengan pengalaman nyata Web Developer Intern di PT Pertamina Hulu Rokan.
      </p>
    </div>

    <div class="grid grid-cols-4 gap-1.5 pt-1">
      <div class="p-2 rounded-lg bg-slate-950/70 border border-slate-800 text-center">
        <p class="text-[9px] text-slate-400 font-medium">IPK</p>
        <p class="text-xs sm:text-sm font-bold text-white mt-0.5">3,68</p>
      </div>
      <div class="p-2 rounded-lg bg-slate-950/70 border border-slate-800 text-center">
        <p class="text-[9px] text-slate-400 font-medium">Bidang</p>
        <p class="text-xs sm:text-sm font-semibold text-white mt-0.5">Web Dev</p>
      </div>
      <div class="p-2 rounded-lg bg-slate-950/70 border border-slate-800 text-center">
        <p class="text-[9px] text-slate-400 font-medium">Framework</p>
        <p class="text-xs sm:text-sm font-semibold text-white mt-0.5">Next.js</p>
      </div>
      <div class="p-2 rounded-lg bg-slate-950/70 border border-slate-800 text-center">
        <p class="text-[9px] text-slate-400 font-medium">Domisili</p>
        <p class="text-xs sm:text-sm font-semibold text-emerald-300 mt-0.5 truncate">Torgamba</p>
      </div>
    </div>
  </div>

  <!-- ================= MAIN INTRODUCTION SCRIPT (SUPER RAPAT) ================= -->
  <div class="rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-md">
    <div class="flex items-center justify-between px-3.5 py-2 border-b border-slate-800 bg-slate-800/40">
      <div class="flex items-center gap-2">
        <span class="size-2 rounded-full bg-rose-400/80"></span>
        <span class="size-2 rounded-full bg-amber-400/80"></span>
        <span class="size-2 rounded-full bg-emerald-400/80"></span>
        <span class="text-[11px] text-slate-400 font-mono ml-1">naskah-perkenalan.txt</span>
      </div>
      <span class="text-[10px] text-emerald-400 font-medium">● Siap Dihafal</span>
    </div>

    <div class="p-3 sm:p-4 space-y-3">
      <!-- 01 Pembuka -->
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span class="size-5 rounded bg-sky-500/20 text-sky-300 text-[10px] font-bold flex items-center justify-center shrink-0">01</span>
          <h3 class="font-semibold text-xs text-white">Pembuka & Identitas</h3>
        </div>
        <div class="pl-7">
          <p class="text-slate-200 leading-relaxed text-xs sm:text-sm">
            "Selamat pagi/siang, Bapak/Ibu. Perkenalkan, nama saya <strong class="text-sky-300">Eka Syarif Maulana</strong>. Saya berdomisili di <strong class="text-white">Torgamba, Labuhanbatu Selatan, Sumatera Utara</strong>."
          </p>
          <div class="mt-1 p-1.5 rounded bg-slate-950/40 border-l-2 border-sky-500/40 text-[10px] text-slate-400">
            Tujuan: Buka percakapan sopan, sampaikan identitas & domisili secara singkat.
          </div>
        </div>
      </div>

      <div class="h-px bg-slate-800/60"></div>

      <!-- 02 Pendidikan -->
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span class="size-5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold flex items-center justify-center shrink-0">02</span>
          <h3 class="font-semibold text-xs text-white">Pendidikan</h3>
        </div>
        <div class="pl-7">
          <p class="text-slate-200 leading-relaxed text-xs sm:text-sm">
            "Saya merupakan lulusan <strong class="text-emerald-300">S1 Teknologi Informasi</strong> dari <strong class="text-white">Universitas Muhammadiyah Sumatera Utara</strong> dengan IPK <strong class="text-emerald-300">3,68</strong>. Selama kuliah, saya mempelajari rekayasa perangkat lunak, pengembangan website/aplikasi, serta basis data."
          </p>
          <div class="mt-1 p-1.5 rounded bg-slate-950/40 border-l-2 border-emerald-500/40 text-[10px] text-slate-400">
            Tujuan: Hubungkan jurusan dan prestasi akademik dengan posisi pekerjaan.
          </div>
        </div>
      </div>

      <div class="h-px bg-slate-800/60"></div>

      <!-- 03 Keahlian Teknis -->
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span class="size-5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold flex items-center justify-center shrink-0">03</span>
          <h3 class="font-semibold text-xs text-white">Keahlian Teknis</h3>
        </div>
        <div class="pl-7">
          <p class="text-slate-200 leading-relaxed text-xs sm:text-sm">
            "Untuk kemampuan teknis, fokus saya ada di bidang <strong class="text-blue-300">web development</strong>. Saya terbiasa menggunakan <span class="px-1 py-0.5 rounded bg-slate-800 text-sky-300 font-mono text-[11px]">JavaScript</span> dan framework <span class="px-1 py-0.5 rounded bg-slate-800 text-sky-300 font-mono text-[11px]">Next.js</span>, serta memahami <span class="px-1 py-0.5 rounded bg-slate-800 text-sky-300 font-mono text-[11px]">HTML</span>, <span class="px-1 py-0.5 rounded bg-slate-800 text-sky-300 font-mono text-[11px]">CSS</span>, dan konsep pengelolaan database."
          </p>
          <div class="mt-1 p-1.5 rounded bg-slate-950/40 border-l-2 border-blue-500/40 text-[10px] text-slate-400">
            Tujuan: Tunjukkan stack teknis yang dikuasai secara lugas.
          </div>
        </div>
      </div>

      <div class="h-px bg-slate-800/60"></div>

      <!-- 04 Magang -->
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span class="size-5 rounded bg-violet-500/20 text-violet-300 text-[10px] font-bold flex items-center justify-center shrink-0">04</span>
          <h3 class="font-semibold text-xs text-white">Pengalaman Kerja Praktik</h3>
        </div>
        <div class="pl-7">
          <p class="text-slate-200 leading-relaxed text-xs sm:text-sm">
            "Pengalaman paling relevan saya dapatkan saat menjalani kerja praktik sebagai <strong class="text-violet-300">Web Developer Intern di PT Pertamina Hulu Rokan</strong>, Rantau Field 1, Aceh Tamiang. Di sana, saya terlibat mengembangkan website profil perusahaan dan sistem inventaris menggunakan <span class="px-1 py-0.5 rounded bg-slate-800 text-sky-300 font-mono text-[11px]">Next.js</span>. Saya belajar memahami alur kebutuhan staf dan mengimplementasikannya ke dalam fitur aplikasi."
          </p>
          <div class="mt-1 p-1.5 rounded bg-slate-950/40 border-l-2 border-violet-500/40 text-[10px] text-slate-400">
            Tujuan: Bukti nyata penerapan teknis di lingkungan industri BUMN.
          </div>
        </div>
      </div>

      <div class="h-px bg-slate-800/60"></div>

      <!-- 05 Organisasi & Freelance -->
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span class="size-5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold flex items-center justify-center shrink-0">05</span>
          <h3 class="font-semibold text-xs text-white">Pengalaman Tambahan</h3>
        </div>
        <div class="pl-7">
          <p class="text-slate-200 leading-relaxed text-xs sm:text-sm">
            "Selain itu, saya pernah menjabat sebagai <strong class="text-amber-300">sekretaris sekaligus bendahara di OPPM</strong>, serta memiliki pengalaman freelance dalam pembuatan presentasi dan penyusunan dokumen. Dari pengalaman ini saya melatih manajemen waktu, ketelitian, dan koordinasi tim."
          </p>
          <div class="mt-1 p-1.5 rounded bg-slate-950/40 border-l-2 border-amber-500/40 text-[10px] text-slate-400">
            Tujuan: Tunjukkan soft skills, integritas, dan kedisiplinan kerja.
          </div>
        </div>
      </div>

      <div class="h-px bg-slate-800/60"></div>

      <!-- 06 Sertifikasi -->
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span class="size-5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold flex items-center justify-center shrink-0">06</span>
          <h3 class="font-semibold text-xs text-white">Sertifikasi</h3>
        </div>
        <div class="pl-7">
          <p class="text-slate-200 leading-relaxed text-xs sm:text-sm">
            "Saya juga telah mengantongi sertifikat resmi <strong class="text-cyan-300">Operator Komputer</strong> dan <strong class="text-cyan-300">Microsoft Office</strong> sebagai penunjang kemampuan teknis dan administrasi perkantoran."
          </p>
        </div>
      </div>

      <div class="h-px bg-slate-800/60"></div>

      <!-- 07 Penutup -->
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span class="size-5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold flex items-center justify-center shrink-0">07</span>
          <h3 class="font-semibold text-xs text-white">Penutup</h3>
        </div>
        <div class="pl-7">
          <p class="text-slate-200 leading-relaxed text-xs sm:text-sm">
            "Saya adalah pribadi yang <strong class="text-rose-300">cepat belajar, bertanggung jawab, dan mudah beradaptasi</strong>. Jika ada teknologi baru yang belum saya kuasai, saya siap mempelajarinya dengan cepat dan berkomitmen memberikan kontribusi terbaik bagi tim. Terima kasih, Bapak/Ibu."
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- ================= VOCABULARY & PHRASES COMPACT ================= -->
  <div class="p-3 sm:p-4 rounded-xl border border-slate-800 bg-slate-900/70 space-y-2.5">
    <div class="flex items-center justify-between">
      <h3 class="font-semibold text-xs text-white flex items-center gap-1.5">
        <span>💬</span>
        <span>Kalimat Kunci Respon Interview</span>
      </h3>
      <span class="text-[10px] text-amber-400 font-mono">Praktek Cepat</span>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
      <div class="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1">
        <p class="text-[10px] text-sky-400 font-semibold uppercase">Ditanya Keahlian</p>
        <p class="text-slate-300 leading-snug">
          "Fokus saya di web development menggunakan JavaScript dan Next.js, dan saya terus memperdalam kemampuan teknis saya."
        </p>
      </div>

      <div class="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1">
        <p class="text-[10px] text-violet-400 font-semibold uppercase">Ditanya Pengalaman Magang</p>
        <p class="text-slate-300 leading-snug">
          "Saya pernah magang di PT Pertamina Hulu Rokan, terlibat langsung membangun website profil dan sistem inventaris dengan Next.js."
        </p>
      </div>

      <div class="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1">
        <p class="text-[10px] text-emerald-400 font-semibold uppercase">Ditanya Teknologi Baru</p>
        <p class="text-slate-300 leading-snug">
          "Saya siap mempelajari teknologi yang digunakan perusahaan melalui dokumentasi resmi dan praktek langsung secara cepat."
        </p>
      </div>

      <div class="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1">
        <p class="text-[10px] text-amber-400 font-semibold uppercase">Ditanya Kelebihan Diri</p>
        <p class="text-slate-300 leading-snug">
          "Saya teliti, bertanggung jawab, mudah beradaptasi, dan terbiasa bekerja mandiri maupun kolaboratif dalam tim."
        </p>
      </div>
    </div>
  </div>

  <!-- ================= PRACTICE CHECKLIST COMPACT ================= -->
  <div class="p-3 sm:p-4 rounded-xl border border-slate-800 bg-slate-900/70 space-y-2">
    <div class="flex items-center justify-between">
      <h3 class="font-semibold text-xs text-white flex items-center gap-1.5">
        <span>✅</span>
        <span>Checklist Sebelum Interview</span>
      </h3>
      <span class="text-[10px] text-slate-400">Siap Mental</span>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
      <div class="flex items-start gap-2 p-2 rounded-lg bg-slate-950/40 border border-slate-800/60">
        <span class="text-emerald-400 font-bold shrink-0">✓</span>
        <span class="text-slate-300 leading-tight">Hafal identitas, UMSU S1 TI, IPK 3,68, dan asal Torgamba.</span>
      </div>
      <div class="flex items-start gap-2 p-2 rounded-lg bg-slate-950/40 border border-slate-800/60">
        <span class="text-emerald-400 font-bold shrink-0">✓</span>
        <span class="text-slate-300 leading-tight">Paham cerita proyek Next.js di Pertamina Hulu Rokan.</span>
      </div>
      <div class="flex items-start gap-2 p-2 rounded-lg bg-slate-950/40 border border-slate-800/60">
        <span class="text-emerald-400 font-bold shrink-0">✓</span>
        <span class="text-slate-300 leading-tight">Jelaskan amanah bendahara & sekretaris OPPM (teliti & disiplin).</span>
      </div>
      <div class="flex items-start gap-2 p-2 rounded-lg bg-slate-950/40 border border-slate-800/60">
        <span class="text-emerald-400 font-bold shrink-0">✓</span>
        <span class="text-slate-300 leading-tight">Bicara santai, jangan tergesa-gesa, dan tutup: "Terima kasih, Pak/Bu."</span>
      </div>
    </div>
  </div>

</div>
  `.trim();

  const perkenalanRaw = `Selamat pagi/siang, Bapak/Ibu.
Perkenalkan, nama saya Eka Syarif Maulana. Saya berdomisili di Torgamba, Labuhanbatu Selatan, Sumatera Utara.
Saya merupakan lulusan S1 Teknologi Informasi dari Universitas Muhammadiyah Sumatera Utara dengan IPK 3,68. Selama kuliah, saya mempelajari pengembangan perangkat lunak, website, dan basis data.
Untuk kemampuan teknis, saya memiliki dasar di bidang web development, khususnya menggunakan JavaScript dan Next.js, didukung pemahaman HTML, CSS, dan database.
Pengalaman yang paling relevan saya dapatkan saat menjalani kerja praktik sebagai Web Developer Intern di PT Pertamina Hulu Rokan, Rantau Field 1, Aceh Tamiang. Di sana, saya terlibat dalam pengembangan website profil perusahaan dan sistem inventaris menggunakan Next.js.
Selain itu, saya pernah menjadi sekretaris sekaligus bendahara di OPPM serta memiliki pengalaman freelance pembuatan presentasi dan penyusunan dokumen. Dari pengalaman tersebut saya belajar mengatur pekerjaan, berkomunikasi, dan menyelesaikan tugas sesuai kebutuhan.
Saya juga memiliki sertifikat Operator Komputer dan Microsoft Office.
Saya orangnya mau belajar, bertanggung jawab, dan mudah beradaptasi. Saya siap mempelajari teknologi perusahaan dan memberikan kontribusi terbaik bagi tim.
Terima kasih, Bapak/Ibu.`;

  await sql`
    INSERT INTO kerja_items (category, title, content_html, content_raw, "order", is_active)
    VALUES (
      'perkenalan',
      'Perkenalan Diri Wawancara Kerja',
      ${perkenalanHtml},
      ${perkenalanRaw},
      1,
      TRUE
    );
  `;
  console.log('✓ Seeded Mobile-First Super-Compact Perkenalan Diri!');
}

seedMobileFirstKerja().catch(e => {
  console.error('Seed failed:', e);
  process.exit(1);
});
