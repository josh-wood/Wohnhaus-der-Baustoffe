import "server-only";
import { Pool, types } from "pg";

// DATE (oid 1082) as plain "YYYY-MM-DD" string – avoids time-zone shifts of JS Date.
types.setTypeParser(1082, (value: string) => value);

// Reuse one pool across hot reloads in development.
const globalForDb = globalThis as unknown as { pgPool?: Pool };

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  return new Pool({
    connectionString,
    max: 5,
    connectionTimeoutMillis: 3_000,
    idleTimeoutMillis: 30_000,
  });
}

export function getPool(): Pool {
  if (!globalForDb.pgPool) globalForDb.pgPool = createPool();
  return globalForDb.pgPool;
}

/** Postgres SQLSTATE for exclusion constraint violations (overlapping booking). */
export const PG_EXCLUSION_VIOLATION = "23P01";
