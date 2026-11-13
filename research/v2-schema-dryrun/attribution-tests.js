#!/usr/bin/env node
/* WARMAPS v2 DRY RUN part 3 (F1b-1, 2026-11-13). THROWAWAY EVIDENCE.
 * Exercises the attribution rules of ARCHITECTURE v1.2 (3.4, 4.1, 4.2, 5.6, 5.8, 7.4 E0) through the reference
 * implementation in attribution.js. EVERY RECORD BELOW IS CONSTRUCTED FOR THE TEST. None is a real event,
 * link or statement; the actor names only make the cases readable.
 * Usage: node research/v2-schema-dryrun/attribution-tests.js     (no dependencies, no repo files read)
 */
'use strict';
const A = require('./attribution.js');
const results = []; let failed = 0;
const t = (name, ok, detail) => { results.push({ name, ok, detail }); if (!ok) failed++; };

const reg = {
  actors: {
    israel: { id: 'israel', name: 'Israel', kind: 'state' }, idf: { id: 'idf', name: 'IDF', kind: 'armed-force', parent: 'israel' },
    iran: { id: 'iran', name: 'Iran', kind: 'state' }, irgc: { id: 'irgc', name: 'IRGC', kind: 'armed-force', parent: 'iran' },
    hezbollah: { id: 'hezbollah', name: 'Hezbollah', kind: 'armed-group' }, usa: { id: 'usa', name: 'United States', kind: 'state' },
    russia: { id: 'russia', name: 'Russia', kind: 'state' }, ukraine: { id: 'ukraine', name: 'Ukraine', kind: 'state' },
    un: { id: 'un', name: 'United Nations', kind: 'igo' }, monitorx: { id: 'monitorx', name: 'Monitor X', kind: 'monitor' }
  },
  outlets: {
    statetv: { name: 'State TV (Iran)', actor: 'iran', ownership: 'state' }, partytv: { name: 'Party TV', actor: 'hezbollah', ownership: 'party' },
    exile1: { name: 'Exile Channel', ownership: 'exile', covers: 'iran' }, wire1: { name: 'Wire One', ownership: 'independent' }
  }
};
const src = [{ role: 'original', publisher: 'example', url: 'https://example.org/x' }];
const en = (n, who, stance, published, extra) => ({ n, claimedBy: who.startsWith('outlet:') ? { outlet: who.slice(7) } : { actor: who }, stance, published, text: 'constructed', sources: src, ...extra });
const ev = (entries, extra) => ({ id: 'XX-00001', kind: 'strike', tier: 'milestone', actors: { by: ['idf'], against: ['irgc'] }, entries, ...extra });
const T = '2026-12-31';
const D = (rec, when = T, cfg) => A.deriveEvent(rec, when, reg, cfg);
const site = { place: 'Site A', lat: 32.65, lng: 51.68, precision: 'site' }, city = { place: 'City A', lat: 32.66, lng: 51.67, precision: 'city' };
const far = { place: 'City B', lat: 35.69, lng: 51.39, precision: 'city' };

// ---------- the four looks ----------
const one = ev([en(1, 'idf', 'claims', '2026-12-01', { locations: [city] })]);
let d = D(one);
t('one side on record -> ghost, the missing side is named', d.look === 'ghost' && d.missing.join() === 'iran' && /Missing: Iran/.test(d.statusLine), d.statusLine);
t('provisional ruling 2: a one-sided milestone draws at standard size', d.drawTier === 'standard');
const both = ev([...one.entries, en(2, 'irgc', 'acknowledges', '2026-12-02')]);
d = D(both);
t('the other end acknowledges -> solid at its own tier', d.look === 'solid' && d.drawTier === 'milestone' && d.missing.length === 0 && /Agree it happened/.test(d.statusLine), d.statusLine);
d = D(ev([...one.entries, en(2, 'irgc', 'denies', '2026-12-02')]));
t('a denial makes it split, never solid', d.look === 'split' && /Denied by Iran/.test(d.statusLine), d.statusLine);
d = D(ev([...one.entries, en(2, 'irgc', 'acknowledges', '2026-12-02'), en(3, 'hezbollah', 'denies', '2026-12-03')]));
t('a denial by anyone on record splits it even after both ends agree', d.look === 'split');
d = D(ev([...one.entries, en(2, 'irgc', 'acknowledges', '2026-12-02'), en(3, 'irgc', 'denies', '2026-12-02', { scope: ['damage'] })]));
t('a denial limited to damage does not split; the status line says what they disagree on', d.look === 'solid' && /Agree it happened; disagree on damage/.test(d.statusLine), d.statusLine);
d = D(ev([en(1, 'irgc', 'claims', '2026-12-01', { attributesTo: ['israel'] }), en(2, 'idf', 'denies', '2026-12-02', { scope: ['attribution'] })], { actors: { by: ['israel'], against: ['iran'] } }));
t('a dispute over who did it splits the marker', d.look === 'split' && /Who did it is disputed by Israel/.test(d.statusLine), d.statusLine);

