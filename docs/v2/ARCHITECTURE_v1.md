---
title: WARMAPS v2 — Architecture v1 (data model and app architecture)
version: v1.0
date: 2026-11-10 (Iran-war Day 256)
author: Claude (Fable 5.2), session F1, for Allan Sanceau
status: DRAFT FOR RULING — nothing here is built. Decisions are collected in F1_DECISIONS_FOR_ALLAN.md
companions: DESIGN_SYSTEM_v1.md, LAYOUT_ENGINE_SPEC_v1.md, RELEASE_PLAN_v1.md, layers.config.json, WARMAPS_v2_GEV_INTEGRATION_SPEC
supersedes: nothing; extends WARMAPS_v2_PLAN v0.1 sections 2-3 (repo layout, data layer)
---

# 0. Read this first (one screen)

**The idea.** WARMAPS v2 is one connected system that can be shown as separate theaters. Four record
types, one clock, two renderers:

| Record | What it is | Lives in |
|---|---|---|
| **Event** | Something that happened, at a place, on a date, with sources and a confidence state. Belongs to one or more theaters | `theaters/<theater>/events-<year>.json` |
| **Link** | A sourced relationship between two actors across or within theaters (weapons, intelligence, finance, energy/shipping, personnel, backing) | `links/links.json` |
| **Watch item** | A convergence tripwire (combat track) or a rhetoric/mobilization signal (weaker track) with a status history | `watchlist/watchlist.json` |
| **Track** | A live or archived aircraft/vessel position. OBSERVED, never an event | provider (live) or the history data branch |

- **One clock:** the shared timeline runs on calendar dates. "Day N" is a per-theater label derived from the date.
- **Two renderers:** Leaflet (2D) and Cesium (3D globe) are interchangeable views over one in-memory store. Neither owns data.
- **Every slice is additive.** The v1 app is not touched until cutover; v2 is served at `/v2/` from generated data.

**The five choices that shape everything else** (each is a decision for Allan, see the decisions file):
1. No build step: plain ES modules served as static files (keeps the phone-driven, validate-then-push workflow).
2. v1's `warmaps-data.js` stays the master for Iran events until cutover; v2 reads JSON **generated** from it plus a sidecar for the new fields. No double entry.
3. Event IDs become `IR-0001` style strings formed mechanically from today's numbers; the old number is kept as `legacyId` forever.
4. Calendar date is the shared axis; war-day numbers are secondary labels.
5. Links and the watchlist are data with validator-enforced honesty rules (fog defaults, "rhetoric cannot trip combat"), not UI conventions.

**Evidence labels used in this document**
- VERIFIED: read directly from the repo in this session (commit `0f4dbc3`, 600 events).
- OBSERVED: reported by Allan or recorded in STATE.md.
- INFERRED: my reasoning from verified facts.
- SPECULATION: untested targets, especially every performance number in section 9.

---

# 1. What exists today (VERIFIED from the repo, 2026-11-10)

Facts that constrain the design. Counts come from loading `warmaps-data.js` in Node this session.

| Fact | Value | Design consequence |
|---|---|---|
| Events | 600, ids 1-600, integer, continuous | Mechanical ID migration is safe; validator already enforces continuity |
| Fields on every event | `id type city country lat lng date time attacker structuralDmg humanCasualties` | Become the v2 core, renamed only where a name collides |
| `date` formats | 537 plain ("Mar 11, 2026"), 63 ranges or annotated ("Feb 28 – Mar 1, 2026", "Feb 28 - ongoing", "Dec 2025 (signed) / Feb 22, 2026 (revealed)") | v2 needs `dateISO` + `dateEndISO` + `datePrecision`; 63 events need a rule, a few need a human look |
| `type` values | 15, mixing **who** (us, iran, joint, hez) and **what** (naval, radar, energy, political, intel, isr...) | v2 splits into `kind` (what) and `actors` (who); the old value is kept as `legacyType` |
| `attacker` | 299 distinct free-text strings ("US + Israel", "US+Israel", "Israel (IDF)", "Israel Defense Forces"...) | Actor normalisation is a separate reviewed pass, not part of the mechanical migration |
| Fog | 15 events have real fields (`fogOfWar fogStatus fogLean fogNote fogSources fogCheckpoint`); 124 carry `FOG OF WAR:` text in `misc` | Both map to `fog: true`; the structured block is preserved |
| Sources | `source` on 200; URLs or "Source:" inside `misc` on 373; structured `sources[]` exists only in `research/backfill-pass2/` for ids 386-600 | `sources[]` is filled where it exists; the rest are honestly marked `legacy-unlisted` |
| Tiers | Two unrelated things share the word: research tiers (milestone/major/standard, ids 386-600 only, not in the app) and Key Strike tiers (6 categories, 33 ids) | v2 names them apart: `tier` and `significance` |
| `originLat/originLng/originName/originKnown` | 12 events; means **launch point geography** | Collides with REV B's `origin` (provenance). v2 renames the old ones to `launch.*` |
| `perspective`, `verified` | 176 events (older) | Kept under `legacy`; not mapped to `claimStatus` automatically (see 3.4) |
| Other data | `airspaceData`, `navalAssets` (positions keyed by war day), `statPerspectives`, `flagData`, `keyStrike*`, `AI_PROMPT` | Become per-theater files (section 6) |
| App | One 310 KB `index.html`, 9 inline scripts, Leaflet 1.9.4 from cdnjs, Esri basemaps (no key), no build step, no service worker in use | v2 is a new shell beside it, not a refactor of it |
| Epoch | Feb 28 2026 = Day 1, single source `parseWarDay`/`warDayNow` | Carried over as a per-theater config value plus one shared function |
| Deploy | Cloudflare serves `main` as static files; `_headers` sets `no-store` on `/` | `/v2/` and `/prototype/v2/` deploy with no new infrastructure |
| Intake | GitHub Actions nightly, 37 feeds, raw output on branch `intake-data` | Candidate drafting attaches here (section 8) |
| Upstream globe | `bilawalsidhu/gods-eye-view` at commit `bb40ac5` (2026-11-09): MIT, v0.3.0, Vite build, Node >= 24 server, CesiumJS ^1.124, about 200 source modules, 159 MB checkout | It cannot be dropped in. The graft is a small set of adapted modules (section 7.4) |

