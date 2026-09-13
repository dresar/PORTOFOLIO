import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function updatePerkenalanFull() {
  const perkenalanHtml = `<div class="w-full space-y-2.5 text-slate-200 text-xs sm:text-[13px]">

  <div class="w-full rounded-lg border border-slate-800 bg-slate-900/90 p-3 sm:p-4 shadow-sm">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div class="min-w-0">
        <div class="mb-1.5 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300">
          <span class="size-1.5 rounded-full bg-emerald-400"></span>
          Persiapan Interview HRD
        </div>
        <h1 class="text-sm sm:text-lg font-bold leading-tight text-white">
          Perkenalan Diri untuk Posisi Web Developer
        </h1>
        <p class="mt-1 text-[11px] text-slate-400 leading-snug">
          Materi belajar perkenalan diri yang disusun secara detail, teknis, terstruktur, dan mudah dihafalkan untuk menghadapi proses interview kerja.
        </p>
      </div>
      <div class="shrink-0 rounded-md border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-center self-start sm:self-auto">
        <p class="text-[8px] uppercase tracking-wider text-slate-500 font-semibold">Fokus Posisi</p>
        <p class="text-xs font-bold text-emerald-300">Web Developer</p>
      </div>
    </div>
  </div>

  <div class="w-full rounded-lg border border-slate-800 bg-slate-900/80 p-3 space-y-2">
    <div class="flex items-center gap-2">
      <span class="flex size-7 items-center justify-center rounded-md bg-blue-500/15 text-blue-300 shrink-0">
        <svg class="size-3.5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19a4 4 0 0 0-8 0m4-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 8a4 4 0 0 0-3-3.87M17 5.13a3 3 0 0 1 0 5.74" />
        </svg>
      </span>
      <div>
        <h2 class="text-xs sm:text-sm font-bold text-white">Identitas Diri</h2>
        <p class="text-[10px] text-slate-400">Informasi utama yang perlu disebutkan saat pembukaan interview</p>
      </div>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
      <div class="rounded-md border border-slate-800 bg-slate-950/70 p-2">
        <p class="text-[9px] uppercase tracking-wide text-slate-500 font-semibold">Nama</p>
        <p class="mt-0.5 text-xs font-semibold text-slate-100 truncate">Eka Syarif Maulana</p>
      </div>
      <div class="rounded-md border border-slate-800 bg-slate-950/70 p-2">
        <p class="text-[9px] uppercase tracking-wide text-slate-500 font-semibold">Domisili</p>
        <p class="mt-0.5 text-xs font-semibold text-slate-100 truncate">Torgamba, Labusel</p>
      </div>
      <div class="rounded-md border border-slate-800 bg-slate-950/70 p-2">
        <p class="text-[9px] uppercase tracking-wide text-slate-500 font-semibold">Pendidikan</p>
        <p class="mt-0.5 text-xs font-semibold text-slate-100 truncate">S1 Teknologi Informasi</p>
      </div>
      <div class="rounded-md border border-slate-800 bg-slate-950/70 p-2">
        <p class="text-[9px] uppercase tracking-wide text-slate-500 font-semibold">IPK</p>
        <p class="mt-0.5 text-xs font-bold text-emerald-400">3,68</p>
      </div>
    </div>
  </div>

  <div class="w-full rounded-lg border border-slate-800 bg-slate-900/80 p-3 space-y-2">
    <div class="flex items-center gap-2">
      <span class="flex size-7 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-300 shrink-0">
        <svg class="size-3.5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
        </svg>
      </span>
      <div>
        <h2 class="text-xs sm:text-sm font-bold text-white">Struktur Perkenalan Diri</h2>
        <p class="text-[10px] text-slate-400">Urutan yang digunakan agar jawaban terdengar runtut dan profesional</p>
      </div>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
      <div class="rounded-md border border-slate-800 bg-slate-950/60 p-2 space-y-1">
        <div class="flex items-center gap-1.5">
          <span class="flex size-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-slate-950 shrink-0">1</span>
          <p class="text-xs font-semibold text-white truncate">Pembukaan</p>
        </div>
        <p class="text-[10px] leading-snug text-slate-400">Salam, nama lengkap, dan kesiapan interview.</p>
      </div>

      <div class="rounded-md border border-slate-800 bg-slate-950/60 p-2 space-y-1">
        <div class="flex items-center gap-1.5">
          <span class="flex size-4 items-center justify-center rounded-full bg-blue-500 text-[9px] font-bold text-white shrink-0">2</span>
          <p class="text-xs font-semibold text-white truncate">Identitas</p>
        </div>
        <p class="text-[10px] leading-snug text-slate-400">Domisili, latar belakang pendidikan, dan IPK.</p>
      </div>

      <div class="rounded-md border border-slate-800 bg-slate-950/60 p-2 space-y-1">
        <div class="flex items-center gap-1.5">
          <span class="flex size-4 items-center justify-center rounded-full bg-violet-500 text-[9px] font-bold text-white shrink-0">3</span>
          <p class="text-xs font-semibold text-white truncate">Teknis</p>
        </div>
        <p class="text-[10px] leading-snug text-slate-400">Keahlian web dev dengan proyek nyata.</p>
      </div>

      <div class="rounded-md border border-slate-800 bg-slate-950/60 p-2 space-y-1">
        <div class="flex items-center gap-1.5">
          <span class="flex size-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-slate-950 shrink-0">4</span>
          <p class="text-xs font-semibold text-white truncate">Penutup</p>
        </div>
        <p class="text-[10px] leading-snug text-slate-400">Karakter kerja, adaptasi, dan harapan tim.</p>
      </div>
    </div>
  </div>

  <div class="w-full rounded-lg border border-slate-800 bg-slate-900/80 p-3 space-y-2">
    <div class="flex items-center gap-2">
      <span class="flex size-6 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-300 font-bold text-[10px] shrink-0">01</span>
      <div>
        <h2 class="text-xs sm:text-sm font-bold text-white">Pembukaan</h2>
        <p class="text-[10px] text-slate-400">Singkat, sopan, jelas, dan tidak bertele-tele.</p>
      </div>
    </div>

    <div class="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-2.5">
      <p class="text-[11px] sm:text-xs leading-relaxed text-slate-200">
        “Selamat pagi atau siang, Bapak/Ibu. Terima kasih atas kesempatan yang diberikan kepada saya untuk mengikuti proses interview pada hari ini. Perkenalkan, nama saya <strong class="text-emerald-300">Eka Syarif Maulana</strong>.”
      </p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
      <div class="rounded-md border border-slate-800 bg-slate-950/60 p-2">
        <p class="text-[10px] font-semibold text-emerald-300">Tujuan bagian ini</p>
        <p class="mt-0.5 text-[10px] leading-snug text-slate-400">Menunjukkan sikap sopan, percaya diri, dan menghargai waktu interviewer.</p>
      </div>
      <div class="rounded-md border border-slate-800 bg-slate-950/60 p-2">
        <p class="text-[10px] font-semibold text-emerald-300">Cara penyampaian</p>
        <p class="mt-0.5 text-[10px] leading-snug text-slate-400">Ucapkan dengan tempo sedang, suara jelas, dan jangan terburu-buru.</p>
      </div>
    </div>
  </div>

  <div class="w-full rounded-lg border border-slate-800 bg-slate-900/80 p-3 space-y-2">
    <div class="flex items-center gap-2">
      <span class="flex size-6 items-center justify-center rounded-md bg-blue-500/15 text-blue-300 font-bold text-[10px] shrink-0">02</span>
      <div>
        <h2 class="text-xs sm:text-sm font-bold text-white">Identitas dan Latar Belakang Pendidikan</h2>
        <p class="text-[10px] text-slate-400">Jelaskan domisili dan pendidikan sebagai dasar profil profesional.</p>
      </div>
    </div>

    <div class="rounded-md border border-blue-500/30 bg-blue-500/5 p-2.5">
      <p class="text-[11px] sm:text-xs leading-relaxed text-slate-200">
        “Saya berdomisili di <strong class="text-white">Torgamba, Labuhanbatu Selatan, Sumatera Utara</strong>. Saya merupakan lulusan <strong class="text-blue-300">S1 Program Studi Teknologi Informasi</strong> dari <strong class="text-white">Universitas Muhammadiyah Sumatera Utara</strong> dengan IPK <strong class="text-emerald-400">3,68</strong>.”
      </p>
    </div>

    <div class="space-y-1.5">
      <div class="rounded-md border border-slate-800 bg-slate-950/60 p-2">
        <p class="text-[10px] font-semibold text-white">Informasi yang perlu ditekankan</p>
        <ul class="mt-1 space-y-1 text-[10px] leading-snug text-slate-400">
          <li class="flex gap-1.5"><span class="text-blue-400 font-bold">•</span><span>Nama lengkap disebutkan dengan jelas.</span></li>
          <li class="flex gap-1.5"><span class="text-blue-400 font-bold">•</span><span>Domisili disampaikan secara singkat tanpa alamat bertele-tele.</span></li>
          <li class="flex gap-1.5"><span class="text-blue-400 font-bold">•</span><span>Pendidikan disebutkan sesuai posisi yang dilamar.</span></li>
          <li class="flex gap-1.5"><span class="text-blue-400 font-bold">•</span><span>IPK menunjukkan pencapaian akademik yang konsisten.</span></li>
        </ul>
      </div>

      <div class="rounded-md border border-slate-800 bg-slate-950/60 p-2">
        <p class="text-[10px] font-semibold text-white">Kalimat teknis yang dapat digunakan</p>
        <p class="mt-1 text-[10px] leading-relaxed text-slate-400">
          “Selama menempuh pendidikan Teknologi Informasi, saya mempelajari dasar pengembangan perangkat lunak, analisis kebutuhan sistem, pengembangan aplikasi berbasis web, pengelolaan basis data, serta konsep perancangan dan pengujian sistem.”
        </p>
      </div>
    </div>
  </div>

  <div class="w-full rounded-lg border border-slate-800 bg-slate-900/80 p-3 space-y-2">
    <div class="flex items-center gap-2">
      <span class="flex size-6 items-center justify-center rounded-md bg-violet-500/15 text-violet-300 font-bold text-[10px] shrink-0">03</span>
      <div>
        <h2 class="text-xs sm:text-sm font-bold text-white">Kemampuan Teknis sebagai Web Developer</h2>
        <p class="text-[10px] text-slate-400">Kemampuan teknis dengan bahasa yang lugas dan realistis.</p>
      </div>
    </div>

    <div class="rounded-md border border-violet-500/30 bg-violet-500/5 p-2.5">
      <p class="text-[11px] sm:text-xs leading-relaxed text-slate-200">
        “Untuk kemampuan teknis, saya memiliki dasar di bidang web development. Saya memahami proses pembuatan aplikasi berbasis web mulai dari memahami kebutuhan pengguna, menyusun struktur halaman, membuat tampilan antarmuka, mengatur alur interaksi, menghubungkan aplikasi dengan basis data, sampai melakukan pengujian dan perbaikan ketika terdapat kendala.”
      </p>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
      <div class="rounded-md border border-slate-800 bg-slate-950/60 p-2 space-y-0.5">
        <p class="text-[11px] font-semibold text-orange-400">HTML</p>
        <p class="text-[9px] text-slate-400 leading-tight">Heading, form, button, table, semantic layout agar halaman terorganisasi rapi.</p>
      </div>
      <div class="rounded-md border border-slate-800 bg-slate-950/60 p-2 space-y-0.5">
        <p class="text-[11px] font-semibold text-blue-400">CSS</p>
        <p class="text-[9px] text-slate-400 leading-tight">Layout, spacing, warna, typography, dan responsive design di desktop & mobile.</p>
      </div>
      <div class="rounded-md border border-slate-800 bg-slate-950/60 p-2 space-y-0.5">
        <p class="text-[11px] font-semibold text-yellow-400">JavaScript</p>
        <p class="text-[9px] text-slate-400 leading-tight">Interaktivitas, event handling, pemrosesan data, validasi input, dan logika aplikasi.</p>
      </div>
      <div class="rounded-md border border-slate-800 bg-slate-950/60 p-2 space-y-0.5">
        <p class="text-[11px] font-semibold text-emerald-400">Web Dev</p>
        <p class="text-[9px] text-slate-400 leading-tight">Alur pengembangan fitur dari perencanaan, integrasi data, hingga pengujian.</p>
      </div>
      <div class="rounded-md border border-slate-800 bg-slate-950/60 p-2 space-y-0.5">
        <p class="text-[11px] font-semibold text-cyan-400">Basis Data</p>
        <p class="text-[9px] text-slate-400 leading-tight">Tabel, field, primary key, relasi antartabel, dan konsistensi penyimpanan data.</p>
      </div>
      <div class="rounded-md border border-slate-800 bg-slate-950/60 p-2 space-y-0.5">
        <p class="text-[11px] font-semibold text-pink-400">Debugging</p>
        <p class="text-[9px] text-slate-400 leading-tight">Analisis pesan error, console log, dan perbaikan terarah tanpa efek samping.</p>
      </div>
    </div>

    <div class="rounded-md border border-slate-800 bg-slate-950/60 p-2.5 space-y-1.5">
      <p class="text-[10px] font-semibold text-violet-300">Kalimat teknis tambahan yang bisa dipelajari:</p>
      <div class="space-y-1 text-[10px] leading-relaxed text-slate-400">
        <p>“Saya memahami bahwa pengembangan website tidak hanya berfokus pada tampilan, tetapi juga pada struktur kode, alur data, performa, keamanan, kemudahan penggunaan, dan kemampuan aplikasi untuk dipelihara.”</p>
        <p>“Dalam mengembangkan fitur, saya berusaha memahami terlebih dahulu kebutuhan pengguna agar solusi yang dibuat tidak hanya berjalan, tetapi juga sesuai dengan proses bisnis yang dibutuhkan.”</p>
        <p>“Saya juga memahami pentingnya responsive design agar tampilan aplikasi dapat menyesuaikan ukuran layar dan tetap nyaman digunakan pada perangkat desktop, tablet, maupun smartphone.”</p>
        <p>“Jika menemukan error, saya biasanya memeriksa pesan kesalahan, menelusuri bagian kode yang berkaitan, menguji kemungkinan penyebab, lalu melakukan perbaikan secara bertahap.”</p>
      </div>
    </div>
  </div>

  <div class="w-full rounded-lg border border-slate-800 bg-slate-900/80 p-3 space-y-2">
    <div class="flex items-center gap-2">
      <span class="flex size-6 items-center justify-center rounded-md bg-cyan-500/15 text-cyan-300 font-bold text-[10px] shrink-0">04</span>
      <div>
        <h2 class="text-xs sm:text-sm font-bold text-white">Pengalaman Kerja Praktik</h2>
        <p class="text-[10px] text-slate-400">Tanggung jawab riil yang relevan untuk posisi Web Developer.</p>
      </div>
    </div>

    <div class="rounded-md border border-cyan-500/30 bg-cyan-500/5 p-2.5">
      <p class="text-[11px] sm:text-xs leading-relaxed text-slate-200">
        “Pengalaman yang paling relevan saya dapatkan ketika menjalani kerja praktik sebagai <strong class="text-cyan-300">Web Developer Intern di PT Pertamina Hulu Rokan, Rantau Field 1, Aceh Tamiang</strong>. Dalam kegiatan tersebut, saya terlibat dalam pengembangan website profil perusahaan dan sistem inventaris.”
      </p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
      <div class="rounded-md border border-slate-800 bg-slate-950/60 p-2">
        <p class="text-xs font-semibold text-white">Website Profil Perusahaan</p>
        <p class="mt-1 text-[10px] leading-snug text-slate-400">Menyampaikan unit kerja, kegiatan, keterbacaan konten, kemudahan navigasi, dan struktur halaman teratur.</p>
      </div>
      <div class="rounded-md border border-slate-800 bg-slate-950/60 p-2">
        <p class="text-xs font-semibold text-white">Sistem Inventaris</p>
        <p class="mt-1 text-[10px] leading-snug text-slate-400">Pengelolaan data barang, pencatatan informasi, pembaruan data, dan penyajian informasi efisien bagi staf operasional.</p>
      </div>
    </div>

    <div class="rounded-md border border-slate-800 bg-slate-950/60 p-2.5 space-y-1">
      <p class="text-[10px] font-semibold text-cyan-300">Penjelasan teknis pengalaman:</p>
      <div class="space-y-1 text-[10px] leading-relaxed text-slate-400">
        <p>“Dalam pengerjaan website, saya belajar menyusun halaman berdasarkan kebutuhan informasi, mengatur komponen antarmuka, membuat navigasi, menyesuaikan tampilan agar responsif, serta memastikan setiap bagian halaman dapat digunakan dengan baik.”</p>
        <p>“Pada sistem inventaris, saya mempelajari bagaimana data barang perlu dikelola secara terstruktur, mulai dari proses pencatatan, pembaruan informasi, pencarian data, sampai penyajian data kepada pengguna.”</p>
        <p>“Pengalaman tersebut membuat saya memahami bahwa aplikasi yang baik harus memperhatikan kebutuhan pengguna, ketepatan data, alur kerja, kemudahan penggunaan, dan konsistensi tampilan.”</p>
        <p>“Saya juga belajar berkomunikasi mengenai kebutuhan fitur, menerima masukan, melakukan penyesuaian, dan menyelesaikan pekerjaan berdasarkan prioritas yang telah ditentukan.”</p>
      </div>
    </div>
  </div>

  <div class="w-full rounded-lg border border-slate-800 bg-slate-900/80 p-3 space-y-2">
    <div class="flex items-center gap-2">
      <span class="flex size-6 items-center justify-center rounded-md bg-amber-500/15 text-amber-300 font-bold text-[10px] shrink-0">05</span>
      <div>
        <h2 class="text-xs sm:text-sm font-bold text-white">Pengalaman Organisasi dan Freelance</h2>
        <p class="text-[10px] text-slate-400">Menunjukkan tanggung jawab, ketelitian, dan kemampuan komunikasi.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <div class="rounded-md border border-slate-800 bg-slate-950/60 p-2.5 space-y-1.5">
        <p class="text-xs font-semibold text-white flex items-center gap-1.5">
          <span class="size-1.5 rounded-full bg-amber-400"></span>
          Pengalaman Organisasi
        </p>
        <p class="text-[10px] leading-relaxed text-slate-300">
          “Selain pengalaman teknis, saya pernah aktif dalam organisasi OPPM sebagai sekretaris sekaligus bendahara. Dari pengalaman tersebut, saya belajar mengelola administrasi, mencatat kegiatan, mengatur dokumen, mengelola keuangan, menjaga ketelitian, dan bertanggung jawab terhadap tugas yang diberikan.”
        </p>
        <div class="rounded border border-amber-500/20 bg-amber-500/5 p-1.5 text-[9px] text-amber-200">
          Menunjukkan administrasi, ketelitian, koordinasi, komunikasi, dan akuntabilitas.
        </div>
      </div>

      <div class="rounded-md border border-slate-800 bg-slate-950/60 p-2.5 space-y-1.5">
        <p class="text-xs font-semibold text-white flex items-center gap-1.5">
          <span class="size-1.5 rounded-full bg-pink-400"></span>
          Pengalaman Freelance
        </p>
        <p class="text-[10px] leading-relaxed text-slate-300">
          “Saya juga memiliki pengalaman freelance dalam pembuatan materi presentasi serta membantu penyusunan dokumen, seperti makalah, jurnal, dan kebutuhan administrasi lainnya. Dari pekerjaan tersebut, saya belajar memahami kebutuhan klien, menyesuaikan hasil dengan permintaan, mengatur waktu pengerjaan, menjaga komunikasi, dan menyelesaikan pekerjaan sesuai tenggat waktu.”
        </p>
        <div class="rounded border border-pink-500/20 bg-pink-500/5 p-1.5 text-[9px] text-pink-200">
          Menunjukkan pemahaman kebutuhan, pelayanan klien, dan manajemen deadline.
        </div>
      </div>
    </div>
  </div>

  <div class="w-full rounded-lg border border-slate-800 bg-slate-900/80 p-3 space-y-2">
    <div class="flex items-center gap-2">
      <span class="flex size-6 items-center justify-center rounded-md bg-yellow-500/15 text-yellow-300 font-bold text-[10px] shrink-0">06</span>
      <div>
        <h2 class="text-xs sm:text-sm font-bold text-white">Sertifikasi</h2>
        <p class="text-[10px] text-slate-400">Sebutkan sertifikat secara ringkas sebagai nilai tambah kemampuan.</p>
      </div>
    </div>

    <div class="rounded-md border border-yellow-500/30 bg-yellow-500/5 p-2.5">
      <p class="text-[11px] sm:text-xs leading-relaxed text-slate-200">
        “Saya juga memiliki sertifikat <strong class="text-yellow-300">Operator Komputer dari LPKS Drekat Mandiri</strong> dengan predikat baik, serta sertifikat <strong class="text-yellow-300">Microsoft Office dari Kursus Digital dan LKI Borju Computer</strong> dengan hasil penilaian yang baik.”
      </p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
      <div class="rounded-md border border-slate-800 bg-slate-950/60 p-2">
        <p class="text-xs font-semibold text-white">Operator Komputer</p>
        <p class="mt-0.5 text-[10px] leading-snug text-slate-400">Pengoperasian komputer, pengelolaan file, dan tugas administrasi digital.</p>
      </div>
      <div class="rounded-md border border-slate-800 bg-slate-950/60 p-2">
        <p class="text-xs font-semibold text-white">Microsoft Office</p>
        <p class="mt-0.5 text-[10px] leading-snug text-slate-400">Pengolahan dokumen, pelaporan, pembuatan presentasi, dan kalkulasi tabel.</p>
      </div>
    </div>
  </div>

  <div class="w-full rounded-lg border border-slate-800 bg-slate-900/80 p-3 space-y-2">
    <div class="flex items-center gap-2">
      <span class="flex size-6 items-center justify-center rounded-md bg-rose-500/15 text-rose-300 font-bold text-[10px] shrink-0">07</span>
      <div>
        <h2 class="text-xs sm:text-sm font-bold text-white">Karakter Kerja dan Kemampuan Beradaptasi</h2>
        <p class="text-[10px] text-slate-400">Kemampuan teknis diimbangi etika kerja yang baik.</p>
      </div>
    </div>

    <div class="rounded-md border border-rose-500/30 bg-rose-500/5 p-2.5">
      <p class="text-[11px] sm:text-xs leading-relaxed text-slate-200">
        “Saya merupakan pribadi yang mau belajar, bertanggung jawab, teliti, dan mudah beradaptasi dengan lingkungan kerja. Saya menyadari bahwa sebagai seorang yang masih terus mengembangkan kemampuan, saya perlu terbuka terhadap arahan, masukan, dan teknologi baru.”
      </p>
    </div>

    <div class="space-y-1.5">
      <div class="rounded-md border border-slate-800 bg-slate-950/60 p-2 space-y-0.5">
        <p class="text-[10px] font-semibold text-rose-300">Jika ditanya tentang teknologi yang belum dikuasai:</p>
        <p class="text-[10px] leading-relaxed text-slate-400">“Jika terdapat teknologi atau sistem yang belum saya kuasai, saya akan mempelajarinya melalui dokumentasi, contoh implementasi, latihan mandiri, dan arahan dari tim. Saya berusaha memahami konsep dasarnya terlebih dahulu agar proses belajar dapat lebih terarah.”</p>
      </div>
      <div class="rounded-md border border-slate-800 bg-slate-950/60 p-2 space-y-0.5">
        <p class="text-[10px] font-semibold text-rose-300">Jika ditanya tentang kerja tim:</p>
        <p class="text-[10px] leading-relaxed text-slate-400">“Saya memahami bahwa pengembangan aplikasi biasanya melibatkan beberapa peran. Karena itu, komunikasi, pembagian tugas, penyampaian progres, dan keterbukaan terhadap masukan merupakan hal penting agar pekerjaan dapat berjalan dengan baik.”</p>
      </div>
      <div class="rounded-md border border-slate-800 bg-slate-950/60 p-2 space-y-0.5">
        <p class="text-[10px] font-semibold text-rose-300">Jika ditanya tentang tekanan atau deadline:</p>
        <p class="text-[10px] leading-relaxed text-slate-400">“Saya akan mengatur pekerjaan berdasarkan prioritas, memahami bagian yang paling penting untuk diselesaikan, kemudian mengerjakan tugas secara bertahap sambil tetap memperhatikan ketelitian dan kualitas hasil.”</p>
      </div>
    </div>
  </div>

  <div class="w-full rounded-lg border border-slate-800 bg-slate-900/80 p-3 space-y-2">
    <div class="flex items-center gap-2">
      <span class="flex size-6 items-center justify-center rounded-md bg-indigo-500/15 text-indigo-300 font-bold text-[10px] shrink-0">08</span>
      <div>
        <h2 class="text-xs sm:text-sm font-bold text-white">Kumpulan Kalimat Teknis untuk Dipelajari</h2>
        <p class="text-[10px] text-slate-400">Dapat digunakan jika HRD/User meminta penjelasan lebih detail.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
      <div class="rounded-md border border-slate-800 bg-slate-950/60 p-2">
        <p class="text-[10px] leading-relaxed text-slate-300">“Saya memahami bahwa frontend berhubungan dengan bagian aplikasi yang langsung berinteraksi dengan pengguna, termasuk tampilan, navigasi, form, tombol, dan respons aplikasi terhadap tindakan pengguna.”</p>
      </div>
      <div class="rounded-md border border-slate-800 bg-slate-950/60 p-2">
        <p class="text-[10px] leading-relaxed text-slate-300">“Dalam membuat tampilan, saya memperhatikan struktur HTML, pengaturan CSS, konsistensi komponen, jarak antar-elemen, keterbacaan teks, dan kemampuan layout untuk menyesuaikan ukuran layar.”</p>
      </div>
      <div class="rounded-md border border-slate-800 bg-slate-950/60 p-2">
        <p class="text-[10px] leading-relaxed text-slate-300">“JavaScript digunakan untuk menambahkan logika dan interaksi, seperti validasi form, pengelolaan event, pemrosesan input, perubahan tampilan, serta komunikasi dengan data aplikasi.”</p>
      </div>
      <div class="rounded-md border border-slate-800 bg-slate-950/60 p-2">
        <p class="text-[10px] leading-relaxed text-slate-300">“Saya memahami bahwa validasi input diperlukan agar data yang masuk sesuai format, mengurangi kesalahan pengguna, dan membantu menjaga kualitas data yang diproses oleh sistem.”</p>
      </div>
      <div class="rounded-md border border-slate-800 bg-slate-950/60 p-2">
        <p class="text-[10px] leading-relaxed text-slate-300">“Saya memahami pentingnya pemisahan antara tampilan, logika, dan pengelolaan data agar kode lebih mudah dibaca, dikembangkan, diuji, dan dipelihara.”</p>
      </div>
      <div class="rounded-md border border-slate-800 bg-slate-950/60 p-2">
        <p class="text-[10px] leading-relaxed text-slate-300">“Dalam pengembangan sistem inventaris, struktur data harus dirancang dengan baik agar proses pencarian, pembaruan, dan penyajian data dapat dilakukan secara lebih teratur.”</p>
      </div>
      <div class="rounded-md border border-slate-800 bg-slate-950/60 p-2">
        <p class="text-[10px] leading-relaxed text-slate-300">“Saya memahami bahwa responsive design bukan hanya mengecilkan ukuran tampilan, tetapi juga menyesuaikan layout, ukuran teks, posisi tombol, jarak komponen, dan navigasi berdasarkan ukuran perangkat.”</p>
      </div>
      <div class="rounded-md border border-slate-800 bg-slate-950/60 p-2">
        <p class="text-[10px] leading-relaxed text-slate-300">“Saya berusaha menulis kode dengan struktur yang rapi, menggunakan penamaan yang mudah dipahami, dan menghindari pengulangan kode yang tidak diperlukan.”</p>
      </div>
      <div class="rounded-md border border-slate-800 bg-slate-950/60 p-2">
        <p class="text-[10px] leading-relaxed text-slate-300">“Sebelum menganggap sebuah fitur selesai, saya perlu memastikan bahwa fungsi utama berjalan, input dapat diproses, tampilan sesuai kebutuhan, dan tidak terdapat error yang mengganggu pengguna.”</p>
      </div>
      <div class="rounded-md border border-slate-800 bg-slate-950/60 p-2">
        <p class="text-[10px] leading-relaxed text-slate-300">“Saya memahami bahwa pengujian aplikasi dapat dilakukan dengan mencoba alur penggunaan dari sisi pengguna, memeriksa hasil input, menguji kondisi kesalahan, dan memastikan fitur memberikan output yang sesuai.”</p>
      </div>
    </div>
  </div>

  <div class="w-full rounded-lg border border-slate-800 bg-slate-900/80 p-3 space-y-2">
    <div class="flex items-center gap-2">
      <span class="flex size-6 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-300 font-bold text-[10px] shrink-0">09</span>
      <div>
        <h2 class="text-xs sm:text-sm font-bold text-white">Penutup Perkenalan</h2>
        <p class="text-[10px] text-slate-400">Tutup dengan motivasi, kontribusi, dan kesiapan belajar.</p>
      </div>
    </div>

    <div class="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-2.5">
      <p class="text-[11px] sm:text-xs leading-relaxed text-slate-200">
        “Saya berharap dapat memperoleh kesempatan untuk mengembangkan kemampuan saya lebih jauh sekaligus memberikan kontribusi yang baik bagi perusahaan. Saya siap belajar, mengikuti arahan, bekerja sama dengan tim, dan menyesuaikan diri dengan kebutuhan pekerjaan. Terima kasih, Bapak/Ibu.”
      </p>
    </div>
  </div>

  <div class="w-full rounded-lg border border-slate-800 bg-slate-900/80 p-3 space-y-2">
    <div class="flex items-center gap-2">
      <span class="flex size-6 items-center justify-center rounded-md bg-slate-800 text-slate-300 shrink-0">
        <svg class="size-3.5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="m5 12 4 4L19 6" />
        </svg>
      </span>
      <div>
        <h2 class="text-xs sm:text-sm font-bold text-white">Checklist Sebelum Interview</h2>
        <p class="text-[10px] text-slate-400">Pastikan seluruh bagian sudah dipahami, bukan hanya dihafalkan.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
      <label class="flex items-start gap-2 rounded-md border border-slate-800 bg-slate-950/60 p-2">
        <input type="checkbox" class="mt-0.5 size-3.5 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500" />
        <span class="text-[10px] leading-snug text-slate-300">Saya dapat menyebutkan nama dan domisili dengan lancar.</span>
      </label>
      <label class="flex items-start gap-2 rounded-md border border-slate-800 bg-slate-950/60 p-2">
        <input type="checkbox" class="mt-0.5 size-3.5 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500" />
        <span class="text-[10px] leading-snug text-slate-300">Saya dapat menjelaskan pendidikan dan IPK dengan percaya diri.</span>
      </label>
      <label class="flex items-start gap-2 rounded-md border border-slate-800 bg-slate-950/60 p-2">
        <input type="checkbox" class="mt-0.5 size-3.5 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500" />
        <span class="text-[10px] leading-snug text-slate-300">Saya memahami penjelasan dasar tentang web development.</span>
      </label>
      <label class="flex items-start gap-2 rounded-md border border-slate-800 bg-slate-950/60 p-2">
        <input type="checkbox" class="mt-0.5 size-3.5 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500" />
        <span class="text-[10px] leading-snug text-slate-300">Saya dapat menjelaskan pengalaman kerja praktik secara runtut.</span>
      </label>
      <label class="flex items-start gap-2 rounded-md border border-slate-800 bg-slate-950/60 p-2">
        <input type="checkbox" class="mt-0.5 size-3.5 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500" />
        <span class="text-[10px] leading-snug text-slate-300">Saya tidak menyebutkan teknologi yang belum benar-benar saya pahami.</span>
      </label>
      <label class="flex items-start gap-2 rounded-md border border-slate-800 bg-slate-950/60 p-2">
        <input type="checkbox" class="mt-0.5 size-3.5 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500" />
        <span class="text-[10px] leading-snug text-slate-300">Saya dapat menjelaskan kelebihan dan kesiapan belajar.</span>
      </label>
    </div>
  </div>

  <div class="w-full rounded-lg border border-slate-800 bg-slate-900/80 p-3 space-y-2">
    <div class="flex items-center gap-2">
      <span class="flex size-6 items-center justify-center rounded-md bg-amber-500/15 text-amber-300 shrink-0">
        <svg class="size-3.5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 18h6M10 22h4M8.5 14.5a6 6 0 1 1 7 0c-.9.6-1.5 1.4-1.5 2.5h-5c0-1.1-.6-1.9-1.5-2.5Z" />
        </svg>
      </span>
      <div>
        <h2 class="text-xs sm:text-sm font-bold text-white">Tips Menghafalkan Perkenalan</h2>
        <p class="text-[10px] text-slate-400">Hafalkan alurnya, bukan setiap kata secara kaku.</p>
      </div>
    </div>

    <div class="space-y-1.5 text-[10px] leading-relaxed text-slate-400">
      <p>1. Hafalkan urutan utama: nama, domisili, pendidikan, kemampuan teknis, pengalaman, organisasi, sertifikasi, karakter, dan penutup.</p>
      <p>2. Gunakan kata kunci agar jawaban tetap terdengar natural. Jangan terlalu terpaku pada satu kalimat karena dapat membuat penyampaian kaku.</p>
      <p>3. Latih pengucapan dengan suara keras agar mengetahui bagian yang masih sulit diucapkan atau terlalu panjang.</p>
      <p>4. Usahakan durasi perkenalan sekitar satu sampai dua menit. Jika HRD meminta penjelasan lebih detail, barulah uraikan pengalaman teknis.</p>
      <p>5. Jangan mengaku menguasai teknologi tertentu jika belum benar-benar memahami dasar penggunaannya. Lebih baik mengatakan “memiliki dasar” atau “pernah menggunakan” jika memang sesuai pengalaman.</p>
      <p>6. Saat menjelaskan pengalaman, gunakan pola: kegiatan yang dikerjakan, tanggung jawab, proses teknis, hasil yang dipelajari, dan kaitannya dengan posisi yang dilamar.</p>
    </div>
  </div>

  <div class="w-full rounded-lg border border-emerald-500/30 bg-slate-900/90 p-3 sm:p-4 space-y-2">
    <div class="flex items-center gap-2">
      <span class="flex size-7 items-center justify-center rounded-md bg-emerald-500 text-slate-950 shrink-0">
        <svg class="size-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="m5 12 4 4L19 6" />
        </svg>
      </span>
      <div>
        <h2 class="text-xs sm:text-sm font-bold text-white">Final Perkenalan Diri</h2>
        <p class="text-[10px] text-emerald-400 font-medium">Teks siap dibaca dan dipelajari</p>
      </div>
    </div>

    <div class="rounded-md border border-slate-800 bg-slate-950/80 p-3">
      <p class="text-xs leading-relaxed text-slate-200">
        Selamat pagi atau siang, Bapak/Ibu. Terima kasih atas kesempatan yang diberikan kepada saya untuk mengikuti proses interview pada hari ini. Perkenalkan, nama saya <strong class="text-emerald-300">Eka Syarif Maulana</strong>. Saya berdomisili di <strong class="text-white">Torgamba, Labuhanbatu Selatan, Sumatera Utara</strong>.
        <br /><br />
        Saya merupakan lulusan <strong class="text-emerald-300">S1 Program Studi Teknologi Informasi</strong> dari <strong class="text-white">Universitas Muhammadiyah Sumatera Utara</strong> dengan IPK <strong class="text-emerald-300">3,68</strong>. Selama menempuh pendidikan, saya mempelajari berbagai dasar teknologi informasi, seperti pengembangan perangkat lunak, pengembangan aplikasi berbasis web, analisis kebutuhan sistem, pengelolaan basis data, serta konsep perancangan dan pengujian aplikasi.
        <br /><br />
        Untuk kemampuan teknis, saya memiliki dasar di bidang web development. Saya memahami proses pembuatan aplikasi berbasis web mulai dari memahami kebutuhan pengguna, menyusun struktur halaman, membuat tampilan antarmuka, mengatur navigasi dan interaksi, mengelola data, sampai melakukan pengujian dan perbaikan ketika terdapat kendala. Saya juga memahami dasar <span class="px-1 py-0.2 rounded bg-slate-800 text-sky-300 font-mono text-[10px]">HTML</span>, <span class="px-1 py-0.2 rounded bg-slate-800 text-sky-300 font-mono text-[10px]">CSS</span>, dan <span class="px-1 py-0.2 rounded bg-slate-800 text-sky-300 font-mono text-[10px]">JavaScript</span>. HTML saya gunakan untuk menyusun struktur halaman, CSS untuk mengatur tampilan dan layout agar responsif, sedangkan JavaScript digunakan untuk menambahkan logika serta interaksi pada aplikasi.
        <br /><br />
        Saya juga memahami konsep dasar basis data, seperti tabel, field, record, primary key, relasi antartabel, input data, pembaruan data, dan pengambilan data. Menurut saya, pengembangan website tidak hanya berkaitan dengan tampilan, tetapi juga harus memperhatikan struktur kode, alur data, kemudahan penggunaan, performa, keamanan, serta kemampuan aplikasi untuk dikembangkan dan dipelihara.
        <br /><br />
        Pengalaman yang paling relevan saya dapatkan ketika menjalani kerja praktik sebagai <strong class="text-violet-300">Web Developer Intern di PT Pertamina Hulu Rokan, Rantau Field 1, Aceh Tamiang</strong>. Dalam kegiatan tersebut, saya terlibat dalam pengembangan website profil perusahaan dan sistem inventaris. Pada pengembangan website profil perusahaan, saya belajar menyusun halaman berdasarkan kebutuhan informasi, mengatur struktur tampilan, membuat navigasi, dan menyesuaikan layout agar dapat digunakan pada berbagai ukuran layar.
        <br /><br />
        Sementara itu, pada sistem inventaris, saya mempelajari bagaimana data barang perlu dikelola secara terstruktur, mulai dari pencatatan, pembaruan informasi, pencarian data, sampai penyajian informasi kepada pengguna. Dari pengalaman tersebut, saya belajar memahami kebutuhan pengguna, mengembangkan fitur, melakukan penyesuaian berdasarkan masukan, serta memastikan aplikasi dapat digunakan sesuai kebutuhan pekerjaan.
        <br /><br />
        Selain pengalaman teknis, saya pernah aktif dalam organisasi OPPM sebagai <strong class="text-amber-300">sekretaris sekaligus bendahara</strong>. Dari pengalaman tersebut, saya belajar mengelola administrasi, mencatat kegiatan, mengatur dokumen, mengelola keuangan, menjaga ketelitian, dan bertanggung jawab terhadap tugas yang diberikan.
        <br /><br />
        Saya juga memiliki pengalaman freelance dalam pembuatan materi presentasi serta membantu penyusunan dokumen, seperti makalah, jurnal, dan kebutuhan administrasi lainnya. Pengalaman tersebut melatih saya untuk memahami kebutuhan klien, menjaga komunikasi, mengatur waktu pengerjaan, menyesuaikan hasil dengan permintaan, dan menyelesaikan pekerjaan sesuai tenggat waktu.
        <br /><br />
        Saya juga memiliki sertifikat <strong class="text-cyan-300">Operator Komputer dari LPKS Drekat Mandiri</strong> dengan predikat baik, serta sertifikat <strong class="text-cyan-300">Microsoft Office dari Kursus Digital dan LKI Borju Computer</strong> dengan hasil penilaian yang baik.
        <br /><br />
        Saya merupakan pribadi yang mau belajar, bertanggung jawab, teliti, dan mudah beradaptasi dengan lingkungan kerja. Saya menyadari bahwa masih ada banyak teknologi dan sistem yang perlu saya pelajari. Jika terdapat teknologi yang belum saya kuasai, saya siap mempelajarinya melalui dokumentasi, latihan, contoh implementasi, dan arahan dari tim.
        <br /><br />
        Saya berharap dapat memperoleh kesempatan untuk mengembangkan kemampuan saya lebih jauh sekaligus memberikan kontribusi yang baik bagi perusahaan. Saya siap mengikuti arahan, bekerja sama dengan tim, menyesuaikan diri dengan kebutuhan pekerjaan, dan terus meningkatkan kemampuan saya. Terima kasih, Bapak/Ibu.
      </p>
    </div>
  </div>

</div>`;

  const rawText = `Perkenalan Diri untuk Posisi Web Developer - Eka Syarif Maulana
S1 Teknologi Informasi UMSU (IPK 3,68) - Domisili Torgamba, Labuhanbatu Selatan, Sumatera Utara.
Pengalaman: Web Developer Intern di PT Pertamina Hulu Rokan, Rantau Field 1 (Website Profil Perusahaan & Sistem Inventaris).
Organisasi: Sekretaris & Bendahara OPPM. Freelance: Pembuatan Presentasi & Penyusunan Dokumen.
Sertifikasi: Operator Komputer (LPKS Drekat Mandiri) & Microsoft Office (Kursus Digital & LKI Borju Computer).`;

  await sql`
    UPDATE kerja_items
    SET
      title = 'Perkenalan Diri untuk Posisi Web Developer',
      content_html = ${perkenalanHtml},
      content_raw = ${rawText}
    WHERE category = 'perkenalan';
  `;

  console.log('Successfully updated perkenalan item with 100% full text and mobile-first responsive layout!');
}

updatePerkenalanFull().catch(console.error);
