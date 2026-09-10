import React, { Suspense } from 'react';
import { Header } from '@/components/layout/Header';
import { HeroSection } from '@/components/sections/HeroSection';
import { AboutSection } from '@/components/sections/AboutSection';
import { Helmet } from 'react-helmet-async';

// Dynamically import below-the-fold components to reduce initial chunk size
const Footer = React.lazy(() => import('@/components/layout/Footer').then(module => ({ default: module.Footer })));
const EducationSection = React.lazy(() => import('@/components/sections/EducationSection').then(module => ({ default: module.EducationSection })));
const SkillsSection = React.lazy(() => import('@/components/sections/SkillsSection').then(module => ({ default: module.SkillsSection })));
const ProjectsSection = React.lazy(() => import('@/components/sections/ProjectsSection').then(module => ({ default: module.ProjectsSection })));
const ExperienceSection = React.lazy(() => import('@/components/sections/ExperienceSection').then(module => ({ default: module.ExperienceSection })));
const CertificatesSection = React.lazy(() => import('@/components/sections/CertificatesSection').then(module => ({ default: module.CertificatesSection })));
const BlogSection = React.lazy(() => import('@/components/sections/BlogSection').then(module => ({ default: module.BlogSection })));
const ContactSection = React.lazy(() => import('@/components/sections/ContactSection').then(module => ({ default: module.ContactSection })));
const GlobalModal = React.lazy(() => import('@/components/GlobalModal').then(module => ({ default: module.GlobalModal })));
const BlobCursor = React.lazy(() => import('@/components/effects/BlobCursor').then(module => ({ default: module.BlobCursor })));
import { FloatingWhatsApp } from '@/components/effects/FloatingWhatsApp';
import { ScrollToTop } from '@/components/effects/ScrollToTop';

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
        <link rel="canonical" href="https://ekasyarif.my.id/" />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
        {/* Header */}
        <Header />
        
        {/* Main Content */}
        <main>
          <HeroSection />
          <AboutSection />
          
          <Suspense fallback={<div className="min-h-[200px]" />}>
            <EducationSection />
            <SkillsSection />
            <ProjectsSection />
            <ExperienceSection />
            <CertificatesSection />
            <BlogSection />
            <ContactSection />
          </Suspense>
        </main>
        
        <Suspense fallback={null}>
          <Footer />
          <GlobalModal />
          <FloatingWhatsApp />
          <ScrollToTop />
        </Suspense>

        {/* Custom Cursor - Hidden on mobile */}
        <div className="hidden lg:block">
          <Suspense fallback={null}>
            <BlobCursor />
          </Suspense>
        </div>
      </div>
    </>
  );
};

export default Index;
