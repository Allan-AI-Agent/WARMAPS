---
title: WARMAPS v2 — Release Plan v1 (design whole, build thin)
version: v1.1 (enrichment track and slice-1 acceptance numbers added after the 2026-11-11 dry run)
date: 2026-11-11 (Iran-war Day 257)
author: Claude (Fable 5.2), session F1, for Allan Sanceau
status: DRAFT FOR RULING — slice order and model assignments proposed; nothing scheduled until Allan says GO
companions: ARCHITECTURE_v1.md, DESIGN_SYSTEM_v1.md, LAYOUT_ENGINE_SPEC_v1.md, WARMAPS_v2_PLAN v0.1 (phases P0-P7)
---

> **CHARTER CONFLICT (2026-11-12).** Parts of this document grade how true a claim is. The editorial charter in
> `STATE.md` (ruled by Allan 2026-11-12) forbids that: WARMAPS reports who said what, with sources, from every
> side, and never rules on truth. Affected here: S2 "confidence styling", the S4 content rule and exit test ("documented" links). Where this document and the charter
> disagree, the charter wins. Session F1b rewrites these parts; until then, do not build them. See `KNOWN_FAILURES.md` F-010.

# 0. Read this first (one screen)

**Plan in three lines**
- **Slice 1 gives you a usable v2 on your phone**: the new shell and layout, the whole Iran war on the 2D map, the
  shared timeline, at `/v2/`, beside v1. Nothing else is needed for it to be worth opening every day.
- **Then one increment at a time**, each usable by itself: panels → Russia-Ukraine (lean) → all theaters and
  links → globe → context layers → watchlist → cutover.
- **v1 stays live and current the whole time.** It is never edited for v2's sake, and both sites update from one
  data edit. The only one-way step is the final cutover, taken on your word.

| # | Slice | You can now... | Builder | Your part |
|---|---|---|---|---|
| S0 | Prototype (F1 Part B) | Judge the look and the layout on phone, tablet, PC with sample data | Fable 5.2 (this touchpoint) | Try it on three devices; rule on the decisions file |
| **S1** | **Shell + Iran 2D + timeline** | **Use v2 daily on the phone for the Iran war** | Opus 5.5 (build), Haiku 5.5 (independent check) | Cold read on the phone |
| S2 | Panels and confidence styling | See key events, stats, theater brief, fog and tiers; arrange panels on tablet and PC | Sonnet 5.5, Haiku check | Try tablet and PC layouts |
| — | *F2 review* | — | Fable 5.2 (short) | Read one page of findings |
| S3 | Russia-Ukraine, lean | Switch theaters; scrub 2022 to today | Opus 5.5 research, Sonnet drafting and code, independent verifier | Rule on contested items |
| S4 | All theaters + links | See both wars at once with sourced connections as arcs (2D) | Sonnet code; Opus research; Haiku check | Approve each link |
| S5 | Globe | See both wars move together on the 3D globe | Opus 5.5 | Device test, especially the Fire |
| — | *F3 review* | — | Fable 5.2 (short) | Read one page of findings |
| S6 | Context layers, a few at a time | Turn on flights, GNSS, fires, installations, cables, dams, space; vessels last | Sonnet 5.5, Haiku check | Approve each layer on device |
| S7 | Watchlist | Follow tripwires and rhetoric over time | Sonnet code; Opus drafts definitions | Rule on every definition and status |
| — | *F4 audit* | — | Fable 5.2 | Read the audit |
| S8 | Cutover | v2 becomes the site; v1 is archived at `/v1/` | Opus 5.5, Haiku check | Say GO; cold read |

Timing: the prompt's intent is roughly one slice a week at your 2-5 hours a week. That pace is a **target
(SPECULATION)**, not a promise: S1, S2, S4, S6 and S7 are mostly build sessions and should hold it; S3 is research
and is the one most likely to take two weeks (section 4).

---

# 1. Rules every slice obeys

