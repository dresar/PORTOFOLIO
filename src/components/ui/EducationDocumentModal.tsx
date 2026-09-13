import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useModalStore } from '@/store/modalStore';
import { FileText, ExternalLink, Download, Maximize2, Minimize2, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const EducationDocumentModal = () => {
  const { isOpen, modalType, documentUrl, documentTitle, closeModal } = useModalStore();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isModalOpen = isOpen && modalType === 'education-document';

  if (!documentUrl) return null;

  const isPdf = /\.pdf($|\?)/i.test(documentUrl) || documentUrl.startsWith('data:application/pdf') || documentUrl.startsWith('blob:') && (documentTitle?.toLowerCase().includes('pdf') || true);
  const isImage = /\.(png|jpe?g|webp|gif|svg)($|\?)/i.test(documentUrl);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = documentTitle ? `${documentTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf` : 'dokumen.pdf';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent
        className={`p-0 overflow-hidden bg-card/95 backdrop-blur-md border-border/50 flex flex-col transition-all duration-200 ${
          isFullscreen
            ? 'max-w-[100vw] w-[100vw] h-[100vh] rounded-none'
            : 'max-w-5xl w-[95vw] h-[85vh] rounded-xl'
        }`}
      >
        <DialogTitle className="sr-only">Pratinjau Dokumen - {documentTitle || 'Dokumen'}</DialogTitle>
        <DialogDescription className="sr-only">Pratinjau dokumen PDF dan lampiran resmi</DialogDescription>

        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border/50 bg-muted/40 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 mr-2">
            <div className="size-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center shrink-0 border border-red-500/20">
              {isImage ? <ImageIcon className="size-4 text-primary" /> : <FileText className="size-4" />}
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-semibold truncate leading-tight">
                {documentTitle || 'Pratinjau Dokumen'}
              </h2>
              <p className="text-[11px] text-muted-foreground truncate">
                {isPdf ? 'Dokumen PDF (Mendukung Multi-halaman & Zoom)' : 'Lampiran Media'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(documentUrl, '_blank', 'noopener,noreferrer')}
              className="h-8 px-2.5 text-xs rounded-lg gap-1.5 font-medium hidden sm:inline-flex"
              title="Buka di tab baru"
            >
              <ExternalLink className="size-3.5" />
              <span>Tab Baru</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="h-8 px-2.5 text-xs rounded-lg gap-1.5 font-medium"
              title="Unduh file"
            >
              <Download className="size-3.5" />
              <span className="hidden sm:inline">Unduh</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="size-8 rounded-lg hidden sm:flex"
              title={isFullscreen ? 'Kecilkan' : 'Perbesar layar'}
            >
              {isFullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={closeModal}
              className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
              title="Tutup"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {/* Viewer Container */}
        <div className="flex-1 w-full bg-muted/20 relative overflow-hidden flex items-center justify-center">
          {isImage ? (
            <div className="w-full h-full flex items-center justify-center p-4 overflow-auto">
              <img
                src={documentUrl}
                alt={documentTitle || 'Dokumen'}
                className="max-w-full max-h-full object-contain rounded-md shadow-md"
              />
            </div>
          ) : (
            <object
              data={documentUrl}
              type="application/pdf"
              className="w-full h-full"
            >
              <iframe
                src={documentUrl}
                className="w-full h-full border-0"
                title={documentTitle || 'Document Preview'}
              />
            </object>
          )}
        </div>

        {/* Footer fallback info */}
        <div className="px-4 py-2 border-t border-border/40 bg-muted/30 text-[11px] text-muted-foreground flex items-center justify-between shrink-0">
          <span>Gunakan kontrol PDF browser untuk berpindah halaman atau zoom.</span>
          <a
            href={documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium inline-flex items-center gap-1"
          >
            <span>Tautan Langsung</span>
            <ExternalLink className="size-3" />
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
};
