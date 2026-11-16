---
title: F1 — Decisions for Allan
version: v1.3 (2026-11-15: decision 8 added, the default theme; decision 7 reworded around the AI briefing, its ruling unchanged; theme design calls listed for veto. v1.2, 2026-11-14: rewritten under the editorial charter)
date: 2026-11-15 (Iran-war Day 261); v1.2 was 2026-11-14
author: Claude (Fable 5.2), sessions F1, F1b-1 and F1b-2
status: decisions 1-5 and 7 RULED A (2026-11-14); 6 and 9 RULED A PROVISIONAL (confirm after the prototype); **8 is OPEN** (new 2026-11-15; best answered after the prototype). Nine decisions; this is the cap
how to answer: only decision 8 is open. Reply "8 A", "8 B" or "8 C", or wait and answer it on the prototype, where you also confirm 6 and 9 and item d
---

**Under the editorial charter (ruled 2026-11-12, `STATE.md`).** WARMAPS records who said what, with sources, and
never rules on whether a claim is true. Nothing in this file asks you to grade a claim. The CONFIDENCE word on each
decision card rates my own recommendation, not any claim.

# Answer sheet (everything you need is in this table)

| # | Decision | Recommended | One-line reason | Can it wait for the prototype? |
|---|---|---|---|---|
| 1 | Build step for v2 | **RULED A: none** (plain files), Allan 2026-11-14 | Keeps the phone-driven validate-then-push workflow; can be added later without rework | Done |
| 2 | Iran data master until cutover | **RULED A: v1 file stays master**, v2 files generated from it, Allan 2026-11-14 | One edit updates both sites; v1 never at risk | Done |
| 3 | Event ID format | **RULED A: `IR-00001`** with the old number kept, Allan 2026-11-14 | Unique across theaters, mechanical, reversible | Done |
| 4 | Shared timeline label | **RULED A, 2026-11-14: calendar date first**, day numbers second | The two wars have different Day 1s; a date is the only label true for both | Yes |
| 5 | Watchlist headline | **RULED A, 2026-11-14: a count** ("N of M combat tripwires have a claim on record") | Shows where things stand without the site drawing a conclusion | Yes |
| 6 | How the 600 Iran events look before anyone has recorded who said them | **PROVISIONAL A, 2026-11-14 (confirm after the prototype): 473 plain "not yet attributed", 127 ghosts** | Says exactly what the data holds: v1 flagged fog on 127 and recorded a claimant on none | **Yes — judge it on the prototype** |
| 7 | v1's AI summary panel, and what follows it | **RULED A, 2026-11-14: leave it out of v2 for now.** What follows after cutover is asked then; my recommendation on file is a daily published brief with no keys (slice S9) | Stores users' API keys in the browser on a public site. The brief keeps the idea and drops the keys | Done; the follow-on waits for cutover |
| 8 | Default theme, and whether Classic keeps v1's side colours | **OPEN. Recommended A: Classic is the default; colour means theater, not side** | Your direction was to target v1's look; side colours cannot extend to four theaters and read as partisan | **Yes — judge it on the prototype** |
| 9 | When a ghost becomes solid | **PROVISIONAL A, 2026-11-14 (confirm after the prototype): a side from each end has said it happened** | A strike is solid when the one who struck and the one struck both say so | **Yes — judge it on the prototype** |

Not a decision (already ruled 2026-11-09, recorded in STATE.md): the globe is a copy of selected parts into
`globe/`, not a fork. The F1 prompt listed it as "confirm"; it is confirmed.

To start the prototype, say: **"continue with Part B"**. Nothing blocks it. On the prototype you answer 8 and
confirm 6, 9 and item d.

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

# 7. v1's AI summary panel, and what follows it

**RULED A by Allan, 2026-11-14: the v1 panel is left out of v2 for now.** That ruling stands and is not reopened
here. This section is reworded (2026-11-15) to record your direction on what could follow, so it is on file when
cutover comes. **Nothing here needs an answer now.**

