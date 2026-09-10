import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from '@neondatabase/serverless';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const AI_API_KEY = process.env.AI_API_KEY || process.env.AI_GATEWAY_API_KEY;
const AI_API_URL = process.env.AI_API_URL || 'https://9router.serverinka.cloud/v1/chat/completions';
const AI_MODEL = process.env.AI_MODEL || process.env.AI_GATEWAY_MODEL || 'MY-COMBO';
const DATABASE_URL = process.env.DATABASE_URL;

const pool = new Pool({ connectionString: DATABASE_URL });
const outPath = path.join(rootDir, 'src', 'locales', 'db_en.json');

async function translateJsonBatch(jsonObject) {
  try {
    const res = await fetch(AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are an expert technical translator for a software engineer portfolio. Translate all Indonesian text values in the following JSON to fluent, professional, modern English suitable for international recruiters.
Rules:
1. Retain all JSON keys, IDs, HTML tags, styling, numbers, and emojis exactly as they are.
2. Translate ONLY the Indonesian prose/content values.
3. Return ONLY the raw valid JSON object without markdown code blocks, backticks, or preamble.`
          },
          {
            role: 'user',
            content: JSON.stringify(jsonObject)
          }
        ],
        stream: false
      }),
      signal: AbortSignal.timeout(60000)
    });

    if (!res.ok) {
      console.error('9Router status error:', res.status);
      return jsonObject;
    }

    const rawText = await res.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      const clean = rawText.replace(/data:\s*\[DONE\][\s\S]*$/, '').trim();
      data = JSON.parse(clean);
    }

    let content = data?.choices?.[0]?.message?.content?.trim();
    if (content.startsWith('```json')) content = content.slice(7);
    if (content.startsWith('```')) content = content.slice(3);
    if (content.endsWith('```')) content = content.slice(0, -3);
    content = content.trim();

    return JSON.parse(content);
  } catch (err) {
    console.error('Batch translation error:', err.message);
    return jsonObject;
  }
}

async function run() {
  console.log('🚀 Connecting to Neon PostgreSQL...');
  const client = await pool.connect();
  console.log('⚡ Using 9Router AI Gateway Model:', AI_MODEL);

  const finalOutput = {
    profile: {},
    projects: {},
    experiences: {},
    educations: {},
    certificates: {},
    blog_posts: {}
  };

  // --- 1. Fetch Profile, Experience, Education ---
  console.log('\n📦 Preparing Batch 1: Profile, Experience, Education...');
  const profileRes = await client.query('SELECT * FROM profile ORDER BY id DESC LIMIT 1');
  const expRes = await client.query('SELECT id, role, company, description FROM experience ORDER BY id ASC');
  const eduRes = await client.query('SELECT id, institution, degree, field, description FROM education ORDER BY id ASC');

  const batch1 = {
    profile: profileRes.rows[0] ? {
      greeting: profileRes.rows[0].greeting || 'Halo, Saya',
      role: (() => {
        try {
          return typeof profileRes.rows[0].role === 'string' ? JSON.parse(profileRes.rows[0].role) : profileRes.rows[0].role;
        } catch {
          return [profileRes.rows[0].role];
        }
      })(),
      shortBio: profileRes.rows[0].shortBio,
      bio: profileRes.rows[0].bio
    } : {},
    experiences: Object.fromEntries(expRes.rows.map(e => [e.id, { role: e.role, company: e.company, description: e.description }])),
    educations: Object.fromEntries(eduRes.rows.map(e => [e.id, { degree: e.degree, field: e.field, description: e.description }]))
  };

  console.log('⚡ Sending Batch 1 to 9Router AI...');
  const translatedBatch1 = await translateJsonBatch(batch1);
  if (translatedBatch1.profile) finalOutput.profile = translatedBatch1.profile;
  if (translatedBatch1.experiences) finalOutput.experiences = translatedBatch1.experiences;
  if (translatedBatch1.educations) finalOutput.educations = translatedBatch1.educations;
  fs.writeFileSync(outPath, JSON.stringify(finalOutput, null, 2), 'utf8');
  console.log('✓ Batch 1 translated & saved to db_en.json!');

  // --- 2. Fetch Projects ---
  console.log('\n📦 Preparing Batch 2: Projects...');
  const projRes = await client.query('SELECT id, title, description FROM project ORDER BY id ASC');
  const batch2 = {
    projects: Object.fromEntries(projRes.rows.map(p => [p.id, { title: p.title, description: p.description }]))
  };

  console.log('⚡ Sending Batch 2 to 9Router AI...');
  const translatedBatch2 = await translateJsonBatch(batch2);
  if (translatedBatch2.projects) finalOutput.projects = translatedBatch2.projects;
  fs.writeFileSync(outPath, JSON.stringify(finalOutput, null, 2), 'utf8');
  console.log('✓ Batch 2 translated & saved to db_en.json!');

  // --- 3. Fetch Certificates & Blog Posts ---
  console.log('\n📦 Preparing Batch 3: Certificates & Blog Posts...');
  const certRes = await client.query('SELECT id, name, issuer FROM certificate ORDER BY id ASC');
  const blogRes = await client.query('SELECT id, title, excerpt FROM blog_post ORDER BY id ASC');

  const batch3 = {
    certificates: Object.fromEntries(certRes.rows.map(c => [c.id, { name: c.name, issuer: c.issuer }])),
    blog_posts: Object.fromEntries(blogRes.rows.map(b => [b.id, { title: b.title, excerpt: b.excerpt }]))
  };

  console.log('⚡ Sending Batch 3 to 9Router AI...');
  const translatedBatch3 = await translateJsonBatch(batch3);
  if (translatedBatch3.certificates) finalOutput.certificates = translatedBatch3.certificates;
  if (translatedBatch3.blog_posts) finalOutput.blog_posts = translatedBatch3.blog_posts;
  fs.writeFileSync(outPath, JSON.stringify(finalOutput, null, 2), 'utf8');
  console.log('✓ Batch 3 translated & saved to db_en.json!');

  console.log(`\n🎉 ALL DONE! Complete bilingual database content written to: ${outPath}`);

  client.release();
  await pool.end();
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
