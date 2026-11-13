---
title: WARMAPS v2 — Architecture (data model and app architecture)
version: v1.2
date: 2026-11-13 (Iran-war Day 259)
author: Claude (Fable 5.2), sessions F1 and F1b-1, for Allan Sanceau
status: DRAFT FOR RULING — nothing here is built. Decisions are collected in F1_DECISIONS_FOR_ALLAN.md
supersedes: v1.1 (2026-11-11). v1.2 rewrites the parts that graded truth, under the editorial charter (STATE.md, ruled 2026-11-12), writes in the fog, lens and timeline direction of V2_SESSION_COMMON.md section 3b, and applies R1 review fixes M1-M4 (accepted by Allan 2026-11-13)
evidence: research/v2-schema-dryrun/ — REPORT.md (v1.1), dryrun.js (all 600 events), attribution.js + attribution-tests.js (the derivation rules, 66 tests), engine-tests.js (timeline, 16 tests)
companions: DESIGN_SYSTEM_v1.md, LAYOUT_ENGINE_SPEC_v1.md, RELEASE_PLAN_v1.md, layers.config.json, WARMAPS_v2_GEV_INTEGRATION_SPEC
---

> **Editorial charter (STATE.md, 2026-11-12) governs this document.** WARMAPS reports who said what, when and where
> it was published, from every side, and never rules on whether a claim is true. Nothing in this schema grades
> truth: there is no claim status, no confidence level and no verdict. If a later edit adds one, that is
> `KNOWN_FAILURES.md` F-010; the validator's charter test (7.4) exists to catch it.

# 0. Read this first (one screen)

**The idea.** WARMAPS v2 is one connected system that can be shown as separate theaters. Four record
types, one clock, two renderers:

| Record | What it is | Lives in |
|---|---|---|
| **Event** | One happening: a date, a place if anyone has named one, and the dated statements (**entries**) of everyone who has spoken about it, each with its claimant and source. Belongs to one or more theaters | `theaters/<theater>/events-<year>.json` |
| **Link** | A relationship between two actors that someone has stated (weapons, intelligence, finance, energy/shipping, personnel, backing), with every statement for and against it attributed | `links/links.json` |
| **Watch item** | A convergence tripwire (combat track) or a rhetoric/mobilization signal (weaker track). Its status says who has claimed, acknowledged or denied the events it cites | `watchlist/watchlist.json` |
| **Track** | A live or archived aircraft/vessel position. OBSERVED, never an event | provider (live) or the history data branch |

- **One clock:** the shared timeline runs on calendar dates. "Day N" is a per-theater label derived from the date.
- **Two renderers:** Leaflet (2D) and Cesium (3D globe) are interchangeable views over one in-memory store. Neither owns data.
- **Every slice is additive.** The v1 app is not touched until cutover; v2 is served at `/v2/` from generated data.

**The six choices that shape everything else** (each is a decision for Allan, see the decisions file):
1. No build step: plain ES modules served as static files (keeps the phone-driven, validate-then-push workflow).
2. v1's `warmaps-data.js` stays the master for Iran events until cutover; v2 reads JSON **generated** from it plus a sidecar for the new fields. No double entry.
3. Event IDs become `IR-00001` style strings formed mechanically from today's numbers; the old number is kept as `legacyId` forever.
4. Calendar date is the shared axis; war-day numbers are secondary labels.
5. Links and the watchlist are data with validator-enforced attribution rules, not UI conventions.
6. **(v1.2; ruled by the charter, not a decision)** Nothing is stored about how true a claim is. What the map shows is derived from who has spoken (3.4).

**What v1.2 changed (2026-11-13).** The charter replaced the question "how sure are we?" with "who has said so?".
- **Entries.** Every claim, denial and acknowledgement about a happening is a dated entry on one record, naming its
  claimant; outlets that only repeat it are carriers and count for nothing (3.4.1).
- **Four looks, derived.** Ghost (one side on record), solid (the sides on record agree it happened), split (someone
  on record denies it), faded ghost (still one-sided after the last look-again check). Computed from the entries for
  any date, so the map can be replayed "as known then" (3.4.2, 5.8).
- **Links and tripwires carry no grade.** They list who affirms and who denies (4.1, 4.2).
- **Lenses.** One or more parties' accounts, or two compared, are selectors over the same entries (3.4.6, 9.1).
- **R1 fixes M1-M4:** ids are never reused or renumbered and removal leaves a tombstone; acceptance numbers
  re-baselined; every text field is plain text and every URL is checked; `origin` is gone, replaced by the claimant
  on each entry.
- The structure is unchanged: layout engine, timeline model, theaters, renderer and layer contracts, file layout
  and migration mechanics are as in v1.1. Section 13 lists every change; section 12 is the v1.0 to v1.1 history.

**Evidence labels used in this document**
- VERIFIED: read from the repo or computed by the dry-run scripts (re-run 2026-11-13 on branch `v2/f1-architecture`, 600 events).
- OBSERVED: reported by Allan or recorded in STATE.md.
- INFERRED: my reasoning from verified facts.
- SPECULATION: untested targets, especially every performance number in section 9.4.

---

# 1. What exists today (VERIFIED, 2026-11-11)

Counts come from `research/v2-schema-dryrun/dryrun.js`, which loads `warmaps-data.js` and the pass-2 research file.

