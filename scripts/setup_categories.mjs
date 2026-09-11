import { neon } from '@neondatabase/serverless';

const DATABASE_URL = 'postgresql://neondb_owner:npg_4IsokTFSh0Gf@ep-lucky-meadow-a93qe14n-pooler.gwc.azure.neon.tech/neondb?sslmode=require&channel_binding=require';

async function main() {
  const sql = neon(DATABASE_URL);
  
  const existing = await sql`SELECT id, name, slug FROM project_category`;
  console.log('Existing categories:', existing);

  const desired = [
    { name: 'Web App', slug: 'web-app' },
    { name: 'Mobile App', slug: 'mobile-app' },
    { name: 'UI/UX Design', slug: 'ui-ux' },
    { name: 'AI & Machine Learning', slug: 'ai-ml' },
    { name: 'Automation & Bots', slug: 'automation-bots' },
    { name: 'Backend & APIs', slug: 'backend-apis' },
    { name: 'IoT & Hardware', slug: 'iot-hardware' }
  ];

  for (const d of desired) {
    const found = existing.find(e => e.slug === d.slug);
    if (!found) {
      const inserted = await sql`INSERT INTO project_category (name, slug) VALUES (${d.name}, ${d.slug}) RETURNING id, name, slug`;
      console.log('Inserted category:', inserted[0]);
    }
  }

  const finalCats = await sql`SELECT id, name, slug FROM project_category ORDER BY id ASC`;
  console.log('All categories now:', finalCats);
}

main().catch(console.error);
