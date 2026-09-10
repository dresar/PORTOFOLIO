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

// Strictly check if public cache is already present or if page was reloaded
const isPublicCacheReady = (): boolean => {
  try {
    if (typeof window === 'undefined') return true;

    // 1. DILARANG KERAS munculkan animasi loading saat reload (F5 / browser refresh)
    if (window.performance) {
      const navEntries = window.performance.getEntriesByType?.('navigation');
      if (navEntries && navEntries.length > 0) {
        const nav = navEntries[0] as PerformanceNavigationTiming;
        if (nav && nav.type === 'reload') {
          return true; // Reload -> Zero Loading!
        }
      }
      if ((window.performance as any).navigation?.type === 1) {
        return true; // Reload legacy -> Zero Loading!
      }
    }

    // 2. Jika sudah pernah sync data di session ini -> Zero Loading!
    if (sessionStorage.getItem('portfolio_public_synced') === 'true') {
      return true;
    }

    // 3. Jika cache public localStorage sudah terunduh -> Zero Loading!
    if (localStorage.getItem('portfolio_public_downloaded') === 'true') {
      return true;
    }

    // 4. Jika salah satu cache public utama sudah ada di storage -> Zero Loading!
    if (
      localStorage.getItem('profile_cache') ||
      localStorage.getItem('settings_cache') ||
      localStorage.getItem('projects_cache') ||
      localStorage.getItem('REACT_QUERY_OFFLINE_CACHE')
    ) {
      sessionStorage.setItem('portfolio_public_synced', 'true');
      localStorage.setItem('portfolio_public_downloaded', 'true');
      return true;
    }

    // 5. Hanya pertama kali unduh tanpa cache yang menampilkan preloader
    return false;
  } catch {
    return true;
  }
};

const Index = () => {
  // Initialize to false if reload or public cache exists (ZERO LOADING)
  const [showPreloader, setShowPreloader] = useState<boolean>(() => !isPublicCacheReady());
  const [displayProgress, setDisplayProgress] = useState(showPreloader ? 0 : 100);

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

  // Smoothly increment display progress towards realProgress or 100% only on first-time preloader
  useEffect(() => {
    if (!showPreloader) return;
    setDisplayProgress((prev) => Math.max(prev, realProgress));
  }, [realProgress, showPreloader]);

  // First-time download completion and safety timer
  useEffect(() => {
    if (!showPreloader) return;

    const finishPreloader = () => {
      try {
        sessionStorage.setItem('portfolio_public_synced', 'true');
        localStorage.setItem('portfolio_public_downloaded', 'true');
      } catch (e) {}
      setDisplayProgress(100);
      setShowPreloader(false);
    };

    // If all data loaded, close quickly
    if (loadedCount === totalCount) {
      const closeTimer = setTimeout(finishPreloader, 200);
      return () => clearTimeout(closeTimer);
    }

    // Safety timer for initial download (max 1.2 seconds)
    const safetyTimer = setTimeout(finishPreloader, 1200);
    return () => clearTimeout(safetyTimer);
  }, [loadedCount, totalCount, showPreloader]);

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
