# WARMAPS — STATE OF RECORD

**Last verified:** 2026-09-09 — **Day 194**
**Verified by:** static validation only (node --check on all 9 inline script blocks, tag
balance, cross-timezone behavioural test). **ON-DEVICE CONFIRMATION PENDING** for v01.09.01.
Last on-device confirmation was v01.09.00, 2026-08-30, phone + Fire tablet.
**Update rule:** rewrite this file at every push. Trust it over memory, project
instructions, or Drive documents. If they disagree, this file wins.

---

## STATUS: v01.09.01 — DAY-NUMBER CALCULATION UNIFIED

### v01.09.01 (2026-09-09, Day 194)
Closed the day-number inconsistency. It was a **duplication** defect, not an arithmetic one:
three independent implementations of "what war day is it", two of which used `Math.floor`
over a timestamp still carrying a time-of-day component while `parseWarDay` used `Math.round`
over local midnight. Those disagree by one day under DST — Feb 28 is standard time, Aug 30 is
daylight, so the wall-clock interval is one hour short of a whole number of days.

- New `warDayNow()` beside `parseWarDay`, sharing the same `warStart` const. Single source of truth.
- AI-summary fallback (was line 4720) and missile-wave badge (was line 4789) now both call it.
- Removed two inline `new Date(2026,1,28)` epoch literals.
- Removed `Math.max(1, ...)` clamps that made pre-war days unrenderable now that minDay is -30.
- Verified identical output in Phoenix, Denver, New York, London, Tehran, UTC and Sydney:
  Feb 28 = Day 1, Aug 30 = Day 184, Sep 9 = Day 194, Jan 29 = Day -29.

**Residual, deliberately not fixed:** `showTlTip` still declares a third epoch literal, but it
is the inverse mapping (day to date) and uses calendar-based `setDate`, which is DST-safe.
Cosmetic duplication only.

**Unexplained, and left open honestly:** the divergence window is only the first hour after
local midnight, and only in a DST-observing zone. Phoenix never triggers it. Either the
2026-08-30 sighting happened in that window on a device not set to Arizona time, or a second
factor exists that was not found. The unified version is correct in every zone at every hour,
which makes the question moot rather than outstanding.

## PRIOR STATUS: v01.09.00 — PHASE-ISOLATED INIT SHIPPED

Milestone series opened. Hosting migrated to Cloudflare Workers; GitHub Pages unpublished.

### v01.08.20 → v01.09.00 (2026-08-31 / 09-01)
- **v01.08.20** CARTO basemap retired (API-key policy change) → Esri World Dark Gray, no key
- **v01.08.21** tile-only CSS filter to restore near-black ground the palette was designed for
- **v01.08.22** full-screen toggle as a Leaflet control, 44px on touch
- **v01.09.00** phase-isolated init completed — 10 subsystem guards + on-screen init health
  summary (amber banner naming failed subsystems; guards previously logged to console only,
  invisible on a device with no dev tools)

### IMPORTANT CORRECTION — what phase isolation does and does not fix
F-001 has **two variants** and they need different defences:

| Variant | Prevented by | Caught by |
|---|---|---|
| **Parse error** (the 2026-08-31 SyntaxError) | validate-before-push | red error banner |
| **Runtime exception** | — | phase isolation; app survives, amber banner |

`try/catch` cannot catch a SyntaxError, because the script block never executes. Earlier
notes called phase isolation "the permanent cure for F-001" — that was **wrong**, it cures
the runtime variant only.

## PRIOR STATUS: FIRST FULLY VERIFIED BUILD SINCE ~v01.08.05

The split architecture (v01.08.06) had never been confirmed working end-to-end on a
device until 2026-08-30. It now has been.

| Field | Value |
|---|---|
| version | **v01.09.01** |
| repo | `Allan-AI-Agent/WARMAPS` branch `main` (PUBLIC) |
| live | https://warmaps.allan-ai-agent.workers.dev/ (Cloudflare Workers) |
| index.html | 308,634 bytes |
| warmaps-data.js | unchanged since v01.08.08 |
| events | 297, IDs 1–297, no gaps, no duplicates |
| latest event | 2026-07-13 = Day 136 |
| minDay / maxDay | **-30 / 180** |
| slider attrs | `min="-30" max="180"` (SECOND location — see traps) |
| verified on | v01.09.00: Android phone + Fire tablet, 2026-08-30. v01.09.01: static only |

## WHAT WAS FIXED THIS SESSION (v01.08.10 → v01.08.19)

1. **parseWarDay repaired.** Full month names, real year parsed (was hardcoded 2026),
   day-number rollover guard, and NULL-on-failure instead of a silent Day 1.
   Recovered 12 events (IDs 286–297) that had been rendering on Feb 28 since v01.08.08.
2. **Timeline bounds.** minDay -3 → -30, maxDay 140 → 180, in BOTH locations.
3. **Touch targets.** 34px slider thumbs in 44px hit strips; 44x64px sidebar toggle.
4. **Landscape media query.** Header/ticker/ticks collapse below 500px height.
5. **Long-press → contextmenu bridge.** Right-click-only features now reachable on touch.
6. **Marker animations.** Bulk pulses disabled on coarse pointers; missile-exhaust and
   drone-orbit animations explicitly preserved.
7. **Service worker removed entirely** (kill switch shipped) — it caused version regression.
8. **On-screen JS error reporter** installed ahead of app code.
9. **Version badge no longer lies** — it was hardcoded `v01.08.09` in static HTML.

