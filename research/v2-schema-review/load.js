// R1 review helper: load v1 data read-only. No dependencies. Never writes app files.
// Usage: const D = require('./load.js')(repoRoot)
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

module.exports = function load(root) {
  const src = fs.readFileSync(path.join(root, 'warmaps-data.js'), 'utf8');
  const ctx = { window: {}, Date };
  vm.createContext(ctx);
  vm.runInContext(src, ctx, { filename: 'warmaps-data.js' });
  const D = ctx.window.WARMAPS_DATA;
  const pass2 = JSON.parse(fs.readFileSync(
    path.join(root, 'research/backfill-pass2/events_386-600_with_tiers_sources.json'), 'utf8'));
  const feeds = JSON.parse(fs.readFileSync(path.join(root, 'intake/feeds.json'), 'utf8'));
  return { D, pass2, feeds };
};
