#!/usr/bin/env node
/* WARMAPS v2 PROTOTYPE — check/check.js   (run: node prototype/v2/check/check.js [--list] [--today=YYYY-MM-DD])
 * Not part of the page. It proves, for the sample data and the prototype's copies of the reference modules:
 *   1. the sample records have exactly the shape ARCHITECTURE v1.3 describes (closed lists, known keys, references);
 *   2. the charter test finds no field or closed-list value that grades truth;
 *   3. the prototype's attribution.js gives the same result as the reference, for every record on every date;
 *   4. every stored position equals the derived one; every watch item passes the reference validator;
 *   5. the three theme files are byte-identical to research/v2-theme-check/themes/ and pass all 86 checks,
 *      and the rejection cases are rejected;
 *   6. no string the interface generates uses a word that grades truth (LAYOUT spec check 17);
 *   7. the cases the session prompt asks for are all present in the sample.
 */
'use strict';
const fs = require('fs'), path = require('path');
const P = path.join(__dirname, '..'), REPO = path.join(P, '..', '..');
globalThis.window = globalThis;
for (const f of ['core/time.js', 'core/attribution.js', 'core/theme-check.js', 'data/sample-data.js', 'core/store.js', 'core/selectors.js']) require(path.join(P, 'js', f));
if (fs.existsSync(path.join(P, 'js/ui/strings.js'))) require(path.join(P, 'js/ui/strings.js'));
const WM = globalThis.WM, T = WM.time, A = WM.attribution, SC = WM.schema;
const REF = require(path.join(REPO, 'research/v2-schema-dryrun/attribution.js'));
const REFTHEME = require(path.join(REPO, 'research/v2-theme-check/theme-check.js'));

const argToday = (process.argv.find(a => a.startsWith('--today=')) || '').slice(8);
const today = argToday || '2026-11-15';
const data = WM.buildSampleData(today);
let fails = 0, passes = 0;
const ok = (cond, msg) => { if (cond) passes++; else { fails++; console.log('  FAIL ' + msg); } };
const group = name => console.log('\n' + name);
const inList = (v, list) => list.includes(v);

