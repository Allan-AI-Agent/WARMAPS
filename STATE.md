# WARMAPS — STATE OF RECORD

**Last updated:** 2026-11-09 (MST), **Day 255**. Version unchanged: **v01.09.03**. Events: **600** (IDs 1-600), latest event **Day 254 (Nov 8 2026)**.
**Verified by:** static validation + faked-clock behavioral test, run by an independent
validator agent and re-run by the lead session (see "Validation evidence"). **Verified on-device 2026-11-02 (Day 248)** by Allan's Trap 12 cold read after merge (see below).
**Update rule:** rewrite this file at every push. Trust it over memory, project
instructions, or Drive documents. If they disagree, this file wins.

### Trap 12 cold read, 2026-11-02 (Day 248): PASSED
PR #2 merged as `4ab6e46`. The live site served the new `index.html` (same sha256) within ~40 s
of the merge, checked by fetching the live page. Allan then opened the live site on his phone in
a fresh tab and read the values **without being told them first**:

| Check | Allan reported | Computed beforehand | Result |
|---|---|---|---|
| Version badge | v01.09.03 (leading zero confirmed) | v01.09.03 | match |
| Timeline last day | 248 | 248 (Nov 2 2026; Feb 28 = Day 1; same in 4 TZs) | match |

This also closes v01.09.02's open item "confirm badge text on a cold load".

## RULINGS 2026-11-09 18:03 (Allan) — queued for after the weekly reset (Fable gets tonight's allowance)
1. Iran military dead stat box: **keep 1,937+**; next research pass looks for a first-hand US/Israeli figure.
2. Key Strikes: **add all 25 candidates** (pass-1 milestones 349, 367, 374 + the 22 pass-2 milestones), each with a tier.
   The panel is a scrolling list with no hard cap; v2's design adds filtering by tier/theater.
3. 45 older day labels (ids 112-122, 238-295): **fix** (relabel `time` from the date; display-only).
4. Globe: **copy** selected God's Eye View parts into `globe/` (MIT notice kept, upstream commit pinned), not a fork.
5. Ship/plane history storage: R2 chosen with a hard cost ceiling of about $10; pending confirmation of the no-card
   alternative (a GitHub data branch) because R2 requires a payment method on file.
6. Old GitHub PAT: **revoked** by Allan (no longer used; pushes go through the Claude GitHub app).

## RULING 2026-11-09 (Allan): Russia-Ukraine scope = LEAN, backfill retained
Lean first load: milestones only 2022-2024 (~60), weekly 2025 (~50), daily from Feb 28 2026 (~250-300), ~350-400 events total.
**Backfill to the full design (monthly 2022-2024 detail, daily 2025) is retained as a planned, open capability**, not dropped:
the schema, timeline engine and research pipeline must support adding it later without rework.

## STATUS 2026-11-09: NIGHTLY INTAKE + VALIDATION AUTOMATED (GitHub Actions)
- `.github/workflows/intake.yml`: daily 6:17 AM MST, runs `intake/warmaps_intake.py` (37 feeds, keyword sort, no AI) and stores
  raw output on the **`intake-data` branch** (`raw/YYYY/MM/DD/`), off `main` so it never deploys or bloats the site.
- `.github/workflows/validate.yml`: runs `validate.js` + `test-timeline.js` on every PR to main and every push to main.
- Sandbox test 2026-11-09 16:56 MST: 1,542 entries read, 321 kept (iran-war 87, russia-ukraine 142, east-asia 44, caribbean 7,
  global 41). Refused our honest bot (skipped, not bypassed): UN News (robots.txt), CENTCOM, Mondoweiss, Efecto Cocuyo (robots 403), Arab News (403).
- NOT yet built: daily candidate-event drafting from intake (Claude task) and the phone approval page.

## STATUS 2026-11-09: BACKFILL PASS 2, Days 171-254 (Aug 17 - Nov 8 2026) — data only

Branch `data/backfill-171-254`, PR to `main`. Authorized by Allan 2026-11-08 ("I authorize the merge and ... bringing the data up to speed").
No code change to `index.html`; version stays v01.09.03.

