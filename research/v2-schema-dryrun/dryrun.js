#!/usr/bin/env node
/* WARMAPS v2 schema DRY RUN (F1 step 1, 2026-11-11; re-run for ARCHITECTURE v1.2 on 2026-11-13). THROWAWAY EVIDENCE,
 * NOT THE SLICE-1 MIGRATION. Runs all v1 events through the schema in docs/v2/ARCHITECTURE_v1.md and reports what breaks.
 * v1.2 (editorial charter): no claim status, no origin, no stored fog flag. Each event becomes a record with one
 * dated entry whose claimant is not yet recorded. R1 fixes M2 (a)(b)(c) applied. The charter test runs on the output.
 * Reads:  warmaps-data.js, research/backfill-pass2/events_386-600_with_tiers_sources.json
 * Writes: research/v2-schema-dryrun/out/ (summary.json, uncertain-dates.json, sample-events.json)
 * No dependencies. Does not touch the live app. Usage: node research/v2-schema-dryrun/dryrun.js [repoDir]
 */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), zlib = require('zlib');
const repo = path.resolve(process.argv[2] || '.');
const ATTR = require('./attribution.js');
const outDir = path.join(repo, 'research/v2-schema-dryrun/out');
fs.mkdirSync(outDir, { recursive: true });

// ---------- load ----------
const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(repo, 'warmaps-data.js'), 'utf8'), ctx);
const D = ctx.window.WARMAPS_DATA, V1 = D.strikes;
const research = JSON.parse(fs.readFileSync(path.join(repo, 'research/backfill-pass2/events_386-600_with_tiers_sources.json'), 'utf8'));
const R = new Map(research.map(e => [e.id, e]));

// ---------- time (the proposed core/time.js rule: UTC day counts from ISO strings only) ----------
const MONTHS = { jan:0,january:0,feb:1,february:1,mar:2,march:2,apr:3,april:3,may:4,jun:5,june:5,jul:6,july:6,aug:7,august:7,sep:8,sept:8,september:8,oct:9,october:9,nov:10,november:10,dec:11,december:11 };
const iso = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
const dayCount = s => { const [y, m, d] = s.split('-').map(Number); return Date.UTC(y, m - 1, d) / 864e5; };
const validISO = s => /^\d{4}-\d{2}-\d{2}$/.test(s) && (() => { const [y, m, d] = s.split('-').map(Number); const t = new Date(Date.UTC(y, m - 1, d)); return t.getUTCMonth() === m - 1 && t.getUTCDate() === d; })();
const EPOCH = '2026-02-28';
const dayNumber = s => dayCount(s) - dayCount(EPOCH) + 1;

