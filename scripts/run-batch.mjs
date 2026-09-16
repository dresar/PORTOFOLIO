import { Pool } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { processProject } from './project-pipeline.mjs';

dotenv.config();

async function runBatch() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    console.log('--- Fetching candidate Web projects from Neon Database ---');
    // Select web projects (categoryId = 1) excluding SIRA Report and Web Portofolio Dinamis
    const res = await pool.query(`
      SELECT p.id, p.title, p.slug, p."categoryId", p."repoUrl", p."demoUrl", p."coverImage", p.gallery
      FROM project p
      WHERE p."categoryId" = 1
        AND p.id NOT IN (27, 29)
        AND p.title NOT ILIKE '%SIRA Report%'
        AND p.title NOT ILIKE '%Web Portofolio Dinamis%'
        AND p."repoUrl" IS NOT NULL
        AND p."repoUrl" != ''
        AND (p."coverImage" IS NULL OR p."coverImage" NOT LIKE '%_cover.webp%')
      ORDER BY 
        CASE 
          WHEN p.title NOT LIKE 'Automated backup%' THEN 0 
          ELSE 1 
        END,
        p.id ASC
      LIMIT 5
    `);

    console.log(`Found ${res.rows.length} projects to process in this batch:`);
    for (const r of res.rows) {
      console.log(`- [${r.id}] ${r.title} (${r.slug}) -> ${r.repoUrl}`);
    }

    if (res.rows.length === 0) {
      console.log('No pending web projects found to process.');
      return;
    }

    const results = [];
    for (const project of res.rows) {
      try {
        const result = await processProject(project, pool);
        results.push(result);
        console.log(`[SUCCESS] Completed project ${project.id}: ${project.title}`);
      } catch (err) {
        console.error(`[FAILED] Error processing project ${project.id}:`, err.message);
        results.push({ id: project.id, title: project.title, error: err.message, status: 'ERROR' });
      }
    }

    console.log('\n========================================');
    console.log('=== BATCH EXECUTION SUMMARY ===');
    console.table(results);
    console.log('========================================\n');
  } finally {
    await pool.end();
  }
}

runBatch().catch(err => {
  console.error('Fatal batch error:', err);
  process.exit(1);
});