// ---------- who counts as a side (charter rules 2 and 3) ----------
const ally = ev([...one.entries, en(2, 'usa', 'claims', '2026-12-02')]);
t('decision 9, proposal A: a second side that is not at the other end leaves it a ghost', D(ally).look === 'ghost' && /On record: Israel, United States/.test(D(ally).statusLine), D(ally).statusLine);
t('decision 9, option B: any two sides make it solid', D(ally, T, { ...A.CONFIG, solidRule: 'any-two' }).look === 'solid');
d = D(ev([...one.entries, en(2, 'outlet:exile1', 'claims', '2026-12-02')]));
t('exile media never stands in for a side: still a ghost, listed as also reporting', d.look === 'ghost' && d.missing.join() === 'iran' && /Also reporting: Exile Channel/.test(d.statusLine), d.statusLine);
d = D(ev([...one.entries, en(2, 'outlet:statetv', 'claims', '2026-12-02')]));
t('state media in its own voice is grouped with its side and labelled', d.look === 'solid' && /Iran \(state media\)/.test(d.statusLine), d.statusLine);
d = D(ev([en(1, 'idf', 'claims', '2026-12-01', { sources: [...src, { role: 'carrier', publisher: 'A' }, { role: 'carrier', publisher: 'B' }, { role: 'carrier', publisher: 'C' }, { role: 'carrier', publisher: 'D' }] })]));
t('repetition is not corroboration: four carriers add no account', d.look === 'ghost' && d.sidesOnRecord.join() === 'israel');
d = D(ev([...one.entries, en(2, 'outlet:wire1', 'claims', '2026-12-02', { claimedBy: { outlet: 'wire1', citing: 'an unnamed Iranian official' } })]));
t('an unnamed official does not put a side on record', d.look === 'ghost' && d.missing.join() === 'iran');
d = D(ev([...one.entries, en(2, 'irgc', 'acknowledges', '2026-12-02')], { actors: { by: ['idf'], against: ['irgc', 'hezbollah'] } }));
t('both ends on record but a third involved side silent: solid, and the silent side is still named', d.look === 'solid' && /Missing: Hezbollah/.test(d.statusLine), d.statusLine);
t('decision 9, option C: every involved side must be heard', D(ev([...one.entries, en(2, 'irgc', 'acknowledges', '2026-12-02')], { actors: { by: ['idf'], against: ['irgc', 'hezbollah'] } }), T, { ...A.CONFIG, solidRule: 'all-involved' }).look === 'ghost');
d = D(ev([en(1, 'usa', 'claims', '2026-12-01')], { kind: 'statement', actors: { by: ['usa'], against: [] } }));
t('a statement is its own happening: its maker on record is everyone involved', d.look === 'solid' && d.missing.length === 0);
d = D(ev([en(1, 'un', 'claims', '2026-12-01')], { kind: 'humanitarian', actors: { by: [], against: ['iran'] } }));
t('an observer alone (UN) does not make the affected side heard', d.look === 'ghost' && /Also reporting: United Nations/.test(d.statusLine) && !/On record/.test(d.statusLine), d.statusLine);

