import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './schema';
import * as dotenv from 'dotenv';

if (!process.env.DATABASE_URL) {
  dotenv.config({ path: '.env.local' });
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not defined.');
}

const pool = new Pool({ connectionString });

export const db = drizzle(pool, { schema });
