# Specs – Work Packages

Each spec is one work package with goal, scope, acceptance criteria and technical notes. Stack and data model: see [`../TECH_STACK.md`](../TECH_STACK.md).

| # | Spec | Depends on | Status |
|---|---|---|---|
| 01 | [Project setup](01-project-setup.md) | – | Done ✅ |
| 02 | [Start page & window hotspots](02-home-hotspots.md) | 01 | Done ✅ (placeholder photo) |
| 03 | [Date selection](03-date-selection.md) | 01, 02 | Done ✅ |
| 04 | [Contact & booking](04-contact-and-booking.md) | 03 | Done ✅ |
| 05 | [Confirmation & e-mail](05-confirmation-and-email.md) | 04 | Done ✅ (SMTP creds pending) |
| 06 | [Campaign end switch](06-campaign-end-switch.md) | 01 | Done ✅ (admin UI in 07) |
| 07 | [Admin area](07-admin.md) | 04, 06 | Done ✅ |
| 08 | [Legal pages](08-legal-pages.md) | 01 | Done ✅ (customer review) |
| 09 | [QR code](09-qr-code.md) | domain known | Done ✅ (final domain pending) |
| 10 | [Deployment (Dokku)](10-deployment.md) | all | Done ✅ locally (HTTPS + real server pending) |

## Implementation order

```
01 ─▶ 02 ─▶ 03 ─▶ 04 ─▶ 05
 ├──▶ 06 ─────────┐
 ├──▶ 08          ▼
 │               07
 └──────────────────────▶ 09 ─▶ 10
```

## Conventions

- Planning/specs in English; every user-facing string in German, kept in `src/content/texts.ts`.
- Test data is synthetic only (e.g. `test1@example.com`).
- A spec is "Done" when all acceptance criteria are checked and verified.
