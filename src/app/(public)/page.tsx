import React from 'react';
import { db } from '@/db';
import {
  profiles,
  educations,
  skills,
  projects,
  experiences,
  certificates,
} from '@/db/schema';
import { eq, asc, desc } from 'drizzle-orm';
import { HeroSection } from '@/components/public/hero-section';
import { AboutSection } from '@/components/public/about-section';
import { EducationSection } from '@/components/public/education-section';
import { SkillsSection } from '@/components/public/skills-section';
import { ProjectsSection } from '@/components/public/projects-section';
import { ExperienceSection } from '@/components/public/experience-section';
import { CertificatesSection } from '@/components/public/certificates-section';
import { ContactSection } from '@/components/public/contact-section';

// Server Component with on-demand revalidation
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [
    profileList,
    allEducations,
    allSkills,
    allProjects,
    allExperiences,
    allCertificates,
  ] = await Promise.all([
    db.select().from(profiles).limit(1),
    db
      .select()
      .from(educations)
      .where(eq(educations.isPublished, true))
      .orderBy(asc(educations.orderIndex), desc(educations.createdAt)),
    db
      .select()
      .from(skills)
      .where(eq(skills.isPublished, true))
      .orderBy(asc(skills.orderIndex), asc(skills.name)),
    db
      .select()
      .from(projects)
      .where(eq(projects.isPublished, true))
      .orderBy(asc(projects.orderIndex), desc(projects.createdAt)),
    db
      .select()
      .from(experiences)
      .where(eq(experiences.isPublished, true))
      .orderBy(asc(experiences.orderIndex), desc(experiences.createdAt)),
    db
      .select()
      .from(certificates)
      .where(eq(certificates.isPublished, true))
      .orderBy(asc(certificates.orderIndex), desc(certificates.createdAt)),
  ]);

  const profile = profileList[0] || null;

  return (
    <div className="flex flex-col">
      <HeroSection profile={profile} />
      <AboutSection
        profile={profile}
        projectCount={allProjects.length}
        skillCount={allSkills.length}
        certCount={allCertificates.length}
      />
      <EducationSection educations={allEducations} />
      <SkillsSection skills={allSkills} />
      <ProjectsSection projects={allProjects} />
      <ExperienceSection experiences={allExperiences} />
      <CertificatesSection certificates={allCertificates} />
      <ContactSection profile={profile} />
    </div>
  );
}
