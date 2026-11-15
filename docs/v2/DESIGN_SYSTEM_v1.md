---
title: WARMAPS v2 — Design System v1 (visual identity)
version: v1.2 (2026-11-15: split into a fixed grammar and a theme-set skin; theme contract, three built-in themes with computed checks, map styles, detail levels; theater colours re-tuned after a colour-vision check. v1.1, 2026-11-13: the visual grammar rewritten under the editorial charter)
date: 2026-11-15 (Iran-war Day 261)
author: Claude (Fable 5.2), sessions F1, F1b-1 and F1b-2, for Allan Sanceau
status: DRAFT FOR RULING — tokens are final enough to build the prototype against
companions: ARCHITECTURE_v1.md (v1.3), LAYOUT_ENGINE_SPEC_v1.md (v1.2); reference check `research/v2-theme-check/`
---

> **Editorial charter (STATE.md, 2026-11-12) governs this document.** No colour, fill, line, badge or word here
> says how true a claim is. The marks show **who has spoken**: one side, more than one, whether they agree, and
> who has not been heard. A change that makes a mark mean "confirmed" or "doubtful" is `KNOWN_FAILURES.md` F-010.

# 0. Read this first (one screen)

**The look in one sentence:** a dark operations chart where the data is the only thing that glows, and where who
has spoken, and who has not, is visible before a single word is read.

**How this document is organised (new in v1.2).** The design is two things, kept apart:

| Part | What it is | Who can change it | Where |
|---|---|---|---|
| **Grammar** | What every mark *means*: the four channels below, the shape per theater, tier sizes, the four looks, arc line styles, contrast minimums, touch targets, the restraint rules | Nobody at run time. Only a new version of this document, ruled by Allan | Sections 0-11, summarised in 12.1 |
| **Skin** | How it is *dressed*: colours, typefaces, corner radius, glow, density, motion level, panel translucency | A **theme**, which is a small data file checked by a validator before it is used | 12.2 (the tokens), 13 (the contract), 14 (the three built-in themes) |
| **Map style** | Which basemap sits under the data | The user, as a setting separate from the theme | 15 |
| **Detail level** | How much drawing effort the device spends | Picked automatically, changeable in Settings | 16 (looks); ARCHITECTURE 9.4 (budgets) |

A theme may restyle a mark. It can never change what a mark means, and it can never reach the grammar: the theme
file has no field for it (13.2). Three themes ship: **Classic** (v1's look, upgraded), **Ops** (the quieter look
this document was first written around) and **Paper** (light). Which one is the default is decision 8.

**Four visual channels, each carrying exactly one meaning. They never share.**

| Channel | Carries | So you can read at a glance |
|---|---|---|
| **Hue + shape** | Theater | Which war |
| **Size** | Tier (milestone / major / standard), capped for one-sided claims | How much it matters to the story |
| **Fill and outline** | Who has spoken: ghost, solid, split, faded ghost (2.3) | Whether one side or more is on record, and whether they agree |
| **Line style and width** (arcs) | Who affirms and who denies a link; how many separate voices lately | Who stands behind a connection, and how much it is being talked about |

Rules that follow from this:
- Colour never means "good side / bad side". v1 colours markers by actor (Israel red, US orange, Iran blue, joint purple; VERIFIED in `index.html`, and its popup badges use a second, different set). That scheme is retired in the map layer.
- Fog is drawn as **absence** (a thin, see-through outline), not as a warning colour. A one-sided account looks less solid, not more alarming, and it solidifies when another side speaks. There is never one big "fog" blob: every claim keeps its own place and its own mark.
- No mark, colour or word grades truth. "Solid" means the sides on record agree it happened; the legend says exactly that.
- Everything that is OBSERVED rather than curated (aircraft, ships) uses a separate neutral colour and its own shapes, so a transponder blip can never be mistaken for an event.
- Nothing pulses, blinks or streams by default. Motion is reserved for the user's own action and for time itself.

**What changes from v1 (VERIFIED from `index.html`, re-read 2026-11-15):** v1 uses Share Tech Mono + Oswald from
Google Fonts, a near-black ground `#060a0f`, and side-coded neon accents. v2 keeps the near-black ground, and the
Classic theme keeps v1's typefaces and neon feel. What v2 replaces in every theme is the *meaning* of colour.

All contrast ratios and colour differences in this document were computed, not eyeballed: the three theme files in
`research/v2-theme-check/themes/` were run through `theme-check.js` on 2026-11-15 (78 computed checks each, all
pass; `out-table.txt` holds every figure). They are VERIFIED arithmetic on the hex values. Ratios are rounded
**down**. How the themes look on the S22 and the Fire panel is untested until the prototype (Part B).

---

# 1. Typography

## 1.1 Font slots and families
The grammar fixes three **slots** and what each is for. A theme chooses the family for a slot from a short bundled
list (12.2); it cannot name any other font.

