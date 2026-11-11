---
title: F1 progress (resume file)
updated: 2026-11-11 MST
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
| 2 | Theme amendments: design system v1.1 (grammar vs skin, Classic/Ops/Paper themes, theme contract, map styles), patches to architecture, layout, release plan; decision 8 (default theme; Classic and side colours) | documents | NEXT — waiting for Allan's go and effort setting |
| 3 | Part B prototype with theme switcher and swatch-based studio | `prototype/v2/` | after step 2 |

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
