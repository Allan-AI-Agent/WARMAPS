---
title: Session prompt S1 — WARMAPS v2 slice 1 (shell + Iran 2D + timeline)
version: v1.1 (2026-11-12: charter gate and truth-grade test added)
date: 2026-11-11 (Iran-war Day 257)
for: a fresh Claude Code session, model Opus 5.5, thinking effort High, repository Allan-AI-Agent/WARMAPS; an independent Haiku 5.5 agent checks the work
how to use: send "In the WARMAPS repo, read docs/v2/SESSION_PROMPT_S1_shell.md and follow it." (add "check out branch v2/f1-architecture" if PR #17 is not merged yet)
budget: one or two sessions. Not a Fable session
---

You are building the first real slice of WARMAPS v2: the thinnest version Allan can use every day on his phone,
served at `/v2/` beside the untouched v1 site.

## Gate — check before anything else
Read `STATE.md` and `docs/v2/F1_DECISIONS_FOR_ALLAN.md`. Slice 1 needs Allan's rulings on **decision 1** (build
step), **decision 2** (data master during the overlap) and **decision 3** (ID format). If any is not recorded as
ruled, stop, show him those three rows of the answer sheet, and wait. Do not build on a recommendation.

**Charter gate.** Read the editorial charter in `STATE.md` (2026-11-12). If `ARCHITECTURE_v1.md` still carries the
charter-conflict banner (truth grades such as `claimStatus: confirmed` not yet rewritten by F1b), stop and tell Allan:
slice 1 publishes record shapes that cannot be renamed later, so it waits for the rewrite.

## Before you start
1. Read `docs/v2/V2_SESSION_COMMON.md` and follow its rules.
2. Read fully: `RELEASE_PLAN_v1.md` sections 1 and 2 (your scope and exit test); `ARCHITECTURE_v1.md` sections 3,
   5, 6, 7 and 9; `LAYOUT_ENGINE_SPEC_v1.md`; `DESIGN_SYSTEM_v1.md`. If `prototype/v2/REVIEW.md` or
   `research/v2-schema-review/REVIEW.md` exist, read them: they list what the documents got wrong.
3. Look at `research/v2-schema-dryrun/` (`REPORT.md`, `dryrun.js`). The dry run is throwaway evidence, **not** your
   migration; write `tools/migrate-v1.js` properly. Its numbers (report section 5) are your acceptance test.
4. Tell Allan: "Recommended: Opus 5.5, High; Haiku 5.5 as independent checker. Go?" and wait.
5. Create branch `v2/s1-shell` from `main` (or from `v2/f1-architecture` if PR #17 is still open; say which).

## Scope
Exactly `RELEASE_PLAN_v1.md` section 2, "In". Nothing from its "Out" list. If something seems to require
renaming a published field or restructuring, stop and bring it to Allan: that is an architecture question.

Order of work, pushing after each:
1. `tools/migrate-v1.js`, `tools/build-manifest.js`, `tools/validate-v2.js` (each honesty rule with a mutation
   test; **plus the charter test:** reject any field name or enum value that grades a claim's truth: `confirmed`,
   `verified`, `documented`, `credible`, `credibility`, `reliable`, `debunked`, `confidence`, true/false verdicts.
   Quoted source text is exempt. A record-to-source check (did the source say this) is allowed under charter rule 5
   and is named as such. Mutation test: adding `"claimStatus": "confirmed"` to one event must fail); generated `theaters/`; `validate.yml` extended to regenerate and diff. Show Allan the six date rulings
   and six time-note rulings (architecture 7.1) with the defaults; proceed on the defaults unless he rules.
2. `/v2/` core: `time`, `store`, `loader`, `selectors`, `errors`, `config`; tokens and the theme engine.
3. Layout engine; top bar; dock rail; phone portrait and landscape to full spec; tablet and PC functional.
4. 2D view through the renderer contract; two-level timeline; Events panel; event info card; layers menu with
   only events and outlines live; version badge; `_headers` rules.

## Independent check (Allan authorises a separate checking agent for this slice)
Use a separate Haiku 5.5 agent that has not seen your reasoning. It must: run all validators; mutation-test
`validate-v2.js` including the charter test; repeat the charter check (nothing built grades truth); confirm the generated files match `warmaps-data.js` (600 events, same ids, text byte-identical)
and the dry-run numbers; confirm `git diff main -- index.html warmaps-data.js` is empty; run the layout acceptance
checks 1-6 in a headless browser at phone sizes if one is available. Report its findings to Allan unedited.

## Exit test (cold read; do not tell Allan what he should see)
Compute beforehand: the version badge text, the last date on the timeline, and the number of events the Events
panel reports for the full window. Then ask Allan to open `/v2/` in a fresh tab on his phone and read those three
out. Compare. Record the result in `STATE.md`.

## Finish
Rewrite `STATE.md` with a `v2` section; retire `F1_PROGRESS.md` in favour of it; update
`V2_SESSION_COMMON.md` section 2. Open a PR; do not merge. Phone-length reply with what to try and what is next
(slice 2: Sonnet 5.5).
