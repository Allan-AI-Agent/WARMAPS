---
title: WARMAPS v2 — Architecture (data model and app architecture)
version: v1.1
date: 2026-11-11 (Iran-war Day 257)
author: Claude (Fable 5.2), session F1, for Allan Sanceau
status: DRAFT FOR RULING — nothing here is built. Decisions are collected in F1_DECISIONS_FOR_ALLAN.md
supersedes: v1.0 (2026-11-10). v1.1 is v1.0 corrected by a dry run of all 600 live events through the schema
evidence: research/v2-schema-dryrun/REPORT.md (what broke, with counts) and the two scripts beside it
companions: DESIGN_SYSTEM_v1.md, LAYOUT_ENGINE_SPEC_v1.md, RELEASE_PLAN_v1.md, layers.config.json, WARMAPS_v2_GEV_INTEGRATION_SPEC
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
3. Event IDs become `IR-00001` style strings formed mechanically from today's numbers; the old number is kept as `legacyId` forever.
4. Calendar date is the shared axis; war-day numbers are secondary labels.
5. Links and the watchlist are data with validator-enforced honesty rules, not UI conventions.

**What v1.1 changed.** All 600 events now pass the schema with zero failures and byte-identical text, and every
start date matches v1's own placement. Getting there took eleven corrections to v1.0 (section 12). The three that
matter most:
- **Link confidence was biased.** v1.0 let a link count as "documented" on one government's sanctions designation.
  v1.1 records *who attests* each piece of evidence, so an accusation is labelled as an accusation whoever makes it.
- **The timeline could not resolve a single day on a phone** (1.1 px per day at full width). v1.1 makes it two-level:
  an overview of everything and a detail view where steps are finger-sized.
- **v1's `type` cannot be trusted to say who did what** (about one event in ten). v1.1 stops deriving actors from it
  and marks derived values so the interface never shows them as fact.

**Evidence labels used in this document**
- VERIFIED: read from the repo or computed by the dry-run scripts in this session (main at `2844e57`, 600 events).
- OBSERVED: reported by Allan or recorded in STATE.md.
- INFERRED: my reasoning from verified facts.
- SPECULATION: untested targets, especially every performance number in section 9.4.

---

# 1. What exists today (VERIFIED, 2026-11-11)

Counts come from `research/v2-schema-dryrun/dryrun.js`, which loads `warmaps-data.js` and the pass-2 research file.

| Fact | Value | Design consequence |
|---|---|---|
| Events | 600, ids 1-600, integer, continuous | Mechanical ID migration is safe |
| Fields on every event | `id type city country lat lng date time attacker structuralDmg humanCasualties` | The v2 core, renamed only where a name collides |
| Other fields | `misc` 594, `target` 599, `weaponCap` 498, `weapon` 472, `launchOrigin` 446, `source` 200, `perspective`/`verified` 176, `weaponType` 18, fog block 15, `origin*` 12, `intercepted` 6, `evidenceUrl` 4 | Every one has a destination in 3.2; none is dropped |
| `date` formats | 539 single days; 57 clean ranges ("Mar 25-26, 2026", "Feb 28 – Mar 1, 2026"); 4 open-ended ("Feb 28 – ongoing", no year); 2 annotated (ids 6, 131) | 594 migrate by rule; **6 need a ruling** (7.1) |
| `time` | Free text. 378 carry a "Day N" label; **60 of those (ids 109-297) are one lower than the day the app computes** (they count Feb 28 as Day 0) | Day numbers are never stored as text in v2 (3.2 `timeNote`) |
| `type` values | 15, mixing **who** (us, iran, joint, isr, hez: 281 events), **what** (naval, radar, energy, airport, political, intel, launch, platform: 245) and **neither** (prewar 9, global 65) | v2 splits into `kind` and `actors`; the old value is kept as `legacyType` |
| `type` vs `attacker` | In 26 of the 281 who-typed events the attacker text names someone else (type `iran`, attacker "Hezbollah" or "Houthis"); 29 look like non-strikes by keyword | Actors are **not** derived from `type`; derived `kind` is flagged (3.2 `needs`) |
| `attacker` | 299 distinct free-text strings | Actor normalisation is a reviewed pass, not part of the mechanical migration |
| Fog | **126** events: 124 carry `FOG OF WAR` text in `misc`, 15 have the structured block, 2 only the block. 33 are in ids 1-385, 93 in ids 386-600 (matching the pass-2 research file exactly) | All map to `fog: true` |
| Sources | 250 events have at least one URL (494 URLs, 87 distinct hosts); 322 have publisher names only; 28 have nothing. No event records publication date, source type or how the source was read | `sources[]` fields beyond `publisher` are optional; three `sourcesStatus` values |
| Titles | v1 has no title field. `city` holds "Place — what happened" for 269 events and a bare place name for 331; longest 90 characters | `title` = `city` verbatim; bare ones flagged |
| Tiers | Two unrelated things share the word: research tiers (milestone 22 / major 78 / standard 115, ids 386-600 only, not in the app) and Key Strike categories (6 categories, 33 ids) | v2 names them apart: `tier` and `significance` |
| `originLat/originLng/originName/originKnown` | 12 events; means **launch point geography** | Collides with REV B's `origin` (provenance) and with `origin` in `intake/feeds.json`. v2 renames the v1 fields to `launch.*` |
| Standing platforms | 6 "events" are carrier groups and airbases (types `launch`, `platform`), 3 dated "Feb 28 – ongoing" | Stay events to keep their IDs: `kind: "deployment"`, `datePrecision: "ongoing-from"` |
| Other data | `airspaceData`, `navalAssets` (positions keyed by war day), `statPerspectives`, `flagData`, `keyStrike*`, `AI_PROMPT` | Per-theater `reference.json` (section 6) |
| App | One 310 KB `index.html`, 9 inline scripts, Leaflet 1.9.4 from cdnjs, Esri basemaps (no key), no build step | v2 is a new shell beside it, not a refactor of it |
| Epoch | Feb 28 2026 = Day 1, single source `parseWarDay`/`warDayNow` | A per-theater config value plus one shared function |
| Deploy | Cloudflare serves `main` as static files; `_headers` sets `no-store` on `/` | `/v2/` and `/prototype/v2/` deploy with no new infrastructure |
| Intake | GitHub Actions nightly, 37 feeds in `intake/feeds.json`, each labelled with an `origin` such as `russia-state` or `israel-independent`; raw output on branch `intake-data` | The source registry (4.5) adopts this vocabulary |
| Sourcing rule | Ruled 2026-11-10 11:18 (STATE.md): all sides kept, attributed and labelled; never defeat a block; note the gap | Built into sources, origin, links and coverage gaps (2, 3.2, 4.1, 4.5) |
| Upstream globe | `bilawalsidhu/gods-eye-view` at commit `bb40ac5` (2026-11-09): MIT, Vite build, Node server, CesiumJS ^1.124, about 200 source modules | It cannot be dropped in; the graft is a small set of adapted modules (7.5) |

