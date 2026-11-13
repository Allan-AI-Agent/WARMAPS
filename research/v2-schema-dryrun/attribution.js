/* WARMAPS v2 attribution derivation: REFERENCE IMPLEMENTATION (F1b-1, 2026-11-13). THROWAWAY EVIDENCE.
 * Implements docs/v2/ARCHITECTURE_v1.md v1.2 section 3.4 (events), 4.1 (links), 4.2 (watchlist) and 7.4 E0 (charter test) from
 * the rule text, so the rules are known to be complete enough for two builders to get the same result.
 * Slice 1 writes the real module (v2/app/core/attribution.js); this file is its acceptance oracle.
 * Charter: nothing here grades truth. Every output says who has spoken, who has not, and whether they agree.
 * No dependencies.
 */
'use strict';
const dc = s => { const [y, m, d] = s.split('-').map(Number); return Date.UTC(y, m - 1, d) / 864e5; };

const CONFIG = {
  solidRule: 'ends',              // 'ends' (proposal A) | 'any-two' (B) | 'all-involved' (C). Decision 9
  splitOnAttribution: true,       // a dispute over who did it also splits the marker
  lookAgainDays: [1, 3, 7, 30],   // provisional ruling 3
  precisionKm: { site: 2, city: 25, region: 200 },   // 'representative' never conflicts
  linkWindowDays: 180
};
const SIDE_KINDS = new Set(['state', 'armed-group', 'alliance']);
const RANK = { site: 0, city: 1, region: 2, representative: 3 };
const AFFIRMS = new Set(['claims', 'acknowledges']);
// A denial rejects the whole account unless it names the parts it rejects (scope).
const deniesHappened = e => e.stance === 'denies' && (!e.scope || !e.scope.length || e.scope.includes('happened'));
const deniesPart = (e, part) => e.stance === 'denies' && (e.scope || []).includes(part);

function rootOf(id, actors) { let a = actors[id], guard = 0; while (a && a.parent && guard++ < 8) a = actors[a.parent]; return a || null; }

// Whose account an entry belongs to. null = claimant not recorded.
function accountOf(entry, reg) {
  const c = entry.claimedBy; if (!c) return null;
  if (c.actor) { const r = rootOf(c.actor, reg.actors); if (!r) return null; return { id: r.id, type: SIDE_KINDS.has(r.kind) ? 'side' : 'observer' }; }
  if (c.outlet) {
    const o = reg.outlets[c.outlet];
    if (o && o.actor && (o.ownership === 'state' || o.ownership === 'party')) { const r = rootOf(o.actor, reg.actors); if (r) return { id: r.id, type: 'side', viaMedia: c.outlet }; }
    return { id: 'outlet:' + c.outlet, type: 'observer' };   // independent, exile, advocacy: never a side
  }
  return null;
}

// Entries in force on date T: published on or before T, not removed by us, not superseded, not a withdrawal.
function inForce(entries, T) {
  const known = entries.filter(e => !e.withdrawn && dc(e.published) <= dc(T));
  const gone = new Set(known.filter(e => e.supersedes != null).map(e => e.supersedes));
  return known.filter(e => !gone.has(e.n) && e.stance !== 'withdraws');
}

