import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, serial, text, boolean, timestamp, integer } from 'drizzle-orm/pg-core';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL.replace('channel_binding=require', ''));
const db = drizzle(sql);

const blogPosts = pgTable('blog_post', {
  id: serial('id').primaryKey(),
  categoryId: integer('categoryId'),
  title: text('title').notNull(),
  slug: text('slug').unique().notNull(),
  excerpt: text('excerpt'),
  content: text('content').notNull(),
  coverImage: text('coverImage'),
  tags: text('tags').default('[]').notNull(),
  is_published: boolean('is_published').default(false).notNull(),
  published_at: timestamp('published_at'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

const articles = [
  {
    title: "Mengenal Astro.js: Framework untuk Website Super Cepat",
    slug: "mengenal-astro-js-framework-untuk-website-super-cepat",
    excerpt: "Astro hadir dengan konsep Islands Architecture yang membuat website menjadi sangat ringan. Simak kenapa framework ini semakin populer.",
    content: "## Konsep Islands Architecture\n\nAstro adalah framework web modern yang berfokus pada pengiriman JavaScript seminimal mungkin ke browser. Berbeda dengan framework SPA pada umumnya, Astro merender sebagian besar halaman menjadi HTML statis.\n\n### Islands Architecture\nHanya komponen yang benar-benar membutuhkan interaktivitas yang akan di-hydrate di sisi klien. Komponen lainnya tetap menjadi HTML murni tanpa JavaScript tambahan.\n\n### Mendukung Banyak Framework\nAstro memungkinkan Anda menggunakan React, Vue, Svelte, atau Solid dalam satu proyek yang sama, sesuai kebutuhan masing-masing komponen.\n\nBagi proyek yang mengutamakan kecepatan loading seperti blog atau landing page, Astro adalah pilihan yang sangat layak dipertimbangkan.",
    coverImage: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?q=80&w=1000&auto=format&fit=crop",
    tags: JSON.stringify(["Astro", "Web Dev", "Performance"]),
    is_published: true,
    published_at: "2024-11-14T09:00:00Z"
  },
  {
    title: "Bun: Runtime JavaScript yang Diklaim Jauh Lebih Cepat",
    slug: "bun-runtime-javascript-yang-diklaim-jauh-lebih-cepat",
    excerpt: "Bun menawarkan performa yang jauh lebih baik dibanding Node.js dengan bundler dan package manager bawaan. Apakah sudah siap produksi?",
    content: "## All-in-One JavaScript Runtime\n\nBun adalah runtime JavaScript yang ditulis menggunakan bahasa Zig. Berbeda dengan Node.js yang menggunakan V8, Bun menggunakan JavaScriptCore milik Safari.\n\n### Fitur Unggulan\nBun tidak hanya menjadi runtime, tetapi juga bundler, transpiler, dan package manager dalam satu paket. Instalasi dependensi diklaim jauh lebih cepat dibanding npm maupun yarn.\n\n### Kompatibilitas\nBun dirancang agar kompatibel dengan API Node.js, sehingga sebagian besar package npm dapat berjalan tanpa perubahan berarti.\n\nMeskipun masih terus berkembang, Bun sudah mulai digunakan di berbagai proyek produksi berkat performanya yang mengesankan.",
    coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop",
    tags: JSON.stringify(["Bun", "JavaScript", "Runtime"]),
    is_published: true,
    published_at: "2024-11-20T10:30:00Z"
  },
  {
    title: "Kenapa Banyak Developer Beralih ke Rust untuk Backend?",
    slug: "kenapa-banyak-developer-beralih-ke-rust-untuk-backend",
    excerpt: "Rust dikenal dengan performa setara C++ namun jauh lebih aman. Simak alasan Rust semakin diminati untuk pengembangan backend.",
    content: "## Keamanan Memori Tanpa Garbage Collector\n\nRust menawarkan performa tinggi tanpa mengorbankan keamanan memori, berkat sistem ownership dan borrow checker yang unik.\n\n### Ekosistem Backend\nFramework seperti Axum dan Actix-web membuat pengembangan REST API di Rust menjadi jauh lebih mudah dibanding beberapa tahun lalu.\n\n### Tantangan Belajar\nKurva belajar Rust memang cukup curam bagi pemula, terutama konsep ownership dan lifetimes. Namun begitu terbiasa, developer akan merasakan kepercayaan diri lebih tinggi terhadap kode yang mereka tulis.\n\nUntuk sistem yang membutuhkan performa tinggi dan reliabilitas, Rust menjadi pilihan yang semakin populer di kalangan perusahaan teknologi besar.",
    coverImage: "https://images.unsplash.com/photo-1550439062-609e1531270e?q=80&w=1000&auto=format&fit=crop",
    tags: JSON.stringify(["Rust", "Backend", "Programming"]),
    is_published: true,
    published_at: "2024-11-27T08:15:00Z"
  },
  {
    title: "WebAssembly: Menjalankan Kode Native di Browser",
    slug: "webassembly-menjalankan-kode-native-di-browser",
    excerpt: "WebAssembly memungkinkan bahasa seperti C, C++, dan Rust berjalan di browser dengan performa mendekati native. Berikut penjelasannya.",
    content: "## Apa itu WebAssembly?\n\nWebAssembly (Wasm) adalah format instruksi biner yang dirancang sebagai target kompilasi portabel untuk bahasa tingkat tinggi seperti C, C++, dan Rust.\n\n### Kenapa Penting?\nDengan Wasm, aplikasi yang membutuhkan komputasi berat seperti pengeditan gambar, game, atau simulasi dapat berjalan di browser dengan performa yang jauh lebih baik dibanding JavaScript murni.\n\n### Interoperabilitas dengan JavaScript\nWasm tidak menggantikan JavaScript, melainkan saling melengkapi. Modul Wasm dapat dipanggil langsung dari kode JavaScript untuk menangani bagian yang membutuhkan performa tinggi.\n\nBanyak perusahaan besar seperti Figma dan Google telah memanfaatkan WebAssembly untuk mempercepat aplikasi web mereka.",
    coverImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=1000&auto=format&fit=crop",
    tags: JSON.stringify(["WebAssembly", "Performance", "Web Dev"]),
    is_published: true,
    published_at: "2024-12-03T13:00:00Z"
  },
  {
    title: "Micro Frontend: Solusi untuk Tim Besar yang Bekerja Paralel",
    slug: "micro-frontend-solusi-untuk-tim-besar-yang-bekerja-paralel",
    excerpt: "Ketika satu aplikasi frontend dikerjakan banyak tim, arsitektur micro frontend bisa menjadi solusi. Pahami konsep dan tantangannya.",
    content: "## Memecah Frontend Menjadi Bagian Kecil\n\nMicro frontend adalah pendekatan arsitektur yang memecah aplikasi frontend besar menjadi bagian-bagian kecil yang dapat dikembangkan dan di-deploy secara independen.\n\n### Manfaat Utama\nSetiap tim dapat memilih teknologi yang paling sesuai untuk bagian aplikasi yang mereka kelola, serta melakukan deployment tanpa harus menunggu tim lain.\n\n### Tantangan yang Perlu Diperhatikan\nKompleksitas integrasi antar modul, konsistensi desain, dan ukuran bundle yang membengkak adalah beberapa tantangan yang perlu diantisipasi.\n\nMicro frontend cocok diterapkan pada organisasi besar dengan banyak tim, namun bisa menjadi over-engineering jika diterapkan pada proyek kecil.",
    coverImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1000&auto=format&fit=crop",
    tags: JSON.stringify(["Micro Frontend", "Architecture", "Frontend"]),
    is_published: true,
    published_at: "2024-12-10T11:20:00Z"
  },
  {
    title: "Testing Modern dengan Vitest: Lebih Cepat dari Jest",
    slug: "testing-modern-dengan-vitest-lebih-cepat-dari-jest",
    excerpt: "Vitest hadir sebagai test runner yang terintegrasi dengan Vite dan menawarkan kecepatan eksekusi yang jauh lebih baik.",
    content: "## Test Runner Native untuk Ekosistem Vite\n\nVitest dirancang untuk bekerja mulus dengan konfigurasi Vite yang sudah Anda miliki, sehingga tidak perlu konfigurasi ganda seperti saat menggunakan Jest.\n\n### Kecepatan Eksekusi\nBerkat penggunaan esbuild untuk transformasi kode, Vitest dapat menjalankan test suite jauh lebih cepat dibanding Jest pada proyek berskala besar.\n\n### API yang Familiar\nBagi yang sudah terbiasa dengan Jest, Vitest menyediakan API yang sangat mirip sehingga migrasi menjadi lebih mudah tanpa harus menulis ulang seluruh test.\n\nDengan fitur watch mode dan UI interaktif bawaan, Vitest menjadi pilihan menarik untuk proyek berbasis Vite maupun non-Vite.",
    coverImage: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?q=80&w=1000&auto=format&fit=crop",
    tags: JSON.stringify(["Testing", "Vitest", "JavaScript"]),
    is_published: true,
    published_at: "2024-12-17T09:45:00Z"
  },
  {
    title: "Membangun CI/CD Pipeline dengan GitHub Actions",
    slug: "membangun-ci-cd-pipeline-dengan-github-actions",
    excerpt: "Otomatisasi proses testing dan deployment sangat penting dalam pengembangan modern. Pelajari dasar-dasar GitHub Actions.",
    content: "## Otomatisasi Alur Kerja Pengembangan\n\nGitHub Actions memungkinkan Anda membuat workflow otomatis langsung dari repository, mulai dari testing, build, hingga deployment.\n\n### Struktur Workflow\nWorkflow didefinisikan dalam file YAML di dalam folder `.github/workflows`. Setiap workflow terdiri dari beberapa job yang berjalan pada trigger tertentu, seperti push atau pull request.\n\n### Contoh Sederhana\nSebuah pipeline sederhana biasanya terdiri dari langkah checkout kode, instalasi dependensi, menjalankan test, dan terakhir melakukan deployment jika semua tahap berhasil.\n\nDengan CI/CD yang baik, tim dapat mendeteksi bug lebih awal dan mempercepat siklus rilis produk secara signifikan.",
    coverImage: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?q=80&w=1000&auto=format&fit=crop",
    tags: JSON.stringify(["CI/CD", "GitHub Actions", "DevOps"]),
    is_published: true,
    published_at: "2024-12-23T15:30:00Z"
  },
  {
    title: "Dasar-Dasar Kubernetes untuk Web Developer",
    slug: "dasar-dasar-kubernetes-untuk-web-developer",
    excerpt: "Kubernetes bisa terlihat menakutkan bagi pemula. Artikel ini membahas konsep dasar yang perlu dipahami sebelum terjun lebih dalam.",
    content: "## Orkestrasi Container Skala Besar\n\nKubernetes adalah platform orkestrasi container yang membantu mengelola deployment, scaling, dan operasional aplikasi dalam skala besar.\n\n### Konsep Dasar\nPod adalah unit terkecil dalam Kubernetes yang membungkus satu atau lebih container. Deployment mengatur bagaimana pod dijalankan dan di-scale, sementara Service menyediakan akses jaringan yang stabil.\n\n### Kapan Menggunakan Kubernetes?\nUntuk proyek kecil, Kubernetes mungkin terasa berlebihan. Namun untuk aplikasi dengan traffic tinggi dan kebutuhan scaling otomatis, Kubernetes menjadi solusi yang sangat powerful.\n\nMemahami dasar-dasar ini adalah langkah awal sebelum mendalami topik lanjutan seperti Helm dan service mesh.",
    coverImage: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?q=80&w=1000&auto=format&fit=crop",
    tags: JSON.stringify(["Kubernetes", "DevOps", "Container"]),
    is_published: true,
    published_at: "2024-12-30T10:00:00Z"
  },
  {
    title: "Redis: Meningkatkan Performa Aplikasi dengan Caching",
    slug: "redis-meningkatkan-performa-aplikasi-dengan-caching",
    excerpt: "Query database yang lambat bisa diatasi dengan strategi caching menggunakan Redis. Simak konsep dan contoh implementasinya.",
    content: "## In-Memory Data Store\n\nRedis adalah key-value store yang bekerja di memori, menjadikannya sangat cepat untuk operasi baca dan tulis dibanding database konvensional.\n\n### Kasus Penggunaan Umum\nRedis sering digunakan untuk caching hasil query, menyimpan session pengguna, rate limiting, hingga sebagai message broker untuk sistem antrian.\n\n### Strategi Caching\nPola cache-aside adalah salah satu strategi paling umum, di mana aplikasi mengecek Redis terlebih dahulu sebelum mengambil data dari database utama.\n\nDengan caching yang tepat, beban database dapat berkurang drastis dan waktu respons aplikasi menjadi jauh lebih cepat.",
    coverImage: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1000&auto=format&fit=crop",
    tags: JSON.stringify(["Redis", "Caching", "Backend"]),
    is_published: true,
    published_at: "2025-01-08T09:00:00Z"
  },
  {
    title: "Membangun Fitur Real-Time dengan WebSocket",
    slug: "membangun-fitur-real-time-dengan-websocket",
    excerpt: "Chat, notifikasi, dan live update membutuhkan komunikasi dua arah secara real-time. WebSocket adalah teknologi yang tepat untuk ini.",
    content: "## Komunikasi Dua Arah secara Real-Time\n\nBerbeda dengan HTTP yang bersifat request-response, WebSocket memungkinkan koneksi persisten antara klien dan server sehingga data dapat dikirim dua arah kapan saja.\n\n### Kapan Menggunakan WebSocket?\nFitur seperti live chat, notifikasi real-time, dashboard monitoring, dan game multiplayer sangat cocok memanfaatkan WebSocket.\n\n### Library Populer\nSocket.IO adalah salah satu library paling populer yang menyederhanakan implementasi WebSocket, lengkap dengan fallback otomatis jika koneksi WebSocket tidak tersedia.\n\nMeski powerful, penting untuk memperhatikan skalabilitas koneksi WebSocket saat jumlah pengguna semakin besar.",
    coverImage: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?q=80&w=1000&auto=format&fit=crop",
    tags: JSON.stringify(["WebSocket", "Real-Time", "Backend"]),
    is_published: true,
    published_at: "2025-01-15T14:00:00Z"
  },
  {
    title: "Progressive Web App: Aplikasi Web yang Terasa Seperti Native",
    slug: "progressive-web-app-aplikasi-web-yang-terasa-seperti-native",
    excerpt: "PWA memungkinkan website memiliki pengalaman seperti aplikasi native, lengkap dengan kemampuan offline dan instalasi di homescreen.",
    content: "## Menggabungkan Web dan Aplikasi Native\n\nProgressive Web App (PWA) adalah pendekatan yang memungkinkan website memiliki karakteristik aplikasi native, seperti dapat diinstal dan bekerja secara offline.\n\n### Komponen Utama\nService Worker berperan penting dalam PWA, memungkinkan caching aset serta fungsi offline. Web App Manifest mendefinisikan bagaimana aplikasi tampil saat diinstal di perangkat.\n\n### Kelebihan PWA\nDibanding aplikasi native, PWA tidak memerlukan proses instalasi melalui app store, lebih ringan, dan mudah diperbarui karena berjalan langsung dari browser.\n\nBagi bisnis yang ingin menjangkau pengguna tanpa memaksa mereka mengunduh aplikasi besar, PWA adalah solusi yang sangat efisien.",
    coverImage: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1000&auto=format&fit=crop",
    tags: JSON.stringify(["PWA", "Web Dev", "Mobile"]),
    is_published: true,
    published_at: "2025-01-22T10:30:00Z"
  },
  {
    title: "Pentingnya Aksesibilitas (a11y) dalam Pengembangan Web",
    slug: "pentingnya-aksesibilitas-a11y-dalam-pengembangan-web",
    excerpt: "Website yang baik harus bisa diakses oleh semua orang, termasuk penyandang disabilitas. Simak prinsip dasar aksesibilitas web.",
    content: "## Web untuk Semua Orang\n\nAksesibilitas web (a11y) memastikan bahwa website dapat digunakan oleh semua orang, termasuk mereka yang menggunakan pembaca layar atau memiliki keterbatasan penglihatan dan motorik.\n\n### Praktik Dasar\nPenggunaan HTML semantik, atribut alt pada gambar, kontras warna yang cukup, dan navigasi keyboard yang baik adalah langkah dasar yang wajib diterapkan.\n\n### Standar WCAG\nWeb Content Accessibility Guidelines (WCAG) menjadi acuan standar internasional yang membagi tingkat kepatuhan aksesibilitas menjadi level A, AA, dan AAA.\n\nSelain menjadi kewajiban etis, aksesibilitas yang baik juga berdampak positif pada SEO dan jangkauan pengguna website Anda.",
    coverImage: "https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=1000&auto=format&fit=crop",
    tags: JSON.stringify(["Accessibility", "a11y", "Web Dev"]),
    is_published: true,
    published_at: "2025-01-29T11:00:00Z"
  },
  {
    title: "Membangun Design System yang Konsisten untuk Produk Digital",
    slug: "membangun-design-system-yang-konsisten-untuk-produk-digital",
    excerpt: "Design system membantu tim desain dan developer bekerja lebih selaras. Pelajari komponen penting dalam membangunnya.",
    content: "## Bahasa Visual yang Konsisten\n\nDesign system adalah kumpulan komponen, pola, dan pedoman yang memastikan konsistensi visual dan fungsional di seluruh produk digital.\n\n### Komponen Utama\nToken desain seperti warna, tipografi, dan spacing menjadi fondasi, diikuti dengan library komponen UI yang dapat digunakan berulang kali oleh seluruh tim.\n\n### Manfaat bagi Tim\nDengan design system yang matang, proses development menjadi lebih cepat karena developer tidak perlu membangun komponen dari nol setiap saat, sekaligus menjaga konsistensi brand.\n\nAlat seperti Storybook sering digunakan untuk mendokumentasikan dan menguji komponen dalam design system secara terisolasi.",
    coverImage: "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1000&auto=format&fit=crop",
    tags: JSON.stringify(["Design System", "UI", "Frontend"]),
    is_published: true,
    published_at: "2025-02-05T09:15:00Z"
  },
  {
    title: "Mengelola Monorepo dengan Turborepo",
    slug: "mengelola-monorepo-dengan-turborepo",
    excerpt: "Mengelola banyak package dalam satu repository bisa jadi rumit. Turborepo hadir untuk mempercepat build dan menyederhanakan alur kerja.",
    content: "## Satu Repository, Banyak Package\n\nMonorepo adalah pendekatan menyimpan banyak proyek atau package dalam satu repository, memudahkan berbagi kode antar tim.\n\n### Kenapa Turborepo?\nTurborepo menawarkan sistem caching cerdas yang hanya menjalankan ulang build pada package yang benar-benar berubah, sehingga proses build menjadi jauh lebih cepat.\n\n### Remote Caching\nSelain caching lokal, Turborepo juga mendukung remote caching yang memungkinkan tim berbagi hasil build sehingga tidak perlu membangun ulang dari awal di setiap mesin.\n\nBagi perusahaan dengan banyak aplikasi dan package yang saling terkait, Turborepo dapat menghemat waktu development secara signifikan.",
    coverImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=1000&auto=format&fit=crop",
    tags: JSON.stringify(["Monorepo", "Turborepo", "Tooling"]),
    is_published: true,
    published_at: "2025-02-12T13:45:00Z"
  },
  {
    title: "Server-Sent Events: Alternatif Ringan untuk Update Real-Time",
    slug: "server-sent-events-alternatif-ringan-untuk-update-real-time",
    excerpt: "Tidak semua kebutuhan real-time memerlukan WebSocket. Server-Sent Events bisa menjadi solusi yang lebih sederhana.",
    content: "## Update Satu Arah dari Server ke Klien\n\nServer-Sent Events (SSE) memungkinkan server mengirim data secara terus-menerus ke klien melalui satu koneksi HTTP yang tetap terbuka.\n\n### Kapan Cocok Digunakan?\nSSE sangat cocok untuk kasus seperti notifikasi, live feed, atau update progress yang hanya membutuhkan komunikasi satu arah dari server ke klien.\n\n### Lebih Sederhana dari WebSocket\nBerbeda dengan WebSocket yang mendukung komunikasi dua arah, SSE lebih sederhana untuk diimplementasikan karena hanya menggunakan protokol HTTP biasa tanpa perlu upgrade koneksi.\n\nJika kebutuhan Anda hanya push data dari server, SSE bisa menjadi pilihan yang lebih ringan dibanding WebSocket.",
    coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?q=80&w=1000&auto=format&fit=crop",
    tags: JSON.stringify(["SSE", "Real-Time", "Web Dev"]),
    is_published: true,
    published_at: "2025-02-19T10:00:00Z"
  },
  {
    title: "Edge Computing: Menjalankan Kode Lebih Dekat dengan Pengguna",
    slug: "edge-computing-menjalankan-kode-lebih-dekat-dengan-pengguna",
    excerpt: "Edge functions memungkinkan kode dijalankan di lokasi server yang paling dekat dengan pengguna. Simak manfaat dan penerapannya.",
    content: "## Mendekatkan Komputasi ke Pengguna\n\nEdge computing memungkinkan kode dijalankan pada server yang tersebar di berbagai lokasi geografis, sehingga lebih dekat dengan pengguna dibanding server pusat tradisional.\n\n### Manfaat Utama\nLatensi yang jauh lebih rendah menjadi keuntungan utama, karena permintaan tidak perlu menempuh jarak jauh ke server pusat.\n\n### Platform Populer\nPlatform seperti Vercel Edge Functions dan Cloudflare Workers memudahkan developer menjalankan kode di edge tanpa perlu mengelola infrastruktur secara manual.\n\nUntuk aplikasi dengan pengguna global, memanfaatkan edge computing dapat meningkatkan pengalaman pengguna secara signifikan.",
    coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop",
    tags: JSON.stringify(["Edge Computing", "Performance", "Cloud"]),
    is_published: true,
    published_at: "2025-02-26T09:30:00Z"
  },
  {
    title: "Prisma vs Drizzle: Memilih ORM yang Tepat untuk Proyek Anda",
    slug: "prisma-vs-drizzle-memilih-orm-yang-tepat-untuk-proyek-anda",
    excerpt: "Dua ORM populer di ekosistem TypeScript ini punya filosofi berbeda. Simak perbandingan Prisma dan Drizzle sebelum memilih.",
    content: "## Dua Pendekatan Berbeda\n\nPrisma menawarkan pengalaman developer yang sangat matang dengan schema declarative dan Prisma Studio untuk mengelola data secara visual.\n\n### Drizzle yang Lebih Ringan\nDrizzle mengambil pendekatan yang lebih dekat dengan SQL asli, menawarkan performa lebih ringan tanpa perlu proses generate code yang berat seperti Prisma.\n\n### Faktor yang Perlu Dipertimbangkan\nJika Anda mengutamakan developer experience dan tooling visual, Prisma bisa menjadi pilihan tepat. Namun jika mengutamakan kontrol penuh dan performa, Drizzle patut dipertimbangkan.\n\nKeduanya adalah ORM yang solid, sehingga pilihan terbaik sangat bergantung pada kebutuhan spesifik proyek Anda.",
    coverImage: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1000&auto=format&fit=crop",
    tags: JSON.stringify(["ORM", "Prisma", "Drizzle"]),
    is_published: true,
    published_at: "2025-03-05T11:15:00Z"
  },
  {
    title: "Implementasi Autentikasi dengan NextAuth.js",
    slug: "implementasi-autentikasi-dengan-nextauth-js",
    excerpt: "Membangun sistem autentikasi dari nol memakan waktu dan rawan celah keamanan. NextAuth.js hadir untuk menyederhanakan proses ini.",
    content: "## Autentikasi yang Fleksibel untuk Next.js\n\nNextAuth.js (kini dikenal sebagai Auth.js) menyediakan solusi autentikasi siap pakai yang mendukung berbagai provider seperti Google, GitHub, hingga credentials manual.\n\n### Session dan JWT\nNextAuth mendukung dua strategi utama dalam mengelola sesi pengguna, yaitu database session dan JSON Web Token, masing-masing dengan kelebihan tersendiri.\n\n### Keamanan Bawaan\nLibrary ini menangani banyak aspek keamanan secara otomatis, termasuk proteksi CSRF dan penyimpanan token yang aman.\n\nDengan konfigurasi yang relatif singkat, NextAuth.js memungkinkan developer fokus pada logika bisnis tanpa perlu membangun sistem autentikasi dari awal.",
    coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop",
    tags: JSON.stringify(["Authentication", "Next.js", "Security"]),
    is_published: true,
    published_at: "2025-03-12T08:45:00Z"
  },
  {
    title: "Menerapkan Rate Limiting untuk Melindungi API Anda",
    slug: "menerapkan-rate-limiting-untuk-melindungi-api-anda",
    excerpt: "Tanpa rate limiting, API Anda rentan terhadap abuse dan serangan brute force. Pelajari strategi dan implementasinya.",
    content: "## Membatasi Jumlah Permintaan\n\nRate limiting adalah teknik membatasi jumlah request yang dapat dilakukan oleh satu klien dalam periode waktu tertentu, guna melindungi server dari penyalahgunaan.\n\n### Algoritma Umum\nToken bucket dan sliding window adalah dua algoritma populer yang sering digunakan untuk mengimplementasikan rate limiting secara efisien.\n\n### Implementasi Praktis\nRedis sering dipilih sebagai penyimpanan counter karena kecepatannya dalam operasi baca dan tulis, sehingga cocok untuk skenario rate limiting dengan traffic tinggi.\n\nDengan rate limiting yang tepat, API Anda menjadi lebih tahan terhadap serangan brute force maupun penyalahgunaan sumber daya server.",
    coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1000&auto=format&fit=crop",
    tags: JSON.stringify(["API", "Security", "Backend"]),
    is_published: true,
    published_at: "2025-03-19T14:20:00Z"
  },
  {
    title: "GraphQL Federation: Menggabungkan Banyak Schema Menjadi Satu",
    slug: "graphql-federation-menggabungkan-banyak-schema-menjadi-satu",
    excerpt: "Ketika tim berkembang, satu schema GraphQL besar bisa menjadi sulit dikelola. GraphQL Federation menawarkan solusi arsitektur terdistribusi.",
    content: "## Schema Terdistribusi\n\nGraphQL Federation memungkinkan beberapa service memiliki schema GraphQL masing-masing yang kemudian digabungkan menjadi satu graph terpadu melalui gateway.\n\n### Kepemilikan yang Jelas\nSetiap tim dapat memiliki dan mengelola bagian schema mereka sendiri secara independen, tanpa harus mengubah satu monolith GraphQL yang besar.\n\n### Tantangan Implementasi\nMengelola relasi antar entitas lintas service serta memastikan performa gateway tetap optimal menjadi tantangan tersendiri dalam arsitektur ini.\n\nGraphQL Federation sangat cocok diterapkan pada organisasi dengan arsitektur microservices yang membutuhkan satu titik akses data terpadu.",
    coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop",
    tags: JSON.stringify(["GraphQL", "Federation", "Architecture"]),
    is_published: true,
    published_at: "2025-03-26T10:10:00Z"
  },
  {
    title: "Memahami Serangan XSS dan CSRF serta Cara Mencegahnya",
    slug: "memahami-serangan-xss-dan-csrf-serta-cara-mencegahnya",
    excerpt: "Keamanan web adalah aspek yang tidak boleh diabaikan. Pahami dua jenis serangan umum ini dan strategi pencegahannya.",
    content: "## Ancaman yang Sering Diabaikan\n\nCross-Site Scripting (XSS) terjadi ketika penyerang berhasil menyisipkan script berbahaya ke dalam halaman web yang kemudian dieksekusi di browser korban.\n\n### Mencegah XSS\nSanitasi input pengguna dan penggunaan Content Security Policy (CSP) adalah langkah dasar yang efektif untuk mencegah serangan jenis ini.\n\n### Cross-Site Request Forgery\nCSRF memanfaatkan sesi aktif pengguna untuk melakukan aksi tanpa sepengetahuan mereka. Penggunaan CSRF token pada setiap form adalah pertahanan standar terhadap serangan ini.\n\nKeamanan bukan fitur tambahan, melainkan aspek fundamental yang harus dipikirkan sejak awal pengembangan aplikasi.",
    coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop",
    tags: JSON.stringify(["Security", "XSS", "CSRF"]),
    is_published: true,
    published_at: "2025-04-02T09:00:00Z"
  },
  {
    title: "Mengenal Svelte 5 dan Konsep Runes",
    slug: "mengenal-svelte-5-dan-konsep-runes",
    excerpt: "Svelte 5 memperkenalkan sistem reaktivitas baru bernama Runes. Simak apa yang berubah dan kenapa ini penting.",
    content: "## Reaktivitas yang Lebih Eksplisit\n\nSvelte selalu dikenal dengan pendekatan compiler-nya yang menghasilkan kode JavaScript minim tanpa virtual DOM.\n\n### Apa itu Runes?\nRunes adalah simbol khusus seperti `$state` dan `$derived` yang membuat reaktivitas dalam komponen menjadi lebih eksplisit dan mudah dipahami dibanding versi sebelumnya.\n\n### Manfaat bagi Developer\nDengan sistem baru ini, reaktivitas dapat digunakan bahkan di luar komponen `.svelte`, memberikan fleksibilitas lebih dalam menyusun logika aplikasi.\n\nPerubahan ini menunjukkan komitmen tim Svelte untuk terus menyederhanakan pengalaman developer tanpa mengorbankan performa.",
    coverImage: "https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=1000&auto=format&fit=crop",
    tags: JSON.stringify(["Svelte", "Frontend", "JavaScript"]),
    is_published: true,
    published_at: "2025-04-09T13:30:00Z"
  },
  {
    title: "Vue 3 Composition API: Menulis Logika yang Lebih Terorganisir",
    slug: "vue-3-composition-api-menulis-logika-yang-lebih-terorganisir",
    excerpt: "Composition API mengubah cara penulisan komponen Vue menjadi lebih fleksibel dibanding Options API. Simak konsep dasarnya.",
    content: "## Alternatif dari Options API\n\nComposition API diperkenalkan di Vue 3 sebagai cara baru menyusun logika komponen yang lebih fleksibel dibanding Options API tradisional.\n\n### Fungsi Composable\nDengan Composition API, logika yang dapat digunakan ulang dapat diekstrak ke dalam fungsi composable, mirip dengan custom hooks di React.\n\n### Kapan Menggunakannya?\nUntuk komponen sederhana, Options API mungkin masih cukup. Namun untuk komponen kompleks dengan banyak logika yang saling terkait, Composition API menawarkan keteraturan yang lebih baik.\n\nKedua API ini tetap didukung penuh di Vue 3, sehingga tim dapat memilih sesuai preferensi dan kompleksitas proyek.",
    coverImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=1000&auto=format&fit=crop",
    tags: JSON.stringify(["Vue", "Frontend", "JavaScript"]),
    is_published: true,
    published_at: "2025-04-16T10:00:00Z"
  },
  {
    title: "Solid.js: Reaktivitas Cepat Tanpa Virtual DOM",
    slug: "solid-js-reaktivitas-cepat-tanpa-virtual-dom",
    excerpt: "Solid.js menawarkan performa yang sangat kompetitif dengan pendekatan reaktivitas fine-grained. Kenali kelebihannya di sini.",
    content: "## Fine-Grained Reactivity\n\nBerbeda dengan React yang menggunakan virtual DOM, Solid.js langsung memperbarui bagian DOM yang berubah tanpa proses diffing tambahan.\n\n### Performa yang Kompetitif\nPendekatan ini membuat Solid.js secara konsisten menempati posisi teratas dalam berbagai benchmark performa framework frontend.\n\n### Sintaks yang Familiar\nBagi developer React, sintaks JSX pada Solid.js terasa familiar, sehingga proses adaptasi menjadi relatif mudah meskipun konsep di baliknya cukup berbeda.\n\nMeski komunitasnya belum sebesar React atau Vue, Solid.js terus menarik perhatian developer yang mengutamakan performa maksimal.",
    coverImage: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?q=80&w=1000&auto=format&fit=crop",
    tags: JSON.stringify(["Solid.js", "Frontend", "Performance"]),
    is_published: true,
    published_at: "2025-04-23T09:20:00Z"
  },
  {
    title: "Web Components: Membangun Komponen yang Bisa Dipakai di Framework Apapun",
    slug: "web-components-membangun-komponen-yang-bisa-dipakai-di-framework-apapun",
    excerpt: "Web Components adalah standar native browser untuk membuat elemen kustom yang reusable lintas framework. Simak dasar-dasarnya.",
    content: "## Standar Native Browser\n\nWeb Components terdiri dari tiga teknologi utama: Custom Elements, Shadow DOM, dan HTML Templates, yang semuanya didukung langsung oleh browser modern.\n\n### Reusable Lintas Framework\nKarena berjalan di atas standar native, komponen yang dibangun dengan Web Components dapat digunakan di aplikasi React, Vue, Angular, atau bahkan HTML murni.\n\n### Shadow DOM untuk Enkapsulasi\nShadow DOM memungkinkan style dan struktur komponen terisolasi dari halaman utama, mencegah konflik CSS yang sering terjadi pada proyek besar.\n\nMeski adopsinya belum semasif framework populer, Web Components tetap relevan untuk membangun design system yang benar-benar framework-agnostic.",
    coverImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=1000&auto=format&fit=crop",
    tags: JSON.stringify(["Web Components", "Frontend", "Standards"]),
    is_published: true,
    published_at: "2025-04-30T11:40:00Z"
  },
  {
    title: "Serverless Functions: Menjalankan Backend Tanpa Mengelola Server",
    slug: "serverless-functions-menjalankan-backend-tanpa-mengelola-server",
    excerpt: "Serverless memungkinkan developer fokus pada kode tanpa perlu memikirkan infrastruktur server. Pahami konsep dan kelebihannya.",
    content: "## Fokus pada Kode, Bukan Infrastruktur\n\nServerless functions memungkinkan developer menjalankan kode backend tanpa perlu mengelola server secara langsung, karena penyedia layanan cloud yang menangani semua infrastrukturnya.\n\n### Model Pembayaran Sesuai Penggunaan\nSalah satu keunggulan utama serverless adalah model pembayaran yang hanya dikenakan saat fungsi benar-benar dieksekusi, bukan berdasarkan waktu server menyala.\n\n### Cold Start\nSalah satu tantangan serverless adalah cold start, yaitu jeda waktu saat fungsi pertama kali dipanggil setelah periode tidak aktif.\n\nPlatform seperti Vercel Functions, AWS Lambda, dan Cloudflare Workers menjadi pilihan populer untuk menerapkan arsitektur serverless.",
    coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop",
    tags: JSON.stringify(["Serverless", "Cloud", "Backend"]),
    is_published: true,
    published_at: "2025-05-07T08:50:00Z"
  },
  {
    title: "Database Indexing: Kunci Query yang Lebih Cepat",
    slug: "database-indexing-kunci-query-yang-lebih-cepat",
    excerpt: "Query database yang lambat sering kali disebabkan oleh kurangnya indexing yang tepat. Pelajari cara kerja dan strategi indexing.",
    content: "## Mempercepat Pencarian Data\n\nIndex database bekerja seperti daftar isi buku, memungkinkan database menemukan data yang dicari tanpa harus memindai seluruh tabel.\n\n### Kapan Membuat Index?\nKolom yang sering digunakan dalam klausa WHERE, JOIN, atau ORDER BY adalah kandidat yang tepat untuk diberikan index.\n\n### Trade-off yang Perlu Diperhatikan\nTerlalu banyak index dapat memperlambat operasi insert dan update, karena setiap perubahan data juga perlu memperbarui index yang terkait.\n\nMemahami query pattern aplikasi Anda adalah kunci untuk menentukan strategi indexing yang optimal dan menghindari over-indexing.",
    coverImage: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1000&auto=format&fit=crop",
    tags: JSON.stringify(["Database", "Indexing", "Performance"]),
    is_published: true,
    published_at: "2025-05-14T10:15:00Z"
  },
  {
    title: "Strategi CDN dan Caching untuk Website yang Lebih Cepat",
    slug: "strategi-cdn-dan-caching-untuk-website-yang-lebih-cepat",
    excerpt: "CDN dan caching yang tepat dapat mempercepat waktu loading website secara drastis. Simak strategi yang bisa diterapkan.",
    content: "## Mendekatkan Konten ke Pengguna\n\nContent Delivery Network (CDN) mendistribusikan aset statis seperti gambar, CSS, dan JavaScript ke server yang tersebar di berbagai lokasi geografis.\n\n### Cache-Control Header\nMengatur header cache-control dengan tepat memungkinkan browser dan CDN menyimpan salinan aset, sehingga mengurangi jumlah request ke server asal.\n\n### Cache Invalidation\nSalah satu tantangan terbesar dalam caching adalah invalidation, yaitu memastikan pengguna mendapatkan versi terbaru saat konten berubah tanpa mengorbankan manfaat caching.\n\nDengan strategi CDN dan caching yang matang, waktu loading website dapat berkurang signifikan terutama bagi pengguna di lokasi yang jauh dari server asal.",
    coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop",
    tags: JSON.stringify(["CDN", "Caching", "Performance"]),
    is_published: true,
    published_at: "2025-05-21T14:00:00Z"
  },
  {
    title: "HTTP/3 dan QUIC: Masa Depan Protokol Internet",
    slug: "http-3-dan-quic-masa-depan-protokol-internet",
    excerpt: "HTTP/3 dibangun di atas protokol QUIC yang menjanjikan koneksi lebih cepat dan stabil. Pelajari apa yang membuatnya berbeda.",
    content: "## Evolusi dari HTTP/2\n\nHTTP/3 menggunakan protokol transport QUIC yang dibangun di atas UDP, berbeda dengan versi sebelumnya yang menggunakan TCP.\n\n### Mengatasi Head-of-Line Blocking\nSalah satu masalah utama pada HTTP/2 adalah head-of-line blocking di level TCP. QUIC menyelesaikan masalah ini dengan menangani multiplexing stream secara independen.\n\n### Koneksi yang Lebih Stabil\nQUIC juga mendukung connection migration, yang memungkinkan koneksi tetap bertahan meskipun pengguna berpindah jaringan, misalnya dari WiFi ke data seluler.\n\nBanyak layanan besar seperti Google dan Cloudflare telah mengadopsi HTTP/3 untuk meningkatkan kecepatan dan keandalan koneksi penggunanya.",
    coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop",
    tags: JSON.stringify(["HTTP/3", "QUIC", "Networking"]),
    is_published: true,
    published_at: "2025-05-28T09:10:00Z"
  },
  {
    title: "Git Workflow Terbaik untuk Kolaborasi Tim",
    slug: "git-workflow-terbaik-untuk-kolaborasi-tim",
    excerpt: "Alur kerja Git yang tidak jelas dapat menyebabkan konflik dan kebingungan dalam tim. Simak beberapa strategi branching yang populer.",
    content: "## Menjaga Kolaborasi Tetap Rapi\n\nGit Flow adalah salah satu strategi branching klasik yang memisahkan branch develop, feature, release, dan hotfix secara terstruktur.\n\n### Trunk-Based Development\nBerbeda dengan Git Flow, trunk-based development mendorong tim untuk sering melakukan merge ke branch utama dengan bantuan feature flag untuk fitur yang belum siap dirilis.\n\n### Memilih Workflow yang Tepat\nTim kecil dengan siklus rilis cepat mungkin lebih cocok dengan trunk-based development, sementara tim besar dengan rilis terjadwal bisa lebih diuntungkan dengan Git Flow.\n\nApapun workflow yang dipilih, konsistensi dan dokumentasi yang jelas adalah kunci agar seluruh tim dapat berkolaborasi dengan lancar.",
    coverImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=1000&auto=format&fit=crop",
    tags: JSON.stringify(["Git", "Collaboration", "Workflow"]),
    is_published: true,
    published_at: "2025-06-04T10:45:00Z"
  }
];

async function seed() {
  for (const article of articles) {
    try {
      await db.insert(blogPosts).values({
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        coverImage: article.coverImage,
        tags: article.tags,
        is_published: article.is_published,
        published_at: new Date(article.published_at),
        created_at: new Date(article.published_at),
        updated_at: new Date(article.published_at),
      });
      console.log('Inserted:', article.title);
    } catch (e) {
      console.error('Failed:', article.title, e.message);
    }
  }
  console.log('Finished seeding!');
}

seed();