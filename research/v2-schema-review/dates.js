// R1 review: independent date reading vs v1 parseWarDay (extracted from index.html at run time).
// Read-only. Usage: node research/v2-schema-review/dates.js .
'use strict';
const fs = require('fs'), path = require('path');
const root = process.argv[2] || '.';
const { D } = require('./load.js')(root);
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const fnSrc = html.slice(html.indexOf('function parseWarDay'), html.indexOf('function warDayNow'));
const monSrc = html.match(/const WARMAPS_MONTHS\s*=\s*\{[^}]*\}/)[0];
const parseWarDay = new Function(monSrc + '; const warStart = new Date(2026,1,28);' + fnSrc + '; return parseWarDay;')();
const MON = { jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,sept:8,oct:9,nov:10,dec:11,
  january:0,february:1,march:2,april:3,june:5,july:6,august:7,september:8,october:9,november:10,december:11 };
const dayOf = (y, m, d) => Math.round((Date.UTC(y, m, d) - Date.UTC(2026, 1, 28)) / 864e5) + 1;
// Independent reading: every "Month day" token with the year that follows it, else the last year in the string, else 2026.
function tokens(str) {
  const out = []; const re = /([A-Za-z]+)\.?\s+(\d{1,2})(?!\d)/g; let m;
  const years = [...str.matchAll(/\b(20\d\d)\b/g)].map(x => ({ y: +x[1], at: x.index }));
  while ((m = re.exec(str))) {
    const mon = MON[m[1].toLowerCase()]; if (mon === undefined) continue;
    const yAfter = years.find(y => y.at > m.index); const y = yAfter ? yAfter.y : (years.length ? years[years.length - 1].y : 2026);
    out.push({ mon, d: +m[2], y });
  }
  return out;
}
let diff = 0; const before = [];
for (const e of D.strikes) {
  const v1 = parseWarDay(e.date); const t = tokens(e.date); const mine = t.length ? dayOf(t[0].y, t[0].mon, t[0].d) : null;
  if (v1 !== mine) { diff++; console.log('DIFF', e.id, JSON.stringify(e.date), 'v1', v1, 'mine', mine); }
  if (v1 !== null && v1 < -29) before.push(e.id + ':' + e.date + ':Day' + v1);
}
console.log('events', D.strikes.length, 'start-day disagreements', diff);
console.log('events before 2026-01-29 (v2 Iran axisFrom):', before.join(' | ') || 'none');
module.exports = { parseWarDay, tokens, dayOf };
