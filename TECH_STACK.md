# Tech Stack – „Probewohnen · Haus der Baustoffe"

Decision record for the window-booking web app. Planning language: English. All user-facing copy: German.

## 1. Context & constraints

- Small, time-limited, mobile-first web app reached via QR code (campaign period **01.12.2026 – 31.07.2027**).
- Artistic/student project by Joshua Singer (Aigen im Mühlkreis). No special security requirements.
- The customer **already owns a server and a domain**. The server (also hosting jedes-haus.de) is managed with **[Dokku](https://dokku.com)** via SSH + `git push`.
  → No Vercel, Supabase or Resend. Everything runs on that server.
- Repository hosted on **GitLab**. Dokku is a second git remote used only for deployment.
- Visual reference: [`docs/reference/Josh_Diplom_Probewohnkalender.pdf`](docs/reference/Josh_Diplom_Probewohnkalender.pdf).

## 2. Decisions

| # | Topic | Decision |
|---|---|---|
| D1 | Booking rule | **Overlap-based**: a window can be booked several times as long as date ranges don't overlap. Booked days are disabled in the calendar. A colliding request shows „Dieses Zimmer ist bereits gebucht". |
| D2 | Database | **Postgres** via the `dokku-postgres` plugin |
| D3 | E-mail | **Existing SMTP mailbox** of the customer (via `nodemailer`) |
| D4 | Domain | **Separate domain** owned by the customer (TBD) → `APP_URL` placeholder until known |
| D5 | Flow | Follow the written brief: **6 windows**, 4 pages (Foto → Kalender → E-Mail → Bestätigung). The PDF sketch is used for copy and look. |
| D6 | VCS | **GitLab** (origin) + Dokku (deploy remote) |

## 3. Stack

| Concern | Choice | Rationale |
|---|---|---|
| Runtime | Node.js 22 LTS | Long-term support, official Docker images |
| Framework | **Next.js 15** (App Router, TypeScript, `output: "standalone"`) | Frontend + backend (server actions, route handlers) in one app → one Dokku app, no separate API |
| Styling | Tailwind CSS | Mobile-first utilities, simple clean design |
| Database | **PostgreSQL** (dokku-postgres) | `DATABASE_URL` injected by `dokku postgres:link`; exclusion constraint prevents double bookings at DB level (race-proof) |
| DB access | `pg` + plain SQL migrations (`db/migrations/*.sql`, run by `scripts/migrate.mjs`) | Two tables only; an ORM would be overhead |
| Calendar | `react-day-picker` (range mode) + `date-fns` (`de` locale) | Small, accessible, touch-friendly, supports disabled days and min/max month |
| Validation | `zod` | Server-side validation of window id, dates, e-mail |
| E-mail | `nodemailer` over SMTP | Provider-agnostic: switching provider = changing env vars |
| Admin auth | One `ADMIN_PASSWORD` env var → HMAC-signed, httpOnly cookie (`SESSION_SECRET`) | Sufficient for the requirement, no user management |
| QR code | `qrcode` + `pdf-lib` (Node script) | PNG, SVG and printable A4 PDF |
| Tests | `vitest` (unit + DB integration), Playwright (mobile E2E) | Covers double-booking logic and the touch flow |
| Local dev | Docker Compose: `postgres:16` (port 5433), `axllent/mailpit` (SMTP catcher) | Mirrors production without real mails |
| Build/Deploy | Multi-stage `Dockerfile` + `app.json` (`predeploy` = migrations, healthcheck) | Deterministic Dokku build; migrations run on every `git push dokku` |
| TLS | `dokku-letsencrypt` | Free certificates with auto-renewal |
| Port mapping | `dokku ports:set <app> http:80:3000` | Required: with `EXPOSE 3000` Dokku would otherwise publish port 3000 only |

## 4. Architecture

```
 Smartphone ──QR──▶ https://<domain>
                        │
                 ┌──────▼───────────── Dokku server ──────────────────┐
                 │  nginx (Dokku proxy, Let's Encrypt TLS)            │
                 │        │                                           │
                 │  app: haus-der-baustoffe (Docker, Next.js :3000)   │
                 │        │ DATABASE_URL            │ SMTP            │
                 │  service: haus-der-baustoffe-db  │                 │
                 │  (Postgres, dokku-postgres)      ▼                 │
                 └──────────────────────── customer's mail server ────┘

 Developer ── git push origin ──▶ GitLab (source of truth)
           ── git push dokku  ──▶ Dokku (build + deploy)
```

## 5. Data model

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE bookings (
  id          bigserial PRIMARY KEY,
  window_id   smallint    NOT NULL CHECK (window_id BETWEEN 1 AND 6),
  start_date  date        NOT NULL,
  end_date    date        NOT NULL,
  email       text        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CHECK (end_date >= start_date),
  CHECK (start_date >= DATE '2026-12-01' AND end_date <= DATE '2027-07-31'),
  CONSTRAINT bookings_no_overlap
    EXCLUDE USING gist (window_id WITH =, daterange(start_date, end_date, '[]') WITH &&)
);

CREATE TABLE settings (
  key   text PRIMARY KEY,
  value text NOT NULL
);
INSERT INTO settings (key, value) VALUES
  ('campaign_closed', 'false'),
  ('end_text', '')
ON CONFLICT DO NOTHING;
```

- Ranges are **inclusive** on both ends (`'[]'`).
- An insert that violates `bookings_no_overlap` raises SQLSTATE `23P01` → mapped to „Dieses Zimmer ist bereits gebucht".
- Inserts run in a transaction holding a per-window `pg_advisory_xact_lock`, so concurrent requests for the same window queue up instead of deadlocking in the constraint check.
- Only the e-mail address is stored as personal data (see Datenschutz).

## 6. Routes

| Route | Type | Purpose |
|---|---|---|
| `/` | page | Text above, photo with 6 hotspots, text below |
| `/fenster/[id]` | page | Range calendar, booked days disabled |
| `/fenster/[id]/kontakt?von=&bis=` | page + server action | E-mail form, creates booking, sends mail |
| `/bestaetigung` | page | Confirmation text |
| `/impressum`, `/datenschutz` | page | Legal pages |
| `/admin` | page + server actions | Login, bookings list, campaign switch, end text |
| `/admin/export.csv` | route handler | CSV export (`;`, UTF-8 BOM) |
| `/api/health` | route handler | Dokku healthcheck (DB ping) |

When `campaign_closed = true`, all public routes render the end text instead.

## 7. Environment variables

| Variable | Example (dummy) | Source |
|---|---|---|
| `DATABASE_URL` | `postgres://…` | set automatically by `dokku postgres:link` |
| `APP_URL` | `https://example.org` | `dokku config:set` |
| `ADMIN_PASSWORD` | `change-me` | `dokku config:set` |
| `SESSION_SECRET` | 32+ random chars | `dokku config:set` |
| `SMTP_HOST` / `SMTP_PORT` | `mail.example.org` / `587` | `dokku config:set` |
| `SMTP_USER` / `SMTP_PASS` | — | `dokku config:set` |
| `MAIL_FROM` | `Probewohnen <info@example.org>` | `dokku config:set` |
| `MAIL_BCC` (optional) | `organiser@example.org` | `dokku config:set` |
| `TZ` | `Europe/Vienna` | `dokku config:set` |

Real values are never committed. `.env.example` contains dummies only.

## 8. Repository layout (target)

```
TECH_STACK.md            this file
specs/                   work packages (see specs/README.md)
docs/reference/          customer sketch (PDF)
docs/DEPLOYMENT.md       German step-by-step deployment guide
Dockerfile, app.json, .dockerignore, .env.example, next.config.ts
db/migrations/           SQL migrations
scripts/                 migrate.mjs, generate-qr.mjs
public/                  building photo
src/app/                 routes
src/components/          BuildingHotspots, RangeCalendar, Footer
src/lib/                 db, bookings, mail, auth, settings
src/config/windows.ts    hotspot coordinates
src/content/texts.ts     all German copy
```

## 9. Open inputs from the customer

- Final building photo (high resolution) and confirmation of the 6 window positions
- Final texts: above/below photo, „Danke" page, end text, e-mail text
- Final domain + server IP / SSH access
- SMTP credentials and sender address
- Optional: Verein/organisation details for the Impressum
