import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useModalStore } from '@/store/modalStore';
import { useTranslation } from 'react-i18next';
import { Award, ExternalLink, FileText, Download } from 'lucide-react';
import { normalizeMediaUrl, safeUrl } from '@/lib/utils';
import { useMemo } from 'react';
import { useLocalizedContent } from '@/hooks/useLocalizedContent';
import { Button } from '@/components/ui/button';

export const CertificateModal = () => {
  const { t } = useTranslation();
  const {
    isOpen,
    modalType,
    certificateData: rawCertificateData,
    closeModal,
    openImagePreviewModal,
    openPdfPreviewModal,
  } = useModalStore();
  const { getCertificate } = useLocalizedContent();
  const certificateData: any = useMemo(
    () => getCertificate(rawCertificateData),
    [rawCertificateData, getCertificate]
  );

  const isModalOpen = isOpen && modalType === 'certificate';

  if (!certificateData) return null;

  const pdfUrl = certificateData.pdfUrl || (certificateData.image && /\.pdf($|\?)/i.test(certificateData.image) ? certificateData.image : null);
  const isImagePdf = certificateData.image && /\.pdf($|\?)/i.test(certificateData.image);

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-2xl w-[95vw] p-0 overflow-hidden bg-card/95 backdrop-blur-md border-border/50">
        <DialogTitle className="sr-only">
          Detail Sertifikat - {certificateData.name || certificateData.title || 'Sertifikat'}
        </DialogTitle>
        <DialogDescription className="sr-only">Pratinjau detail sertifikat dan dokumen pendukung</DialogDescription>
        <div className="p-6 md:p-8">
          {/* Certificate Image or PDF Box */}
          {certificateData.image && !isImagePdf ? (
            <div className="relative mb-6 rounded-xl overflow-hidden bg-muted aspect-video cursor-pointer group">
              <img
                src={normalizeMediaUrl(certificateData.image)}
                alt={certificateData.name || certificateData.title || 'Sertifikat'}
                className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                onClick={() =>
                  openImagePreviewModal(
                    certificateData.image!,
                    certificateData.name || certificateData.title || 'Sertifikat'
                  )
                }
              />
            </div>
          ) : pdfUrl ? (
            <div
              onClick={() => openPdfPreviewModal(pdfUrl, certificateData.name || 'Sertifikat PDF')}
              className="relative mb-6 rounded-xl overflow-hidden bg-red-500/10 border border-red-500/20 aspect-video flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-red-500/15 transition-all group shadow-sm"
            >
              <div className="size-14 rounded-2xl bg-red-500/20 text-red-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FileText className="size-8" />
              </div>
              <h4 className="text-sm font-bold text-foreground">Dokumen PDF Tersedia</h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Klik untuk membaca dokumen sertifikat lengkap (mendukung multi-halaman & zoom).
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-red-500 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
                <FileText className="size-3.5" />
                <span>Buka Dokumen PDF</span>
              </span>
            </div>
          ) : null}

          {/* Title and Issuer */}
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 rounded-lg bg-primary/10">
              <Award className="w-8 h-8 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl md:text-2xl font-heading font-bold mb-1">
                {certificateData.name || certificateData.title || t('certificates.title')}
              </h2>
              <p className="text-sm text-muted-foreground">{certificateData.issuer}</p>
            </div>
          </div>

          {/* Meta Badges */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="px-3 py-1.5 rounded-lg bg-muted/50 border border-border/40">
              <span className="text-xs text-muted-foreground">{t('common.date')}: </span>
              <span className="text-sm font-medium">
                {certificateData.issueDate
                  ? new Date(certificateData.issueDate).toLocaleDateString(
                      t('common.present') === 'Sekarang' ? 'id-ID' : 'en-US',
                      { year: 'numeric', month: 'short', day: 'numeric' }
                    )
                  : '-'}
              </span>
            </div>
            {certificateData.credentialId && (
              <div className="px-3 py-1.5 rounded-lg bg-muted/50 border border-border/40">
                <span className="text-xs text-muted-foreground">ID: </span>
                <span className="text-sm font-medium">{certificateData.credentialId}</span>
              </div>
            )}
            {pdfUrl && (
              <div className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-1.5">
                <FileText className="size-3.5" />
                <span className="text-xs font-semibold">Lampiran PDF Multi-Halaman</span>
              </div>
            )}
          </div>

          {/* Certificate Notes */}
          {certificateData.notes && (
            <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/50 text-xs text-muted-foreground mb-6">
              <span className="font-semibold text-foreground">Catatan: </span>
              <span>{certificateData.notes}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {pdfUrl && (
              <Button
                type="button"
                onClick={() => openPdfPreviewModal(pdfUrl, certificateData.name || 'Dokumen Sertifikat')}
                className="h-10 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white gap-2 text-xs font-semibold shadow-md shadow-red-600/20"
              >
                <FileText className="size-4" />
                <span>Lihat Dokumen PDF</span>
              </Button>
            )}

            {certificateData.credentialUrl && (
              <a
                href={safeUrl(certificateData.credentialUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity shadow-md shadow-primary/20"
              >
                <ExternalLink className="size-3.5" />
                <span>{t('certificates.verify')}</span>
              </a>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
