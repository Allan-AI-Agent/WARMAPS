---
title: WARMAPS v2 — Design System v1 (visual identity)
version: v1.0
date: 2026-11-10 (Iran-war Day 256)
author: Claude (Fable 5.2), session F1, for Allan Sanceau
status: DRAFT FOR RULING — tokens are final enough to build the prototype against
companions: ARCHITECTURE_v1.md, LAYOUT_ENGINE_SPEC_v1.md
---

# 0. Read this first (one screen)

**The look in one sentence:** a dark, quiet operations chart where the data is the only thing that glows, and
where how sure we are is visible before a single word is read.

**Four visual channels, each carrying exactly one meaning. They never share.**

| Channel | Carries | So you can read at a glance |
|---|---|---|
| **Hue + shape** | Theater | Which war |
| **Size** | Tier (milestone / major / standard) | How much it matters |
| **Fill and outline** | Confidence (confirmed, reported, claimed/fog, disputed, unreviewed) | How sure we are |
| **Line style and width** (arcs) | Link confidence and evidence count | How solid and how active a connection is |

Rules that follow from this:
- Colour never means "good side / bad side". v1's red-for-Iran, blue-for-US scheme is retired in the map layer.
- Fog is drawn as **absence** (hollow, dashed), not as a warning colour. Uncertain things look less solid, not more alarming.
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
| `text-muted` | `#8494AA` | Meta, placeholders, "unreviewed" | 5.9:1 on surface |
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

## 2.3 Confidence (never a hue)
Drawn with fill, outline and pattern in the theater's own colour. Readable in greyscale.

| `claimStatus` / fog | Marker | Card badge text |
|---|---|---|
| `confirmed` | Solid fill, thin dark keyline, plus a 1.5 px white inner ring | CONFIRMED |
| `reported` | Solid fill, thin dark keyline | REPORTED |
| `claimed` (fog) | **Hollow**: 2 px outline in theater colour, 25% fill | CLAIMED · FOG |
| `disputed` (fog) | Hollow with a **dashed** outline, and a diagonal split | DISPUTED · FOG |
| `denied`, `retracted` | Hollow, outline at 50% opacity, struck through | DENIED / RETRACTED |
| `unreviewed` | Solid fill in `text-muted` grey-blue with a theater-coloured outline | NOT YET REVIEWED |

- `unreviewed` is grey on purpose. Roughly the first 385 Iran events have no reviewed claim status yet
  (ARCHITECTURE 3.4). Showing them in full theater colour would claim a confidence the data does not have. As review
  passes cover them, the map fills with colour: an honest picture of the archive's state. (If Allan finds a mostly
  grey early war unacceptable, the alternative is in the decisions file.)
- The badge always carries words. Shape and pattern are the fast read; the word is the sure read.
- Epistemic labels for non-event data are text chips in `text-meta`: **OBSERVED** (tracks), **SAMPLE** (prototype data).

## 2.4 Tier (size)
| Tier | Diameter (phone / larger) | Extras |
|---|---|---|
| `milestone` | 18 / 20 px | Outer halo ring at 30% opacity; always labelled at close zoom; a tick on the timeline |
| `major` | 12 / 14 px | — |
| `standard` | 7 / 8 px | — |
| not rated (`null`) | 7 / 8 px | Same as standard. Tier is never guessed upward |

The tap target is always 48 px regardless of drawn size (section 8). Where markers crowd, they cluster into a
count badge in the theater colour; a cluster containing a milestone keeps the halo.

## 2.5 Other semantic colours
| Token | Dark hex | Use | Note |
|---|---|---|---|
| `link` | `#F0E442` (pale yellow) | All link arcs and link chips | 14.9:1 on base. One colour for every link (section 5) |
| `track` | `#9FB3C8` (cool grey) | Aircraft, vessels, satellites | Deliberately colourless: OBSERVED data must not look like an event |
| `selected` | `#FFFFFF` | Selection ring, timeline cursor | — |
| `state-alert` | `#FF7A33` | Only for a *confirmed* combat tripwire badge and the error banner | Too close to Iran amber to be used on the map (1.15:1), so it is never a marker colour and always comes with an icon and words |
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
| `state-alert` | `#B84A00` | 4.6:1 on base |

Theater colours use the darker light-theme values in 2.2 (all at least 5.2:1 on base). Same shapes, same rules.
Dark is the default. The theme follows the device setting on first visit, then the user's choice. The globe stays
dark in both themes (space is dark); only its chrome changes.

## 2.7 Token structure
Three layers in `v2/assets/tokens.css`: raw values (`--c-amber-500`), semantic tokens (`--theater-iran`, `--bg-surface`),
component tokens (`--card-bg`). Components use semantic or component tokens only. A theme is one block that
re-points semantic tokens. The Leaflet and Cesium renderers read the same tokens through one small JS helper, so the
map, the globe and the panels cannot drift apart.

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
- **Declutter:** at theater zoom, standard-tier events may collapse to clusters; milestones never do.

## 4.2 3D globe (Cesium)
- **Surface:** dark imagery tinted to the same `map-land` / `bg-base` pair so the two views feel like one product.
  No terrain exaggeration, no photorealistic tiles, atmosphere at low intensity, a thin limb glow.
- **No HUD dressing.** No brackets, reticles, scan lines or "detection boxes": the GEV spec already excludes them
  because they imply a precision the data does not have.
- **Events** are flat screen-space symbols using the same shape, size and fill rules as 2D, so a diamond is a diamond
  in both views. Events on the far side of the globe are hidden, not ghosted.
