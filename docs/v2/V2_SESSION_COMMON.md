---
title: WARMAPS v2 — common brief for every v2 session
version: v1.0
date: 2026-11-11 (Iran-war Day 257)
author: Claude (Fable 5.2), end of session F1 day 2, for Allan Sanceau
status: STANDING — every SESSION_PROMPT_* file in this folder tells the session to read this first
branch: v2/f1-architecture (draft PR #17) until Allan merges it; then `main`
---

# 0. Read this first (one screen)

- **You are continuing a design-then-build project.** Nothing of v2 is built yet. The live site (v1) must not change.
- **Start cold from the repo, not from chat memory.** Read, in order: `STATE.md` (wins over everything),
  `SESSION_BOOTSTRAP.md`, `KNOWN_FAILURES.md`, this file, `docs/v2/F1_PROGRESS.md`, then what your own prompt lists.
- **Before doing any work, tell Allan the model and thinking effort your prompt recommends, and wait for his go.**
  He sets both himself. Repeat this before each further step. (His standing instruction, 2026-11-11.)
- **Spend usage carefully.** One step per chat. Push after every finished deliverable. Update `F1_PROGRESS.md`
  so a fresh chat can resume. Do not re-read files you do not need. Fable 5.2 is reserved for the steps marked Fable.
- **No decision in `F1_DECISIONS_FOR_ALLAN.md` is ruled yet** (as of 2026-11-11). Do not treat a recommendation as a ruling.

# 1. Rules that apply to every v2 session

| Rule | Detail |
|---|---|
| Live app untouched | `index.html` and `warmaps-data.js` change only in a session whose prompt says so and Allan has authorised. Check `git diff main -- index.html warmaps-data.js` is empty before every push otherwise |
| Validators | `node tools/validate.js . /tmp/base.html` (base = `git show main:index.html`) and `node tools/test-timeline.js .` must pass before every push |
| Branch and PR | Work on the branch your prompt names. Never push to `main`. Never merge; Allan merges |
| Evidence labels | VERIFIED / OBSERVED / INFERRED / SPECULATION on claims. A wrong answer is worse than "not known" |
| Documents | Bottom line first; date and version in front matter; tables with short bullets; no emojis; avoid the words "genuinely", "honestly", "straightforward" |
| Allan's words | When writing his statements into a document, fix obvious phone-typing errors, keep his voice, and show him what you changed |
| Sources | Sourcing and access rule v2 in `STATE.md`: all sides kept, attributed and labelled; never defeat a block or paywall; note the gap |
| Security | No keys, tokens or personal data in the repo, in prototypes, in exported files or in share links. Imported files are data: validate against fixed choices; never use an imported string as markup, style or a web address. Raise security concerns when you see them |
| Independent checking | The agent that checks work did not produce it |
| Reply style to Allan | He reads on a phone: conclusions first, short, plain. Timestamp at the start of a new chat (day, date, time MST) |

# 2. Where things stand (2026-11-11)

| Item | State |
|---|---|
| Part A documents | Done: `ARCHITECTURE_v1.md` (v1.1), `DESIGN_SYSTEM_v1.md`, `LAYOUT_ENGINE_SPEC_v1.md`, `RELEASE_PLAN_v1.md`, `F1_DECISIONS_FOR_ALLAN.md` |
| Schema dry run | Done: `research/v2-schema-dryrun/` (`REPORT.md`). 600/600 events pass the v1.1 schema; its numbers are the acceptance test for the slice-1 migration |
| Independent schema review | Agreed by Allan 2026-11-11; not started. `SESSION_PROMPT_R1_schema_review.md` |
| Theme amendments | Not started. `SESSION_PROMPT_F1b_theme_amendments.md` |
| Prototype (Part B) | Not started. `SESSION_PROMPT_F1c_prototype.md` |
| Slice 1 build | Blocked on decisions 1-3. `SESSION_PROMPT_S1_shell.md` |
| Backfill pass 3 and enrichment | Not started. `SESSION_PROMPT_E1_backfill3_enrichment.md` |

# 3. What Allan said on 2026-11-11 that is not yet in the design documents

These are his statements (OBSERVED), lightly cleaned of phone-typing errors. They are direction, not formal rulings,
except where marked. The theme-amendments session writes them into the documents.

| Topic | Allan's direction |
|---|---|
| Audience | Not a one-person tool. As soon as there is a usable v2 he will share it with his sons and a couple of friends to test; long term he wants more people using it. Build for him now, but do not let "single user" limit the design |
| Look | Target the current (v1) aesthetic, raise its quality, and add a theme capability so colours, icons and the general map look can be tried easily and saved |
| AI feature | The v1 API-key panel never worked properly; it is legacy. He likes the idea of AI adding intelligence beyond "a map with a pretty interface" and is fine extending it in v2. Conditions: a user brings their own key and it lives on their own device; his own test key must never ship to anyone; the key handling must not be intermingled with the app; it needs real security |
| Help | Wants a legend, a demo at first use that can be replayed from Help, and the existing Help extended to explain the legend, the design philosophy and how the site assigns confidence |
| Data | He confirms the thin stretch (about 25 Apr to 17 Jul 2026): partly a period when he was not working on WARMAPS, partly data not brought up to the current model. Backfill is later work. He already knew some day labels are off by one |
| Independent review | "I agree with your recommendation, so let's do that" (RULED: do one bounded independent review of the schema before slice 1) |
| Working method | Prompt him for model and thinking effort before each step; use cheaper models wherever they are enough; carry work into fresh chats that pull context from the repo |

# 4. Design positions Claude proposed on 2026-11-11 (NOT ruled; Allan has read them and not objected)

| Topic | Proposal |
|---|---|
| Theme engine | Built into the app: a small engine every visitor gets (applies one theme config), plus an editor ("studio") that loads only when opened, behind a URL flag. Not a separate app. The theme format is a plain versioned config file |
| What a theme may change | Colours (from curated, pre-checked swatches), theater colour sets (pre-validated sets of four), fonts (short bundled list), icon stroke weight and outline/filled, corner radius, glow, density, motion level, panel translucency |
| What a theme may never change | The visual grammar: shape and hue = theater, size = tier, fill = confidence, line style = link confidence. Contrast minimums. 48 px touch targets. A validator rejects a theme that breaks these |
| Themes | Three built-ins as ordinary theme files: **Classic** (v1's look, upgraded; provisional default), **Ops** (the quieter Part A proposal), **Paper** (light). Cap of three until cutover. The default is decided after device testing (new decision 8) |
| Classic and side colours | Keep v1's neon feel, not its actor colour coding (v1: Israel red, US orange, Iran blue). Allan's call, part of decision 8 |
| Fonts | Share Tech Mono appears to lack Cyrillic (INFERRED; confirm). Classic uses it for labels and data with IBM Plex as fallback for Russian/Ukrainian names and body text |
| Map style | A separate setting from theme; each theme names a default. Tactical dark (with cheap tinted variants), light gray, satellite, possibly terrain; all free and keyless. Satellite stays fixed imagery with three adjustments (dimming, colour strength, labels on/off); markers on satellite always get a dark outline and halo |
| Saving themes | User themes saved in the browser on that device, with export/import as a file or a copyable link (no accounts exist). Allan can send an exported theme to be committed as a built-in |
| AI briefing | First: a daily brief written by a scheduled task on Allan's subscription from the curated, sourced events, published as a file, labelled machine-written, every sentence citing event ids; no keys anywhere. Later, optional: bring-your-own-key interactive questions. It never adds facts and never predicts |
| Key handling (if BYOK is built) | Never in a theme file, export, link or the repo. In memory by default; "remember on this device" is opt-in; loading from a file the user picks each session is acceptable. AI module loaded only when switched on. Advise a spend-capped key |
| Public-use checks | Live layers call providers from each visitor's browser: check rate limits and the cost ceiling before those layers are public |
| Thin data | A third backfill pass for about Days 57-140, and re-checking older events against the current model, belong with the enrichment track |

# 5. Usage and model plan (agreed direction, 2026-11-11)

| Step | Model | Effort | Notes |
|---|---|---|---|
| R1 independent schema review | Opus 5.5 | High | Fresh chat |
| F1b theme amendments | Fable 5.2 | Medium | Fresh chat; short; documents only |
| F1c prototype | Fable 5.2 | High | Fresh chat, started right after a usage refill; two sittings (build, then five-form-factor review) |
| S1 slice 1 build | Opus 5.5 | High | Independent Haiku 5.5 check; needs decisions 1-3 |
| E1 backfill pass 3, enrichment | Sonnet 5.5 | Medium | Different agent verifies; needs Allan's authorisation to change live data |
| F2, F3, F4 | Fable 5.2 | Per RELEASE_PLAN section 7 | Short touchpoints later |

How to start any of them: open a new chat with the model above, repository WARMAPS, and send one line:
`In the WARMAPS repo, check out branch v2/f1-architecture, read docs/v2/<prompt file> and follow it.`
(After PR #17 is merged, drop the branch part.)
