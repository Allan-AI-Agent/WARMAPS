---
title: F1 — Decisions for Allan
version: v1.2 (2026-11-14: rewritten under the editorial charter; decisions 5 and 6 reworded, decision 9 added; see "What changed" below)
date: 2026-11-14 (Iran-war Day 260); v1.1 was 2026-11-11
author: Claude (Fable 5.2), sessions F1 and F1b-1
status: AWAITING RULING — eight decisions (1-7 and 9; number 8 is reserved for the default theme, added by session F1b-2); a one-word answer works for each
how to answer: reply with eight letters in the order of the answer sheet, for example "A A A A A A A A", or "all recommended"
---

**Under the editorial charter (ruled 2026-11-12, `STATE.md`).** WARMAPS records who said what, with sources, and
never rules on whether a claim is true. Nothing in this file asks you to grade a claim. The CONFIDENCE word on each
decision card rates my own recommendation, not any claim.

# Answer sheet (everything you need is in this table)

| # | Decision | Recommended | One-line reason | Can it wait for the prototype? |
|---|---|---|---|---|
| 1 | Build step for v2 | **A: none** (plain files) | Keeps the phone-driven validate-then-push workflow; can be added later without rework | No — S1 needs it |
| 2 | Iran data master until cutover | **A: v1 file stays master**, v2 files generated from it | One edit updates both sites; v1 never at risk | No — S1 needs it |
| 3 | Event ID format | **A: `IR-00001`** with the old number kept | Unique across theaters, mechanical, reversible | No — S1 needs it |
| 4 | Shared timeline label | **A: calendar date first**, day numbers second | The two wars have different Day 1s; a date is the only label true for both | Yes |
| 5 | Watchlist headline | **A: a count** ("N of M combat tripwires have a claim on record") | Shows where things stand without the site drawing a conclusion | Yes |
| 6 | How the 600 Iran events look before anyone has recorded who said them | **A: 473 plain "not yet attributed", 127 ghosts** | Says exactly what the data holds: v1 flagged fog on 127 and recorded a claimant on none | **Yes — judge it on the prototype** |
| 7 | v1's AI summary panel | **A: leave it out of v2 for now** | Stores users' API keys in the browser on a public site; off-mission for a source-disciplined map | Yes |
| 9 | When a ghost becomes solid | **A: a side from each end has said it happened** | A strike is solid when the one who struck and the one struck both say so | **Yes — judge it on the prototype** |

Not a decision (already ruled 2026-11-09, recorded in STATE.md): the globe is a copy of selected parts into
`globe/`, not a fork. The F1 prompt listed it as "confirm"; it is confirmed.

To start the prototype, say: **"continue with Part B"**. Decisions 4-7 and 9 can be ruled after you have seen it.
Decision 8 (default theme) is added by session F1b-2 and is not in this version.

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
| **A. v1's `warmaps-data.js` stays the master (recommended)** | Events are added exactly as today. A script generates v2's files from it plus a small sidecar holding the new fields (tier, sources, and the entries that record who said what). CI regenerates and fails on any difference |
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
| **A. `IR-00001` ... `IR-00600`, `RU-00001` ... (recommended)** | A theater prefix plus the number, five digits so plain sorting still works past 9,999 events. The old number is stored as `legacyId` permanently. Conversion both ways is a one-line rule |
| B. Iran keeps bare numbers; other theaters get prefixes | Nothing changes for Iran |
| C. One global counter across all theaters | Next RU event would be 601, 602 ... interleaved with Iran |

**Card:** VALUE medium-high · EFFORT trivial · CONFIDENCE high · COST nominal · RECOMMEND A · GATE not auto-approved (hard to change later)

- **Why A:** an ID should say which file to look in, and every ID should have the same shape so no code needs a
  special case for Iran. Key-event lists, links and watch items all cite IDs.
- **Strongest objection:** the Drive research briefs, STATE.md history and your own notes all say "id 349".
- **Answer:** they stay valid. "349" and "IR-00349" are the same event by rule, the UI can show either, and v1 keeps
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

# 5. Watchlist headline

**Question:** the watchlist tracks a short list of combat tripwires (for example, Russian naval escorts in Hormuz).
What does the line at the top of it say?

| Option | What it means |
|---|---|
| **A. A count (recommended)** | "N of M combat tripwires have a claim on record", followed where relevant by "K stated by both ends · J denied". Each tripwire opens to show who says it, who denies it, and their sources |
| B. No headline | The panel lists the tripwires and their entries; nothing is summed |