- **Camera:** opens tilted over the home theater. "All theaters" eases back until both AOIs are in frame, which on
  a globe is exactly the picture this project exists to show.
- **Night side:** shown at the cursor's date and noon UTC, at low contrast, as orientation only.

## 4.3 Tracks (OBSERVED)
Aircraft are chevrons, vessels are hull outlines, satellites are small rings with a ground-track line. All in
`track` grey with a 1 px dark keyline. Each carries a time tag in its card ("OBSERVED 14:32 UTC · adsb.lol").
Vessels inside a GNSS-interference tint get a hatched ring and the words "position may be spoofed".

---

# 5. Link arcs (the anti-"conspiracy board" rules)

| Property | Encodes | Values |
|---|---|---|
| Colour | Nothing but "this is a link" | `link` yellow, always |
| Line style | `confidence` | `documented` solid · `reported` long dashes · `alleged` or fog: dots at 55% opacity |
| Width | Evidence in the trailing window (ARCHITECTURE 5.5) | 4 steps: 1.5, 2.5, 4, 6 px. In range but no recent evidence: 1 px at 40% ("dormant") |
| Direction | `direction` | A taper (wide at the source, narrow at the target) plus one arrowhead at the midpoint. `both`: no taper, two arrowheads |
| Category | `category` | A small glyph at the arc's midpoint and in the legend; not colour |

Restraint rules, all enforced in the renderer:
1. **Off by default.** Links appear only when the user turns the layer on or opens the links panel.
2. **Bundling.** All links between the same pair of actors draw as one arc with a count badge. Tapping it opens the
   list. A single-theater view shows only links touching that theater.
3. **Cap.** No more than 12 arcs at once. If more qualify, the strongest by current width show, and the panel says
   "12 of N shown" with filters by category and confidence.
4. **Fog is visibly weaker.** Dotted, faint, and filterable with one switch ("Hide alleged links").
5. **No animation.** Arcs do not flow, march or pulse. Only the selected arc brightens. The time scrubber is the
   only thing that makes links change.
6. **Great-circle paths** in both views, arching above the surface on the globe in proportion to distance.
7. **Legend sentence, always shown with the layer:** "Line weight counts dated evidence. It is not a judgement of
   importance. Dotted lines rest on unconfirmed or anonymous sourcing."

---

# 6. Motion
| Rule | Value |
|---|---|
| Durations | 120 ms (press, toggle) · 200 ms (panel, sheet, card) · 320 ms (camera move between places) · 600 ms (2D↔3D and theater change) |
| Easing | Ease-out on enter, ease-in on exit. No bounce, no overshoot |
| What may move by itself | The timeline during Play; live tracks when they update; a single one-time fade when new data loads |
| What never moves by itself | Markers, arcs, badges, panels. No pulsing "live" dots, no ticker crawl by default |
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
| Colour independence | Every colour meaning has a second cue: shape (theater), size (tier), fill pattern (confidence), line style (links), words (badges) |
| Touch targets | 48 x 48 px minimum, 8 px apart (v1 used 44). Small map markers get an invisible 48 px hit area; overlapping hits open a short chooser instead of guessing |
| Text scaling | Layout holds at 200% text size; panels scroll rather than clip |
| Keyboard (PC) | Everything reachable by Tab; arrow keys step the timeline; Escape closes the top surface; visible focus ring |
| Screen readers | The **Events list** panel is the equivalent of the map: same filter, same window, each row a full sentence ("12 September 2026, Haifa, Israel. Strike on refinery. Claimed, fog of war. Major."). Map and globe canvases are labelled and point to it |
| Motion | Honour reduced-motion (section 6) |
| Language | `lang` set per text run; dates shown in one unambiguous format, `12 Sep 2026` |
| Errors | The error banner is a live region; it names the failed module in plain words |

---

# 9. Voice and wording
- Plain, neutral, past tense for events. No adjectives the sources did not use.
- Fixed vocabulary for confidence (the badge words in 2.3) and for links (documented / reported / alleged).
- The words "merger", "merged" and "one war" are not in the product's vocabulary (ARCHITECTURE 4.2).
- Every number shows its as-of date when it has one ("4,383 · Health Ministry · 10 Sep 2026"), per the latest-figure ruling.
- Sample and prototype content is always stamped "PROTOTYPE SAMPLE - NOT REAL DATA" on the item itself, not only in a footer.

---

# 10. Component inventory (what the prototype and slice 1 must contain)
Top bar · theater filter (segmented, multi-select, "All") · 2D/3D switch · dock rail item · panel frame (title, pin,
move, close) · bottom sheet with detents · info card (event, link, track variants) · confidence badge · tier dot ·
theater chip · source row · timeline (density strip, cursor, window handles, play, date readout) · layers menu row
(switch, state note, attribution) · watchlist row (two visually different tracks) · legend · error banner · empty
state ("No curated events yet for this theater") · toast.

Each is specified for behaviour in LAYOUT_ENGINE_SPEC_v1.md; this document owns only how it looks.

# 11. Open visual questions (answered by the prototype, not by argument)
1. Do amber and sky blue hold up on the Fire's panel in daylight, or does the shape cue have to do more work? (SPECULATION until seen.)
2. Is the grey "not yet reviewed" early war acceptable to Allan, or should unreviewed events take theater colour at reduced strength?
3. Is 7 px too small for standard-tier dots on the S22 at arm's length?
4. Does the single yellow for links read as restrained, or as too uniform to scan?
