---
title: Session prompt F1 — WARMAPS v2 architecture, design system and interactive prototype
date: 2026-11-09 (War Day 255)
for: a Claude Code session at claude.ai/code, model Fable 5.2, repository Allan-AI-Agent/WARMAPS, environment WARMAPS
how to use: paste everything below the line as the first message
budget: one session; this is the first of four planned Fable touchpoints (F1-F4). Stop when the deliverables below are done.
---

You are the lead architect and designer for WARMAPS v2, working for Allan Sanceau. WARMAPS is a public, source-disciplined map of the wars that began in 2026 (US + Israel vs Iran, and everything drawn in), now expanding to Russia vs Ukraine on one shared timeline, with a 3D globe view. Live site: https://warmaps.allan-ai-agent.workers.dev/ (Cloudflare deploys `main` automatically).

Allan works mostly from a Samsung S22 phone and an Amazon Fire HD 10 tablet, sometimes a PC. He is a retired IBM senior consulting manager: terse, wants conclusions first, then detail. Label claims VERIFIED / OBSERVED / INFERRED / SPECULATION. No emojis. Keep chat messages short; put depth in the files.

## Read first (in this order; STATE.md wins over everything, including this prompt)
1. `STATE.md`, `KNOWN_FAILURES.md`, `SESSION_BOOTSTRAP.md` (push rules, validators, Trap 12).
2. `docs/v2/WARMAPS_v2_PLAN_2026-11-02_v0.1.md` (phases P0-P7; P0-P3 largely done).
3. `docs/v2/WARMAPS_v2_GEV_INTEGRATION_SPEC_2026-11-02_v0.1.md` and `docs/v2/layers.config.json` (globe layers, four states, all rulings).
4. `docs/v2/DECISION_2026-11-02_one-repo-for-all-theaters.md`.
5. Skim `index.html` and `warmaps-data.js` (v01.09.03, 600 events, Leaflet 2D map, single-file app) and `research/backfill-pass2/README.md` (event tiers, fog, verification).
6. Upstream globe reference (read, do not copy yet): https://github.com/bilawalsidhu/gods-eye-view (MIT, CesiumJS).

## Allan's standing rulings you must design to
- One repo for all theaters (`theaters/<theater>/...`). Russia-Ukraine scope: LEAN first (milestones 2022-2024, weekly 2025, daily from Feb 28 2026, ~350-400 events), with full-detail backfill retained as a planned capability: the data model and timeline must accept it later without rework.
- First load shows only the conflict's mapped events and theater outlines. Every context layer (military flights, ships, GNSS jamming, fires, installations, cables, dams, satellites over theaters, significant space objects, launches) is one tap away. Dormant and excluded layers per the globe spec.
- No self-imposed delay on provider data; every live track labelled OBSERVED with source and time.
- Honest access: honest User-Agent, robots.txt respected, never bypass blocks or paywalls.
- Use the latest figure unless flagged for inaccuracy, disinformation or no data.
- Recommended (confirm with Allan, not yet formally ruled): the globe is a selective graft into `globe/` (MIT notice kept, upstream commit pinned), not a full fork.

## The core design idea (Allan, 2026-11-09)
Allan's assessment (INFERRED/SPECULATION, not established) is that the two wars may be converging, in part or in whole. Design WARMAPS as **one connected system that can be shown as separate theaters**: it must work if they merge and be informative if they don't. "Seeing Iran and Ukraine move together on the globe with geopolitical information" is what moves the needle. Aesthetics are secondary to that but very important: the goal is functional and visually striking.

Required concepts:
1. **Events can belong to one or more theaters.**
2. **Links** are a first-class record type connecting actors and events across theaters. Categories: weapons and technology transfer (drones, missiles, components, know-how, either direction); intelligence sharing; sanctions and finance networks; energy and shipping flows; personnel (troops, POWs, trainers, volunteers); shared backers and diplomatic alignment. Each link has sources, a date or date range, a confidence label and fog flag. Links that rest on anonymous officials default to fog unless documented (sanctions designations, court filings, captured hardware).
3. **Convergence watchlist** with two tracks:
   - Combat tripwires (status: not seen / reported / confirmed, with evidence links). Examples: Russian naval escorts in Hormuz; Iranian personnel or missiles used directly against Ukraine or NATO; Russian forces engaging US or Israeli assets; NATO-Iran direct clash; coordinated cross-theater escalation timing.
   - Rhetoric and mobilization (weaker signal, its own lower confidence scale; it can never trip a combat tripwire): nuclear signalling, readiness-timeline statements, defence-budget surges, conscription, alliance pledges.
   The watchlist shows movement without predicting; it never says "merger" unless tripwires are confirmed.
