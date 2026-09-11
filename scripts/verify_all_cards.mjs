import fs from 'fs';
import path from 'path';
import pg from 'pg';

async function verify() {
  const client = new pg.Client({
    connectionString: 'postgresql://neondb_owner:npg_4IsokTFSh0Gf@ep-lucky-meadow-a93qe14n-pooler.gwc.azure.neon.tech/neondb?sslmode=require'
  });
  await client.connect();

  const res = await client.query('SELECT id, title, slug, "coverImage" FROM project WHERE "coverImage" LIKE \'%uploads/projects%\'');
  let validCount = 0;
  let missing = [];

  for (const r of res.rows) {
    const filename = r.coverImage.split('/').pop();
    const filePath = path.resolve('public/uploads/projects', filename);
    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      if (stat.size > 50000) {
        validCount++;
      } else {
        missing.push({ id: r.id, slug: r.slug, issue: `File too small: ${stat.size}B` });
      }
    } else {
      missing.push({ id: r.id, slug: r.slug, issue: 'File does not exist' });
    }
  }

  console.log(`✅ Valid HD AI Project Images: ${validCount} / ${res.rows.length}`);
  if (missing.length > 0) {
    console.warn(`⚠️ Issues found in ${missing.length} projects:`, missing);
  } else {
    console.log(`🎉 100% of projects have valid, high-definition AI preview images (>50KB)!`);
  }

  await client.end();
}

verify().catch(console.error);