1. **Additive.** A slice adds files, modules, fields and rail items. It does not rename a published field, re-key
   an ID, or restructure an earlier slice's module. If a slice appears to need that, stop and bring it to Allan:
   it means the architecture was wrong, and that is an F-level question, not a build decision.
2. **v1 untouched.** `index.html` and `warmaps-data.js` change only for v1's own data and fixes, exactly as today.
   Every v2 PR shows `git diff main -- index.html` empty unless it is a v1 data PR.
3. **One data edit, two sites.** Until S8, Iran events are added to `warmaps-data.js`; v2's files are generated
   from it (ARCHITECTURE 7.2). There is no period of double entry.
4. **Branch, validate, PR, merge on Allan's OK** (`SESSION_BOOTSTRAP.md`). All validators exit 0 before any push:
   the two v1 validators always, plus `validate-v2.js` from S1.
5. **Independent check.** The agent that validates did not write the code or the data (the Trap 12 principle, as
   used in backfill pass 2).
6. **One exit test per slice, read cold.** Allan is told what to open and what to read out, not what he should see.
7. **STATE.md is rewritten at every merge**, gaining a `v2` section; `F1_PROGRESS.md` is retired after S1 in favour
   of it.
8. **Reversible.** Any slice before S8 can be reverted by reverting its PR; the public site at `/` is unaffected
   because v2 lives under `/v2/`.
9. **No new cost without a ruling.** Everything through S5 is static files on the current free hosting. The first
   item that could cost money is the vessels relay in S6 (section 6).

---

# 2. Slice 1 — the thinnest usable v2

**Goal:** Allan opens `/v2/` on the S22 and can follow the Iran war there, more comfortably than in v1.

**In**
- `tools/migrate-v1.js`, `tools/build-manifest.js`, `tools/validate-v2.js`; generated `theaters/iran-war/*`,
  `theaters/theaters.json`, `theaters/manifest.json`; `validate.yml` extended to regenerate and diff.
- `/v2/` shell: `core/` (time, store, loader, selectors, errors, config), tokens and fonts, the layout engine with
  all five classes resolving correctly; **phone portrait and phone landscape built to full spec**, tablet and PC
  functional with one slot each.
- 2D view (Leaflet) through the renderer contract; theater outline; markers with theater shape and tier size
  (tier where known; otherwise standard).
- Timeline (custom control): cursor, window handles, density strip, Today, Play.
- One panel: **Events** (the list, which is also the accessible equivalent of the map). **Info card** for events,
  peek and expanded, showing the fog note and whatever sources exist.
- Top bar with the theater filter showing all four theaters (Iran usable; Russia-Ukraine, East Asia and Caribbean
  present as "no curated events yet"), the 2D/3D switch (3D disabled, "coming"), the Layers menu with only Events
  and Outlines live and the other rows visible but disabled.
- Version and data-version badge; error banner; `_headers` rules for `/v2/*` and `/theaters/*`.

**Out (on purpose):** other panels, stats, key events, links, watchlist, globe, context layers, Russia-Ukraine data,
light theme, panel dragging.

**Why this is not throwaway:** every piece listed is the permanent one. Later slices only add modules beside them.

**Exit test (cold read, phone, fresh tab):** Allan reads out the version badge, the last date on the timeline and
the number of events the Events panel reports for the full window; the session compares them with values computed
beforehand from the data. Then the layout acceptance checks 1-6 in LAYOUT_ENGINE_SPEC section 11.

**Builder:** Opus 5.5 for the build in one session (the foundation touches every later slice, which is the
"multi-system state" case that justifies the higher tier); an independent Haiku 5.5 agent runs validators,
mutation-tests `validate-v2.js`, and checks the generated files against `warmaps-data.js` (600 events, same IDs,
same text). **Not Fable.**

**Acceptance numbers:** the migration must reproduce the dry-run results exactly (ARCHITECTURE 7.2: 600 events,
126 fog, 352 unreviewed, zero schema failures, text byte-identical). `research/v2-schema-dryrun/` is its test oracle.

