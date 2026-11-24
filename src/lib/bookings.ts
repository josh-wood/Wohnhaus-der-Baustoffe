import "server-only";
import { getPool, PG_EXCLUSION_VIOLATION } from "@/lib/db";
import type { DateRange } from "@/lib/campaign";

/** All booked ranges of a window, sorted by start date. */
export async function getBookedRanges(windowId: number): Promise<DateRange[]> {
  const { rows } = await getPool().query<{ from: string; to: string }>(
    `SELECT start_date AS "from", end_date AS "to"
       FROM bookings
      WHERE window_id = $1
      ORDER BY start_date`,
    [windowId],
  );
  return rows;
}

/** Pre-check only – the exclusion constraint is the authoritative guard (spec 04). */
export async function isRangeFree(windowId: number, range: DateRange): Promise<boolean> {
  const { rows } = await getPool().query(
    `SELECT 1 FROM bookings
      WHERE window_id = $1
        AND daterange(start_date, end_date, '[]') && daterange($2::date, $3::date, '[]')
      LIMIT 1`,
    [windowId, range.from, range.to],
  );
  return rows.length === 0;
}

export type CreateBookingResult = { ok: true; id: string } | { ok: false; reason: "taken" | "invalid" };

const PG_CHECK_VIOLATION = "23514";
const LOCK_NAMESPACE = 727; // arbitrary, keeps our advisory locks apart from others

/**
 * Inserts a booking.
 * - A per-window advisory lock serialises concurrent inserts for the same window. Without it,
 *   parallel inserts checked by the exclusion constraint can deadlock (Postgres then aborts
 *   one after `deadlock_timeout`, 1 s) – the loser would get a generic error instead of "taken".
 * - The exclusion constraint `bookings_no_overlap` remains the authoritative guard.
 */
export async function createBooking(input: {
  windowId: number;
  from: string;
  to: string;
  email: string;
}): Promise<CreateBookingResult> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock($1, $2)", [LOCK_NAMESPACE, input.windowId]);
    const { rows } = await client.query<{ id: string }>(
      `INSERT INTO bookings (window_id, start_date, end_date, email)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [input.windowId, input.from, input.to, input.email],
    );
    await client.query("COMMIT");
    return { ok: true, id: rows[0].id };
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    const code = (err as { code?: string }).code;
    if (code === PG_EXCLUSION_VIOLATION) return { ok: false, reason: "taken" };
    if (code === PG_CHECK_VIOLATION) return { ok: false, reason: "invalid" };
    throw err;
  } finally {
    client.release();
  }
}

export type BookingRow = {
  id: string;
  windowId: number;
  from: string;
  to: string;
  email: string;
  createdAt: Date;
};

/** All bookings, newest first (admin list + CSV export). */
export async function listBookings(): Promise<BookingRow[]> {
  const { rows } = await getPool().query<BookingRow>(
    `SELECT id, window_id AS "windowId", start_date AS "from", end_date AS "to", email, created_at AS "createdAt"
       FROM bookings
      ORDER BY created_at DESC, id DESC`,
  );
  return rows;
}