// ---------- time: Record today versus As known then ----------
t('As known then: before anything was published the record is not known', D(both, '2026-11-30').known === false);
t('As known then: ghost on day one, solid once the other end speaks', D(both, '2026-12-01').look === 'ghost' && D(both, '2026-12-02').look === 'solid');
const rev = ev([en(1, 'idf', 'claims', '2026-12-01', { figures: [{ what: 'killed', value: 12 }] }), en(2, 'idf', 'claims', '2026-12-05', { supersedes: 1, figures: [{ what: 'killed', value: 30 }] }), en(3, 'irgc', 'acknowledges', '2026-12-03', { figures: [{ what: 'killed', value: 4 }] })]);
d = D(rev);
t('a revised figure is a new entry; the old one stays in the file and leaves force', d.entriesInForce.join() === '3,2' && rev.entries.length === 3 && /figures differ on killed/.test(d.statusLine), d.statusLine);
t('As known then shows the figure as it stood', D(rev, '2026-12-04').entriesInForce.join() === '1,3');
const wd = ev([en(1, 'idf', 'claims', '2026-12-01'), en(2, 'idf', 'withdraws', '2026-12-06', { supersedes: 1 })]);
t('a claimant withdrawing is a new entry; nothing is deleted; the record is listed, not drawn', D(wd).look === 'no-account' && D(wd, '2026-12-03').look === 'ghost' && wd.entries.length === 2, D(wd).statusLine);
const ours = ev([en(1, 'idf', 'claims', '2026-12-01'), { ...en(2, 'irgc', 'acknowledges', '2026-12-02'), withdrawn: { dateISO: '2026-12-09', reason: 'our-error', note: 'misread source' } }]);
t('our own mistake is removed from force and stays as a tombstone entry', D(ours).look === 'ghost' && ours.entries[1].withdrawn.reason === 'our-error');
t('a withdrawn record is a tombstone and is never drawn', D({ id: 'XX-00002', withdrawn: { dateISO: '2026-12-09', reason: 'duplicate', into: 'XX-00001' }, entries: [] }).tombstone === true);

// ---------- look-again and the faded ghost ----------
const checks = [1, 3, 7].map((s, i) => ({ step: s, dateISO: ['2026-12-02', '2026-12-04', '2026-12-08'][i], searched: ['statetv'], found: [] }));
d = D({ ...one, checks }, '2027-01-20');
t('30 days passed but the last check was not done: still a ghost, with the check shown as due', d.look === 'ghost' && d.checksDue.join() === '30');
d = D({ ...one, checks: [...checks, { step: 30, dateISO: '2026-12-31', searched: ['statetv'], found: [] }] }, '2027-01-20');
t('after the last look-again check: faded ghost, "unresolved as of" the check date', d.look === 'faded' && d.unresolvedAsOf === '2026-12-31' && /Unresolved: no account from Iran as of 2026-12-31/.test(d.statusLine), d.statusLine);
t('As known then before that check: an ordinary ghost', D({ ...one, checks: [...checks, { step: 30, dateISO: '2026-12-31', searched: [], found: [] }] }, '2026-12-20').look === 'ghost');
d = D({ ...both, entries: [...one.entries, en(2, 'irgc', 'acknowledges', '2027-02-01')], checks: [...checks, { step: 30, dateISO: '2026-12-31', searched: [], found: [] }] }, '2027-02-02');
t('a faded ghost solidifies whenever the other end finally speaks', d.look === 'solid');

// ---------- location history ----------
const moved = ev([en(1, 'idf', 'claims', '2026-12-01', { locations: [city] }), en(2, 'irgc', 'acknowledges', '2026-12-03', { locations: [site] })]);
t('the marker sits at the most specific compatible location and says who placed it', D(moved).position.place === 'Site A' && D(moved).position.placedBy === 'XX-00001#2' && D(moved, '2026-12-02').position.place === 'City A');
d = D(ev([en(1, 'idf', 'claims', '2026-12-01', { locations: [city] }), en(2, 'irgc', 'acknowledges', '2026-12-03', { locations: [far] })]));
t('sides name different places: marker stays at the first claim; the other is a labelled alternate', d.position.place === 'City A' && d.altPositions.length === 1 && d.altPositions[0].saidBy === 'iran' && d.altPositions[0].place === 'City B');
d = D(ev([en(1, 'irgc', 'claims', '2026-12-01', { locations: [city, far, site] })], { actors: { by: ['irgc'], against: ['israel'] } }));
t('a statement naming many targets is one record; the rest are ticks', d.position.place === 'City A' && d.targets.length === 2);
d = D(ev([en(1, 'irgc', 'claims', '2026-12-01')], { actors: { by: ['irgc'], against: ['israel'] } }));
t('a claim with no stated place is not on the map', d.position === null);

// ---------- migrated v1 records ----------
const mig = { id: 'IR-00012', legacyId: 12, needs: ['kind', 'title', 'actors', 'claimant', 'published'], lat: 1, lng: 2, place: 'x', geoPrecision: 'unknown', actors: { by: [], against: [] }, entries: [{ n: 1, stance: 'claims', published: '2026-03-01', sources: [] }] };
t('migrated record: claimant not recorded -> "unattributed", no side is named', D(mig).look === 'unattributed' && D(mig).sidesOnRecord === null && D(mig).position.placedBy === 'warmaps');
t('migrated record with a v1 fog note -> ghost (decision 6, option A)', D({ ...mig, legacy: { fog: { note: 'x' } } }).look === 'ghost');