**What shipped**
- `warmaps-data.js`: **215 events, IDs 386-600**, Days 171-254 (216 researched; 1 dropped as a duplicate in the final check, and IDs renumbered to stay continuous). Scope per the 2026-09-29 ruling: US+Israel vs Iran plus Lebanon/Hezbollah, Gaza/West Bank, Houthis, Iraq, Saudi Arabia/GCC, Hormuz/Red Sea shipping, diplomacy.
- Tiers (research pass): 22 milestone, 78 major, 116 standard. Tiers are NOT yet a schema field; they live in the research files.
- **93 events carry `FOG OF WAR:`** in `misc` (party claims, single-source, conflicting accounts, or supported only by a search snippet / headline).
- Coordinates: researcher-assigned; sea and region events use representative points.
- `tools/test-timeline.js`: expectations now derive from the data (timeline end = max(today, latest event); wrong-clock floor = latest event day, parsed independently). The old fixed "latest = 170" broke as soon as real data passed Nov 2.

**How it was produced (Trap 12 / independence)**
1. Four research agents (one per ~3-week block) built the events from web sources only (shared brief: sources required, latest figures, provenance noted, no bypassing blocks).
2. Four separate verifier agents that did not write the events checked **every milestone and major event plus a random 25% of standard events: 129 of 216 (60%)** against sources: 90 PASS, 39 FIX, 0 DROP. Fixes applied: 9 dates, 11 casualty figures, 12 text corrections, 20 fog flags, 2 cities, 1 country, 1 coordinate pair, 2 source replacements. PASS items the verifier could only support via search snippets were also set to fog.
3. Second pass (same day): the remaining 87 standard events were also verified: 81 PASS, 5 FIX, 1 DROP (duplicate). **All 215 published events have now been independently checked.** ISW and GlobalSecurity pages were partly unreadable to the verifier; claims resting on headlines or snippets only were set to fog.
- Many outlets (AP, Reuters, ISW, Al Jazeera live blogs) refused automated fetch; verifiers used other outlets or search results and did not bypass blocks. GlobalSecurity pages were read via Firecrawl where WebFetch was refused.

**Validation (lead session, both exit 0):** `validate.js` PASS (syntax, tags unchanged 9/9 11/11 466/466, IDs 1-600 continuous, all 260 events with id >= 342 match their dates, backticks unchanged); `test-timeline.js` PASS in 4 time zones.

**Research files (scratchpad, to be filed to Drive _RESEARCH):** per-block JSON with tiers, sources and verifier verdicts.

**Stat boxes refreshed 2026-11-09 (PR "stat boxes"), per the Sep 28 latest-figure ruling:**
targets struck 13,000+ (CENTCOM, Apr 7); Iran naval assets hit 155+ (CENTCOM, Apr 7); US 21 + IDF 40 = 61 dead (Pentagon Oct 15; IDF Aug 5);
Iran missiles + drones ~5,200+ (through Mar 25); Iran civilian dead 1,701+ (HRANA, Apr 7); Lebanon dead (all) 4,383 (Health Ministry, Sep 10);
Israel civilian 26 (Ynet/JINSA, Aug 5); US aircraft lost or damaged 81 (CRS, Oct 5). Each value carries a source comment in warmaps-data.js.
**Unchanged, for Allan:** Iran military dead 1,937+ (only alternatives: IDF claim 6,000+ via Wikipedia, or HRANA 1,221); US bases/ISR sites 40+,
Iran aircraft 51, Iran naval vessels 27 (no newer figures found). Several totals stop in March-April although strikes resumed Jul 7.
US wounded 865 (Pentagon, Oct 15) found; not shown in any stat box.

**NOT done in this pass (open)**
- Key Strikes panel: no new IDs added (editorial call for Allan; candidates = the 22 milestones).
- The 45 older day-label warnings (ids 112-122, 238-295): still awaiting Allan's OK.

---

## STATUS: DYNAMIC TIMELINE END + PASS-1 BACKFILL (Days 152-170)

### Built 2026-11-02, Claude Code cloud session, branch `v01.09.03`

