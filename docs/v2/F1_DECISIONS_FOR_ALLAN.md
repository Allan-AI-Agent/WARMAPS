---
title: F1 — Decisions for Allan
version: v1.0
date: 2026-11-10 (Iran-war Day 256)
author: Claude (Fable 5.2), session F1
status: AWAITING RULING — seven decisions; a one-word answer works for each
how to answer: reply with seven letters in order, for example "A A A A A A A", or "all recommended"
---

# Answer sheet (everything you need is in this table)

| # | Decision | Recommended | One-line reason | Can it wait for the prototype? |
|---|---|---|---|---|
| 1 | Build step for v2 | **A: none** (plain files) | Keeps the phone-driven validate-then-push workflow; can be added later without rework | No — S1 needs it |
| 2 | Iran data master until cutover | **A: v1 file stays master**, v2 files generated from it | One edit updates both sites; v1 never at risk | No — S1 needs it |
| 3 | Event ID format | **A: `IR-0001`** with the old number kept | Unique across theaters, mechanical, reversible | No — S1 needs it |
| 4 | Shared timeline label | **A: calendar date first**, day numbers second | The two wars have different Day 1s; a date is the only label true for both | Yes |
| 5 | The word "merger" | **A: the system never says it** | The software reports tripwire states; the conclusion stays yours | Yes |
| 6 | The 353 events with no reviewed confidence (ids 1-385, minus the 32 already marked fog) | **A: neutral grey "not yet reviewed"** | Does not claim a confidence the data lacks | **Yes — judge it on the prototype** |
| 7 | v1's AI summary panel | **A: leave it out of v2 for now** | Stores users' API keys in the browser on a public site; off-mission for a source-disciplined map | Yes |

Not a decision (already ruled 2026-11-09, recorded in STATE.md): the globe is a copy of selected parts into
`globe/`, not a fork. The F1 prompt listed it as "confirm"; it is confirmed.

To start the prototype, say: **"continue with Part B"**. Decisions 4-7 can be ruled after you have seen it.

Each decision below has: the options, a decision card in your format, the strongest objection to my
recommendation, and my answer to it. Evidence labels as usual.

---

# 1. Build step for v2

**Question:** should v2 be plain files the browser loads directly, or a compiled bundle?

| Option | What it means |
|---|---|
| **A. No build (recommended)** | v2 is ordinary `.js`, `.css` and `.json` files using the browser's native module loading. What is in the repo is what runs. Leaflet and Cesium load from a pinned public CDN with integrity hashes |
| B. Vite build | Source is compiled into bundles by a tool (what the upstream globe project uses — VERIFIED). GitHub Actions or Cloudflare would have to run the build on every merge |

**Card:** VALUE high · EFFORT none extra (A) vs about a session plus ongoing upkeep (B) · CONFIDENCE high · COST nominal · RECOMMEND A · GATE not auto-approved (architecture-level)

- **Why A:** today a session can edit a file, run the validators, push, and you can read the exact file that is
  live. That habit is what the known-failures register was built around. A build step adds a new place for things
  to go wrong between the repo and the site, and a Node toolchain to keep current.
- **Strongest objection:** dozens of small module files may load slowly on a phone, and copying modules from the
  Vite-based upstream is more work without a bundler.
- **Answer:** Cloudflare serves files in parallel, and the budget is measured in slice 1 (SPECULATION until then).
  If it fails, a bundling step can be added later **without changing any module**, so A does not close the door on
  B. The upstream modules need adapting to our data and layer contract either way.

# 2. Iran data master until cutover

**Question:** while v1 and v2 are both live, where do new Iran events get written?

| Option | What it means |
|---|---|
| **A. v1's `warmaps-data.js` stays the master (recommended)** | Events are added exactly as today. A script generates v2's files from it plus a small sidecar holding the new fields (tier, sources, claim status). CI regenerates and fails on any difference |
| B. v2 JSON becomes the master now | Events are written in the new format; a script generates `warmaps-data.js` for v1 |
| C. Maintain both by hand | No scripts; every event entered twice |

**Card:** VALUE high · EFFORT small (one script, in S1) · CONFIDENCE high · COST nominal · RECOMMEND A · GATE not auto-approved (touches the data pipeline)

- **Why A:** v1 is the public site and must not break. Under A nothing writes to v1's file except the people
  already writing to it. Under B a new, untested generator would be producing the live site's data from day one.
- **Strongest objection:** the sidecar is a second file to keep in step, and richer fields live apart from their
  event until cutover.
- **Answer:** true, and temporary. The sidecar is keyed by event number and checked by the validator; the pass-2
  research file already is such a sidecar for ids 386-600 (VERIFIED). At cutover it is folded in and deleted.
  Russia-Ukraine has no v1, so it is written in the new format from the start and is unaffected.

