import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function seedFullKerja() {
  console.log('--- Seeding Streamlined Data for /kerja ---');

  await sql`DELETE FROM kerja_items;`;
  console.log('✓ Cleared old kerja_items');

  const items = [
    {
      category: 'perkenalan',
      title: 'Perkenalan Diri Wawancara Kerja (Percakapan Penuh)',
      order: 1,
      content_raw: `Selamat pagi/siang Bapak dan Ibu.

Perkenalkan, nama saya Eka Syarif Maulana. Saya berdomisili di Torgamba, Labuhanbatu Selatan, Sumatera Utara.

Saya merupakan lulusan Program Studi S1 Teknologi Informasi dari Universitas Muhammadiyah Sumatera Utara dengan IPK 3,68. Selama masa perkuliahan, saya memiliki minat dan fokus mendalam di bidang web development, khususnya rekayasa aplikasi modern dan antarmuka pengguna.

Pengalaman nyata saya bangun saat menjalani kerja praktik sebagai Web Developer Intern di PT Pertamina Hulu Rokan Zona 1 Field Rantau, Aceh Tamiang. Di sana, saya dipercaya terlibat langsung dalam pengembangan website profil perusahaan dan sistem inventaris barang operasional menggunakan framework Next.js dan Tailwind CSS. Dari pengalaman tersebut, saya belajar membangun sistem yang terstruktur, mengoptimasi performa halaman, serta berkolaborasi aktif memenuhi kebutuhan pengguna di lapangan.

Selain kemampuan teknis, saya pernah memegang amanah organisasi sebagai sekretaris sekaligus bendahara di OPPM. Pengalaman ini melatih kedisiplinan, ketelitian arsip, dan akuntabilitas pengelolaan anggaran kerja. Saya juga telah memiliki sertifikat kompetensi resmi Operator Komputer dan Microsoft Office.

Saya adalah pribadi yang cepat belajar, bertanggung jawab, dan mudah beradaptasi dengan teknologi maupun budaya kerja baru. Saya siap mendedikasikan kemampuan terbaik saya untuk memberikan kontribusi nyata bagi tim dan perusahaan Bapak/Ibu.

Terima kasih, Pak/Bu.`,
      content_html: `
<div class="space-y-4 text-slate-200 text-sm leading-relaxed">
  <div class="p-4 rounded-xl border border-sky-500/20 bg-sky-500/5">
    <p class="text-base text-white">
      "Selamat pagi/siang Bapak dan Ibu. Perkenalkan, nama saya <strong class="text-sky-300 font-semibold">Eka Syarif Maulana</strong>. Saya berdomisili di <span class="text-slate-100 font-medium">Torgamba, Labuhanbatu Selatan, Sumatera Utara</span>."
    </p>
  </div>

  <div class="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
    <p class="text-base text-white">
      "Saya merupakan lulusan Program Studi <strong class="text-emerald-300 font-semibold">S1 Teknologi Informasi</strong> dari <strong class="text-white">Universitas Muhammadiyah Sumatera Utara</strong> dengan IPK <strong class="text-emerald-300 font-bold">3,68</strong>. Selama masa studi, saya fokus mendalami bidang rekayasa website dan aplikasi modern."
    </p>
  </div>

  <div class="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
    <p class="text-base text-white">
      "Pengalaman nyata saya bangun saat menjalani kerja praktik sebagai <strong class="text-blue-300 font-semibold">Web Developer Intern di PT Pertamina Hulu Rokan</strong>, Zona 1 Field Rantau, Aceh Tamiang. Di sana, saya terlibat langsung dalam perancangan website profil perusahaan dan sistem inventaris menggunakan framework <strong class="text-blue-300 font-mono">Next.js & Tailwind CSS</strong>. Dari proyek ini, saya belajar membangun kode yang andal, efisien, dan siap digunakan di lingkungan industri nyata."
    </p>
  </div>

  <div class="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5">
    <p class="text-base text-white">
      "Selain di bidang teknis, saya pernah memegang amanah organisasi sebagai <strong class="text-purple-300 font-semibold">sekretaris sekaligus bendahara di OPPM</strong>. Tanggung jawab tersebut membentuk ketelitian saya dalam pencatatan data dan akuntabilitas kerja. Saya juga telah mengantongi sertifikat kompetensi resmi <strong class="text-white">Operator Komputer & Microsoft Office</strong>."
    </p>
  </div>

  <div class="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5">
    <p class="text-base text-white">
      "Saya adalah pribadi yang <strong class="text-rose-300 font-semibold">cepat belajar, bertanggung jawab, dan mudah beradaptasi</strong> dengan lingkungan baru. Saya siap mempelajari tumpukan teknologi perusahaan dan berkomitmen memberikan kontribusi terbaik bagi kemajuan tim."
    </p>
    <p class="text-base text-rose-300 font-semibold mt-3">
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
      content_raw: `1. Pacing & Tempo: Bicara santai sekitar 120-140 kata per menit. Jangan terburu-buru.
2. Jeda Nafas & Kontak Mata: Beri jeda 1 detik di setiap perpindahan poin. Tatap pewawancara dengan rileks dan hangat.
3. Artikulasi: Tegaskan penyebutan kampus UMSU, IPK 3,68, dan PT Pertamina Hulu Rokan secara percaya diri.
4. Senyum & Ketenangan: Senyum tulus saat pembukaan dan penutupan.`,
      content_html: `
<div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-slate-200">
  <div class="p-4 rounded-xl border border-border/50 bg-card/60 space-y-1.5">
    <div class="text-sky-400 font-semibold text-xs tracking-wider uppercase">01 · Tempo Bicara (Pacing)</div>
    <p class="text-xs text-slate-300 leading-relaxed">
      Bicara santai sekitar <strong class="text-white">120–140 kata per menit</strong>. Anggap sedang mengobrol profesional dengan rekan senior. Jangan membaca tergesa-gesa.
    </p>
  </div>

  <div class="p-4 rounded-xl border border-border/50 bg-card/60 space-y-1.5">
    <div class="text-emerald-400 font-semibold text-xs tracking-wider uppercase">02 · Kontak Mata & Senyum</div>
    <p class="text-xs text-slate-300 leading-relaxed">
      Tatap mata pewawancara dengan ramah. Berikan senyuman hangat di awal salam dan saat mengucap penutup.
    </p>
  </div>

  <div class="p-4 rounded-xl border border-border/50 bg-card/60 space-y-1.5">
    <div class="text-amber-400 font-semibold text-xs tracking-wider uppercase">03 · Artikulasi Kata Kunci</div>
    <p class="text-xs text-slate-300 leading-relaxed">
      Tegaskan penyebutan: <strong class="text-amber-300">Teknologi Informasi UMSU</strong>, <strong class="text-amber-300">IPK 3,68</strong>, dan <strong class="text-amber-300">PT Pertamina Hulu Rokan</strong>.
    </p>
  </div>

  <div class="p-4 rounded-xl border border-border/50 bg-card/60 space-y-1.5">
    <div class="text-purple-400 font-semibold text-xs tracking-wider uppercase">04 · Jeda Alami (Tanpa "Eee")</div>
    <p class="text-xs text-slate-300 leading-relaxed">
      Bila butuh berpikir sejenak sebelum menjawab, ambil jeda hening 1 detik sambil tersenyum tenang.
    </p>
  </div>
</div>
      `.trim()
    },
    {
      category: 'tips',
      title: 'Metode STAR untuk Menjawab Pertanyaan Pengalaman Kerja',
      order: 2,
      content_raw: `Gunakan metode STAR:
- Situation: Jelaskan latar belakang masalah di lapangan.
- Task: Sebutkan tanggung jawab spesifik Anda.
- Action: Ceritakan teknologi dan tindakan nyata yang Anda ambil.
- Result: Sampaikan hasil akhir yang terbukti bermanfaat.`,
      content_html: `
<div class="space-y-3 text-slate-200">
  <div class="p-3.5 rounded-xl border border-border/50 bg-card/60 space-y-1">
    <div class="text-xs font-semibold text-sky-400">S · SITUATION (Situasi Proyek)</div>
    <p class="text-xs text-slate-300 leading-relaxed">
      "Saat kerja praktik di Pertamina Hulu Rokan Rantau Field, proses pencatatan inventaris barang operasional membutuhkan aplikasi terpusat yang cepat."
    </p>
  </div>
  <div class="p-3.5 rounded-xl border border-border/50 bg-card/60 space-y-1">
    <div class="text-xs font-semibold text-emerald-400">T · TASK (Tanggung Jawab Anda)</div>
    <p class="text-xs text-slate-300 leading-relaxed">
      "Tugas saya sebagai Web Developer Intern adalah membangun antarmuka sistem inventaris dan membarui website profil perusahaan."
    </p>
  </div>
  <div class="p-3.5 rounded-xl border border-border/50 bg-card/60 space-y-1">
    <div class="text-xs font-semibold text-blue-400">A · ACTION (Solusi & Teknologi)</div>
    <p class="text-xs text-slate-300 leading-relaxed">
      "Saya menggunakan Next.js dan Tailwind CSS untuk menciptakan sistem yang responsif, cepat, dan mudah dioperasikan staf lapangan."
    </p>
  </div>
  <div class="p-3.5 rounded-xl border border-border/50 bg-card/60 space-y-1">
    <div class="text-xs font-semibold text-rose-400">R · RESULT (Hasil Nyata)</div>
    <p class="text-xs text-slate-300 leading-relaxed">
      "Sistem berjalan stabil, pencarian aset menjadi efisien, dan proyek selesai tepat waktu dengan hasil evaluasi memuaskan."
    </p>
  </div>
</div>
      `.trim()
    },
    {
      category: 'tips',
      title: 'Etika Wawancara & Sikap Penutupan',
      order: 3,
      content_raw: `1. Jangan Mendahului Tanya Balik: Cukup tutup dengan "Terima kasih, Pak/Bu." Biarkan pewawancara mengarahkan percakapan.
2. Jika Dipersilakan Bertanya: Tanyakan tentang ekspektasi tim atau alur kerja engineering perusahaan.
3. Tetap Rendah Hati: Bawa nilai kejujuran, etika santun, dan komitmen belajar tinggi.`,
      content_html: `
<div class="space-y-3 text-slate-200">
  <div class="p-4 rounded-xl border border-amber-500/25 bg-amber-500/5 space-y-1.5">
    <div class="text-xs font-semibold text-amber-400 uppercase tracking-wider">Aturan Penutupan</div>
    <p class="text-xs text-slate-200 leading-relaxed">
      Setelah selesai memperkenalkan diri, <strong class="text-white font-semibold">jangan langsung bertanya balik</strong>. Cukup tersenyum dan katakan: <span class="text-amber-300 font-semibold">"Sekian perkenalan singkat dari saya. Terima kasih, Pak/Bu."</span>
    </p>
  </div>
  <div class="p-4 rounded-xl border border-border/50 bg-card/60 space-y-1.5">
    <div class="text-xs font-semibold text-sky-400 uppercase tracking-wider">Pertanyaan Balik (Bila Dipersilakan)</div>
    <p class="text-xs text-slate-300 leading-relaxed">
      Bila pewawancara mempersilakan, ajukan pertanyaan: <em>"Apa target atau pencapaian utama yang diharapkan tim dari posisi ini dalam 3 bulan pertama?"</em>
    </p>
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
Tugas utama saya adalah mengembangkan sistem inventaris internal dan memperbarui website profil perusahaan menggunakan Next.js dan Tailwind CSS.
Tantangannya adalah memastikan antarmuka mudah digunakan staf lapangan dalam menginput data barang secara cepat dan minim kesalahan.
Hasilnya, aplikasi berjalan stabil, pencarian aset menjadi jauh lebih cepat, dan saya belajar standar kerja profesional BUMN."`,
      content_html: `
<div class="space-y-2 text-xs text-slate-300 leading-relaxed">
  <p class="font-medium text-white text-sm">
    "Selama kerja praktik di <strong class="text-sky-300">PT Pertamina Hulu Rokan Zona 1 Field Rantau</strong>, saya bertugas sebagai Web Developer Intern."
  </p>
  <p>
    "Saya mengembangkan sistem inventaris dan memperbarui website profil perusahaan menggunakan <strong class="text-sky-300">Next.js dan Tailwind CSS</strong>. Fokus saya adalah kemudahan navigasi bagi staf lapangan dalam mendata barang secara akurat."
  </p>
  <p>
    "Dari pengalaman ini, saya belajar membangun sistem yang andal dan bekerja terstruktur dalam tim profesional BUMN."
  </p>
</div>
      `.trim()
    },
    {
      category: 'qa',
      title: 'Q&A 2: Mengapa Memilih Next.js Dibanding React Murni?',
      order: 2,
      content_raw: `Pertanyaan:
"Mengapa Anda memilih Next.js untuk proyek web tersebut? Apa kelebihan utamanya?"

Jawaban Kunci:
"Next.js memberikan keunggulan Server-Side Rendering (SSR) dan Static Site Generation (SSG) sehingga waktu muat halaman sangat cepat.
Selain itu, struktur App Router berbasis folder membuat arsitektur kode sangat rapi dan mudah dirawat. Optimasi bawaan untuk caching, font, dan image juga meringankan beban server dan kuota pengguna."`,
      content_html: `
<div class="space-y-2 text-xs text-slate-300 leading-relaxed">
  <p>
    "Next.js menawarkan fleksibilitas <strong class="text-indigo-300">SSR dan SSG</strong>, membuat halaman terbuka instan tanpa jeda rendering kosong."
  </p>
  <p>
    "Struktur <strong class="text-white">App Router berbasis folder</strong> membuat tata letak kode modular, mudah dibaca rekan tim, dan siap dikembangkan dalam skala besar."
  </p>
</div>
      `.trim()
    },
    {
      category: 'qa',
      title: 'Q&A 3: Relevansi Pengalaman Bendahara & Sekretaris di Organisasi OPPM',
      order: 3,
      content_raw: `Pertanyaan:
"Anda pernah menjabat sebagai sekretaris dan bendahara di OPPM. Bagaimana pengalaman non-teknis ini membantu pekerjaan Anda sebagai developer?"

Jawaban Kunci:
"Sebagai bendahara, saya memegang tanggung jawab pencatatan arus kas dan transparansi anggaran yang melatih ketelitian tinggi—karakteristik penting dalam koding agar terhindar dari bug logika.
Sebagai sekretaris, saya terbiasa menyusun dokumentasi terstruktur dan berkoordinasi dengan banyak pihak. Kemampuan dokumentasi dan komunikasi ini membuat saya selalu menulis kode yang rapi dan disiplin terhadap tenggat waktu."`,
      content_html: `
<div class="space-y-2 text-xs text-slate-300 leading-relaxed">
  <p>
    "Peran bendahara melatih saya memiliki <strong class="text-purple-300">ketelitian tinggi dan akuntabilitas mutlak</strong>. Ketelitian ini saya terapkan saat menulis kode, validasi form, dan perancangan database."
  </p>
  <p>
    "Sebagai sekretaris, saya terbiasa membuat dokumentasi terstruktur yang membuat saya selalu menulis kode rapi dan mudah dipahami rekan tim."
  </p>
</div>
      `.trim()
    },
    {
      category: 'qa',
      title: 'Q&A 4: Pendekatan Menangani Bug atau Error Rumit di Sistem',
      order: 4,
      content_raw: `Pertanyaan:
"Bagaimana cara Anda menyelesaikan bug sulit yang terjadi di sistem?"

Jawaban Kunci:
"Pertama, saya memeriksa log server dan console untuk mengetahui alur kegagalan.
Kedua, saya mereproduksi error di lingkungan lokal untuk mengisolasi akar masalah.
Ketiga, saya merancang perbaikan terfokus (minimal invasive) agar tidak menimbulkan efek samping pada modul lain.
Terakhir, saya menguji menyeluruh sebelum deploy dan mencatat solusinya."`,
      content_html: `
<div class="space-y-2 text-xs text-slate-300 leading-relaxed">
  <p>
    "Saya menanganinya secara sistematis: <strong class="text-rose-300">Cek log error</strong>, <strong class="text-rose-300">reproduksi di lokal</strong>, <strong class="text-rose-300">isolasi akar masalah</strong>, dan <strong class="text-rose-300">uji menyeluruh sebelum deploy</strong>."
  </p>
</div>
      `.trim()
    },
    {
      category: 'qa',
      title: 'Q&A 5: Apa Kelemahan Terbesar Anda dan Solusinya?',
      order: 5,
      content_raw: `Pertanyaan:
"Apa kelemahan terbesar Anda, dan bagaimana cara Anda mengatasinya?"

Jawaban Kunci:
"Dulu saya cenderung terlalu perfeksionis pada detail kecil tampilan yang bisa memakan waktu lebih lama.
Sekarang saya mengatasinya dengan menerapkan timeboxing dan checklist prioritas: memastikan fitur fungsional utama selesai dan stabil terlebih dahulu sesuai tenggat waktu, baru memoles estetika jika waktu masih tersedia."`,
      content_html: `
<div class="space-y-2 text-xs text-slate-300 leading-relaxed">
  <p>
    "Dulu saya cenderung <strong class="text-amber-300">terlalu perfeksionis pada detail kecil</strong>. Sekarang saya mengatasinya dengan menetapkan <strong class="text-white">skala prioritas dan timeboxing</strong>: fungsionalitas inti selesai dan stabil terlebih dahulu sesuai deadline."
  </p>
</div>
      `.trim()
    },
    {
      category: 'qa',
      title: 'Q&A 6: Mengapa Perusahaan Harus Memilih Anda?',
      order: 6,
      content_raw: `Pertanyaan:
"Dari sekian banyak pelamar, mengapa kami harus memilih Anda?"

Jawaban Kunci:
"Karena saya menawarkan kombinasi kemampuan teknis web modern (Next.js, TypeScript) yang sudah teruji nyata di BUMN Pertamina Hulu Rokan, fondasi akademik kuat dari TI UMSU dengan IPK 3,68, serta kedisiplinan dan integritas tinggi dari pengalaman organisasi pesantren/OPPM."`,
      content_html: `
<div class="space-y-2 text-xs text-slate-300 leading-relaxed">
  <p>
    "Saya menawarkan perpaduan: <strong class="text-emerald-300">Skill web modern teruji</strong> di Pertamina Hulu Rokan, <strong class="text-emerald-300">IPK 3,68 TI UMSU</strong>, serta <strong class="text-emerald-300">integritas dan kedisiplinan tinggi</strong>."
  </p>
</div>
      `.trim()
    },
    {
      category: 'qa',
      title: 'Q&A 7: Menyikapi Perbedaan Pendapat dalam Tim',
      order: 7,
      content_raw: `Pertanyaan:
"Bagaimana sikap Anda jika atasan atau rekan kerja memiliki pendapat teknis yang berbeda?"

Jawaban Kunci:
"Saya mendengarkan pertimbangan mereka secara objektif dan menyampaikan data teknis pendukung secara santun. Jika keputusan akhir telah disepakati oleh tim atau lead, saya menghormati keputusan tersebut dan berkomitmen mengeksekusinya sebaik mungkin demi keberhasilan proyek."`,
      content_html: `
<div class="space-y-2 text-xs text-slate-300 leading-relaxed">
  <p>
    "Saya mendengarkan sudut pandang mereka secara objektif. Jika keputusan akhir sudah disepakati, <strong class="text-cyan-300">saya berkomitmen penuh mendukung dan mengeksekusinya</strong> demi kesuksesan bersama tim."
  </p>
</div>
      `.trim()
    },
    {
      category: 'qa',
      title: 'Q&A 8: Ekspektasi Gaji & Rencana Karir',
      order: 8,
      content_raw: `Pertanyaan:
"Berapa ekspektasi gaji Anda dan apa target karir Anda ke depan?"

Jawaban Kunci:
"Saya terbuka mengikuti standar remunerasi resmi yang berlaku di perusahaan dan standar UMR setempat. Fokus utama saya adalah memberikan nilai tambah nyata melalui keahlian web development saya, serta terus berkembang menjadi Software Engineer yang handal dan mandiri."`,
      content_html: `
<div class="space-y-2 text-xs text-slate-300 leading-relaxed">
  <p>
    "Saya terbuka mengikuti struktur standar kompensasi resmi perusahaan dan UMR setempat. Prioritas utama saya adalah <strong class="text-emerald-300">memberikan kontribusi nyata</strong> dan bertumbuh menjadi engineer andalan."
  </p>
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

  console.log('\n--- Streamlined Seeding Completed! Total items:', items.length);
}

seedFullKerja().catch(e => {
  console.error('Seeding failed:', e);
  process.exit(1);
});
