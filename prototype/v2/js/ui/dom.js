/* WARMAPS v2 PROTOTYPE — ui/dom.js
 * Small helpers. Every piece of data text goes through esc() or textContent: no data string is ever used as
 * markup, a style rule or a web address (ARCHITECTURE 3.2, R1 fix M3).
 */
(function () {
'use strict';
const WM = window.WM = window.WM || {};

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const $ = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => [...(root || document).querySelectorAll(sel)];
/* Only http and https addresses become links; anything else is shown as plain text. */
const safeUrl = u => (typeof u === 'string' && /^https?:\/\//i.test(u)) ? u : null;

/* Storage that never throws: the app must run on defaults when storage is off (LAYOUT spec check 9). */
const mem = {};
const store = {
  ok: (() => { try { const k = '__wm2p'; localStorage.setItem(k, '1'); localStorage.removeItem(k); return !new URLSearchParams(location.search).has('nostorage'); } catch (e) { return false; } })(),
  get(key, fallback) { try { const v = this.ok ? localStorage.getItem(key) : mem[key]; return v == null ? fallback : JSON.parse(v); } catch (e) { return fallback; } },
  set(key, val) { try { const v = JSON.stringify(val); if (this.ok) localStorage.setItem(key, v); else mem[key] = v; } catch (e) { /* run without it */ } },
  del(key) { try { if (this.ok) localStorage.removeItem(key); else delete mem[key]; } catch (e) { /* nothing */ } }
};

/* Event delegation: on(root, 'click', '[data-act]', (ev, el) => ...) */
function on(root, type, sel, fn, opts) {
  root.addEventListener(type, ev => { const t = ev.target.closest ? ev.target.closest(sel) : null; if (t && root.contains(t)) fn(ev, t); }, opts);
}

/* Toasts: plain text plus optional buttons. */
function toast(text, actions, ms) {
  const host = $('#toasts'), t = document.createElement('div');
  t.className = 'toast'; t.setAttribute('role', 'status');
  const p = document.createElement('span'); p.textContent = text; t.appendChild(p);
  const close = () => { if (t.parentNode) t.parentNode.removeChild(t); };
  for (const a of actions || []) { const b = document.createElement('button'); b.className = 'btn'; b.textContent = a.label; b.addEventListener('click', () => { close(); if (a.fn) a.fn(); }); t.appendChild(b); }
  host.appendChild(t);
  if (ms !== 0) setTimeout(close, ms || 4000);
  return close;
}

/* The visible error banner (F-001 lesson): a failed module says so in plain words and the rest keeps working. */
function reportError(module, err) {
  console.error('[WARMAPS prototype]', module, err);
  const b = $('#errorbanner'); if (!b) return;
  b.hidden = false;
  $('.eb-text', b).textContent = 'A part of the prototype failed: ' + module + '. ' + (err && err.message ? err.message : '');
}
const guard = (module, fn) => function () { try { return fn.apply(this, arguments); } catch (e) { reportError(module, e); } };

const prefersReducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const copyText = text => (navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(text) : Promise.reject()).then(() => true, () => {
  try { const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); const ok = document.execCommand('copy'); ta.remove(); return ok; } catch (e) { return false; }
});
function loadScript(src, integrity) {
  return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; if (integrity) { s.integrity = integrity; s.crossOrigin = 'anonymous'; } s.onload = res; s.onerror = () => rej(new Error('could not load ' + src)); document.head.appendChild(s); });
}
function loadCss(href, integrity) {
  return new Promise((res, rej) => { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; if (integrity) { l.integrity = integrity; l.crossOrigin = 'anonymous'; } l.onload = res; l.onerror = () => rej(new Error('could not load ' + href)); document.head.appendChild(l); });
}

WM.dom = { esc, $, $$, safeUrl, store, on, toast, reportError, guard, prefersReducedMotion, copyText, loadScript, loadCss };
WM.reportError = reportError;
})();
