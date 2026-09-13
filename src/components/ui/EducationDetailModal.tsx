
import { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useModalStore } from '@/store/modalStore';
import { useTranslation } from 'react-i18next';
import { GraduationCap, Calendar, Award, MapPin, Building, Globe, Image as ImageIcon, FileText, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CustomVideoPlayer } from '@/components/ui/CustomVideoPlayer';
import { sanitizeHtmlContent } from '@/lib/utils';
import { useLocalizedContent } from '@/hooks/useLocalizedContent';

export const EducationDetailModal = () => {
  const { t } = useTranslation();
  const { isOpen, modalType, educationData: rawEducationData, closeModal, openImagePreviewModal, openPdfPreviewModal } = useModalStore();
  const { getEducation } = useLocalizedContent();
  const educationData = useMemo(() => getEducation(rawEducationData), [rawEducationData, getEducation]);

  const isModalOpen = isOpen && modalType === 'education-detail';

  if (!isModalOpen || !educationData) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    if (String(dateString).toLowerCase() === 'sekarang' || String(dateString).toLowerCase() === 'present') return t('common.present');
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      const locale = t('common.present') === 'Sekarang' ? 'id-ID' : 'en-US';
      return date.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  let gallery: string[] = [];
  try {
    if (Array.isArray(educationData.gallery)) {
      gallery = educationData.gallery;
    } else if (typeof educationData.gallery === 'string') {
      gallery = JSON.parse(educationData.gallery);
    }
  } catch (e) {
    gallery = [];
  }

  let attachments: any[] = [];
  try {
    if (Array.isArray(educationData.attachments)) {
      attachments = educationData.attachments;
    } else if (typeof educationData.attachments === 'string') {
      attachments = JSON.parse(educationData.attachments);
    }
  } catch (e) {
    attachments = [];
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-3xl w-[90vw] p-0 overflow-hidden bg-card/95 backdrop-blur-md border-border/50">
        <DialogTitle className="sr-only">Detail Pendidikan - {educationData.institution}</DialogTitle>
        <DialogDescription className="sr-only">Ringkasan detail pendidikan dan galeri</DialogDescription>
        <ScrollArea className="max-h-[85vh]">
          {/* Header Image / Cover */}
          <div className="relative h-32 md:h-48 bg-primary/10 w-full">
             {educationData.coverImage ? (
                <img 
                  src={educationData.coverImage} 
                  alt={educationData.institution} 
                  className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => openImagePreviewModal(educationData.coverImage!, educationData.institution)}
                />
             ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                    <GraduationCap className="w-16 h-16 text-primary/40" />
                </div>
             )}
             
             {/* Logo Overlay */}
             {educationData.logo && (
                <div 
                  className="absolute -bottom-8 left-6 md:left-8 w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-background bg-white p-2 shadow-lg flex items-center justify-center overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => openImagePreviewModal(educationData.logo!, educationData.institution)}
                >
                    <img 
                        src={educationData.logo} 
                        alt="Logo" 
                        className="w-full h-full object-contain rounded-full"
                    />
                </div>
             )}
          </div>

          <div className="pt-10 px-6 pb-6 md:px-8 md:pb-8">
             {/* Title & Subtitle */}
             <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                    {educationData.institution}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-primary font-medium text-lg">
                    <span>{educationData.degree}</span>
                    {educationData.field && (
                        <>
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                            <span className="text-muted-foreground">{educationData.field}</span>
                        </>
                    )}
                </div>
             </div>

             {/* Meta Info Grid */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                        <p className="text-xs text-muted-foreground">{t('common.date')}</p>
                        <p className="text-sm font-medium">
                            {formatDate(educationData.startDate)} - {educationData.endDate ? formatDate(educationData.endDate) : t('common.present')}
                        </p>
                    </div>
                </div>

                {educationData.gpa && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50">
                        <Award className="w-5 h-5 text-primary" />
                        <div>
                            <p className="text-xs text-muted-foreground">{t('education.gpa')}</p>
                            <p className="text-sm font-medium">{educationData.gpa}</p>
                        </div>
                    </div>
                )}

                {educationData.location && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50">
                        <MapPin className="w-5 h-5 text-primary" />
                        <div>
                            <p className="text-xs text-muted-foreground">{t('common.location')}</p>
                            <p className="text-sm font-medium">{educationData.location}</p>
                        </div>
                    </div>
                )}
             </div>

             {/* Gallery Preview (At Top Above Description) */}
             {gallery.length > 0 && (
                <div className="mb-6">
                     <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-primary" />
                        {t('education.gallery')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {gallery.slice(0, 4).map((img: string, idx: number) => {
                            const isVideo = /\.(mp4|webm|mov|mkv|avi)($|\?)/i.test(img) || img.includes('/video/upload/');

                            return (
                                <div key={idx} className="aspect-video rounded-md overflow-hidden border border-border/50 bg-black">
                                    {isVideo ? (
                                        <CustomVideoPlayer src={img} className="w-full h-full" />
                                    ) : (
                                        <img 
                                          src={img} 
                                          alt={`Gallery ${idx}`} 
                                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"
                                          onClick={() => openImagePreviewModal(img, `${educationData.institution} - Galeri`, gallery, idx)}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
             )}

              {/* Official Documents & Accreditation */}
              {attachments.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <span>Dokumen Resmi & Akreditasi</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {attachments.map((doc: any, idx: number) => {
                      const isPdf = /\.pdf($|\?)/i.test(doc.url) || doc.type === 'pdf';
                      return (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl border border-border/60 bg-muted/30 hover:bg-muted/50 transition-colors flex items-center justify-between gap-3 group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="size-9 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center shrink-0 border border-red-500/20">
                              <FileText className="size-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-semibold truncate text-foreground group-hover:text-primary transition-colors">
                                {doc.title || 'Dokumen Akreditasi'}
                              </p>
                              {doc.notes ? (
                                <p className="text-[11px] text-muted-foreground truncate">{doc.notes}</p>
                              ) : (
                                <p className="text-[11px] text-muted-foreground">{isPdf ? 'Format PDF' : 'Media'}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => openPdfPreviewModal(doc.url, doc.title || educationData.institution)}
                              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex items-center gap-1 cursor-pointer"
                              title="Buka Pratinjau Dokumen"
                            >
                              <span>Lihat PDF</span>
                              <ExternalLink className="size-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Description */}
              {educationData.description && (
                 <div className="mb-6">
                     <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                         <FileText className="w-4 h-4 text-primary" />
                         {t('common.description')}
                     </h3>
                     <div 
                         className="html-theme-responsive prose prose-sm dark:prose-invert max-w-none leading-relaxed [&>p]:mb-2 [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4"
                         dangerouslySetInnerHTML={{ __html: sanitizeHtmlContent(educationData.description) }}
                     />
                 </div>
              )}

             {/* Map Embed */}
             {educationData.mapUrl && (
                <div className="rounded-xl overflow-hidden border border-border/50 h-48 md:h-64 w-full">
                    <iframe 
                        src={educationData.mapUrl} 
                        width="100%" 
                        height="100%" 
                        style={{ border: 0 }} 
                        allowFullScreen 
                        loading="lazy"
                        title="Location Map"
                        className="w-full h-full"
                    />
                </div>
             )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