/* ---- 1. shape ------------------------------------------------------------------------------------ */
group('1. Sample records match the schemas');
const actorIds = new Set(data.actors.map(a => a.id)), outletIds = new Set(data.outlets.map(o => o.id)), theaterIds = new Set(data.theaters.map(t => t.id));
const noNulls = (o, p) => { if (o === null || o === '') { ok(false, p + ' is null or empty: optional fields must be omitted'); return; } if (Array.isArray(o)) o.forEach((x, i) => noNulls(x, p + '[' + i + ']')); else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) { if (v === undefined) ok(false, p + '.' + k + ' is undefined'); else noNulls(v, p + '.' + k); } };
for (const a of data.actors) { ok(inList(a.kind, SC.actorKind), a.id + ' actor kind'); ok(!a.parent || actorIds.has(a.parent), a.id + ' parent resolves'); ok(/^[a-z0-9-]+$/.test(a.id), a.id + ' flat id'); ok(a.anchor && typeof a.anchor.lat === 'number', a.id + ' anchor'); }
for (const o of data.outlets) { ok(inList(o.ownership, SC.ownership), o.id + ' ownership'); ok(inList(o.status, SC.outletStatus), o.id + ' status'); ok(!inList(o.ownership, ['state', 'party']) || actorIds.has(o.actor), o.id + ' state or party media names its actor'); }
for (const t of data.theaters) { ok(inList(t.status, SC.theaterStatus), t.id + ' status'); ok(t.aoi.bbox.length === 4, t.id + ' bbox'); ok(t.status === 'intake-only' || (T.isISO(t.epochISO) && t.timeline.bands.length), t.id + ' epoch and bands'); }
const ids = new Set();
function checkEntry(e, rec, isLink) {
  const p = rec.id + '#' + e.n;
  for (const k of Object.keys(e)) ok(inList(k, isLink ? SC.linkEntryKeys : SC.entryKeys), p + ' unknown entry key ' + k);
  ok(inList(e.stance, SC.stance), p + ' stance');
  ok(T.isISO(e.published), p + ' published');
  const needsClaimant = (rec.needs || []).includes('claimant');
  if (!needsClaimant) {
    ok(e.claimedBy && (Object.keys(e.claimedBy).length === 1) && (e.claimedBy.actor ? actorIds.has(e.claimedBy.actor) : outletIds.has(e.claimedBy.outlet)), p + ' claimedBy is exactly one registered actor or outlet');
    ok(isLink || typeof e.text === 'string', p + ' text (v2-authored)');
    ok(e.sources && e.sources.length >= 1, p + ' at least one source');
    for (const s of e.sources) { ok(inList(s.role, SC.role), p + ' source role'); ok(inList(s.access, SC.access), p + ' source access'); }
  } else ok(!e.claimedBy, p + ' has a claimant although the record says it needs one');
  ok(!e.scope || (inList(e.stance, ['denies', 'acknowledges']) && e.scope.every(x => inList(x, SC.scope))), p + ' scope');
  ok(!e.citing || (e.claimedBy && e.claimedBy.outlet), p + ' citing only on an outlet entry');
  for (const s of e.sources || []) { for (const k of Object.keys(s)) ok(inList(k, SC.sourceKeys), p + ' unknown source key ' + k); ok(typeof s.publisher === 'string', p + ' publisher'); ok(!s.url || /^https?:/.test(s.url), p + ' url scheme'); ok(!s.registryId || outletIds.has(s.registryId), p + ' registryId resolves'); ok(!s.kind || inList(s.kind, SC.sourceKind), p + ' source kind'); }
  for (const l of e.locations || []) ok(typeof l.lat === 'number' && typeof l.lng === 'number' && inList(l.precision, SC.locPrecision) && l.place, p + ' location');
  for (const f of e.figures || []) ok(inList(f.what, SC.figureWhat) && typeof f.value === 'number' && (!f.qualifier || inList(f.qualifier, SC.qualifier)), p + ' figure');
  for (const m of e.media || []) ok(inList(m.kind, SC.mediaKind) && m.publisher && /^https?:/.test(m.url), p + ' media');
  for (const a of e.attributesTo || []) ok(actorIds.has(a), p + ' attributesTo resolves');
  const ns = rec.entries.map(x => x.n);
  for (const n of e.respondsTo || []) ok(ns.includes(n) && n < e.n, p + ' respondsTo');
  if (e.supersedes != null) { const old = rec.entries.find(x => x.n === e.supersedes); ok(old && JSON.stringify(old.claimedBy) === JSON.stringify(e.claimedBy), p + ' supersedes an earlier entry by the same claimant'); }
  if (isLink) { ok(typeof e.covers === 'string' && e.covers.length > 0, p + ' covers'); ok(inList(e.record, SC.linkRecord), p + ' record'); for (const ev of e.events || []) ok(!!data.eventsById[ev], p + ' cites an event that resolves'); }
}
for (const r of data.events) {
  ok(/^(IR|RU|EA|CB)-\d{5}$/.test(r.id) && !ids.has(r.id), r.id + ' id shape and uniqueness'); ids.add(r.id);
  for (const k of Object.keys(r)) ok(inList(k, SC.eventKeys), r.id + ' unknown key ' + k);
  noNulls(r, r.id);
  ok(r.theater.length >= 1 && r.theater.every(t => theaterIds.has(t)), r.id + ' theater');
  ok(T.isISO(r.dateISO) && inList(r.datePrecision, SC.datePrecision), r.id + ' date');
  ok(inList(r.datePrecision, ['range', 'week', 'month', 'year']) === !!r.dateEndISO, r.id + ' dateEndISO present exactly for range, week, month, year');
  ok(!r.dateEndISO || r.dateEndISO >= r.dateISO, r.id + ' end on or after start');
  ok(inList(r.kind, SC.kinds), r.id + ' kind'); ok(r.title.length <= 120, r.id + ' title length');
  ok(!r.timeNote || !/day\s*\d/i.test(r.timeNote), r.id + ' no day number in timeNote');
  ok((typeof r.lat === 'number') === (typeof r.lng === 'number') && (typeof r.lat === 'number') === !!r.geoPrecision, r.id + ' lat, lng and geoPrecision together');
  ok(!r.geoPrecision || inList(r.geoPrecision, SC.geoPrecision), r.id + ' geoPrecision');
  ok(r.actors && r.actors.by.every(a => actorIds.has(a)) && r.actors.against.every(a => actorIds.has(a)), r.id + ' actors resolve');
  ok(!r.tier || inList(r.tier, SC.tier), r.id + ' tier'); ok(!r.significance || inList(r.significance, SC.significance), r.id + ' significance');
  ok(!r.needs || r.needs.every(n => inList(n, SC.needs)), r.id + ' needs');
  ok(inList(r.recordCheck.status, SC.recordCheck), r.id + ' recordCheck'); ok(Number.isInteger(r.rev), r.id + ' rev'); ok(typeof r.detail === 'object', r.id + ' detail');
  ok(r.entries.length >= 1 && r.entries.every((e, i) => e.n === i + 1), r.id + ' entries numbered from 1');
  r.entries.forEach(e => checkEntry(e, r, false));
  for (const c of r.checks || []) ok(inList(c.step, A.CONFIG.lookAgainDays) && T.isISO(c.dateISO) && Array.isArray(c.searched) && Array.isArray(c.found), r.id + ' check');
  for (const g of r.coverageGaps || []) ok(inList(g.reason, SC.gapReason), r.id + ' coverage gap');
  if (r.legacyId) ok(r.sourcesStatus && inList(r.sourcesStatus, SC.sourcesStatus) && r.detail.structuralDmg !== undefined && r.detail.humanCasualties !== undefined, r.id + ' migrated record fields');
}
for (const l of data.links) {
  ok(/^LK-\d{5}$/.test(l.id), l.id + ' id'); noNulls(l, l.id);
  ok(inList(l.category, SC.linkCategory) && inList(l.direction, SC.direction), l.id + ' category and direction');
  ok(actorIds.has(l.from) && actorIds.has(l.to), l.id + ' participants resolve'); ok(l.theaters.every(t => theaterIds.has(t)), l.id + ' theaters');
  ok(T.isISO(l.dateStartISO) && l.entries.length >= 1, l.id + ' dates and entries'); ok(l.lat === undefined && l.lng === undefined, l.id + ' carries no coordinates');
  l.entries.forEach(e => checkEntry(e, l, true));
}
for (const w of [...data.watch.combat, ...data.watch.rhetoric]) {
  ok(/^WL-\d{5}$/.test(w.id), w.id + ' id'); ok(typeof w.definition === 'string' && w.definition.length > 20, w.id + ' definition');
  ok(inList(w.status, w.track === 'combat' ? SC.combatStatus : SC.rhetoricStatus), w.id + ' status is on its own track’s scale');
  for (const h of w.history) for (const id of h.evidence.events) ok(!!data.eventsById[id], w.id + ' evidence resolves');
}
ok(!data.watch.combat.some(w => data.watch.rhetoric.some(r => r.status === w.status)), 'the two tracks share no status value');