| Slot | Used for | Bundled choices | Notes |
|---|---|---|---|
| `ui` | UI and reading text | **IBM Plex Sans** (only choice) | Open licence (OFL). Covers Latin and Cyrillic, which the Russia-Ukraine theater needs. Sturdy at small sizes on a phone. Reading text is not themeable: legibility is grammar |
| `display` | Headings, panel titles, dense labels | **IBM Plex Sans Condensed** (Ops, Paper) · **Oswald** (Classic; v1's display face) | Both condensed; both cover Cyrillic |
| `data` | Dates, day numbers, coordinates, IDs, counts | **IBM Plex Mono** (Ops, Paper) · **Share Tech Mono** (Classic; v1's face) | Tabular figures so the date readout does not jitter while scrubbing |

**Cyrillic check (done 2026-11-15, replaces the INFERRED note in v1.1).**
- **VERIFIED:** Google Fonts serves Share Tech Mono as one subset only, `latin`. The font file it serves maps 216
  characters and **none** in the Cyrillic blocks (U+0400 to U+052F); the highest is U+2215. Checked by reading the
  file's character map with fontTools.
- **VERIFIED:** Oswald and IBM Plex Mono are both served with `cyrillic` and `cyrillic-ext` subsets.
- **INFERRED:** the Share Tech Mono master file has no Cyrillic either (Google publishes a Cyrillic subset when a
  font has one). The master file itself was not read: its repository is outside this session's access.
- **Consequence, in force:** in Classic the `data` slot's font stack is `"Share Tech Mono", "IBM Plex Mono",
  monospace`, so a Cyrillic character falls through to Plex Mono glyph by glyph. Share Tech Mono is used only where
  the text is digits and short Latin labels. Russian and Ukrainian place names are set in the `ui` slot in every theme.

- **Self-hosted** WOFF2 subsets in `v2/assets/fonts/` (Latin + Cyrillic; Plex weights 400, 500, 600; Plex Mono 400,
  500; Oswald 400, 600; Share Tech Mono 400, Latin only). Oswald and Share Tech Mono are published under the OFL
  (INFERRED from their Google Fonts listings; read the licence files at build). A font loads only if the active
  theme uses it. No
  call to Google Fonts: one less third party, no layout shift waiting on a remote stylesheet, works on a poor connection.
- Fallback stack: `"IBM Plex Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`. The layout must hold
  with the fallback (no fixed-width assumptions).
- Arabic, Hebrew and Persian place names appear rarely and only inside text; they fall through to the system font.
  Right-to-left runs are isolated with `dir="auto"` on source titles.

## 1.2 Scale (rem; root 16 px; all sizes scale with the user's font setting)
| Token | Size / line | Weight | Use |
|---|---|---|---|
| `text-display` | 1.5 / 1.2 | `display` 600 | App title, big stat numbers |
| `text-title` | 1.125 / 1.3 | `display` 600 | Panel and card titles |
| `text-body` | 1.0 / 1.5 | Sans 400 | Card text, descriptions. Never below this for running text |
| `text-label` | 0.875 / 1.3 | Sans 500 | Buttons, chips, list rows |
| `text-meta` | 0.75 / 1.3 | Sans 500, +0.02em | Source lines, captions. The floor: nothing smaller, anywhere |
| `text-data` | 0.875 / 1.2 | Mono 500 | Dates, counts, coordinates |
| `text-data-lg` | 1.25 / 1.1 | Mono 500 | Timeline cursor readout |

- The scale, weights and the `text-meta` floor are grammar: no theme changes a size.
- Upper case only for short labels of three words or fewer (`text-meta`, tracked). v1's all-caps paragraphs are retired
  in every theme, Classic included: they read slowly, and they read as shouting.
- Line length in cards: 45-75 characters; panels narrower than 320 px drop to a single column.

---

# 2. Colour

Token **names and roles** below are grammar. The **hex values** in 2.1, 2.2 and 2.5 are the Ops theme's, shown
here so the rules can be read against real colours; Classic and Paper are in section 14, and a theme may set any of
them within the limits of 13.3.

## 2.1 Neutral ground (values: Ops)
| Token | Hex | Role | Contrast |
|---|---|---|---|
| `bg-base` | `#070B10` | Page, sea on the map | — |
| `bg-surface` | `#0E1620` | Panels, cards, bars | — |
| `bg-raised` | `#162230` | Menus, hovered rows, sheets over panels | — |
| `border-hairline` | `#33475F` | Panel hairlines, dividers (decorative) | 2.07:1 on base; decorative only, no minimum. (v1.1 called this `map-border`; country lines now belong to the map style, 15) |
| `border-control` | `#5F7896` | Outlines of buttons, inputs, chips, slider track | 3.99:1 on surface, 3.53:1 on raised (meets the 3:1 rule for controls) |
| `text-primary` | `#E8EDF5` | Main text | 15.47:1 on surface |
| `text-secondary` | `#A9B6C8` | Supporting text | 8.84:1 on surface |
| `text-muted` | `#8494AA` | Meta, placeholders, status-line labels | 5.88:1 on surface, 5.2:1 on raised |
| `accent` | `#E8EDF5` | The active state of a control (selected tab, switch on), text links | 15.47:1 on surface. Colourless in Ops on purpose; Classic uses v1's cyan |
| `focus` | `#FFFFFF` | Focus ring (2 px + 2 px offset) | 19.8:1 on base |

The map's own land, sea and border colours come from the map style (15), not from the theme.

## 2.2 Theater identity: shape (grammar) and hue (skin)
The **shape** per theater is fixed. The **hue** is set by the theme, as a set of four that must pass the
colour-vision check in 13.3.

| Theater | Token | Marker shape (fixed) | Ops hex | Contrast on base (Ops) |
|---|---|---|---|---|
| Iran war | `theater-iran` | Circle | `#E6B43C` (amber) | 10.29:1 |
| Russia-Ukraine | `theater-ru` | Diamond | `#56ACE3` (sky blue) | 7.89:1 |
| East Asia | `theater-ea` | Triangle | `#7EEDCE` (mint) | 13.99:1 |
| Caribbean | `theater-cb` | Hexagon | `#DF7781` (coral) | 6.66:1 |

**CORRECTION to v1.1 (found 2026-11-15 by the theme check).** v1.1 called its four hues "colour-blind safe" on
the strength of the Okabe-Ito palette. That was assumed, not measured, and its green had been lightened from that
palette's. Run through a colour-vision simulation, the v1.1 set failed twice: green against rose scored 3.6 under
deuteranopia, the most common form of red-green colour blindness (minimum 10 on the scale in 13.3), and sky blue
against green scored 3.8 under the rare blue-yellow form (minimum 8) and 13.6 with full colour vision (minimum 15).
The four Ops hues above were re-tuned with the check running: the closest pair now scores 14.7 under red-green
colour blindness, 12.6 under blue-yellow and 18.9 with full colour vision. The lesson is in the contract: a theater
set is accepted on a computed check, never on the name of a palette. Limits of the check itself: it is a standard
simulation of complete colour blindness (the worst case), not a test with colour-blind readers (INFERRED to be a
fair guide; the shape cue is what is guaranteed).

**Why shape as well as hue (a finding, not a preference):** hue alone fails in greyscale, in bright sun on a phone,
and for someone with no colour vision. In Ops amber and sky blue differ in brightness by only 1.30:1; in Paper the
two are 1.04:1, almost identical. So each theater also owns a **shape**. Hue and shape always agree, and either
alone is enough.

Single-theater mode uses the same colour and shape, so nothing has to be relearned when switching to all theaters.

## 2.3 Who has spoken: the four looks (never a hue)
Drawn with fill and outline in the theater's own colour and shape. Readable in greyscale and with opacity ignored:
filled, hollow, half and dashed are four different shapes of ink. The look is **derived** from the record's entries
(ARCHITECTURE 3.4.2); nothing in the interface can set it.

| Look | When (ARCHITECTURE 3.4.2) | Fill | Outline | Size | Card chip |
|---|---|---|---|---|---|
| **Ghost** | One side on record; a directly involved side has not been heard | None (0%) | 1.25 px, theater colour at 85% opacity, continuous | **Standard, whatever its tier** (2.4) | ONE SIDE |
| **Solid** | The sides on record agree it happened | Theater colour, 100% | 1 px keyline in `bg-base` at 90% | Its tier | SIDES AGREE |
| **Split** | Someone on record denies it, or disputes who did it | Left half theater colour 100%; right half empty | 1.5 px, theater colour 100%, around the whole shape; a 1 px line in the same colour down the middle | Its tier, never under 10 px so the halves can be told apart | CONTESTED |
| **Faded ghost** | Still one side after the last look-again check | None | 1 px, theater colour at 60%, **dashed** (2 px on, 2 px off) | Standard | UNRESOLVED |

Interim state, not one of the four: **Not yet attributed** (records carried over from v1 whose claimant has not
been recorded; ARCHITECTURE 3.4.2 rule 3; decision 6). Flat fill in theater colour at 55%, no outline, no keyline,
its tier's size; chip NOT YET ATTRIBUTED. It disappears from the legend when no such record is in view. v1 records
that carry a v1 fog note draw as ghosts.

- **No glow, halo or label on a ghost or faded ghost.** A milestone that is still one-sided has no halo and no map
  label until another side is on record; its tick on the timeline is hollow.
- **No uncertainty circles.** Where sides name different places, the marker stays at the first claim and the other
  places appear only when it is tapped: each a ghost-style mark at 70% of standard size, joined to the marker by a
  1 px dotted line in `text-muted`, with a text tag naming who said so ("per Iran"). Further targets of a
  many-target statement are 3 px ticks in theater colour, shown only while the record is open.
- **On imagery** (satellite basemap, the globe's imagery): a ghost or faded ghost gets a 1 px keyline in `bg-base`
  at 80% on both sides of its outline, so a thin line survives on a bright background. Solid and split already
  carry a dark keyline.
- **Contrast (computed; Ops):** ghost outlines 5.06:1 to 10.16:1 on `bg-base` across the four theater colours.
  Faded-ghost outlines 3.03:1 to 5.46:1. Not-yet-attributed fills 2.69:1 to 4.71:1, with size and shape intact.
  The floors every theme must hold are in 13.3 (ghost 3:1; faded ghost 2.5:1; not yet attributed 2.3:1). The last
  two sit under 3:1 on purpose: they are the faintest marks by design, their dashes or flat fill carry the meaning,
  and the Events list states every record's look in words. Paper sits closest to these floors (14.3).
- **The opacities, strokes and dash pattern in this table are grammar.** A theme changes the colour they are drawn
  in, nothing else.
- The chip always carries words, and the **status line** under it (5A.2) carries the names. Shape is the fast read;
  the words are the sure read.
- Epistemic labels for non-event data are text chips in `text-meta`: **OBSERVED** (tracks), **SAMPLE** (prototype data).

**Legend wording (fixed strings; the legend never uses "confirmed", "verified" or "unconfirmed"):**

| Mark | Legend line |
|---|---|
| Solid | Solid = the sides on record agree it happened |
| Ghost | Outline = one side's account; a directly involved side has not been heard |
| Split | Half = someone on record denies it, or disputes who did it |
| Faded ghost | Dashed = still one side's account after our last check |
| Not yet attributed | Plain = carried over from the first version; who said it is not yet recorded |
| Footer, always shown | The marks show who has spoken, not what is true. WARMAPS records claims and their sources; it does not rule on them |

## 2.4 Tier (size)
| Tier | Diameter (phone / larger) | Extras |
|---|---|---|
| `milestone` | 18 / 20 px | Outer halo ring at 30% opacity; always labelled at close zoom; a tick on the timeline |
| `major` | 12 / 14 px | — |
| `standard` | 7 / 8 px | — |
| not rated (`null`) | 7 / 8 px | Same as standard. Tier is never guessed upward |

- **Size cap for one-sided claims (provisional ruling 2, 2026-11-12):** a ghost or faded ghost is drawn at standard
  size whatever its tier, and takes its tier's size the moment it becomes solid or split. Size counts how many accounts
  are on record, never how likely a claim is. Tier is a rating of importance to the story, never of truth.
- **Age in long ranges:** when the window is longer than 30 days, a marker's whole opacity is multiplied by 1.0 if
  its date is within 30 days of the window's end, 0.7 within 180 days, 0.5 beyond. In the default 7-day window
  nothing is faded. Age changes opacity only; it never changes fill, outline style or size, so an old solid event
  cannot be mistaken for a ghost.

The tap target is always 48 px regardless of drawn size (section 8). Where markers crowd, they cluster into a
count badge in the theater colour; a cluster containing a milestone keeps the halo. A cluster badge shows a count
only: it has no look of its own, and ghosts are never merged into one large fog mark. With the Fog layer on, a
cluster's badge is outlined rather than filled when every member is a ghost.

## 2.5 Other semantic colours
| Token | Dark hex | Use | Note |
|---|---|---|---|
| `link` | `#F0E442` (pale yellow) | All link arcs and link chips | 14.92:1 on base. One colour for every link (section 5). Difference from the amber theater colour 12.3 (minimum 8); arcs are lines and events are shapes, so form separates them too |
| `track` | `#9FB3C8` (cool grey) | Aircraft, vessels, satellites | Deliberately colourless: OBSERVED data must not look like an event |
| `selected` | `#FFFFFF` | Selection ring, timeline cursor | — |
| `state-error` | `#FF7A33` | The error banner only (app failures) | Renamed from `state-alert`, which v1.0 also used as a verdict colour on a tripwire. **No status of any record, link or watch item is ever drawn in it**, or in any other warning colour |
| `lens` | `#FFFFFF` | The lens banner's edge bar and the lens tag | Deliberately colourless: a lens is a way of reading, not a side |
| `compare-a` | `#B9A6F5` (soft violet) | Compare mode, left party (2.8) | 9.24:1 on base |
| `compare-b` | `#D8B4A0` (sand) | Compare mode, right party (2.8) | 10.29:1 on base. Was soft teal `#6FD3C1` in v1.1; changed because the re-tuned East Asia mint sat too close to it (difference 7.3, minimum 8) |
| `state-ok` | `#2BB894` | "Up to date", successful load | UI chrome only |

## 2.6 Light theme ("Paper")
For reading outdoors and for screenshots that will be printed or pasted into documents. Its full token table and
computed figures are in 14.3. Same shapes, same rules, same strokes.

On first visit the app uses the default theme (decision 8), unless the device asks for a light scheme, in which
case it opens in Paper; after that the user's choice is remembered. The globe and the satellite map style stay
dark-ground under every theme (space and imagery are dark); 15.3 says which colours the marks use there.

## 2.7 Token structure
Two layers in `v2/assets/tokens.css`: semantic tokens (`--theater-iran`, `--bg-surface`) and component tokens
(`--card-bg`). Components use semantic or component tokens only. The stylesheet holds the default theme's values, so
the page is correct before any script runs. A theme is a data file (13); the theme engine validates it and then sets
the semantic tokens, one validated value at a time. The Leaflet and Cesium renderers read the same tokens through
one small JS helper, so the map, the globe and the panels cannot drift apart.

---

## 2.8 Compare mode (two parties side by side)
Compare mode is the only place markers leave the theater colour. Each marker is drawn in two halves: **left = the
first party, right = the second**, in `compare-a` and `compare-b`. Shape still gives the theater.

| Case (ARCHITECTURE 3.4.6) | Left half | Right half |
|---|---|---|
| Both say it happened, same place | Filled `compare-a` | Filled `compare-b` |
| Only the left party has spoken | Outline only, 1.25 px `compare-a` at 85% | Not drawn |
| Only the right party has spoken | Not drawn | Outline only, 1.25 px `compare-b` at 85% |
| One says it, the other denies it or disputes who did it | Filled in the colour of the party that says it | Outline in the denier's colour with one 1 px diagonal stroke |
| Both say it, at different places | A filled half-marker at each party's place, joined by a 1 px dotted line in `text-muted` | |

- **Why these two colours:** neither is a national colour of any party in the four theaters, neither is red, blue
  or green in the partisan sense, and neither is a theater colour. They are close in brightness on purpose (1.11:1
  between them in Ops and Classic, 1.21:1 in Paper; the contract caps it at 1.5:1) so neither party looks more important. Because of that, colour is never the only cue: **position
  (left or right) and a letter (A, B) in the banner and the legend** carry the same meaning.
- The compare legend is one line: "A (left) = [party] · B (right) = [party] · filled = says it happened · outline =
  the only one of the two to speak · slash = denies".
- The two parties are listed in alphabetical order; A is simply the first. The user may swap them.

---

# 3. Space, shape, elevation
- **Grid:** 4 px base. Spacing tokens 4, 8, 12, 16, 24, 32.
- **Radius:** a theme picks one of three sets (12.2). *Standard* (Ops, Paper): 4 px on controls and chips, 8 px on
  cards and panels, 16 px on the top corners of bottom sheets. *Sharp* (Classic): 2, 4, 12. *Soft*: 8, 12, 20.
  Nothing is pill-shaped except toggle switches.
- **Elevation:** dark themes do not show shadows well, so depth is carried by surface colour (`base` → `surface` →
  `raised`) plus a 1 px hairline. One soft shadow is allowed, under sheets and floating panels.
- **Density:** two settings. *Comfortable* (touch; 48 px rows) is the default on coarse pointers; *compact*
  (36 px rows) is available on PC. A theme may ask for one; on a coarse pointer the answer is always comfortable,
  because the 48 px touch target is grammar.
- **Translucency:** bars that sit over the map use `bg-surface` at the theme's panel opacity (80% to 100%; Ops 88%)
  with a light blur where the device and the detail level allow it (16), falling back to opaque. Text is never set
  directly on map imagery.

---

# 4. Map and globe styling

## 4.1 2D map (Leaflet)
- **Basemap:** chosen by the **map style** setting (15), which is separate from the theme. The default style,
  Tactical dark, is the Esri World Dark Gray base without labels, then reference labels above the data at reduced
  opacity (as v1 does, VERIFIED). No key.
- **Theater outlines:** the AOI drawn as a 1.5 px line in theater colour at 60%, corner ticks, and a small label tab
  ("IRAN WAR · Day 256"). No fill. In single-theater mode the area outside the AOI is dimmed by 20%.
- **Label order (bottom to top):** basemap → outlines → context layers → link arcs → events → tracks → selection →
  place labels. Events always sit above arcs: what happened outranks what is connected.
- **Declutter:** at theater zoom, standard-tier events may collapse to clusters; solid or split milestones never do.
- **Fog layer look:** with **On the record** and **Fog** both on (the default), ghosts sit under solid and split
  marks in the draw order, so where they overlap, records with more than one side on record stay on top. Draw order counts accounts on record only; it says nothing about which account is right.

## 4.2 3D globe (Cesium)
- **Surface:** dark imagery tinted to the Tactical dark map style's land and sea colours (15.1) so the two views feel like one product.
  No terrain exaggeration, no photorealistic tiles, atmosphere at low intensity, a thin limb glow.
- **No HUD dressing.** No brackets, reticles, scan lines or "detection boxes": the GEV spec already excludes them
  because they imply a precision the data does not have.
- **Events** are flat screen-space symbols using the same shape, size and fill rules as 2D, so a diamond is a diamond
  in both views, and a ghost is a ghost. Events on the far side of the globe are hidden, not shown through it.
  Events stay on the surface; height is used only for real altitude (tracks).
- **Camera:** opens tilted over the home theater. "All theaters" eases back until both AOIs are in frame, which on
  a globe is exactly the picture this project exists to show.
- **Night side:** shown at the cursor's date and noon UTC, at low contrast, as orientation only.

## 4.3 Tracks (OBSERVED)
Aircraft are chevrons, vessels are hull outlines, satellites are small rings with a ground-track line. All in
`track` grey with a 1 px dark keyline. Each carries a time tag in its card ("OBSERVED 14:32 UTC · adsb.lol").
Vessels inside a GNSS-interference tint get a hatched ring and the words "inside a GNSS-interference zone reported by [provider]".
Tracks never take the ghost, solid or split looks: those belong to what people have said, and a transponder says
nothing. Today only, one tap away.

---

# 5. Link arcs (the anti-"conspiracy board" rules)

| Property | Encodes | Values |
|---|---|---|
| Colour | Nothing but "this is a link" | `link` yellow, always |
| Line style | Who has spoken (`lineState`, ARCHITECTURE 4.1) | **Solid** continuous: both actors say so and no one on record denies it · **Split** long dashes (8 px on, 6 px off): someone on record denies it · **Ghost** dots (1 px on, 5 px off) at 60% opacity: stated by others only, or by one of the two actors |
| Width | Separate voices that have affirmed it in the trailing window (ARCHITECTURE 5.6) | 4 steps: 1.5, 2.5, 4, 6 px. In range but no voice in the window: 1 px at 40% ("dormant") |
| Direction | `direction` | A taper (wide at the source, narrow at the target) plus one arrowhead at the midpoint. `both`: no taper, two arrowheads |
| Category | `category` | A small glyph at the arc's midpoint and in the legend; not colour |

Restraint rules, all enforced in the renderer:
1. **Off by default.** Links appear only when the user turns the layer on or opens the links panel.
2. **Bundling.** All links between the same pair of actors draw as one arc with a count badge. Tapping it opens the
   list. A single-theater view shows only links touching that theater.
3. **Cap.** No more than 12 arcs at once. If more qualify, the widest show, and the panel says "12 of N shown" with
   filters by category and by who has spoken (both actors · one actor · others only · denied by someone).
4. **One-sided links are visibly lighter.** Dotted, faint, and filterable with one switch ("Only links both actors
   affirm"). The filter counts who has spoken; it never picks whom to believe.
5. **No animation.** Arcs do not flow, march or pulse. Only the selected arc brightens. The time scrubber is the
   only thing that makes links change.
6. **Great-circle paths** in both views, arching above the surface on the globe in proportion to distance.
7. **Legend sentence, always shown with the layer:** "Line weight counts how many separate parties and observers
   have affirmed this link in the last 180 days. It is not a judgement of importance or of truth. Solid: both actors
   say so. Dashed: someone on record denies it. Dotted: stated by others, or by one of the two."

---

# 5A. Attribution components (new in v1.1)

## 5A.1 Attribution chip
Replaces v1.0's confidence badge. A chip in `text-meta` caps on `bg-raised` with a 1 px `border-control` outline and
a 10 px copy of the marker in its look at the left. Text: ONE SIDE · SIDES AGREE · CONTESTED · UNRESOLVED ·
NOT YET ATTRIBUTED. All five chips have the same colours; only the small mark and the words differ.

## 5A.2 Status line
One line under the chips on every card (text built by ARCHITECTURE 3.4.4).
- `text-meta`; labels ("On record:", "Missing:", "Also reporting:") in `text-muted`, names and clauses in
  `text-primary`; parts separated by a middle dot.
- **No colour coding, no icon per part, no score, no bar.** "Missing" is not red. Names are in alphabetical order.
- At peek it is one line and truncates at the end with "…"; expanded, it wraps freely. A screen reader reads it as
  one sentence.

## 5A.3 Lens banner and lens tag
- **Banner** (whenever a lens other than All is on): a strip directly under the top bar, `bg-raised`, a 4 px `lens`
  bar on its leading edge, a 1 px `border-control` line below. Text in `text-label`, `text-primary`:
  "Showing Iran's account only, not WARMAPS's view · 14 other accounts hidden · accounts on file: 31", then a text
  button "All accounts". In compare mode: "Comparing A: Iran (left) with B: Israel (right) · not WARMAPS's view ·
  12 other accounts hidden". The banner is never dismissible while the lens is on.
- **Lens tag:** a small chip, `bg-raised` at 92%, 1 px `lens` outline, `text-meta` caps: "LENS: IRAN" or "COMPARE:
  IRAN | ISRAEL". It sits inside the map or globe area at the bottom leading corner, above the attribution line.
  It is drawn whenever a lens is on, **including in clean view**, and because it is inside the stage it is in every
  screenshot. Shared links carry the lens, so the banner and tag reappear for whoever opens them.
- The lens button in the top bar shows a filled dot in `lens` when a lens is on.

## 5A.4 Timeline band and record switch
- **The 7-day band** on the overview row: `bg-raised` at 60% fill between two 2 px `selected` edges; each edge has
  a 12 x 28 px grip (48 px hit area). The chip beside it reads the range ("Last 7 days", "12 Oct to 13 Nov", "All").
- **Record switch:** a two-part segmented control, "Record today" | "As known then". While "As known then" is on,
  the cursor readout is prefixed "as known on" and the timeline bar carries a 2 px `selected` top line, so the mode
  is visible without reading.

---

# 6. Motion
| Rule | Value |
|---|---|
| Durations | 120 ms (press, toggle) · 200 ms (panel, sheet, card) · 320 ms (camera move between places) · 600 ms (2D↔3D and theater change) |
| Easing | Ease-out on enter, ease-in on exit. No bounce, no overshoot |
| What may move by itself | The timeline during Play; live tracks when they update; a single one-time fade when new data loads |
| What never moves by itself | Markers, arcs, badges, panels. No pulsing "live" dots, no ticker crawl by default |
| As known then, during Play | A marker changing look cross-fades over 200 ms; a marker changing place slides over 320 ms (it "moves into position"). While dragging, both are instant. With reduced motion, both are instant |
| Time scrubbing | Markers appear and disappear instantly while dragging (accuracy over smoothness); a 150 ms fade only during Play |
| Reduced motion | With the device's reduced-motion setting, all transitions become instant, camera moves cut, Play is replaced by step buttons |

v1's scrolling ticker does not come back as a default; a "latest" list in a panel replaces it. (Allan may overrule;
it would be a context layer like any other, one tap away.)

---

# 7. Icons
- **Set:** Lucide (open licence, ISC; confirm at build), 24 px grid, 1.75 px stroke, round joins. Inlined as one SVG sprite in
  `v2/assets/icons.svg`: no icon font, no network request.
- **Custom glyphs** (same grid and stroke) for what Lucide lacks: the 16 event kinds, the 6 link categories, the
  theater shapes, aircraft/vessel/satellite track shapes.
- Icons in the dock rail always have a text label on tablet and PC, and a label under the active item on the phone.
  An icon alone is never the only way to learn what a control does.
- No national flags as icons for actors or sides. Flags pull the eye, take sides, and get small-size ambiguity wrong.
  Actors are named in text.

---

# 8. Accessibility
Target: WCAG 2.2 level AA.

| Area | Rule |
|---|---|
| Contrast | Text 4.5:1 or better on every surface it can sit on (achieved across the three built-in themes: lowest is 4.86:1, Paper's muted text on a raised surface). Control outlines 3:1 or better. Marks: the floors in 13.3. A theme that misses any of these is rejected, so no user theme can lower them |
| Colour independence | Every colour meaning has a second cue: shape (theater), size (tier), fill and outline style (who has spoken), line style (links), left/right and A/B (compare), words (chips and the status line) |
| Touch targets | 48 x 48 px minimum, 8 px apart (v1 used 44). Small map markers get an invisible 48 px hit area; overlapping hits open a short chooser instead of guessing |
| Text scaling | Layout holds at 200% text size; panels scroll rather than clip |
| Keyboard (PC) | Everything reachable by Tab; arrow keys step the timeline; Escape closes the top surface; visible focus ring |
| Screen readers | The **Events list** panel is the equivalent of the map: same filter, same window, each row a full sentence ("12 September 2026, Haifa, Israel. Strike on refinery reported. One side on record: Iran. Missing: Israel. Major."). Map and globe canvases are labelled and point to it |
| Motion | Honour reduced-motion (section 6) |
| Language | `lang` set per text run; dates shown in one unambiguous format, `12 Sep 2026` |
| Errors | The error banner is a live region; it names the failed module in plain words |

---

# 9. Voice and wording
- Plain, neutral, past tense for events. No adjectives the sources did not use.
- **Attribution verbs only.** In WARMAPS's own voice a claimant *says*, *claims*, *reports*, *denies*,
  *acknowledges* or *withdraws*. WARMAPS's own voice never uses: confirmed, verified, proven, debunked, false, true,
  fake, alleged, credible, disinformation. Those words appear only inside a claimant's attributed statement ("X
  calls the report disinformation"), which is itself an entry with X's source (charter rule 8).
- Fixed vocabulary for the looks (the chip words and legend lines in 2.3) and for links (the legend sentence in 5).
- Titles describe what is being talked about in words no side on record would reject ("strike reported", not
  "destroyed").
- The words "merger", "merged" and "one war" are not in the product's vocabulary (ARCHITECTURE 4.2).
- Every number shows its as-of date when it has one ("4,383 · Health Ministry · 10 Sep 2026"), per the latest-figure ruling.
- Sample and prototype content is always stamped "PROTOTYPE SAMPLE - NOT REAL DATA" on the item itself, not only in a footer.

---

# 10. Component inventory (what the prototype and slice 1 must contain)
Top bar · theater filter (segmented, multi-select, "All") · 2D/3D switch · dock rail item · panel frame (title, pin,
move, close) · bottom sheet with detents · info card (event, link, track variants) · attribution chip · status line ·
tier dot · theater chip · entry row (claimant, stance, date, source, carriers) · lens button, lens banner and lens
tag · timeline (density strip, 7-day band, cursor, play, date readout, Record today / As known then switch) ·
layer switches On the record / Fog / Contested · layers menu row
(switch, state note, attribution) · watchlist row (two visually different tracks) · legend · error banner · empty
state ("No curated events yet for this theater") · toast.

Each is specified for behaviour in LAYOUT_ENGINE_SPEC_v1.md; this document owns only how it looks.

# 11. Open visual questions (answered by the prototype, not by argument)
1. Do amber and sky blue hold up on the Fire's panel in daylight, or does the shape cue have to do more work? (SPECULATION until seen.)
2. Decision 6: do the 473 "not yet attributed" v1 events read acceptably as plain marks beside 127 ghosts, or should all 600 be ghosts until enrichment?
3. Is 7 px too small for standard-tier dots on the S22 at arm's length?
4. Does the single yellow for links read as restrained, or as too uniform to scan?
5. Is a 7 px ghost ring (1.25 px line) visible on the S22 at arm's length and on the Fire in daylight, or does the ghost need a 9 px floor?
6. Does the half-filled split mark read as "contested" at 10 px in all four theater shapes (the triangle is the hard one)?
7. Do the two compare colours stay distinct on both devices, and is left/right plus A/B enough when they do not?
8. Decision 9: with the proposed rule for solid, how much of a real week of the Iran war is ghost, and does the map still look alive with Fog off?
9. Decision 8: Classic or Ops as the default, judged on the S22 and the Fire, not on a desktop monitor.
10. Does Classic's glow (level 2) survive on the Fire at the Lite detail level, where glow is capped at level 1 (16)?
11. Paper's faded ghost and not-yet-attributed marks sit at the contrast floor (2.55:1 and 2.32:1). Readable outdoors, or does Paper need a heavier dash?
12. Are the re-tuned mint and coral (East Asia, Caribbean) pleasant as well as distinct? They were chosen by measurement and have not been seen on a device.

---

# 12. Grammar and skin: the dividing line (new in v1.2)

## 12.1 Grammar: fixed for every theme
A theme file has no field for anything in this table, so a theme cannot change it, by accident or on purpose.

| Rule | Fixed value | Section |
|---|---|---|
| The four channels | Hue + shape = theater · size = tier · fill and outline = who has spoken · line style and width = who affirms a link and how many voices | 0 |
| Shape per theater | Circle (Iran war), diamond (Russia-Ukraine), triangle (East Asia), hexagon (Caribbean) | 2.2 |
| Tier sizes | Milestone 18/20 px, major 12/14 px, standard 7/8 px; the size cap for one-sided claims | 2.4 |
| The four looks and the interim look | Fill percentages, outline widths, the dash pattern, the half-fill, the opacities (85%, 60%, 55%), no glow or label on a ghost | 2.3 |
| Chip words and legend lines | The fixed strings in 2.3, 5 and 5A; the footer "The marks show who has spoken, not what is true" | 2.3, 5, 9 |
| Arc line styles | Solid, long dashes, dots; four width steps; one colour for every link; the cap of 12; no animation | 5 |
| Compare mode | Left and right halves, A and B letters, two colours close in brightness that are not theater colours | 2.8 |
| Tracks | One neutral colour, own shapes, never a ghost or solid look | 4.3 |
| No warning colour on any record | `state-error` is for the app's own error banner only | 2.5 |
| Type scale | Sizes, weights, the 0.75 rem floor, IBM Plex Sans for reading text | 1 |
| Contrast minimums | Text 4.5:1; controls 3:1; the mark floors in 13.3 | 8, 13.3 |
| Touch targets | 48 x 48 px, 8 px apart | 8 |
| Restraint | Nothing pulses, blinks or streams by default; reduced-motion honoured; no national flags; no HUD dressing | 0, 4.2, 6, 7 |
| The charter | No colour, fill, line, badge or word grades truth | header |

## 12.2 Skin: every token a theme may set, and its allowed values

| Token | Allowed values | What it changes |
|---|---|---|
| `base` | `dark`, `light` | Which ground the theme is built on; must agree with `bg-base` |
| `colors` (22 names, all required) | Each a six-digit hex colour, `#RRGGBB`. No other colour syntax. The set must pass every check in 13.3 | `bg-base`, `bg-surface`, `bg-raised`, `border-hairline`, `border-control`, `text-primary`, `text-secondary`, `text-muted`, `accent`, `focus`, `selected`, `lens`, `theater-iran`, `theater-ru`, `theater-ea`, `theater-cb`, `link`, `track`, `compare-a`, `compare-b`, `state-error`, `state-ok` |
| `fonts.display` | `plex-condensed`, `oswald` | Headings and dense labels |
| `fonts.ui` | `plex-sans` | Reading text (one choice: legibility is grammar) |
| `fonts.data` | `plex-mono`, `share-tech-mono` | Dates, counts, IDs. Share Tech Mono always falls back to Plex Mono for Cyrillic |
| `iconStroke` | `1.5`, `1.75`, `2` | Icon line weight in px |
| `iconStyle` | `outline`, `filled` | Dock and button icons only. Map marks are not icons and are untouched |
| `radius` | `sharp`, `standard`, `soft` | The three corner sets in section 3 |
| `glow` | `0`, `1`, `2` | 0: none. 1: the milestone halo and the selected mark get a soft bloom. 2: also the app title, active controls and the timeline cursor (v1's neon). **Glow never differs by look**, except the standing rule that a ghost has none; a theme cannot make one look glow more than another |
| `density` | `auto`, `comfortable`, `compact` | Row height. Coarse pointers always get comfortable |
| `motion` | `standard`, `calm` | Calm halves the durations in section 6 and cuts camera easing. The device's reduced-motion setting always wins over either |
| `panelOpacity` | `0.80` to `1.00` in steps of `0.01` | Translucency of bars over the map |
| `mapStyle` | One of the map style ids in 15.1 | The style this theme opens with. The user's own map-style choice, once made, wins |

A theme sets **all** of these; there is no inheritance and no partial theme. That keeps a theme file readable on
its own and makes the validator's job a closed checklist.

---

# 13. Theme contract (new in v1.2)

## 13.1 The file
One theme is one JSON file. Built-in themes live in `v2/themes/<id>.json` (ARCHITECTURE 6.1). The three built-ins
are ordinary theme files that go through the same validator as a theme a user makes.

```json
{
  "format": "warmaps-theme",
  "formatVersion": 1,
  "id": "ops",
  "name": "Ops",
  "base": "dark",
  "colors": { "bg-base": "#070B10", "bg-surface": "#0E1620", "...": "all 22 names, section 12.2" },
  "fonts": { "display": "plex-condensed", "ui": "plex-sans", "data": "plex-mono" },
  "iconStroke": 1.75, "iconStyle": "outline", "radius": "standard", "glow": 0,
  "density": "auto", "motion": "standard", "panelOpacity": 0.88,
  "mapStyle": "tactical-dark"
}
```
The complete files for the three built-in themes are in `research/v2-theme-check/themes/`; slice 2 copies them to
`v2/themes/` unchanged.

- **Versioned.** `formatVersion` is a whole number. The engine accepts the versions it knows and upgrades an older
  file through a written, tested step. A file with a newer version than the app knows is refused with "This theme
  needs a newer WARMAPS", never half-applied.
- **Fixed choices, numbers and colours only.** Every value is a member of a closed list, a number in a stated
  range, or a `#RRGGBB` colour. The only free text is `id` (lower-case letters, digits and hyphens, 32 at most) and
  `name` (letters, digits, spaces and `. , ' -`, 40 at most).
- **Unknown keys are an error**, not ignored. A file with one extra field is rejected.
- **A theme holds no keys, tokens, accounts or personal data**, and has no field that could hold one.

## 13.2 An imported theme is data
A theme can arrive from outside the repo: a file the user picks, or a share link. It is treated exactly as
ARCHITECTURE 9.1 treats every imported file.

| Rule | How it is held |
|---|---|
| Parse, validate, then rebuild | The engine parses the JSON, runs the validator, and then builds a **new** object from the known keys only. The original object is discarded |
| No imported string becomes markup, a style rule or a web address | Colours are applied one at a time with `style.setProperty(name, value)` after matching `^#[0-9A-Fa-f]{6}$`. Fonts and map styles are ids looked up in the app's own bundled table; a theme cannot name a font file or a tile server. `name` is shown with `textContent` only |
| Nothing is applied from a rejected file | The current theme stays; the message lists the failed checks in plain words |
| A link never changes the app silently | A theme in a share link opens as a **preview** with "Keep this theme" and "Discard". It is saved only on Keep |
| Size cap | A theme file is under 4 KB. Anything larger is refused before parsing |
| Storage | User themes are kept in this browser on this device (`localStorage`), 12 at most. There are no accounts. Export gives a `.warmaps-theme.json` file or a copyable link; Allan can send an exported file to be committed as a built-in |

## 13.3 What the validator checks
The reference implementation is `research/v2-theme-check/theme-check.js` (no dependencies; 78 computed checks per
theme). Slice 2 moves it to `tools/validate-theme.js`, where CI runs it on the built-in themes, and loads the same
module in the browser for imports and for the studio's live preview.

| Group | Check | Limit |
|---|---|---|
| Shape | Known keys only; closed lists; ranges; all 22 colours present and `#RRGGBB`; `base` agrees with `bg-base` | — |
| Text | `text-primary`, `text-secondary`, `text-muted` on each of `bg-base`, `bg-surface`, `bg-raised` | 4.5:1 or more |
| Text-like | `accent`, `state-error`, `state-ok` on `bg-surface`; `link`, `compare-a`, `compare-b` on `bg-base` | 4.5:1 or more |
| Controls | `border-control` on all three grounds; `focus`, `selected`, `lens`, `track` on `bg-base` | 3:1 or more |
| Marks | Each theater colour on `bg-base`: solid | 4.5:1 or more |
| Marks | The same colour as a ghost outline (85%), as a faded ghost (60%), as not yet attributed (55%), each composited over `bg-base` | 3:1 · 2.5:1 · 2.3:1 or more |
| Theater set | Every pair of the four theater colours: difference with full colour vision; under red-green colour blindness (the lower of protanopia and deuteranopia); under blue-yellow colour blindness (tritanopia) | 15 · 10 · 8 or more |
| Compare pair | Brightness ratio between `compare-a` and `compare-b`; their difference | 1.5:1 or less · 12 or more |
| No look-alikes | `compare-a`, `compare-b`, `link`, `track`, `state-error` against each theater colour | difference 8 or more |

- **Contrast** is the WCAG 2 relative-luminance ratio, rounded down to two places.
- **Difference** is the distance between two colours in OKLab, times 100. **Colour-vision simulation** is Machado,
  Oliveira and Fernandes (2009) at full severity, applied in linear RGB. Both are published methods; the limits
  above are mine, set where a tuned set of four can pass on a dark and on a light ground (INFERRED to be sensible;
  not validated against readers). They are one table in the validator and can be tightened.
- **What the validator does not judge:** whether a theme is attractive. It can pass an ugly theme. It cannot pass
  one in which a ghost is unreadable or two theaters look alike.
- **A rejection test is part of the reference:** a file carrying markup in `name`, `url(...)` as a colour, a web
  address as a font, an unknown key and an out-of-range number is rejected on shape before any colour is computed
  (VERIFIED 2026-11-15).

---

# 14. The three built-in themes (new in v1.2)

Cap: **three themes until cutover** (RELEASE_PLAN section 1). Every figure below is computed
(`research/v2-theme-check/out-table.txt`), rounded down.

## 14.1 Classic: v1's look, upgraded
**What v1 actually uses (VERIFIED, read from `index.html` on 2026-11-15):** ground `#060a0f`, panels `#0b1118`,
borders `#1a2535`, text `#e8edf5`, dim text `#6b7f99`, data text `#7ec8e3` (cyan), fonts Share Tech Mono and Oswald
from Google Fonts. Its most-used accent is yellow `#ffee00` (61 uses). Glow is everywhere: 76 `text-shadow` and
`box-shadow` rules. Markers are coloured by actor: joint `#9933ff`, US `#ff6600`, Iran `#1e90ff`, Israel `#ff1111`; the
popup badges use a second, different set.

| Kept from v1 | Changed, and why |
|---|---|
| Ground and panel colours, exactly | A third surface, `bg-raised` `#121B27`, added for menus (v1 had none) |
| Main text `#E8EDF5`; cyan `#7EC8E3` as secondary text and as the accent | Dim text `#6B7F99` (4.62:1 on panels; it fails 4.5:1 on a raised surface) lifted to `#7F93AD` |
| Border colour `#1A2535`, as the decorative hairline | It is 1.23:1 on panels, far under the 3:1 a control outline needs. Control outlines use `#5C7A9C` |
| Oswald for headings; Share Tech Mono for data | Reading text moves to IBM Plex Sans; all-caps paragraphs are gone; nothing under 0.75 rem (v1 goes down to 8 px) |
| Yellow `#FFEE00`, now the link colour | — |
| The neon feel: glow level 2, sharp corners | Glow follows the rules in 12.2: never on a ghost, never different by look |
| Amber `#FFAA00`, from v1's palette, for the Iran war | **Actor colour-coding is not kept** (proposal; decision 8). Colour means theater in every theme |

| Token | Hex | Computed |
|---|---|---|
| `bg-base` / `bg-surface` / `bg-raised` | `#060A0F` / `#0B1118` / `#121B27` | — |
| `border-hairline` | `#1A2535` | 1.29:1 on base; decorative |
| `border-control` | `#5C7A9C` | 4.45 base · 4.26 surface · 3.89 raised |
| `text-primary` | `#E8EDF5` | 16.88 · 16.12 · 14.74 |
| `text-secondary` | `#7EC8E3` | 10.64 · 10.16 · 9.29 |
| `text-muted` | `#7F93AD` | 6.31 · 6.03 · 5.51 |
| `accent` | `#7EC8E3` | 10.16 on surface |
| `focus`, `selected`, `lens` | `#FFFFFF` | 19.84 on base |
| `theater-iran` | `#FFAA00` (neon amber) | solid 10.39 · ghost 7.64 · faded 4.21 · not yet attributed 3.70 |
| `theater-ru` | `#2AA4FF` (electric blue) | 7.42 · 5.58 · 3.26 · 2.93 |
| `theater-ea` | `#7DFFB0` (neon mint) | 15.88 · 11.44 · 6.02 · 5.21 |
| `theater-cb` | `#FF5C8A` (hot pink) | 6.75 · 5.10 · 2.98 · 2.68 |
| `link` | `#FFEE00` | 16.52 on base; nearest theater colour 15.8 away |
| `track` | `#8FA8C8` | 8.13 on base |
| `compare-a` / `compare-b` | `#B9A6F5` / `#D8B4A0` | 9.29 / 10.35 on base; 1.11:1 between them |
| `state-error` | `#FF4444` | 5.56 on surface; nearest theater colour (hot pink) 8.3 away, the tightest margin in this theme (minimum 8) |
| `state-ok` | `#22CC55` | 8.88 on surface |

Theater set: closest pair with full colour vision 22.8; under red-green colour blindness 14.2 (amber and mint);
under blue-yellow 14.3. Other: `display` Oswald, `data` Share Tech Mono (Plex Mono for Cyrillic), icon stroke
1.75 outline, radius sharp, glow 2, panel opacity 0.92, map style Tactical dark.

## 14.2 Ops: the quiet chart
The look sections 2 to 5 were first written around: lower colour strength, no glow, colourless accent.

| Token | Hex | Computed |
|---|---|---|
| `bg-base` / `bg-surface` / `bg-raised` | `#070B10` / `#0E1620` / `#162230` | — |
| `border-hairline` | `#33475F` | 2.07:1 on base; decorative |
| `border-control` | `#5F7896` | 4.33 base · 3.99 surface · 3.53 raised |
| `text-primary` | `#E8EDF5` | 16.78 · 15.47 · 13.68 |
| `text-secondary` | `#A9B6C8` | 9.59 · 8.84 · 7.82 |
| `text-muted` | `#8494AA` | 6.38 · 5.88 · 5.20 |
| `accent` | `#E8EDF5` | 15.47 on surface |
| `focus`, `selected`, `lens` | `#FFFFFF` | 19.8 on base |
| `theater-iran` | `#E6B43C` (amber) | solid 10.29 · ghost 7.62 · faded 4.21 · not yet attributed 3.72 |
| `theater-ru` | `#56ACE3` (sky blue) | 7.89 · 5.93 · 3.47 · 3.09 |
| `theater-ea` | `#7EEDCE` (mint) | 13.99 · 10.16 · 5.46 · 4.71 |
| `theater-cb` | `#DF7781` (coral) | 6.66 · 5.06 · 3.03 · 2.69 |
| `link` | `#F0E442` | 14.92 on base; nearest theater colour 12.3 away |
| `track` | `#9FB3C8` | 9.16 on base; nearest theater colour (sky blue) 9.1 away |
| `compare-a` / `compare-b` | `#B9A6F5` / `#D8B4A0` | 9.24 / 10.29 on base; 1.11:1 between them |
| `state-error` | `#FF7A33` | 7.00 on surface |
| `state-ok` | `#2BB894` | 7.26 on surface |

Theater set: closest pair with full colour vision 18.9; red-green 14.7; blue-yellow 12.6 (all three are amber
against coral). Other: `display` Plex Sans Condensed, `data` Plex Mono, icon stroke 1.75 outline, radius standard,
glow 0, panel opacity 0.88, map style Tactical dark.

## 14.3 Paper: light
For reading outdoors, for printing and for screenshots pasted into documents.

| Token | Hex | Computed |
|---|---|---|
| `bg-base` / `bg-surface` / `bg-raised` | `#F4F1EA` / `#FFFFFF` / `#ECE8DF` | — |
| `border-hairline` | `#C9C3B6` | 1.56:1 on base; decorative |
| `border-control` | `#6E7C8F` | 3.76 base · 4.24 surface · 3.47 raised |
| `text-primary` | `#14202E` | 14.59 · 16.46 · 13.46 |
| `text-secondary` | `#44546A` | 6.83 · 7.71 · 6.30 |
| `text-muted` | `#566579` | 5.26 · 5.94 · 4.86 (v1.1's `#5E6E84` was 4.25 on a raised surface and failed) |
| `accent`, `focus`, `selected`, `lens` | `#14202E` | 14.59 on base |
| `theater-iran` | `#9A4D00` (burnt amber) | solid 5.41 · ghost 4.05 · faded 2.55 · not yet attributed 2.34 |
| `theater-ru` | `#1F5FCC` (blue) | 5.21 · 3.98 · 2.55 · 2.32 |
| `theater-ea` | `#14401A` (deep green) | 10.47 · 6.86 · 3.48 · 3.06 |
| `theater-cb` | `#7A2E5C` (plum) | 7.84 · 5.54 · 3.07 · 2.75 |
| `link` | `#5F5400` | 6.75 on base; nearest theater colour 11.1 away |
| `track` | `#4A5D73` | 5.99 on base |
| `compare-a` / `compare-b` | `#5B3FB5` / `#0F6E63` | 6.59 / 5.42 on base; 1.21:1 between them |
| `state-error` | `#C62828` | 5.62 on surface (v1.1's `#B84A00` sat 5.8 from the amber theater colour and failed) |
| `state-ok` | `#14401A` | 11.81 on surface |

Theater set: closest pair with full colour vision 16.0 (amber and plum); red-green 10.7 (green and plum);
blue-yellow 9.3. **Paper is the theme nearest the floors**: on a light ground a see-through mark loses contrast
fast, and making all four colours darker to compensate pushes them toward each other. Amber and blue are almost the
same brightness (1.04:1), so in Paper the shape cue does the most work. Open question 11 in section 11 asks the
prototype whether that is good enough outdoors. Other: `display` Plex Sans Condensed, `data` Plex Mono, icon stroke
1.75 outline, radius standard, glow 0, panel opacity 1.00 (opaque: translucency over a light map muddies text),
map style Light gray.

---

# 15. Map styles (new in v1.2)

The map style is a **setting of its own**, not part of the theme: someone can read Classic over satellite imagery,
or Paper over the light map. A theme only names the style it opens with. Store key `mapStyle` (ARCHITECTURE 9.1).

## 15.1 The styles

| Id | What it is | Ground | Source | State |
|---|---|---|---|---|
| `tactical-dark` | Dark grey base, no labels; reference labels above the data at reduced opacity | Dark | Esri World Dark Gray Base + Reference. What v1 uses (VERIFIED in `index.html`). No key | Slice 1 |
| `tactical-blue`, `tactical-green` | The same tiles with a colour tint applied in the browser | Dark | Same tiles; a CSS filter on the tile layer only. No extra downloads | Slice 2 |
| `light-gray` | Light grey base and labels | Light | Esri World Light Gray Base + Reference. No key | Slice 2 |
| `satellite` | Imagery with boundaries and place names | Dark | Esri World Imagery + Boundaries and Places. What v1 uses (VERIFIED). No key | Slice 2 |
| `terrain` | Shaded relief | Dark or light | **Not chosen.** A keyless source that suits a dark chart has not been found or checked (PENDING; candidate only) | Later, or never |

- All sources are free and need no key today (VERIFIED for the three v1 already calls; INFERRED for Light Gray,
  which is the same Esri service family). **Public-use check, PENDING:** v1 is a small private-audience site. Before
  v2 is shared more widely, read the providers' current terms for public sites and their attribution rules
  (RELEASE_PLAN section 1). The map attribution line is always visible; v1 hides it, which v2 does not copy.
- Each style declares its **ground** (dark or light), its land, sea and border colours for the vector fallback and
  the globe tint, and its label layer. Tactical dark: sea `#070B10`, land `#141C26`, borders `#33475F`.
- A map style is an entry in the app's own table (`v2/app/ui/theme/map-styles.js`). A theme or a share link refers
  to it by id; no tile address ever comes from imported data.

## 15.2 Satellite adjustments
Imagery is busy and bright; the data must stay on top. Satellite has three controls, in Settings and in the layers
menu:

| Control | Range | Default |
|---|---|---|
| Dimming | 0% to 60% (a dark wash over the imagery, under the data) | 35% |
| Colour strength | 40% to 100% saturation | 70% |
| Labels | On, off | On |

They are remembered per device and are not part of a theme. The imagery itself is never altered beyond these three.

## 15.3 Marks on a different ground

| Case | Rule |
|---|---|
| Imagery (the satellite style, the globe's imagery) | **Every mark gets a dark outline and a halo:** a 1 px keyline in `#070B10` at 90% outside its own outline, and a 2 px soft halo in the same colour at 50% beyond that. A ghost or faded ghost has the keyline on both sides of its line (2.3). Labels sit on a `bg-surface` plate; text is never set directly on imagery |
| A light theme over a dark-ground style (Paper + satellite, Paper + globe) | The **stage** (markers, arcs, tracks, compare colours) uses the Ops stage colours; the chrome stays Paper. Paper's dark inks would vanish on imagery |
| A dark theme over a light-ground style (Classic or Ops + light gray) | The stage uses the Paper stage colours; the chrome stays dark |
| A user-made theme on the other ground | The same rule: it borrows the built-in stage set for that ground, so the validator only has to prove a theme on its own ground |

The looks, shapes, sizes and strokes are identical in every case. Only the ink changes.

---

# 16. What each detail level changes to the eye (new in v1.2)

The budgets and the automatic pick are in ARCHITECTURE 9.4; decluttering by screen size is in LAYOUT_ENGINE_SPEC
section 8b and is a separate axis. This table is only what a person would see.

| | **Lite** (the Fire budget) | **Standard** | **Full** (PC) |
|---|---|---|---|
| Panel translucency | Opaque; no blur | Theme's opacity; blur where supported | Same as Standard |
| Glow | Capped at level 1, whatever the theme asks | As the theme | As the theme |
| Marker edges | Same looks; no soft halo on imagery (keyline only) | Keyline and halo | Keyline and halo |
| Motion | Look changes and position changes are instant; panels 120 ms; camera cuts | Section 6 as written | Section 6, plus eased camera flights |
| Map labels | Milestones only, at most 12 on screen | Milestones and majors at close zoom, at most 30 | Up to 60; place names at full density |
| Tracks | Thinned; the layer says "showing N of M" | Thinned at wide zoom, with the same note | All in view |
| Globe | No atmosphere, no night side; flat tint | Atmosphere and night side at low intensity | Plus terrain and full-resolution imagery |
| Link arcs | Straight-sampled great circles, 16 points | 32 points | 64 points, tapered |

**What no detail level changes (grammar):** the four looks, shapes, sizes, colours, chip words, the status line, the
legend, the lens banner and tag, the 48 px targets, and **what can be reached**. Every record, entry and source
that Full can open, Lite can open (ARCHITECTURE 9.4 has the test). Where Lite draws fewer of something, it says how
many of how many; it never thins events, only tracks and labels.

A theme and a detail level meet in one place: glow. Classic on Lite shows glow level 1. The theme is not changed
or re-saved; the cap is applied at draw time.

---

# 17. Changes from v1.1 (2026-11-13) to v1.2 (2026-11-15)

| # | Change | Why |
|---|---|---|
| 1 | The document is split into grammar (fixed) and skin (set by a theme); 12.1 and 12.2 list each | Allan's 2026-11-11 direction: a theme capability, without letting a theme change what a mark means |
| 2 | Theme contract (13): a versioned JSON file of fixed choices, numbers and colours; imported themes are data; the validator's checks and limits | Common brief section 4; security rule in section 1 |
| 3 | Three built-in themes with full token tables and computed figures (14): Classic, Ops, Paper | Same |
| 4 | **Theater colours re-tuned in all three themes.** v1.1's set failed the colour-vision check it had claimed to meet (2.2) | Found by the new check |
| 5 | `compare-b` changed from teal to sand in the dark themes; Paper's `text-muted` and `state-error` changed | Each failed a computed check |
| 6 | Share Tech Mono's Cyrillic coverage checked: none (1.1) | The session prompt asked for a real check |
| 7 | Map styles are a setting separate from the theme (15); satellite adjustments; marks on imagery and on the other ground | Common brief section 4 |
| 8 | What each detail level changes visually (16) | Common brief section 3b |
| 9 | `map-land` and `map-border` left the theme: land, sea and borders belong to the map style; `border-hairline` and `accent` added | Follows from 7 |
| 10 | Fonts: three slots; Classic uses Oswald and Share Tech Mono | Classic is v1's look |

Nothing in sections 2.3, 2.4, 2.8, 5, 5A or 9 changed in meaning: the looks, the chip words, the legend lines and
the wording rules are as F1b-1 wrote them.
