#!/usr/bin/env node
/* R1 review (2026-11-11): the honesty rules of ARCHITECTURE v1.1 sections 3.4, 4.1, 4.2, 4.5 and 5.6,
 * implemented from the document text (not from the dry-run code), then fed records built to break them.
 * Each case prints what the rules SAY and what a reader WOULD BE TOLD. "HOLE" = the rules allow a misleading
 * record or reject a truthful one. No dependencies; reads only intake/feeds.json. Never touches app files.
 * Usage: node research/v2-schema-review/adversarial-tests.js [repoDir]
 * Dates and outlets in cases R*, L1, L2 are real (sources in REVIEW.md appendix); all other records are invented.
 */
'use strict';
const fs = require('fs'), path = require('path');
const root = process.argv[2] || '.';
const feeds = JSON.parse(fs.readFileSync(path.join(root, 'intake/feeds.json'), 'utf8')).feeds;
const out = []; const note = (id, hole, said, reader) => out.push({ id, hole, said, reader });

// ---------- registry (4.5). The doc's entry has no actor field; one is added here so the rule can run at all.
const REG = {
  aljazeera: { origin: 'intl-broadcaster (Qatar)', class: 'independent-media', actor: null },
  tass: { origin: 'russia-state', class: 'state-media', actor: 'russia' },
  bbc: { origin: 'intl-broadcaster (UK)', class: 'independent-media', actor: null },
  guardian: { origin: 'europe (UK press)', class: 'independent-media', actor: null },
  kyivindependent: { origin: 'ukraine-independent', class: 'independent-media', actor: null },
};
// 3.4 + 4.5: confirmed via sources = two `read` sources, registry origins differ, neither is state/party media of an
// actor in the event. (The other route, "affected party's own acknowledgement", has no field and is not modelled.)
function mayConfirm(ev) {
  const ok = ev.sources.filter(s => s.access === 'read' && REG[s.registryId]);
  const actors = [...ev.actors.by, ...ev.actors.against];
  for (let i = 0; i < ok.length; i++) for (let j = i + 1; j < ok.length; j++) {
    const a = REG[ok[i].registryId], b = REG[ok[j].registryId];
    const partyMedia = r => (r.class === 'state-media' || r.class === 'party') && actors.includes(r.actor);
    if (a.origin !== b.origin && !partyMedia(a) && !partyMedia(b)) return true;
  }
  return false;
}
// R1: an IRGC claim relayed by two outlets. Nothing in the record says both are quoting the IRGC.
const irgcClaim = { actors: { by: ['iran'], against: ['israel'] },
  sources: [{ registryId: 'aljazeera', access: 'read' }, { registryId: 'tass', access: 'read' }] };
note('R1', mayConfirm(irgcClaim), 'IRGC claim relayed by Al Jazeera + TASS may be marked confirmed: ' + mayConfirm(irgcClaim),
  'a party claim shown as confirmed');
// R2: the mirror image, an IDF claim relayed by two UK outlets.
const idfClaim = { actors: { by: ['israel'], against: ['hezbollah'] },
  sources: [{ registryId: 'bbc', access: 'read' }, { registryId: 'guardian', access: 'read' }] };
note('R2', mayConfirm(idfClaim), 'IDF claim relayed by BBC + Guardian may be marked confirmed: ' + mayConfirm(idfClaim),
  'same failure for the other side (the rule is symmetric, and symmetrically wrong)');
// R3: Allan's own subscription read and a Wayback copy: read in full, cannot count.
const subArch = { actors: { by: ['iran'], against: ['israel'] },
  sources: [{ registryId: 'bbc', access: 'subscription' }, { registryId: 'guardian', access: 'archive' }] };
note('R3', !mayConfirm(subArch), 'two fully read sources (subscription, archive) can confirm: ' + mayConfirm(subArch),
  'a truthful, well-read record can never reach confirmed');

// ---------- independence by origin label, using the real labels in intake/feeds.json
const lab = Object.fromEntries(feeds.map(f => [f.id, f.origin]));
const pairs = [['bbc_world', 'guardian_world'], ['jpost', 'ynet_en'], ['thenational', 'arabnews'],
  ['mondoweiss', 'electronicintifada'], ['meduza_en', 'moscowtimes'], ['cibercuba', '14ymedio'], ['efectococuyo', 'elpitazo']];