4. **Theater filter** from a single theater to "all theaters"; all-theaters mode shows links as arcs on the globe and 2D map, on the shared timeline. Scrubbing time shows links thickening or thinning.
5. Links and the watchlist are one tap away, like other context layers, never on by default. Avoid "conspiracy board" clutter: density, restraint, confidence styling.

## Deliverables (write into the repo on branch `v2/f1-architecture`, open a PR, do NOT merge)
1. `docs/v2/ARCHITECTURE_v1.md` — data model and app architecture:
   - Event schema v2 (REV B fields: dateISO, theater[], tier, fog, claimStatus, origin as provenance never credibility, sources[]), Link schema, Watchlist schema, Theater config, and a migration plan from the current `warmaps-data.js` (600 events) with no ID breakage.
   - File layout (`theaters/`, `links/`, `watchlist/`, `globe/`, `intake/`), how the nightly intake (`intake-data` branch) feeds candidate events and candidate links.
   - Timeline engine supporting variable granularity (monthly 2022-2024 now, daily later) for the RU backfill capability.
   - How 2D (Leaflet) and 3D (Cesium globe) share one data layer and one timeline; performance budget for the Fire HD 10.
2. `docs/v2/DESIGN_SYSTEM_v1.md` — visual identity: type, colour (including how confidence/fog and theaters read at a glance, colour-blind safe), motion rules, map and globe styling, link-arc styling, light/dark, icon set, accessibility.
3. `docs/v2/LAYOUT_ENGINE_SPEC_v1.md` — the panel system: dock rail, snap-ins, pin, side-by-side views, info cards for events/links/tracks, touch gestures, and exact behaviour at phone portrait, phone landscape, tablet portrait/landscape, and PC; what collapses where.
4. **An interactive prototype** at `prototype/v2/index.html` (self-contained; may load CesiumJS and Leaflet from cdnjs/jsdelivr; no keys; small sample data: ~30 real events from both theaters taken from `warmaps-data.js` plus clearly-labelled SAMPLE links and watchlist items marked "PROTOTYPE SAMPLE - NOT REAL DATA"). It must demonstrate: theater filter including all-theaters mode, shared timeline scrubber, 2D/3D switch, one-tap layers menu (stub layers fine), dock/snap/side-by-side panels, info card, watchlist panel, and responsive behaviour across the five form factors. Allan will judge it on his phone, tablet and PC.
5. `docs/v2/F1_DECISIONS_FOR_ALLAN.md` — at most 7 decisions, each with options, your recommendation and why; one-word answers should be possible.

## Phasing and checkpoints (usage limits may stop this session at any moment)
Work in two parts. **Commit and push after EACH deliverable** (do not batch), and keep `docs/v2/F1_PROGRESS.md` updated
(done / in progress / next, with file paths) so a fresh session can resume from it if this one is cut off.
- **Part A (first):** deliverables 1, 2, 3 and 5, in that order: the architecture, design system, layout spec and decisions.
  Open the PR (not merged) as soon as deliverable 1 is pushed, so progress is visible.
- **Part B (when Allan says "continue with Part B", or in a new session told to resume from F1_PROGRESS.md):**
  deliverable 4, the prototype, built against the Part A documents, then the five-form-factor self-review.
If you are told usage is near its limit, finish the current file, push, update F1_PROGRESS.md, and stop.

## Rules
- Branch, validators, PR per `SESSION_BOOTSTRAP.md`. The live app (`index.html`, `warmaps-data.js`) must not change in this session; validators must still pass.
- Prototype is clearly marked as a prototype; Cloudflare will serve it at `/prototype/v2/` after merge, so keep keys and personal data out.
- Do not research or add new real events, and do not build production features; that is later work by other models. Your leverage is the architecture, the design and the prototype.
- Before finishing, review your own prototype at the five form factors (headless browser screenshots if available) and fix what is broken.
- Finish with a short message: what to open on the phone first, what to look for, and the decisions file. Then stop.
