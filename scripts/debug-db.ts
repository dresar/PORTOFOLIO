import { Pool, neonConfig } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import path from 'path';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;
dotenv.config({ path: path.join(process.cwd(), '.env') });

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) {
  console.error("DATABASE_URL not found in .env");
  process.exit(1);
}

const pool = new Pool({
  connectionString: DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'user'
    `);
    console.log("User table columns verified:", res.rows.map(r => r.column_name));

    const users = await pool.query(`SELECT id, email, name, "isActive", (pin IS NOT NULL) as has_pin FROM "user"`);
    console.log("Active users in DB:", users.rows);
  } catch (e) {
    console.error("Failed to query database:", e);
  } finally {
    await pool.end();
  }
}

main();


