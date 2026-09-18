# WARMAPS — STATE OF RECORD

**Last verified:** 2026-09-17 — **Day 202**
**Verified by:** static validation only (node --check on all 9 inline script blocks, tag
balance style 9/9 script 11/11 div 466/466, event-ID continuity 1-341 no gaps/dupes).
**NOT yet verified on-device.** Per Trap 12, do not assume the badge reads v01.09.02 until
someone reads it on a device WITHOUT being told the expected value first, AND does a true
hard-refresh (this session shipped the no-store fix that should make that unnecessary going
forward, but the fix itself is unverified — see Open Items).
**Update rule:** rewrite this file at every push. Trust it over memory, project
instructions, or Drive documents. If they disagree, this file wins.

---

## STATUS: v01.09.02 — BACKFILL DAYS 137-153 + maxDay/no-store fixes

### v01.09.02 (built 2026-09-17, Day 202)

**Context:** session opened via Catch Me Up in a fresh chat. Allan supplied a GitHub PAT to
unblock STATE.md access (session had none at start). Screenshot from Allan's phone showed
v01.09.01 live with Day 202 unreachable on the Day -30->180 timeline (F-002 manifesting) and
two undiagnosed layout collisions (header text overlap; IRAN MISSILE WAVES card overlapping
AIRSPACE STATUS). Allan asked to complete the ready-to-insert backfill now, defer new
research to a fresh chat after usage window reset.

**What shipped, in commit order:**
1. `warmaps-data.js` (`4369c900`) — inserted 44 events, IDs 298-341, from
   `WARMAPS_RESEARCH_Days136-152` (Drive id `1TH8U7Qzdt4Hx_vqFYrXpHRrvld3Ad6cs`), with
   **ERRATUM-001's day correction applied** (brief's stated day +1 in every case — verified
   programmatically against `warStart = Feb 28 2026` for 5 spot-check dates, all matched the
   erratum's corrected table exactly). Result: events now span **Day 137 (Jul 14) through
   Day 153 (Jul 30)**, not 136-152 as the brief's uncorrected table said. Array anchored on
   `const strikes = [` per Rule 4/F-004; insertion point verified unique before editing.
2. `index.html` (`ea6dffb6`) — `maxDay` 180 -> 220 in BOTH locations (config line 1929 +
   slider attrs lines 1755/1756), per F-002. 220 chosen as today (Day 202) + ~18-day buffer,
   not exactly 202 — **Claude's assumption, not confirmed with Allan**; revisit if a tighter
   or dynamic scheme is preferred.
3. `_headers` (`6b543207`, **new file**) — Cloudflare Pages headers file, `Cache-Control:
   no-store` on `/` and `/index.html`. This is the Trap 12a fix ("FIX PENDING" in the prior
   STATE.md). **Not yet confirmed effective** — Cloudflare Pages must pick up the new file on
   its next deploy from this push; no on-device test has happened yet.
4. `index.html` (`77006bf9`) — version bumped v01.09.01 -> **v01.09.02** in all 4 Rule-8
   locations (title, `#wm-version` div, `versionFull` config, version-hover IIFE fallback).
   Bumped because index.html's maxDay values changed; leaving the badge stale would have
   recreated F-003. Three unrelated code-comment mentions of v01.09.01 (lines documenting
   when `warDayNow()` was introduced) were deliberately left untouched — historical markers,
   not display strings.

**Validation performed (all before each push, per the standing rule):**
`node --check` on `warmaps-data.js` (pass) and on all 9 inline script blocks of `index.html`
(pass, both before and after the version bump) · style/script/div tag balance 9/9, 11/11,
466/466 · event ID continuity 1-341, zero gaps, zero duplicates (programmatic check, not
eyeballed).

**Total events: 341** (was 297). **Latest event: Day 153 (Jul 30, 2026)**, was Day 136.

### Schema note discovered this session
The event object schema (see any entry in `warmaps-data.js`) has **no working `fogOfWar`
field** — confirmed again this session (matches the prior "referenced 0 times in
index.html" finding). The 7 fog-of-war-flagged events from the brief (IDs 301, 306, 310,
316, 320, 321, 329) were written with the caveat **inline in the `misc` field as plain
text**, matching how existing disputed/unconfirmed events in the file already handle this
(e.g. id 289's Trump quote, id 292's disputed vessel routing). This is a workaround, not a
fix — the underlying `fogOfWar` field gap is still open (see below).

## Open items from this session, in addition to those carried forward

- **Two on-device checks are now required and have NOT been done:**
  1. Hard-refresh on a device, read the version badge cold (no expected value stated first,
     per Trap 12) — confirm it shows v01.09.02, confirm the no-store `_headers` fix actually
     stops stale-shell serving.
  2. Confirm whether the two layout collisions seen in Allan's phone screenshot (header text
     overlap; IRAN MISSILE WAVES card overlapping AIRSPACE STATUS) are real current-build
     bugs or were an artifact of a non-hard-refreshed tab. **Neither is diagnosed. Neither
     is in the Known Failures register (F-001 through F-009).** If confirmed real on a
     verified-fresh load, they are new entries, not recurrences.
- **Stat-box figures are stale.** The brief flagged: US wounded should read 427 (was
  reading an older number), Iran cumulative casualty estimates need updating (HRANA 3,636 /
  Foundation of Martyrs 3,468 / US-Israeli estimates 6,000+), Israeli ~57 cumulative deaths,
  Lebanon 4,219+ since Mar 2, Brent $88.10 (Jul 17 reference point). **Not touched this
  session** — these are separate from the strikes[] array (likely in `statPerspectives[]`
  or similar) and were out of scope for "safe, ready-to-insert" work.
