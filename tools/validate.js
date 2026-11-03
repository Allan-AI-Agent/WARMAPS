#!/usr/bin/env node
// WARMAPS pre-push validator.
// Usage: node tools/validate.js [repoDir] [baselineIndexHtmlPath]
//   repoDir defaults to the parent of this tools/ directory.
//   baselineIndexHtmlPath is optional; get one with:
//     git show main:index.html > /tmp/warmaps-baseline-index.html
// Checks:
//   A. syntax of warmaps-data.js and of every inline script block in index.html
//   B. raw tag counts for style, script, div (open vs close); equal to baseline if given
//   C. event IDs in warmaps-data.js are exactly 1..N, no gaps, no duplicates
//   D. time 'Day N' matches the day computed from date (Feb 28 2026 = Day 1)
//      hard requirement for ids 342 and up, warnings for older events
//   E. backtick count in index.html not higher than the baseline (Trap 4)
// Exits non-zero on any failure. No npm dependencies.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repoDir = path.resolve(process.argv[2] || path.join(__dirname, '..'));
const baselinePath = process.argv[3] ? path.resolve(process.argv[3]) : null;
const STRICT_FROM_ID = 342;

let failures = 0;
const warnings = [];
function pass(name, msg) { console.log('PASS ' + name + (msg ? ' - ' + msg : '')); }
function fail(name, msg) { failures++; console.log('FAIL ' + name + (msg ? ' - ' + msg : '')); }

const indexPath = path.join(repoDir, 'index.html');
const dataPath = path.join(repoDir, 'warmaps-data.js');
const html = fs.readFileSync(indexPath, 'utf8');
const dataSrc = fs.readFileSync(dataPath, 'utf8');
const baseHtml = baselinePath ? fs.readFileSync(baselinePath, 'utf8') : null;

