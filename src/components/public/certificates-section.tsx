'use client';

import React from 'react';
import { Certificate } from '@/db/schema';
import { VCard, VCardContent, VCardActions } from '@/components/ui/v-card';
import { VBtn } from '@/components/ui/v-btn';
import { VIcon } from '@/components/ui/v-icon';

export function CertificatesSection({ certificates }: { certificates: Certificate[] }) {
  if (certificates.length === 0) return null;

  return (
    <section id="certificates" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <VIcon name="fa-solid fa-certificate" className="w-3 h-3" />
            <span>Kredensial Resmi</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Sertifikasi Profesional
          </h2>
          <p className="text-sm text-slate-400">
            Sertifikat terakreditasi dan validasi keahlian teknis dari lembaga terkemuka.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <VCard
              key={cert.id}
              elevation={1}
              hoverElevation
              className="p-6 flex flex-col justify-between group"
            >
              <VCardContent className="p-0 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center flex-shrink-0">
                    <VIcon name="fa-solid fa-certificate" className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors">
                      {cert.title}
                    </h3>
                    {cert.issuer && cert.issuer !== '-' && (
                      <p className="text-xs font-semibold text-slate-300 mt-0.5">{cert.issuer}</p>
                    )}
                  </div>
                </div>

                {(cert.issueDate !== '-' || cert.credentialId) && (
                  <div className="space-y-1 text-xs text-slate-400 pt-2 border-t border-slate-800">
                    {cert.issueDate && cert.issueDate !== '-' && (
                      <div className="flex items-center justify-between">
                        <span>Terbit:</span>
                        <span className="font-mono text-slate-300">{cert.issueDate}</span>
                      </div>
                    )}
                    {cert.credentialId && (
                      <div className="flex items-center justify-between">
                        <span>ID Kredensial:</span>
                        <span className="font-mono text-slate-300 text-[11px] truncate max-w-[150px]">
                          {cert.credentialId}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </VCardContent>

              {cert.credentialUrl && (
                <VCardActions className="px-0 pb-0 pt-4 border-t border-slate-800/80">
                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <VBtn
                      variant="outlined"
                      size="sm"
                      className="w-full text-xs text-slate-300 hover:text-white"
                      prependIcon="fa-solid fa-arrow-up-right-from-square"
                    >
                      Verifikasi Kredensial Online
                    </VBtn>
                  </a>
                </VCardActions>
              )}
            </VCard>
          ))}
        </div>
      </div>
    </section>
  );
}
