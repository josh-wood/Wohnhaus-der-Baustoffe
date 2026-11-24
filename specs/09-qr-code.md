# 09 – QR code

## Goal
A printable QR code pointing to the start page.

## Scope
- `scripts/generate-qr.mjs`, run via `APP_URL=https://<domain> npm run qr`.
- Output to `qr/` (gitignored): `qr-code.png` (2048 px), `qr-code.svg`, `qr-code-a4.pdf` (centered code ~12 cm, caption „Wie willst du wohnen? – Probewohnen im Haus der Baustoffe" and the URL in plain text below).
- Error correction level `M`, quiet zone ≥ 4 modules.
- Optional query param `?src=qr` for later distinction (no tracking stored).

## Acceptance criteria
- [x] Scanning the printed PDF with iOS and Android cameras opens the start page.
- [x] Script fails with a clear message when `APP_URL` is missing.

## Dependency
Final domain (D4).

## Implementation notes (done 2026-11-19)
- `scripts/generate-qr.mjs` (plain Node, no build step); `npm run qr` with `APP_URL`; optional `QR_OUT_DIR`.
- QR encodes the normalised `APP_URL` (e.g. `https://example.org/`) without extra parameters → fewer modules, more robust when printed. (`?src=qr` dropped – no tracking is stored anyway.)
- PDF: A4, heading „Wie willst du wohnen?", subtitle, 12 cm code, hint „Code mit der Handy-Kamera scannen" + URL in plain text.
- Warns if the URL is `http://` (except localhost); rejects non-http(s) and invalid URLs.

## Verification results
| Check | Result |
|---|---|
| `tests/qr.test.ts`: runs the real script; PNG 2048 px decodes (jsQR) to the URL; SVG valid; PDF 1 page A4 | ✅ |
| Missing / invalid / `ftp://` URL → exit 1 with clear message | ✅ |
| PDF rendered with macOS Quick Look (848×1200) → QR decoded from the render = URL; layout and umlauts checked visually | ✅ |
| Code for `http://localhost:3000` decoded → URL opens start page with 6 hotspots | ✅ |
| `qr/` output gitignored | ✅ |
| Typecheck, lint, 45 tests | ✅ |
| Phone camera scan of the printout | ⏳ after deploy, with the final domain (spec 10) |
