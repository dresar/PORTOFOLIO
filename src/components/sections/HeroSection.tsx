import { motion } from 'framer-motion';
import { Download, ArrowRight, CheckCircle, Briefcase } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ParticlesBackground } from '@/components/effects/ParticlesBackground';
import { TypewriterText } from '@/components/effects/TypewriterText';
import { ShinyButton, BorderBeamButton } from '@/components/effects/Buttons';
import { useProfile } from '@/hooks/useProfile';
import { useSocialLinks } from '@/hooks/useSocialLinks';
import { Loader2 } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { normalizeMediaUrl, sanitizeHtmlContent, safeUrl } from '@/lib/utils';
import { useExperience } from '@/hooks/useExperience';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { useLocalizedContent } from '@/hooks/useLocalizedContent';

export const HeroSection = () => {
  const { t, i18n } = useTranslation();
  const { profile: rawProfile, isLoading: profileLoading } = useProfile();
  const { getProfile } = useLocalizedContent();
  const profile = getProfile(rawProfile);
  const { socialLinks = [], isLoading: linksLoading } = useSocialLinks();
  const { projects = [] } = useProjects();
  const { experiences = [] } = useExperience();

  const scrollToProjects = () => {
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (profileLoading || linksLoading) {
    // Show a skeleton or loading state that isn't black screen
    return (
        <section id="home" className="relative min-h-[80vh] flex items-center overflow-hidden pt-16">
            <div className="container mx-auto px-4 py-8 relative z-10 flex flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary opacity-50" />
                <p className="text-muted-foreground mt-4 text-sm animate-pulse">{t('common.loading')}</p>
            </div>
        </section>
    );
  }

  // Determine localized content
  const currentLang = i18n.language === 'en' ? 'en' : 'id';
  
  // Use HomeContent if available, otherwise fallback to Profile or defaults
  const greeting = profile?.greeting;
  const shortBio = profile?.shortBio || t('hero.description_default');

  // Parse roles
  let roles: string[] = ['Developer', 'Designer'];
  const rolesSource = profile?.role;

  try {
    if (rolesSource) {
      if (Array.isArray(rolesSource)) {
        roles = rolesSource;
      } else if (typeof rolesSource === 'string' && rolesSource.startsWith('[')) {
        roles = JSON.parse(rolesSource);
      } else {
        roles = [rolesSource as string];
      }
    }
  } catch (e) {
    console.error('Failed to parse roles', e);
    roles = ['Developer'];
  }
  
  // Hero Image logic
  const heroImageRaw = profile?.heroImageFile || profile?.heroImage;
  const heroImage = normalizeMediaUrl(heroImageRaw, { width: 600 });

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

  const manualYearsExp = parseStat(profile?.stats_exp_years);
  const calculatedYearsExp = new Date().getFullYear() - startYear;
  const yearsExperience = manualYearsExp > 0 ? manualYearsExp : calculatedYearsExp;

  const manualProjectCount = parseStat(profile?.stats_project_count);
  const projectCount = manualProjectCount > 0 ? manualProjectCount : projects.length;

  return (
    <section id="home" className="relative min-h-[80vh] flex items-center overflow-hidden pt-16">
      <ParticlesBackground />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left Side - Text Content */}
          <motion.div
            className="order-2 lg:order-1 text-center lg:text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Greeting */}
            <motion.p
              className="text-lg md:text-xl text-muted-foreground mb-4 flex items-center justify-center lg:justify-start gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {greeting || t('hero.greeting')} <span className="text-2xl">👋</span>
            </motion.p>

            {/* Name with Gradient */}
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-heading font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                {profile?.fullName || "Eka Syarif Maulana, S.Kom"}
              </span>
            </motion.h1>

            {/* Role with Typewriter Effect */}
            <motion.div
              className="text-xl md:text-2xl lg:text-3xl font-heading font-medium text-muted-foreground mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <TypewriterText 
                texts={roles.length > 0 ? roles : [t('hero.role_default')]} 
              />
            </motion.div>

            {/* Description */}
            <motion.div
              className="text-muted-foreground text-base md:text-lg max-w-lg mx-auto lg:mx-0 mb-8 prose prose-invert"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              dangerouslySetInnerHTML={{ __html: sanitizeHtmlContent(shortBio) }}
            />

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {(profile?.resumeFile || profile?.resumeUrl) && (
                <a href={safeUrl(profile.resumeFile || profile.resumeUrl)} target="_blank" rel="noopener noreferrer">
                  <ShinyButton variant="primary">
                    <Download className="w-4 h-4 mr-2 inline" />
                    {t('hero.download_resume')}
                  </ShinyButton>
                </a>
              )}
              <BorderBeamButton onClick={scrollToProjects}>
                {t('hero.view_work')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </BorderBeamButton>
            </motion.div>

            {/* Social Icons */}
            <motion.div
              className="flex items-center justify-center lg:justify-start gap-3 flex-wrap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              {(Array.isArray(socialLinks) ? socialLinks : []).map((social: any, index: number) => {
                const platformName = social.platform || social.icon || 'Social';
                const isEmail = social.icon === 'email' || String(social.platform).toLowerCase() === 'email' || String(social.url).startsWith('mailto:');
                const rawUrl = isEmail ? (social.url?.startsWith('mailto:') ? social.url : `mailto:${social.url}`) : social.url;
                return (
                  <motion.a
                    key={social.id || index}
                    href={safeUrl(rawUrl)}
                    target={isEmail ? undefined : '_blank'}
                    rel="noopener noreferrer"
                    aria-label={`${platformName}`}
                    className="w-11 h-11 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                  >
                    <SocialIcon platform={social.platform} icon={social.icon} url={social.url} size={20} />
                  </motion.a>
                );
              })}
            </motion.div>
          </motion.div>

          {/* Right Side - Image with Floating Badges */}
          <motion.div
            className="order-1 lg:order-2 relative flex items-center justify-center my-4 lg:my-0"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Glow Effect Behind Image */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
              <div
                className="w-56 h-56 sm:w-64 sm:h-64 lg:w-72 lg:h-72 rounded-full"
                style={{
                  background: 'radial-gradient(circle, hsl(var(--primary) / 0.22), hsl(var(--accent) / 0.12), transparent 70%)',
                  filter: 'blur(50px)',
                }}
              />
            </div>

            {/* Compact Photo Card with Integrated Border Beam */}
            <div className="relative w-56 sm:w-64 md:w-72 lg:w-[290px] aspect-[4/5] group">
              {/* Border Beam Animation — exact card bounds */}
              <div
                className="absolute -inset-[2px] rounded-2xl sm:rounded-3xl border-beam-spin pointer-events-none"
                style={{
                  background: 'conic-gradient(from 0deg, transparent, hsl(var(--primary)), transparent 30%)',
                  padding: '2px',
                }}
                aria-hidden="true"
              >
                <div className="w-full h-full rounded-2xl sm:rounded-3xl bg-background/50 backdrop-blur-xs" />
              </div>

              {/* Main Image Container */}
              <motion.div
                className="relative w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden border border-border/60 bg-card shadow-xl z-10"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.25 }}
              >
                {heroImage ? (
                  <img
                    src={heroImage}
                    alt={profile?.fullName || "Foto profil Eka Syarif Maulana"}
                    width={290}
                    height={362}
                    className="w-full h-full object-cover object-top"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-card text-muted-foreground">
                    <div className="text-center">
                      <span className="text-5xl font-bold opacity-20">
                        {profile?.fullName?.substring(0, 2).toUpperCase() || "??"}
                      </span>
                    </div>
                  </div>
                )}
                {/* Subtle Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent pointer-events-none" />
              </motion.div>

              {/* Floating Badge - Top Right */}
              <div
                className="absolute -top-3 -right-3 sm:-top-3.5 sm:-right-3.5 glass-strong px-3 py-2 rounded-xl z-20 shadow-md border border-border/60 flex items-center gap-2"
                style={{ animation: 'floatBadgeUp 3s ease-in-out infinite' }}
                aria-hidden="true"
              >
                <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center text-primary shrink-0">
                  <CheckCircle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground leading-tight">
                    {projectCount}+
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-tight">{t('hero.projects_completed') || "Proyek"}</p>
                </div>
              </div>

              {/* Floating Badge - Bottom Left */}
              <div
                className="absolute -bottom-3 -left-3 sm:-bottom-3.5 sm:-left-3.5 glass-strong px-3 py-2 rounded-xl z-20 shadow-md border border-border/60 flex items-center gap-2"
                style={{ animation: 'floatBadgeDown 3.5s 0.5s ease-in-out infinite' }}
                aria-hidden="true"
              >
                <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center text-accent shrink-0">
                  <Briefcase className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground leading-tight">
                    {yearsExperience}+
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-tight">{t('hero.years_experience') || "Pengalaman"}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