// ---------------------------------------------------------------------------
// HTML-level scanner. Follows the HTML tokenizer rule that script and style
// content ends only at the matching end tag name, so a literal close-style
// string inside JavaScript does not end anything. HTML comments outside raw
// text elements are skipped.
function extractScripts(src) {
  const out = [];
  const lower = src.toLowerCase();
  let i = 0;
  while (i < src.length) {
    const lt = src.indexOf('<', i);
    if (lt < 0) break;
    if (src.startsWith('<!--', lt)) {
      const end = src.indexOf('-->', lt + 4);
      i = end < 0 ? src.length : end + 3;
      continue;
    }
    const m = /^<(script|style)(?=[\s>\/])/i.exec(src.slice(lt, lt + 8));
    if (!m) { i = lt + 1; continue; }
    const tagName = m[1].toLowerCase();
    const gt = src.indexOf('>', lt);
    if (gt < 0) break;
    const openTag = src.slice(lt, gt + 1);
    // find closing tag: '</name' followed by whitespace, slash or '>'
    const re = new RegExp('</' + tagName + '(?=[\\s/>])', 'g');
    re.lastIndex = gt + 1;
    const cm = re.exec(lower);
    const contentEnd = cm ? cm.index : src.length;
    if (tagName === 'script') {
      const line = src.slice(0, lt).split('\n').length;
      const hasSrc = /\ssrc\s*=/i.test(openTag);
      const typeM = /\stype\s*=\s*["']?([^"'\s>]+)/i.exec(openTag);
      const type = typeM ? typeM[1].toLowerCase() : '';
      out.push({ line, openTag, hasSrc, type, code: src.slice(gt + 1, contentEnd) });
    }
    const closeGt = cm ? src.indexOf('>', cm.index) : src.length;
    i = closeGt < 0 ? src.length : closeGt + 1;
  }
  return out;
}

function checkSyntax(code, filename) {
  try {
    new vm.Script(code, { filename });
    return null;
  } catch (e) {
    return e && e.message ? e.message : String(e);
  }
}

// ---------------------------------------------------------------------------
// A. syntax
(function checkA() {
  const name = 'A syntax';
  const errs = [];
  const de = checkSyntax(dataSrc, 'warmaps-data.js');
  if (de) errs.push('warmaps-data.js: ' + de);
  const blocks = extractScripts(html);
  const inline = blocks.filter(b => !b.hasSrc);
  const external = blocks.filter(b => b.hasSrc);
  let checked = 0;
  inline.forEach((b, k) => {
    const jsTypes = ['', 'text/javascript', 'application/javascript', 'module'];
    if (jsTypes.indexOf(b.type) < 0) {
      warnings.push('inline script at line ' + b.line + ' has type ' + b.type + ' - not syntax checked');
      return;
    }
    checked++;
    const err = checkSyntax(b.code, 'index.html#inline' + (k + 1) + '@line' + b.line);
    if (err) errs.push('inline script #' + (k + 1) + ' (index.html line ' + b.line + '): ' + err);
  });
  const summary = 'warmaps-data.js + ' + checked + ' inline script blocks checked (' +
    blocks.length + ' script elements total, ' + external.length + ' with src)';
  if (inline.length === 0) errs.push('no inline script blocks found - extractor broken?');
  if (errs.length) fail(name, summary + '\n    ' + errs.join('\n    '));
  else pass(name, summary);
})();

// ---------------------------------------------------------------------------
// B. tag balance (raw counts over the whole file, the method the recorded
// baselines use; JS strings containing tag text are therefore included)
function tagCounts(src) {
  const c = (re) => (src.match(re) || []).length;
  return {
    style: [c(/<style[\s>]/gi), c(/<\/style>/gi)],
    script: [c(/<script[\s>]/gi), c(/<\/script>/gi)],
    div: [c(/<div[\s>]/gi), c(/<\/div>/gi)],
  };
}
(function checkB() {
  const name = 'B tag balance';
  const cur = tagCounts(html);
  const fmt = (t) => 'style ' + t.style.join('/') + ', script ' + t.script.join('/') + ', div ' + t.div.join('/');
  const errs = [];
  Object.keys(cur).forEach(k => {
    if (cur[k][0] !== cur[k][1]) errs.push(k + ' unbalanced ' + cur[k].join('/'));
  });
  let msg = 'current: ' + fmt(cur);
  if (baseHtml) {
    const base = tagCounts(baseHtml);
    msg += ' | baseline: ' + fmt(base);
    Object.keys(cur).forEach(k => {
      if (cur[k][0] !== base[k][0] || cur[k][1] !== base[k][1]) {
        errs.push(k + ' differs from baseline (' + cur[k].join('/') + ' vs ' + base[k].join('/') + ')');
      }
    });
  } else {
    msg += ' | no baseline given';
  }
  if (errs.length) fail(name, msg + '\n    ' + errs.join('\n    '));
  else pass(name, msg);
})();

// ---------------------------------------------------------------------------
// Load the data file in a sandbox. It assigns window.WARMAPS_DATA from an
// IIFE; older layouts declared a top-level const strikes. Support both.
function loadStrikes(src) {
  const sandbox = { console: { log() {}, warn() {}, error() {} } };
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  vm.createContext(sandbox);
  const tail = '\n;try { this.__s = (typeof strikes !== "undefined") ? strikes : undefined; } catch (e) {}\n';
  new vm.Script(src + tail, { filename: 'warmaps-data.js' }).runInContext(sandbox);
  if (sandbox.WARMAPS_DATA && Array.isArray(sandbox.WARMAPS_DATA.strikes)) return sandbox.WARMAPS_DATA.strikes;
  if (Array.isArray(sandbox.__s)) return sandbox.__s;
  throw new Error('strikes array not found (neither window.WARMAPS_DATA.strikes nor top-level strikes)');
}

let strikes = null;
try { strikes = loadStrikes(dataSrc); } catch (e) { fail('C load data', e.message); }

// Independent date parser (does not reuse app code). Returns calendar-day
// difference from Feb 28 2026 plus one, using UTC day numbers (DST-safe).
const MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11,
  january: 0, february: 1, march: 2, april: 3, june: 5, july: 6, august: 7, september: 8, october: 9, november: 10, december: 11 };
function dayFromDate(dateStr) {
  const s = String(dateStr || '');
  let m = s.match(/([A-Za-z]+)\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s*((?:19|20)\d{2})/);
  let mon, day, year;
  if (m && MONTHS[m[1].toLowerCase()] !== undefined) {
    mon = MONTHS[m[1].toLowerCase()]; day = +m[2]; year = +m[3];
  } else {
    m = s.match(/([A-Za-z]+)\.?\s+(\d{1,2})\b/);
    if (!m || MONTHS[m[1].toLowerCase()] === undefined) {
      m = s.match(/\b((?:19|20)\d{2})-(\d{2})-(\d{2})\b/);
      if (!m) return null;
      year = +m[1]; mon = +m[2] - 1; day = +m[3];
    } else {
      mon = MONTHS[m[1].toLowerCase()]; day = +m[2];
      const ym = s.match(/\b((?:19|20)\d{2})\b/);
      year = ym ? +ym[1] : 2026;
    }
  }
  const t = Date.UTC(year, mon, day);
  const chk = new Date(t);
  if (chk.getUTCMonth() !== mon || chk.getUTCDate() !== day) return null;
  return Math.round((t - Date.UTC(2026, 1, 28)) / 86400000) + 1;
}

