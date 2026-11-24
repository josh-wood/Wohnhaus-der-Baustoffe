# 02 – Start page & window hotspots

## Goal
The start page looks like a hotel room picker: the building photo with 6 clickable windows.

## User story
As a visitor on my smartphone, I see the building, tap a window and get to its booking calendar.

## Scope
- Text above the photo: „Wie willst du wohnen?" (from sketch, final copy from customer).
- Photo `public/haus-der-baustoffe.jpg` (optimized via `next/image`, responsive, full width on mobile).
- Text below: „Wohnhaus der Baustoffe" / „Probewohnen" / „Aigen im Mühlkreis".
- 6 hotspots as an SVG overlay (`<svg viewBox="0 0 W H" preserveAspectRatio="none">`, W/H = photo pixel size) with one `<a href="/fenster/{id}">` + `<polygon>` per window.
- Coordinates in `src/config/windows.ts` (`id`, `label` e.g. „Fenster 1", `points`).
- Subtle highlight: thin light outline + gentle pulse; number badge; stronger highlight on hover/focus/active.
- Debug mode `/?debug=1`: polygons fully visible, tap shows image coordinates (for calibration).

## Out of scope
Showing booked state on the photo (overlap model, D1).

## Acceptance criteria
- [x] All 6 hotspots tappable on 320 px – 430 px wide phones (iOS Safari, Android Chrome) and on desktop.
- [x] Hotspots stay aligned with the windows at every width and on orientation change.
- [x] Hit areas ≥ 44×44 CSS px at 360 px width (enlarge polygon where needed).
- [x] Keyboard accessible (tab + enter), each link has an `aria-label` („Fenster 3 auswählen").
- [x] `prefers-reduced-motion` disables the pulse.
- [x] Page renders the end text instead when the campaign is closed (implemented + tested in spec 06).

## Open inputs
- Final high-res photo. The sketch shows **5** red markers, the brief says **6** → confirm the 6 window positions with the customer.
- Final copy.

## Implementation notes (done 2026-11-19)
- **Placeholder image** `public/haus-der-baustoffe-placeholder.svg` (1600×900, 6 evenly spaced windows) until the real photo arrives.
- Swapping the photo: put it in `public/`, update `BUILDING_IMAGE` (src, width, height) in `src/config/windows.ts`, open `/?debug=1`, tap the 4 corners of each window and paste the shown `points`. `tests/windows-config.test.ts` then checks ids, bounds and that tap areas don't overlap.
- Tap area = window outline + `HIT_PADDING` (30 image px); can be overridden per window with `hit`.
- Photo is edge-to-edge on phones (bigger photo, bigger tap areas), rounded card from `sm` up.
- Hotspots are plain server-rendered links: work before/without JavaScript.

## Verification results
| Check | Result |
|---|---|
| Unit: 6 windows ids 1–6, outlines inside image, tap areas don't overlap, id validation | ✅ 4/4 (first run caught overlapping tap areas of windows 3/4 → placeholder re-spaced) |
| Browser 320/360/390/430 px portrait, 844 landscape, 1280 desktop: tap at centre **and** corner of each tap area hits the right window; no horizontal scroll; outline position error 0 px | ✅ |
| Smallest tap area: 46 px @320, 52 px @360, 56 px @390 (target ≥ 44) | ✅ (was 41 px @320 before full-bleed change) |
| Click on each window navigates to `/fenster/1…6` | ✅ (target page follows in spec 03) |
| Keyboard: Tab focuses „Fenster 1 auswählen“, Enter navigates; all 6 links have German aria-labels | ✅ |
| Pulse animation on; `prefers-reduced-motion` → none | ✅ |
| Debug mode: taps don't navigate, record image coordinates (±3 px) | ✅ (bug found: Link navigated in debug mode → fixed with capture-phase handler) |
| Production build, 6 links in server HTML, no console errors (favicon 404 fixed) | ✅ |
| Campaign closed → end text | ✅ (spec 06) |