**Your direction (2026-11-11, OBSERVED):** the v1 panel, where a visitor pastes their own Anthropic, OpenAI or
Gemini key, never worked properly and is legacy. You like AI adding something beyond "a map with a pretty
interface" and are fine extending it in v2, on conditions: a user brings their own key and it lives on their own
device; your own test key never ships to anyone; key handling is not intermingled with the app; it has real security.

**The follow-on choice, to be asked at cutover (slice S9 in the release plan):**

| Option | What it means |
|---|---|
| **A. A daily published brief (recommended)** | A scheduled task on your own subscription writes a short brief each day from the curated, sourced record and publishes it as a file. The site shows it stamped as machine-written. Every sentence cites the events it rests on. No key exists in any browser |
| B. A, and later questions with your own key | As A. Later, a reader may bring their own key to ask questions of the record, under your conditions above, as separate code that loads only when switched on |
| C. Neither | v2 has no AI feature |

**Card (for the follow-on):** VALUE medium · EFFORT one slice (A); a second slice and a security review (B) · CONFIDENCE medium-high for A, medium for B · COST nominal for A (it uses your subscription's scheduled-task allowance; INFERRED no new charge) · RECOMMEND A first, B only if A proves useful · GATE not auto-approved (new feature; B handles keys)

- **Why A:** it keeps what you liked and removes what was wrong. v1's panel keeps a visitor's key in the browser's
  local storage (VERIFIED in `index.html`), where any script that ever ran on the page could read it. A published
  brief needs no key at all, and because it is written only from the record it can be held to the charter by a
  check: every sentence cited, attribution verbs only, no fact added, no prediction, nothing said about which
  account is right.
- **Strongest objection:** a model-written summary is still a summary. Choosing which events to mention and in
  what order is a form of judgment, and on a site whose rule is "we do not judge" a daily brief could become the
  one place where a view creeps in. It also spends usage every day.
- **Answer:** the objection is real, and it is why this is a separate, later ruling and not part of v2's core. The
  guards: the brief is labelled as machine-written and kept apart from the record, as your own notes are; a
  validator rejects an uncited sentence or a verdict word; an independent reader checks the first weeks sentence
  by sentence; and you approve those weeks before it runs unattended. If it still reads as a view, choose C.
- **On B:** it meets your conditions on paper, but a key in a browser is a risk however carefully it is held, and
  the site gains nothing a reader could not get by pasting the record into their own AI tool. I would want A in
  use for a while before building it.

# 8. Default theme, and whether Classic keeps v1's side colours

**OPEN (new 2026-11-15).** v2 ships three themes: **Classic** (v1's look, upgraded), **Ops** (quieter, no glow)
and **Paper** (light). Anyone can switch in Settings. Two linked questions: which one a new visitor sees first, and
whether Classic keeps v1's habit of colouring markers by who acted.

**What v1 does (VERIFIED in `index.html`):** markers are coloured by actor: Israel red, US orange, Iran blue,
joint purple.

| Option | What it means |
|---|---|
| **A. Classic is the default; colour means theater (recommended)** | A new visitor sees v1's near-black ground, neon accents, Oswald and Share Tech Mono, with the glow. Markers are coloured by **which war** (amber for the Iran war), never by who acted. Ops and Paper are one tap away |
| B. Ops is the default; colour means theater | A new visitor sees the quieter look. Classic and Paper are one tap away |
| C. Classic is the default and keeps v1's side colours in the Iran-only view | As A, but when only the Iran theater is shown, markers are coloured by actor as in v1 |

**Card:** VALUE medium (first impression; nothing is locked in) · EFFORT none: one value in the config · CONFIDENCE medium for A over B; high against C · COST nominal · RECOMMEND A, **but decide on the prototype** · GATE not auto-approved (it is the face of the site, and yours to choose)

- **Why A over B:** your direction on 2026-11-11 was to target the current look and raise its quality. Classic is
  that. It is also what your testers have already seen. Ops is my design, and I should not make my own taste the
  default over your stated one.
- **Why not C:** three reasons. (1) Under the charter the fill of a mark shows who has spoken; a second colour
  code for who acted puts two meanings on one mark, and red-for-one-side reads as taking a side. (2) It cannot
  extend: four theaters have dozens of actors and no colour set that stays readable. (3) Where accounts dispute who
  did it, a side colour would be the site choosing (ruled item a: "who did it" is derived from the entries and may
  be `unclassified`). Who acted is on every card in words, and a lens shows any party's account.
- **Strongest objection to A:** Classic is louder. Its glow and neon sit uneasily with the restraint rules that
  keep the map from looking like a conspiracy board, and its hot pink for the Caribbean sits close to the red of
  the error banner (difference 8.3 against a minimum of 8). On a Fire tablet at the Lite detail level its glow is
  capped anyway.
- **Answer:** the glow is on the chrome and on whichever mark you have selected, never on a mark because of its
  look, so a theme cannot make one kind of account stand out more than another. Every Classic colour passes the same computed checks as
  Ops. But "louder" is a matter for the eye on a real screen, which is why the prototype shows all three and this
  can wait for it. Changing the default later is one value and affects only people who have never chosen.
- **A finding you should know:** the four theater colours in the earlier design were described as colour-blind
  safe and that had not been measured. A computed check on 2026-11-15, using a standard simulation of colour
  blindness, found two pairs that came out nearly identical. All three themes now use re-tuned colours that pass, and no theme is accepted without the check. Shape
  still does the guaranteed work.

# 9. When a ghost becomes solid

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
| Typefaces: IBM Plex Sans for all reading text; Plex Condensed and Plex Mono in Ops and Paper; Oswald and Share Tech Mono in Classic; all self-hosted | DESIGN_SYSTEM 1 | Cyrillic coverage for the RU theater (Share Tech Mono has none: checked 2026-11-15; it falls back to Plex Mono); no third-party font call |
| Theater = colour **and** shape (circle, diamond, triangle, hexagon) | DESIGN_SYSTEM 2.2 | Hue alone fails in sunlight, in greyscale and for some colour-blind readers (amber and blue differ in brightness by only 1.30:1 in Ops and 1.04:1 in Paper); shape keeps them apart |
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

**Added by the theme session (2026-11-15). Design calls; none grades a claim.**

| Call | Where | Why |
|---|---|---|
| A theme can change colours, typefaces, corners, glow, density, motion and panel opacity, and **nothing about what a mark means** | DESIGN_SYSTEM 12 | The theme file has no field for shape, size, look or wording, so a theme cannot change them even by mistake |
| A theme is accepted only if it passes a computed check: contrast for every text and mark, and the four theater colours told apart with and without colour vision | DESIGN_SYSTEM 13.3 | No theme, built-in or user-made, can make a ghost unreadable or two wars look alike |
| An imported theme is data: fixed choices, numbers and six-digit colours only; unknown fields rejected; a theme link opens as a preview you keep or discard | DESIGN_SYSTEM 13.2 | Your security rule: no imported text ever becomes markup, a style or a web address |
| The theater colours were re-tuned in all three themes; the compare pair in the dark themes is now violet and sand | DESIGN_SYSTEM 2.2, 14 | The earlier set failed the colour-vision check |
| A theme's glow touches the chrome and the selected mark only, never a mark because of its look | DESIGN_SYSTEM 12.2 | Otherwise a theme could make one kind of account stand out more |
| Map style is a setting separate from the theme; on satellite every mark gets a dark outline and halo | DESIGN_SYSTEM 15 | So Classic can be read over imagery and Paper over a light map |
| Three detail levels (Lite, Standard, Full), picked by a two-second draw test, changeable in Settings, stepped down only if you accept the offer | ARCHITECTURE 9.4 | Section 3b. The Standard and Full numbers are my proposals, unmeasured |
| Detail never changes what can be reached; events are never thinned, only tracks and labels | ARCHITECTURE 9.4.4 | Enforced by a test, not by intention |
| Theme, map style and detail level are not carried in a shared view link | ARCHITECTURE 9.1 | A link shares what is shown, not how the sender's device dresses it |
| Clean view keeps a small **view tag** beside the lens tag: the period, the record date, and any record layer that is switched off ("FOG HIDDEN") | LAYOUT 2.5 | My addition: with the controls hidden, a screenshot would otherwise not say which period it shows or that one-sided accounts were switched off |
| Phone landscape offers the 2D map and a zoomed-out globe with labels off; 2D opens first until you choose | LAYOUT 4.2 | The globe is unmeasured on any device |
| Three themes until cutover; the theme studio is its own small optional slice behind a URL flag | RELEASE_PLAN rule 11, S2b | Keeps device testing to three passes |
| A first-run tour that is offered, never forced, and replayable from Help | LAYOUT 8d | Your 2026-11-11 direction, for readers who are not you |

# What changed in v1.3 (2026-11-15, theme session)

- **Decision 8** is new: the default theme, and whether Classic keeps v1's side colours. It is the ninth and last
  decision this file may hold.
- **Decision 7** is reworded around your AI direction. Its ruling (A: leave the v1 panel out of v2 for now) is
  unchanged. The follow-on choice (a daily brief after cutover) is recorded with a recommendation and asked at cutover.
- Fourteen theme-session design calls are listed above for veto.
- Three points from the independent charter check are added to item d, to judge on the prototype (see the item d row).

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


# Rulings on the charter-check items (Allan, 2026-11-14, "as recommended")

| Item | Ruling | Build note |
|---|---|---|
| a. Record-level "who did it" and "kind" | **DECIDED:** derive from the entries; allow `unclassified` when accounts differ | Shapes published in S1 cannot be renamed later: S1 stores the entry-derived form only (typed fields optional and unused), carries a `schemaVersion`, and ships a migration script; re-run the dry run before merge |
| b. Outlet ownership | **DECIDED:** ownership carries its own source; rename `independent` to "no state or party owner on file" | Same version-number rule as (a); do it in S1 before enrichment; keep the old value as a read alias for one version |
| c. Dropping a source | **DECIDED:** only when shown not to have issued what we attribute to it (impersonation, forgery) | Tombstones keep history |
| d. "ONE SIDE" chip, "On the record" and "clean map" wording | **CONFIRM AFTER PROTOTYPE**, together with decision 6 | Added 2026-11-15 from the independent charter check, same timing: (d1) a milestone more than one side has spoken on gets a halo and a label, a one-sided one gets neither, so it is more prominent: keep, or give every milestone the same halo? (d2) the faintest marks, "not yet attributed" and the faded ghost, are allowed under 3:1 contrast (2.3:1 and 2.5:1), and "not yet attributed" is most of the Iran map at launch: keep, or require 3:1 for every look (Paper would need heavier strokes)? (d3) a group badge is drawn filled if any member has more than one side on record, so one such mark among forty ghosts reads as filled: keep, or show the one-sided count on the badge? |
| e. Tracks labelled OBSERVED above claims | **No change** | |
| Follow-up v1 PR for the other ~20 "confirmed"/"verified" wordings | **Yes, later**, its own small PR | After S1 |

Hard-to-reverse points and their mitigations (listed to Allan 2026-11-14): the S1 record shapes; the outlet registry rename; entries about named parties once public (run the record check first, publish a small reviewed batch first); `IR-` IDs (keep `legacyId`, resolver accepts both); and the v1 cutover (keep v1 preserved and deployable until v2 has run beside it with Allan's sign-off). Decision 9 changes old marks retroactively, so settle it on the prototype before sharing the site.
