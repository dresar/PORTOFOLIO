import { pgTable, uuid, varchar, text, boolean, integer, timestamp, jsonb, index } from 'drizzle-orm/pg-core';

export const adminUsers = pgTable('admin_users', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const profiles = pgTable('profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  fullName: varchar('full_name', { length: 150 }).default('Muhammad Fauzan Al Hafizh').notNull(),
  headline: varchar('headline', { length: 255 }).notNull(),
  bio: text('bio').notNull(),
  avatarUrl: text('avatar_url'),
  resumeUrl: text('resume_url'),
  location: varchar('location', { length: 100 }),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  githubUrl: text('github_url'),
  linkedinUrl: text('linkedin_url'),
  whatsappUrl: text('whatsapp_url'),
  isAvailable: boolean('is_available').default(true).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const educations = pgTable(
  'educations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    institution: varchar('institution', { length: 200 }).notNull(),
    degree: varchar('degree', { length: 100 }).notNull(),
    fieldOfStudy: varchar('field_of_study', { length: 150 }).notNull(),
    startDate: varchar('start_date', { length: 50 }).notNull(),
    endDate: varchar('end_date', { length: 50 }),
    isCurrent: boolean('is_current').default(false).notNull(),
    description: text('description'),
    orderIndex: integer('order_index').default(0).notNull(),
    isPublished: boolean('is_published').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_educations_order').on(table.isPublished, table.orderIndex),
  ]
);

export const skills = pgTable(
  'skills',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    category: varchar('category', { length: 100 }).notNull(),
    iconClass: varchar('icon_class', { length: 100 }).notNull(),
    proficiencyLevel: integer('proficiency_level').default(85).notNull(),
    orderIndex: integer('order_index').default(0).notNull(),
    isPublished: boolean('is_published').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_skills_cat_order').on(table.isPublished, table.category, table.orderIndex),
  ]
);

export const projects = pgTable(
  'projects',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: varchar('title', { length: 200 }).notNull(),
    slug: varchar('slug', { length: 220 }).notNull().unique(),
    description: text('description').notNull(),
    content: text('content'),
    thumbnailUrl: text('thumbnail_url'),
    technologies: jsonb('technologies').$type<string[]>().default([]).notNull(),
    demoUrl: text('demo_url'),
    repoUrl: text('repo_url'),
    isFeatured: boolean('is_featured').default(false).notNull(),
    orderIndex: integer('order_index').default(0).notNull(),
    isPublished: boolean('is_published').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_projects_order').on(table.isPublished, table.orderIndex),
  ]
);

export const experiences = pgTable(
  'experiences',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    company: varchar('company', { length: 200 }).notNull(),
    role: varchar('role', { length: 150 }).notNull(),
    employmentType: varchar('employment_type', { length: 50 }).default('Full-time').notNull(),
    location: varchar('location', { length: 100 }),
    startDate: varchar('start_date', { length: 50 }).notNull(),
    endDate: varchar('end_date', { length: 50 }),
    isCurrent: boolean('is_current').default(false).notNull(),
    description: text('description').notNull(),
    orderIndex: integer('order_index').default(0).notNull(),
    isPublished: boolean('is_published').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_experiences_order').on(table.isPublished, table.orderIndex),
  ]
);

export const certificates = pgTable(
  'certificates',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: varchar('title', { length: 200 }).notNull(),
    issuer: varchar('issuer', { length: 150 }).notNull(),
    issueDate: varchar('issue_date', { length: 50 }).notNull(),
    expirationDate: varchar('expiration_date', { length: 50 }),
    credentialId: varchar('credential_id', { length: 150 }),
    credentialUrl: text('credential_url'),
    imageUrl: text('image_url'),
    orderIndex: integer('order_index').default(0).notNull(),
    isPublished: boolean('is_published').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_certificates_order').on(table.isPublished, table.orderIndex),
  ]
);

export const contactMessages = pgTable(
  'contact_messages',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 150 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    subject: varchar('subject', { length: 255 }).notNull(),
    message: text('message').notNull(),
    isRead: boolean('is_read').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_messages_status').on(table.isRead, table.createdAt),
  ]
);

export type AdminUser = typeof adminUsers.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type Education = typeof educations.$inferSelect;
export type Skill = typeof skills.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Experience = typeof experiences.$inferSelect;
export type Certificate = typeof certificates.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
