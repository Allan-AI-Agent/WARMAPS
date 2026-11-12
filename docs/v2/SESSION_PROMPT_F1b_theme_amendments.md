---
title: Session prompt F1b — theme amendments to the WARMAPS v2 design documents
version: v1.0
date: 2026-11-11 (Iran-war Day 257)
for: a fresh Claude Code session, model Fable 5.2, thinking effort Medium, repository Allan-AI-Agent/WARMAPS
how to use: send "In the WARMAPS repo, check out branch v2/f1-architecture, read docs/v2/SESSION_PROMPT_F1b_theme_amendments.md and follow it."
budget: one short session. Documents only; nothing is built
---

You are continuing session F1 as lead designer for WARMAPS v2. Part A's documents exist and the architecture has
been corrected by a dry run. This session writes Allan's 2026-11-11 direction on themes, audience, help and the AI
feature into those documents, and applies any accepted fixes from the independent review.

## Before you start
1. Read `docs/v2/V2_SESSION_COMMON.md` (sections 3 and 4 are your source material) and follow its rules.
2. Read `docs/v2/DESIGN_SYSTEM_v1.md` fully; skim the other four design documents for the sections you will patch.
3. If `research/v2-schema-review/REVIEW.md` exists, read its bottom line and must-fix table.
4. Tell Allan: "Recommended: Fable 5.2, Medium. Go?" and wait. If the review has must-fix items, list them in
   one line each and ask which to accept before editing the architecture.

## Deliverables (push after each)

1. **`DESIGN_SYSTEM_v1.md` → v1.1.** Restructure into:
   - **Grammar (fixed for every theme):** the four channels, shapes per theater, tier sizes, confidence fills, arc
     line styles, contrast minimums, touch targets, restraint rules.
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
     philosophy and how confidence is assigned; a first-run tour replayable from Help.
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
