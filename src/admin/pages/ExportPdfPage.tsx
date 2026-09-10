import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  FileText, 
  Download, 
  User, 
  Briefcase, 
  Zap, 
  GraduationCap, 
  Award, 
  Loader2, 
  Printer,
  Home,
  MessageSquare,
  Mail
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Public Components
import { Header } from '@/components/layout/Header';
import { HeroSection } from '@/components/sections/HeroSection';
import { AboutSection } from '@/components/sections/AboutSection';
import { EducationSection } from '@/components/sections/EducationSection';
import { SkillsSection } from '@/components/sections/SkillsSection';
import { ProjectsSection } from '@/components/sections/ProjectsSection';
import { ExperienceSection } from '@/components/sections/ExperienceSection';
import { CertificatesSection } from '@/components/sections/CertificatesSection';
import { BlogSection } from '@/components/sections/BlogSection';
import { ContactSection } from '@/components/sections/ContactSection';

// Data Hooks to monitor loading state of public sections
import { useProfile } from '@/hooks/useProfile';
import { useExperience } from '@/hooks/useExperience';
import { useProjects } from '@/hooks/useProjects';
import { useSkills } from '@/hooks/useSkills';
import { useEducation } from '@/hooks/useEducation';
import { useCertificates } from '@/hooks/useCertificates';

