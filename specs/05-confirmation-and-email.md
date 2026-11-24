# 05 – Confirmation & e-mail

## Goal
The visitor sees a confirmation and receives an automatic e-mail.

## Scope
- Route `/bestaetigung`: „Der Eintrag wurde gespeichert – wir melden uns in Kürze bei Euch." (+ optional „Danke"-text from the sketch), link back to start.
- `src/lib/mail.ts`: `nodemailer` transport from `SMTP_*` env vars, `sendBookingConfirmation({ email, windowId, from, to })`.
- Mail: subject „Probewohnen – Dein Eintrag ist gespeichert", plain text + simple HTML; body contains the confirmation sentence, window and range, sender `MAIL_FROM`, footer with Impressum link.
- Optional (config flag `MAIL_BCC`): copy to the organiser.

## Acceptance criteria
- [x] Locally the mail appears in Mailpit with correct umlauts.
- [x] Mail text and page text match the brief verbatim.
- [x] SMTP errors are logged and do not break the flow (see spec 04).
- [x] No SMTP credentials in logs.

## Implementation notes (done 2026-11-19)
- `src/lib/mail.ts` (nodemailer transport from `SMTP_*`; port 465 = TLS, otherwise STARTTLS; 10 s connect timeout), `src/lib/mail-content.ts` (subject, plain text + HTML, HTML-escaped), `src/app/bestaetigung/page.tsx`.
- Mail is sent **after the response** via Next.js `after()` → the guest gets the confirmation page immediately (≈ 0.2–0.6 s), even if the mail server is slow or down. Failures are logged as `mail: confirmation for booking <id> failed <reason>`.
- Optional `MAIL_BCC` sends a copy of every confirmation to the organiser.
- The guest's address appears only in the `To` header, not in the body.
- Copy in `src/content/texts.ts` (`confirmation`, `mail`); page heading „Danke!" from the sketch.

## Verification results
| Check | Result |
|---|---|
| Unit (`tests/mail-content.test.ts`): brief wording in subject/text/HTML, window + period + Impressum link, guest address not in body, HTML escaping | ✅ 4/4 |
| SMTP integration via Mailpit (`tests/mail-smtp.test.ts`): To/Bcc/From/Subject, umlauts in text + HTML; unreachable SMTP rejects instead of hanging | ✅ 2/2 |
| Browser E2E: photo → Fenster 4 → 14.–18.12. → e-mail → „Danke! Der Eintrag wurde gespeichert – wir melden uns in Kürze bei Euch." → mail in Mailpit; back link to start | ✅ |
| HTML mail rendering at phone width | ✅ (screenshot checked) |
| Real SMTP outage (Mailpit stopped): booking stored, confirmation in 0.2 s, log `ECONNREFUSED`, no credentials in logs | ✅ |
| Production server (standalone): `after()` delivers the mail | ✅ |
| Docker image serves all page assets (10/10 → 200) | ✅ |
| Bonus: booking form works without JavaScript (progressive enhancement) | ✅ |
| Typecheck, lint, 33 tests, build | ✅ |

## Open inputs
SMTP host/port/user/password and sender address from the customer; final „Danke" text.