| Fact | Value | Design consequence |
|---|---|---|
| Events | 600, ids 1-600, integer, continuous today | Mechanical ID migration is safe. v2 does not require continuity (M1) |
| Fields on every event | `id type city country lat lng date time attacker structuralDmg humanCasualties` | The v2 core, renamed only where a name collides |
| Other fields | `misc` 594, `target` 599, `weaponCap` 498, `weapon` 472, `launchOrigin` 446, `source` 200, `perspective`/`verified` 176, `weaponType` 18, fog block 15, `origin*` 12, `intercepted` 6, `evidenceUrl` 4 | Every one has a destination in 3.2, except three values that grade truth (below) |
| `date` formats | 539 single days; 57 clean ranges ("Mar 25-26, 2026", "Feb 28 – Mar 1, 2026"); 4 open-ended ("Feb 28 – ongoing", no year); 2 annotated (ids 6, 131) | 594 migrate by rule; **6 need a ruling** (7.1) |
| `time` | Free text. 378 carry a "Day N" label; **60 of those (ids 109-297) are one lower than the day the app computes** (they count Feb 28 as Day 0) | Day numbers are never stored as text in v2 (3.2 `timeNote`) |
| `type` values | 15, mixing **who** (us, iran, joint, isr, hez: 281 events), **what** (naval, radar, energy, airport, political, intel, launch, platform: 245) and **neither** (prewar 9, global 65) | v2 splits into `kind` and `actors`; the old value is kept as `legacyType` |
| `type` vs `attacker` | In 26 of the 281 who-typed events the attacker text names someone else (type `iran`, attacker "Hezbollah" or "Houthis"); 29 look like non-strikes by keyword | Actors are **not** derived from `type`; derived `kind` is flagged (3.2 `needs`) |
| `attacker` | 299 distinct free-text strings | Actor normalisation is a reviewed pass, not part of the mechanical migration |
| v1 fog markers | **127** events: 125 carry "fog of war" text in `misc` (any letter case; id 217 writes "Fog of war note:"), 15 have the structured block, 2 only the block. 34 are in ids 1-385, 93 in ids 386-600 (matching the pass-2 research file exactly) | Kept as `legacy.fog`. v2 stores no fog flag: fog is derived from who has spoken (3.4.2) |
| Sources | 250 events have at least one URL (494 URLs, 87 distinct hosts); 322 have publisher names only; 28 have nothing. **No event records who made the claim as distinct from who carried it, nor any publication date** | Each event migrates as one entry with `claimant` and `published` in `needs` (7.1) |
| v1 values that grade truth | `verified` (176 events: true 158, probable 10, false 8), `fogLean` (15: "toward_confirmed" and others), `originKnown: "probable"` (9) | **Not carried into v2 files.** They stay in `warmaps-data.js`, which is preserved at `/v1/` after cutover. The charter test found the third one (7.4) |
| Titles | v1 has no title field. `city` holds "Place — what happened" for 269 events and a bare place name for 331; longest 90 characters | `title` = `city` verbatim; bare ones flagged |
| Tiers | Two unrelated things share the word: research tiers (milestone 22 / major 78 / standard 115, ids 386-600 only, not in the app) and Key Strike categories (6 categories, 33 ids) | v2 names them apart: `tier` and `significance` |
| `originLat/originLng/originName/originKnown` | 12 events; means **launch point geography** | v2 renames the v1 fields to `launch.*` (the word `origin` is also used by `intake/feeds.json` for a feed's label) |
| Standing platforms | 6 "events" are carrier groups and airbases (types `launch`, `platform`), 3 dated "Feb 28 – ongoing" | Stay events to keep their IDs: `kind: "deployment"`, `datePrecision: "ongoing-from"` |
| Other data | `airspaceData`, `navalAssets` (positions keyed by war day), `statPerspectives`, `flagData`, `keyStrike*`, `AI_PROMPT` | Per-theater `reference.json` (section 6) |
| App | One 310 KB `index.html`, 9 inline scripts, Leaflet 1.9.4 from cdnjs, Esri basemaps (no key), no build step | v2 is a new shell beside it, not a refactor of it |
| Epoch | Feb 28 2026 = Day 1, single source `parseWarDay`/`warDayNow` | A per-theater config value plus one shared function |
| Deploy | Cloudflare serves `main` as static files; `_headers` sets `no-store` on `/` | `/v2/` and `/prototype/v2/` deploy with no new infrastructure |
| Intake | GitHub Actions nightly, 37 feeds in `intake/feeds.json`, each labelled with an `origin` such as `russia-state` or `israel-independent`; raw output on branch `intake-data` | The source registry (4.5) adopts this vocabulary |
| Sourcing rule | Ruled 2026-11-10 11:18 (STATE.md): all sides kept, attributed and labelled; never defeat a block; note the gap | Built into entries, links, the registries and coverage gaps (2, 3.4, 4.1, 4.5) |
| Editorial charter | Ruled 2026-11-12 12:59 (STATE.md): attribution, not verification | Principle 2; the whole of 3.4; 4.1; 4.2; validator E0 (7.4) |
| Upstream globe | `bilawalsidhu/gods-eye-view` at commit `bb40ac5` (2026-11-09): MIT, Vite build, Node server, CesiumJS ^1.124, about 200 source modules | It cannot be dropped in; the graft is a small set of adapted modules (7.5) |

Three things noticed in v1 and **not changed here** (v1 is untouched on this branch):
- The 60 stale "Day N" labels above are visible wherever v1 shows the `time` text.
- Type `platform` (ids 320, 329) has no entry in v1's marker colour table (INFERRED: they may draw without a colour; not checked in a browser).
- The KEY FIELDS table in `STATE.md` still says 385 events / Day 170; its header is correct.

---

# 2. Principles

1. **Source discipline is structural.** A new record cannot enter a published file without a date and at least one entry that names who said it, when it was published and where it can be read. The validator rejects it; the interface never has to guess.
2. **Attribution, not verification (the charter).** The record says who claimed, who denied, who acknowledged and who merely carried it, each with a source; which directly involved sides have been heard and which have not. It never says how true a claim is, and no field, colour or score may. The one thing checked is that the record is authentic: the claim was really made, by that claimant, and the source says what we say (`recordCheck`). This applies to every side equally: a US Treasury designation and an IRGC communiqué are both a party speaking.
3. **One clock, one store, many views.** State lives in one place. Views subscribe. A view can be destroyed and recreated without losing anything.
4. **Additive only.** A later slice adds files, fields and modules. It may not rename a published field or re-key a published ID.
5. **Unknown is a value; a guess is not.** A field that was not established is absent or says `unknown`/`unclassified`, or the record is `unattributed`. Where migration must supply a starting value, the field is named in `needs[]` and the interface may not present it as fact (the F-003 lesson: a plausible wrong value costs more than a blank).
6. **Failure is loud and local.** Each module initialises behind its own guard and reports to a visible banner (the F-001 cure, kept). One dead panel never blanks the app.
7. **Restraint by default.** First load shows events and theater outlines only. Links, the watchlist and every context layer are one tap away, per ruling.
8. **Nothing about convergence is asserted by the software.** It shows links and tripwires with who says what. It never computes or displays a prediction or a verdict. Allan's own view, when he gives it, is a signed editorial note (4.6).
9. **Derived, never typed.** Looks, sides on record, missing sides, marker position, link line state and tripwire status are computed from entries by one shared module. Nobody types them, so nobody can set them wrongly, and they can be recomputed for any past date.

---

# 3. Event schema v2 (REV C: attribution)

**In one paragraph.** An event record is one *happening*. Everything anyone has said about it (a claim, a denial,
an acknowledgement, a revised figure) attaches to that record as a dated **entry** naming who said it and where it
was published. The record stores no judgement. What the map shows (ghost, solid, split, faded ghost), which sides
are on record, which are missing and where the marker sits are all **derived** from the entries by the rules in
3.4, the same way for every side, and can be recomputed for any past date.

## 3.1 Shape

Required fields are always present. **Optional fields are omitted when not established** (never written as `null`
or an empty string). A record authored in v2 (constructed example, not a real event):

```json
{
  "id": "IR-00612",
  "theater": ["iran-war"],
  "dateISO": "2026-12-01",
  "datePrecision": "day",
  "kind": "strike",
  "title": "Site A — strike reported",
  "place": "Site A", "country": "Iran",
  "lat": 32.65, "lng": 51.68, "geoPrecision": "site",
  "actors": { "by": ["idf"], "against": ["irgc"] },
  "tier": "major",
  "entries": [
    { "n": 1, "claimedBy": { "actor": "idf" }, "stance": "claims", "published": "2026-12-01",
      "text": "Says it struck a missile storage site near City A overnight.",
      "attributesTo": ["idf"],
      "locations": [ { "place": "near City A", "lat": 32.66, "lng": 51.67, "precision": "city" } ],
      "figures": [ { "what": "sites-hit", "value": 1 } ],
      "sources": [
        { "role": "original", "publisher": "IDF Spokesperson", "registryId": "idf-spokesperson", "url": "https://...", "published": "2026-12-01", "kind": "official-statement", "access": "read" },
        { "role": "carrier", "publisher": "Wire One", "registryId": "wire-one", "url": "https://...", "published": "2026-12-01", "access": "read" } ] },
    { "n": 2, "claimedBy": { "outlet": "state-tv" }, "stance": "acknowledges", "published": "2026-12-02", "respondsTo": [1],
      "text": "Reports explosions at Site A; gives no cause.",
      "locations": [ { "place": "Site A", "lat": 32.65, "lng": 51.68, "precision": "site" } ],
      "sources": [ { "role": "original", "publisher": "State TV", "registryId": "state-tv", "url": "https://...", "published": "2026-12-02", "access": "read" } ] },
    { "n": 3, "claimedBy": { "actor": "irgc" }, "stance": "denies", "scope": ["damage"], "published": "2026-12-02", "respondsTo": [1],
      "text": "Says no equipment was damaged.",
      "sources": [ { "role": "carrier", "publisher": "State TV", "registryId": "state-tv", "url": "https://...", "published": "2026-12-02", "access": "read" } ] }
  ],
  "checks": [ { "step": 1, "dateISO": "2026-12-02", "searched": ["state-tv", "irna"], "found": [2, 3] } ],
  "recordCheck": { "status": "checked", "pass": "intake-review", "date": "2026-12-02" },
  "detail": { "structuralDmg": "...", "humanCasualties": "..." },
  "rev": 3
}
```

Derived from it today (3.4): look **solid**; marker at Site A, "placed by State TV, 2 Dec 2026"; status line
"On record: Iran, Israel · Agree it happened; disagree on damage". Viewed *as known on 1 Dec*: a **ghost** at
City A, drawn at standard size, "On record: Israel · Missing: Iran".

## 3.2 Record fields

| Field | Type | Required | Rule |
|---|---|---|---|
| `id` | string | yes | `<PREFIX>-<5 digits>`. **Unique, never reused, never renumbered. Gaps are allowed** (R1 fix M1). The prefix records the theater the record was created in (IR, RU, EA, CB); it is not checked against the current home theater, so a record can move if theaters merge. Five digits keep plain text sorting correct to 99,999 per prefix |
| `legacyId` | integer | Iran only | The v1 number. `IR-00412` and `412` are the same record forever |
| `withdrawn` | object | no | **Tombstone** (M1). `{ dateISO, reason, into?, note? }`, `reason` one of `duplicate` (with `into`: the surviving id), `merged` (with `into`), `our-error`. A withdrawn record keeps its id and this field and nothing else is displayed; links and watch items that cited it are flagged by the validator. Records are withdrawn only for **our own** mistakes or a merge. A claimant taking a claim back is an entry (3.4.1), never a tombstone |
| `theater` | string[] | yes, at least 1 | First entry is the home theater. Add more when the event is material to another theater (3.3) |
| `dateISO` | `YYYY-MM-DD` | yes | When the happening is said to have occurred: start date, in the local calendar day as reported. Date only |
| `dateEndISO` | date | no | Present exactly when `datePrecision` is `range`, `week`, `month` or `year`. On or after `dateISO`. For `week`, `month` and `year`, `dateISO` is the first day of the unit and `dateEndISO` the last |
| `datePrecision` | enum | yes | `day`, `range`, `week`, `month`, `year`, `ongoing-from` (section 5) |
| `timeNote` | string | no | Time-of-day text ("Overnight", "~02:00 local"). **Never a day number**: migration strips a leading "Day N"; if a day number remains mid-text the note is omitted and the original stays in `legacy.time` (6 events) |
| `kind` | enum | yes | **What kind of happening.** `strike`, `interception`, `ground`, `naval`, `air-defense`, `infrastructure`, `energy`, `shipping`, `cyber`, `intel`, `deployment`, `political`, `diplomatic`, `economic`, `humanitarian`, `statement`, `unclassified`. The list grows only by a schema revision. For `statement`, the happening is the statement itself (3.4.2 rule 6) |
| `legacyType` | string | Iran only | The v1 `type`, kept so v1's filters and labels can be reproduced exactly |
| `title` | string | yes | Display line, at most 120 characters, neutral wording that no side on record would reject as a description of what is being talked about ("Site A — strike reported", not "Site A destroyed"). Migration copies v1 `city` verbatim |
| `place`, `country` | string | yes | `place` is the part of v1 `city` before the dash. `country` stays free text in migration |
| `lat`, `lng` | number | when on the map | WGS84. **For a record authored in v2 these equal the derived position (3.4.3) and the validator checks it.** Absent when no entry states a place: the record is listed, not mapped. For a migrated record they are v1's coordinates, which WARMAPS assigned from the place name; the card says "placed by WARMAPS" |
| `geoPrecision` | enum | with `lat` | `site`, `city`, `region`, `representative` (a stand-in point for a sea or region event), `unknown`. Migration sets `unknown` unless the text speaks about the coordinates themselves ("coordinates approximate", "representative point"): 39 events (R1 fix M2b) |
| `actors` | object | yes | `by[]` and `against[]` hold actor-registry ids (4.4): **who the entries on record name as acting and as acted upon.** This is the record's list of *directly involved sides* (charter rule 4), not a finding. If an entry disputes who did it, the marker is split and the card shows each attribution with its claimant. May be empty: an accident has no `by`; a statement has no `against` |
| `attackerText` | string | Iran only | v1 `attacker`, verbatim. Shown until `actors` is reviewed |
| `needs` | string[] | no | Names what still holds a **migration default**: any of `kind`, `title`, `actors`, `claimant`, `published`. Absent means none. **The interface must not display, filter or derive from a field listed here as if it were established.** `claimant` means entry 1 has no `claimedBy`; `published` means entry 1's `published` is only the event date. The enrichment pass removes entries (7.3) |
| `tier` | enum | no | `milestone`, `major`, `standard`: how much the happening matters to the story of the war, an editorial rating of importance, never of truth. Absent = not yet rated (385 today) |
| `significance` | enum | no | The Key Strike category (`world-changing`, `strategic`, `escalatory`, `tactical-pivot`, `infrastructure`, `political`). Present only on key events (33 today) |
| `entries` | object[] | yes, at least 1 | The dated statements on record (3.4.1). Append-only |
| `relatedIds` | string[] | no | Records this one was split from or is closely tied to (3.4.7). Display only |
| `checks` | object[] | no | The look-again log (3.4.5): `{ step, dateISO, searched[], blocked[]?, found[] }` |
| `sourcesStatus` | enum | Iran only | How much v1 recorded: `listed` (at least one URL), `named-only`, `legacy-unlisted`. Absent on records authored in v2, where every entry carries its sources |
| `coverageGaps` | object[] | no | "Note the gap" from the sourcing rule: `{ publisher, reason, date }`, `reason` one of `blocked`, `paywalled`, `removed`. A relevant source could not be read and was not circumvented |
| `recordCheck` | object | yes | Charter rule 5 only: whether **the record** was compared with its sources (the claim was really made, by that claimant, and the source says what we say). `status`: `checked`, `corrected`, `none`; optional `pass` and `date`. Says nothing about whether the claim is true, and is never drawn on the map |
| `detail` | object | yes | The v1 descriptive fields, text byte-for-byte. `structuralDmg` and `humanCasualties` required on migrated records; all optional on records authored in v2, where the same content lives in entries |
| `launch` | object | no | v1 `originLat/originLng/originName`, renamed. v1's `originKnown: "probable"` is a truth grade and is not carried (7.1) |
| `legacy` | object | no | v1 values with no v2 meaning yet: `time`, `perspective`, `weaponType`, `intercepted`, `source`, and `fog` (the v1 fog marker and note, 127 events). Never read by v2 logic except `legacy.fog` under decision 6 |
| `rev` | integer | yes | Bumped on any edit after publication |

**Plain text and links (R1 fix M3).** Every text field in every WARMAPS data file is plain text and is put on the
page as text, never as markup. That covers the repo's own data, not only imported files: event text will include
AI-drafted wording that began in RSS feeds. A `url` must start with `https:` or `http:`; the validator checks it.
Links open with `rel="noopener noreferrer"`. A source URL is never made up: a publisher with no URL on file is shown
as a name, not linked to a guess (v1 links unmatched names to a Wikipedia page; v2 does not).

## 3.3 Multi-theater events

An event is stored **once**, in its home theater's file. `theater[]` lists every theater it belongs to.
The loader indexes it under each. Rule of thumb for adding a second theater: the event would be missing
from that theater's story if it were left out (example: v1 id 131, the Russia-Iran MANPADS contract). If the
cross-theater content is a *relationship* rather than a happening, it is a Link that cites the event, not a
second theater tag.

## 3.4 Entries and what is derived from them

The reference implementation of every rule in this section is `research/v2-schema-dryrun/attribution.js`, with 66
constructed test cases beside it. Slice 1 writes the real module, `v2/app/core/attribution.js`: **one module, used
by the app, the build tools and the validator**, so the map, the index and the checks cannot disagree.

### 3.4.1 Entry fields

One entry is one statement by one claimant, published on one date. A statement that accepts part of an account and
rejects another part is two entries from the same source ("there was a strike" + "nothing was damaged").

| Field | Required | Rule |
|---|---|---|
| `n` | yes | Entry number within the record, from 1, never reused. An entry is cited as `IR-00612#2` |
| `claimedBy` | yes (or `claimant` in `needs`) | **Who said it** (charter rule 1). Exactly one of: `{ "actor": id }`, a party or body speaking on the record through a named person or an official channel; or `{ "outlet": registryId }`, an outlet reporting in its own voice (its reporters, its witnesses, its imagery). An outlet relaying **unnamed** officials is an outlet entry with `"citing": "an unnamed US official"`: it does not put that side on record |
| `stance` | yes | `claims`: says it happened. `acknowledges`: accepts another party's account, in whole or in part. `denies`: rejects it, in whole or in part. `withdraws`: the same claimant takes back its earlier entry (`supersedes` names it) |
| `scope` | no | Only with `denies` or `acknowledges`: which parts. Closed list: `happened`, `attribution`, `location`, `target`, `damage`, `casualties`, `weapon`, `timing`. Absent = the whole account. Filled only when the source itself says so |
| `published` | yes | Date the statement was published (`YYYY-MM-DD`); on or after the record's `dateISO` except for announcements of future acts. This is what makes "As known then" possible (5.8). Migration default: the event date, with `published` in `needs` |
| `respondsTo` | no | Entry numbers this statement answers |
| `supersedes` | no | The earlier entry **by the same claimant** that this one replaces (a revised figure, a correction, a withdrawal). The old entry stays in the file and leaves force from this entry's `published` date |
| `text` | v2-authored | What was said, in plain neutral words that attribute it ("Says...", "Reports...", "Denies..."). Never WARMAPS's own assessment |
| `attributesTo` | no | Actor ids this statement names as having done it. Absent when it does not say |
| `locations` | no | Places this statement names, in the order it names them: `{ place, lat, lng, precision }`. `place` is the claimant's wording; the coordinates are WARMAPS's geocoding of that name; `precision` is `site`, `city`, `region` or `representative`. The first is the statement's main location; the rest are further targets (3.4.3) |
| `figures` | no | `{ what, value, qualifier?, scope?, text? }`. `what` from a closed list: `killed`, `wounded`, `missing`, `detained`, `displaced`, `projectiles-launched`, `projectiles-intercepted`, `aircraft-lost`, `vessels-hit`, `sites-hit`, `other`. `qualifier`: `at-least`, `about`. `scope`: who or what is counted ("civilians") |
| `media` | no | Imagery published with the statement: `{ kind, publisher, registryId?, url }`, `kind` one of `satellite-image`, `photo`, `video`, `document`. Counted with its publisher (3.4.4); WARMAPS does not say what it shows beyond the publisher's own caption |
| `sources` | yes | Where the statement can be read. Each: `publisher` (required), `role`, optional `registryId` (4.5), `url`, `published`, `kind` (`primary-document`, `official-statement`, `wire`, `report`, `monitor`, `osint`, `leaked`), `access` (`read`, `snippet-only`, `archive`, `subscription`, `unrecorded`). **`role` separates "claimed by" from "carried by" (charter rule 3):** `original` = the claimant's own publication; `carrier` = an outlet repeating it. Carriers are listed on the card and **never counted anywhere**. For records authored in v2: `role` and `access` are required and at least one source is needed; `leaked` requires a `recordCheckNote` and is always labelled as leaked. Migrated entries carry v1's sources with no `role` (not yet sorted) |
| `withdrawn` | no | `{ dateISO, reason: "our-error", note }`: **we** recorded this entry wrongly (misread, wrong claimant). It leaves force and stays in the file as a tombstone |

Nothing is ever deleted from `entries`. A claimant changing a figure or taking a claim back adds an entry.

### 3.4.2 The state of a record on a date (the four looks)

Everything below is computed for a date **T** ("Record today": T = today; "As known then": T = the timeline cursor).

**Definitions**
- **In force on T:** an entry with `published` on or before T, not `withdrawn` by us, not named by the `supersedes`
  of another such entry, and not itself a `withdraws`.
- **Account:** whose voice an entry is. For `claimedBy.actor`: the actor's root in the registry (the IRGC's root is
  Iran; 4.4). The account is a **side** if that root is a state, an armed group or an alliance, and an **observer**
  if it is an intergovernmental body, a monitor or a company. For `claimedBy.outlet`: if the registry says the
  outlet is state or party media of an actor (4.5), the account is that actor's side, labelled "state media";
  otherwise the outlet is an observer in its own name. **Exile, opposition, advocacy and independent media are
  always observers; they never stand in for a side** (charter rule 2).
