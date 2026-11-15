---
title: F1 progress (resume file)
updated: 2026-11-14 19:08 MST (F1b-1: deliverables 1-6 pushed and charter check run; the checker's 13 risk/note findings are NOT yet fixed; stopped on Allan's usage notice)
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
| 2b | F1b-2 themes, detail levels, screen size (Fable 5.2, medium): design system, patches, decisions 7 and 8 | documents | NEXT — `SESSION_PROMPT_F1b_theme_amendments.md` (v1.2; cap now nine decisions) |
| 3 | Part B prototype (Fable 5.2, high, two sittings) | `prototype/v2/` | after step 2 — `SESSION_PROMPT_F1c_prototype.md` |
| S1 | Slice 1 build (Opus 5.5, high; Haiku check) | `/v2/`, `theaters/`, `tools/` | decisions 1-3 RULED A 2026-11-14; ready once Allan says go — `SESSION_PROMPT_S1_shell.md` |
| E1 | Backfill pass 3 and enrichment batch 1 (Sonnet 5.5, medium) | `research/`, and `warmaps-data.js` only on Allan's go | any time — `SESSION_PROMPT_E1_backfill3_enrichment.md` |

**Every session reads `docs/v2/V2_SESSION_COMMON.md` first** (rules, where things stand, Allan's 2026-11-11 direction, model and effort plan).
The 2026-11-11 chat was closed after writing these prompts to save usage; nothing from it lives only in chat.

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

**Still open for Allan:** five decisions (4-7, 9; 1-3 ruled A on 2026-11-14); merge and cold read of PR #19 (v01.09.04, option B: stat label, naval
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