One stale item found, not fixed here: the KEY FIELDS table in `STATE.md` still says 385 events / Day 170 while the
header says 600 / Day 254. The header is correct (VERIFIED by count).

---

# 2. Principles

1. **Source discipline is structural.** A record cannot enter a published file without sources, a date, a confidence state and a fog flag. The validator rejects it; the UI never has to guess.
2. **Provenance is not credibility.** `origin` records who is the source of a claim. `claimStatus` records how well it is established. They are separate fields and never derived from each other.
3. **One clock, one store, many views.** State lives in one place. Views subscribe. A view can be destroyed and recreated without losing anything.
4. **Additive only.** A later slice adds files, fields and modules. It may not rename a published field or re-key a published ID. New optional fields default to "unknown", never to a plausible value (the F-003 lesson: a plausible wrong value costs more than a blank).
5. **Failure is loud and local.** Each module initialises behind its own guard and reports to a visible banner (the F-001 cure, kept). One dead panel never blanks the app.
6. **Restraint by default.** First load shows events and theater outlines only. Links, the watchlist and every context layer are one tap away, per ruling.
7. **Nothing about convergence is asserted by the software.** The system shows links and tripwire states with evidence. It never computes or displays a prediction.

---

# 3. Event schema v2 (REV B)

## 3.1 Shape

```json
{
  "id": "IR-0412",
  "legacyId": 412,
  "theater": ["iran-war"],
  "dateISO": "2026-09-03",
  "dateEndISO": null,
  "datePrecision": "day",
  "timeNote": "~02:00 local",
  "kind": "strike",
  "legacyType": "iran",
  "title": "Short display title, at most 80 characters",
  "place": "Haifa — Bazan refinery",
  "country": "Israel",
  "lat": 32.79, "lng": 35.05,
  "geoPrecision": "site",
  "actors": { "by": ["iran.irgc"], "against": ["israel"], "normalized": false },
  "attackerText": "Iran (IRGC)",
  "tier": "major",
  "significance": null,
  "fog": true,
  "fogDetail": { "status": "disputed", "lean": "toward_confirmed", "note": "...", "parties": ["IDF", "IRGC"], "checkpoint": "2026-10-05" },
  "claimStatus": "claimed",
  "origin": { "class": "party", "party": "iran.irgc", "name": "IRGC statement via Tasnim" },
  "sources": [
    { "url": "https://...", "publisher": "Reuters", "published": "2026-09-03", "kind": "wire", "access": "read" }
  ],
  "sourcesStatus": "listed",
  "verification": { "status": "pass", "pass": "backfill-pass2", "date": "2026-11-09" },
  "detail": {
    "target": "...", "weapon": "...", "weaponCap": "...",
    "structuralDmg": "...", "humanCasualties": "...",
    "launchOrigin": "...", "misc": "..."
  },
  "launch": { "lat": null, "lng": null, "name": null, "known": false },
  "legacy": { "perspective": "multi", "verified": true, "time": "Day 188" },
  "rev": 1
}
```

## 3.2 Field rules

