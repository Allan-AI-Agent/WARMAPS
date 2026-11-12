---
title: F1 progress (resume file)
updated: 2026-11-11 MST (R1 added)
branch: v2/f1-architecture
rule: a fresh session resumes from this file; STATE.md still wins on build state
---

# Part A — documents
| # | Deliverable | File | Status |
|---|---|---|---|
| 1 | Architecture | `docs/v2/ARCHITECTURE_v1.md` | DONE |
| 2 | Design system | `docs/v2/DESIGN_SYSTEM_v1.md` | DONE |
| 3 | Layout engine spec | `docs/v2/LAYOUT_ENGINE_SPEC_v1.md` | DONE |
| 5a | Release plan | `docs/v2/RELEASE_PLAN_v1.md` | DONE |
| 5 | Decisions for Allan | `docs/v2/F1_DECISIONS_FOR_ALLAN.md` | DONE |

**Part A is complete (2026-11-10). PR #17 is a draft and must not be merged before Allan rules on the decisions file.**

# Part A follow-ups (agreed 2026-11-11; Allan chooses the thinking effort before each step)
| Step | What | Output | Status |
|---|---|---|---|
| 1 | Architecture dry run and audit (effort: high) | `research/v2-schema-dryrun/` (scripts, `REPORT.md`, `out/`); `ARCHITECTURE_v1.md` v1.1; corrections in the other four documents | DONE 2026-11-11 |
| R1 | Independent schema review (Opus 5.5, high) | `research/v2-schema-review/REVIEW.md` | DONE 2026-11-11 (Opus 5.5, extra) |
| R1-out | Review result, for Allan to rule on before F1b | REVIEW.md: **yes after fixes M1-M4** (ID tombstones, re-baselined acceptance numbers, plain-text/URL rule, `origin` shape); link, watch and claim/source rules need revision before S3/S4/S7 (S1-S13) | awaiting Allan; F1b applies what he accepts |
| 2 | Theme amendments (Fable 5.2, medium): design system v1.1, patches, decisions 7 and 8 | documents | after R1 — `SESSION_PROMPT_F1b_theme_amendments.md` |
| 3 | Part B prototype (Fable 5.2, high, two sittings) | `prototype/v2/` | after step 2 — `SESSION_PROMPT_F1c_prototype.md` |
| S1 | Slice 1 build (Opus 5.5, high; Haiku check) | `/v2/`, `theaters/`, `tools/` | blocked on decisions 1-3 — `SESSION_PROMPT_S1_shell.md` |
| E1 | Backfill pass 3 and enrichment batch 1 (Sonnet 5.5, medium) | `research/`, and `warmaps-data.js` only on Allan's go | any time — `SESSION_PROMPT_E1_backfill3_enrichment.md` |

**Every session reads `docs/v2/V2_SESSION_COMMON.md` first** (rules, where things stand, Allan's 2026-11-11 direction, model and effort plan).
The 2026-11-11 chat was closed after writing these prompts to save usage; nothing from it lives only in chat.

# Part B — prototype (only when Allan says "continue with Part B")
| # | Deliverable | File | Status |
|---|---|---|---|
| 4 | Interactive prototype | `prototype/v2/index.html` | not started |
| - | Five-form-factor self-review | screenshots + fixes | not started |

# Notes for a resuming session
- Live app (`index.html`, `warmaps-data.js`) must not change on this branch. Run both v1 validators before every push.
- Upstream globe was read at commit `bb40ac5` (2026-11-09); nothing was copied.
- Part B inputs: DESIGN_SYSTEM tokens (section 2), LAYOUT_ENGINE_SPEC sections 4-9 and its acceptance checks (section 11), ARCHITECTURE schemas (sections 3-4). The prototype must show decision 6 options A and B side by side.
- Facts about the current data (field counts, date formats) are in ARCHITECTURE_v1.md section 1.
