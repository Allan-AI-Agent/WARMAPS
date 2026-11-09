#!/usr/bin/env node
// WARMAPS behavioral test of the dynamic timeline end (v01.09.03).
// Usage: node tools/test-timeline.js [repoDir]
// Extracts the real source of warStart, WARMAPS_MONTHS, WARMAPS_DATE_ERRORS,
// parseWarDay, warDayNow and the setDynamicTimelineEnd IIFE from index.html,
// runs them in a vm sandbox with a controllable Date "now" and fake slider
// elements that mirror the static #tl-min / #tl-max attributes, and asserts
// window.WARMAPS_TIMELINE_END and the slider max attribute.
// Runs the scenarios in this process and again in child processes under
// several TZ values; all results must be identical. Exits non-zero on failure.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { spawnSync } = require('child_process');

const args = process.argv.slice(2);
const childMode = args.indexOf('--child') >= 0;
const repoDir = path.resolve(args.filter(a => a !== '--child')[0] || path.join(__dirname, '..'));
const TZS = ['America/Phoenix', 'America/New_York', 'Asia/Tehran'];

const html = fs.readFileSync(path.join(repoDir, 'index.html'), 'utf8');
const dataSrc = fs.readFileSync(path.join(repoDir, 'warmaps-data.js'), 'utf8');

// Brace matcher that skips string literals and comments. Returns index just
// past the matching close brace for the open brace at openIdx.
function matchBrace(src, openIdx) {
  let depth = 0;
  for (let i = openIdx; i < src.length; i++) {
    const c = src[i];
    if (c === '"' || c === "'") {
      for (i++; i < src.length && src[i] !== c; i++) if (src[i] === '\\') i++;
      continue;
    }
    if (c === '/' && src[i + 1] === '/') { i = src.indexOf('\n', i); if (i < 0) break; continue; }
    if (c === '/' && src[i + 1] === '*') { i = src.indexOf('*/', i + 2) + 1; if (i <= 0) break; continue; }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return i + 1; }
  }
  throw new Error('unbalanced braces from offset ' + openIdx);
}

function mustFind(re, what) {
  const m = re.exec(html);
  if (!m) throw new Error('could not find ' + what + ' in index.html');
  return m;
}
// statement starting at regex match and ending at first ';' at brace depth 0
function extractStatement(re, what) {
  const m = mustFind(re, what);
  const start = m.index;
  let depth = 0;
  for (let i = start; i < html.length; i++) {
    const c = html[i];
    if (c === "'" || c === '"') { for (i++; html[i] !== c; i++) if (html[i] === '\\') i++; continue; }
    if (c === '{' || c === '(' || c === '[') depth++;
    else if (c === '}' || c === ')' || c === ']') depth--;
    else if (c === ';' && depth === 0) return html.slice(start, i + 1);
  }
  throw new Error('unterminated statement for ' + what);
}
function extractFunction(name) {
  const m = mustFind(new RegExp('function\\s+' + name + '\\s*\\('), 'function ' + name);
  const open = html.indexOf('{', m.index);
  return html.slice(m.index, matchBrace(html, open));
}
function extractIIFE(name) {
  const m = mustFind(new RegExp('\\(function\\s+' + name + '\\s*\\(\\)\\s*\\{'), 'IIFE ' + name);
  const open = html.indexOf('{', m.index);
  const end = matchBrace(html, open);
  const tail = /^\s*\)\s*\(\s*\)\s*;?/.exec(html.slice(end));
  if (!tail) throw new Error('IIFE ' + name + ' is not immediately invoked');
  return html.slice(m.index, end + tail[0].length);
}
function sliderAttrs(id) {
  const m = mustFind(new RegExp('<input[^>]*\\bid="' + id + '"[^>]*>'), '#' + id);
  const tag = m[0];
  const a = (n) => { const r = new RegExp('\\b' + n + '="([^"]*)"').exec(tag); return r ? r[1] : null; };
  return { min: a('min'), max: a('max'), value: a('value'), step: a('step') };
}

const parts = {
  warStart: extractStatement(/const\s+warStart\s*=/, 'const warStart'),
  months: extractStatement(/const\s+WARMAPS_MONTHS\s*=/, 'const WARMAPS_MONTHS'),
  dateErrors: extractStatement(/const\s+WARMAPS_DATE_ERRORS\s*=/, 'const WARMAPS_DATE_ERRORS'),
  parseWarDay: extractFunction('parseWarDay'),
  warDayNow: extractFunction('warDayNow'),
  iife: extractIIFE('setDynamicTimelineEnd'),
};
const staticMin = sliderAttrs('tl-min');
const staticMax = sliderAttrs('tl-max');

