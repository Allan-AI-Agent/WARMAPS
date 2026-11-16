---
title: F1 progress (resume file)
updated: 2026-11-16 07:10 MST (F1c sitting 2 done: five-form-factor self-review run headless, seven failures fixed, `prototype/v2/REVIEW.md` written, pushed. Part B is complete as far as a headless browser can take it. Next: Allan tries it on his devices)
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
| C1 | Editorial charter: attribution, not verification (Allan, 2026-11-12) | `STATE.md` ruling; common brief; KNOWN_FAILURES F-010; S1/F1b/F1c/E1 prompts; banners on five design docs; REVIEW addendum | DONE 2026-11-12. Charter check: nothing added grades truth |
| C2 | Fog, lens, timeline, detail-level and screen-size direction (Allan, 2026-11-12, provisional until the demo) | `V2_SESSION_COMMON.md` section 3b; new F1b-1 prompt; F1b-2 and F1c prompts updated; charter copy on Drive (`WARMAPS/_RULES`) | DONE 2026-11-12. Charter check: nothing added grades truth |
| 2a | F1b-1 attribution, fog and lenses (Fable 5.2, high): charter rewrite + common brief section 3b | documents | **DONE 2026-11-14 except the checker follow-ups. See "F1b-1 close-out" below** |
| 2b | F1b-2 themes, detail levels, screen size (Fable 5.2, medium): design system, patches, decisions 7 and 8 | documents; `research/v2-theme-check/` | **DONE 2026-11-15. See "F1b-2 close-out" below** |
| 3 | Part B prototype (Fable 5.2, high, two sittings) | `prototype/v2/` | **BOTH SITTINGS DONE 2026-11-16.** Sitting 2: self-review at five form factors, `prototype/v2/REVIEW.md`. See "F1c sitting 2 close-out" below |
| S1 | Slice 1 build (Opus 5.5, high; Haiku check) | `/v2/`, `theaters/`, `tools/` | decisions 1-3 RULED A 2026-11-14; ready once Allan says go — `SESSION_PROMPT_S1_shell.md` |
| E1 | Backfill pass 3 and enrichment batch 1 (Sonnet 5.5, medium) | `research/`, and `warmaps-data.js` only on Allan's go | any time — `SESSION_PROMPT_E1_backfill3_enrichment.md` |

