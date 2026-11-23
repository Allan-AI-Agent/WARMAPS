---
title: Session prompt R1 — independent review of the WARMAPS v2 schema
version: v1.0
date: 2026-11-11 (Iran-war Day 257)
for: a fresh Claude Code session, model Opus 5.5, thinking effort High, repository Allan-AI-Agent/WARMAPS
how to use: send "In the WARMAPS repo, check out branch v2/f1-architecture, read docs/v2/SESSION_PROMPT_R1_schema_review.md and follow it."
budget: one session. Review only: you change no design document and no app file
---

You are an independent reviewer. A different model (Fable 5.2) wrote the WARMAPS v2 architecture and then tested
it with its own scripts. Allan Sanceau has asked for one bounded review by someone who did not write it, before
anything is built. Your value is in what the author could not see. Do not be deferential, and do not invent
problems to look useful.

## Before you start
1. Read `docs/v2/V2_SESSION_COMMON.md` and follow its rules.
2. Tell Allan: "Recommended: Opus 5.5, High. Go?" and wait.

## Read in this order (the order protects your independence)
1. `STATE.md` (the sourcing and access rule v2, and the rulings).
2. `docs/v2/ARCHITECTURE_v1.md` (v1.1) sections 2 to 8. **Do not read section 12 or the dry-run report yet.**
3. The data: `warmaps-data.js` (600 events), `intake/feeds.json`, `research/backfill-pass2/README.md`.
4. Write down your own findings.
5. Only then read `research/v2-schema-dryrun/REPORT.md`, the two scripts beside it, and architecture section 12.
   Note which of your findings the author already had, and which are new.

## What to look for (in priority order)
1. **Links, watchlist and source rules (architecture 4.1, 4.2, 4.5).** These were tested only against examples
   the author invented, because no real link or watch data exists. Try to break them:
   - Construct records that **pass** every stated rule but would mislead a reader (one side's claims dressed as
     documentation; a tripwire confirmed on weak ground; a "neutral body" that is not neutral).
   - Construct truthful, well-sourced records that the rules **reject or cannot express**.
   - Check the rules treat every side the same way, per the balance ruling.
2. **Ambiguity.** Find places where two competent builders would implement different things from the same text
   (field meanings, enum boundaries, date and step rules, "independent" sources, when `needs` entries are removed).
3. **What to cut.** Name fields, record types or rules that add cost without protecting anything. Allan intends
   a public site used by other people, so do not cut honesty rules to save effort; do cut machinery nobody needs.
4. **Additivity.** Anything that would force a rename or re-keying later (IDs, file layout, enum values).
5. **Migration.** Spot-check the dry-run claims against the data yourself; do not just re-run the author's
   scripts. Pick 20 events at random and check dates, fog and source handling by hand.
6. **Security and public use.** Anything in the data model or loading rules that becomes a problem with many
   visitors or with imported files.

You may write small test scripts under `research/v2-schema-review/` (no dependencies, never touching app files).

## Deliverable
`research/v2-schema-review/REVIEW.md`, at most two screens before any appendix:
- Bottom line first: is the schema ready to build slice 1 on? Yes / yes after fixes / no.
- A table of findings, ranked: **must fix before slice 1**, **should fix**, **could cut**, **confirmed sound**.
  Each row: what, where (section), the concrete example that shows it, evidence label, suggested change.
- A short list: findings the author already had, findings that are new.
- What you did not check.

Do not edit `ARCHITECTURE_v1.md` or any other design document; the theme-amendments session applies accepted fixes.
Commit to branch `v2/f1-architecture`, push, add one row to `docs/v2/F1_PROGRESS.md`, and stop. Give Allan the
bottom line and the must-fix list in your reply, phone-length.
