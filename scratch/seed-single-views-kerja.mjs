import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function seedSingleViewsKerja() {
  await sql`DELETE FROM kerja_items;`;

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

  const tipsHtml = `<div class="w-full space-y-2 text-slate-200 text-xs">

  <div class="w-full p-2.5 sm:p-3 rounded-lg bg-gradient-to-br from-amber-500/10 via-slate-900/90 to-slate-900 border border-amber-500/20 space-y-1">
    <div class="flex items-center gap-1.5">
      <span class="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
        TIPS & PANDUAN HRD
      </span>
      <span class="text-[9px] text-slate-400">Master Guide</span>
    </div>
    <h1 class="text-sm sm:text-base font-bold text-white tracking-tight">
      Sikap, Bahasa Tubuh & Strategi Menjawab
    </h1>
    <p class="text-[11px] text-slate-400 leading-snug">
      Prinsip komunikasi profesional agar terkesan tenang, terarah, dan matang di mata HRD.
    </p>
  </div>

  <div class="w-full p-2.5 rounded-lg border border-slate-800 bg-slate-900/80 space-y-2">
    <h2 class="text-xs font-bold text-white flex items-center gap-1.5">
      <span class="size-4 rounded bg-sky-500/20 text-sky-300 text-[10px] font-bold flex items-center justify-center">1</span>
      Tempo Bicara & Ketenangan (Body Language)
    </h2>
    <div class="grid grid-cols-2 gap-1.5 text-[11px]">
      <div class="p-2 rounded bg-slate-950/60 border border-slate-800/80 space-y-0.5">
        <p class="font-semibold text-sky-300 text-[10px]">Tempo 120-140 WPM</p>
        <p class="text-slate-300 text-[10px] leading-snug">Bicara tenang seperti mengobrol terarah. Jangan terburu-buru seperti membaca teks cepat.</p>
      </div>
      <div class="p-2 rounded bg-slate-950/60 border border-slate-800/80 space-y-0.5">
        <p class="font-semibold text-emerald-300 text-[10px]">Kontak Mata & Senyum</p>
        <p class="text-slate-300 text-[10px] leading-snug">Tatap pewawancara dengan ramah dan percaya diri. Senyum hangat di awal dan akhir kalimat.</p>
      </div>
      <div class="p-2 rounded bg-slate-950/60 border border-slate-800/80 space-y-0.5">
        <p class="font-semibold text-amber-300 text-[10px]">Tegaskan Poin Kunci</p>
        <p class="text-slate-300 text-[10px] leading-snug">Artikulasikan dengan tegas: S1 TI UMSU, IPK 3,68, dan Web Developer Intern Pertamina Hulu Rokan.</p>
      </div>
      <div class="p-2 rounded bg-slate-950/60 border border-slate-800/80 space-y-0.5">
        <p class="font-semibold text-rose-300 text-[10px]">Jeda 1 Detik Alami</p>
        <p class="text-slate-300 text-[10px] leading-snug">Jika berpikir, ambil jeda tenang 1 detik tanpa mengucapkan gumaman "eee" atau "hmmm".</p>
      </div>
    </div>
  </div>

  <div class="w-full p-2.5 rounded-lg border border-slate-800 bg-slate-900/80 space-y-2">
    <h2 class="text-xs font-bold text-white flex items-center gap-1.5">
      <span class="size-4 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold flex items-center justify-center">2</span>
      Metode STAR untuk Menjawab Pengalaman
    </h2>
    <div class="space-y-1 text-[11px]">
      <div class="p-1.5 rounded bg-slate-950/60 border-l-2 border-sky-400">
        <span class="font-semibold text-sky-400">S · Situation:</span>
        <span class="text-slate-300 ml-1">"Saat magang di Pertamina Hulu Rokan Rantau Field, sistem pencatatan inventaris barang operasional membutuhkan aplikasi terpusat."</span>
      </div>
      <div class="p-1.5 rounded bg-slate-950/60 border-l-2 border-emerald-400">
        <span class="font-semibold text-emerald-400">T · Task:</span>
        <span class="text-slate-300 ml-1">"Tanggung jawab saya merancang antarmuka sistem inventaris dan membarui profil web perusahaan."</span>
      </div>
      <div class="p-1.5 rounded bg-slate-950/60 border-l-2 border-indigo-400">
        <span class="font-semibold text-indigo-400">A · Action:</span>
        <span class="text-slate-300 ml-1">"Saya menggunakan Next.js dan Tailwind CSS agar sistem responsif, cepat, dan mudah digunakan staf lapangan."</span>
      </div>
      <div class="p-1.5 rounded bg-slate-950/60 border-l-2 border-rose-400">
        <span class="font-semibold text-rose-400">R · Result:</span>
        <span class="text-slate-300 ml-1">"Aplikasi berjalan stabil, pencarian barang jauh lebih cepat, dan proyek selesai tepat waktu dengan evaluasi memuaskan."</span>
      </div>
    </div>
  </div>

  <div class="w-full p-2.5 rounded-lg border border-slate-800 bg-slate-900/80 space-y-1.5">
    <h2 class="text-xs font-bold text-white flex items-center gap-1.5">
      <span class="size-4 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold flex items-center justify-center">3</span>
      Etika Penutupan & Pertanyaan Balik
    </h2>
    <div class="space-y-1 text-[11px] text-slate-300">
      <p class="p-2 rounded bg-slate-950/60 border border-slate-800">
        <strong class="text-white">Saat perkenalan selesai:</strong> Jangan langsung tanya balik. Cukup tersenyum ramah dan tutup: <span class="text-amber-300 font-semibold">"Sekian perkenalan singkat dari saya. Terima kasih, Bapak/Ibu."</span>
      </p>
      <p class="p-2 rounded bg-slate-950/60 border border-slate-800">
        <strong class="text-white">Bila dipersilakan bertanya balik:</strong> Tanyakan hal relevan seperti: <span class="text-sky-300 italic">"Apa ekspektasi utama yang diharapkan dari peran ini dalam 3 bulan pertama?"</span>
      </p>
    </div>
  </div>

</div>`;

  const qaHtml = `<div class="w-full space-y-2 text-slate-200 text-xs">

  <div class="w-full p-2.5 sm:p-3 rounded-lg bg-gradient-to-br from-emerald-500/10 via-slate-900/90 to-slate-900 border border-emerald-500/20 space-y-1">
    <div class="flex items-center gap-1.5">
      <span class="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
        BANK WAWANCARA
      </span>
      <span class="text-[9px] text-slate-400">8 Pertanyaan Inti & Jawaban Kunci</span>
    </div>
    <h1 class="text-sm sm:text-base font-bold text-white tracking-tight">
      Simulasi Tanya-Jawab Interview Lengkap
    </h1>
    <p class="text-[11px] text-slate-400 leading-snug">
      Rangkuman respon terarah, terstruktur, dan berbasis pengalaman nyata.
    </p>
  </div>

  <div class="w-full space-y-1.5">

    <div class="w-full p-2.5 rounded-lg border border-slate-800 bg-slate-900/80 space-y-1">
      <div class="flex items-center gap-1.5">
        <span class="size-4 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[9px] flex items-center justify-center font-semibold shrink-0">01</span>
        <h3 class="font-semibold text-xs text-white">Ceritakan Peran & Proyek di Pertamina Hulu Rokan</h3>
      </div>
      <div class="pl-5 space-y-0.5 text-[11px] text-slate-300 leading-snug">
        <p class="text-slate-400 text-[10px] italic">"Bisa ceritakan apa saja tanggung jawab dan proyek yang dikerjakan saat kerja praktik?"</p>
        <p>"Selama kerja praktik di <strong class="text-sky-300">PT Pertamina Hulu Rokan Zona 1 Field Rantau</strong>, saya bertugas sebagai Web Developer Intern. Saya mengembangkan sistem inventaris dan memperbarui website profil perusahaan menggunakan <strong class="text-white">Next.js dan Tailwind CSS</strong>. Fokus saya adalah kemudahan navigasi bagi staf dalam mencatat barang secara cepat dan minim salah input. Proyek selesai tepat waktu dan berjalan stabil."</p>
      </div>
    </div>

    <div class="w-full p-2.5 rounded-lg border border-slate-800 bg-slate-900/80 space-y-1">
      <div class="flex items-center gap-1.5">
        <span class="size-4 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[9px] flex items-center justify-center font-semibold shrink-0">02</span>
        <h3 class="font-semibold text-xs text-white">Mengapa Memilih Next.js Dibanding React Murni?</h3>
      </div>
      <div class="pl-5 space-y-0.5 text-[11px] text-slate-300 leading-snug">
        <p class="text-slate-400 text-[10px] italic">"Apa keunggulan Next.js dalam proyek web yang Anda buat?"</p>
        <p>"Next.js menawarkan fleksibilitas <strong class="text-indigo-300">SSR (Server-Side Rendering) dan SSG</strong>, membuat muat halaman sangat instan dan ramah SEO. Struktur App Router berbasis foldernya membuat kode sangat rapi, modular, dan mudah dikolaborasikan bersama tim tanpa perlu setup routing eksternal yang rumit."</p>
      </div>
    </div>

    <div class="w-full p-2.5 rounded-lg border border-slate-800 bg-slate-900/80 space-y-1">
      <div class="flex items-center gap-1.5">
        <span class="size-4 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[9px] flex items-center justify-center font-semibold shrink-0">03</span>
        <h3 class="font-semibold text-xs text-white">Relevansi Pengalaman Bendahara & Sekretaris di OPPM</h3>
      </div>
      <div class="pl-5 space-y-0.5 text-[11px] text-slate-300 leading-snug">
        <p class="text-slate-400 text-[10px] italic">"Bagaimana peran organisasi non-teknis mendukung kerja sebagai developer?"</p>
        <p>"Sebagai bendahara, saya memegang tanggung jawab pembukuan yang melatih <strong class="text-purple-300">ketelitian tinggi dan akuntabilitas mutlak</strong>—sangat penting agar kode bebas dari bug logika dan validasi data kuat. Sebagai sekretaris, saya terbiasa menyusun dokumentasi teratur yang berdampak pada kebiasaan menulis struktur kode yang rapi dan mudah dirawat."</p>
      </div>
    </div>

    <div class="w-full p-2.5 rounded-lg border border-slate-800 bg-slate-900/80 space-y-1">
      <div class="flex items-center gap-1.5">
        <span class="size-4 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[9px] flex items-center justify-center font-semibold shrink-0">04</span>
        <h3 class="font-semibold text-xs text-white">Pendekatan Saat Menemukan Bug atau Error Rumit</h3>
      </div>
      <div class="pl-5 space-y-0.5 text-[11px] text-slate-300 leading-snug">
        <p class="text-slate-400 text-[10px] italic">"Bagaimana langkah Anda saat menghadapi error yang sulit diselesaikan?"</p>
        <p>"Saya menanganinya secara bertahap: memeriksa log error dan stack trace, mereproduksi masalah di lingkungan lokal untuk mengisolasi pemicunya, merancang solusi yang spesifik agar tidak mengganggu modul lain, serta melakukan testing menyeluruh sebelum kode di-push."</p>
      </div>
    </div>

    <div class="w-full p-2.5 rounded-lg border border-slate-800 bg-slate-900/80 space-y-1">
      <div class="flex items-center gap-1.5">
        <span class="size-4 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[9px] flex items-center justify-center font-semibold shrink-0">05</span>
        <h3 class="font-semibold text-xs text-white">Kelemahan Terbesar & Cara Mengatasinya</h3>
      </div>
      <div class="pl-5 space-y-0.5 text-[11px] text-slate-300 leading-snug">
        <p class="text-slate-400 text-[10px] italic">"Apa kekurangan Anda dan apa tindakan perbaikannya?"</p>
        <p>"Dulu saya cenderung terlalu perfeksionis pada detail kecil visual yang bisa memakan waktu. Sekarang saya mengatasinya dengan menerapkan <strong class="text-amber-300">skala prioritas dan timeboxing</strong>: memastikan fungsionalitas inti selesai dan stabil terlebih dahulu sesuai deadline, baru mempercantik detail bila waktu masih ada."</p>
      </div>
    </div>

    <div class="w-full p-2.5 rounded-lg border border-slate-800 bg-slate-900/80 space-y-1">
      <div class="flex items-center gap-1.5">
        <span class="size-4 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[9px] flex items-center justify-center font-semibold shrink-0">06</span>
        <h3 class="font-semibold text-xs text-white">Mengapa Perusahaan Harus Memilih Anda?</h3>
      </div>
      <div class="pl-5 space-y-0.5 text-[11px] text-slate-300 leading-snug">
        <p class="text-slate-400 text-[10px] italic">"Dari sekian pelamar, apa nilai tambah utama yang Anda miliki?"</p>
        <p>"Saya menawarkan kombinasi seimbang: <strong class="text-emerald-300">kemampuan web modern teruji</strong> di Pertamina Hulu Rokan, fondasi akademik kuat dari TI UMSU dengan IPK 3,68, serta kedisiplinan dan integritas kerja yang tinggi dari latar belakang pesantren dan organisasi."</p>
      </div>
    </div>

    <div class="w-full p-2.5 rounded-lg border border-slate-800 bg-slate-900/80 space-y-1">
      <div class="flex items-center gap-1.5">
        <span class="size-4 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[9px] flex items-center justify-center font-semibold shrink-0">07</span>
        <h3 class="font-semibold text-xs text-white">Sikap Terhadap Perbedaan Pendapat dalam Tim</h3>
      </div>
      <div class="pl-5 space-y-0.5 text-[11px] text-slate-300 leading-snug">
        <p class="text-slate-400 text-[10px] italic">"Bagaimana jika rekan kerja atau lead memiliki pandangan teknis berbeda?"</p>
        <p>"Saya mendengarkan pertimbangan mereka secara terbuka dan menyampaikan data teknis secara objektif. Jika musyawarah tim atau lead telah mengambil keputusan, <strong class="text-cyan-300">saya berkomitmen penuh mengeksekusinya sebaik mungkin</strong> demi kesuksesan bersama proyek."</p>
      </div>
    </div>

    <div class="w-full p-2.5 rounded-lg border border-slate-800 bg-slate-900/80 space-y-1">
      <div class="flex items-center gap-1.5">
        <span class="size-4 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[9px] flex items-center justify-center font-semibold shrink-0">08</span>
        <h3 class="font-semibold text-xs text-white">Ekspektasi Gaji & Target Karir</h3>
      </div>
      <div class="pl-5 space-y-0.5 text-[11px] text-slate-300 leading-snug">
        <p class="text-slate-400 text-[10px] italic">"Berapa ekspektasi gaji Anda dan apa rencana karir Anda?"</p>
        <p>"Saya terbuka mengikuti struktur remunerasi resmi perusahaan dan standar UMR yang berlaku. Fokus prioritas saya adalah memberikan nilai tambah nyata melalui skill web development saya, belajar cepat dari tim senior, dan berkembang menjadi software engineer yang handal."</p>
      </div>
    </div>

  </div>

</div>`;

  await sql`
    INSERT INTO kerja_items (category, title, content_html, content_raw, "order", is_active)
    VALUES
      ('perkenalan', 'Perkenalan Diri Wawancara Kerja', ${perkenalanHtml}, 'Perkenalan Diri Eka Syarif Maulana S1 TI UMSU IPK 3,68 Web Developer Intern Pertamina Hulu Rokan', 1, TRUE),
      ('tips', 'Panduan & Tips Wawancara HRD', ${tipsHtml}, 'Panduan Tempo Bicara Metode STAR dan Etika Penutupan Interview', 2, TRUE),
      ('qa', 'Bank Tanya-Jawab Wawancara', ${qaHtml}, 'Simulasi 8 Pertanyaan dan Jawaban Kunci Wawancara Kerja', 3, TRUE);
  `;

  console.log('Successfully seeded exactly 3 unified master items: perkenalan, tips, qa.');
}

seedSingleViewsKerja().catch(console.error);
