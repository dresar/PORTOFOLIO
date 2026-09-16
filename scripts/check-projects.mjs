import { Pool } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const catsRes = await pool.query('SELECT * FROM project_category ORDER BY id ASC');
    console.log('=== CATEGORIES ===');
    console.log(catsRes.rows);

    const res = await pool.query('SELECT id, title, slug, "coverImage", gallery FROM project WHERE id IN (18, 21, 22, 28, 32) ORDER BY id ASC');
    console.log('=== VERIFIED 5 UPDATED PROJECTS IN DB ===');
    for (const p of res.rows) {
      console.log(`[ID ${p.id}] ${p.title} (${p.slug})`);
      console.log(`  Cover: ${p.coverImage}`);
      console.log(`  Gallery: ${p.gallery}`);
    }
    console.log(`\n=== WEB APP CANDIDATE PROJECTS: ${res.rows.length} ===`);
    for (const r of res.rows) {
      console.log(JSON.stringify({
        id: r.id,
        title: r.title,
        slug: r.slug,
        repoUrl: r.repoUrl,
        demoUrl: r.demoUrl,
        coverImage: r.coverImage ? r.coverImage.substring(0, 70) : null
      }));
    }
  } finally {
    await pool.end();
  }
}

main().catch(console.error);
