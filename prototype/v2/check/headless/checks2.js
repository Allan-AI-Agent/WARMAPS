// WARMAPS v2 PROTOTYPE — sitting 2: the acceptance checks of LAYOUT_ENGINE_SPEC section 11 that functional.js does not
// cover or covers at one size only (3, 4, 5, 6, 7, 9, 11, 15, 19, 23, 25, 26, 28) and contrast as drawn. node checks2.js
const { start } = require('./run.js');
const VPS = { pp: [360, 700, true], pl: [780, 300, true], tp: [800, 1200, true], tl: [1280, 760, true], pc: [1600, 900, false] };
let fails = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };
const INVIEW = q => `(() => { const e = document.querySelector('${q}'); if (!e) return 'missing'; const r = e.getBoundingClientRect(); if (!r.width) return 'hidden'; const x = Math.min(innerWidth - 2, r.left + Math.min(r.width / 2, 20)), y = r.top + r.height / 2; if (r.top < 0 || r.bottom > innerHeight + 1 || r.left < -1) return 'off ' + Math.round(r.top) + '-' + Math.round(r.bottom); const t = document.elementFromPoint(x, y); return t && (e.contains(t) || t.contains(e)) ? 'ok' : 'covered by ' + (t ? t.tagName + '#' + t.id + '.' + t.className : 'nothing'); })()`;
const CONTRAST = `(() => { const P = c => { const m = c.match(/[\\d.]+/g).map(Number); return { r: m[0], g: m[1], b: m[2], a: m.length > 3 ? m[3] : 1 }; };
  const L = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const over = (a, b) => ({ r: a.r * a.a + b.r * (1 - a.a), g: a.g * a.a + b.g * (1 - a.a), b: a.b * a.a + b.b * (1 - a.a), a: 1 });
  const bgOf = e => { const st = []; for (let n = e; n && n.nodeType === 1; n = n.parentElement) { const c = P(getComputedStyle(n).backgroundColor); if (c.a > 0) { st.push(c); if (c.a >= 1) break; } } let b = { r: 128, g: 128, b: 128, a: 1 }, solid = st.length && st[st.length - 1].a >= 1; if (!solid) return null; for (let i = st.length - 1; i >= 0; i--) b = over(st[i], b); return b; };
  const bad = {}; let n = 0, min = 99;
  document.querySelectorAll('#topbar *, #rail *, .slot *, #timeline *, #lensbanner *, #legendchip *, #popovers *, #floats *').forEach(e => { if (![...e.childNodes].some(c => c.nodeType === 3 && c.textContent.trim())) return; if (!e.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return;
    let op = 1; for (let p = e; p; p = p.parentElement) op *= +getComputedStyle(p).opacity; if (op < 1 || e.closest(':disabled,[aria-disabled=true]')) return;
    const bg = bgOf(e); if (!bg) return; const fg = over(P(getComputedStyle(e).color), bg), a = L(fg), b = L(bg), cr = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); n++; min = Math.min(min, cr);
    if (cr < 4.5) bad[(e.className || e.tagName) + ' "' + e.textContent.trim().slice(0, 18) + '"'] = cr.toFixed(2); });
  return { n, min: +min.toFixed(2), bad }; })()`;
