---
title: WARMAPS v2 — common brief for every v2 session
version: v1.2 (2026-11-12: editorial charter; R1 done; section 3b direction for fog, lenses, detail and screen size)
date: 2026-11-11 (Iran-war Day 257); amended 2026-11-12 (Day 258)
author: Claude (Fable 5.2), end of session F1 day 2, for Allan Sanceau; v1.1 by Claude (Opus 5.5)
status: STANDING — every SESSION_PROMPT_* file in this folder tells the session to read this first
branch: v2/f1-architecture (draft PR #17) until Allan merges it; then `main`
---

# 0. Read this first (one screen)

- **Editorial charter (ruled by Allan 2026-11-12, in `STATE.md`): WARMAPS reports who said what, with sources, from
  every side, and lets readers judge. It never rules on whether a claim is true.** No field, badge, colour or score
  grades truth. A dispute or a "disinformation" label is a claim with an author and a source. Where any design document
  says `confirmed`, `documented` or "confidence" about a claim, the charter wins: flag it, do not build it.
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
| Editorial charter | `STATE.md` (2026-11-12). Record attribution, not truth: claimed by, denied by, acknowledged by, carried by, sides heard, sides missing, each with a source. Fog when a directly involved side has not been heard. We check that a claim was really made and that the source says it, never whether it is true. Drift is `KNOWN_FAILURES.md` F-010 |
| Charter check (end of every session) | Before your last push, write one line in your reply to Allan and in `F1_PROGRESS.md`: "Charter check: nothing added grades truth", or list what does and stop for his ruling. An independent checker repeats the check |
| Sources | Sourcing and access rule v2 in `STATE.md`: all sides kept, attributed and labelled; never defeat a block or paywall; note the gap |
| Security | No keys, tokens or personal data in the repo, in prototypes, in exported files or in share links. Imported files are data: validate against fixed choices; never use an imported string as markup, style or a web address. Raise security concerns when you see them |
| Independent checking | The agent that checks work did not produce it |
| Reply style to Allan | He reads on a phone: conclusions first, short, plain. Timestamp at the start of a new chat (day, date, time MST) |

# 2. Where things stand (2026-11-11)

| Item | State |
|---|---|
| Part A documents | Done: `ARCHITECTURE_v1.md` (v1.1), `DESIGN_SYSTEM_v1.md`, `LAYOUT_ENGINE_SPEC_v1.md`, `RELEASE_PLAN_v1.md`, `F1_DECISIONS_FOR_ALLAN.md` |
| Schema dry run | Done: `research/v2-schema-dryrun/` (`REPORT.md`). 600/600 events pass the v1.1 schema; its numbers are the acceptance test for the slice-1 migration |
| Independent schema review | Done 2026-11-11: `research/v2-schema-review/REVIEW.md` (read its 2026-11-12 addendum under the charter) |
| Editorial charter | Ruled 2026-11-12 (`STATE.md`). The truth-grading parts of the v2 design carry a banner; F1b rewrites them |
| F1b-1 attribution, fog and lenses | Not started. `SESSION_PROMPT_F1b1_attribution_fog_lenses.md` |
| F1b-2 themes, detail levels, screen size | Not started; after F1b-1. `SESSION_PROMPT_F1b_theme_amendments.md` (v1.2) |
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
| Help | Wants a legend, a demo at first use that can be replayed from Help, and the existing Help extended to explain the legend, the design philosophy and how the site assigns its marks (2026-11-12: under the charter the marks show who says what, not how true it is) |
| Data | He confirms the thin stretch (about 25 Apr to 17 Jul 2026): partly a period when he was not working on WARMAPS, partly data not brought up to the current model. Backfill is later work. He already knew some day labels are off by one |
| Independent review | "I agree with your recommendation, so let's do that" (RULED: do one bounded independent review of the schema before slice 1) |
| Working method | Prompt him for model and thinking effort before each step; use cheaper models wherever they are enough; carry work into fresh chats that pull context from the repo |

# 3b. Direction agreed 2026-11-12 (provisional until Allan has tried the prototype)

**Allan's words (OBSERVED, lightly cleaned of phone-typing errors):**
- "The fog essentially shows up as ghosts ... less solid ... and then as more information is gathered they solidify,
  move into position." No "huge dot on the map with everything as fog thrown into that dot".
- "I want it to look nice, I want it to be functional, I want my cake, and I want to eat it too."
- Points of view: "what's the view look like from the Iranian point of view, or Hezbollah, or US, Israel", "not
  propaganda claims, simply things that ideally can be verified easier, a strike: where was it, what was said".
- 3D: "all of this will have to exist on the 2D map and then move into 3D", with the planes, satellites and other
  God's Eye View layers.
- Devices: it should work on his Fire HD 10, but "if that is going to skew everything else, I don't want it to"; a
  full-fidelity view on PC, where most users will be. Modular, so parts can be tweaked or redesigned later. "I haven't
  seen anything yet": a mock-up comes before implementation.
- Screen size is separate from complexity: his S22 is powerful; the limit is screen size. He wants phone landscape;
  a zoomed-out globe may suit the phone better than a labelled map; a header plus a side window does not work on the
  phone; the map must be able to look very clean when wanted.
- **Rulings, PROVISIONAL (confirm after the demo):** (1) the map opens on the last 7 days and can be widened to any
  range or the whole war; (2) a one-sided claim stays standard size until another side is on record; (3) look-again
  checks at 1, 3, 7 and 30 days.

**Design direction agreed for the prototype (Claude's proposals, accepted by Allan 2026-11-12 "Okay, let's go"):**

| Topic | Direction |
|---|---|
| Four looks | **Ghost**: one side on record; thin see-through outline in the theater colour, no glow, standard size. **Solid**: more than one side on record and they agree it happened; full size for its tier. **Split**: more than one side on record and they disagree (a denial makes it split, never solid). **Faded ghost**: still one side after the last look-again check; the card says "Unresolved: no account from X as of [date]". Hue = theater, size = tier (with the cap above). Never a truth grade: solid means "the sides agree", and the legend says exactly that |
| One happening, one record | Every claim, denial and outlet about a happening attaches to one record as a dated **entry**: who, their side, stance (claims, denies, acknowledges), date published, location if they give one, figures, source. A statement naming many targets is one record listing them; targets show as small ticks only when it is opened. Only claims with a stated place go on the map; claims with no place go in that side's list |
| Location history | The marker sits at the most specific location on record; the card says who placed it and when. If sides name different places, the marker stays at the claimed target and the others appear, on tap, as small linked ghosts labelled by who said so. No uncertainty circles on the map |
| Fog layer | Two one-tap layers: **On the record** (solid and split) and **Fog** (ghosts). Both on by default, ghosts faint. Fog off = a clean map of what more than one side has said; fog only = where information is missing. A **Contested** filter shows every split marker. Filters count sides heard, never which side |
| Lifecycle | A new claim is matched to an existing happening (Allan approves merges; a split is always possible) or opens a new one, drawn as a ghost; the card names the missing side. Look-again checks at 1, 3, 7, 30 days search the missing side's outlets (the nightly task, batched per outlet). New entries are appended after approval. Nothing is deleted: a claimant changing a figure or withdrawing is a new entry; only our own mistakes are removed, leaving a tombstone. v1's 15 `fogCheckpoint` dates were the seed of this |
| Timeline | Opens on the last 7 days as a band on the full-war timeline; drag the band to move it, drag its edge or tap All to widen. Older events drawn fainter in long ranges. A switch: **Record today** (default; each event as the record stands now) or **As known then** (each event as it stood on the slider date). Play in As known then shows ghosts appear, solidify, move into place, split or fade. Needs every entry's publication date (`published` becomes required) |
| Status line | One line on every card: "On record: Israel, Iran · Missing: Hezbollah · Agree it happened; disagree on damage · Satellite images: 1 (published by X)". No score, no percentage, no graded colour |
| Lenses | "Lens: All" (default) or one or more **parties from the actor registry**, never pre-built blocs (Iran's government and the Iranian opposition are separate; Hezbollah is separate from Iran). A lens shows only that party's entries, at the location that party gives, so markers move when the lens changes. **Compare two**: agree = solid; only one spoke = ghost on that party's half; conflict = split with one half per party. Compare mode alone uses two neutral, non-national colours plus left/right halves. A persistent banner: "Showing X's account only, not WARMAPS's view · N other accounts hidden · accounts on file: N", carried on share links and screenshots. Lens buttons in neutral alphabetical order. **No left-right slider**: a line forces many parties into two camps and the points between mean nothing. A state-affiliated outlet's own unsourced report is filed under that outlet, labelled state media, grouped with its side |
| 3D | All of the above lives in the core store; both renderers draw the same filtered state (ARCHITECTURE 9.2). Events stay on the surface; height is used only for real altitude. Aircraft, vessel and satellite tracks stay OBSERVED: grey, own shapes, today only, one tap, no ghost or solid looks. Ghosts on imagery get a dark keyline. The renderer contract's link `confidence` is renamed under the charter |
| Detail levels | **Lite / Standard / Full**, picked automatically by a two-second draw test plus browser hints, remembered per device, changeable in Settings; on sustained low frame rate the app offers (never forces) a step down. One config file holds the limits per level: ARCHITECTURE 9.4's Fire budget becomes the Lite column; the PC gets Full (terrain, full resolution, more tracks, effects). **Detail changes how things are drawn, never what can be reached** (enforced by a test); where Lite thins tracks it says "showing N of M". Each module states what it does at each level; Lite never downloads Full-only code |
| Screen size | A separate, automatic axis. Layout comes from viewport and pointer (already in the layout spec). Decluttering is computed in screen pixels: grouping, labels and track thinning per screen area, so a small screen groups more and zooming separates; independent of detail level. Milestones never group; the Events list shows everything in the window. Samsung DeX on the S22 gets a desktop layout with the phone's detail level |
| Clean view | One tap hides the rail, timeline and buttons, leaving the map or globe edge to edge; a corner button restores them. When a lens is on, a small lens tag stays visible |
| Phone landscape | Kept and tested (designed for about 300 px of height). The prototype offers both 2D and a zoomed-out globe with labels off; Allan picks the default after trying them |

# 4. Design positions Claude proposed on 2026-11-11 (NOT ruled; Allan has read them and not objected)

| Topic | Proposal |
|---|---|
| Theme engine | Built into the app: a small engine every visitor gets (applies one theme config), plus an editor ("studio") that loads only when opened, behind a URL flag. Not a separate app. The theme format is a plain versioned config file |
| What a theme may change | Colours (from curated, pre-checked swatches), theater colour sets (pre-validated sets of four), fonts (short bundled list), icon stroke weight and outline/filled, corner radius, glow, density, motion level, panel translucency |
| What a theme may never change | The visual grammar: shape and hue = theater, size = tier, fill and line style = attribution state (who has spoken; replaces "confidence" under the 2026-11-12 charter; F1b defines it). Contrast minimums. 48 px touch targets. A validator rejects a theme that breaks these |
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
| F1b-1 attribution, fog and lenses (charter rewrite + section 3b) | Fable 5.2 | High | Fresh chat; documents only |
| F1b-2 themes, detail levels, screen size | Fable 5.2 | Medium (Allan decides) | Fresh chat after F1b-1; documents only |
| F1c prototype | Fable 5.2 | High | Fresh chat, started right after a usage refill; two sittings (build, then five-form-factor review) |
| S1 slice 1 build | Opus 5.5 | High | Independent Haiku 5.5 check; needs decisions 1-3 |
| E1 backfill pass 3, enrichment | Sonnet 5.5 | Medium | Different agent verifies; needs Allan's authorisation to change live data |
| F2, F3, F4 | Fable 5.2 | Per RELEASE_PLAN section 7 | Short touchpoints later |

How to start any of them: open a new chat with the model above, repository WARMAPS, and send one line:
`In the WARMAPS repo, check out branch v2/f1-architecture, read docs/v2/<prompt file> and follow it.`
(After PR #17 is merged, drop the branch part.)
