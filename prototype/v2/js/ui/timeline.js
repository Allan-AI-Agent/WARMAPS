/* WARMAPS v2 PROTOTYPE — ui/timeline.js
 * The two-level timeline (ARCHITECTURE 5.3, LAYOUT spec 2.3). Detail row: only as many steps as fit at finger
 * size (8 px or more each), with the cursor and the band's edges. Overview row: the whole extent with the window
 * drawn on it as a band. A custom control, not a browser range input.
 */
(function () {
'use strict';
const WM = window.WM = window.WM || {};
const { $, esc, on } = WM.dom, T = WM.time, M = WM.marks;
const icon = (n, px) => M.icon(n, px);
let app, root, stepPx = 10, viewStart = null, playTimer = 0, popOpen = false, hist = null, histKey = '';
const S = () => app.store.get();
const C = () => WM.theme.current().colors;
const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };

/* ---- state helpers ------------------------------------------------------------------------------------- */
function geom() {
  const s = S(), ax = app.sel.axis(s), w = app.sel.windowOf(s);
  return { s, ax, n: ax.steps.length, ci: T.stepIndex(ax, s.time.cursor), fi: s.time.mode === 'all' ? 0 : T.stepIndex(ax, w.fromISO), win: w };
}
function setCursorStep(i, fromPlay) {
  const g = geom(), st = g.ax.steps[Math.max(0, Math.min(g.n - 1, i))], t = g.s.time, endN = T.dc(g.ax.toISO);
  const to = Math.min(st.to, endN), toISO = T.iso(to);
  if (toISO === t.cursor) return;
  let fromISO = t.window.fromISO;
  if (t.mode !== 'all') { const width = T.dc(t.window.toISO) - T.dc(t.window.fromISO); fromISO = T.iso(Math.max(T.dc(g.ax.fromISO), Math.min(st.from, to - width))); }
  app.store.set({ time: Object.assign({}, t, { cursor: toISO, window: { fromISO, toISO }, playing: fromPlay ? t.playing : false }) });
  if (!fromPlay) stopPlay();
}
function setFromStep(i) {
  const g = geom(), t = g.s.time, st = g.ax.steps[Math.max(0, Math.min(g.ci, i))];
  app.store.set({ time: Object.assign({}, t, { mode: 'window', window: { fromISO: T.iso(Math.min(st.from, T.dc(t.cursor))), toISO: t.cursor } }) });
}
function setRange(kind) {
  const g = geom(), t = g.s.time;
  if (kind === 'all') return app.store.set({ time: Object.assign({}, t, { mode: 'all', window: { fromISO: g.ax.fromISO, toISO: t.cursor } }) });
  const from = T.iso(Math.max(T.dc(g.ax.fromISO), T.dc(t.cursor) - (kind - 1)));
  app.store.set({ time: Object.assign({}, t, { mode: 'window', window: { fromISO: from, toISO: t.cursor } }) });
}
function goToday() {
  stopPlay(); const g = geom(), t = g.s.time, end = app.data.todayISO;
  app.store.set({ time: Object.assign({}, t, { mode: 'window', cursor: end, window: { fromISO: T.add(end, -6), toISO: end }, playing: false }) });
  viewStart = null;
}
function rangeText(short) {
  const g = geom(), t = g.s.time, len = T.dc(g.win.toISO) - T.dc(g.win.fromISO) + 1, atEnd = t.cursor === app.data.todayISO;
  if (t.mode === 'all') return 'All';
  if (short) return len + 'd';
  if (atEnd && [7, 30, 90].includes(len)) return 'Last ' + len + ' days';
  return len === 1 ? T.fmtShort(g.win.toISO) : T.fmtShort(g.win.fromISO) + ' to ' + T.fmtShort(g.win.toISO);
}
function longRangeText() { const g = geom(); return g.s.time.mode === 'all' ? 'the whole period' : rangeText(false).replace(/^Last/, 'the last'); }

/* Play: one step per tick, at the band's unit, so it runs fast through monthly history and slows into daily. */
function stopPlay() { if (playTimer) { clearInterval(playTimer); playTimer = 0; } const t = S().time; if (t.playing) app.store.set({ time: Object.assign({}, t, { playing: false }) }); }
function togglePlay() {
  if (playTimer) return stopPlay();
  const g = geom(); if (g.ci >= g.n - 1) setCursorStep(Math.max(0, g.fi), true);
  app.store.set({ time: Object.assign({}, S().time, { playing: true }) });
  playTimer = setInterval(() => { const x = geom(); if (x.ci >= x.n - 1) return stopPlay(); setCursorStep(x.ci + 1, true); }, WM.dom.prefersReducedMotion() ? 1200 : 700);
}

/* Events per step, by theater, counted once in the step of the start date (ARCHITECTURE 5.5). */
function histogram(g) {
  const key = g.s.theaters.join(',') + '|' + g.n + '|' + g.s.time.record + '|' + (g.s.time.record === 'then' ? g.s.time.cursor : '') + '|' + g.s.options.solidRule;
  if (key === histKey) return hist;
  const h = g.ax.steps.map(() => ({})), miles = [], date = app.sel.recordDate(g.s);
  for (const rec of app.data.events) {
    if (!rec.theater.some(t => g.s.theaters.includes(t))) continue;
    const st = app.sel.stateOf(rec, date, g.s); if (!st.known) continue;
    if (T.dc(rec.dateISO) < g.ax.steps[0].from) continue;
    const i = T.stepIndex(g.ax, rec.dateISO), th = rec.theater.find(t => g.s.theaters.includes(t));
    h[i][th] = (h[i][th] || 0) + 1;
    if (rec.tier === 'milestone') miles.push({ i, th, filled: st.look === 'solid' || st.look === 'split' });
  }
  hist = { h, miles, max: Math.max(1, ...h.map(o => Object.values(o).reduce((a, b) => a + b, 0))) }; histKey = key; return hist;
}
function fit(canvas) {
  const r = canvas.parentNode.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 3), w = Math.max(10, Math.round(r.width)), h = Math.max(10, Math.round(r.height));
  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
  const ctx = canvas.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h); return { ctx, w, h };
}
function view(g, w) {
  const N = Math.max(5, Math.min(g.n, Math.floor(w / stepPx)));
  if (viewStart == null) viewStart = g.n - N;
  if (g.ci < viewStart) viewStart = g.ci; if (g.ci > viewStart + N - 1) viewStart = g.ci - N + 1;
  viewStart = Math.max(0, Math.min(g.n - N, viewStart));
  return { N, start: viewStart, sw: w / N };
}

