// R1 review: independent recount of the migration numbers in ARCHITECTURE 3.4 / 7.1 / 7.2,
// written from the rule text only (not from the dry-run scripts). Read-only.
'use strict';
const root = process.argv[2] || '.';
const { D, pass2 } = require('./load.js')(root);
const { parseWarDay } = require('./dates.js');
const P = Object.fromEntries(pass2.map(p => [p.id, p]));
const URL_RE = /https?:\/\/[^\s;,)'"]+/g;
const out = { fog: 0, claim: {}, src: {}, dayLabelOff: [], dayLabelOther: [], singleSrcNotFog: [], fogNotParty: [] };
for (const e of D.strikes) {
  const p = P[e.id];
  const fogText = /FOG OF WAR/i.test(e.misc || '');
  const fog = fogText || !!e.fogStatus || !!e.fogOfWar || !!(p && p.fog);
  if (fog) out.fog++;
  let cs;
  if (e.fogStatus === 'disputed') cs = 'disputed';
  else if (fog) cs = 'claimed';
  else if (p && (p.verified === 'PASS' || p.verified === 'FIX')) cs = 'reported';
  else cs = 'unreviewed';
  out.claim[cs] = (out.claim[cs] || 0) + 1;
  const urls = new Set([...(p ? p.sources : []), ...((e.misc || '').match(URL_RE) || []), ...(e.evidenceUrl ? [].concat(e.evidenceUrl) : [])]);
  const names = (e.source || '') + ((e.misc || '').match(/Source[s]?:/i) ? ' x' : '');
  const st = urls.size ? 'listed' : (names.trim() ? 'named-only' : 'legacy-unlisted');
  out.src[st] = (out.src[st] || 0) + 1;
  if (p && !fog && p.sources.length === 1) out.singleSrcNotFog.push(e.id);
  const lab = (e.time || '').match(/^\s*Days?\s+(\d+)/);
  const d = parseWarDay(e.date);
  if (lab && +lab[1] !== d) out.dayLabelOff.push(e.id + '(' + lab[1] + '/' + d + ')');
  if (!lab && /Day\s+\d+/.test(e.time || '')) out.dayLabelOther.push(e.id + ':' + JSON.stringify(e.time));
}
console.log('fog', out.fog, '| claimStatus', out.claim, '| sourcesStatus', out.src);
console.log('day labels off (leading "Day N"/"Days N"):', out.dayLabelOff.length, out.dayLabelOff.slice(0, 80).join(' '));
console.log('day number mid-text:', out.dayLabelOther.join(' | '));
console.log('pass-2 events with exactly one source and fog false:', out.singleSrcNotFog.length);