// Load event dates from warmaps-data.js
function loadStrikes() {
  const sb = { console: { log() {}, warn() {}, error() {} } };
  sb.window = sb;
  vm.createContext(sb);
  new vm.Script(dataSrc + '\n;try { this.__s = (typeof strikes !== "undefined") ? strikes : undefined; } catch (e) {}\n').runInContext(sb);
  if (sb.WARMAPS_DATA && Array.isArray(sb.WARMAPS_DATA.strikes)) return sb.WARMAPS_DATA.strikes;
  if (Array.isArray(sb.__s)) return sb.__s;
  throw new Error('strikes not found in warmaps-data.js');
}
const strikeDates = loadStrikes().map(s => ({ id: s.id, date: s.date }));

// Fake range input: value is sanitised into [min, max] like a real range input.
function makeSlider(init) {
  const attrs = { min: init.min, max: init.max, value: init.value, step: init.step };
  let raw = init.value;
  return {
    getAttribute(n) { return Object.prototype.hasOwnProperty.call(attrs, n) ? attrs[n] : null; },
    setAttribute(n, v) { attrs[n] = String(v); },
    get value() {
      let v = parseFloat(raw);
      const lo = parseFloat(attrs.min), hi = parseFloat(attrs.max);
      if (!isFinite(v)) v = (lo + hi) / 2;
      if (v < lo) v = lo;
      if (hi >= lo && v > hi) v = hi;
      return String(v);
    },
    set value(v) { raw = String(v); },
  };
}

// fakeNow given as [y, monthIndex, d, h] in LOCAL time of this process
function runScenario(fakeNowParts) {
  const sliders = { 'tl-min': makeSlider(staticMin), 'tl-max': makeSlider(staticMax) };
  const errors = [];
  const sb = {
    console: { log() {}, warn() {}, error(...a) { errors.push(a.map(String).join(' ')); } },
    document: { getElementById: (id) => sliders[id] || null },
    __strikeDates: strikeDates,
    __fakeNowParts: fakeNowParts,
  };
  sb.window = sb;
  vm.createContext(sb);
  const code = [
    'const __RealDate = Date;',
    'const __FAKE_NOW = new __RealDate(__fakeNowParts[0], __fakeNowParts[1], __fakeNowParts[2], __fakeNowParts[3] || 0).getTime();',
    'class FakeDate extends __RealDate {',
    '  constructor(...a) { if (a.length === 0) super(__FAKE_NOW); else super(...a); }',
    '  static now() { return __FAKE_NOW; }',
    '}',
    'Date = FakeDate;',
    'globalThis.Date = FakeDate;',
    parts.warStart,
    parts.months,
    parts.dateErrors,
    parts.parseWarDay,
    parts.warDayNow,
    'const strikeDays = {};',
    '__strikeDates.forEach(function (s) { const d = parseWarDay(s.date); if (d === null) WARMAPS_DATE_ERRORS.push(s); strikeDays[s.id] = d; });',
    parts.iife,
    'this.__out = { warDayNow: warDayNow(), dateErrors: WARMAPS_DATE_ERRORS.length,',
    '  latestEvt: Math.max.apply(null, Object.keys(strikeDays).map(function (k) { return strikeDays[k]; }).filter(function (d) { return typeof d === "number"; })) };',
  ].join('\n');
  // sloppy-mode script so the global Date binding can be replaced by FakeDate
  new vm.Script(code, { filename: 'timeline-extract.js' }).runInContext(sb);
  const o = sb.__out;
  return {
    TIMELINE_END: sb.WARMAPS_TIMELINE_END,
    tlMaxMaxAttr: sliders['tl-max'].getAttribute('max'),
    tlMinMaxAttr: sliders['tl-min'].getAttribute('max'),
    tlMaxValue: sliders['tl-max'].value,
    tlMinValue: sliders['tl-min'].value,
    warDayNow: o.warDayNow,
    latestEvt: o.latestEvt,
    dateErrors: o.dateErrors,
    consoleErrors: errors.length,
  };
}

// Independent expectation for the latest event day: parsed here in plain JS from the
// event date strings (UTC arithmetic), not with the app's own parseWarDay.
const EXPECTED_LATEST = (function () {
  const M = ['january','february','march','april','may','june','july','august','september','october','november','december'];
  const start = Date.UTC(2026, 1, 28);
  let mx = -Infinity;
  strikeDates.forEach(function (s) {
    const m = /^([A-Za-z]+)\.?\s+(\d{1,2}),\s*(\d{4})$/.exec(String(s.date).trim());
    if (!m) return;
    const mi = M.findIndex(function (n) { return n.indexOf(m[1].toLowerCase().slice(0, 3)) === 0; });
    if (mi < 0) return;
    const d = Math.round((Date.UTC(+m[3], mi, +m[2]) - start) / 86400000) + 1;
    if (d > mx) mx = d;
  });
  return mx;
})();

