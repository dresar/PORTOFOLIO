import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Sparkles, Copy, Check, ExternalLink, RefreshCw, Save } from 'lucide-react';
import { generateThumbnailMegaPrompt, countWords, type ThumbnailProjectInput } from '@/lib/thumbnailPromptGenerator';
import { api } from '@/services/api';

interface ThumbnailPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ThumbnailProjectInput;
  onSaved?: (savedPrompt: string) => void;
}

export const ThumbnailPromptModal: React.FC<ThumbnailPromptModalProps> = ({
  isOpen,
  onClose,
  project,
  onSaved,
}) => {
  const { toast } = useToast();
  const [promptText, setPromptText] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const existingPrompt = (project as any)?.ai_thumbnail_prompt;
      if (existingPrompt && typeof existingPrompt === 'string' && existingPrompt.trim().length > 100) {
        setPromptText(existingPrompt);
      } else {
        const fresh = generateThumbnailMegaPrompt(project);
        setPromptText(fresh);
      }
      setIsCopied(false);
    }
  }, [isOpen, project]);

  const wordCount = useMemo(() => countWords(promptText), [promptText]);

  const handleRegenerate = () => {
    const fresh = generateThumbnailMegaPrompt(project);
    setPromptText(fresh);
    toast({
      title: "Prompt Diperbarui",
      description: `${countWords(fresh)} kata berhasil di-generate.`
    });
  };

  const handleCopyPrompt = async () => {
    if (!promptText) return;
    try {
      await navigator.clipboard.writeText(promptText);
      setIsCopied(true);
      toast({
        title: "Tersalin",
        description: "Prompt disalin ke clipboard."
      });
      setTimeout(() => setIsCopied(false), 3000);
    } catch {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Silakan salin teks secara manual."
      });
    }
  };

  const handleSaveToDatabase = async () => {
    if (!project.id) {
      if (onSaved) onSaved(promptText);
      toast({
        title: "Tersimpan",
        description: "Prompt disimpan ke form."
      });
      return;
    }

    setIsSaving(true);
    try {
      await api.projects.update(Number(project.id), {
        ai_thumbnail_prompt: promptText
      } as any);

      if (onSaved) onSaved(promptText);
      toast({
        title: "Tersimpan",
        description: "Prompt tersimpan ke database."
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: err?.message || "Gagal menyimpan prompt."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const openChatGPT = () => {
    window.open('https://chatgpt.com', '_blank');
  };

  const openGemini = () => {
    window.open('https://gemini.google.com', '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden border-border/80 shadow-2xl bg-card">
        
        <DialogHeader className="p-4 sm:p-5 pb-3 border-b border-border/60 bg-muted/20 flex-shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="size-8 sm:size-9 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 shrink-0">
                <Sparkles className="size-4 sm:size-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <span>Prompt Thumbnail</span>
                  <Badge variant="outline" className="text-[11px] font-medium px-1.5 py-0 bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                    {wordCount.toLocaleString('id-ID')} Kata
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Salin dan tempel langsung ke ChatGPT atau Google Gemini.
                </DialogDescription>
              </div>
            </div>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleRegenerate}
              className="h-8 text-xs gap-1.5 rounded-lg border-border/80 hover:border-primary/50 active:scale-[0.98] shrink-0"
              title="Generate ulang prompt baru"
            >
              <RefreshCw className="size-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <Textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            rows={18}
            className="w-full h-full min-h-[380px] sm:min-h-[440px] font-mono text-xs leading-relaxed rounded-lg border-border/80 bg-muted/20 focus-visible:ring-primary/40 selection:bg-primary/20 resize-none p-3.5"
            placeholder="Prompt AI..."
          />
        </div>

        <DialogFooter className="p-3.5 border-t border-border/60 bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openChatGPT}
              className="h-8 text-xs gap-1.5 rounded-lg flex-1 sm:flex-none border-border/80 hover:border-primary/50 active:scale-[0.98]"
              title="Buka ChatGPT"
            >
              <ExternalLink className="size-3.5" />
              <span>ChatGPT</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openGemini}
              className="h-8 text-xs gap-1.5 rounded-lg flex-1 sm:flex-none border-border/80 hover:border-primary/50 active:scale-[0.98]"
              title="Buka Google Gemini"
            >
              <ExternalLink className="size-3.5" />
              <span>Gemini</span>
            </Button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleSaveToDatabase}
              disabled={isSaving}
              className="h-8 text-xs gap-1.5 rounded-lg flex-1 sm:flex-none active:scale-[0.98]"
            >
              <Save className="size-3.5" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan'}</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleCopyPrompt}
              className="h-8 text-xs gap-1.5 rounded-lg font-semibold flex-1 sm:flex-none bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs active:scale-[0.98]"
            >
              {isCopied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              <span>{isCopied ? 'Tersalin' : 'Salin'}</span>
            </Button>
          </div>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
};
