/* WARMAPS v2 PROTOTYPE — ui/controls.js
 * Top bar, theater filter, lens (picker, banner, tag), the three record switches, the layers menu, the legend,
 * clean view and the stage messages (LAYOUT spec 2.2-2.5, 8, 10). No control here says how true a claim is:
 * they show who has spoken, who has not, and whose account is on screen.
 */
(function () {
'use strict';
const WM = window.WM = window.WM || {};
const { $, $$, esc, on, toast } = WM.dom, M = WM.marks, T = WM.time, STR = WM.strings;
const icon = (n, px) => M.icon(n, px);
let app, legendOpen = null, dimTimer = 0, lastLensKey = '';
const S = () => app.store.get();
const C = () => WM.theme.current().colors;
const mini = (th, look, px, extra) => WM.cards.mini(th, look, px, extra);
const name = id => app.sel.accountName(id);
const poss = n => n + '’s';

/* ---- lens wording ---------------------------------------------------------------------------------------- */
function lensText() {
  const s = S(), L = s.lens, sum = app.rows().lensSummary;
  if (L.mode === 'all') return null;
  if (L.mode === 'compare') { const [a, b] = L.parties.map(name); return { full: STR.lens.compare(a, b, sum.hidden), short: STR.lens.compareShort(a, b), tag: 'COMPARE: ' + a + ' | ' + b }; }
  const names = L.parties.map(name).sort();
  const who = names.length === 1 ? poss(names[0]) : null;
  const full = who ? STR.lens.banner(who, sum.hidden, sum.onFile) : 'Showing the accounts of ' + names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1] + ' only, not WARMAPS’s view · ' + sum.hidden + ' other accounts hidden · accounts on file: ' + sum.onFile;
  return { full, short: who ? STR.lens.bannerShort(who, sum.hidden) : names.join(', ') + ' only · ' + sum.hidden + ' hidden', tag: 'LENS: ' + names.join(', ') };
}
function lensButtonText() { const L = S().lens; return L.mode === 'all' ? 'Lens: All' : L.mode === 'compare' ? 'Compare: ' + L.parties.map(name).join(' | ') : 'Lens: ' + L.parties.map(name).sort().join(', '); }

/* ---- top bar ---------------------------------------------------------------------------------------------- */
function renderTop() {
  const s = S(), d = app.data, multi = s.theaters.length > 1, lensOn = s.lens.mode !== 'all';
  const thChip = s.theaters.length === d.theaters.length ? 'All theaters' : s.theaters.length === 1 ? d.theatersById[s.theaters[0]].label : s.theaters.length + ' theaters';
  const seg = d.theaters.map(t => `<button data-act="theater" data-id="${t.id}" aria-pressed="${s.theaters.includes(t.id)}" title="${esc(t.labelLong)}${t.status === 'intake-only' ? ' — no curated events yet' : ''}">${mini(t.id, 'solid', 8)}${esc(t.label)}${t.status === 'intake-only' ? '<span class="dim">no events yet</span>' : ''}</button>`).join('') +
    `<button data-act="theater-all" aria-pressed="${s.theaters.length === d.theaters.length}">All</button>`;
  $('#topbar').innerHTML = `<button class="brand" data-act="about" title="About this prototype" aria-label="WARMAPS version 2 prototype: about">W<span class="v">M</span><span class="full tb-pc">&nbsp;WARMAPS <span class="v">v2</span></span></button>
    <span class="chip stamp hdr-stamp tb-pc">${esc(STR.stamp)}</span>
    <button class="btn tb-narrow" data-act="theater-menu" aria-haspopup="true" data-tour="theaters"><span class="lbl">${esc(thChip)}</span>${icon('chevron', 14)}</button>
    <div class="seg theater-seg tb-wide" role="group" aria-label="Theaters" data-tour="theaters">${seg}</div>
    <button class="iconbtn lensbtn tb-narrow${lensOn ? ' on' : ''}" data-act="lens" aria-label="${esc(lensButtonText())}" aria-haspopup="true" data-tour="lens" style="position:relative">${icon('lens')}<i class="dot" style="position:absolute;top:8px;right:8px"></i></button>
    <button class="btn lensbtn tb-wide${lensOn ? ' on' : ''}" data-act="lens" aria-haspopup="true" data-tour="lens"><i class="dot"></i><span class="lbl">${esc(lensButtonText())}</span>${icon('chevron', 14)}</button>
    <span class="spacer"></span>
    <input class="tb-pc" type="search" id="search" placeholder="Search events ( / )" aria-label="Search events" style="max-width:200px" value="${esc(s.search || '')}">
    <span class="tb-pc mono sec" style="font-size:var(--t-data);white-space:nowrap;padding:0 var(--s2)">${esc(T.fmt(s.time.cursor))}</span>
    <div class="seg" role="radiogroup" aria-label="View" data-tour="view"><button role="radio" data-act="view" data-v="2d" aria-checked="${s.viewMode === '2d'}">2D</button><button role="radio" data-act="view" data-v="3d" aria-checked="${s.viewMode === '3d'}" title="The globe loads only when you ask for it">3D</button></div>
    <button class="iconbtn${s.layersOn.links || s.layersOn.flights || s.layersOn.vessels ? ' on' : ''}" data-act="layers" aria-label="Layers" aria-haspopup="true" title="Layers" data-tour="layers">${icon('layers')}</button>
    <button class="iconbtn tb-wide" data-act="clean" aria-label="Clean view" title="Clean view: only the map (C)" data-tour="clean">${icon('clean')}</button>`;
  void multi;
}
function theaterMenu(anchor) {
  WM.layout.popover(anchor, pop => {
    const s = S(), d = app.data;
    pop.innerHTML = '<h3 class="sub">Theaters</h3>' + d.theaters.map(t => `<button class="row" role="menuitemcheckbox" data-th="${t.id}" aria-checked="${s.theaters.includes(t.id)}"><span class="switch"></span>${mini(t.id, 'solid', 10)}<span class="grow">${esc(t.label)}<small>${t.status === 'intake-only' ? 'No curated events yet' : esc(t.labelLong)}</small></span></button>`).join('') +
      `<button class="row" data-th="all">${icon('globe')}<span class="grow">All theaters</span></button>`;
  }, { keys: ['theaters'], label: 'Theaters', side: S().layout.cls === 'phone-landscape' ? 'right' : null });
  on(WM.layout.popState().pop, 'click', '[data-th]', (ev, el) => toggleTheater(el.dataset.th));
}
function toggleTheater(id) {
  const s = S(), all = app.data.theaters.map(t => t.id);
  if (id === 'all') return app.setTheaters(s.theaters.length === all.length ? [all[0]] : all);
  const has = s.theaters.includes(id), next = has ? s.theaters.filter(x => x !== id) : all.filter(x => s.theaters.includes(x) || x === id);
  if (!next.length) return toast('At least one theater stays on.');
  app.setTheaters(next);
}

/* ---- lens picker: parties from the registry, in alphabetical order; no groups, no slider ------------------------ */
function lensPicker(anchor) {
  let q = '';
  WM.layout.popover(anchor, pop => {
    const s = S(), L = s.lens, rows = app.sel.partyCounts(s).filter(p => !q || p.name.toLowerCase().includes(q)), two = L.parties.length === 2;
    const withE = rows.filter(r => r.count > 0), without = rows.filter(r => r.count === 0);
    const row = p => `<button class="row" role="menuitemcheckbox" data-party="${p.id}" aria-checked="${L.parties.includes(p.id)}" style="${p.count ? '' : 'color:var(--text-muted)'}"><span class="switch"></span><span class="grow">${esc(p.name)}<small>${p.kind === 'igo' || p.kind === 'monitor' ? 'observer' : ''}</small></span><span class="mono muted">${p.count}</span></button>`;
    pop.innerHTML = `<h3 class="sub">Lens: whose account to show</h3>
      <button class="row" data-party="__all" aria-pressed="${L.mode === 'all'}">${L.mode === 'all' ? icon('check', 18) : '<span style="width:18px"></span>'}<span class="grow"><b>${esc(STR.lens.all)}</b><small>Everything on record, from every party</small></span></button>
      <div class="pad"><input type="search" id="lensq" placeholder="Find a party" aria-label="Find a party" value="${esc(q)}"></div>
      ${withE.map(row).join('')}${without.length ? '<h3 class="sub">No entries in this period</h3>' + without.map(row).join('') : ''}
      <hr class="div"><button class="row" role="switch" data-cmp="1" aria-checked="${L.mode === 'compare'}" ${two ? '' : 'aria-disabled="true"'}><span class="switch"></span><span class="grow"><b>Compare two</b><small>${two ? 'A (left): ' + esc(name(L.parties[0])) + ' · B (right): ' + esc(name(L.parties[1])) : 'Tick exactly two parties to compare them side by side'}</small></span></button>
      ${two ? `<button class="row" data-swap="1">${icon('swap', 18)}<span class="grow">Swap A and B</span></button>` : ''}
      <p class="note pad">A lens shows only what that party has said, at the places that party gives. It is never WARMAPS’s view; WARMAPS has none. The number is that party’s entries in the period shown.</p>`;
    const inp = $('#lensq', pop); if (inp) inp.addEventListener('input', () => { q = inp.value.trim().toLowerCase(); const pos = inp.selectionStart; WM.layout.popState().rebuild(); const n = $('#lensq', pop); n.focus(); n.setSelectionRange(pos, pos); });
  }, { keys: ['lens', 'time', 'theaters'], label: 'Lens', side: S().layout.cls === 'phone-landscape' ? 'right' : null });
  const pop = WM.layout.popState().pop;
  on(pop, 'click', '[data-party]', (ev, el) => {
    const L = S().lens, id = el.dataset.party;
    if (id === '__all') return app.setLens('all', []);
    const next = L.parties.includes(id) ? L.parties.filter(x => x !== id) : L.parties.concat([id]).sort((a, b) => name(a).localeCompare(name(b)));
    app.setLens(next.length ? (L.mode === 'compare' && next.length === 2 ? 'compare' : 'parties') : 'all', next);
  });
  on(pop, 'click', '[data-cmp]', () => { const L = S().lens; if (L.parties.length !== 2) return; app.setLens(L.mode === 'compare' ? 'parties' : 'compare', L.parties); });
  on(pop, 'click', '[data-swap]', () => { const L = S().lens; app.setLens(L.mode, L.parties.slice().reverse()); });
}
function renderBanner() {
  const s = S(), el = $('#lensbanner'), lt = lensText(), phone = s.layout.cls === 'phone-portrait';
  el.classList.toggle('on', !!lt);
  if (!lt) { el.innerHTML = ''; el.classList.remove('wrap'); return; }
  const wrapped = el.classList.contains('wrap');
  el.setAttribute('role', 'status');
  el.innerHTML = `<span class="txt" ${phone ? 'data-act="banner-more" tabindex="0" role="button" aria-label="' + esc(lt.full) + '"' : ''}>${esc(phone && !wrapped ? lt.short : lt.full)}</span><button data-act="lens-all">${esc(STR.lens.all)}</button>`;
}
function lensSentence() { const lt = lensText(); return lt ? lt.full : null; }

/* ---- stage: record switches, tags, legend chip, messages --------------------------------------------------------- */
function renderStage() {
  const s = S(), th = s.theaters[0], sh = s.show, rows = app.rows(), lt = lensText(), cls = s.layout.cls;
  $('.stage-tr').innerHTML = `${cls === 'phone-portrait' ? `<button class="iconbtn plate" data-act="clean" aria-label="Clean view" title="Clean view: only the map" data-tour="clean">${icon('clean')}</button>` : ''}
    <div class="recgroup plate" role="group" aria-label="Record layers" data-tour="reclayers">
      <button role="switch" data-act="show" data-k="onRecord" aria-checked="${sh.onRecord && !sh.contestedOnly}" title="On the record: more than one side has spoken, or not yet attributed">${mini(th, 'solid', 10)}<span class="lbl">${esc(STR.layer.onRecord)}</span><i class="state"></i></button>
      <button role="switch" data-act="show" data-k="fog" aria-checked="${sh.fog && !sh.contestedOnly}" title="Fog: one side only; a directly involved side has not been heard">${mini(th, 'ghost', 10)}<span class="lbl">${esc(STR.layer.fog)}</span><i class="state"></i></button>
      <button role="switch" data-act="show" data-k="contestedOnly" aria-checked="${sh.contestedOnly}" title="Contested: show only marks where someone on record denies it">${mini(th, 'split', 10)}<span class="lbl">${esc(STR.layer.contested)}</span><i class="state"></i></button></div>`;
  // tags inside the stage, so they are in every screenshot
  const tag = $('#lenstag'); tag.hidden = !lt;
  if (lt) { const nothing = !rows.rows.length; tag.textContent = lt.tag + (nothing ? ' · ' + (s.lens.mode === 'compare' ? 'nothing to compare in this period' : STR.lens.nothing(s.lens.parties.map(name).sort().join(', '))) : ''); tag.setAttribute('aria-label', lt.full + '. Open the lens picker.'); }
  const g = WM.timeline.geom(), len = T.dc(g.win.toISO) - T.dc(g.win.fromISO) + 1;
  const period = s.time.mode === 'all' ? 'All, to ' + T.fmt(s.time.cursor) : (s.time.cursor === app.data.todayISO && len === 7 ? 'Last 7 days to ' : len === 1 ? '' : T.fmtShort(g.win.fromISO) + ' to ') + T.fmt(g.win.toISO);
  const parts = [period, s.time.record === 'then' ? 'As known on ' + T.fmt(s.time.cursor) : 'Record as of ' + T.fmt(app.data.todayISO)];
  if (sh.contestedOnly) parts.push('Contested only'); else { if (!sh.fog) parts.push('Fog hidden'); if (!sh.onRecord) parts.push('On the record hidden'); }
  parts.push(STR.stampShort);
  $('#viewtag').textContent = parts.join(' · ');
  // messages (LAYOUT spec 10)
  const msg = $('#stagemsg'); let m = null;
  const act = s.theaters.map(id => app.data.theatersById[id]);
  if (act.every(t => t.status === 'intake-only')) m = { text: STR.empty.theater };
  else if (!rows.inWindow) m = { text: STR.empty.window(WM.timeline.longRangeText()), btn: STR.empty.showAll, act: 'range-all' };
  else if (!sh.contestedOnly && !sh.fog && !rows.rows.length && rows.hidden.fog) m = { text: STR.empty.fogOff, btn: STR.empty.showFog, act: 'show-fog' };
  msg.hidden = !m; if (m) msg.innerHTML = `${esc(m.text)}${m.btn ? ` · <button data-act="${m.act}">${esc(m.btn)}</button>` : ''}`;
  renderLegendChip();
}
function looksInView() { const set = new Set(); for (const r of app.rows().rows) if (r.onMap) set.add(r.look); return ['solid', 'ghost', 'split', 'faded', 'unattributed'].filter(l => set.has(l)); }
/* The legend always reflects exactly what is on (scope 'view'), or everything (scope 'full', in Help). */
function legendHtml(scope) {
  const s = S(), c = C(), full = scope === 'full', ths = full ? app.data.theaters.map(t => t.id) : s.theaters, th0 = s.theaters[0];
  let h = '<div class="legend-row" style="flex-wrap:wrap;gap:var(--s3)">' + ths.map(id => `<span style="display:inline-flex;align-items:center;gap:6px">${mini(id, 'solid', 10)}${esc(app.data.theatersById[id].label)}</span>`).join('') + '</div>';
  h += `<div class="legend-row" style="gap:var(--s3)"><span style="display:inline-flex;align-items:center;gap:4px">${mini(th0, 'solid', 18)}milestone</span><span style="display:inline-flex;align-items:center;gap:4px">${mini(th0, 'solid', 12)}major</span><span style="display:inline-flex;align-items:center;gap:4px">${mini(th0, 'solid', 8)}standard</span></div>`;
  if (!full && s.lens.mode === 'compare') {
    const [a, b] = s.lens.parties.map(name);
    h += `<div class="legend-row">${M.svg({ shape: M.SHAPE[th0], look: 'solid', d: 14, tight: true, bg: c['bg-raised'], compare: { left: { mode: 'fill', color: c['compare-a'] }, right: { mode: 'fill', color: c['compare-b'] } } }).html}<span>${esc(STR.fixed.compareLegend(a, b))}</span></div>`;
  } else {
    const looks = full ? ['solid', 'ghost', 'split', 'faded', 'unattributed'] : looksInView();
    for (const l of looks) h += `<div class="legend-row">${mini(th0, l, 12)}<span>${esc(STR.fixed.legend[l])}</span></div>`;
    if (!full && !looks.length) h += '<div class="legend-row muted">No marks in view.</div>';
    if (full) { h += `<div class="legend-row">${M.svg({ shape: M.SHAPE[th0], look: 'solid', d: 14, tight: true, bg: c['bg-raised'], compare: { left: { mode: 'fill', color: c['compare-a'] }, right: { mode: 'slash', color: c['compare-b'] } } }).html}<span>${esc(STR.fixed.compareLegend('the first party', 'the second party'))}</span></div>`; }
  }
  if (full || s.layersOn.links) h += `<div class="legend-row">${WM.cards.arcSample('solid', 3, 30)}${WM.cards.arcSample('split', 2, 30)}${WM.cards.arcSample('ghost', 1, 30)}</div><div class="legend-row"><span>${esc(STR.fixed.linkLegend)}</span></div>`;
  if (full || s.layersOn.flights || s.layersOn.vessels) h += `<div class="legend-row">${M.track('aircraft', c.track, 0)}${M.track('vessel', c.track, 0)}<span>Aircraft and ships: positions reported by tracking services (OBSERVED), today only. Not claims.</span></div>`;
  h += `<div class="legend-foot">${esc(full ? STR.fixed.legendFooter + '.' : STR.fixed.legendFooterShort)}</div>`;
  return h;
}
function renderLegendChip() {
  const el = $('#legendchip'), cls = S().layout.cls; if (legendOpen === null) legendOpen = cls === 'pc' && $('#stage').clientWidth > 1000;
  el.innerHTML = `<button class="row" data-act="legend-toggle" aria-expanded="${legendOpen}" style="padding:0 var(--s3)">${icon('info', 18)}<span class="grow">Legend</span>${icon(legendOpen ? 'chevron' : 'up', 16)}</button>${legendOpen ? `<div class="lg-body">${legendHtml('view')}</div>` : ''}`;
}

/* ---- layers menu (a popover on tablet and PC; the Layers sheet on phones) ------------------------------------------- */
function layersBody(el) {
  const s = S(), sh = s.show, th = s.theaters[0], today = s.time.cursor === app.data.todayISO, phone = WM.layout.isPhone(s.layout.cls);
  const lt = lensText();
  let h = `<h3 class="sub">Events</h3>
    <button class="row" data-act="lens">${icon('lens')}<span class="grow"><b>${esc(lensButtonText())}</b><small>${lt ? esc(lt.full) : 'Whose account to show'}</small></span>${icon('next', 16)}</button>
    <button class="row" role="switch" data-act="show" data-k="onRecord" aria-checked="${sh.onRecord && !sh.contestedOnly}"><span class="switch"></span>${mini(th, 'solid', 10)}<span class="grow">${esc(STR.layer.onRecord)}<small>Solid and half marks, and records not yet attributed</small></span></button>
    <button class="row" role="switch" data-act="show" data-k="fog" aria-checked="${sh.fog && !sh.contestedOnly}"><span class="switch"></span>${mini(th, 'ghost', 10)}<span class="grow">${esc(STR.layer.fog)}<small>Outlines: one side only so far</small></span></button>
    <button class="row" role="switch" data-act="show" data-k="contestedOnly" aria-checked="${sh.contestedOnly}"><span class="switch"></span>${mini(th, 'split', 10)}<span class="grow">${esc(STR.layer.contested)}<small>Only marks someone on record denies</small></span></button>
    <p class="note pad">These three count sides heard. None of them picks a side.</p>`;
  for (const g of app.data.layers.slice(1)) {
    h += `<h3 class="sub">${esc(g.group)}</h3>`;
    for (const r of g.rows) {
      const on = !!s.layersOn[r.id], isTrack = r.id === 'flights' || r.id === 'vessels', thin = s.thinned[r.id];
      let note = r.note || '';
      if (isTrack && on && !today) note = 'off while the cursor is not on today';
      else if (isTrack && on && thin) note = STR.detail.thinned(thin.drawn, thin.given) + ' · today only · sample data';
      h += `<button class="row" role="switch" data-act="layer" data-id="${r.id}" aria-checked="${on}" ${r.disabled ? 'aria-disabled="true"' : ''}><span class="switch"></span><span class="grow">${esc(r.name)}<small>${esc([r.desc, note, r.source ? 'source: ' + r.source : ''].filter(Boolean).join(' · '))}</small></span></button>`;
    }
  }
  if (phone) h += `<h3 class="sub">Legend</h3><div class="pad">${legendHtml('view')}</div>`;
  h += `<hr class="div"><button class="row" data-act="layers-reset">${icon('restore')}<span class="grow">Reset to default view<small>Events and theater outlines only</small></span></button>`;
  el.innerHTML = h;
}
function openLayers(anchor) {
  const cls = S().layout.cls;
  if (WM.layout.isPhone(cls)) return WM.layout.open('layers');
  WM.layout.popover(anchor, layersBody, { keys: ['show', 'layersOn', 'lens', 'time', 'thinned', 'theaters'], alignRight: true, label: 'Layers' });
}

/* ---- clean view ----------------------------------------------------------------------------------------------------- */
function setClean(onState) { if (onState !== S().cleanView) app.store.set({ cleanView: onState }); }
// the page follows the store, so Escape, System Back and the restore button all leave clean view the same way
function applyClean() {
  const onState = S().cleanView; document.documentElement.dataset.clean = onState ? '1' : '0';
  const b = $('.clean-btns'); b.classList.remove('dim'); clearTimeout(dimTimer);
  if (onState) dimTimer = setTimeout(() => b.classList.add('dim'), 3000);       // dims after 3 s and never vanishes
  requestAnimationFrame(() => app.view && app.view.resize && app.view.resize());
}

function init(a) {
  app = a;
  const root = document.body;
  on(root, 'click', '[data-act="theater"]', (ev, el) => toggleTheater(el.dataset.id));
  on(root, 'click', '[data-act="theater-all"]', () => toggleTheater('all'));
  on(root, 'click', '[data-act="theater-menu"]', (ev, el) => theaterMenu(el));
  on(root, 'click', '[data-act="lens"]', (ev, el) => lensPicker(el.closest('.popover') ? $('[data-act="layers"]') || el : el));
  on(root, 'click', '#lenstag', (ev, el) => lensPicker(el));
  on(root, 'click', '[data-act="lens-all"]', () => app.setLens('all', []));
  on(root, 'click', '[data-act="banner-more"]', () => { $('#lensbanner').classList.toggle('wrap'); renderBanner(); });
  on(root, 'click', '[data-act="view"]', (ev, el) => app.setView(el.dataset.v));
  on(root, 'click', '[data-act="toggle-view"]', () => app.setView(S().viewMode === '3d' ? '2d' : '3d'));
  on(root, 'click', '[data-act="layers"]', (ev, el) => openLayers(el));
  on(root, 'click', '[data-act="clean"]', () => setClean(true));
  on(root, 'click', '[data-act="clean-restore"]', () => setClean(false));
  on(root, 'click', '[data-act="fullscreen"]', () => { const d = document; try { if (d.fullscreenElement) d.exitFullscreen(); else d.documentElement.requestFullscreen().catch(() => toast('This browser did not allow full screen.')); } catch (e) { toast('This browser did not allow full screen.'); } });
  on(root, 'click', '[data-act="show"]', (ev, el) => app.toggleShow(el.dataset.k));
  on(root, 'click', '[data-act="show-fog"]', () => app.setShow({ fog: true }));
  on(root, 'click', '[data-act="range-all"]', () => WM.timeline.setRange('all'));
  on(root, 'click', '[data-act="layer"]', (ev, el) => { if (el.getAttribute('aria-disabled') === 'true') return; app.setLayer(el.dataset.id, !S().layersOn[el.dataset.id]); });
  on(root, 'click', '[data-act="layers-reset"]', () => { app.store.set({ layersOn: { outlines: true }, show: { onRecord: true, fog: true, contestedOnly: false } }); toast('Default view: events and theater outlines only.'); });
  on(root, 'click', '[data-act="legend-toggle"]', () => { legendOpen = !legendOpen; renderLegendChip(); });
  on(root, 'click', '[data-act="about"]', () => { WM.layout.open('settings', { keep: true }); setTimeout(() => { const n = $('#about-sect'); if (n) n.scrollIntoView({ block: 'start' }); }, 60); });
  on(root, 'input', '#search', (ev, el) => { app.store.set({ search: el.value }); if (el.value && !WM.layout.whereIs('events')) WM.layout.open('events', { keep: true }); });
  app.store.subscribe(['theaters', 'lens', 'viewMode', 'layersOn', 'layout'], renderTop);
  app.store.subscribe(['time'], (s, ch) => { const d = $('#topbar .mono.sec'); if (d) d.textContent = T.fmt(s.time.cursor); });
  app.store.subscribe(['lens', 'time', 'theaters', 'layout', 'options', 'show'], (s) => {
    renderBanner();
    // phone landscape has no room for a banner strip: the full sentence shows for 4 seconds when the lens changes
    const key = s.lens.mode + s.lens.parties.join(','); if (key !== lastLensKey) { lastLensKey = key; const lt = lensText(); if (lt && s.layout.cls === 'phone-landscape') toast(lt.full, null, 4000); }
  });
  app.store.subscribe(['lens', 'time', 'theaters', 'layout', 'options', 'show', 'layersOn', 'cleanView', 'viewMode'], renderStage);
  app.store.subscribe(['cleanView'], applyClean);
  document.addEventListener('wm:theme', () => { renderTop(); renderStage(); });
  renderTop(); renderBanner(); renderStage();
}
WM.controls = { init, renderTop, renderBanner, renderStage, layersBody, legendHtml, lensText, lensSentence, lensPicker, setClean, openLayers, toggleTheater };
})();