/* ---- drawing ------------------------------------------------------------------------------------------- */
function drawDetail() {
  const cv = $('.tl-track canvas', root); if (!cv) return;
  const g = geom(), { ctx, w, h } = fit(cv), v = view(g, w), c = C(), H = histogram(g), todayI = T.stepIndex(g.ax, app.data.todayISO);
  const x0 = i => (i - v.start) * v.sw;
  const bandL = Math.max(0, x0(g.fi)), bandR = Math.min(w, x0(g.ci + 1));
  ctx.fillStyle = rgba(c['bg-raised'], 0.9); ctx.fillRect(bandL, 2, Math.max(0, bandR - bandL), h - 4);
  ctx.font = '500 10px ' + getComputedStyle(document.documentElement).getPropertyValue('--font-data'); ctx.textBaseline = 'top';
  let lastLabelX = -99;
  for (let i = v.start; i < v.start + v.N && i < g.n; i++) {
    const st = g.ax.steps[i], x = x0(i), inBand = i >= g.fi && i <= g.ci, d = new Date(st.from * 864e5), dom = d.getUTCDate(), mon = d.getUTCMonth(), yr = d.getUTCFullYear();
    const first = st.unit === 'day' ? dom === 1 : st.unit === 'week' ? dom <= 7 : mon === 0;
    ctx.strokeStyle = rgba(c['text-muted'], first ? 0.9 : 0.35); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(Math.round(x) + 0.5, first ? 3 : h - 9); ctx.lineTo(Math.round(x) + 0.5, h - 3); ctx.stroke();
    if (first && x - lastLabelX > 34) { ctx.fillStyle = c['text-muted']; ctx.fillText(st.unit === 'month' ? String(yr) : T.MONTHS[mon] + (mon === 0 ? ' ' + yr : ''), x + 3, 3); lastLabelX = x; }
    let y = h - 4; const cell = H.h[i];
    for (const th of g.s.theaters) { const n = cell[th] || 0; if (!n) continue; const bh = Math.max(3, Math.round(n / H.max * (h - 22))); ctx.fillStyle = rgba(c[M.TOKEN[th]], inBand ? 1 : 0.4); ctx.fillRect(x + 1.5, y - bh, Math.max(2, v.sw - 3), bh); y -= bh + 1; }
    if (i === todayI) { ctx.fillStyle = c['text-secondary']; ctx.beginPath(); ctx.moveTo(x + v.sw / 2 - 4, h); ctx.lineTo(x + v.sw / 2 + 4, h); ctx.lineTo(x + v.sw / 2, h - 5); ctx.fill(); }
  }
  // the band's edges: the left edge is a handle; the right edge is the cursor
  ctx.fillStyle = c.selected;
  if (g.fi >= v.start && g.s.time.mode !== 'all') { ctx.fillRect(Math.round(bandL), 2, 2, h - 4); ctx.fillRect(Math.round(bandL) - 5, h / 2 - 12, 12, 24); ctx.fillStyle = c['bg-base']; ctx.fillRect(Math.round(bandL) - 1, h / 2 - 6, 1, 12); ctx.fillRect(Math.round(bandL) + 2, h / 2 - 6, 1, 12); ctx.fillStyle = c.selected; }
  else { const txt = g.s.time.mode === 'all' ? 'from the start' : 'from ' + T.fmtShort(g.win.fromISO); ctx.fillStyle = c['bg-surface']; ctx.fillRect(0, h - 16, ctx.measureText(txt).width + 10, 14); ctx.fillStyle = c['text-secondary']; ctx.fillText(txt, 4, h - 14); ctx.fillStyle = c.selected; }
  const cx = Math.round(x0(g.ci) + v.sw / 2);
  ctx.fillRect(Math.round(bandR) - 2, 2, 2, h - 4);
  ctx.fillRect(cx - 1, 0, 2, h); ctx.beginPath(); ctx.roundRect ? ctx.roundRect(cx - 6, h / 2 - 14, 12, 28, 3) : ctx.rect(cx - 6, h / 2 - 14, 12, 28); ctx.fill();
  cv.parentNode.setAttribute('aria-valuetext', T.fmt(g.s.time.cursor)); cv.parentNode.setAttribute('aria-valuenow', String(g.ci)); cv.parentNode.setAttribute('aria-valuemax', String(g.n - 1));
  root._v = v; root._w = w;
}
function drawOverview(cv) {
  if (!cv) return;
  const g = geom(), { ctx, w, h } = fit(cv), c = C(), H = histogram(g), px = w / g.n, bandL = g.fi * px, bandR = Math.max(bandL + 6, (g.ci + 1) * px);
  ctx.fillStyle = rgba(c['bg-raised'], 0.6); ctx.fillRect(bandL, 0, bandR - bandL, h);
  const cols = new Map();
  H.h.forEach((cell, i) => { const col = Math.floor(i * px); for (const th of g.s.theaters) if (cell[th]) { const k = col + '|' + th; cols.set(k, Math.max(cols.get(k) || 0, cell[th])); } });
  for (const [k, n] of cols) { const [col, th] = k.split('|'); const bh = Math.max(2, Math.round(n / H.max * (h - 6))); ctx.fillStyle = rgba(c[M.TOKEN[th]], 0.85); ctx.fillRect(+col, h - bh - (th === g.s.theaters[0] ? 0 : 0), Math.max(1.5, px - 0.5), bh); }
  for (const m of H.miles) { const x = m.i * px + px / 2; ctx.strokeStyle = c[M.TOKEN[m.th]]; ctx.fillStyle = c[M.TOKEN[m.th]]; ctx.lineWidth = 1.25; ctx.beginPath(); ctx.moveTo(x, 1); ctx.lineTo(x + 3, 4.5); ctx.lineTo(x, 8); ctx.lineTo(x - 3, 4.5); ctx.closePath(); if (m.filled) ctx.fill(); else ctx.stroke(); }
  ctx.fillStyle = c.selected; ctx.fillRect(Math.round(bandL), 0, 2, h); ctx.fillRect(Math.round(bandR) - 2, 0, 2, h);
  cv._px = px;
}
function drawLabels() {
  const el = $('.tl-labels', root); if (!el || !el.offsetParent) return;
  const g = geom(), w = el.getBoundingClientRect().width, px = w / g.n, years = (T.dc(g.ax.toISO) - T.dc(g.ax.fromISO)) > 800; let html = '', last = -99;
  g.ax.steps.forEach((st, i) => { const d = new Date(st.from * 864e5), isY = d.getUTCMonth() === 0 && d.getUTCDate() <= (st.unit === 'day' ? 1 : 7), isM = d.getUTCDate() <= (st.unit === 'day' ? 1 : 7);
    if ((years ? isY : isM) && i * px - last > 44) { html += `<span style="left:${(i * px).toFixed(0)}px">${years ? d.getUTCFullYear() : T.MONTHS[d.getUTCMonth()] + (d.getUTCMonth() === 0 ? ' ' + d.getUTCFullYear() : '')}</span>`; last = i * px; } });
  el.innerHTML = html;
}
function readout() {
  const g = geom(), s = g.s, days = s.theaters.map(id => app.data.theatersById[id]).filter(t => t.epochISO).map(t => t.prefix + ' ' + t.dayLabel + ' ' + T.dayNumber(t, s.time.cursor).toLocaleString('en-US')).join(' · ');
  const el = $('.tl-read', root); if (!el) return;
  el.innerHTML = `${s.time.record === 'then' ? '<span class="pre">as known on</span>' : ''}<span class="date">${esc(T.fmt(s.time.cursor))}</span><span class="days">${esc(days)}</span>`;
  el.setAttribute('aria-label', (s.time.record === 'then' ? 'As known on ' : '') + T.fmt(s.time.cursor) + (days ? ', ' + days : ''));
  const rc = $('.rangechip', root); if (rc) rc.firstChild.textContent = rangeText(s.layout.cls === 'phone-landscape');
  const pl = $('[data-act="tl-play"]', root); if (pl) { pl.innerHTML = icon(s.time.playing ? 'pause' : 'play'); pl.setAttribute('aria-label', s.time.playing ? 'Pause' : 'Play'); }
  const td = $('[data-act="tl-today"]', root); if (td) td.hidden = s.time.cursor === app.data.todayISO && s.time.mode === 'window' && T.dc(g.win.toISO) - T.dc(g.win.fromISO) === 6;
  for (const b of root.querySelectorAll('[data-rec]')) b.setAttribute('aria-checked', String(b.dataset.rec === s.time.record));
  root.classList.toggle('then', s.time.record === 'then');
}
function draw() { if (!root) return; readout(); drawDetail(); drawOverview($('.tl-over canvas', root)); drawLabels(); const p = $('.tl-pop .tl-over canvas'); if (p) drawOverview(p); }

