// usage: node shot.js name WxH [touch] [query] [hash] [js-to-eval-before-shot]
const { start } = require('./run.js');
(async () => {
  const [name, size, touch, q, hash, js] = process.argv.slice(2), [w, h] = size.split('x').map(Number);
  const s = await start({ viewport: { width: w, height: h }, touch: touch === 'touch' });
  await s.open(q || '', hash || '');
  if (js) { const r = await s.page.evaluate(js).catch(e => 'EVAL ERROR ' + e.message); if (r !== undefined) console.log(typeof r === 'string' ? r : JSON.stringify(r)); await s.page.waitForTimeout(500); }
  await s.page.screenshot({ path: `${__dirname}/shots/${name}.png` });
  console.log(s.errors.slice(0, 10).join('\n') || 'no errors');
  await s.close();
})();