- **Affirms:** an account with an in-force `claims` or `acknowledges`.
- **Denies it happened:** an in-force `denies` with no `scope`, or with `happened` in its scope.
- **Disputes who did it:** an in-force `denies` with `attribution` in its scope.
- **Involved sides:** the roots of `actors.by` and of `actors.against` that are sides: the two **ends** of the
  happening. Not known while `actors` is in `needs`.
- **Missing:** involved sides with no in-force entry.

**Rules, applied in this order**

| # | Condition on T | Result |
|---|---|---|
| 0 | No entry published yet | Not known on T: not drawn, not listed |
| 1 | `withdrawn` (tombstone) | Never drawn |
| 2 | Entries were published but none is in force (the claimant withdrew) | `no-account`: listed with "No account in force: withdrawn by its claimant on [date]"; not drawn |
| 3 | `claimant` in `needs` (migrated record) | `unattributed`; no side is named. With a v1 fog marker (`legacy.fog`): drawn as a ghost. Decision 6 |
| 4 | Some account denies it happened, and some account affirms; **or** some account disputes who did it, and some account affirms | **split** |
| 5 | Not split, at least one account affirms, and **every end the record names has a side that affirms** (an end with no named actor is skipped) | **solid** |
| 6 | Otherwise | **ghost**; or **faded ghost** if the last look-again check (3.4.5) is logged on or before T |