Three things noticed in v1 and **not changed here** (v1 is untouched on this branch):
- The 60 stale "Day N" labels above are visible wherever v1 shows the `time` text.
- Type `platform` (ids 320, 329) has no entry in v1's marker colour table (INFERRED: they may draw without a colour; not checked in a browser).
- The KEY FIELDS table in `STATE.md` still says 385 events / Day 170; its header is correct.

---

# 2. Principles

1. **Source discipline is structural.** A new record cannot enter a published file without sources, a date, a claim status and a fog flag. The validator rejects it; the interface never has to guess.
2. **Provenance is not credibility.** `origin` records who is the source of a claim. `claimStatus` records how well it is established. They are separate fields and never derived from each other. This applies to every side equally: a US Treasury designation and an IRGC communiqué are both a party speaking (the 2026-11-10 balance ruling).
3. **One clock, one store, many views.** State lives in one place. Views subscribe. A view can be destroyed and recreated without losing anything.
4. **Additive only.** A later slice adds files, fields and modules. It may not rename a published field or re-key a published ID.
5. **Unknown is a value; a guess is not.** A field that was not established is absent or says `unknown`/`unreviewed`/`unclassified`. Where migration must supply a starting value, the field is named in `needs[]` and the interface may not present it as fact (the F-003 lesson: a plausible wrong value costs more than a blank).
6. **Failure is loud and local.** Each module initialises behind its own guard and reports to a visible banner (the F-001 cure, kept). One dead panel never blanks the app.
7. **Restraint by default.** First load shows events and theater outlines only. Links, the watchlist and every context layer are one tap away, per ruling.
8. **Nothing about convergence is asserted by the software.** It shows links and tripwire states with evidence. It never computes or displays a prediction. Allan's own view, when he gives it, is a signed editorial note (4.6).

---

# 3. Event schema v2 (REV B)

## 3.1 Shape

Required fields are always present. **Optional fields are omitted when not established** (never written as `null`
or an empty string). That is the truthful representation, and it is about 13% smaller on disk (VERIFIED: 918 KB
against 1,057 KB for the 600 events).

```json
{
  "id": "IR-00412",
  "legacyId": 412,
  "theater": ["iran-war"],
  "dateISO": "2026-09-03",
  "datePrecision": "day",
  "timeNote": "~02:00 local",
  "kind": "strike",
  "legacyType": "iran",
  "title": "Haifa — Bazan refinery struck",
  "place": "Haifa",
  "country": "Israel",
  "lat": 32.79, "lng": 35.05,
  "geoPrecision": "site",
  "actors": { "by": ["iran.irgc"], "against": ["israel"] },
  "attackerText": "Iran (IRGC)",
  "tier": "major",
  "fog": true,
  "fogDetail": { "status": "disputed", "lean": "toward_confirmed", "note": "...", "parties": ["IDF", "IRGC"], "checkpointISO": "2026-10-05" },
  "claimStatus": "disputed",
  "origin": { "class": "party", "party": "iran.irgc", "label": "iran-state" },
  "sources": [
    { "publisher": "Reuters", "registryId": "reuters", "url": "https://...", "published": "2026-09-03", "kind": "wire", "access": "read" }
  ],
  "sourcesStatus": "listed",
  "verification": { "status": "pass", "pass": "backfill-pass2", "date": "2026-11-09" },
  "detail": {
    "target": "...", "weapon": "...", "weaponCap": "...",
    "structuralDmg": "...", "humanCasualties": "...",
    "launchOrigin": "...", "misc": "..."
  },
  "rev": 1
}
```

## 3.2 Field rules

