---
title: Session prompt F1b — theme amendments to the WARMAPS v2 design documents
version: v1.1 (2026-11-12: editorial charter rewrite added as deliverable 0)
date: 2026-11-11 (Iran-war Day 257)
for: a fresh Claude Code session, model Fable 5.2, thinking effort High (was Medium; Allan decides), repository Allan-AI-Agent/WARMAPS
how to use: send "In the WARMAPS repo, check out branch v2/f1-architecture, read docs/v2/SESSION_PROMPT_F1b_theme_amendments.md and follow it."
budget: one short session. Documents only; nothing is built
---

You are continuing session F1 as lead designer for WARMAPS v2. Part A's documents exist and the architecture has
been corrected by a dry run. This session writes Allan's 2026-11-11 direction on themes, audience, help and the AI
feature into those documents, and applies any accepted fixes from the independent review.

## Before you start
1. Read `docs/v2/V2_SESSION_COMMON.md` (sections 3 and 4 are your source material) and follow its rules.
2. Read `docs/v2/DESIGN_SYSTEM_v1.md` fully; skim the other four design documents for the sections you will patch.
3. Read `research/v2-schema-review/REVIEW.md`: bottom line, must-fix table, and the 2026-11-12 addendum.
3a. Read the editorial charter in `STATE.md` (Allan, 2026-11-12) and `KNOWN_FAILURES.md` F-010. They win over the
   design documents.
4. Tell Allan: "Recommended: Fable 5.2, Medium. Go?" and wait. If the review has must-fix items, list them in
   one line each and ask which to accept before editing the architecture.

## Deliverables (push after each)

0. **Charter rewrite (first; the rest builds on it).** Replace every place the v2 design grades a claim's truth with
   attribution, keeping the design's structure: `ARCHITECTURE_v1.md` principle 2, 3.2 `claimStatus` and `origin`,
   3.4, 4.1 (link confidence), 4.2 (tripwire status and headline), 4.5, 5.6, 7.1 mapping, 7.4 validator E;
   `DESIGN_SYSTEM_v1.md` channel table and 2.3 (fill and line style show attribution state, e.g. one side's claim
   only, more than one side heard, acknowledged by the side affected, fog), `state-alert`; the confidence badge,
   legend and watchlist chips in `LAYOUT_ENGINE_SPEC_v1.md`; S2 and S4 wording in `RELEASE_PLAN_v1.md`; decision 6
   and the watchlist headline decision in `F1_DECISIONS_FOR_ALLAN.md`. Keep the review's must-fix items M1-M4;
   M4 (`origin`) becomes `claimedBy[]`. Re-run the dry run for the new mapping and re-baseline its numbers. Remove
   each charter-conflict banner only when its document is rewritten. End with the charter check.

1. **`DESIGN_SYSTEM_v1.md` → v1.1.** Restructure into:
   - **Grammar (fixed for every theme):** the four channels, shapes per theater, tier sizes, confidence fills, arc
     line styles (both showing attribution state under the charter, not confidence), contrast minimums, touch
     targets, restraint rules.
   - **Skin (set by a theme):** every token a theme may set, with its allowed values.
   - **Theme contract:** the theme config format (versioned; fixed choices, numbers and colours only), what the
     validator checks (contrast pairs computed, theater colours mutually distinguishable, nothing outside the
     allowed values), and the rule that an imported theme is data.
   - **Three built-in themes** with full token tables and computed contrast ratios: Classic (v1's look upgraded;
     read v1's actual colours and fonts from `index.html`, do not rely on memory), Ops, Paper.
   - **Map styles** as a setting separate from theme, including the satellite adjustments and the marker
     outline rule on imagery.
   - Confirm with a real check whether Share Tech Mono covers Cyrillic; say what you found.
2. **Patches** (keep each small; bump versions):
   - `ARCHITECTURE_v1.md`: where theme files live, the `theme` and `mapStyle` store keys, a theme validator in the
     validator list. Apply accepted review fixes here (v1.2) and list them in section 12.
   - `LAYOUT_ENGINE_SPEC_v1.md`: theme and map-style pickers in Settings; the studio panel (swatches, live
     preview, export/import; loads only when opened; behind a URL flag); Help panel with legend, design
     philosophy and how the site assigns its marks (who says what, never how true); a first-run tour replayable from Help.
   - `RELEASE_PLAN_v1.md`: state the audience assumption (built for more than one user); which slice carries the
     theme engine, the three themes and the studio; three-theme cap until cutover; a later slice for the AI
     briefing (daily published brief first, bring-your-own-key later); a public-use check on live layers before
     they are public; backfill pass 3 inside Track E.
   - `F1_DECISIONS_FOR_ALLAN.md`: rewrite decision 7 around the new AI direction (options: daily published brief
     after cutover; plus bring-your-own-key later; neither). Add **decision 8**: default theme (Classic, Ops),
     and whether Classic keeps v1's actor colours. Keep the one-table answer sheet at the top. No more than
     eight decisions.
3. Update `V2_SESSION_COMMON.md` section 2 and `F1_PROGRESS.md`; add a short status line to `STATE.md`.

## Limits
- Do not start the prototype. Do not add real events, links or watch items.
- Where Allan's direction (common brief section 3) and Claude's proposals (section 4) differ, his direction wins;
  where a proposal is not ruled, write it as a proposal and put the choice in the decisions file.
- Finish with a phone-length reply: what changed, the decisions now waiting, and the prompt line for the prototype
  session.
