---
title: WARMAPS v2 — God's Eye View (GEV) integration spec
version: v0.1
date: 2026-11-02 (War Day 248)
author: Claude (Opus 5.5) for Allan Sanceau
status: DRAFT FOR RULING
upstream: https://github.com/bilawalsidhu/gods-eye-view (MIT License, (c) 2026 Bilawal Sidhu — VERIFIED from LICENSE)
companion: layers.config.json (machine-readable version of section 4)
---

# 1. What was intended (from the record)
OBSERVED from the Sep 18 and Sep 28 records:
- One 3D globe carrying both wars (Iran theater and Russia–Ukraine) on one date scrubber.
- WARMAPS events drawn as a layer on the globe; layers toggle on and off; our tile sets work on it.
- Hosting originally assumed on OSIRIS (GEV ships a small Node server that brokers API keys).
- Parked 2026-09-28 until: dynamic maxDay → backfill → interface → more real sources.

What changes now (Allan 2026-11-02): GEV with everything on is too busy and drifts from WARMAPS's purpose. Import only what serves the mission; keep the rest **deactivated, not deleted**, so it can be folded in later.

# 2. Mission filter (the test every layer must pass)
WARMAPS shows **what happened in the named conflicts, where, when, and how sure we are**, from a declared constitution of sources. A layer belongs only if it:
1. adds evidence or context for a conflict event (not general world activity), and
2. can be clipped to a theater's area of interest (AOI), and
3. carries an honest confidence label (OBSERVED transponder data is not VERIFIED fact).

# 3. Four states (preserve, don't delete)
| State | Meaning | In the menu? | Code in repo? |
|---|---|---|---|
| **ON** | Visible by default | Yes | Yes |
| **AVAILABLE** | Built and tested, off by default, one tap to show | Yes | Yes |
| **DORMANT** | Imported from upstream but disabled by a flag; not built out, not in the menu | No (flag only) | Yes, under `globe/layers/_dormant/` |
| **EXCLUDED** | Not imported. Recoverable from the pinned upstream commit in `globe/UPSTREAM.md` | No | No |

Default view rule (RULED 2026-11-02): **first load shows only the conflict's mapped events and theater outlines.** Every context layer (flights, ships, space, fires, GNSS, installations, cables, dams) is one tap away.

