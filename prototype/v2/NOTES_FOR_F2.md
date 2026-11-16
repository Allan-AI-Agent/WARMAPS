---
title: Document problems found while building the prototype (for the F2 review)
version: v0.2 (2026-11-16, sitting 2: A7, A8, B19 to B23 and section D added). v0.1 (2026-11-15, after sitting 1)
author: Claude (Fable 5.2), session F1c
status: FINDINGS, not rulings. Each row says what the prototype did instead
---

**Bottom line:** the schemas held: 45 sample events, 6 links and 9 watch items were written to the documents and
pass a shape check, the charter test and the reference rules (`check/check.js`). The problems below are mostly
places where two documents disagree, or where a size in the layout spec does not fit what the same spec puts in it.
Evidence labels: VERIFIED = measured or run here; OBSERVED = seen in a headless screenshot; INFERRED = reasoned.

# A. Layout sizes that do not fit (LAYOUT_ENGINE_SPEC)

| # | Problem | Evidence | What the prototype does |
|---|---|---|---|
| A1 | **Phone-portrait timeline, 64 px.** One 44 px row cannot hold the track at the assumed 328 px plus the readout, Play, the range chip and the two-part Record switch (2.3) | VERIFIED: the controls alone need about 340 of 352 px | Three rows: controls 48, track 36, overview with the range chip 28: about 116 px. Costs about 50 px of stage |
| A2 | **Tall and standard timeline with slots open.** With two 360 px slots the stage can be 488 px (4.4); the controls alone need about 650 px | VERIFIED at 1600 x 900 with two panels | Under 1000 px of timeline width the controls take their own row |
| A3 | **Phone-landscape rail at 300 px.** Top group (theater, 2D/3D, layers) + clean view + 4 panel items + More is 9 targets of 48 px = 432 px (2.4, 4.2) | VERIFIED arithmetic; OBSERVED at 780 x 320 | Top group of 4, then as many panel items as fit (1 at 320 px) and More |
| A4 | **Card peek, 96 px**, against "chip and status line always visible at peek" (4.1 against 5) | VERIFIED: header 48 + chips + status line needs about 130 px | Card peek is 132 px; the record's title is in the sheet header; chips scroll sideways at peek |
| A5 | **Tablet-portrait top bar at 800 px**: full filter with four names + lens text + 2D/3D + layers + clean view does not fit (2.2) | OBSERVED: layers button pushed off screen | Brand hidden in this class, tighter padding. Still tight |
| A6 | Check 17 lists `true` and `false` as forbidden words, but the fixed legend footer and Help text say "not what is true" (DESIGN_SYSTEM 2.3, LAYOUT 8a) | VERIFIED by the word check | The word check allows `true` only inside the fixed wording |
| A7 | **Phone-landscape slim timeline, 44 px** (4.2), against 48 px touch targets (check 2) | VERIFIED: every timeline control measured 44 px or less | The row is 48 px. Costs 4 px of stage; the stage is 412 x 252 at 780 x 300 with the sheet open |
| A8 | **Controls that cannot be 48 px where the spec puts them:** the range chip and Today in the phone's 28 px overview row, the lens tag on the stage (28 px), the links in the 32 px lens banner | VERIFIED by measurement | Drawn small with an invisible 48 px touch area (DESIGN_SYSTEM 8 allows this for map markers; the documents do not say it for chrome) |

# B. Rules that are unclear or missing