// ---------- lenses and compare ----------
let l = A.lensEvent(moved, T, ['iran'], reg);
t('lens: only that party\'s entries, at the place that party gives', l.entries.join() === '2' && l.position.place === 'Site A' && l.hiddenAccounts === 1);
l = A.lensEvent(moved, T, ['israel'], reg);
t('lens: the marker moves when the lens changes', l.position.place === 'City A');
t('lens: a record the party has not spoken on is not in its account', A.lensEvent(one, T, ['iran'], reg) === null);
l = A.lensEvent(ev([...one.entries, en(2, 'irgc', 'denies', '2026-12-02')]), T, ['iran'], reg);
t('lens: a denial is listed under that party, not drawn as its event', l.list === 'denies' && l.onMap === false);
t('compare: both say it -> solid', A.compareEvent(both, T, 'israel', 'iran', reg).look === 'solid');
t('compare: only one spoke -> ghost on that party\'s half', (() => { const c = A.compareEvent(one, T, 'israel', 'iran', reg); return c.look === 'ghost' && c.left.state === 'says' && c.right.state === 'silent'; })());
t('compare: one says, one denies -> split', A.compareEvent(ev([...one.entries, en(2, 'irgc', 'denies', '2026-12-02')]), T, 'israel', 'iran', reg).look === 'split');
t('compare: both say it, at different places -> split', A.compareEvent(ev([en(1, 'idf', 'claims', '2026-12-01', { locations: [city] }), en(2, 'irgc', 'acknowledges', '2026-12-03', { locations: [far] })]), T, 'israel', 'iran', reg).look === 'split');
t('compare: neither spoke -> not shown', A.compareEvent(one, T, 'iran', 'hezbollah', reg) === null);

// ---------- links (4.1): who affirms, who denies; no grade ----------
const lk = entries => ({ id: 'LK-00001', from: 'iran', to: 'russia', dateStartISO: '2022-08-01', entries });
const L = (x, when = T) => A.deriveLink(x, when, reg);
d = L(lk([en(1, 'usa', 'claims', '2026-10-01')]));
t('link stated only by a third party -> ghost; both actors named as not heard', d.state === 'ghost' && d.noStatementFrom.join() === 'iran,russia' && d.affirmedBy.join() === 'usa');
d = L(lk([en(1, 'usa', 'claims', '2026-10-01'), en(2, 'iran', 'denies', '2026-10-02', { covers: 'any transfer' })]));
t('R1 case L2: adding the denial makes the link split; it can never read as support', d.state === 'split' && d.deniedBy.join() === 'iran');
d = L(lk([en(1, 'iran', 'acknowledges', '2026-10-01', { covers: 'a small number, before the war' }), en(2, 'iran', 'denies', '2026-10-01', { covers: 'transfers during the war' })]));
t('R1 case L1: an acknowledgement that also denies leaves the link split', d.state === 'split' && d.acknowledgedBy.join() === 'iran');
d = L(lk([en(1, 'iran', 'acknowledges', '2026-10-01'), en(2, 'russia', 'acknowledges', '2026-10-03')]));
t('both actors say so and no one denies -> solid', d.state === 'solid' && d.noStatementFrom.length === 0);
d = L(lk(['a', 'b', 'c', 'd', 'e', 'f'].map((x, i) => en(i + 1, 'usa', 'claims', '2026-10-0' + (i + 1)))));
t('R1 case L6: six statements by one voice weigh the same as one', d.voicesInWindow === 1 && d.weightStep === 1);
d = L(lk([en(1, 'usa', 'claims', '2026-10-01'), en(2, 'ukraine', 'claims', '2026-10-02'), en(3, 'un', 'claims', '2026-10-03'), en(4, 'iran', 'denies', '2026-10-04')]));
t('weight counts separate voices that affirm; a denial adds none', d.voicesInWindow === 3 && d.weightStep === 2);
t('R1 case L7: at an earlier cursor the link shows only what had been said by then', L(lk([en(1, 'usa', 'claims', '2024-06-01'), en(2, 'iran', 'acknowledges', '2026-10-01'), en(3, 'russia', 'acknowledges', '2026-10-01')]), '2024-07-01').state === 'ghost');
t('weight thins as voices fall out of the window; a standing treaty does not', L(lk([en(1, 'usa', 'claims', '2024-06-01')]), '2026-10-01').weightStep === 0 && L(lk([en(1, 'iran', 'acknowledges', '2025-01-17', { standing: true }), en(2, 'russia', 'acknowledges', '2025-01-17', { standing: true })]), '2026-10-01').weightStep === 2);

