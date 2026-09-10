import { Suspense, lazy, useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Loader2 } from "lucide-react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ThemeApplicator } from "@/components/effects/ThemeApplicator";
import MaintenanceGuard from "@/components/MaintenanceGuard";
import { dataManager } from "@/services/dataManager";
import { FloatingWhatsApp } from '@/components/effects/FloatingWhatsApp';
import { ScrollToTop } from '@/components/effects/ScrollToTop';
import { ScrollRestoration } from '@/components/effects/ScrollRestoration';

import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

// Custom lazy load wrapper to handle chunk load errors
const lazyRetry = (componentImport: () => Promise<any>) => {
  return lazy(async () => {
    try {
      return await componentImport();
    } catch (error: any) {
      const msg = String(error?.message || error || '');
      const isChunkError =
        msg.includes('Failed to fetch dynamically imported module') ||
        msg.includes('Importing a module script failed') ||
        msg.includes('error loading dynamically imported module');

      const storageKey = 'chunk_reload_ts';
      const lastReload = parseInt(sessionStorage.getItem(storageKey) || '0', 10);
      const now = Date.now();

      if (isChunkError && (!lastReload || now - lastReload > 10000)) {
        sessionStorage.setItem(storageKey, String(now));
        const url = new URL(window.location.href);
        url.searchParams.set('reload', String(now));
        window.location.href = url.toString();
        return new Promise(() => {});
      }
      throw error;
    }
  });
};

import Index from "./pages/Index";
import BlogList from "./pages/BlogList";
import BlogDetail from "./pages/BlogDetail";
import ProjectDetail from "./pages/ProjectDetail";
import NotFound from "./pages/NotFound";

// Admin Pages
const LoginPage = lazyRetry(() => import("./admin/pages/LoginPage"));
const DashboardPage = lazyRetry(() => import("./admin/pages/DashboardPage"));
const MessagesPage = lazyRetry(() => import("./admin/pages/MessagesPage"));
const SettingsPage = lazyRetry(() => import("./admin/pages/SettingsPage"));
const AboutContentPage = lazyRetry(() => import("./admin/pages/AboutContentPage"));
const AISettingsPage = lazyRetry(() => import("./admin/pages/AISettingsPage"));

// New Admin Pages
const ProjectList = lazyRetry(() => import("./admin/pages/projects/ProjectList"));
const ProjectForm = lazyRetry(() => import("./admin/pages/projects/ProjectForm"));
const SkillList = lazyRetry(() => import("./admin/pages/skills/SkillList"));
const EducationList = lazyRetry(() => import("./admin/pages/education/EducationList"));
const EducationForm = lazyRetry(() => import("./admin/pages/education/EducationForm"));
const CertificateList = lazyRetry(() => import("./admin/pages/certificates/CertificateList"));
const CertificateForm = lazyRetry(() => import("./admin/pages/certificates/CertificateForm"));
const WATemplateList = lazyRetry(() => import("./admin/pages/communication/WATemplateList"));
const ExperienceList = lazyRetry(() => import("./admin/pages/experience/ExperienceList"));
const ExperienceForm = lazyRetry(() => import("./admin/pages/experience/ExperienceForm"));
const BlogListAdmin = lazyRetry(() => import("./admin/pages/blog/BlogList"));
const BlogFormAdmin = lazyRetry(() => import("./admin/pages/blog/BlogForm"));
const CommentList = lazyRetry(() => import("./admin/pages/blog/CommentList"));
const CloudinaryPage = lazyRetry(() => import("./admin/pages/cloudinary/CloudinaryPage"));
const ExportPdfPage = lazyRetry(() => import("./admin/pages/ExportPdfPage"));

import { AdminLayout } from "./admin/components/AdminLayout";

// Configure Query Client with Persistence
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 5 minutes staleTime for instant zero-loading rendering from cache
      staleTime: 5 * 60 * 1000, 
      gcTime: 24 * 60 * 60 * 1000, // Keep in memory/localStorage for 24 hours
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Instant mount without triggering loading states
      refetchOnReconnect: true,
      retry: 1,
    },
  },
});

const persister = createSyncStoragePersister({
  storage: window.localStorage,
});

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we have cached data for critical endpoints
    const checkCache = () => {
      // Check for React Query cache or legacy DataManager cache
      const hasLegacyCache = Object.keys(localStorage).some(key => key.startsWith('portfolio_cache_'));
      const hasQueryCache = localStorage.getItem('REACT_QUERY_OFFLINE_CACHE');
      
      if (hasLegacyCache || hasQueryCache) {
        // Fast load for returning visitors
        setIsLoading(false);
      } else {
        // Immediate load for first-time visitors (removed artificial delay)
        setIsLoading(false);
      }
    };

    checkCache();
  }, []);

  return (
    <PersistQueryClientProvider 
      client={queryClient} 
      persistOptions={{ persister }}
    >
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <ThemeApplicator />
        <TooltipProvider>
          <Toaster />
          <Sonner />
          
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ScrollRestoration />
            <ErrorBoundary>
              <Suspense fallback={null}> 
                <Routes>
                  {/* Admin Routes (Outside Maintenance Guard) */}
                  <Route path="/admin/login" element={<LoginPage />} />
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Navigate to="dashboard" />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="messages" element={<MessagesPage />} />
                    
                    {/* Projects */}
                    <Route path="projects" element={<ProjectList />} />
                    <Route path="projects/new" element={<ProjectForm />} />
                    <Route path="projects/edit/:id" element={<ProjectForm />} />

                    {/* Skills */}
                    <Route path="skills" element={<SkillList />} />

                    {/* Education */}
                    <Route path="education" element={<EducationList />} />
                    <Route path="education/new" element={<EducationForm />} />
                    <Route path="education/:id" element={<EducationForm />} />

                    {/* Certificates */}
                    <Route path="certificates" element={<CertificateList />} />
                    <Route path="certificates/new" element={<CertificateForm />} />
                    <Route path="certificates/edit/:id" element={<CertificateForm />} />

                    {/* Communication */}
                    <Route path="communication/wa" element={<WATemplateList />} />

                    {/* Blog */}
                    <Route path="blog" element={<BlogListAdmin />} />
                    <Route path="blog/new" element={<BlogFormAdmin />} />
                    <Route path="blog/edit/:id" element={<BlogFormAdmin />} />
                    <Route path="blog/comments" element={<CommentList />} />
                    
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="about-content" element={<AboutContentPage />} />
                    <Route path="experience" element={<ExperienceList />} />
                    <Route path="experience/new" element={<ExperienceForm />} />
                    <Route path="experience/edit/:id" element={<ExperienceForm />} />
                    <Route path="ai-settings" element={<AISettingsPage />} />
                    <Route path="cloudinary" element={<CloudinaryPage />} />
                    <Route path="export-pdf" element={<ExportPdfPage />} />

                    {/* Add more admin routes here */}
                  </Route>

                  {/* Public Routes (Inside Maintenance Guard) */}
                  <Route path="/*" element={
                    <MaintenanceGuard>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/blog" element={<BlogList />} />
                        <Route path="/blog/:slug" element={<BlogDetail />} />
                        <Route path="/project/:id" element={<ProjectDetail />} />
                        
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                      {/* Global Floating Elements */}
                      <FloatingWhatsApp />
                      <ScrollToTop />
                    </MaintenanceGuard>
                  } />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </PersistQueryClientProvider>
  );
};

export default App;
