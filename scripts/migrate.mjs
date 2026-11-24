// Applies pending SQL migrations from db/migrations in filename order.
// Plain JS (no build step) so it runs inside the production image via Dokku's predeploy hook.
import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const MIGRATIONS_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "db", "migrations");
const LOCK_ID = 727_001; // arbitrary constant for pg_advisory_lock

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("migrate: DATABASE_URL is not set");
    process.exit(1);
  }
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query("SELECT pg_advisory_lock($1)", [LOCK_ID]);
    await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      name text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )`);
    const { rows } = await client.query("SELECT name FROM schema_migrations");
    const applied = new Set(rows.map((r) => r.name));
    const files = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith(".sql")).sort();
    const pending = files.filter((f) => !applied.has(f));

    if (pending.length === 0) {
      console.log("migrate: database is up to date");
      return;
    }
    for (const file of pending) {
      const sql = await readFile(join(MIGRATIONS_DIR, file), "utf8");
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
        await client.query("COMMIT");
        console.log(`migrate: applied ${file}`);
      } catch (err) {
        await client.query("ROLLBACK");
        throw new Error(`migrate: ${file} failed: ${err.message}`);
      }
    }
  } finally {
    await client.query("SELECT pg_advisory_unlock($1)", [LOCK_ID]).catch(() => {});
    await client.end();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
