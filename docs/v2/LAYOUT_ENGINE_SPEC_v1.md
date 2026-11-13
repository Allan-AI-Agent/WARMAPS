---
title: WARMAPS v2 — Layout Engine Spec v1 (the panel system)
version: v1.1 (2026-11-13: lens, fog layers, 7-day band, record switch and status line under the editorial charter; theme controls, clean view and screen-size rules come in session F1b-2)
date: 2026-11-13 (Iran-war Day 259)
author: Claude (Fable 5.2), sessions F1 and F1b-1, for Allan Sanceau
status: DRAFT FOR RULING — exact behaviour for the prototype (Part B) and slice 1
companions: ARCHITECTURE_v1.md v1.2 (store, selectors, renderer contract), DESIGN_SYSTEM_v1.md v1.1 (how things look)
---

> **Editorial charter (STATE.md, 2026-11-12) governs this document.** No control, chip, legend line or panel here
> says how true a claim is. They show who has spoken, who has not, and whose account is on screen.

# 0. Read this first (one screen)

**The one rule that fixes v1's overlap bugs:** panels live in **slots that tile the screen**. A slot has a place
and a size; a panel sits in a slot. Slots never overlap each other, so panels cannot either. (v1 positions each
panel independently, which is how "IRAN MISSILE WAVES over AIRSPACE STATUS" happened — OBSERVED in STATE.md.)
The only things allowed to float above the map are the sheet on a phone, popovers, and free-floating panels on a PC.

**Five regions, always in the same order of importance:**
1. **Stage** — the map or globe. Always present, always the largest thing.
2. **Timeline** — always present, attached to the stage.
3. **Top bar** — theater filter, lens button, 2D/3D switch, layers button.
4. **Dock rail** — one icon per panel.
5. **Panel slots** — where opened panels go.

**What each device gets:**

| Form factor | Dock rail | Panels open as | How many at once | Side-by-side views |
|---|---|---|---|---|
| Phone portrait | Bottom bar | Bottom sheet (peek / half / full) | 1 | No (switch only) |
| Phone landscape | Left edge | Left side sheet | 1 | No |
| Tablet portrait | Bottom bar with labels | Bottom region, up to 2 columns | 2 | Stacked (top / bottom) |
| Tablet landscape | Left edge with labels | Left and right slots | 2 | Yes (left / right) |
| PC | Left edge | Left, right and bottom slots, plus floating | 3 + floating | Yes |

Layout is chosen from the **viewport size and pointer type**, never from a device name, so a resized PC window
or a foldable gets the right layout automatically.

Sizes below are CSS pixels. The device figures (S22 about 360 x 780, Fire HD 10 about 1280 x 800) are INFERRED from
published screen specifications, and browser bars take more off the height. The prototype shows the live viewport
size in its About panel so Allan can read the real numbers off each device.

---

# 1. Form factors and breakpoints

Let `w` and `h` be the visible viewport (`100dvw`, `100dvh`: the dynamic units, which exclude browser bars; v1's
`100dvh` fix is kept).

| Class | Condition (first match wins) | Typical device |
|---|---|---|
| `phone-landscape` | `h < 500` and `w > h` | S22 on its side: about 780 x 300-360 |
| `phone-portrait` | `w < 600` | S22 upright: about 360 x 660-780 |
| `tablet-portrait` | `w < 1024` and `h >= w` | Fire HD 10 upright: about 800 x 1200 |
| `tablet-landscape` | `w < 1366` and coarse pointer | Fire HD 10 on its side: about 1280 x 720-800 |
| `pc` | everything else | Laptop or desktop; also a tablet with a mouse |

- The class is recomputed on resize and rotation and written to the store (`layout.class`) and to `<html data-layout>`.
- Rotation and resize **never close anything by themselves**: open panels are re-placed by the mapping in section 4.
- Phone landscape is the hard case: after browser bars the visible height can be about 300 px. Every phone-landscape
  rule below is written for 300 px. The full-screen control (kept from v1) and installing the site to the home
  screen both recover the bars' space; neither is required.
- Safe areas: all edge-attached chrome pads by `env(safe-area-inset-*)`, so the S22's camera cut-out and gesture bar
  never cover a control.

---

# 2. Regions

## 2.1 Stage
Holds one **view** or, in side-by-side mode, two (section 6). The stage resizes when slots open on tablet and PC,
so the map is never hidden under a panel there. On a phone the sheet covers part of the stage, and the map's
"visible centre" is offset so a selected event is never under the sheet.

## 2.2 Top bar
Left to right: menu/brand → **theater filter** → **Lens** button → spacer → **2D | 3D** switch → **Layers** button → overflow.

