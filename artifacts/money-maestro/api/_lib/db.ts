import pg from "pg";

const { Pool } = pg;

const g = globalThis as unknown as { __mmPool?: pg.Pool };

export function getPool(): pg.Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  if (!g.__mmPool) {
    g.__mmPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 3,
    });
  }
  return g.__mmPool;
}