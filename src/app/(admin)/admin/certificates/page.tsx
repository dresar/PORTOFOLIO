import React from 'react';
import { db } from '@/db';
import { certificates } from '@/db/schema';
import { asc, desc } from 'drizzle-orm';
import { CertificatesManager } from '@/components/admin/certificates-manager';

export default async function AdminCertificatesPage() {
  const allCertificates = await db
    .select()
    .from(certificates)
    .orderBy(asc(certificates.orderIndex), desc(certificates.createdAt));

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Manajemen Sertifikat</h1>
        <p className="text-xs text-slate-400 mt-1">
          Kelola sertifikasi kompetensi, penerbit, lisensi, dan tautan verifikasi online.
        </p>
      </div>

      <CertificatesManager initialCertificates={allCertificates} />
    </div>
  );
}