Notes on the rules:
- Rule 5 is proposal A of **decision 9** ("the other end has spoken"). Options B (any two sides) and C (every
  involved side) change only this row; the reference implementation carries all three behind one setting.
- A `statement` record's happening is the statement being made. Its `by` is the speaker and its `against` is empty,
  so with the speaker on record it is solid. What the statement asserts about some other happening is an entry on
  *that* record.
- While `actors` is in `needs` but the claimant is recorded, the ends are not known, rule 5 cannot be met, and the
  record stays a ghost with "Missing: not yet established".
- An observer alone never makes a record solid when an end is named: the UN reporting a strike on Iran does not put
  Iran on record. Observers are named in the status line.
- Solid says "the sides on record agree it happened", and only that. It is not a finding that it happened, and the
  legend says so (DESIGN_SYSTEM 2.3).
- **Drawn size (provisional ruling 2):** a ghost or faded ghost is drawn at standard size whatever its `tier`,
  until it becomes solid or split.
- The stored record carries none of these results. The build tool writes today's look into the index (6.3); the
  app recomputes for any T.

### 3.4.3 Location history

1. **Candidates:** the first location of every in-force affirming entry that names a place.
2. **Anchor:** the candidate from the earliest-published entry (ties: lowest `n`). This is the claimed target.
3. **Compatible:** two locations are compatible when the distance between them is at most the larger of their
   precision radii (site 2 km, city 25 km, region 200 km; a `representative` point is compatible with anything).
4. **Marker:** the most specific candidate compatible with the anchor (`site` before `city` before `region` before
   `representative`; ties: earliest published, then lowest `n`). The card says who placed it and when: "Placed by
   IDF statement, 1 Dec 2026".
5. **Alternates:** when an account's candidates are all incompatible with the anchor, its most specific one is an
   alternate. Alternates are not drawn until the marker is tapped; then each appears as a small ghost joined to the
   marker by a thin line and labelled with who said so. **No uncertainty circles are drawn.**
6. **Further targets:** the remaining `locations` of the anchor's entry. A statement naming many targets is one
   record; the targets show as small ticks only when the record is open.
7. **No stated place:** no marker. The record appears in the Events list and in that side's list under a lens.
8. Because rules 1-4 run on the entries in force on T, the marker **moves into position** as more specific
   statements arrive, and "As known then" replays it.

### 3.4.4 The status line

One line on every card, built from the derived state, always in this order. Names are in alphabetical order so
that order never signals rank. No score, no percentage, no graded colour.

| Part | Text | When |
|---|---|---|
| 1 | `On record: Iran (state media), Israel` | Sides with an in-force entry. "(state media)" when that side is on record only through its state or party media |
| 2 | `Also reporting: Monitor X, United Nations` | Observers with an in-force entry |
| 3 | `Missing: Hezbollah` | Involved sides not on record. `Missing: not yet established` while `actors` is in `needs`. Omitted when none |
| 4 | `Agree it happened; disagree on damage; figures differ on killed` | Two or more accounts and not split. "disagree on" lists the scopes of in-force partial denials. "figures differ on" lists every `what` (with its `scope`) for which two accounts have different in-force values |
| 4 (split) | `Denied by Iran` and/or `Who did it is disputed by Israel` | Split |
| 5 | `Satellite images: 1 (published by Imagery Co)` | Count of in-force `media` of kind `satellite-image`, with publishers |
| 6 | `Unresolved: no account from Iran as of 31 Dec 2026` | Faded ghost: the missing sides and the date of the last check |

For an `unattributed` record the whole line is "Who said this is not yet recorded (carried over from v1)", plus
"v1 fog note on the card" where there is one. Example produced by the reference implementation:
"On record: Iran, Israel · Missing: Hezbollah · Agree it happened; disagree on damage; figures differ on killed ·
Satellite images: 1 (published by Imagery Co)".

### 3.4.5 Look-again checks and the faded ghost (schedule provisional, ruling 3)

- While a record is a ghost, checks fall due **1, 3, 7 and 30 days** after its first entry was published. The
  schedule is one config value (`lookAgainDays`); changing it changes no data.
- A check searches the outlets of the **missing** sides, taken from the source registry (4.5). It is the nightly
  intake's job (section 8), honest-bot only, batched per outlet. A site that refuses us is recorded in `blocked`
  and in `coverageGaps`, and is not fought.
- Each check is logged in `checks[]` when Allan approves its result, **including when it found nothing**:
  `{ step: 7, dateISO, searched: [registry ids], blocked: [...], found: [entry numbers added] }`.
- **Faded ghost:** the record is still a ghost and a check with the last step (30) is logged on or before T. The
  card then reads "Unresolved: no account from X as of [date of that check]". If 30 days have passed and the check
  was not run, the record stays an ordinary ghost and appears in the editor's "checks due" list: the site never
  says it looked when it did not.
- A faded ghost becomes solid or split the day another side's entry arrives, however late.
- v1's 15 `fogCheckpoint` values were the seed of this. They are all past and are kept as text in `legacy.fog`.

### 3.4.6 Lenses and compare

State lives in the store (9.1); the selectors below are pure functions of the entries.

