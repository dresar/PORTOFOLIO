import pg from 'pg';

async function main() {
  const client = new pg.Client({
    connectionString: 'postgresql://neondb_owner:npg_4IsokTFSh0Gf@ep-lucky-meadow-a93qe14n-pooler.gwc.azure.neon.tech/neondb?sslmode=require'
  });
  await client.connect();

  const cats = await client.query('SELECT id, name FROM project_category');
  const catMap = Object.fromEntries(cats.rows.map(c => [c.id, c.name]));

  const res = await client.query('SELECT id, title, slug, "categoryId", "coverImage" FROM project WHERE "coverImage" LIKE \'%uploads/projects%\' ORDER BY id ASC LIMIT 30');
  
  const list = res.rows.map(r => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    category: catMap[r.categoryId] || 'Web App',
    coverImage: r.coverImage
  }));

  import('fs').then(fs => {
    fs.writeFileSync('scripts/30_projects.json', JSON.stringify(list, null, 2));
    console.log(`Saved scripts/30_projects.json with ${list.length} projects.`);
  });
  await client.end();
}

main().catch(console.error);
