/* WARMAPS v2 PROTOTYPE — ui/studio.js
 * The theme studio (LAYOUT spec 8c). This file is fetched only when the studio is opened, and the entry to it
 * exists only when the address carries ?studio=1. It edits the SKIN only: the theme format has no field for a
 * shape, a size, a look, a chip word or a legend line, so the studio cannot touch the grammar.
 * Save, Export and Copy link are disabled while any check fails. An imported file is data: parsed, validated,
 * rebuilt from known keys, and shown as a preview with Keep and Discard.
 */
(function () {
'use strict';
const WM = window.WM = window.WM || {};
const { $, esc, on, toast } = WM.dom, M = WM.marks, TH = WM.theme, TC = WM.themeCheck;
let app, draft = null, backup = null, host = null;
// curated swatches per role (a file may still carry any #RRGGBB colour that passes the checks)
const SW = {
  ground: ['#060A0F', '#070B10', '#0B1118', '#0E1620', '#121B27', '#162230', '#101418', '#F4F1EA', '#FFFFFF', '#ECE8DF', '#F7F7F5', '#E6E9EE'],
  line: ['#1A2535', '#33475F', '#5C7A9C', '#5F7896', '#6E7C8F', '#C9C3B6', '#8494AA', '#44546A'],
  text: ['#E8EDF5', '#FFFFFF', '#A9B6C8', '#7EC8E3', '#7F93AD', '#8494AA', '#14202E', '#44546A', '#566579'],
  accent: ['#7EC8E3', '#E8EDF5', '#FFFFFF', '#FFEE00', '#F0E442', '#14202E', '#5F5400', '#B9A6F5', '#D8B4A0', '#5B3FB5', '#5E5A4A', '#9FB3C8', '#8FA8C8', '#4A5D73'],
  state: ['#FF4444', '#FF7A33', '#C62828', '#22CC55', '#2BB894', '#2E7D32']
};
const ROLE = k => /^bg-/.test(k) ? 'ground' : /^border-/.test(k) ? 'line' : /^text-/.test(k) ? 'text' : /^state-/.test(k) ? 'state' : 'accent';
const SETS = { Classic: ['#FFAA00', '#2AA4FF', '#7DFFB0', '#FF5C8A'], Ops: ['#E6B43C', '#56ACE3', '#7EEDCE', '#DF7781'], Paper: ['#9A4D00', '#1F5FCC', '#14401A', '#7A2E5C'] };
const LABEL = { 'theater-iran': 'Iran war', 'theater-ru': 'Russia-Ukraine', 'theater-ea': 'East Asia', 'theater-cb': 'Caribbean' };

const result = () => TH.validate(draft);
function strip() {
  const c = draft.colors, ths = ['iran-war', 'russia-ukraine', 'east-asia', 'caribbean'], looks = ['ghost', 'solid', 'split', 'faded', 'unattributed'];
  const rows = ths.map(th => `<div style="display:flex;align-items:center;gap:6px">${[18, 12, 8].map(d => looks.map(l => M.svg({ shape: M.SHAPE[th], look: l, d: l === 'split' ? Math.max(10, d) : d, color: c[M.TOKEN[th]], bg: c['bg-base'], tight: true }).html).join('')).join('<i style="width:8px"></i>')}</div>`).join('');
  const arc = (st, w) => `<svg width="46" height="10"><line x1="1" y1="5" x2="45" y2="5" stroke="${c.link}" stroke-width="${M.ARC.width(w)}" stroke-opacity="${M.ARC.opacity(st, w)}" ${M.ARC.dash(st) ? `stroke-dasharray="${M.ARC.dash(st).join(' ')}"` : ''}/></svg>`;
  return `<div style="background:${c['bg-base']};padding:10px;border:1px solid ${c['border-control']};display:grid;gap:6px">${rows}<div style="display:flex;gap:10px;align-items:center">${arc('solid', 3)}${arc('split', 2)}${arc('ghost', 1)}
    <span style="background:${c['bg-surface']};color:${c['text-primary']};border:1px solid ${c['border-control']};padding:4px 8px;font-size:12px">Card title <span style="color:${c['text-secondary']}">secondary</span> <span style="color:${c['text-muted']}">muted</span> <span style="color:${c.accent}">accent</span></span></div></div>`;
}
function render() {
  const r = result(), c = draft.colors, bad = r.ok ? [] : r.errors;
  const colorRow = k => `<div class="pad" style="padding-top:2px;padding-bottom:2px"><div class="note" style="display:flex;gap:8px;align-items:center"><i style="width:16px;height:16px;background:${TC.HEX.test(c[k]) ? c[k] : 'transparent'};border:1px solid var(--border-control)"></i><b style="color:var(--text-primary)">${esc(LABEL[k] || k)}</b><input type="text" data-hex="${k}" value="${esc(c[k])}" maxlength="7" aria-label="${esc(k)} as a six-digit hex colour" style="width:96px;min-height:32px;font-family:var(--font-data)"></div>
    <div class="swatches" style="margin-top:4px">${SW[ROLE(k)].map(h => `<button data-sw="${k}" data-c="${h}" aria-pressed="${c[k] === h}" aria-label="${h}" style="background:${h}"></button>`).join('')}</div></div>`;
  const seg = (key, vals, cur) => `<div class="seg" role="radiogroup" aria-label="${key}">${vals.map(v => `<button role="radio" data-set="${key}" data-v="${v}" aria-checked="${String(cur) === String(v)}">${esc(String(v))}</button>`).join('')}</div>`;
  host.innerHTML = `<header class="ph"><span class="ttl">Theme studio<span class="chip stamp">${esc(WM.strings.stampShort)}</span></span><button class="iconbtn" data-st="close" aria-label="Close the studio">${M.icon('x')}</button></header>
    <div class="pb"><div style="position:sticky;top:0;z-index:2;background:var(--bg-surface);border-bottom:1px solid var(--border-hairline)" class="pad">${strip()}
      <div class="actions" style="padding:var(--s2) 0 0"><button class="btn small" data-st="save" ${r.ok ? '' : 'disabled'}>Save on this device</button><button class="btn small" data-st="export" ${r.ok ? '' : 'disabled'}>Export file</button><button class="btn small" data-st="link" ${r.ok ? '' : 'disabled'}>Copy link</button><label class="btn small">Import file<input type="file" accept=".json,application/json" data-st="import" hidden></label><button class="btn small quiet" data-st="discard">Discard changes</button></div>
      <div class="note" style="margin-top:4px">${r.ok ? 'All ' + r.rows.length + ' checks pass.' : bad.length + ' ' + (bad.length === 1 ? 'check fails' : 'checks fail') + '. Save, Export and Copy link are off until they pass.'}</div>
      ${bad.length ? `<ul class="checks" style="max-height:120px;overflow:auto">${bad.slice(0, 12).map(e => `<li class="bad">${esc(e)}</li>`).join('')}</ul>` : ''}</div>
    <h3 class="sub">Name</h3><div class="pad"><input type="text" data-name value="${esc(draft.name)}" maxlength="24" aria-label="Theme name"></div>
    <h3 class="sub">Ground</h3><div class="pad">${seg('base', ['dark', 'light'], draft.base)}</div>
    <h3 class="sub">Theater colours: a ready-made set of four, or one by one</h3><div class="pad" style="display:flex;gap:8px;flex-wrap:wrap">${Object.entries(SETS).map(([n, s]) => `<button class="btn small" data-tset="${n}">${s.map(h => `<i style="width:10px;height:10px;background:${h}"></i>`).join('')}${n}</button>`).join('')}</div>
    ${['theater-iran', 'theater-ru', 'theater-ea', 'theater-cb'].map(k => `<div class="pad" style="padding-top:2px;padding-bottom:2px"><div class="note" style="display:flex;gap:8px;align-items:center">${M.svg({ shape: M.SHAPE[Object.keys(M.TOKEN).find(t => M.TOKEN[t] === k)], look: 'solid', d: 12, color: TC.HEX.test(c[k]) ? c[k] : '#888888', tight: true }).html}<b style="color:var(--text-primary)">${esc(LABEL[k])}</b><input type="text" data-hex="${k}" value="${esc(c[k])}" maxlength="7" aria-label="${esc(LABEL[k])} colour" style="width:96px;min-height:32px;font-family:var(--font-data)"><input type="color" data-pick="${k}" value="${TC.HEX.test(c[k]) ? c[k] : '#888888'}" aria-label="Pick"></div></div>`).join('')}
    <h3 class="sub">Colours</h3>${TC.COLOR_KEYS.filter(k => !/^theater-/.test(k)).map(colorRow).join('')}
    <h3 class="sub">Fonts</h3><div class="pad" style="display:grid;gap:6px"><span class="note">Display</span>${seg('fonts.display', ['plex-condensed', 'oswald'], draft.fonts.display)}<span class="note">Data</span>${seg('fonts.data', ['plex-mono', 'share-tech-mono'], draft.fonts.data)}<span class="note">Reading text is IBM Plex Sans in every theme.</span></div>
    <h3 class="sub">Icons, corners, glow</h3><div class="pad" style="display:grid;gap:6px">${seg('iconStroke', [1.5, 1.75, 2], draft.iconStroke)}${seg('iconStyle', ['outline', 'filled'], draft.iconStyle)}${seg('radius', ['sharp', 'standard', 'soft'], draft.radius)}${seg('glow', [0, 1, 2], draft.glow)}<span class="note">Glow is on the chrome and on the selected mark only, never on a mark because of its look.</span></div>
    <h3 class="sub">Density, motion, panels, map</h3><div class="pad" style="display:grid;gap:6px">${seg('density', ['auto', 'comfortable', 'compact'], draft.density)}${seg('motion', ['standard', 'calm'], draft.motion)}
      <label class="note">Panel opacity <span class="mono">${draft.panelOpacity.toFixed(2)}</span><input type="range" min="0.8" max="1" step="0.01" value="${draft.panelOpacity}" data-range="panelOpacity"></label>
      <label class="note">Opens with this map style<select data-sel="mapStyle">${Object.entries(TH.MAP_STYLES).map(([id, x]) => `<option value="${id}" ${draft.mapStyle === id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></label></div>
    <p class="pad note">Not here, on purpose: shapes, sizes, the four looks, chip words and legend lines. A theme changes the dress, never the meaning.</p></div>`;
}
/* Live preview: the real app restyles as each value changes, but only while every check passes. */
function changed(keepFocus) {
  const r = result(); if (r.ok) TH.apply(r.theme, { preview: true });
  const a = document.activeElement, key = a && (a.dataset.hex || (a.dataset.name !== undefined ? '__name' : null)), pos = a && a.selectionStart, top = $('.pb', host) ? $('.pb', host).scrollTop : 0;
  render(); $('.pb', host).scrollTop = top;
  if (keepFocus && key) { const n = key === '__name' ? $('[data-name]', host) : $(`[data-hex="${key}"]`, host); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (e) { /* not a text field */ } } }
}
function close(keep) { if (!keep && backup) TH.apply(backup); if (host) host.remove(); host = null; draft = null; }
function open(a) {
  app = a; if (host) return; backup = TH.current();
  draft = JSON.parse(TH.toJson(backup)); if (TH.builtin[draft.id]) { draft.id = 'my-' + draft.id; draft.name = 'My ' + draft.name; }
  host = document.createElement('div'); host.className = 'float studio'; host.setAttribute('role', 'dialog'); host.setAttribute('aria-label', 'Theme studio');
  const phone = WM.layout.isPhone(app.store.get().layout.cls);
  host.style.cssText = phone ? 'left:0;top:0;width:100vw;height:100dvh;max-width:none;max-height:none;resize:none;border-radius:0' : 'right:12px;top:60px;width:420px;height:calc(100dvh - 80px);max-height:none';
  $('#floats').appendChild(host); render();
  on(host, 'click', '[data-st="close"]', () => close(false));
  on(host, 'click', '[data-st="discard"]', () => { draft = JSON.parse(TH.toJson(backup)); if (TH.builtin[draft.id]) { draft.id = 'my-' + draft.id; draft.name = 'My ' + draft.name; } TH.apply(backup, { preview: true }); render(); });
  on(host, 'click', '[data-sw]', (ev, el) => { draft.colors[el.dataset.sw] = el.dataset.c; changed(); });
  on(host, 'input', '[data-hex]', (ev, el) => { draft.colors[el.dataset.hex] = el.value.trim(); if (TC.HEX.test(el.value.trim())) changed(true); });
  on(host, 'change', '[data-hex]', () => changed());
  on(host, 'input', '[data-pick]', (ev, el) => { draft.colors[el.dataset.pick] = el.value.toUpperCase(); changed(); });
  on(host, 'click', '[data-tset]', (ev, el) => { const s = SETS[el.dataset.tset]; ['theater-iran', 'theater-ru', 'theater-ea', 'theater-cb'].forEach((k, i) => { draft.colors[k] = s[i]; }); changed(); });
  on(host, 'click', '[data-set]', (ev, el) => { const k = el.dataset.set, v = ['iconStroke', 'glow'].includes(k) ? +el.dataset.v : el.dataset.v; if (k.startsWith('fonts.')) draft.fonts[k.slice(6)] = v; else draft[k] = v; changed(); });
  on(host, 'input', '[data-range]', (ev, el) => { draft.panelOpacity = Math.round(+el.value * 100) / 100; changed(); });
  on(host, 'change', '[data-sel]', (ev, el) => { draft.mapStyle = el.value; changed(); });
  on(host, 'input', '[data-name]', (ev, el) => { draft.name = el.value; draft.id = (el.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 32)) || 'my-theme'; if (TH.builtin[draft.id]) draft.id = 'my-' + draft.id; });
  on(host, 'change', '[data-name]', () => changed());
  on(host, 'click', '[data-st="save"]', () => { const r = TH.saveUserTheme(draft); if (!r.ok) return toast(r.errors[0]); backup = r.theme; app.setTheme(r.theme.id); toast('Saved on this device as “' + r.theme.name + '”.'); });
  on(host, 'click', '[data-st="export"]', () => { const r = result(); if (r.ok) TH.download(r.theme); });
  on(host, 'click', '[data-st="link"]', () => { const r = result(); if (r.ok) WM.dom.copyText(TH.toLink(r.theme)).then(ok => toast(ok ? 'Theme link copied. It opens as a preview.' : 'Could not copy on this browser.')); });
  on(host, 'change', '[data-st="import"]', (ev, el) => {
    const f = el.files && el.files[0]; if (!f) return;
    if (f.size > 4096) return toast('A theme file is under 4 KB. This one is larger and was not read.', null, 7000);
    const rd = new FileReader(); rd.onload = () => { const r = TH.parseText(String(rd.result)); if (!r.ok) return toast('Nothing was applied. The file failed: ' + r.errors.slice(0, 3).join('; ') + (r.errors.length > 3 ? ' (and ' + (r.errors.length - 3) + ' more)' : '') + '.', null, 10000); close(true); app.previewTheme(r.theme); }; rd.readAsText(f);
  });
}
WM.studio = { open, close };
})();