# 3. Event ID format

**Question:** v1 events are numbered 1-600. With several theaters, what does an ID look like?

| Option | What it means |
|---|---|
| **A. `IR-0001` ... `IR-0600`, `RU-0001` ... (recommended)** | A theater prefix plus the number. The old number is stored as `legacyId` permanently. Conversion both ways is a one-line rule |
| B. Iran keeps bare numbers; other theaters get prefixes | Nothing changes for Iran |
| C. One global counter across all theaters | Next RU event would be 601, 602 ... interleaved with Iran |

**Card:** VALUE medium-high · EFFORT trivial · CONFIDENCE high · COST nominal · RECOMMEND A · GATE not auto-approved (hard to change later)

- **Why A:** an ID should say which file to look in, and every ID should have the same shape so no code needs a
  special case for Iran. Key-event lists, links and watch items all cite IDs.
- **Strongest objection:** the Drive research briefs, STATE.md history and your own notes all say "id 349".
- **Answer:** they stay valid. "349" and "IR-0349" are the same event by rule, the UI can show either, and v1 keeps
  bare numbers until it is retired. This is the one decision here that is expensive to reverse once links start
  citing events, which is why it is asked now.

# 4. Shared timeline label

**Question:** on the one scrubber, what is the main readout?

| Option | What it means |
|---|---|
| **A. Calendar date first (recommended)** | `08 Nov 2026`, then `IR Day 254 · RU Day 1,719` beside it. In single-theater mode the day number sits right next to the date |
| B. Iran-war day first | `Day 254` as today, date second; RU expressed relative to it |

**Card:** VALUE medium · EFFORT none · CONFIDENCE high · COST nominal · RECOMMEND A · GATE could auto-approve; asked because it changes something you look at every day

- **Why A:** Day 1 is 28 Feb 2026 for one war and 24 Feb 2022 for the other. A date is the only label that is true
  in both; and a 2022 event has no meaningful Iran-war day.
- **Strongest objection:** "Day 254" is WARMAPS's signature and how you think about this war.
- **Answer:** it stays on screen at all times, immediately beside the date, and in Iran-only mode the two read as
  one unit. Only the order changes.

# 5. The word "merger"

**Question:** may the product itself ever say the wars have merged?

| Option | What it means |
|---|---|
| **A. Never; fixed three-step headline only (recommended)** | The watchlist headline reads *No direct combat link seen* / *reported* / *confirmed*, driven only by combat tripwires. Any stronger wording is something you write, signed and dated, as an editorial note |
| B. Allowed when two or more combat tripwires of different kinds are confirmed | The system then shows "Theaters assessed as merged in part" |
| C. Allowed when any one combat tripwire is confirmed | Lower bar |

**Card:** VALUE high (credibility) · EFFORT none · CONFIDENCE medium-high · COST nominal · RECOMMEND A · GATE not auto-approved (contested editorial judgment — yours)

- **Why A:** your convergence view is, in your own labelling, INFERRED/SPECULATION. A site whose point is a
  constitution of sources is worth most when it shows the evidence and stops. A threshold rule (B or C) turns an
  editorial judgment into an automatic output, and a single mis-set status would publish a conclusion.
- **Strongest objection:** if the tripwires really do trip, a site that refuses to say so looks evasive, and "what
  moves the needle" is exactly naming it.
- **Answer:** under A the confirmed tripwires are shown prominently, with evidence, on the globe. The reader can
  see it. What A withholds is only the machine drawing the conclusion; you can state it yourself at any time in an
  editorial note, which is a stronger statement than a banner because a person stands behind it.

# 6. Events with no reviewed confidence

**Question:** 353 Iran events (ids 1-385, minus the 32 that already carry a fog marker — VERIFIED by count) were never given a claim status. How should they look?

| Option | What it means |
|---|---|
| **A. Neutral grey, labelled "not yet reviewed" (recommended)** | Theater-coloured outline, grey fill. Colour fills in as review passes cover them |
| B. Theater colour at reduced strength | Looks like the rest, slightly faded; the label appears only in the card |
| C. Treat as "reported" | Full colour, no distinction |

**Card:** VALUE medium · EFFORT none now; a review pass later is real work · CONFIDENCE medium · COST nominal now · RECOMMEND A, **but decide on the prototype** · GATE not auto-approved (visible, and a matter of taste as well as honesty)

- **Why A:** C would assert that events were checked when they were not (the pass-2 verification covered ids
  386-600 only — VERIFIED in STATE.md). A is the only option that is plainly true.
