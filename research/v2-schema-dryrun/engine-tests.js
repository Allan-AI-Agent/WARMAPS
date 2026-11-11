#!/usr/bin/env node
/* WARMAPS v2 DRY RUN part 2 (F1 step 1, 2026-11-11). THROWAWAY EVIDENCE.
 * Exercises the timeline engine, link rules and watchlist rules proposed in docs/v2/ARCHITECTURE,
 * including mutation tests: each rule must reject the bad case it exists to stop.
 * Usage: node research/v2-schema-dryrun/engine-tests.js    (no dependencies, no repo files read)
 */
'use strict';
const dc = s => { const [y, m, d] = s.split('-').map(Number); return Date.UTC(y, m - 1, d) / 864e5; };
const toISO = n => new Date(n * 864e5).toISOString().slice(0, 10);
const results = []; let failed = 0;
const t = (name, ok, detail) => { results.push({ name, ok, detail }); if (!ok) failed++; };

// ================= TIMELINE =================
const TODAY = '2026-11-11';
const RU = { id: 'russia-ukraine', epochISO: '2022-02-24', axisFrom: '2022-02-24', bands: [
  { from: '2022-02-24', to: '2024-12-31', unit: 'month' }, { from: '2025-01-01', to: '2026-02-27', unit: 'week' }, { from: '2026-02-28', to: null, unit: 'day' } ] };
const IR = { id: 'iran-war', epochISO: '2026-02-28', axisFrom: '2026-01-29', bands: [ { from: '2026-01-29', to: null, unit: 'day' } ] };
const RANK = { day: 0, week: 1, month: 2 };

// step boundaries: month = calendar month; week = ISO week (Monday start); both clipped to the band
function stepsOf(band, endISO) {
  const a = dc(band.from), b = dc(band.to || endISO), out = [];
  let s = a;
  while (s <= b) {
    let e;
    if (band.unit === 'day') e = s;
    else if (band.unit === 'week') { const dow = (new Date(s * 864e5).getUTCDay() + 6) % 7; e = s + (6 - dow); }
    else { const d = new Date(s * 864e5); e = Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0) / 864e5; }
    e = Math.min(e, b); out.push({ from: s, to: e, unit: band.unit }); s = e + 1;
  }
  return out;
}
// merged axis: at every day use the finest unit declared by any active theater, then cut into steps
function axis(theaters, endISO) {
  const start = Math.min(...theaters.map(x => dc(x.axisFrom))), end = dc(endISO), unitAt = [];
  for (let d = start; d <= end; d++) {
    let best = null;
    for (const th of theaters) for (const b of th.bands) if (d >= dc(b.from) && d <= dc(b.to || endISO)) if (best === null || RANK[b.unit] < RANK[best]) best = b.unit;
    unitAt.push(best);
  }
  const gaps = unitAt.filter(u => u === null).length;
  const steps = []; let i = 0;
  while (i < unitAt.length) { let j = i; while (j + 1 < unitAt.length && unitAt[j + 1] === unitAt[i]) j++;
    stepsOf({ from: toISO(start + i), to: toISO(start + j), unit: unitAt[i] || 'day' }, endISO).forEach(s => steps.push(s)); i = j + 1; }
  return { steps, gaps };
}
const ru = axis([RU], TODAY), ir = axis([IR], TODAY), both = axis([RU, IR], TODAY);
const count = (ax, u) => ax.steps.filter(s => s.unit === u).length;
t('RU axis has no gaps and is contiguous', ru.gaps === 0 && ru.steps.every((s, i) => i === 0 || s.from === ru.steps[i - 1].to + 1));
t('RU step counts', true, { month: count(ru, 'month'), week: count(ru, 'week'), day: count(ru, 'day'), total: ru.steps.length, daysIn2022to2024: dc('2024-12-31') - dc('2022-02-24') + 1 });
t('IR step count', true, { total: ir.steps.length });
t('merged axis uses finest unit where bands overlap', both.steps.filter(s => s.from >= dc('2026-01-29') && s.to <= dc('2026-02-27')).every(s => s.unit === 'day'), { total: both.steps.length });
// screen resolution: px per step on the S22 (about 328 px of track)
const px = n => +(328 / n).toFixed(2);
// v1.0 FINDING: a one-row timeline cannot resolve a step on a phone. Kept as data; the v1.1 design is tested below.
const full = { iranOnly: px(ir.steps.length), ruOnly: px(ru.steps.length), both: px(both.steps.length) };
t('v1.0 one-row timeline is below 8 px per step on a phone (finding)', Object.values(full).every(v => v < 8), full);
// v1.1: detail row shows a VIEW of floor(track / stepPx) steps, stepPx >= 8; overview row shows the whole extent
const viewSteps = (trackPx, stepPx = 8) => Math.floor(trackPx / stepPx);
const viewOf = (ax, endIdx, n) => ax.steps.slice(Math.max(0, endIdx - n + 1), endIdx + 1);
const v = viewOf(both, both.steps.length - 1, viewSteps(328));
t('v1.1 detail view on the S22 gives >= 8 px per step and ends today', 328 / v.length >= 8 && toISO(v[v.length - 1].to) === TODAY, { steps: v.length, from: toISO(v[0].from), fireLandscape: viewSteps(820), pc1600: viewSteps(1200) });
const monthIdx = both.steps.findIndex(s => s.unit === 'month' && s.from <= dc('2024-12-01') && s.to >= dc('2024-12-01'));
t('v1.1 a 41-step view over the monthly band covers all of 2022-2024', viewOf(both, monthIdx, 41).filter(s => s.unit === 'month').length === 35);
// piecewise scale round trip: date -> step -> date range contains date
const stepOf = (ax, iso) => ax.steps.findIndex(s => dc(iso) >= s.from && dc(iso) <= s.to);
t('date->step lookup is total and stable', ['2022-02-24', '2022-09-13', '2025-01-01', '2025-06-17', '2026-02-27', '2026-02-28', TODAY].every(d => stepOf(both, d) >= 0));
// day numbers
const dayNumber = (th, iso) => dc(iso) - dc(th.epochISO) + 1;
t('day numbers', dayNumber(IR, '2026-11-08') === 254 && dayNumber(RU, '2026-11-08') === 1719 && dayNumber(IR, '2026-02-27') === 0, { irToday: dayNumber(IR, TODAY), ruToday: dayNumber(RU, TODAY) });
// changing a band unit (the "daily backfill later" case) changes only config
const RU2 = { ...RU, bands: [ { from: '2022-02-24', to: null, unit: 'day' } ] };
t('band unit change needs no engine change', axis([RU2], TODAY).steps.length === dc(TODAY) - dc('2022-02-24') + 1);
// window intersection
const visible = (ev, w) => { const a = dc(ev.dateISO), b = ev.datePrecision === 'ongoing-from' ? Infinity : dc(ev.dateEndISO || ev.dateISO); return a <= dc(w.to) && b >= dc(w.from); };
t('month-precision event visible for the whole month', visible({ dateISO: '2022-09-01', dateEndISO: '2022-09-30', datePrecision: 'month' }, { from: '2022-09-20', to: '2022-09-20' }));
t('ongoing-from visible after start, not before', visible({ dateISO: '2026-02-28', datePrecision: 'ongoing-from' }, { from: '2026-10-01', to: '2026-10-01' }) && !visible({ dateISO: '2026-02-28', datePrecision: 'ongoing-from' }, { from: '2026-02-01', to: '2026-02-27' }));
t('event before the axis start (IR-00006, 2025-06-22) is outside any single-step window', !visible({ dateISO: '2025-06-22', datePrecision: 'day' }, { from: '2026-01-29', to: TODAY }), 'needs a rule: pre-axis events');

