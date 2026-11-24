import { afterAll, beforeEach, describe, expect, it } from "vitest";
import pg from "pg";
import { createBooking, getBookedRanges, isRangeFree } from "@/lib/bookings";
import { getPool } from "@/lib/db";

const url = process.env.DATABASE_URL;

describe.skipIf(!url)("bookings lib", () => {
  const admin = new pg.Pool({ connectionString: url });
  beforeEach(async () => {
    await admin.query("TRUNCATE bookings RESTART IDENTITY");
    await admin.query(
      `INSERT INTO bookings (window_id, start_date, end_date, email) VALUES
        (1, '2027-01-10', '2027-01-15', 'test1@example.com'),
        (1, '2026-12-20', '2026-12-24', 'test2@example.com'),
        (2, '2027-03-01', '2027-03-03', 'test3@example.com')`,
    );
  });
  afterAll(async () => {
    await admin.query("TRUNCATE bookings RESTART IDENTITY");
    await admin.end();
    await getPool().end();
  });

  it("returns booked ranges per window as ISO strings, sorted", async () => {
    expect(await getBookedRanges(1)).toEqual([
      { from: "2026-12-20", to: "2026-12-24" },
      { from: "2027-01-10", to: "2027-01-15" },
    ]);
    expect(await getBookedRanges(3)).toEqual([]);
  });

  it("pre-checks availability", async () => {
    expect(await isRangeFree(1, { from: "2027-01-15", to: "2027-01-16" })).toBe(false);
    expect(await isRangeFree(1, { from: "2027-01-16", to: "2027-01-20" })).toBe(true);
    expect(await isRangeFree(2, { from: "2027-01-10", to: "2027-01-15" })).toBe(true);
  });

  it("creates a booking with timestamp", async () => {
    const r = await createBooking({ windowId: 4, from: "2027-04-01", to: "2027-04-03", email: "test4@example.com" });
    expect(r.ok).toBe(true);
    const { rows } = await admin.query("SELECT window_id, start_date::text, end_date::text, email, created_at FROM bookings WHERE window_id = 4");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ window_id: 4, start_date: "2027-04-01", end_date: "2027-04-03", email: "test4@example.com" });
    expect(rows[0].created_at).toBeInstanceOf(Date);
  });

  it("reports overlaps as taken, other windows succeed", async () => {
    expect(await createBooking({ windowId: 1, from: "2027-01-14", to: "2027-01-18", email: "x@example.com" })).toEqual({ ok: false, reason: "taken" });
    expect((await createBooking({ windowId: 5, from: "2027-01-10", to: "2027-01-15", email: "x@example.com" })).ok).toBe(true);
  });

  it("reports check violations as invalid", async () => {
    expect(await createBooking({ windowId: 9, from: "2027-01-01", to: "2027-01-02", email: "x@example.com" })).toEqual({ ok: false, reason: "invalid" });
  });

  it("lets exactly one of N concurrent overlapping bookings succeed – never a deadlock error", async () => {
    for (let round = 0; round < 15; round++) {
      await admin.query("DELETE FROM bookings WHERE window_id = 6");
      const n = round % 2 ? 20 : 10;
      const results = await Promise.all(
        Array.from({ length: n }, (_, i) =>
          createBooking({ windowId: 6, from: "2027-05-01", to: `2027-05-${String(5 + i).padStart(2, "0")}`, email: `t${i}@example.com` }),
        ),
      );
      expect(results.filter((r) => r.ok), `round ${round}`).toHaveLength(1);
      expect(results.filter((r) => !r.ok && r.reason === "taken"), `round ${round}`).toHaveLength(n - 1);
    }
  });
});
