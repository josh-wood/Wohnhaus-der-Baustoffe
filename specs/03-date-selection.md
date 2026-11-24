# 03 – Date selection

## Goal
For the chosen window, the visitor selects a date range between 01.12.2026 and 31.07.2027.

## Scope
- Route `/fenster/[id]` (invalid id → 404).
- Heading „Fenster {id}" + short instruction.
- `RangeCalendar` client component: `react-day-picker` range mode, German locale, week starts Monday, navigation limited to Dec 2026 – Jul 2027, one month visible on mobile.
- Booked days of this window loaded server-side (`getBookedRanges(windowId)`) and disabled.
- Past days disabled (relevant once the campaign is running).
- A range containing a booked day is not selectable → message „Dieses Zimmer ist in diesem Zeitraum bereits gebucht. Bitte wähle andere Tage."
- If the window is fully booked: show „Dieses Zimmer ist bereits gebucht" + link back to the photo.
- Selected range displayed in text („12.12.2026 – 18.12.2026"); button „Weiter" → `/fenster/{id}/kontakt?von=YYYY-MM-DD&bis=YYYY-MM-DD`.
- Link „Zurück zur Übersicht".

## Acceptance criteria
- [x] Cannot navigate before Dec 2026 or after Jul 2027.
- [x] Booked days are visibly disabled and not selectable.
- [x] A single day (start = end) is a valid range.
- [x] „Weiter" disabled until a valid range is selected.
- [x] Works with touch on small screens (no horizontal scrolling).

## Technical notes
- Availability is only a pre-check; the authoritative check is the DB constraint (spec 04).
- `src/lib/bookings.ts`: `getBookedRanges(windowId)`, `isRangeFree(windowId, from, to)`.

## Implementation notes (done 2026-11-19)
- **Selection logic (hotel style)**, own implementation instead of react-day-picker's default toggle (which deselects on a second tap): 1st tap = single day (already bookable) · tap on a later day = range · tap after a complete range or on an earlier day = start over · range across booked days = message + restart from tapped day.
- Date handling as ISO strings `YYYY-MM-DD` (`src/lib/campaign.ts`); Postgres `DATE` returned as string (no time-zone shifts); "today" computed in Europe/Vienna.
- `src/lib/bookings.ts`: `getBookedRanges`, `isRangeFree` (pre-check for spec 04).
- Booked days: hatched + struck through, legend „bereits gebucht".
- Day cells shrink on very small phones (39 px at 320 px width) so 7 columns always fit.
- Strict route param: `/fenster/03`, `/fenster/7`, `/fenster/abc` → 404.

## Verification results
| Check | Result |
|---|---|
| Unit (`tests/campaign.test.ts`): strict ISO dates, campaign limits incl. past days once running, inclusive overlap, free-day count (243 days total), German formatting, Vienna "today" across midnight UTC, strict window param | ✅ 7/7 |
| DB (`tests/bookings.test.ts`): booked ranges per window sorted as ISO strings, availability pre-check | ✅ 2/2 |
| Browser 360 px with synthetic bookings: German month/weekdays (Mo–So), no navigation before Dez 2026 / after Juli 2027, 31.07.2027 selectable, booked days disabled | ✅ |
| Single day → „05.12.2026 (1 Tag)", range → „05.12.2026 – 09.12.2026 (5 Tage)", „Weiter" link `…/kontakt?von=…&bis=…`, disabled before selection | ✅ |
| Restart after complete range / earlier day; same day re-tap keeps single day; range across booked 20.–24.12. → message, then recovery | ✅ |
| Fully booked window → „Dieses Zimmer ist bereits gebucht…", no calendar | ✅ |
| 320/360/390/430 px: no horizontal scroll | ✅ |
| Home hotspot → calendar, back link → home, no console errors, production build | ✅ |
| Bug found during test: v9 deselects on second tap → selection logic rewritten | ✅ fixed |
