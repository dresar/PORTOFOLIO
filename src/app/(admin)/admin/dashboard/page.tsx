import React from 'react';
import Link from 'next/link';
import { db } from '@/db';
import {
  projects,
  skills,
  experiences,
  certificates,
  contactMessages,
  educations,
} from '@/db/schema';
import { count, eq, desc } from 'drizzle-orm';
import { VCard, VCardHeader, VCardTitle, VCardSubtitle, VCardContent } from '@/components/ui/v-card';
import { VBtn } from '@/components/ui/v-btn';
import { VChip } from '@/components/ui/v-chip';
import { VIcon } from '@/components/ui/v-icon';

export default async function AdminDashboardPage() {
  const [
    totalProjectsRes,
    totalSkillsRes,
    totalExpRes,
    totalCertsRes,
    totalEduRes,
    totalMessagesRes,
    unreadMessagesRes,
    recentMessages,
  ] = await Promise.all([
    db.select({ count: count() }).from(projects),
    db.select({ count: count() }).from(skills),
    db.select({ count: count() }).from(experiences),
    db.select({ count: count() }).from(certificates),
    db.select({ count: count() }).from(educations),
    db.select({ count: count() }).from(contactMessages),
    db.select({ count: count() }).from(contactMessages).where(eq(contactMessages.isRead, false)),
    db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(5),
  ]);

  const totalProjects = Number(totalProjectsRes[0]?.count || 0);
  const totalSkills = Number(totalSkillsRes[0]?.count || 0);
  const totalExp = Number(totalExpRes[0]?.count || 0);
  const totalCerts = Number(totalCertsRes[0]?.count || 0);
  const totalEdu = Number(totalEduRes[0]?.count || 0);
  const totalMessages = Number(totalMessagesRes[0]?.count || 0);
  const unreadMessages = Number(unreadMessagesRes[0]?.count || 0);

  const stats = [
    {
      title: 'Total Proyek',
      count: totalProjects,
      description: 'Portofolio karya aktif',
      icon: 'fa-solid fa-laptop-code',
      color: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
      href: '/admin/projects',
    },
    {
      title: 'Keahlian Teknis',
      count: totalSkills,
      description: 'Kategori keahlian & tools',
      icon: 'fa-solid fa-code',
      color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
      href: '/admin/skills',
    },
    {
      title: 'Riwayat Karier',
      count: totalExp,
      description: 'Pengalaman & organisasi',
      icon: 'fa-solid fa-briefcase',
      color: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
      href: '/admin/experience',
    },
    {
      title: 'Sertifikasi',
      count: totalCerts,
      description: 'Lisensi & kredensial',
      icon: 'fa-solid fa-certificate',
      color: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
      href: '/admin/certificates',
    },
    {
      title: 'Pendidikan',
      count: totalEdu,
      description: 'Riwayat akademik',
      icon: 'fa-solid fa-graduation-cap',
      color: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
      href: '/admin/education',
    },
    {
      title: 'Kotak Masuk',
      count: totalMessages,
      description: `${unreadMessages} pesan belum dibaca`,
      icon: 'fa-solid fa-inbox',
      color: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
      href: '/admin/messages',
      badge: unreadMessages > 0 ? `${unreadMessages} Baru` : undefined,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Dashboard Manajemen Portofolio
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Selamat datang kembali, Muhammad Fauzan Al Hafizh. Pantau dan kelola seluruh konten portofolio Anda.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link href="/admin/projects">
            <VBtn variant="primary" size="sm" prependIcon="fa-solid fa-plus">
              Tambah Proyek
            </VBtn>
          </Link>
          <Link href="/" target="_blank">
            <VBtn variant="outlined" size="sm" prependIcon="fa-solid fa-arrow-up-right-from-square">
              Pratinjau Publik
            </VBtn>
          </Link>
        </div>
      </div>

      {/* Grid Metrik Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {stats.map((item) => (
          <Link key={item.title} href={item.href} className="group">
            <VCard elevation={1} hoverElevation className="p-5 h-full flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-400">{item.title}</span>
                  <div className="text-3xl font-black text-white mt-1 group-hover:text-blue-400 transition-colors">
                    {item.count}
                  </div>
                </div>
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${item.color}`}>
                  <VIcon name={item.icon} className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                <span>{item.description}</span>
                {item.badge && (
                  <VChip color="error" size="sm">
                    {item.badge}
                  </VChip>
                )}
              </div>
            </VCard>
          </Link>
        ))}
      </div>

      {/* Widget Pesan Terbaru & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: 5 Pesan Terkini */}
        <div className="lg:col-span-2">
          <VCard elevation={1}>
            <VCardHeader>
              <div>
                <VCardTitle>Pesan Masuk Terbaru</VCardTitle>
                <VCardSubtitle>Komunikasi terkini dari rekruter dan klien</VCardSubtitle>
              </div>
              <Link href="/admin/messages">
                <VBtn variant="text" size="sm">
                  Lihat Semua
                </VBtn>
              </Link>
            </VCardHeader>
            <VCardContent className="p-0">
              {recentMessages.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  <VIcon name="fa-solid fa-inbox" className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  Belum ada pesan kontak yang masuk.
                </div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {recentMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className="p-4 flex items-start justify-between gap-4 hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white truncate">
                            {msg.name}
                          </span>
                          {!msg.isRead && (
                            <VChip color="primary" size="sm">
                              Baru
                            </VChip>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 font-medium truncate mt-0.5">
                          {msg.subject}
                        </p>
                        <p className="text-xs text-slate-400 truncate mt-0.5 line-clamp-1">
                          {msg.message}
                        </p>
                      </div>
                      <div className="text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(msg.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </VCardContent>
          </VCard>
        </div>

        {/* Kolom Kanan: Status Basis Data & Panduan CMS */}
        <div className="space-y-6">
          <VCard elevation={1}>
            <VCardHeader>
              <VCardTitle className="text-sm">Infrastruktur Database</VCardTitle>
            </VCardHeader>
            <VCardContent className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Database Engine:</span>
                <span className="text-slate-200 font-semibold">Neon Serverless Postgres</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Region:</span>
                <span className="text-slate-200 font-semibold">ap-southeast-1 (Singapore)</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">ORM Client:</span>
                <span className="text-slate-200 font-semibold">Drizzle ORM</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-400">Status Revalidasi:</span>
                <VChip color="success" size="sm">
                  Instant (On-Demand)
                </VChip>
              </div>
            </VCardContent>
          </VCard>

          <VCard elevation={1} className="bg-gradient-to-br from-blue-950/40 to-slate-900 border-blue-500/20">
            <VCardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-blue-400 text-sm font-bold">
                <VIcon name="fa-solid fa-circle-check" className="w-4 h-4" />
                <span>Tips Pengelolaan Konten</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Setiap kali Anda menambah atau memperbarui proyek, keahlian, atau profil, sistem secara otomatis membersihkan cache halaman publik sehingga perubahan Anda langsung live seketika.
              </p>
            </VCardContent>
          </VCard>
        </div>
      </div>
    </div>
  );
}