**Not an option (ruled out by the charter):** an automatic line such as "Theaters assessed as merged in part" or
"Direct combat link confirmed". That would be the site ruling on a claim. The words *confirmed*, *merger*, *merged*,
*one war* and *world war* appear in no system-generated text (ARCHITECTURE 4.2). If you conclude the wars have
merged, you say so in a signed, dated editorial note, labelled as your view (charter rule 6).

**Card:** VALUE medium-high · EFFORT none · CONFIDENCE medium-high · COST nominal · RECOMMEND A · GATE not auto-approved (editorial presentation — yours)

- **Why A:** a reader opening the watchlist wants to know at a glance whether anything has moved. A count answers
  that and stops. It counts who has spoken, the same thing every other mark on the site counts.
- **Strongest objection:** a count can still be read as a score. "3 of 4" looks like "75% of the way to one war",
  which is the conclusion the charter says the site does not draw.
- **Answer:** that risk is real, and it is why B is offered. Against it: the count sits beside "stated by both ends"
  and "denied", so the reader sees a claim count, not a verdict; and the rhetoric track is never added into it. If
  the count reads as a score on the prototype, choose B.

# 6. How the 600 Iran events look before anyone has recorded who said them

**Question:** v2 draws each event from who has spoken about it. None of the 600 Iran events records a claimant yet
(VERIFIED by the dry run: 0 of 600). 127 of them carry a v1 fog note; the other 473 do not. Until the enrichment
pass records who said what, how should they look?

| Option | What it means |
|---|---|
| **A. 473 plain, 127 ghosts (recommended)** | The 473 draw as a plain flat mark in the theater colour, labelled "not yet attributed: carried over from the first version; who said it is not yet recorded". The 127 with a v1 fog note draw as ghosts (thin outline). Marks change as enrichment records the claimants |
| B. All 600 as ghosts | Everything is an outline until enrichment reaches it |
| C. All 600 plain | v1's fog notes are not used for the look; they stay readable in the card |

**Card:** VALUE medium · EFFORT none now; the enrichment pass is real work (ARCHITECTURE 7.3) · CONFIDENCE medium · COST nominal now · RECOMMEND A, **but decide on the prototype** · GATE not auto-approved (visible, and a matter of taste as well as accuracy)

- **Why A:** it shows only what the data holds. A ghost means "one side on record, an involved side not heard";
  for the 473 we do not know that, because no side is recorded at all. For the 127, v1 itself wrote a fog note.
- **Strongest objection:** A gives the map two interim looks at once, and a reader may take "plain" for "solid".
  Also, a v1 fog note was not always written because a side was missing (INFERRED from reading the notes; not
  counted), so the 127 ghosts are an approximation.
- **Answer:** both points stand. The plain mark has no outline and a weaker fill so it is not mistaken for solid,
  and its legend line and card chip say what it is; the prototype shows A and B side by side so you can judge by
  eye. The cure is the enrichment pass, which starts with these 127 and makes the question fade as it proceeds.

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
  claim has a source and a named claimant.
- **Strongest objection:** you use it, and "second brain" assistance is one of your stated goals.
- **Answer:** then C is the right shape for it, not B: a summary written from the curated, sourced events, labelled
  as machine-written, with no keys in any browser. C is metered, so it needs its own ruling and belongs after
  cutover. If you rely on the panel today, say B and it goes into S2 unchanged.

# 9. When a ghost becomes solid

(Number 8 is reserved for the default theme, which session F1b-2 adds.)

**Question:** a ghost is an event with one side on record. Solid means "the sides on record agree it happened",
and nothing more. How many sides, and which, must say it happened before the mark turns solid?

| Option | What it means |
|---|---|
| **A. A side from each end (recommended; the documents use it as the default)** | Every event names two ends: who did it and who it was done to. Solid when a side from each end the record names has said it happened. Israel says it struck Isfahan, and Iran says Isfahan was struck: solid |
| B. Any two sides | Solid when any two different sides say it happened, whichever they are. This is the literal wording agreed on 2026-11-12 ("more than one side on record and they agree") |
| C. Every involved side | Solid only when every side the record names as involved has said it happened |

Under all three: a denial makes the mark split, never solid; outlets that only repeat a claim count for nothing;
the UN, monitors and other observers are named on the card but do not make a mark solid.

**Card:** VALUE high (it sets what most of the map looks like) · EFFORT none; one setting (`solidRule` in the reference code) · CONFIDENCE medium · COST nominal · RECOMMEND A, **but decide on the prototype** · GATE not auto-approved (editorial)