- **Jul 19-20 and Jul 25 remain thin/gapped** within the newly inserted range. The brief's
  author recommended adding a "consecutive night campaign" arc event spanning Jul 19-25
  rather than leaving bare gaps. **Deliberately not added this session** — it would mean
  inventing a new event beyond the 44 already drafted and reviewed, which was outside the
  "safe, ready" scope Allan asked for. Flagged for a future backfill session.
- **fogOfWar field is schema-absent**, not just unused — confirmed again (see schema note
  above). If this is meant to become real (a filterable/visual indicator), it needs actual
  implementation, not just inline text caveats. Not scoped this session.
- **Event backfill remaining: Day 154-202 (Jul 31 - Sep 17), 49 days, NOT researched.**
  This is the next work package — per Allan's instruction, deferred to a fresh chat after
  the usage window resets. Recommend chunking into 2-3 week research passes rather than one
  49-day sweep, consistent with the one-work-package-per-chat rule.
- **The Context Cost & Session Hygiene process doc commitment (2026-09-09, Allan) is STILL
  not written.** It was carried in this STATE.md's own NEXT section from the 2026-09-15
  version and was not addressed this session either — Allan's own closing instruction for
  the prior session did not mention it, creating a real gap between what STATE.md commits to
  and what actually happens session to session. Not resolved here; flagged explicitly rather
  than dropped silently a second time.
- **GitHub PAT handling:** this session required Allan to paste a PAT mid-conversation
  because the fresh chat started without one. Consistent with existing practice (PAT is
  pasted per session, not stored) — no change needed, just noting the mechanism worked.

## PRIOR STATUS: v01.09.01 — DAY-NUMBER CALCULATION UNIFIED

### v01.09.01 (built 2026-09-10/11, Days 195-196; verified on device 2026-09-15, Day 200)
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
  Feb 28 = Day 1, Aug 30 = Day 184, Sep 15 = Day 200, Jan 29 = Day -29.

**Residual, deliberately not fixed:** `showTlTip` still declares a third epoch literal, but it
is the inverse mapping (day to date) and uses calendar-based `setDate`, which is DST-safe.
Cosmetic duplication only.

## PRIOR STATUS: v01.09.00 — PHASE-ISOLATED INIT SHIPPED

Milestone series opened. Hosting migrated to Cloudflare Workers/Pages; GitHub Pages unpublished.

### v01.08.20 -> v01.09.00 (2026-08-31 / 09-01)
- **v01.08.20** CARTO basemap retired (API-key policy change) -> Esri World Dark Gray, no key
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

`try/catch` cannot catch a SyntaxError, because the script block never executes.

## KEY FIELDS

| Field | Value |
|---|---|
| version | **v01.09.02** (unverified on-device — see Open items) |
| repo | `Allan-AI-Agent/WARMAPS` branch `main` (PUBLIC) |
| live | https://warmaps.allan-ai-agent.workers.dev/ (Cloudflare Pages/Workers) |
| index.html | 308,634 bytes (unchanged — all edits this session were same-length substitutions) |
| warmaps-data.js | 381,963 bytes (was 352,437) |
| events | **341**, IDs 1-341, no gaps, no duplicates |
| latest event | 2026-07-30 = **Day 153** |
| minDay / maxDay | -30 / **220** (was -30/180) |
| _headers | **new this session** — no-store on `/` and `/index.html` |

## PERMANENT TRAPS (violating these has cost days) — unchanged from prior version, all still apply

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
    re-declare the `new Date(2026,1,28)` epoch.
12. **NEVER STATE THE EXPECTED VALUE BEFORE ASKING FOR A VERIFICATION.** Give the instruction
    ("read the badge and tell me what it says"), take the raw reading, THEN compare.
    (a) **On-device checks require a HARD REFRESH.** The `_headers` no-store fix shipped this
    session should make this less necessary going forward, but is itself unverified — treat
    hard-refresh as still required until that's confirmed.
    (b) **In a non-DST timezone the day number cannot distinguish some build pairs** — use
    the VERSION BADGE as the discriminator, not the day number, when in doubt.
13. **Verify the date from the clock at the start of every session.** Never infer the date
    from context or memory.
14. **[NEW, from this session]** A research brief's stated day numbers are not automatically
    trustworthy even after an erratum exists for a prior brief — this session verified the
    Days 136-152 brief's numbers programmatically against `warStart` before trusting them,
    rather than assuming the erratum's "+1" rule transfers correctly by inspection alone.
    Worth keeping as practice for future backfill briefs.

## NEXT

**Still outstanding, carried forward and NOT resolved this session (see Open Items above for
why):** the Context Cost & Session Hygiene process doc, committed 2026-09-09.

**Immediate, next WARMAPS session:**
1. On-device verification (hard-refresh, cold read, Trap 12 discipline) — confirm v01.09.02
   badge, confirm `_headers` no-store fix works, confirm/deny the two layout collisions.
2. If layout collisions are confirmed real: diagnose (likely CSS, not yet attempted).
3. Stat-box figure updates (US wounded 427, Iran/Israel/Lebanon cumulative figures, Brent
   $88.10 reference).

**Then, in chunked sessions:** Day 154-202 backfill (49 days), recommend 2-3 week research
passes rather than one sweep. Remember Trap 1/F-002: bump maxDay in BOTH places in the same
commit as any event insert.

v01.09.0 remaining: snap-ins, pin-to-slot, side-by-side, mobile-usable layout, schema
(`dateISO` + `claimStatus` + `origin`), About/method panel, real `fogOfWar` field
implementation (currently absent from schema — see this session's schema note).
v02.00.0: steady state.
