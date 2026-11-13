---
title: WARMAPS v2 — Design System v1 (visual identity)
version: v1.1 (2026-11-13: the visual grammar rewritten under the editorial charter; the theme contract comes in the next version, session F1b-2)
date: 2026-11-13 (Iran-war Day 259)
author: Claude (Fable 5.2), sessions F1 and F1b-1, for Allan Sanceau
status: DRAFT FOR RULING — tokens are final enough to build the prototype against
companions: ARCHITECTURE_v1.md (v1.2), LAYOUT_ENGINE_SPEC_v1.md
---

> **Editorial charter (STATE.md, 2026-11-12) governs this document.** No colour, fill, line, badge or word here
> says how true a claim is. The marks show **who has spoken**: one side, more than one, whether they agree, and
> who has not been heard. A change that makes a mark mean "confirmed" or "doubtful" is `KNOWN_FAILURES.md` F-010.

# 0. Read this first (one screen)

**The look in one sentence:** a dark, quiet operations chart where the data is the only thing that glows, and
where who has spoken, and who has not, is visible before a single word is read.

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

**What changes from v1 (VERIFIED from `index.html`):** v1 uses Share Tech Mono + Oswald from Google Fonts, a near-black
ground `#060a0f`, and side-coded neon accents. v2 keeps the near-black ground and the condensed display voice, and
replaces the typefaces and the meaning of colour.

All contrast ratios in this document were computed this session with the WCAG relative-luminance formula; they are
VERIFIED arithmetic on the hex values, not eyeballed. How they look on the S22 and the Fire panel is untested until
the prototype (Part B).

---

# 1. Typography

## 1.1 Families
| Role | Family | Why |
|---|---|---|
| UI and reading text | **IBM Plex Sans** | Open licence (OFL). Covers Latin and Cyrillic, which the Russia-Ukraine theater needs for place names; v1's Share Tech Mono has no Cyrillic (INFERRED from its published character set; confirm at build). Sturdy at small sizes on a phone |
| Headings, panel titles, dense labels | **IBM Plex Sans Condensed** | Keeps v1's condensed "Oswald" voice; fits more per line in narrow panels |
| Data: dates, day numbers, coordinates, IDs, counts | **IBM Plex Mono** | Tabular figures so the date readout does not jitter while scrubbing |

- **Self-hosted** WOFF2 subsets in `v2/assets/fonts/` (Latin + Cyrillic; weights 400, 500, 600; Mono 400, 500). No
  call to Google Fonts: one less third party, no layout shift waiting on a remote stylesheet, works on a poor connection.
- Fallback stack: `"IBM Plex Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`. The layout must hold
  with the fallback (no fixed-width assumptions).
- Arabic, Hebrew and Persian place names appear rarely and only inside text; they fall through to the system font.
  Right-to-left runs are isolated with `dir="auto"` on source titles.

## 1.2 Scale (rem; root 16 px; all sizes scale with the user's font setting)
| Token | Size / line | Weight | Use |
|---|---|---|---|
| `text-display` | 1.5 / 1.2 | Condensed 600 | App title, big stat numbers |
| `text-title` | 1.125 / 1.3 | Condensed 600 | Panel and card titles |
| `text-body` | 1.0 / 1.5 | Sans 400 | Card text, descriptions. Never below this for running text |
| `text-label` | 0.875 / 1.3 | Sans 500 | Buttons, chips, list rows |
| `text-meta` | 0.75 / 1.3 | Sans 500, +0.02em | Source lines, captions. The floor: nothing smaller, anywhere |
| `text-data` | 0.875 / 1.2 | Mono 500 | Dates, counts, coordinates |
| `text-data-lg` | 1.25 / 1.1 | Mono 500 | Timeline cursor readout |

- Upper case only for short labels of three words or fewer (`text-meta`, tracked). v1's all-caps paragraphs are retired:
  they read slowly, and they read as shouting.
- Line length in cards: 45-75 characters; panels narrower than 320 px drop to a single column.

---

# 2. Colour

