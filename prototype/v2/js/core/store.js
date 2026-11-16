/* WARMAPS v2 PROTOTYPE — core/store.js
 * The only mutable state (ARCHITECTURE 9.1): get(), set(patch), subscribe(keys, fn). State is serialisable, so a
 * link can carry a view. Anything read from a link is validated against fixed choices before it is used.
 */
(function () {
'use strict';
const root = typeof window !== 'undefined' ? window : globalThis;
const WM = root.WM = root.WM || {};

function createStore(initial) {
  let state = initial;
  const subs = [];
  let queued = null;
  const flush = () => {
    const changed = queued; queued = null;
    for (const s of subs.slice()) if (!s.keys || s.keys.some(k => changed.has(k))) { try { s.fn(state, changed); } catch (e) { (WM.reportError || console.error)('store subscriber', e); } }
  };
  return {
    get: () => state,
    /* Shallow patch of top-level keys; nested objects are replaced by the caller ({ time: {...old, cursor} }). */
    set(patch) {
      const next = Object.assign({}, state); let any = false;
      queued = queued || new Set();
      for (const k of Object.keys(patch)) if (next[k] !== patch[k]) { next[k] = patch[k]; queued.add(k); any = true; }
      if (!any) { if (!queued.size) queued = null; return; }
      state = next;
      if (!this._batch) flush();
    },
    batch(fn) { this._batch = true; try { fn(); } finally { this._batch = false; if (queued && queued.size) flush(); else queued = null; } },
    subscribe(keys, fn) { const s = { keys, fn }; subs.push(s); return () => subs.splice(subs.indexOf(s), 1); }
  };
}

/* ---- a view link (#t=..&d=..&f=..&all=1&v=3d&lens=..&cmp=1&rec=then&fog=0&otr=0&con=1&sel=..&links=1) ----------
 * Carries what is shown (theaters, date, window, lens, record switches, view, selection). It never carries the
 * theme, the map style, the detail level or clean view (ARCHITECTURE 9.1). */
function toHash(s) {
  const p = [];
  p.push('t=' + s.theaters.join(','));
  p.push('d=' + s.time.cursor);
  if (s.time.mode === 'all') p.push('all=1'); else p.push('f=' + s.time.window.fromISO);
  if (s.viewMode === '3d') p.push('v=3d');
  if (s.lens.mode !== 'all') { p.push('lens=' + s.lens.parties.join(',')); if (s.lens.mode === 'compare') p.push('cmp=1'); }
  if (s.time.record === 'then') p.push('rec=then');
  if (!s.show.fog) p.push('fog=0');
  if (!s.show.onRecord) p.push('otr=0');
  if (s.show.contestedOnly) p.push('con=1');
  if (s.layersOn.links) p.push('links=1');
  if (s.selection) p.push('sel=' + s.selection.type + ':' + s.selection.id);
  return '#' + p.join('&');
}
/* Returns a patch built only from values that pass a fixed check; anything else in the link is ignored. */
function fromHash(hash, data, extent) {
  const q = {}; for (const kv of String(hash || '').replace(/^#/, '').split('&')) { const i = kv.indexOf('='); if (i > 0) q[kv.slice(0, i)] = decodeURIComponent(kv.slice(i + 1)); }
  const out = {}, T = WM.time;
  if (q.t) { const ids = q.t.split(',').filter(id => data.theatersById[id]); if (ids.length) out.theaters = ids; }
  const inExtent = s => T.isISO(s) && T.dc(s) >= T.dc(extent.fromISO) && T.dc(s) <= T.dc(extent.toISO);
  if (q.d && inExtent(q.d)) {
    out.time = { cursor: q.d };
    if (q.all === '1') out.time.mode = 'all';
    else if (q.f && inExtent(q.f) && T.dc(q.f) <= T.dc(q.d)) { out.time.mode = 'window'; out.time.window = { fromISO: q.f, toISO: q.d }; }
    if (q.rec === 'then') out.time.record = 'then';
  }
  if (q.v === '3d') out.viewMode = '3d';
  if (q.lens) {
    // a lens id is accepted only if it is a root party in the actor registry
    const ids = q.lens.split(',').filter(id => data.reg.actors[id] && !data.reg.actors[id].parent);
    if (ids.length) out.lens = { mode: q.cmp === '1' && ids.length === 2 ? 'compare' : 'parties', parties: ids.slice(0, 8) };
  }
  const show = {}; if (q.fog === '0') show.fog = false; if (q.otr === '0') show.onRecord = false; if (q.con === '1') show.contestedOnly = true;
  if (show.fog === false && show.onRecord === false) delete show.onRecord;   // both off is not allowed
  if (Object.keys(show).length) out.show = show;
  if (q.links === '1') out.links = true;
  if (q.sel) { const [type, id] = q.sel.split(':'); if ((type === 'event' && data.eventsById[id]) || (type === 'link' && data.linksById[id])) out.selection = { type, id }; }
  return out;
}

WM.createStore = createStore;
WM.viewLink = { toHash, fromHash };
})();