(async () => {
  // ---- per class: lens tag and banner (11), card at peek (15), clean view (18), contrast
  for (const [id, [w, h, touch]] of Object.entries(VPS)) {
    const s = await start({ viewport: { width: w, height: h }, touch, fresh: true }), ev = js => s.page.evaluate(js);
    await s.open();
    await ev("WM.app.setLens('parties',['israel'])"); await s.page.waitForTimeout(300);
    const tag = await ev(INVIEW('#lenstag')), ban = await ev("document.querySelector('#lensbanner').classList.contains('on') && document.querySelector('#lensbanner').getBoundingClientRect().height > 0");
    ok(tag === 'ok', `${id} 11: lens tag on the stage (${tag})`);
    if (id === 'pl') { await ev("WM.layout.open('events')"); await s.page.waitForTimeout(200); ok(/Israel/.test(await ev("document.querySelector('#slot-left').textContent.slice(0, 400)")), 'pl 11: lens named in the side sheet'); await ev("WM.layout.close('events')"); }
    else ok(ban, `${id} 11: banner shown`);
    await s.page.waitForTimeout(2600); const hash = await ev('location.hash');
    await s.page.goto(`http://localhost:${s.port}/?today=2026-11-15&tour=0&test=0${hash}`); await s.page.waitForSelector('html[data-ready="1"]'); await s.page.waitForTimeout(400);
    ok(await ev("WM.app.store.get().lens.mode === 'parties' && !document.querySelector('#lenstag').hidden"), `${id} 11: the copied link reproduces the lens and tag`);
    await ev("WM.app.setLens('all',[]); WM.app.select({type:'event',id:'IR-90003'})"); await s.page.waitForTimeout(400);
    const chip = await ev(INVIEW('.panel.is-card .chips .chip')), sl = await ev(INVIEW('.panel.is-card .statusline'));
    ok(chip === 'ok' && sl === 'ok', `${id} 15: card at first open shows chip (${chip}) and status line (${sl})`);
    await ev("WM.app.select(null); WM.layout.open('events'); WM.controls.setClean(true)"); await s.page.waitForTimeout(300);
    const left = await ev("['#topbar','#rail','#timeline','#slot-left','#lensbanner','#authorcredit','#legendchip'].filter(q => { const e = document.querySelector(q); return e && e.checkVisibility() && e.getBoundingClientRect().height > 0; })");
    ok(left.length === 0 && await ev(INVIEW('#viewtag')) === 'ok' && await ev(INVIEW('[data-act="clean-restore"]')) === 'ok', `${id} 18: clean view leaves stage, view tag, restore (${left})`);
    await s.page.keyboard.press('Escape'); await s.page.waitForTimeout(300);
    ok(await ev("WM.app.store.get().cleanView === false && WM.layout.whereIs('events') !== null"), `${id} 18: leaving clean view restores the same panel`);
    await ev("WM.layout.open('settings',{keep:true})"); await s.page.waitForTimeout(200);
    for (const th of ['classic', 'ops', 'paper']) { await ev(`WM.app.setTheme('${th}')`); await s.page.waitForTimeout(250); const c = await ev(CONTRAST); ok(Object.keys(c.bad).length === 0, `${id} contrast ${th}: ${c.n} text runs, lowest ${c.min}:1 ${JSON.stringify(c.bad).slice(0, 300)}`); }
    if (s.errors.length) ok(false, id + ' page errors: ' + s.errors.slice(0, 3).join(' / '));
    await s.close();
  }
  // ---- phone portrait: rotate (3), back (4), steps (6), 200% text (7), storage off (9), view tag (19), tour (28)
  let s = await start({ viewport: { width: 360, height: 700 }, touch: true, fresh: true }), ev = js => s.page.evaluate(js);
  await s.open(); await ev("WM.layout.open('events'); WM.app.select({type:'event',id:'IR-90003'})"); await s.page.waitForTimeout(300);
  await s.page.setViewportSize({ width: 700, height: 360 }); await s.page.waitForTimeout(500);
  ok(await ev("document.documentElement.dataset.layout === 'phone-landscape' && !!WM.app.store.get().selection && WM.layout.whereIs('events') !== null"), '3: rotate to landscape keeps the panel and the card');
  await s.page.screenshot({ path: __dirname + '/shots/c-rotated.png' });
  await s.page.setViewportSize({ width: 360, height: 700 }); await s.page.waitForTimeout(500);
  ok(await ev("document.documentElement.dataset.layout === 'phone-portrait' && !!WM.app.store.get().selection && WM.layout.whereIs('events') !== null"), '3: and back to portrait');
  const url0 = s.page.url().split('#')[0];
  await s.page.goBack(); await s.page.waitForTimeout(250); const b1 = await ev("!WM.app.store.get().selection && WM.layout.whereIs('events') !== null");
  await s.page.goBack(); await s.page.waitForTimeout(250); const b2 = await ev("WM.layout.whereIs('events') === null");
  await s.page.goBack().catch(() => {}); await s.page.waitForTimeout(400); const gone = s.page.url().split('#')[0] !== url0;
  ok(b1 && b2 && gone, `4: Back closes card (${b1}), then panel (${b2}), third press leaves (${gone})`);
  await s.open(); const tr = await ev("({ px: WM.timeline.stepPx(), info: WM.timeline.trackInfo() })"); ok(tr.px >= 8, '6: detail-row step is ' + (+tr.px).toFixed(1) + ' px wide at 360 px (needs 8) ' + JSON.stringify(tr.info));
  const box = await ev("(() => { const r = document.querySelector('.tl-track').getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; })()"), c0 = await ev("WM.app.store.get().time.cursor");
  await s.page.touchscreen.tap(box[0] + box[2] - 3 * tr.px - tr.px / 2 - 14, box[1] + box[3] / 2); await s.page.waitForTimeout(300); const c1 = await ev("WM.app.store.get().time.cursor");
  ok(c0 !== c1, `6: one tap on the track moves the cursor (${c0} -> ${c1})`);
  await ev("WM.timeline.goToday()");
  await ev("document.documentElement.style.fontSize = '200%'; WM.layout.onResize(); WM.layout.open('settings')"); await s.page.waitForTimeout(500);
  const t200 = await ev("(() => { const b = document.querySelector('#slot-left .pb') || document.querySelector('#slot-left .panel > :last-child'); const off = [...document.querySelectorAll('#topbar > *, #rail > *, #timeline button')].filter(e => e.checkVisibility() && (e.getBoundingClientRect().right > innerWidth + 1 || e.getBoundingClientRect().left < -1)).map(e => e.dataset.act || e.className); return { scrolls: b.scrollHeight > b.clientHeight && /auto|scroll/.test(getComputedStyle(b).overflowY), wide: b.scrollWidth > b.clientWidth + 8, over: b.scrollWidth - b.clientWidth, off, hs: document.documentElement.scrollWidth > innerWidth + 1 }; })()");
  ok(t200.scrolls && !t200.wide && !t200.off.length && !t200.hs, '7: at 200% text the panel scrolls and nothing is cut off ' + JSON.stringify(t200));
  await s.page.screenshot({ path: __dirname + '/shots/c-text200-pp.png' }); await ev("document.documentElement.style.fontSize = ''");
  await s.open('&nostorage'); ok(await ev("document.querySelector('#errorbanner').hidden") && !s.errors.length, '9: storage off: loads on defaults, no error banner ' + s.errors.slice(0, 2).join(' / '));
  const vt = async js => { await s.open(); await ev(js + "; WM.controls.setClean(true)"); await s.page.waitForTimeout(250); return ev("document.querySelector('#viewtag').textContent"); };
  let t = await vt("WM.app.toggleShow('fog')"); ok(/fog hidden/i.test(t), '19: view tag, Fog hidden: ' + t);
  t = await vt("WM.app.toggleShow('onRecord')"); ok(/on the record hidden/i.test(t), '19: view tag, On the record hidden: ' + t);
  t = await vt("WM.app.store.set({show:{onRecord:true,fog:true,contestedOnly:true}})"); ok(/contested only/i.test(t), '19: view tag, Contested only: ' + t);
  t = await vt("WM.app.store.set({time:Object.assign({},WM.app.store.get().time,{record:'then'})}); WM.timeline.setCursorStep(WM.timeline.geom().ci - 5)"); ok(/as known/i.test(t), '19: view tag, As known then: ' + t);
  t = await vt("WM.app.setLens('parties',['israel'])"); ok(await ev(INVIEW('#lenstag')) === 'ok', '19: lens tag in clean view at phone portrait');
  await s.page.goto(`http://localhost:${s.port}/?today=2026-11-15&test=0`); await s.page.waitForSelector('html[data-ready="1"]'); await s.page.waitForTimeout(6000);
  const offer = await ev("(() => { const b = [...document.querySelectorAll('#toasts button, #tour button, .toast button')].map(x => x.textContent.trim()); return b; })()"); ok(offer.length >= 2, '28: first run offers the tour with a way to decline: ' + JSON.stringify(offer));
  await ev("WM.tour.start()"); await s.page.waitForTimeout(250); await s.page.touchscreen.tap(330, 24); await s.page.waitForTimeout(350);
  ok(await ev("!!document.querySelector('#popovers .popover') || WM.layout.whereIs('layers') !== null"), '28: with the tour showing, the Layers button still works'); await s.page.screenshot({ path: __dirname + '/shots/c-tour-pp.png' });
  await s.close();
  // ---- phone landscape at 300 px (5, 26)
  s = await start({ viewport: { width: 780, height: 300 }, touch: true, fresh: true }); ev = js => s.page.evaluate(js);
  await s.open(); await ev("WM.layout.open('events')"); await s.page.waitForTimeout(300);
  const r5 = await ev("(() => { const q = ['#rail', '#slot-left', '#timeline'].map(x => { const r = document.querySelector(x).getBoundingClientRect(); return r.height > 0 && r.top >= 0 && r.bottom <= innerHeight + 1 && r.right <= innerWidth + 1; }); const cut = [...document.querySelectorAll('#rail button, #timeline button')].filter(e => e.checkVisibility() && (e.getBoundingClientRect().bottom > innerHeight + 1 || e.getBoundingClientRect().top < -1)).length; return { q, cut, stage: Math.round(document.querySelector('#stage').getBoundingClientRect().width) + 'x' + Math.round(document.querySelector('#stage').getBoundingClientRect().height) }; })()");
  ok(r5.q.every(Boolean) && r5.cut === 0, '5: at 780 x 300 rail, side sheet and timeline are whole ' + JSON.stringify(r5));
  await ev("WM.layout.close('events')"); await s.page.waitForTimeout(300);
  const mk = await ev("(() => { const m = [...document.querySelectorAll('.wm-mk')].map(e => e.getBoundingClientRect()).filter(r => r.left > 60 && r.right < innerWidth && r.top > 0 && r.bottom < innerHeight - 50)[0]; return m ? [m.left + m.width / 2, m.top + m.height / 2] : null; })()");
  if (mk) { await s.page.touchscreen.tap(mk[0], mk[1]); await s.page.waitForTimeout(500); }
  const sel = await ev("(() => { const s = WM.app.store.get().selection, c = document.querySelector('#slot-left .panel.is-card') || document.querySelector('#popovers .popover'); return { sel: s && s.type, card: !!c }; })()");
  ok(mk && sel.sel && sel.card, '26: 2D at 300 px, a finger tap on a mark opens its card or the chooser in the side sheet ' + JSON.stringify(sel)); await s.page.screenshot({ path: __dirname + '/shots/c-pl300-tap.png' });
  await ev("WM.layout.closePopover && WM.layout.closePopover(); WM.app.select(null); WM.app.setView('3d')"); await s.page.waitForTimeout(9000);
  const g = await ev("({ kind: WM.app.view.kind, stats: WM.app.view.stats() })"); ok(g.kind === '3d' && g.stats.drawn + g.stats.grouped > 0, '26: globe at 300 px draws marks ' + JSON.stringify(g)); await s.page.screenshot({ path: __dirname + '/shots/c-pl300-globe.png' });
  await s.close();
  // ---- PC: declutter by width (25), satellite (23), 200% text
  s = await start({ viewport: { width: 1600, height: 900 }, touch: false, fresh: true }); ev = js => s.page.evaluate(js);
  await s.open(); await ev("WM.timeline.setRange('all')"); await s.page.waitForTimeout(600); const wide = await ev("WM.app.view.stats()");
  const sp = await start({ viewport: { width: 360, height: 700 }, touch: true, fresh: true }); await sp.open(); await sp.page.evaluate("WM.timeline.setRange('all')"); await sp.page.waitForTimeout(600); const narrow = await sp.page.evaluate("WM.app.view.stats()");
  const ms = await sp.page.evaluate("(() => { const r = WM.app.rows().rows.filter(x => x.onMap && x.rec.tier === 'milestone').map(x => x.id); return { milestones: r.length, drawnAlone: r.filter(id => [...document.querySelectorAll('.wm-mk:not(.wm-group)')].length > 0).length }; })()"); await sp.close();
  ok(narrow.grouped > wide.grouped && narrow.given === wide.given, `25: the same window groups more on a phone-width stage than on a PC stage (PC ${JSON.stringify(wide)}; phone ${JSON.stringify(narrow)}; ${JSON.stringify(ms)})`);
  await ev("WM.app.setMapStyle('satellite', true); WM.layout.open('settings')"); await s.page.waitForTimeout(500);
  const sat = await ev("({ sliders: document.querySelectorAll('[data-act=\"sat\"]').length, keyline: [...document.querySelectorAll('.wm-mk > svg')].filter(v => /#070B10/i.test(v.innerHTML)).length, marks: document.querySelectorAll('.wm-mk > svg').length, without: [...document.querySelectorAll('.wm-mk > svg')].filter(v => !/#070B10/i.test(v.innerHTML)).map(v => (v.parentElement.getAttribute('class') || '').replace(/leaflet-\S+/g, '').trim() + ' ' + v.innerHTML.slice(0, 120)).slice(0, 3) })");
  ok(sat.marks > 0 && sat.keyline === sat.marks, '23: on satellite every mark carries the dark keyline; adjustments present ' + JSON.stringify(sat)); await s.page.screenshot({ path: __dirname + '/shots/c-sat-pc.png' });
  await s.close();
  console.log(fails ? fails + ' FAILED' : 'ALL OK');
})();
