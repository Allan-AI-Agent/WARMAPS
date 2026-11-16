/* WARMAPS v2 PROTOTYPE — ui/theme.js
 * The theme engine (DESIGN_SYSTEM 12-15). A theme is DATA: it is parsed, validated by the reference checks
 * (core/theme-check.js), rebuilt from its known keys, and applied one validated value at a time. Fonts and map
 * styles are ids looked up in the tables below; a theme cannot name a font file or a tile server.
 */
(function () {
'use strict';
const WM = window.WM = window.WM || {};
const { store, loadCss } = WM.dom;
const TC = WM.themeCheck;

const CDN = 'https://cdn.jsdelivr.net/npm/@fontsource/';
/* Bundled fonts (the real app self-hosts them; the prototype loads pinned files from the CDN, with integrity). */
const FONTS = {
  'plex-sans': { stack: '"IBM Plex Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif', css: [
    ['ibm-plex-sans@5.2.8/400.css', 'sha384-by8hCwJDxTOUHMGBI4elNkybAoX7Gs45s1pbgL9fdUTDy+tXTA+tZmiU+0LkwckA'],
    ['ibm-plex-sans@5.2.8/500.css', 'sha384-2TCRc0WTBOLzME2XrGv+j2jHDAvpfo6jNj9NfT75iyaGpL8kJUYF1q8ae+3teExy'],
    ['ibm-plex-sans@5.2.8/600.css', 'sha384-1dcQop1Fsaw4/4DmZbwqeTSgod1K+Zkz3QWtbAUGxmw7ECfIGKOHUIRKcGtpdNHx']] },
  'plex-condensed': { stack: '"IBM Plex Sans Condensed", "IBM Plex Sans", system-ui, sans-serif', css: [
    ['ibm-plex-sans-condensed@5.3.0/600.css', 'sha384-mIE9jVprcJNljzFy8eAcHjkSAhc2Y7zh8DXK6Qpxm9YaSndFxA1J7W9/FdGnPcHZ']] },
  'oswald': { stack: '"Oswald", "IBM Plex Sans Condensed", "IBM Plex Sans", system-ui, sans-serif', css: [
    ['oswald@5.3.0/400.css', 'sha384-iYFVxZG5babEQNtl5+b1xALS/EtqM1MhO8rbgqS38b5Ub0VMP+wiv8TmnzcZd3od'],
    ['oswald@5.3.0/600.css', 'sha384-UZMcYCHE5S6XlNA9lFy3tTPcQniziCfKaDpQqdgCIGw2ldEsCIIOpxDKy1fRlYzn']] },
  'plex-mono': { stack: '"IBM Plex Mono", ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace', css: [
    ['ibm-plex-mono@5.3.0/400.css', 'sha384-skmNCjNGr3vAP9enjEtv/Ifs9QVeKfEF6q4rnDaS7YqtsgrCVRjcB7LPcLnQyL9p'],
    ['ibm-plex-mono@5.3.0/500.css', 'sha384-Kc76rmz8/sN1crakstIAL9hO3G6GlkS7LXZxYz6aM3HgNHNuukjqpQ0xmqtD2X1B']] },
  // Share Tech Mono has no Cyrillic: Plex Mono follows it in the stack, glyph by glyph (DESIGN_SYSTEM 1.1)
  'share-tech-mono': { stack: '"Share Tech Mono", "IBM Plex Mono", ui-monospace, Menlo, Consolas, monospace', css: [
    ['share-tech-mono@5.3.0/400.css', 'sha384-nmJ/o6oZklGtW7EyLezEaOT0mZ4R20L/SAXpHs8gmo4Cb24jsZqCJQcrLOFLBpyU'],
    ['ibm-plex-mono@5.3.0/400.css', 'sha384-skmNCjNGr3vAP9enjEtv/Ifs9QVeKfEF6q4rnDaS7YqtsgrCVRjcB7LPcLnQyL9p']] }
};
const RADIUS = { sharp: [2, 4, 12], standard: [4, 8, 16], soft: [8, 12, 20] };

/* Map styles: the app's own table (DESIGN_SYSTEM 15.1). All keyless. No tile address ever comes from a theme or a link. */
const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/';
const TILE = svc => ESRI + svc + '/MapServer/tile/{z}/{y}/{x}';
const MAP_STYLES = {
  'tactical-dark': { name: 'Tactical dark', ground: 'dark', base: TILE('Canvas/World_Dark_Gray_Base'), labels: TILE('Canvas/World_Dark_Gray_Reference'),
    baseFilter: 'brightness(0.62) contrast(1.15) saturate(0.85)', labelFilter: 'brightness(0.78) contrast(1.1)', sea: '#070B10', land: '#141C26', border: '#33475F', credit: 'Esri, HERE, Garmin, © OpenStreetMap contributors' },
  'tactical-blue': { name: 'Tactical blue', ground: 'dark', base: TILE('Canvas/World_Dark_Gray_Base'), labels: TILE('Canvas/World_Dark_Gray_Reference'),
    baseFilter: 'brightness(0.62) contrast(1.15) sepia(1) hue-rotate(178deg) saturate(1.5)', labelFilter: 'brightness(0.78) contrast(1.1)', sea: '#060C16', land: '#101D30', border: '#2F4A6B', credit: 'Esri, HERE, Garmin, © OpenStreetMap contributors' },
  'tactical-green': { name: 'Tactical green', ground: 'dark', base: TILE('Canvas/World_Dark_Gray_Base'), labels: TILE('Canvas/World_Dark_Gray_Reference'),
    baseFilter: 'brightness(0.62) contrast(1.15) sepia(1) hue-rotate(85deg) saturate(1.2)', labelFilter: 'brightness(0.78) contrast(1.1)', sea: '#070D0B', land: '#11201A', border: '#2F5546', credit: 'Esri, HERE, Garmin, © OpenStreetMap contributors' },
  'light-gray': { name: 'Light gray', ground: 'light', base: TILE('Canvas/World_Light_Gray_Base'), labels: TILE('Canvas/World_Light_Gray_Reference'),
    baseFilter: 'none', labelFilter: 'none', sea: '#D4DADC', land: '#F0EEEA', border: '#B8B8B8', credit: 'Esri, HERE, Garmin, © OpenStreetMap contributors' },
  'satellite': { name: 'Satellite', ground: 'dark', imagery: true, base: TILE('World_Imagery'), labels: TILE('Reference/World_Boundaries_and_Places'),
    baseFilter: null, labelFilter: 'none', sea: '#0B1A2A', land: '#2A3324', border: '#C8C8C8', credit: 'Esri, Maxar, Earthstar Geographics, and the GIS user community' }
};
const SAT_DEFAULT = { dim: 35, sat: 70, labels: true };

const builtin = {}, K_USER = 'wm2proto.themes.v1', K_PREF = 'wm2proto.theme.v1';
let current = null;                     // the applied theme object
let detailLevel = 'standard';
const loadedCss = new Set();
// DESIGN_SYSTEM 13.1: a theme name is run through the forbidden-word list, so a link cannot put a verdict word in the chrome
const NAME_WORDS = ['confirmed', 'unconfirmed', 'verified', 'unverified', 'documented', 'credible', 'reliable', 'debunked', 'confidence', 'disinformation', 'misinformation', 'fake', 'probable', 'likely', 'alleged', 'proven', 'disproven', 'true', 'false', 'accurate', 'merger', 'merged'];

/* Validate, then build a NEW object from the known keys only. Returns { ok, theme, errors }. */
function validate(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { ok: false, errors: ['This is not a theme file.'] };
  if (raw.format === 'warmaps-theme' && typeof raw.formatVersion === 'number' && raw.formatVersion > 1) return { ok: false, errors: ['This theme needs a newer WARMAPS.'] };
  let res; try { res = TC.check(raw); } catch (e) { return { ok: false, errors: ['The file could not be checked.'] }; }
  const errors = res.err.slice();
  if (typeof raw.name === 'string' && (raw.name.toLowerCase().match(/[a-z]+/g) || []).some(w => NAME_WORDS.includes(w))) errors.push('name: uses a word WARMAPS does not use about records');
  if (errors.length) return { ok: false, errors, rows: res.rows };
  const t = { format: 'warmaps-theme', formatVersion: 1, id: String(raw.id), name: String(raw.name), base: raw.base, colors: {},
    fonts: { display: raw.fonts.display, ui: raw.fonts.ui, data: raw.fonts.data }, iconStroke: raw.iconStroke, iconStyle: raw.iconStyle, radius: raw.radius, glow: raw.glow,
    density: raw.density, motion: raw.motion, panelOpacity: raw.panelOpacity, mapStyle: raw.mapStyle };
  for (const k of TC.COLOR_KEYS) t.colors[k] = raw.colors[k].toUpperCase();
  if (!MAP_STYLES[t.mapStyle]) t.mapStyle = t.base === 'light' ? 'light-gray' : 'tactical-dark';   // 'terrain' is in the format but not built
  return { ok: true, theme: t, errors: [], rows: res.rows };
}
function parseText(text) {
  if (typeof text !== 'string' || text.length > 4096) return { ok: false, errors: ['A theme file is under 4 KB. This one is larger and was not read.'] };
  let raw; try { raw = JSON.parse(text); } catch (e) { return { ok: false, errors: ['This is not valid JSON.'] }; }
  return validate(raw);
}

async function loadBuiltins() {
  for (const id of ['classic', 'ops', 'paper']) {
    const r = await fetch('themes/' + id + '.json', { cache: 'no-cache' });
    const v = parseText(await r.text());
    if (!v.ok) throw new Error('built-in theme ' + id + ' failed its checks: ' + v.errors.join('; '));
    builtin[id] = v.theme;
  }
}

function ensureFonts(t) {
  for (const slot of ['ui', 'display', 'data']) for (const [file, sri] of FONTS[t.fonts[slot]].css) {
    if (loadedCss.has(file)) continue; loadedCss.add(file);
    loadCss(CDN + file, sri).catch(() => { /* the fallback stack holds the layout */ });
  }
}

/* Apply a validated theme. Colours are set one at a time, each re-checked against the #RRGGBB pattern. */
function apply(t, opts) {
  const root = document.documentElement, st = root.style;
  for (const k of TC.COLOR_KEYS) if (TC.HEX.test(t.colors[k])) st.setProperty('--' + k, t.colors[k]);
  const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)).join(',');
  st.setProperty('--bg-surface-rgb', rgb(t.colors['bg-surface'])); st.setProperty('--bg-raised-rgb', rgb(t.colors['bg-raised'])); st.setProperty('--bg-base-rgb', rgb(t.colors['bg-base']));
  st.setProperty('--font-ui', FONTS[t.fonts.ui].stack); st.setProperty('--font-display', FONTS[t.fonts.display].stack); st.setProperty('--font-data', FONTS[t.fonts.data].stack);
  const [r1, r2, r3] = RADIUS[t.radius]; st.setProperty('--r-control', r1 + 'px'); st.setProperty('--r-card', r2 + 'px'); st.setProperty('--r-sheet', r3 + 'px');
  st.setProperty('--icon-stroke', String(t.iconStroke)); st.setProperty('--panel-opacity', String(t.panelOpacity));
  root.dataset.base = t.base; root.dataset.iconStyle = t.iconStyle; root.dataset.motion = t.motion; root.dataset.density = t.density;
  root.dataset.display = t.fonts.display;
  current = t; applyGlow();
  ensureFonts(t);
  const meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.setAttribute('content', t.colors['bg-surface']);
  if (!opts || !opts.preview) store.set(K_PREF, { id: t.id });
  document.dispatchEvent(new CustomEvent('wm:theme', { detail: { theme: t } }));
}
/* Glow is capped at level 1 at the Lite detail level; the theme itself is not changed (DESIGN_SYSTEM 16). */
function applyGlow() { if (current) document.documentElement.dataset.glow = String(Math.min(current.glow, detailLevel === 'lite' ? 1 : 2)); }
function setDetail(level) { detailLevel = level; applyGlow(); }

