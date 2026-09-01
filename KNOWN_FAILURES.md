---
doc_id: WM-KNOWN-FAILURES
title: WarMaps Known Failure Register
version: v1.0
date: 2026-08-31
author: Claude Opus 5 (drafted); Allan Sanceau (commissioned)
status: ACTIVE — load at every session bootstrap
confidence: High (all entries OBSERVED, each recurred at least once)
evidence: OBSERVED
provenance: ai-drafted
privacy: public-project
review_by: 2026-11-30
supersedes: none
pointers: [STATE.md, SESSION_BOOTSTRAP.md, BUGNOTE_v3.1 (Drive 1dTaOViK0W3HZBsDSVIR11b9-pIesFxok)]
---

# WarMaps — Known Failure Register

## PAGE 1-A — HUMAN LAYER

**Why this file exists.** On 2026-08-31 a JavaScript failure cost roughly five hours to
diagnose. The correct diagnosis, the correct dismissal of the misleading symptom, and the
correct remedy had all been written down on **2026-06-13** in `BUGNOTE_v3.1` — seventy-nine
days earlier — and sat unread in a Drive folder the whole time. The same failure had bitten
the project at least four times before.

Memory summarises and compresses toward recency; a failure from June loses to three months
of newer material. So known failures live **in a file the bootstrap loads**, not in memory
that forgets. Sorted by recurrence count — the ones that keep biting sit at the top.

**How to use it:** read the SYMPTOM column first. If what you are seeing appears here, the
diagnosis is already done. Do not re-derive it.

## PAGE 1-B — MACHINE LAYER

```yaml
doc_id: WM-KNOWN-FAILURES
keywords: [known-failure, recurring-bug, init-exception, blank-panels, maxDay, TDZ,
  version-badge, red-herring, service-worker, regression, style-boundary, backtick,
  case-sensitive, mirror-rule, array-anchor, phase-isolated-init, error-reporter]
entities: [parseWarDay, strikeDays, _rebuildOriginIcons, minDay, maxDay, tl-min, tl-max,
  wm-version, wm-js-error, index.html, warmaps-data.js, BUGNOTE_v3.1, STATE.md]
anchors:
  - {sec: "F-001", title: "Init exception blanks the app"}
  - {sec: "F-002", title: "Timeline bounds live in two places"}
  - {sec: "F-003", title: "Static version badge lies"}
  - {sec: "F-004", title: "Array insertion anchored on generic terminator"}
  - {sec: "F-005", title: "TDZ in the marker-build loop"}
  - {sec: "F-006", title: "_rebuildOriginIcons mirror drift"}
  - {sec: "F-007", title: "Service worker serves stale builds"}
  - {sec: "F-008", title: "CSS appended into the wrong container"}
  - {sec: "F-009", title: "URL case sensitivity"}
claims:
  - "Blank panels + dead clock = a JS exception, never a cache problem (F-001)"
  - "maxDay must be changed in BOTH config and slider attributes (F-002)"
  - "A status display that falls back to a stale plausible value costs more than a blank one (F-003)"
```

---

## F-001 — Init exception blanks the app · **recurred 4+ times** · WORST OFFENDER

| | |
|---|---|
| **Symptom** | Clock stuck on `LOADING CURRENT TIME…` · Key Strikes, All Strikes, AI Summary all empty · no map markers · ticker absent · `AUTHOR:` blank · timeline shows its static placeholder |
| **This is NOT** | A cache problem. A CDN problem. A network problem. A device problem. |
| **Root cause** | A single uncaught exception during init kills every subsequent subsystem. Four dead panels is *one* failure, not four |
| **Diagnostic** | Open the page. The error banner (`#wm-js-error`, added v01.08.17) prints the message, file and line. **Read it before forming any theory** |
| **Fix** | Fix the named error. Then, permanently: wrap clock, each panel builder, ticker and footer in **independent try/catch** so one failure cannot blank the app again |
| **History** | First occurrence brutal, cause found only by pattern-matching across sessions. Middle occurrences caught quickly. 2026-06-13 `BUGNOTE_v3.1` documented symptom, cause and remedy correctly. 2026-08-31: recurred, cost ~5 hours because the bugnote was never consulted |
| **Outstanding** | **Phase-isolated init was specified in June 2026 and has never been built.** It is the permanent cure. v01.09.0 |

> **If you are reading this because the app is blank: the answer is in the error banner. Go read it.**

### F-001 source documents — TWO independent correct diagnoses, both unread when it recurred

| Doc | Date | Location | What it already contained |
|---|---|---|---|
| `BUGNOTE_v01.08.05_partial_init_failure.txt` | 2026-06-12 | `_ARCHIVE/WARMAPS [Archive]/` (id `1L8WsAkiZUL_Oj0QOrIIPQUTbrm1amgJT`) | Exact symptom list · correct diagnosis (one exception after marker-build kills downstream init) · ranked suspects · differential-test method · **specified the on-page `window.onerror` banner** |
| `BUGNOTE_v3.1_version_header_is_red_herring.txt` | 2026-06-13 | `WARMAPS/_WORKING_DOCS/` (id `1dTaOViK0W3HZBsDSVIR11b9-pIesFxok`) | Same diagnosis · **correctly dismissed the version string as a red herring** · again specified the error banner |