**Risk:** six dates and six time notes need a ruling (ARCHITECTURE 7.1). The migration lists them; Allan or a short
Sonnet pass rules on the uncertain few before merge. v1 is unaffected either way.

---

# 3. Slices 2 to 8

## S2 — Panels and confidence styling
- **Adds:** Key events, Stats (latest figure with as-of date), Theater brief (airspace status, naval positions by
  day), Sources & method, Settings; `enrich.json` seeded from the pass-2 research file so ids 386-600 show tier,
  fog, claim status and structured sources; full confidence styling; light theme; tablet and PC slots, pin, snap,
  Move menu, layout persistence; side-by-side with two 2D views.
- **Usable alone:** yes; this is the point where v2 covers most of what v1 shows.
- **Exit test:** layout acceptance checks 1-9 on phone, Fire tablet and PC; a cold read of one stat box value.
- **Builder:** Sonnet 5.5 (well-specified component work); Haiku check.
- **Then F2 (Fable, short):** compare the build with the three F1 specs from screenshots at the five classes; list
  drift and anything in the specs that reality proved wrong; update the specs. One session, findings on one page.

## S3 — Russia-Ukraine, lean
- **Adds:** `theaters/russia-ukraine/` with about 350-400 events per the 2026-11-09 ruling (about 60 milestones for
  2022-2024, about 50 weekly for 2025, about 250-300 daily from 28 Feb 2026), authored directly in schema v2 with
  tiers, sources and claim status from the start; its timeline bands; the theater becomes selectable.
- **Order inside the slice:** (a) 2022-2024 milestones and 2025 weekly first (about 110 events: the theater is
  already meaningful with history only); (b) daily 2026 in three-week passes, newest first, so the present is
  current early.
- **Method:** the backfill pass-2 method, unchanged: research agents with a written brief, sources required, no
  bypassing blocks, then separate verifier agents; fog set wherever support is snippet-only.
- **Usable alone:** yes: two separate, complete single-theater maps on one timeline.
- **Exit test:** `validate-v2.js` passes with zero ID or date errors in both theaters; Allan cold-reads the first
  and last event dates of the RU theater; spot-check of ten random events against their sources by the verifier.
- **Builder:** Opus 5.5 research and contested judgment; Sonnet 5.5 drafting and the small code part; independent
  Haiku/Sonnet verification. **This is the slice most likely to run long**; part (a) can ship as S3a.
- **Backfill capability retained:** adding daily 2022-2025 detail later is more events plus one band-unit change
  (ARCHITECTURE 5.2). No slice depends on it.

## S4 — All theaters and links
- **Adds:** multi-theater mode (filter, camera framing, combined timeline axis); `actors/actors.json` (starter set,
  about 40); `links/links.json` with the first real links; arcs on the 2D map; Links panel; link info card; the
  legend sentence; filters by category and confidence.
- **Content rule for the first set:** start with links that have a **documented** basis (sanctions designations,
  court filings, captured hardware, treaties). They are the least contestable and they set the tone. Reported and
  alleged links come after, clearly styled. Allan approves each link individually.
- **Usable alone:** yes: this is the first slice that shows the core idea.
- **Exit test:** validator honesty rules pass (no non-documented link with `fog: false`); with Links on at the
  all-theaters view, no more than 12 arcs draw; scrubbing 2022 → today visibly changes arc weights; Allan reads out
  the count badge on one bundled arc cold.
- **Builder:** Sonnet 5.5 code; Opus 5.5 research with an independent verifier; Haiku validation.

## S5 — Globe
- **Adds:** `view3d` (Cesium, lazy-loaded) rendering events, outlines and arcs through the same renderer contract;
  `globe/UPSTREAM.md` and licence notice; the render-governor idea from upstream; the frame-rate reading and the
  "offer 2D" fallback; 2D + 3D side-by-side on PC.
- **Usable alone:** yes; and nothing is lost if the Fire cannot run it, because 2D remains the default there.
- **Exit test:** measured frame rate and load time on the Fire HD 10, the S22 and the PC, written into STATE.md,
  replacing the SPECULATION numbers in ARCHITECTURE 9.4; same selection shows the same event in 2D and 3D.
