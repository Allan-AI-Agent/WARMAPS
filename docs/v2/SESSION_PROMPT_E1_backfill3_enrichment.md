---
title: Session prompt E1 — backfill pass 3 (thin stretch) and enrichment batch 1
version: v1.0
date: 2026-11-11 (Iran-war Day 257)
for: a fresh Claude Code session, model Sonnet 5.5, thinking effort Medium, repository Allan-AI-Agent/WARMAPS; a different agent verifies
how to use: send "In the WARMAPS repo, read docs/v2/SESSION_PROMPT_E1_backfill3_enrichment.md and follow it. Do Part A only." (or Part B). If PR #17 is not merged yet, this file is only on branch v2/f1-architecture: say "check out branch v2/f1-architecture" first
budget: one session per part. Part A changes live data and needs Allan's explicit authorisation in the chat
---

You are doing data work for WARMAPS under its sourcing rules. Two separate jobs; do only the part Allan names.

## Before you start
1. Read `STATE.md` (the sourcing and access rule v2 is binding), `SESSION_BOOTSTRAP.md`, `KNOWN_FAILURES.md`,
   `docs/v2/V2_SESSION_COMMON.md`, and `research/backfill-pass2/README.md` (the method you will reuse).
2. Tell Allan: "Recommended: Sonnet 5.5, Medium; a separate agent verifies. Go?" and wait.

## Part A — backfill pass 3: the thin stretch
**Why.** A day-by-day count on 2026-11-11 (VERIFIED) found Days 57-140 (25 Apr to 17 Jul 2026) hold 84 events
across three four-week blocks (34, 20, 30), against 63 to 152 per block elsewhere, with empty runs on Days 62-65,
73-75, 82-87, 101-107 and 109-128 (16 Jun to 5 Jul). Allan confirms coverage is thin there (OBSERVED): he was not
working on WARMAPS for part of that time, and some data was never brought up to the current model. Whether the
war was also quieter in those weeks is not established; let the sources say.

**Do.**
1. Re-count first: the data may have changed since this prompt was written. Report the current gaps and the next
   free event id.
2. Research the stretch with the pass-2 method: a written brief per period, sources required and read, every
   side's account kept and attributed, fog flagged, tiers assigned, blocks and paywalls never bypassed and the gap
   noted, duplicates against existing events checked.
3. A **different** agent verifies every candidate against its sources before anything is added.
4. Show Allan the count, the tier split, the fog share and any contested items. **Add to `warmaps-data.js` only
   after he says go in this chat, on a new data branch cut from `main` (not from the v2 design branch).** Then follow the build and version rules in `STATE.md` and
   `SESSION_BOOTSTRAP.md` exactly (ids continuous from the next free id, version bump, validators, branch, PR).
5. Keep the research file under `research/backfill-pass3/` in the same shape as pass 2 (ISO date, tier, fog,
   sources, verified), so it can seed v2's `enrich.json`.

**Also offer, do not do unasked:** a one-pass fix of the 60 events (ids 109-297) whose `time` text carries a
"Day N" one lower than the computed day, and the six with stale day text (ids 126, 287, 288, 289, 294, 296).
See `research/v2-schema-dryrun/out/day-label-mismatches.json`.

## Part B — enrichment batch 1 (no change to the live app)
**Why.** `docs/v2/ARCHITECTURE_v1.md` section 7.3: the v2 migration will not guess. Existing events need kind,
actors, a title where `city` is a bare place name, claim status, tier, and source links.

**Do.** For this batch only: the 28 events with no source recorded, then the 33 key events.
1. For each event, propose the fields in the shape architecture 3.2 defines. Read the sources; do not infer a
   claim status from tone. Never set a truth grade (editorial charter in `STATE.md`): record who claims, who denies
   and who carried it, each with a source, and fog where a directly involved side has not been heard.
2. A different agent verifies each proposal.
3. Write results to `research/enrichment/batch-01.json`, keyed by the v1 event id, with a short `README.md`
   (method, counts, contested items). If slice 1 has merged and `theaters/iran-war/enrich.json` exists, write
   there instead and run `tools/validate-v2.js`.
4. Never edit `warmaps-data.js` in Part B.

## Finish (either part)
Phone-length reply: what was found, what was added or proposed, what needs Allan's ruling. Update `STATE.md` and
`docs/v2/V2_SESSION_COMMON.md` section 2. Open a PR; do not merge.
