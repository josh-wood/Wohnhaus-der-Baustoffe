# 01 – Project setup

## Goal
A runnable Next.js skeleton that builds as a Docker image for Dokku, talks to Postgres and runs migrations automatically.

## Scope
- Next.js 15 (App Router, TypeScript, `output: "standalone"`), Tailwind CSS, ESLint, vitest.
- `src/lib/db.ts`: shared `pg` Pool from `DATABASE_URL`.
- `db/migrations/001_init.sql` (schema from TECH_STACK §5) + `scripts/migrate.mjs` (plain JS so it runs in the production image without a build step; applies pending files, tracks them in `schema_migrations`).
- `Dockerfile` (multi-stage, Node 22 alpine, non-root user, `PORT` from env).
- `app.json`: `scripts.dokku.predeploy = "node scripts/migrate.js"` + healthcheck on `/api/health`.
- `/api/health` → `200 {"ok":true}` after `SELECT 1`.
- `docker-compose.yml` for local dev: `postgres:16` + `axllent/mailpit`.
- `.env.example` (dummy values), `.gitignore`, `.dockerignore`.
- Base layout: German `lang="de"`, viewport meta, font, footer slot.

## Out of scope
Any page content (later specs).

## Acceptance criteria
- [x] `docker compose up -d && npm run migrate && npm run dev` serves the app locally.
- [x] `npm run migrate` is idempotent (second run does nothing).
- [x] `docker build .` succeeds; container starts with only env vars and answers `/api/health`.
- [x] `/api/health` returns 503 if the DB is unreachable.
- [x] No secrets in the repo.

## Technical notes
- `npm` scripts: `dev`, `build`, `start`, `migrate`, `test`, `qr`.
- Migrations compiled/bundled so they run inside the standalone image (copy `db/` + compiled script).

## Implementation notes (done 2026-11-19)
- Local Postgres runs on port **5433** (avoids clashes with a local Postgres on 5432); Mailpit UI on http://localhost:8025.
- `npm run db:up` → `npm run migrate` → `npm run dev`; `npm test` runs the DB integration tests (`tests/db-schema.test.ts`).
- Versions pinned for stability: Next 15, TypeScript 5, Vitest 3 (Vitest 5 failed to load its native binding).
- No Google Fonts (would need network at build time on the server): system serif stack.

## Verification results
| Check | Result |
|---|---|
| `npm run build`, `typecheck`, `lint` | ✅ clean |
| Migration applied, second run "up to date" | ✅ |
| DB tests: insert, overlap → 23P01 (incl. inclusive end + concurrent inserts), adjacent/other window OK, invalid window/range/period → 23514 | ✅ 5/5 |
| `/api/health` 200 → DB stopped 503 → DB back 200 | ✅ |
| `docker build`, predeploy migration inside image on fresh DB (twice), container serves `/` + `/api/health`, runs as `node`, TZ Vienna | ✅ |
| Migration without `DATABASE_URL` exits 1 with message | ✅ |
| No secrets committed (`.env` ignored, `.env.example` dummies) | ✅ |
