import { Pool } from 'pg';

// Reused across warm serverless invocations. Works with the connection
// string Vercel injects when a Postgres (Neon) database is attached to the
// project via the Storage tab — POSTGRES_URL, falling back to DATABASE_URL.
let pool: Pool | null = null;

export function getPool(): Pool {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('No database connection string found (POSTGRES_URL / DATABASE_URL).');
  }
  if (!pool) {
    pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  }
  return pool;
}
