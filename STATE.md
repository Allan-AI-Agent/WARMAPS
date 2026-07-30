# WARMAPS — STATE OF RECORD

**Last verified:** 2026-07-30 21:15 UTC — **Day 152**
**Verified by:** direct fetch of the live repo (not from memory, docs, or Drive)
**Update rule:** rewrite this file at every push. It is the single answer to "where am I?"

---

## DEPLOYMENT
| Field | Value |
|---|---|
| repo | `Allan-AI-Agent/WARMAPS` |
| branch | `main` |
| live_url | https://allan-ai-agent.github.io/WARMAPS/ |
| host | GitHub Pages |
| status | SERVING (HTTP 200) |

## BUILD
| Field | Value |
|---|---|
| version | **v01.08.09** |
| index.html | 291,667 bytes |
| warmaps-data.js | 352,437 bytes |
| version strings (index.html) | 8 x v01.08.09 — consistent |
| version strings (warmaps-data.js) | 1 x v01.08.09 |
| mobile dvh fix (R1) | PRESENT — 4 x `100dvh` |

## DATA
| Field | Value |
|---|---|
| events | **297** |
| id range | 1–297 |
| duplicate ids | none |
| id gaps | none |
| earliest event | 2026-02-18 (id 171, pre-war) |
| latest event | **2026-07-13 (id 297) = Day 135** |
| maxDay | **140** |

## COVERAGE
- **OPEN GAP — Day 136–152 (Jul 14–30):** 17 days, zero events.
- **THIN — Day 100–127 (Jun 8 – Jul 5):** ~28 days carried by bridge event(s) only, not day-by-day. Decision pending.

## BLOCKING ISSUE FOR NEXT DATA UPDATE
`maxDay: 140` caps the timeline at **2026-07-18**. Any event dated after that will be
inserted correctly and **render nowhere**. This is the second occurrence of this bug
(first: maxDay stuck at 50 / Apr 19, found 2026-07-14).
**Bump maxDay in the same commit as any event insert. Verify by scrubbing the slider to the end.**

## DRIVE STATUS
`Projects/WARMAPS/WMv01.08-Fable/CURRENT/` still holds **v01.08.07 (Jul 5)** — two versions
behind live. **Drive is NOT authoritative for code or data.** The repo is.
Drive holds governance, handoffs, research, and roadmap only.

## NEXT — v01.08.10
1. Add events Days 136–152 (Jul 14–30), each with source URL in `misc` per the sourcing standard.
2. Bump `maxDay` to ~160.
3. Bump version in BOTH files.
4. Validate (id dedup, gaps, bracket balance, version-string consistency).
5. Push, then smoke-test on phone against the live URL.

**Parked (do not bundle into .10):** Cloudflare Pages migration; June backfill depth.
