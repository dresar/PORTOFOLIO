import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';

// Robust WebSocket configuration for Neon
try {
  // Handle different import scenarios for ws
  if (ws && typeof ws !== 'function' && (ws as any).WebSocket) {
     neonConfig.webSocketConstructor = (ws as any).WebSocket;
  } else {
     neonConfig.webSocketConstructor = ws;
  }
} catch (e) {
  console.error('Failed to configure WebSocket for Neon:', e);
}

import { 
  pgTable, serial, text, boolean, timestamp, integer, 
  pgEnum, varchar
} from 'drizzle-orm/pg-core';
import { relations, sql, eq, desc, asc, and, like, ilike, inArray } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import { IncomingMessage, ServerResponse } from 'http';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// --- 1. CONFIGURATION ---
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'e79c2980b182d8c39e23652f75a7c2b6941fa44a958e72ef0d3a57e3f94bd2d1';
const GITHUB_REPO = process.env.GITHUB_REPO || 'dresar/PORTOFOLIO';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
const GITHUB_UPLOADS_PATH = 'public/uploads';

interface TokenPayload {
  id: number;
  email: string;
  role: string;
  name?: string;
}

function verifyJwtToken(req: any): TokenPayload | null {
  try {
    const authHeader = req.headers?.authorization;
    if (!authHeader || typeof authHeader !== 'string') return null;
    const parts = authHeader.trim().split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') return null;
    const token = parts[1];
    if (!token || token === 'demo-token' || token === 'fake-jwt-token') return null;
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (err) {
    return null;
  }
}

function getClientIp(req: any): string {
  const forwarded = req.headers?.['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return String(req.socket?.remoteAddress || 'unknown');
}

// Allow lazy loading of DB_URL for tests
let pool: Pool;

const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 10;
function isRateLimited(ip: string) {
  const now = Date.now();
  const rec = loginAttempts.get(ip);
  if (!rec) return false;
  if (now > rec.resetAt) {
    loginAttempts.delete(ip);
    return false;
  }
  return rec.count >= MAX_ATTEMPTS;
}
function trackFailed(ip: string) {
  const now = Date.now();
  const rec = loginAttempts.get(ip);
  if (!rec) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  if (now > rec.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  rec.count += 1;
}
function clearAttempts(ip: string) {
  loginAttempts.delete(ip);
}

const getPool = () => {
    if (pool) return pool;
    const DB_URL = process.env.DATABASE_URL;
    if (!DB_URL) throw new Error('DATABASE_URL is not configured');
    
    // Enhanced configuration for Neon
    const isNeon = DB_URL && DB_URL.includes('neon.tech');

    let normalizedUrl = DB_URL;
    try {
      const u = new URL(DB_URL as string);
      // Remove unsupported channel binding for Node pg
      u.searchParams.delete('channel_binding');
      // Ensure libpq compatibility and SSL required
      if (!u.searchParams.has('uselibpqcompat')) u.searchParams.set('uselibpqcompat', 'true');
      if (!u.searchParams.has('sslmode')) u.searchParams.set('sslmode', 'require');
      normalizedUrl = u.toString();
    } catch {
      // Fallback if URL parsing fails: append compat flags safely
      const hasQuery = (DB_URL || '').includes('?');
      const sep = hasQuery ? '&' : '?';
      normalizedUrl = `${DB_URL}${sep}uselibpqcompat=true&sslmode=require`;
    }
    
    pool = new Pool({
      connectionString: normalizedUrl,
      connectionTimeoutMillis: 60000,
      idleTimeoutMillis: 10000,
      max: 5,
      keepAlive: true,
      ssl: isNeon ? { rejectUnauthorized: false } : undefined
    });
    
    pool.query('SELECT 1').catch((err) => {
      console.error('DB connectivity check failed:', err?.code || err?.message || err);
    });
    
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });

    return pool;
};

// --- 2. DATABASE SCHEMA ---
// (Keeping schema definitions identical to ensure compatibility)

// Users & Auth
export const users = pgTable('user', {
  id: serial('id').primaryKey(),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  name: text('name'),
  avatar: text('avatar'),
  isActive: boolean('isActive').default(true).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const profiles = pgTable('profile', {
  id: serial('id').primaryKey(),
  fullName: text('fullName').notNull(),
  greeting: text('greeting'),
  role: text('role').default('[]').notNull(),
  bio: text('bio').default('').notNull(),
  shortBio: text('shortBio'),
  heroImage: text('heroImage'),
  aboutImage: text('aboutImage'),
  resumeUrl: text('resumeUrl'),
  location: text('location'),
  email: text('email'),
  phone: text('phone'),
  stats_project_count: text('stats_project_count'),
  stats_exp_years: text('stats_exp_years'),
  map_embed_url: text('map_embed_url'),
});

export const socialLinks = pgTable('social_link', {
  id: serial('id').primaryKey(),
  platform: text('platform').notNull(),
  url: text('url').notNull(),
  icon: text('icon'),
});

// Projects
export const projectCategories = pgTable('project_category', {
  id: serial('id').primaryKey(),
  name: text('name').unique().notNull(),
  slug: text('slug').unique().notNull(),
});

export const projects = pgTable('project', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').unique(),
  description: text('description').default('').notNull(),
  content: text('content').default('').notNull(),
  coverImage: text('coverImage'),
  videoUrl: text('videoUrl'),
  demoUrl: text('demoUrl'),
  repoUrl: text('repoUrl'),
  tech: text('tech').default('[]').notNull(),
  categoryId: integer('categoryId').references(() => projectCategories.id),
  gallery: text('gallery').default('[]').notNull(),
  summaries: text('summaries').default('[]').notNull(),
  is_published: boolean('is_published').default(true).notNull(),
  order: integer('order').default(0).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  custom_created_at: timestamp('custom_created_at'),
});

export const projectRelations = relations(projects, ({ one }) => ({
  category: one(projectCategories, {
    fields: [projects.categoryId],
    references: [projectCategories.id],
  }),
}));

// Blog
export const blogCategories = pgTable('blog_category', {
  id: serial('id').primaryKey(),
  name: text('name').unique().notNull(),
  slug: text('slug').unique().notNull(),
  description: text('description'),
});

export const blogPosts = pgTable('blog_post', {
  id: serial('id').primaryKey(),
  categoryId: integer('categoryId').references(() => blogCategories.id),
  title: text('title').notNull(),
  slug: text('slug').unique().notNull(),
  excerpt: text('excerpt'),
  content: text('content').notNull(),
  coverImage: text('coverImage'),
  tags: text('tags').default('[]').notNull(),
  is_published: boolean('is_published').default(false).notNull(),
  published_at: timestamp('published_at'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  views: integer('views').default(0).notNull(),
  likes: integer('likes').default(0).notNull(),
});

export const blogComments = pgTable('blog_comment', {
  id: serial('id').primaryKey(),
  postId: integer('postId').references(() => blogPosts.id).notNull(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  content: text('content').notNull(),
  avatar: text('avatar'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  isApproved: boolean('isApproved').default(true).notNull(),
});

export const blogLikes = pgTable('blog_like', {
  id: serial('id').primaryKey(),
  postId: integer('postId').references(() => blogPosts.id).notNull(),
  ipHash: text('ipHash'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const blogPostRelations = relations(blogPosts, ({ one, many }) => ({
  category: one(blogCategories, {
    fields: [blogPosts.categoryId],
    references: [blogCategories.id],
  }),
  comments: many(blogComments),
  likes: many(blogLikes),
}));

export const blogCommentRelations = relations(blogComments, ({ one }) => ({
  post: one(blogPosts, {
    fields: [blogComments.postId],
    references: [blogPosts.id],
  }),
}));

// Resume / Experience / Education
export const skillCategories = pgTable('skill_category', {
  id: serial('id').primaryKey(),
  name: text('name').unique().notNull(),
  slug: text('slug').unique().notNull(),
  order: integer('order').default(0).notNull(),
});

export const skills = pgTable('skill', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  percentage: integer('percentage').default(0).notNull(),
  categoryId: integer('categoryId').references(() => skillCategories.id),
  logo_url: varchar('logo_url', { length: 500 }),
});

export const skillRelations = relations(skills, ({ one }) => ({
  category: one(skillCategories, {
    fields: [skills.categoryId],
    references: [skillCategories.id],
  }),
}));

export const experiences = pgTable('experience', {
  id: serial('id').primaryKey(),
  role: text('role').notNull(),
  company: text('company').notNull(),
  description: text('description').notNull(),
  type: text('type').default('work').notNull(),
  startDate: timestamp('startDate').notNull(),
  endDate: timestamp('endDate'),
  isCurrent: boolean('isCurrent').default(false).notNull(),
  location: text('location'),
  image: text('image'),
  coverImage: text('coverImage'),
  gallery: text('gallery').default('[]'),
});

export const educations = pgTable('education', {
  id: serial('id').primaryKey(),
  institution: text('institution').notNull(),
  degree: text('degree').notNull(),
  field: text('field').notNull(),
  startDate: timestamp('startDate').notNull(),
  endDate: timestamp('endDate'),
  gpa: text('gpa'),
  logo: text('logo'),
  coverImage: text('coverImage'),
  location: text('location'),
  mapUrl: text('mapUrl'),
  description: text('description'),
  gallery: text('gallery').default('[]'),
  attachments: text('attachments').default('[]'),
});

export const certificateCategories = pgTable('certificate_category', {
  id: serial('id').primaryKey(),
  name: text('name').unique().notNull(),
  slug: text('slug').unique().notNull(),
});

export const certificates = pgTable('certificate', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  issuer: text('issuer').notNull(),
  issueDate: timestamp('issueDate').notNull(),
  expiryDate: timestamp('expiryDate'),
  credentialUrl: text('credentialUrl'),
  image: text('image'),
  verified: boolean('verified').default(false).notNull(),
  credentialId: text('credentialId'),
  categoryId: integer('categoryId').references(() => certificateCategories.id),
});

export const certificateRelations = relations(certificates, ({ one }) => ({
  category: one(certificateCategories, {
    fields: [certificates.categoryId],
    references: [certificateCategories.id],
  }),
}));

// Misc
export const messages = pgTable('message', {
  id: serial('id').primaryKey(),
  senderName: text('senderName').notNull(),
  email: text('email').notNull(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  isRead: boolean('isRead').default(false).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const waTemplates = pgTable('wa_template', {
  id: serial('id').primaryKey(),
  template_name: text('template_name').notNull(),
  template_content: text('template_content').notNull(),
  category: text('category').default('General').notNull(),
  is_active: boolean('is_active').default(true).notNull(),
});

export const siteSettings = pgTable('site_settings', {
  id: serial('id').primaryKey(),
  theme: text('theme').default('dark').notNull(),
  seoTitle: text('seoTitle').default('My Portfolio').notNull(),
  seoDesc: text('seoDesc'),
  cdn_url: text('cdn_url'),
  maintenanceMode: boolean('maintenanceMode').default(false).notNull(),
  maintenance_end_time: timestamp('maintenance_end_time'),
  ai_provider: text('ai_provider').default('gemini'),
});

export const homeContents = pgTable('home_content', {
  id: serial('id').primaryKey(),
  greeting_id: text('greeting_id').default('Halo').notNull(),
  roles_id: text('roles_id').default('[]').notNull(),
  heroImage: text('heroImage'),
});

export const aboutContents = pgTable('about_content', {
  id: serial('id').primaryKey(),
  short_description_id: text('short_description_id'),
  long_description_id: text('long_description_id'),
  aboutImage: text('aboutImage'),
});

// Init Drizzle
const schema = {
  users, profiles, socialLinks,
  projects, projectCategories, projectRelations,
  blogPosts, blogCategories, blogPostRelations,
  blogComments, blogLikes, blogCommentRelations,
  skills, skillCategories, skillRelations,
  experiences, 
  education: educations, // FIX: Map singular 'education' resource to 'educations' table
  educations, // Keep plural just in case
  certificates, certificateCategories, certificateRelations,
  messages, waTemplates,
  siteSettings, homeContents, aboutContents
};

// Lazy DB init
let db: any;
const getDb = () => {
    if (db) return db;
    db = drizzle(getPool(), { schema });
    return db;
};

let didEnsureSchema = false;
const ensureSchema = async () => {
    if (didEnsureSchema) return;
    try {
        const client = await getPool().connect();
        try {
            // Ensure tables exist (Basic Schema)
            await client.query(`
                CREATE TABLE IF NOT EXISTS certificate_category (
                    id SERIAL PRIMARY KEY,
                    name TEXT NOT NULL UNIQUE,
                    slug TEXT NOT NULL UNIQUE
                );
            `);
            await client.query(`
                CREATE TABLE IF NOT EXISTS certificate (
                    id SERIAL PRIMARY KEY,
                    name TEXT NOT NULL,
                    issuer TEXT NOT NULL,
                    "issueDate" TIMESTAMP NOT NULL,
                    "expiryDate" TIMESTAMP,
                    "credentialUrl" TEXT,
                    image TEXT,
                    verified BOOLEAN DEFAULT false NOT NULL,
                    "credentialId" TEXT,
                    "categoryId" INTEGER REFERENCES certificate_category(id)
                );
            `);

            await client.query(`ALTER TABLE certificate ADD COLUMN IF NOT EXISTS "expiryDate" timestamp`);
            await client.query(`ALTER TABLE certificate ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false`);
            await client.query(`ALTER TABLE certificate ADD COLUMN IF NOT EXISTS "credentialId" text`);

            await client.query(`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS "seoDesc" text`);
            await client.query(`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS "cdn_url" text`);
            await client.query(`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS "maintenance_end_time" timestamp`);
            await client.query(`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS "ai_provider" text`);
            await client.query(`ALTER TABLE skill ADD COLUMN IF NOT EXISTS "logo_url" varchar(500)`);
            await client.query(`ALTER TABLE skill_category ADD COLUMN IF NOT EXISTS "order" integer DEFAULT 0`);
            await client.query(`ALTER TABLE project ADD COLUMN IF NOT EXISTS "summaries" text DEFAULT '[]'`);
            await client.query(`ALTER TABLE project ADD COLUMN IF NOT EXISTS "custom_created_at" timestamp`);
            await client.query(`ALTER TABLE experience ADD COLUMN IF NOT EXISTS "coverImage" text`);
            await client.query(`ALTER TABLE experience ADD COLUMN IF NOT EXISTS "cover_image" text`);
            await client.query(`ALTER TABLE experience ADD COLUMN IF NOT EXISTS "gallery" text DEFAULT '[]'`);
            // Cloudinary config table (multi-account, max 5)
            await client.query(`
                CREATE TABLE IF NOT EXISTS cloudinary_config (
                    id SERIAL PRIMARY KEY,
                    cloud_name TEXT NOT NULL,
                    api_key TEXT NOT NULL,
                    api_secret TEXT NOT NULL,
                    label TEXT NOT NULL DEFAULT '',
                    is_active BOOLEAN NOT NULL DEFAULT false,
                    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
                    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
                );
            `);
            await client.query(`ALTER TABLE cloudinary_config ADD COLUMN IF NOT EXISTS label TEXT NOT NULL DEFAULT ''`);
            await client.query(`ALTER TABLE cloudinary_config ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT false`);
        } finally {
            client.release();
        }
        didEnsureSchema = true;
    } catch (e: any) {
        console.error('Schema ensure failed:', e?.code || e?.message || e);
        throw Object.assign(new Error('DB_UNAVAILABLE'), { cause: e });
    }
};

// Retry helper
const withRetry = async (fn: () => Promise<any>, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error: any) {
            const isConnectionError = error.message?.includes('timeout') || 
                                      error.message?.includes('connection') || 
                                      error.code === '57P01'; // Admin shutdown
            if (isConnectionError && i < retries - 1) {
                console.warn(`Database operation failed (attempt ${i + 1}/${retries}), retrying...`, error.message);
                await new Promise(res => setTimeout(res, 1000 * (i + 1))); // Exponential backoff
                continue;
            }
            throw error;
        }
    }
};

// --- 3. HELPER FUNCTIONS ---

const sendJSON = (res: any, status: number, data: any) => {
  if (res.headersSent) return; // Prevent double sending
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');
  res.end(JSON.stringify(data));
};

const parseBody = (req: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: any) => body += chunk.toString());
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
};

// Resource Map
const resources: Record<string, any> = {
  'profile': profiles, // Map 'profile' -> profiles table
  'social-links': socialLinks,
  'projects': projects,
  'project-categories': projectCategories,
  'blog-posts': blogPosts,
  'blog-categories': blogCategories,
  'blog-comments': blogComments,
  'skills': skills,
  'skill-categories': skillCategories,
  'experience': experiences, // Map 'experience' -> experiences table
  'education': educations,
  'certificates': certificates,
  'certificate-categories': certificateCategories,
  'messages': messages,
  'wa-templates': waTemplates,
  'settings': siteSettings, // Map 'settings' -> siteSettings table
  'home-content': homeContents,
  'about-content': aboutContents,
};

const relationMap: Record<string, any> = {
  'projects': { category: true },
  'blog-posts': { category: true },
  'skills': { category: true },
  'certificates': { category: true },
  'blog-comments': { post: true },
};

// Helper to process body dates
const processBodyDates = (body: any) => {
    const dateFields = ['startDate', 'endDate', 'issueDate', 'expiryDate', 'published_at', 'date', 'createdAt', 'updatedAt', 'created_at', 'updated_at', 'maintenance_end_time', 'custom_created_at'];
    const processed = { ...body };
    
    for (const key of Object.keys(processed)) {
        if (dateFields.includes(key)) {
            const val = processed[key];
            if (typeof val === 'string' && val) {
                const d = new Date(val);
                if (!isNaN(d.getTime())) {
                    processed[key] = d;
                }
            } else if (val === '') {
                processed[key] = null;
            }
        }
    }
    return processed;
};

// --- 4. MAIN HANDLER ---

export default async function handler(req: any, res: any) {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.statusCode = 200;
    res.end();
    return;
  }

  try {
    const { url } = req;
    const urlObj = new URL(url, `http://${req.headers.host}`);
    const query = Object.fromEntries(urlObj.searchParams.entries());
    
    // Parse Path
    let resourceName = (req.query?.resource || query.resource) as string;
    let id = (req.query?.id || query.id) as string;
    let action = (req.query?.action || query.action) as string;
    let subResource = '';

    // Handle Path-based routing: /api/projects/1, /api/auth/login, /api/projects/bulk
    if (!resourceName) {
      const pathParts = urlObj.pathname.split('/').filter(p => p && p !== 'api');
      // pathParts example: ['projects', '1'] or ['auth', 'login']
      
      if (pathParts.length > 0) {
        resourceName = pathParts[0];
        
        if (pathParts.length > 1) {
            // Check for specific actions or sub-resources
            if (pathParts[1] === 'bulk') {
                action = 'bulk';
            } else if (pathParts[1] === 'login' || pathParts[1] === 'register' || pathParts[1] === 'me') {
                action = pathParts[1];
            } else if (!isNaN(Number(pathParts[1]))) {
                id = pathParts[1];
                if (pathParts.length > 2) {
                    subResource = pathParts[2]; // e.g. /projects/1/details
                }
            } else {
                // e.g. /blog-posts/by_slug
                action = pathParts[1];
            }
        }
      }
    }

    // Handle Root & Health Check Endpoints
    if (!resourceName || resourceName === 'health' || urlObj.pathname === '/' || urlObj.pathname === '/api' || urlObj.pathname === '/api/') {
      return sendJSON(res, 200, {
        status: 'ok',
        service: 'Portfolio REST API',
        version: '1.0.0',
        message: 'Portfolio Backend API is running securely',
        timestamp: new Date().toISOString()
      });
    }

    if (resourceName === 'favicon.ico') {
      res.statusCode = 204;
      res.end();
      return;
    }

    if (resourceName === 'undefined') {
      return sendJSON(res, 404, { error: "Resource 'undefined' not found. Please provide a valid API resource path (e.g. /api/projects, /api/profile)." });
    }

    // Alias routing: /projects/categories -> project-categories
    // Frontend uses REST style: /projects/categories, but the generic resource name is 'project-categories'
    {
      const pathParts = urlObj.pathname.split('/').filter(p => p && p !== 'api');
      if (pathParts[0] === 'projects' && pathParts[1] === 'categories') {
        resourceName = 'project-categories';
        action = '';
        subResource = '';

        if (pathParts[2] === 'bulk') {
          action = 'bulk';
          id = '';
        } else if (pathParts[2] && !isNaN(Number(pathParts[2]))) {
          id = pathParts[2];
        }
      }
    }

    // --- Special Routes ---

    if (resourceName && resourceName !== 'health' && resourceName !== 'ai' && resourceName !== 'upload') {
      await ensureSchema();
    }

    // Blog: Get by Slug
    if (resourceName === 'blog-posts' && action === 'by_slug') {
        const slug = query.slug as string;
        if (!slug) return sendJSON(res, 400, { error: 'Slug required' });
        // Include comments count or latest comments if needed, but for now just post
        const post = await getDb().query.blogPosts.findFirst({ 
            where: eq(blogPosts.slug, slug), 
            with: { category: true } 
        });
        if (!post) return sendJSON(res, 404, { error: 'Post not found' });
        
        // Get likes count
        // const [likesResult] = await getDb().select({ count: sql`count(*)` }).from(blogLikes).where(eq(blogLikes.postId, post.id));
        // Get comments count (approved)
        const [commentsResult] = await getDb().select({ count: sql`count(*)` }).from(blogComments).where(and(eq(blogComments.postId, post.id), eq(blogComments.isApproved, true)));

        return sendJSON(res, 200, { 
            ...post, 
            likes: post.likes || 0, 
            comments_count: Number(commentsResult.count) 
        });
    }

    // Blog Interactions
    if (resourceName === 'blog-posts' && id) {
        // GET Comments
        if (action === 'comments') {
            if (req.method === 'GET') {
                const comments = await getDb().query.blogComments.findMany({
                    where: and(eq(blogComments.postId, Number(id)), eq(blogComments.isApproved, true)),
                    orderBy: desc(blogComments.createdAt)
                });
                return sendJSON(res, 200, comments);
            }
            if (req.method === 'POST') {
                const body = await parseBody(req);
                const { name, email, content, avatar } = body;
                if (!name || !content) return sendJSON(res, 400, { error: 'Name and content required' });
                
                const [newComment] = await getDb().insert(blogComments).values({
                    postId: Number(id),
                    name,
                    email: email || 'anonymous',
                    content,
                    avatar,
                    isApproved: true // Auto-approve for now as requested "nambah manual"
                }).returning();
                return sendJSON(res, 201, newComment);
            }
        }

        // POST Like
        if (action === 'like') {
             if (req.method !== 'POST') return sendJSON(res, 405, { error: 'Method not allowed' });
             
             let count = 1;
             try {
                const body = await parseBody(req);
                if (body && body.count) {
                    count = parseInt(body.count) || 1;
                }
             } catch (e) {
                // Ignore parse error, default to 1
             }

             // Simple IP tracking (may be proxied)
             const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
             
             // We can allow multiple likes or debounce. For now, just insert.
             // If we want unique per IP:
             // const existing = await getDb().query.blogLikes.findFirst({ where: and(eq(blogLikes.postId, Number(id)), eq(blogLikes.ipHash, ip)) });
             // if (existing) return sendJSON(res, 400, { error: 'Already liked' });
             
             await getDb().insert(blogLikes).values({
                 postId: Number(id),
                 ipHash: ip as string
             });
             
             // Increment likes in blogPosts table (Source of Truth for count)
             await getDb().update(blogPosts)
                .set({ likes: sql`${blogPosts.likes} + ${count}` })
                .where(eq(blogPosts.id, Number(id)));

             const [post] = await getDb().select({ likes: blogPosts.likes }).from(blogPosts).where(eq(blogPosts.id, Number(id)));
             return sendJSON(res, 200, { success: true, likes: post?.likes || 0 });
        }

        // POST View
        if (action === 'view') {
             if (req.method !== 'POST') return sendJSON(res, 405, { error: 'Method not allowed' });
             
             // Increment view
             // Atomic increment is better: update blog_post set views = views + 1 where id = ?
             await getDb().update(blogPosts)
                .set({ views: sql`${blogPosts.views} + 1` })
                .where(eq(blogPosts.id, Number(id)));
             
             const [post] = await getDb().select({ views: blogPosts.views }).from(blogPosts).where(eq(blogPosts.id, Number(id)));
             return sendJSON(res, 200, { success: true, views: post?.views || 0 });
        }
    }

    // Projects: Summaries (Sub-resource)
    if (resourceName === 'projects' && subResource === 'summaries') {
        const projectId = Number(id);
        if (!projectId) return sendJSON(res, 400, { error: 'Project ID required' });

        try {
            const [project] = await getDb().select().from(projects).where(eq(projects.id, projectId));
            if (!project) return sendJSON(res, 404, { error: 'Project not found' });

            let currentSummaries: any[] = [];
            try {
                currentSummaries = JSON.parse(project.summaries || '[]');
            } catch (e) {
                currentSummaries = [];
            }

            if (req.method === 'POST') {
                const body = await parseBody(req);
                const newSummary = {
                    id: Date.now(),
                    content: body.content,
                    variant: body.variant || 'Standard',
                    createdAt: new Date().toISOString()
                };
                const updatedSummaries = [newSummary, ...currentSummaries];
                
                await getDb().update(projects)
                    .set({ summaries: JSON.stringify(updatedSummaries), updatedAt: new Date() })
                    .where(eq(projects.id, projectId));
                    
                return sendJSON(res, 200, newSummary);
            }

            if (req.method === 'DELETE') {
                const pathParts = urlObj.pathname.split('/').filter(p => p && p !== 'api');
                // Expected: /projects/:id/summaries/:summaryId
                const summaryId = Number(pathParts[3]); 
                
                if (!summaryId) return sendJSON(res, 400, { error: 'Summary ID required' });
                
                const updatedSummaries = currentSummaries.filter((s: any) => s.id !== summaryId);
                
                await getDb().update(projects)
                    .set({ summaries: JSON.stringify(updatedSummaries), updatedAt: new Date() })
                    .where(eq(projects.id, projectId));
                    
                return sendJSON(res, 200, { success: true });
            }
        } catch (error: any) {
            console.error('Summaries Error:', error);
            return sendJSON(res, 500, { error: 'Failed to process summary' });
        }
        
        return sendJSON(res, 405, { error: 'Method not allowed' });
    }

    // Auth
    if (resourceName === 'auth') {
        if (action === 'login') {
            if (req.method !== 'POST') return sendJSON(res, 405, { error: 'Method not allowed' });
            const body = await parseBody(req);
            const { email, password } = body || {};
            if (!email || !password) return sendJSON(res, 400, { error: 'Email and password required' });

            const ip = getClientIp(req);
            if (isRateLimited(ip)) return sendJSON(res, 429, { error: 'Too many attempts. Please try again later.' });

            try {
                const user = await getDb().query.users.findFirst({ where: eq(users.email, email) });
                if (user && user.isActive) {
                    let isPasswordValid = false;
                    const storedPass = String(user.password || '');
                    const isBcrypt = storedPass.startsWith('$2a$') || storedPass.startsWith('$2b$') || storedPass.startsWith('$2y$');

                    if (isBcrypt) {
                        isPasswordValid = await bcrypt.compare(password, storedPass);
                    } else if (storedPass === password) {
                        // Plaintext match: valid and automatically migrate to bcrypt hash!
                        isPasswordValid = true;
                        try {
                            const newHashedPassword = await bcrypt.hash(password, 10);
                            await getDb().update(users).set({ password: newHashedPassword, updatedAt: new Date() }).where(eq(users.id, user.id));
                        } catch (migrateErr) {
                            console.error('Password auto-migration to bcrypt failed:', migrateErr);
                        }
                    }

                    if (isPasswordValid) {
                        clearAttempts(ip);
                        const token = jwt.sign(
                            { id: user.id, email: user.email, name: user.name, role: 'admin' },
                            JWT_SECRET,
                            { expiresIn: '7d' }
                        );
                        return sendJSON(res, 200, {
                            token,
                            user: { id: user.id, email: user.email, name: user.name, role: 'admin' }
                        });
                    }
                }
            } catch (err) {
                console.error("Login DB Error:", err);
            }

            trackFailed(ip);
            return sendJSON(res, 401, { error: 'Invalid credentials' });
        }

        if (action === 'register') {
            if (req.method !== 'POST') return sendJSON(res, 405, { error: 'Method not allowed' });
            // Only authenticated admin can create new accounts if users already exist
            const tokenUser = verifyJwtToken(req);
            const body = await parseBody(req);
            const { email, password, name } = body || {};
            if (!email || !password) return sendJSON(res, 400, { error: 'Email and password required' });

            try {
                const existingUsers = await getDb().select({ count: sql`count(*)` }).from(users);
                const userCount = Number(existingUsers?.[0]?.count || 0);
                if (userCount > 0 && !tokenUser) {
                    return sendJSON(res, 401, { error: 'Unauthorized. Only admins can register new accounts.' });
                }

                const existing = await getDb().query.users.findFirst({ where: eq(users.email, email) });
                if (existing) return sendJSON(res, 409, { error: 'User already exists' });

                const hashedPassword = await bcrypt.hash(password, 10);
                const inserted = await getDb().insert(users).values({ email, password: hashedPassword, name: name || 'Admin', isActive: true }).returning();
                const u = inserted?.[0];
                return sendJSON(res, 201, { id: u.id, email: u.email, name: u.name });
            } catch (err) {
                return sendJSON(res, 500, { error: 'Failed to register' });
            }
        }

        if (action === 'me') {
            const tokenUser = verifyJwtToken(req);
            if (!tokenUser) {
                return sendJSON(res, 401, { error: 'Unauthorized. Invalid or missing token.' });
            }

            if (req.method === 'GET') {
                try {
                    const [user] = await getDb()
                        .select({
                            id: users.id,
                            email: users.email,
                            name: users.name,
                            avatar: users.avatar,
                            isActive: users.isActive,
                        })
                        .from(users)
                        .where(eq(users.id, tokenUser.id))
                        .limit(1);

                    if (user) {
                        return sendJSON(res, 200, { ...user, role: 'admin' });
                    }
                } catch (err) {
                    console.error("Auth ME DB Error:", err);
                }

                return sendJSON(res, 404, { error: 'User not found' });
            }

            if (req.method === 'PUT' || req.method === 'PATCH') {
                const body = await parseBody(req);
                const { name, email, avatar, password } = body || {};

                try {
                    const updateData: any = {
                        updatedAt: new Date(),
                    };

                    if (typeof name === 'string') updateData.name = name;
                    if (typeof email === 'string') updateData.email = email;
                    if (typeof avatar === 'string' || avatar === null) updateData.avatar = avatar;
                    if (typeof password === 'string' && password.length > 0) {
                        updateData.password = await bcrypt.hash(password, 10);
                    }

                    await getDb().update(users).set(updateData).where(eq(users.id, tokenUser.id));

                    const [updated] = await getDb()
                        .select({
                            id: users.id,
                            email: users.email,
                            name: users.name,
                            avatar: users.avatar,
                            isActive: users.isActive,
                        })
                        .from(users)
                        .where(eq(users.id, tokenUser.id))
                        .limit(1);

                    return sendJSON(res, 200, { ...updated, role: 'admin' });
                } catch (err) {
                    console.error("Auth UPDATE ME DB Error:", err);
                    return sendJSON(res, 500, { error: 'Failed to update profile' });
                }
            }

            return sendJSON(res, 405, { error: 'Method not allowed' });
        }

        if (action === 'reset') {
            if (req.method !== 'POST') return sendJSON(res, 405, { error: 'Method not allowed' });
            const body = await parseBody(req);
            const { email, password, token } = body || {};
            const secret = process.env.ADMIN_RESET_TOKEN || '';
            if (!secret || token !== secret) return sendJSON(res, 403, { error: 'Forbidden' });
            if (!email || !password) return sendJSON(res, 400, { error: 'Email and password required' });
            try {
                const existing = await getDb().query.users.findFirst({ where: eq(users.email, email) });
                const hashedPassword = await bcrypt.hash(password, 10);
                if (!existing) {
                    const inserted = await getDb().insert(users).values({ email, password: hashedPassword, name: 'Admin', isActive: true }).returning();
                    const u = inserted?.[0];
                    return sendJSON(res, 200, { id: u.id, email: u.email, name: u.name });
                }
                await getDb().update(users).set({ password: hashedPassword, email, updatedAt: new Date() }).where(eq(users.id, existing.id));
                return sendJSON(res, 200, { success: true });
            } catch (err) {
                return sendJSON(res, 500, { error: 'Failed to reset password' });
            }
        }
    }

    // Dashboard Stats
    if (resourceName === 'admin' && action === 'dashboard-stats') {
        const [projCount] = await getDb().select({ count: sql`count(*)` }).from(projects);
        const [blogCount] = await getDb().select({ count: sql`count(*)` }).from(blogPosts);
        const [msgCount] = await getDb().select({ count: sql`count(*)` }).from(messages);
        
        return sendJSON(res, 200, {
            counts: {
                projects: Number(projCount.count),
                blogs: Number(blogCount.count),
                messages: Number(msgCount.count)
            },
            recent: {
                projects: await getDb().select().from(projects).limit(5).orderBy(desc(projects.createdAt)),
                messages: await getDb().select().from(messages).limit(5).orderBy(desc(messages.createdAt))
            }
        });
    }

    // ── GitHub CDN Media Helpers (dresar/PORTOFOLIO) ──────────────────────
    async function uploadToGitHubCDN(fileBase64: string, customPublicId?: string, folder?: string) {
        const match = fileBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        let mimeType = 'image/png';
        let base64Data = fileBase64;
        let ext = 'png';

        if (match) {
            mimeType = match[1];
            base64Data = match[2];
            if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg';
            else if (mimeType.includes('webp')) ext = 'webp';
            else if (mimeType.includes('svg')) ext = 'svg';
            else if (mimeType.includes('gif')) ext = 'gif';
            else if (mimeType.includes('pdf')) ext = 'pdf';
            else if (mimeType.includes('mp4')) ext = 'mp4';
        }

        let filename = '';
        if (customPublicId && typeof customPublicId === 'string' && customPublicId.trim().length > 0) {
            const cleanId = customPublicId.replace(/[^a-zA-Z0-9_-]/g, '_');
            filename = cleanId.endsWith(`.${ext}`) ? cleanId : `${cleanId}.${ext}`;
        } else {
            filename = `media_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`;
        }

        const buffer = Buffer.from(base64Data, 'base64');
        const targetPath = `${GITHUB_UPLOADS_PATH}/${filename}`;

        // 1. Write locally for instant local preview
        try {
            const localDir = path.join(process.cwd(), 'public', 'uploads');
            if (!fs.existsSync(localDir)) {
                fs.mkdirSync(localDir, { recursive: true });
            }
            fs.writeFileSync(path.join(localDir, filename), buffer);
        } catch (localErr) {
            console.warn('Local file write notice:', localErr);
        }

        // 2. Check if file already exists in GitHub (obtain SHA if updating)
        let existingSha: string | undefined;
        try {
            const checkRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${targetPath}?ref=${GITHUB_BRANCH}`, {
                headers: {
                    'Authorization': `Bearer ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'Portfolio-App'
                }
            });
            if (checkRes.ok) {
                const checkData: any = await checkRes.json();
                existingSha = checkData.sha;
            }
        } catch (err) {}

        // 3. Upload to GitHub Contents API
        const uploadPayload: any = {
            message: `upload: ${filename} via GitHub CDN`,
            content: base64Data,
            branch: GITHUB_BRANCH
        };
        if (existingSha) {
            uploadPayload.sha = existingSha;
        }

        const ghRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${targetPath}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'User-Agent': 'Portfolio-App'
            },
            body: JSON.stringify(uploadPayload)
        });

        if (!ghRes.ok) {
            const ghErr = await ghRes.text();
            console.error('GitHub CDN Upload Error:', ghRes.status, ghErr);
            throw new Error(`GitHub CDN Upload Failed (${ghRes.status}): ${ghErr}`);
        }

        const ghData: any = await ghRes.json();
        const cdnUrl = `https://cdn.jsdelivr.net/gh/${GITHUB_REPO}@${GITHUB_BRANCH}/${targetPath}`;
        const rawUrl = ghData.content?.download_url || `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${targetPath}`;

        return {
            public_id: filename,
            secure_url: cdnUrl,
            url: cdnUrl,
            raw_url: rawUrl,
            local_url: `/uploads/${filename}`,
            width: 800,
            height: 600,
            format: ext,
            bytes: buffer.length,
            resource_type: mimeType.startsWith('video') ? 'video' : 'image',
            created_at: new Date().toISOString(),
            _account: `GitHub CDN (${GITHUB_REPO})`
        };
    }

    async function listGitHubCDNAssets() {
        const assets: any[] = [];
        const seenNames = new Set<string>();

        try {
            const ghRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_UPLOADS_PATH}?ref=${GITHUB_BRANCH}`, {
                headers: {
                    'Authorization': `Bearer ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'Portfolio-App'
                }
            });

            if (ghRes.ok) {
                const items: any = await ghRes.json();
                if (Array.isArray(items)) {
                    for (const item of items) {
                        if (item.type === 'file' && item.name !== '.gitkeep') {
                            seenNames.add(item.name);
                            const ext = item.name.split('.').pop()?.toLowerCase() || 'png';
                            const isVideo = ['mp4', 'webm', 'mov'].includes(ext);
                            const cdnUrl = `https://cdn.jsdelivr.net/gh/${GITHUB_REPO}@${GITHUB_BRANCH}/${item.path}`;
                            assets.push({
                                public_id: item.name,
                                secure_url: cdnUrl,
                                url: cdnUrl,
                                raw_url: item.download_url,
                                sha: item.sha,
                                width: 800,
                                height: 600,
                                format: ext,
                                bytes: item.size || 0,
                                resource_type: isVideo ? 'video' : 'image',
                                created_at: new Date().toISOString(),
                                tags: ['github-cdn']
                            });
                        }
                    }
                }
            }
        } catch (err) {
            console.warn('GitHub list warning:', err);
        }

        // Merge any local files
        try {
            const localDir = path.join(process.cwd(), 'public', 'uploads');
            if (fs.existsSync(localDir)) {
                const files = fs.readdirSync(localDir);
                for (const f of files) {
                    if (!seenNames.has(f) && f !== '.gitkeep') {
                        const stats = fs.statSync(path.join(localDir, f));
                        if (stats.isFile()) {
                            const ext = f.split('.').pop()?.toLowerCase() || 'png';
                            const isVideo = ['mp4', 'webm', 'mov'].includes(ext);
                            const cdnUrl = `https://cdn.jsdelivr.net/gh/${GITHUB_REPO}@${GITHUB_BRANCH}/${GITHUB_UPLOADS_PATH}/${f}`;
                            assets.push({
                                public_id: f,
                                secure_url: cdnUrl,
                                url: cdnUrl,
                                raw_url: `/uploads/${f}`,
                                width: 800,
                                height: 600,
                                format: ext,
                                bytes: stats.size,
                                resource_type: isVideo ? 'video' : 'image',
                                created_at: stats.mtime.toISOString(),
                                tags: ['local-upload']
                            });
                        }
                    }
                }
            }
        } catch (err) {
            console.warn('Local dir read warning:', err);
        }

        assets.sort((a, b) => b.public_id.localeCompare(a.public_id));
        return assets;
    }

    async function deleteFromGitHubCDN(publicId: string, sha?: string) {
        let fileSha = sha;
        const targetPath = `${GITHUB_UPLOADS_PATH}/${publicId}`;

        if (!fileSha) {
            try {
                const getRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${targetPath}?ref=${GITHUB_BRANCH}`, {
                    headers: {
                        'Authorization': `Bearer ${GITHUB_TOKEN}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'User-Agent': 'Portfolio-App'
                    }
                });
                if (getRes.ok) {
                    const data: any = await getRes.json();
                    fileSha = data.sha;
                }
            } catch (e) {}
        }

        let ghResult = 'ok';
        if (fileSha) {
            try {
                const delRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${targetPath}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${GITHUB_TOKEN}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json',
                        'User-Agent': 'Portfolio-App'
                    },
                    body: JSON.stringify({
                        message: `delete: ${publicId} from GitHub CDN`,
                        sha: fileSha,
                        branch: GITHUB_BRANCH
                    })
                });
                ghResult = delRes.ok ? 'ok' : 'error';
            } catch (delErr) {
                ghResult = 'error';
            }
        }

        // Delete local copy
        try {
            const localFile = path.join(process.cwd(), 'public', 'uploads', publicId);
            if (fs.existsSync(localFile)) {
                fs.unlinkSync(localFile);
            }
        } catch (e) {}

        return ghResult;
    }

    // Upload
    if (resourceName === 'upload') {
        const tokenUser = verifyJwtToken(req);
        if (!tokenUser) return sendJSON(res, 401, { error: 'Unauthorized. Upload requires authentication.' });
        if (req.method !== 'POST') return sendJSON(res, 405, { error: 'Method not allowed' });
        try {
            const body = await parseBody(req);
            const { file, folder, public_id } = body || {};
            if (!file) return sendJSON(res, 400, { error: 'file (base64) is required' });
            const result = await uploadToGitHubCDN(file, public_id, folder);
            return sendJSON(res, 200, result);
        } catch (e: any) {
            console.error('Upload Error:', e);
            return sendJSON(res, 500, { error: 'Upload failed', details: e.message });
        }
    }

    // AI
    if (resourceName === 'ai') {
        const tokenUser = verifyJwtToken(req);
        if (!tokenUser) return sendJSON(res, 401, { error: 'Unauthorized. AI operations require authentication.' });

        const apiKey = process.env.AI_API_KEY;
        const apiUrl = process.env.AI_API_URL || 'https://one.apprentice.cyou/api/v1/chat/completions';
        const model = process.env.AI_MODEL || 'gemini-2.5-flash';

        const parseUpstreamError = async (apiRes: any) => {
            const status = Number(apiRes?.status || 500);
            const contentType = String(apiRes?.headers?.get?.('content-type') || '');
            let bodyText = '';
            try {
                bodyText = await apiRes.text();
            } catch {
                bodyText = '';
            }

            if (contentType.includes('application/json')) {
                try {
                    const parsed = JSON.parse(bodyText);
                    const msg = String(parsed?.error || parsed?.message || parsed?.details || 'AI upstream error');
                    return { status, message: msg };
                } catch {
                    return { status, message: 'AI upstream error' };
                }
            }

            if (bodyText && bodyText.trim().startsWith('{')) {
                try {
                    const parsed = JSON.parse(bodyText);
                    const msg = String(parsed?.error || parsed?.message || parsed?.details || 'AI upstream error');
                    return { status, message: msg };
                } catch {
                    // ignore
                }
            }

            if (bodyText && bodyText.toLowerCase().includes('<!doctype html')) {
                return { status, message: 'AI upstream returned HTML error page' };
            }

            return { status, message: 'AI upstream error' };
        };

        const mapUpstreamStatusToResponse = (status: number) => {
            if (status === 429) return { status: 429, code: 'AI_RATE_LIMITED' };
            if (status === 503) return { status: 503, code: 'AI_UNAVAILABLE' };
            if (status === 502 || status === 504) return { status, code: 'AI_UNAVAILABLE' };
            if (status >= 500) return { status: 503, code: 'AI_UNAVAILABLE' };
            return { status: 502, code: 'AI_UPSTREAM_ERROR' };
        };

        // Helper to call AI
        const callAI = async (messages: any[], opts?: { model?: string; maxTokens?: number }) => {
             if (!apiKey) throw new Error('AI API Key is not configured');
             const reqModel = opts?.model || model;
             const maxTokens = typeof opts?.maxTokens === 'number' ? opts.maxTokens : undefined;
             
             const apiRes = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: reqModel,
                    messages: messages,
                    ...(typeof maxTokens === 'number' ? { max_tokens: Math.max(1, Math.min(8192, Math.floor(maxTokens))) } : {})
                })
            });

            if (!apiRes.ok) {
                const parsed = await parseUpstreamError(apiRes);
                const err: any = new Error('AI_UPSTREAM_ERROR');
                err.upstreamStatus = parsed.status;
                err.upstreamMessage = parsed.message;
                throw err;
            }

            const data = await apiRes.json();
            return data.choices?.[0]?.message?.content || "";
        };

        // Handle Models Action
        if (action === 'models') {
             try {
                 const modelsUrl = apiUrl.replace(/\/chat\/completions\/?$/, '/models');
                 const apiRes = await fetch(modelsUrl, {
                     headers: {
                         'Authorization': `Bearer ${apiKey}`
                     }
                 });
                 if (!apiRes.ok) {
                     return sendJSON(res, apiRes.status, { error: 'Failed to fetch models from upstream' });
                 }
                 const data = await apiRes.json();
                 return sendJSON(res, 200, data);
             } catch (e) {
                 return sendJSON(res, 500, { error: 'Failed to fetch models' });
             }
        }

        // Handle Generate Action
        if (action === 'generate') {
            if (req.method !== 'POST') return sendJSON(res, 405, { error: 'Method not allowed' });
            
            try {
                const body = await parseBody(req);
                const { prompt, systemPrompt } = body;
                
                if (!prompt) return sendJSON(res, 400, { error: 'Prompt is required' });

                const messages = [];
                if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
                messages.push({ role: "user", content: prompt });

                const task = typeof body?.task === 'string' ? body.task : '';
                const defaultMaxTokens = task === 'blog' ? 3500 : 1200;
                const maxTokens = typeof body?.maxTokens === 'number' ? body.maxTokens : defaultMaxTokens;
                const content = await callAI(messages, { maxTokens });
                return sendJSON(res, 200, { content, result: content }); // Support both formats

            } catch (e: any) {
                const upstreamStatus = Number(e?.upstreamStatus || 0);
                if (upstreamStatus) {
                    const mapped = mapUpstreamStatusToResponse(upstreamStatus);
                    return sendJSON(res, mapped.status, { error: 'AI service unavailable', code: mapped.code });
                }
                console.error('AI Handler Error:', e);
                return sendJSON(res, 500, { error: 'AI Handler Failed' });
            }
        }

        if (action === 'analyze-certificate-image') {
            if (req.method !== 'POST') return sendJSON(res, 405, { error: 'Method not allowed' });

            try {
                const body = await parseBody(req);
                const imageDataUrl = String(body?.imageDataUrl || '');
                const imageModel = typeof body?.model === 'string' && body.model.trim()
                  ? body.model.trim()
                  : (process.env.AI_IMAGE_MODEL || model);
                if (!imageDataUrl) return sendJSON(res, 400, { error: 'imageDataUrl is required' });
                if (!/^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(imageDataUrl)) {
                    return sendJSON(res, 400, { error: 'imageDataUrl must be a base64 data URL' });
                }
                if (imageDataUrl.length > 6_000_000) {
                    return sendJSON(res, 413, { error: 'Image too large' });
                }

                const systemPrompt = [
                  "Anda adalah sistem ekstraksi data sertifikat dari gambar.",
                  "Tugas: analisis gambar sertifikat dan ambil informasinya.",
                  "Aturan keluaran:",
                  "- Output HARUS berupa 1 objek JSON valid, tanpa teks tambahan.",
                  "- Gunakan format tanggal YYYY-MM-DD jika ada.",
                  "- Jika tidak yakin, isi null.",
                  "Skema JSON:",
                  "{",
                  '  "name": string|null,',
                  '  "issuer": string|null,',
                  '  "issueDate": "YYYY-MM-DD"|null,',
                  '  "expiryDate": "YYYY-MM-DD"|null,',
                  '  "credentialId": string|null,',
                  '  "credentialUrl": string|null,',
                  '  "verified": boolean|null',
                  "}",
                ].join('\n');

                const messages = [
                  { role: "system", content: systemPrompt },
                  {
                    role: "user",
                    content: [
                      { type: "text", text: "Analisis gambar sertifikat ini dan keluarkan JSON sesuai skema." },
                      { type: "image_url", image_url: { url: imageDataUrl } }
                    ]
                  }
                ];

                const apiRes = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: imageModel,
                        messages: messages,
                        max_tokens: 600
                    })
                });

                if (!apiRes.ok) {
                    const parsed = await parseUpstreamError(apiRes);
                    const err: any = new Error('AI_UPSTREAM_ERROR');
                    err.upstreamStatus = parsed.status;
                    err.upstreamMessage = parsed.message;
                    throw err;
                }

                const data = await apiRes.json();
                const content = data.choices?.[0]?.message?.content || "";
                return sendJSON(res, 200, { content, result: content });
            } catch (e: any) {
                const upstreamStatus = Number(e?.upstreamStatus || 0);
                if (upstreamStatus) {
                    const mapped = mapUpstreamStatusToResponse(upstreamStatus);
                    return sendJSON(res, mapped.status, { error: 'AI service unavailable', code: mapped.code });
                }
                console.error('AI Certificate Image Error:', e);
                return sendJSON(res, 500, { error: 'AI Image Analysis Failed' });
            }
        }

        // Handle Analyze GitHub Action
        if (action === 'analyze-github') {
            if (req.method !== 'POST') return sendJSON(res, 405, { error: 'Method not allowed' });

            try {
                const body = await parseBody(req);
                const { url } = body;

                if (!url) return sendJSON(res, 400, { error: 'URL is required' });

                const prompt = `Analyze this GitHub repository URL: ${url}. 
                Provide a professional project description in Markdown format.
                Include:
                - Project Overview
                - Key Features (inferred from context or typical features for such projects)
                - Tech Stack (inferred)
                - Use professional tone.`;

                const content = await callAI([{ role: "user", content: prompt }]);
                return sendJSON(res, 200, { content, result: content });

            } catch (e: any) {
                const upstreamStatus = Number(e?.upstreamStatus || 0);
                if (upstreamStatus) {
                    const mapped = mapUpstreamStatusToResponse(upstreamStatus);
                    return sendJSON(res, mapped.status, { error: 'AI service unavailable', code: mapped.code });
                }
                console.error('AI Github Analysis Error:', e);
                return sendJSON(res, 500, { error: 'AI Analysis Failed' });
            }
        }
        
        return sendJSON(res, 200, { result: "AI endpoint ready." });
    }

    // Debug Tables (Uncomment for debugging)
    /*
    if (resourceName === 'debug-tables') {
        try {
            const client = await getPool().connect();
            try {
                const result = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
                client.release();
                return sendJSON(res, 200, result.rows);
            } catch (err) {
                client.release();
                throw err;
            }
        } catch (e: any) {
             return sendJSON(res, 500, { error: 'DB Connection Error', details: e.message, code: e.code, hint: e.hint });
        }
    }
    */

    // Health
    if (resourceName === 'health') {
        return sendJSON(res, 200, { status: 'ok', timestamp: new Date() });
    }

    // Google Site Verification Endpoint
    if (resourceName === 'google-site-verification' || (resourceName?.startsWith('google') && resourceName?.endsWith('.html'))) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.end('google-site-verification: googleSc-kfSh_oBZpVn3Tn8_zIVrNI3cMcYA6e_LZYjX3MKw.html');
    }

    // --- Cloudinary Endpoints ---
    if (resourceName === 'cloudinary') {
        // All cloudinary endpoints require authentic admin JWT
        const tokenUser = verifyJwtToken(req);
        if (!tokenUser) return sendJSON(res, 401, { error: 'Unauthorized. Cloudinary operations require authentication.' });

        const MAX_CONFIGS = 5;

        // Helper: mask api_secret for safe client display
        const maskSecret = (cfg: any) => cfg ? { ...cfg, api_secret: cfg.api_secret ? '•'.repeat(8) + cfg.api_secret.slice(-4) : '' } : cfg;

        // Helper: get active cloudinary config from DB (full, unmasked)
        const getActiveConfig = async () => {
            const client = await getPool().connect();
            try {
                const result = await client.query(
                    'SELECT * FROM cloudinary_config WHERE is_active = true ORDER BY id DESC LIMIT 1'
                );
                if (result.rows.length > 0) return result.rows[0];
                // Fallback to any config if none is active
                const fallback = await client.query('SELECT * FROM cloudinary_config ORDER BY id DESC LIMIT 1');
                return fallback.rows[0] || null;
            } finally {
                client.release();
            }
        };

        // ── GET /api/cloudinary/configs ─ List all configs (masked) ──────────
        if (action === 'configs' && req.method === 'GET') {
            const ghConfig = {
                id: 9999,
                cloud_name: `GitHub CDN (${GITHUB_REPO})`,
                api_key: GITHUB_TOKEN ? `${GITHUB_TOKEN.slice(0, 8)}••••••••${GITHUB_TOKEN.slice(-4)}` : '',
                api_secret: '••••••••••••••••',
                label: 'GitHub CDN (jsDelivr Edge)',
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            const client = await getPool().connect();
            try {
                const result = await client.query('SELECT * FROM cloudinary_config ORDER BY id ASC');
                return sendJSON(res, 200, [ghConfig, ...result.rows.map(maskSecret)]);
            } catch {
                return sendJSON(res, 200, [ghConfig]);
            } finally {
                client.release();
            }
        }

        // ── POST /api/cloudinary/configs ─ Add new config (max 5) ────────────
        if (action === 'configs' && req.method === 'POST') {
            const body = await parseBody(req);
            const { cloud_name, api_key, api_secret, label } = body || {};
            if (!cloud_name || !api_key || !api_secret) {
                return sendJSON(res, 400, { error: 'cloud_name, api_key, and api_secret are required' });
            }
            const client = await getPool().connect();
            try {
                const countResult = await client.query('SELECT COUNT(*) FROM cloudinary_config');
                const count = parseInt(countResult.rows[0].count, 10);
                if (count >= MAX_CONFIGS) {
                    return sendJSON(res, 429, { error: `Maximum ${MAX_CONFIGS} configurations allowed. Delete one to add a new one.` });
                }
                // If this is the first config, auto-activate it
                const isFirst = count === 0;
                const result = await client.query(
                    'INSERT INTO cloudinary_config (cloud_name, api_key, api_secret, label, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                    [cloud_name, api_key, api_secret, label || cloud_name, isFirst]
                );
                return sendJSON(res, 201, maskSecret(result.rows[0]));
            } finally {
                client.release();
            }
        }

        // ── PUT /api/cloudinary/configs ─ Update a config ────────────────────
        if (action === 'configs' && (req.method === 'PUT' || req.method === 'PATCH')) {
            const configId = id ? Number(id) : null;
            if (!configId) return sendJSON(res, 400, { error: 'Config ID required (pass as ?id=)' });
            const body = await parseBody(req);
            const { cloud_name, api_key, api_secret, label } = body || {};
            const client = await getPool().connect();
            try {
                const existing = await client.query('SELECT * FROM cloudinary_config WHERE id = $1', [configId]);
                if (!existing.rows[0]) return sendJSON(res, 404, { error: 'Config not found' });
                const updated = await client.query(
                    `UPDATE cloudinary_config SET
                        cloud_name = COALESCE($1, cloud_name),
                        api_key    = COALESCE($2, api_key),
                        api_secret = COALESCE($3, api_secret),
                        label      = COALESCE($4, label),
                        updated_at = NOW()
                    WHERE id = $5 RETURNING *`,
                    [cloud_name || null, api_key || null, api_secret || null, label || null, configId]
                );
                return sendJSON(res, 200, maskSecret(updated.rows[0]));
            } finally {
                client.release();
            }
        }

        // ── DELETE /api/cloudinary/configs ─ Delete a config ─────────────────
        if (action === 'configs' && req.method === 'DELETE') {
            const configId = id ? Number(id) : null;
            if (!configId) return sendJSON(res, 400, { error: 'Config ID required (pass as ?id=)' });
            const client = await getPool().connect();
            try {
                const existing = await client.query('SELECT * FROM cloudinary_config WHERE id = $1', [configId]);
                if (!existing.rows[0]) return sendJSON(res, 404, { error: 'Config not found' });
                await client.query('DELETE FROM cloudinary_config WHERE id = $1', [configId]);
                // If deleted config was active, activate the latest remaining
                if (existing.rows[0].is_active) {
                    await client.query('UPDATE cloudinary_config SET is_active = true WHERE id = (SELECT id FROM cloudinary_config ORDER BY id DESC LIMIT 1)');
                }
                return sendJSON(res, 200, { success: true });
            } finally {
                client.release();
            }
        }

        // ── POST /api/cloudinary/activate ─ Set active config ────────────────
        if (action === 'activate' && req.method === 'POST') {
            const body = await parseBody(req);
            const { config_id } = body || {};
            if (!config_id) return sendJSON(res, 400, { error: 'config_id is required' });
            const client = await getPool().connect();
            try {
                await client.query('UPDATE cloudinary_config SET is_active = false');
                const result = await client.query(
                    'UPDATE cloudinary_config SET is_active = true WHERE id = $1 RETURNING *',
                    [Number(config_id)]
                );
                if (!result.rows[0]) return sendJSON(res, 404, { error: 'Config not found' });
                return sendJSON(res, 200, { success: true, active: maskSecret(result.rows[0]) });
            } finally {
                client.release();
            }
        }

        // ── POST /api/cloudinary/test ─ Test connection (GitHub CDN) ─────────
        if (action === 'test' && req.method === 'POST') {
            try {
                const ghTest = await fetch(`https://api.github.com/repos/${GITHUB_REPO}`, {
                    headers: {
                        'Authorization': `Bearer ${GITHUB_TOKEN}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'User-Agent': 'Portfolio-App'
                    }
                });
                if (ghTest.ok) {
                    const ghData: any = await ghTest.json();
                    return sendJSON(res, 200, { 
                        success: true, 
                        status: 'connected', 
                        cloud_name: `GitHub CDN (${GITHUB_REPO})`,
                        repo: GITHUB_REPO,
                        cdn: 'jsDelivr Edge CDN',
                        default_branch: ghData.default_branch
                    });
                }
                const errText = await ghTest.text();
                return sendJSON(res, 400, { success: false, error: 'GitHub connection failed', details: errText });
            } catch (e: any) {
                return sendJSON(res, 500, { success: false, error: 'Network error reaching GitHub', details: e.message });
            }
        }

        // ── GET /api/cloudinary/list ─ List media assets (GitHub CDN) ────────
        if (action === 'list' && req.method === 'GET') {
            try {
                const assets = await listGitHubCDNAssets();
                return sendJSON(res, 200, {
                    resources: assets,
                    total: assets.length,
                    cdn: 'jsDelivr Edge'
                });
            } catch (e: any) {
                console.error('List GitHub CDN assets error:', e);
                return sendJSON(res, 500, { error: 'Failed to list media from GitHub CDN', details: e.message });
            }
        }

        // ── POST /api/cloudinary/upload ─ Upload file (GitHub CDN + jsDelivr) ──
        if (action === 'upload' && req.method === 'POST') {
            const body = await parseBody(req);
            const { file, folder, public_id: reqPublicId } = body || {};
            if (!file) return sendJSON(res, 400, { error: 'file (base64 data URL) is required' });

            try {
                // Primary: Upload directly to GitHub CDN
                const uploadResult = await uploadToGitHubCDN(file, reqPublicId, folder);
                return sendJSON(res, 200, uploadResult);
            } catch (ghErr: any) {
                console.warn('GitHub CDN upload failed, checking fallback configs...', ghErr.message);
                
                // Secondary Fallback: Cloudinary config if available in database
                const client = await getPool().connect();
                let configs = [];
                try {
                    const result = await client.query(
                        'SELECT * FROM cloudinary_config ORDER BY is_active DESC, id ASC'
                    );
                    configs = result.rows;
                } finally {
                    client.release();
                }

                if (configs.length > 0) {
                    for (const config of configs) {
                        try {
                            const timestamp = Math.round(Date.now() / 1000);
                            const params: Record<string, any> = { timestamp };
                            if (folder) params.folder = folder;
                            if (reqPublicId) params.public_id = reqPublicId;

                            const sortedKeys = Object.keys(params).sort();
                            const strToSign = sortedKeys.map(k => `${k}=${params[k]}`).join('&') + config.api_secret;
                            const signature = crypto.createHash('sha1').update(strToSign).digest('hex');

                            const formParts = [
                                `file=${encodeURIComponent(file)}`,
                                `api_key=${config.api_key}`,
                                `timestamp=${timestamp}`,
                                `signature=${signature}`,
                            ];
                            if (folder) formParts.push(`folder=${encodeURIComponent(folder)}`);
                            if (reqPublicId) formParts.push(`public_id=${encodeURIComponent(reqPublicId)}`);

                            const uploadUrl = `https://api.cloudinary.com/v1_1/${config.cloud_name}/auto/upload`;
                            const uploadRes = await fetch(uploadUrl, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                                body: formParts.join('&')
                            });
                            
                            const uploadData: any = await uploadRes.json();
                            if (uploadRes.ok) {
                                return sendJSON(res, 200, {
                                    public_id: uploadData.public_id,
                                    secure_url: uploadData.secure_url,
                                    url: uploadData.url,
                                    width: uploadData.width,
                                    height: uploadData.height,
                                    format: uploadData.format,
                                    bytes: uploadData.bytes,
                                    resource_type: uploadData.resource_type,
                                    created_at: uploadData.created_at,
                                    _account: config.cloud_name
                                });
                            }
                        } catch (e: any) {
                            console.warn(`Cloudinary config fallback error:`, e.message);
                        }
                    }
                }

                return sendJSON(res, 500, { error: 'Media upload failed on GitHub CDN', details: ghErr.message });
            }
        }

        // ── POST /api/cloudinary/delete ─ Delete media asset(s) (GitHub CDN) ──
        if (action === 'delete' && req.method === 'POST') {
            const body = await parseBody(req);
            const { public_id, public_ids, sha } = body || {};
            
            const idsToDelete = Array.isArray(public_ids) ? public_ids : (public_id ? [public_id] : []);
            if (idsToDelete.length === 0) return sendJSON(res, 400, { error: 'public_id or public_ids is required' });

            const results = [];
            for (const id of idsToDelete) {
                const resStatus = await deleteFromGitHubCDN(id, sha);
                results.push({ id, status: 200, result: resStatus });
            }

            return sendJSON(res, 200, { success: true, results });
        }

        return sendJSON(res, 404, { error: `Cloudinary action '${action}' not found` });
    }

    // --- Generic CRUD ---
    // PUBLIC ACCESS OVERRIDE: Allow read-only access to specific resources without auth
    const publicResources = [
      'projects', 'project-categories', 
      'blog-posts', 'blog-categories',
      'skills', 'skill-categories',
      'experience', 'education',
      'certificates', 'certificate-categories',
      'social-links', 'profile', 'settings',
      'home-content', 'about-content',
      'wa-templates'
    ];

    // --- CACHING MIDDLEWARE (Vercel Edge Cache) ---
    // Apply Cache-Control headers for Public GET requests ONLY in PRODUCTION
    // EXCLUDE comments and interactions from caching to ensure real-time updates
    const isInteraction = action === 'comments' || action === 'like' || action === 'view';
    const isProduction = process.env.NODE_ENV === 'production';
    
    const tokenUser = verifyJwtToken(req);
    const isAuthenticated = Boolean(tokenUser);

    if (isProduction && req.method === 'GET' && publicResources.includes(resourceName) && !isInteraction && !isAuthenticated) {
        // Cache-Control: 
        // public: Can be cached by shared caches (CDNs)
        // s-maxage=3600: Cached in Edge Cache for 1 hour (60 mins)
        // stale-while-revalidate=600: Serve stale content while revalidating for 10 mins
        res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600');
    } else {
        res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');
    }

    const table = resources[resourceName];
    if (!table) {
      return sendJSON(res, 404, { error: `Resource '${resourceName}' not found` });
    }

    // Public contact form submission is allowed for POST /messages
    const isPublicMutation = (resourceName === 'messages' && req.method === 'POST');
    const requiresAuthForGet = !publicResources.includes(resourceName) && req.method === 'GET';
    const requiresAuthForMutation = req.method !== 'GET' && !isPublicMutation;

    if ((requiresAuthForGet || requiresAuthForMutation) && !isAuthenticated) {
      return sendJSON(res, 401, { error: 'Unauthorized. Valid admin authentication required.' });
    }

    // Handle Bulk Delete
    if (action === 'bulk' && req.method === 'DELETE') {
        const body = await parseBody(req);
        if (body.ids && Array.isArray(body.ids)) {
             await getDb().delete(table).where(inArray(table.id, body.ids));
             return sendJSON(res, 200, { success: true, count: body.ids.length });
        }
        return sendJSON(res, 400, { error: 'Invalid bulk delete request' });
    }

    switch (req.method) {
      case 'GET':
        // Allow public access for listed resources
        // If you had auth middleware, you would skip it here.
        // Since we don't have explicit auth middleware blocking connection in this file,
        // the issue might be just logic flow or table names.
        
        // MAPPING FIX: Map frontend resource names to Drizzle query keys (camelCase)
        // resourceName 'blog-posts' -> query key 'blogPosts'
        // resourceName 'project-categories' -> query key 'projectCategories'
        const queryKey = resourceName.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        
        if (action === 'by_slug') {
             const slug = query.slug as string;
             if (!slug) return sendJSON(res, 400, { error: 'Slug required' });
             
             if (!('slug' in table)) return sendJSON(res, 400, { error: 'Resource does not support slug' });

             const item = await getDb().query[queryKey]?.findFirst({
                where: eq((table as any).slug, slug),
                with: relationMap[resourceName]
             });
             
             if (!item) return sendJSON(res, 404, { error: 'Not found' });
             return sendJSON(res, 200, item);
        }

        if (id) {
          // Get One
          const item = await getDb().query[queryKey]?.findFirst({
            where: eq(table.id, Number(id)),
            with: relationMap[resourceName]
          });
          
          if (!item) {
             // Fallback
             const [directItem] = await getDb().select().from(table).where(eq(table.id, Number(id)));
             if(directItem) return sendJSON(res, 200, directItem);
             return sendJSON(res, 404, { error: 'Not found' });
          }
          return sendJSON(res, 200, item);
        } else {
          const singletonResources = ['profile', 'settings', 'home-content', 'about-content'];
          if (singletonResources.includes(resourceName)) {
            const [latest] = await withRetry(() =>
              getDb().select().from(table).orderBy(desc(table.id)).limit(1)
            );
            return sendJSON(res, 200, latest || {});
          }

          // Get Many (List)
          // Pagination & Search
          const page = Number(query.page) || 1;
          const limit = Number(query.limit) || 50; // Higher default for admin
          const offset = (page - 1) * limit;
          const search = query.search as string;

          // Build Query
          // Note: Drizzle dynamic query building is a bit verbose without query builder helpers
          // We will use basic select for now, maybe add search if simple
          
          let queryBuilder = getDb().select().from(table);
          
          if (search) {
             // Simple search on 'name' or 'title' if they exist
             if ('title' in table) {
                // queryBuilder.where(ilike(table.title, `%${search}%`)); // Needs where() chaining which is tricky in simple builder
             }
          }

          // Execute
          // For simplicity in this "one file", we just return all or simple limit
          // To implement full pagination properly we need more robust query construction
          const dbQuery = getDb().query[queryKey];
          let data;
          
          if (dbQuery) {
             let orderByClause: any = desc(table.id);
             
             // Custom sorting
             if ((resourceName === 'skill-categories' || resourceName === 'project-categories' || resourceName === 'projects') && 'order' in table) {
                 orderByClause = [asc((table as any).order), asc(table.id)];
             }

             data = await withRetry(() => dbQuery.findMany({
                orderBy: orderByClause,
                limit: limit,
                offset: offset,
                with: relationMap[resourceName]
             }));
          } else {
             // Fallback to simple select if query builder key not found (e.g. for simple tables like 'profile')
             // Re-use the queryBuilder defined above (line 714)
             data = await withRetry(() => queryBuilder.orderBy(desc(table.id)).limit(limit).offset(offset));
          }
          
          return sendJSON(res, 200, data);
        }

      case 'POST':
        const createBodyRaw = await parseBody(req);
        // console.log(`[DEBUG] Create ${resourceName} Raw Body:`, JSON.stringify(createBodyRaw));
        const createBody = processBodyDates(createBodyRaw);
        
        // Auto-generate slug if missing and required
        if ('slug' in table && !createBody.slug && (createBody.name || createBody.title)) {
            const source = createBody.name || createBody.title;
            createBody.slug = source.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }

        // console.log(`[DEBUG] Create ${resourceName} Processed Body:`, JSON.stringify(createBody));
        {
          const singletonResources = ['profile', 'settings', 'home-content', 'about-content'];
          if (singletonResources.includes(resourceName)) {
            const safeBody: any = { ...(createBody || {}) };
            delete safeBody.id;

            const [latest] = await withRetry(() =>
              getDb().select({ id: table.id }).from(table).orderBy(desc(table.id)).limit(1)
            );

            if (latest?.id) {
              if ('updatedAt' in table) {
                safeBody.updatedAt = new Date();
              }

              const [updatedItem] = await getDb()
                .update(table)
                .set(safeBody)
                .where(eq(table.id, Number(latest.id)))
                .returning();

              return sendJSON(res, 200, updatedItem);
            }

            const [newItem] = await getDb().insert(table).values(safeBody).returning();
            return sendJSON(res, 201, newItem);
          }
        }
        // Clean up body (remove unknown fields if necessary, or Drizzle ignores them?)
        // Drizzle insert usually fails if unknown keys exist? No, it ignores extra keys usually in values() if strictly typed? 
        // Actually Drizzle is strict. We might need to filter. 
        // For now, assume frontend sends correct data.
        try {
            const [newItem] = await getDb().insert(table).values(createBody).returning();
            return sendJSON(res, 201, newItem);
        } catch (createError: any) {
             console.error(`[DEBUG] Create Error for ${resourceName}:`, createError);
             throw createError;
        }

      case 'PUT':
      case 'PATCH':
        if (!id) return sendJSON(res, 400, { error: 'ID required for update' });
        const updateBodyRaw = await parseBody(req);
        // console.log(`[DEBUG] Update ${resourceName} ID ${id} Raw Body:`, JSON.stringify(updateBodyRaw));
        const updateBody = processBodyDates(updateBodyRaw);
        // console.log(`[DEBUG] Update ${resourceName} ID ${id} Processed Body:`, JSON.stringify(updateBody));
        
        try {
            const updateSet: any = { ...updateBody };
            if ('updatedAt' in table) {
              updateSet.updatedAt = new Date();
            }
            const [updatedItem] = await getDb().update(table)
              .set(updateSet) 
              .where(eq(table.id, Number(id)))
              .returning();
            return sendJSON(res, 200, updatedItem);
        } catch (updateError: any) {
            console.error(`[DEBUG] Update Error for ${resourceName}:`, updateError);
            throw updateError;
        }

      case 'DELETE':
        if (!id) return sendJSON(res, 400, { error: 'ID required for delete' });
        await getDb().delete(table).where(eq(table.id, Number(id)));
        return sendJSON(res, 200, { success: true });

      default:
        return sendJSON(res, 405, { error: 'Method not allowed' });
    }

  } catch (error: any) {
    console.error('CRITICAL API ERROR:', error?.code || error?.message || error);
    if (error?.cause) console.error('ERROR CAUSE:', error.cause);
    if (error?.stack) console.error(error.stack);

    if (res.headersSent) return;

    const tokenUser = verifyJwtToken(req);
    const isAuthenticated = Boolean(tokenUser);
    const isProduction = process.env.NODE_ENV === 'production';
    const msg = String(error?.message || '');
    const code = String(error?.code || '');
    const dbSignals = [
      'DB_UNAVAILABLE',
      'DATABASE_URL is not configured',
      'ECONNREFUSED',
      'ECONNRESET',
      'ETIMEDOUT',
      'ENOTFOUND',
      'Connection terminated',
      'timeout',
      'password authentication failed',
      'does not exist',
    ];
    const isDbError =
      msg === 'DB_UNAVAILABLE' ||
      dbSignals.some((s) => msg.includes(s)) ||
      dbSignals.some((s) => code.includes(s)) ||
      code === '57P01';

    if (isDbError) {
      return sendJSON(res, 503, isAuthenticated ? { error: 'Service temporarily unavailable', code: 'DB_UNAVAILABLE' } : { error: 'Service temporarily unavailable' });
    }

    if (isProduction && !isAuthenticated) {
      return sendJSON(res, 500, { error: 'Internal Server Error' });
    }

    return sendJSON(res, 500, { error: 'Internal Server Error', details: msg || 'Unknown error' });
  }
}
