import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import bcrypt from 'bcryptjs';
import { db } from './index';
import {
  adminUsers,
  profiles,
  educations,
  skills,
  projects,
  experiences,
  certificates,
  contactMessages,
} from './schema';
import { count } from 'drizzle-orm';

async function seed() {
  console.log('Seeding initial development database for Muhammad Fauzan Al Hafizh...');

  // 1. Admin User
  const existingUsers = await db.select({ value: count() }).from(adminUsers);
  if (Number(existingUsers[0]?.value || 0) === 0) {
    const password = process.env.INITIAL_ADMIN_PASSWORD || 'password_dev_hafizh_2026';
    const passwordHash = await bcrypt.hash(password, 10);
    await db.insert(adminUsers).values({
      username: process.env.INITIAL_ADMIN_USERNAME || 'hafizh',
      email: process.env.INITIAL_ADMIN_EMAIL || 'hafizh@example.com',
      passwordHash,
    });
    console.log('Admin user initialized.');
  }

  // 2. Profile
  const existingProfile = await db.select({ value: count() }).from(profiles);
  if (Number(existingProfile[0]?.value || 0) === 0) {
    await db.insert(profiles).values({
      fullName: 'Muhammad Fauzan Al Hafizh',
      headline: 'Full-Stack Software Engineer',
      bio: 'Halo! Saya Muhammad Fauzan Al Hafizh, seorang Software Engineer yang berfokus pada pembangunan solusi web modern, skalabel, dan berperforma tinggi. [SILAKAN PERBARUI DESKRIPSI BIOGRAFI LENGKAP PADA ADMIN PANEL]',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      resumeUrl: '',
      location: 'Indonesia',
      email: 'fauzan.alhafizh@example.com',
      phone: '+62 [ISI NO WHATSAPP]',
      githubUrl: 'https://github.com',
      linkedinUrl: 'https://linkedin.com',
      whatsappUrl: 'https://wa.me/',
      isAvailable: true,
    });
    console.log('Profile initialized.');
  }

  // 3. Educations
  const existingEdu = await db.select({ value: count() }).from(educations);
  if (Number(existingEdu[0]?.value || 0) === 0) {
    await db.insert(educations).values([
      {
        institution: '[DATA CONTOH] Universitas / Institusi Pendidikan',
        degree: 'Sarjana Komputer (S.Kom)',
        fieldOfStudy: 'Teknik Informatika / Ilmu Komputer',
        startDate: '2020',
        endDate: '2024',
        isCurrent: false,
        description: '[DATA CONTOH] Fokus studi rekayasa perangkat lunak, struktur data & algoritma, dan arsitektur basis data relasional. (Data ini dapat diubah di Admin Panel)',
        orderIndex: 1,
        isPublished: true,
      },
    ]);
    console.log('Sample education initialized.');
  }

  // 4. Skills
  const existingSkills = await db.select({ value: count() }).from(skills);
  if (Number(existingSkills[0]?.value || 0) === 0) {
    await db.insert(skills).values([
      {
        name: 'Next.js & React',
        category: 'Frontend',
        iconClass: 'fa-brands fa-react',
        proficiencyLevel: 92,
        orderIndex: 1,
        isPublished: true,
      },
      {
        name: 'TypeScript',
        category: 'Frontend',
        iconClass: 'fa-solid fa-code',
        proficiencyLevel: 88,
        orderIndex: 2,
        isPublished: true,
      },
      {
        name: 'Tailwind CSS',
        category: 'Frontend',
        iconClass: 'fa-solid fa-palette',
        proficiencyLevel: 94,
        orderIndex: 3,
        isPublished: true,
      },
      {
        name: 'Node.js / Express',
        category: 'Backend',
        iconClass: 'fa-brands fa-node-js',
        proficiencyLevel: 86,
        orderIndex: 4,
        isPublished: true,
      },
      {
        name: 'Neon PostgreSQL',
        category: 'Database',
        iconClass: 'fa-solid fa-database',
        proficiencyLevel: 89,
        orderIndex: 5,
        isPublished: true,
      },
      {
        name: 'Drizzle ORM',
        category: 'Database',
        iconClass: 'fa-solid fa-server',
        proficiencyLevel: 88,
        orderIndex: 6,
        isPublished: true,
      },
      {
        name: 'Git & GitHub',
        category: 'Tools',
        iconClass: 'fa-brands fa-github',
        proficiencyLevel: 92,
        orderIndex: 7,
        isPublished: true,
      },
      {
        name: 'Docker & Container',
        category: 'Cloud & DevOps',
        iconClass: 'fa-brands fa-docker',
        proficiencyLevel: 80,
        orderIndex: 8,
        isPublished: true,
      },
    ]);
    console.log('Skills initialized.');
  }

  // 5. Projects
  const existingProjects = await db.select({ value: count() }).from(projects);
  if (Number(existingProjects[0]?.value || 0) === 0) {
    await db.insert(projects).values([
      {
        title: '[DATA CONTOH] Modern E-Commerce Platform',
        slug: 'modern-ecommerce-platform',
        description: 'Aplikasi belanja daring dengan integrasi payment gateway, katalog produk real-time, dan panel admin berbasis Next.js.',
        content: 'Proyek ini dirancang untuk menunjukkan kapabilitas pengembangan arsitektur web modern yang responsif dan cepat. Menggunakan Next.js App Router dan Drizzle ORM.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=1200&q=80',
        technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'PostgreSQL'],
        demoUrl: 'https://example.com',
        repoUrl: 'https://github.com',
        isFeatured: true,
        orderIndex: 1,
        isPublished: true,
      },
      {
        title: '[DATA CONTOH] SaaS Performance & Analytics Dashboard',
        slug: 'saas-analytics-dashboard',
        description: 'Dashboard analitik interaktif untuk pemantauan metrik bisnis, visualisasi diagram interaktif, dan manajemen pengguna.',
        content: 'Dibangun dengan fokus pada kecepatan muat dan keterbacaan data visual tinggi menggunakan komponen bergaya Vuetify/Material.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
        technologies: ['React', 'TypeScript', 'Neon PostgreSQL', 'Tailwind CSS'],
        demoUrl: 'https://example.com',
        repoUrl: 'https://github.com',
        isFeatured: true,
        orderIndex: 2,
        isPublished: true,
      },
      {
        title: '[DATA CONTOH] Collaborative Task Management App',
        slug: 'collaborative-task-management',
        description: 'Sistem manajemen proyek tim dengan linimasa terstruktur, pelacakan kanban, dan notifikasi real-time.',
        content: 'Memfasilitasi koordinasi lintas divisi secara efisien dengan antarmuka yang bersih dan mudah digunakan.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        technologies: ['Next.js', 'Server Actions', 'Drizzle ORM'],
        demoUrl: 'https://example.com',
        repoUrl: 'https://github.com',
        isFeatured: false,
        orderIndex: 3,
        isPublished: true,
      },
    ]);
    console.log('Sample projects initialized.');
  }

  // 6. Experiences
  const existingExp = await db.select({ value: count() }).from(experiences);
  if (Number(existingExp[0]?.value || 0) === 0) {
    await db.insert(experiences).values([
      {
        company: '[DATA CONTOH] Technology Innovation Labs',
        role: 'Full-Stack Software Engineer',
        employmentType: 'Full-time',
        location: 'Jakarta, Indonesia / Remote',
        startDate: '2023',
        endDate: 'Sekarang',
        isCurrent: true,
        description: '[DATA CONTOH] Membangun dan mengelola arsitektur aplikasi berbasis Next.js dan PostgreSQL, mengoptimalkan query basis data, serta mengintegrasikan antarmuka responsif. (Dapat diubah di Admin Panel)',
        orderIndex: 1,
        isPublished: true,
      },
      {
        company: '[DATA CONTOH] Creative Digital Agency',
        role: 'Frontend Developer',
        employmentType: 'Contract',
        location: 'Indonesia',
        startDate: '2022',
        endDate: '2023',
        isCurrent: false,
        description: '[DATA CONTOH] Mengembangkan antarmuka pengguna interaktif untuk berbagai klien korporat dengan standar aksesibilitas tinggi dan performa optimal.',
        orderIndex: 2,
        isPublished: true,
      },
    ]);
    console.log('Sample experiences initialized.');
  }

  // 7. Certificates
  const existingCerts = await db.select({ value: count() }).from(certificates);
  if (Number(existingCerts[0]?.value || 0) === 0) {
    await db.insert(certificates).values([
      {
        title: '[DATA CONTOH] Certified Full-Stack Developer Professional',
        issuer: 'Global Tech Certification Institute',
        issueDate: '2024',
        expirationDate: '2027',
        credentialId: 'HAFIZH-CERT-2024-001',
        credentialUrl: 'https://example.com/verify',
        imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
        orderIndex: 1,
        isPublished: true,
      },
    ]);
    console.log('Sample certificates initialized.');
  }

  // 8. Contact Messages
  const existingMsg = await db.select({ value: count() }).from(contactMessages);
  if (Number(existingMsg[0]?.value || 0) === 0) {
    await db.insert(contactMessages).values([
      {
        name: 'Technical Recruiter [CONTOH PESAN]',
        email: 'recruiter@techcompany.com',
        subject: 'Peluang Kolaborasi Proyek & Software Engineer',
        message: 'Halo Muhammad Fauzan Al Hafizh, kami sangat tertarik dengan portofolio dan kompetensi teknis Anda. Apakah Anda terbuka untuk mendiskusikan peluang kolaborasi?',
        isRead: false,
      },
    ]);
    console.log('Sample message initialized.');
  }

  console.log('Database seeding successfully completed!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Error during database seeding:', err);
  process.exit(1);
});