- **Why A:** under B, the US and Israel both announcing a strike on Iran would turn it solid with Iran never
  heard. Those two are separate parties but stand on the same end of that event, and the fog rule (charter rule 4)
  is about the directly involved side that has not spoken. A asks for the other end.
- **Strongest objection:** A makes solid rare. Parties often do not acknowledge being hit, and the missing sides'
  outlets are not yet among our sources, so with Fog switched off the map could look nearly empty. B is also what
  you agreed to in words.
- **Answer:** the emptiness would be an accurate picture of the record, and Fog is on by default so nothing is
  hidden. But whether the map still reads well is a matter for the eye, which is why the prototype shows a real
  week under A and B. The choice is one setting and changes no stored data, so it can be changed after cutover too.

---

# Three provisional rulings on record (yours, 2026-11-12; to confirm after the demo)

These are not asked again here. They are built into the four design documents as defaults, each a single config
value, and you confirm or change them once you have tried the prototype.

| # | Ruling (PROVISIONAL) | Where it lives |
|---|---|---|
| 1 | The map opens on the last 7 days and can be widened to any range or the whole war | ARCHITECTURE 5.4; LAYOUT spec (timeline band) |
| 2 | A one-sided claim is drawn at standard size until another side is on record | ARCHITECTURE 3.4.2; DESIGN_SYSTEM 2.3 |
| 3 | Look-again checks at 1, 3, 7 and 30 days | ARCHITECTURE 3.4.5 (`lookAgainDays`) |

Also on record, not provisional: on 2026-11-13 you accepted the independent review's four fixes M1-M4 (M4 as a
claimant on each entry) and ruled that the live v1 site's stats wording be updated under the charter (a separate
small change to v1, its own branch and PR).

---

# Decided unless you object (design calls I made; veto any by naming it)

| Call | Where | Why |
|---|---|---|
| Typefaces: IBM Plex Sans, Sans Condensed and Mono, self-hosted | DESIGN_SYSTEM 1 | Cyrillic coverage for the RU theater; no third-party font call |
| Theater = colour **and** shape (circle, diamond, triangle, hexagon) | DESIGN_SYSTEM 2.2 | Amber and sky blue have near-identical brightness (computed 1.02:1); shape keeps them apart in sunlight and greyscale |
| Colour never marks a side | DESIGN_SYSTEM 0 | v1 colours markers by actor (Israel red, US orange, Iran blue); that reads as partisan and cannot extend to four theaters |
| All link arcs one colour; line style shows who has spoken (both actors, one, others only, or denied by someone); at most 12 arcs; no animation | DESIGN_SYSTEM 5 | The anti-"conspiracy board" rules |
| No scrolling ticker by default; no national flags as icons | DESIGN_SYSTEM 6, 7 | Restraint; flags take sides and fail at small sizes |
| 2D is the default view on every device until the globe is measured | ARCHITECTURE 9.4 | Fire tablet performance is unknown |
| No service worker; files revalidated on every load | ARCHITECTURE 9.1 | Known failure F-007 |
| Watchlist is the last feature slice | RELEASE_PLAN S7 | Most interpretive; can move earlier at no cost if you prefer |
| Touch targets 48 px (v1 used 44); custom timeline control instead of browser sliders | LAYOUT 2.3, DESIGN 8 | Fixes the oversized slider handles you reported on 2026-11-02 |

**Added by the charter rewrite (2026-11-13). These are rules for counting who has spoken; none grades a claim.**

| Call | Where | Why |
|---|---|---|
| A dispute over **who did it** also makes a mark split, not only a denial that it happened | ARCHITECTURE 3.4.2 rule 4 | "It happened but it was not us" is a contested record |
| An outlet quoting an **unnamed official** does not put that side on record | ARCHITECTURE 3.4.1 | The side has not spoken in its own name; the report is filed under the outlet |
| **State or party media** counts as its side's account, labelled "state media" | ARCHITECTURE 3.4.2, 4.5 | Your 2026-11-12 direction; often the only way a side speaks |
| **Exile, opposition and independent media** never count as a side; they are listed as observers in their own name | ARCHITECTURE 3.4.2 | Charter rule 2 |
| **Observers** (UN bodies, monitors, companies) are named on the card but do not turn a ghost solid | ARCHITECTURE 3.4.2 | The UN reporting a strike on Iran does not put Iran on record |
| Actor ids are flat (`irgc`, not `iran.irgc`), with a `parent` field; the source registry records each outlet's ownership | ARCHITECTURE 4.4, 4.5 | Independent review items S11 and S2; the side rules need both |
| v1's `verified`, `fogLean` and `originKnown: "probable"` are **not carried** into v2 files; they stay in the preserved v1 file | ARCHITECTURE 7.1 | They grade truth |
| Link line weight counts **separate voices** that have affirmed the link lately; repeats by one voice and outlets that only carry it add nothing | ARCHITECTURE 5.6 | Repetition is not corroboration (charter rule 3) |
| A ghost fades only when the 30-day check was **actually run and logged** | ARCHITECTURE 3.4.5 | The site never says it looked when it did not |