**Every session reads `docs/v2/V2_SESSION_COMMON.md` first** (rules, where things stand, Allan's 2026-11-11 direction, model and effort plan).
The 2026-11-11 chat was closed after writing these prompts to save usage; nothing from it lives only in chat.

# F1c sitting 2 close-out (2026-11-16 07:10 MST; Fable 5.2, high; started by a scheduled task at 05:07 after Allan's go, run unattended)

**Bottom line: the self-review is done and pushed. All 28 acceptance checks pass where a script can test them; four
only in part. Seven failures were fixed. Nothing has been seen on a real device or over real map tiles. Nothing is
merged.**

| Item | State |
|---|---|
| Review | `prototype/v2/REVIEW.md`: the 28 checks one by one with evidence labels, what was fixed, what is left, what headless cannot tell, nine questions for Allan's devices |
| Runs | `check/check.js` 5,532 pass · `functional.js` 38 of 38 · `sweep.js` 5 sizes x 15 states plus the globe, 77 screenshots, each measured · `checks2.js` 64 of 64. Text contrast as drawn: lowest 4.86:1 (Paper, PC) |
| Fixed | Touch targets were 44 px or less in many places, now 48 · Layers pushed off screen at phone portrait · Layers and Clean view pushed off screen by a long lens label (tablet portrait, PC) · Back or Escape in clean view closed a hidden panel first · no keyline on outlined group badges over imagery · 200% text cut controls off on a phone · a notice sat mid-stage at phone landscape |
| Passed only in part | 6 (band drag by finger), 22 (map style and detail against every state item), 23 (readability over real imagery), 25 (a resize does not regroup), 26 (tap on a globe mark). 27's "Save disabled" and 28's Help button were not clicked |
| Document problems | 7 more, 31 in all: `NOTES_FOR_F2.md` A7, A8, B19 to B23 |
| Allan's v1 items (asked 2026-11-16) | **Author credit with the red name wave: built**, lower left of the stage, hidden in clean view. **Rocket and drone launch-origin icons: not built**, recorded as requirement D1 in `NOTES_FOR_F2.md` section D with the v1 line numbers |
| Calls made without asking | Phone-landscape timeline 48 px, not 44. Phone timeline track 48 px, not 36 (the timeline is about 128 px). Four small controls keep their drawn size with a 48 px touch area. Clean view closes before panels on Back. The author credit is hidden in clean view |
| Not done | An independent checker on the prototype (needs Allan's go). The prototype has not been seen over real tiles: allow `cdn.jsdelivr.net` and `server.arcgisonline.com` in the environment, or open it on a device |
| Harness | `prototype/v2/check/headless/` (`README.md` there). `npm install` the pinned packages into that folder first; Playwright is already in the workspace |

**Charter check (sitting 2): nothing added grades truth.** Sizes, positions, a keyline, a closing order and the
author credit. The word check still passes. NOTES B1 and B2 are unchanged and still Allan's to rule on.

**Next:** Allan opens `/prototype/v2/` on the S22 and the Fire (after PR #17 is merged, or served from the branch)
and answers the nine questions in `REVIEW.md` section 7. Then decisions 6, 8, 9 and item d can be ruled, and F2 (the
document review) can start from `NOTES_FOR_F2.md`.

# F1c sitting 1 close-out (2026-11-16 00:30 MST; Fable 5.2, high; run unattended after Allan's go)

**Bottom line: the prototype is built and pushed. It is ready for a first look once served; the five-form-factor
self-review (sitting 2) has not been done. Nothing is merged.**

| Item | State |
|---|---|
| Where | `prototype/v2/` (about 4,800 lines, 520 KB, no build step). `README.md` there says how to open it and which address flags exist |
| Built | All five layout classes by viewport and pointer; rail; phone sheet with three detents; side sheet; slots with pin and Move; floating panels (PC); two-level timeline with the 7-day band, range menu, Today, Play, Record today / As known then; theater filter and the "no curated events yet" state; 2D (Leaflet) and globe (CesiumJS 1.146, fetched only on request) on one store with the camera kept; the four looks, size cap, On the record / Fog / Contested, location history; lens (one, several, compare two) with banner and tag, carried in the link; link arcs with bundling and weight by cursor date; watchlist, two tracks, as of the cursor; event, link and track cards; three themes used unchanged, theme studio behind `?studio=1`, export and import as file and link with validation; map styles including satellite adjustments; legend, Help with the fixed wording, replayable tour; Lite / Standard / Full with the draw test; declutter by screen pixels; clean view with the view tag; phone landscape with 2D or globe; About numbers with frame-rate tests; "Try the open decisions" switches for decisions 6 and 9 and items d1 and d3 |
| Sample data | 45 events, 6 links, 9 watch items, 114 tracks, all invented and stamped. Written to the schemas |
| Checks run | `node prototype/v2/check/check.js`: 5,532 checks pass (shape, charter test with a mutation, the prototype's rules equal to the reference on 10,710 derivations, stored positions, watch validator, themes byte-identical and 86/86, seven theme rejection cases, word check). A headless functional pass (Chromium, 1280 x 760 touch): 38 of 38 pass, no page errors: 7-day default, All, Today, fog and contested switches, As known then (ghost at the first place, then solid at the site), lens moving a marker, compare cases, clean view and its tag, Back order, legend identical across themes, bad themes rejected, no studio code without the flag, bundling, weights changing with time, reset, intake-only state, same rows at all three detail levels, tour |
| VERIFIED only headless | The globe runs under software WebGL in the workspace browser. Map tiles and the CDN could not be reached from this environment (hosts not allowed), so libraries and fonts were served from local copies of the same pinned packages and tiles were blank. **Not yet seen: the map over real tiles, real devices, touch feel, real frame rates** |
| Document problems | 24 found; list in `prototype/v2/NOTES_FOR_F2.md` (6 layout sizes that do not fit, 18 unclear or missing rules) |
| Calls made without asking (written down per the session rule) | Sample statements name real parties (the lens needs them) but every place is "Site A"-style and every item is stamped. Classic is the opening theme (decision 8 is open: provisional). Card peek is 132 px, not 96. Phone timeline is about 116 px, not 64. The studio is reachable by a "Reload with the theme studio" link under Prototype helpers. Side-by-side views and drag-to-snap are not built |
| Not done | Sitting 2: screenshots at 360x700, 780x320, 800x1200, 1280x760, 1600x900 in each theme and state; LAYOUT spec section 11 checks one by one; contrast on screen; `prototype/v2/REVIEW.md`; then STATE.md and the common brief in full |

**Charter check (sitting 1): nothing added grades truth.** Two wording points come from the reference rules, not
from new work, and are listed for Allan in `NOTES_FOR_F2.md` (B1: party media labelled "state media"; B2: "Agree it
happened" can appear on a one-sided mark when observers also report it). An independent checker has not run on the
prototype yet; that belongs with sitting 2.

**To resume (sitting 2):** same branch; read `SESSION_PROMPT_F1c_prototype.md` "Sitting 2"; the headless harness
was in the session scratchpad and is gone with the container: rebuild it from `README.md` (serve the folder, answer
`cdn.jsdelivr.net` from `npm install leaflet@1.9.4 cesium@1.146.0 @fontsource/...`), or allow the two hosts
`cdn.jsdelivr.net` and `server.arcgisonline.com` in the environment so real tiles can be seen.

# F1b-2 close-out (2026-11-15 05:00 MST; Fable 5.2, medium; one session, run unattended)

**Done and pushed (validators PASS and live files identical to `main` before each push, except the second push,
which was documents only and was validated straight after):**

| # | Deliverable | Where | Commit |
|---|---|---|---|
| 1 | Design system restructured: grammar (fixed) and skin (theme); theme contract; three built-in themes with full token tables and computed figures; map styles; Share Tech Mono Cyrillic check | `DESIGN_SYSTEM_v1.md` v1.2 sections 0-2, 12-15, 17 | `6236440` |
| 1 | Reference theme check and the three theme files | `research/v2-theme-check/` (`theme-check.js`, `themes/`, `out-table.txt`) | `6236440` |
| 1b | Detail levels: per-level budget in one config file, automatic pick, Settings override, offered step-down, the reach rule and its four guards, per-module declarations | `ARCHITECTURE_v1.md` v1.3 section 9.4, 9.2, 9.3, 7.4 K | `390a8fc` |
| 1b | Declutter in screen pixels; clean view; phone landscape with 2D or globe | `LAYOUT_ENGINE_SPEC_v1.md` v1.2 sections 8b, 2.5, 4.2 | `390a8fc` |
| 1b | What each level changes to the eye | `DESIGN_SYSTEM_v1.md` section 16 | `6236440` |
| 2 | Patches: theme files' home, store keys, theme validator (ARCHITECTURE 6.1, 9.1, 7.4 J); Settings pickers, studio, Help panel, tour (LAYOUT 8c, 8d); audience, slices, three-theme cap, S9 AI briefing, public-use check, backfill pass 3 (RELEASE_PLAN v1.3); decision 7 reworded, decision 8 added (F1_DECISIONS v1.3) | as named | `390a8fc`, `7e95649` |
| 3 | `V2_SESSION_COMMON.md` v1.5 section 2; `STATE.md` status; this file; `SESSION_PROMPT_F1c_prototype.md` v1.2 | as named | `7e95649` and the close-out commit |

**Found while doing it (VERIFIED by computation or by reading the file):**
- **The v1.1 theater colours were not colour-blind safe, though v1.1 said so.** Under a standard simulation, green
  against rose scored 3.6 under deuteranopia (minimum set at 10) and sky blue against green 3.8 under tritanopia
  (minimum 8). Re-tuned in all three themes; every pair now passes. The check is in the theme contract.
- Share Tech Mono, as Google Fonts serves it, has no Cyrillic (216 characters mapped, none in U+0400 to U+052F).
  Classic falls back to IBM Plex Mono for Cyrillic. The font's master file was not read (outside this session's access).
- v1's dim text and border colours miss the contrast minimums on some surfaces; Classic lifts them (DESIGN_SYSTEM 14.1).
- v1 hides the map provider's attribution line (`index.html` line 33). v2 does not copy that.

**Calls I made without asking (0b rule 2; each is listed for veto in the decisions file):**
1. Decision 7 was already ruled A, so it was reworded, not reopened: the AI briefing is slice S9 after cutover,
   on its own ruling.
2. A theme's colours are any six-digit hex that passes the computed check (the common brief had "curated swatches"
   only); the studio still offers swatches.
3. Clean view keeps a view tag as well as the lens tag (period, record date, any record layer that is off).
4. Theme, map style and detail level are not carried in a shared view link.
5. The Standard and Full budget numbers and the draw-test thresholds are my proposals (SPECULATION, unmeasured).
6. `compare-b` changed from teal to sand in the dark themes, because the re-tuned mint sat too close to it.
7. The theme studio is its own small optional slice (S2b), after S2.
8. The second and later pushes went to `v2/f1-architecture`, as the prompt says; nothing went to `main`.

**Not done, by design:** the prototype; any real event, link or watch item; any change to v1.

**Open for Allan:** decision 8 (default theme; best judged on the prototype). Still provisional until he has
tried the prototype: decisions 6 and 9, charter-check item d, and the three 2026-11-12 rulings. PR #19 (v1 stats
wording) still awaits his merge and cold read.

**Next step: the F1c prototype. Fable 5.2, High, a fresh chat started right after a usage refill, two sittings.**
`In the WARMAPS repo, check out branch v2/f1-architecture, read docs/v2/SESSION_PROMPT_F1c_prototype.md and follow it.`

**Charter check, 2026-11-15: nothing added grades truth, after one fix.**
- **Self-check:** word sweep of every added line: each hit is an evidence label on my own statement, a decision-card
  CONFIDENCE, or a rule that bans the word.
- **Independent checker (Sonnet 5.5; read the charter, the full diff, ran the theme check, grepped v1): 1 violation,
  10 risks, 2 inconsistencies, 1 fact error.** The v1 facts I marked VERIFIED all held except one.

| # | Finding | Handling |
|---|---|---|
| 1 | **VIOLATION:** clean view hid the layer switches, so a screenshot with Fog off showed a map with one-sided accounts silently missing (charter rule 4) | **Fixed.** The view tag names any record layer that is off ("FOG HIDDEN", "CONTESTED ONLY"); check 19 tests it (LAYOUT 2.5) |
| 2 | Clean-view tag did not date "Record today" | Fixed: always "RECORD AS OF [date]" |
| 3 | I wrote that glow "never differs between looks", but one-sided milestones have no halo, so a theme's glow could widen that gap | Fixed: a theme's glow now touches only the chrome and the selected mark; the milestone halo is fixed grammar. The halo asymmetry itself is F1b-1's rule: listed for Allan as d1 |
| 4 | Faintest marks (not yet attributed, faded ghost) are allowed under 3:1 contrast, and not-yet-attributed is most of the Iran map at launch | **For Allan, on the prototype (d2).** Not changed |
| 5 | Ghosts carry no label, so scarce labels go to solid and split marks; a mixed group badge reads as filled | Help now says so; the badge question is **for Allan (d3)** |
| 6 | Track thinning did not say which track is kept | Fixed: a rule that looks only at the track id |
| 7 | Help said tracks are "instrument readings, not claims", which vouches for them | Fixed: "positions reported by tracking services ... WARMAPS does not vouch for them" |
| 8, 13 | Validator did not check compare colours against error and ok colours; Paper's compare-b was teal-green and its state-ok equalled a theater colour | Fixed: checks added (now 86 per theme), two Paper colours changed, all three themes pass |
| 9 | A theme name from a link could carry a slogan into the app | Fixed: 24 characters, word list applied, shown only in Settings |
| 10 | AI brief: citation checks do not catch framing | Six guards added to RELEASE_PLAN S9; residual risk stated |
| 11 | Check 17's word list was short | Fixed: points to the single list in ARCHITECTURE 7.4 E0 |
| 12 | FACT ERROR: v1 dims its labels with a brightness filter, not opacity | Fixed |
| 14 | A wrong cross-reference; "milestones never group" missing from ARCHITECTURE | Fixed |

The fixes above were made after the checker reported and have **not** been re-read by an independent agent; the
theme check was re-run (all pass) and both v1 validators pass. The prototype session's own charter check covers them.

# F1b-1 close-out (2026-11-14 19:08 MST; Fable 5.2 medium; stopped at Allan's usage notice, about 99%)

**Done and pushed this session:** deliverable 5 (`F1_DECISIONS_FOR_ALLAN.md` v1.2: decisions 5 and 6 reworded, decision 9
added, provisional rulings recorded, banner removed; F1b-2 prompt cap raised to nine) and deliverable 6 (`STATE.md`
status, resolved-conflicts note, KEY FIELDS corrected, v1 stats-wording open item; common brief section 2). Validators
PASS, live files identical to `main`, dry run 600/600, 66/66, 16/16 (VERIFIED before each push).

**Charter check: nothing added grades truth.** Self-check (word sweep of the five documents) and the independent
Sonnet 5.5 checker (read all five documents, the scripts and Help wording): **0 violations, 13 risks and notes.**
None is fixed yet. Recommended handling (INFERRED; Allan rules where marked):

| # | Finding (checker) | Recommended |
|---|---|---|
| 11 | `attribution.js` line 155: two denials with no affirming account print "Agree it happened" | **Fix: a bug.** Print only when two or more accounts affirm; add a test; mirror in ARCHITECTURE 3.4.4 |
| 12 | Charter test matches whole words only: `confidenceLevel`, `isVerified`, `unconfirmed`, `proven`, `toward_confirmed` pass; `reason`, `label`, `name` exempt beyond the document's list | **Fix:** token and prefix match, add the words, align with ARCHITECTURE 7.4 E0 |
| 10 | `legacy.fog.status` carries v1 `fogStatus` (disputed 8, partial 2, unresolved 5), an unauthored dispute label | Fix: keep the note text, drop the value; update "nothing else is dropped" wording and the dry-run numbers |
| 5, 6 | DESIGN 164-166, 265, 305: "a dramatic claim by one side cannot dominate"; draw order by voice count | Reword: size and order count accounts on record, not likelihood |
| 8 | DESIGN 283, LAYOUT 397: "position may be spoofed", jamming warning in the site's own voice | Reword as attributed ("inside an interference zone reported by X") |
| 13 | Chip "ONE SIDE" is inexact for some ghosts (two sides on the same end; an observer only; v1-fog ghosts) | Allan, on the prototype: e.g. "NOT ALL SIDES HEARD" |
| 1, 2 | `actors.by/against` and `kind` are typed at record level; where accounts dispute who did it or what it was, an editor would be choosing | Needs a design answer before S1 (derive from entries; allow `unclassified`). Allan rules |
| 3 | Outlet `ownership` has no source; "independent" can read as an endorsement | Add an ownership source; rename the value. Allan rules |
| 4 | "dropped only for demonstrated fabrication" | This is Allan's own 2026-11-10 sourcing rule; his call whether to narrow it |
| 7 | "On the record" layer holds not-yet-attributed records; "clean map" wording | From section 3b, agreed by Allan; revisit on the prototype with decision 6 |
| 9 | Tracks labelled OBSERVED and set above claims | Section 3b direction; no change proposed |
| notes | Four separate forbidden-word lists; `reason: "merged"` in 3.4.7 versus the ban in 4.2; "weaker signal" (LAYOUT 528, ARCH 26); "on record" versus "on file"; satellite images have a status-line slot, photos and video do not | Tidy in the same pass |

Also: ARCHITECTURE line 1167 says the v1.2 rules "have had a charter check by a separate agent"; that is true as of 2026-11-14.

**Applied 2026-11-14 (Sonnet 5.5, after the table above was written):** rows 11 (status line fixed, 4 new tests, 70/70),
12 (token-match charter test, `reason`/`label` no longer exempt, word list extended and ARCHITECTURE E0 updated), 10
(`fogStatus` not carried), 5, 6, 8, and the notes on "weaker signal" and `reason: "merged"` (now `"combined"`).
**Not applied, need Allan:** rows 1, 2, 3, 4, 7, 9, 13; the single shared forbidden-word list; photos and video in the
status line.

**Open for Allan:** nothing blocking; decisions 6 and 9 and item d are PROVISIONAL until he has tried the prototype (all other decisions and items a-c, e ruled 2026-11-14); merge and cold read of PR #19 (v01.09.04, option B: stat label, naval
popups, launch popups; ruled 2026-11-14, built by Sonnet 5.5; ~20 other "confirmed"/"verified" wordings in v1 left for a
follow-up if he wants it). v1 is otherwise untouched on this branch.

**To resume (Opus 5.5 or Sonnet 5.5 is enough for rows 11, 12, 10, 5, 6, 8 and the notes):**
`In the WARMAPS repo, check out branch v2/f1-architecture, read docs/v2/F1_PROGRESS.md section "F1b-1 close-out" and apply the recommended fixes.`
**F1b-2 prompt line:** `In the WARMAPS repo, check out branch v2/f1-architecture, read docs/v2/SESSION_PROMPT_F1b_theme_amendments.md and follow it.`

# F1b-1 handoff (SUPERSEDED by the close-out above; kept as history) (2026-11-13 01:40 MST; wrap-up at about 90% of the session allowance)

**Rulings Allan gave in this session (OBSERVED, 2026-11-13 01:05):** R1 fixes **M1, M2, M3, M4 all accepted** (M4 as
a claimant on each entry); an independent **Sonnet 5.5 checker is authorised** for the end-of-session charter check.

**Done and pushed to `v2/f1-architecture` (VERIFIED: validators pass, live files unchanged, before each push)**
| # | Deliverable | Commit |
|---|---|---|
| 1 | `ARCHITECTURE_v1.md` v1.2: entries model, derived looks (3.4), links and watchlist without grades (4.1, 4.2), registries (4.4, 4.5), 7-day window and As known then (5.4, 5.8), M1-M4, migration 7.1-7.4 with the charter test, store and renderer contract (9.1, 9.2). Banner removed | `3de08c6` |
| 1 | Dry run re-run: `research/v2-schema-dryrun/` — `dryrun.js` (600/600 pass, charter test 0 hits), new `attribution.js` + `attribution-tests.js` (66/66), `engine-tests.js` (16/16), `REPORT.md` v1.1 with the re-baselined numbers | `3de08c6` |
| 2 | `DESIGN_SYSTEM_v1.md` v1.1: four looks with exact strokes, size cap, compare colours, chip, status line, lens banner and tag, legend wording, `state-alert` removed as a verdict colour. Banner removed | `835c67a` |
| 3 | `LAYOUT_ENGINE_SPEC_v1.md` v1.1: lens picker/banner/tag per form factor, On the record / Fog / Contested, band and record switch, cards, Help wording (8a), watchlist panel, checks 10-17. Banner removed | `dde8f43` |
| 4 | `RELEASE_PLAN_v1.md` v1.2: slices re-cut (table 3A), S2/S4/S7 reworded, Track E rewritten, Track P added. Banner removed | `aeb401b` |

**NOT done (in order)**
1. **Deliverable 5, `F1_DECISIONS_FOR_ALLAN.md`: untouched. It still carries the CHARTER CONFLICT banner and
   truth-grade wording** (decision 5 headline, decision 6, the "decided unless you object" link row, item 1 of "Five
   things"). Planned content, already reflected in the other four documents:
   - Decision 5 → the watchlist headline is a count ("N of M combat tripwires have a claim on record"); option B: no headline. An automatic "assessed as merged" is ruled out by the charter.
   - Decision 6 → the 600 Iran events have no recorded claimant. A (recommended): 473 drawn "not yet attributed" (plain) and the 127 with a v1 fog note as ghosts; B: all 600 ghosts; C: all 600 plain. Judge on the prototype.
   - **New decision 9** (8 is reserved for F1b-2's default theme): when does a ghost become solid? A (recommended, in the docs as the default): a side from each end the record names has affirmed it; B: any two sides (section 3b's literal wording); C: every involved side. One setting in `attribution.js` (`solidRule`).
   - Record the three PROVISIONAL rulings from common brief 3b (7-day window; size cap; look-again 1/3/7/30).
   - "Decided unless you object" additions: a dispute over who did it also splits; an unnamed official does not put a side on record; state or party media counts for its side, labelled; exile and opposition media never do; observers (UN, monitors) are listed but do not solidify; flat actor ids and registry ownership fields (R1 S11, S2); v1 `verified`, `fogLean` and `originKnown: "probable"` not carried into v2 files; link weight counts separate voices; a faded ghost needs the 30-day check actually logged.
   - `SESSION_PROMPT_F1b_theme_amendments.md` says "No more than eight decisions": change to nine.
2. **Deliverable 6:** `V2_SESSION_COMMON.md` section 2, `STATE.md` (status lines; "Known conflicts" list in the
   charter section now resolved for four documents), this file's final state.
3. **Charter check: NOT run.** Self-check and the authorised Sonnet 5.5 checker over the five documents, the
   dry-run scripts and Help wording. Until it runs, treat deliverables 1-4 as unchecked against the charter.
4. Phone-length closing report and the F1b-2 prompt line.

**Found, not acted on (for Allan)**
- The **live v1 site** shows truth grades (VERIFIED in `index.html`): naval assets "✓ Verified / ⚠ Unverified" (lines 3187-3204), the stat label "Confirmed Dead (Iran Military)" (1666), and the launch-origin value shown from `originKnown` (3508). v1 was not touched; whether to change v1 under the charter is his call.
- The charter test caught v1's `originKnown: "probable"` (9 events), which no document had listed.
- R1's S10, S12, S13 remain open (ARCHITECTURE section 10).

**RULED by Allan 2026-11-13 01:42 (OBSERVED): "We should include updating the live v1 site stats wording."** Add to the remaining work: a
small v1 change (its own branch and PR, version bump per Rule 8, validators, cold read) rewording the stat label
"Confirmed Dead (Iran Military)" under the charter (who reports the figure, as of when). Ask him whether the naval
"Verified / Unverified" labels and the launch-origin value go in the same PR; he named the stats wording only.

**To resume:** fresh chat, Fable 5.2 High (or Opus 5.5 for items 1-2, which are mostly transcription of the above), send:
`In the WARMAPS repo, check out branch v2/f1-architecture, read docs/v2/F1_PROGRESS.md section "F1b-1 handoff" and finish it. M1-M4 accepted; Sonnet 5.5 checker authorised.`

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