| Field | Type | Required | Rule |
|---|---|---|---|
| `id` | string | yes | `<PREFIX>-<4+ digits>`. Prefix names the **home theater** (IR, RU, EA, CB). Never reused, never renumbered after publication |
| `legacyId` | integer or null | Iran only | The v1 number. `IR-0412` and `412` are the same event forever |
| `theater` | string[] | yes, at least 1 | First entry is the home theater. Add more when the event is material to another theater (see 3.3) |
| `dateISO` | `YYYY-MM-DD` | yes | Start date, in the event's local calendar day as reported. Date only: no time zone, no timestamp |
| `dateEndISO` | date or null | no | For ranges. `null` = single day. The string `"ongoing"` is not allowed; an open range uses `datePrecision: "ongoing-from"` |
| `datePrecision` | enum | yes | `day`, `range`, `week`, `month`, `year`, `ongoing-from`. Drives how the timeline places the event (section 5) |
| `kind` | enum | yes | **What happened.** Shared vocabulary: `strike`, `interception`, `ground`, `naval`, `air-defense`, `infrastructure`, `energy`, `shipping`, `cyber`, `intel`, `deployment`, `political`, `diplomatic`, `economic`, `humanitarian`, `statement`. Theaters may not invent kinds; the list grows only by a schema revision |
| `legacyType` | string | Iran only | The v1 `type`, kept so v1's icon logic and filters can be reproduced exactly |
| `title` | string | yes | Display line. Migration builds it from `city` (v1 has no title); editors may improve it later |
| `place`, `country` | string | yes | `place` is v1 `city`. `country` stays free text in migration; normalising to ISO codes is a later optional pass |
| `lat`, `lng` | number | yes | WGS84 |
| `geoPrecision` | enum | yes | `site`, `city`, `region`, `representative` (sea and region events with a stand-in point), `unknown`. Migration sets `unknown` unless the text says "approximate" or "representative" |
| `actors` | object | yes | `by[]` and `against[]` hold actor-registry ids (section 4.4). `normalized: false` means the arrays are unreviewed or empty and `attackerText` is authoritative |
| `tier` | enum or null | yes | `milestone`, `major`, `standard`, or `null` = **not yet rated**. Never defaulted |
| `significance` | enum or null | no | The Key Strike category (`world-changing`, `strategic`, `escalatory`, `tactical-pivot`, `infrastructure`, `political`). Present only on key events |
| `fog` | boolean | yes | True when the account rests on party claims, a single source, conflicting accounts, or headline/snippet-only support |
| `fogDetail` | object or null | no | The existing structured fog block, renamed: `fogStatus→status`, `fogLean→lean`, `fogNote→note`, `fogSources→parties`, `fogCheckpoint→checkpoint` (converted to a date) |
| `claimStatus` | enum | yes | `confirmed`, `reported`, `claimed`, `disputed`, `denied`, `retracted`, `unreviewed`. See 3.4 |
| `origin` | object | yes | **Provenance, never credibility.** `class`: `party` (a belligerent's own statement), `official-third` (a non-belligerent government or IGO), `wire`, `independent-media`, `state-media`, `monitor` (NGO or research monitor), `osint` (imagery, transponder, geolocation), `unknown`. `party` names the actor when class is `party` |
| `sources` | object[] | yes (may be empty only with `sourcesStatus: "legacy-unlisted"`) | `url`, `publisher`, `published`, `kind` (`primary-document`, `official-statement`, `wire`, `report`, `monitor`, `osint`), `access` (`read`, `snippet-only`, `refused`). `snippet-only` forces `fog: true` (the pass-2 rule, made structural) |
| `sourcesStatus` | enum | yes | `listed`, `in-text` (URLs still inside `detail.misc`), `legacy-unlisted` |
| `verification` | object | yes | Whether **the record** was checked against its sources: `status` = `pass`, `fix`, `none`. Says nothing about whether the claim is true |
| `detail` | object | yes | The v1 descriptive fields, text unchanged |
| `launch` | object or null | no | v1 `originLat/originLng/originName/originKnown`, renamed to end the collision with `origin` |
| `legacy` | object | no | v1 fields with no v2 meaning yet. Never read by v2 logic |
| `rev` | integer | yes | Bumped on any edit after publication. Lets the UI show "updated" honestly |

## 3.3 Multi-theater events

An event is stored **once**, in its home theater's file. `theater[]` lists every theater it belongs to.
The loader indexes it under each. Rule of thumb for adding a second theater: the event would be missing
from that theater's story if it were left out (example: a Russian intelligence-sharing arrangement with Iran,
v1 id 175). If the cross-theater content is a *relationship* rather than a happening, it is a Link that
cites the event, not a second theater tag.

## 3.4 `claimStatus` and migration honesty

`confirmed` requires either the affected party's own acknowledgement, or two independent non-party sources
with `access: "read"`. Nothing is promoted to `confirmed` by a script.

Migration mapping (mechanical, conservative):

| v1 condition | v2 `claimStatus` | v2 `fog` |
|---|---|---|
| `fogStatus: "disputed"` | `disputed` | true |
| any other `fogOfWar: true`, or `FOG OF WAR:` in `misc` | `claimed` | true |
| ids 386-600 with verifier PASS/FIX and not fog | `reported` | false |
| everything else (older events) | `unreviewed` | false |

`unreviewed` renders with its own neutral styling (see the design system) so the map does not imply a
confidence it does not have. v1's `verified: true` is kept under `legacy` and deliberately **not** mapped:
its meaning was never defined in the schema (INFERRED from the code: it is only displayed).

## 3.5 Example of a lean RU milestone (month precision)

```json
{ "id": "RU-0007", "legacyId": null, "theater": ["russia-ukraine"],
  "dateISO": "2022-09-01", "dateEndISO": "2022-09-30", "datePrecision": "month",
  "kind": "ground", "title": "Kharkiv counteroffensive", "tier": "milestone", "...": "..." }
```
A later daily backfill adds `RU-0412` ... for individual days in that month. The milestone record stays;
nothing is renumbered. This is the "full-detail backfill without rework" requirement.

---

# 4. Links, watchlist, actors

## 4.1 Link schema

A Link says: *actor A and actor B are connected in category C, over this period, on this evidence.*

