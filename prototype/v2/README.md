---
title: WARMAPS v2 prototype (F1 Part B) — read me
version: v0.1 (2026-11-15, sitting 1 of 2: built and run headless; the five-form-factor review is sitting 2)
status: THROWAWAY. It proves the design documents in `docs/v2/`. It is not the start of the app
---

**PROTOTYPE SAMPLE - NOT REAL DATA.** Every event, statement, figure, source, link, watch item and track is
invented (`js/data/sample-data.js`). Nothing here records anything that happened, and no statement was made by the
party named. Dates are counted back from today so the 7-day window always has content.

| What | Where |
|---|---|
| Open it | `/prototype/v2/` once PR #17 is merged. Before that: serve the folder over http (`npx serve prototype/v2`) |
| Useful address flags | `?studio=1` shows the theme studio in Settings · `?today=2026-11-15` fixes the date · `?layout=phone-landscape` forces a layout class · `?nostorage` runs with storage off · `?tour=0` skips the tour offer |
| The numbers to report | Settings, "About this device": viewport, pixel ratio, layout class, detail level, draw test, 2D and globe frame rates, timeline track. "Copy these numbers" puts them on the clipboard |
| Try the open decisions | Settings, "Try the open decisions": decision 9 (A, B, C), decision 6 (A, B, C), items d1 and d3. Decision 8 is the theme choice |
| Check script | `node prototype/v2/check/check.js --list` : sample data against the schemas, the charter test, the prototype's rules against the reference, the three themes, the word check |
| Document problems found while building | `NOTES_FOR_F2.md` |
| Libraries | Leaflet 1.9.4, CesiumJS 1.146.0 (fetched only for 3D) and the fonts, all from jsdelivr at pinned versions with integrity hashes. Map tiles: Esri, keyless, the same services v1 uses |
| Not here | No build step, no keys, no personal data, no service worker, no real data, no production features |

Files: `index.html` · `css/` (tokens, components) · `js/core/` (time, store, selectors, detail levels, and browser
copies of the two reference modules) · `js/data/` (sample) · `js/views/` (marks, 2D, globe) · `js/ui/` (layout,
timeline, cards, controls, panels, theme engine, studio, tour, fixed strings) · `themes/` (the three theme files,
byte-identical to `research/v2-theme-check/themes/`) · `check/`.
