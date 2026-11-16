/* WARMAPS v2 PROTOTYPE — views/marks.js
 * The visual grammar, in one place (DESIGN_SYSTEM 2.2-2.4, 2.8, 12.1). The 2D map, the globe, the legend, the
 * chips and the theme studio all draw marks with these functions, so a ghost is the same ghost everywhere.
 * A theme supplies colours only; nothing here can be changed by a theme.
 */
(function () {
'use strict';
const WM = window.WM = window.WM || {};

const SHAPE = { 'iran-war': 'circle', 'russia-ukraine': 'diamond', 'east-asia': 'triangle', 'caribbean': 'hexagon' };
const TOKEN = { 'iran-war': 'theater-iran', 'russia-ukraine': 'theater-ru', 'east-asia': 'theater-ea', 'caribbean': 'theater-cb' };
const SIZES = { milestone: [18, 20], major: [12, 14], standard: [7, 8] };       // phone / larger
const KEY = '#070B10';                                                            // keyline on imagery (DESIGN_SYSTEM 15.3)
const f = n => +n.toFixed(2);

function path(shape, r) {
  if (shape === 'circle') return `M${f(-r)},0a${f(r)},${f(r)} 0 1,0 ${f(2 * r)},0a${f(r)},${f(r)} 0 1,0 ${f(-2 * r)},0Z`;
  if (shape === 'diamond') { const k = r * 1.18; return `M0,${f(-k)}L${f(k)},0L0,${f(k)}L${f(-k)},0Z`; }
  if (shape === 'triangle') { const k = r * 1.3, h = k * 0.866; return `M0,${f(-k)}L${f(h)},${f(k / 2)}L${f(-h)},${f(k / 2)}Z`; }
  const k = r * 1.1, pts = [0, 1, 2, 3, 4, 5].map(i => { const a = Math.PI / 3 * i + Math.PI / 6; return f(k * Math.cos(a)) + ',' + f(k * Math.sin(a)); });
  return 'M' + pts.join('L') + 'Z';
}
// top and bottom of a shape on its centre line (for the split mark's middle line)
const vExtent = (shape, r) => shape === 'circle' ? [-r, r] : shape === 'diamond' ? [-r * 1.18, r * 1.18] : shape === 'triangle' ? [-r * 1.3, r * 0.65] : [-r * 1.1, r * 1.1];
function size(tier, look, phone) {
  let d = (SIZES[tier] || SIZES.standard)[phone ? 0 : 1];
  if (look === 'split') d = Math.max(d, 10);                                      // so the halves can be told apart
  return d;
}
// one half of the drawing area, clipped with a nested viewport so no ids are needed
const half = (side, R, inner) => `<svg x="${side === 'left' ? -R : 0}" y="${-R}" width="${R}" height="${2 * R}" viewBox="${side === 'left' ? -R : 0} ${-R} ${R} ${2 * R}" overflow="hidden">${inner}</svg>`;

/* o: { shape, look, d (diameter px), color, bg, selectedColor, selected, halo, imagery, softHalo, age, compare, glow }
 * compare: { left: {mode, color}, right: {mode, color} } with mode fill | outline | slash | none. */
function svg(o) {
  const r = o.d / 2, R = Math.ceil(r * 1.3 + (o.tight ? 1.5 : 8)), p = path(o.shape, r), bg = o.bg || KEY, c = o.color;
  let g = '';
  const under = (w, op) => `<path d="${p}" fill="none" stroke="${KEY}" stroke-opacity="${op}" stroke-width="${w}"/>`;
  if (o.halo && (o.halo === 'all' || (o.look !== 'ghost' && o.look !== 'faded'))) g += `<path d="${path(o.shape, r + 4)}" fill="none" stroke="${c}" stroke-opacity="0.3" stroke-width="2"/>`;
  if (o.compare) {
    const draw = (side, h) => {
      if (!h || h.mode === 'none') return '';
      let s = '';
      if (o.imagery) s += under(h.mode === 'fill' ? 3 : 3.25, 0.8);
      if (h.mode === 'fill') s += `<path d="${p}" fill="${h.color}" stroke="${bg}" stroke-opacity="0.9" stroke-width="1"/>`;
      else s += `<path d="${p}" fill="none" stroke="${h.color}" stroke-opacity="0.85" stroke-width="1.25"/>`;
      if (h.mode === 'slash') { const x = side === 'left' ? -r / 2 : r / 2; s += `<line x1="${f(x - r * 0.45)}" y1="${f(r * 0.6)}" x2="${f(x + r * 0.45)}" y2="${f(-r * 0.6)}" stroke="${h.color}" stroke-width="1"/>`; }
      return half(side, R, s);
    };
    g += draw('left', o.compare.left) + draw('right', o.compare.right);
  } else if (o.look === 'ghost' || o.look === 'faded') {
    if (o.imagery) g += under(o.look === 'ghost' ? 3.25 : 3, 0.8);
    g += o.look === 'ghost'
      ? `<path d="${p}" fill="none" stroke="${c}" stroke-opacity="0.85" stroke-width="1.25"/>`
      : `<path d="${p}" fill="none" stroke="${c}" stroke-opacity="0.6" stroke-width="1" stroke-dasharray="2 2"/>`;
  } else if (o.look === 'solid') {
    if (o.imagery && o.softHalo) g += under(5, 0.5);
    g += `<path d="${p}" fill="${c}" stroke="${o.imagery ? KEY : bg}" stroke-opacity="0.9" stroke-width="1"/>`;
  } else if (o.look === 'split') {
    if (o.imagery) g += under(o.softHalo ? 5.5 : 3.5, o.softHalo ? 0.5 : 0.8);
    const [y0, y1] = vExtent(o.shape, r);
    g += half('left', R, `<path d="${p}" fill="${c}"/>`) + `<path d="${p}" fill="none" stroke="${c}" stroke-width="1.5"/><line x1="0" y1="${f(y0)}" x2="0" y2="${f(y1)}" stroke="${c}" stroke-width="1"/>`;
  } else if (o.look === 'unattributed') {
    if (o.imagery) g += under(2, 0.8);
    g += `<path d="${p}" fill="${c}" fill-opacity="0.55"/>`;
  }
  if (o.selected) g += `<path d="${path(o.shape, r + 6)}" fill="none" stroke="${o.selectedColor || '#FFFFFF'}" stroke-width="2"/>`;
  const op = o.age != null && o.age < 1 ? ` opacity="${o.age}"` : '';
  return { box: 2 * R, html: `<svg xmlns="http://www.w3.org/2000/svg" width="${2 * R}" height="${2 * R}" viewBox="${-R} ${-R} ${2 * R} ${2 * R}" aria-hidden="true"${op}>${g}</svg>` };
}
const dataUri = html => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(html);

/* A group badge: a count only; outlined when every member is a ghost, filled otherwise (DESIGN_SYSTEM 2.4). */
function badge(o) {
  const text = String(o.count) + (o.oneSided != null ? '·' + o.oneSided : ''), w = Math.max(24, 12 + text.length * 7), h = 24;
  const fill = o.allGhost ? 'none' : o.color, ink = o.allGhost ? o.color : o.bg;
  return { w, h, html: `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true">${o.allGhost && o.imagery ? `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${o.shape === 'circle' ? 11 : 3}" fill="${KEY}" fill-opacity="0.55" stroke="${KEY}" stroke-opacity="0.8" stroke-width="3.25"/>` : ''}<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${o.shape === 'circle' ? 11 : 3}" fill="${fill}" stroke="${o.allGhost ? o.color : KEY}" stroke-width="${o.allGhost ? 1.25 : 1}"/><text x="${w / 2}" y="16.5" text-anchor="middle" font-family="ui-monospace,monospace" font-size="12" font-weight="600" fill="${ink}">${text}</text></svg>` };
}

/* Launch-origin icons: Allan's rocket and drone drawings, carried over from v1 (index.html "Missile: vertical
 * rocket" and "Drone: delta wing"), shapes and colours unchanged. They are their own symbols, like tracks: not a
 * theater shape, and they carry no ghost or solid look. bold = v1's bold mode: the rocket's exhaust flame (three
 * variants, cycled by index) and the drone's glow and contrail. The animation classes are in app.css. */
let originSeq = 0;
function origin(kind, o) {
  o = o || {}; const bm = !!o.bold, uid = 'wmo' + (originSeq++), pre = 'drop-shadow(0 0 1.5px rgba(255,255,255,0.7)) ';
  if (kind === 'drone') {
    const iC = '#ff6600', iC2 = 'rgba(255,102,0,0.50)', dLO = 'rgba(255,200,100,0.90)';
    const glow = pre + (bm ? `drop-shadow(0 0 5px ${iC}) drop-shadow(0 0 12px ${iC}88)` : `drop-shadow(0 0 4px ${iC}) drop-shadow(0 0 8px ${iC}55)`);
    const anim = bm ? `<ellipse class="wmo-dof" cx="15" cy="12" rx="14" ry="10" fill="none" stroke="rgba(255,160,40,0.42)" stroke-width="5"/>
      <path class="wmo-doa" d="M15 22 A14 10 0 0 1 1 12" fill="none" stroke="rgba(255,160,40,0.50)" stroke-width="4" stroke-linecap="round"/>
      <path class="wmo-dw" d="M2 5 L15 30 L28 5" fill="none" stroke="rgba(255,255,255,0.28)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
      <ellipse class="wmo-dw" cx="15" cy="27" rx="13" ry="6" fill="rgba(255,255,255,0.12)" stroke="none"/>
      <ellipse class="wmo-db" cx="15" cy="29" rx="11" ry="5" fill="rgba(100,160,255,0.10)" stroke="rgba(100,180,255,0.15)" stroke-width="0.5"/>` : '';
    return `<svg viewBox="0 0 30 24" width="30" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="display:block;overflow:visible;filter:${glow}">${anim}
      <path d="M15 3 L26 19 L20 17 L15 21 L10 17 L4 19 Z" stroke="${bm ? '#cc2200' : dLO}" stroke-width="${bm ? '2.0' : '1.2'}" fill="${iC2}"/>
      <line x1="15" y1="3" x2="15" y2="19" stroke="${bm ? iC : '#888888'}" stroke-width="${bm ? '1.5' : '0.9'}" opacity="0.85"/>
      <circle cx="15" cy="19" r="2" stroke="${dLO}" stroke-width="1" fill="${iC2}"/><circle cx="15" cy="4" r="1.2" fill="${iC}" opacity="0.9"/></svg>`;
  }
  const iC = '#aa0000', iC2 = 'rgba(180,0,0,0.55)', sw = bm ? '2.8' : '2.0', v = (o.variant || 0) % 3;
  const wGlow = bm ? ' drop-shadow(2px 0 5px rgba(255,255,255,0.42)) drop-shadow(-2px 0 5px rgba(255,255,255,0.42)) drop-shadow(0 -3px 6px rgba(255,255,255,0.38))' : '';
  const glow = pre + (bm ? `drop-shadow(0 0 5px ${iC}) drop-shadow(0 0 14px ${iC}cc)` + wGlow : `drop-shadow(0 0 4px ${iC}) drop-shadow(0 0 8px ${iC}55)`);
  const flag = o.flag === 'iran' ? `<rect x="5" y="10" width="6" height="2.7" fill="#239f40"/><rect x="5" y="12.7" width="6" height="2.6" fill="#f0f0f0"/><path d="M7.8 13.1 L8 12.9 L8.2 13.1 L8.2 14.8 L8 15.0 L7.8 14.8 Z" fill="#da0000" opacity="0.85"/><rect x="5" y="15.3" width="6" height="2.7" fill="#da0000"/>` : '';
  let ex = '';
  if (bm) {
    const A = `url(#${uid}A)`, S = `url(#${uid}S)`;
    ex = `<defs><radialGradient id="${uid}A" cx="50%" cy="100%" r="65%" fx="50%" fy="98%"><stop offset="0%" stop-color="#ffe060" stop-opacity="0.95"/><stop offset="28%" stop-color="#ff6600" stop-opacity="0.75"/><stop offset="60%" stop-color="#cc1100" stop-opacity="0.40"/><stop offset="100%" stop-color="#880000" stop-opacity="0"/></radialGradient>
      <radialGradient id="${uid}S" cx="50%" cy="100%" r="55%" fx="50%" fy="98%"><stop offset="0%" stop-color="#ffdd40" stop-opacity="0.85"/><stop offset="40%" stop-color="#ff4400" stop-opacity="0.50"/><stop offset="100%" stop-color="#880000" stop-opacity="0"/></radialGradient></defs>` +
      (v === 0 ? `<ellipse class="wmo-ex" cx="8" cy="33" rx="3.5" ry="10" fill="${A}"/><ellipse class="wmo-exb" cx="8" cy="36" rx="3.5" ry="14" fill="${A}" opacity="0.5"/><ellipse class="wmo-exs" cx="4.5" cy="34" rx="1.8" ry="6" fill="${S}"/><ellipse class="wmo-exs" cx="11.5" cy="34" rx="1.8" ry="6" fill="${S}"/>`
        : v === 1 ? `<ellipse class="wmo-ex" cx="8" cy="33" rx="7.5" ry="11" fill="${A}"/><ellipse class="wmo-exb" cx="8" cy="37" rx="7.5" ry="15" fill="${A}" opacity="0.45"/>`
          : `<ellipse class="wmo-ex" cx="8" cy="33" rx="3" ry="10" fill="${A}"/><ellipse class="wmo-exb" cx="8" cy="37" rx="3" ry="14" fill="${A}" opacity="0.5"/><ellipse class="wmo-exs" cx="5" cy="34" rx="2.2" ry="7" fill="${S}" style="animation-delay:0.7s"/><ellipse class="wmo-exs" cx="11" cy="34" rx="2.2" ry="7" fill="${S}" style="animation-delay:0.7s"/>`);
  }
  return `<svg viewBox="0 0 16 38" width="16" height="38" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="display:block;overflow:visible;filter:${glow}">${ex}
    <path d="M8 1 L11 6 L11 22 L8 29 L5 22 L5 6 Z" stroke="${iC}" stroke-width="${sw}" fill="${bm ? iC : iC2}"/>${flag}
    <path d="M5 20 L2 27 L5 25" stroke="${iC}" stroke-width="${sw}" fill="${iC}"/><path d="M11 20 L14 27 L11 25" stroke="${iC}" stroke-width="${sw}" fill="${iC}"/>
    <ellipse cx="8" cy="28" rx="2" ry="1.2" fill="${iC}" opacity="0.8"/></svg>`;
}

/* OBSERVED tracks: their own shapes, one neutral colour, a dark keyline. Never a ghost or solid look. */
function track(type, color, heading) {
  const d = type === 'aircraft' ? 'M0,-7L5,6L0,3L-5,6Z' : 'M0,-7L3.5,-2L3.5,6L-3.5,6L-3.5,-2Z';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="-10 -10 20 20" aria-hidden="true"><g transform="rotate(${heading || 0})"><path d="${d}" fill="${type === 'aircraft' ? color : 'none'}" stroke="${KEY}" stroke-width="3" stroke-linejoin="round"/><path d="${d}" fill="${type === 'aircraft' ? color : 'none'}" stroke="${color}" stroke-width="1.25" stroke-linejoin="round"/></g></svg>`;
}

/* Link category glyphs (12 px, stroke only): shown at an arc's midpoint and in lists. Category is never a colour. */
const CAT = {
  'weapons-tech': 'M6,1.5L8.5,6V10.5H3.5V6Z M3.5,10.5L2,12 M8.5,10.5L10,12',
  'intelligence': 'M1,6C3,2.5 9,2.5 11,6C9,9.5 3,9.5 1,6Z M6,4.6A1.4,1.4 0 1,0 6,7.4A1.4,1.4 0 1,0 6,4.6Z',
  'sanctions-finance': 'M6,1.2A4.8,4.8 0 1,0 6,10.8A4.8,4.8 0 1,0 6,1.2Z M6,3.2V8.8 M7.6,4.4H5.2A1.1,1.1 0 0,0 5.2,6.1H6.8A1.1,1.1 0 0,1 6.8,7.8H4.4',
  'energy-shipping': 'M6,1.2C8,4 9.8,5.8 9.8,7.6A3.8,3.8 0 0,1 2.2,7.6C2.2,5.8 4,4 6,1.2Z',
  'personnel': 'M6,1.4A2,2 0 1,0 6,5.4A2,2 0 1,0 6,1.4Z M2,11C2,8 4,6.8 6,6.8C8,6.8 10,8 10,11',
  'backing-diplomatic': 'M1,4.5H3.5L6,6.5L8.5,4.5H11 M3.5,4.5V8L6,10L8.5,8V4.5'
};
const CAT_NAME = { 'weapons-tech': 'Weapons and technology', 'intelligence': 'Intelligence', 'sanctions-finance': 'Sanctions and finance', 'energy-shipping': 'Energy and shipping', 'personnel': 'Personnel', 'backing-diplomatic': 'Backing and diplomacy' };
const catGlyph = (cat, color, px) => `<svg xmlns="http://www.w3.org/2000/svg" width="${px || 14}" height="${px || 14}" viewBox="0 0 12 12" aria-hidden="true"><path d="${CAT[cat]}" fill="none" stroke="${color}" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/* Arc line styles (DESIGN_SYSTEM 5): the style says who has spoken; the width counts voices. One colour. */
const ARC = {
  width: step => [1, 1.5, 2.5, 4, 6][step] || 1,
  opacity: (state, step) => step === 0 ? 0.4 : state === 'ghost' ? 0.6 : 1,
  dash: state => state === 'split' ? [8, 6] : state === 'ghost' ? [1, 5] : null
};

/* Interface icons: 24 px grid, round joins; stroke width comes from the theme (--icon-stroke). */
const ICON = {
  list: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01', star: 'M12 3l2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 17l-5.4 2.8 1.1-6.1L3.2 9.4l6.1-.8z',
  watch: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zM12 9a3 3 0 100 6 3 3 0 000-6z', link: 'M4 18C7 8 17 8 20 18M4 18h.01M20 18h.01',
  stats: 'M4 20V10M10 20V4M16 20v-7M22 20H2', brief: 'M5 3v18M5 4h11l-2 4 2 4H5', book: 'M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2zM4 21V5M8 7h7M8 11h7',
  settings: 'M4 7h9M17 7h3M4 17h3M11 17h9M15 5v4M9 15v4', help: 'M12 21a9 9 0 100-18 9 9 0 000 18zM9.5 9.5a2.5 2.5 0 114 2c-.8.6-1.5 1.1-1.5 2.3M12 17h.01',
  layers: 'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5M3 17l9 5 9-5', lens: 'M3 12a4 4 0 108 0 4 4 0 00-8 0zM13 12a4 4 0 108 0 4 4 0 00-8 0zM11 12h2',
  globe: 'M12 21a9 9 0 100-18 9 9 0 000 18zM3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18', map: 'M9 4L3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14',
  play: 'M7 4l13 8-13 8z', pause: 'M7 4v16M17 4v16', prev: 'M15 5l-7 7 7 7', next: 'M9 5l7 7-7 7', x: 'M5 5l14 14M19 5L5 19',
  pin: 'M9 3h6l-1 6 3 3H7l3-3zM12 12v9', move: 'M12 3v18M3 12h18M12 3l-3 3M12 3l3 3M12 21l-3-3M12 21l3-3M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3',
  more: 'M5 12h.01M12 12h.01M19 12h.01', clean: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5', restore: 'M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5',
  search: 'M11 18a7 7 0 100-14 7 7 0 000 14zM20 20l-4-4', back: 'M11 5l-7 7 7 7M4 12h16', today: 'M5 5h14v15H5zM5 9h14M9 3v4M15 3v4M12 14h.01',
  copy: 'M9 9h11v11H9zM5 15H4V4h11v1', swap: 'M4 8h14l-3-3M20 16H6l3 3', menu: 'M4 6h16M4 12h16M4 18h16', chevron: 'M6 9l6 6 6-6', up: 'M6 15l6-6 6 6',
  full: 'M4 4h6M4 4v6M20 4h-6M20 4v6M4 20h6M4 20v-6M20 20h-6M20 20v-6', check: 'M5 12l5 5 9-10', info: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 11v6M12 7h.01',
  target: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 15a3 3 0 100-6 3 3 0 000 6z', expand: 'M6 9l6 6 6-6', external: 'M14 4h6v6M20 4l-9 9M18 14v6H4V6h6'
};
const icon = (name, px) => `<svg class="ico" width="${px || 22}" height="${px || 22}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ICON[name] || ''}"/></svg>`;

WM.marks = { SHAPE, TOKEN, SIZES, KEY, path, size, svg, dataUri, badge, track, catGlyph, CAT_NAME, ARC, icon, ICON, origin };
})();
