// Integration tests against the local Postgres (docker compose). Requires DATABASE_URL.
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import pg from "pg";

const url = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: url });

async function insert(windowId: number, start: string, end: string, email = "test@example.com") {
  return pool.query(
    "INSERT INTO bookings (window_id, start_date, end_date, email) VALUES ($1, $2, $3, $4) RETURNING id",
    [windowId, start, end, email],
  );
}

async function errorCode(p: Promise<unknown>): Promise<string | undefined> {
  try {
    await p;
    return undefined;
  } catch (err) {
    return (err as { code?: string }).code;
  }
}

describe.skipIf(!url)("bookings schema", () => {
  beforeAll(async () => {
    await pool.query("SELECT 1 FROM bookings LIMIT 1"); // fails fast if not migrated
  });
  beforeEach(async () => {
    await pool.query("TRUNCATE bookings RESTART IDENTITY");
  });
  afterAll(async () => {
    await pool.query("TRUNCATE bookings RESTART IDENTITY");
    await pool.end();
  });

  it("stores a booking with timestamp", async () => {
    await insert(1, "2026-12-10", "2026-12-12", "test1@example.com");
    const { rows } = await pool.query("SELECT window_id, email, created_at FROM bookings");
    expect(rows).toHaveLength(1);
    expect(rows[0].created_at).toBeInstanceOf(Date);
  });

  it("rejects overlapping ranges on the same window (23P01)", async () => {
    await insert(2, "2027-01-10", "2027-01-15");
    expect(await errorCode(insert(2, "2027-01-15", "2027-01-20"))).toBe("23P01"); // inclusive end
    expect(await errorCode(insert(2, "2027-01-01", "2027-01-31"))).toBe("23P01"); // enclosing
  });

  it("allows adjacent ranges and the same range on another window", async () => {
    await insert(3, "2027-02-01", "2027-02-05");
    expect(await errorCode(insert(3, "2027-02-06", "2027-02-10"))).toBeUndefined();
    expect(await errorCode(insert(4, "2027-02-01", "2027-02-05"))).toBeUndefined();
  });

  it("lets exactly one of two concurrent overlapping inserts win", async () => {
    const results = await Promise.allSettled([
      insert(5, "2027-03-01", "2027-03-10"),
      insert(5, "2027-03-05", "2027-03-12"),
    ]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
  });

  it("rejects invalid window ids, reversed ranges and dates outside the campaign (23514)", async () => {
    expect(await errorCode(insert(7, "2027-01-01", "2027-01-02"))).toBe("23514");
    expect(await errorCode(insert(1, "2027-01-05", "2027-01-01"))).toBe("23514");
    expect(await errorCode(insert(1, "2026-11-30", "2026-12-02"))).toBe("23514");
    expect(await errorCode(insert(1, "2027-07-30", "2027-08-01"))).toBe("23514");
  });
});
