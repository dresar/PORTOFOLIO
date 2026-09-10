import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/sections/HeroSection';
import { AboutSection } from '@/components/sections/AboutSection';
import { EducationSection } from '@/components/sections/EducationSection';
import { SkillsSection } from '@/components/sections/SkillsSection';
import { ProjectsSection } from '@/components/sections/ProjectsSection';
import { ExperienceSection } from '@/components/sections/ExperienceSection';
import { CertificatesSection } from '@/components/sections/CertificatesSection';
import { BlogSection } from '@/components/sections/BlogSection';
import { ContactSection } from '@/components/sections/ContactSection';
import { GlobalModal } from '@/components/GlobalModal';
import { BlobCursor } from '@/components/effects/BlobCursor';
import { FloatingWhatsApp } from '@/components/effects/FloatingWhatsApp';
import { ScrollToTop } from '@/components/effects/ScrollToTop';
import { Helmet } from 'react-helmet-async';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Eka Syarif Maulana, S.Kom | Senior Fullstack Web & Mobile Developer</title>
        <meta name="google-site-verification" content="A-3mGJRovHDKeQfXHyYFueXVNCPJhdiAV8ULsFRb9Ks" />
        <meta name="google-site-verification" content="google0e7f4f807a599919" />
        <meta name="google-site-verification" content="Sc-kfSh_oBZpVn3Tn8_zIVrNI3cMcYA6e_LZYjX3MKw" />
        <meta name="description" content="Portofolio Resmi Eka Syarif Maulana, S.Kom — Senior Fullstack Web & Mobile Developer (Sarjana Komputer) berpengalaman dalam membangun aplikasi web modern, sistem basis data, dan solusi teknologi berkualitas tinggi." />
        <meta name="keywords" content="Eka Syarif Maulana, S.Kom, Eka Syarif Maulana S.Kom, Eka Syarif Maulana, Sarjana Komputer, S.Kom, Portofolio Eka Syarif Maulana S.Kom, Eka Syarif, Eka Maulana, Fullstack Developer, Web Developer Medan, React Developer, Node.js, TypeScript, Pertamina Hulu Rokan, Teknologi Informasi UMSU, Software Engineer Indonesia, Portfolio Developer, Mobile Developer" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <link rel="canonical" href="https://inka.my.id/" />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
        {/* Custom Cursor - Hidden on mobile */}
        <div className="hidden lg:block">
          <BlobCursor />
        </div>
        
        {/* Header */}
        <Header />
        
        {/* Main Content */}
        <main>
          <HeroSection />
          <AboutSection />
          <EducationSection />
          <SkillsSection />
          <ProjectsSection />
          <ExperienceSection />
          <CertificatesSection />
          <BlogSection />
          <ContactSection />
        </main>
        
        {/* Footer */}
        <Footer />
        
        {/* Global Modal System */}
        <GlobalModal />
        
        <FloatingWhatsApp />
        <ScrollToTop />
      </div>
    </>
  );
};

export default Index;