# 4. Layer disposition
| GEV layer | State | Why | Clip / filter |
|---|---|---|---|
| WARMAPS events (ours) | **ON** | The product | Per theater |
| Theater AOI outlines | **ON** | Frames what's in scope | Iran war, RU–UA, East Asia, Caribbean |
| **Military flights** (adsb.lol) | **AVAILABLE** (one tap; RULED 2026-11-02) | Your call: planes in conflict areas | AOI only. Keep: military, government, tanker, AEW/ISR, transport, emergency squawks 7500/7600/7700. Drop: airliners, GA, helicopters (see sub-filters) |
| Live flights, all (OpenSky / adsb.lol) | **DORMANT** | Too much clutter; 11,000+ aircraft | — |
| ↳ Sub-filter "commercial over theater" | **AVAILABLE** (off) | Shows airspace closures by absence: empty skies over Iran are evidence | AOI only, airliners only, density not icons |
| **Live vessels** (AISStream) | **AVAILABLE** | Your call: shipping in conflict zones. Server relay required by AISStream | AOI chokepoints only: Hormuz/Gulf of Oman, Bab el-Mandeb/Red Sea, Black Sea/Kerch, Taiwan Strait, Caribbean. Keep: tanker, cargo, military/law enforcement, SAR, vessels near an event. Drop: fishing, pleasure, tug, passenger (unless near an event) |
| **GNSS integrity** (GPSJAM via adsb.lol) | **AVAILABLE** | Jamming/spoofing is itself conflict evidence, and it tells you when ship/plane positions are unreliable | AOI only; shown automatically as a warning tint when vessels are on |
| **Active fires** (NASA FIRMS) | **AVAILABLE** | Satellite heat detections corroborate strikes (standard OSINT practice) | AOI only, last 24 h at scrubber date; free key |
| **Mapped installations** (OSM military) | **AVAILABLE** | Context for strike targets | AOI only; labeled "community-mapped, incomplete" |
| Submarine cables (bundled) | **AVAILABLE** | Red Sea and Baltic cable damage is part of these conflicts | AOI only |
| Dams (bundled) | **AVAILABLE** | Kakhovka-type events (RU–UA) | AOI only |
| Earthquakes (USGS) | **DORMANT** | Occasionally relevant (underground strike or test signatures); noisy otherwise | — |
| **Satellites over theaters** (CelesTrak) | **AVAILABLE** (RULED 2026-11-02) | Which satellites pass over a conflict area at the scrubber time | Objects whose ground track crosses an AOI within ±30 min; military/earth-observation groups first; Starlink dense shell stays off |
| **Significant space objects** (CelesTrak) | **AVAILABLE** (RULED 2026-11-02) | ISS, Tiangong and a short curated list, shown wherever they are | Fixed list in layers.config.json |
| **Launches** (Launch Library 2) | **AVAILABLE** (RULED 2026-11-02) | Recent and upcoming launches worldwide (SpaceX, Iran, China, Russia, North Korea) | Last 30 days + next 14; cached daily, not live, to stay inside the free quota |
| Wind / observed weather / clouds | **DORMANT** | Operational context; clutter by default | — |
| Radio (regional broadcasters) | **DORMANT** | Possible future "listen to the region" feature | — |
| Visual modes (NVG, FLIR, CRT, Noir shaders) | **DORMANT** | Presentation mode later; cinematic, not evidentiary | — |
| Voice control (OpenAI Realtime / Gemini) | **DORMANT** | WARMAPS already has a multi-provider AI panel; revisit later | — |
| Contacts roster (250 km) | **DORMANT** | Could become "assets near this event" in an info card | — |
| Google Photorealistic 3D Tiles | **DORMANT** (optional key) | Metered or non-commercial; the default Esri imagery plus keyless terrain is enough | — |
| Datacenters (bundled) | **DORMANT** | Off-mission today | — |
| Cyclones | **EXCLUDED** | Off-mission | — |
| Detection boxes / military HUD overlay | **EXCLUDED** | Cosmetic; implies precision we don't have | — |
| CCTV mesh, ALPR cameras, Street Level | **EXCLUDED** | Off-mission, and surveillance-of-civilians content conflicts with WARMAPS's ethics | — |
| Transit, bikeshare, traffic simulation, directions | **EXCLUDED** | Civilian/urban utility; traffic is simulated, not observed | — |
| Air quality (Canada), US fire perimeters, Nepal flood scene | **EXCLUDED** | Region-specific, off-mission | — |

Net: **2 ON, 11 AVAILABLE, 9 DORMANT, 12 EXCLUDED.** The menu shows 13 items, not 30.

Performance guard for space layers: a few hundred orbits computed in the browser (SGP4) is light; positions update every few seconds, not every frame; the Starlink shell (thousands of objects) stays off. If the Fire tablet struggles, the space layers drop to 2D ground tracks (INFERRED; test in P6).

# 5. Accuracy rules for live tracks (fog of war)
- Every aircraft or ship icon is **OBSERVED (self-reported transponder)**, never VERIFIED.
- **Absence is not evidence of no activity.** Combat aircraft routinely fly with transponders off; what shows is mostly tankers, ISR and transports. Info card text says so.
- **Gulf AIS is unreliable.** GPS jamming and spoofing near Hormuz have been widely reported in 2026 (gCaptain, Windward, Scientific American). Ships inside an active-jamming tint get a "position may be spoofed" badge.
- Live layers only show when the scrubber is at today. Past dates need **our own archive** (section 7).

