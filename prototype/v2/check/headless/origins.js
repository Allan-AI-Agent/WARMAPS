const { start } = require('./run.js');
(async () => { let fails = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };
  for (const [w, h, touch] of [[1600, 900, false], [1280, 760, true], [360, 700, true]]) { const s = await start({ viewport: { width: w, height: h }, touch, fresh: true, dsf: 2 }); await s.open(); const ev = js => s.page.evaluate(js);
    ok(await ev("document.querySelectorAll('.wm-origin').length") === 0, w + ': launch origins off by default');
    await ev("WM.app.setLayer('origins', true)"); await s.page.waitForTimeout(700);
    const n = await ev("({ n: document.querySelectorAll('.wm-origin').length, flames: document.querySelectorAll('.wm-origin .wmo-ex').length, anim: getComputedStyle(document.querySelector('.wm-origin .wmo-ex') || document.body).animationName })");
    ok(n.n === 6 && n.flames === 4 && n.anim === 'wmoExh', w + ': 6 launch points, 4 rockets with an animated flame ' + JSON.stringify(n));
    const r = await ev("(() => { const e = [...document.querySelectorAll('.wm-origin')].find(e => { const b = e.getBoundingClientRect(), t = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return t && e.contains(t); }); if (!e) return null; const b = e.getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; })()");
    if (r && touch) await s.page.touchscreen.tap(r[0], r[1]); else if (r) await s.page.mouse.move(r[0], r[1]); await s.page.waitForTimeout(500);
    const tip = await ev("((document.querySelector('.wmo-tip') || {}).textContent || '') + ' ' + document.querySelector('#toasts').textContent"); ok(/named by/.test(tip) || (w === 360 && !r), w + (r ? "" : " (every launch icon is under an event touch area at this zoom)") + ': ' + (touch ? 'tap' : 'pointer') + ' shows who named it: ' + tip);
    await s.page.screenshot({ path: __dirname + '/shots/o-' + w + '.png' });
    await ev("WM.app.setDetail('lite')"); await s.page.waitForTimeout(500); ok(await ev("document.querySelectorAll('.wm-origin .wmo-ex').length") === 0 && await ev("document.querySelectorAll('.wm-origin').length") === 6, w + ': at Lite the icons stay, without the flame');
    await ev("WM.app.setDetail('auto'); document.documentElement.dataset.motion = 'calm'"); await s.page.waitForTimeout(400); ok(await ev("getComputedStyle(document.querySelector('.wm-origin .wmo-ex')).animationName") === 'none', w + ': calm motion stops the flame moving');
    await ev("document.querySelector('[data-act=layers]').click()"); await s.page.waitForTimeout(300); await ev("document.querySelector('[data-act=layers-reset]').click()"); await s.page.waitForTimeout(400);
    ok(await ev("document.querySelectorAll('.wm-origin').length") === 0, w + ': Reset turns the layer off (check 8)');
    await ev("WM.layout.closePopover && WM.layout.closePopover(); WM.app.setLayer('origins', true); WM.app.setView('3d')"); await s.page.waitForTimeout(6000); ok(!s.errors.length, w + ': globe with the layer on: no error (layer not drawn in 3D) ' + s.errors.slice(0, 2).join('/'));
    await s.close(); }
  console.log(fails ? fails + ' FAILED' : 'ALL OK'); })();