- **Builder:** Opus 5.5 (new renderer, performance work).
- **Then F3 (Fable, short):** review the all-theaters globe view against the design system's restraint rules, on
  real data. This is the picture the project exists for; it gets a designer's eye before layers pile onto it.

## S6 — Context layers (several small merges)
- **Order:** military flights + GNSS integrity → active fires → installations, cables, dams → satellites over
  theaters, significant space objects, launches → vessels last (needs the key-brokering relay).
- **Each layer:** one module on the layer contract, one row already present in the menu becoming live, an
  attribution line, an info-card variant for tracks, and the OBSERVED label. Live layers work only when the cursor
  is today; history comes from the track data branch as it accumulates (ruling 5C).
- **Usable alone:** each layer is its own merge and can be skipped or postponed without affecting the rest.
- **Exit test per layer:** on by one tap, off by one tap, "Reset to default view" clears it, source and time shown
  on a tapped track, no frame-rate drop below the S5 measurement by more than a stated margin on the Fire.
- **Builder:** Sonnet 5.5; Haiku check. Opus only for the vessels relay design.

## S7 — Watchlist
- **Adds:** `watchlist/watchlist.json`, the panel with its two tracks, history replay on the timeline, the rail
  "has-news" dot on a status change, the fixed headline ladder.
- **Content:** definitions are written first and ruled by Allan one by one. Every initial status is `not-seen` or
  `quiet` unless evidence already in the events or links supports more.
- **Usable alone:** yes.
- **Exit test:** validator proves a combat tripwire cannot cite a rhetoric item or a statement event (mutation
  test); forbidden words absent from all generated strings; Allan reads one tripwire's status as of a past date cold.
- **Builder:** Sonnet 5.5 code; Opus 5.5 drafts definitions for ruling.
- **Why last:** it is the most interpretive feature and it leans on events and links being in place. The code is
  small; if Allan wants it earlier it can move ahead of S5 or S6 with no rework (it depends only on S4).

## S8 — Cutover
- **Entry condition (all must hold):** the parity list in section 5 is complete; **F4 audit** (Fable) finds no
  blocking issue; two weeks of v2 daily use without a blocking bug; Allan says GO.
- **Does:** the generated Iran files become the master and `enrich.json` is folded in; v1 is copied to `/v1/` and
  frozen with a banner pointing to the current site; `/` serves v2; `/v2/` redirects to `/`; `warmaps-data.js`
  stops receiving data; STATE.md, SESSION_BOOTSTRAP.md and the validators are updated in the same PR.
- **Exit test:** Trap 12 cold read of version and timeline end at `/`; `/v1/` still loads.
- **This is the only irreversible step in the plan** (after it, new events exist only in v2 format). Everything
  before it can be backed out.

---

## Track E — Enrichment pass (runs beside the slices; not a slice)
- **What:** the reviewed pass named in ARCHITECTURE 7.3. For the Iran theater it fills what the migration will not
  guess: kind (383 events), actors (600), titles for bare place names (331), claim status (352), tier (385),
  source links (350 events have none). Output goes into `enrich.json`; no code changes.
- **Order:** the 28 events with no source at all → the 33 key events → ids 1-385 newest first → a light pass over 386-600.
- **Method:** the backfill pass-2 method (drafting agents, independent verifiers, sources required, blocks
  respected, sourcing rule v2).
- **When:** any time after S1 merges. Each batch is its own small PR and makes v2 visibly richer the same day.
- **Depends on it:** decision 6 fades as it progresses; kind filters and actor-based link evidence for the Iran
  theater (S4) are better with it but do not wait for it.
- **Builder:** Sonnet 5.5 drafting; Haiku 5.5 or Sonnet verification by a different agent; Opus 5.5 only for
  contested calls. Allan rules on disputed items.

Naming note: "S1" to "S8" in this plan are slices. The older v2 plan mentions an "S1 Source & Feed Registry";
that is the source registry (ARCHITECTURE 4.5), not slice 1.