## OPEN ITEMS

- **Event backfill:** Day 137–184 (Jul 14 – Aug 30) missing. Days 136–152 already researched
  (44 draft events, IDs 298–341) in Drive `_WORKING_DOCS`. **That brief contains an incorrect
  day-conversion instruction — ignore it; Feb 28 = Day 1 matches GlobalSecurity exactly.**
- **Sluggish on Fire tablet** — improved but not resolved. Untested on phone since fix.
- **CARTO basemap watermark** — external policy change 2026-08-20; needs a free key or a
  switch to Esri Dark Gray Canvas.
- **Mobile unusable for real work** — info cards unreadable, screen too small. This is the
  v01.09 layout work, now evidence-backed rather than speculative.
- **Right-hand Strike Log slide-out** semi-complete.
- **fogOfWar referenced 0 times in index.html** — 15 flagged events render nothing.
- **`verified: false`** ambiguous on 25 events; 84 events unlabelled; 121 lack `perspective`.
- **Repo is PUBLIC** but README says DO NOT DISTRIBUTE. Cloudflare Pages decision parked.

## DEFERRED DECISIONS — revisit deliberately, do not continue by default

Items adopted as expedient that have a better end state. Flagged because the risk is drifting
on with them out of habit rather than choosing them again on merit.

| Item | Current state | Better end state | Revisit when |
|---|---|---|---|
| **Site hosting / deploy path** | Cloudflare Pages via GitHub App. The app holds read+write on administration, checks, code, deployments and PRs for the WARMAPS repo. Scope is one repo; permission set is not narrowable | **Self-hosted deploy from OSIRIS** via `wrangler pages deploy`, using a Cloudflare API token Allan scopes himself. The GitHub App is then revoked entirely and deployment moves to a machine Allan controls | OSIRIS has wrangler + a scoped CF API token. Allan flagged this 2026-08-31 specifically because it could be continued by habit |
| **Basemap** | Esri World Dark Gray, no key, maxZoom 16 | Confirm 16 is enough at conflict-map scale; CARTO with a free key remains the fallback | After on-device use |
| **Repo visibility** | PUBLIC while README says DO NOT DISTRIBUTE | Private | **BLOCKED — going private breaks the bootstrap.** `SESSION_BOOTSTRAP.md` fetches STATE.md and KNOWN_FAILURES.md from `raw.githubusercontent.com` with no credential; private returns 404 and every session starts blind. The OSIRIS mirror script also clones without a token. Both must authenticate first. COLLAB-REQ-002 tells Sol the repo is public — amend it too |

## PERMANENT TRAPS (violating these has cost days)

1. **maxDay lives in TWO places** — `WARMAPS_CONFIG.maxDay` AND the hardcoded `min`/`max`
   attributes on `#tl-min` / `#tl-max`. Patching one silently does nothing.
2. **Never append into an existing `<style>` or `<script>`.** This file contains the literal
   text `</style>` inside a JS string, so block boundaries cannot be detected reliably.
   New CSS goes in its own element.
3. **Never write literal markup tag text inside a CSS comment.** The parser closes the
   element there and dumps the rest as page text.
4. **No backticks in comments.** They caused `SyntaxError: Unexpected identifier`.
5. **Blank panels + dead clock + placeholder timeline + blank AUTHOR = a JS exception**,
   not a cache problem. Check the error banner first.
6. **Validate BEFORE pushing, never after.** Tag balance + `node --check` on every build.
7. **No service worker** without a version-check-and-force-update mechanism.
8. **URL is case-sensitive:** `/WARMAPS/` not `/warmaps/`.
9. **Day 1 = Feb 28, 2026** is canonical, matching the app and GlobalSecurity.org.
10. **TDZ rule** and **`_rebuildOriginIcons` mirror rule** still apply (see handoff doc).
11. **War-day math lives in ONE place: `warDayNow()` / `parseWarDay`.** Never recompute it
    inline. Never use `Math.floor` on a timestamp carrying a time-of-day component, and never
    re-declare the `new Date(2026,1,28)` epoch. Both mistakes shipped and produced a
    one-day-off display that survived several builds. Same failure family as F-002.

## NEXT
**IMMEDIATE — next chat session:** write the Context Cost & Session Hygiene process doc before
any other work. Content: one work package per chat; why a long chat becomes the most expensive
object in the workflow (every turn re-sends the whole accumulated context, so cost per turn
climbs with chat length regardless of how little work is done); STATE.md + SESSION_BOOTSTRAP.md
as the continuity mechanism that makes short chats safe; model/thinking-level tiering as a
secondary lever. Destination: `_PROCESS_DESIGN_&_IMPROVE/`. Committed 2026-09-09 by Allan.

**Then:** event backfill Day 137-184. Drafts for Days 136-152 (44 events, IDs 298-341) already
in Drive `_WORKING_DOCS`; ignore that brief's day-conversion instruction, Feb 28 = Day 1.
Remember trap 1: bump maxDay in BOTH places in the same commit as any event insert.

v01.08.x: graphics standardization, tablet performance, Strike Log slide-out completion.
v01.09.0: snap-ins, pin-to-slot, side-by-side, **mobile-usable layout**, schema
(`dateISO` + `claimStatus` + `origin`), About/method panel.
v02.00.0: steady state.
