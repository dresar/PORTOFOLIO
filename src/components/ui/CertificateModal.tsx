
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useModalStore } from '@/store/modalStore';
import { useTranslation } from 'react-i18next';
import { Award, ExternalLink } from 'lucide-react';
import { normalizeMediaUrl, safeUrl } from '@/lib/utils';

import { useMemo } from 'react';
import { useLocalizedContent } from '@/hooks/useLocalizedContent';

export const CertificateModal = () => {
  const { t } = useTranslation();
  const { isOpen, modalType, certificateData: rawCertificateData, closeModal, openImagePreviewModal } = useModalStore();
  const { getCertificate } = useLocalizedContent();
  const certificateData = useMemo(() => getCertificate(rawCertificateData), [rawCertificateData, getCertificate]);

  const isModalOpen = isOpen && modalType === 'certificate';

  if (!certificateData) return null;

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-2xl w-[95vw] p-0 overflow-hidden bg-card/95 backdrop-blur-md border-border/50">
        <DialogTitle className="sr-only">Detail Sertifikat - {certificateData.name || certificateData.title || 'Sertifikat'}</DialogTitle>
        <DialogDescription className="sr-only">Pratinjau detail sertifikat</DialogDescription>
        <div className="p-6 md:p-8">
            {/* Certificate Image */}
            {certificateData.image && (
                <div className="relative mb-6 rounded-xl overflow-hidden bg-muted aspect-video cursor-pointer group">
                  <img 
                      src={normalizeMediaUrl(certificateData.image)} 
                      alt={certificateData.name || certificateData.title || 'Sertifikat'} 
                      className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                      onClick={() => openImagePreviewModal(certificateData.image!, certificateData.name || certificateData.title || 'Sertifikat')}
                  />
                </div>
            )}

            <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-lg bg-primary/10">
                <Award className="w-8 h-8 text-primary" />
                </div>
                <div>
                <h2 className="text-xl md:text-2xl font-heading font-bold mb-1">{certificateData.title}</h2>
                <p className="text-sm text-muted-foreground">{certificateData.issuer}</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
                <div className="px-3 py-1.5 rounded-lg bg-muted/50 border border-border/40">
                <span className="text-xs text-muted-foreground">{t('common.date')}: </span>
                <span className="text-sm font-medium">{new Date(certificateData.issueDate).toLocaleDateString()}</span>
                </div>
                {certificateData.credentialId && (
                <div className="px-3 py-1.5 rounded-lg bg-muted/50 border border-border/40">
                    <span className="text-xs text-muted-foreground">ID: </span>
                    <span className="text-sm font-medium">{certificateData.credentialId}</span>
                </div>
                )}
            </div>

            {certificateData.credentialUrl && (
                <a
                href={safeUrl(certificateData.credentialUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                >
                <ExternalLink className="w-3.5 h-3.5" />
                {t('certificates.verify')}
                </a>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