## 2.1 Neutral ground (dark theme, the default: "Ops")
| Token | Hex | Role | Contrast |
|---|---|---|---|
| `bg-base` | `#070B10` | Page, sea on the map | — |
| `bg-surface` | `#0E1620` | Panels, cards, bars | — |
| `bg-raised` | `#162230` | Menus, hovered rows, sheets over panels | — |
| `map-land` | `#141C26` | Land fill | Deliberately low against sea (1.15:1): the map is a stage, not content |
| `map-border` | `#33475F` | Country lines, panel hairlines (decorative) | 2.1:1 on base; decorative only |
| `border-control` | `#5F7896` | Outlines of buttons, inputs, chips, slider track | 4.0:1 on surface, 3.5:1 on raised (meets the 3:1 rule for controls) |
| `text-primary` | `#E8EDF5` | Main text | 15.5:1 on surface |
| `text-secondary` | `#A9B6C8` | Supporting text | 8.9:1 on surface |
| `text-muted` | `#8494AA` | Meta, placeholders, status-line labels | 5.9:1 on surface |
| `focus` | `#FFFFFF` | Focus ring (2 px + 2 px offset) | 18:1 |

## 2.2 Theater identity (colour-blind safe)
Hues are taken from the Okabe-Ito palette, the standard set chosen to stay distinguishable under the common forms
of colour-vision deficiency.

| Theater | Token | Dark hex | Contrast on base | Marker shape | Light-theme hex |
|---|---|---|---|---|---|
| Iran war | `theater-iran` | `#E69F00` (amber) | 8.8:1 | Circle | `#8A5A00` |
| Russia-Ukraine | `theater-ru` | `#56B4E9` (sky blue) | 8.6:1 | Diamond | `#0B67A0` |
| East Asia | `theater-ea` | `#2BB894` (green) | 7.9:1 | Triangle | `#006B54` |
| Caribbean | `theater-cb` | `#CC79A7` (rose) | 6.5:1 | Hexagon | `#9C3F76` |

**Why shape as well as hue (a finding, not a preference):** amber and sky blue have almost identical luminance
(computed contrast between them 1.02:1). They separate cleanly by hue, including for red-green colour blindness,
but in greyscale, in bright sun on a phone, or for someone with no colour vision they would merge. So each theater
also owns a **shape**. Hue and shape always agree, and either alone is enough.

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
- **Contrast (computed):** ghost outlines 4.9:1 to 6.5:1 on `bg-base` across the four theater colours. Faded-ghost
  outlines 3.0:1 to 3.7:1 (Caribbean rose is the 2.96 floor; the dashes and the Events list carry the meaning
  there). Not-yet-attributed fills 2.7:1 to 3.3:1, with size and shape intact.
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
  size whatever its tier, and takes its tier's size the moment it becomes solid or split. A dramatic claim by one
  side cannot dominate the map before anyone else has spoken. Tier is a rating of importance to the story, never
  of truth.
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
| `link` | `#F0E442` (pale yellow) | All link arcs and link chips | 14.9:1 on base. One colour for every link (section 5) |
| `track` | `#9FB3C8` (cool grey) | Aircraft, vessels, satellites | Deliberately colourless: OBSERVED data must not look like an event |
| `selected` | `#FFFFFF` | Selection ring, timeline cursor | — |
| `state-error` | `#FF7A33` | The error banner only (app failures) | Renamed from `state-alert`, which v1.0 also used as a verdict colour on a tripwire. **No status of any record, link or watch item is ever drawn in it**, or in any other warning colour |
| `lens` | `#FFFFFF` | The lens banner's edge bar and the lens tag | Deliberately colourless: a lens is a way of reading, not a side |
| `compare-a` | `#B9A6F5` (soft violet) | Compare mode, left party (2.8) | 9.2:1 on base |
| `compare-b` | `#6FD3C1` (soft teal) | Compare mode, right party (2.8) | 11.1:1 on base |
| `state-ok` | `#2BB894` | "Up to date", successful load | UI chrome only |

## 2.6 Light theme ("Paper")
For reading outdoors and for screenshots that will be printed or pasted into documents.