// v1's parseWarDay, re-implemented exactly but returning the ISO date it lands on (the parity oracle)
function v1StartISO(dateStr) {
  const full = String(dateStr);
  const cleaned = full.replace(/[–—]/g, '-').split('-')[0].trim().replace(/,\s*$/, '');
  let mon, day, year;
  let m = cleaned.match(/([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s*((?:19|20)\d{2})/);
  if (m) { mon = MONTHS[m[1].toLowerCase()]; day = +m[2]; year = +m[3]; }
  else {
    m = cleaned.match(/([A-Za-z]+)\s+(\d{1,2})\b/); if (!m) return null;
    mon = MONTHS[m[1].toLowerCase()]; day = +m[2];
    const ym = full.match(/\b((?:19|20)\d{2})\b/); year = ym ? +ym[1] : 2026;
  }
  if (mon === undefined || !(day >= 1 && day <= 31)) return null;
  const s = iso(year, mon, day); return validISO(s) ? s : null;
}

// v2 date rule under test
function parseDate(dateStr) {
  const s = String(dateStr).replace(/[–—]/g, '-').trim();
  const start = v1StartISO(dateStr);
  let mm;
  if (/^[A-Za-z]+ \d{1,2}, \d{4}$/.test(s)) return { dateISO: start, dateEndISO: null, datePrecision: 'day', certain: true };
  if ((mm = s.match(/^([A-Za-z]+) (\d{1,2})\s*-\s*(\d{1,2}), (\d{4})$/))) {           // "Mar 25-26, 2026"
    const end = iso(+mm[4], MONTHS[mm[1].toLowerCase()], +mm[3]);
    return { dateISO: start, dateEndISO: end, datePrecision: 'range', certain: validISO(end) && dayCount(end) > dayCount(start) };
  }
  if ((mm = s.match(/^([A-Za-z]+) (\d{1,2})\s*-\s*([A-Za-z]+) (\d{1,2}), (\d{4})$/))) { // "Feb 28 - Mar 1, 2026"
    const end = iso(+mm[5], MONTHS[mm[3].toLowerCase()], +mm[4]);
    return { dateISO: start, dateEndISO: end, datePrecision: 'range', certain: validISO(end) && dayCount(end) > dayCount(start) };
  }
  if (/^[A-Za-z]+ \d{1,2}\s*-\s*ongoing$/i.test(s))                                     // "Feb 28 - ongoing" (year inferred)
    return { dateISO: start, dateEndISO: null, datePrecision: 'ongoing-from', certain: false, why: 'year not stated; v1 infers 2026' };
  return { dateISO: start, dateEndISO: null, datePrecision: 'day', certain: false, why: 'annotated date; needs a human ruling' };
}

// ---------- mapping tables under test ----------
const LEGACY_KIND = { joint:'strike', isr:'strike', us:'strike', iran:'strike', hez:'strike', naval:'naval', radar:'air-defense',
  energy:'energy', airport:'infrastructure', launch:'deployment', platform:'deployment', intel:'intel', political:'political',
  prewar:'unclassified', global:'unclassified' };
const LEGACY_BY = { joint:['usa','israel'], isr:['israel'], us:['usa'], iran:['iran'], hez:['hezbollah'] };
const BY_RX = { usa:/\bUS\b|U\.S\.|United States|CENTCOM|USAF|USN|American/i, israel:/Israel|IDF|IAF|Mossad/i, iran:/Iran|IRGC|Artesh|Quds/i, hezbollah:/Hezbollah|Hizbullah|Hizballah/i };
const KINDS = ['strike','interception','ground','naval','air-defense','infrastructure','energy','shipping','cyber','intel','deployment','political','diplomatic','economic','humanitarian','statement','unclassified'];
const SIGNIF = ['world-changing','strategic','escalatory','tactical-pivot','infrastructure','political'];
const NONSTRIKE_RX = /ceasefire|talks|negotiat|statement|\bsays\b|announc|sanction|evacuat|deploy|arrest|protest|intercept|shot down|incursion|demolition|ground (op|offensive|forces)|blockade|seiz|summit|resolution|\bUN\b|warn|threat/i;

const isFogV1 = e => e.fogOfWar === true || /FOG OF WAR/i.test(e.misc || '');   // M2(a): case-insensitive (id 217 writes "Fog of war note:")
// M2(b): only text that speaks about the coordinates themselves; "approximately 92%" and "Houthi representatives" no longer match
const GEO_RX = /(coordinates?|location|position)\b[^.;]{0,60}?\b(approx|representative)|approx\.?\s*-?\d{1,3}(\.\d+)?\s*°?\s*[NS]\b|representative\s+(point|location|coordinates?|position)/i;
const padId = n => 'IR-' + String(n).padStart(5, '0');
const hostOf = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (_) { return null; } };

// v1.0 rule (compose "place: target" for bare place names) FAILED: 331 composed, 50 over 80 chars, longest 177.
// v1.1 rule under test: title = v1 `city` verbatim; a bare place name is flagged in needs[] for a later editorial title.
function title(e) { return { title: e.city, bare: !/ [—–-] /.test(e.city) }; }
const UNAMBIGUOUS_KIND = new Set(['naval', 'radar', 'energy', 'airport', 'launch', 'platform', 'political']);
// M2(c): a day number left mid-text means the note is dropped (7.1 default); the original stays in legacy.time
function timeNote(tm) { if (!tm) return null; const r = String(tm).replace(/^Days? -?\d+(\s*-\s*-?\d+)?\s*([—–\/-]\s*)?/, '').trim(); return r && !/Day -?\d/.test(r) ? r : null; }
const prune = o => { if (Array.isArray(o)) return o.map(prune); if (o && typeof o === 'object') { const r = {}; for (const [k, v] of Object.entries(o)) { if (v === null || v === undefined) continue; const pv = prune(v); if (pv && typeof pv === 'object' && !Array.isArray(pv) && !Object.keys(pv).length) continue; r[k] = pv; } return r; } return o; };

function migrate(e) {
  const r = R.get(e.id), d = parseDate(e.date), t = title(e);
  const fog = isFogV1(e) || !!(r && r.fog);
  // sources: research urls > urls found in misc/evidenceUrl > publisher names in `source` / "Source:" tails
  const sources = [];
  const urls = new Set();
  if (r && Array.isArray(r.sources)) r.sources.forEach(u => urls.add(u));
  ((e.misc || '').match(/https?:\/\/[^\s)\]]+/g) || []).forEach(u => urls.add(u.replace(/[.,;]+$/, '')));
  if (e.evidenceUrl) urls.add(e.evidenceUrl);
  urls.forEach(u => sources.push({ url: u, publisher: hostOf(u) }));   // no role: not yet sorted into original or carrier
  const names = [];
  if (e.source) e.source.split(/\s*[\/|]\s*/).forEach(n => n && names.push(n.trim()));
  const tail = (e.misc || '').match(/Source:\s*([^.]+)\./);
  if (tail) tail[1].split(/\s*[\/|]\s*/).forEach(n => n && names.push(n.trim()));
  if (!urls.size) names.forEach(n => sources.push({ publisher: n }));
  const sourcesStatus = urls.size ? 'listed' : names.length ? 'named-only' : 'legacy-unlisted';
  const ks = D.keyStrikeTiers[e.id];
  return {
    id: padId(e.id), legacyId: e.id, theater: ['iran-war'],
    dateISO: d.dateISO, dateEndISO: d.dateEndISO, datePrecision: d.datePrecision, timeNote: timeNote(e.time),
    kind: LEGACY_KIND[e.type] || null, legacyType: e.type,
    title: t.title, place: e.city.split(/ [—–-] /)[0], country: e.country,
    lat: e.lat, lng: e.lng, geoPrecision: GEO_RX.test((e.misc || '') + ' ' + e.city) ? 'representative' : 'unknown',
    actors: { by: [], against: [] }, attackerText: e.attacker,
    tier: r ? r.tier : null, significance: ks !== undefined ? SIGNIF[ks] : null,
    // one entry per migrated event: what was said is the v1 text; who said it and when it was published are not recorded
    entries: [{ n: 1, stance: 'claims', published: d.dateISO, sources }],
    sourcesStatus,
    // charter rule 5: whether the record was checked against its sources. Says nothing about the claim
    recordCheck: r ? { status: String(r.verified).toUpperCase() === 'FIX' ? 'corrected' : 'checked', pass: 'backfill-pass2', date: '2026-11-09' } : { status: 'none' },
    detail: { target: e.target ?? null, weapon: e.weapon ?? null, weaponCap: e.weaponCap ?? null, structuralDmg: e.structuralDmg, humanCasualties: e.humanCasualties, launchOrigin: e.launchOrigin ?? null, misc: e.misc ?? null },
    launch: e.originLat !== undefined ? { lat: e.originLat, lng: e.originLng, name: e.originName, precision: e.originKnown === 'approximate' ? 'approximate' : null } : null,   // v1 originKnown 'probable' grades truth: not carried
    // v1 values kept as an archive. NOT carried: v1 `verified` and `fogLean` grade truth; they stay in warmaps-data.js only
    legacy: { ...Object.fromEntries(['time','perspective','weaponType','intercepted','source'].filter(k => e[k] !== undefined).map(k => [k, e[k]])),
      ...(fog ? { fog: e.fogOfWar === true ? { status: e.fogStatus, note: e.fogNote, parties: e.fogSources, checkpoint: e.fogCheckpoint } : { marker: true } } : {}) },
    needs: [!UNAMBIGUOUS_KIND.has(e.type) && 'kind', t.bare && 'title', 'actors', 'claimant', 'published'].filter(Boolean),   // only fields whose migration default is not self-describing
    rev: 1,
    _dry: { dateCertain: d.certain, dateWhy: d.why || null, titleBare: t.bare, v1Fog: fog }
  };
}