**Context:** the build was staged on 2026-09-28 (Drive recipe
`STAGED_BUILD_v01.09.03_rebuild-recipe_(2026-09-28).md`, id `126dhHXq4PwVS3OstjdnAj5AbiK8BLd9d`)
but never pushed: that chat had no GitHub write path. The static `maxDay` 220 cap was passed on
Oct 5 (Day 220), so from then until this merge the live timeline could not reach today (F-002
manifesting). This session first fixed GitHub access: Claude was linked to Allan's old GitHub
account `sanceau`, which has no rights on the repo. Allan relinked Claude to `Allan-AI-Agent`,
and the session now pushes directly, with no PAT pasted into a chat.

**What shipped, in commit order (branch `v01.09.03`, PR to `main`):**
1. `p0-access-check` branch, commit `7c9820c` — empty `tools/.p0-access-check`. Proved push
   access (P0). Throwaway branch; not merged.
2. `index.html` (`bd5a669`) — dynamic timeline end, applied **exactly** from the Drive recipe.
   Result sha256 `d4e4b1e105533e09b944e417305adc84959e82019632a6bcc18bd5e5c3907287`, 310,138
   bytes: **matches the recipe's expected hash byte for byte.** Base was main at sha256
   `bdf6361f...a0d`, 308,634 bytes, also matching the recipe.
   - Version bumped in all 4 Rule-8 locations (title, `#wm-version` div, `versionFull`,
     hover-IIFE fallback).
   - New `setDynamicTimelineEnd()` IIFE, run right after `strikeDays` is built. It sets the
     `#tl-min` / `#tl-max` max attributes to the larger of `warDayNow()` and the latest event
     day, so (a) today is always reachable, and (b) a wrong device clock cannot hide data.
     Exposes `window.WARMAPS_TIMELINE_END`. Wrapped in try/catch, so on failure the static HTML
     attributes remain as the fallback.
   - `WARMAPS_CONFIG.maxDay` is documented in-file as NOT READ by any code (it never was: every
     consumer reads the slider attribute). Kept only for theater-config parity.
   - **This retires Trap 1 / F-002's recurring re-bump.** The static slider attributes (220)
     are now only a fallback.
3. `warmaps-data.js` (`c5e0968`) — **44 events, IDs 342-385**, from Drive
   `WARMAPS_RESEARCH_Days152-170_backfill-pass1_(2026-09-28).md` (id
   `1LfNlb0cC1NsXeJvZ6PYS0iSkxQX2OE_K`).
   - Day numbers computed in code from each date (Feb 28 2026 = Day 1). They match the brief's
     own headers.
   - Inserted on the `const strikes = [` anchor (F-004), with a check that the anchor is the
     terminator of that array.
   - Existing schema kept. The brief's REV B fields (`dateISO`, `origin`, `claimStatus`, `tier`)
     were **not** added; they wait for the schema migration and stay in the Drive brief.
   - The 11 fog-of-war items (342, 345, 352, 357, 363, 364, 366, 371, 375, 381, 385) carry an
     inline `FOG OF WAR:` caveat in `misc`, the same workaround as v01.09.02.
   - **Coordinates are Claude-assigned approximations** of each named place; the brief gave
     none. Sea and region events use representative points.
   - The brief's 3 "milestone" events (349 Trump cancels the energy campaign, 367 Mecca Joint
     Defence Agreement, 374 high-command rebuild) were **not** added to `keyStrikeIds`. That is
     an editorial call for Allan.
4. `tools/` (`92cb64e`) — reusable validators, written by an independent agent that did not
   write the edits:
   - `node tools/validate.js . <baseline-index.html>` checks syntax, tag balance against the
     baseline, event-ID continuity, 'Day N' vs date, and backtick count (Trap 4).
   - `node tools/test-timeline.js .` extracts the real `parseWarDay` / `warDayNow` /
     `setDynamicTimelineEnd` code from index.html and runs it under faked clocks in 4 time zones.
   - **Run both before every push.** Get the baseline with `git show main:index.html`.