| Token | Hex | Contrast |
|---|---|---|
| `bg-base` | `#F4F1EA` | — |
| `bg-surface` | `#FFFFFF` | — |
| `text-primary` | `#14202E` | 14.6:1 on base |
| `text-secondary` | `#44546A` | 6.8:1 on base |
| `text-muted` | `#5E6E84` | 4.6:1 on base |
| `border-control` | `#6E7C8F` | 3.8:1 on base |
| `link` | `#5F5400` | 6.8:1 on base |
| `track` | `#4A5D73` | 6.0:1 on base |
| `state-error` | `#B84A00` | 4.6:1 on base |
| `compare-a` | `#5B3FB5` | 6.6:1 on base |
| `compare-b` | `#0F6E63` | 5.4:1 on base |
| `lens` | `#14202E` | 14.6:1 on base |

Theater colours use the darker light-theme values in 2.2 (all at least 5.2:1 on base). Same shapes, same rules.
Dark is the default. The theme follows the device setting on first visit, then the user's choice. The globe stays
dark in both themes (space is dark); only its chrome changes.

## 2.7 Token structure
Three layers in `v2/assets/tokens.css`: raw values (`--c-amber-500`), semantic tokens (`--theater-iran`, `--bg-surface`),
component tokens (`--card-bg`). Components use semantic or component tokens only. A theme is one block that
re-points semantic tokens. The Leaflet and Cesium renderers read the same tokens through one small JS helper, so the
map, the globe and the panels cannot drift apart.

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
  or green in the partisan sense, and neither is a theater colour. They are close in brightness on purpose (1.2:1
  between them) so neither party looks more important. Because of that, colour is never the only cue: **position
  (left or right) and a letter (A, B) in the banner and the legend** carry the same meaning.
- The compare legend is one line: "A (left) = [party] · B (right) = [party] · filled = says it happened · outline =
  the only one of the two to speak · slash = denies".
- The two parties are listed in alphabetical order; A is simply the first. The user may swap them.

---

# 3. Space, shape, elevation
- **Grid:** 4 px base. Spacing tokens 4, 8, 12, 16, 24, 32.
- **Radius:** 4 px on controls and chips, 8 px on cards and panels, 16 px on the top corners of bottom sheets.
  Nothing is pill-shaped except toggle switches.
- **Elevation:** dark themes do not show shadows well, so depth is carried by surface colour (`base` → `surface` →
  `raised`) plus a 1 px hairline. One soft shadow is allowed, under sheets and floating panels.
- **Density:** two settings. *Comfortable* (touch; 48 px rows) is the default on coarse pointers; *compact*
  (36 px rows) is available on PC.
- **Translucency:** bars that sit over the map use `bg-surface` at 88% with a light blur where the device supports
  it, falling back to opaque. Text is never set directly on map imagery.

---

# 4. Map and globe styling

## 4.1 2D map (Leaflet)
- **Basemap:** Esri World Dark Gray base without labels, then our own reference labels above the data at reduced
  opacity (as v1 does, VERIFIED). No key. In the Paper theme: Esri Light Gray.
- **Theater outlines:** the AOI drawn as a 1.5 px line in theater colour at 60%, corner ticks, and a small label tab
  ("IRAN WAR · Day 256"). No fill. In single-theater mode the area outside the AOI is dimmed by 20%.
- **Label order (bottom to top):** basemap → outlines → context layers → link arcs → events → tracks → selection →
  place labels. Events always sit above arcs: what happened outranks what is connected.
- **Declutter:** at theater zoom, standard-tier events may collapse to clusters; solid or split milestones never do.
- **Fog layer look:** with **On the record** and **Fog** both on (the default), ghosts sit under solid and split
  marks in the draw order, so where they overlap, what more than one side has said stays on top.

## 4.2 3D globe (Cesium)
- **Surface:** dark imagery tinted to the same `map-land` / `bg-base` pair so the two views feel like one product.
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
Vessels inside a GNSS-interference tint get a hatched ring and the words "position may be spoofed".
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
| Contrast | Text 4.5:1 or better (achieved: lowest is 4.6:1). Control outlines and meaningful graphics 3:1 or better |
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