const indep = pairs.map(([a, b]) => `${a}+${b}: ${lab[a] !== lab[b] ? 'independent' : 'NOT independent'}`);
note('R4', true, 'same-camp pairs, judged by label inequality: ' + indep.join('; '), 'which camp gets two votes depends on spelling');

// ---------- links (4.1)
const LEVEL = { alleged: 1, reported: 2, documented: 3 };
function obsLevel(o) {
  if (['participant-acknowledgement', 'treaty-or-contract'].includes(o.basis)) return o.attestedBy === 'participant' ? 3 : 2;
  if (o.basis === 'court-finding') return 3;
  if (['forensic-hardware', 'igo-report'].includes(o.basis)) return o.attestedBy === 'neutral-body' ? 3 : 2;
  if (['sanctions-designation', 'official-statement', 'on-record-official', 'osint-imagery', 'trade-data'].includes(o.basis)) return 2;
  return 1;
}
const conf = obs => ['', 'alleged', 'reported', 'documented'][Math.max(...obs.map(obsLevel))];
function fogAllowedFalse(obs) {
  const c = conf(obs); if (c === 'alleged') return false; if (c === 'documented') return true;
  return new Set(obs.filter(o => obsLevel(o) >= 2).map(o => o.attestedBy)).size >= 2;
}
// L1: the doc's own example link title. Iran's FM, 5 Nov 2022: "a limited number" of drones sent months BEFORE the
// war; wartime supply denied. Filed as the doc says a participant acknowledgement is filed.
const L1 = [{ dateISO: '2022-11-05', basis: 'participant-acknowledgement', attestedBy: 'participant', note: 'pre-war, limited; wartime supply denied' }];
note('L1', conf(L1) === 'documented' && fogAllowedFalse(L1), `"Shahed-family drone transfer and licensed production" = ${conf(L1)}, fog false allowed: ${fogAllowedFalse(L1)}`,
  'the badge certifies the broad claim with a statement that denied it');
// L2: Sep 2024 Fath-360 case. US statement = reported, fog. Add Iran's denial (no stance field exists).
const L2a = [{ dateISO: '2024-09-10', basis: 'official-statement', attestedBy: 'other-government', note: 'US: Russia received Fath-360' }];
const L2b = [...L2a, { dateISO: '2024-09-11', basis: 'official-statement', attestedBy: 'participant', note: "Iran: 'has not sent ballistic missiles'" }];
note('L2', fogAllowedFalse(L2b) && !fogAllowedFalse(L2a),
  `US accusation alone: ${conf(L2a)}, fog false allowed ${fogAllowedFalse(L2a)}; after adding Iran's DENIAL: ${conf(L2b)}, fog false allowed ${fogAllowedFalse(L2b)}`,
  'recording the denial clears the fog flag, as if the accused had corroborated it; leaving it out hides one side');
// L2c: with only anonymous sourcing, recording a denial raises the grade.
const L2c = [{ dateISO: '2024-08-01', basis: 'anonymous-official', attestedBy: 'media' }];
note('L2c', LEVEL[conf([...L2c, L2b[1]])] > LEVEL[conf(L2c)], `anonymous reports: ${conf(L2c)}; plus the denial: ${conf([...L2c, L2b[1]])}`, 'a denial raises the link');
// L3: a belligerent's own court.
const L3 = [{ dateISO: '2025-03-01', basis: 'court-finding', attestedBy: 'neutral-body', note: 'espionage verdict by a court of a party state' }];
note('L3', conf(L3) === 'documented', `party-state court verdict = ${conf(L3)}`, 'a party court counted as neutral documentation');
// L4: G7 or NATO statement filed as an IGO report by a neutral body (nothing checks the label).
const L4 = [{ dateISO: '2024-09-14', basis: 'igo-report', attestedBy: 'neutral-body', note: 'G7 foreign ministers statement' }];
note('L4', conf(L4) === 'documented', `G7 statement typed as igo-report/neutral-body = ${conf(L4)}`, 'an accuser bloc counted as neutral');
// L5: one participant boasts of coordination; the other is silent.
const L5 = [{ dateISO: '2026-05-01', basis: 'participant-acknowledgement', attestedBy: 'participant', note: 'Ansarullah: "joint operation with Hezbollah"' }];
note('L5', conf(L5) === 'documented' && fogAllowedFalse(L5), `one-sided boast = ${conf(L5)}, fog false allowed: ${fogAllowedFalse(L5)}`, 'propaganda boast shown as documented, no fog');
// L6: weight (5.6). Six anonymous-sourced media reports in 180 days.
const weightStep = n => n === 0 ? 0 : n >= 6 ? 4 : n >= 4 ? 3 : n >= 2 ? 2 : 1;
note('L6', weightStep(6) === 4, `six alleged observations -> weight step ${weightStep(6)} (thickest); one court finding -> step ${weightStep(1)}`,
  'thickness rewards repetition, not evidence');
