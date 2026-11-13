---
title: R1 — independent review of the WARMAPS v2 schema (ARCHITECTURE_v1.md v1.1)
version: v1.1 (2026-11-12: addendum under the editorial charter)
date: 2026-11-11 (Iran-war Day 257)
author: Claude Opus 5.5, thinking effort extra (set by Allan). Did not write the architecture or the dry run
inputs: branch v2/f1-architecture at 7eb940c; warmaps-data.js (600 events); intake/feeds.json; research/backfill-pass2
status: REVIEW. No design document or app file changed. The F1b session applies the fixes Allan accepts
evidence: scripts in this folder (no dependencies): load.js, dates.js, counts.js, adversarial-tests.js
---

# Bottom line

**Ready for slice 1 after four fixes (M1-M4).** The event schema, the overlap model and the `needs` mechanism
are sound. All 600 start dates match an independent reading (VERIFIED). M1-M4 must land first because slice 1
publishes IDs and record shapes that cannot be renamed later, and its acceptance numbers contain three migration
errors. Each fix is a short edit to the documents.

**The link, watchlist and claim/source rules are not ready for real data.** All 16 constructed test cases expose a
hole (`adversarial-tests.js`): records that pass every rule but would mislead a reader, or truthful records the
rules reject. The rules fail the same way for every side, so they are balanced, but they are not yet sound. None of this blocks slice 1, which has no links,
no watch items and no `confirmed` records. The claim and source rules must be revised before S3 (Russia-Ukraine is
written in v2 with claim status). The link and watch rules must be revised before S4 and S7.

# Findings, ranked (evidence: VERIFIED = computed or read in the repo this session; INFERRED = reasoning)

**Must fix before slice 1**

