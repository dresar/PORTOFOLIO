import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function seedFullKerja() {
  console.log('--- Seeding Full Comprehensive Data for /kerja ---');

  await sql`DELETE FROM kerja_items;`;
  console.log('✓ Cleared old kerja_items to ensure clean order & structure');

  const items = [
    {
      category: 'perkenalan',
      title: 'Elevator Pitch Utama: Perkenalan Diri Profesional (~50 Detik)',
      order: 1,
      content_raw: `Perkenalkan, nama saya Eka Syarif Maulana. Saya berdomisili di Torgamba, Labuhanbatu Selatan, Sumatera Utara.
Saya merupakan lulusan Program Studi Teknologi Informasi dari Universitas Muhammadiyah Sumatera Utara dengan IPK 3,68. Saya memiliki minat besar di bidang teknologi informasi, khususnya dalam pengembangan aplikasi dan website modern.
Saya pernah menjalani kerja praktik sebagai Web Developer Intern di PT Pertamina Hulu Rokan, Rantau Field 1, Aceh Tamiang. Di sana, saya terlibat langsung dalam pengembangan website profil perusahaan dan sistem inventaris menggunakan framework Next.js. Dari pengalaman nyata tersebut, saya belajar bagaimana membangun aplikasi yang andal dan bekerja secara terstruktur dalam lingkungan profesional.
Selain di bidang teknis, saya pernah aktif memegang amanah organisasi sebagai sekretaris sekaligus bendahara di OPPM. Saya juga telah mengantongi sertifikat kompetensi resmi Operator Komputer dan Microsoft Office.
Saya adalah pribadi yang cepat belajar, bertanggung jawab, dan mudah beradaptasi dengan lingkungan baru. Saya siap mempelajari tumpukan teknologi yang digunakan perusahaan dan berkomitmen memberikan kontribusi nyata terbaik bagi tim.
Terima kasih, Pak/Bu.`,
      content_html: `
<div class="space-y-6 text-slate-200">
  <div class="border-l-2 border-sky-400 pl-4 py-1">
    <div class="text-[11px] font-mono tracking-wider uppercase text-sky-400 mb-1">01 · Pembuka & Domisili</div>
    <p class="text-base text-white leading-relaxed">
      "Perkenalkan, nama saya <strong class="text-sky-300 font-semibold">Eka Syarif Maulana</strong>. Saya berdomisili di <span class="text-slate-100 font-medium">Torgamba, Labuhanbatu Selatan, Sumatera Utara</span>."
    </p>
  </div>

  <div class="border-l-2 border-emerald-400 pl-4 py-1">
    <div class="text-[11px] font-mono tracking-wider uppercase text-emerald-400 mb-1">02 · Pendidikan & Akademik</div>
    <p class="text-base text-white leading-relaxed">
      "Saya merupakan lulusan Program Studi <strong class="text-emerald-300 font-semibold">Teknologi Informasi</strong> dari <span class="text-white font-medium">Universitas Muhammadiyah Sumatera Utara</span> dengan IPK <strong class="text-emerald-300 font-bold">3,68</strong>. Saya memiliki minat besar di bidang teknologi informasi, khususnya dalam pengembangan aplikasi dan website modern."
    </p>
  </div>

  <div class="border-l-2 border-blue-400 pl-4 py-1">
    <div class="text-[11px] font-mono tracking-wider uppercase text-blue-400 mb-1">03 · Pengalaman Nyata di BUMN</div>
    <p class="text-base text-white leading-relaxed">
      "Saya pernah menjalani kerja praktik sebagai <strong class="text-blue-300 font-semibold">Web Developer Intern</strong> di <span class="text-white font-medium">PT Pertamina Hulu Rokan, Rantau Field 1, Aceh Tamiang</span>. Di sana, saya terlibat langsung dalam pengembangan website profil perusahaan dan sistem inventaris menggunakan framework modern <strong class="text-blue-300">Next.js</strong>. Dari pengalaman nyata tersebut, saya belajar bagaimana membangun aplikasi yang andal dan bekerja secara terstruktur dalam lingkungan profesional."
    </p>
  </div>

  <div class="border-l-2 border-purple-400 pl-4 py-1">
    <div class="text-[11px] font-mono tracking-wider uppercase text-purple-400 mb-1">04 · Kepemimpinan & Kredensial</div>
    <p class="text-base text-white leading-relaxed">
      "Selain di bidang teknis, saya pernah aktif memegang amanah organisasi sebagai <strong class="text-purple-300 font-semibold">sekretaris sekaligus bendahara di OPPM</strong>. Saya juga telah mengantongi sertifikat kompetensi resmi <span class="text-white font-medium">Operator Komputer</span> dan <span class="text-white font-medium">Microsoft Office</span>."
    </p>
  </div>

  <div class="border-l-2 border-rose-400 pl-4 py-1">
    <div class="text-[11px] font-mono tracking-wider uppercase text-rose-400 mb-1">05 · Etos Kerja & Penutupan</div>
    <p class="text-base text-white leading-relaxed">
      "Saya adalah pribadi yang <strong class="text-rose-300 font-semibold">cepat belajar, bertanggung jawab, dan mudah beradaptasi</strong> dengan lingkungan baru. Saya siap mempelajari tumpukan teknologi yang digunakan perusahaan dan berkomitmen memberikan kontribusi nyata terbaik bagi tim."
    </p>
    <p class="text-base text-rose-300 font-semibold mt-3">
      "Terima kasih, Pak/Bu."
    </p>
  </div>
</div>
      `.trim()
    },
    {
      category: 'perkenalan',
      title: 'Elevator Pitch Singkat: Versi Ringkas (~30 Detik)',
      order: 2,
      content_raw: `Selamat pagi/siang Bapak dan Ibu. Perkenalkan, saya Eka Syarif Maulana, lulusan S1 Teknologi Informasi UMSU dengan IPK 3,68 asal Torgamba, Labuhanbatu Selatan.
Saya memiliki pengalaman praktis sebagai Web Developer Intern di PT Pertamina Hulu Rokan, mengembangkan website profil dan sistem inventaris dengan Next.js. Selain itu, saya pernah menjabat sebagai bendahara dan sekretaris di OPPM yang membentuk integritas dan kedisiplinan kerja saya.
Dengan keahlian web development dan kemauan belajar yang tinggi, saya siap berkontribusi aktif dan beradaptasi cepat di perusahaan ini. Terima kasih, Pak/Bu.`,
      content_html: `
<div class="space-y-5 text-slate-200">
  <div class="border-l-2 border-sky-400 pl-4 py-1">
    <div class="text-[11px] font-mono tracking-wider uppercase text-sky-400 mb-1">Identitas & Akademik</div>
    <p class="text-base text-white leading-relaxed">
      "Selamat pagi/siang Bapak dan Ibu. Perkenalkan, saya <strong class="text-sky-300 font-semibold">Eka Syarif Maulana</strong>, lulusan S1 Teknologi Informasi UMSU dengan IPK <strong class="text-emerald-300">3,68</strong> asal Torgamba, Labuhanbatu Selatan."
    </p>
  </div>

  <div class="border-l-2 border-blue-400 pl-4 py-1">
    <div class="text-[11px] font-mono tracking-wider uppercase text-blue-400 mb-1">Pengalaman & Organisasi</div>
    <p class="text-base text-white leading-relaxed">
      "Saya memiliki pengalaman praktis sebagai Web Developer Intern di <strong class="text-blue-300">PT Pertamina Hulu Rokan</strong>, mengembangkan website profil dan sistem inventaris dengan <strong class="text-blue-300">Next.js</strong>. Selain itu, saya pernah menjabat sebagai bendahara dan sekretaris di OPPM yang membentuk kedisiplinan dan akuntabilitas kerja saya."
    </p>
  </div>

  <div class="border-l-2 border-emerald-400 pl-4 py-1">
    <div class="text-[11px] font-mono tracking-wider uppercase text-emerald-400 mb-1">Komitmen</div>
    <p class="text-base text-white leading-relaxed">
      "Dengan keahlian web modern dan kemauan belajar yang tinggi, saya siap berkontribusi aktif dan beradaptasi cepat di perusahaan ini."
    </p>
    <p class="text-base text-emerald-300 font-semibold mt-2.5">
      "Terima kasih, Pak/Bu."
    </p>
  </div>
</div>
      `.trim()
    },
    {
      category: 'perkenalan',
      title: 'Elevator Pitch Teknis: Khusus User Interview (~60 Detik)',
      order: 3,
      content_raw: `Perkenalkan, nama saya Eka Syarif Maulana, lulusan Teknologi Informasi UMSU dengan fokus keahlian Fullstack & Frontend Web Development.
Tech stack utama saya mencakup React, Next.js, TypeScript, Tailwind CSS, serta integrasi REST API dan PostgreSQL.
Pengalaman nyata saya bangun saat magang di PT Pertamina Hulu Rokan Field Rantau, di mana saya merancang website profil dan aplikasi inventaris dengan Next.js. Di proyek tersebut, saya menerapkan struktur kode modular, optimasi performa halaman, dan pengamanan input data operasional.
Saya terbiasa menggunakan Git untuk version control, menulis kode yang bersih, serta cepat mempelajari framework atau tools baru sesuai kebutuhan sistem perusahaan. Saya siap membawa kemampuan teknis dan dedikasi penuh ke dalam tim engineering Bapak/Ibu.
Terima kasih, Pak/Bu.`,
      content_html: `
<div class="space-y-5 text-slate-200">
  <div class="border-l-2 border-indigo-400 pl-4 py-1">
    <div class="text-[11px] font-mono tracking-wider uppercase text-indigo-400 mb-1">Fokus Keahlian Rekayasa Web</div>
    <p class="text-base text-white leading-relaxed">
      "Perkenalkan, nama saya <strong class="text-indigo-300 font-semibold">Eka Syarif Maulana</strong>, lulusan Teknologi Informasi UMSU dengan fokus keahlian <strong class="text-white">Frontend & Fullstack Web Development</strong>."
    </p>
  </div>

  <div class="border-l-2 border-sky-400 pl-4 py-1">
    <div class="text-[11px] font-mono tracking-wider uppercase text-sky-400 mb-1">Tech Stack & Kemampuan Praktis</div>
    <p class="text-base text-white leading-relaxed">
      "Tech stack utama saya mencakup <strong class="text-sky-300">React, Next.js, TypeScript, Tailwind CSS</strong>, serta integrasi REST API dan database relasional <strong class="text-sky-300">PostgreSQL</strong>."
    </p>
  </div>

  <div class="border-l-2 border-blue-400 pl-4 py-1">
    <div class="text-[11px] font-mono tracking-wider uppercase text-blue-400 mb-1">Implementasi Proyek Nyata</div>
    <p class="text-base text-white leading-relaxed">
      "Pengalaman nyata saya bangun saat magang di <strong class="text-blue-300">PT Pertamina Hulu Rokan</strong> Field Rantau, di mana saya merancang website profil dan sistem inventaris dengan Next.js. Di proyek tersebut, saya menerapkan struktur kode modular, optimasi rendering performa, dan validasi data lapangan yang andal."
    </p>
  </div>

  <div class="border-l-2 border-emerald-400 pl-4 py-1">
    <div class="text-[11px] font-mono tracking-wider uppercase text-emerald-400 mb-1">Standar Rekayasa & Penutup</div>
    <p class="text-base text-white leading-relaxed">
      "Saya terbiasa menggunakan Git untuk kolaborasi, menulis kode yang rapi dan terstruktur, serta cepat menguasai arsitektur baru. Saya siap membawa kemampuan teknis dan dedikasi penuh ke dalam tim engineering Bapak/Ibu."
    </p>
    <p class="text-base text-emerald-300 font-semibold mt-2.5">
      "Terima kasih, Pak/Bu."
    </p>
  </div>
</div>
      `.trim()
    },

    {
      category: 'tips',
      title: 'Panduan Tempo Bicara & Bahasa Tubuh (Body Language & Voice)',
      order: 1,
      content_raw: `1. Pacing & Tempo: Bicara dengan tempo santai sekitar 120-140 kata per menit. Jangan terburu-buru seperti sedang menghafal cepat.
2. Jeda Nafas & Kontak Mata: Ambil jeda 1-2 detik di setiap perpindahan poin. Tatap pewawancara dengan rileks dan hangat, bukan menatap kaku.
3. Artikulasi Suara: Ucapkan nama, kampus (UMSU), IPK (3,68), dan perusahaan (PT Pertamina Hulu Rokan) secara jelas dan percaya diri.
4. Bahasa Tubuh: Posisi bahu tegak namun rileks, tangan terbuka di atas meja, dan senyum wajar saat memulai dan mengakhiri perkenalan.`,
      content_html: `
<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-200">
  <div class="p-4 rounded-xl border border-border/50 bg-card/60 space-y-2">
    <div class="flex items-center gap-2 text-sky-400 font-semibold text-xs tracking-wider uppercase">
      <span>01</span>
      <span>Tempo & Ketukan Bicara</span>
    </div>
    <p class="text-xs text-slate-300 leading-relaxed">
      Bicaralah dengan santai sekitar <strong class="text-white">120–140 kata per menit</strong>. Anggap sedang menceritakan pengalaman kepada rekan kerja senior. Hindari nada datar tanpa jeda agar pendengar nyaman menyerap informasi.
    </p>
  </div>

  <div class="p-4 rounded-xl border border-border/50 bg-card/60 space-y-2">
    <div class="flex items-center gap-2 text-emerald-400 font-semibold text-xs tracking-wider uppercase">
      <span>02</span>
      <span>Kontak Mata & Senyum</span>
    </div>
    <p class="text-xs text-slate-300 leading-relaxed">
      Tatap mata atau area kening pewawancara secara rileks. Berikan senyuman tulus saat mengucap salam pembuka dan salam penutup. Jika wawancara online via Google Meet/Zoom, pandang sesekali ke lensa webcam.
    </p>
  </div>

  <div class="p-4 rounded-xl border border-border/50 bg-card/60 space-y-2">
    <div class="flex items-center gap-2 text-amber-400 font-semibold text-xs tracking-wider uppercase">
      <span>03</span>
      <span>Penekanan Kata Kunci</span>
    </div>
    <p class="text-xs text-slate-300 leading-relaxed">
      Beri penekanan artikulasi yang tegas pada nama institusi: <strong class="text-amber-300">Teknologi Informasi UMSU</strong>, <strong class="text-amber-300">IPK 3,68</strong>, dan <strong class="text-amber-300">PT Pertamina Hulu Rokan</strong>.
    </p>
  </div>

  <div class="p-4 rounded-xl border border-border/50 bg-card/60 space-y-2">
    <div class="flex items-center gap-2 text-purple-400 font-semibold text-xs tracking-wider uppercase">
      <span>04</span>
      <span>Pernafasan & Mengurangi "Eee / Aaa"</span>
    </div>
    <p class="text-xs text-slate-300 leading-relaxed">
      Jika membutuhkan waktu untuk berpikir sebelum menjawab pertanyaan lanjutan, ambil jeda hening selama 1 detik sambil tersenyum. Hening sejenak jauh lebih berwibawa daripada gumaman "eee" atau "aaa".
    </p>
  </div>
</div>
      `.trim()
    },
    {
      category: 'tips',
      title: 'Metode STAR untuk Menjawab Pertanyaan Pengalaman Kerja',
      order: 2,
      content_raw: `Gunakan metode STAR saat ditanya tentang proyek dan pengalaman kerja:
- Situation (Situasi): Jelaskan konteks proyek atau masalah yang ada di lingkungan kerja.
- Task (Tugas): Sebutkan tanggung jawab spesifik yang diamanahkan kepada Anda.
- Action (Aksi): Uraikan teknologi, langkah konkret, dan keputusan yang Anda ambil untuk menyelesaikan tugas.
- Result (Hasil): Sampaikan hasil akhir yang terukur atau dampak positif bagi operasional tim.`,
      content_html: `
<div class="space-y-3 text-slate-200">
  <div class="p-4 rounded-xl border border-border/50 bg-card/60 space-y-1.5">
    <div class="flex items-center gap-2 text-sky-400 font-semibold text-xs">
      <span class="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono">S</span>
      <span>SITUATION (Latar Belakang & Masalah)</span>
    </div>
    <p class="text-xs text-slate-300 leading-relaxed">
      Gambarkan situasi secara singkat. Contoh: "Saat kerja praktik di Pertamina Hulu Rokan Rantau Field, proses pencatatan inventaris barang operasional masih membutuhkan sistem terpusat yang cepat diakses."
    </p>
  </div>

  <div class="p-4 rounded-xl border border-border/50 bg-card/60 space-y-1.5">
    <div class="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
      <span class="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">T</span>
      <span>TASK (Tanggung Jawab Spesifik Anda)</span>
    </div>
    <p class="text-xs text-slate-300 leading-relaxed">
      Jelaskan tugas yang dipercayakan kepada Anda: "Tanggung jawab saya sebagai Web Developer Intern adalah membangun modul antarmuka sistem inventaris dan memperbarui website profil perusahaan."
    </p>
  </div>

  <div class="p-4 rounded-xl border border-border/50 bg-card/60 space-y-1.5">
    <div class="flex items-center gap-2 text-blue-400 font-semibold text-xs">
      <span class="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">A</span>
      <span>ACTION (Langkah Nyata & Solusi Teknis)</span>
    </div>
    <p class="text-xs text-slate-300 leading-relaxed">
      Sebutkan teknologi dan tindakan: "Saya memilih Next.js dan Tailwind CSS untuk membangun antarmuka yang cepat dan responsif, lalu menghubungkannya dengan database agar data barang tersinkronisasi."
    </p>
  </div>

  <div class="p-4 rounded-xl border border-border/50 bg-card/60 space-y-1.5">
    <div class="flex items-center gap-2 text-rose-400 font-semibold text-xs">
      <span class="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono">R</span>
      <span>RESULT (Hasil & Manfaat Nyata)</span>
    </div>
    <p class="text-xs text-slate-300 leading-relaxed">
      Tegaskan hasil akhirnya: "Aplikasi berjalan lancar, pencarian aset menjadi lebih cepat, dan proyek selesai tepat waktu dengan apresiasi baik dari pembimbing lapangan."
    </p>
  </div>
</div>
      `.trim()
    },
    {
      category: 'tips',
      title: 'Etika Wawancara, Pertanyaan Jebakan, & Sikap Penutupan',
      order: 3,
      content_raw: `1. Jangan Mendahului Tanya Balik: Jangan pernah langsung bertanya balik jika belum dipersilakan oleh pewawancara. Cukup tutup respon dengan "Terima kasih, Pak/Bu."
2. Jika Dipersilakan Bertanya: Ajukan pertanyaan cerdas tentang budaya tim, misalnya: "Bagaimana proses kolaborasi tim engineering dalam menyelesaikan sprint atau target proyek harian di sini?"
3. Pertanyaan Gaji: Sampaikan bahwa Anda terbuka berdiskusi mengikuti standar remunerasi perusahaan dan UMR yang berlaku, dengan fokus memberikan kontribusi maksimal terlebih dahulu.
4. Kerendahan Hati Santri: Bawa nilai kejujuran, disiplin, dan etika santun dari latar belakang pesantren/OPPM.`,
      content_html: `
<div class="space-y-3.5 text-slate-200">
  <div class="p-4 rounded-xl border border-amber-500/25 bg-amber-500/5 space-y-2">
    <h3 class="text-xs font-semibold text-amber-400 uppercase tracking-wider">Kaidah Emas Penutupan</h3>
    <p class="text-xs text-slate-200 leading-relaxed">
      Setelah selesai memperkenalkan diri atau menjawab sebuah pertanyaan, <strong class="text-white font-semibold">jangan langsung melontarkan pertanyaan balik ke HRD</strong>. Cukup tersenyum dan katakan: <span class="text-amber-300 font-semibold">"Sekian perkenalan singkat dari saya. Terima kasih, Pak/Bu."</span> Biarkan pewawancara memegang kendali alur percakapan.
    </p>
  </div>

  <div class="p-4 rounded-xl border border-border/50 bg-card/60 space-y-2">
    <h3 class="text-xs font-semibold text-sky-400 uppercase tracking-wider">Pertanyaan Balik Jika Dipersilakan</h3>
    <p class="text-xs text-slate-300 leading-relaxed">
      Bila di akhir sesi pewawancara berkata: <em>"Ada yang ingin Mas Eka tanyakan kepada kami?"</em>, pilihlah salah satu dari pertanyaan berbobot ini:
    </p>
    <ul class="text-xs text-slate-200 space-y-1.5 list-disc list-inside">
      <li>"Jika saya berkesempatan bergabung, apa ekspektasi atau target utama yang diharapkan tim dari posisi ini dalam 3 bulan pertama?"</li>
      <li>"Bagaimana alur kerja harian dan kolaborasi tim developer dalam menangani proyek di perusahaan ini?"</li>
    </ul>
  </div>
</div>
      `.trim()
    },

    {
      category: 'qa',
      title: 'Q&A 1: Ceritakan Peran & Proyek Anda di Pertamina Hulu Rokan',
      order: 1,
      content_raw: `Pertanyaan:
"Bisa ceritakan apa saja tanggung jawab dan proyek yang Anda kerjakan saat menjalani kerja praktik di PT Pertamina Hulu Rokan?"

Jawaban Kunci:
"Selama kerja praktik di PT Pertamina Hulu Rokan Zona 1 Field Rantau, saya dipercaya sebagai Web Developer Intern.
Tugas utama saya adalah mengembangkan sistem inventaris internal dan memperbarui website profil perusahaan.
Saya menggunakan Next.js dan Tailwind CSS karena membutuhkan halaman yang cepat, SEO-friendly, dan mudah dirawat. Tantangan utamanya adalah merancang formulir dan tabel data yang intuitif agar staf operasional dapat menginput dan memantau aset lapangan dengan mudah tanpa kendala teknis.
Hasilnya, aplikasi dapat beroperasi dengan stabil, waktu pencarian data barang menjadi jauh lebih efisien, dan saya mendapatkan pemahaman mendalam tentang standar kedisiplinan kerja di industri energi nasional."`,
      content_html: `
<div class="space-y-3 text-slate-200">
  <div class="p-3.5 rounded-lg border border-sky-500/20 bg-sky-500/5">
    <div class="text-[11px] font-mono text-sky-400 uppercase tracking-wider mb-1">Pertanyaan Pewawancara</div>
    <p class="text-sm font-medium text-white">
      "Bisa ceritakan apa saja tanggung jawab dan proyek yang Anda kerjakan saat menjalani kerja praktik di PT Pertamina Hulu Rokan?"
    </p>
  </div>

  <div class="space-y-2 text-xs text-slate-300 leading-relaxed pl-1">
    <p>
      "Selama kerja praktik di <strong class="text-white">PT Pertamina Hulu Rokan Zona 1 Field Rantau</strong>, saya dipercaya sebagai <strong class="text-sky-300">Web Developer Intern</strong>."
    </p>
    <p>
      "Tugas utama saya adalah mengembangkan <strong class="text-white">sistem inventaris internal</strong> dan website profil perusahaan. Saya menggunakan framework modern <strong class="text-sky-300">Next.js dan Tailwind CSS</strong> untuk memastikan aplikasi memiliki performa loading yang sangat cepat dan tampilan antarmuka yang bersih."
    </p>
    <p>
      "Tantangan utamanya adalah merancang form pencatatan dan tabel filter yang intuitif agar mempermudah staf lapangan dalam mendata barang tanpa kebingungan. Melalui proyek ini, saya belajar mengintegrasikan kode dengan kebutuhan pengguna nyata dan mematuhi etos kerja profesional BUMN."
    </p>
  </div>
</div>
      `.trim()
    },
    {
      category: 'qa',
      title: 'Q&A 2: Mengapa Memilih Next.js Dibanding Library Frontend Lainnya?',
      order: 2,
      content_raw: `Pertanyaan:
"Mengapa Anda memilih Next.js untuk proyek web tersebut? Apa kelebihan utamanya?"

Jawaban Kunci:
"Saya memilih Next.js karena menawarkan fleksibilitas rendering yang lengkap, baik Server-Side Rendering (SSR) maupun Static Site Generation (SSG), yang membuat waktu muat halaman jauh lebih cepat dibanding Single Page Application biasa.
Selain itu, fitur App Router dengan file-based routing membuat struktur kode modular dan mudah dipahami oleh tim. Next.js juga memiliki optimasi otomatis untuk gambar, script, dan font bawaan, sehingga performa web tetap prima. Bagi saya, Next.js memberikan keseimbangan terbaik antara produktivitas developer dan performa pengguna akhir."`,
      content_html: `
<div class="space-y-3 text-slate-200">
  <div class="p-3.5 rounded-lg border border-indigo-500/20 bg-indigo-500/5">
    <div class="text-[11px] font-mono text-indigo-400 uppercase tracking-wider mb-1">Pertanyaan Teknis</div>
    <p class="text-sm font-medium text-white">
      "Mengapa Anda memilih Next.js untuk proyek web tersebut? Apa kelebihan utamanya dibanding React murni?"
    </p>
  </div>

  <div class="space-y-2 text-xs text-slate-300 leading-relaxed pl-1">
    <p>
      "Saya memilih Next.js karena memiliki keunggulan performa melalui <strong class="text-indigo-300">Server-Side Rendering (SSR) dan Static Site Generation (SSG)</strong>. Ini membuat halaman terbuka instan tanpa jeda rendering kosong di sisi klien."
    </p>
    <p>
      "Kedua, struktur <strong class="text-white">App Router berbasis folder</strong> membuat tata letak kode sangat rapi dan mudah dirawat saat aplikasi berkembang. Optimasi bawaan untuk caching, font, dan images juga memangkas beban bandwidth secara signifikan."
    </p>
    <p>
      "Dengan arsitektur Next.js yang solid, integrasi API backend dan deployment ke platform modern menjadi sangat cepat dan terstandarisasi."
    </p>
  </div>
</div>
      `.trim()
    },
    {
      category: 'qa',
      title: 'Q&A 3: Relevansi Pengalaman Bendahara & Sekretaris di Organisasi OPPM',
      order: 3,
      content_raw: `Pertanyaan:
"Anda memiliki pengalaman sebagai sekretaris dan bendahara di OPPM. Bagaimana pengalaman non-teknis ini membantu pekerjaan Anda sebagai developer?"

Jawaban Kunci:
"Sebagai bendahara, saya memegang tanggung jawab pencatatan arus kas dan penyusunan laporan keuangan dengan prinsip transparansi mutlak. Hal ini melatih saya menjadi pribadi yang sangat teliti dan detail—karakteristik yang sangat penting dalam rekayasa perangkat lunak agar tidak terjadi bug logika atau kebocoran data.
Sementara peran sebagai sekretaris melatih saya mendokumentasikan setiap keputusan secara sistematis dan berkomunikasi efektif dengan berbagai tingkatan anggota. Keterampilan dokumentasi dan komunikasi ini membuat saya selalu menulis kode yang rapi, mudah dibaca rekan tim, dan disiplin terhadap tenggat waktu."`,
      content_html: `
<div class="space-y-3 text-slate-200">
  <div class="p-3.5 rounded-lg border border-purple-500/20 bg-purple-500/5">
    <div class="text-[11px] font-mono text-purple-400 uppercase tracking-wider mb-1">Pertanyaan Karakter & Kepemimpinan</div>
    <p class="text-sm font-medium text-white">
      "Anda pernah menjabat sebagai sekretaris dan bendahara di OPPM. Bagaimana pengalaman ini relevan dengan pekerjaan yang Anda lamar?"
    </p>
  </div>

  <div class="space-y-2 text-xs text-slate-300 leading-relaxed pl-1">
    <p>
      "Menjadi bendahara mengajarkan saya <strong class="text-purple-300">ketelitian tinggi dan akuntabilitas mutlak</strong> dalam mengelola angka dan data. Ketelitian ini saya bawa langsung ke dalam coding, di mana setiap baris kode, validasi input, dan struktur database harus benar-benar presisi."
    </p>
    <p>
      "Sebagai sekretaris, saya terbiasa menyusun dokumentasi terstruktur dan mengkoordinasikan banyak orang. Dalam dunia engineering, kemampuan menulis dokumentasi teknis yang jelas dan berkomunikasi santun adalah kunci sukses kerja tim yang produktif."
    </p>
  </div>
</div>
      `.trim()
    },
    {
      category: 'qa',
      title: 'Q&A 4: Pendekatan Sistematis Menangani Bug atau Error Rumit',
      order: 4,
      content_raw: `Pertanyaan:
"Bagaimana cara Anda menyikapi dan menyelesaikan bug sulit yang terjadi di sistem produksi?"

Jawaban Kunci:
"Pertama, saya tetap tenang dan tidak panik. Langkah awal saya adalah memeriksa log server dan console untuk mengidentifikasi pesan error serta alur eksekusi terakhir yang memicu kegagalan.
Kedua, saya mereproduksi error tersebut di lingkungan lokal (development) dengan kondisi data yang serupa untuk mengisolasi penyebab pastinya.
Ketiga, setelah akar masalah ditemukan, saya merancang perbaikan terkecil yang paling aman (least invasive fix) agar tidak menimbulkan efek samping pada modul lain.
Terakhir, saya menguji perbaikan tersebut secara menyeluruh sebelum melakukan deploy, serta mencatat solusinya agar tim dapat mengantisipasi masalah serupa di masa mendatang."`,
      content_html: `
<div class="space-y-3 text-slate-200">
  <div class="p-3.5 rounded-lg border border-rose-500/20 bg-rose-500/5">
    <div class="text-[11px] font-mono text-rose-400 uppercase tracking-wider mb-1">Pertanyaan Problem Solving</div>
    <p class="text-sm font-medium text-white">
      "Bagaimana langkah Anda saat menemukan bug kritis atau error sistem yang belum pernah Anda hadapi sebelumnya?"
    </p>
  </div>

  <div class="space-y-2 text-xs text-slate-300 leading-relaxed pl-1">
    <p>
      "Pendekatan saya selalu berbasis <strong class="text-white font-semibold">data dan isolasi masalah</strong>:"
    </p>
    <ol class="list-decimal list-inside space-y-1.5 pl-1">
      <li><strong class="text-rose-300">Analisis Log & Stack Trace</strong>: Memeriksa log error untuk mengetahui di baris dan komponen mana kegagalan bermula.</li>
      <li><strong class="text-rose-300">Reproduksi di Lingkungan Lokal</strong>: Meniru kondisi input pengguna di lokal agar perbaikan bisa diuji aman tanpa mengganggu sistem aktif.</li>
      <li><strong class="text-rose-300">Isolasi & Perbaikan Terarah</strong>: Memperbaiki titik akar masalah secara modular tanpa mengubah kode yang sudah berjalan stabil.</li>
      <li><strong class="text-rose-300">Verifikasi & Dokumentasi</strong>: Menjalankan uji fungsi menyeluruh sebelum deploy dan mendokumentasikan pencegahannya.</li>
    </ol>
  </div>
</div>
      `.trim()
    },
    {
      category: 'qa',
      title: 'Q&A 5: Apa Kelemahan Terbesar Anda dan Bagaimana Solusinya?',
      order: 5,
      content_raw: `Pertanyaan:
"Apa kelemahan terbesar Anda, dan apa yang telah Anda lakukan untuk mengatasinya?"

Jawaban Kunci:
"Kelemahan saya terkadang terlalu fokus menyempurnakan detail kecil tampilan antarmuka atau refactoring kode, yang berpotensi memakan waktu lebih lama dari jadwal awal.
Untuk mengatasi hal ini, saya sekarang menerapkan teknik timeboxing dan membuat checklist prioritas MVP (Minimum Viable Product). Saya mendahulukan fungsionalitas inti dan penyelesaian target tepat waktu, baru kemudian melakukan perbaikan estetika pada iterasi berikutnya jika alokasi waktu masih tersedia."`,
      content_html: `
<div class="space-y-3 text-slate-200">
  <div class="p-3.5 rounded-lg border border-amber-500/20 bg-amber-500/5">
    <div class="text-[11px] font-mono text-amber-400 uppercase tracking-wider mb-1">Pertanyaan Evaluasi Diri</div>
    <p class="text-sm font-medium text-white">
      "Apa kelemahan terbesar Anda, dan bagaimana cara Anda mengendalikannya?"
    </p>
  </div>

  <div class="space-y-2 text-xs text-slate-300 leading-relaxed pl-1">
    <p>
      "Dulu saya cenderung <strong class="text-amber-300">terlalu perfeksionis pada detail kecil</strong>, seperti menyempurnakan transisi CSS atau struktur kode yang sebenarnya sudah memenuhi spesifikasi."
    </p>
    <p>
      "Untuk mengatasinya, sekarang saya selalu menetapkan <strong class="text-white font-semibold">skala prioritas dan batas waktu (timeboxing)</strong>. Prinsip saya adalah memastikan fitur fungsional utama selesai dan teruji stabil terlebih dahulu sesuai deadline, baru kemudian melakukan pemolesan bertahap."
    </p>
  </div>
</div>
      `.trim()
    },
    {
      category: 'qa',
      title: 'Q&A 6: Mengapa Perusahaan Kami Harus Memilih Anda?',
      order: 6,
      content_raw: `Pertanyaan:
"Dari sekian banyak pelamar, mengapa kami harus memilih Anda untuk posisi ini?"

Jawaban Kunci:
"Karena saya menawarkan kombinasi antara keterampilan teknis web modern yang sudah teruji nyata di industri dan etos kerja yang disiplin serta amanah.
Pertama, saya memiliki fondasi akademis yang kuat dari Teknologi Informasi UMSU dengan IPK 3,68 dan telah membuktikan kemampuan membangun aplikasi inventaris di PT Pertamina Hulu Rokan.
Kedua, pengalaman organisasi di OPPM membentuk saya menjadi pribadi yang bertanggung jawab, mudah diarahkan, dan tidak mudah menyerah saat menghadapi tantangan baru.
Saya tidak hanya ingin bekerja untuk menyelesaikan tugas, tetapi berkomitmen memberikan solusi nyata dan nilai tambah bagi pertumbuhan perusahaan Bapak/Ibu."`,
      content_html: `
<div class="space-y-3 text-slate-200">
  <div class="p-3.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
    <div class="text-[11px] font-mono text-emerald-400 uppercase tracking-wider mb-1">Pertanyaan Nilai Jual Diri</div>
    <p class="text-sm font-medium text-white">
      "Dari sekian banyak pelamar, mengapa kami harus memilih Anda?"
    </p>
  </div>

  <div class="space-y-2 text-xs text-slate-300 leading-relaxed pl-1">
    <p>
      "Saya membawa <strong class="text-emerald-300">tiga keunggulan utama</strong> yang siap langsung berkontribusi bagi tim:"
    </p>
    <ul class="list-disc list-inside space-y-1 pl-1">
      <li><strong class="text-white">Kemampuan Teknis Teruji</strong>: Terbiasa membangun aplikasi berbasis Next.js, React, dan integrasi database dengan bukti nyata di Pertamina Hulu Rokan.</li>
      <li><strong class="text-white">Integritas & Kedisiplinan</strong>: Karakter santri dan pengalaman mengelola kas OPPM menjadikan saya pribadi yang jujur, teliti, dan bertanggung jawab.</li>
      <li><strong class="text-white">Kecepatan Belajar Tinggi</strong>: Lulusan TI UMSU IPK 3,68 yang adaptif terhadap stack teknologi baru perusahaan.</li>
    </ul>
  </div>
</div>
      `.trim()
    },
    {
      category: 'qa',
      title: 'Q&A 7: Menyikapi Perbedaan Pendapat dengan Rekan Kerja atau Atasan',
      order: 7,
      content_raw: `Pertanyaan:
"Bagaimana cara Anda merespons jika ada rekan satu tim atau atasan yang tidak sependapat dengan solusi teknis yang Anda usulkan?"

Jawaban Kunci:
"Saya memandang perbedaan pendapat sebagai peluang untuk menghasilkan solusi yang lebih baik bagi produk.
Pertama, saya akan mendengarkan sudut pandang rekan atau atasan secara seksama tanpa memotong pembicaraan, untuk memahami pertimbangan di balik pandangan mereka.
Kedua, saya akan menyampaikan argumen saya secara objektif berdasarkan data, performa sistem, atau kemudahan perawatan kode di masa depan.
Namun jika setelah diskusi tim memutuskan untuk memilih pendekatan lain, saya akan menghormati keputusan bersama tersebut dan berkomitmen penuh untuk mengeksekusinya dengan hasil terbaik."`,
      content_html: `
<div class="space-y-3 text-slate-200">
  <div class="p-3.5 rounded-lg border border-cyan-500/20 bg-cyan-500/5">
    <div class="text-[11px] font-mono text-cyan-400 uppercase tracking-wider mb-1">Pertanyaan Kerja Sama Tim</div>
    <p class="text-sm font-medium text-white">
      "Bagaimana sikap Anda jika atasan atau rekan tim memiliki pendapat teknis yang berbeda dengan Anda?"
    </p>
  </div>

  <div class="space-y-2 text-xs text-slate-300 leading-relaxed pl-1">
    <p>
      "Saya mendengarkan terlebih dahulu alasan dan pertimbangan mereka secara objektif. Dalam engineering, solusi terbaik biasanya lahir dari diskusi terbuka."
    </p>
    <p>
      "Jika diperlukan, saya menyajikan data perbandingan (seperti kecepatan akses atau kemudahan maintenance). Namun begitu kesepakatan akhir diambil oleh lead atau tim, <strong class="text-cyan-300 font-semibold">saya akan mendukung dan mengeksekusinya dengan dedikasi 100%</strong> demi keberhasilan proyek bersama."
    </p>
  </div>
</div>
      `.trim()
    },
    {
      category: 'qa',
      title: 'Q&A 8: Ekspektasi Gaji & Target Karir',
      order: 8,
      content_raw: `Pertanyaan:
"Berapa ekspektasi gaji Anda untuk posisi ini, dan apa target karir Anda ke depan?"

Jawaban Kunci:
"Mengenai kompensasi, saya terbuka berdiskusi mengikuti struktur penggajian resmi yang berlaku di perusahaan ini dan standar UMR wilayah kerja setempat. Bagi saya sebagai lulusan yang ingin bertumbuh, prioritas utama saya adalah kesempatan untuk berkontribusi secara nyata, mengasah keahlian teknis bersama tim profesional, dan memberikan dampak positif bagi produk perusahaan.
Dalam 2 hingga 3 tahun ke depan, target karir saya adalah berkembang menjadi Software Engineer yang mandiri dan kompeten, mampu memimpin arsitektur fitur kompleks, serta membimbing rekan-rekan baru di masa mendatang."`,
      content_html: `
<div class="space-y-3 text-slate-200">
  <div class="p-3.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
    <div class="text-[11px] font-mono text-emerald-400 uppercase tracking-wider mb-1">Pertanyaan Gaji & Visi Karir</div>
    <p class="text-sm font-medium text-white">
      "Berapa kisaran gaji yang Anda harapkan, dan apa rencana karir Anda 2-3 tahun ke depan?"
    </p>
  </div>

  <div class="space-y-2 text-xs text-slate-300 leading-relaxed pl-1">
    <p>
      "Mengenai gaji, saya fleksibel dan meyakini perusahaan telah memiliki standar kompensasi yang adil dan kompetitif sesuai UMR serta kualifikasi posisi ini. Fokus utama saya adalah <strong class="text-emerald-300 font-semibold">memberikan nilai tambah nyata</strong> melalui kemampuan web development yang saya miliki."
    </p>
    <p>
      "Target saya ke depan adalah terus memperdalam arsitektur sistem skala besar, berkontribusi aktif dalam setiap rilis produk, dan bertumbuh menjadi engineer andalan di perusahaan ini."
    </p>
  </div>
</div>
      `.trim()
    }
  ];

  for (const item of items) {
    await sql`
      INSERT INTO kerja_items (category, title, content_html, content_raw, "order", is_active)
      VALUES (${item.category}, ${item.title}, ${item.content_html}, ${item.content_raw}, ${item.order}, TRUE);
    `;
    console.log(`✓ Seeded [${item.category}]: ${item.title}`);
  }

  console.log('\n--- Seeding Completed Successfully! Total items:', items.length);
}

seedFullKerja().catch(e => {
  console.error('Seeding failed:', e);
  process.exit(1);
});