/* The colours the STAGE uses (markers, arcs, tracks, compare). On the other ground a theme borrows the built-in
 * set for that ground: Ops on dark-ground styles, Paper on light ones (DESIGN_SYSTEM 15.3). */
function stageColors(mapStyleId, forceGround) {
  const ground = forceGround || (MAP_STYLES[mapStyleId] || MAP_STYLES['tactical-dark']).ground;
  const t = current && current.base === ground ? current : (ground === 'dark' ? builtin.ops : builtin.paper) || current;
  return Object.assign({ ground }, t.colors);
}

/* ---- user themes: this browser, this device, 12 at most ---------------------------------------------- */
function userThemes() { return (store.get(K_USER, []) || []).map(validate).filter(v => v.ok).map(v => v.theme); }
function saveUserTheme(t) {
  const v = validate(t); if (!v.ok) return v;
  const list = userThemes().filter(x => x.id !== v.theme.id);
  if (list.length >= 12) return { ok: false, errors: ['12 themes are saved on this device already. Delete one first.'] };
  list.push(v.theme); store.set(K_USER, list); return v;
}
function deleteUserTheme(id) { store.set(K_USER, userThemes().filter(x => x.id !== id)); }
const all = () => [builtin.classic, builtin.ops, builtin.paper, ...userThemes()].filter(Boolean);
const byId = id => builtin[id] || userThemes().find(t => t.id === id) || null;

