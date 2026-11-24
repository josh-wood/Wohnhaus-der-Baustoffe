# 08 – Legal pages (Austria)

## Goal
Impressum and privacy notice, linked in the footer of every page.

## Scope
- `Footer` component: „Impressum · Datenschutz".
- `/impressum` (Offenlegung/Impressum according to Austrian law), pre-filled:
  - Joshua Singer, Hütteldorfer Str. 121, 1140 Wien
  - E-Mail: e12033325@student.tuwien.ac.at
  - Note: „Künstlerisches/studentisches Projekt (Diplomarbeit)."
  - Optional block `organisation` (Verein name, ZVR-Zahl, address) in `texts.ts` — rendered only when filled.
- `/datenschutz`: controller (as above); data processed: e-mail address only (plus chosen window/period and time stamp); purpose: feedback about the campaign; legal basis: consent (Art. 6 (1) a GDPR); storage: deleted after the campaign ends; hosting on the organiser's own server, sending via their mail server; no tracking, no cookies except the technically necessary admin cookie; rights (access, rectification, erasure, objection, complaint to the Austrian Datenschutzbehörde).

## Acceptance criteria
- [x] Both pages reachable from every page, also when the campaign is closed.
- [x] Organisation block can be added by editing one place in `texts.ts`.

## Notes
Texts are a pragmatic template, not legal advice; the customer should review them.

## Implementation notes (done 2026-11-19)
- `src/components/Footer.tsx` in the root layout → on every page incl. end screen and admin.
- `src/app/impressum/page.tsx`: Medieninhaber/Herausgeber (§ 25 MedienG / § 5 ECG), Blattlinie, project note (Diplomarbeit).
- `src/app/datenschutz/page.tsx`: controller, data (e-mail + window/period/time), purpose, Art. 6 (1) a DSGVO + withdrawal, deletion after the campaign (≤ 3 months), hosting/mail on own servers, no tracking (only admin session cookie), rights + Datenschutzbehörde.
- All texts in `texts.legal` (`src/content/texts.ts`). **Adding a Verein later:** fill `legal.organisation` (`name`, `zvr`, `address`) – the block appears automatically.
- Legal pages don't check the campaign flag → stay reachable after the end.
- ⚠️ Pragmatic template, not legal advice – customer should review.

## Verification results
| Check | Result |
|---|---|
| Footer (Impressum + Datenschutz) on `/`, `/fenster/1`, contact page, `/bestaetigung`, `/admin`, `/impressum`, `/datenschutz`, end screen | ✅ |
| Impressum: name, address, e-mail (`mailto:`), Diplomarbeit note, Blattlinie; organisation block hidden when empty | ✅ |
| Organisation filled (temporary test values) → block shows name, ZVR, address; reverted afterwards | ✅ |
| Datenschutz: 8 sections + contact, key facts present | ✅ |
| Contact page link „Datenschutzhinweis" → `/datenschutz` | ✅ |
| Campaign closed: `/impressum`, `/datenschutz`, `/admin` 200 without end screen | ✅ |
| 360 px: no horizontal scroll, German hyphenation | ✅ |
| Typecheck, lint, 43 tests | ✅ |
