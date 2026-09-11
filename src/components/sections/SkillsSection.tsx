import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useSkills } from '@/hooks/useSkills';
import { skillCategoriesAPI } from '@/services/api';
import { normalizeMediaUrl } from '@/lib/utils';
import { TiltedCard } from '@/components/effects/Cards';
import { Code2, Palette, Users, Globe, Database, Cloud } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface SkillCategory {
  id: number;
  name: string;
  slug: string;
  order?: number;
}

const getIconForCategory = (slug: string) => {
  if (!slug) return Code2;
  const s = String(slug).toLowerCase();
  if (s.includes('front') || s.includes('back') || s.includes('dev')) return Code2;
  if (s.includes('design') || s.includes('ui') || s.includes('ux')) return Palette;
  if (s.includes('soft')) return Users;
  if (s.includes('lang')) return Globe;
  if (s.includes('data')) return Database;
  if (s.includes('cloud') || s.includes('ops')) return Cloud;
  return Code2;
};

export const SkillsSection = () => {
  const { t } = useTranslation();
  const { skills = [], isLoading: isSkillsLoading, isError: isSkillsError } = useSkills();
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });
  const [selectedSkill, setSelectedSkill] = useState<any | null>(null);
  
  const { data: categories = [], isLoading: isCategoriesLoading, isError: isCategoriesError } = useQuery({
    queryKey: ['skillCategories'],
    queryFn: async () => {
      const data = await skillCategoriesAPI.getAll();
      return data;
    },
    retry: 0,
    staleTime: 300000,
  });

  const fallbackCategories: SkillCategory[] = [
    { id: 1, name: 'Frontend', slug: 'frontend' },
    { id: 2, name: 'Backend', slug: 'backend' },
    { id: 3, name: 'DevOps', slug: 'devops' },
    { id: 4, name: 'Tools', slug: 'tools' },
    { id: 5, name: 'Fullstack', slug: 'fullstack' },
    { id: 6, name: 'Mobile', slug: 'mobile' },
    { id: 7, name: 'Database', slug: 'database' },
    { id: 8, name: 'UI/UX', slug: 'uiux' },
  ];
  const effectiveCategories: SkillCategory[] = useMemo(() => {
    if (categories && categories.length > 0) {
      return [...categories].sort((a: any, b: any) => {
        const orderA = a.order ?? 0;
        const orderB = b.order ?? 0;
        if (orderA !== orderB) return orderA - orderB;
        return a.id - b.id;
      });
    }
    return fallbackCategories;
  }, [categories]);

  const [activeTab, setActiveTab] = useState<number | null>(null);

  // Set initial active tab when categories are loaded
  useEffect(() => {
    if (effectiveCategories.length > 0 && activeTab === null) {
      setActiveTab(effectiveCategories[0].id);
    }
  }, [effectiveCategories, activeTab]);

  const filteredSkills = useMemo(() => {
    if (!activeTab) return [];
    
    // Find the current category object based on activeTab ID
    const currentCategory = effectiveCategories.find((c: any) => c.id === activeTab);
    if (!currentCategory) return [];

    const list = skills.filter((skill: any) => {
      if (typeof skill.category === 'object' && skill.category !== null) {
        return skill.category.id === activeTab || skill.category.name === currentCategory.name;
      }
      if (typeof skill.category === 'string') {
        return (skill.category || '').toLowerCase() === (currentCategory.name || '').toLowerCase();
      }
      if (typeof skill.category === 'number') return skill.category === activeTab;
      if (typeof (skill as any).categoryId === 'number') return (skill as any).categoryId === activeTab;
      return false;
    });

    return [...list].sort((a: any, b: any) => (Number(a.id) || 0) - (Number(b.id) || 0));
  }, [skills, activeTab, effectiveCategories]);

  if ((isSkillsLoading && !isSkillsError) || (isCategoriesLoading && !isCategoriesError)) {
    return (
      <section id="skills" className="py-6 md:py-8 relative bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <Skeleton className="h-8 w-44 mx-auto mb-2" />
            <Skeleton className="h-4 w-72 mx-auto" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="p-4 rounded-xl border border-border/30 bg-card/40 flex flex-col items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-2 w-20 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="skills" className="py-6 md:py-8 relative bg-card/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-3">
            {t('sections.skills.title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('sections.skills.subtitle')}
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {effectiveCategories.map((category) => {
            const Icon = getIconForCategory(category.slug);
            return (
              <motion.button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === category.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="w-4 h-4" />
                {category.name}
              </motion.button>
            );
          })}
        </div>

        {/* Skills Grid */}
        <div ref={ref} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-16">
          {filteredSkills.length > 0 ? (
            filteredSkills.map((skill, index) => (
              <TiltedCard key={skill.id}>
                <div className="p-4 rounded-xl bg-card border border-border h-full hover:border-primary/50 transition-colors">
                  <div className="flex flex-col items-center text-center gap-2 mb-3">
                    {skill.logo_url ? (
                      <img
                        src={normalizeMediaUrl(skill.logo_url, { width: 96 })}
                        alt={skill.name}
                        width={48}
                        height={48}
                        className="h-12 w-12 object-contain cursor-pointer hover:scale-110 active:scale-95 transition-all duration-200"
                        loading="lazy"
                        decoding="async"
                        onClick={() => setSelectedSkill(skill)}
                        onError={(e) => {
                          e.currentTarget.src = 'https://placehold.co/64x64/png?text=Logo';
                        }}
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-secondary/50 flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all duration-200" onClick={() => setSelectedSkill(skill)}>
                        {(() => {
                          const slugVal = typeof skill.category === 'object' && skill.category ? skill.category.slug : 
                                          typeof skill.category === 'string' ? skill.category : '';
                          const DefaultIcon = getIconForCategory(slugVal);
                          return <DefaultIcon className="h-6 w-6 text-muted-foreground" />;
                        })()}
                      </div>
                    )}
                    <h3 className="font-semibold text-base">{skill.name}</h3>
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground">
                      {(() => {
                        if (typeof skill.category === 'object' && skill.category !== null) return skill.category.name || 'Unknown';
                        if (typeof skill.category === 'string') return skill.category || 'Unknown';
                        const idVal = typeof skill.category === 'number' ? skill.category : (skill as any).categoryId;
                        const found = effectiveCategories.find((c: any) => c.id === idVal);
                        return found ? found.name : 'Unknown';
                      })()}
                    </span>
                    <span className="text-primary font-bold text-sm">{skill.percentage}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden w-full">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary to-[hsl(180,80%,50%)] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: inView ? `${skill.percentage}%` : 0 }}
                      transition={{ duration: 1, delay: index * 0.05, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </TiltedCard>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              {t('skills.no_skills')}
            </div>
          )}
        </div>

        {/* Skill Logo Modal */}
        <AnimatePresence>
          {selectedSkill && (
            <div 
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm cursor-pointer"
              onClick={() => setSelectedSkill(null)}
            >
              <motion.div 
                className="relative max-w-[350px] w-full bg-card border border-border p-8 rounded-3xl flex flex-col items-center shadow-2xl cursor-default text-center"
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ type: "spring", duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  className="absolute top-3.5 right-3.5 text-muted-foreground hover:text-foreground hover:bg-muted p-1.5 rounded-full transition-colors"
                  onClick={() => setSelectedSkill(null)}
                  aria-label="Close modal"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="w-40 h-40 flex items-center justify-center bg-muted/30 p-4 rounded-2xl mb-5 border border-border/30">
                  {selectedSkill.logo_url ? (
                    <img 
                      src={normalizeMediaUrl(selectedSkill.logo_url, { width: 160 })} 
                      alt={selectedSkill.name} 
                      className="max-w-full max-h-full object-contain hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = 'https://placehold.co/128x128/png?text=Logo';
                      }}
                    />
                  ) : (
                    (() => {
                      const slugVal = typeof selectedSkill.category === 'object' && selectedSkill.category ? selectedSkill.category.slug : 
                                      typeof selectedSkill.category === 'string' ? selectedSkill.category : '';
                      const DefaultIcon = getIconForCategory(slugVal);
                      return <DefaultIcon className="w-16 h-16 text-muted-foreground" />;
                    })()
                  )}
                </div>

                <h3 className="font-bold text-lg mb-1">{selectedSkill.name}</h3>
                <div className="flex gap-2 items-center justify-center text-xs text-muted-foreground">
                  <span className="px-2 py-0.5 rounded-full bg-muted border border-border/40">
                    {(() => {
                      if (typeof selectedSkill.category === 'object' && selectedSkill.category !== null) return selectedSkill.category.name || 'Unknown';
                      if (typeof selectedSkill.category === 'string') return selectedSkill.category || 'Unknown';
                      const idVal = typeof selectedSkill.category === 'number' ? selectedSkill.category : (selectedSkill as any).categoryId;
                      const found = effectiveCategories.find((c: any) => c.id === idVal);
                      return found ? found.name : 'Unknown';
                    })()}
                  </span>
                  <span className="font-semibold text-primary">{selectedSkill.percentage}%</span>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
