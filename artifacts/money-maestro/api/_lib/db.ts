import pg from "pg";

const { Pool, types } = pg;

// Postgres "date" columns (given_date, due_date) default to being parsed
// into JS Date objects, which then serialize to full ISO timestamps
// ("2026-06-07T00:00:00.000Z") instead of plain "2026-06-07" strings.
// The frontend expects plain date strings (that's what Supabase used to
// hand back), so tell pg to leave type 1082 (date) as the raw string.
types.setTypeParser(1082, (val: string) => val);

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