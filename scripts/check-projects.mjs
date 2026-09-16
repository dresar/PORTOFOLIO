import { Pool } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const catsRes = await pool.query('SELECT * FROM project_category ORDER BY id ASC');
    console.log('=== CATEGORIES ===');
    console.log(catsRes.rows);

    const res = await pool.query(`
      SELECT p.id, p.title, p.slug, p."categoryId", c.name as category_name, p."repoUrl", p."demoUrl", p."coverImage", p.gallery
      FROM project p
      LEFT JOIN project_category c ON p."categoryId" = c.id
      WHERE p."categoryId" = 1
        AND p.title NOT ILIKE '%SIRA Report%'
        AND p.title NOT ILIKE '%Web Portofolio Dinamis%'
      ORDER BY p.id ASC
    `);
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
