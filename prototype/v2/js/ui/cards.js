/* WARMAPS v2 PROTOTYPE — ui/cards.js
 * Info cards (LAYOUT spec 5): event, link and track, at peek and expanded. The attribution chip and the status
 * line come first and never scroll away. All data text is escaped; sources become links only when they carry an
 * http(s) address, and open in a new tab with rel="noopener noreferrer".
 */
(function () {
'use strict';
const WM = window.WM = window.WM || {};
const { esc, safeUrl, $ } = WM.dom, M = WM.marks, T = WM.time, STR = WM.strings;
let app;
const C = () => WM.theme.current().colors;
const icon = (n, px) => M.icon(n, px);

/* A small copy of a marker in its look, in the chrome's own colours. */
function mini(theater, look, px, extra) {
  const c = C();
  return M.svg(Object.assign({ shape: M.SHAPE[theater] || 'circle', look, d: px || 10, color: c[M.TOKEN[theater]] || c['text-primary'], bg: c['bg-raised'], tight: true }, extra || {})).html;
}
function chipLook(theater, look) { return `<span class="chip">${look === 'no-account' ? '' : mini(theater, look, 10)}${esc(STR.fixed.chip[look])}</span>`; }
const stamp = () => `<span class="chip stamp">${esc(STR.stamp)}</span>`;
function statusHtml(line) {
  return String(line || '').split(' · ').map(part => { const i = part.indexOf(': '); return i > 0 && i < 20 ? `<span class="k">${esc(part.slice(0, i + 1))}</span> ${esc(part.slice(i + 2))}` : esc(part); }).join(' <span class="k">·</span> ');
}
function dayNumbers(rec) {
  return rec.theater.map(id => app.data.theatersById[id]).filter(t => t.epochISO).map(t => t.prefix + ' ' + t.dayLabel + ' ' + T.dayNumber(t, rec.dateISO).toLocaleString('en-US')).join(' · ');
}
function dateText(rec) {
  if (rec.datePrecision === 'month') return T.MONTHS[+rec.dateISO.slice(5, 7) - 1] + ' ' + rec.dateISO.slice(0, 4) + ' (month)';
  if (rec.datePrecision === 'week' || rec.datePrecision === 'range') return T.fmt(rec.dateISO) + ' to ' + T.fmt(rec.dateEndISO);
  if (rec.datePrecision === 'ongoing-from') return 'Ongoing from ' + T.fmt(rec.dateISO);
  return T.fmt(rec.dateISO);
}
const VERB = { claims: 'says', acknowledges: 'acknowledges', denies: 'denies', withdraws: 'withdraws' };
const FIG = { killed: 'killed', wounded: 'wounded', missing: 'missing', detained: 'detained', displaced: 'displaced', 'projectiles-launched': 'projectiles launched', 'projectiles-intercepted': 'projectiles intercepted', 'aircraft-lost': 'aircraft lost', 'vessels-hit': 'vessels hit', 'sites-hit': 'sites hit', other: 'other' };
const QUAL = { 'at-least': 'at least ', about: 'about ' };
const RECORD = { 'treaty-or-contract': 'a treaty or contract', 'court-judgment': 'a court judgment', 'official-statement': 'an official statement', 'sanctions-designation': 'a sanctions designation', 'igo-report': 'a report by an intergovernmental body', 'wreckage-report': 'a wreckage report', imagery: 'imagery', 'trade-data': 'trade data', 'media-report': 'a media report' };

function sourceLine(s) {
  const u = safeUrl(s.url), name = u ? `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(s.publisher)}</a>` : esc(s.publisher);
  const notes = []; if (s.published) notes.push(T.fmt(s.published)); if (s.access === 'snippet-only') notes.push('snippet only'); if (s.access === 'archive') notes.push('archive copy'); if (s.access === 'subscription') notes.push('subscription'); if (s.kind === 'leaked') notes.push('leaked');
  return name + (notes.length ? ' <span class="muted">(' + esc(notes.join(', ')) + ')</span>' : '');
}
function entryHtml(e, rec, superseded) {
  const sel = app.sel, orig = (e.sources || []).filter(s => s.role !== 'carrier'), carr = (e.sources || []).filter(s => s.role === 'carrier');
  const scope = e.scope && e.scope.length ? ' (' + e.scope.join(', ') + ')' : '';
  const figs = (e.figures || []).map(f => (QUAL[f.qualifier] || '') + f.value.toLocaleString('en-US') + ' ' + FIG[f.what] + (f.scope ? ' (' + f.scope + ')' : '')).join(' · ');
  const media = (e.media || []).map(m => { const u = safeUrl(m.url), k = m.kind === 'satellite-image' ? 'Satellite image' : m.kind[0].toUpperCase() + m.kind.slice(1); return k + ' published by ' + (u ? `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(m.publisher)}</a>` : esc(m.publisher)); }).join(' · ');
  return `<div class="entry${superseded ? ' superseded' : ''}"><div><span class="who">${esc(sel.claimantLabel(e))}</span> <span class="what">${superseded ? 'earlier, replaced' : esc(VERB[e.stance] + scope)}</span> <span class="muted mono" style="font-size:var(--t-meta)">${esc(T.fmt(e.published))} · ${esc(rec.id + '#' + e.n)}</span></div>
    ${e.text ? `<div class="txt" dir="auto">${esc(e.text)}</div>` : e.covers ? `<div class="txt" dir="auto">${esc(e.covers)}</div>` : ''}
    ${figs ? `<div class="src">Figures: ${esc(figs)}</div>` : ''}${media ? `<div class="src">${media}</div>` : ''}
    ${e.record ? `<div class="src">Kind of record: ${esc(RECORD[e.record] || e.record)}</div>` : ''}
    ${orig.length ? `<div class="src">${e.claimedBy ? 'Source' : 'Named in v1'}: ${orig.map(sourceLine).join(' · ')}</div>` : ''}
    ${carr.length ? `<div class="src">Carried by: ${carr.map(sourceLine).join(' · ')} <span class="muted">(repeating is not agreeing)</span></div>` : ''}</div>`;
}
/* Entries known on the record date, oldest first; a replaced entry sits struck through under its replacement. */
function entriesHtml(rec, date, onlyAccounts) {
  const A = WM.attribution, known = rec.entries.filter(e => !e.withdrawn && e.published <= date).sort((a, b) => a.published < b.published ? -1 : a.published > b.published ? 1 : a.n - b.n);
  const replaced = new Set(known.filter(e => e.supersedes != null).map(e => e.supersedes)), mine = e => !onlyAccounts || (A.accountOf(e, app.data.reg) && onlyAccounts.includes(A.accountOf(e, app.data.reg).id));
  let html = '';
  for (const e of known) { if (replaced.has(e.n) || !mine(e)) continue; html += entryHtml(e, rec, false); if (e.supersedes != null) { const old = rec.entries.find(x => x.n === e.supersedes); if (old) html += entryHtml(old, rec, true); } }
  const later = rec.entries.filter(e => e.published > date).length;
  if (later) html += `<p class="note" style="padding-top:var(--s2)">${later} later ${later === 1 ? 'entry is' : 'entries are'} not shown: this is the record as known on ${esc(T.fmt(date))}.</p>`;
  return html;
}
function lookAgain(rec, st, date) {
  const cfg = WM.attribution.CONFIG, done = (rec.checks || []).filter(c => c.dateISO <= date).sort((a, b) => a.step - b.step);
  if (!st.attributed) return '';
  const list = xs => xs.length > 1 ? xs.slice(0, -1).join(', ') + ' and ' + xs[xs.length - 1] : String(xs[0]);
  const parts = [];
  if (done.length) {
    const found = [...new Set(done.flatMap(c => c.found))];
    const who = st.missing && st.missing.length ? st.missing.map(app.sel.accountName).sort().join(', ') : 'the missing side';
    parts.push('Checked after ' + list(done.map(c => c.step)) + (done.length > 1 || done[0].step > 1 ? ' days' : ' day') + ': ' + (found.length ? 'found ' + (found.length === 1 ? 'entry ' : 'entries ') + list(found) : 'no account from ' + who + ' found') + '.');
  }
  if (st.look === 'ghost') {
    const next = cfg.lookAgainDays.find(d => !done.some(c => c.step === d));
    if (next != null) { const due = T.add(st.firstPublished, next); parts.push(due <= date ? 'Check after ' + next + (next > 1 ? ' days' : ' day') + ' is due and has not been run.' : 'Next check: ' + next + (next > 1 ? ' days' : ' day') + ' after the first statement (' + T.fmt(due) + ').'); }
  }
  for (const g of rec.coverageGaps || []) parts.push('Could not read ' + g.publisher + ' (' + g.reason + ', ' + T.fmt(g.date) + '); the block was not worked around.');
  return parts.length ? `<p>${esc(parts.join(' '))}</p>` : '';
}

function eventCard(rec, o) {
  const s = app.store.get(), sel = app.sel, date = sel.recordDate(s), st = sel.stateOf(rec, date, s), th = rec.theater[0];
  if (!st.known) return `<div class="card-body"><p>This record is not known on ${esc(T.fmt(date))}: its first statement was published later.</p><div class="chips">${stamp()}</div></div>`;
  const lensOn = s.lens.mode !== 'all' && st.attributed, parties = lensOn ? s.lens.parties : null;
  const hiddenAcc = lensOn ? [...st.sidesOnRecord, ...st.observers].filter(a => !parties.includes(a)).length : 0;
  const first = WM.attribution.inForce(rec.entries, date).sort((a, b) => a.published < b.published ? -1 : a.published > b.published ? 1 : a.n - b.n).filter(e => !parties || (WM.attribution.accountOf(e, app.data.reg) && parties.includes(WM.attribution.accountOf(e, app.data.reg).id)))[0];
  const chips = `<div class="chips">${chipLook(th, st.look)}${stamp()}${rec.theater.map(id => `<span class="chip">${mini(id, 'solid', 8)}${esc(app.data.theatersById[id].label)}</span>`).join('')}<span class="chip">${esc((rec.needs || []).includes('kind') ? 'kind not yet set' : rec.kind)}</span>${rec.tier ? `<span class="chip">${esc(rec.tier)}</span>` : ''}</div>`;
  let html = `<div class="card-head">${chips}<div class="statusline" role="status">${statusHtml(st.statusLine)}</div></div>`;
  html += `<div class="card-body"><dl class="kv"><dt>When</dt><dd><span class="mono">${esc(dateText(rec))}</span>${dayNumbers(rec) ? ' · <span class="mono sec">' + esc(dayNumbers(rec)) + '</span>' : ''}${rec.timeNote ? ' · ' + esc(rec.timeNote) : ''}</dd>
    <dt>Where</dt><dd>${esc(st.position ? st.position.place : rec.place)}, ${esc(rec.country)} · <span class="muted">${esc(sel.placedBy(rec, st))}</span></dd></dl>
    ${first && first.text ? `<p style="margin-top:var(--s2)"><b>${esc(sel.claimantLabel(first).split(',')[0])}:</b> <span dir="auto">${esc(first.text)}</span></p>` : ''}`;
  if (lensOn) html += `<div class="lens-row" style="margin:var(--s2) calc(-1 * var(--s4))">${hiddenAcc} other ${hiddenAcc === 1 ? 'account' : 'accounts'} on this record ${hiddenAcc === 1 ? 'is' : 'are'} hidden · <button data-act="lens-all" style="text-decoration:underline">Show all accounts</button></div>`;
  if (o.expanded) {
    html += `<h3 class="sub" style="padding-left:0">Entries, oldest first</h3>${entriesHtml(rec, date, parties)}`;
    html += `<div class="entry"></div>${lookAgain(rec, st, date)}`;
    if (st.altPositions && st.altPositions.length) html += `<p>Other places named: ${st.altPositions.map(a => esc(a.place) + ', per ' + esc(sel.accountName(a.saidBy))).join('; ')}. They are shown on the map while this card is open.</p>`;
    if (st.targets && st.targets.length) html += `<p>Further targets named in the same statement: ${st.targets.map(t => esc(t.place)).join(', ')}. They are shown as ticks while this card is open.</p>`;
    if (rec.legacy && rec.legacy.fog) html += `<p><span class="muted">v1 note:</span> ${esc(rec.legacy.fog.note || 'This record carried a fog marker in the first version.')}</p>`;
    if (rec.attackerText) html += `<p><span class="muted">v1 attacker text (not yet reviewed):</span> ${esc(rec.attackerText)}</p>`;
    if (rec.detail && rec.detail.structuralDmg) html += `<p><span class="muted">v1 text:</span> ${esc(rec.detail.structuralDmg)} ${esc(rec.detail.humanCasualties || '')}</p>`;
    const rc = rec.recordCheck; html += `<p class="note">${rc.status === 'none' ? 'This record has not yet been compared with its sources.' : 'Record compared with its sources on ' + esc(T.fmt(rc.date)) + (rc.status === 'corrected' ? ' and corrected.' : '.')} That checks the record is faithful to its sources, nothing more.</p>`;
    const related = app.data.links.filter(l => l.entries.some(e => (e.events || []).includes(rec.id)));
    if (related.length) html += `<p>Related links: ${related.map(l => `<button data-act="sel-link" data-id="${l.id}" style="text-decoration:underline">${esc(l.title)}</button>`).join(', ')}</p>`;
  }
  html += '</div>';
  if (!o.floating) html += `<div class="actions">${o.expanded ? '' : `<button class="btn" data-act="card-expand">${icon('chevron', 18)}Entries (${rec.entries.filter(e => e.published <= date).length})</button>`}
    ${st.position ? `<button class="btn" data-act="show-map" data-id="${rec.id}">Show on map</button>` : ''}<button class="btn" data-act="show-time" data-id="${rec.id}">Show on timeline</button>
    <button class="btn" data-act="copy-link">${icon('copy', 18)}Copy link</button><button class="btn" data-act="step-sel" data-dir="-1" aria-label="Previous event in time">${icon('prev', 18)}</button><button class="btn" data-act="step-sel" data-dir="1" aria-label="Next event in time">${icon('next', 18)}</button></div>`;
  return html;
}

function linkCard(link, o) {
  const s = app.store.get(), sel = app.sel, dl = WM.attribution.deriveLink(link, s.time.cursor, app.data.reg, sel.cfg(s)), c = C();
  if (!dl.known) return `<div class="card-body"><p>No statement about this link had been published by ${esc(T.fmt(s.time.cursor))}, or the date is outside its range.</p><div class="chips">${stamp()}</div></div>`;
  const spoken = sel.spokenOf(dl, link), nm = ids => ids.length ? ids.map(sel.accountName).sort().join(', ') : 'none';
  const a = app.data.reg.actors[link.from], b = app.data.reg.actors[link.to], arrow = link.direction === 'from-to' ? '→' : link.direction === 'both' ? '↔' : '—';
  const line = 'Affirmed by: ' + nm(dl.affirmedBy) + ' · Acknowledged by: ' + nm(dl.acknowledgedBy) + ' · Denied by: ' + nm(dl.deniedBy) + ' · No statement from: ' + nm(dl.noStatementFrom);
  let html = `<div class="card-head"><div class="chips"><span class="chip">${arcSample(dl.state, dl.weightStep)}${esc(STR.fixed.linkChip[spoken])}</span>${stamp()}${link.theaters.map(id => `<span class="chip">${mini(id, 'solid', 8)}${esc(app.data.theatersById[id].label)}</span>`).join('')}<span class="chip">${M.catGlyph(link.category, c['text-primary'], 12)}${esc(M.CAT_NAME[link.category])}</span></div>
    <div class="statusline" role="status">${statusHtml(line)}</div></div>
    <div class="card-body"><dl class="kv"><dt>Between</dt><dd>${esc(a.name)} ${arrow} ${esc(b.name)}</dd><dt>Period</dt><dd class="mono">from ${esc(T.fmt(link.dateStartISO))}${link.dateEndISO ? ' to ' + esc(T.fmt(link.dateEndISO)) : ', ongoing'}</dd>
    <dt>Voices</dt><dd>${dl.voicesInWindow} separate ${dl.voicesInWindow === 1 ? 'voice has' : 'voices have'} affirmed it in the 180 days to ${esc(T.fmt(s.time.cursor))}${dl.weightStep === 0 ? ' (dormant)' : ''}</dd></dl>`;
  if (o.expanded) {
    html += `<p style="margin-top:var(--s2)">${esc(link.summary)}</p><h3 class="sub" style="padding-left:0">Statements by date</h3>${entriesHtml(link, s.time.cursor)}
      <div class="entry"></div><p><b>${esc(STR.fixed.linkNoRating)}</b></p><p class="note">${esc(STR.fixed.linkLegend)}</p>`;
  }
  html += '</div>';
  if (!o.floating) html += `<div class="actions">${o.expanded ? '' : `<button class="btn" data-act="card-expand">${icon('chevron', 18)}Statements (${link.entries.filter(e => e.published <= s.time.cursor).length})</button>`}
    <button class="btn" data-act="show-ends" data-id="${link.id}">Show both ends</button><button class="btn" data-act="lens-pair" data-a="${esc(WM.attribution.rootOf(link.from, app.data.reg.actors).id)}" data-b="${esc(WM.attribution.rootOf(link.to, app.data.reg.actors).id)}">Filter events to these actors</button><button class="btn" data-act="copy-link">${icon('copy', 18)}Copy link</button></div>`;
  return html;
}
function arcSample(state, step, w) {
  const c = C(), dash = M.ARC.dash(state), W = w || 28;
  return `<svg width="${W}" height="10" viewBox="0 0 ${W} 10" aria-hidden="true"><line x1="1" y1="5" x2="${W - 1}" y2="5" stroke="${c.link}" stroke-width="${M.ARC.width(step)}" stroke-opacity="${M.ARC.opacity(state, step)}" ${dash ? `stroke-dasharray="${dash.join(' ')}"` : ''} stroke-linecap="${state === 'ghost' ? 'round' : 'butt'}"/></svg>`;
}

function trackCard(t) {
  return `<div class="card-head"><div class="chips"><span class="chip">OBSERVED</span>${stamp()}<span class="chip plain">${esc(t.source)}</span><span class="chip plain mono">${esc(t.observedAt.slice(11, 16))} UTC</span></div></div>
    <div class="card-body"><dl class="kv"><dt>Position</dt><dd class="mono">${t.lat.toFixed(2)}, ${t.lng.toFixed(2)} at ${esc(t.observedAt.slice(11, 16))} UTC</dd><dt>Speed</dt><dd class="mono">${t.speedKt} kt</dd><dt>Heading</dt><dd class="mono">${String(t.heading).padStart(3, '0')}°</dd>${t.altM ? `<dt>Altitude</dt><dd class="mono">${t.altM.toLocaleString('en-US')} m</dd>` : ''}</dl>
    <p style="margin-top:var(--s2)">${esc(STR.fixed.trackNote)}</p><p class="note">A position reported by a tracking service, passed on as reported. It is not a claim and never takes the marks used for what people have said.</p></div>
    <div class="actions"><button class="btn" disabled>Follow (today only; not built)</button></div>`;
}
function groupCard(ref) {
  const s = app.store.get(), sel = app.sel, date = sel.recordDate(s);
  if (ref.kind === 'links') return `<div class="card-body"><p class="note">${ref.ids.length} links between the same two parties are drawn as one arc. Each keeps its own line.</p></div>` + ref.ids.map(id => { const l = app.data.linksById[id], dl = WM.attribution.deriveLink(l, s.time.cursor, app.data.reg, sel.cfg(s)); return `<button class="ev-row" data-act="sel-link" data-id="${id}"><span class="mk">${arcSample(dl.state, dl.weightStep, 24)}</span><span><span class="t">${esc(l.title)}</span><span class="m" style="display:block">${esc(STR.fixed.linkChip[sel.spokenOf(dl, l)])} · ${esc(M.CAT_NAME[l.category])}</span></span></button>`; }).join('');
  return `<div class="card-body"><p class="note">These events share a place on the map at this zoom. Every one of them can be opened.</p></div>` + ref.ids.map(id => rowHtml(app.data.eventsById[id], sel.stateOf(app.data.eventsById[id], date, s))).join('');
}
/* One list row for an event: its mark, its title, and its look in words (used by the Events list and choosers). */
function rowHtml(rec, st, selId, extra) {
  const th = rec.theater[0];
  return `<button class="ev-row${selId === rec.id ? ' sel' : ''}" data-act="sel-event" data-id="${rec.id}" aria-label="${esc(extra && extra.aria ? extra.aria : rec.title)}">
    <span class="mk">${st.look === 'no-account' ? '' : mini(th, st.look, st.drawTier === 'milestone' ? 16 : st.drawTier === 'major' ? 12 : 8, { halo: false })}</span>
    <span><span class="t">${esc(rec.title)}</span><span class="m" style="display:block"><span class="mono">${esc(T.fmtShort(rec.dateISO))}</span> · <b>${esc(STR.fixed.chip[st.look])}</b>${st.statusLine ? ' · ' + esc(st.statusLine) : ''}${typeof rec.lat !== 'number' ? ' · no place stated, not on the map' : ''}</span></span></button>`;
}

function title(ref) {
  const c = C();
  if (ref.type === 'event') { const rec = app.data.eventsById[ref.id], s = app.store.get(), st = app.sel.stateOf(rec, app.sel.recordDate(s), s); return { kind: 'Event', text: rec.title, mark: st.known && st.look !== 'no-account' ? mini(rec.theater[0], st.look, 12) : '' }; }
  if (ref.type === 'link') { const l = app.data.linksById[ref.id]; return { kind: 'Link', text: l.title, mark: M.catGlyph(l.category, c.link, 18) }; }
  if (ref.type === 'track') { const t = app.data.tracks.find(x => x.id === ref.id); return { kind: 'Track', text: t.name, mark: M.track(t.type, c.track, 0) }; }
  return { kind: 'Group', text: ref.ids.length + (ref.kind === 'links' ? ' links between these parties' : ' events here'), mark: '' };
}
function render(body, ref, o) {
  if (!ref) { body.innerHTML = ''; return; }
  body.classList.toggle('peek', !o.expanded);
  if (ref.type === 'event') body.innerHTML = eventCard(app.data.eventsById[ref.id], o);
  else if (ref.type === 'link') body.innerHTML = linkCard(app.data.linksById[ref.id], o);
  else if (ref.type === 'track') body.innerHTML = trackCard(app.data.tracks.find(x => x.id === ref.id));
  else body.innerHTML = groupCard(ref);
}
WM.cards = { init(a) { app = a; }, render, title, mini, chipLook, stamp, statusHtml, rowHtml, arcSample, dateText, dayNumbers };
})();
