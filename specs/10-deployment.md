# 10 – Deployment (Dokku)

## Goal
The app runs on the customer's Dokku server under its own domain with HTTPS, and a non-technical person can follow a German step-by-step guide.

## Scope
- `docs/DEPLOYMENT.md` in German, with copy-paste commands and explanations:
  1. DNS: A record `<domain>` → server IP.
  2. `ssh` to the server; `dokku plugin:list` → check `postgres` and `letsencrypt` (install commands if missing).
  3. `dokku apps:create haus-der-baustoffe`
  4. `dokku postgres:create haus-der-baustoffe-db` + `dokku postgres:link haus-der-baustoffe-db haus-der-baustoffe`
  5. `dokku domains:set haus-der-baustoffe <domain>` + `dokku ports:set haus-der-baustoffe http:80:3000`
  6. `dokku config:set haus-der-baustoffe APP_URL=… ADMIN_PASSWORD=… SESSION_SECRET=… SMTP_HOST=… SMTP_PORT=… SMTP_USER=… SMTP_PASS=… MAIL_FROM=… TZ=Europe/Vienna`
  7. Local: `git remote add dokku dokku@<server>:haus-der-baustoffe` + `git push dokku main`
  8. `dokku letsencrypt:set haus-der-baustoffe email <address>` + `dokku letsencrypt:enable haus-der-baustoffe`
  9. Check `https://<domain>/api/health`, test booking, generate and print QR code (spec 09).
  10. Operations: end the campaign via `/admin`; backup via CSV or `dokku postgres:export`; logs via `dokku logs haus-der-baustoffe -t`.
  11. After the campaign: export data, then `dokku apps:destroy` + `dokku postgres:destroy` (deletes personal data, matches the privacy notice).
- GitLab as `origin`; optional later: GitLab CI job pushing to Dokku.

## Acceptance criteria
- [x] Fresh deploy from zero by following only the guide works (local Dokku 0.38.31).
- [x] Redeploy (`git push dokku main`) runs migrations automatically and has no downtime (healthcheck).
- [ ] HTTPS valid, HTTP redirects to HTTPS. → ⏳ needs the real server + public DNS (Let's Encrypt can't issue for a local test).
- [ ] Existing apps on the server (jedes-haus.de) are unaffected. → ⏳ check on the real server (guide only creates/destroys app-scoped resources; no global commands).

## Open inputs
Server IP / SSH access (user with Dokku permissions), final domain, SMTP credentials.

## Implementation notes (done 2026-11-19)
- Guide: [`docs/DEPLOYMENT.md`](../docs/DEPLOYMENT.md) (German, copy-paste commands, placeholders in `<…>`, troubleshooting table).
- **Finding from the test deploy:** with `EXPOSE 3000` Dokku maps `http:3000:3000` – the site would not be reachable on port 80. Guide step 5 now sets `dokku ports:set haus-der-baustoffe http:80:3000` (+ troubleshooting entry).
- Dokku's postgres plugin currently creates **Postgres 18.6** – schema and `btree_gist` work there.

## Verification results (local Dokku 0.38.31 in Docker, following the guide)
| Guide step | Result |
|---|---|
| 3 – plugin check/install (`postgres` 2.7.0, `letsencrypt` 0.25.2) | ✅ |
| 4 – `apps:create`, `postgres:create`, `postgres:link` | ✅ |
| 5 – domain; **port mapping missing → found + fixed** | ✅ after fix |
| 6 – `config:set --no-restart …` (SMTP → local Mailpit) | ✅ |
| 7 – `ssh-keys:add` (throwaway key) | ✅ |
| 8 – `git push`: Dockerfile build, predeploy `migrate: applied 001_init.sql`, healthcheck `/api/health` succeeded | ✅ |
| 10 – E2E in browser on the deployed app: 6 hotspots, booking, confirmation, **e-mail sent from Dokku container**, double booking blocked, admin login, CSV, close/reopen, Impressum while closed | ✅ |
| 10.4 – delete test booking via `postgres:connect` | ✅ |
| Redeploy while polling every 0.5 s: **79/79 requests 200 (zero downtime)**, `migrate: database is up to date` | ✅ |
| Data survives redeploy and `ps:restart` | ✅ |
| 12 – `postgres:export` backup (valid `PGDMP` dump), `logs` | ✅ |
| 13 – `apps:destroy`, `postgres:destroy` → nothing left | ✅ |
| 9 – Let's Encrypt / HTTPS | ⏳ real server only |
| Phone scan of printed QR code with final domain | ⏳ real server only |

Note: Dokku-in-Docker reports "port listening check" as failed (can't enter the PID namespace) but "All checks successful" – a limitation of the local test setup, not of the app.