/* ---- 2. charter test ----------------------------------------------------------------------------- */
group('2. Charter test (ARCHITECTURE 7.4 E0)');
const hits = A.charterScan({ events: data.events, links: data.links, watch: data.watch, actors: data.actors, outlets: data.outlets, theaters: data.theaters });
ok(hits.length === 0, 'charter scan hits: ' + hits.join('; '));
const mutant = JSON.parse(JSON.stringify(data.events[0])); mutant.claimStatus = 'confirmed';
ok(A.charterScan(mutant).length > 0, 'mutation test: claimStatus "confirmed" must be rejected');

/* ---- 3. the prototype copy equals the reference --------------------------------------------------- */
group('3. Prototype attribution.js equals the reference, every record, every date');
const dates = new Set([today]);
for (const r of data.events) { for (const e of r.entries) { dates.add(e.published); dates.add(T.add(e.published, -1)); } for (const c of r.checks || []) dates.add(c.dateISO); }
for (const l of data.links) for (const e of l.entries) { dates.add(e.published); dates.add(T.add(e.published, 181)); }
let compared = 0;
for (const rule of ['ends', 'any-two', 'all-involved']) {
  const cfgA = Object.assign({}, A.CONFIG, { solidRule: rule }), cfgR = Object.assign({}, REF.CONFIG, { solidRule: rule });
  for (const dt of dates) {
    for (const r of data.events) { compared++; if (JSON.stringify(A.deriveEvent(r, dt, data.reg, cfgA)) !== JSON.stringify(REF.deriveEvent(r, dt, data.reg, cfgR))) ok(false, r.id + ' differs from the reference on ' + dt); }
    for (const l of data.links) { compared++; if (JSON.stringify(A.deriveLink(l, dt, data.reg, cfgA)) !== JSON.stringify(REF.deriveLink(l, dt, data.reg, cfgR))) ok(false, l.id + ' differs from the reference on ' + dt); }
  }
}
ok(compared > 0, 'compared'); console.log('  ' + compared + ' derivations compared');

/* ---- 4. stored positions, watch items -------------------------------------------------------------- */
group('4. Stored positions equal derived ones; watch items pass the reference validator');
for (const r of data.events) {
  const st = A.deriveEvent(r, today, data.reg);
  if (r.legacyId) continue;
  if (st.known && st.position) ok(st.position.lat === r.lat && st.position.lng === r.lng, r.id + ' stored lat/lng differ from the derived position (' + st.position.lat + ', ' + st.position.lng + ')');
  else if (st.known && st.look !== 'no-account') ok(r.lat === undefined, r.id + ' has coordinates but no entry states a place');
}
for (const w of data.watch.combat) { const errs = REF.validateWatch(w, data.eventsById, data.reg, today); ok(errs.length === 0, w.id + ': ' + errs.join('; ')); }