# 4. What can slip, and what cannot

| If this slips... | ...then |
|---|---|
| S3 research takes longer | Ship S3a (history only) and continue; S4 can start its code against sample links meanwhile, but real links wait for RU data they cite |
| The globe underperforms on the Fire | S5 still ships for PC and capable phones; the tablet stays on 2D with theater + theater side by side; revisit after trimming |
| Vessels relay cost or terms are unclear | Vessels stay "not built yet" in the menu; nothing else waits on them |
| Allan has no time in a given week | Nothing breaks: v1 and the nightly intake keep running, v2 simply does not advance |

What cannot slip without harm: **S1's migration checks**. If generated data is wrong, every later slice inherits it.

---

# 5. "v2 surpasses v1" — the parity list for cutover

v1 features found in `index.html` this session (VERIFIED: each was located by searching the file; behaviour was not exercised in a browser), and where v2 covers each:

| v1 feature | v2 slice |
|---|---|
| Event markers and popups, canvas renderer | S1 (markers, info card) |
| Timeline with two handles, dynamic end | S1 |
| All Strikes list, type filter list | S1 (Events panel with filters) |
| Key Strikes panel with six categories | S2 |
| Stat boxes with perspectives | S2 |
| Airspace status panel | S2 (Theater brief) |
| Naval assets with positions by day | S2 (Theater brief + map symbols) |
| Launch-origin arcs for the 12 events that have them | S2 |
| Dark / satellite basemap choice, full-screen control | S2 |
| Help panel, settings panel | S2 |
| AI intelligence summary (user-supplied provider key) | **Open:** carry over in S2, or retire. See decisions file |
| News ticker, missile-wave badge | Replaced by a "latest" list in the Events panel; not carried as-is |
| Active fires via a user-supplied FIRMS key | S6 (as a proper layer) |

Additions v1 never had (theaters, links, globe, layers, watchlist, structured confidence) are the reason for v2,
but cutover is judged on this list, so nothing a daily user relies on quietly disappears.

---

# 6. Cost and usage

| Item | Cost | Tier |
|---|---|---|
| Hosting `/v2/`, `/theaters/`, prototype | None beyond today (static files on the current Cloudflare free deploy) | INFERRED from the current setup |
| CI (validators, generate-and-diff) | None (public repo Actions) | OBSERVED in STATE.md |
| Fonts, icons, Leaflet, Cesium | None (open licences; Cesium's own library is free, and no Cesium ion or Google tiles are used) | INFERRED |
| Track history on a GitHub data branch | None (ruling 5C) | OBSERVED |
| Vessels relay (S6) | Possibly the paid Workers plan at about $5 a month, or run on OSIRIS | SPECULATION — needs a ruling before it is built; inside the "nominal ~$10, no surprises" ceiling only if confirmed |
| Model usage | Fable: four touchpoints only (F1 now; F2, F3, F4 short). Opus: S1, S3 research, S5, S8. Sonnet and Haiku for the rest | Per Allan's model calibration |

---

# 7. Fable touchpoints (and only these)

| Touchpoint | When | Scope | Output |
|---|---|---|---|
| **F1** | Now | Architecture, design system, layout spec, release plan, decisions; then the prototype (Part B) | These documents; `prototype/v2/` |
| **F2** | After S2 | Does the build match the specs at five form factors? What did reality disprove? | One-page findings; spec revisions v1.1 |
| **F3** | After S5 | The all-theaters globe and link presentation on real data: restraint, legibility, honesty of the picture | One-page findings; design-system revisions |
| **F4** | Before S8 | Pre-cutover audit: parity list, data integrity, additivity violations, open risks | Go / no-go recommendation for Allan |

---

# 8. First three actions after Allan rules
1. Part B: build the prototype (this touchpoint), self-review at five form factors, hand over for device testing.
2. Record the rulings in STATE.md and revise the three specs where a ruling changes them.
3. Start S1 in a fresh Opus 5.5 session from a session prompt that points at these documents and STATE.md.