/* ---- export and import -------------------------------------------------------------------------------- */
const toJson = t => JSON.stringify(t, null, 2);
function b64url(s) { return btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function unb64url(s) { try { return decodeURIComponent(escape(atob(String(s).replace(/-/g, '+').replace(/_/g, '/')))); } catch (e) { return null; } }
const toLink = t => location.origin + location.pathname + '#theme=' + b64url(JSON.stringify(t));
function fromLinkParam(p) { const text = unb64url(p); return text == null ? { ok: false, errors: ['The theme link could not be read.'] } : parseText(text); }
function download(t) {
  const blob = new Blob([toJson(t)], { type: 'application/json' }), a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = t.id + '.warmaps-theme.json'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/* First visit: the default theme (decision 8, provisional: Classic), or Paper if the device asks for a light scheme. */
function initial() {
  const pref = store.get(K_PREF, null);
  if (pref && byId(pref.id)) return byId(pref.id);
  return (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ? builtin.paper : builtin.classic;
}

WM.theme = { FONTS, RADIUS, MAP_STYLES, SAT_DEFAULT, builtin, loadBuiltins, validate, parseText, apply, setDetail, stageColors, current: () => current,
  userThemes, saveUserTheme, deleteUserTheme, all, byId, toJson, toLink, fromLinkParam, download, initial, NAME_WORDS };
})();
