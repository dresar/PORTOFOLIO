import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import CountUp from 'react-countup';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useExperience } from '@/hooks/useExperience';
import { useProjects } from '@/hooks/useProjects';
import { useCertificates } from '@/hooks/useCertificates';
import { useSkills } from '@/hooks/useSkills';
import { useSocialLinks } from '@/hooks/useSocialLinks';
import { normalizeMediaUrl, sanitizeHtmlContent, safeUrl } from '@/lib/utils';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { useLocalizedContent } from '@/hooks/useLocalizedContent';

export const AboutSection = () => {
  const { t, i18n } = useTranslation();
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });
  const { profile: rawProfile } = useProfile();
  const { getProfile } = useLocalizedContent();
  const profile = getProfile(rawProfile);
  const { experiences = [], isLoading } = useExperience();
  const { projects = [] } = useProjects();
  const { certificates = [] } = useCertificates();
  const { skills = [] } = useSkills();
  
  // Use backend counts if available (injected by ProfileViewSet), otherwise fallback to array length
  // Use a safer fallback that checks if arrays are loaded
  const safeCertCount = certificates ? certificates.length : 0;
  const safeSkillCount = skills ? skills.length : 0;

  const certificateCount = (profile as any)?.total_certificates !== undefined 
    ? (profile as any).total_certificates 
    : safeCertCount;
    
  const skillCount = (profile as any)?.total_skills !== undefined 
    ? (profile as any).total_skills 
    : safeSkillCount;
  const [isExpanded, setIsExpanded] = useState(false);
  const { socialLinks = [] } = useSocialLinks();

  // Determine localized content
  const currentLang = i18n.language === 'en' ? 'en' : 'id';
  
  // Use bio for detailed about section
  const longDesc = profile?.bio;
  const rawTextContent = (longDesc || '').replace(/<[^>]*>/g, '').trim();
  const shouldTruncateOnMobile = rawTextContent.length > 100;

  // About Image logic
  const rawAboutImage = profile?.aboutImageFile || profile?.aboutImage;
  const aboutImage = normalizeMediaUrl(rawAboutImage);

  // Calculate years of experience
  const startYear = experiences.length > 0 
    ? Math.min(...experiences.map((exp: any) => new Date(exp.startDate).getFullYear()))
    : new Date().getFullYear();
  
  // Helper to safely parse stats
  const parseStat = (val: string | null | undefined) => {
    if (!val) return 0;
    // Extract first number found
    const match = String(val).match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };

  // Use manual stats if available, otherwise fallback to calculated
  const manualYearsExp = parseStat(profile?.stats_exp_years);
  const calculatedYearsExp = new Date().getFullYear() - startYear;
  const yearsExperience = manualYearsExp > 0 ? manualYearsExp : calculatedYearsExp;

  const manualProjectCount = parseStat(profile?.stats_project_count);
  const projectCount = manualProjectCount > 0 ? manualProjectCount : projects.length;

  const stats = [
    { id: 1, label: t('hero.years_experience'), value: yearsExperience, suffix: "+" },
    { id: 2, label: t('hero.projects_completed'), value: projectCount, suffix: "+" },
    { id: 3, label: t('nav.certificates'), value: certificates.length, suffix: "" },
    { id: 4, label: t('nav.skills'), value: skills.length, suffix: "+" },
  ];

  const scrollToProjects = () => {
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="about" className="py-6 md:py-8 relative" ref={ref}>
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center">
          {/* Image Side */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative aspect-[4/5] max-w-[270px] sm:max-w-[300px] md:max-w-[320px] mx-auto">
              {/* Main Image Container */}
              <div className="relative w-full h-full rounded-2xl overflow-hidden glass border border-border/60 shadow-xl">
                {aboutImage ? (
                   <img 
                    src={aboutImage} 
                    alt={profile?.fullName || "About Profile"} 
                    className="w-full h-full object-cover object-top"
                    loading="lazy"
                   />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-card">
                    <div className="text-center">
                      <div className="w-24 h-24 mx-auto mb-3 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-3xl font-bold text-primary">
                          {profile?.fullName?.substring(0, 2).toUpperCase() || "ME"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Foto Profil</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Floating Stats - Certifications */}
              <div
                className="absolute -left-3 sm:-left-4 top-8 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl glass border border-border/50 shadow-md z-20"
                style={{ animation: 'floatBadgeUp 3s ease-in-out infinite' }}
                aria-hidden="true"
              >
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-primary leading-tight">
                    {inView ? <CountUp end={certificateCount} duration={2.5} /> : 0}
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-tight">{t('nav.certificates') || "Sertifikasi"}</p>
                </div>
              </div>

              {/* Floating Stats - Skills */}
              <div
                className="absolute -right-3 sm:-right-4 bottom-8 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl glass border border-border/50 shadow-md z-20"
                style={{ animation: 'floatBadgeDown 4s 0.5s ease-in-out infinite' }}
                aria-hidden="true"
              >
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-primary leading-tight">
                    {inView ? <CountUp end={skillCount} duration={2.5} /> : 0}+
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-tight">{t('nav.skills') || "Keahlian"}</p>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-3 -right-3 w-16 h-16 border border-primary/30 rounded-xl -z-10 pointer-events-none" />
              <div className="absolute -bottom-3 -left-3 w-20 h-20 bg-primary/10 rounded-xl blur-xl -z-10 pointer-events-none" />
            </div>
          </motion.div>

          {/* Text Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-6">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-3">
                {t('sections.about.title')}
              </h2>
              <p className="text-muted-foreground text-lg">
                {t('sections.about.subtitle')}
              </p>
            </div>
            
            {/* Bio Description with Mobile Truncation and "Selengkapnya" Toggle */}
            <div className="relative mb-4 sm:mb-6">
              <div 
                className={`text-muted-foreground text-sm sm:text-base leading-relaxed prose dark:prose-invert transition-all duration-300 ${
                  !isExpanded ? 'max-h-[110px] md:max-h-none overflow-hidden' : ''
                }`}
                dangerouslySetInnerHTML={{ __html: sanitizeHtmlContent(longDesc || '') }}
              />

              {/* Mobile Gradient Fade when collapsed */}
              {!isExpanded && shouldTruncateOnMobile && (
                <div className="md:hidden absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
              )}
            </div>

            {/* Mobile Toggle Button */}
            {shouldTruncateOnMobile && (
              <div className="md:hidden flex justify-start mb-6 -mt-2">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/20 transition-all active:scale-95 cursor-pointer shadow-sm"
                >
                  <span>
                    {isExpanded 
                      ? (t('common.show_less') && t('common.show_less') !== 'common.show_less' ? t('common.show_less') : 'Tutup')
                      : (t('common.read_more') && t('common.read_more') !== 'common.read_more' ? t('common.read_more') : 'Selengkapnya')
                    }
                  </span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}

            {/* Social Icons */}
            <div className="flex items-center gap-3 flex-wrap mb-8">
              {socialLinks.map((social: any, index: number) => {
                const platformName = social.platform || social.icon || 'Social';
                const isEmail = social.icon === 'email' || String(social.platform).toLowerCase() === 'email' || String(social.url).startsWith('mailto:');
                return (
                  <motion.a
                    key={social.id || index}
                    href={isEmail ? (social.url.startsWith('mailto:') ? social.url : `mailto:${social.url}`) : safeUrl(social.url)}
                    target={isEmail ? undefined : '_blank'}
                    rel="noopener noreferrer"
                    aria-label={`${platformName}`}
                    className="w-11 h-11 rounded-full glass border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 bg-card/40 backdrop-blur-md"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <SocialIcon platform={social.platform} icon={social.icon} url={social.url} size={20} />
                  </motion.a>
                );
              })}
            </div>

            {/* Stats */}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
