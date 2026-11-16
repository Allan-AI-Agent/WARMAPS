/* WARMAPS v2 PROTOTYPE — core/selectors.js
 * Pure functions of store state and loaded data, thin wrappers over core/attribution.js (ARCHITECTURE 9.1).
 * The map, the globe, the lists, the cards and the timeline all call these, so they cannot disagree.
 * Nothing here reads the theme, the map style or the detail level (ARCHITECTURE 9.4.4, guard 1).
 */
(function () {
'use strict';
const root = typeof window !== 'undefined' ? window : globalThis;
const WM = root.WM = root.WM || {};

WM.createSelectors = function (data) {
  const A = WM.attribution, T = WM.time, reg = data.reg;
  const ISO_RE = /\b(\d{4}-\d{2}-\d{2})\b/g;
  const prettyDates = s => s.replace(ISO_RE, (m, x) => T.fmt(x));

  const recordDate = s => s.time.record === 'then' ? s.time.cursor : data.todayISO;
  const cfg = s => Object.assign({}, A.CONFIG, { solidRule: s.options.solidRule });
  const accountName = id => id.startsWith('outlet:') ? ((reg.outlets[id.slice(7)] || {}).name || id.slice(7)) : ((reg.actors[id] || {}).name || id);
  const byName = (a, b) => accountName(a).localeCompare(accountName(b));

  let axisKey = '', axisVal = null;
  function axis(s) {
    const key = s.theaters.join(',') + '|' + data.todayISO;
    if (key !== axisKey) {
      const act = s.theaters.map(id => data.theatersById[id]);
      const latest = data.events.reduce((m, e) => e.dateISO > m ? e.dateISO : m, data.todayISO);
      axisVal = T.buildAxis(act, latest > data.todayISO ? latest : data.todayISO); axisKey = key;
    }
    return axisVal;
  }
  const windowOf = s => s.time.mode === 'all' ? { fromISO: axis(s).fromISO, toISO: s.time.cursor } : s.time.window;

  /* The state of one record on date T, with decision 6 applied to records carried over from v1. */
  function stateOf(rec, date, s) {
    const st = A.deriveEvent(rec, date, reg, cfg(s));
    if (!st.known) return st;
    if (st.statusLine) st.statusLine = prettyDates(st.statusLine);
    if (st.attributed === false) {
      const opt = s.options.legacyLook;                       // decision 6: A = 127 ghosts + 473 plain, B = all ghosts, C = all plain
      st.look = opt === 'B' ? 'ghost' : opt === 'C' ? 'unattributed' : st.look;
      st.drawTier = st.look === 'ghost' ? 'standard' : (rec.tier || 'standard');
    }
    if (st.look === 'no-account') st.drawTier = 'standard';
    return st;
  }
  const isFog = look => look === 'ghost' || look === 'faded';

  function inWindow(rec, s) {
    if (!rec.theater.some(t => s.theaters.includes(t))) return false;
    const ax = axis(s), w = windowOf(s), [a, z] = T.interval(rec, ax.toISO), from = T.dc(w.fromISO), to = T.dc(w.toISO);
    if (z < T.dc(ax.fromISO)) return from <= T.dc(ax.fromISO);        // a backdrop event: shown when the window starts at the beginning
    return a <= to && z >= from;
  }
  function ageFactor(rec, s) {
    const w = windowOf(s), len = T.dc(w.toISO) - T.dc(w.fromISO) + 1;
    if (len <= 30) return 1;
    const [, z] = T.interval(rec, w.toISO), back = T.dc(w.toISO) - Math.min(z, T.dc(w.toISO));
    return back <= 30 ? 1 : back <= 180 ? 0.7 : 0.5;
  }

  /* Everything the stage and the Events list need: window, then lens, then the record layers. */
  function visibleEvents(s) {
    const date = recordDate(s), c = cfg(s), rows = [], hidden = { fog: 0, onRecord: 0, notContested: 0 };
    let inWin = 0, onFile = 0, hiddenAccounts = 0;
    const parties = s.lens.parties;
    for (const rec of data.events) {
      if (rec.withdrawn || !inWindow(rec, s)) continue;
      const st = stateOf(rec, date, s);
      if (!st.known) continue;
      inWin++;
      if (st.attributed) { const acc = [...st.sidesOnRecord, ...st.observers]; onFile += acc.length; hiddenAccounts += acc.filter(a => !parties.includes(a)).length; }
      const row = { id: rec.id, rec, st, look: st.look, drawTier: st.drawTier, theater: rec.theater[0], age: ageFactor(rec, s),
        onMap: !!st.position && st.look !== 'no-account', pos: st.position, list: st.look === 'no-account' ? 'no-account' : null };
      if (s.lens.mode === 'parties') {
        if (!st.attributed) continue;
        const li = A.lensEvent(rec, date, parties, reg, c); if (!li) continue;
        row.lens = li; row.list = li.list; row.onMap = li.onMap; row.pos = li.position;
      } else if (s.lens.mode === 'compare') {
        if (!st.attributed) continue;
        const cm = A.compareEvent(rec, date, parties[0], parties[1], reg, c); if (!cm) continue;
        row.cmp = cm; row.onMap = false; row.pos = null;
        const L = cm.left, R = cm.right, loc = x => x.state === 'says' && x.loc ? { lat: x.loc.lat, lng: x.loc.lng, place: x.loc.place } : null;
        if (cm.look === 'listed-only') row.list = 'denies';
        else {
          row.list = 'says';
          const la = loc(L), lb = loc(R);
          if (cm.look === 'split' && L.state === 'says' && R.state === 'says' && la && lb && !A.compatible(L.loc, R.loc, c)) row.cmpPlaces = { left: la, right: lb };
          row.pos = la || lb || null; row.onMap = !!row.pos;
        }
      }
      // record layers: they count sides heard and never pick a side
      if (st.look !== 'no-account') {
        if (s.show.contestedOnly) { if (st.look !== 'split') { hidden.notContested++; continue; } }
        else if (isFog(st.look) && !s.show.fog) { hidden.fog++; continue; }
        else if (!isFog(st.look) && !s.show.onRecord) { hidden.onRecord++; continue; }
      } else if (s.show.contestedOnly) continue;
      rows.push(row);
    }
    rows.sort((a, b) => a.rec.dateISO < b.rec.dateISO ? 1 : a.rec.dateISO > b.rec.dateISO ? -1 : a.id.localeCompare(b.id));
    return { rows, hidden, inWindow: inWin, lensSummary: { onFile, hidden: hiddenAccounts }, date, window: windowOf(s) };
  }

  /* The lens picker's rows: every root party in the registry, in alphabetical order, with its entries in view. */
  function partyCounts(s) {
    const date = recordDate(s), counts = {};
    for (const rec of data.events) {
      if (rec.withdrawn || !inWindow(rec, s)) continue;
      for (const e of A.inForce(rec.entries, date)) { const a = A.accountOf(e, reg); if (a && !a.id.startsWith('outlet:')) counts[a.id] = (counts[a.id] || 0) + 1; }
    }
    return data.actors.filter(a => !a.parent).map(a => ({ id: a.id, name: a.name, kind: a.kind, count: counts[a.id] || 0 })).sort((a, b) => a.name.localeCompare(b.name));
  }

  /* Links at the cursor date (ARCHITECTURE 4.1, 5.6), bundled by pair of actors, widest first, 12 at most. */
  function spokenOf(dl, link) {
    const parts = [A.rootOf(link.from, reg.actors).id, A.rootOf(link.to, reg.actors).id];
    if (dl.deniedBy.length) return 'denied';
    const n = parts.filter(p => dl.affirmedBy.includes(p)).length;
    return n === 2 ? 'both' : n === 1 ? 'one' : 'others';
  }
  function visibleLinks(s) {
    const date = s.time.cursor, c = cfg(s), items = [], f = s.linkFilter;
    for (const link of data.links) {
      if (!link.theaters.some(t => s.theaters.includes(t))) continue;
      const dl = A.deriveLink(link, date, reg, c); if (!dl.known) continue;
      const spoken = spokenOf(dl, link);
      items.push({ link, dl, spoken, hiddenByFilter: (f.category !== 'all' && link.category !== f.category) || (f.spoken !== 'all' && spoken !== f.spoken) || (f.bothOnly && spoken !== 'both') });
    }
    const shown = items.filter(i => !i.hiddenByFilter), bundles = {};
    for (const it of shown) {
      const a = A.rootOf(it.link.from, reg.actors), b = A.rootOf(it.link.to, reg.actors), key = [a.id, b.id].sort().join('~');
      (bundles[key] = bundles[key] || { key, items: [] }).items.push(it);
    }
    const arcs = Object.values(bundles).map(b => {
      const lead = b.items.slice().sort((x, y) => y.dl.weightStep - x.dl.weightStep || x.link.id.localeCompare(y.link.id))[0];
      const from = reg.actors[lead.link.from].anchor, to = reg.actors[lead.link.to].anchor;
      return { id: b.key, items: b.items, lead, count: b.items.length, weightStep: lead.dl.weightStep, lineState: lead.dl.state, category: lead.link.category,
        direction: lead.link.direction, from: { lat: from.lat, lng: from.lng, label: from.label }, to: { lat: to.lat, lng: to.lng, label: to.label } };
    }).sort((x, y) => y.weightStep - x.weightStep || x.id.localeCompare(y.id));
    return { items, arcs: arcs.slice(0, 12), bundles: arcs.length, total: items.length, date };
  }

  /* Watchlist as of the cursor date (ARCHITECTURE 4.2). The combat status is read off the cited events' looks. */
  function watchAsOf(s) {
    const date = s.time.cursor, c = cfg(s);
    const combat = data.watch.combat.map(item => {
      const ids = [...new Set(item.history.flatMap(h => h.evidence.events))];
      const status = A.watchStatus(ids, data.eventsById, date, reg, c);
      const claimed = new Map(), denied = new Set(), missing = new Set(), cited = [];
      for (const id of ids) {
        const rec = data.eventsById[id], st = stateOf(rec, date, s); if (!st.known || !st.attributed) continue;
        cited.push({ rec, st });
        for (const e of A.inForce(rec.entries, date)) {
          const a = A.accountOf(e, reg); if (!a) continue;
          if (e.stance === 'claims' || e.stance === 'acknowledges') { const names = claimed.get(a.id) || new Set(); for (const n of e.attributesTo || []) { const r = A.rootOf(n, reg.actors); if (r && r.id !== a.id) names.add(r.id); } claimed.set(a.id, names); }
          if (e.stance === 'denies') denied.add(a.id);
        }
        for (const m of st.missing || []) missing.add(m);
      }
      const names = [];
      if (claimed.size) names.push('Claimed by: ' + [...claimed.keys()].sort(byName).map(id => accountName(id) + (claimed.get(id).size ? ' (names ' + [...claimed.get(id)].sort(byName).map(accountName).join(', ') + ')' : '')).join(', '));
      if (denied.size) names.push('Denied by: ' + [...denied].sort(byName).map(accountName).join(', '));
      if (missing.size) names.push('No account from: ' + [...missing].sort(byName).map(accountName).join(', '));
      const look = status === 'both-ends' ? 'solid' : status === 'contested' ? 'split' : status === 'one-sided' ? (cited.every(x => x.st.look === 'faded') ? 'faded' : 'ghost') : null;
      return { item, status, look, names: names.join(' · '), cited, history: item.history.filter(h => h.dateISO <= date) };
    });
    const rc = data.watch.rhetoricConfig;
    const rhetoric = data.watch.rhetoric.map(item => {
      const ids = [...new Set(item.history.flatMap(h => h.evidence.events))], cited = [];
      for (const id of ids) { const rec = data.eventsById[id], st = stateOf(rec, date, s); if (st.known && T.dc(date) - T.dc(st.firstPublished) <= rc.windowDays) cited.push({ rec, st }); }
      let step = 0; rc.steps.forEach((x, i) => { if (cited.length >= x.min) step = i; });
      return { item, status: rc.steps[step].status, step, count: cited.length, cited, history: item.history.filter(h => h.dateISO <= date) };
    });
    const withClaim = combat.filter(x => x.status !== 'none-on-file').length;
    return { date, combat, rhetoric, headline: { n: withClaim, m: combat.length, bothEnds: combat.filter(x => x.status === 'both-ends').length, denied: combat.filter(x => x.status === 'contested').length } };
  }

  /* Who an entry is by, as the card says it. */
  function claimantLabel(entry) {
    const c = entry.claimedBy; if (!c) return 'Claimant not recorded';
    if (c.actor) { const a = reg.actors[c.actor]; return a ? a.name : c.actor; }
    const o = reg.outlets[c.outlet]; let s = o ? o.name : c.outlet;
    if (o && (o.ownership === 'state' || o.ownership === 'party')) s += ', ' + (o.ownership === 'state' ? 'state media' : 'party media');
    if (entry.citing) s += ', citing ' + entry.citing;
    return s;
  }
  function placedBy(rec, st) {
    const p = st.position; if (!p) return 'No place stated';
    if (p.placedBy === 'warmaps') return 'Placed by WARMAPS from the place name';
    const n = Number(String(p.placedBy).split('#')[1]), e = rec.entries.find(x => x.n === n);
    return 'Placed by ' + (e ? claimantLabel(e).split(',')[0] : 'an entry') + ', ' + T.fmt(p.placedOn);
  }
  const LOOK_WORDS = { ghost: 'One side on record', solid: 'The sides on record agree it happened', split: 'Contested', faded: 'Unresolved after our last check', unattributed: 'Not yet attributed', 'no-account': 'No account in force' };
  function sentence(row) {
    const r = row.rec, st = row.st;
    return [T.fmt(r.dateISO) + ', ' + r.place + ', ' + r.country, r.title, LOOK_WORDS[st.look] + (st.statusLine ? '. ' + st.statusLine : ''), r.tier ? r.tier[0].toUpperCase() + r.tier.slice(1) : 'Not rated'].join('. ') + '.';
  }

  return { recordDate, cfg, axis, windowOf, stateOf, isFog, inWindow, visibleEvents, partyCounts, visibleLinks, spokenOf, watchAsOf, accountName, claimantLabel, placedBy, sentence, LOOK_WORDS, prettyDates };
};
})();
