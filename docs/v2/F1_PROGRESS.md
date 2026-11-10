---
title: F1 progress (resume file)
updated: 2026-11-10 MST
branch: v2/f1-architecture
rule: a fresh session resumes from this file; STATE.md still wins on build state
---

# Part A — documents
| # | Deliverable | File | Status |
|---|---|---|---|
| 1 | Architecture | `docs/v2/ARCHITECTURE_v1.md` | DONE |
| 2 | Design system | `docs/v2/DESIGN_SYSTEM_v1.md` | DONE |
| 3 | Layout engine spec | `docs/v2/LAYOUT_ENGINE_SPEC_v1.md` | NEXT |
| 5a | Release plan | `docs/v2/RELEASE_PLAN_v1.md` | pending |
| 5 | Decisions for Allan | `docs/v2/F1_DECISIONS_FOR_ALLAN.md` | pending |

# Part B — prototype (only when Allan says "continue with Part B")
| # | Deliverable | File | Status |
|---|---|---|---|
| 4 | Interactive prototype | `prototype/v2/index.html` | not started |
| - | Five-form-factor self-review | screenshots + fixes | not started |

# Notes for a resuming session
- Live app (`index.html`, `warmaps-data.js`) must not change on this branch. Run both v1 validators before every push.
- Upstream globe was read at commit `bb40ac5` (2026-11-09); nothing was copied.
- Facts about the current data (field counts, date formats) are in ARCHITECTURE_v1.md section 1.
