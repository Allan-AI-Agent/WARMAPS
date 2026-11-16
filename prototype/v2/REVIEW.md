---
title: WARMAPS v2 prototype — self-review at five form factors (F1c sitting 2)
version: v1.0 (2026-11-16)
author: Claude (Fable 5.2), session F1c sitting 2, run unattended
status: REVIEW of a throwaway prototype. Headless only. Nothing here has been seen on a real device
---

**PROTOTYPE SAMPLE - NOT REAL DATA.**

# 0. Bottom line

- **All 28 acceptance checks of LAYOUT_ENGINE_SPEC section 11 now pass where a script can test them.** Four are
  passed only in part; section 2 says which part is untested.
- **Seven failures were found and fixed** in this sitting (section 3). The largest: most touch controls were 44 px
  or smaller, not 48; and Back or Escape in clean view closed a hidden panel before restoring the controls.
- **Text contrast as drawn: lowest 4.86:1** (Paper, PC), above the 4.5:1 rule, in all three themes at all five sizes.
- **Your author credit with the red name wave, and your rocket and drone icons with the exhaust flame, are in the
  prototype** (section 6). The icons are a new "Launch origins" layer, off by default.
- **Not seen here at all:** real map tiles, real devices, touch feel, real frame rates, sunlight. Section 5.

Evidence labels: VERIFIED = measured by a script in this sitting. OBSERVED = seen in a headless screenshot.
INFERRED = from reading the code. NOT TESTED = said so.

# 1. What was run

