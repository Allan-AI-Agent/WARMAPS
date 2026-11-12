---
title: Session prompt F1b-2 — themes, detail levels and screen size in the WARMAPS v2 design documents
version: v1.2 (2026-11-12: split; the charter rewrite moved to F1b-1; detail levels, screen size, clean view added)
date: 2026-11-11 (Iran-war Day 257)
for: a fresh Claude Code session, model Fable 5.2, thinking effort Medium (Allan decides), repository Allan-AI-Agent/WARMAPS
how to use: send "In the WARMAPS repo, check out branch v2/f1-architecture, read docs/v2/SESSION_PROMPT_F1b_theme_amendments.md and follow it."
budget: one session, after F1b-1. Documents only; nothing is built
---

You are continuing session F1 as lead designer for WARMAPS v2. Session F1b-1 has rewritten the design around the
editorial charter (attribution, not verification) and written in the fog, lens and timeline direction. This session
writes Allan's direction on themes, audience, help and the AI feature (common brief section 3), plus detail levels,
screen size, clean view and phone landscape (common brief section 3b), into the documents.

## Before you start
0. **Gate:** `F1_PROGRESS.md` must show F1b-1 done and no CHARTER CONFLICT banner left in `DESIGN_SYSTEM_v1.md`.
   If not, stop and tell Allan F1b-1 has to run first.
1. Read `docs/v2/V2_SESSION_COMMON.md` (sections 3, 3b and 4 are your source material) and follow its rules.
2. Read `docs/v2/DESIGN_SYSTEM_v1.md` fully; skim the other four design documents for the sections you will patch.
3. Read the editorial charter in `STATE.md` (Allan, 2026-11-12) and `KNOWN_FAILURES.md` F-010. They win over the
   design documents.
4. Tell Allan: "Recommended: Fable 5.2, Medium. Go?" and wait.

## Deliverables (push after each)

1. **`DESIGN_SYSTEM_v1.md` → next version.** Restructure into:
   - **Grammar (fixed for every theme):** the four channels, shapes per theater, tier sizes, arc
     line styles and the four looks as F1b-1 defined them (themes may restyle them, never change what they mean),
     contrast minimums, touch targets, restraint rules.
   - **Skin (set by a theme):** every token a theme may set, with its allowed values.
   - **Theme contract:** the theme config format (versioned; fixed choices, numbers and colours only), what the
     validator checks (contrast pairs computed, theater colours mutually distinguishable, nothing outside the
     allowed values), and the rule that an imported theme is data.
   - **Three built-in themes** with full token tables and computed contrast ratios: Classic (v1's look upgraded;
     read v1's actual colours and fonts from `index.html`, do not rely on memory), Ops, Paper.
   - **Map styles** as a setting separate from theme, including the satellite adjustments and the marker
     outline rule on imagery.
   - Confirm with a real check whether Share Tech Mono covers Cyrillic; say what you found.
1b. **Detail levels and screen size** (common brief 3b). In `ARCHITECTURE_v1.md`: rewrite 9.4 as a per-level budget
   (Lite = today's Fire budget, Standard, Full for PC) held in one config file; the auto-pick (two-second draw test
   plus browser hints), per-device memory, Settings override and offered step-down; the rule that detail changes
   drawing, never what can be reached, with the test that enforces it; each renderer and layer module declaring its
   behaviour per level. In `LAYOUT_ENGINE_SPEC_v1.md`: decluttering in screen pixels (grouping, labels, track
   thinning per screen area) independent of detail; clean view (one tap hides rail, timeline and buttons; corner
   restore; lens tag stays); phone landscape offering both 2D and a zoomed-out globe with labels off. In
   `DESIGN_SYSTEM_v1.md`: what each level changes visually (effects, motion, label density).
2. **Patches** (keep each small; bump versions):
   - `ARCHITECTURE_v1.md`: where theme files live, the `theme`, `mapStyle` and `detailLevel` store keys, a theme
     validator in the validator list.
   - `LAYOUT_ENGINE_SPEC_v1.md`: theme and map-style pickers in Settings; the studio panel (swatches, live
     preview, export/import; loads only when opened; behind a URL flag); Help panel with legend, design
     philosophy and how the site assigns its marks (who says what, never how true; F1b-1 wrote the wording); a first-run tour replayable from Help.
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
- End with the charter check (common brief section 1).
- Do not start the prototype. Do not add real events, links or watch items.
- Where Allan's direction (common brief section 3) and Claude's proposals (section 4) differ, his direction wins;
  where a proposal is not ruled, write it as a proposal and put the choice in the decisions file.
- Finish with a phone-length reply: what changed, the decisions now waiting, and the prompt line for the prototype
  session (F1c).