// ---------- schema checker (ARCHITECTURE 3.2 as written, plus the changes this dry run forces) ----------
function check(x) {
  const errs = [];
  const req = (c, m) => { if (!c) errs.push(m); };
  req(/^[A-Z]{2}-\d{5}$/.test(x.id), 'id shape');
  req(Number.isInteger(x.legacyId), 'legacyId');
  req(Array.isArray(x.theater) && x.theater.length >= 1, 'theater');
  req(x.dateISO && validISO(x.dateISO), 'dateISO');
  req(x.dateEndISO === null || (validISO(x.dateEndISO) && dayCount(x.dateEndISO) >= dayCount(x.dateISO)), 'dateEndISO');
  req(['day','range','week','month','year','ongoing-from'].includes(x.datePrecision), 'datePrecision');
  req((x.datePrecision === 'range') === (x.dateEndISO !== null), 'range<->dateEndISO consistency');
  req(KINDS.includes(x.kind), 'kind enum (' + x.legacyType + ')');
  req(typeof x.title === 'string' && x.title.length > 0, 'title empty');
  req(x.title.length <= 120, 'title > 120 chars');
  req(Array.isArray(x.needs) && x.needs.every(n => ['kind','title','actors','claimant','published'].includes(n)), 'needs enum');
  req(!/Day -?\d/.test(x.timeNote || ''), 'day number in timeNote');   // M2(c): the check is now on
  req(typeof x.lat === 'number' && typeof x.lng === 'number' && Math.abs(x.lat) <= 90 && Math.abs(x.lng) <= 180, 'lat/lng');
  req(x.tier === null || ['milestone','major','standard'].includes(x.tier), 'tier');
  req(x.significance === null || SIGNIF.includes(x.significance), 'significance');
  req(Array.isArray(x.entries) && x.entries.length >= 1, 'no entry');
  x.entries.forEach((en, i) => {
    req(en.n === i + 1, 'entry numbers not 1..n');
    req(['claims','denies','acknowledges','withdraws'].includes(en.stance), 'entry stance');
    req(validISO(en.published) && dayCount(en.published) >= dayCount(x.dateISO), 'entry published missing or before the event');
    req(en.claimedBy || x.needs.includes('claimant'), 'entry without a claimant and claimant not in needs');
    req(en.sources.every(s => s.publisher && (!s.url || /^https?:\/\//.test(s.url))), 'source without publisher, or url not http(s) (M3)');
    req(en.sources.every(s => s.role || x.needs.includes('claimant')), 'unsorted source on an attributed entry');
  });
  req(x.entries[0].sources.length > 0 || x.sourcesStatus === 'legacy-unlisted', 'no sources and not marked legacy-unlisted');
  req(['checked','corrected','none'].includes(x.recordCheck.status), 'recordCheck.status');
  req(x.fog === undefined && x.claimStatus === undefined && x.origin === undefined && x.verification === undefined, 'a v1.1 field survived (fog, claimStatus, origin, verification)');
  req(ATTR.charterScan(x).length === 0, 'charter test: ' + ATTR.charterScan(x).join('; '));
  req(x.detail.structuralDmg !== undefined && x.detail.humanCasualties !== undefined, 'detail core');
  return errs;
}

// ---------- run ----------
const out = V1.map(migrate);
const S = {};
S.total = out.length;
S.idsUnique = new Set(out.map(x => x.id)).size === out.length;   // M1: unique and never reused; continuity is no longer a rule
S.idRoundTrip = out.every(x => parseInt(x.id.slice(3), 10) === x.legacyId);

// 1. date parity with v1 (every event must land on the same start day v1 uses)
S.dateNull = out.filter(x => !x.dateISO).map(x => x.id);
S.datePrecision = out.reduce((a, x) => (a[x.datePrecision] = (a[x.datePrecision] || 0) + 1, a), {});
const uncertain = out.filter(x => !x._dry.dateCertain).map(x => ({ id: x.id, v1date: V1[x.legacyId - 1] && V1.find(e => e.id === x.legacyId).date, parsedStart: x.dateISO, why: x._dry.dateWhy }));
S.dateUncertain = uncertain.length;
// cross-check start date against the "Day N" label carried in v1 `time`
const dayLabel = [];
for (const e of V1) {
  const m = String(e.time).match(/^Days? (-?\d+)/); if (!m) continue;
  const x = out[V1.indexOf(e)]; const dn = dayNumber(x.dateISO);
  if (dn !== +m[1]) dayLabel.push({ id: x.id, date: e.date, timeLabel: e.time, computedDay: dn });
}
S.dayLabelChecked = V1.filter(e => /^Days? -?\d+/.test(String(e.time))).length;
S.dayLabelMismatch = dayLabel.length;
// research file carries ISO dates for 386-600: independent check of the parser
S.researchDateMismatch = out.filter(x => R.has(x.legacyId) && R.get(x.legacyId).date !== x.dateISO).map(x => ({ id: x.id, parsed: x.dateISO, research: R.get(x.legacyId).date, v1: V1.find(e => e.id === x.legacyId).date }));

// 2. kinds and actors
S.kind = out.reduce((a, x) => (a[x.kind] = (a[x.kind] || 0) + 1, a), {});
S.kindUnmapped = out.filter(x => !x.kind).map(x => x.id + ':' + x.legacyType);
const who = V1.filter(e => LEGACY_BY[e.type]);
S.whoTypes = who.length;
S.whoTypeLooksNonStrike = who.filter(e => NONSTRIKE_RX.test(e.city + ' ' + (e.target || ''))).length;
S.whoTypeAttackerDisagrees = who.filter(e => !LEGACY_BY[e.type].some(a => BY_RX[a].test(e.attacker))).length;
S.whoTypeAttackerDisagreesSample = who.filter(e => !LEGACY_BY[e.type].some(a => BY_RX[a].test(e.attacker))).slice(0, 8).map(e => `${e.id} [${e.type}] attacker="${e.attacker.slice(0, 50)}"`);
S.standingPlatforms = V1.filter(e => e.type === 'launch' || e.type === 'platform').map(e => `${e.id} ${e.date} | ${e.city.slice(0, 40)}`);

// 3. fog and claim status
S.v1FogNote = { total: out.filter(x => x._dry.v1Fog).length, ids1to385: out.filter(x => x._dry.v1Fog && x.legacyId <= 385).length, ids386to600: out.filter(x => x._dry.v1Fog && x.legacyId > 385).length,
  structuredBlock: out.filter(x => x.legacy.fog && x.legacy.fog.note !== undefined).length,
  v1Text: V1.filter(e => /FOG OF WAR/i.test(e.misc || '')).length, v1TextWithColon: V1.filter(e => /FOG OF WAR:/.test(e.misc || '')).length,
  v1Field: V1.filter(e => e.fogOfWar === true).length, research: research.filter(e => e.fog).length,
  researchOnly: research.filter(e => e.fog && !isFogV1(V1.find(v => v.id === e.id))).map(e => e.id),
  dataOnly: V1.filter(e => e.id > 385 && isFogV1(e) && !(R.get(e.id) || {}).fog).map(e => e.id) };
// attribution under the charter: derived by the reference rules (attribution.js), never typed
const REG = { actors: {}, outlets: {} }, TODAY = '2026-11-13';
const derived = out.map(x => ATTR.deriveEvent(x, TODAY, REG));
S.entries = { total: out.reduce((n, x) => n + x.entries.length, 0), claimantRecorded: out.filter(x => x.entries.some(en => en.claimedBy)).length, publishedRecorded: out.filter(x => !x.needs.includes('published')).length };
S.look = derived.reduce((a, d) => (a[d.look] = (a[d.look] || 0) + 1, a), {});
S.placedBy = derived.reduce((a, d) => (a[d.position.placedBy] = (a[d.position.placedBy] || 0) + 1, a), {});
S.recordCheck = out.reduce((a, x) => (a[x.recordCheck.status] = (a[x.recordCheck.status] || 0) + 1, a), {});
S.charter = { hits: out.reduce((n, x) => n + ATTR.charterScan(x).length, 0), mutationRejected: ATTR.charterScan({ ...out[0], claimStatus: 'confirmed' }).length > 0,
  v1TruthGradesNotCarried: { verified: V1.filter(e => e.verified !== undefined).length, fogLean: V1.filter(e => e.fogLean !== undefined).length, originKnownProbable: V1.filter(e => e.originKnown === 'probable').length } };
S.tier = out.reduce((a, x) => (a[String(x.tier)] = (a[String(x.tier)] || 0) + 1, a), {});
S.significance = out.reduce((a, x) => (x.significance && (a[x.significance] = (a[x.significance] || 0) + 1), a), {});
S.keyStrikeIdsWithoutTier = D.keyStrikeIds.filter(id => D.keyStrikeTiers[id] === undefined);
S.tierKeysNotInKeyStrikeIds = Object.keys(D.keyStrikeTiers).map(Number).filter(id => !D.keyStrikeIds.includes(id));

// 4. sources
S.sourcesStatus = out.reduce((a, x) => (a[x.sourcesStatus] = (a[x.sourcesStatus] || 0) + 1, a), {});
S.sourceObjects = out.reduce((n, x) => n + x.entries[0].sources.length, 0);
S.sourceFieldsAvailable = { url: out.reduce((n, x) => n + x.entries[0].sources.filter(s => s.url).length, 0), published: 0, role: 0, access: 0 };
S.distinctHosts = new Set(out.flatMap(x => x.entries[0].sources.map(s => s.url && s.publisher)).filter(Boolean)).size;

// 5. titles, text, legacy
S.titleBarePlaceName = out.filter(x => x._dry.titleBare).length;
S.titleOver80 = out.filter(x => x.title.length > 80).length;
S.titleMax = Math.max(...out.map(x => x.title.length));
S.textPreserved = out.every((x, i) => { const e = V1[i]; return x.detail.misc === (e.misc ?? null) && x.detail.structuralDmg === e.structuralDmg && x.detail.humanCasualties === e.humanCasualties && x.attackerText === e.attacker; });
const mapped = new Set(['id','type','city','country','lat','lng','date','time','attacker','weapon','weaponCap','target','structuralDmg','humanCasualties','launchOrigin','misc','perspective','verified','source','originLat','originLng','originName','originKnown','weaponType','evidenceUrl','intercepted','fogOfWar','fogStatus','fogLean','fogNote','fogSources','fogCheckpoint']);
S.v1FieldsNotMapped = [...new Set(V1.flatMap(e => Object.keys(e)))].filter(k => !mapped.has(k));
S.countriesDistinct = new Set(V1.map(e => e.country)).size;
S.fogCheckpointShapes = [...new Set(V1.filter(e => e.fogCheckpoint !== undefined).map(e => typeof e.fogCheckpoint + ':' + String(e.fogCheckpoint).replace(/\d+/g, '9')))];

// 6. schema check
const failures = {}; let failed = 0;
out.forEach(x => { const errs = check(x); if (errs.length) { failed++; errs.forEach(m => (failures[m] = failures[m] || []).push(x.id)); } });
S.schemaFailedEvents = failed;
S.schemaFailures = Object.fromEntries(Object.entries(failures).map(([k, v]) => [k, { count: v.length, sample: v.slice(0, 5) }]));

// 7. files and sizes
S.needs = out.reduce((a, x) => (x.needs.forEach(n => a[n] = (a[n] || 0) + 1), a), {});
S.geoRepresentative = out.filter(x => x.geoPrecision === 'representative').length;
S.timeNote = { kept: out.filter(x => x.timeNote).length, dropped: out.filter(x => !x.timeNote).length, stillHasDayNumber: out.filter(x => /Day -?\d/.test(x.timeNote || '')).map(x => x.id + ':' + x.timeNote) };
const clean = out.map(({ _dry, ...x }) => prune(x));
const byYear = {}; clean.forEach(x => (byYear[x.dateISO.slice(0, 4)] = byYear[x.dateISO.slice(0, 4)] || []).push(x));
S.files = Object.fromEntries(Object.entries(byYear).map(([y, a]) => { const j = JSON.stringify({ schema: 'event/2', theater: 'iran-war', year: +y, events: a }); return [`events-${y}.json`, { events: a.length, bytes: j.length, gzip: zlib.gzipSync(j).length }]; }));
S.v1DataJsBytes = fs.statSync(path.join(repo, 'warmaps-data.js')).size;
S.v1DataJsGzip = zlib.gzipSync(fs.readFileSync(path.join(repo, 'warmaps-data.js'))).length;
// lean index (what the map and timeline need before any card is opened)
const idx = clean.map((x, i) => [x.id, x.dateISO, x.dateEndISO, x.datePrecision, x.lat, x.lng, x.kind, x.legacyType, x.tier, derived[i].look, derived[i].firstPublished, [], x.title]);
S.leanIndex = { bytes: JSON.stringify(idx).length, gzip: zlib.gzipSync(JSON.stringify(idx)).length };

fs.writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify(S, null, 1));
fs.writeFileSync(path.join(outDir, 'uncertain-dates.json'), JSON.stringify(uncertain, null, 1));
fs.writeFileSync(path.join(outDir, 'day-label-mismatches.json'), JSON.stringify(dayLabel, null, 1));
fs.writeFileSync(path.join(outDir, 'sample-events.json'), JSON.stringify([clean[0], clean[5], clean[36], clean[130], clean[256], clean[411], clean[539]], null, 1));
console.log(JSON.stringify(S, null, 1));