| # | Where | Problem | What the prototype does |
|---|---|---|---|
| B1 | ARCHITECTURE 3.4.4, reference `attribution.js` | A side on record only through **party** media is labelled "(state media)": "Hezbollah (state media)" | Shown as the reference writes it. Suggest "(party media)" |
| B2 | 3.4.4 part 4 | "Agree it happened" is printed when two **accounts** affirm, observers included, so a one-sided ghost can read "On record: Iran (state media) · Also reporting: UN · Missing: Israel · Agree it happened". Reads as if the sides agree | Shown as the reference writes it. Suggest: only when two sides affirm, or word it "also reported by" |
| B3 | 3.4.4 | Status-line dates come out as `2026-11-05`; the design system wants `05 Nov 2026`. Closed-list ids appear as words ("figures differ on projectiles-launched") | Dates reformatted in the prototype; ids left as they are |
| B4 | 4.4 | No actor `kind` for a political opposition or other unarmed party, though the text says a government and its opposition are separate actors. Is it a side or an observer? | No such actor in the sample |
| B5 | 6.2 | Theater config still carries `sides: [{a: "US + Israel"}, {b: "Iran"}]`: a pre-built bloc, which the lens rules forbid | Field left out of the sample theaters |
| B6 | `docs/v2/layers.config.json` | Has a field named `confidence`; the charter test would reject it if the file were scanned | Not used |
| B7 | DESIGN_SYSTEM 5 | A bundle of links between one pair is one arc: which line style and width when its members differ? | The widest member's; the list shows each link's own |
| B8 | LAYOUT 2.2a | "14 other accounts hidden · accounts on file: 31": accounts counted per record, or distinct parties? | Per record (an account on a record) |
| B9 | ARCHITECTURE 4.2 | Rhetoric items: where the cited statements live and how the trailing window is counted is not in the shape | Cited in `history[].evidence.events`; 90 days; thresholds 1, 3, 5 (prototype values) |
| B10 | 4.2 | Status `both-ends` ("Stated by both ends") is reached by a record that names only one end (an escort has no "against") | Shown as derived |
| B11 | 5.4 | A 7-day window when the cursor sits on a month or week step: 7 days, or the whole step? | The window always covers at least the step under the cursor |
| B12 | 9.1 | Which record layer holds a `no-account` record (claim withdrawn)? | Always listed, never drawn, hidden only by Contested |
| B13 | 3.4.1 | `citing` and `movedFrom` are used in the text but are not rows of the entry-field table | Treated as entry fields |
| B14 | 9.2 | The mark shape given to a renderer has no title or label text, though milestones are labelled; a compare mark at two places needs two drawn positions | Added `title`, `label`, `milestone`; halves carry their own lat and lng |
| B15 | 9.4.1 | Full's terrain needs a keyless terrain source; none is chosen. Cesium's own needs a key | No terrain at any level; night side not built |
| B16 | LAYOUT 2.3, 7 | The band's right edge is the cursor, so "drag the right edge to narrow" and "drag to scrub" are the same gesture | Detail row: left handle changes the width, anything else scrubs. Overview: edges resize when the band is 40 px or wider |
| B17 | DESIGN_SYSTEM 2.8 | Compare half-outlines at 12 px are thin slivers (OBSERVED). May need a larger compare mark | Drawn as specified, 12 px floor |
| B18 | `_headers` | No cache rule for `/prototype/*` or `/v2/*`; a phone may hold an old copy after an update | Untouched (live config). Hard-refresh after updates |
| B19 | LAYOUT 11 check 25 against check 22 | "Narrowing the PC window to phone width groups more marks": the camera is kept on resize, so the zoom and the pixel distances do not change and nothing regroups | Grouping differs between a fresh phone-width load and a fresh PC load (23 against 18 of 30). Say which is meant |
| B20 | LAYOUT 7 against check 18 | Section 7 lists the Back order as popover, card, panel, clean view. Followed literally, Back in clean view closes a panel the reader cannot see, and check 18 ("restores the same panels") fails | Clean view closes before any panel |
| B21 | LAYOUT 2.2 | At 800 px the top bar cannot hold the four theater names and a lens label such as "Compare: Iran / Israel" | The button reads "Compare" or "Lens on" at tablet portrait; banner and tag carry the names |
| B22 | LAYOUT 11 check 7 | At 200% text on a 360 px phone the top bar holds only if a label gives way; which one is not said | The theater name shortens first |
| B23 | DESIGN_SYSTEM 15.3 | The keyline rule names marks; a group badge that is outlined (all members one-sided) is not mentioned | Given the same keyline on imagery |

# C. Not built in the prototype (so not yet tested)
Side-by-side views (section 6) · drag-to-snap and slot dividers (the Move menu is there) · long-press "what's here" ·
the events table in the PC bottom slot · night side and terrain on the globe · arc taper at Full · the Theater brief
panel (stub) · keyboard-open behaviour on phones · offline banner beyond a toast.

# D. Carried over from v1 at Allan's request (2026-11-16): requirements, not yet in the documents

| # | Requirement | State | What the documents need |
|---|---|---|---|
| D1 | **Launch-origin icons: Allan's rocket and drone drawings**, the rocket upright with an animated exhaust flame at its base, three flame variants, and the bold-mode version. v1 code: `index.html` about lines 3281 to 3600 (`_originMarkerIdx`, `_exhaustVariant`, `_rebuildOriginIcons`) | Not built in the prototype | (1) A "Launch origins" layer in the Layers menu and `layers.config.json`, fed by the event field `launch` (ARCHITECTURE 3, v1 `originLat/originLng/originName`). (2) A line in DESIGN_SYSTEM 12.1 saying these icons are their own symbols, like tracks, and are not theater shapes. (3) The flame under the motion rules (section 6): still under reduced motion and at Lite. (4) The charter point: v1's `originKnown: "probable"` is a truth grade and is not carried; the layer shows who named the launch point |
| D2 | **Author credit: "Allan Sanceau", lower left, a red letter-by-letter wave every 60 seconds** (v1 `index.html`, "AUTHOR NAME WAVE") | Built in the prototype: lower left of the stage, hidden in clean view, no wave under reduced or calm motion | A line in LAYOUT 2.1 placing it; whether it shows in clean view (check 18 lists what may); ARCHITECTURE 6 says the byline text is a setting, so the name comes from config |
