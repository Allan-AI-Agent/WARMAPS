---
title: WARMAPS v2 schema dry run — report
version: v1.0
date: 2026-11-11 (Iran-war Day 257)
author: Claude (Fable 5.2), session F1 step 1 (thinking effort: high), for Allan Sanceau
status: EVIDENCE — throwaway scripts; not the slice-1 migration. Result: ARCHITECTURE v1.0 → v1.1
inputs: warmaps-data.js (600 events, main at 2844e57); research/backfill-pass2/events_386-600_with_tiers_sources.json
---

# 0. Read this first (one screen)

**What was done.** All 600 live events were pushed through the event schema proposed in `ARCHITECTURE_v1.md`
v1.0, and the timeline, link and watchlist rules were exercised with tests, including "mutation" tests (a bad
record that a rule must reject).

**Result.**
- v1.0 as written **failed**: 50 events broke the schema outright, and ten further rules could not be carried
  out on the real data or gave a wrong or biased result.
- After eleven corrections (ARCHITECTURE v1.1): **600 of 600 events pass, text byte-identical, every start date
  where v1 puts it; 34 of 34 engine tests pass.**
- **Two findings change what Allan sees or decides** (not just internals): link confidence (finding 1) and the
  timeline on a phone (finding 2).
- **Four things I told Allan on 2026-11-10 were wrong** and are corrected in section 3.

**How to re-run** (no dependencies, nothing written outside `out/`):
```
node research/v2-schema-dryrun/dryrun.js .        # prints the summary; writes out/*.json
node research/v2-schema-dryrun/engine-tests.js    # 34 tests; exit code 0 = all pass
```

**Limits of this evidence.** The scripts were written by the author of the schema, so they share its blind
spots. One check is independent: the 215 ISO dates in the pass-2 research file, written by other agents, agree
with the date rule 215 of 215. Nothing here was exercised in a browser or on a device.

---

# 1. Findings that changed the design

Tier for every "showed" column: VERIFIED (computed by the scripts). Tier for consequences: INFERRED.

| # | v1.0 said | The dry run showed | v1.1 change | Would it have hurt? |
|---|---|---|---|---|
| 1 | A link is "documented" if its basis includes a sanctions designation, court filing, captured hardware or treaty | The rule could not say **who** vouches. One government's designation would have produced `documented`, `fog: false` | Each observation carries `basis` and `attestedBy`; confidence is derived; an accusation is `reported` whoever makes it | **Yes, in public.** It would have graded Western official claims above everyone else's, against the 2026-11-10 balance ruling |
| 2 | One-row timeline; acceptance check "any single day reachable with a finger on the S22" | 287 steps (Iran), 353 (Russia-Ukraine), 379 (both) across about 328 px: **0.87 to 1.14 px per step**. A fingertip needs about 8 | Two rows: overview of the whole extent, and a detail view of about 41 steps on the phone. `view` added to state | **Yes, daily.** The slider complaint from 2026-11-02 would have survived into v2 |
| 3 | Theater config maps v1 `type` to a kind **and** to actors | In 26 of 281 who-typed events the attacker text names someone else (type `iran`, attacker "Hezbollah", "Houthis", "US Central Command (counter-strikes)") | Actors are never derived from `type`. `needs[]` marks migration defaults; the interface may not show them as fact | Yes: about 9% of those events would have named the wrong actor |
| 4 | `kind` is a closed list, mapped from `type` | `prewar` (9) and `global` (65) say when or how wide, not what; about 29 who-typed events are not strikes by keyword | `unclassified` added; 383 kinds flagged in `needs` | Yes: 74 events had no valid value at all |
| 5 | Title built from place and target, at most 80 characters | 331 events have a bare place name; composing gave **50 titles over 80, longest 177** | `title` = v1 `city` verbatim (longest 90), limit 120; bare ones flagged | Yes: 50 schema failures, and it was prose rewriting by script |
| 6 | Each source needs `url`, `published`, `kind`, `access` | 1,360 source entries can be recovered; **none** has a date, kind or access record; 322 events have publisher names and no URL | Only `publisher` required; `sourcesStatus` gains `named-only`; strict rules apply to v2-authored records only | Yes: 350 events would have failed or been padded with invented values |
| 7 | "63 of 600 dates need a human ruling" | 57 are clean ranges that parse by rule; **6** need a ruling | Table of the six in ARCHITECTURE 7.1 | Overstated the work tenfold |
| 8 | Fog = 124; the research file (93) and the data (92) disagree by one | My search pattern required `FOG OF WAR:` with a colon. Two events write it without. True total **126**; the research file and the data agree exactly (93) | Marker rule is `FOG OF WAR` anywhere, or the structured block, or the pass-2 flag | The "discrepancy to reconcile" did not exist; two events would have lost their fog flag |
| 9 | A combat tripwire is `confirmed` by a confirmed event **or a documented link** | A documented treaty could have "confirmed" a combat tripwire | `confirmed` needs a confirmed event of a combat kind; links support `reported` at most | Yes: the one conclusion this site must not reach by accident |
| 10 | IDs `IR-0001`, "4+ digits" | Plain text sorting puts `IR-10000` before `IR-9999`; a daily Russia-Ukraine backfill could pass 9,999 | Five digits: `IR-00001` | Later, and expensively: IDs cannot be changed once links cite them |
| 11 | One file per theater per year; first view up to 250 KB gzipped | Full 2026 file: 918 KB (178 KB gzipped). A compact index of the fields the map needs: **76 KB (17 KB gzipped)** | Generated `events-index.json` loads first; full records in the background | Slower first paint now; much slower after a daily backfill |