| # | What | Where | Concrete example | Evidence | Change |
|---|---|---|---|---|---|
| M1 | Deleting an event changes other events' IDs, and an event can never move to another theater | 3.2 `id`; 7.4 B; v1 `tools/validate.js` C | v1 requires IDs 1..N with no gaps, and each IR-id is built from the v1 number. So deleting one v1 event renumbers every later IR-id and breaks the links that cite them. Pass 2 already renumbered after dropping a duplicate (STATE.md). The rule "prefix matches home theater" blocks moving an event if the wars merge | VERIFIED | Remove "continuous". IDs are unique and never reused. A removed event stays as a tombstone record (`withdrawn {date, reason}`), in v1 too during the overlap. The prefix records the theater at creation; it is not checked against the current home theater |
| M2 | The acceptance numbers contain three migration errors | 7.1, 7.2; dry-run section 5 | (a) The fog match is case-sensitive, so id 217's "Fog of war note:" is missed. (b) The `approx\|representative` geo rule matches "approximately 92%" and "Houthi representatives", giving 8 false hits. (c) Six day numbers stay in `timeNote`, because `dryrun.js` line 143 ends in `\|\| true`. That breaks 3.2 and the default stated in 7.1 | VERIFIED | Match fog case-insensitively. Set geoPrecision only from "coordinates/location approximate" or "approx 22.52N". Apply 7.1's default (move the six to `legacy.time`). New numbers: fog 127, claimed 119, unreviewed 351, representative 39 (Appendix D) |
| M3 | The repo's own data is treated as safe to insert as markup and links | 9.1 "Imported data is data"; 3.2 `sources.url` | v1 puts event text into popups without escaping (`index.html` lines 2996-3037). v2 will add AI-drafted text that starts in RSS feeds (section 8), and anyone can publish a feed. The 9.1 rule covers only files from outside the repo | VERIFIED (code); risk INFERRED | Add to the schema: every text field is plain text and is shown as text, never as markup. `url` must start `https:` (or `http:`) and the validator checks it. Links open with `rel="noopener noreferrer"`. A source URL is never made up (v1 links unmatched names to a Wikipedia page, line 2729) |
| M4 | `origin` holds one party, but disputed records usually have two | 3.2 `origin` | 14 of the 15 structured fog blocks name two parties (#232: the IDF and Hezbollah). All 600 events migrate as `unknown`, so slice 1 publishes the field's shape with nothing in it | VERIFIED | Decide now: either compute `origin` from each source's registry entry (no stored field), or make it `origins[]`. Changing an object to an array later is the breaking rename that principle 4 forbids |

**Should fix (the slice it must be fixed before is in brackets)**

| # | What | Where | Concrete example | Evidence | Change |
|---|---|---|---|---|---|
| S1 | A claim relayed by two outlets counts as independent confirmation [S3] | 3.4, 4.5 | An IRGC claim carried by Al Jazeera and TASS is `confirmed`. So is an IDF claim carried by the BBC and the Guardian (cases R1, R2) | VERIFIED | Add `relays: <actor>` to a source that only reports a party's statement. Such a source counts as that party |
| S2 | Whether two outlets are independent depends on how their labels are spelled [S3] | 4.5; `intake/feeds.json` | Counted as independent: BBC + Guardian, The National + Arab News, Mondoweiss + Electronic Intifada ("(US-based)" makes the labels differ). Counted as not independent: JPost + Ynet, Meduza + Moscow Times (R4) | VERIFIED | Registry fields from fixed lists: country, ownership (state, independent, exile, advocacy) and `actor` (whose media it is). Compute independence from these fields, the same way for every camp |
| S3 | Sources read in full are rejected [S3] | 3.4 | A page Allan read with his own subscription and a Wayback copy cannot count toward `confirmed` (R3) | VERIFIED | Record "how the page was reached" separately from "full text read". Count read, archive and subscription |
| S4 | `claimStatus` values are not defined (only `confirmed` is), and it is unclear what they grade [S2] | 3.2, 3.4 | An IAEA assessment (#276) and statements that were certainly made (#536, #585) become `claimed`. "US confirmed; Iran account differs" (#250) becomes `claimed`, not `disputed` | VERIFIED mapping; reading INFERRED | Define each value in one line. It grades whether the event in the title happened. Attribution and figures are graded elsewhere. Add a table of allowed claimStatus and fog pairs |
| S5 | `fog: false` on ids 1-385 means "never assessed", and the fog definition is not applied [S2] | 3.2 `fog` | 72 such events contain "not confirmed", "denied" or "claims". 36 pass-2 events have a single source and fog false, although the definition says a single source means fog | VERIFIED | Add `fog` to `needs` where it was never assessed. Then either drop "single source" from the fog definition or enforce it |
| S6 | A link cannot record a denial or say what an observation covers [S4] | 4.1 | Iran's 5 Nov 2022 statement ("a limited number" of drones, sent before the war; wartime supply denied) makes the document's own example link "documented" (L1). Recording Iran's Sept 2024 denial of Fath-360 missile transfers clears the link's fog flag (L2) | VERIFIED | Give each observation a `stance` (affirms or denies) and a `supports` line. Only affirming observations count toward confidence and weight. The link card shows denials, and a participant's denial forces fog |
| S7 | Whether a body is neutral is typed in, not checked [S4] | 4.1 | A verdict by a party state's own court is `documented` (L3). A G7 statement filed as an IGO report by a neutral body is `documented` (L4). One participant's boast is `documented` with no fog (L5) | VERIFIED | Derive `attestedBy` from an actor or registry id. A body is neutral only if it is not a link actor, not a belligerent in a theater the link touches, and not an alliance or bloc that includes one. A party state's court verdict counts as an official statement |
| S8 | Link confidence and thickness ignore time and the grade of evidence [S4] | 4.1, 5.6 | At a 2022 cursor, a link shows the grade of a 2024 court finding (L7). Six anonymous-sourced reports draw the thickest line (L6) | VERIFIED | Compute confidence and fog from observations dated on or before the cursor. Count only observations graded `reported` or better, one per distinct act |
| S9 | A tripwire can be set off by an attribution claim, and its history cannot stay unedited [S7] | 4.2 | A strike on Kyiv is certain; "Iranian missile" is one side's claim, yet it confirms the wire (W1). If that event is later downgraded, the old history entry fails validation, and history may not be edited (W3). A confirmed strike on a NATO-flagged tanker (kind shipping) can never confirm "NATO-Iran direct clash" (W2) | VERIFIED | Each tripwire states machine-checkable `requires` (actors, kinetic). Cited events must have `kind` and `actors` out of `needs`. Each history entry stores the claimStatus it relied on, and a downgrade forces a new entry |
| S10 | `kind` mixes what happened with what was hit [S3] | 3.2, 3.5 | Three attacks on ships get three kinds: #354 naval, #565 energy, #377 unclassified. #384, a set of traffic statistics, is `energy`. 5 of the 7 sampled `political` events are talks or statements, yet `political` (130 events) is not in `needs` | VERIFIED | Split the action from the target domain (or add `targetDomain`). Until then, put every migrated kind except `deployment` in `needs` |
| S11 | Actor ids carry the hierarchy, which can assert a disputed relationship [S4] | 4.4 | Moving an actor under a different parent changes its id. An id like `iran.hezbollah` would state a disputed proxy relationship, and filtering by `iran` would then show Hezbollah's strikes as Iran's | INFERRED | Use flat ids. Use `parent` only for state organs (IRGC under Iran). Backing relationships are Links |
| S12 | Smaller ambiguities [S2 unless noted] | Appendix B | 12 items: `rev` from a deterministic generator; when `needs` entries are removed; week, month and year dates; publisher text such as "Al Jazeera Day 33"; and others | VERIFIED | Appendix B |
| S13 | Public exposure [before the P3 drafting work] | 8; 4.6 | Unverified AI drafts, rejected ones too, would sit on `intake-data` in a public repo. The editorial byline is Allan's full name. No Iranian state or Axis-aligned outlet is in the active feed list (IRNA, Tasnim, Mehr, Tehran Times, IFP, PressTV, Al Mayadeen: "not usable") | VERIFIED facts; risk INFERRED | Keep candidates out of the public repo. Make the byline a setting. Candidate checks list the sides that are missing, not only those present |

**Could cut:** `sourcesStatus` (derivable from `sources`) · `dateEndISO` for week/month/year (derivable) · link
direction `to-from` (swap the ends) · `rev` until cutover · converting the 15 `fogCheckpoint` values (all past; 12
sit on events whose own day label uses the Day-0 convention, so the checkpoint probably does too and conversion
would land a day early, INFERRED; keep the text in `legacy`) · the watch
"testable definition" check, which is only a 40-character minimum (`engine-tests.js` line 136).

**Confirmed sound:** the start-date rule (600/600 against an independent reader; 20 by hand) · these counts,
recounted independently: precision 539/57/4, sources 250/322/28, day labels 60 off by one plus 6 mid-text ·
sanctions designations graded `reported` for every side · `needs`, `unreviewed`, `legacy` and byte-identical text ·
links and the watchlist in separate files · no convergence score · IDs assigned at approval · no auto-drafted
watch changes · `no-cache` with ETag · validated URL-hash state.

# What the author already had, and what is new
- **Already in the dry run:** sanctions are not documentation; 60 + 6 day labels; six date rulings; type versus
  attacker mismatches; combat tripwires not confirmed by links; the timing tripwire that fits neither track;
  the colon in "FOG OF WAR:"; the dry run's own self-checking limit; external imports treated as data.
- **New in this review:** M1-M4, S1-S13 and the cuts. In M2(c) the author listed the six time texts for a ruling
  but did not note that the check is switched off or that the dry run keeps the text it says it drops.

# Not checked
Timeline engine beyond reading it · file sizes and gzip figures · the performance budget · the design, layout,
release and decision documents beyond slice scope · the globe graft · browser behaviour · all 600 event texts (20
sampled, plus targeted searches) · the 215 pass-2 URLs · later developments in the two real cases (L1, L2) beyond
press reports of those dates. This review was not itself checked by a second agent (none was authorised for R1).


# Addendum 2026-11-12 — read this review under the editorial charter

Allan ruled on 2026-11-12 (`STATE.md`) that WARMAPS reports who said what, with sources, and never rules on truth.
This review (2026-11-11) took the design's truth grades as given and proposed stricter grading. That was itself an
instance of the drift the charter now forbids (`KNOWN_FAILURES.md` F-010). Read the findings this way:

| Finding | Under the charter |
|---|---|
| M1-M3 | Unchanged |
| M4 `origin` | Becomes `claimedBy[]` (charter rule 1); the shape decision is still needed before slice 1 |
| S1 relayed claims | Remedy is "claimed by" separate from "carried by" (rule 3), not a stricter route to `confirmed` |
| S2, S3 independence and access | Mostly dissolve: they existed only to reach `confirmed`. Registry fields still matter for showing which sides were heard (rule 2) |
| S4 claimStatus | Becomes attribution status (claimed, denied, acknowledged, carried by); no truth value |
| S5 fog | Charter rule 4 is the definition: fog when a directly involved side has not been heard; name the missing side |
| S6 denials and scope | Required by rule 1: denials are recorded as claims with their source |
| S7, S8 link grades | Link "confidence" goes; a link shows who affirms it and who denies it, with sources. Weight still needs a rule for what it counts |
| S9 tripwires | Status shows who has reported or acknowledged the event and who denies it; no "confirmed" headline |
| S10-S13, cuts | Unchanged |
| Appendix A cases | Still valid evidence: each shows the site asserting something no source said |

Expected effect on the data (INFERRED): under rule 4 many Iran-war events become fog at first, because Iranian state,
Hezbollah, Houthi and Palestinian official accounts are rarely linked (0 links to those outlets among 87 linked sites;
the only Iran feed in the intake is Iran International).

---

# Appendix A — constructed records (`node research/v2-schema-review/adversarial-tests.js .`, 16 of 16 show a hole)

The rules were implemented from the document text. The author's `engine-tests.js` grades links with the same logic
(read, not re-run). R* = event claim and source rules; L* = links; W* = watchlist.

| Case | What the rules allow or reject | What a reader would be told |
|---|---|---|
| R1 / R2 | IRGC claim via Al Jazeera + TASS: may be `confirmed`. IDF claim via BBC + Guardian: may be `confirmed` | A party's claim shown as confirmed (both sides) |
| R3 | Two fully read sources (subscription, archive): cannot confirm | A well-sourced record can never reach `confirmed` |
| R4 | Real feed labels: BBC/Guardian, The National/Arab News, Mondoweiss/EI, CiberCuba/14ymedio independent; JPost/Ynet, Meduza/Moscow Times, Efecto Cocuyo/El Pitazo not | Which camp gets two votes depends on spelling |
| L1 | Iran FM, 5 Nov 2022, drones sent "months before the war", wartime supply denied, filed as participant acknowledgement: `documented`, fog false allowed | The broad link certified by a statement that denied it |
| L2 / L2c | US accusation (Sept 2024): `reported`, fog. Add Iran's denial: fog false allowed. With anonymous reports only, adding the denial raises `alleged` to `reported` | A denial reads as corroboration |
| L3 / L4 / L5 | Party-state court verdict; G7 statement typed as a neutral IGO report; one participant's boast: all `documented` | Accusers and boasts shown as documentation |
| L6 / L7 | Six anonymous reports draw weight step 4. The stored grade at a 2022 cursor comes from a 2024 finding | Thickness rewards repetition; the replay shows later knowledge |
| W1 / W2 / W3 | Attribution claim confirms WL-C-02; a confirmed strike on a tanker cannot confirm a wire; downgrading the cited event invalidates history that may not be edited | "Direct combat link confirmed" on one side's claim |
| W6 | The dry run's forbidden-word pattern matches "Emergency session" (id 166) | Needs word boundaries |

Real-world anchors (dates only; the records above are constructed): Iran's acknowledgement and denial, 5 Nov 2022,
[Anadolu](https://www.aa.com.tr/en/politics/iran-acknowledges-sending-drones-to-russia-before-ukraine-war/2730512),
[AP via Iran Watch](https://www.iranwatch.org/node/12258); US accusation, Iran's denial and Russia's non-answer, Sept
2024, [Arms Control Association](https://www.armscontrol.org/act/2024-10/news/iran-said-ship-missiles-russia); G7
statement of 14 Sept 2024, [USIP Iran Primer](https://iranprimer.usip.org/node/13031).

# Appendix B — smaller ambiguities (S12)
1. `rev` must be "bumped on any edit", but generated files come from `warmaps-data.js` + `enrich.json` with a CI diff,
   which has no memory of what was published. Store `updatedISO` in `enrich.json`, or use a content hash.
2. `needs` removal: state that an entry goes only when `enrich.json` supplies the value, with reviewer and date. The
   validator checks that a field listed in `needs` has no value in `enrich.json`, and that a field with a value is not listed.
3. week/month/year precision: say whether `dateISO` must be the first day of the unit (example 3.6 implies yes).
4. Named-only publishers: 91 of 322 such events produce fragments ("Al Jazeera Day 33", "IDF statement Mar 21",
   "UKMTO; Vanguard; ..."). Keep the raw text as a citation, and set `publisher` only when it matches the registry.
   27 cite "via GlobalSecurity": the aggregator is what was read.
5. "Affected party's own acknowledgement" (3.4) has no field. Mark it on a source: party = an actor in `against`.
6. Whether a participant includes child ids (`iran.irgc` in a link from `iran`) and `via[]` actors.
7. Link fog says "on-record observations" and "two different attestedBy values". The code reads this as grade >= reported
   and classes, not sides. Four allied governments count once; a government plus one newspaper's imagery count twice.
8. Rhetoric levels `noted`, `elevated` and `sustained` have no thresholds.
9. Headline "No direct combat link seen" states a fact about the world based on four hand-picked definitions.
   Suggest "0 of 4 combat tripwires reported".
10. Forbidden-word scope: does it cover AI-drafted titles that quote a party ("World War III")?
11. `events-index.json` rows are positional. Readers map columns by header name, and new columns are appended only.
12. ID widths differ (events and links 5 digits, editorial notes 4, watch items 2 plus a track letter). Option (b) in 4.2
    moves an item between tracks, which would change its id. Use one width and no track letter in the id.

# Appendix C — hand spot-check, 20 events (seeded random: 12 35 132 166 184 214 250 254 276 354 358 377 384 486 535 536 565 566 585 594)
Every start date, range end and day number is correct (each computed by hand and by `dates.js`). The day labels of
#250, #254 and #276 are one lower than the computed day (known, ids 109-297). Fog and claim status follow 3.4 as
written; sources follow 7.1. What the sample showed: three ship attacks with three kinds (#354, #565, #377); traffic
statistics typed as energy (#384); 5 of 7 political events are talks or statements; statements certainly made, and
an IAEA assessment, graded `claimed` (#276, #536, #585); single-source records with fog false (#358, #566);
"Unattributed" (#354) and an accident would look the same (`by: []`).

| id | dateISO | Day | v1 label | fog | claimStatus | sources | kind (* = in `needs`) |
|---|---|---|---|---|---|---|---|
| 12 | 2026-03-01 | 2 | - | no | unreviewed | legacy-unlisted | strike* |
| 35 | 2026-02-28 | 1 | - | no | unreviewed | named-only | energy |
| 132 | 2026-03-01 | 2 | - | no | unreviewed | named-only | strike* |
| 166 | 2026-03-02 | 3 | - | no | unreviewed | named-only | political |
| 184 | 2026-04-01 to 04-02 | 33 | - | no | unreviewed | named-only | strike* |
| 214 | 2026-04-14 | 46 | - ("Day" = daytime, kept) | no | unreviewed | named-only | political |
| 250 | 2026-05-08 | 70 | off by 1 | yes | claimed | named-only | strike* |
| 254 | 2026-05-10 to 05-11 | 72 | off by 1 ("Days 71-72") | yes | disputed | named-only | political |
| 276 | 2026-06-03 to 06-05 | 96 | off by 1 | yes | claimed | named-only | intel* |
| 354 | 2026-08-03 | 157 | ok | no | unreviewed | named-only | naval |
| 358 | 2026-08-04 | 158 | ok | no | unreviewed | named-only | political |
| 377 | 2026-08-11 | 165 | ok | no | unreviewed | listed | unclassified* |
| 384 | 2026-08-15 | 169 | ok | no | unreviewed | named-only | energy |
| 486 | 2026-09-23 | 208 | ok | yes | claimed | listed | strike* |
| 535 | 2026-10-12 | 227 | ok | no | reported | listed | political |
| 536 | 2026-10-12 | 227 | ok | yes | claimed | listed | political |
| 565 | 2026-10-27 | 242 | ok | yes | claimed | listed | energy |
| 566 | 2026-10-27 | 242 | ok | no | reported | listed | political |
| 585 | 2026-11-03 | 249 | ok | yes | claimed | listed | political |
| 594 | 2026-11-07 | 253 | ok | yes | claimed | listed | naval |

# Appendix D — re-baselined acceptance numbers (if M2 is accepted)
Fog 127 (34 in ids 1-385, 93 in 386-600) · claim status 8 disputed, 119 claimed, 122 reported, 351 unreviewed ·
geoPrecision 39 representative, 561 unknown (false matches: 118, 148, 171, 176, 215, 306, 461, 591) · `timeNote`
with a day number: 0 (was 6) · unchanged: 600 events, precision 539/57/4, sources 250/322/28, tiers, significance 33.
