/* WARMAPS v2 PROTOTYPE — ui/tour.js
 * The first-run tour (LAYOUT spec 8d): six short captions pointing at real controls. Offered once, never started
 * by itself, never blocking; Next, Back and Skip on every step; Back or Escape ends it. It adds nothing to the map.
 */
(function () {
'use strict';
const WM = window.WM = window.WM || {};
const { $, esc } = WM.dom;
let step = -1;
// what each step points at: the first of these selectors that is on screen
const TARGETS = [['#legendchip', '#stage'], ['#timeline'], ['.is-card', '#cleancard:not([hidden])', '#legendchip', '#stage'], ['.recgroup', '[data-act="layers"]'], ['[data-tour="lens"]', '#lenstag', '[data-act="layers"]'], ['[data-tour="layers"]', '[data-tour="clean"]']];
function visible(el) { if (!el) return false; const r = el.getBoundingClientRect(); return r.width > 8 && r.height > 8 && getComputedStyle(el).visibility !== 'hidden'; }
function find(i) { for (const s of TARGETS[i]) for (const el of document.querySelectorAll(s)) if (visible(el)) return el; return $('#stage'); }
function show() {
  const host = $('#tour'), S = WM.strings.tour.steps, [title, text] = S[step], el = find(step), r = el.getBoundingClientRect(), vw = window.innerWidth, vh = window.innerHeight;
  const pad = 4, rx = Math.max(2, r.left - pad), ry = Math.max(2, r.top - pad), rw = Math.min(vw - rx - 2, r.width + pad * 2), rh = Math.min(vh - ry - 2, r.height + pad * 2);
  host.hidden = false;
  host.innerHTML = `<div class="tour-ring" style="left:${rx}px;top:${ry}px;width:${rw}px;height:${rh}px"></div>
    <div class="tour-box" role="dialog" aria-label="Tour, step ${step + 1} of ${S.length}"><h3>${esc(title)}</h3><p>${esc(text)}</p>
    <div class="nav"><span class="grow">${step + 1} of ${S.length}</span><button class="btn small quiet" data-t="skip">Skip</button>${step ? '<button class="btn small" data-t="back">Back</button>' : ''}<button class="btn small on" data-t="next">${step === S.length - 1 ? 'Done' : 'Next'}</button></div></div>`;
  const box = $('.tour-box', host), bw = box.offsetWidth, bh = box.offsetHeight;
  let x = Math.max(12, Math.min(vw - bw - 12, rx + rw / 2 - bw / 2)), y = ry + rh + 12;
  if (y + bh > vh - 12) y = ry - bh - 12;
  if (y < 12) { y = Math.max(12, Math.min(vh - bh - 12, vh / 2 - bh / 2)); x = rx > vw / 2 ? 12 : vw - bw - 12; }
  box.style.left = x + 'px'; box.style.top = y + 'px';
  box.querySelector('[data-t="next"]').focus();
}
function start() {
  const app = WM.app; WM.layout.closePopover(true);
  if (app.store.get().cleanView) WM.controls.setClean(false);
  step = 0; show(); WM.layout.syncHistory();
}
function end() { if (step < 0) return; step = -1; const host = $('#tour'); host.hidden = true; host.innerHTML = ''; WM.app.store.set({ tourDone: true }); WM.layout.syncHistory(); }
function go(d) {
  const n = step + d, S = WM.strings.tour.steps; if (n >= S.length) return end(); if (n < 0) return;
  step = n;
  // step 3 points at a card: open one if a mark is in view, otherwise it falls back to the legend
  if (step === 2 && !WM.app.store.get().selection) { const row = WM.app.rows().rows.find(r => r.onMap && r.look === 'ghost') || WM.app.rows().rows.find(r => r.onMap); if (row) WM.app.select({ type: 'event', id: row.id }); }
  setTimeout(show, 60);
}
document.addEventListener('click', ev => { const b = ev.target.closest('#tour [data-t]'); if (!b) return; const t = b.dataset.t; if (t === 'skip') end(); else go(t === 'back' ? -1 : 1); });
window.addEventListener('resize', () => { if (step >= 0) show(); });
WM.tour = { start, end, active: () => step >= 0 };
})();