```json
{
  "id": "LK-0003",
  "category": "weapons-tech",
  "from": "iran", "to": "russia", "direction": "from-to",
  "theaters": ["iran-war", "russia-ukraine"],
  "title": "Shahed-family drone transfer and licensed production",
  "summary": "Two or three sentences, neutral voice.",
  "dateStartISO": "2022-08-01", "dateEndISO": null, "datePrecision": "month",
  "basis": ["sanctions-designation", "captured-hardware", "official-statement"],
  "confidence": "documented",
  "fog": false,
  "observations": [
    { "dateISO": "2022-09-13", "note": "First wreckage documented in Ukraine", "basis": "captured-hardware",
      "events": ["RU-0009"], "sources": [ { "url": "https://...", "publisher": "...", "published": "2022-09-13", "kind": "report", "access": "read" } ] }
  ],
  "via": [],
  "rev": 1
}
```

| Field | Rule |
|---|---|
| `category` | `weapons-tech`, `intelligence`, `sanctions-finance`, `energy-shipping`, `personnel`, `backing-diplomatic`. Exactly the six ruled categories |
| `from`, `to` | Actor-registry ids. `direction`: `from-to`, `to-from`, `both`, `undirected` |
| `theaters` | Which theaters the link touches. A link inside one theater is allowed (for example Iran to Hezbollah) |
| dates | Same date fields and precision enum as events. `dateEndISO: null` with a start = ongoing |
| `basis[]` | `sanctions-designation`, `court-filing`, `captured-hardware`, `treaty-or-contract`, `official-statement`, `on-record-official`, `osint-imagery`, `trade-data`, `media-report`, `anonymous-official` |
| `confidence` | `documented`, `reported`, `alleged`. **Derived by rule, checked by the validator:** `documented` needs at least one of the first four basis types; `reported` needs an on-record or official basis; anything resting only on `media-report` or `anonymous-official` is `alleged` |
| `fog` | **Defaults to true.** May be false only when `confidence` is `documented`. A link resting on anonymous officials is always fog. This is the ruling, enforced in the validator, not left to the editor |
| `observations[]` | Dated evidence points, each with its own sources and optional event ids. At least one is required. These are what make a link thicken or thin over time (section 5.5) |
| `via[]` | Optional intermediate actor ids or coordinates for routing (for example a transshipment state). Display only |

Links never carry coordinates of their own: endpoints come from the actor registry, so one actor always
anchors at one place on the map.

## 4.2 Watchlist schema

Two tracks with **different scales that cannot be compared or summed**.

```json
{
  "id": "WL-C-02",
  "track": "combat",
  "title": "Iranian personnel or missiles used directly against Ukraine or NATO",
  "definition": "Exact, testable wording of what counts and what does not.",
  "theaters": ["iran-war", "russia-ukraine"],
  "status": "not-seen",
  "history": [
    { "dateISO": "2026-11-10", "status": "not-seen", "note": "Baseline at creation.", "evidence": { "events": [], "links": [] }, "sources": [] }
  ],
  "rev": 1
}
```

| Track | `status` scale | Change rule (validator-enforced) |
|---|---|---|
| `combat` (tripwires) | `not-seen` → `reported` → `confirmed` | `reported` needs at least one cited event or link with sources. `confirmed` needs a cited event with `claimStatus: "confirmed"`, or a `documented` link. Evidence may **not** cite a rhetoric item or an event of kind `statement` |
| `rhetoric` (rhetoric and mobilization) | `quiet` → `noted` → `elevated` → `sustained` | Needs dated sourced statements. Has no `confirmed` value at all, so it cannot be confused with a tripped wire |

Structural guarantees:
- The two tracks are separate arrays in the file and separate sections in the UI. No field, score or colour is shared.
- No aggregate "convergence score" exists in the schema. The only summary the system may compute is a count ("1 of 5 combat tripwires confirmed").
- The word **merger** (and "merged", "one war") does not appear in any system-generated string. The headline state is a fixed ladder driven only by combat tripwires: *No direct combat link seen* / *Direct combat link reported* / *Direct combat link confirmed*. Whether a stronger word is ever used is Allan's editorial call (decision 5).
- Every status change is appended to `history[]` with a date; nothing is overwritten. Scrubbing the timeline replays the status as of that date.

Initial combat tripwires (definitions to be written when real data is added, not in F1): Russian naval escorts
in Hormuz; Iranian personnel or missiles used directly against Ukraine or NATO; Russian forces engaging US or
Israeli assets; NATO-Iran direct clash; coordinated cross-theater escalation timing. Initial rhetoric items:
nuclear signalling; readiness-timeline statements; defence-budget surges; conscription; alliance pledges.

## 4.3 Why these are separate files

`links/` and `watchlist/` sit beside `theaters/`, not inside one, because they are cross-theater by nature and
because single-theater mode must be able to load without them. Deleting both folders leaves a working
single-theater WARMAPS: that is the "informative if they don't merge" test.

## 4.4 Actor registry

`actors/actors.json`: the shared vocabulary for "who".

```json
{ "id": "iran.irgc", "name": "IRGC", "long": "Islamic Revolutionary Guard Corps", "kind": "armed-force",
  "parent": "iran", "anchor": { "lat": 35.69, "lng": 51.39, "label": "Tehran" }, "theaters": ["iran-war"] }
```
`kind`: `state`, `armed-force`, `armed-group`, `alliance`, `igo`, `company`. Ids are dotted for hierarchy
(`iran`, `iran.irgc`). Filtering by `iran` includes children. The registry starts small (about 40 actors) and
grows by review. Events are valid with `normalized: false` until someone has mapped their 299 free-text
attacker strings, so the registry never blocks a slice.

