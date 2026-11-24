# 06 – Campaign end switch

## Goal
The organiser can end the campaign manually; afterwards visitors only see an end text.

## Scope
- `settings` keys `campaign_closed` (`'true'|'false'`) and `end_text`.
- `src/lib/settings.ts`: `getSettings()`, `setCampaignClosed(bool)`, `setEndText(text)`.
- All public routes (`/`, `/fenster/**`, `/bestaetigung`) check the flag server-side (dynamic rendering, no caching) and render `EndScreen` with the end text when closed.
- `createBooking` rejects requests when closed.
- `/impressum`, `/datenschutz`, `/admin` stay reachable.
- Default end text in `texts.ts` if `end_text` is empty (e.g. „Die Aktion ist beendet. Danke fürs Mitmachen!").

## Acceptance criteria
- [x] Switching on in admin takes effect immediately (next request) without redeploy.
- [x] Switching off restores the normal flow.
- [x] Booking POSTs while closed are rejected.

## Implementation notes (done 2026-11-19)
- `src/lib/settings.ts` (`getSettings`, `setCampaignClosed`, `setEndText` – upsert, text trimmed, max 2000 chars).
- `src/components/EndScreen.tsx`: `campaignClosedScreen()` is called first in every public page (`/`, `/fenster/[id]`, `/fenster/[id]/kontakt`, `/bestaetigung`); all of them are dynamic (no caching). End text keeps line breaks; empty → default „Die Aktion ist beendet. Danke fürs Mitmachen!".
- `submitBooking` checks the flag first and redirects to `/` (end screen) without storing anything.
- Admin UI for the switch + end text follows in spec 07 (until then: `UPDATE settings …`).
- `/impressum`, `/datenschutz` (spec 08) and `/admin` (spec 07) don't call the check → stay reachable.

## Verification results
| Check | Result |
|---|---|
| DB (`tests/settings.test.ts`): defaults, close/reopen, end text trimmed + capped, upsert when row missing | ✅ 4/4 |
| Open: all public routes normal | ✅ |
| Form loaded while open, campaign closed, then submitted → redirect to end screen, **0 rows stored** | ✅ |
| Closed: `/`, `/fenster/1`, `/fenster/1/kontakt?…`, `/bestaetigung` show default end text immediately (no redeploy); `/api/health` still 200 | ✅ |
| Custom end text with line break rendered on 2 lines | ✅ |
| Reopened → normal flow on next request, booking succeeds | ✅ |
| Typecheck, lint, 37 tests (5 consecutive green runs), build | ✅ |
