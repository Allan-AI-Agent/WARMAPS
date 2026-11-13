---
title: Session prompt F1c — the WARMAPS v2 interactive prototype (F1 Part B)
version: v1.1 (2026-11-12: attribution looks, fog layers, lenses, As known then, detail levels, clean view, phone-landscape globe)
date: 2026-11-11 (Iran-war Day 257)
for: a fresh Claude Code session, model Fable 5.2, thinking effort High, repository Allan-AI-Agent/WARMAPS
how to use: send "In the WARMAPS repo, check out branch v2/f1-architecture, read docs/v2/SESSION_PROMPT_F1c_prototype.md and follow it."
budget: two sittings in one chat. Sitting 1 builds and pushes. Sitting 2 reviews at five form factors and fixes. Start right after a usage refill
---

You are the lead designer for WARMAPS v2, building the one throwaway artifact of session F1: a prototype Allan can
open on his Samsung S22, his Fire HD 10 and a PC, to judge the look and the layout before anything real is built.
It proves the design documents; it is not the start of the app.

## Before you start
1. Read `docs/v2/V2_SESSION_COMMON.md` and follow its rules.
2. Read `docs/v2/SESSION_PROMPT_F1_architecture_design_prototype.md`, deliverable 4 and its "Part B" and
   prototype rules. They still apply. This prompt adds to them.
3. **Gate:** `F1_PROGRESS.md` must show F1b-1 and F1b-2 done, and no CHARTER CONFLICT banner left in any v2
   document. If not, stop and tell Allan which session has to run first. Read the charter in `STATE.md` and
   `V2_SESSION_COMMON.md` section 3b. Read fully: `DESIGN_SYSTEM_v1.md` (with the theme contract and the four
   looks), `LAYOUT_ENGINE_SPEC_v1.md`. Read from `ARCHITECTURE_v1.md`: the entries model, sections 4.1, 4.2, 5,
   9.2 and the detail-level budget.
4. Tell Allan: "Recommended: Fable 5.2, High, two sittings. Go?" and wait.

## What the prototype must let Allan do
| Area | Must show |
|---|---|
| Layout | All five form factors resolving by viewport; dock rail; phone sheet with three detents; side sheet in phone landscape; slots on tablet and PC with pin and the Move menu; no overlapping panels |
| Timeline | The two-level timeline (overview with view box, detail row with finger-sized steps), date-first readout with per-theater day numbers, Today, Play. Opens on a 7-day band (provisional ruling) that drags and widens to any range or All. The **Record today / As known then** switch; Play in As known then shows ghosts appear, solidify, move into place, split or fade |
| Theaters | Theater filter from one theater to all; outlines; the "no curated events yet" state for a theater with none |
| Views | 2D (Leaflet) and 3D globe (CesiumJS, loaded only on request) showing the same sample events and arcs; the switch keeps the camera on the same place |
| Attribution (charter 2026-11-12: who says what, never how true) | The four looks (ghost, solid, split, faded ghost) as F1b-1 defined them; the size cap for one-sided claims; the On the record / Fog layers and the Contested filter; location history (a marker moving when a more specific location arrives, alternative locations as linked ghosts on tap); the status line on cards. The decision 6 options as F1b-1 rewrote them |
| Lenses | Lens: All, one party, several parties, and compare two, with markers moving to each party's stated location when the lens changes; the persistent banner (also on a shared link); neutral compare colours and halves |
| Links | A few sample arcs with line style by attribution state (F1b), weight changing as time is scrubbed, bundling, the legend sentence, off by default |
| Watchlist | Both tracks, visibly different, statuses as of the cursor date, the fixed headline ladder |
| Cards | Event, link and track cards at peek and expanded: status line first, then entries by date (who, stance, source), original claim kept in the history |
| Themes | Switcher for Classic, Ops and Paper; the swatch-based studio with live preview; export and import of a theme as a file and as a link, with strict validation of imported data; map-style picker including satellite with its adjustments |
| Help | Legend that reflects what is on ("solid = the sides on record agree it happened"); a first-run tour that can be replayed |
| Detail and screen | A Lite / Standard / Full switch (plus the automatic pick) and screen-pixel decluttering; clean view (one tap; lens tag stays); phone landscape offering both 2D and a zoomed-out globe with labels off |
| About | Live viewport size, device pixel ratio, layout class, detail level (picked and current), and a frame-rate reading in 2D and 3D, so Allan can report real numbers from his S22, Fire HD 10 and PC |

## Rules
- Path `prototype/v2/`. Self-contained; libraries from a pinned CDN; no keys; no personal data; no service worker.
- **Sample data only**, invented, and stamped "PROTOTYPE SAMPLE - NOT REAL DATA" on every item and in the header.
  Do not copy real events. Do not present any sample link as fact.
- Include sample happenings that exercise every case: one side only, two sides agreeing, two sides conflicting
  with different locations, a multi-target statement, an unresolved claim after its last check, and entries
  arriving on different dates so As known then visibly changes.
- Shape sample records exactly as the schemas say, so the prototype is also a check on them. Note any place where
  building against the documents showed them wrong or unclear; list these for the F2 review.
- No production features, no real data loading, no build step.
- The live app stays untouched; validators pass before each push.

## Sitting 1 — build
Build, run it in a headless browser if one is available in the workspace (check; do not assume), push, update
`F1_PROGRESS.md`, and tell Allan it is ready for a first look and that the self-review is next. Then ask him for
the go, model and effort for sitting 2.

## Sitting 2 — self-review at five form factors
- Screenshot at: 360x700 (phone portrait), 780x320 (phone landscape), 800x1200 (tablet portrait), 1280x760
  (tablet landscape), 1600x900 (PC), in each built-in theme for the default view, and in the default theme for the
  panel, card, links, watchlist, lens banner, compare, clean view and As known then states; phone landscape also
  with the globe.
- Run the acceptance checks in `LAYOUT_ENGINE_SPEC_v1.md` section 11 and the contrast rules. Fix what fails.
- Say plainly what a headless browser cannot tell you (touch feel, real device performance, sunlight legibility).
- Write `prototype/v2/REVIEW.md`: what passed, what was fixed, what is left, and the questions only Allan's
  devices can answer (design system section 11).

## Finish
End with the charter check. Phone-length reply: where to open it once merged (`/prototype/v2/`), what to try on each device (including the three provisional rulings to confirm), which decisions
it helps him rule on (4 to 8), and the list of document problems found. Update `STATE.md`, `F1_PROGRESS.md` and
`V2_SESSION_COMMON.md` section 2. Do not merge.
