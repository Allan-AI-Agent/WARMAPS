const { start } = require('./run.js');
(async () => {
  const s = await start({ viewport: { width: 1280, height: 760 }, touch: true });
  const p = s.page; let fails = 0;
  const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };
  const ev = js => p.evaluate(js);
  const marks = () => ev("(() => { const r = WM.app.rows().rows; return r.filter(x => x.onMap).map(x => [x.id, x.look, x.pos.lat, x.pos.lng]); })()");
  await s.open();
  ok(await ev("document.documentElement.dataset.layout") === 'tablet-landscape', 'class tablet-landscape at 1280x760 touch');
  ok(await ev("WM.timeline.rangeText(false)") === 'Last 7 days', 'first load: last 7 days (check 10)');
  let st = await ev("WM.app.view.stats()"); ok(st.drawn + st.grouped === st.given, `2D accounting ${JSON.stringify(st)}`);
  await ev("WM.timeline.setRange('all')"); const all = await ev("WM.app.rows().rows.length"); ok(all > 30, 'All shows the whole period: ' + all + ' rows');
  await ev("WM.timeline.goToday()"); ok(await ev("WM.timeline.rangeText(false)") === 'Last 7 days', 'Today restores 7 days');
  // fog / contested (check 13)
  await ev("WM.app.toggleShow('fog')"); let m = await marks(); ok(!m.some(x => x[1] === 'ghost' || x[1] === 'faded'), 'fog off: no ghost on map');
  ok(!(await ev("WM.app.rows().rows.some(r => r.look==='ghost'||r.look==='faded')")), 'fog off: none in list');
  await ev("WM.app.toggleShow('onRecord')"); const sh = await ev("WM.app.store.get().show"); ok(sh.fog || sh.onRecord, 'both switches can never be off: ' + JSON.stringify(sh));
  await ev("WM.app.store.set({show:{onRecord:true,fog:true,contestedOnly:true}})"); m = await marks(); ok(m.length > 0 && m.every(x => x[1] === 'split'), 'contested: only split (' + m.length + ')');
  await ev("WM.app.store.set({show:{onRecord:true,fog:true,contestedOnly:false}})");
  // as known then (check 14)
  await ev("WM.app.store.set({time:Object.assign({},WM.app.store.get().time,{record:'then'})})");
  const pos = async () => (await marks()).find(x => x[0] === 'IR-90001');
  const now = await pos(); ok(now && now[1] === 'solid' && now[2] === 32.65, 'IR-90001 solid at Site A today ' + JSON.stringify(now));
  await ev("WM.timeline.setCursorStep(WM.timeline.geom().ci - 5)"); const then = await pos(); ok(then && then[1] === 'ghost' && then[2] === 33.55, 'as known 5 days back: ghost at Province A ' + JSON.stringify(then));
  await ev("WM.timeline.setCursorStep(WM.timeline.geom().ci - 1)"); ok(!(await pos()), 'the day before its first statement: not shown');
  await ev("WM.timeline.goToday(); WM.app.store.set({time:Object.assign({},WM.app.store.get().time,{record:'today'})})");
  // lens (checks 11, 12)
  const before = (await marks()).find(x => x[0] === 'IR-90004');
  await ev("WM.app.setLens('parties',['israel'])"); m = await marks(); const after = m.find(x => x[0] === 'IR-90004');
  ok(before && after && before[2] !== after[2], 'lens Israel moves IR-90004 to the place Israel gives ' + JSON.stringify([before, after]));
  ok(!m.some(x => x[0] === 'IR-90002'), 'a record Israel has not spoken on is absent');
  ok(await ev("document.querySelector('#lensbanner').classList.contains('on') && !document.querySelector('#lenstag').hidden"), 'banner and tag shown');
  console.log('     banner: ' + await ev("document.querySelector('#lensbanner .txt').textContent") + ' | tag: ' + await ev("document.querySelector('#lenstag').textContent"));
  await p.waitForTimeout(2600); const hash = await ev("location.hash"); ok(/lens=israel/.test(hash), 'hash carries the lens: ' + hash);
  await p.screenshot({ path: __dirname + '/shots/t-lens.png' });
  // compare (check 16)
  await ev("WM.app.setLens('compare',['hezbollah','israel'])"); const cm = await ev("WM.app.rows().rows.map(r => [r.id, r.cmp.look, r.cmp.left.state, r.cmp.right.state])"); console.log('     compare Hezbollah|Israel: ' + JSON.stringify(cm));
  ok(cm.some(x => x[1] === 'solid') && cm.some(x => x[1] === 'split') , 'compare has both-say and one-denies cases');
  await ev("WM.app.setLens('compare',['iran','israel'])"); await p.waitForTimeout(300); await p.screenshot({ path: __dirname + '/shots/t-compare.png' });
  const cm2 = await ev("WM.app.rows().rows.map(r => [r.id, r.cmp.look, r.cmp.left.state, r.cmp.right.state, !!r.cmpPlaces])"); console.log('     compare Iran|Israel: ' + JSON.stringify(cm2));
  ok(cm2.some(x => x[1] === 'ghost') && cm2.some(x => x[4]), 'compare Iran|Israel: only-one-spoke and two-places cases');
  // clean view (18, 19)
  await ev("WM.app.toggleShow('fog'); WM.controls.setClean(true)"); await p.waitForTimeout(300);
  const vis = await ev("['#topbar','#rail','#timeline','#lensbanner','.stage-tr'].map(q => { const e = document.querySelector(q); return e.offsetParent !== null && getComputedStyle(e).display !== 'none'; })");
  ok(vis.every(v => !v), 'clean view hides chrome ' + JSON.stringify(vis));
  const vt = await ev("document.querySelector('#viewtag').textContent"); console.log('     view tag: ' + vt); ok(/Fog hidden/.test(vt) && /Last 7 days/.test(vt) && /Record as of/.test(vt), 'view tag names period, record date and hidden layer');
  ok(await ev("!document.querySelector('#lenstag').hidden && document.querySelector('#lenstag').offsetParent !== null"), 'lens tag stays in clean view');
  await p.screenshot({ path: __dirname + '/shots/t-clean.png' });
  await p.keyboard.press('Escape'); ok(await ev("WM.app.store.get().cleanView === false && document.documentElement.dataset.clean === '0'"), 'Escape leaves clean view');
  await ev("WM.app.toggleShow('fog'); WM.app.setLens('all',[])");
  // back handling (check 4)
  await ev("WM.layout.reset(); WM.layout.open('events'); WM.app.select({type:'event',id:'IR-90003'})"); await p.waitForTimeout(200);
  await p.goBack(); await p.waitForTimeout(200); ok(await ev("WM.app.store.get().selection === null && WM.layout.whereIs('events') === 'left'"), 'Back 1 closes the card, panel stays');
  await p.goBack(); await p.waitForTimeout(200); ok(await ev("WM.layout.whereIs('events') === null"), 'Back 2 closes the panel');
  // theme switch (20, 22), validation (21)
  const cam0 = await ev("JSON.stringify(WM.app.view.getCamera())");
  const legend = async () => ev("(() => { WM.layout.open('help',{keep:true}); const t = [...document.querySelectorAll('#slot-left .legend-row')].map(n => n.textContent).join('|'); return t; })()");
  const lg0 = await legend(); await ev("WM.app.setTheme('ops')"); const lg1 = await legend(); await ev("WM.app.setTheme('paper')"); const lg2 = await legend();
  ok(lg0 === lg1 && lg1 === lg2 && lg0.length > 100, 'legend wording identical in all three themes');
  await p.waitForTimeout(300); await p.screenshot({ path: __dirname + '/shots/t-paper.png' });
  ok(await ev("JSON.stringify(WM.app.view.getCamera())") === cam0, 'theme change leaves the camera');
  ok(await ev("WM.app.store.get().mapStyle") === 'light-gray', 'Paper opens with the light gray map');
  await ev("WM.app.setTheme('classic')");
  const rej = await ev("(() => { const t = JSON.parse(WM.theme.toJson(WM.theme.builtin.ops)); const bad = [Object.assign({}, t, {extra:1}), Object.assign({}, t, {name:'<b>x</b>'}), Object.assign({}, t, {colors: Object.assign({}, t.colors, {'bg-base':'url(x)'})}), Object.assign({}, t, {name:'Verified'})]; return bad.map(b => WM.theme.validate(b).ok); })()");
  ok(rej.every(x => x === false), 'bad themes rejected ' + JSON.stringify(rej));
  ok(await ev("!document.querySelector('[data-act=\"studio\"]') && !WM.studio"), 'no studio entry or code without the flag (check 27)');
  // links + tracks
  await ev("WM.layout.close('help'); WM.app.setTheaters(['iran-war','russia-ukraine']); WM.app.setLayer('links', true); WM.app.setLayer('flights', true); WM.layout.open('links')"); await p.waitForTimeout(500);
  const lk = await ev("(() => { const v = WM.app.links(); return { arcs: v.arcs.map(a => [a.id, a.count, a.lineState, a.weightStep]), thinned: WM.app.store.get().thinned }; })()"); console.log('     links: ' + JSON.stringify(lk));
  ok(lk.arcs.some(a => a[1] === 3), 'three links between the same pair are one arc');
  const w0 = await ev("WM.app.links().arcs.map(a => a.weightStep).join()"); await ev("WM.timeline.setCursorStep(WM.timeline.geom().ci - 60)"); const w1 = await ev("WM.app.links().arcs.map(a => a.weightStep).join()"); ok(w0 !== w1, 'weights change when time is scrubbed: ' + w0 + ' -> ' + w1);
  await ev("WM.timeline.goToday()"); await p.waitForTimeout(400); await p.screenshot({ path: __dirname + '/shots/t-links.png' });
  // reset (check 8)
  await ev("document.querySelector('[data-act=\"layers\"]').click()"); await p.waitForTimeout(200); await p.screenshot({ path: __dirname + '/shots/t-layers.png' }); await ev("document.querySelector('[data-act=\"layers-reset\"]').click()");
  ok(await ev("JSON.stringify(WM.app.store.get().layersOn)") === '{"outlines":true}', 'reset returns to events and outlines');
  // intake-only theater
  await ev("WM.layout.closePopover(); WM.app.setTheaters(['east-asia'])"); await p.waitForTimeout(300); ok(/No curated events yet/.test(await ev("document.querySelector('#stagemsg').textContent")), 'intake-only theater says so');
  await ev("WM.app.setTheaters(['iran-war'])");
  // detail reach (24)
  const rows = async () => ev("JSON.stringify(WM.app.rows().rows.map(r => [r.id, r.look, r.rec.entries.length]))");
  const r0 = await rows(); await ev("WM.app.setDetail('lite')"); const r1 = await rows(); await ev("WM.app.setDetail('full')"); const r2 = await rows(); ok(r0 === r1 && r1 === r2, 'same rows at Lite, Standard and Full'); await ev("WM.app.setDetail('auto')");
  // tour
  await ev("WM.tour.start()"); await p.waitForTimeout(200); for (let i = 0; i < 6; i++) { await p.click('#tour [data-t="next"]'); await p.waitForTimeout(150); } ok(await ev("!WM.tour.active()"), 'tour runs to the end');
  await ev("WM.tour.start()"); await p.waitForTimeout(150); await p.screenshot({ path: __dirname + '/shots/t-tour.png' }); await p.keyboard.press('Escape'); ok(await ev("!WM.tour.active()"), 'Escape ends the tour');
  console.log(s.errors.slice(0, 12).join('\n') || 'no page errors');
  console.log(fails ? fails + ' FAILED' : 'ALL OK');
  await s.close();
})();