// Expected timeline end = max(today's war day, latest event day). Updated 2026-11-09:
// expectations derive from the data so a backfill does not break the test.
const SCENARIOS = [
  { name: 'now 2026-11-02 12:00', now: [2026, 10, 2, 12], expectNow: 248, expect: (r) => Math.max(248, r.latestEvt), expectLatest: EXPECTED_LATEST },
  { name: 'now 2027-02-28 12:00', now: [2027, 1, 28, 12], expectNow: 366, expect: (r) => Math.max(366, r.latestEvt) },
  { name: 'now 2026-03-01 12:00 (wrong clock)', now: [2026, 2, 1, 12], expectNow: 2, expect: (r) => r.latestEvt, expectLatest: EXPECTED_LATEST },
];

function runAll() {
  return SCENARIOS.map(s => ({ name: s.name, result: runScenario(s.now) }));
}

if (childMode) {
  process.stdout.write(JSON.stringify(runAll()));
  process.exit(0);
}

let failures = 0;
function check(cond, msg) { if (!cond) { failures++; console.log('  FAIL ' + msg); } }

console.log('Extracted: warStart, WARMAPS_MONTHS, WARMAPS_DATE_ERRORS, parseWarDay, warDayNow, setDynamicTimelineEnd IIFE');
console.log('Static #tl-min ' + JSON.stringify(staticMin) + '  #tl-max ' + JSON.stringify(staticMax));
console.log('Events: ' + strikeDates.length);

const local = runAll();
const tzName = process.env.TZ || Intl.DateTimeFormat().resolvedOptions().timeZone;
const byTz = { ['local(' + tzName + ')']: local };
TZS.forEach(tz => {
  const r = spawnSync(process.execPath, [__filename, repoDir, '--child'], { env: Object.assign({}, process.env, { TZ: tz }), encoding: 'utf8' });
  if (r.status !== 0) { failures++; console.log('FAIL child TZ=' + tz + ' exited ' + r.status + '\n' + r.stderr); return; }
  byTz[tz] = JSON.parse(r.stdout);
});

Object.keys(byTz).forEach(tz => {
  console.log('\nTZ ' + tz);
  byTz[tz].forEach((res, k) => {
    const s = SCENARIOS[k], r = res.result;
    const exp = s.expect(r);
    console.log('  ' + s.name + ': TIMELINE_END=' + r.TIMELINE_END + ' tl-max max=' + r.tlMaxMaxAttr +
      ' tl-min max=' + r.tlMinMaxAttr + ' tl-max value=' + r.tlMaxValue + ' warDayNow=' + r.warDayNow +
      ' latestEvt=' + r.latestEvt + ' (expect ' + exp + ')');
    check(r.TIMELINE_END === exp, tz + ' ' + s.name + ': WARMAPS_TIMELINE_END ' + r.TIMELINE_END + ' != ' + exp);
    check(r.tlMaxMaxAttr === String(exp), tz + ' ' + s.name + ': tl-max max attr ' + r.tlMaxMaxAttr + ' != ' + exp);
    check(r.tlMinMaxAttr === String(exp), tz + ' ' + s.name + ': tl-min max attr ' + r.tlMinMaxAttr + ' != ' + exp);
    check(r.tlMaxValue === String(exp), tz + ' ' + s.name + ': tl-max value ' + r.tlMaxValue + ' != ' + exp + ' (slider started at end)');
    if (s.expectNow !== undefined) check(r.warDayNow === s.expectNow, tz + ' ' + s.name + ': warDayNow ' + r.warDayNow + ' != ' + s.expectNow);
    if (s.expectLatest !== undefined) check(r.latestEvt === s.expectLatest, tz + ' ' + s.name + ': latest event day ' + r.latestEvt + ' != ' + s.expectLatest);
    check(r.dateErrors === 0, tz + ' ' + s.name + ': ' + r.dateErrors + ' unreadable event dates');
    check(r.consoleErrors === 0, tz + ' ' + s.name + ': IIFE logged ' + r.consoleErrors + ' console.error call(s)');
  });
});

const ref = JSON.stringify(local);
Object.keys(byTz).forEach(tz => {
  check(JSON.stringify(byTz[tz]) === ref, 'results under ' + tz + ' differ from local run');
});

console.log('\n' + (failures ? 'RESULT: FAIL (' + failures + ')' : 'RESULT: PASS (identical across ' + Object.keys(byTz).length + ' time zones)'));
process.exit(failures ? 1 : 0);