/* ---- structure ----------------------------------------------------------------------------------------- */
function build() {
  const c = S().layout.cls, reduced = WM.dom.prefersReducedMotion();
  const rec = `<div class="seg recseg" role="radiogroup" aria-label="Which record" data-tour="record"><button role="radio" data-rec="today" title="Each event as the record stands now">Record today</button><button role="radio" data-rec="then" title="Each event as the record stood on the cursor date">As known then</button></div>`;
  root.innerHTML = `<div class="tl-main">
      <div class="tl-ctl tl-row">${rec}
        <button class="iconbtn tl-step" data-act="tl-prev" aria-label="Previous step">${icon('prev')}</button>
        <button class="tl-read" data-act="tl-read" aria-haspopup="true"></button>
        <button class="btn quiet rangechip" data-act="tl-range" aria-haspopup="true" title="Period shown"><span></span>${icon('chevron', 14)}</button>
        ${reduced ? '' : `<button class="iconbtn" data-act="tl-play" aria-label="Play">${icon('play')}</button>`}
        <button class="iconbtn tl-step" data-act="tl-next" aria-label="Next step">${icon('next')}</button>
        <button class="btn small" data-act="tl-today" title="Back to today and the last 7 days">Today</button>
      </div>
      <div class="tl-track" role="slider" tabindex="0" aria-label="Timeline cursor" aria-valuemin="0" data-tour="timeline"><canvas></canvas></div>
    </div>
    <div class="tl-over" aria-hidden="true" title="The whole period. Drag the band to move it; drag an edge to widen it."><canvas></canvas></div>
    <div class="tl-labels" aria-hidden="true"></div>`;
  if (reduced) for (const b of root.querySelectorAll('.tl-step')) b.style.display = 'inline-flex';
  root.dataset.cls = c; viewStart = null; draw();
}