// ---------- watchlist, combat track (4.2) ----------
const events = { 'XX-00001': { ...one, id: 'XX-00001', kind: 'strike', actors: { by: ['irgc'], against: ['ukraine'] }, entries: [en(1, 'ukraine', 'claims', '2026-12-01', { attributesTo: ['iran'] })] } };
const H = (dateISO, status, evs = []) => ({ dateISO, status, evidence: { events: evs, links: [] }, reliedOn: evs.map(id => ({ ref: id, look: A.deriveEvent(events[id], dateISO, reg).look })), sources: src });
const W = hist => ({ id: 'WL-00002', track: 'combat', requires: { by: ['iran'] }, status: hist[hist.length - 1].status, history: hist });
const VW = (w, today = T) => A.validateWatch(w, events, reg, today);
t('watch: baseline passes', VW(W([H('2026-11-10', 'none-on-file')])).length === 0);
t('watch: one side\'s claim reads "one-sided" (R1 case W1: an attribution claim cannot read as more)', VW(W([H('2026-11-10', 'none-on-file'), H('2026-12-01', 'one-sided', ['XX-00001'])])).length === 0);
t('MUTATION: the same evidence typed as "both-ends" is rejected', VW(W([H('2026-12-01', 'both-ends', ['XX-00001'])])).length > 0);
t('MUTATION: the old verdict word "confirmed" is not on the scale', VW(W([H('2026-12-01', 'confirmed', ['XX-00001'])])).length > 0);
t('MUTATION: a link alone cannot move a combat tripwire', VW({ ...W([H('2026-12-01', 'one-sided')]), history: [{ ...H('2026-12-01', 'one-sided'), evidence: { events: [], links: ['LK-00001'] } }] }).length > 0);
events['XX-00003'] = { ...events['XX-00001'], id: 'XX-00003', kind: 'statement' };
t('MUTATION: a statement event cannot be cited by a combat tripwire', VW(W([H('2026-12-01', 'one-sided', ['XX-00003'])])).length > 0);
events['XX-00004'] = { ...events['XX-00001'], id: 'XX-00004', needs: ['actors'] };
t('MUTATION: a cited event with actors still in needs is rejected', VW(W([H('2026-12-01', 'one-sided', ['XX-00004'])])).length > 0);
const w1 = W([H('2026-11-10', 'none-on-file'), H('2026-12-01', 'one-sided', ['XX-00001'])]);
events['XX-00001'] = { ...events['XX-00001'], entries: [...events['XX-00001'].entries, en(2, 'irgc', 'denies', '2026-12-10', { scope: ['attribution'] })] };
t('R1 case W3: when the cited record changes, history is not edited; the validator asks for a new entry', VW(w1).some(e => /stale/.test(e)) && VW(w1, '2026-12-05').length === 0);
t('watch: the new entry records the new state and what it relied on', VW({ ...w1, status: 'contested', history: [...w1.history, H('2026-12-10', 'contested', ['XX-00001'])] }).length === 0);
const headline = (n, m) => n + ' of ' + m + ' combat tripwires have a claim on record';
t('headline is a count and never uses a verdict or the forbidden words', !/\b(confirmed|verified|merge[rd]?|one war|world war)\b/i.test(headline(1, 4)));

// ---------- charter test (7.4 E0) ----------
t('charter test passes a clean record', A.charterScan(both).length === 0, A.charterScan(both));
t('MUTATION: "claimStatus": "confirmed" is rejected (the test named in the S1 prompt)', A.charterScan({ ...both, claimStatus: 'confirmed' }).length > 0);
t('MUTATION: a field named "confidence" is rejected', A.charterScan({ id: 'LK-00001', confidence: 'high' }).length > 0);
t('MUTATION: a truth word as a closed-list value is rejected', A.charterScan({ ...both, entries: [{ ...both.entries[0], stance: 'debunked' }] }).length > 0);
t('quoted source text is exempt', A.charterScan({ ...both, entries: [{ ...both.entries[0], text: 'The ministry said it had confirmed the strike.' }] }).length === 0);

results.forEach(r => console.log((r.ok ? 'PASS ' : 'FAIL ') + r.name + (r.detail && !r.ok ? '  ' + JSON.stringify(r.detail) : '')));
console.log(`\n${results.length - failed}/${results.length} passed; ${failed} failed`);
process.exit(failed ? 1 : 0);
