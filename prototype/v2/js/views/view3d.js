/* WARMAPS v2 PROTOTYPE — views/view3d.js
 * The globe renderer (CesiumJS), written to the same contract as view2d.js (ARCHITECTURE 9.2). This file and the
 * Cesium library are fetched only when the 3D view is first asked for. No key is used: no Cesium ion imagery,
 * no ion terrain. Events are flat screen-space symbols on the surface with the same shapes, sizes and fills as in
 * 2D; height is used only for real altitude (tracks). Events on the far side are hidden, not shown through.
 */
(function () {
'use strict';
const WM = window.WM = window.WM || {};
const M = WM.marks, geo = WM.geo;
const VER = '1.146.0', BASE = 'https://cdn.jsdelivr.net/npm/cesium@' + VER + '/Build/Cesium/';
const SRI_JS = 'sha384-1lWK5deN/B+lLaUw4lk6xKp/L19ii/98SZLk6K8YthDskgvc+GbdixLzbCnSS2Wn', SRI_CSS = 'sha384-ghEeMdcWWzRv/BPeUcX835vcKDGrxvROXisl/Btpv3GeekBUXTSPVcFJpI1Tcrgp';

WM.createView3D = function () {
  let C, viewer, scene, ctx, el, handlers = {}, marks = [], opts = { labels: true, phone: false }, detailRow, selected = null, theaters = [], mode = 'single', arcs = [], tracks = {}, eventDetail = null;
  let bbs, groupBbs, lines, labels, trackBbs, detailBbs, arcBbs, baseLayer, labelLayer, occl, items = [], lastStats = { given: 0, drawn: 0, grouped: 0, groups: 0, labels: 0 }, regroupTimer = 0, destroyed = false, clickH, slow = { t: 0, frames: 0, bad: 0 }, moving = false, meterT = 0, meterN = 0;
  const emit = (name, arg) => (handlers[name] || []).forEach(fn => { try { fn(arg); } catch (e) { WM.reportError('the globe', e); } });
  const colors = () => ctx.colors();
  const col = (hex, a) => C.Color.fromCssColorString(hex).withAlpha(a == null ? 1 : a);
  const pos = (lat, lng, h) => C.Cartesian3.fromDegrees(lng, lat, h || 0);
  const kOf = () => Math.min(2, Math.max(1, Math.round(viewer.resolutionScale)));
  // draw the SVG at k times its size so it stays sharp when the globe is drawn above device ratio 1
  const img = (svg, k) => M.dataUri(svg.html.replace(/width="(\d+)" height="(\d+)"/, (m, w, h) => `width="${w * k}" height="${h * k}"`));

  async function load() {
    if (window.Cesium) return;
    window.CESIUM_BASE_URL = BASE;
    await WM.dom.loadCss(BASE + 'Widgets/widgets.css', SRI_CSS);
    await WM.dom.loadScript(BASE + 'Cesium.js', SRI_JS);
    if (!window.Cesium) throw new Error('the globe library did not start');
  }
  function webglOk() { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } }

  async function init(container, context) {
    C = window.Cesium; ctx = context; el = container; detailRow = ctx.detail; Object.assign(opts, ctx.options || {});
    if (!webglOk()) throw new Error('this browser has no WebGL');
    C.Ion.defaultAccessToken = undefined;
    viewer = new C.Viewer(el, { animation: false, timeline: false, baseLayerPicker: false, geocoder: false, homeButton: false, sceneModePicker: false, navigationHelpButton: false, fullscreenButton: false,
      infoBox: false, selectionIndicator: false, vrButton: false, baseLayer: false, requestRenderMode: true, maximumRenderTimeChange: Infinity, scene3DOnly: true, skyBox: false, skyAtmosphere: detailRow.atmosphere ? undefined : false,
      contextOptions: { webgl: { alpha: false, powerPreference: 'high-performance' } } });
    scene = viewer.scene;
    scene.sun && (scene.sun.show = false); scene.moon && (scene.moon.show = false);
    scene.globe.enableLighting = false; scene.globe.showGroundAtmosphere = false; scene.fog.enabled = false;
    if (scene.skyAtmosphere) { scene.skyAtmosphere.brightnessShift = -0.55; scene.skyAtmosphere.saturationShift = -0.5; }     // atmosphere at low intensity: a thin limb glow only
    scene.screenSpaceCameraController.minimumZoomDistance = 80000; scene.screenSpaceCameraController.maximumZoomDistance = 4.2e7;
    viewer.useBrowserRecommendedResolution = false; viewer.resolutionScale = Math.min(window.devicePixelRatio || 1, detailRow.globeScale);
    lines = scene.primitives.add(new C.PolylineCollection()); bbs = scene.primitives.add(new C.BillboardCollection({ scene })); groupBbs = scene.primitives.add(new C.BillboardCollection({ scene }));
    arcBbs = scene.primitives.add(new C.BillboardCollection({ scene })); trackBbs = scene.primitives.add(new C.BillboardCollection({ scene })); detailBbs = scene.primitives.add(new C.BillboardCollection({ scene })); labels = scene.primitives.add(new C.LabelCollection({ scene }));
    setStyle(ctx.mapStyle, ctx.sat);
    const cam = ctx.camera || { lat: 30, lng: 48, zoomEq: 4 }; setCamera(cam, false);
    clickH = new C.ScreenSpaceEventHandler(scene.canvas);
    clickH.setInputAction(ev => {
      const p = scene.pick(ev.position, 44, 44), id = p && p.id;
      if (id && id.group) {   // a group: move closer until its members separate; if they share a place, list them
        const cam = getCamera(), carto = C.Cartographic.fromCartesian(p.primitive.position);
        if (cam.zoomEq >= 8.5) emit('chooser', { ids: id.group }); else setCamera({ lat: C.Math.toDegrees(carto.latitude), lng: C.Math.toDegrees(carto.longitude), zoomEq: cam.zoomEq + 2 }, true);
        return;
      }
      emit('select', id && id.wm ? id.wm : null);
    }, C.ScreenSpaceEventType.LEFT_CLICK);
    viewer.camera.moveStart.addEventListener(() => { moving = true; meterT = performance.now(); meterN = 0; slow.t = performance.now(); slow.frames = 0; emit('movestart'); });
    viewer.camera.moveEnd.addEventListener(() => { moving = false; const dt = performance.now() - meterT; if (dt > 400 && meterN > 3) emit('fps', Math.round(meterN * 1000 / dt)); emit('moveend'); scheduleRegroup(); emit('camera', getCamera()); });
    scene.preRender.addEventListener(cull);
    scene.postRender.addEventListener(() => { if (!moving) return; meterN++; slow.frames++; const now = performance.now();
      // sustained low frame rate while moving: report it; the shell OFFERS a step down and never switches by itself
      if (now - slow.t >= 1000) { const fps = slow.frames * 1000 / (now - slow.t); slow.bad = fps < detailRow.stepDownFps ? slow.bad + 1 : 0; slow.t = now; slow.frames = 0; if (slow.bad >= 5) { slow.bad = 0; emit('degraded', { fps: Math.round(fps) }); } } });
    setTimeout(() => emit('ready'), 0);
  }
  function destroy() { destroyed = true; clearTimeout(regroupTimer); try { if (clickH) clickH.destroy(); if (viewer) viewer.destroy(); } catch (e) { /* already gone */ } viewer = null; handlers = {}; }

  /* The globe stays dark-ground under every theme: a light map style is shown as Tactical dark here. */
  function setStyle(id, sat) {
    if (!viewer) return;
    const S = WM.theme.MAP_STYLES, st = id === 'satellite' ? S.satellite : S['tactical-dark'], adj = sat || WM.theme.SAT_DEFAULT;
    viewer.imageryLayers.removeAll(); scene.backgroundColor = col('#04070B'); scene.globe.baseColor = col(st.land);
    baseLayer = viewer.imageryLayers.addImageryProvider(new C.UrlTemplateImageryProvider({ url: st.base, maximumLevel: 12, credit: 'Tiles © ' + st.credit }));
    if (st.imagery) { baseLayer.brightness = 1 - adj.dim / 100; baseLayer.saturation = adj.sat / 100; } else { baseLayer.brightness = 0.62; baseLayer.contrast = 1.15; baseLayer.saturation = 0.85; }
    labelLayer = (st.imagery ? adj.labels : true) ? viewer.imageryLayers.addImageryProvider(new C.UrlTemplateImageryProvider({ url: st.labels, maximumLevel: 12 })) : null;
    if (labelLayer && !st.imagery) labelLayer.brightness = 0.78;
    el.dataset.imagery = st.imagery ? '1' : '0'; labelVisibility(); redrawAll();
  }
  // phone landscape: the zoomed-out globe has place names and event labels off; they return past theater zoom
  function labelsOn() { return opts.labels !== false || getCamera().zoomEq >= 5.5; }
  function labelVisibility() { if (labelLayer) labelLayer.show = labelsOn(); }

  function setTheaters(configs, m) { theaters = configs; mode = m; drawLines(); }
  function ring(w, s, e, n) { const pts = [], step = 2; for (let x = w; x < e; x += step) pts.push(pos(n, x, 2000)); for (let y = n; y > s; y -= step) pts.push(pos(y, e, 2000)); for (let x = e; x > w; x -= step) pts.push(pos(s, x, 2000)); for (let y = s; y < n; y += step) pts.push(pos(y, w, 2000)); pts.push(pos(n, w, 2000)); return pts; }
  function arcPositions(a) {
    const n = detailRow.arcPoints, g = geo.greatCircle(a.from, a.to, n), d = C.Cartesian3.distance(pos(a.from.lat, a.from.lng), pos(a.to.lat, a.to.lng));
    return g.map(([lat, lng], i) => pos(lat, lng, 20000 + Math.sin(Math.PI * i / n) * d * 0.12));     // arching above the surface in proportion to distance
  }
  /* Outlines, arcs and the lines of an open record are redrawn together. */
  function drawLines() {
    if (!viewer) return; lines.removeAll(); arcBbs.removeAll();
    const K = colors(), k = kOf();
    for (const lb of labelsTab) labels.remove(lb); labelsTab = [];
    if (ctx.layerOn('outlines')) for (const t of theaters) {
      const [w, s, e, n] = t.aoi.bbox, c = K[M.TOKEN[t.id]];
      lines.add({ positions: ring(w, s, e, n), width: 1.5, material: C.Material.fromType('Color', { color: col(c, 0.6) }) });
      labelsTab.push(labels.add({ position: pos(n, w, 3000), text: t.tab.toUpperCase(), font: '500 11px sans-serif', fillColor: col(c), showBackground: true, backgroundColor: col(K['bg-base'], 0.8), backgroundPadding: new C.Cartesian2(5, 3), horizontalOrigin: C.HorizontalOrigin.LEFT, verticalOrigin: C.VerticalOrigin.BOTTOM, disableDepthTestDistance: Number.POSITIVE_INFINITY, id: { tab: true } }));
    }
    for (const a of arcs) {
      const isSel = selected && selected.type === 'link' && selected.id === a.id, c = col(K.link, isSel ? 1 : M.ARC.opacity(a.lineState, a.weightStep)), P = arcPositions(a);
      const mat = a.lineState === 'solid' ? C.Material.fromType('Color', { color: c }) : C.Material.fromType('PolylineDash', { color: c, dashLength: a.lineState === 'split' ? 14 : 6, dashPattern: a.lineState === 'split' ? 0b1111111110000000 : 0b1100000000000000 });
      lines.add({ positions: P, width: M.ARC.width(a.weightStep) + (isSel ? 1 : 0), material: mat });
      const glyph = M.catGlyph(a.category, K.link, 14).replace('<svg ', '<svg x="5" y="4" '), w = a.count > 1 ? 38 : 24;
      const chip = { html: `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="22" viewBox="0 0 ${w} 22"><rect x="1" y="1" width="${w - 2}" height="20" rx="3" fill="${K['bg-surface']}" stroke="${K.link}" stroke-width="${isSel ? 2 : 1}"/>${glyph}${a.count > 1 ? `<text x="${w - 10}" y="15.5" text-anchor="middle" font-family="monospace" font-size="11" fill="${K['text-primary']}">${a.count}</text>` : ''}</svg>` };
      arcBbs.add({ position: P[Math.floor(P.length / 2)], image: img(chip, k), width: w, height: 22, disableDepthTestDistance: Number.POSITIVE_INFINITY, id: { wm: { type: 'link', id: a.id } } });
    }
    if (eventDetail && eventDetail.d) {
      const m = marks.find(x => x.id === eventDetail.id);
      if (m) for (const a of eventDetail.d.alternates || []) lines.add({ positions: [pos(m.lat, m.lng, 500), pos(a.lat, a.lng, 500)], width: 1, material: C.Material.fromType('PolylineDash', { color: col(K['text-muted']), dashLength: 6, dashPattern: 0b1100000000000000 }) });
    }
    scene.requestRender();
  }
  let labelsTab = [];

  /* ---- events: the same marks as in 2D, drawn as billboards ---------------------------------------------- */
  function markSvg(m) {
    const K = colors(), c = K[M.TOKEN[m.theater]], shape = M.SHAPE[m.theater], isSel = selected && selected.type === 'event' && selected.id === m.id;
    const base = { shape, bg: K['bg-base'], selectedColor: K.selected, imagery: true, softHalo: detailRow.blur, age: m.age, selected: isSel };       // on the globe every mark sits on imagery: dark keyline
    const d = M.size(m.drawTier, m.look, opts.phone);
    if (m.halves) {
      const hm = h => !h || h.state === 'none' ? { mode: 'none' } : { mode: h.state }, cmp = { left: Object.assign(hm(m.halves.left), { color: K['compare-a'] }), right: Object.assign(hm(m.halves.right), { color: K['compare-b'] }) };
      if (m.halfOnly) cmp[m.halfOnly === 'left' ? 'right' : 'left'] = { mode: 'none' };
      return M.svg(Object.assign(base, { look: 'solid', d: Math.max(d, 12), color: c, compare: cmp }));
    }
    return M.svg(Object.assign(base, { look: m.look, d, color: c, halo: m.milestone ? (opts.haloAll ? 'all' : true) : false }));
  }
  function placesOf(m) {
    const h = m.halves;
    if (h && h.left.state !== 'none' && h.right.state !== 'none' && (h.left.lat !== h.right.lat || h.left.lng !== h.right.lng)) return [{ key: m.id + '|L', lat: h.left.lat, lng: h.left.lng, halfOnly: 'left' }, { key: m.id + '|R', lat: h.right.lat, lng: h.right.lng, halfOnly: 'right' }];
    return [{ key: m.id, lat: m.lat, lng: m.lng }];
  }
  function setEvents(list, o) {
    marks = list; if (o) Object.assign(opts, o); if (!viewer) return;
    bbs.removeAll(); items = []; const k = kOf();
    for (const m of marks) for (const p of placesOf(m)) {
      const mm = p.halfOnly ? Object.assign({}, m, { halfOnly: p.halfOnly }) : m, s = markSvg(mm);
      const b = bbs.add({ position: pos(p.lat, p.lng), image: img(s, k), width: s.box, height: s.box, disableDepthTestDistance: Number.POSITIVE_INFINITY, id: { wm: { type: 'event', id: m.id } } });
      items.push({ key: p.key, m: mm, b, world: pos(p.lat, p.lng), free: m.milestone || (selected && selected.id === m.id) || !!m.halves });
    }
    labelVisibility(); regroup();
  }
  function scheduleRegroup() { clearTimeout(regroupTimer); regroupTimer = setTimeout(() => { if (!destroyed) regroup(); }, 60); }
  /* The same screen-pixel grouping as the 2D map (LAYOUT spec 8b). */
  function regroup() {
    if (!viewer) return; groupBbs.removeAll();
    for (const lb of labelsEv) labels.remove(lb); labelsEv = [];
    const K = colors(), k = kOf(), vis = [];
    occl = new C.EllipsoidalOccluder(C.Ellipsoid.WGS84, viewer.camera.positionWC);
    for (const i of items) { i.front = occl.isPointVisible(i.world); const w = i.front ? C.SceneTransforms.worldToWindowCoordinates(scene, i.world) : null; i.pt = w ? { x: w.x, y: w.y } : null; if (i.pt) vis.push(i); }
    const { groups, grouped } = geo.group(vis);
    for (const i of items) { i.grouped = grouped.has(i.key); i.b.show = !!i.front && !i.grouped; }
    for (const g of groups) {
      const th = g.members[0].m.theater, one = g.members.filter(i => i.m.look === 'ghost' || i.m.look === 'faded').length, ids = [...new Set(g.members.map(i => i.m.id))];
      const b = M.badge({ count: g.members.length, color: K[M.TOKEN[th]], bg: K['bg-base'], shape: M.SHAPE[th], allGhost: one === g.members.length, oneSided: opts.badgeCount && one && one < g.members.length ? one : null });
      const c = g.members.reduce((a, i) => C.Cartesian3.add(a, i.world, a), new C.Cartesian3()); C.Cartesian3.multiplyByScalar(c, 1 / g.members.length, c);
      const carto = C.Cartographic.fromCartesian(c);
      groupBbs.add({ position: C.Cartesian3.fromRadians(carto.longitude, carto.latitude, 0), image: img({ html: b.html }, k), width: b.w, height: b.h, disableDepthTestDistance: Number.POSITIVE_INFINITY, id: { group: ids, members: g.members } });
    }
    let nl = 0;
    if (labelsOn()) { const cap = Math.min(detailRow.labels, Math.floor(scene.canvas.clientWidth * scene.canvas.clientHeight / 20000));
      for (const i of vis) { if (nl >= cap) break; if (i.grouped || !i.m.milestone || !i.m.label || i.m.look === 'ghost' || i.m.look === 'faded' || i.m.halves) continue; nl++;
        labelsEv.push(labels.add({ position: i.world, text: i.m.label.length > 30 ? i.m.label.slice(0, 29) + '…' : i.m.label, font: '500 11px sans-serif', fillColor: col(K['text-primary']), showBackground: true, backgroundColor: col(K['bg-surface'], 0.95), backgroundPadding: new C.Cartesian2(5, 3), pixelOffset: new C.Cartesian2(16, 0), horizontalOrigin: C.HorizontalOrigin.LEFT, verticalOrigin: C.VerticalOrigin.CENTER, disableDepthTestDistance: Number.POSITIVE_INFINITY, id: { tab: true } })); } }
    lastStats = { given: marks.length, drawn: new Set(items.filter(i => !i.grouped).map(i => i.m.id)).size, grouped: new Set(items.filter(i => i.grouped).map(i => i.m.id)).size, groups: groups.length, labels: nl };
    drawTracks(); emit('stats', lastStats); scene.requestRender();
  }
  let labelsEv = [];
  /* Hide what is on the far side (billboards are drawn without a depth test so they never sink into the surface). */
  function cull() {
    if (!viewer) return; occl = new C.EllipsoidalOccluder(C.Ellipsoid.WGS84, viewer.camera.positionWC);
    for (const i of items) { const f = occl.isPointVisible(i.world); if (f !== i.front) { i.front = f; i.b.show = f && !i.grouped; } }
    for (const coll of [groupBbs, arcBbs, trackBbs, detailBbs]) for (let n = 0; n < coll.length; n++) { const b = coll.get(n); b.show = occl.isPointVisible(b.position); }
    for (let n = 0; n < labels.length; n++) { const l = labels.get(n); l.show = occl.isPointVisible(l.position); }
  }

  function setEventDetail(id, d) {
    eventDetail = d ? { id, d } : null; if (!viewer) return; detailBbs.removeAll();
    const m = d && marks.find(x => x.id === id);
    if (m) { const K = colors(), c = K[M.TOKEN[m.theater]], k = kOf();
      for (const a of d.alternates || []) { const s = M.svg({ shape: M.SHAPE[m.theater], look: 'ghost', d: M.size('standard', 'ghost', opts.phone) * 0.7 + 2, color: c, imagery: true }); detailBbs.add({ position: pos(a.lat, a.lng), image: img(s, k), width: s.box, height: s.box, disableDepthTestDistance: Number.POSITIVE_INFINITY });
        labelsEv.push(labels.add({ position: pos(a.lat, a.lng), text: a.tag, font: '11px sans-serif', fillColor: col(K['text-primary']), showBackground: true, backgroundColor: col(K['bg-surface'], 0.95), backgroundPadding: new C.Cartesian2(4, 2), pixelOffset: new C.Cartesian2(10, 0), horizontalOrigin: C.HorizontalOrigin.LEFT, disableDepthTestDistance: Number.POSITIVE_INFINITY, id: { tab: true } })); }
      for (const t of d.targets || []) { const s = { html: `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" fill="${c}" stroke="${M.KEY}" stroke-width="1"/></svg>` }; detailBbs.add({ position: pos(t.lat, t.lng), image: img(s, k), width: 6, height: 6, disableDepthTestDistance: Number.POSITIVE_INFINITY }); } }
    drawLines();
  }
  function setLinks(list) { arcs = list || []; drawLines(); }
  function setTracks(layerId, list) { if (list && list.length) tracks[layerId] = list; else delete tracks[layerId]; drawTracks(); }
  /* OBSERVED tracks at their reported altitude; thinned to one per 40 x 40 px cell by the lowest hash of the id. */
  function drawTracks() {
    if (!viewer) return; trackBbs.removeAll(); const K = colors(), k = kOf(), W = scene.canvas.clientWidth, H = scene.canvas.clientHeight;
    for (const [layerId, list] of Object.entries(tracks)) {
      const cells = new Map();
      for (const t of list) { const w = pos(t.lat, t.lng, t.altM || 0); if (!occl || !occl.isPointVisible(w)) continue; const p = C.SceneTransforms.worldToWindowCoordinates(scene, w); if (!p || p.x < 0 || p.y < 0 || p.x > W || p.y > H) continue;
        const key = Math.floor(p.x / 40) + ':' + Math.floor(p.y / 40), h = geo.hash(t.id), cur = cells.get(key); if (!cur || h < cur.h) cells.set(key, { t, h, w }); }
      const keep = [...cells.values()].sort((a, b) => a.h - b.h).slice(0, detailRow.tracks);
      for (const x of keep) trackBbs.add({ position: x.w, image: img({ html: M.track(x.t.type, K.track, x.t.heading) }, k), width: 20, height: 20, disableDepthTestDistance: Number.POSITIVE_INFINITY, id: { wm: { type: 'track', id: x.t.id } } });
      emit('thinned', { layerId, drawn: keep.length, given: list.length });
    }
    scene.requestRender();
  }
  function setLayer() { drawLines(); }
  function redrawAll() { if (!viewer) return; setEvents(marks); drawLines(); if (eventDetail) setEventDetail(eventDetail.id, eventDetail.d); }
  function select(ref) { selected = ref; if (viewer) { setEvents(marks); drawLines(); } }

  /* zoomEq is a Leaflet-style zoom number, so switching 2D <-> 3D keeps you looking at the same place. */
  function getCamera() {
    const cam = viewer.camera, cv = scene.canvas, centre = cam.pickEllipsoid(new C.Cartesian2(cv.clientWidth / 2, cv.clientHeight / 2)), carto = centre ? C.Cartographic.fromCartesian(centre) : cam.positionCartographic;
    const lat = C.Math.toDegrees(carto.latitude), lng = C.Math.toDegrees(carto.longitude), h = cam.positionCartographic.height, fovy = cam.frustum.fovy || 1;
    return { lat, lng, zoomEq: Math.max(1, Math.min(12, Math.log2(cv.clientHeight * 156543 * Math.cos(carto.latitude) / (h * 2 * Math.tan(fovy / 2))))) };
  }
  function heightFor(lat, z) { const cv = scene.canvas, fovy = viewer.camera.frustum.fovy || 1; return cv.clientHeight * 156543 * Math.cos(lat * Math.PI / 180) / (Math.pow(2, z) * 2 * Math.tan(fovy / 2)); }
  function setCamera(cam, animate) {
    let dest;
    if (cam.bounds) { const [[s, w], [n, e]] = cam.bounds, span = Math.max(n - s, (e - w) * Math.cos((s + n) / 2 * Math.PI / 180)) * 111000, fovy = viewer.camera.frustum.fovy || 1, asp = scene.canvas.clientWidth / Math.max(1, scene.canvas.clientHeight);
      dest = pos((s + n) / 2, (w + e) / 2, Math.min(3.6e7, span * 1.25 / (2 * Math.tan(fovy / 2)) / Math.min(1, asp)));
    } else dest = pos(cam.lat, cam.lng, Math.min(3.6e7, heightFor(cam.lat, cam.zoomEq != null ? cam.zoomEq : 4)));
    const o = { destination: dest, orientation: { heading: 0, pitch: -Math.PI / 2, roll: 0 } };
    if (animate && !detailRow.instant && !WM.dom.prefersReducedMotion()) viewer.camera.flyTo(Object.assign({ duration: 0.6 }, o)); else viewer.camera.setView(o);
    scheduleRegroup(); scene.requestRender();
  }
  function focus(lat, lng) { const c = getCamera(); setCamera({ lat, lng, zoomEq: c.zoomEq }, true); }
  function resize() { if (viewer) { viewer.resize(); scheduleRegroup(); scene.requestRender(); } }
  function fpsTest(ms) {
    return new Promise(res => { const t0 = performance.now(); let n = 0; const rm = scene.postRender.addEventListener(() => n++);
      (function step() { const dt = performance.now() - t0; if (dt >= (ms || 3000) || !viewer) { rm(); const f = Math.round(n * 1000 / dt); emit('fps', f); scheduleRegroup(); return res(f); } viewer.camera.rotateRight(0.004); scene.requestRender(); requestAnimationFrame(step); })(); });
  }
  function setDetail(row) { detailRow = row; if (!viewer) return; viewer.resolutionScale = Math.min(window.devicePixelRatio || 1, row.globeScale); if (scene.skyAtmosphere) scene.skyAtmosphere.show = !!row.atmosphere; redrawAll(); }
  return { kind: '3d', load, init, destroy, setTheaters, setEvents, setEventDetail, setLinks, setTracks, setLayer, select, highlight: select, getCamera, setCamera, focus, resize, fpsTest, setDetail, setStyle, redraw: redrawAll, stats: () => lastStats,
    on(name, fn) { (handlers[name] = handlers[name] || []).push(fn); }, setOptions(o) { Object.assign(opts, o); redrawAll(); },
    detail: { lite: 'device ratio 1.0, no atmosphere, 16-point arcs, 300 tracks, camera cuts', standard: 'ratio up to 1.5, atmosphere, 32-point arcs, 1,000 tracks', full: 'ratio up to 2.0, atmosphere, 64-point arcs, 5,000 tracks (terrain needs a keyless source: not built)' } };
};
})();
