# 07 – Admin area

## Goal
A simple password-protected page to see all bookings, export them and end the campaign.

## Scope
- `/admin`: when not logged in → password form. Correct `ADMIN_PASSWORD` → signed httpOnly, `SameSite=Lax`, `Secure` cookie (HMAC with `SESSION_SECRET`, 12 h validity). Logout button.
- Bookings table (newest first): Fenster, Zeitraum (dd.MM.yyyy – dd.MM.yyyy), E-Mail, Gebucht am (dd.MM.yyyy HH:mm, Europe/Vienna). Count per window as summary. Mobile: card layout.
- Button „CSV exportieren" → `/admin/export.csv` (auth required): columns `Fenster;Von;Bis;E-Mail;Gebucht am`, `;` separator, UTF-8 BOM, filename `buchungen-YYYY-MM-DD.csv`.
- Campaign switch „Aktion beenden / wieder öffnen" with confirmation dialog + textarea for the end text (spec 06).
- `noindex` meta for admin.

## Acceptance criteria
- [x] Wrong password → error, no data visible; route handler returns 401 without cookie.
- [x] CSV opens correctly in Excel (German) with umlauts.
- [x] Switch and end text persist across restarts (DB).
- [x] Simple rate limit / delay on failed logins (e.g. 1 s).

## Out of scope
Multiple admin users, deleting/editing bookings (can be done via `dokku postgres:connect` if ever needed).

## Implementation notes (done 2026-11-19)
- `src/lib/auth.ts`: constant-time password check; session = `<expiry>.<HMAC-SHA256>` cookie (`admin_session`, httpOnly, SameSite=Lax, path `/admin`, 12 h, `Secure` when `APP_URL` is https). Stateless → survives restarts; changing `SESSION_SECRET` logs everyone out. Login disabled if `ADMIN_PASSWORD` or `SESSION_SECRET` (≥ 16 chars) is missing.
- `src/app/admin/{page,actions}.ts(x)`, `src/components/admin/AdminForms.tsx`; every action re-checks the session.
- `src/lib/csv.ts`: BOM, `;`, CRLF, quoting, **CSV-injection protection** (cells starting with `= + - @` get a leading `'`).
- Failed login: 1 s delay.

## Verification results
| Check | Result |
|---|---|
| Unit (`tests/auth-csv.test.ts`): password check, not-configured / short secret, token expiry, tampered/foreign/malformed tokens, secret rotation, CSV format + formula neutralisation | ✅ 6/6 |
| `/admin/export.csv` without / with forged cookie → 401; `/admin` shows only the login form, `noindex, nofollow` | ✅ |
| Wrong password → „Falsches Passwort.", ≈1.3 s, no data visible | ✅ |
| Login → cookie httpOnly / Lax / path `/admin` / 12 h | ✅ |
| List newest first, Vienna time, per-window counts; cards at 390 px (no h-scroll), table at 1024 px | ✅ |
| CSV: `buchungen-2026-11-19.csv`, BOM `efbbbf`, `;`, umlauts (`jürgen.müller@…`), `=cmd@…` exported as `'=cmd@…` | ✅ |
| Switch: confirm dialog text; cancel → unchanged; confirm → closed; public site shows custom end text with line break | ✅ |
| Server restart → still logged in, status + end text persisted | ✅ |
| Cookie removed while dashboard open → action refused, status unchanged | ✅ |
| Reopen; logout → cookie gone, export 401 | ✅ |
| Typecheck, lint, 43 tests | ✅ |

Test-environment note: intermittent 404s during testing came from a stale standalone server (from the spec 05 test) still bound to port 3000 — not an app issue; killed, all checks re-run.
