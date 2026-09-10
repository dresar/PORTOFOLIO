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

if (!AI_API_KEY || !DATABASE_URL) {
  console.error('Missing AI_API_KEY or DATABASE_URL in .env');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });
const outPath = path.join(rootDir, 'src', 'locales', 'db_en.json');

const translations = {
  profile: {},
  projects: {},
  experiences: {},
  educations: {},
  certificates: {},
  blog_posts: {},
  categories: {}
};

if (fs.existsSync(outPath)) {
  try {
    const existing = JSON.parse(fs.readFileSync(outPath, 'utf8'));
    Object.assign(translations, existing);
    console.log('Loaded existing db_en.json cache.');
  } catch (e) {}
}

function save() {
  fs.writeFileSync(outPath, JSON.stringify(translations, null, 2), 'utf8');
}

async function translateText(text, maxChars = 3000) {
  if (!text || typeof text !== 'string' || !text.trim()) return text;
  if (text.length <= 2 || /^[\d\s\-_.,:/]+$/.test(text)) return text;

  // Truncate if gigantic to avoid 9Router gateway timeout
  const truncatedText = text.length > maxChars ? text.slice(0, maxChars) : text;

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
            content: 'You are a professional translator. Translate this Indonesian text to fluent English for a tech portfolio. Preserve HTML tags, emojis, and code blocks exactly. Return ONLY the translated text without commentary.'
          },
          {
            role: 'user',
            content: truncatedText
          }
        ],
        stream: false
      }),
      signal: AbortSignal.timeout(20000)
    });

    if (!res.ok) {
      console.warn(`Translation status: ${res.status}`);
      return text;
    }

    const rawText = await res.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      const clean = rawText.replace(/data:\s*\[DONE\][\s\S]*$/, '').trim();
      data = JSON.parse(clean);
    }

    const translated = data?.choices?.[0]?.message?.content?.trim();
    return translated || text;
  } catch (err) {
    console.warn(`Translation timed out/failed: ${err.message}`);
    return text;
  }
}

async function run() {
  console.log('Connecting to Neon PostgreSQL...');
  const client = await pool.connect();
  console.log('Using 9Router AI Gateway:', AI_API_URL, 'Model:', AI_MODEL);

  // 1. Profile
  if (!translations.profile.bio) {
    console.log('\n--- Translating Profile ---');
    const profileRes = await client.query('SELECT * FROM profile ORDER BY id DESC LIMIT 1');
    if (profileRes.rows.length > 0) {
      const p = profileRes.rows[0];
      translations.profile = {
        greeting: await translateText(p.greeting || 'Halo, Saya'),
        bio: await translateText(p.bio),
        shortBio: await translateText(p.shortBio),
      };
      if (p.role) {
        try {
          const rolesArr = typeof p.role === 'string' ? JSON.parse(p.role) : p.role;
          if (Array.isArray(rolesArr)) {
            const transRoles = [];
            for (const r of rolesArr) {
              transRoles.push(await translateText(r));
            }
            translations.profile.role = transRoles;
          }
        } catch {
          translations.profile.role = await translateText(p.role);
        }
      }
      save();
      console.log('✓ Profile translated and saved.');
    }
  }

  // 2. Experience
  console.log('\n--- Translating Experiences ---');
  const expRes = await client.query('SELECT * FROM experience ORDER BY id ASC');
  for (const exp of expRes.rows) {
    if (translations.experiences[exp.id]) {
      console.log(`Skipping existing Experience ${exp.id}`);
      continue;
    }
    console.log(`Translating Experience ${exp.id}: ${exp.company}...`);
    translations.experiences[exp.id] = {
      role: await translateText(exp.role),
      company: await translateText(exp.company),
      description: await translateText(exp.description, 2000)
    };
    save();
  }
  console.log(`✓ Experiences done.`);

  // 3. Education
  console.log('\n--- Translating Education ---');
  const eduRes = await client.query('SELECT * FROM education ORDER BY id ASC');
  for (const edu of eduRes.rows) {
    if (translations.educations[edu.id]) {
      console.log(`Skipping existing Education ${edu.id}`);
      continue;
    }
    console.log(`Translating Education ${edu.id}: ${edu.institution}...`);
    translations.educations[edu.id] = {
      degree: await translateText(edu.degree),
      field: await translateText(edu.field),
      description: await translateText(edu.description)
    };
    save();
  }
  console.log(`✓ Education done.`);

  // 4. Projects
  console.log('\n--- Translating Projects ---');
  const projRes = await client.query('SELECT id, title, description, content FROM project ORDER BY id ASC');
  for (const proj of projRes.rows) {
    if (translations.projects[proj.id]) {
      console.log(`Skipping existing Project ${proj.id}`);
      continue;
    }
    console.log(`Translating Project ${proj.id}: ${proj.title}...`);
    translations.projects[proj.id] = {
      title: await translateText(proj.title),
      description: await translateText(proj.description),
      content: await translateText(proj.content, 2500)
    };
    save();
  }
  console.log(`✓ Projects done.`);

  // 5. Certificates
  console.log('\n--- Translating Certificates ---');
  const certRes = await client.query('SELECT id, name, issuer FROM certificate ORDER BY id ASC');
  for (const cert of certRes.rows) {
    if (translations.certificates[cert.id]) {
      continue;
    }
    translations.certificates[cert.id] = {
      name: await translateText(cert.name),
      issuer: await translateText(cert.issuer)
    };
    save();
  }
  console.log(`✓ Certificates done.`);

  // 6. Blog Posts
  console.log('\n--- Translating Blog Posts ---');
  const blogRes = await client.query('SELECT id, title, excerpt FROM blog_post ORDER BY id ASC');
  for (const post of blogRes.rows) {
    if (translations.blog_posts[post.id]) {
      continue;
    }
    translations.blog_posts[post.id] = {
      title: await translateText(post.title),
      excerpt: await translateText(post.excerpt)
    };
    save();
  }
  console.log(`✓ Blog posts done.`);

  save();
  console.log(`\n🎉 Success! All translations saved to ${outPath}`);

  client.release();
  await pool.end();
}

run().catch(err => {
  console.error('Fatal error in translation pipeline:', err);
  process.exit(1);
});