| Field | Type | Required | Rule |
|---|---|---|---|
| `id` | string | yes | `<PREFIX>-<5 digits>`. Prefix names the **home theater** (IR, RU, EA, CB). Never reused, never renumbered. Five digits so plain text sorting stays correct up to 99,999 events per theater (a full daily Russia-Ukraine backfill could pass 9,999) |
| `legacyId` | integer | Iran only | The v1 number. `IR-00412` and `412` are the same event forever |
| `theater` | string[] | yes, at least 1 | First entry is the home theater. Add more when the event is material to another theater (3.3) |
| `dateISO` | `YYYY-MM-DD` | yes | Start date, in the event's local calendar day as reported. Date only: no time zone, no timestamp |
| `dateEndISO` | date | no | Present exactly when `datePrecision` is `range`, `week`, `month` or `year`. Must be on or after `dateISO` |
| `datePrecision` | enum | yes | `day`, `range`, `week`, `month`, `year`, `ongoing-from`. Drives how the timeline places the event (section 5) |
| `timeNote` | string | no | Time-of-day text ("Overnight", "~02:00 local"). **Never a day number**: migration strips a leading "Day N" from v1's `time` and keeps the original under `legacy.time` (60 v1 labels are off by one; 6 more embed a day number mid-text and are listed for a ruling) |
| `kind` | enum | yes | **What happened.** Shared vocabulary: `strike`, `interception`, `ground`, `naval`, `air-defense`, `infrastructure`, `energy`, `shipping`, `cyber`, `intel`, `deployment`, `political`, `diplomatic`, `economic`, `humanitarian`, `statement`, and `unclassified` (not yet determined). Theaters may not invent kinds; the list grows only by a schema revision |
| `legacyType` | string | Iran only | The v1 `type`, kept so v1's filters and labels can be reproduced exactly |
| `title` | string | yes | Display line, at most 120 characters. Migration copies v1 `city` verbatim. It never composes or rewrites |
| `place`, `country` | string | yes | `place` is the part of v1 `city` before the dash. `country` stays free text in migration (68 distinct values); normalising to ISO codes is an optional later pass |
| `lat`, `lng` | number | yes | WGS84 |
| `geoPrecision` | enum | yes | `site`, `city`, `region`, `representative` (a stand-in point for a sea or region event), `unknown`. Migration sets `unknown` unless the text says "approximate" or "representative" (47 events) |
| `actors` | object | yes | `by[]` and `against[]` hold actor-registry ids (4.4). May be empty: an accident has no `by` |
| `attackerText` | string | Iran only | v1 `attacker`, verbatim. Authoritative until `actors` is reviewed |
| `needs` | string[] | no | Names the fields that still hold a **migration default**: any of `kind`, `title`, `actors`. Absent means none. **The interface must not display or filter on a field listed here as if it were established**: it falls back to `legacyType`, `place` and `attackerText`. The enrichment pass removes entries (7.3) |
| `tier` | enum | no | `milestone`, `major`, `standard`. Absent = **not yet rated** (385 events today). Never defaulted |
| `significance` | enum | no | The Key Strike category (`world-changing`, `strategic`, `escalatory`, `tactical-pivot`, `infrastructure`, `political`). Present only on key events (33 today) |
| `fog` | boolean | yes | True when the account rests on party claims, a single source, conflicting accounts, or headline/snippet-only support |
| `fogDetail` | object | no | The existing structured fog block, renamed: `fogStatus→status`, `fogLean→lean`, `fogNote→note`, `fogSources→parties`, `fogCheckpoint→checkpointISO` (v1 holds "Day N"; converted through the epoch) |
| `claimStatus` | enum | yes | `confirmed`, `reported`, `claimed`, `disputed`, `denied`, `retracted`, `unreviewed`. See 3.4 |
| `origin` | object | yes | **Provenance, never credibility.** `class`: `party` (a belligerent's own statement, any side), `official-third` (a non-belligerent government or an intergovernmental body), `wire`, `independent-media`, `state-media`, `monitor` (NGO or research monitor), `osint` (imagery, transponder, geolocation), `unknown`. `party`: the actor id when class is `party`. `label`: the fine-grained origin label from the source registry (`russia-state`, `israel-independent`...). Migration sets `class: "unknown"` for all 600 |
| `sources` | object[] | yes | Each entry needs `publisher`. Optional: `url`, `registryId` (4.5), `published`, `kind` (`primary-document`, `official-statement`, `wire`, `report`, `monitor`, `osint`, `leaked`), `access` (`read`, `snippet-only`, `archive`, `subscription`, `unrecorded`). **For records authored in v2:** `access` is required; `snippet-only` on every source forces `fog: true`; `leaked` requires a `verificationNote` and is always labelled as leaked. Empty array allowed only with `sourcesStatus: "legacy-unlisted"` |
| `sourcesStatus` | enum | yes | `listed` (at least one URL), `named-only` (publisher names, no URLs), `legacy-unlisted` (nothing recorded) |
| `coverageGaps` | object[] | no | "Note the gap" from the sourcing rule: `{ publisher, reason, date }` with `reason` one of `blocked`, `paywalled`, `removed`. Records that a relevant source could not be read and was not circumvented |
| `verification` | object | yes | Whether **the record** was checked against its sources: `status` = `pass`, `fix`, `none`; optional `pass` (which review) and `date`. Says nothing about whether the claim is true |
| `detail` | object | yes | The v1 descriptive fields, text byte-for-byte. `structuralDmg` and `humanCasualties` required; the rest optional |
| `launch` | object | no | v1 `originLat/originLng/originName/originKnown`, renamed to end the collision with `origin` |
| `legacy` | object | no | v1 values with no v2 meaning yet: `time` (original), `perspective`, `verified`, `weaponType`, `intercepted`, `source` (original string). Never read by v2 logic |
| `rev` | integer | yes | Bumped on any edit after publication. Lets the interface show "updated" truthfully |

## 3.3 Multi-theater events

An event is stored **once**, in its home theater's file. `theater[]` lists every theater it belongs to.
The loader indexes it under each. Rule of thumb for adding a second theater: the event would be missing
from that theater's story if it were left out (example: v1 id 131, the Russia-Iran MANPADS contract). If the
cross-theater content is a *relationship* rather than a happening, it is a Link that cites the event, not a
second theater tag.

## 3.4 `claimStatus` and what migration may claim

`confirmed` requires either the affected party's own acknowledgement, or two sources with `access: "read"` whose
registry origins are independent of each other and of the parties (4.5). Nothing is promoted to `confirmed` by a script.

Migration mapping (mechanical, conservative), with the counts the dry run produced:

| v1 condition | v2 `claimStatus` | v2 `fog` | Events |
|---|---|---|---|
| `fogStatus: "disputed"` | `disputed` | true | 8 |
| any other fog marker (structured block, `FOG OF WAR` in `misc`, or pass-2 fog flag) | `claimed` | true | 118 |
| ids 386-600 with verifier PASS/FIX and not fog | `reported` | false | 122 |
| everything else (ids 1-385, not fog) | `unreviewed` | false | 352 |

`unreviewed` renders with its own neutral styling (design system 2.3) so the map does not imply a confidence it
does not have. v1's `verified: true` is kept under `legacy` and deliberately **not** mapped: its meaning was
never defined in the schema (INFERRED from the code: it is only displayed).

## 3.5 `kind` mapping from v1 `type`

| v1 `type` | v2 `kind` | Events | In `needs`? | Why |
|---|---|---|---|---|
| `naval` | `naval` | 39 | no | The type names the kind |
| `radar` | `air-defense` | 9 | no | |
| `energy` | `energy` | 28 | no | |
| `airport` | `infrastructure` | 5 | no | |
| `political` | `political` | 130 | no | v1 label "Political / Legal" |
| `launch`, `platform` | `deployment` | 6 | no | Standing platforms |
| `intel` | `intel` | 28 | **yes** | v1 label is "Intel / Diplomacy": could be `diplomatic` |
| `us`, `iran`, `joint`, `isr`, `hez` | `strike` | 281 | **yes** | The type says who (unreliably), not what; about 10% are not strikes |
| `prewar`, `global` | `unclassified` | 74 | **yes** | The type says when or how wide, not what |

Result: 217 events get an established `kind`; 383 carry a flagged starting value. Every event starts with `actors`
in `needs`; 331 start with `title` in `needs`. Until the enrichment pass (7.3), the Iran theater's filters use
`legacyType`, exactly as v1 does; `kind` filters are for theaters authored in v2 and for multi-theater mode.

## 3.6 Example of a lean RU milestone (month precision)

```json
{ "id": "RU-00007", "theater": ["russia-ukraine"],
  "dateISO": "2022-09-01", "dateEndISO": "2022-09-30", "datePrecision": "month",
  "kind": "ground", "title": "Kharkiv counteroffensive", "tier": "milestone", "...": "..." }
```
A later daily backfill adds `RU-00412` ... for individual days in that month. The milestone record stays;
nothing is renumbered. This is the "full-detail backfill without rework" requirement.

---

# 4. Links, watchlist, actors, sources, editorial notes

## 4.1 Link schema

A Link says: *actor A and actor B are connected in category C, over this period, on this evidence, attested by
these parties.*

```json
{
  "id": "LK-00003",
  "category": "weapons-tech",
  "from": "iran", "to": "russia", "direction": "from-to",
  "theaters": ["iran-war", "russia-ukraine"],
  "title": "Shahed-family drone transfer and licensed production",
  "summary": "Two or three sentences, neutral voice, attributing each claim.",
  "dateStartISO": "2022-08-01", "datePrecision": "month",
  "observations": [
    { "dateISO": "2022-09-13", "note": "Wreckage documented in Ukraine", "basis": "forensic-hardware", "attestedBy": "neutral-body",
      "events": ["RU-00009"], "sources": [ { "publisher": "...", "url": "https://...", "published": "2022-09-13", "kind": "report", "access": "read" } ] },
    { "dateISO": "2022-09-08", "note": "US Treasury designates the manufacturer", "basis": "sanctions-designation", "attestedBy": "other-government",
      "sources": [ { "publisher": "US Treasury", "url": "https://...", "kind": "official-statement", "access": "read" } ] }
  ],
  "confidence": "documented",
  "fog": false,
  "rev": 1
}
```
(Illustrative shape only: the dates and sources above are placeholders, not researched facts.)

| Field | Rule |
|---|---|
| `category` | `weapons-tech`, `intelligence`, `sanctions-finance`, `energy-shipping`, `personnel`, `backing-diplomatic`. Exactly the six ruled categories |
| `from`, `to` | Actor-registry ids. `direction`: `from-to`, `to-from`, `both`, `undirected` |
| `theaters` | Which theaters the link touches. A link inside one theater is allowed (Iran to Hezbollah) |
| dates | `dateStartISO`, optional `dateEndISO` (absent = ongoing), `datePrecision` as for events |
| `observations[]` | At least one. Each has `dateISO`, `basis`, `attestedBy`, `sources[]` (at least one), optional `note` and `events[]`, and optional `dateEndISO` to mark a **standing** fact such as a treaty in force (`"dateEndISO": null` means still standing). No observation may predate `dateStartISO` |
| `basis` | What kind of evidence: `participant-acknowledgement`, `treaty-or-contract`, `court-finding`, `forensic-hardware`, `igo-report`, `sanctions-designation`, `official-statement`, `on-record-official`, `osint-imagery`, `trade-data`, `media-report`, `anonymous-official` |
| `attestedBy` | **Who stands behind it:** `participant` (one of the link's own two actors), `neutral-body` (a court, a UN panel, independent investigators), `other-government` (any government that is not one of the two actors, hostile or friendly), `media` |
| `confidence` | **Derived, never typed by hand; the validator recomputes it.** The link takes the highest level any observation reaches (table below) |
| `fog` | Must be true when `confidence` is `alleged`. For `reported`, true unless on-record observations come from at least two different `attestedBy` values. For `documented`, false by default; an editor may set it true when the interpretation is disputed |
| `via[]` | Optional intermediate actor ids for routing (a transshipment state). Display only |

**Confidence levels by evidence**

| Level | Reached by |
|---|---|
| `documented` | `participant-acknowledgement` or `treaty-or-contract` attested by a participant · `court-finding` · `forensic-hardware` or `igo-report` attested by a neutral body |
| `reported` | The same evidence attested only by another government · `sanctions-designation` · `official-statement` · `on-record-official` · `osint-imagery` · `trade-data` |
| `alleged` | `media-report` · `anonymous-official` |

Why this shape (the main correction in v1.1): in v1.0 a sanctions designation counted as "documented". A designation
proves that a government made an accusation; it does not prove the transfer. Treating one side's official claims as
documentation would have put a thumb on the scale, against principle 2 and the balance ruling. Now the same rule
grades a US designation, a Russian Foreign Ministry statement and an Iranian one identically, and the link card
always shows who attested what. An indictment is an `official-statement`; only a judgment is a `court-finding`.

Links never carry coordinates: endpoints come from the actor registry, so an actor always anchors at one place.

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

| Track | `status` scale | Change rule (validator-enforced; each rule has a passing mutation test in the dry run) |
|---|---|---|
| `combat` (tripwires) | `not-seen` → `reported` → `confirmed` | Above `not-seen` needs at least one cited event or link, and sources. **`confirmed` needs a cited event of a combat kind (`strike`, `interception`, `ground`, `naval`, `air-defense`) whose own `claimStatus` is `confirmed`.** A link, however well documented, supports `reported` at most: a relationship is not combat. Evidence may not cite a rhetoric item or an event of kind `statement` |
| `rhetoric` (rhetoric and mobilization) | `quiet` → `noted` → `elevated` → `sustained` | Needs dated sourced statements. Has no `confirmed` value at all, so it cannot be confused with a tripped wire |

Structural guarantees:
- `definition` is required and must be testable wording. `status` must equal the latest `history` entry; history is in date order and is never overwritten. Scrubbing the timeline replays the status as of the cursor date.
- The two tracks are separate arrays in the file and separate sections in the interface. No field, score or colour is shared.
- No aggregate "convergence score" exists in the schema. The only summary the system may compute is a count ("1 of 4 combat tripwires confirmed").
- The words **merger**, **merged**, **one war** and **world war** do not appear in any system-generated string. The headline is a fixed ladder driven only by combat tripwires: *No direct combat link seen* / *Direct combat link reported* / *Direct combat link confirmed*. Whether a stronger word is ever used is Allan's editorial call (decision 5), made in a signed note (4.6).

Initial combat tripwires, to be defined when real data is added: Russian naval escorts in Hormuz; Iranian
personnel or missiles used directly against Ukraine or NATO; Russian forces engaging US or Israeli assets; NATO-Iran
direct clash. Initial rhetoric items: nuclear signalling; readiness-timeline statements; defence-budget surges;
conscription; alliance pledges.

**One item from the ruled list does not fit either track as written:** "coordinated cross-theater escalation
timing". Timing is a pattern someone reads into events; no single event can confirm it, so under the rule above it
could never leave `reported`. Options for Allan when definitions are written: (a) redefine it as *documented
operational coordination* (an acknowledged joint operation or a neutral finding), which an event can confirm; or
(b) keep timing coincidences as dated entries in a third, status-free list, "Patterns noted". It is held out of
the starting set until he rules.

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
grows by review. It never blocks a slice: an event is valid with empty `actors` and `actors` in `needs`.

## 4.5 Source registry

`sources/registry.json`: one entry per publisher, so attribution labels are consistent and "independent" is
checkable. It is the "Source & Feed Registry" the v2 plan already anticipates (P7), started small.

```json
{ "id": "tass", "name": "TASS", "hosts": ["tass.com"], "class": "state-media", "origin": "russia-state",
  "status": "active", "feedId": "tass" }
```
- `origin` uses the vocabulary already in `intake/feeds.json` (`russia-state`, `ukraine-independent`,
  `intl-broadcaster (Qatar)`...). `class` is the coarse enum used in an event's `origin.class`.
- `status`: `active`, `blocked` (the site refuses us; we do not fight it; events get `coverageGaps`), `dropped`
  with a required `statusNote`. Per the ruling, a source is dropped only for demonstrated fabrication or because
  it does not work, never for its side.
- Two sources are **independent** when their `origin` values differ and neither is state or party media of an actor
  in the event. Wire copy republished by another outlet counts once.
- Starting content: the 37 intake feeds plus the 87 hosts already cited in events (VERIFIED counts). The registry
  never blocks a slice: a source without `registryId` is valid and simply cannot count toward `confirmed`.

## 4.6 Editorial notes

`editorial/notes.json`: Allan's own assessments, kept apart from the record, as the sourcing rule requires
("Allan's own opinion, when given, is clearly labelled as his").

```json
{ "id": "ED-0001", "author": "Allan Sanceau", "dateISO": "2026-11-11", "title": "...", "text": "...",
  "refs": { "events": [], "links": [], "watch": [] } }
```
A note is shown only in its own labelled place ("Opinion — Allan Sanceau, 11 Nov 2026"), never inside an event,
link or watch item, and it cannot change any status. This is where a word like "merger" would live if he chose it.

---

# 5. Timeline engine

## 5.1 Requirements it must meet
- One scrubber across theaters with different start dates (Feb 24 2022 and Feb 28 2026) and different data density.
- Monthly RU data for 2022-2024 now, daily later, **without touching engine code**.
- Per-theater "Day N" labels that agree everywhere (Trap 11).
- A wrong device clock can never hide data (the v01.09.03 rule).
- **A finger on a phone can land on any single step.**

## 5.2 Model

- **Canonical axis:** calendar date as an ISO string. All arithmetic is on integer day counts derived from
  `YYYY-MM-DD` with `Date.UTC`, never on local-time `Date` objects and never with `Math.floor` over timestamps.
  One module, `core/time.js`, owns this. No other file may construct a date.
- **Theater epoch:** `theater.json` holds `epochISO` (Iran `2026-02-28`, RU `2022-02-24`). `dayNumber(theater, dateISO)`
  = days since epoch + 1. The day before the epoch is Day 0, earlier days are negative, as in v1.
  (VERIFIED: 8 Nov 2026 gives IR Day 254 and RU Day 1,719.)
- **Bands:** each theater declares the granularity of its data over time, and where its axis starts:

```json
"timeline": {
  "axisFrom": "2022-02-24",
  "bands": [
    { "from": "2022-02-24", "to": "2024-12-31", "unit": "month" },
    { "from": "2025-01-01", "to": "2026-02-27", "unit": "week" },
    { "from": "2026-02-28", "to": null,         "unit": "day" }
  ]
}
```
  A band says how the axis is drawn and how the scrubber steps there. It does not constrain the data: an event
  with `datePrecision: "day"` inside a monthly band is still placed on its day. When the RU backfill lands, the
  2022-2024 band's `unit` changes to `day` in config. That one line is the entire engine change (VERIFIED by test).
- **Steps:** `day` = one date. `week` = an ISO week (Monday to Sunday). `month` = a calendar month. Steps are
  clipped to their band, so the first RU step is 24-28 Feb 2022.
- **Combined axis:** in multi-theater mode the engine uses, for every date, the finest unit any active theater
  declares there, then cuts steps.
- **Extent:** from the earliest `axisFrom` among active theaters to `max(today, latest event date loaded)`. Today
  comes from the device clock; the floor comes from data. This is `setDynamicTimelineEnd()` generalised.
- **Backdrop events:** an event dated before the extent (Iran id 6, June 2025) is a *backdrop* event. It is shown
  whenever the window starts at the beginning of the extent, and listed under "Before the timeline" in the Events
  panel. It never stretches the axis.

Step counts today (VERIFIED by `engine-tests.js`, 11 Nov 2026):

| Axis | Steps | Width per step on the S22 if all shown at once (about 328 px of track) |
|---|---|---|
| Iran only (from 29 Jan 2026, daily) | 287 | 1.14 px |
| Russia-Ukraine only (35 months + 61 weeks + 257 days) | 353 | 0.93 px |
| Both | 379 | 0.87 px |

A fingertip needs about 8 px. So no single-row timeline can meet the last requirement on a phone, for either
theater, today. (INFERRED: v1 has the same limitation with its 250-odd days on one slider.) Hence:

## 5.3 Two levels: overview and detail

| Row | Shows | Purpose |
|---|---|---|
| **Overview** | The whole extent, each step equally wide, density histogram, a draggable **view box** | See everything; jump anywhere |
| **Detail** | Only the steps inside the view box, each at least 8 px wide | The cursor and window handles live here; every step is touchable |

- State (in the store): `extent`, `view { fromISO, toISO }`, `cursor`, `window { fromISO, toISO }`, `mode`.
- The view's width in steps is `floor(trackWidth / stepPx)` with `stepPx >= 8`: **41 steps on the S22**, about
  100 on the Fire in landscape, about 150 on a wide PC screen (VERIFIED arithmetic; real track widths are measured
  in the prototype). Pinching the detail row changes `stepPx` (8 to 40 px).
- Because the scale counts **steps, not days**, a 41-step view is 41 days in the daily band and 41 months in the
  monthly band: all of 2022-2024 fits one phone screen (VERIFIED by test).
- The view follows the cursor during Play and when the user jumps to an event. Dragging the view box moves the
  view; the cursor stays where it is unless it falls outside, in which case it is carried along.
- Default view on first load: the most recent steps, ending today.

## 5.4 The window
Modes: *cumulative* (from the start of the extent to the cursor, the default), *window* (trailing N steps),
*single step*. An event is visible when its date interval intersects the window: `[dateISO, dateEndISO or dateISO]`;
`ongoing-from` events run from their start to the end of the extent. (VERIFIED by test: a month-precision event is
visible on any day of its month; an `ongoing-from` event is not visible before its start.)

## 5.5 Density strip
The overview draws a histogram per step, coloured by theater, read from the generated manifest (6.3), so it renders
before any event file has loaded. An event is counted once, in the step of its start date. Milestones draw as ticks.

## 5.6 Links over time ("thickening and thinning")
A link's **weight at the cursor** = the number of its observations whose interval touches the trailing window
(default 180 days). A dated observation's interval is its single day; a standing observation's interval runs from
its date to its end, or to the cursor if it has none. Weight steps: 1 observation = step 1; 2-3 = step 2; 4-5 =
step 3; 6 or more = step 4. In range with none in the window = *dormant* (thinnest, faint). Outside the link's date
range = not drawn. Weight is a count of dated evidence, never an editorial score, and the legend says so.
(VERIFIED by test: a sample link thickens in 2022, thins in 2023, goes dormant in 2024; a standing treaty does not.)

## 5.7 Playback
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
  manifest.json (generated)     counts per theater per step, file list, data version
  iran-war/
    theater.json                config (6.2)
    events-index.json (generated)  one compact row per event: what the map and timeline need
    events-2025.json  events-2026.json   full records
    enrich.json                 sidecar for v2-only fields until cutover (7.2)
    reference.json              airspace, naval assets, stat boxes, key-event list
  russia-ukraine/               same shape; events-2022.json ... events-2026.json
  east-asia/  caribbean/        theater.json only until events exist
/actors/actors.json
/links/links.json
/watchlist/watchlist.json
/sources/registry.json
/editorial/notes.json
/globe/                         graft: UPSTREAM.md (pinned commit bb40ac5 or later), LICENSE-MIT, adapted modules
/intake/                        unchanged; plus the candidates contract (section 8)
/tools/                         validate.js, test-timeline.js (v1, unchanged)
                                migrate-v1.js, build-manifest.js, validate-v2.js (new, slice 1)
/research/v2-schema-dryrun/     the F1 dry run: evidence only, not the slice-1 migration
/prototype/v2/index.html        the F1 prototype (Part B), sample data only
/docs/v2/                       these documents
```
The root already has a v1 `manifest.json` (the web-app manifest; VERIFIED), so the generated data manifest lives at
`theaters/manifest.json`.

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
  "timeline": { "axisFrom": "2026-01-29", "bands": [ { "from": "2026-01-29", "to": null, "unit": "day" } ] },
  "sides": [ { "id": "a", "label": "US + Israel" }, { "id": "b", "label": "Iran" } ],
  "legacyTypes": { "joint": "strike", "naval": "naval", "prewar": "unclassified" },
  "sourceAttribution": "CENTCOM · CTP-ISW · ACLED · Alma · OSINT + curated sources",
  "files": { "index": "events-index.json", "events": ["events-2025.json", "events-2026.json"], "reference": "reference.json" }
}
```
`status`: `full` (events curated), `lean`, `intake-only` (appears in the theater filter as "no curated events yet",
never as an empty map that looks like peace). `legacyTypes` maps a v1 type to a kind only; it does **not** name
actors (section 1). AOI boxes are copied from `layers.config.json`, which stays the switchboard for layers; the
theater file is the switchboard for theaters. `validate-v2.js` checks the two agree.

## 6.3 Event files, index and manifest
- **Full records:** one file per theater per calendar year of the start date:
  `{ "schema": "event/2", "theater": "iran-war", "year": 2026, "events": [...] }`, sorted by `dateISO` then `id`.
- **Index (generated):** `events-index.json`, one array row per event:
  `[id, dateISO, dateEndISO, datePrecision, lat, lng, kind, legacyType, tier, fog, claimStatus, title]`, plus a
  header naming the columns. Everything the map, the timeline and the Events list need before a card is opened.
- **Sizes for today's 600 events (VERIFIED by the dry run):**

| File | Bytes | Gzipped |
|---|---|---|
| v1 `warmaps-data.js` (for comparison) | 633 KB | 170 KB |
| `events-2026.json` (599 full records) | 918 KB | 178 KB |
| `events-2025.json` (1 record) | 1.4 KB | 0.9 KB |
| `events-index.json` (600 rows) | 76 KB | **17 KB** |

  The index is a tenth of the full file. It is what makes first paint fast now and what keeps it fast when a daily
  Russia-Ukraine backfill arrives.
- **Manifest (generated)** by `tools/build-manifest.js`: per theater, per timeline step: event count and milestone
  count; the file list with byte sizes and content hashes; a `dataVersion`. The validator fails if the index or
  the manifest is stale relative to the event files.
- **Loading order:** shell → `theaters.json` + manifest (overview strip draws) → the active theater's index (map,
  timeline and list are live) → full-record files in the background, newest year first (cards fill in) → other
  theaters on demand → links and watchlist only when their panel or layer is first opened.

---

# 7. Migration from `warmaps-data.js` (no ID breakage)

## 7.1 Rules (each one exercised on all 600 events)
- **IDs:** `IR-<legacyId padded to 5>`. `1 → IR-00001`, `600 → IR-00600`. Pure function, reversible, no lookup
  table (VERIFIED: round trip holds for all 600).
- **Key events:** `keyStrikeIds` and `keyStrikeTiers` (index 0-5 into the six category labels) convert into
  `reference.json` and each event's `significance` (VERIFIED: 33 ids, all with a category).
- **Text** is copied byte for byte into `detail`, `title` and `attackerText` (VERIFIED). The migration never
  rewrites or composes prose. (v1.0 proposed composing titles from place and target; the dry run produced 50 titles
  over the limit, the longest 177 characters, and the rule was withdrawn.)
- **Start date:** exactly v1's `parseWarDay` rule, so v2 places every event where v1 does: the first complete
  "month day, year" in the text before any dash; failing that, the first "month day" with the year found elsewhere
  in the string, or 2026. (VERIFIED two ways: all 600 parse, and the 215 events that also have an ISO date in the
  pass-2 research file agree with it, 215 of 215.)
- **End date:** "Mar 25-26, 2026" and "Feb 28 – Mar 1, 2026" set `dateEndISO` and `datePrecision: "range"`
  (57 events, all with an end after the start).
- **Six dates need a ruling.** Until ruled, they keep v1's placement, recorded in `enrich.json`:

| Event | v1 text | v1 places it at | Question |
|---|---|---|---|
| IR-00026, 27, 28, 37 | "Feb 28 – ongoing" | 28 Feb 2026 | Year is not written; 2026 is inferred. Confirm, and confirm `ongoing-from` |
| IR-00006 | "June 22, 2025 (prior conflict) / updated Feb 28, 2026" | 22 Jun 2025 | Keep as a backdrop event before the timeline? |
| IR-00131 | "Dec 2025 (signed) / Feb 22, 2026 (revealed)" | 22 Feb 2026 | Date of signing (month precision) or date revealed? |

- **Six `time` texts need a ruling** because a day number sits mid-text ("Overnight / Day 135 (TODAY)" on
  IR-00296): ids 126, 287, 288, 289, 294, 296. Default: keep the original under `legacy.time` and show nothing.
- **Fog:** true when any of three markers is present: the structured block, the words `FOG OF WAR` anywhere in
  `misc` (not only `FOG OF WAR:`; some events write "FOG OF WAR on cause:"), or the pass-2 fog flag. Result: 126.
- **Sources:** URLs from the pass-2 file, from `misc` and from `evidenceUrl` become entries with `publisher` set
  to the host name; where there are no URLs, publisher names from `source` and from "Source:" lines become
  name-only entries. Result: 250 `listed`, 322 `named-only`, 28 `legacy-unlisted`; 1,360 source entries.
- Anything unmapped goes to `legacy`. Nothing is dropped (VERIFIED: no v1 field is left without a destination).

## 7.2 Single master during the overlap (no double entry)

```
warmaps-data.js  (master for Iran events until cutover; v1 keeps reading it)
        +
theaters/iran-war/enrich.json  (v2-only fields keyed by legacyId: tier, sources detail, claimStatus, kind,
                                actors, titles, date rulings, geoPrecision, origin)
        |
        v   tools/migrate-v1.js  (deterministic; run locally and in validate.yml)
theaters/iran-war/events-*.json + events-index.json + reference.json   (GENERATED — header says "do not edit")
```
- New Iran events keep being added to `warmaps-data.js` exactly as today. v1 and v2 both update from one edit.
- The pass-2 research file seeds `enrich.json` with tiers and source URLs for ids 386-600 (VERIFIED: 215 records
  carrying `tier`, `fog`, `sources`, `verified`).
- CI check: regenerate and fail if the committed output differs. Generated files can never drift from the master.
- **Numbers the slice-1 migration must reproduce** (the dry run's results are its acceptance test): 600 events;
  precision 539 day / 57 range / 4 ongoing-from; fog 126; claim status 8 disputed / 118 claimed / 122 reported /
  352 unreviewed; tier 22 / 78 / 115 and 385 unrated; significance on 33; sources 250 / 322 / 28; zero schema
  failures.
- **Cutover (last slice):** the generated files become the master, `enrich.json` is folded in and deleted, the
  generated-file header is removed, v1 is frozen at `/v1/`. After cutover v1 stops receiving data. That is the
  only one-way door in the plan, and it is taken only when Allan says v2 has surpassed v1.

Russia-Ukraine has no v1, so its files are authored directly in v2 schema from the first event, with no `needs`,
no `legacy` and full source detail.

## 7.3 The enrichment pass (new in v1.1: a named piece of work, not a footnote)
The migration does not pretend to know what it does not, which leaves real work: 383 events with a flagged `kind`,
600 with unmapped `actors`, 331 with a bare place name for a title, 352 with no reviewed claim status, 385 with no
tier, 350 with no source URL. One reviewed pass over ids 1-385 (and a lighter one over 386-600) fills
`enrich.json` and empties `needs`. It uses the backfill pass-2 method: drafting agents, then independent
verifiers, sources required, blocks respected. It is independent of the code slices and can run beside them
(RELEASE_PLAN). Until it runs, v2 shows the Iran theater exactly as richly as v1 does and no richer.

## 7.4 Validators
`tools/validate-v2.js` (new in slice 1, same no-dependency style as `validate.js`):
A. JSON parses; every record matches its schema; enums closed; optional fields absent rather than null.
B. IDs: unique, shape, prefix matches home theater, continuous per theater. C. `legacyId` set is exactly 1..N and
matches `warmaps-data.js`; text fields byte-identical. D. Dates valid; end on or after start; precision consistent
with `dateEndISO`; no day number in `timeNote`. E. Honesty rules: v2-authored record with only `snippet-only`
sources ⇒ fog; `leaked` ⇒ `verificationNote`; link `confidence` equals the derived value; link fog rules; combat
watch rules; forbidden words absent from generated strings. F. References resolve (actors, registry ids, events
cited by links and watch items). G. Generated files, index and manifest are fresh. H. Theater AOIs agree with
`layers.config.json`. Every honesty rule ships with a mutation test (a bad record that must be rejected), as
`engine-tests.js` already does for links and the watchlist. The v1 validators keep running unchanged; all must
exit 0 before any push (Trap 6).

## 7.5 The globe graft (ruled 2026-11-09: copy, not fork)
Upstream is a Vite application with a Node server and about 200 modules (VERIFIED). WARMAPS has no build step.
So "copy selected parts" means: take the **logic** of chosen layer modules (military flight filter, GNSS, FIRMS,
satellites via satellite.js, cables, dams, launches, render governor), adapt each to the WARMAPS layer contract
(9.3), and record in `globe/UPSTREAM.md` the upstream path and commit for each. Upstream's HUD, voice, cockpit,
CCTV and server are not imported. The MIT notice travels with every copied file. Key-brokered layers (vessels,
FIRMS) wait for the small Worker described in the GEV spec; they are stubs until then.

---

# 8. Intake to candidates

```
nightly (GitHub Actions, no AI)            daily (scheduled Claude task)              Allan (phone)
feeds → intake-data: raw/YYYY/MM/DD/  →    intake-data: candidates/YYYY-MM-DD.json →  approve / edit / reject
                                           (candidate events AND candidate links)      ↓
                                                                    approved items appended to the master by a PR
```
- Candidates live on the `intake-data` branch, never on `main`, so drafting never deploys anything.
- A candidate is a full v2 Event or Link (or a new `observation` on an existing Link) wrapped in an envelope:

```json
{ "candidateId": "C-20261110-03", "recordType": "event", "theaterGuess": ["iran-war"],
  "record": { "...": "v2 event without id" },
  "intakeItems": ["raw/2026/11/10/iran-war.json#17"],
  "nearDuplicates": ["IR-00598"],
  "drafter": { "model": "sonnet-5.5", "date": "2026-11-10" },
  "checks": { "dateOk": true, "sourcesRead": 2, "snippetOnly": 0, "originsRepresented": ["israel-independent", "russia-state"] } }
```
- The intake already stamps each item with its feed's `origin`; the drafter carries it into `origin.label` and
  each source's `registryId`, so a claim from state media arrives attributed, with `claimStatus: "claimed"` and
  `fog: true`, and is kept, not filtered (the balance ruling).
- `originsRepresented` lets the approver see at a glance whether a candidate rests on one side's outlets.
- A candidate link from anonymous sourcing arrives as `alleged` and fog by derivation; the drafter cannot set otherwise.
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
            ┌──────────── core/loader ◄── theaters/*.json, links, watchlist, actors, sources
            ▼
        core/store  (the only mutable state)
   { theaters[], time{extent,view,cursor,window,mode}, viewMode, layersOn{}, selection, filters, layout, theme }
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
- **Imported data is data.** Anything loaded from outside the repo's own files (a shared view link, later a theme
  file) is validated against a schema of fixed choices, numbers and colours. No imported string is ever used as
  markup, a style rule or a web address.

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
`{ id, meta, load(ctx), update(ctx.time, ctx.aoi), render(renderer), teardown() }`.
`dormant` modules sit under `layers/_dormant/` and are never imported. Live layers obey `only_when: scrubber_is_today`
by checking the store's cursor, and every track they emit carries `source`, `observedAt` and the label OBSERVED.

## 9.4 Performance budget — Fire HD 10

Targets are **SPECULATION** until measured on Allan's tablet, except where a size is marked VERIFIED. The hardware
assumption is INFERRED: recent Fire HD 10 models have about 3 GB RAM, a mid-range ARM chip and a 1920x1200 screen,
and their browser reports roughly 1280x800 CSS pixels. The prototype prints the real viewport and a frame-rate
reading so these can be replaced with measurements.

| Budget | Target | How it is held |
|---|---|---|
| First usable paint (2D, cold, home Wi-Fi) | 3 s or less | Shell + manifest + index first; fonts self-hosted, `font-display: swap` |
| App code before Leaflet | 150 KB gzipped or less | No framework; panels load on first open |
| Data for first view | 60 KB gzipped or less | The index is 17 KB gzipped for 600 events (VERIFIED); full records (178 KB gzipped) load in the background |
| 2D markers | 1,500 visible without clustering | Canvas renderer (already used in v1); cluster above that |
| Scrub rate (2D) | 30 frames/s or more | Selectors work on the pre-sorted index; markers toggle, not rebuild |
| Globe load | First globe frame in 6 s or less; only on request | Cesium lazy from CDN |
| Globe frame rate | 24 frames/s or more while moving, idle when still | `requestRenderMode` (upstream's render-governor idea), resolution scale capped at device ratio 1.0, no terrain, no 3D tiles |
| Globe entities | 2,000 points, 60 arcs, 300 tracks at most | Point primitives, not entities; arcs bundled per actor pair |
| Memory | Stay under about 350 MB tab memory | One renderer alive at a time on phone and Fire |
| Fallback | If the globe holds under 20 frames/s for 5 s, offer 2D | `degraded` event; 2D stays the default view until the globe is measured |

Default view by device, until measured: 2D everywhere; the last choice is remembered per device.

---

# 10. What is deliberately not decided here
- Real link and watchlist content. F1 defines the containers; the content is research and editorial work.
- The approval page and candidate-drafting task (v2 plan P3).
- The key-brokering Worker for vessels and FIRMS (GEV spec).
- Whether East Asia and Caribbean ever get curated events.
- Theming. The store has a `theme` key and 9.1 has the import rule; the theme contract itself belongs to the design
  system and is the next F1 step.

# 11. Risks carried into the build

| Risk | Tier | Mitigation |
|---|---|---|
| Globe performance on the Fire tablet is unknown | SPECULATION | Globe is its own late slice; 2D is complete without it; `degraded` fallback |
| The enrichment pass is large (600 events, six fields) and v2's richer features wait on it for the Iran theater | VERIFIED size; INFERRED effort | Runs beside the code slices; `needs` keeps the interface truthful meanwhile; v2 is never poorer than v1 |
| Generated-file drift between v1 master and v2 output | INFERRED | CI regenerates and diffs on every PR; the dry-run numbers are the acceptance test |
| Links read as a "conspiracy board", or as one side's charge sheet | INFERRED | Off by default; bundling and caps (design system); derived confidence with `attestedBy`; validator-enforced fog rules |
| The dry run was written by the author of the schema | VERIFIED | The 215 research dates are an independent check on dates only. An independent agent review of the schema is available on Allan's word |
| A no-build module tree grows slow to load (many small files) | SPECULATION | HTTP/2 on Cloudflare; measured in slice 1; a bundling step can be added later without changing any module |
| CDN dependency for Leaflet and Cesium | INFERRED | Pinned versions with integrity hashes; Leaflet is small enough to vendor if a CDN ever fails |
| Scope creep (cause of the earlier five-week stall, per the v2 plan) | OBSERVED | RELEASE_PLAN fixes the slice order; each slice has one exit test |

# 12. Changes from v1.0 (2026-11-10) to v1.1

Each row is a finding in `research/v2-schema-dryrun/REPORT.md`.

| # | v1.0 said | The dry run showed | v1.1 |
|---|---|---|---|
| 1 | Link "documented" by a sanctions designation | One government's accusation would have counted as documentation | `attestedBy` on every observation; confidence derived (4.1) |
| 2 | One-row timeline; "any single day reachable with a finger" | 0.87 to 1.14 px per step on the S22 | Overview + detail rows; `view` in state (5.3) |
| 3 | Theater config derives actors from v1 `type` | 26 of 281 disagree with the attacker text | No actor derivation; `needs[]` and principle 5 (3.2, 3.5) |
| 4 | `kind` from `type`, closed enum | 74 events have no kind; about 29 "strikes" are not strikes | `unclassified` added; flagged defaults (3.5) |
| 5 | Titles composed from place and target, 80 characters | 50 over the limit, longest 177 | `title` = `city` verbatim, 120 (3.2) |
| 6 | Source entries require url, date, kind, access | None of the last three exists for any of 1,360 entries; 322 events have names only | Only `publisher` required; `named-only` status (3.2) |
| 7 | "63 dates need a human ruling" | 57 are clean ranges; 6 need a ruling | Table of six (7.1) |
| 8 | Fog 124; pass-2 file and data disagree by one | My search pattern required a colon; the true count is 126 and the two agree | Counts corrected; marker rule widened (7.1) |
| 9 | Combat tripwire `confirmed` by a documented link | A treaty could have "confirmed" combat | Needs a confirmed combat-kind event (4.2) |
| 10 | IDs `IR-0001` (4+ digits) | Text sorting breaks at 10,000 | Five digits (3.2) |
| 11 | Per-year files only; first view up to 250 KB gzipped | The index is 17 KB gzipped against 178 KB | Generated index; background load (6.3, 9.4) |
| — | (not in v1.0) | Sourcing rule v2 ruled 2026-11-10 | Source registry, coverage gaps, `leaked`, editorial notes (3.2, 4.5, 4.6, 8) |
| — | "34 monthly steps, about 1,040 days" | 35 and 1,042 | Corrected (5.2) |
| — | `time` copied to `timeNote` | 60 stale day labels | Day numbers stripped (3.2) |
