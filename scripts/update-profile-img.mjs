import dotenv from 'dotenv';
import { Pool } from '@neondatabase/serverless';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  const sql = `
    UPDATE profile
    SET "heroImage" = $1,
        "aboutImage" = $1,
        "fullName" = $2
    WHERE id = 3
    RETURNING id, "fullName", "heroImage", "aboutImage";
  `;
  const values = [
    'https://res.cloudinary.com/dpgybasuh/image/upload/v1783171293/portfolio/j8e5fm2qiwwbnhvu63u9.jpg',
    'Eka Syarif Maulana, S.Kom'
  ];
  const res = await client.query(sql, values);
  console.log('✅ Updated Profile in Neon DB:', JSON.stringify(res.rows[0], null, 2));
  client.release();
  await pool.end();
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Error updating profile:', err);
  process.exit(1);
});