// ---------------------------------------------------------------------------
// C. IDs
if (strikes) (function checkC() {
  const name = 'C event IDs';
  const ids = strikes.map(s => s && s.id);
  const errs = [];
  const bad = ids.filter(x => !Number.isInteger(x));
  if (bad.length) errs.push(bad.length + ' non-integer ids: ' + JSON.stringify(bad.slice(0, 10)));
  const seen = new Map();
  ids.forEach(x => seen.set(x, (seen.get(x) || 0) + 1));
  const dups = [...seen].filter(([, n]) => n > 1).map(([x]) => x);
  if (dups.length) errs.push('duplicate ids: ' + dups.join(', '));
  const N = strikes.length;
  const missing = [];
  for (let k = 1; k <= N; k++) if (!seen.has(k)) missing.push(k);
  if (missing.length) errs.push('missing ids in 1..' + N + ': ' + missing.join(', '));
  const outOfRange = ids.filter(x => Number.isInteger(x) && (x < 1 || x > N));
  if (outOfRange.length) errs.push('ids outside 1..' + N + ': ' + outOfRange.join(', '));
  let maxDay = -Infinity, maxDayId = null, unparsed = 0;
  strikes.forEach(s => {
    const d = dayFromDate(s.date);
    if (d === null) { unparsed++; return; }
    if (d > maxDay) { maxDay = d; maxDayId = s.id; }
  });
  if (unparsed) warnings.push(unparsed + ' event date(s) not parseable by the validator date parser');
  const msg = 'N = ' + N + ', ids 1..' + N + ' continuous, max day ' + maxDay + ' (id ' + maxDayId + ')';
  if (errs.length) fail(name, 'N = ' + N + '\n    ' + errs.join('\n    '));
  else pass(name, msg);
})();

// ---------------------------------------------------------------------------
// D. time 'Day N' vs date
if (strikes) (function checkD() {
  const name = 'D time vs date';
  const errs = [];
  const warn = [];
  let strictChecked = 0, strictTotal = 0, looseChecked = 0;
  strikes.forEach(s => {
    const strict = Number.isInteger(s.id) && s.id >= STRICT_FROM_ID;
    if (strict) strictTotal++;
    const t = typeof s.time === 'string' ? s.time.trim() : '';
    const tm = /^Day (-?\d+)$/.exec(t);
    const computed = dayFromDate(s.date);
    if (strict) {
      if (!tm) { errs.push('id ' + s.id + ': time "' + s.time + '" is not of the form Day N'); return; }
      if (computed === null) { errs.push('id ' + s.id + ': date "' + s.date + '" unparseable'); return; }
      strictChecked++;
      if (+tm[1] !== computed) errs.push('id ' + s.id + ': time ' + t + ' but date "' + s.date + '" is Day ' + computed);
      return;
    }
    if (!tm) return;
    looseChecked++;
    if (computed === null) { warn.push('id ' + s.id + ': date "' + s.date + '" unparseable (time ' + t + ')'); return; }
    if (+tm[1] !== computed) warn.push('id ' + s.id + ': time ' + t + ' but date "' + s.date + '" is Day ' + computed);
  });
  warn.forEach(w => warnings.push('D ' + w));
  const msg = strictChecked + '/' + strictTotal + ' events with id >= ' + STRICT_FROM_ID + ' match; ' +
    looseChecked + ' older Day-N events checked, ' + warn.length + ' warning(s)';
  if (strictTotal === 0) errs.push('no events with id >= ' + STRICT_FROM_ID);
  if (errs.length) fail(name, msg + '\n    ' + errs.join('\n    '));
  else pass(name, msg);
})();

// ---------------------------------------------------------------------------
// E. backticks (Trap 4)
(function checkE() {
  const name = 'E backticks';
  const cur = (html.match(/`/g) || []).length;
  if (!baseHtml) { pass(name, 'index.html has ' + cur + ' backticks (no baseline to compare)'); return; }
  const base = (baseHtml.match(/`/g) || []).length;
  const msg = 'index.html ' + cur + ' vs baseline ' + base;
  if (cur > base) fail(name, msg + ' - backticks introduced');
  else if (cur % 2 !== 0) fail(name, msg + ' - odd count');
  else pass(name, msg);
})();

if (warnings.length) {
  console.log('\nWARNINGS (' + warnings.length + '):');
  warnings.forEach(w => console.log('  ' + w));
}
console.log('\n' + (failures ? 'RESULT: FAIL (' + failures + ' check(s) failed)' : 'RESULT: PASS'));
process.exit(failures ? 1 : 0);
