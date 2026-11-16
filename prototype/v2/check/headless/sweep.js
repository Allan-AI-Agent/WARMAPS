// WARMAPS v2 PROTOTYPE — sitting 2 sweep (not part of the page). Five form factors x states: one screenshot each and
// an audit of what a script can measure (regions overlapping, controls under 48 px on touch, things off screen,
// clipped text). usage: node sweep.js [class-filter] [state-filter]    Output: shots/<class>-<state>.png, shots/sweep.json
const { start } = require('./run.js'), fs = require('fs');
const VPS = [['pp', 360, 700, true], ['pl', 780, 320, true], ['tp', 800, 1200, true], ['tl', 1280, 760, true], ['pc', 1600, 900, false]];
const CARD = "WM.app.select({type:'event',id:'IR-90003'})";
const STATES = {
  'classic': '', 'ops': "WM.app.setTheme('ops')", 'paper': "WM.app.setTheme('paper')",
  'panel': "WM.layout.open('events')", 'card': CARD, 'panelcard': "WM.layout.open('events');" + CARD,
  'links': "WM.app.setTheaters(['iran-war','russia-ukraine']); WM.app.setLayer('links', true); WM.layout.open('links')",
  'watch': "WM.layout.open('watchlist')", 'lens': "WM.app.setLens('parties',['israel'])", 'compare': "WM.app.setLens('compare',['iran','israel'])",
  'clean': "WM.app.setLens('parties',['israel']); WM.app.toggleShow('fog'); WM.controls.setClean(true)",
  'then': "WM.app.store.set({time:Object.assign({},WM.app.store.get().time,{record:'then'})}); WM.timeline.setCursorStep(WM.timeline.geom().ci - 5)",
  'settings': "WM.layout.open('settings')", 'help': "WM.layout.open('help')", 'layers': "document.querySelector('[data-act=\"layers\"]').click()",
  'globe': "WM.app.setView('3d')"
};
const AUDIT = `(() => {
  const vw = innerWidth, vh = innerHeight, touch = ${'${TOUCH}'};
  const vis = e => e && e.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) && e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().height > 0;
  const R = e => { const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)]; };
  const name = e => (e.id ? '#' + e.id : '') + (e.dataset && e.dataset.act ? '[' + e.dataset.act + ']' : '') + (!e.id && !(e.dataset && e.dataset.act) ? e.tagName.toLowerCase() + '.' + String(e.className && e.className.baseVal !== undefined ? e.className.baseVal : e.className).trim().split(/\\s+/).slice(0, 2).join('.') : '');
  const regs = ['#topbar', '#lensbanner', '#rail', '#slot-left', '#slot-right', '#slot-bottom', '#timeline', '#legendchip', '#lenstag', '#viewtag', '.stage-tl .stamp', '.stage-tr', '.clean-btns', '#stagemsg', '#cleancard']
    .map(q => [q, document.querySelector(q)]).filter(x => vis(x[1])).concat([...document.querySelectorAll('#floats > *, #popovers .popover')].filter(vis).map((e, i) => [name(e) + i, e]));
  const out = { layout: document.documentElement.dataset.layout, vw, vh, regions: {}, overlaps: [], off: [], small: {}, clipped: {}, hscroll: document.documentElement.scrollWidth > vw + 1 };
  regs.forEach(([q, e]) => { const r = R(e); out.regions[q] = r.join(','); if (r[0] < -1 || r[1] < -1 || r[2] > vw + 1 || r[3] > vh + 1) out.off.push(q + ' ' + r.join(',')); });
  for (let i = 0; i < regs.length; i++) for (let j = i + 1; j < regs.length; j++) { const a = R(regs[i][1]), b = R(regs[j][1]); if (regs[i][1].contains(regs[j][1]) || regs[j][1].contains(regs[i][1])) continue;
    const w = Math.min(a[2], b[2]) - Math.max(a[0], b[0]), h = Math.min(a[3], b[3]) - Math.max(a[1], b[1]); if (w > 2 && h > 2) out.overlaps.push(regs[i][0] + ' x ' + regs[j][0] + ' ' + w + 'x' + h); }
  const top = e => { const r = e.getBoundingClientRect(), t = document.elementFromPoint(Math.min(vw - 1, Math.max(0, r.left + r.width / 2)), Math.min(vh - 1, Math.max(0, r.top + r.height / 2))); return t && (e.contains(t) || t.contains(e)); };
  [...document.querySelectorAll('button, a[href], input, select, [role=button], [role=slider], [role=tab], [role=switch], summary')].filter(vis).forEach(e => { const r = e.getBoundingClientRect();
    if (r.right > vw + 1 || r.left < -1) { if (!e.closest('.pb, .card-body, .tl-track, .scrollx')) out.off.push(name(e) + ' x ' + Math.round(r.left) + '-' + Math.round(r.right)); }
    if (!top(e)) return;
    let w = r.width, h = r.height; const b = getComputedStyle(e, '::before'), a = getComputedStyle(e, '::after');
    [b, a].forEach(p => { if (p.content !== 'none' && p.position === 'absolute') { w = Math.max(w, parseFloat(p.width) || 0); h = Math.max(h, parseFloat(p.height) || 0); } });
    if (touch && (w < 47.5 || h < 47.5)) { const k = name(e); (out.small[k] = out.small[k] || []).push(Math.round(w) + 'x' + Math.round(h)); } });
  Object.keys(out.small).forEach(k => { const v = out.small[k]; out.small[k] = v[0] + (v.length > 1 ? ' (' + v.length + ')' : ''); });
  regs.forEach(([q, e]) => [...e.querySelectorAll('*')].filter(n => n.children.length === 0 && n.textContent.trim() && vis(n)).forEach(n => { const cs = getComputedStyle(n);
    if (n.scrollWidth > n.clientWidth + 1 && /hidden|clip/.test(cs.overflowX) && cs.textOverflow !== 'ellipsis') out.clipped[q + ' ' + name(n)] = n.textContent.trim().slice(0, 30); }));
  return out;
})()`;
(async () => {
  const [fc, fs2] = process.argv.slice(2), res = {};
  for (const [id, w, h, touch] of VPS) { if (fc && fc !== 'all' && !fc.split(',').includes(id)) continue;
    const s = await start({ viewport: { width: w, height: h }, touch, fresh: true });
    for (const st of Object.keys(STATES)) { if (fs2 && !fs2.split(',').includes(st)) continue; if (st === 'globe' && id !== 'pl' && id !== 'pc') continue;
      await s.open(); if (STATES[st]) { const e = await s.page.evaluate(STATES[st]).then(() => '', e => 'EVAL ' + e.message); if (e) console.log(id, st, e); }
      await s.page.waitForTimeout(st === 'globe' ? 9000 : 700);
      const a = await s.page.evaluate(AUDIT.replace('${TOUCH}', touch)); res[id + '-' + st] = a;
      await s.page.screenshot({ path: `${__dirname}/shots/${id}-${st}.png` });
      const bits = []; if (a.overlaps.length) bits.push('OVERLAP ' + a.overlaps.join('; ')); if (a.off.length) bits.push('OFF ' + a.off.join('; ')); if (a.hscroll) bits.push('HSCROLL');
      if (Object.keys(a.small).length) bits.push('SMALL ' + Object.entries(a.small).map(x => x.join(' ')).join('; ')); if (Object.keys(a.clipped).length) bits.push('CLIP ' + Object.entries(a.clipped).map(x => x.join('=')).join('; '));
      console.log(`${id}-${st} [${a.layout}] ` + (bits.join(' | ') || 'clean'));
    }
    if (s.errors.length) console.log(id, 'ERRORS', s.errors.slice(0, 6).join(' / '));
    await s.close();
  }
  fs.writeFileSync(__dirname + '/shots/sweep.json', JSON.stringify(res, null, 1));
})();