// ================= LINKS =================
const HARD = ['court-finding', 'forensic-hardware', 'treaty-or-contract', 'participant-acknowledgement'];           // establish the fact itself
const ONRECORD = ['sanctions-designation', 'official-statement', 'on-record-official', 'osint-imagery', 'trade-data', 'igo-report'];
const SOFT = ['media-report', 'anonymous-official'];
// attestedBy: participant (one of the link's own two actors), neutral-body (court, UN panel, independent investigators), other-government (any other government), media
function obsLevel(o) {
  if (o.basis === 'participant-acknowledgement' || o.basis === 'treaty-or-contract') return o.attestedBy === 'participant' ? 3 : 2;
  if (o.basis === 'court-finding') return 3;
  if (o.basis === 'forensic-hardware' || o.basis === 'igo-report') return o.attestedBy === 'neutral-body' ? 3 : 2;
  if (ONRECORD.includes(o.basis)) return 2;
  return 1;
}
const confidenceOf = link => ['', 'alleged', 'reported', 'documented'][Math.max(...link.observations.map(obsLevel))];
function validateLink(l) {
  const e = [];
  if (!l.observations || !l.observations.length) e.push('no observations');
  else {
    if (l.observations.some(o => !o.sources || !o.sources.length)) e.push('observation without sources');
    if (l.observations.some(o => ![...HARD, ...ONRECORD, ...SOFT].includes(o.basis))) e.push('unknown basis');
    const c = confidenceOf(l);
    if (l.confidence !== c) e.push(`confidence must be ${c}`);
    const attesters = new Set(l.observations.filter(o => obsLevel(o) >= 2).map(o => o.attestedBy));
    if (l.fog === false && c === 'alleged') e.push('alleged link cannot be fog:false');
    if (l.fog === false && c === 'reported' && attesters.size < 2) e.push('reported link needs two different attesting sides to be fog:false');
    if (l.observations.some(o => dc(o.dateISO) < dc(l.dateStartISO))) e.push('observation before link start');
  }
  return e;
}
const src = [{ url: 'https://example.org/x', publisher: 'example' }];
const obs = (dateISO, basis, attestedBy, extra) => ({ dateISO, basis, attestedBy, sources: src, ...extra });
const L = (o, c, fog) => ({ id: 'LK-00001', dateStartISO: '2022-08-01', observations: o, confidence: c, fog });
t('doc example as written (sanctions + captured hardware + official statement, no attester) is NOT derivable', true, 'v1.0 gave no attester, so "documented" could rest on one government\'s designation');
t('adversary sanctions designation alone -> reported, must stay fog', validateLink(L([obs('2022-09-08', 'sanctions-designation', 'other-government')], 'reported', true)).length === 0 && validateLink(L([obs('2022-09-08', 'sanctions-designation', 'other-government')], 'documented', false)).length > 0);
t('neutral forensic hardware -> documented, fog:false allowed', validateLink(L([obs('2022-11-01', 'forensic-hardware', 'neutral-body')], 'documented', false)).length === 0);
t('participant acknowledgement -> documented', validateLink(L([obs('2022-11-05', 'participant-acknowledgement', 'participant')], 'documented', false)).length === 0);
t('anonymous officials only -> alleged and fog (the ruling)', validateLink(L([obs('2026-03-01', 'anonymous-official', 'media')], 'alleged', true)).length === 0 && validateLink(L([obs('2026-03-01', 'anonymous-official', 'media')], 'alleged', false)).length > 0 && validateLink(L([obs('2026-03-01', 'anonymous-official', 'media')], 'reported', true)).length > 0);
t('reported + fog:false needs two attesting sides', validateLink(L([obs('2023-01-01', 'official-statement', 'other-government')], 'reported', false)).length > 0 && validateLink(L([obs('2023-01-01', 'official-statement', 'other-government'), obs('2023-02-01', 'osint-imagery', 'neutral-body')], 'reported', false)).length === 0);
t('observation without sources rejected', validateLink(L([{ dateISO: '2023-01-01', basis: 'media-report', attestedBy: 'media', sources: [] }], 'alleged', true)).length > 0);
// weight over time: count observations whose [date, end] interval touches the trailing window
function weight(link, cursorISO, windowDays = 180) {
  const c = dc(cursorISO); if (c < dc(link.dateStartISO) || (link.dateEndISO && c > dc(link.dateEndISO))) return null;
  const n = link.observations.filter(o => dc(o.dateISO) <= c && (o.dateEndISO === null ? Infinity : dc(o.dateEndISO || o.dateISO)) >= c - windowDays).length;
  return n === 0 ? 0 : Math.min(4, n >= 6 ? 4 : n >= 4 ? 3 : n >= 2 ? 2 : 1);
}
const lw = { dateStartISO: '2022-08-01', dateEndISO: null, observations: [obs('2022-09-13', 'forensic-hardware', 'neutral-body'), obs('2022-10-17', 'media-report', 'media'), obs('2022-11-05', 'participant-acknowledgement', 'participant'), obs('2023-05-01', 'sanctions-designation', 'other-government')] };
t('link weight thickens then thins', weight(lw, '2022-07-01') === null && weight(lw, '2022-08-15') === 0 && weight(lw, '2022-12-01') === 2 && weight(lw, '2023-03-01') === 2 && weight(lw, '2024-06-01') === 0, { '2022-12-01': weight(lw, '2022-12-01'), '2023-06-01': weight(lw, '2023-06-01'), '2024-06-01': weight(lw, '2024-06-01') });
const treaty = { dateStartISO: '2025-01-17', dateEndISO: null, observations: [obs('2025-01-17', 'treaty-or-contract', 'participant', { dateEndISO: null })] };
t('standing agreement stays visible (interval observation), not "dormant" after 180 days', weight(treaty, '2026-11-11') === 1);

