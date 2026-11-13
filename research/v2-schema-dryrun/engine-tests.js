#!/usr/bin/env node
/* WARMAPS v2 DRY RUN part 2 (F1 step 1, 2026-11-11). THROWAWAY EVIDENCE.
 * Exercises the timeline engine proposed in docs/v2/ARCHITECTURE. Since v1.2 (2026-11-13) the link, watchlist and
 * event attribution rules are tested in attribution-tests.js; the truth-graded v1.1 link and watch tests were removed.
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

// ================= DEFAULT WINDOW (provisional ruling 1, 2026-11-12) =================
// The map opens on the last 7 days; the band can be dragged, widened, or set to All (the whole extent).
const defaultWindow = today => ({ from: toISO(dc(today) - 6), to: today });
const w7 = defaultWindow(TODAY);
t('v1.2 default window is the last 7 days, ending today', dc(w7.to) - dc(w7.from) + 1 === 7 && w7.to === TODAY, w7);
t('v1.2 an event 8 days old is outside the default window and inside All', !visible({ dateISO: toISO(dc(TODAY) - 7), datePrecision: 'day' }, w7) && visible({ dateISO: toISO(dc(TODAY) - 7), datePrecision: 'day' }, { from: '2026-01-29', to: TODAY }));
t('v1.2 an ongoing-from event stays visible in the 7-day window', visible({ dateISO: '2026-02-28', datePrecision: 'ongoing-from' }, w7));

// ================= LINKS AND WATCHLIST =================
// The v1.1 tests here graded links (documented / reported / alleged) and tripwires (confirmed). The editorial
// charter of 2026-11-12 removed those grades. The attribution rules that replace them are tested in
// attribution-tests.js (links: who affirms and who denies; watchlist: read off the cited events; charter test).

results.forEach(r => console.log((r.ok ? 'PASS ' : 'FAIL ') + r.name + (r.detail ? '  ' + JSON.stringify(r.detail) : '')));
console.log(`\n${results.length - failed}/${results.length} passed; ${failed} failed`);
process.exit(failed ? 1 : 0);
