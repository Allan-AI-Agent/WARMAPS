/* WARMAPS v2 PROTOTYPE — ui/layout.js
 * The panel system (LAYOUT_ENGINE_SPEC). Panels live in slots that tile the screen; a slot has a place and a
 * size, so panels cannot overlap. The layout class comes from the viewport and the pointer, never a device name.
 * Logical slots: left (primary; the sheet on a phone), right, bottom (PC), float (PC). The info card follows the
 * selection and stacks over a panel with a Back arrow.
 */
(function () {
'use strict';
const WM = window.WM = window.WM || {};
const { $, $$, esc, on, store: disk, toast } = WM.dom;
const icon = (n, px) => WM.marks.icon(n, px);
const K = 'wm2proto.layout.v1';
const panels = {}, order = [];
let app, popState = null, histDepth = 0, suppressPop = 0, mounted = {}, sheetMemory = null;

function classOf(w, h, coarse) {
  if (h < 500 && w > h) return 'phone-landscape';
  if (w < 600) return 'phone-portrait';
  if (w < 1024 && h >= w) return 'tablet-portrait';
  if (w < 1366 && coarse) return 'tablet-landscape';
  return 'pc';
}
const isPhone = c => c === 'phone-portrait' || c === 'phone-landscape';
const slotsFor = c => isPhone(c) ? ['left'] : c === 'pc' ? ['left', 'right', 'bottom'] : ['left', 'right'];
const S = () => app.store.get();
const P = () => S().panels;
const setP = patch => app.store.set({ panels: Object.assign({}, P(), patch) });

function register(def) { panels[def.id] = def; if (!def.hidden) order.push(def.id); order.sort((a, b) => panels[a].order - panels[b].order); }

/* ---- which slot shows what --------------------------------------------------------------------------- */
function cardSlot(s) {
  s = s || S(); if (!s.selection) return null;
  if (s.cleanView) return 'clean';
  const c = s.layout.cls, sl = s.panels.slots;
  if (isPhone(c)) return 'left';
  if (!(sl.right.panel && sl.right.pinned)) return 'right';
  if (!(sl.left.panel && sl.left.pinned)) return 'left';
  return 'pop';
}
const whereIs = id => { const p = P(); for (const k of ['left', 'right', 'bottom']) if (p.slots[k].panel === id) return k; return p.floats.some(f => f.panel === id) ? 'float' : null; };
function openPanels() { const c = S().layout.cls, p = P(); return slotsFor(c).filter(k => p.slots[k].panel).map(k => p.slots[k].panel).concat(c === 'pc' ? p.floats.map(f => f.panel) : []); }

function open(id, opts) {
  const s = S(), c = s.layout.cls, p = P(), cur = whereIs(id), visible = cur && (cur === 'float' ? c === 'pc' : slotsFor(c).includes(cur));
  if (visible) {
    if (isPhone(c) && s.selection) { app.select(null); return; }       // the card was stacked over it: go back to the panel
    if (!(opts && opts.keep)) close(id);                                // tapping the open item closes it
    return;
  }
  const slots = Object.assign({}, p.slots);
  let target = opts && opts.slot;
  if (!target || !slotsFor(c).includes(target)) target = slotsFor(c).find(k => !(slots[k].panel && slots[k].pinned));
  if (!target) { toast('Every slot holds a pinned panel. Unpin one to open ' + panels[id].title + '.'); return; }
  for (const k of Object.keys(slots)) if (slots[k].panel === id) slots[k] = { panel: null, pinned: false };
  slots[target] = { panel: id, pinned: false };
  app.store.batch(() => {
    if (isPhone(c) && s.selection) app.store.set({ selection: null });
    setP({ slots, floats: p.floats.filter(f => f.panel !== id), sheet: 'half' });
  });
}
function close(id) {
  const p = P(), slots = Object.assign({}, p.slots);
  for (const k of Object.keys(slots)) if (slots[k].panel === id) slots[k] = { panel: null, pinned: false };
  setP({ slots, floats: p.floats.filter(f => f.panel !== id) });
}
function pin(id) { const p = P(), k = whereIs(id); if (!k || k === 'float') return; setP({ slots: Object.assign({}, p.slots, { [k]: { panel: id, pinned: !p.slots[k].pinned } }) }); }
function move(id, to) {
  const p = P(), from = whereIs(id), slots = Object.assign({}, p.slots); let floats = p.floats.filter(f => f.panel !== id);
  if (to === 'float') { if (from && from !== 'float') slots[from] = { panel: null, pinned: false }; floats = floats.concat([{ panel: id, x: 120 + floats.length * 24, y: 90 + floats.length * 24 }]).slice(-4); }
  else {
    const there = slots[to], mine = from && from !== 'float' ? slots[from] : { panel: id, pinned: false };
    slots[to] = { panel: id, pinned: mine.pinned };
    if (from && from !== 'float') slots[from] = there.panel ? there : { panel: null, pinned: false };       // swap, so nothing is lost
  }
  setP({ slots, floats });
}

/* ---- rendering ----------------------------------------------------------------------------------------- */
function frame(kind, id, slot, stacked) {
  const s = S(), c = s.layout.cls, p = P();
  if (kind === 'card') {
    const ref = s.selection, t = WM.cards.title(ref);
    return `<section class="panel is-card" data-kind="card" aria-label="${esc(t.kind)} card"><header class="ph"><span class="grab"></span>
      ${stacked ? `<button class="iconbtn" data-act="card-back" aria-label="Back to the panel">${icon('back')}</button>` : ''}
      <h2 class="ttl"><span class="mk">${t.mark}</span><span class="tx">${esc(t.text)}</span></h2>
      ${ref.type !== 'group' ? `<button class="iconbtn" data-act="card-expand" aria-label="${p.cardExpanded ? 'Show less' : 'Show the entries'}" aria-expanded="${p.cardExpanded}">${icon(p.cardExpanded ? 'up' : 'chevron')}</button>` : ''}
      <button class="iconbtn" data-act="card-close" aria-label="Close the card">${icon('x')}</button></header><div class="pb" tabindex="-1"></div></section>`;
  }
  const d = panels[id], pinned = slot !== 'float' && p.slots[slot] && p.slots[slot].pinned, badge = d.badge ? d.badge(app) : '';
  return `<section class="panel" data-kind="panel" data-panel="${id}" aria-label="${esc(d.title)}"><header class="ph"><span class="grab"></span>
    <span class="ttl">${icon(d.icon, 20)}${esc(d.title)}<span class="badge">${esc(badge)}</span></span>
    ${slot !== 'float' ? `<button class="iconbtn${pinned ? ' on' : ''}" data-act="pin" data-id="${id}" aria-pressed="${!!pinned}" aria-label="${pinned ? 'Unpin' : 'Pin'} this panel" title="${pinned ? 'Pinned: stays until you close it' : 'Pin: keep this panel'}">${icon('pin', 20)}</button>` : ''}
    ${!isPhone(c) ? `<button class="iconbtn" data-act="move" data-id="${id}" aria-label="Move this panel" title="Move">${icon('move', 20)}</button>` : ''}
    <button class="iconbtn" data-act="close" data-id="${id}" aria-label="Close ${esc(d.title)}">${icon('x', 20)}</button></header><div class="pb" tabindex="-1"></div></section>`;
}
function fill(host, kind, id) {
  const body = $('.pb', host); if (!body) return;
  const top = body.scrollTop;
  try {
    if (kind === 'card') WM.cards.render(body, S().selection, { expanded: P().cardExpanded });
    else panels[id].render(body, app);
  } catch (e) { WM.reportError(kind === 'card' ? 'the info card' : panels[id].title, e); }
  body.scrollTop = top;
}
function renderSlots() {
  const s = S(), c = s.layout.cls, p = P(), cs = cardSlot(s), avail = slotsFor(c);
  mounted = {};
  for (const k of ['left', 'right', 'bottom']) {
    const host = $('#slot-' + k), pid = avail.includes(k) ? p.slots[k].panel : null, showCard = cs === k;
    const key = showCard ? 'card:' + (pid || '') + ':' + p.cardExpanded + ':' + s.selection.type + ':' + s.selection.id + ':' + s.lens.mode : pid ? 'panel:' + pid + ':' + p.slots[k].pinned + ':' + c : '';
    host.classList.toggle('open', !!key);
    if (host.dataset.key !== key) { host.dataset.key = key; host.innerHTML = key ? frame(showCard ? 'card' : 'panel', pid, k, showCard && !!pid) : ''; }
    if (key) { mounted[k] = showCard ? { kind: 'card' } : { kind: 'panel', id: pid }; fill(host, mounted[k].kind, pid); }
  }
  const L = $('#slot-left'), R = $('#slot-right');
  L.classList.toggle('alone', !R.classList.contains('open')); R.classList.toggle('alone', !L.classList.contains('open'));
  // floating panels (PC only)
  const fl = $('#floats'), want = c === 'pc' ? p.floats : [];
  $$('.float', fl).forEach(n => { if (!want.some(f => f.panel === n.dataset.panel)) n.remove(); });
  for (const f of want) {
    let n = $(`.float[data-panel="${f.panel}"]`, fl);
    if (!n) { n = document.createElement('div'); n.className = 'float'; n.dataset.panel = f.panel; n.style.left = f.x + 'px'; n.style.top = f.y + 'px'; n.innerHTML = frame('panel', f.panel, 'float'); fl.appendChild(n); }
    mounted['float:' + f.panel] = { kind: 'panel', id: f.panel, host: n }; fill(n, 'panel', f.panel);
  }
  // the card as a popover (both slots pinned) or over the clean stage
  const cc = $('#cleancard');
  if (cs === 'clean' || cs === 'pop') { cc.hidden = false; cc.className = 'clean-card plate peek'; cc.innerHTML = '<div class="pb"></div>'; WM.cards.render($('.pb', cc), s.selection, { expanded: false, floating: true }); }
  else { cc.hidden = true; cc.innerHTML = ''; }
  applySheet(); renderRail(); syncHistory(); persist();
  if (app.view && app.view.resize) requestAnimationFrame(() => app.view.resize());
}
function refresh(changed) {
  for (const [k, m] of Object.entries(mounted)) {
    const keys = m.kind === 'card' ? ['selection', 'time', 'lens', 'options', 'show', 'theaters'] : panels[m.id].keys;
    if (!keys || keys.some(x => changed.has(x))) fill(m.host || $('#slot-' + k), m.kind, m.id);
  }
  // titles carry a badge that may change (counts)
  for (const [k, m] of Object.entries(mounted)) if (m.kind === 'panel' && panels[m.id].badge) { const b = $('.ph .badge', m.host || $('#slot-' + k)); if (b) b.textContent = panels[m.id].badge(app); }
}

/* ---- the phone sheet: three detents (peek, half, full) -------------------------------------------------- */
function sheetHeights() {
  const st = $('#stage').getBoundingClientRect().height, isCard = cardSlot() === 'left';
  // LAYOUT spec says peek is 96 px; a card needs about 132 px to show its chip and status line (see REVIEW notes)
  return { peek: Math.min(isCard ? 132 : 96, st - 8), half: Math.round(st * 0.5), full: Math.max(120, st - 8) };
}
function applySheet() {
  const s = S(), c = s.layout.cls, root = document.documentElement, L = $('#slot-left');
  if (c !== 'phone-portrait' || !L.classList.contains('open')) { root.dataset.sheet = ''; L.style.removeProperty('--sheet-h'); return; }
  const det = P().sheet || 'half';
  if (root.dataset.sheet === 'full' && det !== 'full') { root.dataset.sheet = det; }
  const h = sheetHeights(); root.dataset.sheet = det; L.style.setProperty('--sheet-h', h[det] + 'px');
  L.classList.toggle('peek', det === 'peek');
}
function bindSheetDrag() {
  const L = $('#slot-left'); let drag = null;
  L.addEventListener('pointerdown', ev => {
    if (S().layout.cls !== 'phone-portrait') return;
    const head = ev.target.closest('.ph'); if (!head || ev.target.closest('button')) return;
    drag = { y: ev.clientY, h: L.getBoundingClientRect().height, moved: false, t: performance.now() }; L.classList.add('dragging'); head.setPointerCapture(ev.pointerId);
  });
  L.addEventListener('pointermove', ev => { if (!drag) return; const dy = drag.y - ev.clientY; if (Math.abs(dy) > 4) drag.moved = true; L.style.setProperty('--sheet-h', Math.max(40, drag.h + dy) + 'px'); });
  const end = ev => {
    if (!drag) return; L.classList.remove('dragging');
    const h = sheetHeights(), cur = drag.h + (drag.y - ev.clientY), v = (drag.y - ev.clientY) / Math.max(1, performance.now() - drag.t), d = drag; drag = null;
    if (!d.moved) { // a tap on the header steps the detent up, so the sheet never needs a drag
      const det = P().sheet; setP({ sheet: det === 'peek' ? 'half' : det === 'half' ? 'full' : 'half' }); return; }
    if (cur < h.peek - 36 || (P().sheet === 'peek' && v < -0.5)) { closeTop(true); return; }
    let det = [['peek', h.peek], ['half', h.half], ['full', h.full]].sort((a, b) => Math.abs(a[1] - cur) - Math.abs(b[1] - cur))[0][0];
    if (v > 0.6) det = det === 'peek' ? 'half' : 'full'; else if (v < -0.6) det = det === 'full' ? 'half' : 'peek';
    if (det === P().sheet) applySheet(); else setP({ sheet: det });
  };
  L.addEventListener('pointerup', end); L.addEventListener('pointercancel', end);
  // phone landscape: swipe the side sheet's header left to close it
  let sx = null; L.addEventListener('touchstart', ev => { sx = S().layout.cls === 'phone-landscape' && ev.target.closest('.ph') ? ev.touches[0].clientX : null; }, { passive: true });
  L.addEventListener('touchend', ev => { if (sx != null && sx - ev.changedTouches[0].clientX > 60) closeTop(true); sx = null; }, { passive: true });
}

/* ---- dock rail ---------------------------------------------------------------------------------------- */
function railCount(c) {
  if (c === 'phone-portrait') return 4;
  if (c === 'phone-landscape') { const h = window.innerHeight; return Math.max(1, Math.floor((h - 4 * 48 - 6) / 48) - 1); }   // top group, then what fits, then More
  return order.length;
}
function renderRail() {
  const s = S(), c = s.layout.cls, p = P(), n = railCount(c), openIds = openPanels();
  const item = id => { const d = panels[id], k = whereIs(id), isOpen = openIds.includes(id);
    return `<button class="rail-item${isOpen ? ' open' : ''}${k && k !== 'float' && p.slots[k].pinned ? ' pinned' : ''}" data-act="rail" data-id="${id}" aria-pressed="${isOpen}" title="${esc(d.title)}" data-tour="${id}">${icon(d.icon)}<span class="lbl">${esc(d.short || d.title)}</span><i class="pinmark"></i></button>`; };
  let html = '';
  if (c === 'phone-landscape') {
    const th = s.theaters.length === 1 ? app.data.theatersById[s.theaters[0]].prefix : 'ALL';
    html += `<div class="rail-top"><button class="rail-item" data-act="theater-menu" title="Theaters" aria-label="Theaters: ${esc(th)}"><span class="rail-chip">${esc(th)}</span>${icon('chevron', 14)}</button>
      <button class="rail-item" data-act="toggle-view" title="Switch between the 2D map and the globe" aria-label="View: ${s.viewMode === '3d' ? 'globe' : '2D map'}">${icon(s.viewMode === '3d' ? 'globe' : 'map')}</button>
      <button class="rail-item${whereIs('layers') ? ' open' : ''}" data-act="layers" title="Layers, lens and legend" aria-label="Layers" data-tour="layers">${icon('layers')}</button>
      <button class="rail-item" data-act="clean" title="Clean view" aria-label="Clean view" data-tour="clean">${icon('clean')}</button></div><div class="rail-sep"></div>`;
  }
  const shown = order.slice(0, n), rest = order.slice(n);
  // an open panel that lives under More takes the last visible place, so the open item is always in sight
  const hiddenOpen = rest.find(id => openIds.includes(id)); if (hiddenOpen && shown.length) { rest.splice(rest.indexOf(hiddenOpen), 1, shown[shown.length - 1]); shown[shown.length - 1] = hiddenOpen; }
  html += shown.map(item).join('');
  if (rest.length) html += `<button class="rail-item" data-act="rail-more" title="More panels" aria-haspopup="true">${icon('more')}<span class="lbl">More</span></button>`;
  const rail = $('#rail'); rail.innerHTML = html; rail.dataset.rest = rest.join(',');
}

/* ---- popovers: one at a time; a bottom sheet on phones -------------------------------------------------- */
function popover(anchor, build, opts) {
  closePopover(true);
  const host = $('#popovers'), c = S().layout.cls, sheet = isPhone(c) && !(opts && opts.noSheet);
  const scrim = document.createElement('div'); scrim.className = 'pop-scrim'; if (!sheet) scrim.style.background = 'transparent';
  const pop = document.createElement('div'); pop.className = 'popover' + (sheet ? ' sheetlike' : ''); pop.setAttribute('role', 'dialog'); if (opts && opts.label) pop.setAttribute('aria-label', opts.label);
  host.appendChild(scrim); host.appendChild(pop);
  const rebuild = () => { const top = pop.scrollTop; try { build(pop); } catch (e) { WM.reportError('a menu', e); } pop.scrollTop = top; };
  rebuild();
  if (!sheet && anchor) {
    const r = anchor.getBoundingClientRect(), pw = pop.offsetWidth, ph = pop.offsetHeight, vw = window.innerWidth, vh = window.innerHeight;
    let x = (opts && opts.alignRight) ? r.right - pw : r.left, y = r.bottom + 6;
    if (opts && opts.side === 'right') { x = r.right + 6; y = r.top; }
    if (y + ph > vh - 8) y = Math.max(8, r.top - ph - 6 > 8 && !(opts && opts.side) ? r.top - ph - 6 : vh - ph - 8);
    pop.style.left = Math.max(8, Math.min(x, vw - pw - 8)) + 'px'; pop.style.top = y + 'px';
  }
  scrim.addEventListener('click', () => closePopover());
  popState = { pop, scrim, rebuild, keys: opts && opts.keys, id: opts && opts.id, onClose: opts && opts.onClose };
  syncHistory();
  const f = pop.querySelector('button, input, [tabindex]'); if (f && !isPhone(c)) f.focus();
  return popState;
}
function closePopover(silent) { if (!popState) return; const ps = popState; popState = null; ps.pop.remove(); ps.scrim.remove(); if (ps.onClose) ps.onClose(); if (!silent) syncHistory(); }

/* ---- System Back closes the top surface: popover, card, panel, clean view (LAYOUT spec 7) ----------------- */
function surfaces() { const s = S(); return (popState ? 1 : 0) + (s.selection ? 1 : 0) + openPanels().length + (s.cleanView ? 1 : 0) + (WM.tour && WM.tour.active() ? 1 : 0); }
function syncHistory() {
  const want = surfaces();
  try {
    while (histDepth < want) { history.pushState({ wm: histDepth + 1 }, ''); histDepth++; }
    if (histDepth > want) { const n = histDepth - want; histDepth = want; suppressPop += 1; history.go(-n); }
  } catch (e) { /* history unavailable: Back simply leaves */ }
}
function closeTop(fromUi) {
  const s = S();
  if (WM.tour && WM.tour.active()) { WM.tour.end(); return true; }
  if (popState) { closePopover(!fromUi ? true : false); if (!fromUi) syncHistory(); return true; }
  if (s.selection) { app.select(null); return true; }
  if (s.cleanView) { app.store.set({ cleanView: false }); return true; }      // sitting 2: clean view is the top surface, so Back or Escape restores the panels that were open (check 18) instead of closing one of them unseen
  const c = s.layout.cls, p = P(), ids = openPanels();
  if (ids.length) { const transient = slotsFor(c).map(k => p.slots[k]).filter(x => x.panel && !x.pinned).map(x => x.panel).pop(); close(transient || ids[ids.length - 1]); return true; }
  if (s.cleanView) { app.store.set({ cleanView: false }); return true; }
  return false;
}
function onPop() {
  if (suppressPop > 0) { suppressPop--; return; }
  if (histDepth > 0) { histDepth--; closeTop(false); syncHistory(); }
}

/* ---- persistence per layout class ---------------------------------------------------------------------- */
function persist() { const s = S(), all = disk.get(K, {}) || {}; all[s.layout.cls] = { slots: s.panels.slots, floats: s.panels.floats }; disk.set(K, all); }
function restoreFor(cls) {
  const all = disk.get(K, null), sv = all && all[cls], blank = { left: { panel: null, pinned: false }, right: { panel: null, pinned: false }, bottom: { panel: null, pinned: false } };
  if (!sv || !sv.slots) return { slots: blank, floats: [] };
  const ok = x => x && typeof x === 'object' && (x.panel === null || (panels[x.panel] && !panels[x.panel].hidden)) ? { panel: x.panel, pinned: !!x.pinned && !!x.panel } : { panel: null, pinned: false };
  return { slots: { left: ok(sv.slots.left), right: ok(sv.slots.right), bottom: ok(sv.slots.bottom) }, floats: (Array.isArray(sv.floats) ? sv.floats : []).filter(f => f && panels[f.panel]).slice(0, 4).map(f => ({ panel: f.panel, x: +f.x || 120, y: +f.y || 90 })) };
}
function reset() { disk.del(K); setP({ slots: { left: { panel: null, pinned: false }, right: { panel: null, pinned: false }, bottom: { panel: null, pinned: false } }, floats: [], sheet: 'half', cardExpanded: false }); toast('Layout reset.'); }

function measure() {
  const w = window.innerWidth, h = window.innerHeight, coarse = window.matchMedia('(pointer: coarse)').matches;
  const force = new URLSearchParams(location.search).get('layout');
  return { cls: ['phone-portrait', 'phone-landscape', 'tablet-portrait', 'tablet-landscape', 'pc'].includes(force) ? force : classOf(w, h, coarse), w, h, coarse, dpr: window.devicePixelRatio || 1 };
}
function onResize() {
  const m = measure(), s = S(), root = document.documentElement;
  if (m.cls !== s.layout.cls || m.w !== s.layout.w || m.h !== s.layout.h) app.store.set({ layout: m });     // open panels are re-placed by the slot mapping; nothing closes
  root.dataset.layout = m.cls;
  const th = WM.theme.current(), dens = S().density || (th ? th.density : 'auto');
  root.dataset.compact = (m.cls === 'pc' && !m.coarse && dens === 'compact') ? '1' : '0';
  applySheet();
}

function menuMove(btn, id) {
  const c = S().layout.cls, from = whereIs(id), opts = slotsFor(c).concat(c === 'pc' ? ['float'] : []).filter(k => k !== from);
  const name = { left: c === 'tablet-portrait' ? 'Bottom left' : 'Left', right: c === 'tablet-portrait' ? 'Bottom right' : 'Right', bottom: 'Bottom', float: 'Float' };
  popover(btn, pop => { pop.innerHTML = `<h3 class="sub">Move ${esc(panels[id].title)} to</h3>` + opts.map(k => `<button class="row" data-move="${k}">${esc(name[k])}</button>`).join(''); }, { alignRight: true, label: 'Move panel' });
  on(popState.pop, 'click', '[data-move]', (ev, el) => { closePopover(); move(id, el.dataset.move); });
}
function bindFloatDrag() {
  const fl = $('#floats'); let d = null;
  fl.addEventListener('pointerdown', ev => { const h = ev.target.closest('.float .ph'); if (!h || ev.target.closest('button')) return; const n = h.closest('.float'), r = n.getBoundingClientRect(); d = { n, dx: ev.clientX - r.left, dy: ev.clientY - r.top }; h.setPointerCapture(ev.pointerId); });
  fl.addEventListener('pointermove', ev => { if (!d) return; const x = Math.max(0, Math.min(window.innerWidth - 120, ev.clientX - d.dx)), y = Math.max(0, Math.min(window.innerHeight - 48, ev.clientY - d.dy)); d.n.style.left = x + 'px'; d.n.style.top = y + 'px'; });
  const end = () => { if (!d) return; const p = P(), id = d.n.dataset.panel, x = parseInt(d.n.style.left, 10), y = parseInt(d.n.style.top, 10); d = null; app.store.set({ panels: Object.assign({}, p, { floats: p.floats.map(f => f.panel === id ? { panel: id, x, y } : f) }) }); };
  fl.addEventListener('pointerup', end); fl.addEventListener('pointercancel', end);
}

function init(a) {
  app = a;
  const root = $('#app');
  on(root, 'click', '[data-act="rail"]', (ev, el) => open(el.dataset.id));
  on(root, 'click', '[data-act="rail-more"]', (ev, el) => {
    const rest = $('#rail').dataset.rest.split(',').filter(Boolean);
    popover(el, pop => { pop.innerHTML = '<h3 class="sub">More panels</h3>' + rest.map(id => `<button class="row" data-open="${id}">${icon(panels[id].icon)}<span class="grow">${esc(panels[id].title)}</span></button>`).join(''); }, { side: S().layout.cls === 'phone-landscape' ? 'right' : null, label: 'More panels' });
    on(popState.pop, 'click', '[data-open]', (e2, b) => { closePopover(true); open(b.dataset.open, { keep: true }); });
  });
  on(root, 'click', '[data-act="close"]', (ev, el) => close(el.dataset.id));
  on(root, 'click', '[data-act="pin"]', (ev, el) => pin(el.dataset.id));
  on(root, 'click', '[data-act="move"]', (ev, el) => menuMove(el, el.dataset.id));
  on(root, 'click', '[data-act="card-close"], [data-act="card-back"]', () => app.select(null));
  on(root, 'click', '[data-act="card-expand"]', () => { const p = P(), ex = !p.cardExpanded; setP({ cardExpanded: ex, sheet: S().layout.cls === 'phone-portrait' ? (ex ? 'full' : 'peek') : p.sheet }); });
  bindSheetDrag(); bindFloatDrag();
  window.addEventListener('resize', onResize); window.addEventListener('orientationchange', () => setTimeout(onResize, 150));
  window.addEventListener('popstate', onPop);
  window.addEventListener('keydown', ev => { if (ev.key === 'Escape') { if (closeTop(true)) ev.preventDefault(); } });
  app.store.subscribe(null, (s, changed) => {
    if (changed.has('panels') || changed.has('layout') || changed.has('cleanView') || (changed.has('selection') && true)) renderSlots();
    else { refresh(changed); if (changed.has('theaters') || changed.has('viewMode')) renderRail(); }
    if (popState && popState.keys && popState.keys.some(k => changed.has(k))) popState.rebuild();
  });
}

WM.layout = { init, classOf, isPhone, register, panels, order, open, close, pin, move, reset, renderSlots, renderRail, popover, closePopover, popState: () => popState, measure, onResize, restoreFor, cardSlot, whereIs, closeTop, sheetHeights, applySheet, openPanels, syncHistory, setP };
})();
