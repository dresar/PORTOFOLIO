import { useTranslation } from 'react-i18next';
import dbEn from '@/locales/db_en.json';

export function useLocalizedContent() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';

  const getProfile = (profile: any) => {
    if (!profile || !isEn) return profile;
    const trans = (dbEn as any).profile || {};
    return {
      ...profile,
      greeting: trans.greeting || profile.greeting,
      bio: trans.bio || profile.bio,
      shortBio: trans.shortBio || profile.shortBio,
      role: trans.role || profile.role,
    };
  };

  const getProject = (project: any) => {
    if (!project || !isEn) return project;
    const trans = (dbEn as any).projects?.[project.id] || {};
    return {
      ...project,
      title: trans.title || project.title,
      description: trans.description || project.description,
      content: trans.content || project.content,
    };
  };

  const getProjects = (projects: any[]) => {
    if (!projects || !isEn) return projects;
    return projects.map(getProject);
  };

  const getExperience = (exp: any) => {
    if (!exp || !isEn) return exp;
    const trans = (dbEn as any).experiences?.[exp.id] || {};
    return {
      ...exp,
      role: trans.role || exp.role,
      company: trans.company || exp.company,
      description: trans.description || exp.description,
    };
  };

  const getExperiences = (exps: any[]) => {
    if (!exps || !isEn) return exps;
    return exps.map(getExperience);
  };

  const getEducation = (edu: any) => {
    if (!edu || !isEn) return edu;
    const trans = (dbEn as any).educations?.[edu.id] || {};
    return {
      ...edu,
      degree: trans.degree || edu.degree,
      field: trans.field || edu.field,
      description: trans.description || edu.description,
    };
  };

  const getEducations = (edus: any[]) => {
    if (!edus || !isEn) return edus;
    return edus.map(getEducation);
  };

  const getCertificate = (cert: any) => {
    if (!cert || !isEn) return cert;
    const trans = (dbEn as any).certificates?.[cert.id] || {};
    return {
      ...cert,
      name: trans.name || cert.name,
      issuer: trans.issuer || cert.issuer,
    };
  };

  const getCertificates = (certs: any[]) => {
    if (!certs || !isEn) return certs;
    return certs.map(getCertificate);
  };

  const getBlogPost = (post: any) => {
    if (!post || !isEn) return post;
    const trans = (dbEn as any).blog_posts?.[post.id] || {};
    return {
      ...post,
      title: trans.title || post.title,
      excerpt: trans.excerpt || post.excerpt,
    };
  };

  const getBlogPosts = (posts: any[]) => {
    if (!posts || !isEn) return posts;
    return posts.map(getBlogPost);
  };

  return {
    isEn,
    getProfile,
    getProject,
    getProjects,
    getExperience,
    getExperiences,
    getEducation,
    getEducations,
    getCertificate,
    getCertificates,
    getBlogPost,
    getBlogPosts,
  };
}