export default function ExportPdfPage() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  // Monitor loading status of data hooks to prevent capturing empty states
  const { isLoading: profileLoading } = useProfile();
  const { isLoading: expLoading } = useExperience();
  const { isLoading: projLoading } = useProjects();
  const { isLoading: skillsLoading } = useSkills();
  const { isLoading: eduLoading } = useEducation();
  const { isLoading: certLoading } = useCertificates();

  const isDataLoading = 
    profileLoading || 
    expLoading || 
    projLoading || 
    skillsLoading || 
    eduLoading || 
    certLoading;

  const sectionsConfig = [
    { id: 'home', title: 'Beranda', desc: 'Perkenalan utama hero section.', icon: Home, hash: '/#home' },
    { id: 'about', title: 'Tentang', desc: 'Profil lengkap dan biografi.', icon: User, hash: '/#about' },
    { id: 'education', title: 'Pendidikan', desc: 'Riwayat instansi pendidikan.', icon: GraduationCap, hash: '/#education' },
    { id: 'skills', title: 'Keahlian', desc: 'Penguasaan keahlian teknis.', icon: Zap, hash: '/#skills' },
    { id: 'projects', title: 'Proyek', desc: 'Portofolio proyek dan kode.', icon: FileText, hash: '/#projects' },
    { id: 'experience', title: 'Pengalaman', desc: 'Rekam jejak karier profesional.', icon: Briefcase, hash: '/#experience' },
    { id: 'certificates', title: 'Sertifikat', desc: 'Sertifikasi dan lisensi.', icon: Award, hash: '/#certificates' },
    { id: 'blog', title: 'Blog', desc: 'Artikel dan publikasi blog.', icon: MessageSquare, hash: '/#blog' },
    { id: 'contact', title: 'Kontak', desc: 'Formulir dan kontak sosial.', icon: Mail, hash: '/#contact' },
  ];

  const handleExportSection = async (sectionId: string, sectionTitle: string, targetHash: string) => {
    setIsGenerating(sectionId);
    
    // Brief delay to ensure state transitions complete
    await new Promise(resolve => setTimeout(resolve, 300));
    
    try {
      const element = document.getElementById(`pdf-preview-${sectionId}`);
      if (!element) {
        throw new Error(`Elemen pratinjau untuk bagian ${sectionTitle} tidak ditemukan.`);
      }

      // Capture DOM node as canvas
      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        scale: 2, // Double scale for high-res print quality
        backgroundColor: '#0a0a0a',
        logging: false,
        width: 1200, // Force render at 1200px width
        windowWidth: 1200 // Virtual viewport width
      });

      const imgWidth = 297; // A4 landscape width in mm
      const pageHeight = 210; // A4 landscape height in mm
      const imgHeight = (canvas.height / canvas.width) * imgWidth;
      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      const doc = new jsPDF('l', 'mm', 'a4');
      const sectionPages = Math.ceil(imgHeight / pageHeight);
      const targetUrl = `${window.location.origin}${targetHash}`;

      for (let j = 0; j < sectionPages; j++) {
        if (j > 0) doc.addPage();
        
        // Draw the visual dark background first
        doc.setFillColor(10, 10, 10); // #0a0a0a
        doc.rect(0, 0, 297, 210, 'F');

        const position = -j * pageHeight;
        
        // Draw the section segment
        doc.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        
        // Make the entire page area clickable and redirect to the corresponding section of live portfolio
        doc.link(0, 0, 297, 210, { url: targetUrl });
      }

      doc.save(`portofolio_${sectionId}_${Date.now()}.pdf`);
      toast({
        title: "Ekspor Berhasil",
        description: `Tampilan visual bagian ${sectionTitle} telah diunduh sebagai PDF interaktif. Klik halaman untuk menuju portofolio live.`,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Ekspor Gagal",
        description: err.message || "Terjadi kesalahan saat memproses gambar ke PDF.",
      });
    } finally {
      setIsGenerating(null);
    }
  };

  const handleExportFull = async () => {
    setIsGenerating('full');
    
    // Brief delay to ensure DOM is fully loaded and settled
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const doc = new jsPDF('l', 'mm', 'a4');
      let isFirstPage = true;

      // Loop and export section-by-section (starting each section on a new page)
      for (const sect of sectionsConfig) {
        const element = document.getElementById(`pdf-preview-${sect.id}`);
        if (!element) continue;

        const canvas = await html2canvas(element, {
          useCORS: true,
          allowTaint: true,
          scale: 2, // High resolution
          backgroundColor: '#0a0a0a',
          logging: false,
          width: 1200, // Force render at 1200px width
          windowWidth: 1200 // Virtual viewport width
        });

        const imgWidth = 297;
        const pageHeight = 210;
        const imgHeight = (canvas.height / canvas.width) * imgWidth;
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const targetUrl = `${window.location.origin}${sect.hash}`;

        const sectionPages = Math.ceil(imgHeight / pageHeight);

        for (let j = 0; j < sectionPages; j++) {
          if (isFirstPage) {
            isFirstPage = false;
          } else {
            doc.addPage();
          }

          // Draw the visual dark background first
          doc.setFillColor(10, 10, 10);
          doc.rect(0, 0, 297, 210, 'F');

          const position = -j * pageHeight;
          
          // Draw the segment
          doc.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
          
          // Make the entire page clickable to go to live portfolio site section
          doc.link(0, 0, 297, 210, { url: targetUrl });
        }
      }

      doc.save(`portofolio_lengkap_${Date.now()}.pdf`);
      toast({
        title: "Berhasil!",
        description: "PDF portofolio lengkap berhasil diunduh.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Gagal!",
        description: err.message || "Terjadi kesalahan saat memproses PDF.",
      });
    } finally {
      setIsGenerating(null);
    }
  };

  if (isDataLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Memuat...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Ekspor PDF</h1>
          <p className="text-muted-foreground mt-1">Cetak tampilan halaman portofolio ke PDF interaktif.</p>
        </div>
        <Button 
          size="lg"
          onClick={handleExportFull} 
          disabled={isGenerating !== null}
          className="flex-shrink-0 bg-primary hover:bg-primary/90 text-white font-medium shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {isGenerating === 'full' ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Printer className="w-5 h-5 mr-2" />
          )}
          Ekspor Lengkap
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sectionsConfig.map((sect) => {
          const Icon = sect.icon;
          return (
            <Card key={sect.id} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 flex flex-col border border-border/50 bg-card/60 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-lg font-bold">{sect.title}</CardTitle>
                  <CardDescription className="text-xs line-clamp-2">{sect.desc}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-end pt-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-between h-10 border-border/60 hover:bg-primary/5 hover:text-primary transition-all duration-300 group-hover:border-primary/45"
                  onClick={() => handleExportSection(sect.id, sect.title, sect.hash)}
                  disabled={isGenerating !== null}
                >
                  <span className="text-xs font-semibold">Cetak Bagian</span>
                  {isGenerating === sect.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  ) : (
                    <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Off-screen Visual Rendering Area for PDF Slices */}
      <div 
        id="pdf-preview-root" 
        className="dark bg-[#0a0a0a] text-foreground font-sans" 
        style={{ 
          width: '1200px',
          position: 'absolute', 
          left: '-9999px', 
          top: '0', 
          zIndex: -100,
          pointerEvents: 'none'
        }}
      >
        {/* CSS override to cancel entrance animations and enforce solid visual backgrounds */}
        <style dangerouslySetInnerHTML={{__html: `
          #pdf-preview-root * {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
            animation: none !important;
            visibility: visible !important;
          }
          #pdf-preview-root > div {
            width: 1200px !important;
            background-color: #0a0a0a !important;
          }
          #pdf-preview-root header {
            position: absolute !important;
            width: 100% !important;
            top: 0 !important;
            left: 0 !important;
          }
          #pdf-preview-home {
            position: relative !important;
            padding-top: 80px !important;
          }
          #pdf-preview-root section {
            padding-top: 4rem !important;
            padding-bottom: 4rem !important;
            background-color: #0a0a0a !important;
          }
          #pdf-preview-root .glass-strong,
          #pdf-preview-root .bg-card,
          #pdf-preview-root .bg-card\\/50,
          #pdf-preview-root .bg-card\\/60 {
            background-color: #121214 !important;
            border-color: #1e1e24 !important;
            backdrop-filter: none !important;
          }
        `}} />

        {/* Individual Section Blocks */}
        <div id="pdf-preview-home">
          <Header />
          <HeroSection />
        </div>
        <div id="pdf-preview-about"><AboutSection /></div>
        <div id="pdf-preview-education"><EducationSection /></div>
        <div id="pdf-preview-skills"><SkillsSection /></div>
        <div id="pdf-preview-projects"><ProjectsSection /></div>
        <div id="pdf-preview-experience"><ExperienceSection /></div>
        <div id="pdf-preview-certificates"><CertificatesSection /></div>
        <div id="pdf-preview-blog"><BlogSection /></div>
        <div id="pdf-preview-contact"><ContactSection /></div>
      </div>
    </div>
  );
}
