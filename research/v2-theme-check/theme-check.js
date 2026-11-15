#!/usr/bin/env node
// WARMAPS v2 theme check (reference for the theme validator; DESIGN_SYSTEM v1.2 section 13).
// Usage: node theme-check.js [--table] themes/*.json
// A theme file is DATA. This script reads only fixed keys, fixed choices, numbers and #RRGGBB colours.
'use strict';
const fs = require('fs');

const HEX = /^#[0-9A-Fa-f]{6}$/;
const COLOR_KEYS = ['bg-base','bg-surface','bg-raised','border-hairline','border-control','text-primary',
  'text-secondary','text-muted','accent','focus','selected','lens','theater-iran','theater-ru','theater-ea',
  'theater-cb','link','track','compare-a','compare-b','state-error','state-ok'];
const CHOICES = {
  base: ['dark','light'],
  'fonts.display': ['plex-condensed','oswald'],
  'fonts.ui': ['plex-sans'],
  'fonts.data': ['plex-mono','share-tech-mono'],
  iconStroke: [1.5,1.75,2],
  iconStyle: ['outline','filled'],
  radius: ['sharp','standard','soft'],
  glow: [0,1,2],
  density: ['auto','comfortable','compact'],
  motion: ['standard','calm'],
  mapStyle: ['tactical-dark','tactical-blue','tactical-green','light-gray','satellite','terrain']
};
const TOP_KEYS = ['format','formatVersion','id','name','base','colors','fonts','iconStroke','iconStyle','radius',
  'glow','density','motion','panelOpacity','mapStyle'];
const THEATERS = ['theater-iran','theater-ru','theater-ea','theater-cb'];

// ---- colour maths -------------------------------------------------------------------------------
const rgb = h => [1,3,5].map(i => parseInt(h.slice(i,i+2),16)/255);
const lin = c => c <= 0.04045 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4);
const lum = h => { const [r,g,b] = rgb(h).map(lin); return 0.2126*r + 0.7152*g + 0.0722*b; };
const contrast = (a,b) => { const [x,y] = [lum(a),lum(b)].sort((p,q)=>q-p); return (x+0.05)/(y+0.05); };
const toHex = v => '#' + v.map(c => Math.round(Math.min(1,Math.max(0,c))*255).toString(16).padStart(2,'0')).join('').toUpperCase();
// colour drawn at opacity `a` over ground `bg` (sRGB compositing, as browsers do)
const over = (fg,bg,a) => { const f = rgb(fg), b = rgb(bg); return toHex(f.map((c,i)=>c*a + b[i]*(1-a))); };
// OKLab (Ottosson 2020); distance x100 is used as the difference figure
const oklab = h => { const [r,g,b] = rgb(h).map(lin);
  const l = Math.cbrt(0.4122214708*r+0.5363325363*g+0.0514459929*b),
        m = Math.cbrt(0.2119034982*r+0.6806995451*g+0.1073969566*b),
        s = Math.cbrt(0.0883024619*r+0.2817188376*g+0.6299787005*b);
  return [0.2104542553*l+0.7936177850*m-0.0040720468*s, 1.9779984951*l-2.4285922050*m+0.4505937099*s,
          0.0259040371*l+0.7827717662*m-0.8086757660*s]; };
const dE = (a,b) => { const x = oklab(a), y = oklab(b); return 100*Math.hypot(x[0]-y[0],x[1]-y[1],x[2]-y[2]); };
// Colour-vision simulation, Machado, Oliveira and Fernandes 2009, severity 1.0, applied in linear RGB
const CVD = {
  protan: [[0.152286,1.052583,-0.204868],[0.114503,0.786281,0.099216],[-0.003882,-0.048116,1.051998]],
  deutan: [[0.367322,0.860646,-0.227968],[0.280085,0.672501,0.047413],[-0.011820,0.042940,0.968881]],
  tritan: [[1.255528,-0.076749,-0.178779],[-0.078411,0.930809,0.147602],[0.004733,0.691367,0.303900]]
};
const gam = c => c <= 0.0031308 ? 12.92*c : 1.055*Math.pow(c,1/2.4)-0.055;
const sim = (h,kind) => { const v = rgb(h).map(lin), m = CVD[kind];
  return toHex(m.map(row => gam(Math.min(1,Math.max(0,row[0]*v[0]+row[1]*v[1]+row[2]*v[2]))))); };