/* ---- 5. themes ------------------------------------------------------------------------------------ */
group('5. Theme files are the reference files and pass the validator');
for (const id of ['classic', 'ops', 'paper']) {
  const a = fs.readFileSync(path.join(P, 'themes', id + '.json')), b = fs.readFileSync(path.join(REPO, 'research/v2-theme-check/themes', id + '.json'));
  ok(a.equals(b), id + '.json is not byte-identical to the reference file');
  const t = JSON.parse(a), mine = WM.themeCheck.check(t), ref = REFTHEME.check(t);
  ok(mine.err.length === 0 && mine.rows.length === 86, id + ' passes 86 checks (' + mine.rows.length + ' rows, ' + mine.err.length + ' errors)');
  ok(JSON.stringify(mine) === JSON.stringify(ref), id + ': prototype validator and reference validator agree');
}
const base = JSON.parse(fs.readFileSync(path.join(P, 'themes/ops.json')));
const bad = (name, fn) => { const t = JSON.parse(JSON.stringify(base)); fn(t); ok(WM.themeCheck.check(t).err.length > 0, 'rejection case accepted: ' + name); };
bad('unknown key', t => { t.extra = 1; });
bad('markup in name', t => { t.name = '<b>x</b>'; });
bad('url() as a colour', t => { t.colors['bg-base'] = 'url(https://example.org/x)'; });
bad('web address as a font', t => { t.fonts.display = 'https://example.org/font.woff2'; });
bad('out-of-range number', t => { t.panelOpacity = 0.5; });
bad('low-contrast text', t => { t.colors['text-muted'] = '#223344'; });
bad('two theater colours alike', t => { t.colors['theater-ru'] = t.colors['theater-iran']; });

/* ---- 6. word check --------------------------------------------------------------------------------- */
group('6. No generated or fixed string grades truth (LAYOUT spec check 17)');
const WORDS = ['confirmed', 'unconfirmed', 'verified', 'unverified', 'documented', 'credible', 'credibility', 'reliable', 'reliability', 'debunked', 'confidence', 'disinformation', 'misinformation', 'fake', 'probable', 'likely', 'alleged', 'proven', 'disproven', 'merger', 'merged', 'accurate'];
const TRUE_FALSE = ['true', 'false'];
const wordsIn = (s, list) => (String(s).toLowerCase().match(/[a-z]+/g) || []).filter(w => list.includes(w));
const sel = WM.createSelectors(data);
const state0 = { theaters: ['iran-war', 'russia-ukraine'], time: { cursor: today, mode: 'all', window: { fromISO: today, toISO: today }, record: 'today' }, lens: { mode: 'all', parties: [] },
  show: { onRecord: true, fog: true, contestedOnly: false }, options: { solidRule: 'ends', legacyLook: 'A' }, linkFilter: { category: 'all', spoken: 'all', bothOnly: false } };
const generated = [];
for (const dt of dates) for (const r of data.events) { const st = sel.stateOf(r, dt, state0); if (st.known && st.statusLine) generated.push(st.statusLine); }
for (const dt of [today, T.add(today, -8), T.add(today, -13)]) { const w = sel.watchAsOf(Object.assign({}, state0, { time: Object.assign({}, state0.time, { cursor: dt }) })); for (const c of w.combat) generated.push(c.names); }
for (const row of sel.visibleEvents(state0).rows) generated.push(sel.sentence(row));
for (const s of generated) { const w = wordsIn(s, [...WORDS, ...TRUE_FALSE]); ok(!w.length, 'generated string uses "' + w.join(', ') + '": ' + s); }
console.log('  ' + generated.length + ' generated strings scanned');
if (WM.strings) {
  const flat = []; const walk = (v, p) => { if (typeof v === 'string') flat.push([p, v]); else if (Array.isArray(v)) v.forEach((x, i) => walk(x, p + '[' + i + ']')); else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, p + '.' + k); };
  walk(WM.strings, 'strings');
  // The design documents fix some sentences that use "true" to say what the marks do NOT mean ("not what is true").
  // Those are allowed only inside the keys listed in strings.fixedWording; see REVIEW notes for the document conflict.
  for (const [p, s] of flat) {
    const w = wordsIn(s, WORDS); ok(!w.length, p + ' uses "' + w.join(', ') + '"');
    const tf = wordsIn(s, TRUE_FALSE); ok(!tf.length || /^strings\.(fixed|help|tour)/.test(p), p + ' uses "' + tf.join(', ') + '" outside the fixed wording');
  }
  console.log('  ' + flat.length + ' interface strings scanned');
}
for (const id of ['classic', 'ops', 'paper']) ok(!wordsIn(JSON.parse(fs.readFileSync(path.join(P, 'themes', id + '.json'))).name, [...WORDS, ...TRUE_FALSE]).length, id + ' theme name');