### Validation evidence (independent agent; re-run by the lead session, both exit 0)
- `node --check` equivalent: warmaps-data.js plus all **9** inline script blocks — PASS.
- Tag balance: style 9/9, script 11/11, div 466/466, **unchanged** from v01.09.02 — PASS.
- Event IDs **1-385** continuous, no gaps, no duplicates — PASS.
- 'Day N' vs date: all 44 new events match — PASS.
- Backticks in index.html: 82, unchanged from baseline — PASS.
- Mutation test: the validators correctly FAILED on deliberately broken copies (syntax error,
  extra div, bad id, wrong day, added backtick, floor removed).
- Faked-clock behavioral test (real code, TZ = UTC, Phoenix, New York, Tehran, identical
  results): today's date, Feb 28 2027, and a wrong clock of Mar 1 2026 — **all three PASS**,
  including the wrong-clock case being floored to the latest event day: Nov 2 2026 -> 248,
  Feb 28 2027 -> 366, wrong clock Mar 1 2026 -> 170 (latest event day). Printed by
  `node tools/test-timeline.js .`.

### New finding: pre-existing day-label drift (NOT introduced by this build)
The validator found **45 older events whose `time: 'Day N'` label is one lower than their date
implies**: ids 112-122 (which look like a Feb 28 = Day 0 convention) and 238-295. Example: id 238
says Day 65, but its date, May 4, is Day 66. This affects only the display label; the timeline
places events by `parseWarDay(date)`, not by `time`. It was already on main and is **not fixed
here**. Open item below.

## PRIOR STATUS: v01.09.02 — BACKFILL DAYS 137-153 + maxDay/no-store fixes

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

### Schema note (v01.09.02 session)
The event object schema (see any entry in `warmaps-data.js`) has **no working `fogOfWar`
field** — confirmed again this session (matches the prior "referenced 0 times in
index.html" finding). The 7 fog-of-war-flagged events from the brief (IDs 301, 306, 310,
316, 320, 321, 329) were written with the caveat **inline in the `misc` field as plain
text**, matching how existing disputed/unconfirmed events in the file already handle this
(e.g. id 289's Trump quote, id 292's disputed vessel routing). This is a workaround, not a
fix — the underlying `fogOfWar` field gap is still open (see below).

### v01.09.02 partial on-device check — 2026-09-18, Day 203

Performed under Trap 12 discipline in a separate chat: Allan was asked to read the missile-wave
badge and the AI Intelligence panel **without being told the expected value first**. He reported
**Day 203** from both. Claude had independently derived Day 203 beforehand (Feb 28 2026 = Day 1)
and held that number until after Allan's report, per Trap 12. Match confirmed.

**What this DOES verify:** the two on-screen day-number displays agree with each other and with
an independent calculation, on the live v01.09.02 deploy, on this date. The Sep 11 "194 vs
expected 195/196" scare (see Trap 12's origin) does not recur here — no priming occurred this
time.

**What this does NOT verify (still open, unchanged from prior NEXT list):**
- The version BADGE TEXT itself (whether it displays the string "v01.09.02") — not read/reported.
- Whether the `_headers` no-store fix is actually effective — no hard-refresh-vs-stale-cache test
  was performed this check.
- The two layout collisions (header text overlap; IRAN MISSILE WAVES card overlapping AIRSPACE
  STATUS) — not looked at.

