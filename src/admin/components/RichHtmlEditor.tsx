import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { sanitizeHtmlContent } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { 
  Eye, 
  Code2, 
  Sparkles,
  Heading2,
  Type,
  Bold as BoldIcon,
  List as ListIcon,
  Image as ImageIcon,
  Link as LinkIcon,
  Tag,
  Copy,
  Check
} from 'lucide-react';

interface RichHtmlEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  onAIGenerate?: () => void;
}

export const RichHtmlEditor: React.FC<RichHtmlEditorProps> = ({
  value,
  onChange,
  placeholder = 'Tuliskan kode HTML, CSS inline, atau teks biasa...',
  onAIGenerate
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'html' | 'preview'>('html');
  const [rawHtml, setRawHtml] = useState(sanitizeHtmlContent(value || ''));
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setRawHtml(sanitizeHtmlContent(value || ''));
  }, [value]);

  const handleChange = (newVal: string) => {
    const sanitized = sanitizeHtmlContent(newVal);
    setRawHtml(sanitized);
    onChange(sanitized);
  };

  const insertSnippet = (snippet: string) => {
    const nextValue = rawHtml ? `${rawHtml}\n${snippet}` : snippet;
    handleChange(nextValue);
  };

  const handleCopyChatGptPrompt = () => {
    const promptText = `Tolong buatkan deskripsi HTML modern yang 100% responsif terhadap DARK MODE (Tema Gelap) dan LIGHT MODE (Tema Terang).

ATURAN KETAT FORMAT KODE HTML:
1. OUTPUT LANGSUNG berupa kode HTML bersih. JANGAN gunakan pembungkus markdown \`\`\`html di awal atau di akhir. JANGAN ada kata pengantar atau penutup.
2. RESPONSIF TEMA (Dark & Light Mode):
   - JANGAN gunakan inline style warna teks gelap kaku seperti color: #374151 atau color: #000000. Biarkan warna teks paragraf/poin mengalir alami (inherit).
   - Gunakan warna fleksibel untuk Judul/Heading (contoh: <h2 style="color: #38bdf8; margin-bottom: 8px;">).
   - Untuk Badge / Tag teknologi, gunakan background RGBA transparan agar fleksibel di mode gelap & terang (contoh: <span style="background: rgba(59, 130, 246, 0.15); color: #60a5fa; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;">HTML5</span>).
3. STRUKTUR KONTEN BERSIH & CANTIK:
   - Header posisi / judul dengan emoji
   - Paragraf deskripsi ringkas
   - Tag garis pembatas fleksibel: <hr style="border: none; border-top: 1px solid rgba(148, 163, 184, 0.2); margin: 16px 0;" />
   - Subjudul Tanggung Jawab dengan bullet list (<ul> <li>)
   - Subjudul Teknologi dengan badge span RGBA transparan
   - Kotak Highlight Kompetensi dengan background RGBA transparan (background: rgba(14, 165, 233, 0.12); border-left: 4px solid #0284c7; padding: 14px; border-radius: 8px;).

---
Berikut adalah informasi/deskripsi saya yang ingin dibuatkan format HTML cantiknya:
`;
    
    navigator.clipboard.writeText(promptText);
    setIsCopied(true);
    toast({ title: "Prompt ChatGPT Disalin!", description: "Tinggal paste ke ChatGPT dan tambahkan deskripsi Anda di bawahnya." });
    setTimeout(() => setIsCopied(false), 3000);
  };

  return (
    <div className="border border-border/80 rounded-xl overflow-hidden bg-card shadow-sm">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-muted/40 border-b border-border/60">
        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-1 bg-muted/80 p-1 rounded-lg">
          <Button
            type="button"
            variant={activeTab === 'html' ? 'default' : 'ghost'}
            size="sm"
            className="h-8 text-xs gap-1.5 font-medium"
            onClick={() => setActiveTab('html')}
          >
            <Code2 className="w-3.5 h-3.5 text-primary" /> HTML Code View
          </Button>
          <Button
            type="button"
            variant={activeTab === 'preview' ? 'default' : 'ghost'}
            size="sm"
            className="h-8 text-xs gap-1.5 font-medium"
            onClick={() => setActiveTab('preview')}
          >
            <Eye className="w-3.5 h-3.5 text-primary" /> Live Preview
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5 border-border/80 text-foreground hover:bg-muted font-medium"
            onClick={handleCopyChatGptPrompt}
            title="Salin aturan prompt untuk ChatGPT / Gemini"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-blue-500" />}
            {isCopied ? 'Prompt Disalin!' : 'Salin Prompt ChatGPT'}
          </Button>

          {onAIGenerate && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-purple-500 hover:text-purple-600 hover:bg-purple-500/10 gap-1.5 font-medium"
              onClick={onAIGenerate}
            >
              <Sparkles className="w-3.5 h-3.5" /> AI Generate
            </Button>
          )}
        </div>
      </div>

      {/* HTML Quick Snippets Toolbar (Shown in Code View) */}
      {activeTab === 'html' && (
        <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 bg-muted/20 border-b border-border/40 text-xs">
          <span className="text-muted-foreground mr-1 text-[11px] font-medium">Quick Snippets:</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-[11px] px-2 gap-1 border-border/60"
            onClick={() => insertSnippet('<h2>Title Heading</h2>')}
          >
            <Heading2 className="w-3 h-3 text-primary" /> H2
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-[11px] px-2 gap-1 border-border/60"
            onClick={() => insertSnippet('<p>Deskripsi paragraf baru di sini...</p>')}
          >
            <Type className="w-3 h-3 text-primary" /> Paragraph
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-[11px] px-2 gap-1 border-border/60"
            onClick={() => insertSnippet('<strong>Teks Tebal</strong>')}
          >
            <BoldIcon className="w-3 h-3 text-primary" /> Bold
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-[11px] px-2 gap-1 border-border/60"
            onClick={() => insertSnippet('<ul className="list-disc pl-5">\n  <li>Poin 1</li>\n  <li>Poin 2</li>\n</ul>')}
          >
            <ListIcon className="w-3 h-3 text-primary" /> List
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-[11px] px-2 gap-1 border-border/60"
            onClick={() => insertSnippet('<img src="https://cdn.example.com/image.jpg" alt="Gambar" className="rounded-lg max-w-full my-2" />')}
          >
            <ImageIcon className="w-3 h-3 text-primary" /> Image CDN
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-[11px] px-2 gap-1 border-border/60"
            onClick={() => insertSnippet('<a href="https://example.com" target="_blank" class="text-primary underline">Link Text</a>')}
          >
            <LinkIcon className="w-3 h-3 text-primary" /> Link
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-[11px] px-2 gap-1 border-border/60"
            onClick={() => insertSnippet('<span style="background: rgba(16, 185, 129, 0.15); color: #10b981; padding: 2px 8px; border-radius: 6px; font-size: 12px;">Badge</span>')}
          >
            <Tag className="w-3 h-3 text-primary" /> Badge CSS
          </Button>
        </div>
      )}

      {/* Body Area */}
      <div className="p-3 min-h-[180px] bg-background">
        {activeTab === 'html' ? (
          <Textarea
            value={rawHtml}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            className="font-mono text-xs md:text-sm min-h-[180px] border-none focus-visible:ring-0 p-1 bg-transparent resize-y leading-relaxed"
          />
        ) : (
          <div className="p-4 rounded-xl bg-card border border-border/50 min-h-[180px]">
            <div 
              className="html-theme-responsive prose dark:prose-invert max-w-none text-sm leading-relaxed [&>p]:mb-3 [&>h2]:text-xl [&>h2]:font-bold [&>h2]:mb-2 [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:mb-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>a]:text-primary [&>a]:underline"
              dangerouslySetInnerHTML={{ __html: sanitizeHtmlContent(rawHtml) || '<p class="text-muted-foreground italic text-xs">Belum ada konten HTML untuk dipratinjau...</p>' }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
