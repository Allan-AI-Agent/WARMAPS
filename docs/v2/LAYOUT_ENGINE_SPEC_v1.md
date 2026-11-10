---
title: WARMAPS v2 — Layout Engine Spec v1 (the panel system)
version: v1.0
date: 2026-11-10 (Iran-war Day 256)
author: Claude (Fable 5.2), session F1, for Allan Sanceau
status: DRAFT FOR RULING — exact behaviour for the prototype (Part B) and slice 1
companions: ARCHITECTURE_v1.md (store, renderer contract), DESIGN_SYSTEM_v1.md (how things look)
---

# 0. Read this first (one screen)

**The one rule that fixes v1's overlap bugs:** panels live in **slots that tile the screen**. A slot has a place
and a size; a panel sits in a slot. Slots never overlap each other, so panels cannot either. (v1 positions each
panel independently, which is how "IRAN MISSILE WAVES over AIRSPACE STATUS" happened — OBSERVED in STATE.md.)
The only things allowed to float above the map are the sheet on a phone, popovers, and free-floating panels on a PC.

**Five regions, always in the same order of importance:**
1. **Stage** — the map or globe. Always present, always the largest thing.
2. **Timeline** — always present, attached to the stage.
3. **Top bar** — theater filter, 2D/3D switch, layers button.
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
Left to right: menu/brand → **theater filter** → spacer → **2D | 3D** switch → **Layers** button → overflow.

| Class | Height | Changes |
|---|---|---|
| phone-portrait | 48 | Theater filter collapses to one chip showing the current choice ("Iran war ▾", "All theaters ▾"); tapping opens a small menu. Brand becomes the mark only |
| phone-landscape | none | The top bar is removed. Its controls move to the top of the left rail (theater chip, 2D/3D, layers) |
| tablet (both) | 56 | Full segmented theater filter with names |
| pc | 48 | Full filter, plus search, plus the date readout duplicated at right |

**Theater filter behaviour:** segments are toggles, with "All" as a shortcut. One theater on = single-theater mode
(the AOI is framed, outside dimmed). Two or more on = multi mode (camera frames all selected AOIs; the Links layer
becomes available but stays off). Theaters with status `intake-only` show greyed with "no curated events yet".

## 2.3 Timeline
Always visible. Three heights:

| State | Height | Contents | Where used |
|---|---|---|---|
| `slim` | 44 | Cursor track, date readout, play button | phone-landscape always; anywhere after the user collapses it |
| `standard` | 64 | + density strip coloured by theater, window handles | phone-portrait, tablet-portrait |
| `tall` | 88 | + band labels (2022 ... 2026), milestone ticks, per-theater day numbers | tablet-landscape, pc |

- Readout: `08 Nov 2026` in data type, then per active theater `IR Day 254 · RU Day 1,719`. Calendar date first
  (decision 7). In single-theater mode the day number moves up beside the date.
- Handles are 28 px drawn inside a 48 px hit area, centred on the track. This replaces v1's oversized default
  range-input thumbs that sat below the line (OBSERVED by Allan, 2026-11-02): the v2 timeline is a custom control,
  not a browser range input.
- Step buttons (previous / next step) sit at the ends on tablet and PC, and inside the readout's menu on a phone.
- A "Today" button appears whenever the cursor is not at the end.

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
| Chips | Theater chip(s) · **confidence badge** · kind | Theater chips · **confidence badge** · direction | **OBSERVED** chip · source · time |
| Peek body | Date (and day number) · place · first sentence | Actors A → B · date range · evidence count in window | Position time, speed, heading; warning line if in a jamming area |
| Expanded | Detail fields; fog note in its own block; **Sources** list (publisher, date, access); verification line; related links; "updated" if `rev > 1` | Summary; **observations** list by date, each with sources and linked events; the legend sentence about weight | "Transponder data is self-reported. Absence is not evidence of no activity." Provider attribution |
| Actions | Show on map · Show on timeline · Copy link · Previous / next in time | Show both ends · Filter events to these actors · Copy link | Follow (today only) · Copy link |

Rules:
- The confidence badge is always in the first row and never scrolls away at peek.
- A fog event's card opens with the fog note **above** the description, so the caveat is read first.
- Sources are real links that open in a new tab; a source with `access: "snippet-only"` or `"refused"` says so.
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
| | Tap marker | Select → info card at peek |
| | Tap empty map | Deselect; closes an unpinned sheet |
| | Long-press empty map | "What's here": events within the area for the current window |
| | Double-tap | Zoom in one step |
| Sheet | Drag handle or header | Change detent / close |
| | Drag in body | Scroll content (never moves the map) |
| Card at peek | Swipe left / right | Next / previous event in time |
| Timeline | Drag on track | Scrub the cursor |
| | Drag a handle | Move a window edge |
| | Pinch on the strip | Zoom the time scale (tablet, PC trackpad) |
| | Double-tap | Jump to today |
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
- The **legend** always reflects exactly what is on: theater shapes, tier sizes, confidence fills, and, when Links
  are on, the arc key and its fixed sentence. Nothing is in the legend that is not on the map.
- "Reset to default view" returns to events and outlines only.

# 9. Watchlist panel
- Two sections that look different on purpose: **Combat tripwires** (status chips: NOT SEEN / REPORTED / CONFIRMED,
  with the fixed headline sentence above them) and, below a divider and a heading in smaller type, **Rhetoric and
  mobilization** (four-step meter: quiet / noted / elevated / sustained, with the caption "Statements and
  preparations. Weaker signal. Cannot change a tripwire.").
- A row expands to its definition, its history by date, and its evidence (events and links, each tappable).
- The panel follows the timeline: statuses are shown **as of the cursor date**, with "as of 08 Nov 2026" in the header.
- No totals across the two sections. No colour escalation beyond the single `state-alert` on a confirmed tripwire.

# 10. Empty, loading and error states
| State | Behaviour |
|---|---|
| Loading | The stage shows the basemap immediately; the timeline strip draws from the manifest; panels show skeleton rows. No full-screen spinner |
| Theater with no curated events | Outline drawn, label "No curated events yet — intake only", no markers |
| Window with no events | "No events in this period" on the timeline readout; the map is not re-centred |
| A layer failed | Its row shows "unavailable" with the reason; everything else works |
| A module failed | The error banner names it in plain words and offers Reload and Reset layout |
| Offline | Banner "Offline — showing what was already loaded"; live layers switch off and say why |

# 11. Acceptance checks (used for the Part B self-review and every later slice)
1. At each of the five classes: no two panels overlap, and no control is under a browser bar, cut-out or gesture bar.
2. Every control is at least 48 x 48 px on touch classes.
3. Rotating the device with a panel and an info card open loses neither.
4. System Back from: card open → panel open → nothing open, takes exactly three presses to leave.
5. Phone landscape at 300 px height: rail, side sheet and slim timeline all fully visible and usable.
6. The timeline cursor can be placed on any single day in a daily band with a finger on the S22.
7. With text size at 200%, panels scroll and nothing is clipped.
8. Turning every available layer on and then "Reset to default view" returns to events and outlines only.
9. Storage disabled: the app loads on defaults with no error banner.