/* ---- 7. the cases the prompt asks for -------------------------------------------------------------- */
group('7. The sample exercises every case');
const looksToday = {}, D = r => A.deriveEvent(r, today, data.reg);
for (const r of data.events) { const s = D(r); looksToday[s.look] = (looksToday[s.look] || 0) + 1; }
for (const look of ['ghost', 'solid', 'split', 'faded', 'unattributed', 'no-account']) ok(looksToday[look] > 0, 'no record is "' + look + '" today');
ok(data.events.some(r => D(r).altPositions && D(r).altPositions.length), 'no record has an alternate place (two sides, different locations)');
ok(data.events.some(r => D(r).targets && D(r).targets.length >= 2), 'no multi-target statement');
ok(data.events.some(r => { const a = D(r), b = A.deriveEvent(r, r.entries[0].published, data.reg); return a.look === 'solid' && b.look === 'ghost' && a.position && b.position && a.position.lat !== b.position.lat; }), 'no record both solidifies and moves as entries arrive');
ok(data.events.some(r => r.entries.some(e => e.supersedes != null && e.stance !== 'withdraws')), 'no superseded figure');
ok(data.events.some(r => r.theater.length > 1), 'no multi-theater event');
ok(data.events.some(r => typeof r.lat !== 'number'), 'no record without a stated place');
ok(data.events.some(r => r.tier === 'milestone' && D(r).look === 'ghost') && data.events.some(r => r.tier === 'milestone' && D(r).look === 'solid'), 'need a one-sided milestone and a solid one');
ok(data.events.some(r => (D(r).statusLine || '').includes('(state media)')), 'no record on file through state media only');
ok(data.events.some(r => r.entries.some(e => e.citing)), 'no outlet citing an unnamed official');
const linkStates = new Set(data.links.map(l => A.deriveLink(l, today, data.reg).state)); for (const s of ['ghost', 'solid', 'split']) ok(linkStates.has(s), 'no link is "' + s + '" today');
ok(data.links.some(l => A.deriveLink(l, today, data.reg).weightStep === 0), 'no dormant link');
ok(data.links.some(l => A.deriveLink(l, today, data.reg).weightStep !== A.deriveLink(l, T.add(today, -100), data.reg).weightStep), 'no link changes weight when time is scrubbed');
const ws = new Set(data.watch.combat.map(w => REF.watchStatus([...new Set(w.history.flatMap(h => h.evidence.events))], data.eventsById, today, data.reg))); for (const s of SC.combatStatus) ok(ws.has(s), 'no tripwire is "' + s + '" today');
ok(data.theaters.some(t => t.status === 'intake-only'), 'no theater without curated events');
// compare: the three cases of LAYOUT check 16 for Iran and Israel
const cmp = data.events.map(r => A.compareEvent(r, today, 'iran', 'israel', data.reg)).filter(Boolean).map(c => c.look);
for (const s of ['solid', 'split', 'ghost']) ok(cmp.includes(s) || s === 'solid', 'compare Iran | Israel has no "' + s + '" case');
ok(data.events.map(r => A.compareEvent(r, today, 'hezbollah', 'israel', data.reg)).filter(Boolean).some(c => c.look === 'solid'), 'compare Hezbollah | Israel has no "both say it" case');

if (process.argv.includes('--list')) {
  console.log('\nLooks today (' + today + '):');
  for (const r of data.events) { const s = D(r); console.log('  ' + r.id + '  ' + String(s.look).padEnd(13) + (s.statusLine || '')); }
  for (const l of data.links) { const s = A.deriveLink(l, today, data.reg); console.log('  ' + l.id + '  ' + s.state.padEnd(6) + ' weight ' + s.weightStep + '  affirmed ' + s.affirmedBy.join(',') + '  denied ' + s.deniedBy.join(',')); }
}
console.log('\n' + (fails ? 'CHECK FAILED: ' + fails + ' failed, ' : 'CHECK PASSED: ') + passes + ' passed');
process.exit(fails ? 1 : 0);
