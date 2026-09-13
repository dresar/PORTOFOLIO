import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Github, ArrowRight, Loader2, AlertCircle, Sparkles, Eye, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useProjects } from '@/hooks/useProjects';
import { useProjectCategories } from '@/hooks/useProjectCategories';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AISummaryModal } from '@/components/ui/AISummaryModal';
import { normalizeMediaUrl, safeUrl } from '@/lib/utils';
import { getLocalizedPath } from '@/lib/i18nNavigation';
import { useLocalizedContent } from '@/hooks/useLocalizedContent';

export const ProjectsSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { categories } = useProjectCategories();
  const [activeFilter, setActiveFilter] = useState<number | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [summaryProject, setSummaryProject] = useState<any>(null);
  const [summaryIndex, setSummaryIndex] = useState(0);
  const [viewedProjects, setViewedProjects] = useState<number[]>([]);
  const itemsPerPage = 16;
  const { projects: rawProjects = [], isLoading, isError } = useProjects();
  const { getProjects } = useLocalizedContent();
  const projects = useMemo(() => getProjects(rawProjects), [rawProjects, getProjects]);

  const filters = useMemo(() => [
    { id: 'all', label: t('projects.all_projects') },
    ...(categories || []).map((c: any) => ({ id: c.id, label: c.name }))
  ], [categories, t]);

  const filteredProjects = projects.filter((project: any) =>
    activeFilter === 'all' 
      ? true 
      : (project.categoryId === activeFilter || project.category?.id === activeFilter)
  );

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const displayedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFilterChange = (filterId: number | 'all') => {
    setActiveFilter(filterId);
    setCurrentPage(1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      const section = document.getElementById('projects');
      if (section) section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      const section = document.getElementById('projects');
      if (section) section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <section id="projects" className="py-6 md:py-8 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <Skeleton className="h-8 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-80 mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border/30 p-4 space-y-3 bg-card/40">
                <Skeleton className="h-44 w-full rounded-lg" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section id="projects" className="py-6 md:py-12 relative flex flex-col justify-center items-center text-center px-4">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-xl font-semibold mb-2">{t('common.error')}</h3>
        <p className="text-muted-foreground mb-6">{t('common.error')}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          {t('common.retry')}
        </Button>
      </section>
    );
  }

  const hasAIInsights = (project: any) => {
    try {
      let parsed = project.summaries;
      if (!parsed) return false;
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      return Array.isArray(parsed) && parsed.length > 0;
    } catch (e) {
      return false;
    }
  };

  return (
    <section id="projects" className="py-6 md:py-8 relative bg-card/50 dark:bg-transparent">
      {/* Background Decoration */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-3">
            {t('sections.projects.title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('sections.projects.subtitle')}
          </p>
        </motion.div>

        <div className="sm:hidden w-full max-w-[260px] mx-auto mb-6">
          <Select 
            value={String(activeFilter)} 
            onValueChange={(val) => handleFilterChange(val === 'all' ? 'all' : Number(val))}
          >
            <SelectTrigger className="h-9 w-full rounded-lg border-border/70 bg-card/90 backdrop-blur text-xs font-medium shadow-sm hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-2 min-w-0">
                <Filter className="w-3.5 h-3.5 text-primary shrink-0" />
                <SelectValue placeholder={t('projects.all_projects')} />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/70 bg-popover/95 backdrop-blur-xl z-50 max-h-64 shadow-xl">
              {filters.map((filter) => (
                <SelectItem 
                  key={filter.id} 
                  value={String(filter.id)}
                  className="text-xs py-2 cursor-pointer font-medium"
                >
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="hidden sm:flex flex-wrap justify-center gap-1.5 md:gap-2 mb-8">
          {filters.map((filter) => (
            <motion.button
              key={filter.id}
              onClick={() => handleFilterChange(filter.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeFilter === filter.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {filter.label}
            </motion.button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {displayedProjects.map((project: any) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="group relative bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-all dark:bg-card/50 dark:border-border/50 bg-white shadow-sm hover:shadow-md"
              >
                {/* Image */}
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={normalizeMediaUrl(project.coverImage || project.thumbnail || project.image, { width: 600 })}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    decoding="async"
                  />
                  
                  {/* AI Summary Button - Top Right */}
                  {hasAIInsights(project) && (
                    <Button
                      size="icon"
                      variant={viewedProjects.includes(project.id) ? "default" : "secondary"}
                      className={`absolute top-2 right-2 z-20 h-8 w-8 rounded-full backdrop-blur-sm transition-colors shadow-sm ${
                          viewedProjects.includes(project.id) 
                              ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                              : "bg-background/80 hover:bg-primary hover:text-white"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        
                        // Mark as viewed if not already
                        if (!viewedProjects.includes(project.id)) {
                          setViewedProjects(prev => [...prev, project.id]);
                        }

                        // Parse summaries robustly
                        let parsedSums: any[] = [];
                        try {
                            if (typeof project.summaries === 'string') {
                                parsedSums = JSON.parse(project.summaries);
                            } else if (Array.isArray(project.summaries)) {
                                parsedSums = project.summaries;
                            }
                        } catch (e) { }

                        // Randomize index if summaries exist to show different variations
                        if (parsedSums && parsedSums.length > 0) {
                            const randomIndex = Math.floor(Math.random() * parsedSums.length);
                            setSummaryIndex(randomIndex);
                        } else {
                            setSummaryIndex(0);
                        }
                        setSummaryProject(project);
                      }}
                      title={viewedProjects.includes(project.id) ? t('projects.viewed_summary') : t('projects.ai_summary')}
                    >
                      <Sparkles className={`h-4 w-4 ${viewedProjects.includes(project.id) ? "fill-current" : ""}`} />
                    </Button>
                  )}

                  {/* Overlay with Detail Button */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 z-10 cursor-pointer" onClick={() => navigate(getLocalizedPath(`/project/${project.id}`))}>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="rounded-full hover:bg-primary hover:text-white transition-colors h-10 w-10"
                      onClick={(e) => {
                         e.stopPropagation();
                         navigate(getLocalizedPath(`/project/${project.id}`));
                      }}
                      title={t('projects.view_details')}
                    >
                      <Eye className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-1">{project.title}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                    {project.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(() => {
                        let techList: string[] = [];
                        try {
                            if (Array.isArray(project.tech)) {
                                techList = project.tech;
                            } else if (typeof project.tech === 'string') {
                                if (project.tech.startsWith('[')) {
                                    techList = JSON.parse(project.tech);
                                } else {
                                    techList = project.tech.split(',').map(t => t.trim());
                                }
                            }
                        } catch (e) {
                            console.warn("Failed to parse tech", project.tech);
                            techList = [];
                        }

                        return (
                           <>
                            {techList.slice(0, 3).map((tech: string, index: number) => (
                              <span
                                key={index}
                                className="text-xs px-2 py-1 bg-secondary rounded-md"
                              >
                                {tech}
                              </span>
                            ))}
                            {techList.length > 3 && (
                              <span className="text-xs px-2 py-1 bg-secondary rounded-md">
                                +{techList.length - 3}
                              </span>
                            )}
                           </>
                        )
                    })()}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/40 mt-3 gap-1.5">
                    <div className="flex items-center gap-1.5 shrink-0">
                      {(project.repo_urls?.length > 0 || project.repoUrl || project.github_url) && (
                        <Button
                          size="icon"
                          variant="outline"
                          className="rounded-lg hover:bg-black hover:text-white transition-colors h-8 w-8 border-border/70"
                          onClick={() => window.open(safeUrl(project.repo_urls?.[0] || project.repoUrl || project.github_url), '_blank', 'noopener,noreferrer')}
                          title={t('projects.repository')}
                        >
                          <Github className="h-3.5 w-3.5" />
                        </Button>
                      )}

                      {(project.demo_urls?.length > 0 || project.demoUrl || project.demo_url) && (
                        <Button
                          size="icon"
                          variant="outline"
                          className="rounded-lg hover:bg-blue-500 hover:text-white transition-colors h-8 w-8 border-border/70"
                          onClick={() => window.open(safeUrl(project.demo_urls?.[0] || project.demoUrl || project.demo_url), '_blank', 'noopener,noreferrer')}
                          title={t('projects.live_demo')}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate(getLocalizedPath(`/project/${project.id}`))}
                      className="w-full inline-flex h-8 items-center justify-center gap-1 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/20 text-[11px] sm:text-xs font-semibold transition-all duration-200 active:scale-[0.98] cursor-pointer group flex-1"
                    >
                      <span>{t('projects.view_details')}</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <AISummaryModal
          isOpen={!!summaryProject}
          onClose={() => setSummaryProject(null)}
          project={summaryProject}
          startIndex={summaryIndex}
        />

        {displayedProjects.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground">{t('projects.not_found')}</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6 sm:mt-8">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg border-border/70 bg-card hover:bg-muted active:scale-[0.96] transition-transform cursor-pointer"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              aria-label={t('common.previous')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center justify-center px-3 h-8 rounded-lg bg-muted/60 border border-border/50 text-xs font-medium select-none">
              <span className="text-foreground font-semibold">{currentPage}</span>
              <span className="mx-1 text-muted-foreground">/</span>
              <span className="text-muted-foreground">{totalPages}</span>
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg border-border/70 bg-card hover:bg-muted active:scale-[0.96] transition-transform cursor-pointer"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              aria-label={t('common.next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};