---

# 5. Timeline engine

## 5.1 Requirements it must meet
- One scrubber across theaters with different start dates (Feb 24 2022 and Feb 28 2026) and different data density.
- Monthly RU data for 2022-2024 now, daily later, **without touching engine code**.
- Per-theater "Day N" labels that agree everywhere (Trap 11).
- A wrong device clock can never hide data (the v01.09.03 rule).

## 5.2 Model

- **Canonical axis:** calendar date as an ISO string. All arithmetic is done on integer day counts derived from
  `YYYY-MM-DD` with `Date.UTC`, never on local-time `Date` objects and never with `Math.floor` over timestamps.
  One module, `core/time.js`, owns this. No other file may construct a date.
- **Theater epoch:** `theater.json` holds `epochISO` (Iran `2026-02-28`, RU `2022-02-24`). `dayNumber(theater, dateISO)`
  = days since epoch + 1. Pre-war dates give zero and negative numbers, as today.
- **Bands:** each theater declares the granularity of its data over time:

```json
"timeline": {
  "bands": [
    { "from": "2022-02-24", "to": "2024-12-31", "unit": "month" },
    { "from": "2025-01-01", "to": "2026-02-27", "unit": "week" },
    { "from": "2026-02-28", "to": null,         "unit": "day" }
  ],
  "prewarFrom": "2026-01-29"
}
```
  A band says how the axis is drawn and how the scrubber steps there. It does not constrain the data: an event
  with `datePrecision: "day"` inside a monthly band is still placed on its day. When the RU backfill lands, the
  2022-2024 band's `unit` changes to `day` in config. That one line is the entire engine change.
- **Scale:** the axis is piecewise linear. Each band gets screen width in proportion to its **step count**
  (months, weeks or days), with a floor so no band collapses. So 34 monthly steps of 2022-2024 take about the
  room of 34 days, not 1,040. The current war stays wide; the history stays reachable.
- **Combined axis:** in multi-theater mode the engine merges the active theaters' bands and uses the finest unit
  present at each span.
- **End of axis:** `max(today, latest event date across loaded theaters)`. Today comes from the device clock;
  the floor comes from data. This is `setDynamicTimelineEnd()` generalised.

## 5.3 The window
State is a **window** `{ fromISO, toISO }` plus a **cursor** date, which keeps v1's two-handle range.
Modes: *cumulative* (from the start to the cursor, the default), *window* (trailing N steps), *single step*.
An event is visible when its date interval `[dateISO, dateEndISO or dateISO]` intersects the window.
`datePrecision: "month"` events intersect the whole month. `ongoing-from` events intersect everything after their start.

## 5.4 Density strip
The timeline draws a histogram per step, coloured by theater, read from `manifest.json` (section 6.3), so the strip
renders before any event file has loaded. Milestones draw as ticks above it.

## 5.5 Links over time ("thickening and thinning")
A link's **weight at the cursor** = number of its `observations` inside a trailing window (default 180 days),
capped, mapped to four stroke steps. No observations in the window but the link still in its date range = the
thinnest step, drawn as dormant. Outside its date range = not drawn. Weight is a count of dated evidence, never
an editorial score, and the legend says so.

## 5.6 Playback
Play advances the cursor one step per tick at the band's unit (so playback speeds through monthly history and
slows into daily 2026). Stops at today. Reduced-motion users get step buttons only.

---

# 6. File layout

## 6.1 Repo

```
/                               v1 stays here untouched until cutover
  index.html  warmaps-data.js  STATE.md  KNOWN_FAILURES.md  _headers  tools/  intake/  research/
/v2/                            the v2 app (static, no build)
  index.html                    shell: markup, CSS links, one module entry
  app/
    core/     time.js  store.js  schema.js  loader.js  selectors.js  errors.js  config.js
    ui/       layout/  panels/  cards/  timeline/  theme/
    views/    view2d.js (Leaflet)   view3d.js (Cesium, lazy)   renderer-contract.md
    layers/   one module per layers.config.json entry; stubs until built
  assets/     fonts/  icons.svg  tokens.css
/theaters/
  theaters.json                 the theater index (order, ids, prefixes)
  iran-war/
    theater.json                config (6.2)
    events-2025.json  events-2026.json
    enrich.json                 sidecar for v2-only fields until cutover (section 7.2)
    reference.json              airspace, naval assets, stat boxes, key-event list
  russia-ukraine/               same shape; events-2022.json ... events-2026.json
  east-asia/  caribbean/        theater.json only until events exist
  manifest.json (generated)     counts per theater per step, file list, data version
/actors/actors.json
/links/links.json
/watchlist/watchlist.json
/globe/                         graft: UPSTREAM.md (pinned commit bb40ac5 or later), LICENSE-MIT, adapted modules
/intake/                        unchanged; plus candidates contract (section 8)
/tools/                         validate.js, test-timeline.js (v1, unchanged)
                                migrate-v1.js, build-manifest.js, validate-v2.js (new)
/prototype/v2/index.html        the F1 prototype (Part B), sample data only
/docs/v2/                       these documents
```
Note: the root already has a v1 `manifest.json` (the web-app manifest; VERIFIED). The generated data manifest
therefore lives at **`theaters/manifest.json`**, to avoid a collision.

