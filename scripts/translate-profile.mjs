import dotenv from 'dotenv';
import fs from 'fs';
import { Pool } from '@neondatabase/serverless';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const dbEnPath = 'src/locales/db_en.json';
const currentDb = JSON.parse(fs.readFileSync(dbEnPath, 'utf8'));

async function run() {
  const client = await pool.connect();
  const profileRes = await client.query('SELECT * FROM profile ORDER BY id DESC LIMIT 1');
  const expRes = await client.query('SELECT id, role, company, description FROM experience ORDER BY id ASC');
  const eduRes = await client.query('SELECT id, degree, field FROM education ORDER BY id ASC');

  const p = profileRes.rows[0] || {};
  let roles = ['Senior Fullstack Developer', 'System Analyst', 'AI Engineer'];
  try {
    if (p.role) roles = typeof p.role === 'string' ? JSON.parse(p.role) : p.role;
  } catch {}

  const payload = {
    profile: {
      greeting: p.greeting || 'Halo, Saya',
      role: roles,
      shortBio: p.shortBio,
      bio: p.bio
    },
    experiences: Object.fromEntries(expRes.rows.map(e => [e.id, { role: e.role, company: e.company }])),
    educations: Object.fromEntries(eduRes.rows.map(e => [e.id, { degree: e.degree, field: e.field }]))
  };

  console.log('Sending Profile & Education payload to 9Router...');
  const res = await fetch(process.env.AI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + process.env.AI_API_KEY
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a professional translator for technical portfolios. Translate all Indonesian values to fluent, modern, natural English. Retain all JSON keys and structure intact. Return ONLY raw JSON.'
        },
        { role: 'user', content: JSON.stringify(payload) }
      ],
      stream: false
    })
  });

  const txt = await res.text();
  let cleanTxt = txt;
  const doneIdx = cleanTxt.indexOf('data: [DONE]');
  if (doneIdx !== -1) {
    cleanTxt = cleanTxt.slice(0, doneIdx).trim();
  }
  const data = JSON.parse(cleanTxt);
  let content = data.choices[0].message.content.trim();
  content = content.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
  const parsed = JSON.parse(content);

  currentDb.profile = parsed.profile;
  currentDb.educations = parsed.educations;
  if (!currentDb.experiences) currentDb.experiences = {};
  for (const id of Object.keys(parsed.experiences || {})) {
    if (!currentDb.experiences[id]) currentDb.experiences[id] = {};
    currentDb.experiences[id].role = parsed.experiences[id].role;
    currentDb.experiences[id].company = parsed.experiences[id].company;
  }

  fs.writeFileSync(dbEnPath, JSON.stringify(currentDb, null, 2), 'utf8');
  console.log('🎉 Successfully updated Profile, Education, and Experiences in db_en.json!');
  client.release();
  await pool.end();
}

run().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
