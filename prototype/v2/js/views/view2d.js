/* WARMAPS v2 PROTOTYPE — views/view2d.js
 * The 2D renderer (Leaflet), written to the renderer contract of ARCHITECTURE 9.2. It holds no state of record
 * and derives nothing: it draws the look it is given. Every mark passed to setEvents is drawn, or is a member of
 * a drawn group that opens to its members; only tracks and labels may be thinned, and then it says so.
 */
(function () {
'use strict';
const WM = window.WM = window.WM || {};
const M = WM.marks, esc = s => WM.dom.esc(s);

/* Points along the great circle from a to b (so an arc is the same object in 2D and 3D). */
function greatCircle(a, b, n) {
  const rad = x => x * Math.PI / 180, deg = x => x * 180 / Math.PI;
  const p1 = rad(a.lat), l1 = rad(a.lng), p2 = rad(b.lat), l2 = rad(b.lng);
  const d = 2 * Math.asin(Math.sqrt(Math.sin((p2 - p1) / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin((l2 - l1) / 2) ** 2));
  if (d === 0) return [[a.lat, a.lng]];
  const out = [];
  for (let i = 0; i <= n; i++) {
    const f = i / n, A = Math.sin((1 - f) * d) / Math.sin(d), B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(p1) * Math.cos(l1) + B * Math.cos(p2) * Math.cos(l2), y = A * Math.cos(p1) * Math.sin(l1) + B * Math.cos(p2) * Math.sin(l2), z = A * Math.sin(p1) + B * Math.sin(p2);
    out.push([deg(Math.atan2(z, Math.sqrt(x * x + y * y))), deg(Math.atan2(y, x))]);
  }
  return out;
}
const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
/* Declutter in SCREEN PIXELS (LAYOUT spec 8b): same-theater marks within 24 px form a group shown as a count.
 * Milestones never group; nor does the selected mark or a compare half. It reads positions on screen only: never
 * the detail level, the device or the layout class. items: [{ key, m, pt:{x,y}, free }] */
function group(items) {
  const used = new Set(), groups = [], pool = items.filter(i => !i.free).sort((a, b) => a.key.localeCompare(b.key));
  for (const a of pool) {
    if (used.has(a.key)) continue;
    const g = [a]; used.add(a.key); let cx = a.pt.x, cy = a.pt.y;
    for (const b of pool) { if (used.has(b.key) || b.m.theater !== a.m.theater) continue; if (Math.hypot(b.pt.x - cx, b.pt.y - cy) <= 24) { g.push(b); used.add(b.key); cx = g.reduce((s, x) => s + x.pt.x, 0) / g.length; cy = g.reduce((s, x) => s + x.pt.y, 0) / g.length; } }
    if (g.length > 1) groups.push({ members: g, x: cx, y: cy }); else used.delete(a.key);
  }
  const grouped = new Set(); for (const g of groups) for (const i of g.members) grouped.add(i.key);
  return { groups, grouped };
}
WM.geo = { greatCircle, hash, group };

WM.createView2D = function () {
  const L = window.L;
  let map, ctx, el, handlers = {}, marks = [], markers = new Map(), groupLayer, labelLayer, outlineLayer, arcLayer, detailLayer, trackLayer;
  let baseTiles, labelTiles, selected = null, theaters = [], mode = 'single', arcs = [], tracks = {}, detailRow, opts = { labels: true, haloAll: false, badgeCount: false, phone: false, animate: false };
  let lastStats = { given: 0, drawn: 0, grouped: 0, groups: 0, labels: 0 }, eventDetail = null, regroupTimer = 0, style = null, satAdj = null;
  const emit = (name, arg) => (handlers[name] || []).forEach(fn => { try { fn(arg); } catch (e) { WM.reportError('2D map', e); } });
  const colors = () => ctx.colors();

  function init(container, context) {
    ctx = context; el = container; detailRow = ctx.detail; Object.assign(opts, ctx.options || {});
    map = L.map(el, { zoomControl: false, attributionControl: true, minZoom: 2, maxZoom: 12, worldCopyJump: false, zoomSnap: 0.5, zoomDelta: 0.5,
      maxBounds: [[-75, -210], [84, 210]], maxBoundsViscosity: 0.8, preferCanvas: false, fadeAnimation: false, inertia: true });
    map.attributionControl.setPrefix(false);
    const pane = (name, z, noPointer) => { const p = map.createPane(name); p.style.zIndex = z; if (noPointer) p.style.pointerEvents = 'none'; return p; };
    pane('wm-outlines', 410, true); pane('wm-arcs', 420); pane('wm-events', 600); pane('wm-tracks', 620); pane('wm-detail', 630, true); pane('wm-labels', 640, true); pane('wm-reflabels', 650, true);
    outlineLayer = L.layerGroup().addTo(map); arcLayer = L.layerGroup().addTo(map); groupLayer = L.layerGroup().addTo(map);
    labelLayer = L.layerGroup().addTo(map); detailLayer = L.layerGroup().addTo(map); trackLayer = L.layerGroup().addTo(map);
    const cam = ctx.camera || { lat: 31.5, lng: 47.5, zoomEq: 5 };
    map.setView([cam.lat, cam.lng], cam.zoomEq, { animate: false });
    setStyle(ctx.mapStyle, ctx.sat);
    map.on('click', () => emit('select', null));
    map.on('zoomend moveend', () => { scheduleRegroup(); emit('camera', getCamera()); });
    map.on('movestart zoomstart', () => emit('movestart')); map.on('moveend zoomend', () => emit('moveend'));
    setTimeout(() => emit('ready'), 0);
    return Promise.resolve();
  }
  function destroy() { clearTimeout(regroupTimer); if (map) { map.remove(); map = null; } markers.clear(); handlers = {}; }

  /* ---- basemap: an id from the app's own table; filters only on the tile images ---------------------- */
  function setStyle(id, sat) {
    style = WM.theme.MAP_STYLES[id] || WM.theme.MAP_STYLES['tactical-dark']; satAdj = sat || WM.theme.SAT_DEFAULT;
    if (baseTiles) map.removeLayer(baseTiles); if (labelTiles) map.removeLayer(labelTiles);
    el.style.background = style.sea;
    baseTiles = L.tileLayer(style.base, { className: 'wm-tiles-base', attribution: 'Tiles © ' + style.credit, maxZoom: 12, crossOrigin: true }).addTo(map);
    const showLabels = style.imagery ? satAdj.labels : true;
    labelTiles = showLabels && opts.labels !== false ? L.tileLayer(style.labels, { pane: 'wm-reflabels', className: 'wm-tiles-labels', maxZoom: 12, crossOrigin: true }).addTo(map) : null;
    const bf = style.imagery ? `brightness(${(1 - satAdj.dim / 100).toFixed(2)}) saturate(${(satAdj.sat / 100).toFixed(2)})` : style.baseFilter;
    el.style.setProperty('--tile-filter', bf); el.style.setProperty('--label-filter', style.labelFilter);
    el.dataset.ground = style.ground;
    redrawAll();
  }

  /* ---- theater outlines (no fill; outside dimmed by 20% in single-theater mode) ---------------------- */
  function setTheaters(configs, m) { theaters = configs; mode = m; drawOutlines(); }
  function drawOutlines() {
    if (!map) return; outlineLayer.clearLayers(); if (!ctx.layerOn('outlines')) return;
    const C = colors();
    for (const t of theaters) {
      const [w, s, e, n] = t.aoi.bbox, col = C[M.TOKEN[t.id]];
      L.rectangle([[s, w], [n, e]], { pane: 'wm-outlines', color: col, weight: 1.5, opacity: 0.6, fill: false, interactive: false }).addTo(outlineLayer);
      const tab = L.divIcon({ className: 'wm-tab', html: `<span style="color:${col};border-color:${col}">${esc(t.tab)}</span>`, iconSize: [0, 0], iconAnchor: [0, 0] });
      L.marker([n, w], { icon: tab, pane: 'wm-outlines', interactive: false, keyboard: false }).addTo(outlineLayer);
    }
    if (mode === 'single' && theaters.length === 1) {
      const [w, s, e, n] = theaters[0].aoi.bbox;
      L.polygon([[[-89, -400], [89, -400], [89, 400], [-89, 400]], [[s, w], [n, w], [n, e], [s, e]]], { pane: 'wm-outlines', stroke: false, fillColor: '#000', fillOpacity: 0.2, interactive: false }).addTo(outlineLayer);
    }
  }

  /* ---- events ----------------------------------------------------------------------------------------- */
  function markHtml(m) {
    const C = colors(), col = C[M.TOKEN[m.theater]], shape = M.SHAPE[m.theater], isSel = selected && selected.type === 'event' && selected.id === m.id;
    const base = { shape, bg: C['bg-base'], selectedColor: C.selected, imagery: !!style.imagery, softHalo: detailRow.blur, age: m.age };
    const d = M.size(m.drawTier, m.look, opts.phone), halo = m.milestone && (opts.haloAll || (m.look !== 'ghost' && m.look !== 'faded')) && !m.halves;
    if (m.halves) {
      const hm = h => !h || h.state === 'none' ? { mode: 'none' } : { mode: h.state };
      const cmp = { left: Object.assign(hm(m.halves.left), { color: C['compare-a'] }), right: Object.assign(hm(m.halves.right), { color: C['compare-b'] }) };
      if (m.halfOnly) cmp[m.halfOnly === 'left' ? 'right' : 'left'] = { mode: 'none' };
      return M.svg(Object.assign(base, { look: 'solid', d: Math.max(d, 12), color: col, compare: cmp, selected: isSel }));
    }
    return M.svg(Object.assign(base, { look: m.look, d, color: col, halo: halo && (opts.haloAll ? 'all' : true), selected: isSel }));
  }
  function iconFor(m) {
    const s = markHtml(m), isSel = selected && selected.type === 'event' && selected.id === m.id;
    return L.divIcon({ className: 'wm-mk' + (isSel ? ' is-selected' : ''), html: `<div class="wm-mk-in" style="width:${s.box}px;height:${s.box}px">${s.html}</div>`, iconSize: [48, 48], iconAnchor: [24, 24] });
  }
  const zOf = m => (selected && selected.id === m.id ? 1000 : 0) + (m.milestone ? 400 : 0) + (m.look === 'solid' || m.look === 'split' ? 200 : m.look === 'unattributed' ? 100 : 0);

  /* One or two drawn positions per mark: compare mode can put each party's half at that party's place. */
  function placesOf(m) {
    if (m.halves && m.halves.left && m.halves.right && m.halves.left.state !== 'none' && m.halves.right.state !== 'none' && m.halves.left.lat != null && m.halves.right.lat != null &&
        (m.halves.left.lat !== m.halves.right.lat || m.halves.left.lng !== m.halves.right.lng)) {
      return [{ key: m.id + '|L', lat: m.halves.left.lat, lng: m.halves.left.lng, halfOnly: 'left' }, { key: m.id + '|R', lat: m.halves.right.lat, lng: m.halves.right.lng, halfOnly: 'right' }];
    }
    return [{ key: m.id, lat: m.lat, lng: m.lng }];
  }
  function setEvents(list, o) {
    marks = list; if (o) Object.assign(opts, o);
    if (!map) return;
    const seen = new Set(), animate = opts.animate && !detailRow.instant && !WM.dom.prefersReducedMotion();
    for (const m of marks) for (const p of placesOf(m)) {
      seen.add(p.key);
      const mm = p.halfOnly ? Object.assign({}, m, { halfOnly: p.halfOnly }) : m, sig = JSON.stringify([mm.look, mm.drawTier, mm.age, mm.halves, mm.halfOnly, selected && selected.id === m.id, opts.haloAll, opts.phone]);
      let mk = markers.get(p.key);
      if (!mk) {
        mk = L.marker([p.lat, p.lng], { icon: iconFor(mm), pane: 'wm-events', keyboard: true, title: m.title, alt: m.title, riseOnHover: true, zIndexOffset: zOf(m) });
        mk.on('click', ev => { L.DomEvent.stopPropagation(ev); emit('select', { type: 'event', id: m.id }); });
        mk._wm = { sig, id: m.id }; markers.set(p.key, mk);
      } else {
        const ll = mk.getLatLng();
        if (ll.lat !== p.lat || ll.lng !== p.lng) {
          const e = mk.getElement();
          if (animate && e) { e.classList.add('wm-slide'); setTimeout(() => e.classList.remove('wm-slide'), 360); }
          mk.setLatLng([p.lat, p.lng]);
        }
        if (mk._wm.sig !== sig) { mk.setIcon(iconFor(mm)); mk._wm.sig = sig; const e = mk.getElement(); if (animate && e) { e.classList.add('wm-fade'); setTimeout(() => e.classList.remove('wm-fade'), 220); } }
        mk.setZIndexOffset(zOf(m));
      }
      mk._wm.mark = mm;
    }
    for (const [key, mk] of markers) if (!seen.has(key)) { map.removeLayer(mk); markers.delete(key); }
    regroup();
  }

  /* Declutter in SCREEN PIXELS (LAYOUT spec 8b): same-theater marks within 24 px form a group shown as a count.
   * Milestones never group. It reads the stage and the zoom only: never the detail level or the device. */
  function scheduleRegroup() { clearTimeout(regroupTimer); regroupTimer = setTimeout(regroup, 30); }
  function regroup() {
    if (!map) return;
    groupLayer.clearLayers(); labelLayer.clearLayers();
    const C = colors(), items = [];
    for (const [key, mk] of markers) { const m = mk._wm.mark, pt = map.latLngToContainerPoint(mk.getLatLng()); items.push({ key, mk, m, pt, free: m.milestone || (selected && selected.id === m.id) || !!m.halves }); }
    const { groups, grouped } = group(items);
    let drawn = 0;
    for (const i of items) { const has = map.hasLayer(i.mk); if (grouped.has(i.key)) { if (has) map.removeLayer(i.mk); } else { if (!has) i.mk.addTo(map); drawn++; } }
    for (const g of groups) {
      const th = g.members[0].m.theater, oneSided = g.members.filter(i => i.m.look === 'ghost' || i.m.look === 'faded').length;
      const b = M.badge({ imagery: !!style.imagery, count: g.members.length, color: C[M.TOKEN[th]], bg: C['bg-base'], shape: M.SHAPE[th], allGhost: oneSided === g.members.length, oneSided: opts.badgeCount && oneSided && oneSided < g.members.length ? oneSided : null });
      const ll = map.containerPointToLatLng([g.x, g.y]), ids = [...new Set(g.members.map(i => i.m.id))];
      const mk = L.marker(ll, { pane: 'wm-events', zIndexOffset: 300, keyboard: true, title: ids.length + ' events here', alt: ids.length + ' events here',
        icon: L.divIcon({ className: 'wm-mk wm-group', html: b.html, iconSize: [48, 48], iconAnchor: [24, 24] }) });
      mk.on('click', ev => {
        L.DomEvent.stopPropagation(ev);
        const bounds = L.latLngBounds(g.members.map(i => i.mk.getLatLng())), z = map.getBoundsZoom(bounds, false, [80, 80]);
        // members that share a place cannot be separated by zooming: list them instead
        if (z <= map.getZoom() + 0.25 || map.getZoom() >= map.getMaxZoom() - 0.5 || bounds.getNorthEast().distanceTo(bounds.getSouthWest()) < 500) emit('chooser', { ids, at: ll });
        else map.flyToBounds(bounds, { padding: [80, 80], maxZoom: Math.min(map.getMaxZoom(), map.getZoom() + 3), duration: detailRow.instant ? 0.01 : 0.32 });
      });
      mk.addTo(groupLayer);
    }
    // labels: never on a one-sided mark; at most one per 20,000 px2 of stage; the detail level gives a ceiling
    let labels = 0;
    if (opts.labels !== false) {
      const size = map.getSize(), cap = Math.min(detailRow.labels, Math.floor(size.x * size.y / 20000)), boxes = [], z = map.getZoom();
      const cand = items.filter(i => !grouped.has(i.key) && i.m.label && i.m.look !== 'ghost' && i.m.look !== 'faded' && !i.m.halves && (i.m.milestone || (i.m.drawTier === 'major' && z >= 6.5 && cap > 12)))
        .sort((a, b) => (b.m.milestone ? 1 : 0) - (a.m.milestone ? 1 : 0) || a.key.localeCompare(b.key));
      for (const i of cand) {
        if (labels >= cap) break;
        const w = Math.min(180, i.m.label.length * 6.2 + 12), box = { x: i.pt.x + 14, y: i.pt.y - 10, w, h: 20 };
        if (box.x + w > size.x || box.y < 0 || boxes.some(o => box.x < o.x + o.w && box.x + box.w > o.x && box.y < o.y + o.h && box.y + box.h > o.y)) continue;
        if (items.some(o => o !== i && !grouped.has(o.key) && o.pt.x > box.x - 8 && o.pt.x < box.x + w + 8 && o.pt.y > box.y - 8 && o.pt.y < box.y + 28)) continue;
        boxes.push(box); labels++;
        L.marker(i.mk.getLatLng(), { pane: 'wm-labels', interactive: false, keyboard: false, icon: L.divIcon({ className: 'wm-label', html: `<span>${esc(i.m.label)}</span>`, iconSize: [0, 0], iconAnchor: [-14, 10] }) }).addTo(labelLayer);
      }
    }
    lastStats = { given: marks.length, drawn: new Set(items.filter(i => !grouped.has(i.key)).map(i => i.m.id)).size, grouped: new Set(items.filter(i => grouped.has(i.key)).map(i => i.m.id)).size, groups: groups.length, labels };
    drawTracks(); emit('stats', lastStats);
  }

  /* Other places named on the open record (alternates as small linked ghosts, further targets as ticks). */
  function setEventDetail(id, d) {
    eventDetail = d ? { id, d } : null; if (!map) return; detailLayer.clearLayers(); if (!d) return;
    const C = colors(), m = marks.find(x => x.id === id); if (!m) return;
    const col = C[M.TOKEN[m.theater]], shape = M.SHAPE[m.theater];
    for (const a of d.alternates || []) {
      L.polyline([[m.lat, m.lng], [a.lat, a.lng]], { pane: 'wm-detail', color: C['text-muted'], weight: 1, dashArray: '1 4', interactive: false }).addTo(detailLayer);
      const s = M.svg({ shape, look: 'ghost', d: M.size('standard', 'ghost', opts.phone) * 0.7 + 2, color: col, imagery: !!style.imagery });
      L.marker([a.lat, a.lng], { pane: 'wm-detail', interactive: false, keyboard: false, icon: L.divIcon({ className: 'wm-alt', html: `${s.html}<span class="wm-alt-tag">${esc(a.tag)}</span>`, iconSize: [s.box, s.box], iconAnchor: [s.box / 2, s.box / 2] }) }).addTo(detailLayer);
    }
    for (const t of d.targets || []) L.circleMarker([t.lat, t.lng], { pane: 'wm-detail', radius: 1.5, color: col, weight: 3, opacity: 1, interactive: false }).addTo(detailLayer);
  }

  /* ---- link arcs: one colour; the line style says who has spoken; the width counts voices -------------- */
  function setLinks(list) {
    arcs = list || []; if (!map) return; arcLayer.clearLayers();
    const C = colors(), col = C.link;
    for (const a of arcs) {
      const pts = greatCircle(a.from, a.to, detailRow.arcPoints), isSel = selected && selected.type === 'link' && selected.id === a.id, dash = M.ARC.dash(a.lineState);
      L.polyline(pts, { pane: 'wm-arcs', color: col, weight: M.ARC.width(a.weightStep) + (isSel ? 1 : 0), opacity: isSel ? 1 : M.ARC.opacity(a.lineState, a.weightStep), dashArray: dash ? dash.join(' ') : null, lineCap: a.lineState === 'ghost' ? 'round' : 'butt', interactive: false }).addTo(arcLayer);
      const mid = pts[Math.floor(pts.length / 2)], nxt = pts[Math.min(pts.length - 1, Math.floor(pts.length / 2) + 1)];
      const p1 = map.latLngToLayerPoint(mid), p2 = map.latLngToLayerPoint(nxt), ang = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
      const arrow = a.direction === 'undirected' ? '' : `<svg class="wm-arrow" width="14" height="14" viewBox="-7 -7 14 14" style="transform:rotate(${ang.toFixed(0)}deg)"><path d="${a.direction === 'both' ? 'M-6,0L-1,-4V4ZM6,0L1,-4V4Z' : 'M5,0L-3,-4.5V4.5Z'}" fill="${col}"/></svg>`;
      const html = `<div class="wm-arc-mid${isSel ? ' is-selected' : ''}">${arrow}<span class="wm-arc-chip">${M.catGlyph(a.category, col, 14)}${a.count > 1 ? `<b>${a.count}</b>` : ''}</span></div>`;
      const mk = L.marker(mid, { pane: 'wm-arcs', keyboard: true, title: a.title, alt: a.title, icon: L.divIcon({ className: 'wm-mk wm-arcmk', html, iconSize: [48, 48], iconAnchor: [24, 24] }) });
      mk.on('click', ev => { L.DomEvent.stopPropagation(ev); emit('select', { type: 'link', id: a.id }); });
      mk.addTo(arcLayer);
    }
  }

  /* ---- OBSERVED tracks: thinned to one per 40 x 40 px cell by a rule that looks only at the track id ----- */
  function setTracks(layerId, list) { if (list && list.length) tracks[layerId] = list; else delete tracks[layerId]; drawTracks(); }
  function drawTracks() {
    if (!map) return; trackLayer.clearLayers();
    const C = colors(), size = map.getSize();
    for (const [layerId, list] of Object.entries(tracks)) {
      const cells = new Map(); let inView = 0;
      for (const t of list) {
        const pt = map.latLngToContainerPoint([t.lat, t.lng]); if (pt.x < 0 || pt.y < 0 || pt.x > size.x || pt.y > size.y) continue; inView++;
        const key = Math.floor(pt.x / 40) + ':' + Math.floor(pt.y / 40), h = hash(t.id), cur = cells.get(key);
        if (!cur || h < cur.h) cells.set(key, { t, h });
      }
      const keep = [...cells.values()].sort((a, b) => a.h - b.h).slice(0, detailRow.tracks).map(x => x.t);
      for (const t of keep) {
        const isSel = selected && selected.type === 'track' && selected.id === t.id;
        const mk = L.marker([t.lat, t.lng], { pane: 'wm-tracks', keyboard: false, title: t.name + ' (OBSERVED, sample)', icon: L.divIcon({ className: 'wm-mk wm-track' + (isSel ? ' is-selected' : ''), html: M.track(t.type, C.track, t.heading), iconSize: [48, 48], iconAnchor: [24, 24] }) });
        mk.on('click', ev => { L.DomEvent.stopPropagation(ev); emit('select', { type: 'track', id: t.id }); });
        mk.addTo(trackLayer);
      }
      emit('thinned', { layerId, drawn: keep.length, given: list.length, inView });
    }
  }
  function setLayer(id) { if (id === 'outlines') drawOutlines(); }

  function redrawAll() { if (!map) return; drawOutlines(); for (const mk of markers.values()) mk._wm.sig = ''; setEvents(marks); setLinks(arcs); if (eventDetail) setEventDetail(eventDetail.id, eventDetail.d); }
  function select(ref) { selected = ref; for (const mk of markers.values()) mk._wm.sig = ''; setEvents(marks); setLinks(arcs); drawTracks(); }
  function getCamera() { const c = map.getCenter(); return { lat: c.lat, lng: c.lng, zoomEq: map.getZoom() }; }
  function setCamera(cam, animate) {
    const z = cam.zoomEq != null ? cam.zoomEq : map.getZoom();
    if (cam.bounds) map.fitBounds(cam.bounds, { animate: !!animate && !detailRow.instant, padding: cam.padding || [24, 24] });
    else map.setView([cam.lat, cam.lng], z, { animate: !!animate && !detailRow.instant });
  }
  /* Bring a place into the part of the stage that is not under a sheet. */
  function focus(lat, lng, pad) {
    const size = map.getSize(), p = map.latLngToContainerPoint([lat, lng]), padB = (pad && pad.bottom) || 0, padL = (pad && pad.left) || 0;
    const tx = padL + (size.x - padL) / 2, ty = (size.y - padB) / 2;
    if (p.x > padL + 40 && p.x < size.x - 40 && p.y > 60 && p.y < size.y - padB - 40) return;
    map.panBy([p.x - tx, p.y - ty], { animate: !detailRow.instant });
  }
  function resize() { if (map) map.invalidateSize({ animate: false }); }
  /* Pan the map for a few seconds and report frames per second (for the About numbers). */
  function fpsTest(ms) {
    return new Promise(res => {
      const m = WM.detail.meter(), t0 = performance.now(), c0 = map.getCenter(); m.start();
      (function step() { const t = (performance.now() - t0) / (ms || 3000); if (t >= 1) { map.setView(c0, map.getZoom(), { animate: false }); res(m.stop()); return; } map.panBy([Math.cos(t * 12) * 6, Math.sin(t * 12) * 6], { animate: false }); requestAnimationFrame(step); })();
    });
  }
  return { kind: '2d', init, destroy, setTheaters, setEvents, setEventDetail, setLinks, setTracks, setLayer, select, highlight: select, getCamera, setCamera, focus, resize, fpsTest,
    on(name, fn) { (handlers[name] = handlers[name] || []).push(fn); }, setDetail(row) { detailRow = row; redrawAll(); }, setStyle, setOptions(o) { Object.assign(opts, o); if (map) setStyle(ctx.mapStyleNow(), ctx.satNow()); },
    redraw: redrawAll, stats: () => lastStats,
    detail: { lite: 'no soft halo on imagery, 12 labels, 300 tracks, 16-point arcs, instant changes', standard: 'keyline and halo, 30 labels, 1,000 tracks, 32-point arcs', full: '60 labels, 5,000 tracks, 64-point arcs' } };
};
})();