| Class | Height | Changes |
|---|---|---|
| phone-portrait | 48 | Theater filter collapses to one chip showing the current choice ("Iran war ▾", "All theaters ▾"); tapping opens a small menu. Brand becomes the mark only. Lens is an icon button with a dot when a lens is on |
| phone-landscape | none | The top bar is removed. Its controls move to the top of the left rail (theater chip, 2D/3D, layers). Lens and the fog switches are the first rows of the Layers side sheet; the lens tag on the stage opens the lens picker when tapped |
| tablet (both) | 56 | Full segmented theater filter with names. Lens button with its text ("Lens: All", "Lens: Iran", "Compare: Iran | Israel") |
| pc | 48 | Full filter, lens button with its text, plus search, plus the date readout duplicated at right |

**Theater filter behaviour:** segments are toggles, with "All" as a shortcut. One theater on = single-theater mode
(the AOI is framed, outside dimmed). Two or more on = multi mode (camera frames all selected AOIs; the Links layer
becomes available but stays off). Theaters with status `intake-only` show greyed with "no curated events yet".

## 2.2a Lens: button, picker, banner and tag (ARCHITECTURE 3.4.6; DESIGN_SYSTEM 5A.3)

**Picker.** Opens from the Lens button: a sheet at half on phones, a popover on tablet and PC.
- First row: **All accounts** (the default).
- Then every party in the actor registry that has an entry in the current window, **in alphabetical order**, each
  with a checkbox and the number of its entries in view ("Iran · 41"). Parties with none in view follow, greyed but
  selectable. A search field filters the list. There are no pre-built groups, blocs or "sides": the Iranian
  government and the Iranian opposition are two rows; Hezbollah is its own row.
- One or more ticked = lens on those parties. A **Compare two** switch at the bottom is enabled when exactly two
  are ticked; it shows "A (left): ... · B (right): ..." with a swap button.
- There is no slider and no left-to-right scale anywhere in the picker.

**Banner.** Shown whenever a lens other than All is on. It cannot be dismissed while the lens is on; its only
action is "All accounts".

| Class | Banner | Lens tag on the stage |
|---|---|---|
| phone-portrait | 32 px strip under the top bar, one line: "Iran's account only · 14 hidden". Tapping it opens the full sentence and the "All accounts" button | Yes |
| phone-landscape | No room for a strip at 300 px. The full sentence is the first row of any open side sheet, and shows for 4 seconds over the stage when the lens changes | Yes, and it is the standing indicator here. Tap opens the picker |
| tablet (both) | 32 px strip under the top bar, full sentence: "Showing Iran's account only, not WARMAPS's view · 14 other accounts hidden · accounts on file: 31", then "All accounts" | Yes |
| pc | Same as tablet | Yes |

- The **lens tag** is drawn inside the stage (bottom leading corner) at every class, so it is in every screenshot.
  It stays visible in clean view (F1b-2). In side-by-side views each view carries its own tag.
- A shared link carries the lens (ARCHITECTURE 9.1), so whoever opens it sees the same banner and tag.
- Under a lens the Events panel has two groups: "Says" (records that party affirms; those with no stated place are
  here and not on the map) and "Denies". The info card shows that party's entries and a row "N other accounts on
  this record are hidden · Show all accounts".
- Changing the lens moves markers to the places that party gives. The move is instant (it is a change of reading,
  not of time).

## 2.2b Record layers: On the record, Fog, Contested (ARCHITECTURE 9.1)

Three switches that act on events. They count sides heard; none of them picks a side.

| Switch | Default | Effect |
|---|---|---|
| **On the record** | on | Solid and split markers (and not-yet-attributed v1 records) |
| **Fog** | on | Ghosts and faded ghosts |
| **Contested** | off | A filter: only split markers, whatever the two switches above say |

- Fog off = a clean map of what more than one side has said. On the record off = only where an account is missing.
  Both off is not allowed: turning off the second one turns the first back on.
- **One tap away at every class:** on phone-portrait, tablet and PC the three sit as a small control group at the
  top trailing corner of the stage (48 px targets, icon plus a short label on tablet and PC, icon only on the
  phone, with the mark each one controls as its icon). On phone-landscape they are the first rows of the Layers
  side sheet, under Lens.
- The Events panel follows the same switches, and its header says what is hidden: "7 ghosts hidden".

## 2.3 Timeline
Always visible, and **two-level** (ARCHITECTURE 5.3): a **detail row** showing only as many steps as fit at
finger size (at least 8 px each: about 41 on the S22), where the cursor and window handles live; and an **overview
row** showing the whole extent with the window drawn on it as a **band**. The dry run showed a one-row timeline
would give about 1 px per day on a phone. Three heights:

| State | Height | Contents | Where used |
|---|---|---|---|
| `slim` | 44 | Detail row only: cursor track, date readout with the range chip ("7d"), play button. Tapping the readout shows the overview with its band temporarily, plus the Record switch | phone-landscape always; anywhere after the user collapses it |
| `standard` | 64 | Detail row (44) with the band's edges as handles + overview row (20): density strip coloured by theater, the band | phone-portrait, tablet-portrait |
| `tall` | 88 | Both rows, + band labels (2022 ... 2026), milestone ticks, per-theater day numbers | tablet-landscape, pc |

- Readout: `08 Nov 2026` in data type, then per active theater `IR Day 254 · RU Day 1,719`. Calendar date first
  (decision 4). In single-theater mode the day number moves up beside the date.
- Handles are 28 px drawn inside a 48 px hit area, centred on the track. This replaces v1's oversized default
  range-input thumbs that sat below the line (OBSERVED by Allan, 2026-11-02): the v2 timeline is a custom control,
  not a browser range input.
- Step buttons (previous / next step) sit at the ends on tablet and PC, and inside the readout's menu on a phone.
- A "Today" button appears whenever the cursor is not at the end. It also returns the band to the last 7 days.
- **The band (provisional ruling 1).** On first load the window is the last 7 days, drawn as a band at the right
  end of the overview row. Drag the band to move it through the war; drag either edge to widen or narrow it; tap
  **All** (a chip at the trailing end of the overview row; in the range chip's menu on `slim`) for the whole
  extent. The range chip reads "Last 7 days", "12 Oct to 13 Nov" or "All", and its menu offers 7 days, 30 days,
  90 days, All. The cursor is the band's right edge.
- The detail row always contains the band's right edge. When the band fits the detail row, both of its edges show
  there as handles and the days outside it are dimmed; when it is wider, the left edge is a chip at the row's start
  ("from 12 Oct"). The detail view is no longer a second draggable box: it follows the band (ARCHITECTURE 5.3).
- **Record today | As known then** (ARCHITECTURE 5.8): a two-part switch at the leading end of the timeline on
  `standard` and `tall`, in the readout's menu on `slim`. In "As known then" the readout says "as known on 08 Nov
  2026" and Play replays the record day by day: ghosts appear, solidify, move into position, split or fade.
- Milestone ticks on the overview: filled for solid or split milestones, hollow for one-sided ones.

## 2.4 Dock rail
One item per registered panel, in a fixed order. Initial set:
**Events** (list) · **Key events** · **Watchlist** · **Links** · **Stats** · **Theater brief** (airspace, naval,
figures) · **Sources & method** · **Settings**. Layers is not a panel item: it has its own button in the top bar
because it is used constantly.

| Class | Position | Size | Labels | Overflow |
|---|---|---|---|---|
| phone-portrait | Bottom, under the timeline | 56 high | Under the active item only | 4 items + "More" (opens the rest in a sheet) |
| phone-landscape | Left edge | 48 wide | None (tooltips on long-press) | Top group (theater, 2D/3D, layers), then 4 panel items + More |
| tablet-portrait | Bottom, under the timeline | 64 high | Under every item | All fit |
| tablet-landscape | Left edge | 72 wide | Under every item | Scrolls if needed |
| pc | Left edge | 56 wide; expands to 200 with names on hover or pin | Beside icons when expanded | Scrolls |

Rail item states: closed · open (highlight bar on the edge facing the stage) · pinned (small pin mark) · has-news
(a dot, only for Watchlist status changes and new data since last visit).
Tapping a closed item opens it; tapping the open item closes it; tapping while another transient panel is open
replaces that panel (section 3.2).

---

# 3. Panels

## 3.1 Registration
A panel is a module that registers:

```
{ id, title, icon, order,
  minWidth: 280, idealWidth: 360, minHeight: 160,
  prefers: { 'phone-portrait': 'sheet:half', 'tablet-landscape': 'left', pc: 'left' },
  canFloat: true, canPin: true,
  render(container, ctx), onShow(), onHide(), getTitleBadge() }
```
Adding a panel in a later slice is adding one module and one rail item. No layout code changes: this is the
"additive" rule applied to the interface.

## 3.2 States and the transient / pinned model
- **Closed** — not rendered.
- **Open (transient)** — in a slot. Opening another panel into the same slot **replaces** it.
- **Pinned** — stays in its slot until closed by the user. Other panels then go to the next free slot, or, if none
  is free, ask to replace the transient one. A pinned panel also survives theater changes and view switches.
- **Floating** (PC only) — a free window above the stage, draggable and resizable, kept inside the viewport.
- **Full** (phone only) — the sheet at its highest detent.

This is the "preview tab" model used by code editors: one slot behaves as a quick-look that keeps being reused,
and pinning is how you say "keep this one".

## 3.3 Panel frame
Every panel has the same header: drag handle (touch) · icon and title · badge · **Pin** · **Move** (menu: Left /
Right / Bottom / Float, only the options that exist in the current class) · **Close**. Header height 48 (touch) or
36 (PC compact). The body scrolls; the header does not.

## 3.4 Snap-ins (moving panels between slots)
- **PC:** drag the header. While dragging, the available slots light up as drop zones along the edges; releasing
  over one snaps the panel in; releasing elsewhere leaves it floating.
- **Tablet:** long-press the header (400 ms, with a haptic tick where supported), then drag to a lit zone. No
  floating on tablets.
- **Phone:** no dragging between slots (there is only one). The sheet moves between detents only.
- **Always available without dragging:** the **Move** menu does the same thing by tap or keyboard. Dragging is a
  shortcut, never the only way.
- Slot dividers on tablet-landscape and PC can be dragged to resize (min 280, max 45% of the viewport). Double-tap
  a divider to reset.

## 3.5 Persistence
Per layout class, the engine saves: which panels are open, where, pinned or not, slot sizes, timeline height,
theme. Stored under one versioned key (`wm2.layout.v1`). If storage is unavailable (v1 noted it may not persist on
some devices — VERIFIED in `index.html` comments) the app runs on defaults without error. **Reset layout** is in
Settings and is also offered by the error banner if the layout module fails.

---

# 4. Slots by form factor (exact behaviour)

## 4.1 Phone portrait (about 360 x 700 visible)

```
┌──────────────────────────┐
│ top bar 48               │  theater chip · 2D|3D · layers
├──────────────────────────┤
│                          │
│         STAGE            │
│                          │
│  ┌────────────────────┐  │
│  │ sheet (peek/half/  │  │  one panel or one info card
│  │        full)       │  │
├──┴────────────────────┴──┤
│ timeline 64              │
├──────────────────────────┤
│ dock 56  ▣ ▣ ▣ ▣ ⋯       │
└──────────────────────────┘
```
- **One sheet** above the timeline. Detents: **peek** 96 px (title row and one line), **half** 50% of the stage,
  **full** stage height minus 8 px (the top bar stays visible).
- Drag the handle or the header to change detent; flick down from peek closes. The sheet's body scrolls only at
  half and full; at the top of the scroll, a further pull down lowers the detent.
- **Pin on a phone** means: the sheet stays (it does not close) when you tap the map or scrub time, and it drops
  to peek while you pan the map, returning to its detent when you stop. Unpinned, tapping empty map closes it.
- The timeline and dock stay visible at peek and half. At full the dock hides and the timeline goes slim.
- Selecting an event while a panel is open: the info card **replaces the sheet content** with a back arrow to the
  panel (one sheet, a two-level stack, never two sheets).
- Side-by-side views: not offered. The 2D/3D switch swaps the stage.
- Keyboard open (search, settings fields): dock and timeline hide; the sheet goes full.

## 4.2 Phone landscape (about 780 x 300-360 visible)

```
┌────┬───────────────┬───────────────────────────────┐
│rail│ side sheet    │                               │
│ 48 │ 300-320 wide  │            STAGE              │
│    │ full height   │                               │
│    │               ├───────────────────────────────┤
│    │               │ timeline slim 44              │
└────┴───────────────┴───────────────────────────────┘
```
- No top bar. The rail's top group holds the theater chip, 2D/3D and layers.
- **One side sheet** on the left beside the rail, full height, 320 px (300 if `w < 720`). The stage keeps the rest
  (about 410 px or more) and **resizes**, so the map is not covered.
- No detents sideways: the sheet is open or closed. Swipe it left to close.
- Timeline is always slim and spans the stage only. Tapping the date readout opens a temporary tall strip over the
  stage for precise scrubbing; it closes on release.
- Info card: same side sheet, same back-arrow stack as portrait.
- The rail sits on the left because Android's back gesture uses both edges. Rail buttons are inset by the safe
  area, and nothing in the app uses an edge swipe (section 7).

## 4.3 Tablet portrait (about 800 x 1200)

```
┌────────────────────────────────────┐
│ top bar 56  full theater filter    │
├────────────────────────────────────┤
│                                    │
│              STAGE                 │   55-100% of the middle
│                                    │
├────────────────────────────────────┤
│ timeline 64                        │
├─────────────────┬──────────────────┤
│ bottom slot A   │ bottom slot B    │   0, 1 or 2 panels; 35-45% of height
├─────────────────┴──────────────────┤
│ dock 64 with labels                │
└────────────────────────────────────┘
```
- A **bottom region** between the timeline and the dock holds one panel (full width) or two side by side (min 360
  each). The stage shrinks; nothing overlaps.
- The divider between stage and bottom region drags between 25% and 60%. Dragging it to the bottom closes the region.
- Info card: opens in the transient bottom slot. If both slots are pinned, it opens as a popover anchored to the
  marker, 360 wide.
- Side-by-side views here means **stacked**: view A above view B, each with the full width, and the bottom region
  limited to one panel while stacked.

## 4.4 Tablet landscape (about 1280 x 720-800)

```
┌─────┬──────────────┬──────────────────────────────┬──────────────┐
│     │ top bar 56                                                 │
│rail ├──────────────┬──────────────────────────────┬──────────────┤
│ 72  │ left slot    │            STAGE             │ right slot   │
│     │ 320-400      │   (or view A │ view B)       │ 320-400      │
│     │              ├──────────────────────────────┤              │
│     │              │ timeline 88                  │              │
└─────┴──────────────┴──────────────────────────────┴──────────────┘
```
- **Left slot** (first panel opened) and **right slot** (second). Each 360 by default.
- Convention, not a rule: the left slot is for lists (Events, Key events, Watchlist, Links); the right slot is for
  **detail**. The info card opens on the right. If the right slot is pinned to something else, the card takes the
  left slot's transient position, else a popover.
- With both slots open the stage is at least 1280 - 72 - 360 - 360 = 488 px wide: enough for one view. Therefore
  side-by-side views are allowed only with **at most one slot open**; opening a second panel while split asks
  "Close the second view?" rather than silently squeezing the map.
- Timeline spans the stage only, tall.

## 4.5 PC (1366 wide and up, fine pointer)

```
┌────┬────────────────────────────────────────────────────────────┐
│    │ top bar 48                                                 │
│rail├───────────┬─────────────────────────────────┬──────────────┤
│ 56 │ left slot │   STAGE (view A │ view B)       │ right slot   │
│    │ 320-480   │                                 │ 320-480      │
│    │           ├─────────────────────────────────┤              │
│    │           │ timeline 88                     │              │
│    ├───────────┴─────────────────────────────────┴──────────────┤
│    │ bottom slot (optional): events table, 200-40%              │
└────┴────────────────────────────────────────────────────────────┘
```
- Left, right and **bottom** slots, plus any number of floating panels (sensible cap: 4).
- The bottom slot is meant for wide content: the events table with sortable columns, link list, source list.
- Info card: right slot; or, with the setting "cards as popovers", anchored beside the marker.
- Hover shows a compact tooltip (title, date, badge); click selects. Compact density available.
- Keyboard: `[` and `]` step time, `Space` play/pause, `T` today, `1-4` toggle theaters, `A` all theaters, `V`
  2D/3D, `L` layers, `\` split view, `Esc` close top surface, `/` search.
- Below 1366 with a mouse (a small laptop window), the PC class still applies down to 1024; under that, the right
  slot is dropped first, then the bottom slot.

## 4.6 What collapses where (single reference table)

| Element | Phone portrait | Phone landscape | Tablet portrait | Tablet landscape | PC |
|---|---|---|---|---|---|
| Top bar | 48, chip filter | Removed → rail top | 56, full filter | 56, full filter | 48, full + search |
| Theater filter | One chip + menu | One chip + menu | Segments | Segments | Segments |
| Dock rail | Bottom, 4 + More | Left, 4 + More | Bottom, labelled | Left, labelled | Left, expandable |
| Panel container | Bottom sheet | Left side sheet | Bottom region ×2 | Left + right | Left + right + bottom + floating |
| Max panels | 1 | 1 | 2 | 2 | 3 + floating |
| Stage resizes for panels | No (sheet overlays) | Yes | Yes | Yes | Yes |
| Timeline | Standard 64 | Slim 44 | Standard 64 | Tall 88 | Tall 88 |
| Info card | Sheet (stacked over panel) | Side sheet (stacked) | Bottom slot or popover | Right slot | Right slot or popover |
| Side-by-side views | No | No | Stacked | Left/right, max 1 panel | Left/right |
| Snap by drag | No | No | Long-press drag | Long-press drag | Drag |
| Floating panels | No | No | No | No | Yes |
| Layers menu | Sheet (full) | Side sheet | Popover from button | Popover | Popover |
| Legend | Inside the Layers sheet | Inside Layers | Collapsible chip on the stage | Chip on the stage | Chip on the stage |

**Rotation and resize mapping** (panels are never lost): sheet ↔ side sheet ↔ left slot (the primary panel);
a second panel in bottom slot B ↔ right slot; a third (PC bottom) panel and floating panels become closed-but-remembered
on smaller classes and return when the class allows. The info card always follows the selection.

---

# 5. Info cards

One component, three variants. Two sizes: **peek** (what you need to decide whether to read on) and **expanded**.

| Part | Event | Link | Track (OBSERVED) |
|---|---|---|---|
| Header line | Tier dot · title | Category glyph · title | Type glyph · callsign or name |
| Chips | Theater chip(s) · **attribution chip** (ONE SIDE, SIDES AGREE, CONTESTED, UNRESOLVED, NOT YET ATTRIBUTED) · kind | Theater chips · **who-has-spoken chip** (BOTH ACTORS, ONE ACTOR, OTHERS ONLY, DENIED BY SOMEONE) · direction | **OBSERVED** chip · source · time |
| Status line | "On record: Iran, Israel · Missing: Hezbollah · Agree it happened; disagree on damage" (ARCHITECTURE 3.4.4) | "Affirmed by: ... · Acknowledged by: ... · Denied by: ... · No statement from: ..." | — |
| Peek body | Date (and day number) · place and who placed it · first sentence | Actors A → B · date range · number of voices in the window | Position time, speed, heading; warning line if in a jamming area |
| Expanded | **Entries, oldest first:** each row = claimant · what they did (says, acknowledges, denies, withdraws) · date published · their words in brief · figures · source link · "carried by" list. Superseded entries are shown struck through under the entry that replaced them. Then: the look-again line ("Checked after 1, 3 and 7 days: no account from Iran found. Next check: 30 days"); other places named, each with who named it; the v1 note where there is one; the record-check line ("Record compared with its sources on 9 Nov 2026"); related links | Summary; **statements by date**, each = claimant · affirms, acknowledges or denies · the `covers` sentence · source; the fixed line "WARMAPS does not rate this link"; the legend sentence about weight | "Transponder data is self-reported. Absence is not evidence of no activity." Provider attribution |
| Actions | Show on map · Show on timeline · Copy link · Previous / next in time | Show both ends · Filter events to these actors · Copy link | Follow (today only) · Copy link |

Rules:
- **The attribution chip and the status line are always visible at peek and never scroll away**, at every class.
  At peek the status line is one line; expanded, it wraps in full.
- A ghost's card therefore opens with "Missing: X" in view, and a faded ghost's with "Unresolved: no account from X
  as of [date]". The reader sees whose account this is before reading it.
- A carrier is listed under the entry it repeats and is never shown as a separate voice.
- An entry by state or party media says so beside the claimant ("State TV, state media"). An entry citing unnamed
  officials says so ("Wire One, citing an unnamed US official").
- Tapping a marker whose record names other places shows them on the map as small linked marks labelled by who
  said so (DESIGN_SYSTEM 2.3); closing the card removes them. A many-target record shows its further targets as
  ticks the same way.
- Sources are real links that open in a new tab (`rel="noopener noreferrer"`); a source with `access:
  "snippet-only"` says so; a publisher with no URL on file is shown as plain text, never linked to a guess.
- All card text is rendered as text, never as markup (ARCHITECTURE 3.2).
- "Copy link" writes the URL hash that reproduces theater, date and selection (ARCHITECTURE 9.1).
- Swiping left/right on a card at peek (phone) moves to the previous/next visible event in time.
- Overlapping markers: a tap that hits several opens a short chooser list first.
- Prototype sample items show the "PROTOTYPE SAMPLE - NOT REAL DATA" stamp in the chips row.

---

# 6. Side-by-side views

The stage can hold two views. Three useful pairings:

| Mode | Left / top | Right / bottom | Sync |
|---|---|---|---|
| **2D + 3D** | 2D map | Globe | Time, theater filter and selection shared; cameras linked (toggle to unlink) |
| **Theater + theater** | Theater A (2D or 3D) | Theater B | Time and selection shared; cameras independent. This is the "watch both wars move together" view on devices where the globe is too heavy |
| **Now + then** | Cursor date | A second, fixed date | Theater and camera shared; time independent |

- Entry: the split button in the top bar (tablet, PC) or `\`. Exit: the same button, or drag the divider to an edge.
- There is one timeline. In "now + then" the second view shows its fixed date as a label and a second, hollow
  cursor on the timeline.
- Each view has a small label tab (which view, which theater, which date) so a screenshot is self-explanatory.
- Performance rule (ARCHITECTURE 9.4): the pairing 2D + 3D is offered on PC, and on tablets only after the globe has
  met its frame-rate target on that device; otherwise the option is shown disabled with the reason. Two 2D views
  are always allowed on tablets and PC.

---

# 7. Touch gestures

| Where | Gesture | Result |
|---|---|---|
| Map / globe | One-finger drag | Pan (globe: rotate) |
| | Pinch | Zoom |
| | Two-finger twist / two-finger vertical drag | Rotate / tilt — **globe only**. The 2D map stays north-up |
| | Tap marker | Select → info card at peek; other places named on the record appear as linked marks |
| | Tap empty map | Deselect; closes an unpinned sheet |
| | Long-press empty map | "What's here": events within the area for the current window |
| | Double-tap | Zoom in one step |
| Sheet | Drag handle or header | Change detent / close |
| | Drag in body | Scroll content (never moves the map) |
| Card at peek | Swipe left / right | Next / previous event in time |
| Timeline | Drag on track | Scrub the cursor |
| | Drag a band edge | Widen or narrow the window |
| | Drag the band on the overview | Move the window through time (the detail row follows) |
| | Pinch on the detail row | Change how many steps are shown (8 to 40 px per step) |
| | Double-tap | Jump to today and back to the last 7 days |
| Panel header | Long-press, then drag (tablet) | Move to another slot |
| Rail item | Long-press | Tooltip and the panel's Move/Pin menu |

Guards:
- **No edge swipes** anywhere. Android's system back gesture owns both screen edges on the S22, and fighting it
  loses.
- **System Back** closes the top-most surface in this order: popover → info card → sheet/panel (transient) →
  split view → then leaves the page. Each of those steps is a history entry, so Back never exits by surprise.
- One gesture, one owner: the map never receives a drag that starts on a sheet, the timeline or the rail. The
  timeline claims horizontal drags that begin on it, even if the finger leaves its bounds.
- All drag gestures have a tap or menu equivalent (accessibility, and one-handed use).
- Pull-to-refresh is disabled on the app surface (`overscroll-behavior: none`) so scrubbing down a sheet cannot
  reload the page.

---

# 8. Layers menu and legend
- Opens from the **Layers** button. Groups, in this order: **Events** (on, locked) · **Theater outlines** (on) ·
  **Connections** (Links arcs; Watchlist markers) · **Air** · **Sea** · **Space** · **Ground context** (fires,
  installations, cables, dams, GNSS).
- Each row: switch · name · one-line description · state note ("today only", "needs the 3D view", "not built yet")
  · source attribution. Rows for layers that are not built yet are visible but disabled in the prototype and in
  early slices, so the eventual menu shape is stable from day one.
- Turning on Vessels or Military flights turns on GNSS integrity with them, per `layers.config.json` (`auto_with`).
- The Events group's first rows are **Lens** (opens the picker) and the three record switches of 2.2b, so they are
  reachable here at every class as well as from their one-tap controls.
- The **legend** always reflects exactly what is on: theater shapes, tier sizes, the looks in view with their fixed
  lines (DESIGN_SYSTEM 2.3: "Solid = the sides on record agree it happened" and the rest), and, when Links are on,
  the arc key and its fixed sentence. In compare mode it shows the one-line compare key instead of the looks. Its
  footer is always shown: "The marks show who has spoken, not what is true." Nothing is in the legend that is not
  on the map, and the legend never uses the words confirmed, verified or unconfirmed.
- "Reset to default view" returns to events and outlines only.

# 8a. Help: how the site assigns its marks (wording for the Help panel; F1b-2 places it)

Help carries this section under the title **"What the marks mean"**. The wording is fixed here so every build
says the same thing.

> **WARMAPS records who said what.** Every item on the map is something someone has said happened, with who said
> it, when, and where you can read it. WARMAPS does not decide whether it is true. You can follow each source and
> judge for yourself.
>
> **Outline (ghost):** one side has said this. A side directly involved has not been heard. The card names who is
> missing.
> **Solid:** the sides on record agree it happened. That is all it means. They may still disagree about damage,
> numbers or who is to blame, and the card says so.
> **Half (split):** someone on record denies it, or disputes who did it.
> **Dashed outline:** we looked again after 1, 3, 7 and 30 days and still have only one side's account. The card
> says who has not answered and when we last looked.
> **Plain:** carried over from the first version of WARMAPS. Who said it has not been recorded yet.
>
> **Size** shows how much an event matters to the story of the war. A claim made by one side only is drawn small
> until another side speaks.
> **Repeating is not agreeing.** Ten outlets carrying one statement are still one voice.
> **A side's own media counts for that side and is labelled.** Exile and opposition media are listed, and never
> stand in for the government or group they oppose.
> **What we check:** that the statement was really made, by whom, and that the source says what we say it says.
> Nothing more.
> **Lens** shows one party's account only, or two side by side. The banner tells you whose account you are
> looking at. It is never WARMAPS's view; WARMAPS has none.
> **Aircraft, ships and satellites** are observations from transponders and orbital data, not claims. They are
> grey, shown for today only, and never take these marks.
> **Opinion** appears only in notes signed by Allan Sanceau, kept apart from the record.

# 9. Watchlist panel
- Two sections that look different on purpose: **Combat tripwires** and, below a divider and a heading in smaller
  type, **Rhetoric and mobilization** (four-step meter: quiet / noted / elevated / sustained, with the caption
  "Statements and preparations. Weaker signal. Cannot change a tripwire.").
- **Combat tripwire rows** carry one chip, all in the same neutral chip style with the small mark of the cited
  events' look: NO CLAIM ON FILE · CLAIMED BY ONE SIDE · CLAIMED AND DENIED · STATED BY BOTH ENDS (ARCHITECTURE 4.2).
  Under the chip, the names: "Claimed by: Ukraine (names Iran) · Denied by: Iran · No account from: Russia".
- **Headline above the tripwires:** a count only, "1 of 4 combat tripwires have a claim on record", and where
  relevant "0 stated by both ends · 1 denied". No sentence says a link between the wars exists or does not.
- A row expands to its definition, its history by date (each entry with what it relied on at the time), and its
  evidence (events and links, each tappable).
- The panel follows the timeline: statuses are shown **as of the cursor date**, with "as of 08 Nov 2026" in the header.
- No totals across the two sections. **No colour escalation at all:** no tripwire state is drawn in a warning colour.

# 10. Empty, loading and error states
| State | Behaviour |
|---|---|
| Loading | The stage shows the basemap immediately; the timeline strip draws from the manifest; panels show skeleton rows. No full-screen spinner |
| Theater with no curated events | Outline drawn, label "No curated events yet — intake only", no markers |
| Window with no events | "No events in the last 7 days" (or the chosen range) on the timeline readout, with a "Show all" button; the map is not re-centred |
| Lens with nothing in view | "Iran has no account on file in this period" in the Events panel and beside the lens tag; the banner stays |
| Fog off and everything in view is a ghost | "Only one-sided accounts in this period · Show fog" on the stage |
| A layer failed | Its row shows "unavailable" with the reason; everything else works |
| A module failed | The error banner names it in plain words and offers Reload and Reset layout |
| Offline | Banner "Offline — showing what was already loaded"; live layers switch off and say why |

# 11. Acceptance checks (used for the Part B self-review and every later slice)
1. At each of the five classes: no two panels overlap, and no control is under a browser bar, cut-out or gesture bar.
2. Every control is at least 48 x 48 px on touch classes.
3. Rotating the device with a panel and an info card open loses neither.
4. System Back from: card open → panel open → nothing open, takes exactly three presses to leave.
5. Phone landscape at 300 px height: rail, side sheet and slim timeline all fully visible and usable.
6. In the detail row, the cursor can be placed on any single step with a finger on the S22 (steps at least 8 px wide), and the band can be dragged to any part of the extent.
7. With text size at 200%, panels scroll and nothing is clipped.
8. Turning every available layer on and then "Reset to default view" returns to events and outlines only.
9. Storage disabled: the app loads on defaults with no error banner.
10. First load: the window is the last 7 days and the range chip says so; **All** shows the whole war; "Today" restores the 7 days.
11. With a lens on, at every class: the lens tag is on the stage; the banner is shown (phone-landscape: in the side sheet and on change); a screenshot of the stage alone shows whose account it is. Opening a copied link reproduces the lens, banner and tag.
12. Changing the lens moves at least one sample marker to the place that party gives, and a record that party has not spoken on is absent.
13. Fog off leaves no ghost or faded ghost on the map or in the Events list; Contested leaves only split markers; both record switches can never be off together.
14. As known then: stepping the cursor back before an entry's publication date removes that entry's effect (a solid sample event becomes a ghost; a moved marker returns to the first place named).
15. Every event card at peek shows the attribution chip and the status line without scrolling, at all five classes.
16. Compare two: the three sample cases (both say it, only one spoke, one denies) draw as the compare table says, with A on the left.
17. No string in the legend, chips, cards, Help or Watchlist says confirmed, verified, unconfirmed, debunked, true or false in WARMAPS's own voice (checked by a script over the built strings).

