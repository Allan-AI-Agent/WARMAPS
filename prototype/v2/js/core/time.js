/* WARMAPS v2 PROTOTYPE — core/time.js
 * The only place that does date arithmetic (ARCHITECTURE 5.2). Dates are ISO strings; all maths is on whole day
 * counts from Date.UTC, never on local-time Date objects.
 */
(function () {
'use strict';
const root = typeof window !== 'undefined' ? window : globalThis;
const WM = root.WM = root.WM || {};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dc = s => { const [y, m, d] = s.split('-').map(Number); return Date.UTC(y, m - 1, d) / 864e5; };
const iso = n => new Date(n * 864e5).toISOString().slice(0, 10);
const add = (s, n) => iso(dc(s) + n);
const parts = s => s.split('-').map(Number);
const fmt = s => { const [y, m, d] = parts(s); return String(d).padStart(2, '0') + ' ' + MONTHS[m - 1] + ' ' + y; };
const fmtShort = s => { const [, m, d] = parts(s); return String(d).padStart(2, '0') + ' ' + MONTHS[m - 1]; };
const isISO = s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && iso(dc(s)) === s;

/* Today: the device's calendar day, unless the address carries ?today=YYYY-MM-DD (used for repeatable checks). */
let todayOverride = null;
function today() {
  if (todayOverride) return todayOverride;
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function setToday(s) { todayOverride = isISO(s) ? s : null; }

const dayNumber = (theater, s) => dc(s) - dc(theater.epochISO) + 1;
const UNIT_RANK = { day: 0, week: 1, month: 2 };

/* Start and end (day counts) of the week (Monday to Sunday) or month holding day n. */
function unitSpan(n, unit) {
  if (unit === 'day') return [n, n];
  if (unit === 'week') { const dow = (new Date(n * 864e5).getUTCDay() + 6) % 7; return [n - dow, n - dow + 6]; }
  const d = new Date(n * 864e5), y = d.getUTCFullYear(), m = d.getUTCMonth();
  return [Date.UTC(y, m, 1) / 864e5, Date.UTC(y, m + 1, 0) / 864e5];
}

/* The combined axis for the active theaters: for every date the finest unit any of them declares there, then cut
 * into steps, each clipped to its segment (ARCHITECTURE 5.2). Returns { fromISO, toISO, steps[{from,to,unit}] }
 * with from/to as day counts. */
function buildAxis(theaters, endISO) {
  const act = theaters.filter(t => t.timeline);
  if (!act.length) return { fromISO: endISO, toISO: endISO, steps: [{ from: dc(endISO), to: dc(endISO), unit: 'day' }] };
  const end = dc(endISO), start = Math.min(...act.map(t => dc(t.timeline.axisFrom)));
  const cuts = new Set([start, end + 1]);
  for (const t of act) for (const b of t.timeline.bands) { cuts.add(dc(b.from)); if (b.to) cuts.add(dc(b.to) + 1); }
  const edges = [...cuts].filter(c => c >= start && c <= end + 1).sort((a, b) => a - b);
  const steps = [];
  for (let i = 0; i < edges.length - 1; i++) {
    const a = edges[i], z = edges[i + 1] - 1;
    let unit = null;
    for (const t of act) for (const b of t.timeline.bands) {
      if (dc(b.from) <= a && (b.to ? dc(b.to) : Infinity) >= z) if (unit === null || UNIT_RANK[b.unit] < UNIT_RANK[unit]) unit = b.unit;
    }
    if (unit === null) unit = 'month';   // no theater declares data here: draw it coarsely
    let n = a;
    while (n <= z) { const [, e] = unitSpan(n, unit); const to = Math.min(e, z); steps.push({ from: n, to, unit }); n = to + 1; }
  }
  return { fromISO: iso(start), toISO: endISO, steps };
}
function stepIndex(axis, s) {
  const n = dc(s), st = axis.steps;
  if (n <= st[0].from) return 0;
  let lo = 0, hi = st.length - 1;
  while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (st[mid].from <= n) lo = mid; else hi = mid - 1; }
  return lo;
}

/* An event's date interval (ARCHITECTURE 5.4). */
function interval(rec, extentEndISO) {
  const a = dc(rec.dateISO);
  if (rec.datePrecision === 'ongoing-from') return [a, dc(extentEndISO)];
  return [a, rec.dateEndISO ? dc(rec.dateEndISO) : a];
}

WM.time = { dc, iso, add, fmt, fmtShort, isISO, today, setToday, dayNumber, buildAxis, stepIndex, unitSpan, interval, MONTHS };
})();
