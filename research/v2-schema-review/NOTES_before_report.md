---
title: R1 reviewer notes written BEFORE reading the dry-run report or architecture section 12
date: 2026-11-11 (Iran-war Day 257)
author: Claude Opus 5.5 (R1 independent reviewer)
status: working notes; the deliverable is REVIEW.md
---

Read so far: STATE.md, SESSION_BOOTSTRAP.md, KNOWN_FAILURES.md (head), V2_SESSION_COMMON.md, F1_PROGRESS.md,
ARCHITECTURE_v1.md sections 1-11 (not 0, not 12), warmaps-data.js (loaded by load.js), intake/feeds.json,
research/backfill-pass2/README.md and its events file. Not yet read: research/v2-schema-dryrun/* and section 12.

# A. Links, watchlist, sources (4.1, 4.2, 4.5)

A1 Relay counts as independence. 3.4 `confirmed` = two `read` sources with independent registry origins, neither
   state or party media of an actor. Two outlets relaying the same party statement pass. IRGC claim via Al Jazeera
   (intl-broadcaster Qatar) + TASS (russia-state; Russia is not an actor in an Iran-Israel event) = confirmed.
   IDF claim via BBC + Guardian = confirmed. Symmetric failure. Needs a per-source "relays party X" marker.
A2 Origin labels decide independence by string inequality; labels are inconsistent (feeds.json, VERIFIED):
   BBC "intl-broadcaster (UK)" vs Guardian "europe (UK press)" independent; JPost/Ynet both "israel-independent" not;
   The National vs Arab News (two Gulf-state outlets) independent; Mondoweiss "palestine-advocacy (US-based)" vs
   Electronic Intifada "palestine-advocacy" independent; Meduza/Moscow Times not; CiberCuba vs 14ymedio independent;
   Efecto Cocuyo/El Pitazo not. Same-camp pairs pass or fail on spelling. Unequal by side.
A3 Registry has no actor link, so "state or party media of an actor in the event" cannot be computed.
A4 `access` read only: archive (Wayback) and subscription (Allan's own, allowed by the ruling) cannot count toward
   confirmed although read in full.
A5 Link observations have no stance. Denials cannot be recorded; if recorded as official-statement they RAISE the
   link to reported and thicken it. Real case: Iran FM 5 Nov 2022 acknowledged "a limited number" of drones sent
   months BEFORE the war while denying wartime supply. Under 4.1 that is participant-acknowledgement attested by a
   participant = `documented`, fog false, on a link titled (the doc's own example) "Shahed-family drone transfer and
   licensed production". The badge certifies the broad claim with a statement that denied it.
A6 `court-finding` is documented with no attester condition; `neutral-body` is defined to include "a court".
   A belligerent's own court (Iranian Revolutionary Court espionage verdict; Russian treason verdict; also a US
   court) becomes documentation. Symmetric, but a party's court is not neutral.
A7 `neutral-body` / `igo-report` are typed by the editor with no check. NATO, G7, EU statements can be filed as
   igo-report by a neutral body -> documented. Real case: G7 FMs statement 14 Sep 2024 on Iranian missiles to
   Russia (G7 includes the accusing US). Needs membership-based neutrality from the actor registry.
A8 attestedBy enum has no slot for non-state armed groups, companies, advocacy NGOs, defectors.
A9 One-sided participant boasts of coordination (e.g. Ansarullah says it coordinated with Hezbollah) = documented,
   fog false.
A10 Link confidence is max over ALL observations, stored, not as-of the cursor: scrubbing to 2022 shows a 2024
   court finding's confidence (hindsight leak). Same for link fog.
A11 Weight counts observations of any grade, including alleged/anonymous media and duplicate reports of one act.
   Six anonymous-sourced reports in 180 days = thickest line. No rule for what one observation is.
A12 Link fog "on-record observations" undefined; media echo of a designation adds a second attestedBy value and
   clears fog.
W1 Tripwire `confirmed` needs a confirmed combat-kind event; claimStatus grades the record, not the attribution the
   tripwire turns on. A strike on Kyiv is certain; "Iranian missile" is a claim. With A1, a Ukrainian claim relayed
   by Kyiv Independent + BBC confirms WL-C-02. Needs machine-checkable `requires` on actors, with actors not in needs.
W2 Combat kinds exclude energy, shipping, infrastructure: an Iranian drone on a NATO-flagged tanker (kind shipping
   or energy) can never confirm "NATO-Iran direct clash".
W3 History is never overwritten, but `confirmed` is validated against the cited event's CURRENT claimStatus. If the
   event is later downgraded, the old entry fails and the only way to pass is to edit history. Contradiction.
W4 Cited event's `kind` may still be a migration default in `needs` (281 "strike" defaults); rule does not exclude it.
W5 Rhetoric levels noted/elevated/sustained have no definitions; not testable.
W6 Headline "No direct combat link seen" asserts a world state from 4 hand-picked definitions; say "0 of 4 combat
   tripwires reported".
W7 Forbidden-word scope unclear for AI-drafted titles quoting a party ("World War III").
B1 Intake: every Iran-state / axis outlet currently fails (IRNA, Tasnim, Mehr, Tehran Times, IFP unreachable; PressTV
   broken; Al Mayadeen 403). `originsRepresented` shows what is present, not which side is missing.

# B. Ambiguity
B2 claimStatus: only `confirmed` defined. reported vs claimed, denied, retracted undefined; and it is unclear whether
   it grades the occurrence or the content. Data: #276 IAEA assessment -> "claimed"; #585, #536 statements by Iranian
   officials (certainly made) -> "claimed"; #250 "US confirmed; Iran account differs" -> claimed, not disputed.
B3 fog definition includes "single source"; 36 pass-2 events have one source and fog false; not enforced for v2.
B4 `fog: false` on ids 1-385 means "never assessed": 72 such events carry "not confirmed / unconfirmed / denied /
   claims" text with fog false. Id 217 says "Fog of war note:" (mixed case) and is NOT fog under a case-sensitive
   match: my recount gives 127 fog / 119 claimed / 351 unreviewed vs the documented 126 / 118 / 352.
B5 `origin` is one object; 14 of 15 structured fog blocks name two parties (e.g. #232 IDF vs Hezbollah).
B6 `rev` cannot be produced by a deterministic generator from warmaps-data.js + enrich.json.
B7 `needs` removal: no stated evidence, reviewer or record.
B8 week/month/year: is dateISO forced to the first day? dateEndISO redundant (derivable).
B9 Named-only publisher splitting: separators "/" (456), ";" (202), "|" (55); 27 cite "via GlobalSecurity"
   (the read source is the aggregator; the named outlets were not read).
B10 "Days 71-72" leading text (ids 254, 276): is it a "Day N" to strip?
B11 kind mixes action (strike, interception) with domain (energy, naval, shipping, infrastructure). Data: three
   attacks on ships get three kinds: #354 naval, #565 energy, #377 unclassified. Doc's own example "Bazan refinery
   struck" is `strike` while v1 type energy maps to `energy`.
B12 `actors.by: []` means both "accident" and "attacker unknown" (#354 "Unattributed", #261 "attribution uncertain").
B13 "affected party's own acknowledgement" not representable as a field.
B14 participant with dotted ids (iran vs iran.irgc) and `via[]`.

# C. Cut
`sourcesStatus` (derivable), dateEndISO for week/month/year (derivable), direction `to-from` (swap ends),
`rev` until cutover, conversion of the 15 `fogCheckpoint` values (all past; 11 written in the Day-0 convention,
so converting through the epoch lands one day early).

# D. Additivity
D1 validator B "continuous per theater" forces renumbering after a deletion (pass 2 already renumbered after a drop);
   "prefix matches home theater" forbids re-homing (Allan expects the wars to merge). Must change before S1.
D2 `origin` object -> array later is a breaking change.
D3 dotted actor ids encode hierarchy; re-parenting re-keys; making Hezbollah a child of Iran is an editorial claim.
D4 events-index rows are positional; readers must map by header and columns append only.
D5 ID widths differ (events/links 5, editorial 4, watch 2 with track letter).

# E. Migration spot-check (seeded sample: 12,35,132,166,184,214,250,254,276,354,358,377,384,486,535,536,565,566,585,594)
Dates: all 20 by hand agree with v1 parseWarDay; script: 600/600 agree with an independent reader (dates.js).
Day labels: 60 off-by-one and 6 mid-text, matching the doc. Fog/claim/source: see B2-B4, B9.

# F. Security / public use
F1 Repo event text originates from RSS and web pages (attacker-controllable). 9.1's "imported data" rule exempts repo
   files. Need: all text rendered as text; source URLs must be https (or http) only. v1 data already holds "<100" and
   ">$100" in four fields.
F2 Candidates (unverified AI drafts, incl. rejected ones) on `intake-data` in a PUBLIC repo are published in effect.
F3 Editorial note author "Allan Sanceau" shown publicly; Allan is private; make the byline a setting.