// ---- limits (the grammar's contrast minimums; DESIGN_SYSTEM v1.2 section 13.3) ---------------------
const LIMITS = {
  text: 4.5, control: 3.0, theaterSolid: 4.5, ghost85: 3.0, faded60: 2.5, plain55: 2.3,
  theaterPairNormal: 15, theaterPairRedGreen: 10, theaterPairTritan: 8, compareLumMax: 1.5, comparePair: 12, semanticVsTheater: 8
};

function check(t) {
  const err = [], rows = [], add = (name, value, min, ok) => { rows.push({name, value, min, ok}); if (!ok) err.push(`${name}: ${value} (needs ${min})`); };
  // 1. shape: only known keys, fixed choices, numbers and colours
  if (t.format !== 'warmaps-theme') err.push('format must be "warmaps-theme"');
  if (t.formatVersion !== 1) err.push('formatVersion must be 1');
  for (const k of Object.keys(t)) if (!TOP_KEYS.includes(k)) err.push(`unknown key "${k}"`);
  if (typeof t.id !== 'string' || !/^[a-z0-9-]{1,32}$/.test(t.id)) err.push('id: lower-case letters, digits, hyphen, 32 at most');
  if (typeof t.name !== 'string' || !/^[\p{L}\p{N} .,'-]{1,40}$/u.test(t.name)) err.push('name: letters, digits, spaces and . , \' - only, 40 at most');
  const c = t.colors || {};
  for (const k of Object.keys(c)) if (!COLOR_KEYS.includes(k)) err.push(`unknown colour "${k}"`);
  for (const k of COLOR_KEYS) if (typeof c[k] !== 'string' || !HEX.test(c[k])) err.push(`colour "${k}" must be #RRGGBB`);
  const get = p => p.split('.').reduce((o,k)=>o && o[k], t);
  for (const [p,allowed] of Object.entries(CHOICES)) if (!allowed.includes(get(p))) err.push(`${p}: not one of ${allowed.join(', ')}`);
  for (const k of Object.keys(t.fonts || {})) if (!['display','ui','data'].includes(k)) err.push(`unknown font slot "${k}"`);
  const po = t.panelOpacity;
  if (typeof po !== 'number' || po < 0.8 || po > 1 || Math.abs(po*100 - Math.round(po*100)) > 1e-9) err.push('panelOpacity: 0.80 to 1.00 in steps of 0.01');
  if (err.length) return {err, rows};
  if (t.base === 'dark' ? lum(c['bg-base']) > 0.05 : lum(c['bg-base']) < 0.6) err.push('bg-base does not match base (dark needs a dark ground, light a light one)');

  // 2. contrast pairs
  const r = (a,b) => Math.floor(contrast(a,b)*100)/100;   // rounded DOWN, so a figure never flatters
  for (const g of ['bg-base','bg-surface','bg-raised']) {
    for (const k of ['text-primary','text-secondary','text-muted']) add(`${k} on ${g}`, r(c[k],c[g]), LIMITS.text, r(c[k],c[g]) >= LIMITS.text);
    add(`border-control on ${g}`, r(c['border-control'],c[g]), LIMITS.control, r(c['border-control'],c[g]) >= LIMITS.control);
  }
  for (const k of ['accent','state-error','state-ok']) add(`${k} on bg-surface`, r(c[k],c['bg-surface']), LIMITS.text, r(c[k],c['bg-surface']) >= LIMITS.text);
  for (const k of ['focus','selected','lens']) add(`${k} on bg-base`, r(c[k],c['bg-base']), LIMITS.control, r(c[k],c['bg-base']) >= LIMITS.control);
  for (const k of ['link','compare-a','compare-b']) add(`${k} on bg-base`, r(c[k],c['bg-base']), LIMITS.text, r(c[k],c['bg-base']) >= LIMITS.text);
  add('track on bg-base', r(c.track,c['bg-base']), LIMITS.control, r(c.track,c['bg-base']) >= LIMITS.control);
  for (const k of THEATERS) {
    const b = c['bg-base'];
    add(`${k} solid on bg-base`, r(c[k],b), LIMITS.theaterSolid, r(c[k],b) >= LIMITS.theaterSolid);
    const g = r(over(c[k],b,0.85),b), f = r(over(c[k],b,0.60),b), p = r(over(c[k],b,0.55),b);
    add(`${k} ghost outline (85%)`, g, LIMITS.ghost85, g >= LIMITS.ghost85);
    add(`${k} faded ghost (60%)`, f, LIMITS.faded60, f >= LIMITS.faded60);
    add(`${k} not yet attributed (55%)`, p, LIMITS.plain55, p >= LIMITS.plain55);
  }
  // 3. theater colours mutually distinguishable, with and without colour vision
  for (let i=0;i<4;i++) for (let j=i+1;j<4;j++) {
    const a = c[THEATERS[i]], b = c[THEATERS[j]], n = Math.round(dE(a,b)*10)/10;
    const rg = Math.round(Math.min(dE(sim(a,'protan'),sim(b,'protan')), dE(sim(a,'deutan'),sim(b,'deutan')))*10)/10;
    const tr = Math.round(dE(sim(a,'tritan'),sim(b,'tritan'))*10)/10;
    add(`${THEATERS[i]} vs ${THEATERS[j]} difference`, n, LIMITS.theaterPairNormal, n >= LIMITS.theaterPairNormal);
    add(`${THEATERS[i]} vs ${THEATERS[j]} red-green colour blindness`, rg, LIMITS.theaterPairRedGreen, rg >= LIMITS.theaterPairRedGreen);
    add(`${THEATERS[i]} vs ${THEATERS[j]} blue-yellow colour blindness`, tr, LIMITS.theaterPairTritan, tr >= LIMITS.theaterPairTritan);
  }
  // 4. compare colours: close in brightness, apart in hue, and not a theater colour
  const cl = r(c['compare-a'],c['compare-b']), cd = Math.round(dE(c['compare-a'],c['compare-b'])*10)/10;
  add('compare-a vs compare-b brightness ratio (at most)', cl, LIMITS.compareLumMax, cl <= LIMITS.compareLumMax);
  add('compare-a vs compare-b difference', cd, LIMITS.comparePair, cd >= LIMITS.comparePair);
  for (const s of ['compare-a','compare-b','link','track','state-error']) for (const k of THEATERS) {
    const d = Math.round(dE(c[s],c[k])*10)/10;
    add(`${s} vs ${k} difference`, d, LIMITS.semanticVsTheater, d >= LIMITS.semanticVsTheater);
  }
  return {err, rows};
}

if (require.main !== module) { module.exports = {check, contrast, dE, sim, over, LIMITS}; return; }
const args = process.argv.slice(2), table = args.includes('--table'), files = args.filter(a => !a.startsWith('--'));
let failed = 0;
for (const f of files) {
  let t; try { t = JSON.parse(fs.readFileSync(f,'utf8')); } catch (e) { console.log(`${f}: REJECTED (not valid JSON)`); failed++; continue; }
  const {err, rows} = check(t);
  console.log(`${f}: ${err.length ? 'REJECTED' : 'PASS'} (${rows.length} computed checks)`);
  for (const e of err) console.log('  - ' + e);
  if (table) for (const x of rows) console.log(`  ${x.ok ? 'ok  ' : 'FAIL'} ${x.name}: ${x.value} (limit ${x.min})`);
  if (err.length) failed++;
}
if (!files.length) console.log('usage: node theme-check.js [--table] <theme.json> ...');
process.exit(failed ? 1 : 0);