# 6. Ethics, terms and the honest-access rule
- **adsb.lol**: data licensed ODbL 1.0, "available to everyone" (VERIFIED on its API page). Needs attribution and share-alike for any derived database.
- **AISStream** (reviewed 2026-11-02): free; no terms-of-service page exists (/terms, /tos and /terms-of-service all 404; the only legal page is a privacy policy with no usage terms). Its own documentation tells developers to "connect from your own server and proxy only the data each client needs", which is exactly a website relay, so public display is treated as permitted, with attribution. Hard limits: bounding boxes required, 3 connections per account and per IP, no direct browser connections, no uptime guarantee, per-user bandwidth limits on uncompressed connections from Sep 2026 (use compression). A courtesy note to them is optional, not a gate.
- **OpenSky**: non-commercial research terms (DORMANT anyway).
- **No self-imposed delay (RULED by Allan 2026-11-02).** WARMAPS shows provider data as the provider publishes it. Delays and exclusions are the provider's call, not ours; adding our own would exceed scope and blunt the airspace-closure and shipping signals. Every track still carries its source, timestamp and OBSERVED label.

# 6a. How "live" works, and what it costs
- **Archive (history):** a scheduled sampler takes discrete snapshots inside the AOIs (e.g. a few minutes each hour) and saves daily files. This is what the date scrubber replays. Runs on GitHub Actions or OSIRIS; no AI; free or near-free.
- **Live view (today only):** nothing streams in the background. When someone opens the globe at today, *their browser* polls the provider every ~10–30 s for the visible AOI only, and stops when the tab closes or the scrubber leaves today.
  - Aircraft (adsb.lol, no key): the browser calls the provider directly. Our cost: zero. Load falls on the provider, so poll gently and respect any rate limits.
  - Ships (AISStream, keyed WebSocket): the key cannot sit in browser code, so a small relay holds it: a Cloudflare Worker or a process on OSIRIS. Cost: small; Cloudflare's free tier may cover light use, a long-held stream may need the $5/month Workers paid plan or simply run on OSIRIS you already pay for (INFERRED; confirm in the build).
  - No Claude model is in the live loop. Model cost is only the nightly event curation.
- Keys never ship in browser code: a Cloudflare Worker (or OSIRIS later) brokers them, as GEV's own server does.

# 7. Architecture: graft, don't fork
The Sep 18 plan said "a WarMaps event layer on a GEV fork." With the one-repo ruling, a **selective graft** fits better:
- New folder `globe/` in the WARMAPS repo: CesiumJS globe plus only the ON/AVAILABLE/DORMANT layer modules copied from upstream (MIT notice kept), adapted to read `theaters/*/events.json`.
- `globe/UPSTREAM.md` pins the upstream commit hash, so EXCLUDED layers stay recoverable.
- `layers.config.json` is the switchboard: state, AOI clip, filters, source, key, attribution per layer. Changing a layer's state is a one-line edit.
- Hosting: static on Cloudflare like today, plus one small Worker for key brokering. OSIRIS stays optional.
- **Collector for history:** a scheduled job samples aircraft and vessels inside the AOIs (for example 10 minutes every hour) into compact daily files (Cloudflare R2 or a data branch). adsb.lol also publishes openly licensed historical traces that could backfill past aircraft days. AIS history cannot be backfilled cheaply, so **start the collector early**, even before the globe ships.
- 2D Leaflet stays as the fallback and the phone default until the globe performs on the Fire tablet (UNKNOWN until tested).

# 8. Order of work
1. P0–P3 of the v2 plan (unblock, ship v01.09.03, backfill, nightly intake). GEV stays parked.
2. Start the AOI collector (cheap, builds history).
3. v2 data layer: theaters, schema REV B.
4. Globe prototype: events + AOIs + military flights + GNSS. Test on phone and tablet.
5. Add vessels (via the server relay), fires, installations, cables, dams, satellites, space objects, launches.

# 9. Rulings needed
- R-GEV-1: approve the four-state model and the layer table (or move items).
- R-GEV-2: RULED 2026-11-02 — military flights one tap away (AVAILABLE).
- R-GEV-6: RULED 2026-11-02 — add satellites over the theaters, significant space objects (ISS etc.) and launches, subject to the performance guard.
- R-GEV-3: RULED 2026-11-02 — no self-imposed delay; provider data shown as published.
- R-GEV-4: graft into `globe/` rather than fork.
- R-GEV-5: RULED 2026-11-02 — yes, start the AOI collector (sampler) before the globe.