# What changed in v1.2 (2026-11-14, charter rewrite)

- **Decision 5** is now about the watchlist headline. The old option of an automatic "assessed as merged" line is
  ruled out by the charter, as is the old three-step headline that ended in "confirmed".
- **Decision 6** is restated: the question is no longer "reviewed confidence" but "no claimant recorded". The
  counts changed from 352 grey to 473 plain and 127 ghosts (re-baselined dry run: 127 events carry a v1 fog
  marker, 34 of them in ids 1-385 and 93 in ids 386-600; the other 473 carry none).
- **Decision 9** is new. Number 8 is left for session F1b-2 (default theme).
- The three provisional rulings of 2026-11-12 and nine design calls from the rewrite are recorded above.
- Item 1 of "Five things" below is rewritten: link grades are gone altogether, not adjusted.

# What changed from v1.0 (2026-11-10) to v1.1 (2026-11-11)

I ran all 600 live events through the proposed schema (`research/v2-schema-dryrun/REPORT.md`). None of the seven
decisions changes direction. Three details changed, and four things I told you were wrong:
- **Decision 3:** IDs are five digits (`IR-00001`), not four, so sorting survives a large backfill.
- **Decision 6:** the count was 352, not 353 (superseded again in v1.2 above).
- **Corrected:** "63 dates need a ruling" (it is 6); "the research file and the data disagree on fog by one" (they
  agree; my search was wrong); "v1 is red-for-Iran, blue-for-US" (Israel red, US orange, Iran blue).

# Five things you should know that are not decisions

1. **RESOLVED BY THE CHARTER. Links no longer carry any grade.** v1.0 of the design graded links, and a link
   could reach the top grade on one government's sanctions designation, which favoured official claims from one
   side. v1.1 tightened the grading; the charter (2026-11-12) removed it. In ARCHITECTURE v1.2 a link is a set of
   dated entries: who affirms it, who denies it, each with a source. Its line style shows who has spoken and its
   weight counts separate voices. A sanctions designation is recorded as what it is: that government's claim.
2. **WARNING — NOT PREVIOUSLY IDENTIFIED. A one-row timeline cannot be used precisely on a phone.** At full width
   the S22 gets about 1 pixel per day. MITIGATION — IN FORCE in the specs: the timeline is two-level, an overview
   of everything plus a detail row of about 41 finger-sized steps. You will see it in the prototype.
3. **WARNING — NOT PREVIOUSLY IDENTIFIED. v1's event type is unreliable about who did what** (26 of 281 name a
   different attacker; about 29 are not strikes). MITIGATION — IN FORCE: v2 does not derive actors from it and
   flags derived values so they are never shown as fact. Consequence: an **enrichment pass** over the 600 events
   is real work (ARCHITECTURE 7.3). Until it runs, v2 shows the Iran theater as richly as v1 and no richer.
4. **Six dates and six time notes need your ruling** before slice 1 merges (ARCHITECTURE 7.1). Defaults keep v1's
   placement, so nothing is blocked. Separately, 60 events (ids 109-297) show a "Day N" in v1 that is one lower
   than the day the app computes; that is a v1 data fix if you want it.
5. **One tripwire from the ruled list does not fit: "coordinated cross-theater escalation timing".** Timing is a
   pattern read into events; no single event states it. Options when definitions are written: redefine it as
   stated operational coordination (a joint operation that a participant announces or another party alleges, with
   who says so), or keep timing coincidences in a separate status-free list, "Patterns noted". Held out of
   the starting set until you rule. MITIGATION — PENDING.

Previously identified, restated: every performance number for the Fire tablet is a target, not a measurement.
MITIGATION — PENDING (the globe slice measures it). The dry run was written by the schema's author; the
independent review you asked for was done on 2026-11-11 (`research/v2-schema-review/REVIEW.md`) and its four
must-fix items are applied. Its items S10, S12 and S13 remain open (ARCHITECTURE section 10).

Also noticed, not changed: the KEY FIELDS table in `STATE.md` still shows 385 events and Day 170, while its header
correctly says 600 and Day 254. A one-line fix for the next session that rewrites STATE.md.