## 6.2 Theater config (`theaters/<id>/theater.json`)

```json
{
  "id": "iran-war", "prefix": "IR",
  "label": "Iran war", "labelLong": "US + Israel vs Iran and the wider war",
  "epochISO": "2026-02-28", "dayLabel": "Day",
  "status": "full",
  "aoi": { "bbox": [29.0, 10.0, 66.0, 40.0], "chokepoints": ["hormuz", "gulf-of-oman", "bab-el-mandeb", "red-sea"] },
  "view2d": { "center": [31.5, 50.0], "zoom": 5 },
  "view3d": { "lat": 30.0, "lng": 48.0, "heightKm": 6000 },
  "timeline": { "bands": [ { "from": "2026-02-28", "to": null, "unit": "day" } ], "prewarFrom": "2026-01-29" },
  "sides": [ { "id": "a", "label": "US + Israel" }, { "id": "b", "label": "Iran" } ],
  "legacyTypes": { "joint": { "kind": "strike", "by": ["usa", "israel"] }, "naval": { "kind": "naval" } },
  "sourceAttribution": "CENTCOM · CTP-ISW · ACLED · Alma · OSINT + curated sources",
  "files": { "events": ["events-2025.json", "events-2026.json"], "reference": "reference.json" }
}
```
`status`: `full` (events curated), `lean`, `intake-only` (appears in the theater filter as "no curated events yet",
never as an empty map that looks like peace). AOI boxes are copied from `layers.config.json`, which stays the
switchboard for layers; the theater file is the switchboard for theaters. `validate-v2.js` checks the two agree.

## 6.3 Event files and manifest
- One file per theater per calendar year: `{ "schema": "event/2", "theater": "iran-war", "year": 2026, "events": [...] }`,
  sorted by `dateISO` then `id`.
- Size (VERIFIED basis, INFERRED result): today's 600 events are 633 KB of JS; as JSON that is about the same,
  roughly 180 KB gzipped. One year per file keeps each fetch under about 250 KB gzipped even when RU daily data arrives.
- `theaters/manifest.json` is **generated** by `tools/build-manifest.js`: per theater, per timeline step: event
  count and milestone count; the file list with byte sizes and a content hash; a `dataVersion`. The validator fails
  if the manifest is stale relative to the event files.
- **Loading order:** shell → `theaters.json` + manifest (timeline strip draws) → the home theater's current-year
  file (map draws) → other years and theaters on demand as the window or the theater filter reaches them →
  links and watchlist only when their panel or layer is first opened.

---

# 7. Migration from `warmaps-data.js` (no ID breakage)

## 7.1 Rules
- `IR-<legacyId padded to 4>`. `1 → IR-0001`, `600 → IR-0600`. Pure function, reversible, no lookup table.
- `keyStrikeIds` and `keyStrikeTiers` convert by the same function into `reference.json` and into each event's `significance`.
- Text fields are copied **byte for byte** into `detail`. The migration never rewrites prose.
- `dateISO` comes from the same parsing rule as `parseWarDay` (first date in the string), cross-checked against
  the `Day N` label where one exists. Ranges set `dateEndISO` and `datePrecision: "range"`. The script prints every
  event it could not classify with certainty (expected: a handful, such as "Feb 28 - ongoing" and the prior-conflict
  note on id 6) for a human decision recorded in `enrich.json`. It never guesses silently.
- Anything unmapped goes to `legacy`. Nothing is dropped.

## 7.2 Single master during the overlap (no double entry)

```
warmaps-data.js  (master for Iran events until cutover; v1 keeps reading it)
        +
theaters/iran-war/enrich.json  (v2-only fields keyed by legacyId: tier, sources[], claimStatus overrides,
                                date decisions, geoPrecision, actors)
        |
        v   tools/migrate-v1.js  (deterministic; run locally and in validate.yml)
theaters/iran-war/events-*.json + reference.json   (GENERATED — header says "do not edit")
```
- New Iran events keep being added to `warmaps-data.js` exactly as today. v1 and v2 both update from one edit.
- The pass-2 research file (`research/backfill-pass2/events_386-600_with_tiers_sources.json`) seeds `enrich.json`
  with tiers and sources for ids 386-600 at once (VERIFIED: it carries `tier`, `fog`, `sources`, `verified` per event).
- CI check: regenerate and fail if the committed output differs. Generated files can never drift from the master.
- Counts the migration must reproduce (VERIFIED this session): 124 fog events in total (32 in ids 1-385, 92 in ids
  386-600), 8 of them `disputed`; 353 `unreviewed`; 123 `reported`. One discrepancy to reconcile in slice 1: the
  pass-2 research file marks 93 events fog, while 92 carry the `FOG OF WAR:` text in `warmaps-data.js`. The rule is
  the union (fog if either says so), and the script names the odd one out.
- **Cutover (last slice):** the generated files become the master, `enrich.json` is folded in and deleted, the
  generated-file header is removed, v1 is frozen at `/v1/`. After cutover v1 stops receiving data. That is the
  only one-way door in the plan, and it is taken only when Allan says v2 has surpassed v1.