/* ---- pointer work: one gesture, one owner; the timeline keeps a drag that started on it -------------------- */
function bindTrack() {
  const pts = new Map(); let mode = null, pinch = null, lastTap = 0, edgeTimer = 0, lastX = 0;
  const track = () => $('.tl-track', root);
  const stepAt = x => { const v = root._v; return v.start + Math.max(0, Math.min(v.N - 1, Math.floor(x / v.sw))); };
  const xOf = ev => ev.clientX - track().getBoundingClientRect().left;
  const apply = x => { if (mode === 'from') setFromStep(stepAt(x)); else setCursorStep(stepAt(x)); };
  root.addEventListener('pointerdown', ev => {
    const t = ev.target.closest('.tl-track'); if (!t) return;
    t.setPointerCapture(ev.pointerId); pts.set(ev.pointerId, ev.clientX);
    if (pts.size === 2) { const xs = [...pts.values()]; pinch = { d: Math.abs(xs[0] - xs[1]) || 1, px: stepPx }; mode = null; return; }
    const now = performance.now(); if (now - lastTap < 320) { lastTap = 0; goToday(); return; } lastTap = now;
    const g = geom(), v = root._v, x = xOf(ev), xl = (g.fi - v.start) * v.sw;
    mode = g.s.time.mode !== 'all' && g.fi >= v.start && g.fi < g.ci && Math.abs(x - xl) <= 16 ? 'from' : 'cursor';
    lastX = x; apply(x);
    clearInterval(edgeTimer); edgeTimer = setInterval(() => { // near an end of the row, the view scrolls so any part of the extent can be reached
      const w = root._w, g2 = geom(); if (!mode) return;
      if (lastX < 14 && viewStart > 0) { viewStart--; apply(2); drawDetail(); } else if (lastX > w - 14 && viewStart < g2.n - root._v.N) { viewStart++; apply(w - 2); drawDetail(); }
    }, 70);
  });
  root.addEventListener('pointermove', ev => {
    if (!pts.has(ev.pointerId)) return; pts.set(ev.pointerId, ev.clientX);
    if (pinch && pts.size === 2) { const xs = [...pts.values()], d = Math.abs(xs[0] - xs[1]) || 1; stepPx = Math.max(8, Math.min(40, pinch.px * d / pinch.d)); viewStart = null; draw(); return; }
    if (mode) { lastX = xOf(ev); apply(lastX); }
  });
  const end = ev => { pts.delete(ev.pointerId); if (pts.size < 2) pinch = null; if (!pts.size) { mode = null; clearInterval(edgeTimer); } };
  root.addEventListener('pointerup', end); root.addEventListener('pointercancel', end);
  root.addEventListener('wheel', ev => { if (!ev.target.closest('.tl-track')) return; ev.preventDefault(); const g = geom();
    if (ev.ctrlKey || ev.metaKey) { stepPx = Math.max(8, Math.min(40, stepPx * (ev.deltaY < 0 ? 1.15 : 0.87))); viewStart = null; } else viewStart = Math.max(0, Math.min(g.n - root._v.N, (viewStart || 0) + Math.sign(ev.deltaY || ev.deltaX) * 3));
    draw(); }, { passive: false });
  root.addEventListener('keydown', ev => { if (!ev.target.closest('.tl-track')) return; const g = geom();
    if (ev.key === 'ArrowLeft') { setCursorStep(g.ci - 1); ev.preventDefault(); } else if (ev.key === 'ArrowRight') { setCursorStep(g.ci + 1); ev.preventDefault(); }
    else if (ev.key === 'Home') { setCursorStep(0); ev.preventDefault(); } else if (ev.key === 'End') { goToday(); ev.preventDefault(); } });
}
/* The overview: one object, the band. Drag it to move the window; drag an edge to widen; tap elsewhere to jump. */
function bindOverview(host) {
  let d = null;
  host.addEventListener('pointerdown', ev => {
    const o = ev.target.closest('.tl-over'); if (!o) return; o.setPointerCapture(ev.pointerId);
    const g = geom(), r = o.getBoundingClientRect(), px = r.width / g.n, x = ev.clientX - r.left, bl = g.fi * px, br = Math.max(bl + 6, (g.ci + 1) * px), wide = br - bl >= 40;
    let kind = 'move';
    if (wide && Math.abs(x - bl) <= 12 && g.s.time.mode !== 'all') kind = 'from'; else if (wide && Math.abs(x - br) <= 12) kind = 'to';
    else if (x < bl - 12 || x > br + 12) { setCursorStep(Math.round(x / px + (g.ci - g.fi) / 2)); }
    const g2 = geom(); d = { o, kind, px, off: x - (g2.ci + 1) * px, width: T.dc(g2.win.toISO) - T.dc(g2.win.fromISO) };
  });
  host.addEventListener('pointermove', ev => {
    if (!d) return; const r = d.o.getBoundingClientRect(), x = ev.clientX - r.left, g = geom();
    if (d.kind === 'from') setFromStep(Math.floor(x / d.px));
    else if (d.kind === 'to') { const i = Math.max(g.fi, Math.min(g.n - 1, Math.floor(x / d.px))), st = g.ax.steps[i], to = T.iso(Math.min(st.to, T.dc(g.ax.toISO))); app.store.set({ time: Object.assign({}, g.s.time, { cursor: to, window: { fromISO: g.s.time.mode === 'all' ? g.ax.fromISO : g.win.fromISO, toISO: to } }) }); }
    else setCursorStep(Math.floor((x - d.off) / d.px) - 1 + (d.off >= 0 ? 0 : 0));
  });
  const end = () => { d = null; }; host.addEventListener('pointerup', end); host.addEventListener('pointercancel', end);
}
/* Slim timeline (phone landscape): tapping the readout shows the overview, the record switch and the step buttons. */
function togglePop() {
  const old = $('.tl-pop'); if (old) { old.remove(); popOpen = false; return; }
  const p = document.createElement('div'); p.className = 'tl-pop plate';
  p.innerHTML = `<div class="tl-over"><canvas></canvas></div><div class="tl-row" style="flex-wrap:wrap;gap:var(--s2)">
    <div class="seg" role="radiogroup" aria-label="Which record"><button role="radio" data-rec="today">Record today</button><button role="radio" data-rec="then">As known then</button></div>
    <button class="iconbtn" data-act="tl-prev" aria-label="Previous step">${icon('prev')}</button><button class="iconbtn" data-act="tl-next" aria-label="Next step">${icon('next')}</button>
    <span class="seg">${[7, 30, 90].map(n => `<button data-range="${n}">${n}d</button>`).join('')}<button data-range="all">All</button></span>
    <button class="iconbtn" data-act="tl-pop-close" aria-label="Close">${icon('x')}</button></div>`;
  root.appendChild(p); popOpen = true; bindOverview(p); draw();
  for (const b of p.querySelectorAll('[data-rec]')) b.setAttribute('aria-checked', String(b.dataset.rec === S().time.record));
}