Both were correct. Both were written down. Neither was consulted on 2026-08-31, when the
failure recurred and cost ~5 hours — including hours spent on the version string that v3.1
had explicitly ruled out, before building the banner both documents had already specified.

**The knowledge was never missing. It was unindexed.** That is why this register exists and
why it loads at bootstrap.

### Two techniques from those bugnotes, worth reusing

- **Differential test.** Open the previous version the same way. Works → the bug is in the
  delta. Fails → the problem is older and the hunt widens. Two minutes, and it halves the
  search space before any code is read.
- **Static validation is not sign-off.** Bracket counts and tag balance prove a file is
  *well-formed*, never that it *runs*. Written 2026-06-12; independently re-derived
  2026-08-31 after two broken builds went live. A runtime smoke test in a real browser is
  the only thing that proves the app works — this is the argument for the headless-browser
  pre-push gate requested of OSIRIS in COLLAB-REQ-002.

## F-002 — Timeline bounds live in two places · recurred 2 times

| | |
|---|---|
| **Symptom** | Events insert correctly, pass every validation, and render nowhere. Timeline refuses to scroll past a date |
| **Root cause** | `maxDay`/`minDay` exist in `WARMAPS_CONFIG` **and** as hardcoded `min`/`max` attributes on `#tl-min` / `#tl-max`. Patching one silently does nothing |
| **Fix** | Change **both**, in the same commit. The validator checks this |
| **History** | Stuck at 50 (found 2026-07-14). Stuck at 140 (found 2026-08-29). Config patched without slider attributes 2026-08-29 — cost one push and one user test cycle |

## F-003 — Static version badge lies · recurred 2 times

| | |
|---|---|
| **Symptom** | Header shows an old version. Looks exactly like a stale cache |
| **Root cause** | The badge had a hardcoded fallback (`v01.08.09`) overwritten by JS at runtime. When JS died, the fallback showed |
| **Fix** | Fixed v01.08.17 — badge text now matches the build. **Never reintroduce a static fallback for a status display** |
| **Lesson** | A blank indicator prompts investigation. A *plausible but wrong* indicator produces hours of confident work in the wrong direction. Allan identified this as a red herring in June 2026; it was believed anyway in August |

## F-004 — Array insertion anchored on a generic terminator · recurred 1 time, cost 3 weeks

| | |
|---|---|
| **Symptom** | Events present in the file, absent from the map, no error |
| **Root cause** | Searching for a generic `\n];\n` matched the wrong array. 42 events (IDs 183–224) landed in `navalAssets[]` and `airspaceData[]` |
| **Fix** | Always anchor on the declaration — `const strikes = [`. Never a generic terminator |

## F-005 — TDZ in the marker-build loop · recurred 3 times

Any variable used inside the initial `strikes.forEach` must be declared **before** it, not in
`rebuildAllMarkers`. Violation = full app crash.

## F-006 — `_rebuildOriginIcons` mirror drift · recurred 1 time

Fires on every `zoomend` and BOLD toggle. Must contain SVG logic identical to the initial
draw, or icon redesigns are overwritten the instant the user zooms.

## F-007 — Service worker serves stale builds · recurred 1 time

A network-first worker still falls back to cache on any slow request. On a constrained device
that fallback wins routinely and can pin it to an **older** version. Symptom: version goes
*backwards*. **Rule: no service worker without a version-check-and-force-update mechanism.**
Removed entirely v01.08.14.

## F-008 — CSS appended into the wrong container · recurred 2 times, same night

| | |
|---|---|
| **Symptom** | `SyntaxError: Unexpected identifier` from CSS text, or CSS rendering as visible page text |
| **Root cause** | `index.html` contains the literal text `</style>` **inside a JavaScript string**, so "the last `</style>`" is not a real boundary. Tag-balance checks pass either way |
| **Fix** | New CSS goes in **its own `<style>` element**. Never append into an existing block |
| **Also** | **No backticks in comments** (caused the SyntaxError). **No literal markup tag text inside a CSS comment** (closes the element and dumps the rest as page text) |

## F-009 — URL case sensitivity · recurred 1 time · **OBSOLETE 2026-09-01**

Applied to GitHub Pages, which was unpublished 2026-09-01. The live host is now
`https://warmaps.allan-ai-agent.workers.dev/` — all lowercase, no path segment, so the trap
no longer exists. **Retained as history, not as an active warning.**

Original: `/WARMAPS/` not `/warmaps/`; GitHub Pages is case-sensitive. Documented in the
README, hit anyway.

---

## STANDING PROCESS RULES EARNED FROM THESE

1. **Validate before pushing, never after.** Tag balance + `node --check` on every build.
   Two broken builds went live because validation ran after the push.
2. **Read the error banner before forming a theory.** Instrument, then hypothesise.
3. **When the user reports something impossible** — a version going backwards, a symptom that
   contradicts the model — **the report is the signal.** Do not repeat prior advice.
4. **Search this file and Drive before debugging anything that feels familiar.** It felt
   familiar in August because it *was* familiar; the answer was already written — twice.
5. **Static validation is not sign-off.** Well-formed is not the same as working. Nothing
   ships on bracket counts alone.
6. **Knowledge about an ACTIVE failure never goes to ARCHIVE.** `BUGNOTE_v01.08.05` was
   archived while F-001 was still recurring, which put the answer out of reach. Archive
   retires *versions*, not *live lessons*.