Smaller corrections: "34 monthly steps, about 1,040 days" is 35 and 1,042. Week and month steps were undefined
(now ISO week and calendar month). Events dated before the axis (Iran id 6, June 2025) had no rule (now "backdrop"
events). Standing agreements would have gone "dormant" after 180 days (observations may now be intervals).
`weaponType`, `intercepted` and `evidenceUrl` were not mentioned (now mapped).

# 2. Findings about the live v1 data (reported, not changed)

| Finding | Count | Tier | Note |
|---|---|---|---|
| "Day N" text in the `time` field is one lower than the day the app computes | 60 events, ids 109-297 | VERIFIED | Those entries count 28 Feb as Day 0. v1 shows this text in popups. A one-pass data fix if Allan wants it; v2 never stores day numbers as text |
| Day number embedded mid-text in `time`, including "(TODAY)" | 6 events: 126, 287, 288, 289, 294, 296 | VERIFIED | Stale wording from the day they were written |
| Type `platform` has no marker colour in v1's colour table | 2 events: 320, 329 | VERIFIED in code; effect INFERRED | They may draw without a colour. Not checked in a browser |
| v1 type says one actor, attacker text says another | 26 events | VERIFIED count; reading INFERRED | Some appear to be typed by who was hit, not who struck |
| Events with no source recorded at all | 28 | VERIFIED | Candidates for the enrichment pass first |
| `STATE.md` KEY FIELDS table says 385 events / Day 170 | 1 table | VERIFIED | Header is correct |

# 3. Corrections to what I told Allan on 2026-11-10

| I said | Correct |
|---|---|
| "63 of the 600 events have dates that need a ruling" | 6 do. 57 are clean ranges handled by rule |
| "353 events with no reviewed confidence (ids 1-385 minus 32 fog)" | 352 (minus 33 fog) |
| "The pass-2 research file marks 93 events fog, but 92 carry the text in the data file" | They agree, 93 and 93. My search was wrong, not the data |
| "v1's red-for-Iran, blue-for-US coding" (design system, decisions file, chat) | v1 marker colours: Israel red, US orange, Iran blue, joint purple; the popup badges use a second, different set. The point stands (colour marks sides, inconsistently) but my description was wrong |

# 4. What the dry run confirms (things that did not break)

- IDs convert and convert back for all 600; `legacyId` set is exactly 1-600.
- Every text field is byte-identical after migration.
- All 600 start dates parse, and v2 places each event on the day v1 does.
- The 33 Key Strike ids all carry a category; the six labels map cleanly to `significance`.
- No v1 field is left without a destination.
- Date arithmetic: 8 Nov 2026 is Iran Day 254 and Russia-Ukraine Day 1,719; changing a band from monthly to
  daily needs no engine change.
- All eight watchlist mutation tests and four link rejection tests reject what they should.

# 5. Numbers the slice-1 migration must reproduce

| Measure | Value |
|---|---|
| Events | 600 |
| Date precision | 539 day · 57 range · 4 ongoing-from |
| Fog | 126 (33 in ids 1-385; 93 in ids 386-600) |
| Claim status | 8 disputed · 118 claimed · 122 reported · 352 unreviewed |
| Tier | 22 milestone · 78 major · 115 standard · 385 unrated |
| Significance (key events) | 33 |
| Kind established / flagged | 217 / 383 |
| `needs` | kind 383 · title 331 · actors 600 |
| Sources | 250 listed · 322 named-only · 28 legacy-unlisted (1,360 entries, 494 URLs, 87 hosts) |
| Geo precision | 47 representative · 553 unknown |
| Schema failures | 0 |

# 6. Left open
- The enrichment pass (ARCHITECTURE 7.3) is now a visible piece of work: six fields across up to 600 events.
- Six date rulings and six time-text rulings for Allan (ARCHITECTURE 7.1). Defaults keep v1's placement.
- The "coordinated cross-theater escalation timing" tripwire does not fit the combat track as written
  (ARCHITECTURE 4.2). Held out of the starting set until Allan rules.
- An independent review of the schema by an agent that has not seen this work is available on Allan's word.
