/* WARMAPS v2 PROTOTYPE — ui/panels.js
 * The dock's panels (LAYOUT spec 2.4, 8c, 8d, 9). Each registers itself with the layout engine; adding a panel
 * is adding one entry here and changes no layout code.
 */
(function () {
'use strict';
const WM = window.WM = window.WM || {};
const { $, esc, on, toast } = WM.dom, M = WM.marks, T = WM.time, STR = WM.strings;
const icon = (n, px) => M.icon(n, px);
let app;
const S = () => app.store.get();
const C = () => WM.theme.current().colors;
const mini = (th, look, px, extra) => WM.cards.mini(th, look, px, extra);
const sw = (act, attrs, checked, label, small, disabled) => `<button class="row" role="switch" data-act="${act}" ${attrs || ''} aria-checked="${!!checked}" ${disabled ? 'aria-disabled="true"' : ''}><span class="switch"></span><span class="grow">${label}${small ? `<small>${small}</small>` : ''}</span></button>`;
const segm = (act, cur, opts, label) => `<div class="seg" role="radiogroup" aria-label="${esc(label)}">${opts.map(([v, l, t]) => `<button role="radio" data-act="${act}" data-v="${esc(v)}" aria-checked="${String(v) === String(cur)}" ${t ? `title="${esc(t)}"` : ''}>${esc(l)}</button>`).join('')}</div>`;

/* ---- Events: the complete view; the map is the picture -------------------------------------------------- */
function events(body) {
  const s = S(), v = app.rows(), q = (s.search || '').trim().toLowerCase(), selId = s.selection && s.selection.type === 'event' ? s.selection.id : null;
  const rows = v.rows.filter(r => !q || (r.rec.title + ' ' + r.rec.place + ' ' + r.rec.country + ' ' + (r.st.statusLine || '')).toLowerCase().includes(q));
  const hid = [];
  if (s.show.contestedOnly) hid.push('Contested only: ' + v.hidden.notContested + ' other ' + (v.hidden.notContested === 1 ? 'record' : 'records') + ' hidden');
  else { if (v.hidden.fog) hid.push(v.hidden.fog + (v.hidden.fog === 1 ? ' ghost' : ' ghosts') + ' hidden'); if (v.hidden.onRecord) hid.push(v.hidden.onRecord + ' on-the-record ' + (v.hidden.onRecord === 1 ? 'mark' : 'marks') + ' hidden'); }
  const row = r => WM.cards.rowHtml(r.rec, r.st, selId, { aria: app.sel.sentence(r) });
  let h = `<div class="pad note">${esc(WM.timeline.rangeText(false))} · ${s.time.record === 'then' ? 'as known on ' + esc(T.fmt(s.time.cursor)) : 'record as of ' + esc(T.fmt(app.data.todayISO))}${hid.length ? ' · <b style="color:var(--text-primary)">' + esc(hid.join(' · ')) + '</b>' : ''}${q ? ' · search: “' + esc(q) + '”' : ''}</div>`;
  if (s.lens.mode !== 'all') {
    const says = rows.filter(r => r.list === 'says'), denies = rows.filter(r => r.list === 'denies'), who = s.lens.parties.map(app.sel.accountName).join(s.lens.mode === 'compare' ? ' | ' : ', ');
    h += `<div class="lens-row">${esc(WM.controls.lensSentence() || '')}</div>`;
    if (!rows.length) h += `<p class="pad">${esc(STR.lens.nothing(who))}.</p>`;
    if (says.length) h += `<div class="grp-h">Says (${says.length})</div>` + says.map(row).join('');
    if (denies.length) h += `<div class="grp-h">Denies (${denies.length}) · listed, not drawn</div>` + denies.map(row).join('');
  } else {
    const main = rows.filter(r => r.list !== 'no-account'), none = rows.filter(r => r.list === 'no-account');
    if (!rows.length) h += `<p class="pad">${v.inWindow ? 'Every record in this period is hidden by the switches above.' : esc(STR.empty.window(WM.timeline.longRangeText())) + '.'} ${v.inWindow ? '' : '<button data-act="range-all" style="text-decoration:underline">Show all</button>'}</p>`;
    if (main.length) h += `<div class="grp-h">In this period (${main.length})</div>` + main.map(row).join('');
    if (none.length) h += `<div class="grp-h">No account in force (${none.length}) · listed, not drawn</div>` + none.map(row).join('');
  }
  h += `<p class="pad note">${esc(STR.fixed.legendFooterShort)} Every record in the period is listed here, whether or not the map groups it.</p>`;
  body.innerHTML = h;
}

/* ---- Key events ------------------------------------------------------------------------------------------- */
function keyEvents(body) {
  const s = S(), date = app.sel.recordDate(s), list = app.data.events.filter(r => r.tier === 'milestone' && r.theater.some(t => s.theaters.includes(t))).map(rec => ({ rec, st: app.sel.stateOf(rec, date, s) })).filter(x => x.st.known).sort((a, b) => a.rec.dateISO < b.rec.dateISO ? 1 : -1);
  body.innerHTML = `<p class="pad note">Milestones for the theaters shown, whatever the period. Picking one moves the timeline to it. A milestone only one side has spoken on is drawn at standard size until another side is on record.</p>` +
    (list.length ? list.map(x => `<button class="ev-row" data-act="jump-event" data-id="${x.rec.id}"><span class="mk">${mini(x.rec.theater[0], x.st.look, x.st.drawTier === 'milestone' ? 16 : 8)}</span><span><span class="t">${esc(x.rec.title)}</span><span class="m" style="display:block"><span class="mono">${esc(WM.cards.dateText(x.rec))}</span> · <b>${esc(STR.fixed.chip[x.st.look])}</b> · ${esc(x.st.statusLine)}</span></span></button>`).join('') : '<p class="pad">No milestones for these theaters yet.</p>');
}

/* ---- Watchlist: two tracks that look different on purpose; statuses as of the cursor date -------------------- */
function watchlist(body) {
  const s = S(), w = app.sel.watchAsOf(s), th = s.theaters[0];
  const hist = x => x.history.length ? '<table class="tbl"><tr><th>Date</th><th>Status then</th><th>Relied on</th></tr>' + x.history.map(h => `<tr><td class="mono">${esc(T.fmtShort(h.dateISO))}</td><td>${esc((STR.fixed.watchChip[h.status] || h.status).toLowerCase())}</td><td>${h.reliedOn.length ? h.reliedOn.map(r => esc(r.ref) + ' as ' + esc(STR.fixed.chip[r.look === 'ghost' ? 'ghost' : r.look].toLowerCase())).join(', ') : esc(h.note)}</td></tr>`).join('') + '</table>' : '<p>No history on or before this date.</p>';
  const ev = x => x.cited.length ? x.cited.map(c => `<button data-act="jump-event" data-id="${c.rec.id}" style="text-decoration:underline;text-align:left;min-height:32px">${esc(c.rec.title)}</button>`).join('<br>') : 'No evidence on file on this date.';
  let h = `<div class="pad"><span class="chip stamp">${esc(STR.stamp)}</span></div><div class="pad"><b style="font-size:var(--t-title);font-family:var(--font-display)">${esc(STR.watch.headline(w.headline.n, w.headline.m))}</b>
    <div class="note" style="margin-top:4px">${esc(STR.watch.headline2(w.headline.bothEnds, w.headline.denied))} · as of <span class="mono">${esc(T.fmt(w.date))}</span></div></div>
    <h2 class="sect">${esc(STR.watch.combat)}</h2>`;
  for (const x of w.combat) h += `<div class="wl-row"><div class="t">${esc(x.item.title)}</div><div class="chips"><span class="chip">${x.look ? mini(x.cited[0] ? x.cited[0].rec.theater[0] : th, x.look, 10) : ''}${esc(STR.fixed.watchChip[x.status])}</span></div>
    ${x.names ? `<div class="names">${esc(x.names)}</div>` : ''}<details><summary>Definition, history and evidence</summary><p>${esc(x.item.definition)}</p>${hist(x)}<p style="margin-top:var(--s2)">${ev(x)}</p></details></div>`;
  h += `<div class="wl-rhet"><hr class="div" style="margin-top:var(--s4)"><h2 class="sect">${esc(STR.watch.rhetoric)}</h2><p class="pad note">${esc(STR.fixed.rhetoricCaption)}</p>`;
  for (const x of w.rhetoric) h += `<div class="wl-row"><div class="t">${esc(x.item.title)}</div><div style="margin-top:4px;font-size:var(--t-meta)"><span class="meter" role="img" aria-label="${esc(x.status)}, step ${x.step + 1} of 4">${[0, 1, 2, 3].map(i => `<i class="${i <= x.step && x.step > 0 ? 'on' : ''}"></i>`).join('')}</span> <span class="sec">${esc(x.status)}</span> <span class="muted">· ${x.count} ${x.count === 1 ? 'statement' : 'statements'} cited in 90 days</span></div>
    <details><summary>Definition and statements</summary><p>${esc(x.item.definition)}</p><p>${ev(x)}</p></details></div>`;
  h += `</div><p class="pad note">The two lists are counted separately and are never added together. No status here says that anything happened: each row says who has stated it, who has denied it and who has not been heard.</p>`;
  body.innerHTML = h;
}

/* ---- Links -------------------------------------------------------------------------------------------------- */
function links(body) {
  const s = S(), v = app.links(), f = s.linkFilter, selId = s.selection && s.selection.type === 'link' ? s.selection.id : null;
  const cats = [['all', 'All categories']].concat(Object.entries(M.CAT_NAME)), spoken = [['all', 'Anyone'], ['both', 'Both actors'], ['one', 'One actor'], ['others', 'Others only'], ['denied', 'Denied by someone']];
  let h = `<div class="pad"><span class="chip stamp">${esc(STR.stamp)}</span></div>` + sw('layer', 'data-id="links"', s.layersOn.links, 'Show links on the map', 'Off by default. Arcs between the parties’ capitals.') +
    `<div class="pad" style="display:grid;gap:var(--s2)"><label class="note">Category<select data-act="lf" data-k="category">${cats.map(([k, l]) => `<option value="${k}" ${f.category === k ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></label>
     <label class="note">Who has spoken<select data-act="lf" data-k="spoken">${spoken.map(([k, l]) => `<option value="${k}" ${f.spoken === k ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></label></div>` +
    sw('lf-both', '', f.bothOnly, 'Only links both actors affirm', 'Counts who has spoken; it does not pick whom to believe.') +
    `<div class="grp-h">${v.arcs.length} of ${v.bundles} ${v.bundles === 1 ? 'arc' : 'arcs'} shown · ${v.items.filter(i => !i.hiddenByFilter).length} of ${v.total} links · at <span class="mono">${esc(T.fmtShort(v.date))}</span></div>`;
  if (!v.items.length) h += '<p class="pad">No link touches the theaters shown on this date.</p>';
  for (const it of v.items) { if (it.hiddenByFilter) continue; const l = it.link, a = app.data.reg.actors[l.from].name, b = app.data.reg.actors[l.to].name;
    h += `<button class="ev-row${selId === l.id ? ' sel' : ''}" data-act="sel-link" data-id="${l.id}"><span class="mk">${WM.cards.arcSample(it.dl.state, it.dl.weightStep, 26)}</span><span><span class="t">${esc(l.title)}</span><span class="m" style="display:block">${esc(a)} ${l.direction === 'both' ? '↔' : '→'} ${esc(b)} · <b>${esc(STR.fixed.linkChip[it.spoken])}</b> · ${it.dl.voicesInWindow} ${it.dl.voicesInWindow === 1 ? 'voice' : 'voices'} in 180 days${it.dl.weightStep === 0 ? ' (dormant)' : ''}</span></span></button>`; }
  h += `<p class="pad note">${esc(STR.fixed.linkLegend)}</p><p class="pad note">${esc(STR.fixed.linkNoRating)} Links between the same two parties are drawn as one arc with a count. Scrub the timeline to see lines thicken and thin as voices enter and leave the 180-day window.</p>`;
  body.innerHTML = h;
}

/* ---- Stats (counts of who has spoken; never a score) ------------------------------------------------------------ */
function stats(body) {
  const s = S(), v = app.rows(), by = {}; for (const r of v.rows) by[r.look] = (by[r.look] || 0) + 1;
  const st = app.view && app.view.stats ? app.view.stats() : null, onMap = v.rows.filter(r => r.onMap).length;
  body.innerHTML = `<p class="pad note">Counts for ${esc(WM.timeline.longRangeText())}, ${s.time.record === 'then' ? 'as known on ' + esc(T.fmt(s.time.cursor)) : 'as the record stands on ' + esc(T.fmt(app.data.todayISO))}. They count who has spoken. They are not a tally of what happened.</p>
    <table class="tbl" style="margin:0 var(--s4);width:calc(100% - 2 * var(--s4))">${['solid', 'split', 'ghost', 'faded', 'unattributed', 'no-account'].map(l => `<tr><td style="width:28px">${l === 'no-account' ? '' : mini(s.theaters[0], l, 10)}</td><td>${esc(app.sel.LOOK_WORDS[l])}</td><td class="mono" style="text-align:right">${by[l] || 0}</td></tr>`).join('')}
    <tr><th></th><th>Records listed</th><th class="mono" style="text-align:right">${v.rows.length}</th></tr></table>
    <h3 class="sub">Map accounting (the reach rule, by eye)</h3><p class="pad note">${st ? `Given to the map: ${st.given}. Drawn as their own mark: ${st.drawn}. Inside ${st.groups} ${st.groups === 1 ? 'group' : 'groups'}: ${st.grouped}. Labels: ${st.labels}. Drawn plus grouped ${st.drawn + st.grouped === st.given ? 'equals' : 'DOES NOT EQUAL'} given.` : 'Open the 2D map to see the figures.'} ${v.rows.length - onMap} listed ${v.rows.length - onMap === 1 ? 'record has' : 'records have'} no place on the map. No event is ever thinned; only tracks and labels are.</p>`;
}
function brief(body) {
  body.innerHTML = `<p class="pad">The theater brief (airspace, naval picture, figures) is not built in the prototype. Its place in the dock is kept so the layout can be judged.</p>
    <p class="pad note">In the real app every figure here shows who gave it and its as-of date, for example “4,383 · Health Ministry · 10 Sep 2026”. A disputed figure shows who disputes it, with their source.</p><div class="pad"><span class="chip stamp">${esc(STR.stamp)}</span></div>`;
}
function sources(body) {
  const own = { state: 'state media', party: 'party media', independent: 'independent', exile: 'exile media', advocacy: 'advocacy', 'international-public': 'international public' };
  body.innerHTML = `<div class="pad"><span class="chip stamp">${esc(STR.stamp)}</span></div><div class="pad prose"><p><b>What we check:</b> that the statement was really made, by whom, and that the source says what we say it says. Nothing more.</p><p><b>Claimed by is kept apart from carried by.</b> An outlet repeating a statement is listed under it and is never counted as another voice.</p><p><b>When a source blocks us</b> we do not work around it. The record notes the gap.</p></div>
    <h3 class="sub">Source registry (sample)</h3><table class="tbl" style="margin:0 var(--s4);width:calc(100% - 2 * var(--s4))"><tr><th>Publisher</th><th>Kind</th><th>Counts as</th><th>State</th></tr>
    ${app.data.outlets.map(o => `<tr><td>${esc(o.name)}</td><td>${esc(own[o.ownership])}</td><td>${o.actor && (o.ownership === 'state' || o.ownership === 'party') ? esc(app.data.reg.actors[o.actor].name) + ', labelled' : 'an observer in its own name'}</td><td>${esc(o.status)}</td></tr>`).join('')}</table>
    <p class="pad note">The registry labels outlets and tells the look-again checks where a missing side publishes. It is not used to rank or weigh sources.</p>`;
}

/* ---- Settings (LAYOUT spec 8c) ------------------------------------------------------------------------------------- */
function themeCard(t, cur) {
  const c = t.colors, strip = ['iran-war', 'russia-ukraine', 'east-asia', 'caribbean'].map((th, i) => M.svg({ shape: M.SHAPE[th], look: ['ghost', 'solid', 'split', 'faded'][i], d: 12, color: c[M.TOKEN[th]], bg: c['bg-base'], tight: true }).html).join('');
  return `<button class="theme-card" data-act="theme" data-id="${esc(t.id)}" aria-pressed="${cur === t.id}" style="background:${c['bg-surface']};color:${c['text-primary']};border-color:${cur === t.id ? c.accent : c['border-control']}"><span style="font-weight:600;font-size:var(--t-label)" class="tname"></span><span class="strip" style="background:${c['bg-base']}">${strip}<i style="flex:1"></i><i style="width:22px;height:3px;background:${c.link}"></i><i style="width:10px;height:10px;background:${c.accent}"></i></span></button>`;
}
function settings(body) {
  const s = S(), th = WM.theme.current(), ms = WM.theme.MAP_STYLES, dl = s.detailLevel, m = s.layout, fps = s.fps, tl = WM.timeline.trackInfo(), studio = new URLSearchParams(location.search).has('studio');
  const themes = WM.theme.all(), o = s.options;
  let h = `<h2 class="sect">Theme</h2><div class="grid2">${themes.map(t => themeCard(t, th.id)).join('')}</div><p class="pad note">A theme changes colours, fonts and corners. It cannot change what a mark means. Remembered on this device.</p>
    ${studio ? `<div class="pad"><button class="btn" data-act="studio">${icon('settings', 18)}Open the theme studio</button></div>` : ''}
    <h2 class="sect">Map style</h2><div class="grid2">${Object.entries(ms).map(([id, x]) => `<button class="stylebtn" data-act="mapstyle" data-id="${id}" aria-pressed="${s.mapStyle === id}"><i style="background:linear-gradient(135deg, ${x.sea} 0 45%, ${x.land} 45% 100%);border:1px solid ${x.border}"></i>${esc(x.name)}</button>`).join('')}</div>
    <div class="pad"><button class="btn small" data-act="mapstyle-theme" ${s.mapStyleUser ? '' : 'disabled'}>Use the theme’s map</button></div>`;
  if (s.mapStyle === 'satellite') h += `<div class="pad" style="display:grid;gap:var(--s2)"><label class="note">Dimming <span class="mono">${s.sat.dim}%</span><input type="range" min="0" max="60" step="5" value="${s.sat.dim}" data-act="sat" data-k="dim"></label><label class="note">Colour strength <span class="mono">${s.sat.sat}%</span><input type="range" min="40" max="100" step="5" value="${s.sat.sat}" data-act="sat" data-k="sat"></label></div>` + sw('sat-labels', '', s.sat.labels, 'Place names and boundaries');
  h += `<h2 class="sect">Detail</h2><div class="pad">${segm('detail', dl.choice, [['auto', 'Auto: ' + dl.auto[0].toUpperCase() + dl.auto.slice(1)], ['lite', 'Lite'], ['standard', 'Standard'], ['full', 'Full']], 'Detail level')}</div>
    <p class="pad note">${esc(STR.detail[dl.level])} Detail changes how things are drawn, never what you can open.</p>
    <div class="pad"><button class="btn small" data-act="retest">Re-test this device</button> <span class="note">Last draw test: <span class="mono">${dl.testFps == null ? 'not run' : dl.testFps + ' frames/s'}</span></span></div>
    <h2 class="sect">Layout</h2>${m.cls === 'pc' ? `<div class="pad">${segm('density', s.density || 'comfortable', [['comfortable', 'Comfortable'], ['compact', 'Compact']], 'Density')}</div>` : ''}
    <div class="pad"><span class="note">Opens in phone landscape as</span><br>${segm('pl-default', s.phoneLandscapeView, [['2d', '2D map'], ['3d', 'Globe, labels off']], 'Default view in phone landscape')}</div>
    <div class="pad"><button class="btn small" data-act="reset-layout">Reset layout</button></div>
    <h2 class="sect">Motion</h2><div class="pad">${segm('motion', s.motion, [['standard', 'Standard'], ['calm', 'Calm']], 'Motion')}</div>${WM.dom.prefersReducedMotion() ? '<p class="pad note">This device asks for reduced motion. That setting wins: changes are instant and Play is replaced by step buttons.</p>' : ''}
    <h2 class="sect">Try the open decisions</h2><p class="pad note">Prototype only. These switch between the options in the decisions file so you can judge them by eye. Nothing here changes stored data.</p>
    <h3 class="sub">Decision 9: when an outline becomes solid</h3><div class="pad">${segm('opt-solid', o.solidRule, [['ends', 'A: a side from each end', 'Recommended'], ['any-two', 'B: any two sides'], ['all-involved', 'C: every involved side']], 'Decision 9')}</div>
    <h3 class="sub">Decision 6: records carried over from v1</h3><div class="pad">${segm('opt-legacy', o.legacyLook, [['A', 'A: plain, v1 fog as outlines', 'Recommended'], ['B', 'B: all outlines'], ['C', 'C: all plain']], 'Decision 6')}</div>
    <h3 class="sub">Item d</h3>${sw('opt-halo', '', o.haloAll, 'd1: give every milestone the halo', 'Off: a one-sided milestone has no halo (as designed)')}${sw('opt-badge', '', o.badgeCount, 'd3: show the one-sided count on a group badge', 'Off: a count only (as designed)')}
    <p class="pad note">Three provisional rulings to confirm here: (1) the map opens on the last 7 days; (2) a one-sided claim is drawn at standard size until another side speaks; (3) look-again checks after 1, 3, 7 and 30 days. Decision 8 (default theme) is the Theme choice above: this prototype opens in Classic.</p>
    <h2 class="sect" id="about-sect">About this device</h2><div class="pad"><span class="chip stamp">${esc(STR.stamp)}</span></div>
    <table class="tbl" id="about-tbl" style="margin:0 var(--s4);width:calc(100% - 2 * var(--s4))">
      <tr><td>Viewport</td><td class="mono">${m.w} x ${m.h} CSS px</td></tr><tr><td>Device pixel ratio</td><td class="mono">${m.dpr}</td></tr>
      <tr><td>Layout class</td><td class="mono">${esc(m.cls)} (${m.coarse ? 'coarse' : 'fine'} pointer)</td></tr>
      <tr><td>Detail level</td><td class="mono">picked ${esc(dl.auto)}, in use ${esc(dl.level)}${dl.choice === 'auto' ? '' : ' (chosen)'}</td></tr>
      <tr><td>Draw test</td><td class="mono">${dl.testFps == null ? 'not run' : dl.testFps + ' frames/s'}; memory hint ${esc(String(dl.hints ? dl.hints.deviceMemory : 'n/a'))}</td></tr>
      <tr><td>2D frame rate</td><td class="mono">${fps.d2 == null ? 'pan the map, or run the test' : fps.d2 + ' frames/s'}</td></tr>
      <tr><td>Globe frame rate</td><td class="mono">${fps.d3 == null ? 'open 3D, then run the test' : fps.d3 + ' frames/s'}${fps.globeLoadMs ? '; first frame ' + (fps.globeLoadMs / 1000).toFixed(1) + ' s' : ''}</td></tr>
      <tr><td>Timeline</td><td class="mono">${Math.round(tl.width || 0)} px track, ${tl.steps} steps at ${(tl.stepW || 0).toFixed(1)} px</td></tr>
      <tr><td>Stage</td><td class="mono">${Math.round($('#stage').clientWidth)} x ${Math.round($('#stage').clientHeight)} px</td></tr>
      <tr><td>Versions</td><td class="mono">app ${esc(WM.detail.APP_VERSION)}; sample data for ${esc(app.data.todayISO)}; storage ${WM.dom.store.ok ? 'on' : 'off'}</td></tr></table>
    <div class="actions"><button class="btn small" data-act="fps2d">Run the 2D test</button><button class="btn small" data-act="fps3d" ${s.viewMode === '3d' ? '' : 'disabled'}>Run the globe test</button><button class="btn small" data-act="copy-about">${icon('copy', 16)}Copy these numbers</button></div>
    <h3 class="sub">Prototype helpers</h3><div class="actions"><button class="btn small" data-act="tour">Take the tour</button>${studio ? '' : '<a class="btn small" href="?studio=1">Reload with the theme studio</a>'}</div>
    <p class="pad note">The studio is behind an address flag (?studio=1) and its code is fetched only when opened. A theme link opens as a preview with Keep and Discard.</p>`;
  body.innerHTML = h;
  for (const b of body.querySelectorAll('.theme-card')) b.querySelector('.tname').textContent = (WM.theme.byId(b.dataset.id) || {}).name || b.dataset.id;   // a theme's name is shown with textContent only
}

/* ---- Help (LAYOUT spec 8d): fixed wording --------------------------------------------------------------------------- */
function help(body) {
  const H = STR.help, para = ([b, t]) => `<p><b>${esc(b)}</b> ${esc(t)}</p>`;
  body.innerHTML = `<h2 class="sect">Legend</h2><p class="pad note">${esc(STR.fixed.helpLegendNote)}</p><div class="pad">${WM.controls.legendHtml('full')}</div>
    <h2 class="sect">${esc(H.marksTitle)}</h2><div class="pad prose">${H.marks.map(para).join('')}</div>
    <h2 class="sect">${esc(H.designTitle)}</h2><div class="pad prose">${H.design.map(para).join('')}</div>
    <h2 class="sect">${esc(H.usingTitle)}</h2><div class="pad prose">${H.using.map(para).join('')}</div>
    <h2 class="sect">Take the tour again</h2><div class="pad"><button class="btn" data-act="tour">Start the one-minute tour</button></div>
    <h2 class="sect">Sources and method</h2><div class="pad"><button class="btn" data-act="open-panel" data-id="sources">Open Sources &amp; method</button></div>
    <div class="pad"><span class="chip stamp">${esc(STR.stamp)}</span></div>`;
}

function init(a) {
  app = a; const R = WM.layout.register, common = ['time', 'theaters', 'lens', 'show', 'options'];
  R({ id: 'events', title: 'Events', icon: 'list', order: 1, render: events, keys: common.concat(['selection', 'search']), badge: () => String(app.rows().rows.length) });
  R({ id: 'key', title: 'Key events', short: 'Key', icon: 'star', order: 2, render: keyEvents, keys: ['theaters', 'time', 'options'] });
  R({ id: 'watchlist', title: 'Watchlist', short: 'Watch', icon: 'watch', order: 3, render: watchlist, keys: ['time', 'options', 'theaters'] });
  R({ id: 'links', title: 'Links', icon: 'link', order: 4, render: links, keys: ['time', 'theaters', 'layersOn', 'linkFilter', 'selection', 'options'] });
  R({ id: 'stats', title: 'Stats', icon: 'stats', order: 5, render: stats, keys: common.concat(['viewStats']) });
  R({ id: 'brief', title: 'Theater brief', short: 'Brief', icon: 'brief', order: 6, render: brief, keys: [] });
  R({ id: 'sources', title: 'Sources & method', short: 'Sources', icon: 'book', order: 7, render: sources, keys: [] });
  R({ id: 'settings', title: 'Settings', icon: 'settings', order: 8, render: settings, keys: ['theme', 'mapStyle', 'sat', 'detailLevel', 'layout', 'options', 'fps', 'motion', 'density', 'phoneLandscapeView', 'viewMode', 'mapStyleUser'] });
  R({ id: 'help', title: 'Help', icon: 'help', order: 9, render: help, keys: ['theme'] });
  R({ id: 'layers', title: 'Layers', icon: 'layers', order: 99, hidden: true, render: body => WM.controls.layersBody(body), keys: ['show', 'layersOn', 'lens', 'time', 'thinned', 'theaters'] });

  const root = document.body, opt = patch => app.store.set({ options: Object.assign({}, S().options, patch) });
  on(root, 'click', '[data-act="sel-event"]', (ev, el) => app.select({ type: 'event', id: el.dataset.id }, { focus: true }));
  on(root, 'click', '[data-act="sel-link"]', (ev, el) => app.select({ type: 'link', id: el.dataset.id }));
  on(root, 'click', '[data-act="jump-event"]', (ev, el) => app.jumpTo(el.dataset.id));
  on(root, 'click', '[data-act="open-panel"]', (ev, el) => WM.layout.open(el.dataset.id, { keep: true }));
  on(root, 'change', '[data-act="lf"]', (ev, el) => app.store.set({ linkFilter: Object.assign({}, S().linkFilter, { [el.dataset.k]: el.value }) }));
  on(root, 'click', '[data-act="lf-both"]', () => app.store.set({ linkFilter: Object.assign({}, S().linkFilter, { bothOnly: !S().linkFilter.bothOnly }) }));
  on(root, 'click', '[data-act="theme"]', (ev, el) => app.setTheme(el.dataset.id));
  on(root, 'click', '[data-act="mapstyle"]', (ev, el) => app.setMapStyle(el.dataset.id, true));
  on(root, 'click', '[data-act="mapstyle-theme"]', () => app.setMapStyle(WM.theme.current().mapStyle, false));
  on(root, 'input', '[data-act="sat"]', (ev, el) => app.store.set({ sat: Object.assign({}, S().sat, { [el.dataset.k]: +el.value }) }));
  on(root, 'click', '[data-act="sat-labels"]', () => app.store.set({ sat: Object.assign({}, S().sat, { labels: !S().sat.labels }) }));
  on(root, 'click', '[data-act="detail"]', (ev, el) => app.setDetail(el.dataset.v));
  on(root, 'click', '[data-act="retest"]', () => app.retest());
  on(root, 'click', '[data-act="density"]', (ev, el) => { app.store.set({ density: el.dataset.v }); WM.layout.onResize(); });
  on(root, 'click', '[data-act="pl-default"]', (ev, el) => app.store.set({ phoneLandscapeView: el.dataset.v }));
  on(root, 'click', '[data-act="reset-layout"]', () => WM.layout.reset());
  on(root, 'click', '[data-act="motion"]', (ev, el) => { app.store.set({ motion: el.dataset.v }); document.documentElement.dataset.motion = el.dataset.v; });
  on(root, 'click', '[data-act="opt-solid"]', (ev, el) => opt({ solidRule: el.dataset.v }));
  on(root, 'click', '[data-act="opt-legacy"]', (ev, el) => opt({ legacyLook: el.dataset.v }));
  on(root, 'click', '[data-act="opt-halo"]', () => opt({ haloAll: !S().options.haloAll }));
  on(root, 'click', '[data-act="opt-badge"]', () => opt({ badgeCount: !S().options.badgeCount }));
  on(root, 'click', '[data-act="fps2d"]', () => app.fpsTest('2d'));
  on(root, 'click', '[data-act="fps3d"]', () => app.fpsTest('3d'));
  on(root, 'click', '[data-act="copy-about"]', () => { const t = [...document.querySelectorAll('#about-tbl tr')].map(r => r.cells[0].textContent + ': ' + r.cells[1].textContent).join('\n'); WM.dom.copyText('WARMAPS v2 prototype\n' + t + '\n' + navigator.userAgent).then(ok => toast(ok ? 'Copied. Paste it into a message.' : 'Could not copy on this browser.')); });
  on(root, 'click', '[data-act="tour"]', () => WM.tour.start());
  on(root, 'click', '[data-act="studio"]', () => app.openStudio());
}
WM.panelsUi = { init };
})();