// L7: hindsight. Confidence is one stored value; at a 2022 cursor the 2024 court finding still sets it.
const L7 = [{ dateISO: '2022-10-01', basis: 'media-report', attestedBy: 'media' }, { dateISO: '2024-06-01', basis: 'court-finding', attestedBy: 'neutral-body' }];
const asOf = (obs, iso) => conf(obs.filter(o => o.dateISO <= iso));
note('L7', conf(L7) !== asOf(L7, '2022-12-31'), `stored: ${conf(L7)}; what was known at 2022-12-31: ${asOf(L7, '2022-12-31')}`, 'scrubbing back shows later knowledge');

// ---------- watchlist (4.2)
const COMBAT = ['strike', 'interception', 'ground', 'naval', 'air-defense'];
const validEntry = (h, EV) => h.status !== 'confirmed' || h.events.some(id => EV[id] && COMBAT.includes(EV[id].kind) && EV[id].claimStatus === 'confirmed');
// W1: a Kyiv strike is certain; "Iranian missile" is a Ukrainian claim relayed by Kyiv Independent + BBC (see R1).
const kyiv = { kind: 'strike', actors: { by: ['russia'], against: ['ukraine'] }, sources: [{ registryId: 'kyivindependent', access: 'read' }, { registryId: 'bbc', access: 'read' }] };
kyiv.claimStatus = mayConfirm(kyiv) ? 'confirmed' : 'reported';
const EV = { 'RU-01200': kyiv };
const hist = [{ dateISO: '2026-12-01', status: 'confirmed', events: ['RU-01200'] }];
note('W1', validEntry(hist[0], EV), `WL-C-02 "Iranian missiles used against Ukraine" confirmed on RU-01200: ${validEntry(hist[0], EV)}`,
  'headline "Direct combat link confirmed" resting on one side\'s attribution');
// W3: later the event is downgraded. History may not be overwritten, but the old entry is checked against today's data.
EV['RU-01200'] = { ...kyiv, claimStatus: 'disputed' };
note('W3', !validEntry(hist[0], EV), `after the event is downgraded, the untouched 2026-12-01 entry still validates: ${validEntry(hist[0], EV)}`,
  'validator forces an edit to history, which the same section forbids');
// W2: a confirmed Iranian drone strike on a NATO-flagged tanker, kind shipping (or energy, as v1 type energy maps).
const EV2 = { 'IR-00900': { kind: 'shipping', claimStatus: 'confirmed' } };
const h2 = { status: 'confirmed', events: ['IR-00900'] };
note('W2', !validEntry(h2, EV2), `"NATO-Iran direct clash" confirmed by a confirmed strike on a tanker: ${validEntry(h2, EV2)}`, 'a truthful combat event can never trip the wire');
// W6: forbidden-word pattern as tested in the dry run.
const FORBIDDEN = /merge|merger|merged|one war|world war/i;
note('W6', FORBIDDEN.test('Emergency session'), `pattern flags "Emergency session" (v1 id 166 time text): ${FORBIDDEN.test('Emergency session')}`, 'needs word boundaries');

for (const r of out) console.log(`${r.hole ? 'HOLE' : 'ok  '} ${r.id}  ${r.said}\n        reader: ${r.reader}`);
console.log(`\n${out.filter(r => r.hole).length} of ${out.length} cases show a hole`);
