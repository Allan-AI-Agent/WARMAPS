const { start } = require('./run.js');
(async () => {
  const [size, name, q] = process.argv.slice(2), [w, h] = (size || '1280x760').split('x').map(Number);
  const s = await start({ viewport: { width: w, height: h }, touch: w < 1300 });
  await s.open(q || '');
  await s.page.evaluate("WM.app.setTheaters(['iran-war','russia-ukraine']); WM.app.setLayer('links', true); WM.app.setView('3d')");
  await s.page.waitForTimeout(9000);
  console.log(await s.page.evaluate("JSON.stringify({view: WM.app.store.get().viewMode, stats: WM.app.view.stats(), cam: WM.app.view.kind==='3d'?WM.app.view.getCamera():null, fps: WM.app.store.get().fps})"));
  await s.page.screenshot({ path: `${__dirname}/shots/${name || 'g-globe'}.png` });
  console.log(s.errors.slice(0, 8).join('\n') || 'no errors');
  await s.close();
})();