function distKm(a, b) {
  const R = 6371, rad = x => x * Math.PI / 180, dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function compatible(a, b, cfg) {
  if (a.precision === 'representative' || b.precision === 'representative') return true;
  return distKm(a, b) <= Math.max(cfg.precisionKm[a.precision], cfg.precisionKm[b.precision]);
}
const byPublished = (a, b) => dc(a.published) - dc(b.published) || a.n - b.n;

function sidesOf(ids, reg) {
  const out = new Set();
  for (const id of ids || []) { const r = rootOf(id, reg.actors); if (r && SIDE_KINDS.has(r.kind)) out.add(r.id); }
  return out;
}

/* The state of one event record on date T. */
function deriveEvent(rec, T, reg, cfg = CONFIG) {
  if (rec.withdrawn) return { known: false, tombstone: true };
  const E = inForce(rec.entries, T).sort(byPublished);
  if (!E.length) {
    // nothing published yet on T: not known. Everything published has been withdrawn by its claimant: listed, not drawn
    const said = rec.entries.filter(e => !e.withdrawn && dc(e.published) <= dc(T));
    if (!said.length) return { known: false };
    const w = said.filter(e => e.stance === 'withdraws').sort(byPublished).pop();
    return { known: true, look: 'no-account', position: null, statusLine: 'No account in force: withdrawn by its claimant on ' + w.published };
  }
  const needs = new Set(rec.needs || []);
  const first = rec.entries.filter(e => !e.withdrawn).sort(byPublished)[0];
  const out = { known: true, firstPublished: first.published, entriesInForce: E.map(e => e.n) };

  // position (3.6)
  const cands = E.filter(e => AFFIRMS.has(e.stance) && e.locations && e.locations.length).map(e => ({ ...e.locations[0], n: e.n, published: e.published, acct: (accountOf(e, reg) || {}).id }));
  if (cands.length) {
    const anchor = cands[0];
    const ok = cands.filter(c => compatible(c, anchor, cfg)).sort((a, b) => RANK[a.precision] - RANK[b.precision] || byPublished(a, b));
    const m = ok[0];
    out.position = { lat: m.lat, lng: m.lng, place: m.place, precision: m.precision, placedBy: rec.id + '#' + m.n, placedOn: m.published };
    const alt = {};
    for (const c of cands.filter(c => !compatible(c, anchor, cfg)).sort((a, b) => RANK[a.precision] - RANK[b.precision] || byPublished(a, b))) if (c.acct && !alt[c.acct] && !ok.some(o => o.acct === c.acct)) alt[c.acct] = c;
    out.altPositions = Object.values(alt).map(c => ({ lat: c.lat, lng: c.lng, place: c.place, saidBy: c.acct, entry: rec.id + '#' + c.n }));
    const anchorEntry = E.find(e => e.n === anchor.n);
    out.targets = anchorEntry.locations.slice(1).map(l => ({ lat: l.lat, lng: l.lng, place: l.place }));
  } else if (typeof rec.lat === 'number') {
    out.position = { lat: rec.lat, lng: rec.lng, place: rec.place, precision: rec.geoPrecision, placedBy: 'warmaps' };
    out.altPositions = []; out.targets = [];
  } else { out.position = null; out.altPositions = []; out.targets = []; }

  // claimant not recorded (migrated v1 record): no sides can be named (3.5 rule 0)
  if (needs.has('claimant') || E.some(e => !accountOf(e, reg))) {
    out.look = rec.legacy && rec.legacy.fog ? 'ghost' : 'unattributed';
    out.attributed = false; out.sidesOnRecord = null; out.observers = null; out.missing = null;
    out.statusLine = 'Who said this is not yet recorded (carried over from v1)' + (rec.legacy && rec.legacy.fog ? ' · v1 fog note on the card' : '');
    return out;
  }
  out.attributed = true;

  const acct = E.map(e => ({ e, a: accountOf(e, reg) }));
  const sideIds = [...new Set(acct.filter(x => x.a.type === 'side').map(x => x.a.id))].sort();
  const obsIds = [...new Set(acct.filter(x => x.a.type === 'observer').map(x => x.a.id))].sort();
  const affirmSides = new Set(acct.filter(x => x.a.type === 'side' && AFFIRMS.has(x.e.stance)).map(x => x.a.id));
  const affirmAll = new Set(acct.filter(x => AFFIRMS.has(x.e.stance)).map(x => x.a.id));
  const denyIds = [...new Set(acct.filter(x => deniesHappened(x.e)).map(x => x.a.id))].sort();
  const attrDisputeIds = [...new Set(acct.filter(x => deniesPart(x.e, 'attribution')).map(x => x.a.id))].sort();

  const involvedKnown = !needs.has('actors');
  const by = involvedKnown ? sidesOf(rec.actors.by, reg) : null, against = involvedKnown ? sidesOf(rec.actors.against, reg) : null;
  const involved = involvedKnown ? [...new Set([...by, ...against])].sort() : null;
  const missing = involvedKnown ? involved.filter(s => !sideIds.includes(s)) : null;

  const contested = (denyIds.length > 0 && affirmAll.size > 0) || (cfg.splitOnAttribution && attrDisputeIds.length > 0 && affirmAll.size > 0);
  let solid = false;
  if (!contested) {
    if (cfg.solidRule === 'any-two') solid = affirmSides.size >= 2 || (involvedKnown && missing.length === 0 && affirmAll.size >= 1);
    else if (cfg.solidRule === 'all-involved') solid = involvedKnown && missing.length === 0 && affirmAll.size >= 1;
    else {  // 'ends': a side from each end the record names has affirmed it
      const ends = involvedKnown ? [by, against].filter(s => s.size) : null;
      solid = !!ends && affirmAll.size >= 1 && ends.every(end => [...end].some(s => affirmSides.has(s)));
    }
  }
  const lastStep = cfg.lookAgainDays[cfg.lookAgainDays.length - 1];
  const lastCheck = (rec.checks || []).filter(c => c.step === lastStep && dc(c.dateISO) <= dc(T)).sort((a, b) => dc(a.dateISO) - dc(b.dateISO)).pop();
  out.look = contested ? 'split' : solid ? 'solid' : lastCheck ? 'faded' : 'ghost';
  out.sidesOnRecord = sideIds; out.observers = obsIds; out.involved = involved; out.missing = missing;
  out.deniedBy = denyIds; out.attributionDisputedBy = attrDisputeIds;
  out.drawTier = (out.look === 'ghost' || out.look === 'faded') ? 'standard' : (rec.tier || 'standard');   // provisional ruling 2
  if (out.look === 'faded') out.unresolvedAsOf = lastCheck.dateISO;
  // look-again checks due on T and not yet done (only while one-sided)
  if (out.look === 'ghost') out.checksDue = cfg.lookAgainDays.filter(d => dc(out.firstPublished) + d <= dc(T) && !(rec.checks || []).some(c => c.step === d));

  // aspects (3.7)
  const aspects = [...new Set(E.filter(e => e.stance === 'denies').flatMap(e => e.scope || []))].filter(a => a !== 'attribution' && a !== 'happened').sort();
  const fig = {};
  for (const x of acct) for (const f of x.e.figures || []) { const k = f.what + (f.scope ? ' (' + f.scope + ')' : ''); (fig[k] = fig[k] || new Map()).set(x.a.id, f.value); }
  const figDiff = Object.keys(fig).filter(k => new Set(fig[k].values()).size > 1).sort();
  const sat = E.flatMap(e => (e.media || []).filter(m => m.kind === 'satellite-image'));
  out.disagreeOn = aspects; out.figuresDiffer = figDiff;
  out.imagery = { satellite: sat.length, publishers: [...new Set(sat.map(m => m.publisher))].sort() };

  // status line (3.7): fixed order, names in alphabetical order, no score
  const name = id => id.startsWith('outlet:') ? ((reg.outlets[id.slice(7)] || {}).name || id.slice(7)) : (reg.actors[id] || {}).name || id;
  const names = ids => ids.map(name).sort((a, b) => a.localeCompare(b)).join(', ');
  const viaMedia = id => acct.filter(x => x.a.id === id).every(x => x.a.viaMedia);
  const p = [];
  if (sideIds.length) p.push('On record: ' + sideIds.map(id => name(id) + (viaMedia(id) ? ' (state media)' : '')).sort((a, b) => a.localeCompare(b)).join(', '));
  if (obsIds.length) p.push('Also reporting: ' + names(obsIds));
  p.push(missing === null ? 'Missing: not yet established' : missing.length ? 'Missing: ' + names(missing) : null);
  if (out.look === 'split') p.push([denyIds.length ? 'Denied by ' + names(denyIds) : null, attrDisputeIds.length ? 'Who did it is disputed by ' + names(attrDisputeIds) : null].filter(Boolean).join('; '));
  else if (new Set(acct.map(x => x.a.id)).size > 1) p.push(['Agree it happened', aspects.length ? 'disagree on ' + aspects.join(', ') : null, figDiff.length ? 'figures differ on ' + figDiff.join(', ') : null].filter(Boolean).join('; '));
  if (sat.length) p.push('Satellite images: ' + sat.length + ' (published by ' + out.imagery.publishers.join(', ') + ')');
  if (out.look === 'faded') p.push('Unresolved: no account from ' + names(missing && missing.length ? missing : ['any other side']) + ' as of ' + lastCheck.dateISO);
  out.statusLine = p.filter(Boolean).join(' · ');
  return out;
}

/* Lens (3.8): one or more parties. Returns null when the record is not part of those parties' account. */
function lensEvent(rec, T, parties, reg, cfg = CONFIG) {
  const full = deriveEvent(rec, T, reg, cfg); if (!full.known || !full.attributed) return null;
  const mine = inForce(rec.entries, T).filter(e => { const a = accountOf(e, reg); return a && parties.includes(a.id); });
  if (!mine.length) return null;
  const sub = deriveEvent({ ...rec, entries: mine.map(e => ({ ...e, supersedes: undefined })), checks: [] }, T, reg, cfg);
  const affirms = mine.some(e => AFFIRMS.has(e.stance));
  return { look: full.look, list: affirms ? 'says' : 'denies', onMap: affirms && !!sub.position && sub.position.placedBy !== 'warmaps',
    position: affirms ? sub.position : null, entries: mine.map(e => e.n), hiddenAccounts: [...full.sidesOnRecord, ...full.observers].filter(id => !parties.includes(id)).length };
}

/* Compare two parties (3.8). */
function compareEvent(rec, T, a, b, reg, cfg = CONFIG) {
  const E = inForce(rec.entries, T).map(e => ({ e, id: (accountOf(e, reg) || {}).id }));
  const half = id => { const es = E.filter(x => x.id === id).map(x => x.e); if (!es.length) return { state: 'silent' };
    const aff = es.filter(e => AFFIRMS.has(e.stance)), loc = aff.filter(e => e.locations && e.locations.length).sort(byPublished)[0];
    return { state: aff.length ? 'says' : es.some(deniesHappened) ? 'denies' : 'disputes-part', disputesAttribution: es.some(e => deniesPart(e, 'attribution')), loc: loc ? loc.locations[0] : null }; };
  const A = half(a), B = half(b);
  if (A.state === 'silent' && B.state === 'silent') return null;
  let look;
  if (A.state === 'says' && B.state === 'says') {
    const locConflict = A.loc && B.loc && !compatible(A.loc, B.loc, cfg);
    look = (locConflict || A.disputesAttribution || B.disputesAttribution) ? 'split' : 'solid';
  } else if ((A.state === 'says' && B.state === 'denies') || (A.state === 'denies' && B.state === 'says')) look = 'split';
  else if ((A.state === 'says' && B.disputesAttribution) || (B.state === 'says' && A.disputesAttribution)) look = 'split';
  else if (A.state === 'says' || B.state === 'says') look = 'ghost';
  else look = 'listed-only';   // only denials between the two: nothing to draw
  return { look, left: A, right: B };
}

/* Link (4.1). */
function deriveLink(link, T, reg, cfg = CONFIG) {
  if (link.withdrawn) return { known: false, tombstone: true };
  if (dc(T) < dc(link.dateStartISO) || (link.dateEndISO && dc(T) > dc(link.dateEndISO))) return { known: false, outsideRange: true };
  const E = inForce(link.entries, T).map(e => ({ e, a: accountOf(e, reg) }));
  if (!E.length) return { known: false };
  const parts = [rootOf(link.from, reg.actors).id, rootOf(link.to, reg.actors).id];
  const aff = E.filter(x => AFFIRMS.has(x.e.stance)), den = E.filter(x => x.e.stance === 'denies');   // any denial, whole or part, splits a link
  const ids = xs => [...new Set(xs.map(x => x.a.id))].sort();
  const affIds = ids(aff), denIds = ids(den);
  const state = den.length && aff.length ? 'split' : parts.every(p => affIds.includes(p)) ? 'solid' : 'ghost';
  const c = dc(T), inWin = x => dc(x.e.published) <= c && (x.e.standing ? (x.e.standingUntil ? dc(x.e.standingUntil) >= c - cfg.linkWindowDays : true) : dc(x.e.published) >= c - cfg.linkWindowDays);
  const voices = new Set(aff.filter(inWin).map(x => x.a.id)).size;
  return { known: true, state, affirmedBy: affIds, acknowledgedBy: affIds.filter(i => parts.includes(i)), deniedBy: denIds,
    noStatementFrom: parts.filter(p => !ids(E).includes(p)), voicesInWindow: voices,
    weightStep: voices === 0 ? 0 : voices >= 6 ? 4 : voices >= 4 ? 3 : voices >= 2 ? 2 : 1 };
}

/* Watch item, combat track (4.2): the status is read off the cited events' looks. No verdict. */
const COMBAT_KINDS = ['strike', 'interception', 'ground', 'naval', 'air-defense'];
function watchStatus(eventIds, events, T, reg, cfg = CONFIG) {
  const ds = eventIds.map(id => deriveEvent(events[id], T, reg, cfg)).filter(d => d.known);
  if (!ds.length) return 'none-on-file';
  if (ds.some(d => d.look === 'solid')) return 'both-ends';
  if (ds.some(d => d.look === 'split')) return 'contested';
  return 'one-sided';
}
function validateWatch(w, events, reg, today, cfg = CONFIG) {
  const errs = [], scale = w.track === 'combat' ? ['none-on-file', 'one-sided', 'contested', 'both-ends'] : null;
  if (!scale) return ['unknown track'];
  w.history.forEach((h, i) => {
    if (!scale.includes(h.status)) errs.push('status "' + h.status + '" is not on the combat scale');
    if (i && dc(h.dateISO) < dc(w.history[i - 1].dateISO)) errs.push('history out of date order');
    for (const id of h.evidence.events) {
      const ev = events[id]; if (!ev) { errs.push('event does not resolve'); continue; }
      const n = new Set(ev.needs || []);
      if (n.has('kind') || n.has('actors') || n.has('claimant')) errs.push('cited event still has kind, actors or claimant in needs');
      if (!COMBAT_KINDS.includes(ev.kind)) errs.push('cited event is not a combat kind');
      if (w.requires && w.requires.by && !ev.actors.by.some(a => w.requires.by.includes(rootOf(a, reg.actors).id))) errs.push('cited event does not name the required actor');
    }
    if ((h.evidence.links || []).length && !h.evidence.events.length && h.status !== 'none-on-file') errs.push('a link alone cannot move a combat tripwire');
    if (h.status !== watchStatus(h.evidence.events, events, h.dateISO, reg, cfg)) errs.push('status does not equal the derivation on ' + h.dateISO);
    const snap = JSON.stringify((h.reliedOn || []).map(r => [r.ref, r.look])), now = JSON.stringify(h.evidence.events.map(id => [id, deriveEvent(events[id], h.dateISO, reg, cfg).look]));
    if (snap !== now) errs.push('reliedOn does not record what the entry relied on');
  });
  const last = w.history[w.history.length - 1];
  if (w.status !== last.status) errs.push('status does not equal the latest history entry');
  if (watchStatus(last.evidence.events, events, today, reg, cfg) !== last.status) errs.push('stale: a cited record has changed; add a history entry');
  return errs;
}

/* Charter test (7.4 E0): no field name or closed-list value grades truth. Free text is not scanned. */
const TRUTH_WORDS = ['confirmed', 'verified', 'documented', 'credible', 'credibility', 'reliable', 'reliability', 'debunked', 'confidence', 'true', 'false', 'disinformation', 'misinformation', 'fake', 'probable', 'likely', 'alleged'];
const FREE_TEXT = new Set(['title', 'text', 'note', 'place', 'country', 'attackerText', 'timeNote', 'summary', 'definition', 'publisher', 'url', 'reason', 'name', 'long', 'label', 'covers', 'citing', 'quote']);
function charterScan(obj, path = '') {
  const hits = [];
  const walk = (v, p, key) => {
    if (Array.isArray(v)) return v.forEach((x, i) => walk(x, p + '[' + i + ']', key));
    if (v && typeof v === 'object') { for (const [k, x] of Object.entries(v)) {
      if (k === 'detail') continue;                                     // v1 descriptive text, byte-identical, quoted
      if (TRUTH_WORDS.includes(k.toLowerCase())) hits.push(p + '.' + k + ' (field name)');
      if (/status$/i.test(k) && /^(claim|truth)/i.test(k)) hits.push(p + '.' + k + ' (field name)');
      walk(x, p + '.' + k, k); } return; }
    if (typeof v === 'boolean' && key && /^(is)?(true|real|genuine|accurate)$/i.test(key)) hits.push(p + ' (verdict flag)');
    if (typeof v === 'string' && key && !FREE_TEXT.has(key) && TRUTH_WORDS.includes(v.toLowerCase())) hits.push(p + ' = "' + v + '" (value)');
  };
  walk(obj, path, null);
  return hits;
}

module.exports = { CONFIG, dc, accountOf, inForce, deriveEvent, lensEvent, compareEvent, deriveLink, watchStatus, validateWatch, charterScan, compatible, distKm, rootOf };