- **Lens: All** (default): everything above.
- **Lens: one or more parties** (accounts from the registry, never pre-built blocs): a record is in the lens when
  one of those parties has an in-force entry on it.
  - It is **on the map** when that party affirms it and names a place; the marker sits at the place **that party**
    gives (3.4.3 run on that party's entries only), so markers move when the lens changes.
  - If that party's only entries deny it, the record is **listed** under "Denied by X" in the lens panel and not
    drawn as that party's event.
  - The marker keeps the record's overall look (ghost, solid, split), so the reader still sees whether anyone else
    has spoken. The card shows only that party's entries, with the count of other accounts hidden.
  - The banner text comes from the state: "Showing X's account only, not WARMAPS's view · N other accounts hidden ·
    accounts on file: N".
- **Compare two parties A and B:**

| A | B | Drawn |
|---|---|---|
| affirms | affirms, compatible place, neither disputes who did it | **solid** (both halves) |
| affirms | affirms, but at an incompatible place, or one disputes who did it | **split**, one half per party, each half at that party's place |
| affirms | denies it happened, or disputes who did it | **split**, one half per party |
| affirms | silent, or disputes only a detail | **ghost** on A's half |
| denies only | denies only, or silent | listed, not drawn |
| silent | silent | not in the comparison |

- Lens buttons are listed in alphabetical order. There is **no left-to-right slider**: a line forces many parties
  into two camps and the points in between mean nothing.
- A filter may count sides heard (the Fog and Contested layers, 9.1). It may never select *which* side is believed.

### 3.4.7 Merging, splitting and tombstones

- A new claim from the intake is **matched** to an existing record or opens a new one. Allan approves every merge.
- **Merge** of two records: the entries of one move into the other and are renumbered after its last entry; each
  moved entry keeps `movedFrom: "IR-00598#1"`. The emptied record becomes a tombstone (`reason: "merged"`, `into`).
- **Split** is always possible: a new record with a new id takes the entries that belong to it (each with
  `movedFrom`), and both records note the other in `relatedIds`.
- **During the overlap** the Iran master is still `warmaps-data.js` (7.2). Tombstones for Iran records are written
  in `enrich.json`. The v1 file is never renumbered. Making v1 itself stop showing a withdrawn event needs a small
  change to the live app, which waits for Allan's authorisation in whichever session first needs it.

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

Result: 217 events get an established `kind`; 383 carry a flagged starting value. Every event starts with `actors`,
`claimant` and `published` in `needs`; 331 start with `title` in `needs`. Until the enrichment pass (7.3), the Iran
theater's filters use `legacyType`, exactly as v1 does; `kind` filters are for theaters authored in v2 and for
multi-theater mode. The R1 review's finding that `kind` mixes what happened with what was hit (S10) is not
resolved here; it is listed in section 10.

## 3.6 Example of a lean RU milestone (month precision)

```json
{ "id": "RU-00007", "theater": ["russia-ukraine"],
  "dateISO": "2022-09-01", "dateEndISO": "2022-09-30", "datePrecision": "month",
  "kind": "ground", "title": "Kharkiv counteroffensive", "tier": "milestone", "entries": ["..."], "...": "..." }
```
A later daily backfill adds `RU-00412` ... for individual days in that month. The milestone record stays;
nothing is renumbered. This is the "full-detail backfill without rework" requirement.

---

# 4. Links, watchlist, actors, sources, editorial notes

## 4.1 Link schema

A Link says: *someone has stated that actor A and actor B are connected in category C over this period.* It
records every statement for and against, with its claimant and source. It carries **no grade**: no confidence
level, no "documented", no fog flag typed by hand. The same entry shape as events (3.4.1) is used.

```json
{
  "id": "LK-00003",
  "category": "weapons-tech",
  "from": "iran", "to": "russia", "direction": "from-to",
  "theaters": ["iran-war", "russia-ukraine"],
  "title": "Drone transfers and licensed production",
  "summary": "Two or three sentences, neutral voice, attributing each statement to its claimant.",
  "dateStartISO": "2022-08-01", "datePrecision": "month",
  "entries": [
    { "n": 1, "claimedBy": { "actor": "usa" }, "stance": "claims", "published": "2022-09-08", "record": "sanctions-designation",
      "covers": "Says the manufacturer supplied drones used in Ukraine.",
      "sources": [ { "role": "original", "publisher": "US Treasury", "url": "https://...", "kind": "official-statement", "access": "read" } ] },
    { "n": 2, "claimedBy": { "actor": "iran" }, "stance": "acknowledges", "published": "2022-11-05", "record": "official-statement",
      "covers": "Says a small number of drones were sent before the war.", "sources": ["..."] },
    { "n": 3, "claimedBy": { "actor": "iran" }, "stance": "denies", "published": "2022-11-05", "record": "official-statement",
      "covers": "Denies any transfer during the war.", "sources": ["..."] }
  ],
  "rev": 1
}
```
(Illustrative shape only: the dates and sources above are placeholders, not researched facts.)

| Field | Rule |
|---|---|
| `category` | `weapons-tech`, `intelligence`, `sanctions-finance`, `energy-shipping`, `personnel`, `backing-diplomatic`. Exactly the six ruled categories |
| `from`, `to` | Actor-registry ids: the link's two **participants**. `direction`: `from-to`, `both`, `undirected` (for the reverse, swap the ends) |
| `theaters` | Which theaters the link touches. A link inside one theater is allowed (Iran to Hezbollah) |
| dates | `dateStartISO`, optional `dateEndISO` (absent = ongoing), `datePrecision` as for events |
| `entries[]` | At least one. The event entry fields (3.4.1) apply: `claimedBy`, `stance`, `published`, `sources` with `role`, `supersedes`, `withdrawn`. Link-specific fields below |
| `covers` | **Required on every link entry.** One plain sentence saying exactly what this statement affirms or denies, so a narrow acknowledgement cannot be read as support for the whole title, and a denial is never lost (the R1 review's cases L1 and L2) |
| `record` | What kind of public record the statement is, from a closed list: `treaty-or-contract`, `court-judgment`, `official-statement`, `sanctions-designation`, `igo-report`, `wreckage-report`, `imagery`, `trade-data`, `media-report`. A description for the reader ("a court judgment by X"), never a rank. An indictment is an `official-statement` by the prosecuting government |
| `events[]` | Optional event ids the statement refers to |
| `standing`, `standingUntil` | `standing: true` marks a statement that stays in effect, such as a treaty in force. `standingUntil` ends it |
| `via[]` | Optional intermediate actor ids for routing (a transshipment state). Display only |

**Derived on a date T** (same definitions of *in force* and *account* as 3.4.2; reference implementation `deriveLink`):

| Derived | Rule |
|---|---|
| `affirmedBy` | Accounts with an in-force `claims` or `acknowledges` |
| `acknowledgedBy` | The participants among them |
| `deniedBy` | Accounts with an in-force `denies` (whole or part: on a link any denial counts) |
| `noStatementFrom` | Participants with no in-force entry |
| Line state | **split** if anyone on record denies and anyone affirms · **solid** if both participants affirm and no one denies · **ghost** otherwise (stated by others only, or by one participant only) |
| Weight | 5.6: how many separate accounts have affirmed it lately. Not a grade |

The link card always shows the four lists by name, each statement with its `covers` sentence and source, and the
line: "WARMAPS does not rate this link. It records who says it exists and who says it does not."

Why this shape: v1.0 and v1.1 graded links, and the R1 review showed the grade could be reached by an accuser's
own paperwork, by a boast, or even raised by a denial. Under the charter the question "how well established is
this link?" is the reader's. The record's job is to make sure the reader sees every voice, and the same rule
treats a US designation, a Russian Foreign Ministry statement and an Iranian one identically.

Links never carry coordinates: endpoints come from the actor registry, so an actor always anchors at one place.

## 4.2 Watchlist schema

Two tracks with **different scales that cannot be compared or summed**.

```json
{
  "id": "WL-00002",
  "track": "combat",
  "title": "Iranian personnel or missiles used directly against Ukraine or NATO",
  "definition": "Exact, testable wording of what counts and what does not.",
  "requires": { "kinds": ["strike", "interception", "ground", "naval", "air-defense"], "by": ["iran"], "against": ["ukraine", "nato"] },
  "theaters": ["iran-war", "russia-ukraine"],
  "status": "none-on-file",
  "history": [
    { "dateISO": "2026-11-10", "status": "none-on-file", "note": "Baseline at creation.", "evidence": { "events": [], "links": [] }, "reliedOn": [], "sources": [] }
  ],
  "rev": 1
}
```

**Combat track (tripwires).** The status is **read off the looks of the cited events** (3.4.2); nobody types it.

| `status` | Shown as | Derived when, on the entry's date |
|---|---|---|
| `none-on-file` | No claim on file | No cited event is known |
| `one-sided` | Claimed by one side | Every cited event is a ghost or faded ghost |
| `contested` | Claimed and denied | A cited event is split, and none is solid |
| `both-ends` | Stated by both ends | A cited event is solid |

Each row in the panel then names names, from the cited events: "Claimed by: Ukraine (names Iran) · Denied by: Iran
· No account from: Russia". There is no status meaning "it happened".

Rules (validator-enforced; each has a passing mutation test in `attribution-tests.js`):
- `requires` is machine-checkable. A cited event must be of a combat kind, must name the required actors, and must
  have `kind`, `actors` and `claimant` out of `needs`. An `unattributed` record can never move a tripwire.
- A link, however many voices affirm it, cannot move a combat tripwire by itself: a relationship is not combat.
  Evidence may not cite a rhetoric item or an event of kind `statement`.
- A history entry's `status` must equal the derivation from its cited events **as of that entry's date**, and
  `reliedOn` stores what it relied on then: `[{ ref, look }]`. History is in date order and is never edited.
- If a cited record later changes look (a denial arrives, the other end speaks), the old history entry stays true
  to its date and the validator fails with "stale: add a history entry" until a new dated entry is written. (The
  R1 review's case W3: an edit to an event used to invalidate history that could not be edited.)
- Scrubbing the timeline replays the status as of the cursor date.

**Rhetoric track (rhetoric and mobilization).** `quiet` → `noted` → `elevated` → `sustained`, derived from the
count of dated, attributed statements (events of kind `statement` or `political`) cited within a trailing window.
The thresholds are config values set when the first real items are written (slice 7). It has no status in common
with the combat track.

Structural guarantees:
- `definition` is required and must be testable wording.
- The two tracks are separate arrays in the file and separate sections in the interface. No field, score or colour
  is shared. The id carries no track letter, so moving an item between tracks never changes its id.
- No aggregate "convergence score" exists in the schema. The only summary the system may compute is a count.
- **Headline:** a count, never a verdict: "N of M combat tripwires have a claim on record", followed where
  relevant by "K stated by both ends · J denied". The words **confirmed**, **merger**, **merged**, **one war** and
  **world war** do not appear in any system-generated string. Whether a stronger word is ever used is Allan's
  editorial call (decision 5), made in a signed note (4.6).

Initial combat tripwires, to be defined when real data is added: Russian naval escorts in Hormuz; Iranian
personnel or missiles used directly against Ukraine or NATO; Russian forces engaging US or Israeli assets; NATO-Iran
direct clash. Initial rhetoric items: nuclear signalling; readiness-timeline statements; defence-budget surges;
conscription; alliance pledges.

**One item from the ruled list does not fit either track as written:** "coordinated cross-theater escalation
timing". Timing is a pattern someone reads into events; no single event states it. Options for Allan when
definitions are written: (a) redefine it as *stated operational coordination* (a joint operation that a
participant announces or another party alleges, recorded like any event, with who says so); or (b) keep timing
coincidences as dated entries in a third, status-free list, "Patterns noted". It is held out of the starting set
until he rules.

## 4.3 Why these are separate files

`links/` and `watchlist/` sit beside `theaters/`, not inside one, because they are cross-theater by nature and
because single-theater mode must be able to load without them. Deleting both folders leaves a working
single-theater WARMAPS: that is the "informative if they don't merge" test.

## 4.4 Actor registry

`actors/actors.json`: the shared vocabulary for "who", and the source of every **side** and **lens**.

```json
{ "id": "irgc", "name": "IRGC", "long": "Islamic Revolutionary Guard Corps", "kind": "armed-force",
  "parent": "iran", "anchor": { "lat": 35.69, "lng": 51.39, "label": "Tehran" }, "theaters": ["iran-war"] }
```
- `kind`: `state`, `armed-force`, `armed-group`, `alliance`, `igo`, `monitor`, `company`.
- **Ids are flat.** `parent` is used only for an organ of a state or group (the IRGC under Iran, CENTCOM under the
  United States). An entry by a child speaks for its root. A *backing* relationship is never a parent: Hezbollah
  has no parent, and "Iran backs Hezbollah" is a Link with its own entries, because who commands whom is itself
  something people state and deny. (v1.1 used dotted ids such as `iran.irgc`; an id like `iran.hezbollah` would
  have asserted a disputed relationship. R1 review S11.)
- **Side:** a root of kind `state`, `armed-group` or `alliance`. **Observer:** `igo`, `monitor`, `company`, and
  every outlet that is not state or party media (4.5). A government and its opposition are separate actors with
  separate ids; neither is the other's parent.
- Filtering or lensing by `iran` includes its organs and nothing else.
- The registry starts small (about 40 actors) and grows by review. It never blocks a slice: a migrated event is
  valid with empty `actors` and `actors` in `needs`.

## 4.5 Source registry

`sources/registry.json`: one entry per publisher, so labels are consistent and "which sides have we heard from" is
checkable. It is the "Source & Feed Registry" the v2 plan already anticipates (P7), started small.

```json
{ "id": "tass", "name": "TASS", "hosts": ["tass.com"], "country": "RU", "ownership": "state", "actor": "russia",
  "origin": "russia-state", "status": "active", "feedId": "tass" }
```
- `ownership`, from a fixed list: `state`, `party` (the media arm of an armed group or ruling party), `independent`,
  `exile`, `advocacy`, `international-public`. `actor`: whose media it is, required for `state` and `party`.
  `covers[]`: optional, the sides an outlet mainly reports on (how the look-again job finds outlets for a missing
  side). `origin` keeps the fine label already used in `intake/feeds.json`.
- What the registry is for under the charter: (1) the "state media" label and grouping an outlet's own-voice
  reports with its side (3.4.2); (2) keeping exile, opposition and advocacy media from standing in for a side;
  (3) telling the look-again job where a missing side publishes; (4) the coverage report: which sides have no
  readable outlet at all. **It is not used to rank or weigh sources**: v1.1's "independent sources" test existed
  only to reach a truth grade and is gone.
- `status`: `active`, `blocked` (the site refuses us; we do not fight it; records get `coverageGaps`), `dropped`
  with a required `statusNote`. Per the ruling, a source is dropped only for demonstrated fabrication or because
  it does not work, never for its side.
- Starting content: the 37 intake feeds plus the 87 hosts already cited in events (VERIFIED counts). The registry
  never blocks a slice: a source without `registryId` is valid; its outlet simply has no label yet.
- **Known gap (R1 review, VERIFIED there):** no Iranian state, Hezbollah, Houthi or Palestinian official outlet is
  in the active feed list today, and none is among the 87 linked hosts. Until that changes, most Iran-war ghosts
  will have no way to solidify. Closing it is intake work (Track P), inside the sourcing and access rule.

## 4.6 Editorial notes

`editorial/notes.json`: Allan's own assessments, kept apart from the record, as the sourcing rule requires
("Allan's own opinion, when given, is clearly labelled as his").

```json
{ "id": "ED-0001", "author": "Allan Sanceau", "dateISO": "2026-11-11", "title": "...", "text": "...",
  "refs": { "events": [], "links": [], "watch": [] } }
```
A note is shown only in its own labelled place ("Opinion — Allan Sanceau, 11 Nov 2026"), never inside an event,
link or watch item, and it cannot change anything derived (charter rule 6). This is where a word like "merger"
would live if he chose it. The byline text is a setting, not a constant in the code.

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

- State (in the store): `extent`, `view { fromISO, toISO }`, `cursor`, `window { fromISO, toISO }`, `mode`, `record` (5.8).
- The view's width in steps is `floor(trackWidth / stepPx)` with `stepPx >= 8`: **41 steps on the S22**, about
  100 on the Fire in landscape, about 150 on a wide PC screen (VERIFIED arithmetic; real track widths are measured
  in the prototype). Pinching the detail row changes `stepPx` (8 to 40 px).
- Because the scale counts **steps, not days**, a 41-step view is 41 days in the daily band and 41 months in the
  monthly band: all of 2022-2024 fits one phone screen (VERIFIED by test).
- The view follows the cursor during Play and when the user jumps to an event. Dragging the view box moves the
  view; the cursor stays where it is unless it falls outside, in which case it is carried along.
- Default view on first load: the most recent steps, ending today.

## 5.4 The window
**The map opens on the last 7 days** (provisional ruling 1, 2026-11-12): `window` = the seven dates ending today,
drawn as a band on the overview row. Drag the band to move it; drag either edge to widen or narrow it to any range;
**All** sets it to the whole extent. The cursor is the band's right edge.

Modes: *window* (the default: a band of any width, 7 days at first load), *cumulative* (from the start of the
extent to the cursor; this is what All gives), *single step*. An event is in the window when its date interval
intersects it: `[dateISO, dateEndISO or dateISO]`; `ongoing-from` events run from their start to the end of the
extent. (VERIFIED by test: a month-precision event is visible on any day of its month; an `ongoing-from` event is
not visible before its start and stays visible in the 7-day window; an event 8 days old is outside the default
window and inside All.) In windows longer than 30 days, older events are drawn fainter (DESIGN_SYSTEM 2.4).

## 5.5 Density strip
The overview draws a histogram per step, coloured by theater, read from the generated manifest (6.3), so it renders
before any event file has loaded. An event is counted once, in the step of its start date. Milestones draw as ticks.

## 5.6 Links over time ("thickening and thinning")
A link's **weight at the cursor** = the number of **separate accounts** (sides and observers, 3.4.2) with an
affirming entry in force whose `published` date falls in the trailing window (default 180 days), or that is
`standing` at the cursor. Weight steps: 1 voice = step 1; 2-3 = step 2; 4-5 = step 3; 6 or more = step 4. In range
with no voice in the window = *dormant* (thinnest, faint). Outside the link's date range = not drawn.

What weight counts, and does not (the R1 review asked for this rule):
- It counts voices, not statements: six statements by one government weigh the same as one.
- A carrier adds nothing (charter rule 3). An outlet repeating another's report is a carrier of that entry.
- A denial adds nothing to weight; it changes the line state to split (4.1).
- It is computed from entries published on or before the cursor, so a 2022 cursor never shows what was said in 2024.
- Weight is a count of who has spoken lately. It is not a judgement of importance or of truth, and the legend says so.

(VERIFIED by test: six statements by one voice give step 1; three affirming voices and one denial give step 2 and
a split line; a voice falls out of the window after 180 days; a standing treaty does not.)

## 5.7 Playback
Play advances the cursor one step per tick at the band's unit (so playback speeds through monthly history and
slows into daily 2026). Stops at today. Reduced-motion users get step buttons only.

## 5.8 Record today and As known then
One switch in the store, `time.record`:

| Value | T used by every derivation (3.4.2) | What the reader sees |
|---|---|---|
| `today` (default) | Today | Each event in the window as the record stands now |
| `then` | The cursor date | Each event as the record stood on that date: only entries published by then. An event whose first entry was published after the cursor is not shown, even if it is said to have happened earlier |

Play in `then` mode shows ghosts appear, solidify, move into position, split or fade, because the look and the
marker position are recomputed at each step from the entries in force. That is why `published` is required on
every entry. For migrated records `published` is only the event date (`needs`), so they simply appear on their
day; the mode is fully meaningful for records authored in v2 and for migrated records after enrichment.
(VERIFIED by test: a record is unknown the day before its first entry, a ghost on day one, solid once the other
end speaks; a revised figure shows as it stood.)

---

# 6. File layout

## 6.1 Repo

```
/                               v1 stays here untouched until cutover
  index.html  warmaps-data.js  STATE.md  KNOWN_FAILURES.md  _headers  tools/  intake/  research/
/v2/                            the v2 app (static, no build)
  index.html                    shell: markup, CSS links, one module entry
  app/
    core/     time.js  store.js  schema.js  attribution.js  loader.js  selectors.js  errors.js  config.js
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
    enrich.json                 sidecar for v2-only fields until cutover (7.2): entries, checks, tombstones...
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
  `[id, dateISO, dateEndISO, datePrecision, lat, lng, kind, legacyType, tier, look, firstPublished, accounts, title]`,
  plus a header naming the columns. Readers map columns by header name; new columns are only ever appended.
  `look` is today's derived look (3.4.2), written by the build tool and recomputed by the validator. `accounts` is
  the list of accounts on record today, which lets the lens buttons and the Fog and Contested layers work before
  the full records arrive. A record whose look or position has changed since its first entry also carries `steps`:
  `[[publishedISO, look, lat, lng], ...]`, so "As known then" can replay from the index alone. Tombstones are not in
  the index.
- **Sizes for today's 600 events (VERIFIED by the dry run):**

| File | Bytes | Gzipped |
|---|---|---|
| v1 `warmaps-data.js` (for comparison) | 633 KB | 170 KB |
| `events-2026.json` (599 full records) | 899 KB | 179 KB |
| `events-2025.json` (1 record) | 1.5 KB | 0.9 KB |
| `events-index.json` (600 rows) | 85 KB | **18 KB** |

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
  table (VERIFIED: round trip holds for all 600). A v1 number is never reused or shifted: v1 keeps its numbering
  as it is, and a removed event leaves a tombstone (3.4.7).
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

- **Six `time` texts** have a day number mid-text ("Overnight / Day 135 (TODAY)" on IR-00296): ids 126, 287, 288,
  289, 294, 296. The default is applied: the original is kept under `legacy.time` and no `timeNote` is shown.
  (v1.1's dry run stated this default but did not apply it; R1 fix M2c. Now 0 notes carry a day number.) Allan may
  still rule otherwise for any of the six.
- **One entry per event.** Each v1 event becomes a record with a single entry: `{ n: 1, stance: "claims",
  published: <the event's start date>, sources: [...] }`. v1 never recorded who made a claim as distinct from who
  carried it, nor when it was published, so the entry has no `claimedBy`, its sources have no `role`, and
  `claimant` and `published` go into `needs` on all 600. Nothing is guessed: `attackerText`, the v1 fog note and
  the source list are shown as v1 wrote them until the enrichment pass turns them into real entries (7.3).
- **v1 fog marker:** present when any of three is found: the structured block, the words "fog of war" anywhere in
  `misc` in any letter case, or the pass-2 fog flag. Result: **127** (34 in ids 1-385, 93 in ids 386-600; R1 fix
  M2a added id 217). It is stored as `legacy.fog` (the structured block's status, note, parties and checkpoint text
  where they exist; otherwise just a marker). It is **not** a v2 fog flag. Its only effect is decision 6: these 127
  draw as ghosts, the other 473 as `unattributed`.
- **v1 truth grades are not carried:** `verified` (176 events), `fogLean` (15) and `originKnown: "probable"` (9).
  `originKnown: "approximate"` (3) becomes `launch.precision`. The pass-2 verifier results (PASS 171, FIX 44) are
  record-to-source checks and become `recordCheck` (`checked` 171, `corrected` 44, `none` 385).
- **Geo precision:** `representative` only where the text speaks about the coordinates themselves. Result: 39
  (R1 fix M2b: v1.1's looser pattern also matched "approximately 92%" and "Houthi representatives").
- **Sources:** URLs from the pass-2 file, from `misc` and from `evidenceUrl` become sources of entry 1 with
  `publisher` set to the host name; where there are no URLs, publisher names from `source` and from "Source:"
  lines become name-only sources. Result: 250 `listed`, 322 `named-only`, 28 `legacy-unlisted`; 1,360 sources.
- Anything unmapped goes to `legacy`. Apart from the three truth grades above, nothing is dropped (VERIFIED: every
  v1 field has a destination or is on that list).

## 7.2 Single master during the overlap (no double entry)

```
warmaps-data.js  (master for Iran events until cutover; v1 keeps reading it)
        +
theaters/iran-war/enrich.json  (v2-only fields keyed by legacyId: tier, entries, checks, kind, actors, titles,
                                date rulings, geoPrecision, recordCheck, tombstones)
        |
        v   tools/migrate-v1.js  (deterministic; run locally and in validate.yml)
theaters/iran-war/events-*.json + events-index.json + reference.json   (GENERATED — header says "do not edit")
```
- New Iran events keep being added to `warmaps-data.js` exactly as today. v1 and v2 both update from one edit.
- The pass-2 research file seeds `enrich.json` with tiers and source URLs for ids 386-600 (VERIFIED: 215 records
  carrying `tier`, `fog`, `sources`, `verified`).
- CI check: regenerate and fail if the committed output differs. Generated files can never drift from the master.
- **Numbers the slice-1 migration must reproduce** (re-baselined 2026-11-13; the dry run's results are its
  acceptance test):

| Measure | Value |
|---|---|
| Events / entries | 600 / 600 (one each) |
| Date precision | 539 day · 57 range · 4 ongoing-from |
| `needs` | claimant 600 · published 600 · actors 600 · kind 383 · title 331 |
| v1 fog marker (`legacy.fog`) | 127 (34 in ids 1-385; 93 in ids 386-600; 15 with the structured block) |
| Derived look today (decision 6, option A) | 127 ghost · 473 unattributed · 0 solid · 0 split |
| Marker placed by | WARMAPS, all 600 (no entry names a place yet) |
| `recordCheck` | 171 checked · 44 corrected · 385 none |
| Tier / significance | 22 milestone · 78 major · 115 standard · 385 unrated / 33 |
| Sources | 250 listed · 322 named-only · 28 legacy-unlisted (1,360 sources, 494 URLs, 87 hosts) |
| Geo precision | 39 representative · 561 unknown |
| `timeNote` carrying a day number | 0 |
| Charter test | 0 hits; the mutation `"claimStatus": "confirmed"` is rejected |
| Schema failures | 0 |
- **Cutover (last slice):** the generated files become the master, `enrich.json` is folded in and deleted, the
  generated-file header is removed, v1 is frozen at `/v1/`. After cutover v1 stops receiving data. That is the
  only one-way door in the plan, and it is taken only when Allan says v2 has surpassed v1.

Russia-Ukraine has no v1, so its files are authored directly in v2 schema from the first event, with no `needs`,
no `legacy`, and full entries: a claimant, a publication date and sorted sources on every one.

## 7.3 The enrichment pass (a named piece of work, not a footnote)
The migration does not pretend to know what it does not, which leaves real work: 600 events with no recorded
claimant or publication date, 600 with unmapped `actors`, 383 with a flagged `kind`, 331 with a bare place name
for a title, 385 with no tier, 350 with no source URL. The pass turns each v1 text into real entries: who said
it, on what date, where; who denied or acknowledged it; which sources are the original and which are carriers.
It then empties `needs`. As it does, records leave `unattributed` and take the look their entries give them.

Order of work: the 127 with a v1 fog marker first (v1 already names the parties for 15 of them), then milestones
and key events, then the rest by date. It uses the backfill pass-2 method: drafting agents, then a separate
agent that checks each entry against its source (charter rule 5), blocks respected, gaps noted. **It looks for
every involved side's own account, not only the ones that were easy to read**, and records a coverage gap where a
side's outlets could not be reached. It is independent of the code slices and can run beside them (RELEASE_PLAN,
Track E). Until it runs, v2 shows the Iran theater exactly as richly as v1 does and no richer.

## 7.4 Validators
`tools/validate-v2.js` (new in slice 1, same no-dependency style as `validate.js`):

| Group | Checks |
|---|---|
| A. Shape | JSON parses; every record matches its schema; closed lists are closed; optional fields absent rather than null |
| B. IDs | Unique; shape; **never reused**: an id present in the previous published data version must still be present, as a record or a tombstone (M1). No continuity rule; the prefix is not checked against the home theater |
| C. Legacy | Every v1 event has exactly one record or tombstone; text fields byte-identical |
| D. Dates | Valid; end on or after start; precision consistent with `dateEndISO`; no day number in `timeNote`; every entry has a valid `published` |
| **E0. Charter test** | **No field name and no closed-list value grades truth.** Rejected, at any depth, case-insensitive: `confirmed`, `verified`, `documented`, `credible`, `credibility`, `reliable`, `reliability`, `debunked`, `confidence`, `probable`, `likely`, `alleged`, `disinformation`, `misinformation`, `fake`, the strings `true` and `false` as values of a closed list, any field named `claimStatus` or `truthStatus`, and any true/false flag whose name is a verdict (`isTrue`, `genuine`, `accurate`). Free text that carries sources' words (`text`, `title`, `covers`, `note`, `detail.*`) is exempt: quoted source text is not ours to edit. `recordCheck` is allowed and is named as what it is: a record-to-source check under charter rule 5. Mutation test: adding `"claimStatus": "confirmed"` to one event must fail. The word list lives in one place and is extended when drift finds a new word. (The test already earned its keep in the dry run: it caught v1's `originKnown: "probable"`.) |
| E. Attribution rules | Every entry has a claimant, or the record has `claimant` in `needs`. `supersedes` names an earlier entry by the same claimant. `scope` only on `denies` and `acknowledges`. On records authored in v2: every source has a `role` and an `access`; `leaked` has a `recordCheckNote`; stored `lat`/`lng` equal the derived position. The index's `look`, `accounts` and `steps` equal the derivation. Nothing derived is stored in a full record. Links: every entry has `covers`. Watchlist: the rules in 4.2, including "stale". Forbidden words absent from generated strings (whole words) |
| F. References | Actors, registry ids, entry numbers (`respondsTo`, `supersedes`, `movedFrom`), events cited by links and watch items; a citation of a tombstone is flagged |
| G. Freshness | Generated files, index and manifest match their inputs |
| H. Theaters | Theater AOIs agree with `layers.config.json` |
| I. Text and links (M3) | Every `url` starts `https:` or `http:`; no text field contains markup that the app would have to escape to be safe (the app escapes anyway; this is a second line) |

Every rule in E0 and E ships with a mutation test (a bad record that must be rejected), as `attribution-tests.js`
already does. The v1 validators keep running unchanged; all must exit 0 before any push (Trap 6). Note for slice 1:
v1's `validate.js` still requires continuous v1 ids; that stays true as long as no v1 event is removed from
`warmaps-data.js`, which the tombstone rule guarantees.

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
- A candidate is a new v2 Event or Link, or, more often, **a new entry for an existing record** (`matchTo`),
  wrapped in an envelope:

```json
{ "candidateId": "C-20261110-03", "recordType": "event", "theaterGuess": ["iran-war"],
  "matchTo": "IR-00598",
  "record": { "...": "a v2 event without id, or only the new entries when matchTo is set" },
  "intakeItems": ["raw/2026/11/10/iran-war.json#17"],
  "nearDuplicates": ["IR-00598"],
  "drafter": { "model": "sonnet-5.5", "date": "2026-11-10" },
  "checks": { "dateOk": true, "sourcesRead": 2, "snippetOnly": 0, "sidesOnRecord": ["israel"], "sidesMissing": ["iran"], "lookIfApproved": "ghost" } }
```
- The intake already stamps each item with its feed's `origin`; the drafter carries it into each source's
  `registryId` and sets the entry's `claimedBy`, so a claim from state media arrives attributed, draws as a ghost
  until another side speaks, and is kept, not filtered (the balance ruling).
- **Matching:** the drafter proposes `matchTo` when a claim is about a happening already on file; Allan approves
  every merge, and a wrong merge can always be split (3.4.7). A denial is never a new record: it is an entry on
  the record it denies.
- `sidesOnRecord`, `sidesMissing` and `lookIfApproved` are computed by the shared derivation, not typed by the
  drafter. The approver sees at a glance which sides are still missing, not only which are present.
- The drafter cannot set a look, a link's line state or a tripwire status: none of them is a stored field.
- **The look-again job** (3.4.5) runs in the same nightly task. For every ghost with a check due it searches the
  missing sides' outlets from the registry, **batched per outlet** (one read of an outlet serves every record
  waiting on it). Each result is a candidate: new entries if it found any, and a `checks[]` log line either way.
  Nothing is appended until Allan approves.
- IDs are assigned only at approval, so rejected candidates never burn a number.
- Open from the R1 review (S13), to settle before this is built: drafts, including rejected ones, would sit on a
  public branch. Keeping candidates out of the public repo is the review's recommendation.
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
   { theaters[], time{extent,view,cursor,window,mode,record}, lens{mode,parties[]}, show{onRecord,fog,contestedOnly},
     viewMode, layersOn{}, selection, filters, layout, theme }
            │  subscribe
   ┌────────┼─────────────┬───────────────┬──────────────┐
   ▼        ▼             ▼               ▼              ▼
 selectors  ui/timeline   ui/panels+cards ui/layout    views (renderer contract)
 (pure; built on core/attribution:                      ├─ view2d  Leaflet
  stateOf, visibleEvents, lensView, compareView,        └─ view3d  Cesium (loaded on first use)
  statusLine, visibleLinks, linkState, watchAsOf, counts)
```
- **Store:** a small hand-written observable (no framework): `get()`, `set(patch)`, `subscribe(keys, fn)`. State
  is serialisable, so the URL hash can carry a view (`#t=iran-war,russia-ukraine&d=2026-11-08&v=3d&lens=iran`) and
  a shared link reproduces it, **including the lens, so the lens banner travels with every shared view**.
- **State added in v1.2:**

| Key | Values | Default | Meaning |
|---|---|---|---|
| `lens.mode` | `all`, `parties`, `compare` | `all` | 3.4.6 |
| `lens.parties` | account ids from the registry; exactly two for `compare` | `[]` | Whose account is shown |
| `show.onRecord` | boolean | true | Layer **On the record**: solid and split markers |
| `show.fog` | boolean | true | Layer **Fog**: ghosts and faded ghosts. Off = a clean map of what the sides on record agree or disagree on; fog only = where an account is missing |
| `show.contestedOnly` | boolean | false | Filter **Contested**: only split markers |
| `time.record` | `today`, `then` | `today` | 5.8 |
| `time.window` | date range | the last 7 days | 5.4 |

  `unattributed` records belong to the On the record layer until enrichment gives them a look (decision 6). These
  filters count sides heard; none of them selects which side to believe.
- **Selectors added in v1.2**, all pure and all thin wrappers over `core/attribution.js`:
  `stateOf(record, T)` (3.4.2-3.4.5: look, sides on record, observers, missing, position, alternates, targets,
  drawn tier, status-line parts) · `visibleEvents()` (window, then `show.*`, then lens) · `lensView(record,
  parties, T)` · `compareView(record, a, b, T)` · `lensSummary()` (the banner's three numbers) · `linkState(link,
  T)` · `watchAsOf(item, T)` · `checksDue(T)` (editor only). T comes from `time.record` (5.8).
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
  markup, a style rule or a web address. A lens id in a link is accepted only if it is in the actor registry.
- **The repo's own data is data too (R1 fix M3).** Every text field is rendered as text. URLs are checked (3.2).

## 9.2 Renderer contract (how 2D and 3D share everything)

```
init(container, ctx) → Promise      destroy()
setTheaters(theaterConfigs, mode)   // outlines; mode = single | multi
setEvents(marks)                    // already filtered and derived by selectors:
                                    // [{id, lat, lng, theater, drawTier, look, age, halves?, lensTag?}]
                                    //   look = ghost | solid | split | faded | unattributed
                                    //   halves (compare only) = {left:{state,lat,lng}, right:{state,lat,lng}}
setEventDetail(id, {alternates[], targets[]})   // drawn only while that event is open (3.4.3)
setLinks(arcs)                      // [{id, from{lat,lng}, to{lat,lng}, weightStep, lineState, category}]
                                    //   lineState = ghost | solid | split   (v1.1 called this field `confidence`)
setTracks(layerId, tracks)          // live/archived OBSERVED tracks
setLayer(layerId, on, data)         // context layers
select(ref) / highlight(ref)        // ref = {type:'event'|'link'|'track', id}
getCamera() → {lat,lng,zoomEq}  /  setCamera(cam, animate)
on('select' | 'camera' | 'ready' | 'degraded', fn)
```
- `zoomEq` is a Leaflet-style zoom number. The globe converts height to it, so switching 2D↔3D keeps you looking
  at the same place.
- A renderer holds **no** state of record and **derives nothing**: it draws the look it is given. Switching views
  is `destroy()` then `init()` on the other, replaying the current store, so lens, fog layers and As known then
  behave identically in 2D and 3D. On the phone and the Fire only one renderer is alive at a time.
- Events stay on the surface in 3D; height is used only for real altitude. Aircraft, vessel and satellite tracks
  are OBSERVED: they go through `setTracks`, never through `setEvents`, and never take a ghost or solid look.
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
- R1 review items not applied here because they are not charter matters and Allan has not ruled on them: S10
  (`kind` mixes the act with the target), S12 (smaller ambiguities, partly absorbed above), S13 (public drafts).
  S11 (flat actor ids) and the registry fields of S2 are adopted in 4.4 and 4.5 because the side rules need them;
  both are listed for veto in the decisions file.
- The rhetoric track's thresholds (4.2) and the exact wording of the lens banner on a screenshot (design system).
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
| Links read as a "conspiracy board", or as one side's charge sheet | INFERRED | Off by default; bundling and caps (design system); every statement shown with its claimant and its `covers` sentence; a denial always splits the line |
| **Most of the Iran map starts as ghosts or unattributed marks**, and ghosts cannot solidify while the missing sides' outlets are unread | VERIFIED (dry run: 0 of 600 attributed; R1: no Iranian state, Hezbollah, Houthi or Palestinian official outlet among the feeds or the 87 hosts) | Decision 6 picks the interim look; Track E enriches the 127 fog-marked events first; Track P adds each missing side's outlets within the access rule; where a site refuses us the gap is recorded, and Allan may read it himself |
| The site drifts back into grading truth (F-010) | OBSERVED (three times) | Charter test E0 with a mutation test; nothing derived is typed; charter check at the end of every session |
| "Solid" is read as "true" | INFERRED | Legend and card wording fixed ("the sides on record agree it happened"); Help explains the marks; decision 9 sets how strict solid is |
| Matching claims to happenings is judgment, and a wrong merge misleads | INFERRED | Allan approves each merge; split is always possible; moved entries keep `movedFrom` |
| The dry run and the reference derivation were written by the author of the schema | VERIFIED | R1 reviewed v1.1 independently (2026-11-11). The v1.2 attribution rules have had a charter check by a separate agent but not a full independent rule review; slice 1's independent checker re-implements against `attribution-tests.js` |
| A no-build module tree grows slow to load (many small files) | SPECULATION | HTTP/2 on Cloudflare; measured in slice 1; a bundling step can be added later without changing any module |
| CDN dependency for Leaflet and Cesium | INFERRED | Pinned versions with integrity hashes; Leaflet is small enough to vendor if a CDN ever fails |
| Scope creep (cause of the earlier five-week stall, per the v2 plan) | OBSERVED | RELEASE_PLAN fixes the slice order; each slice has one exit test |

# 12. Changes from v1.0 (2026-11-10) to v1.1 (history)

Each row is a finding in `research/v2-schema-dryrun/REPORT.md`. **Rows 1 and 9 describe grading rules that v1.2
removed** (section 13); they are kept only as a record of how the design got here.

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

# 13. Changes from v1.1 (2026-11-11) to v1.2 (2026-11-13)

Sources: the editorial charter (STATE.md, 2026-11-12), V2_SESSION_COMMON.md section 3b, the R1 review and its
2026-11-12 addendum, and the re-run dry run.

| # | v1.1 said | Why it changed | v1.2 |
|---|---|---|---|
| 1 | Event `claimStatus` with seven grades; `confirmed` reached by counting independent sources | Charter rule 7: no field grades truth | Removed. Dated entries per record; four looks derived from who has spoken (3.4) |
| 2 | Event `origin` (one party's provenance) | Disputed records have two or more parties (R1 M4) | Removed. `claimedBy` on every entry; sources marked `original` or `carrier` (3.4.1) |
| 3 | Stored `fog` flag and `fogDetail` with a "lean" | Fog is "a directly involved side has not been heard" (charter rule 4); a lean is a grade | Derived: ghost and faded ghost, with the missing side named. v1's marker kept as `legacy.fog` (7.1) |
| 4 | `verification` | Name invited the wrong reading | `recordCheck`: record-to-source only (charter rule 5) |
| 5 | Link `confidence` (three levels) from `basis` and `attestedBy`; link `fog` | Charter; R1 cases L1-L7 | Link entries with `covers`; line state and the four name lists derived (4.1). Weight counts separate voices (5.6) |
| 6 | Combat tripwire `not-seen / reported / confirmed`; headline ending "confirmed" | Charter; R1 cases W1-W3 | Status read off the cited events' looks; history stores what it relied on; headline is a count (4.2) |
| 7 | "Two sources are independent when..." | Existed only to reach a grade | Removed. Registry gains `ownership`, `actor`, `covers` to say whose media an outlet is (4.5) |
| 8 | Dotted actor ids (`iran.irgc`) | An id could assert a disputed relationship (R1 S11); sides need a clean root | Flat ids; `parent` only for organs; side and observer defined (4.4) |
| 9 | IDs continuous per theater; prefix must match home theater | Deleting one event would renumber the rest (R1 M1) | Unique, never reused, gaps allowed; tombstones for records and entries (3.2, 3.4.7) |
| 10 | Acceptance numbers: fog 126, geo 47, six day numbers left in notes | Three counting errors (R1 M2) | Re-baselined table in 7.2 |
| 11 | "Imported data is data" for outside files only | Repo text will include AI drafts from feeds (R1 M3) | Plain-text and URL rule for all data (3.2, 7.4 I, 9.1) |
| 12 | Default window cumulative | Provisional ruling 1 | Opens on the last 7 days; band; All (5.4) |
| 13 | (not in v1.1) | Section 3b | Location history (3.4.3), status line (3.4.4), look-again and faded ghost (3.4.5), lenses and compare (3.4.6), Record today / As known then (5.8), store state and selectors (9.1) |
| 14 | Renderer contract `setLinks(... confidence ...)`, `setEvents(visibleEvents)` | Charter; lenses | `lineState`; marks carry a derived `look`, `halves`, `age` (9.2) |
| 15 | v1 `verified`, `fogLean`, `originKnown` carried into `legacy` and `launch` | They grade truth; the charter test caught the third | Not carried; they stay in the v1 file (7.1) |