function init(a) {
  app = a; root = $('#timeline');
  build(); bindTrack(); bindOverview(root);
  on(root, 'click', '[data-rec]', (ev, el) => { app.store.set({ time: Object.assign({}, S().time, { record: el.dataset.rec }) }); for (const b of root.querySelectorAll('[data-rec]')) b.setAttribute('aria-checked', String(b.dataset.rec === el.dataset.rec)); });
  on(root, 'click', '[data-act="tl-prev"]', () => setCursorStep(geom().ci - 1));
  on(root, 'click', '[data-act="tl-next"]', () => setCursorStep(geom().ci + 1));
  on(root, 'click', '[data-act="tl-play"]', togglePlay);
  on(root, 'click', '[data-act="tl-today"]', goToday);
  on(root, 'click', '[data-act="tl-pop-close"]', togglePop);
  on(root, 'click', '[data-range]', (ev, el) => setRange(el.dataset.range === 'all' ? 'all' : +el.dataset.range));
  on(root, 'click', '[data-act="tl-read"]', (ev, el) => {
    const c = S().layout.cls;
    if (c === 'phone-landscape') return togglePop();
    if (c === 'phone-portrait') { WM.layout.popover(el, pop => { pop.innerHTML = `<h3 class="sub">Step through time</h3><button class="row" data-s="-1">${icon('prev')}<span class="grow">Previous step</span></button><button class="row" data-s="1">${icon('next')}<span class="grow">Next step</span></button><button class="row" data-s="0">${icon('today')}<span class="grow">Today, last 7 days</span></button>`; }, { label: 'Step through time', keys: [] });
      on(WM.layout.popState().pop, 'click', '[data-s]', (e2, b) => { const k = +b.dataset.s; if (k === 0) { goToday(); WM.layout.closePopover(); } else setCursorStep(geom().ci + k); }); }
  });
  on(root, 'click', '[data-act="tl-range"]', (ev, el) => {
    WM.layout.popover(el, pop => { const t = S().time, len = T.dc(t.window.toISO) - T.dc(t.window.fromISO) + 1;
      pop.innerHTML = '<h3 class="sub">Period shown</h3>' + [[7, '7 days'], [30, '30 days'], [90, '90 days'], ['all', 'All: the whole period']].map(([k, l]) => `<button class="row" data-r="${k}" aria-pressed="${k === 'all' ? t.mode === 'all' : t.mode !== 'all' && len === k}">${k === 'all' ? t.mode === 'all' ? icon('check', 18) : '<span style="width:18px"></span>' : t.mode !== 'all' && len === k ? icon('check', 18) : '<span style="width:18px"></span>'}<span class="grow">${l}</span></button>`).join('') +
        '<p class="note pad">Older events are drawn fainter when the period is longer than 30 days.</p>'; }, { label: 'Period shown', keys: ['time'] });
    on(WM.layout.popState().pop, 'click', '[data-r]', (e2, b) => { setRange(b.dataset.r === 'all' ? 'all' : +b.dataset.r); WM.layout.closePopover(); });
  });
  app.store.subscribe(['time', 'theaters', 'options'], (s, ch) => { if (ch.has('theaters')) viewStart = null; draw(); });
  app.store.subscribe(['layout'], s => { if (root.dataset.cls !== s.layout.cls) build(); else { viewStart = null; draw(); } });
  document.addEventListener('wm:theme', draw);
  if (window.ResizeObserver) new ResizeObserver(() => draw()).observe(root);
}
WM.timeline = { init, draw, setCursorStep, setRange, goToday, togglePlay, stopPlay, rangeText, longRangeText, geom, stepPx: () => stepPx, trackInfo: () => ({ width: root._w, steps: root._v ? root._v.N : 0, stepW: root._v ? root._v.sw : 0 }) };
})();
