import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useModalStore } from '@/store/modalStore';
import { useTranslation } from 'react-i18next';
import { 
  Briefcase, 
  Calendar, 
  MapPin, 
  Building2, 
  Globe, 
  Image as ImageIcon, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink,
  CheckCircle2,
  Tag,
  Video
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { normalizeMediaUrl, sanitizeHtmlContent, getCloudinaryVideoThumbnail } from '@/lib/utils';
import { CustomVideoPlayer } from '@/components/ui/CustomVideoPlayer';

export const ExperienceDetailModal = () => {
  const { t } = useTranslation();
  const { isOpen, modalType, experienceData, closeModal, openImagePreviewModal } = useModalStore();
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);

  const isModalOpen = isOpen && modalType === 'experience-detail';

  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return '';
    if (String(dateString).toLowerCase() === 'sekarang' || String(dateString).toLowerCase() === 'present') return t('common.present');
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return String(dateString);
      const locale = t('common.present') === 'Sekarang' ? 'id-ID' : 'en-US';
      return date.toLocaleDateString(locale, { year: 'numeric', month: 'long' });
    } catch {
      return String(dateString);
    }
  };

  const gallery = useMemo(() => {
    if (!experienceData?.gallery) return [];
    if (Array.isArray(experienceData.gallery)) return experienceData.gallery;
    try {
      if (typeof experienceData.gallery === 'string') {
        if (experienceData.gallery.startsWith('[')) {
          return JSON.parse(experienceData.gallery);
        }
        return [experienceData.gallery];
      }
      return [];
    } catch {
      return [];
    }
  }, [experienceData]);

  const parsedSkills = useMemo(() => {
    if (!experienceData?.skills && !experienceData?.technologies) return [];
    const val = experienceData.skills || experienceData.technologies;
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      try {
        if (val.startsWith('[')) return JSON.parse(val);
        return val.split(',').map((s: string) => s.trim()).filter(Boolean);
      } catch {
        return val.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
    }
    return [];
  }, [experienceData]);

  if (!experienceData) return null;

  const logoUrl = experienceData.image || experienceData.logo || experienceData.companyLogo;
  const coverUrl = experienceData.coverImage || experienceData.cover_image || experienceData.banner || (gallery.length > 0 ? (typeof gallery[0] === 'string' ? gallery[0] : gallery[0].url) : null);

  const nextGallery = () => {
    if (gallery.length > 0) {
      setCurrentGalleryIndex((prev) => (prev + 1) % gallery.length);
    }
  };

  const prevGallery = () => {
    if (gallery.length > 0) {
      setCurrentGalleryIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-3xl w-[92vw] p-0 overflow-hidden bg-card/95 backdrop-blur-md border-border/50">
        <DialogTitle className="sr-only">Detail Pengalaman - {experienceData?.role} {experienceData?.company ? `di ${experienceData.company}` : ''}</DialogTitle>
        <DialogDescription className="sr-only">Ringkasan rincian pengalaman kerja dan teknologi yang digunakan</DialogDescription>
        <ScrollArea className="max-h-[85vh]">
          {/* Cover Header */}
          <div className="relative h-36 md:h-48 bg-primary/10 w-full overflow-hidden">
            {coverUrl ? (
              <img 
                src={normalizeMediaUrl(coverUrl)} 
                alt={experienceData.company} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20">
                <Briefcase className="w-16 h-16 text-primary/40" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

            {/* Logo Avatar */}
            <div className="absolute -bottom-6 left-6 md:left-8 w-20 h-20 md:w-24 md:h-24 rounded-2xl border-4 border-background bg-white p-2 shadow-xl flex items-center justify-center overflow-hidden z-10">
              {logoUrl ? (
                <img 
                  src={normalizeMediaUrl(logoUrl)} 
                  alt={experienceData.company} 
                  className="w-full h-full object-contain"
                />
              ) : (
                <Briefcase className="w-10 h-10 text-primary" />
              )}
            </div>
          </div>

          <div className="pt-10 px-6 pb-6 md:px-8 md:pb-8 space-y-6">
            {/* Title & Company */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                  {experienceData.type || experienceData.employmentType || 'Pengalaman Kerja'}
                </Badge>
                {experienceData.locationType && (
                  <Badge variant="secondary" className="text-xs">
                    {experienceData.locationType}
                  </Badge>
                )}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-tight mb-1">
                {experienceData.role || experienceData.title}
              </h2>
              <div className="flex items-center gap-2 text-primary font-semibold text-lg">
                <Building2 className="w-5 h-5 shrink-0" />
                <span>{experienceData.company}</span>
              </div>
            </div>

            {/* Meta Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-secondary/30 border border-border/50">
                <Calendar className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">{t('common.date')}</p>
                  <p className="text-sm font-medium">
                    {formatDate(experienceData.startDate)} - {experienceData.isCurrent ? t('common.present') : (experienceData.endDate ? formatDate(experienceData.endDate) : t('common.present'))}
                  </p>
                </div>
              </div>

              {experienceData.location && (
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-secondary/30 border border-border/50">
                  <MapPin className="w-5 h-5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{t('common.location')}</p>
                    {experienceData.mapUrl ? (
                      <a href={experienceData.mapUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary hover:underline flex items-center gap-1 truncate">
                        {experienceData.location} <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    ) : (
                      <p className="text-sm font-medium truncate">{experienceData.location}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {experienceData.description && (
              <div className="space-y-2">
                <h3 className="text-base font-semibold flex items-center gap-2 text-foreground">
                  <Briefcase className="w-4 h-4 text-primary" /> Deskripsi Pekerjaan
                </h3>
                <div 
                  className="html-theme-responsive p-4 rounded-xl bg-secondary/20 border border-border/40 text-sm leading-relaxed prose dark:prose-invert max-w-none [&>p]:mb-2 [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtmlContent(experienceData.description) }}
                />
              </div>
            )}

            {/* Responsibilities / Bullet points if available */}
            {experienceData.responsibilities && (
              <div className="space-y-2">
                <h3 className="text-base font-semibold flex items-center gap-2 text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> Tanggung Jawab & Pencapaian
                </h3>
                <div className="p-4 rounded-xl bg-secondary/20 border border-border/40 text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                  {experienceData.responsibilities}
                </div>
              </div>
            )}

            {/* Skills & Technologies */}
            {parsedSkills.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-base font-semibold flex items-center gap-2 text-foreground">
                  <Tag className="w-4 h-4 text-primary" /> Keahlian & Teknologi
                </h3>
                <div className="flex flex-wrap gap-2">
                  {parsedSkills.map((skill: string, index: number) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1 text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery Section */}
            {gallery.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-base font-semibold flex items-center gap-2 text-foreground">
                  <ImageIcon className="w-4 h-4 text-primary" /> Dokumentasi & Media ({gallery.length})
                </h3>
                <div className="relative rounded-xl overflow-hidden bg-black/40 aspect-video flex items-center justify-center group">
                  {(() => {
                    const rawUrl = typeof gallery[currentGalleryIndex] === 'string' ? gallery[currentGalleryIndex] : gallery[currentGalleryIndex].url;
                    const mediaUrl = normalizeMediaUrl(rawUrl);
                    const isVideo = /\.(mp4|webm|mov|mkv|avi)($|\?)/i.test(mediaUrl) || mediaUrl.includes('/video/upload/');

                    if (isVideo) {
                      return <CustomVideoPlayer key={mediaUrl} src={mediaUrl} className="w-full h-full" />;
                    }

                    return (
                      <img 
                        src={mediaUrl} 
                        alt={`Gallery ${currentGalleryIndex + 1}`} 
                        className="w-full h-full object-contain cursor-pointer hover:scale-[1.02] transition-transform"
                        onClick={() => {
                          const galleryUrls = gallery.map((g: any) => normalizeMediaUrl(typeof g === 'string' ? g : g.url));
                          openImagePreviewModal(mediaUrl, `${experienceData?.company || 'Pengalaman'} - Galeri`, galleryUrls, currentGalleryIndex);
                        }} 
                      />
                    );
                  })()}

                  {gallery.length > 1 && (
                    <>
                      <button
                        onClick={prevGallery}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors z-20"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={nextGallery}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors z-20"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>

                {gallery.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {gallery.map((photo: any, idx: number) => {
                      const rawUrl = typeof photo === 'string' ? photo : photo.url;
                      const mediaUrl = normalizeMediaUrl(rawUrl);
                      const isVideo = /\.(mp4|webm|mov|mkv|avi)($|\?)/i.test(mediaUrl) || mediaUrl.includes('/video/upload/');
                      const thumbUrl = getCloudinaryVideoThumbnail(mediaUrl);

                      return (
                        <button
                          key={idx}
                          onClick={() => setCurrentGalleryIndex(idx)}
                          className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                            currentGalleryIndex === idx ? 'border-primary scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img 
                            src={thumbUrl} 
                            alt="" 
                            className="w-full h-full object-cover" 
                          />
                          {isVideo && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <Video className="w-4 h-4 text-white drop-shadow-md" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Certificate / Document Link */}
            {(experienceData.certificateUrl || experienceData.documentUrl || experienceData.credentialUrl) && (
              <div className="pt-2">
                <Button asChild className="w-full sm:w-auto gap-2">
                  <a 
                    href={experienceData.certificateUrl || experienceData.documentUrl || experienceData.credentialUrl} 
                    target="_blank" 
                    rel="noreferrer"
                  >
                    <ExternalLink className="w-4 h-4" /> Lihat Dokumen Keterangan Kerja / Sertifikat
                  </a>
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