- **Strongest objection:** the opening months of the war, the most dramatic part of the map, would be mostly grey.
  That undersells the product, and many of those events are well established in fact.
- **Answer:** that is a fair hit, and it is why this one should be judged by eye. The prototype will show A and B
  side by side. The real cure is neither: it is a review pass over ids 1-385 (Sonnet drafting with an independent
  verifier, the pass-2 method), which could run alongside S2 and would make the question disappear. If you choose
  B, the card still says "not yet reviewed", so nothing false is stated; only the at-a-glance signal is weaker.

# 7. v1's AI summary panel

**Question:** v1 has an "AI intelligence" panel where a visitor pastes their own Anthropic, OpenAI or Gemini key.
Does v2 carry it?

| Option | What it means |
|---|---|
| **A. Leave it out of v2 for now (recommended)** | Not built in S1-S8. v1 keeps it until cutover. Revisit after cutover as an optional module |
| B. Carry it over in S2 | Same behaviour, restyled |
| C. Rebuild it properly later | A server-side summary generated nightly from the curated events and shown to everyone, with no visitor keys |

**Card:** VALUE low-medium · EFFORT none (A), about half a session (B), a slice plus metered cost (C) · CONFIDENCE medium · COST nominal (A, B) / METERED (C) · RECOMMEND A · GATE not auto-approved (removes a v1 feature at cutover)

- **Why A:** two reasons. Security: the panel keeps a visitor's API key in the browser's local storage (VERIFIED in
  `index.html`). On a public site that is a habit worth not carrying forward: any script that ever ran on the page
  could read it. Mission: an unsourced model-written summary sits awkwardly on a map whose point is that every
  claim has a source and a confidence label.
- **Strongest objection:** you use it, and "second brain" assistance is one of your stated goals.
- **Answer:** then C is the right shape for it, not B: a summary written from the curated, sourced events, labelled
  as machine-written, with no keys in any browser. C is metered, so it needs its own ruling and belongs after
  cutover. If you rely on the panel today, say B and it goes into S2 unchanged.

---

# Decided unless you object (design calls I made; veto any by naming it)

| Call | Where | Why |
|---|---|---|
| Typefaces: IBM Plex Sans, Sans Condensed and Mono, self-hosted | DESIGN_SYSTEM 1 | Cyrillic coverage for the RU theater; no third-party font call |
| Theater = colour **and** shape (circle, diamond, triangle, hexagon) | DESIGN_SYSTEM 2.2 | Amber and sky blue have near-identical brightness (computed 1.02:1); shape keeps them apart in sunlight and greyscale |
| Colour never marks a side | DESIGN_SYSTEM 0 | v1's red/blue reads as partisan and cannot extend to four theaters |
| All link arcs one colour; confidence by line style; at most 12 arcs; no animation | DESIGN_SYSTEM 5 | The anti-"conspiracy board" rules |
| No scrolling ticker by default; no national flags as icons | DESIGN_SYSTEM 6, 7 | Restraint; flags take sides and fail at small sizes |
| 2D is the default view on every device until the globe is measured | ARCHITECTURE 9.4 | Fire tablet performance is unknown |
| No service worker; files revalidated on every load | ARCHITECTURE 9.1 | Known failure F-007 |
| Watchlist is the last feature slice | RELEASE_PLAN S7 | Most interpretive; can move earlier at no cost if you prefer |
| Touch targets 48 px (v1 used 44); custom timeline control instead of browser sliders | LAYOUT 2.3, DESIGN 8 | Fixes the oversized slider handles you reported on 2026-11-02 |

# Three things you should know that are not decisions

1. **WARNING — NOT PREVIOUSLY IDENTIFIED.** 63 of the 600 events have dates that are ranges or annotations
   ("Feb 28 – Mar 1, 2026", "Feb 28 - ongoing"). v1 quietly uses the first date. The v2 migration will list each
   one for a ruling rather than guess. MITIGATION — PENDING (slice 1). No effect on the live site.
2. **WARNING — NOT PREVIOUSLY IDENTIFIED.** The word "tier" means two different things in the project (research
   tiers milestone/major/standard; Key Strike categories), and "origin" means two different things (launch point
   in v1; provenance in REV B). v2 separates them by name. MITIGATION — IN FORCE in the schema; watch for the old
   meanings in future briefs.
3. **Previously identified, restated.** Every performance number for the Fire tablet is a target, not a
   measurement. Slice 5 replaces them with readings from your device. MITIGATION — PENDING.

Also noticed, not changed: the KEY FIELDS table in `STATE.md` still shows 385 events and Day 170, while its header
correctly says 600 and Day 254. A one-line fix for the next session that rewrites STATE.md.