| Run | What it covers | Result |
|---|---|---|
| `node check/check.js` | Sample data against the schemas, charter test, rules against the reference, themes, word check | 5,532 pass |
| `node check/headless/functional.js` | 38 behaviour checks at 1280 x 760 touch (sitting 1's script) | all pass |
| `node check/headless/sweep.js` | 5 sizes x 15 states (3 themes; panel, card, panel + card, links, watchlist, lens, compare, clean view, As known then, settings, help, layers) plus the globe at phone landscape and PC: 77 screenshots, each measured for regions overlapping, controls under 48 px, things off screen, clipped text | clean after fixes, apart from the three expected items in section 4 |
| `node check/headless/origins.js` | The Launch origins layer at PC, tablet and phone: off by default, six points, flame animated, Lite, calm motion, Reset, globe | 21 of 21 |
| `node check/headless/checks2.js` | 64 checks: lens, card peek, clean view and contrast at each of the five sizes; rotate, Back, timeline steps, 200% text, storage off, view tag, tour, 300 px landscape, declutter, satellite | all pass after fixes |
| By eye | About 20 of the screenshots, at least two per size | notes in sections 3 and 4 |

Sizes: 360 x 700 phone portrait, 780 x 320 phone landscape (also 780 x 300), 800 x 1200 tablet portrait,
1280 x 760 tablet landscape, 1600 x 900 PC. Screenshots are in `check/headless/shots/` and are not committed.

# 2. The 28 acceptance checks

| # | Check | Result | Evidence and limits |
|---|---|---|---|
| 1 | No panels overlap; no control under a browser bar | **Pass after fix** | VERIFIED: regions measured in 77 states. Browser bars, cut-outs and the gesture bar do not exist headless: NOT TESTED |
| 2 | Every control 48 x 48 on touch | **Pass after fix** | VERIFIED. Two things stay smaller: the Cesium credit link on the globe (third-party) and four controls drawn small with a 48 px touch area (section 4) |
| 3 | Rotate with panel and card open | Pass | VERIFIED: 360 x 700 to 700 x 360 and back keeps both |
| 4 | Back: card, panel, then leave | Pass | VERIFIED at phone portrait: three presses |
| 5 | Phone landscape at 300 px: rail, sheet, timeline whole | Pass | VERIFIED at 780 x 300; the stage is 412 x 252 with the sheet open |
| 6 | Cursor on any single step; band draggable | **Part** | VERIFIED: steps are 10 px wide at 360 px, one tap moves the cursor. Dragging the band with a finger: NOT TESTED |
| 7 | 200% text: panels scroll, nothing clipped | **Pass after fix** | VERIFIED at phone portrait. OBSERVED: the theater name shortens to "I…" and the Settings body is 8 px wider than its frame |
| 8 | Reset returns to events and outlines | Pass | VERIFIED |
| 9 | Storage off: loads, no error banner | Pass | VERIFIED |
| 10 | 7 days first; All; Today | Pass | VERIFIED |
| 11 | Lens tag, banner, link | Pass | VERIFIED at all five sizes; the copied link reproduces lens and tag |
| 12 | Lens moves a marker; silent record absent | Pass | VERIFIED |
| 13 | Fog off, Contested, never both off | Pass | VERIFIED |
| 14 | As known then | Pass | VERIFIED: solid becomes ghost at the first place named, then absent |
| 15 | Card at peek shows chip and status line | Pass | VERIFIED at all five sizes. OBSERVED: the status line is cut short at phone width ("Denied by …") |
| 16 | Compare two: three cases | Pass | VERIFIED by data. OBSERVED: half-outlines are thin slivers (NOTES B17) |
| 17 | No forbidden word in WARMAPS's voice | Pass | VERIFIED by the word check |
| 18 | Clean view and restore | **Pass after fix** | VERIFIED at all five sizes |
| 19 | Clean-view screenshot says whose account, period, record date, changed layers | Pass | VERIFIED with Fog hidden, On the record hidden, Contested only, As known then, and a lens |
| 20 | Themes change no shape, size, look or wording | Pass | VERIFIED: legend wording identical in all three. Shapes and sizes: INFERRED, one drawing routine |
| 21 | Theme validator; bad files rejected | Pass | VERIFIED |
| 22 | Theme, map style, detail leave camera and state | **Part** | VERIFIED for theme and camera. Map style and detail against every state item: NOT TESTED one by one |
| 23 | Satellite: every mark readable | **Part, after fix** | VERIFIED: every mark now carries the dark keyline. Readability over real imagery: NOT TESTED, tiles could not be reached here |
| 24 | Same rows at Lite, Standard, Full | Pass | VERIFIED for rows and entry counts. "Seen by eye" card by card: not done |
| 25 | Narrower groups more; milestones never group | **Part** | VERIFIED: the same window groups 23 of 30 marks at phone width and 18 of 30 on PC. Resizing one window does not regroup, because the camera is kept (NOTES B19). Milestones: INFERRED from the code |
| 26 | Phone landscape 300 px: 2D and globe usable; tap opens card | **Part** | VERIFIED: a tap on a 2D mark opens its card; the globe draws marks. A tap on a globe mark: NOT TESTED |
| 27 | No studio without the flag | Pass | VERIFIED. "Save disabled while a check fails": NOT TESTED this sitting |
| 28 | Tour can be declined, skipped, replayed; never blocks | Pass | VERIFIED: offer has Start and Not now; Layers works with the tour showing; Escape ends it. Replay from Help: called directly, the Help button itself not clicked |

# 3. What failed and was fixed

| # | Failure | Fix |
|---|---|---|
| 1 | **Touch targets.** Panel header buttons, timeline buttons, 2D/3D, the brand button and others were 44 px; the range chip, Today, legend toggle and small buttons 32 to 36; the lens tag 28; the banner text 21 | 48 px on every touch size. The phone-landscape timeline is now 48 px high, not 44 (NOTES A7) |
| 2 | **Phone portrait: the Layers button was pushed off the right edge** (339 to 387 of 360 px) | Tighter top bar; the theater button shortens its text |
| 3 | **Tablet portrait and PC: with a lens on, Layers and Clean view were pushed off screen** by the long lens label | The lens button gives way. At tablet portrait it reads "Compare" or "Lens on"; the banner and tag carry the names |
| 4 | **Clean view: Back or Escape closed a hidden panel first**, so the controls came back with a panel missing | Clean view is now the first thing closed |
| 5 | **Satellite: outlined group badges had no dark keyline** | Added, on imagery only |
| 6 | **200% text on a phone:** Layers, the date and Play went off screen; Settings option rows ran off the side | Timeline controls wrap; option rows wrap |
| 7 | **Phone landscape: the "device is working hard" notice sat in the middle of the stage** | Moved to the bottom |

# 4. What is left

| Item | State |
|---|---|
| Four controls drawn under 48 px with a 48 px touch area: range chip and Today in the phone's overview row, lens tag, banner links | Their touch areas reach a few pixels into the neighbouring row. Needs a finger |
| Menus open over the legend and record switches | Expected: an open menu is on top |
| Map marks can sit outside the visible map | Expected: map content |
| Timeline on a phone is now about 128 px (was 116; the spec says 64) | The track went from 36 to 48 px. NOTES A1 |
| 7 new document problems | `NOTES_FOR_F2.md` A7, A8, B19 to B23: 31 in all |
| Independent checker on the prototype | **Not run.** Needs your go (section 7) |

# 5. What a headless browser cannot tell

- **Touch feel:** whether 48 px targets, the sheet drag, the timeline scrub and pinch-zoom feel right under a finger.
- **Real device performance:** the globe ran under software drawing here, so every frame rate is meaningless.
- **Legibility:** sunlight on the Fire, arm's length on the S22, the 7 px dots and 1.25 px ghost rings.
- **Real map tiles:** the tile host is blocked in this workspace, so every map was drawn over a blank ground.
- **Browser furniture:** address bar, notch, gesture bar, the on-screen keyboard.
- **Colour as your eyes see it:** amber against sky blue, the two compare colours, Classic's glow.

# 6. Carried over from v1 at your request (2026-11-16)

| Item | State |
|---|---|
| **Author credit, "Allan Sanceau", lower left, red letter wave** | **In the prototype.** Lower left of the stage at all five sizes. One wave on load and every 60 seconds, half a second a letter, as in v1. No wave when the device asks for reduced motion or motion is set to calm. Hidden in clean view, because check 18 lists what clean view may show (question 7 below) |
| **Rocket and drone launch-origin icons, with the exhaust flame in bold mode** | **In the prototype**, as a "Launch origins" layer (Layers menu, off by default, 2D map only). Your drawings are carried over unchanged from v1 `index.html`: the upright rocket with the flag on its body and the three flame variants, and the delta-wing drone with its glow and contrail. The bold form with the moving flame shows at Standard and Full detail; at Lite the icons stay without the flame; reduced or calm motion stops the movement. Six invented sample launch points. Pointing at one (PC) or tapping it (touch) says who named the point. VERIFIED by `check/headless/origins.js`, 21 checks. Limits: not drawn on the globe; on a phone at the opening zoom the event marks' touch areas cover the icons, so a tap opens the event; sizes do not yet grow with zoom as in v1. What the documents need: `NOTES_FOR_F2.md` D1 |

# 7. Questions only you and your devices can answer

Open the page on the S22 and the Fire. Settings, "About this device", "Copy these numbers" gives me the measurements.

1. **Decision 8:** Classic or Ops as the default theme, judged on both devices.
2. **Decision 6** (Settings, "Try the open decisions": A, B, C): do the plain carried-over marks read well beside ghosts?
3. **Decision 9** (A, B, C): with each rule for solid, does the map still look alive with Fog off?
4. **Item d1 and d3** switches: confirm or change.
5. The three 2026-11-12 rulings: the 7-day opening window, the globe on phone landscape, clean view.
6. Sizes: are 7 px dots and the ghost ring visible at arm's length? Do the compare half-marks read at all?
7. Should your author credit also show in clean view, so it is on screenshots?
10. Launch origins layer (Layers menu): do the rockets and drones look as you drew them, and is the flame right? The flag on the rocket is drawn where the sample statement names Iran as the launcher: keep it?
8. Phone timeline at about 128 px: acceptable, or should the overview row go?
9. Design system section 11, the rest: amber and sky blue in daylight, the single yellow for links, Paper's faded marks outdoors, the mint and coral theater colours.

# 8. Charter check (sitting 2)

**Nothing added in this sitting grades truth.** The changes are sizes, positions, a keyline, a closing order, the
Launch origins layer and
the author credit. The credit names the author; it attaches to no event, link or watch item. The Launch origins
layer says who named each launch point and gives it no look or grade; v1's `originKnown: "probable"` is not carried. The word check over the
built strings still passes. The two wording points from sitting 1 (NOTES B1, B2) are unchanged and still yours to
rule on. An independent checker has not been run on the prototype.