Russia-Ukraine has no v1, so its files are authored directly in v2 schema from the first event.

## 7.3 Validators
`tools/validate-v2.js` (new, same no-dependency style as `validate.js`):
A. JSON parses; every record matches its schema; enums closed. B. IDs: unique, prefix matches home theater,
continuous per theater. C. `legacyId` set is exactly 1..N and matches `warmaps-data.js`. D. Dates valid, end >= start,
precision consistent. E. Honesty rules: `snippet-only` source ⇒ fog; link `fog:false` ⇒ `documented`; combat watch
evidence cites no rhetoric or `statement`; forbidden words absent from generated strings. F. References resolve
(actors, events cited by links and watch items). G. Generated files and manifest are fresh. H. Theater AOIs agree
with `layers.config.json`. The v1 validators keep running unchanged; all must exit 0 before any push (Trap 6).

## 7.4 The globe graft (ruled 2026-11-09: copy, not fork)
Upstream is a Vite application with a Node server and about 200 modules (VERIFIED). WARMAPS has no build step.
So "copy selected parts" means: take the **logic** of chosen layer modules (military flight filter, GNSS, FIRMS,
satellites via satellite.js, cables, dams, launches, render governor), adapt each to the WARMAPS layer contract
(section 9.3), and record in `globe/UPSTREAM.md` the upstream path and commit for each. Upstream's HUD, voice,
cockpit, CCTV and server are not imported. The MIT notice travels with every copied file. Key-brokered layers
(vessels, FIRMS) wait for the small Worker described in the GEV spec; they are stubs until then.

---

# 8. Intake to candidates

```
nightly (GitHub Actions, no AI)            daily (scheduled Claude task)              Allan (phone)
feeds → intake-data: raw/YYYY/MM/DD/  →    intake-data: candidates/YYYY-MM-DD.json →  approve / edit / reject
                                           (candidate events AND candidate links)      ↓
                                                                    approved items appended to the master by a PR
```
- Candidates live on the `intake-data` branch, never on `main`, so drafting never deploys anything.
- A candidate is a full v2 Event or Link wrapped in an envelope:

```json
{ "candidateId": "C-20261110-03", "recordType": "event", "theaterGuess": ["iran-war"],
  "record": { "...": "v2 event without id" },
  "intakeItems": ["raw/2026/11/10/iran-war.json#17", "..."],
  "duplicateOf": null, "nearDuplicates": ["IR-0598"],
  "drafter": { "model": "sonnet-5.5", "date": "2026-11-10" },
  "checks": { "dateOk": true, "sourcesReadable": 2, "snippetOnly": 0 },
  "decision": null }
```
- **Candidate links** come from the same pass: when intake items describe a transfer, designation, deployment or
  pledge between actors in different theaters, the drafter proposes either a new Link or a new `observation` on an
  existing Link. A candidate link from anonymous sourcing arrives pre-marked `fog: true, confidence: "alleged"`.
- IDs are assigned only at approval, so rejected candidates never burn a number.
- Watchlist status changes are **never** drafted automatically. A drafter may attach a note "possibly relevant to
  WL-C-02"; changing a tripwire is a human act with its own history entry.
- The approval page and the drafting task are P3 work in the v2 plan and not part of F1. This section fixes only
  the contract so they can be built without touching the data model.

Live-track history (ruled 5C): samples go to a separate data branch (for example `track-data`), same pattern as
`intake-data`, read by the track layers when the cursor is not today.

---

# 9. App architecture

## 9.1 Modules and data flow

```
            ┌──────────── core/loader ◄── theaters/*.json, links, watchlist, actors
            ▼
        core/store  (the only mutable state)
   { theaters[], window{from,to,cursor}, viewMode, layersOn{}, selection, filters, layout }
            │  subscribe
   ┌────────┼─────────────┬───────────────┬──────────────┐
   ▼        ▼             ▼               ▼              ▼
 selectors  ui/timeline   ui/panels+cards ui/layout    views (renderer contract)
 (pure:                                                 ├─ view2d  Leaflet
  visibleEvents, visibleLinks, linkWeights,             └─ view3d  Cesium (loaded on first use)
  watchAsOf, counts)
```
- **Store:** a small hand-written observable (no framework): `get()`, `set(patch)`, `subscribe(keys, fn)`. State
  is serialisable, so the URL hash can carry a view (`#t=iran-war,russia-ukraine&d=2026-11-08&v=3d`) and a shared
  link reproduces it.
- **Selectors** are pure functions of store state and loaded data. Both renderers and every panel call the same
  selector, which is what guarantees the 2D map, the globe, the list and the timeline can never disagree.
- **No build:** native ES modules, `<script type="module">`. Leaflet and Cesium load from a pinned CDN URL with
  Subresource Integrity. Cesium is requested only when the user first switches to 3D.
- **Caching (F-007 lesson):** no service worker. `_headers` gets `Cache-Control: no-cache` for `/v2/*` and
  `/theaters/*` so the browser revalidates every file by ETag: always current, still cheap. The version badge
  reads one constant in `core/config.js`, and the data version comes from the manifest.
