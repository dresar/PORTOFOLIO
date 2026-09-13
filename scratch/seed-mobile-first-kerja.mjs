import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function seedMobileFirstKerja() {
  await sql`DELETE FROM kerja_items WHERE category = 'perkenalan';`;

  const perkenalanHtml = `<div class="w-full space-y-2 text-slate-200 text-xs">

  <div class="w-full p-2.5 sm:p-3 rounded-lg bg-gradient-to-br from-sky-500/10 via-slate-900/90 to-slate-900 border border-sky-500/20 space-y-2">
    <div class="flex items-center justify-between gap-1.5">
      <div class="flex items-center gap-1.5">
        <span class="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30">
          INTERVIEW PREP
        </span>
        <span class="text-[9px] text-slate-400">Personal Learning</span>
      </div>
      <span class="text-[9px] text-emerald-400 font-mono">± 1–2 menit</span>
    </div>

    <div>
      <h1 class="text-sm sm:text-base font-bold text-white tracking-tight">
        Perkenalan Diri <span class="text-sky-400">Eka Syarif Maulana</span>
      </h1>
      <p class="mt-0.5 text-[11px] text-slate-400 leading-snug">
        Lulusan S1 Teknologi Informasi UMSU (IPK 3,68) · Web Developer Intern PT Pertamina Hulu Rokan.
      </p>
    </div>

    <div class="grid grid-cols-4 gap-1 pt-0.5">
      <div class="p-1 rounded-md bg-slate-950/70 border border-slate-800 text-center">
        <p class="text-[8px] text-slate-400">IPK</p>
        <p class="text-[11px] font-bold text-white">3,68</p>
      </div>
      <div class="p-1 rounded-md bg-slate-950/70 border border-slate-800 text-center">
        <p class="text-[8px] text-slate-400">Bidang</p>
        <p class="text-[11px] font-semibold text-white truncate">Web Dev</p>
      </div>
      <div class="p-1 rounded-md bg-slate-950/70 border border-slate-800 text-center">
        <p class="text-[8px] text-slate-400">Tech</p>
        <p class="text-[11px] font-semibold text-white truncate">Next.js</p>
      </div>
      <div class="p-1 rounded-md bg-slate-950/70 border border-slate-800 text-center">
        <p class="text-[8px] text-slate-400">Domisili</p>
        <p class="text-[11px] font-semibold text-emerald-300 truncate">Torgamba</p>
      </div>
    </div>
  </div>

  <div class="w-full rounded-lg border border-slate-800 bg-slate-900/80 overflow-hidden">
    <div class="flex items-center justify-between px-2.5 py-1.5 border-b border-slate-800 bg-slate-800/40">
      <div class="flex items-center gap-1.5">
        <span class="size-1.5 rounded-full bg-rose-400/80"></span>
        <span class="size-1.5 rounded-full bg-amber-400/80"></span>
        <span class="size-1.5 rounded-full bg-emerald-400/80"></span>
        <span class="text-[10px] text-slate-400 font-mono ml-0.5">naskah-perkenalan.txt</span>
      </div>
      <span class="text-[9px] text-emerald-400 font-medium">● Siap Dihafal</span>
    </div>

    <div class="p-2.5 space-y-2">
      <div class="space-y-1">
        <div class="flex items-center gap-1.5">
          <span class="size-4 rounded bg-sky-500/20 text-sky-300 text-[9px] font-bold flex items-center justify-center shrink-0">01</span>
          <h3 class="font-semibold text-xs text-white">Pembuka & Identitas</h3>
        </div>
        <div class="pl-5 space-y-1">
          <p class="text-slate-200 leading-snug text-[11px] sm:text-xs">
            "Selamat pagi/siang, Bapak/Ibu. Perkenalkan, nama saya <strong class="text-sky-300">Eka Syarif Maulana</strong>. Saya berdomisili di <strong class="text-white">Torgamba, Labuhanbatu Selatan, Sumatera Utara</strong>."
          </p>
          <div class="p-1 rounded bg-slate-950/50 border-l-2 border-sky-500/40 text-[9px] text-slate-400">
            Tujuan: Buka percakapan sopan, sampaikan identitas & domisili secara singkat.
          </div>
        </div>
      </div>

      <div class="h-px bg-slate-800/60"></div>

      <div class="space-y-1">
        <div class="flex items-center gap-1.5">
          <span class="size-4 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold flex items-center justify-center shrink-0">02</span>
          <h3 class="font-semibold text-xs text-white">Pendidikan</h3>
        </div>
        <div class="pl-5 space-y-1">
          <p class="text-slate-200 leading-snug text-[11px] sm:text-xs">
            "Saya merupakan lulusan <strong class="text-emerald-300">S1 Teknologi Informasi</strong> dari <strong class="text-white">Universitas Muhammadiyah Sumatera Utara</strong> dengan IPK <strong class="text-emerald-300">3,68</strong>. Selama kuliah, saya mempelajari rekayasa perangkat lunak, pengembangan website/aplikasi, serta basis data."
          </p>
          <div class="p-1 rounded bg-slate-950/50 border-l-2 border-emerald-500/40 text-[9px] text-slate-400">
            Tujuan: Hubungkan jurusan dan prestasi akademik dengan posisi pekerjaan.
          </div>
        </div>
      </div>

      <div class="h-px bg-slate-800/60"></div>

      <div class="space-y-1">
        <div class="flex items-center gap-1.5">
          <span class="size-4 rounded bg-blue-500/20 text-blue-300 text-[9px] font-bold flex items-center justify-center shrink-0">03</span>
          <h3 class="font-semibold text-xs text-white">Keahlian Teknis</h3>
        </div>
        <div class="pl-5 space-y-1">
          <p class="text-slate-200 leading-snug text-[11px] sm:text-xs">
            "Untuk kemampuan teknis, fokus saya di bidang <strong class="text-blue-300">web development</strong>. Terbiasa menggunakan <span class="px-1 py-0.2 rounded bg-slate-800 text-sky-300 font-mono text-[10px]">JavaScript</span> dan <span class="px-1 py-0.2 rounded bg-slate-800 text-sky-300 font-mono text-[10px]">Next.js</span>, serta memahami <span class="px-1 py-0.2 rounded bg-slate-800 text-sky-300 font-mono text-[10px]">HTML</span>, <span class="px-1 py-0.2 rounded bg-slate-800 text-sky-300 font-mono text-[10px]">CSS</span>, dan pengelolaan database."
          </p>
          <div class="p-1 rounded bg-slate-950/50 border-l-2 border-blue-500/40 text-[9px] text-slate-400">
            Tujuan: Tunjukkan stack teknis yang dikuasai secara lugas.
          </div>
        </div>
      </div>

      <div class="h-px bg-slate-800/60"></div>

      <div class="space-y-1">
        <div class="flex items-center gap-1.5">
          <span class="size-4 rounded bg-violet-500/20 text-violet-300 text-[9px] font-bold flex items-center justify-center shrink-0">04</span>
          <h3 class="font-semibold text-xs text-white">Pengalaman Kerja Praktik</h3>
        </div>
        <div class="pl-5 space-y-1">
          <p class="text-slate-200 leading-snug text-[11px] sm:text-xs">
            "Pengalaman paling relevan saat menjalani kerja praktik sebagai <strong class="text-violet-300">Web Developer Intern di PT Pertamina Hulu Rokan</strong>, Rantau Field 1. Di sana, saya mengembangkan website profil perusahaan dan sistem inventaris menggunakan <span class="px-1 py-0.2 rounded bg-slate-800 text-sky-300 font-mono text-[10px]">Next.js</span>."
          </p>
          <div class="p-1 rounded bg-slate-950/50 border-l-2 border-violet-500/40 text-[9px] text-slate-400">
            Tujuan: Bukti nyata penerapan teknis di lingkungan industri BUMN.
          </div>
        </div>
      </div>

      <div class="h-px bg-slate-800/60"></div>

      <div class="space-y-1">
        <div class="flex items-center gap-1.5">
          <span class="size-4 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold flex items-center justify-center shrink-0">05</span>
          <h3 class="font-semibold text-xs text-white">Pengalaman Tambahan</h3>
        </div>
        <div class="pl-5 space-y-1">
          <p class="text-slate-200 leading-snug text-[11px] sm:text-xs">
            "Selain itu, saya pernah menjadi <strong class="text-amber-300">sekretaris sekaligus bendahara OPPM</strong>, serta pengalaman freelance pembuatan presentasi & penyusunan dokumen yang melatih kedisiplinan dan komunikasi."
          </p>
          <div class="p-1 rounded bg-slate-950/50 border-l-2 border-amber-500/40 text-[9px] text-slate-400">
            Tujuan: Menunjukkan soft skills, integritas, dan manajemen waktu.
          </div>
        </div>
      </div>

      <div class="h-px bg-slate-800/60"></div>

      <div class="space-y-1">
        <div class="flex items-center gap-1.5">
          <span class="size-4 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-bold flex items-center justify-center shrink-0">06</span>
          <h3 class="font-semibold text-xs text-white">Sertifikasi</h3>
        </div>
        <div class="pl-5">
          <p class="text-slate-200 leading-snug text-[11px] sm:text-xs">
            "Saya memiliki sertifikat resmi <strong class="text-cyan-300">Operator Komputer</strong> dan <strong class="text-cyan-300">Microsoft Office</strong> sebagai penunjang teknis & administrasi."
          </p>
        </div>
      </div>

      <div class="h-px bg-slate-800/60"></div>

      <div class="space-y-1">
        <div class="flex items-center gap-1.5">
          <span class="size-4 rounded bg-rose-500/20 text-rose-300 text-[9px] font-bold flex items-center justify-center shrink-0">07</span>
          <h3 class="font-semibold text-xs text-white">Penutup</h3>
        </div>
        <div class="pl-5 space-y-1">
          <p class="text-slate-200 leading-snug text-[11px] sm:text-xs">
            "Saya siap belajar, bertanggung jawab, dan mudah beradaptasi. Bila ada teknologi baru di perusahaan, saya siap mempelajarinya dengan cepat untuk memberi kontribusi terbaik. Terima kasih."
          </p>
          <div class="p-1 rounded bg-slate-950/50 border-l-2 border-rose-500/40 text-[9px] text-slate-400">
            Tujuan: Menutup dengan sikap positif, komitmen, dan kemauan bertumbuh.
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="w-full space-y-1.5">
    <h2 class="text-xs font-bold text-white px-0.5">Istilah Teknis (Interview Vocab)</h2>
    <div class="grid grid-cols-2 gap-1.5">
      <div class="p-2 rounded-lg bg-slate-900/80 border border-slate-800 space-y-0.5">
        <h4 class="font-semibold text-[11px] text-white">Web Development</h4>
        <p class="text-[10px] text-slate-400 leading-tight">Membangun website & sistem web dari UI hingga data.</p>
      </div>
      <div class="p-2 rounded-lg bg-slate-900/80 border border-slate-800 space-y-0.5">
        <h4 class="font-semibold text-[11px] text-white">Front-End</h4>
        <p class="text-[10px] text-slate-400 leading-tight">Tampilan visual & interaksi pengguna (HTML, CSS, JS).</p>
      </div>
      <div class="p-2 rounded-lg bg-slate-900/80 border border-slate-800 space-y-0.5">
        <h4 class="font-semibold text-[11px] text-white">Next.js</h4>
        <p class="text-[10px] text-slate-400 leading-tight">Framework React modern untuk performa tinggi & SSR.</p>
      </div>
      <div class="p-2 rounded-lg bg-slate-900/80 border border-slate-800 space-y-0.5">
        <h4 class="font-semibold text-[11px] text-white">Database</h4>
        <p class="text-[10px] text-slate-400 leading-tight">Penyimpanan dan pengelolaan struktur data aplikasi.</p>
      </div>
    </div>
  </div>

  <div class="w-full space-y-1.5">
    <h2 class="text-xs font-bold text-white px-0.5">Kalimat Kunci Interview</h2>
    <div class="space-y-1">
      <div class="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
        <p class="text-[10px] font-semibold text-amber-300 mb-0.5">Bila ditanya keahlian:</p>
        <p class="text-[11px] text-slate-200 leading-snug">"Saya memiliki dasar di bidang web development dengan JavaScript & Next.js, dan terus aktif memperdalam skill teknis saya."</p>
      </div>
      <div class="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
        <p class="text-[10px] font-semibold text-amber-300 mb-0.5">Bila belum tahu jawaban:</p>
        <p class="text-[11px] text-slate-200 leading-snug">"Untuk bagian itu saya belum mendalami secara detail, namun saya tertarik mempelajarinya dan siap menyesuaikan kebutuhan tim."</p>
      </div>
    </div>
  </div>

  <div class="w-full p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
    <h2 class="text-xs font-bold text-white">Checklist Persiapan Mental</h2>
    <div class="grid grid-cols-2 gap-1 text-[10px] text-slate-300">
      <div class="flex items-center gap-1.5">
        <span class="text-emerald-400 text-xs">✓</span>
        <span>Hafal nama, prodi, IPK</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="text-emerald-400 text-xs">✓</span>
        <span>Jelas sebut tech stack</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="text-emerald-400 text-xs">✓</span>
        <span>Fasih cerita magang Rokan</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="text-emerald-400 text-xs">✓</span>
        <span>Bicara tenang & teratur</span>
      </div>
    </div>
  </div>

</div>`;

  const rawText = `Perkenalan Diri Wawancara Kerja - Eka Syarif Maulana
S1 Teknologi Informasi UMSU (IPK 3,68) - Domisili Torgamba, Labuhanbatu Selatan, Sumatera Utara.
Pengalaman: Web Developer Intern di PT Pertamina Hulu Rokan (Next.js), Sekretaris & Bendahara OPPM, Freelance Administrasi.
Sertifikat: Operator Komputer & Microsoft Office.`;

  await sql`
    INSERT INTO kerja_items (category, title, content_html, content_raw, "order")
    VALUES (
      'perkenalan',
      'Perkenalan Diri Wawancara Kerja',
      ${perkenalanHtml},
      ${rawText},
      1
    );
  `;

  console.log('Mobile-first perkenalan data inserted successfully into Neon!');
}

seedMobileFirstKerja().catch(console.error);
