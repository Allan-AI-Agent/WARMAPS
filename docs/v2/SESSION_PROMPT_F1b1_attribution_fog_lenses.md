---
title: Session prompt F1b-1 — attribution, fog and lenses in the WARMAPS v2 design documents
version: v1.0
date: 2026-11-12 (Iran-war Day 258)
author: Claude (Opus 5.5) for Allan Sanceau, from the 2026-11-12 R1 follow-up chat
for: a fresh Claude Code session, model Fable 5.2, thinking effort High, repository Allan-AI-Agent/WARMAPS
how to use: send "In the WARMAPS repo, check out branch v2/f1-architecture, read docs/v2/SESSION_PROMPT_F1b1_attribution_fog_lenses.md and follow it."
budget: one session. Documents only; nothing is built. F1b-2 (themes, detail levels, screen size) follows in its own chat
---

You are continuing session F1 as lead designer for WARMAPS v2. On 2026-11-12 Allan ruled an editorial charter: WARMAPS
reports who said what, with sources, from every side, and never rules on whether a claim is true. Parts of the v2
design grade truth and carry a CHARTER CONFLICT banner. This session rewrites them around attribution and writes in
the fog, lens and timeline direction Allan agreed the same day. The design's structure (layout engine, timeline
model, theaters, renderer and layer contracts, file layout, migration mechanics) stays as it is.

## Before you start
1. Read `STATE.md` (the charter section first), `KNOWN_FAILURES.md` F-010, then `docs/v2/V2_SESSION_COMMON.md`.
   **Section 3b of the common brief is your source material.** Where a design document disagrees with the charter
   or with section 3b, they win.
2. Read `research/v2-schema-review/REVIEW.md`: bottom line, must-fix table M1-M4, and the 2026-11-12 addendum.
3. Read fully `ARCHITECTURE_v1.md`; read the sections of `DESIGN_SYSTEM_v1.md`, `LAYOUT_ENGINE_SPEC_v1.md`,
   `RELEASE_PLAN_v1.md` and `F1_DECISIONS_FOR_ALLAN.md` named in their banners.
4. Tell Allan: "Recommended: Fable 5.2, High. Go?" and wait. List M1-M4 in one line each and ask which he accepts
   before editing the architecture.

## Deliverables (push after each)
1. **`ARCHITECTURE_v1.md` → v1.2: attribution model.**
   - Replace `claimStatus` grades and `origin` with dated **entries** per happening (who, side, stance claims /
     denies / acknowledges, `published` required, location if given, figures, source), `claimedBy` separate from
     carriers (charter rule 3), and derived fields for sides on record, sides missing and the four looks (ghost,
     solid, split, faded ghost). Write the exact derivation rules so two builders get the same result.
   - Location history and the conflicting-location rule; the look-again schedule (1, 3, 7, 30 days, provisional) and
     the "unresolved as of" state; tombstones instead of deletion (M1).
   - Links (4.1) and the watchlist (4.2) as attributed entries: who affirms, who denies, with sources; no
     confidence grade, no `confirmed`, no verdict headline. Keep what the review says still matters (what weight
     counts; history entries keep what they relied on).
   - Core-store state and selectors for: lens (one or more actors, compare two), fog layers and the Contested
     filter, the 7-day default window, and Record today versus As known then. Rename link `confidence` in the
     renderer contract (9.2).
   - The status-line derivation (sides on record, missing, agree/disagree, imagery count with publisher).
   - Apply the M1-M4 fixes Allan accepts. Update the migration mapping (7.1) for the 600 v1 events: most become
     single-entry records with the claimant still in `needs`. Re-run the dry run with the new mapping and
     re-baseline its numbers (`research/v2-schema-dryrun/`).
   - The validator list (7.4) includes the charter test from `SESSION_PROMPT_S1_shell.md`.
2. **`DESIGN_SYSTEM_v1.md`: the grammar under the charter.** The four looks (ghost, solid, split, faded ghost) with
   exact strokes, fills and opacities; the size cap for one-sided claims; compare-mode neutral colours and halves;
   the lens banner and tag; the status line; the dark keyline for ghosts on imagery; legend wording ("solid = the
   sides on record agree it happened", never "confirmed"). Remove `state-alert` as a verdict colour.
3. **`LAYOUT_ENGINE_SPEC_v1.md`:** the lens button and banner per form factor; the On the record / Fog / Contested
   layer controls; the Record today / As known then switch; the 7-day band on the timeline with drag and All; the
   status line on cards at peek and expanded; Help explains how the site assigns its marks (who says what).
4. **`RELEASE_PLAN_v1.md`:** which slice carries the entries model, the four looks, fog layers, lenses and compare,
   As known then, and the look-again task (an intake job, Track P). S2 and S4 wording without truth grades.
5. **`F1_DECISIONS_FOR_ALLAN.md`:** rewrite decision 6 and the watchlist headline decision under the charter;
   record the three provisional rulings from section 3b; add a decision only if the rewrite truly needs one.
6. Remove each CHARTER CONFLICT banner only when its document is rewritten. Update `V2_SESSION_COMMON.md`
   section 2, `F1_PROGRESS.md` and `STATE.md`.

## Limits
- Do not touch themes, detail levels or screen-size rules beyond what this rewrite requires; those are F1b-2.
- Do not start the prototype. Do not add real events, links or watch items.
- Where section 3b leaves something open, write it as a proposal and put the choice in the decisions file.
- End with the charter check (common brief section 1) and have it repeated by a checker that did not write the
  documents, if Allan authorises one; otherwise say it was self-checked.
- Finish with a phone-length reply: what changed, decisions now waiting, and the prompt line for F1b-2.