- **Failure isolation (F-001 lesson):** `core/errors.js` owns a visible banner. Every module's `init()` runs inside
  a guard that reports `{module, message}` there. A failed layer disables itself and says so in the layers menu.
- **CSS:** separate `.css` files. Nothing is appended into inline blocks, which retires Traps 2-4 by construction.

## 9.2 Renderer contract (how 2D and 3D share everything)

```
init(container, ctx) → Promise      destroy()
setTheaters(theaterConfigs, mode)   // outlines; mode = single | multi
setEvents(visibleEvents)            // already filtered by selectors
setLinks(arcs)                      // [{id, from{lat,lng}, to{lat,lng}, weightStep, confidence, category}]
setTracks(layerId, tracks)          // live/archived OBSERVED tracks
setLayer(layerId, on, data)         // context layers
select(ref) / highlight(ref)        // ref = {type:'event'|'link'|'track', id}
getCamera() → {lat,lng,zoomEq}  /  setCamera(cam, animate)
on('select' | 'camera' | 'ready' | 'degraded', fn)
```
- `zoomEq` is a Leaflet-style zoom number. The globe converts height to it, so switching 2D↔3D keeps you looking
  at the same place.
- A renderer holds **no** state of record. Switching views is `destroy()` then `init()` on the other, replaying
  the current store. On the phone and the Fire only one renderer is alive at a time.
- Arcs are great circles in both views (sampled polylines in Leaflet), so a link looks like the same object in 2D and 3D.
- `degraded` lets the globe report sustained low frame rate; the shell then **offers** 2D (it does not switch by itself).

## 9.3 Layer contract
Each entry in `layers.config.json` with state `on` or `available` has a module:
`{ id, meta, load(ctx) , update(ctx.window, ctx.aoi), render(renderer), teardown() }`.
`dormant` modules sit under `layers/_dormant/` and are never imported. Live layers obey `only_when: scrubber_is_today`
by checking the store's cursor, and every track they emit carries `source`, `observedAt` and the label OBSERVED.

## 9.4 Performance budget — Fire HD 10

All numbers below are **targets (SPECULATION)** until measured on Allan's tablet. The hardware assumption is
INFERRED: recent Fire HD 10 models have about 3 GB RAM, a mid-range ARM chip and a 1920x1200 screen, and their
browser reports roughly 1280x800 CSS pixels. The prototype prints the real viewport and a frame-rate reading so
these can be replaced with measurements.

| Budget | Target | How it is held |
|---|---|---|
| First usable paint (2D, cold, home Wi-Fi) | 3 s or less | Shell + manifest + one year file first; fonts self-hosted, `font-display: swap` |
| App code before Leaflet | 150 KB gzipped or less | No framework; panels load on first open |
| Data for first view | 250 KB gzipped or less | Per-year files; links and watchlist deferred |
| 2D markers | 1,500 visible without clustering | Canvas renderer (already used in v1); cluster above that |
| Scrub rate (2D) | 30 frames/s or more | Selectors work on a pre-sorted date index; markers toggle, not rebuild |
| Globe load | First globe frame in 6 s or less; only on request | Cesium lazy from CDN |
| Globe frame rate | 24 frames/s or more while moving, idle when still | `requestRenderMode` (upstream's render-governor idea), resolution scale capped at device ratio 1.0, no terrain, no 3D tiles |
| Globe entities | 2,000 points, 60 arcs, 300 tracks at most | Point primitives, not entities; arcs bundled per actor pair |
| Memory | Stay under about 350 MB tab memory | One renderer alive at a time on phone and Fire |
| Fallback | If the globe holds under 20 frames/s for 5 s, offer 2D | `degraded` event; 2D stays the default view until the globe is measured |

Default view by device, until measured: 2D everywhere; the last choice is remembered per device.

---

# 10. What is deliberately not decided here
- Real link and watchlist content. F1 defines the containers; the content is research and editorial work.
- Actor normalisation of the 299 attacker strings.
- The approval page and candidate-drafting task (v2 plan P3).
- The key-brokering Worker for vessels and FIRMS (GEV spec).
- Whether East Asia and Caribbean ever get curated events.

# 11. Risks carried into the build

| Risk | Tier | Mitigation |
|---|---|---|
| Globe performance on the Fire tablet is unknown | SPECULATION | Globe is its own late slice; 2D is complete without it; `degraded` fallback |
| Date migration of the 63 non-plain dates could misplace events | INFERRED | Script lists every uncertain case for a human ruling; cross-check against `Day N`; v1 keeps rendering from the original strings |
| Generated-file drift between v1 master and v2 output | INFERRED | CI regenerates and diffs on every PR |
| Links read as a "conspiracy board" | INFERRED | Off by default; bundling, weight caps and fog styling (design system); validator-enforced fog defaults |
| A no-build module tree grows slow to load (many small files) | SPECULATION | HTTP/2 on Cloudflare; budget is measured in slice 1; a bundling step can be added later without changing any module (additive) |
| CDN dependency for Leaflet and Cesium | INFERRED | Pinned versions with integrity hashes; Leaflet is small enough to vendor if a CDN ever fails |
| Scope creep (cause of the earlier five-week stall, per the v2 plan) | OBSERVED | RELEASE_PLAN fixes the slice order; each slice has one exit test |