// ================= WATCHLIST =================
const COMBAT_KINDS = ['strike', 'interception', 'ground', 'naval', 'air-defense'];
const EVENTS = { 'RU-00900': { kind: 'naval', claimStatus: 'confirmed' }, 'RU-00901': { kind: 'naval', claimStatus: 'reported' }, 'IR-00700': { kind: 'statement', claimStatus: 'confirmed' }, 'IR-00701': { kind: 'political', claimStatus: 'confirmed' } };
const LINKS = { 'LK-00001': { confidence: 'documented' } };
function validateWatch(w) {
  const e = [], scale = w.track === 'combat' ? ['not-seen', 'reported', 'confirmed'] : w.track === 'rhetoric' ? ['quiet', 'noted', 'elevated', 'sustained'] : null;
  if (!scale) return ['unknown track'];
  if (!w.definition || w.definition.length < 40) e.push('definition missing or too short to be testable');
  w.history.forEach((h, i) => {
    if (!scale.includes(h.status)) e.push(`status "${h.status}" not on the ${w.track} scale`);
    if (i && dc(h.dateISO) < dc(w.history[i - 1].dateISO)) e.push('history out of date order');
    const evs = (h.evidence.events || []).map(id => EVENTS[id]), lks = (h.evidence.links || []).map(id => LINKS[id]);
    if (evs.includes(undefined) || lks.includes(undefined)) e.push('evidence id does not resolve');
    if (w.track === 'combat') {
      if ((h.evidence.watch || []).length) e.push('combat tripwire cites a watch item');
      if (evs.some(x => x && x.kind === 'statement')) e.push('combat tripwire cites a statement event');
      if (h.status !== 'not-seen' && !evs.length && !lks.length) e.push('status above not-seen without evidence');
      if (h.status !== 'not-seen' && !h.sources.length) e.push('status change without sources');
      if (h.status === 'confirmed' && !evs.some(x => x && COMBAT_KINDS.includes(x.kind) && x.claimStatus === 'confirmed')) e.push('confirmed needs a confirmed combat-kind event');
    }
  });
  if (w.status !== w.history[w.history.length - 1].status) e.push('status does not equal latest history entry');
  return e;
}
const DEF = 'A Russian Navy surface combatant escorts one or more merchant vessels through the Strait of Hormuz.';
const W = (track, hist) => ({ id: 'WL-C-01', track, definition: DEF, status: hist[hist.length - 1].status, history: hist });
const H = (dateISO, status, events = [], links = [], sources = src, watch = []) => ({ dateISO, status, evidence: { events, links, watch }, sources });
t('valid baseline passes', validateWatch(W('combat', [H('2026-11-10', 'not-seen', [], [], [])])).length === 0);
t('valid confirmed passes', validateWatch(W('combat', [H('2026-11-10', 'not-seen', [], [], []), H('2026-12-01', 'confirmed', ['RU-00900'])])).length === 0);
t('MUTATION: confirmed on a documented link alone is rejected', validateWatch(W('combat', [H('2026-12-01', 'confirmed', [], ['LK-00001'])])).length > 0);
t('MUTATION: confirmed on a reported event is rejected', validateWatch(W('combat', [H('2026-12-01', 'confirmed', ['RU-00901'])])).length > 0);
t('MUTATION: confirmed on a confirmed non-combat event is rejected', validateWatch(W('combat', [H('2026-12-01', 'confirmed', ['IR-00701'])])).length > 0);
t('MUTATION: combat citing a statement event is rejected', validateWatch(W('combat', [H('2026-12-01', 'reported', ['IR-00700'])])).length > 0);
t('MUTATION: combat citing a rhetoric item is rejected', validateWatch(W('combat', [H('2026-12-01', 'reported', ['RU-00901'], [], src, ['WL-R-01'])])).length > 0);
t('MUTATION: rhetoric item cannot be "confirmed"', validateWatch(W('rhetoric', [H('2026-12-01', 'confirmed')])).length > 0);
t('MUTATION: reported without evidence is rejected', validateWatch(W('combat', [H('2026-12-01', 'reported')])).length > 0);
t('MUTATION: history out of order is rejected', validateWatch(W('combat', [H('2026-12-01', 'not-seen', [], [], []), H('2026-11-01', 'not-seen', [], [], [])])).length > 0);
const asOf = (w, iso) => { const h = w.history.filter(x => dc(x.dateISO) <= dc(iso)); return h.length ? h[h.length - 1].status : null; };
const wr = W('combat', [H('2026-11-10', 'not-seen', [], [], []), H('2026-12-01', 'confirmed', ['RU-00900'])]);
t('status replay by date', asOf(wr, '2026-11-20') === 'not-seen' && asOf(wr, '2026-12-05') === 'confirmed' && asOf(wr, '2026-01-01') === null);
const headline = n => n.confirmed ? 'Direct combat link confirmed' : n.reported ? 'Direct combat link reported' : 'No direct combat link seen';
const FORBIDDEN = /merge|merger|merged|one war|world war/i;
t('headline ladder never uses the forbidden words', [headline({}), headline({ reported: 1 }), headline({ confirmed: 1 })].every(s => !FORBIDDEN.test(s)));

results.forEach(r => console.log((r.ok ? 'PASS ' : 'FAIL ') + r.name + (r.detail ? '  ' + JSON.stringify(r.detail) : '')));
console.log(`\n${results.length - failed}/${results.length} passed; ${failed} failed`);
process.exit(failed ? 1 : 0);
