/* WARMAPS v2 PROTOTYPE — core/detail.js
 * Detail levels (ARCHITECTURE 9.4): one table of budgets, the automatic pick (a two-second draw test, then browser
 * hints that can only lower the answer), and a frame-rate meter for the About numbers.
 * Selectors never read this file: detail changes how things are drawn, never what can be reached.
 */
(function () {
'use strict';
const WM = window.WM = window.WM || {};
const K = 'wm2proto.detail.v1', APP_VERSION = 'proto-f1c-1';

/* The shape of v2/app/core/detail-levels.json. Every number is SPECULATION until measured on real devices. */
const LEVELS = {
  lite:     { marks2d: 1500, labels: 12, tracks: 300,  globeScale: 1.0, atmosphere: false, night: false, terrain: false, arcPoints: 16, blur: false, glowCap: 1, instant: true,  stepDownFps: 20, stepDownTo: '2d' },
  standard: { marks2d: 4000, labels: 30, tracks: 1000, globeScale: 1.5, atmosphere: true,  night: true,  terrain: false, arcPoints: 32, blur: true,  glowCap: 2, instant: false, stepDownFps: 24, stepDownTo: 'lite' },
  full:     { marks2d: 10000, labels: 60, tracks: 5000, globeScale: 2.0, atmosphere: true, night: true,  terrain: true,  arcPoints: 64, blur: true,  glowCap: 2, instant: false, stepDownFps: 30, stepDownTo: 'standard' }
};
const ORDER = ['lite', 'standard', 'full'];

/* A fixed synthetic scene: 2,000 moving marks of the four shapes on an off-screen canvas, for two seconds.
 * Returns the median frame rate. No real data is drawn. */
function drawTest(ms) {
  return new Promise(resolve => {
    const c = document.createElement('canvas'); c.width = 800; c.height = 600;
    const g = c.getContext('2d'), N = 2000, pts = [];
    let seed = 7; const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
    for (let i = 0; i < N; i++) pts.push([rnd() * 800, rnd() * 600, rnd() * 2 - 1, rnd() * 2 - 1, i % 4]);
    const times = []; let last = performance.now(); const start = last;
    function frame(now) {
      times.push(now - last); last = now;
      g.clearRect(0, 0, 800, 600); g.lineWidth = 1.25; g.strokeStyle = '#E6B43C'; g.fillStyle = '#56ACE3';
      for (const p of pts) {
        p[0] = (p[0] + p[2] + 800) % 800; p[1] = (p[1] + p[3] + 600) % 600;
        g.beginPath();
        if (p[4] === 0) g.arc(p[0], p[1], 4, 0, 6.283);
        else if (p[4] === 1) { g.moveTo(p[0], p[1] - 5); g.lineTo(p[0] + 5, p[1]); g.lineTo(p[0], p[1] + 5); g.lineTo(p[0] - 5, p[1]); g.closePath(); }
        else if (p[4] === 2) { g.moveTo(p[0], p[1] - 5); g.lineTo(p[0] + 4.5, p[1] + 3); g.lineTo(p[0] - 4.5, p[1] + 3); g.closePath(); }
        else g.rect(p[0] - 4, p[1] - 4, 8, 8);
        if (p[4] % 2) g.fill(); else g.stroke();
      }
      if (now - start < (ms || 2000)) requestAnimationFrame(frame);
      else { const t = times.slice(2).sort((a, b) => a - b), med = t[Math.floor(t.length / 2)] || 16.7; resolve({ fps: Math.round(1000 / med), frames: times.length }); }
    }
    requestAnimationFrame(frame);
  });
}
function fromTest(fps) { return fps >= 50 ? 'full' : fps >= 28 ? 'standard' : 'lite'; }
/* Browser hints can only lower the answer; a missing hint changes nothing. They are read once and sent nowhere. */
function applyHints(level) {
  const mem = navigator.deviceMemory, save = navigator.connection && navigator.connection.saveData;
  let cap = 'full';
  if (typeof mem === 'number') { if (mem <= 2) cap = 'lite'; else if (mem <= 4) cap = 'standard'; }
  if (save) cap = 'lite';
  return { level: ORDER[Math.min(ORDER.indexOf(level), ORDER.indexOf(cap))], hints: { deviceMemory: typeof mem === 'number' ? mem : 'not reported', saveData: !!save } };
}
async function pick(force) {
  const saved = WM.dom.store.get(K, null);
  if (saved && !force && ORDER.includes(saved.level)) return saved;
  const t = await drawTest(2000), h = applyHints(fromTest(t.fps));
  const rec = { choice: saved && saved.choice && saved.choice !== 'auto' && !force ? saved.choice : 'auto', level: h.level, testFps: t.fps, hints: h.hints, measuredAt: new Date().toISOString().slice(0, 16) + 'Z', appVersion: APP_VERSION };
  WM.dom.store.set(K, rec); return rec;
}
function save(rec) { WM.dom.store.set(K, rec); }

/* Frame-rate meter: counts animation frames while something is moving. */
function meter() {
  let frames = 0, t0 = 0, raf = 0, on = false, lastFps = null;
  const tick = now => { if (!on) return; frames++; raf = requestAnimationFrame(tick); };
  return {
    start() { if (on) return; on = true; frames = 0; t0 = performance.now(); raf = requestAnimationFrame(tick); },
    stop() { if (!on) return lastFps; on = false; cancelAnimationFrame(raf); const dt = performance.now() - t0; if (dt > 250) lastFps = Math.round(frames * 1000 / dt); return lastFps; },
    last: () => lastFps
  };
}

WM.detail = { LEVELS, ORDER, drawTest, fromTest, applyHints, pick, save, meter, APP_VERSION };
})();
