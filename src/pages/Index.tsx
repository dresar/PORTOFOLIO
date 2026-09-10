import React, { useState, useEffect } from 'react';
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
import { useProfile } from '@/hooks/useProfile';
import { useSettings } from '@/hooks/useSettings';
import { useSocialLinks } from '@/hooks/useSocialLinks';
import { useSkills } from '@/hooks/useSkills';
import { useProjects } from '@/hooks/useProjects';
import { useExperience } from '@/hooks/useExperience';
import { useEducation } from '@/hooks/useEducation';
import { useCertificates } from '@/hooks/useCertificates';
import { Preloader } from '@/components/ui/Preloader';
import { AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

const Index = () => {
  const { isLoading: profileLoading } = useProfile();
  const { isLoading: settingsLoading } = useSettings();
  const { isLoading: linksLoading } = useSocialLinks();
  const { isLoading: skillsLoading } = useSkills();
  const { isLoading: projectsLoading } = useProjects();
  const { isLoading: experienceLoading } = useExperience();
  const { isLoading: educationLoading } = useEducation();
  const { isLoading: certificatesLoading } = useCertificates();

  // Combine into monitored loading states
  const loadingStates = [
    { key: 'profile', loading: profileLoading },
    { key: 'settings', loading: settingsLoading },
    { key: 'links', loading: linksLoading },
    { key: 'skills', loading: skillsLoading },
    { key: 'projects', loading: projectsLoading },
    { key: 'experience', loading: experienceLoading },
    { key: 'education', loading: educationLoading },
    { key: 'certificates', loading: certificatesLoading },
  ];

  const totalCount = loadingStates.length;
  const loadedCount = loadingStates.filter((s) => !s.loading).length;
  const realProgress = Math.round((loadedCount / totalCount) * 100);

  const [displayProgress, setDisplayProgress] = useState(0);
  const [showPreloader, setShowPreloader] = useState(true);

  // Smoothly increment display progress towards realProgress or 100%
  useEffect(() => {
    setDisplayProgress((prev) => Math.max(prev, realProgress));
  }, [realProgress]);

  // Safety timer to prevent any long hang (max 1.2 seconds)
  useEffect(() => {
    // If all data loaded already or cache is hot, close quickly
    if (loadedCount === totalCount) {
      setDisplayProgress(100);
      const closeTimer = setTimeout(() => {
        setShowPreloader(false);
      }, 250);
      return () => clearTimeout(closeTimer);
    }

    const safetyTimer = setTimeout(() => {
      setDisplayProgress(100);
      const closeTimer = setTimeout(() => {
        setShowPreloader(false);
      }, 200);
      return () => clearTimeout(closeTimer);
    }, 1200);

    return () => clearTimeout(safetyTimer);
  }, [loadedCount, totalCount]);

  return (
    <>
      <Helmet>
        <title>Eka Syarif Maulana, S.Kom | Senior Fullstack Web & Mobile Developer</title>
        <meta name="google-site-verification" content="google0e7f4f807a599919" />
        <meta name="google-site-verification" content="Sc-kfSh_oBZpVn3Tn8_zIVrNI3cMcYA6e_LZYjX3MKw" />
        <meta name="description" content="Portofolio Resmi Eka Syarif Maulana, S.Kom — Senior Fullstack Web & Mobile Developer (Sarjana Komputer) berpengalaman dalam membangun aplikasi web modern, sistem basis data, dan solusi teknologi berkualitas tinggi." />
        <meta name="keywords" content="Eka Syarif Maulana, S.Kom, Eka Syarif Maulana S.Kom, Eka Syarif Maulana, Sarjana Komputer, S.Kom, Portofolio Eka Syarif Maulana S.Kom, Eka Syarif, Eka Maulana, Fullstack Developer, Web Developer Medan, React Developer, Node.js, TypeScript, Pertamina Hulu Rokan, Teknologi Informasi UMSU, Software Engineer Indonesia, Portfolio Developer, Mobile Developer" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <link rel="canonical" href="https://etech.my.id/" />
      </Helmet>

      <AnimatePresence mode="wait">
        {showPreloader && (
          <Preloader 
            progress={displayProgress} 
            loadedCount={loadedCount} 
            totalCount={totalCount} 
          />
        )}
      </AnimatePresence>

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
