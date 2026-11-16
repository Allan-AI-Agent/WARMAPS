// WARMAPS v2 PROTOTYPE — headless harness (not part of the page). Serves prototype/v2 over http, answers the pinned CDN
// requests from local npm copies of the same packages, and answers map tiles with one transparent pixel, for
// workspaces where those hosts are not reachable. Needs Playwright. Screenshots go to ./shots (not committed).
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..', '..'), NM = process.env.WM_NODE_MODULES || path.join(__dirname, 'node_modules');   // npm install leaflet@1.9.4 cesium@1.146.0 and the @fontsource packages there
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.wasm': 'application/wasm', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.xml': 'text/xml' };
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYGBgYAAAAAUAAarVyFEAAAAASUVORK5CYII=', 'base64');   // one transparent pixel
exports.start = async function (opts) {
  opts = opts || {};
  const server = http.createServer((req, res) => { const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0].replace(/\/$/, '/index.html'))); fs.readFile(p, (e, b) => { if (e) { res.writeHead(404); res.end(); } else { res.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream' }); res.end(b); } }); });
  await new Promise(r => server.listen(0, r)); const port = server.address().port;
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'] });
  const ctx = await browser.newContext({ viewport: opts.viewport || { width: 360, height: 700 }, deviceScaleFactor: opts.dsf || +process.env.DSF || 1, hasTouch: !!opts.touch, isMobile: !!opts.touch, colorScheme: opts.scheme || 'dark' });
  const errors = [];
  await ctx.route(/cdn\.jsdelivr\.net\/npm\//, route => { const u = new URL(route.request().url()), rel = u.pathname.replace(/^\/npm\//, '').replace(/^(@[^/]+\/[^@/]+|[^@/]+)@[^/]+/, '$1'), f = path.join(NM, rel);
    fs.readFile(f, (e, b) => e ? route.fulfill({ status: 404, body: '' }) : route.fulfill({ status: 200, body: b, headers: { 'content-type': MIME[path.extname(f)] || 'application/octet-stream', 'access-control-allow-origin': '*' } })); });
  await ctx.route(/arcgisonline\.com/, route => route.fulfill({ status: 200, body: PNG, headers: { 'content-type': 'image/png', 'access-control-allow-origin': '*' } }));
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push('pageerror: ' + e.message)); page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  const open = async (q, hash) => { await page.goto(`http://localhost:${port}/?today=2026-11-15&tour=0&test=0${q || ''}${hash || ''}`); await page.waitForSelector('html[data-ready="1"]', { timeout: 15000 }).catch(() => errors.push('never became ready')); await page.waitForTimeout(400); };
  return { page, ctx, browser, server, errors, open, port, close: async () => { await browser.close(); server.close(); } };
};
