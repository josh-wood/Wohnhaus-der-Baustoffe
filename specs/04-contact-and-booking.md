# 04 – Contact & booking

## Goal
The visitor enters an e-mail address and the booking is stored – without double bookings.

## Scope
- Route `/fenster/[id]/kontakt?von=&bis=`; summary „Fenster {id}, {von} – {bis}" + „Ändern" link back to the calendar.
- Form: e-mail field (`type="email"`, `autocomplete="email"`), short privacy note with link to `/datenschutz`, button „Absenden".
- Server action `createBooking`:
  1. Validate with `zod` (window 1–6, dates ISO, `von ≤ bis`, within campaign period, valid e-mail, campaign open).
  2. `INSERT INTO bookings …` (window, range, lower-cased e-mail; `created_at` by DB).
  3. On SQLSTATE `23P01` → show „Dieses Zimmer ist bereits gebucht" with link back to the calendar.
  4. On success → send mail (spec 05) → redirect to `/bestaetigung`.
- Invalid/missing query params → redirect to `/fenster/{id}`.
- Double-submit protection (button disabled while pending).

## Acceptance criteria
- [x] Valid input creates exactly one row with window, range, e-mail, timestamp.
- [x] Two concurrent requests for overlapping ranges on the same window → exactly one succeeds (integration test).
- [x] Same range on a different window succeeds.
- [x] Manipulated params (window 7, dates outside the period, `bis < von`) are rejected.
- [x] A failing e-mail send does **not** lose the booking; the user still sees the confirmation (error logged).

## Out of scope
Cancelling/editing bookings by the visitor.

## Implementation notes (done 2026-11-19)
- Files: `src/app/fenster/[id]/kontakt/{page,actions}.ts(x)`, `src/components/BookingForm.tsx`, `src/lib/booking-input.ts` (zod), `createBooking` in `src/lib/bookings.ts`.
- Two layers of protection: page pre-check (`isRangeFree`) shows „Dieses Zimmer ist bereits gebucht" before the form; the DB exclusion constraint decides on submit (race-proof).
- E-mail trimmed + lower-cased; browser validation (`type=email`) plus server-side zod validation.
- Spam protection: invisible honeypot field (`website`) → fake success, nothing stored.
- E-mail sending is a **stub** in `src/lib/mail.ts` (real SMTP in spec 05). Test hook: `MAIL_FAIL_FOR_TEST=1` simulates an SMTP failure (dev/test only).
- `/bestaetigung` page itself follows in spec 05 (redirect target already in place).
- Campaign-closed check of the action follows in spec 06.
- Privacy: short note with link to `/datenschutz` (no checkbox, as specified).

## Verification results
| Check | Result |
|---|---|
| Unit (`tests/booking-input.test.ts`): normalised e-mail, single day, 6 invalid e-mails, 9 manipulated window/date cases, past days once running | ✅ 5/5 |
| DB (`tests/bookings.test.ts`): insert with timestamp, overlap → taken, other window OK, check violation → invalid, **10 concurrent overlapping bookings → exactly 1 succeeds** | ✅ |
| HTTP: `von`/`bis` outside period, reversed, missing, impossible date → 307 to `/fenster/1`; `/fenster/7/kontakt` → 404 | ✅ |
| Browser full flow: photo → Fenster 2 → 10.–12.12. → Weiter → summary → e-mail → `/bestaetigung`; row stored with lower-cased e-mail and timestamp; days now disabled in calendar | ✅ |
| Direct link to overlapping range → message instead of form | ✅ |
| Race: two tabs, same range, both submit → first confirmed, second „Dieses Zimmer ist bereits gebucht" + link back | ✅ |
| Invalid e-mail (browser validation bypassed) → German error, value kept, `aria-invalid`; corrected → booked | ✅ |
| Manipulated hidden window id / dates → error, nothing stored | ✅ |
| Double-click submit → exactly one row | ✅ |
| Honeypot filled → confirmation page, nothing stored | ✅ |
| Simulated SMTP failure → booking kept, guest sees confirmation, error logged | ✅ |
| 320 px: no horizontal scroll; tab order back link → e-mail → Datenschutz → Absenden | ✅ |
| Typecheck, lint, 27 tests, production build | ✅ |

## Follow-up fix (found while testing spec 06)
Concurrent inserts for the same window could **deadlock** inside the exclusion-constraint check (`40P01`). Postgres aborts one of them after `deadlock_timeout` (1 s), so no double booking occurred, but that guest saw a generic error instead of „bereits gebucht", and under load the pool timed out.
**Fix:** `createBooking` runs in a transaction with a per-window `pg_advisory_xact_lock` → same-window inserts queue up, no deadlocks; different windows don't block each other; the constraint stays authoritative.
**Test:** 15 rounds × 10/20 concurrent overlapping bookings → always exactly 1 success, all others „taken" (≈ 0.25 s per run; 5 consecutive green suite runs).
