/* WARMAPS v2 PROTOTYPE — app.js
 * Boot and wiring. One store, pure selectors, and a renderer that draws what it is given: the 2D map and the
 * globe replay the same store state, so the lens, the record layers and "As known then" behave the same in both.
 * THROWAWAY: this proves the design documents; it is not the start of the app.
 */
(function () {
'use strict';
const WM = window.WM;
const { $, toast, store: disk, guard } = WM.dom, T = WM.time, STR = WM.strings;
const K_PREFS = 'wm2proto.prefs.v1';
const qs = new URLSearchParams(location.search);
const app = WM.app = { view: null };
let cache = { key: null, rows: null, lkey: null, links: null }, hashTimer = 0, offered = {}, viewBusy = false, otherView = '2d', previewBackup = null;
const S = () => app.store.get();

/* ---- derived data, cached per store state ------------------------------------------------------------------ */
app.rows = function () { const s = S(), key = [s.time, s.theaters, s.lens, s.show, s.options]; if (!cache.key || key.some((k, i) => k !== cache.key[i])) { cache.key = key; cache.rows = app.sel.visibleEvents(s); } return cache.rows; };
app.links = function () { const s = S(), key = [s.time, s.theaters, s.linkFilter, s.options]; if (!cache.lkey || key.some((k, i) => k !== cache.lkey[i])) { cache.lkey = key; cache.links = app.sel.visibleLinks(s); } return cache.links; };

/* ---- what the renderer is given (ARCHITECTURE 9.2) ------------------------------------------------------------ */
function marksFrom(v) {
  const out = [];
  for (const r of v.rows) {
    if (!r.onMap || !r.pos) continue;
    const m = { id: r.id, lat: r.pos.lat, lng: r.pos.lng, theater: r.theater, drawTier: r.drawTier || 'standard', look: r.look, age: r.age, title: r.rec.title, label: r.rec.title.replace(/^Sample( milestone)?: /, ''), milestone: r.rec.tier === 'milestone' };
    if (r.cmp) {
      const L = r.cmp.left, R = r.cmp.right, other = (x, y) => x.state === 'says' ? ((y.state === 'says' && x.disputesAttribution && !y.disputesAttribution) ? 'slash' : 'fill') : (x.state === 'denies' || x.disputesAttribution) && y.state === 'says' ? 'slash' : 'none';
      let l = other(L, R), rt = other(R, L);
      if (r.cmp.look === 'ghost') { l = L.state === 'says' ? 'outline' : 'none'; rt = R.state === 'says' ? 'outline' : 'none'; }
      const pl = r.cmpPlaces ? r.cmpPlaces.left : r.pos, pr = r.cmpPlaces ? r.cmpPlaces.right : r.pos;
      m.halves = { left: { state: l, lat: pl.lat, lng: pl.lng }, right: { state: rt, lat: pr.lat, lng: pr.lng } };
    }
    out.push(m);
  }
  return out;
}
function theaterConfigs(s) {
  return s.theaters.map(id => { const t = app.data.theatersById[id];
    return Object.assign({}, t, { tab: t.label + ' · ' + (t.status === 'intake-only' ? STR.empty.theater : t.dayLabel + ' ' + T.dayNumber(t, s.time.cursor).toLocaleString('en-US')) }); });
}
function viewOptions(s) { return { phone: WM.layout.isPhone(s.layout.cls), labels: !(s.layout.cls === 'phone-landscape' && s.viewMode === '3d'), haloAll: s.options.haloAll, badgeCount: s.options.badgeCount, animate: s.time.record === 'then' && !!s.time.playing }; }
function selectedArcRef(s) {
  const sel = s.selection; if (!sel) return null;
  if (sel.type === 'link') { const a = app.links().arcs.find(x => x.items.some(i => i.link.id === sel.id)); return a ? { type: 'link', id: a.id } : null; }
  if (sel.type === 'group' && sel.kind === 'links') { const a = app.links().arcs.find(x => x.items.some(i => i.link.id === sel.ids[0])); return a ? { type: 'link', id: a.id } : null; }
  return sel.type === 'group' ? null : sel;
}
const syncView = guard('the map', function (changed) {
  const v = app.view, s = S(); if (!v || viewBusy) return;
  const all = !changed, has = k => all || changed.has(k);
  if (has('theaters') || has('time') || has('layersOn')) v.setTheaters(theaterConfigs(s), s.theaters.length > 1 ? 'multi' : 'single');
  if (has('selection')) v.select(selectedArcRef(s));
  if (has('time') || has('theaters') || has('lens') || has('show') || has('options') || has('layout') || has('selection') || has('viewMode')) v.setEvents(marksFrom(app.rows()), viewOptions(s));
  if (has('time') || has('theaters') || has('layersOn') || has('linkFilter') || has('options') || has('selection')) v.setLinks(s.layersOn.links ? app.links().arcs.map(a => Object.assign({ title: a.count > 1 ? a.count + ' links' : a.lead.link.title }, a)) : []);
  if ((has('layersOn') || has('theaters') || has('detailLevel')) && v.setOrigins) v.setOrigins(s.layersOn.origins ? app.data.launchSites.filter(x => s.theaters.includes(x.theater)).map(x => Object.assign({ by: (app.data.reg.actors[x.namedBy] || {}).name || x.namedBy }, x)) : [], { bold: s.detailLevel.level !== 'lite' });
  if (has('time') || has('layersOn')) {
    const today = s.time.cursor === app.data.todayISO;        // live tracks obey "only when the scrubber is on today"
    v.setTracks('flights', s.layersOn.flights && today ? app.data.tracks.filter(t => t.type === 'aircraft') : []);
    v.setTracks('vessels', s.layersOn.vessels && today ? app.data.tracks.filter(t => t.type === 'vessel') : []);
    const th = Object.assign({}, s.thinned); let ch = false; for (const id of ['flights', 'vessels']) if (!(s.layersOn[id] && today) && th[id]) { delete th[id]; ch = true; } if (ch) app.store.set({ thinned: th });
  }
  if (has('selection') || has('time') || has('lens') || has('options')) {
    const sel = s.selection;
    if (sel && sel.type === 'event' && s.lens.mode === 'all') { const rec = app.data.eventsById[sel.id], st = app.sel.stateOf(rec, app.sel.recordDate(s), s);
      v.setEventDetail(sel.id, st.known ? { alternates: (st.altPositions || []).map(a => ({ lat: a.lat, lng: a.lng, tag: 'per ' + app.sel.accountName(a.saidBy) })), targets: st.targets || [] } : null); }
    else v.setEventDetail(null, null);
  }
});
function viewCtx(camera) {
  const s = S();
  return { detail: WM.detail.LEVELS[s.detailLevel.level], camera, mapStyle: s.mapStyle, sat: s.sat, options: viewOptions(s),
    colors: () => WM.theme.stageColors(S().mapStyle, S().viewMode === '3d' ? 'dark' : null), layerOn: id => !!S().layersOn[id], mapStyleNow: () => S().mapStyle, satNow: () => S().sat };
}
function bindView(v) {
  v.on('select', ref => {
    if (!ref) { const s = S(); if (s.selection) return app.select(null); const c = s.layout.cls, p = s.panels.slots.left; if (WM.layout.isPhone(c) && p.panel && !p.pinned) WM.layout.close(p.panel); return; }
    if (ref.type === 'link') { const a = app.links().arcs.find(x => x.id === ref.id); if (!a) return; return app.select(a.count > 1 ? { type: 'group', kind: 'links', id: a.id, ids: a.items.map(i => i.link.id) } : { type: 'link', id: a.lead.link.id }); }
    app.select(ref);
  });
  v.on('chooser', g => app.select({ type: 'group', kind: 'events', id: g.ids.join('+'), ids: g.ids }));
  v.on('thinned', t => { const s = S(), cur = s.thinned[t.layerId]; if (!cur || cur.drawn !== t.drawn || cur.given !== t.given) app.store.set({ thinned: Object.assign({}, s.thinned, { [t.layerId]: { drawn: t.drawn, given: t.given } }) }); });
  v.on('stats', () => { if (WM.layout.whereIs('stats')) app.store.set({ viewStats: Date.now() }); });
  const meter = WM.detail.meter(); let pinnedDetent = null;
  v.on('movestart', () => { meter.start(); const s = S(), p = s.panels; if (s.layout.cls === 'phone-portrait' && p.slots.left.pinned && p.sheet !== 'peek' && !s.selection) { pinnedDetent = p.sheet; WM.layout.setP({ sheet: 'peek' }); } });
  v.on('moveend', () => { const f = meter.stop(), s = S(); if (f != null && v.kind === '2d' && s.fps.d2 !== f && WM.layout.whereIs('settings')) app.store.set({ fps: Object.assign({}, s.fps, { d2: f }) }); else if (f != null && v.kind === '2d') s.fps.d2 = f;
    if (pinnedDetent) { const d = pinnedDetent; pinnedDetent = null; WM.layout.setP({ sheet: d }); } });
  v.on('fps', f => { const s = S(); if (s.fps.d3 !== f) app.store.set({ fps: Object.assign({}, s.fps, { d3: f }) }); });
  v.on('degraded', info => offerStepDown(info));
}
/* Sustained low frame rate: OFFER one step down, never switch by itself; at most one offer per level per session. */
function offerStepDown() {
  const s = S(), lvl = s.detailLevel.level, to = WM.detail.LEVELS[lvl].stepDownTo;
  if (offered[lvl]) return; offered[lvl] = true;
  if (to === '2d') toast(STR.detail.offer2d, [{ label: 'Switch', fn: () => app.setView('2d') }, { label: 'Not now' }], 12000);
  else toast(STR.detail.offer(to[0].toUpperCase() + to.slice(1)), [{ label: 'Switch', fn: () => app.setDetail(to) }, { label: 'Not now' }], 12000);
}

/* ---- actions -------------------------------------------------------------------------------------------------- */
app.select = function (ref, o) {
  const s = S(); if (!ref && !s.selection) return;
  app.store.batch(() => {
    app.store.set({ selection: ref || null });
    if (ref) WM.layout.setP({ cardExpanded: false, sheet: 'peek' }); else if (S().layout.cls === 'phone-portrait' && S().panels.slots.left.panel) WM.layout.setP({ sheet: 'half' });
  });
  if (ref && ref.type === 'event' && (o && o.focus)) app.focusEvent(ref.id);
  else if (ref && ref.type === 'event' && WM.layout.isPhone(S().layout.cls)) app.focusEvent(ref.id, true);
};
app.focusEvent = function (id, onlyIfHidden) {
  const row = app.rows().rows.find(r => r.id === id); if (!row || !row.pos || !app.view || !app.view.focus) return;
  const s = S(); let pad = {};
  if (s.layout.cls === 'phone-portrait' && $('#slot-left').classList.contains('open')) pad = { bottom: WM.layout.sheetHeights()[s.panels.sheet || 'peek'] };
  setTimeout(() => app.view && app.view.focus(row.pos.lat, row.pos.lng, pad, !onlyIfHidden), 30);
};
/* Move the timeline to an event (if it is outside the window) and select it. */
app.jumpTo = function (id) {
  const rec = app.data.eventsById[id], s = S(); if (!rec) return;
  if (!rec.theater.some(t => s.theaters.includes(t))) app.setTheaters(app.data.theaters.map(t => t.id).filter(t => s.theaters.includes(t) || t === rec.theater[0]));
  if (!app.rows().rows.some(r => r.id === id)) {
    const ax = app.sel.axis(S()), end = rec.datePrecision === 'ongoing-from' ? app.data.todayISO : (rec.dateEndISO || rec.dateISO), last = rec.entries.reduce((m, e) => e.published > m ? e.published : m, end);
    const to = S().time.record === 'then' ? (last > ax.toISO ? ax.toISO : last) : end, t = S().time, width = Math.max(6, T.dc(t.window.toISO) - T.dc(t.window.fromISO));
    app.store.set({ time: Object.assign({}, t, { cursor: to, mode: 'window', window: { fromISO: T.iso(Math.max(T.dc(ax.fromISO), Math.min(T.dc(rec.dateISO), T.dc(to) - width))), toISO: to }, playing: false }), show: { onRecord: true, fog: true, contestedOnly: false } });
  }
  app.select({ type: 'event', id }, { focus: true });
};
app.setTheaters = function (ids) {
  const s = S(), ax0 = app.sel.axis(s);
  app.store.set({ theaters: ids });
  const ax = app.sel.axis(S()), t = S().time;         // the extent may have changed: keep the cursor and window inside it
  if (t.cursor < ax.fromISO || t.window.fromISO < ax.fromISO) { const c = t.cursor < ax.fromISO ? ax.fromISO : t.cursor; app.store.set({ time: Object.assign({}, t, { cursor: c, window: { fromISO: t.window.fromISO < ax.fromISO ? ax.fromISO : t.window.fromISO, toISO: c } }) }); }
  void ax0; frameTheaters(true);
};
function frameTheaters(animate) {
  const s = S(), ts = s.theaters.map(id => app.data.theatersById[id]); if (!app.view) return;
  const w = Math.min(...ts.map(t => t.aoi.bbox[0])), so = Math.min(...ts.map(t => t.aoi.bbox[1])), e = Math.max(...ts.map(t => t.aoi.bbox[2])), n = Math.max(...ts.map(t => t.aoi.bbox[3]));
  app.view.setCamera({ bounds: [[so, w], [n, e]], lat: (so + n) / 2, lng: (w + e) / 2, padding: [12, 12] }, animate);
}
app.setLens = function (mode, parties) { app.store.set({ lens: { mode, parties } }); };
app.setShow = function (patch) { app.store.set({ show: Object.assign({}, S().show, patch) }); };
app.toggleShow = function (k) {
  const sh = Object.assign({}, S().show);
  if (k === 'contestedOnly') sh.contestedOnly = !sh.contestedOnly;
  else { if (sh.contestedOnly) { sh.contestedOnly = false; sh[k] = true; } else sh[k] = !sh[k];
    if (!sh.onRecord && !sh.fog) { sh[k === 'fog' ? 'onRecord' : 'fog'] = true; toast('Both cannot be off: ' + (k === 'fog' ? STR.layer.onRecord : STR.layer.fog) + ' is back on.'); } }    // turning off the second turns the first back on
  app.store.set({ show: sh });
};
app.setLayer = function (id, onState) {
  const s = S(), L = Object.assign({}, s.layersOn, { [id]: onState });
  app.store.set({ layersOn: L });
  if ((id === 'flights' || id === 'vessels') && onState && s.time.cursor !== app.data.todayISO) toast('Tracks are shown for today only. Press Today on the timeline.');
};
app.setTheme = function (id) { const t = WM.theme.byId(id); if (!t) return; WM.theme.apply(t); const s = S(); app.store.set({ theme: id, mapStyle: s.mapStyleUser ? s.mapStyle : t.mapStyle }); };
app.setMapStyle = function (id, byUser) { if (!WM.theme.MAP_STYLES[id]) return; app.store.set({ mapStyle: id, mapStyleUser: !!byUser }); };
app.setDetail = function (choice) {
  const d = S().detailLevel, level = choice === 'auto' ? d.auto : choice; if (!WM.detail.ORDER.includes(level)) return;
  const next = Object.assign({}, d, { choice, level }); app.store.set({ detailLevel: next });
  WM.detail.save({ choice, level: d.auto, testFps: d.testFps, hints: d.hints, measuredAt: d.measuredAt, appVersion: WM.detail.APP_VERSION });
};
app.retest = async function () {
  toast('Testing this device for two seconds…', null, 2200);
  const r = await WM.detail.pick(true), d = S().detailLevel;
  app.store.set({ detailLevel: Object.assign({}, d, { auto: r.level, level: d.choice === 'auto' ? r.level : d.level, testFps: r.testFps, hints: r.hints, measuredAt: r.measuredAt }) });
  toast('Draw test: ' + r.testFps + ' frames/s. Auto picks ' + r.level + '.');
};
app.fpsTest = async function (kind) {
  if (!app.view || app.view.kind !== kind) return toast(kind === '3d' ? 'Open the 3D view first.' : 'Open the 2D map first.');
  toast('Moving the ' + (kind === '3d' ? 'globe' : 'map') + ' for three seconds…', null, 3200);
  const f = await app.view.fpsTest(3000); app.store.set({ fps: Object.assign({}, S().fps, { [kind === '3d' ? 'd3' : 'd2']: f }) });
};
/* 2D <-> 3D: destroy one renderer, start the other, replay the store. The camera stays on the same place. */
app.setView = async function (mode) {
  const s = S(); if (mode === s.viewMode || viewBusy) return;
  const cam = app.view ? app.view.getCamera() : null; viewBusy = true;
  try {
    if (mode === '3d') {
      const t0 = performance.now(), msg = $('#view3d'); msg.innerHTML = '<div class="globe-msg">Loading the globe… it is fetched only when you ask for it.</div>';
      document.documentElement.dataset.view = '3d';
      if (!WM.createView3D) await WM.dom.loadScript('js/views/view3d.js');
      const v3 = WM.createView3D(); await v3.load();
      if (app.view) app.view.destroy(); msg.innerHTML = '';
      app.view = v3; app.store.set({ viewMode: '3d' }); bindView(v3);
      await v3.init($('#view3d'), viewCtx(cam));
      app.store.set({ fps: Object.assign({}, S().fps, { globeLoadMs: Math.round(performance.now() - t0) }) });
    } else {
      if (app.view) app.view.destroy(); $('#view3d').innerHTML = '';
      document.documentElement.dataset.view = '2d';
      app.view = WM.createView2D(); app.store.set({ viewMode: '2d' }); bindView(app.view);
      await app.view.init($('#view2d'), viewCtx(cam));
    }
    if (S().layout.cls === 'phone-landscape') app.store.set({ phoneLandscapeView: mode });
  } catch (e) {
    WM.dom.toast('The globe could not be loaded here (' + (e && e.message ? e.message : 'unknown reason') + '). Staying on the 2D map.', null, 7000);
    $('#view3d').innerHTML = ''; document.documentElement.dataset.view = '2d';
    if (!app.view || app.view.kind !== '2d') { app.view = WM.createView2D(); bindView(app.view); await app.view.init($('#view2d'), viewCtx(cam)); }
    app.store.set({ viewMode: '2d' });
  } finally { viewBusy = false; syncView(); }
};
app.copyLink = function () { const url = location.origin + location.pathname + location.search + WM.viewLink.toHash(S()); WM.dom.copyText(url).then(ok => toast(ok ? 'Link copied. It carries the theaters, the date, the lens and the record switches.' : 'Could not copy on this browser.')); };
app.openStudio = async function () { try { if (!WM.studio) await WM.dom.loadScript('js/ui/studio.js'); WM.studio.open(app); } catch (e) { WM.dom.reportError('the theme studio', e); } };
/* A theme from a link or a file opens as a PREVIEW with Keep and Discard; it is saved only on Keep. */
app.previewTheme = function (t) {
  previewBackup = previewBackup || WM.theme.current(); WM.theme.apply(t, { preview: true });
  toast('Previewing the theme “' + t.name + '”. Nothing is saved yet.', [
    { label: 'Keep this theme', fn: () => { const r = WM.theme.saveUserTheme(t); previewBackup = null; if (r.ok) { app.setTheme(t.id); toast('Theme saved on this device.'); } else { toast(r.errors[0]); } } },
    { label: 'Discard', fn: () => { const b = previewBackup; previewBackup = null; if (b) WM.theme.apply(b); } }], 0);
};

function prefs() { const s = S(); disk.set(K_PREFS, { mapStyle: s.mapStyle, mapStyleUser: s.mapStyleUser, sat: s.sat, motion: s.motion, density: s.density, phoneLandscapeView: s.phoneLandscapeView, options: s.options, tourDone: s.tourDone }); }

function bindCardActions() {
  const on = WM.dom.on, root = document.body;
  on(root, 'click', '[data-act="show-map"]', (ev, el) => app.focusEvent(el.dataset.id));
  on(root, 'click', '[data-act="show-time"]', (ev, el) => { const rec = app.data.eventsById[el.dataset.id], s = S(), ax = app.sel.axis(s); WM.timeline.setCursorStep(T.stepIndex(ax, rec.dateEndISO || rec.dateISO)); });
  on(root, 'click', '[data-act="copy-link"]', () => app.copyLink());
  on(root, 'click', '[data-act="step-sel"]', (ev, el) => { const rows = app.rows().rows.slice().reverse(), s = S(), i = rows.findIndex(r => r.id === (s.selection && s.selection.id)), n = rows[i + (+el.dataset.dir)]; if (n) app.select({ type: 'event', id: n.id }, { focus: true }); else toast('No ' + (+el.dataset.dir > 0 ? 'later' : 'earlier') + ' event in this period.'); });
  on(root, 'click', '[data-act="show-ends"]', (ev, el) => { const l = app.data.linksById[el.dataset.id], a = app.data.reg.actors[l.from].anchor, b = app.data.reg.actors[l.to].anchor; if (!S().layersOn.links) app.setLayer('links', true); app.view.setCamera({ bounds: [[Math.min(a.lat, b.lat), Math.min(a.lng, b.lng)], [Math.max(a.lat, b.lat), Math.max(a.lng, b.lng)]], lat: (a.lat + b.lat) / 2, lng: (a.lng + b.lng) / 2, padding: [60, 60] }, true); });
  on(root, 'click', '[data-act="lens-pair"]', (ev, el) => app.setLens('parties', [el.dataset.a, el.dataset.b].sort((x, y) => app.sel.accountName(x).localeCompare(app.sel.accountName(y)))));
  // swipe a card at peek left or right: next or previous event in time (phone)
  let sx = null; root.addEventListener('touchstart', ev => { sx = ev.target.closest('.is-card .pb.peek') ? ev.touches[0].clientX : null; }, { passive: true });
  root.addEventListener('touchend', ev => { if (sx == null) return; const dx = ev.changedTouches[0].clientX - sx; sx = null; if (Math.abs(dx) > 70) { const b = document.querySelector(`[data-act="step-sel"][data-dir="${dx < 0 ? 1 : -1}"]`); if (b) b.click(); } }, { passive: true });
}
function bindKeys() {
  window.addEventListener('keydown', ev => {
    if (ev.target.closest('input, select, textarea') || ev.ctrlKey || ev.metaKey || ev.altKey) return;
    const s = S(), k = ev.key, g = WM.timeline.geom(), all = app.data.theaters.map(t => t.id);
    if (k === '[') WM.timeline.setCursorStep(g.ci - 1); else if (k === ']') WM.timeline.setCursorStep(g.ci + 1);
    else if (k === ' ' && !ev.target.closest('button, [role="slider"]')) { WM.timeline.togglePlay(); ev.preventDefault(); }
    else if (k === 't' || k === 'T') WM.timeline.goToday(); else if (k === 'a' || k === 'A') app.setTheaters(all);
    else if (/^[1-4]$/.test(k)) WM.controls.toggleTheater(all[+k - 1]);
    else if (k === 'v' || k === 'V') app.setView(s.viewMode === '3d' ? '2d' : '3d'); else if (k === 'l' || k === 'L') WM.controls.openLayers($('[data-act="layers"]'));
    else if (k === 'c' || k === 'C') WM.controls.setClean(!s.cleanView); else if (k === '/') { const i = $('#search'); if (i && i.offsetParent) { i.focus(); ev.preventDefault(); } }
    else if (k === '\\') toast('Side-by-side views are not built in the prototype.');
  });
}

async function boot() {
  if (T.isISO(qs.get('today'))) T.setToday(qs.get('today'));
  const today = T.today(), data = app.data = WM.buildSampleData(today), sel = app.sel = WM.createSelectors(data);
  await WM.theme.loadBuiltins();
  const p = disk.get(K_PREFS, {}) || {}, theme = WM.theme.initial(), dsaved = disk.get('wm2proto.detail.v1', null), L = WM.layout;
  const lvl = dsaved && WM.detail.ORDER.includes(dsaved.level) ? dsaved.level : 'standard', choice = dsaved && ['auto', 'lite', 'standard', 'full'].includes(dsaved.choice) ? dsaved.choice : 'auto';
  const opt = p.options || {}, m = L.measure();
  const state = {
    theaters: ['iran-war'],
    time: { cursor: today, mode: 'window', window: { fromISO: T.add(today, -6), toISO: today }, record: 'today', playing: false },     // provisional ruling 1: the last 7 days
    lens: { mode: 'all', parties: [] }, show: { onRecord: true, fog: true, contestedOnly: false },
    viewMode: '2d', layersOn: { outlines: true }, selection: null, linkFilter: { category: 'all', spoken: 'all', bothOnly: false }, search: '',
    layout: m, panels: { slots: null, floats: [], sheet: 'half', cardExpanded: false },
    theme: theme.id, mapStyle: p.mapStyleUser && WM.theme.MAP_STYLES[p.mapStyle] ? p.mapStyle : theme.mapStyle, mapStyleUser: !!p.mapStyleUser,
    sat: Object.assign({}, WM.theme.SAT_DEFAULT, p.sat && typeof p.sat === 'object' ? { dim: Math.max(0, Math.min(60, +p.sat.dim || 0)), sat: Math.max(40, Math.min(100, +p.sat.sat || 70)), labels: p.sat.labels !== false } : {}),
    detailLevel: { choice, auto: lvl, level: choice === 'auto' ? lvl : choice, testFps: dsaved ? dsaved.testFps : null, hints: dsaved ? dsaved.hints : null, measuredAt: dsaved ? dsaved.measuredAt : null },
    cleanView: false, thinned: {}, fps: { d2: null, d3: null }, viewStats: 0,
    motion: p.motion === 'calm' ? 'calm' : theme.motion, density: p.density === 'compact' ? 'compact' : null, phoneLandscapeView: p.phoneLandscapeView === '3d' ? '3d' : '2d',       // PROVISIONAL default: 2D
    options: { solidRule: ['ends', 'any-two', 'all-involved'].includes(opt.solidRule) ? opt.solidRule : 'ends', legacyLook: ['A', 'B', 'C'].includes(opt.legacyLook) ? opt.legacyLook : 'A', haloAll: !!opt.haloAll, badgeCount: !!opt.badgeCount },
    tourDone: !!p.tourDone
  };
  app.store = WM.createStore(state);
  WM.cards.init(app); WM.panelsUi.init(app);
  const saved = L.restoreFor(m.cls); state.panels.slots = saved.slots; state.panels.floats = saved.floats;
  // a view link: only values that pass a fixed check are used
  let themeParam = null;
  if (location.hash.startsWith('#theme=')) themeParam = location.hash.slice(7);
  else if (location.hash.length > 1) {
    const h = WM.viewLink.fromHash(location.hash, data, T.buildAxis(data.theaters, today));
    if (h.theaters) state.theaters = h.theaters;
    if (h.time) { const ax = T.buildAxis(state.theaters.map(id => data.theatersById[id]), today), c = h.time.cursor < ax.fromISO ? ax.fromISO : h.time.cursor;
      state.time = Object.assign({}, state.time, { cursor: c, mode: h.time.mode || 'window', record: h.time.record || 'today', window: h.time.mode === 'all' ? { fromISO: ax.fromISO, toISO: c } : h.time.window && h.time.window.fromISO >= ax.fromISO ? h.time.window : { fromISO: T.iso(Math.max(T.dc(ax.fromISO), T.dc(c) - 6)), toISO: c } }); }
    if (h.lens) state.lens = h.lens; if (h.show) state.show = Object.assign({}, state.show, h.show); if (h.links) state.layersOn.links = true; if (h.selection) state.selection = h.selection;
    state.wantView = h.viewMode;
  }
  const root = document.documentElement;
  root.dataset.layout = m.cls; root.dataset.view = '2d'; root.dataset.detail = state.detailLevel.level; root.dataset.clean = '0';
  WM.theme.setDetail(state.detailLevel.level); WM.theme.apply(theme); root.dataset.motion = state.motion;

  L.init(app); WM.timeline.init(app); WM.controls.init(app); bindCardActions(); bindKeys();
  L.onResize(); L.renderSlots();
  app.view = WM.createView2D(); bindView(app.view);
  await app.view.init($('#view2d'), viewCtx(null));
  frameTheaters(false); syncView();

  app.store.subscribe(null, (s, ch) => {
    syncView(ch);
    if (ch.has('mapStyle') || ch.has('sat')) { if (app.view.setStyle) app.view.setStyle(s.mapStyle, s.sat); }
    if (ch.has('detailLevel')) { root.dataset.detail = s.detailLevel.level; WM.theme.setDetail(s.detailLevel.level); app.view.setDetail(WM.detail.LEVELS[s.detailLevel.level]); }
    if (ch.has('layout')) { requestAnimationFrame(() => app.view && app.view.resize()); }
    if (['mapStyle', 'mapStyleUser', 'sat', 'motion', 'density', 'phoneLandscapeView', 'options', 'tourDone'].some(k => ch.has(k))) prefs();
    if (['theaters', 'time', 'viewMode', 'lens', 'show', 'layersOn', 'selection'].some(k => ch.has(k))) { clearTimeout(hashTimer); hashTimer = setTimeout(() => { try { history.replaceState(history.state, '', location.pathname + location.search + WM.viewLink.toHash(S())); } catch (e) { /* no history */ } }, 250); }
  });
  // phone landscape keeps its own default view (2D or the zoomed-out globe), remembered separately
  let lastCls = m.cls;
  app.store.subscribe(['layout'], s => { const c = s.layout.cls; if (c === lastCls) return; const was = lastCls; lastCls = c;
    if (c === 'phone-landscape') { otherView = s.viewMode; if (s.phoneLandscapeView !== s.viewMode) app.setView(s.phoneLandscapeView); } else if (was === 'phone-landscape' && otherView !== s.viewMode) app.setView(otherView); });
  document.addEventListener('wm:theme', () => { if (app.view && app.view.redraw) app.view.redraw(); });
  window.addEventListener('offline', () => toast('Offline — showing what was already loaded.', null, 6000));

  if (state.wantView === '3d' || (m.cls === 'phone-landscape' && state.phoneLandscapeView === '3d')) app.setView('3d');
  if (state.selection) L.renderSlots();
  if (themeParam) { const r = WM.theme.fromLinkParam(themeParam); try { history.replaceState(history.state, '', location.pathname + location.search); } catch (e) { /* no history */ }
    if (r.ok) app.previewTheme(r.theme); else toast('That theme link was not applied: ' + r.errors.slice(0, 3).join('; ') + '.', null, 9000); }
  // first visit: the two-second draw test picks the detail level; then the tour is offered once, never started by itself
  if (!dsaved && qs.get('test') !== '0') setTimeout(async () => { const r = await WM.detail.pick(false), d = S().detailLevel; app.store.set({ detailLevel: Object.assign({}, d, { auto: r.level, level: d.choice === 'auto' ? r.level : d.level, testFps: r.testFps, hints: r.hints, measuredAt: r.measuredAt }) }); }, 1200);
  if (qs.get('tour') !== '0' && !state.tourDone) setTimeout(() => {
    if (disk.ok) { toast(STR.tour.offer, [{ label: 'Start', fn: () => WM.tour.start() }, { label: 'Not now' }], 15000); app.store.set({ tourDone: true }); }
    else toast('', [{ label: 'Take the tour', fn: () => WM.tour.start() }], 9000);
  }, 3800);
  root.dataset.ready = '1';
}
window.addEventListener('DOMContentLoaded', () => boot().catch(e => WM.dom.reportError('start-up', e)));
})();

/* ---- author credit wave, carried over from v1 (index.html "AUTHOR NAME WAVE"): every 60 s, 0.5 s a letter. No wave under reduced or calm motion. ---- */
(function () {
  const el = document.getElementById('author-name'); if (!el) return;
  el.innerHTML = [...'Allan Sanceau'].map(ch => ch === ' ' ? '<span style="display:inline-block;width:.5em"></span>' : '<span class="aw">' + ch + '</span>').join('');
  const spans = el.querySelectorAll('.aw');
  const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.motion === 'calm' || document.hidden;
  function wave() { if (still()) return; let i = 0; (function step() { if (i > 0) spans[i - 1].classList.remove('hi'); if (i >= spans.length) return; spans[i++].classList.add('hi'); setTimeout(step, 500); })(); }
  setTimeout(wave, 2500); setInterval(wave, 60000); WM.authorWave = wave;
})();