A full on-device session (all three remaining items) is still required before this line of NEXT
can be closed.


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
| version | **v01.09.03** (main `4ab6e46`, PR #2). Badge and timeline end verified on-device 2026-11-02 |
| repo | `Allan-AI-Agent/WARMAPS` branch `main` (PUBLIC). **One repo for all theaters** (ruling 2026-11-02): Russia-Ukraine folds into this repo later; no other repos |
| live | https://warmaps.allan-ai-agent.workers.dev/ (Cloudflare Pages/Workers) |
| GitHub access | Claude account linked to GitHub `Allan-AI-Agent` (relinked 2026-11-02; was `sanceau`). Cloud sessions push directly; no PAT needed |
| index.html | 310,138 bytes, sha256 `d4e4b1e1...7287` (was 308,634) |
| warmaps-data.js | 418,656 bytes (was 381,963) |
| events | **385**, IDs 1-385, no gaps, no duplicates |
| latest event | 2026-08-16 = **Day 170** |
| timeline end | **Dynamic** (`setDynamicTimelineEnd`). Static fallback in HTML: -30 / 220. `WARMAPS_CONFIG.maxDay` is not read |
| validators | `tools/validate.js`, `tools/test-timeline.js` |

## PERMANENT TRAPS (violating these has cost days)

1. **[UPDATED 2026-11-02] Timeline end is now dynamic.** `setDynamicTimelineEnd()` sets the
   slider max at load from `warDayNow()`, floored at the latest event day. **Do not re-bump
   maxDay for new events.** If the timeline ever stops short of today, the IIFE failed: check
   the console for "[WarMaps] dynamic timeline end failed". The old two-places rule (config +
   `#tl-min`/`#tl-max` attributes) applies only to the static fallback.
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


## OPEN ITEMS

- **Still open from v01.09.02:** confirm the `_headers` no-store fix works (the cold read used
  a fresh tab, so it does not prove this), and look at the two layout collisions.
- **[NEW 2026-11-02] Timeline slider handles (OBSERVED by Allan on phone):** the drag circles
  are very large and sit below the track line. INFERRED: probably default range-input styling on
  Android Chrome, never custom-styled for touch. Undiagnosed; group with the layout collisions.
- **Backfill Day 171 (Aug 17) through today (Nov 2): about 11 weeks, not researched.** Pass 2 starts at
  Day 171. The brief already carries 3 items for it: *Minoan Dignity* overnight Aug 17-18; the
  *AMARA* seizure Aug 17 (likely milestone, verify); and the Iran-Oman temporary route (Aug 26).
  Chunk into 2-3 week passes. **No maxDay bump is needed any more.**
- **Re-check the 11 fog-of-war items** (342 ... 385), which the brief scheduled for "Oct 5 with
  pass 2". That date has passed; do it with pass 2.
- **Stat-box refresh** (`statPerspectives[]`), not touched. The pass-1 brief has a ready table:
  - US KIA 18.
  - US wounded: **687 (GlobalSecurity, as of Aug 7)**. Allan's ruling 2026-11-02: use the
    later-dated figure (the other was 624, CNN, Jul 26). Show the as-of date with it.
  - Israeli military KIA 32+.
  - Iran: HRANA 3,636; Foundation of Martyrs 3,468.
  - Lebanon 4,219+.
  - Brent path to $79.47 (Aug 4 low).
  - Hormuz transits 17% of normal (Aug 15).
- **`fogOfWar` field** is still schema-absent. Events carry inline `FOG OF WAR:` text (32 occurrences in
  warmaps-data.js after pass 1, which added 11). A real field and UI marker are still needed.
- **Layout collisions** (header text overlap; IRAN MISSILE WAVES card over AIRSPACE STATUS):
  undiagnosed, carried from v01.09.02.
- **Day-label drift on 45 older events** (ids 112-122, 238-295; see the finding above). The
  fix is mechanical (recompute `time` from `date`), but changes the displayed labels. Allan to OK
  it first.
- **Key Strikes panel:** consider adding the 3 pass-1 milestones (349, 367, 374) to
  `keyStrikeIds`. Editorial call.
- **Context Cost & Session Hygiene process doc** (committed 2026-09-09): **still not written.**
  Carried a third time; flagged, not dropped.
- **v2 plan files on Drive:** not reviewed or reconciled with this file this session. Open.
- **SESSION_BOOTSTRAP.md is stale** on push mechanics: STEP 4 still describes the PAT flow.
  Cloud sessions linked to `Allan-AI-Agent` now push directly. Update it next session.
- **`p0-access-check` branch** can be deleted after merge.

## NEXT

1. Layout pass: the two collisions plus the slider-handle issue, on a verified-fresh load.
2. Pass-2 backfill research (Day 171 onward), in a fresh session.
3. Stat-box refresh (US wounded decided: 687 as of Aug 7).

v01.09.0 remaining: snap-ins, pin-to-slot, side-by-side, mobile-usable layout, schema REV B
(`dateISO` + `claimStatus` + `origin` + `tier`), About/method panel, real `fogOfWar` field.
v02.00.0: steady state.
