/* WARMAPS v2 PROTOTYPE — data/sample-data.js
 *
 * PROTOTYPE SAMPLE - NOT REAL DATA.
 * Every event, statement, figure, source, link, watch item and track in this file is INVENTED to exercise the
 * design. None of it is a record of anything that happened, and no statement here was made by the party named.
 * Places are called "Site A", "City B" and so on; the coordinates only put a mark somewhere inside a theater.
 *
 * The records are shaped exactly as ARCHITECTURE_v1.md v1.3 says (sections 3, 4.1, 4.2, 4.4, 4.5, 6.2), so the
 * prototype also tests those schemas. Dates are counted back from "today" so the default 7-day window always has
 * something in it. prototype/v2/check/check.js validates this file.
 */
(function () {
'use strict';
const root = typeof window !== 'undefined' ? window : globalThis;
const WM = root.WM = root.WM || {};

WM.buildSampleData = function (todayISO) {
  const d = n => WM.time.add(todayISO, n);
  const URL = 'https://example.org/prototype-sample/';
  // one source line: role, publisher, registry id, published, kind, optional url
  const S = (role, publisher, registryId, published, kind, url) => {
    const s = { role, publisher, registryId };
    if (url) s.url = URL + url;
    s.published = published; s.kind = kind; s.access = 'read';
    return s;
  };

  /* ---- 4.4 actor registry ---------------------------------------------------------------------- */
  const actors = [
    { id: 'iran', name: 'Iran', long: 'Islamic Republic of Iran', kind: 'state', anchor: { lat: 35.69, lng: 51.39, label: 'Tehran' }, theaters: ['iran-war'] },
    { id: 'irgc', name: 'IRGC', long: 'Islamic Revolutionary Guard Corps', kind: 'armed-force', parent: 'iran', anchor: { lat: 35.69, lng: 51.39, label: 'Tehran' }, theaters: ['iran-war'] },
    { id: 'israel', name: 'Israel', long: 'State of Israel', kind: 'state', anchor: { lat: 31.78, lng: 35.22, label: 'Jerusalem' }, theaters: ['iran-war'] },
    { id: 'idf', name: 'IDF', long: 'Israel Defense Forces', kind: 'armed-force', parent: 'israel', anchor: { lat: 31.78, lng: 35.22, label: 'Jerusalem' }, theaters: ['iran-war'] },
    { id: 'usa', name: 'United States', long: 'United States of America', kind: 'state', anchor: { lat: 38.9, lng: -77.04, label: 'Washington' }, theaters: ['iran-war', 'russia-ukraine'] },
    { id: 'centcom', name: 'CENTCOM', long: 'US Central Command', kind: 'armed-force', parent: 'usa', anchor: { lat: 38.9, lng: -77.04, label: 'Washington' }, theaters: ['iran-war'] },
    { id: 'hezbollah', name: 'Hezbollah', long: 'Hezbollah', kind: 'armed-group', anchor: { lat: 33.89, lng: 35.5, label: 'Beirut' }, theaters: ['iran-war'] },
    { id: 'russia', name: 'Russia', long: 'Russian Federation', kind: 'state', anchor: { lat: 55.75, lng: 37.62, label: 'Moscow' }, theaters: ['russia-ukraine'] },
    { id: 'ukraine', name: 'Ukraine', long: 'Ukraine', kind: 'state', anchor: { lat: 50.45, lng: 30.52, label: 'Kyiv' }, theaters: ['russia-ukraine'] },
    { id: 'nato', name: 'NATO', long: 'North Atlantic Treaty Organization', kind: 'alliance', anchor: { lat: 50.85, lng: 4.35, label: 'Brussels' }, theaters: ['russia-ukraine'] },
    { id: 'north-korea', name: 'North Korea', long: "Democratic People's Republic of Korea", kind: 'state', anchor: { lat: 39.02, lng: 125.75, label: 'Pyongyang' }, theaters: ['east-asia', 'russia-ukraine'] },
    { id: 'un', name: 'United Nations', long: 'United Nations', kind: 'igo', anchor: { lat: 40.75, lng: -73.97, label: 'New York' }, theaters: ['iran-war', 'russia-ukraine'] },
    { id: 'iaea', name: 'IAEA', long: 'International Atomic Energy Agency', kind: 'igo', anchor: { lat: 48.23, lng: 16.42, label: 'Vienna' }, theaters: ['iran-war'] },
    { id: 'monitor-x', name: 'Sample Monitor Group', long: 'Sample Monitor Group (invented)', kind: 'monitor', anchor: { lat: 51.5, lng: -0.12, label: 'London' }, theaters: ['iran-war', 'russia-ukraine'] }
  ];

  /* ---- 4.5 source registry --------------------------------------------------------------------- */
  const outlets = [
    { id: 'idf-spokesperson', name: 'IDF Spokesperson (sample)', hosts: ['example.org'], country: 'IL', ownership: 'state', actor: 'israel', status: 'active' },
    { id: 'state-tv-ir', name: 'Sample State TV (Iran)', hosts: ['example.org'], country: 'IR', ownership: 'state', actor: 'iran', status: 'active' },
    { id: 'party-channel-hz', name: 'Sample Party Channel (Hezbollah)', hosts: ['example.org'], country: 'LB', ownership: 'party', actor: 'hezbollah', status: 'active' },
    { id: 'state-agency-ru', name: 'Sample State Agency (Russia)', hosts: ['example.org'], country: 'RU', ownership: 'state', actor: 'russia', status: 'active' },
    { id: 'kyiv-daily', name: 'Sample Kyiv Daily', hosts: ['example.org'], country: 'UA', ownership: 'independent', covers: ['ukraine'], status: 'active' },
    { id: 'wire-one', name: 'Sample Wire One', hosts: ['example.org'], country: 'GB', ownership: 'independent', status: 'active' },
    { id: 'wire-two', name: 'Sample Wire Two', hosts: ['example.org'], country: 'FR', ownership: 'independent', status: 'active' },
    { id: 'exile-tv', name: 'Sample Exile TV', hosts: ['example.org'], country: 'GB', ownership: 'exile', covers: ['iran'], status: 'active' },
    { id: 'rights-watch', name: 'Sample Rights Watch', hosts: ['example.org'], country: 'CH', ownership: 'advocacy', status: 'active' },
    { id: 'imagery-co', name: 'Sample Imagery Co', hosts: ['example.org'], country: 'US', ownership: 'independent', status: 'active' },
    { id: 'blocked-daily', name: 'Sample Blocked Daily', hosts: ['example.org'], country: 'IR', ownership: 'state', actor: 'iran', status: 'blocked' }
  ];

  /* ---- 6.2 theater configs --------------------------------------------------------------------- */
  const theaters = [
    { id: 'iran-war', prefix: 'IR', label: 'Iran war', labelLong: 'US + Israel vs Iran and the wider war', epochISO: '2026-02-28', dayLabel: 'Day',
      status: 'full', aoi: { bbox: [29.0, 10.0, 66.0, 40.0], chokepoints: ['hormuz', 'gulf-of-oman', 'bab-el-mandeb', 'red-sea'] },
      view2d: { center: [31.5, 47.5], zoom: 5 }, view3d: { lat: 30.0, lng: 48.0, heightKm: 6000 },
      timeline: { axisFrom: '2026-01-29', bands: [{ from: '2026-01-29', to: null, unit: 'day' }] } },
    { id: 'russia-ukraine', prefix: 'RU', label: 'Russia-Ukraine', labelLong: 'Russia vs Ukraine', epochISO: '2022-02-24', dayLabel: 'Day',
      status: 'lean', aoi: { bbox: [21.0, 43.0, 42.0, 56.5], chokepoints: ['black-sea', 'kerch', 'baltic-approaches'] },
      view2d: { center: [49.0, 33.0], zoom: 5 }, view3d: { lat: 49.0, lng: 33.0, heightKm: 4000 },
      timeline: { axisFrom: '2022-02-24', bands: [
        { from: '2022-02-24', to: '2024-12-31', unit: 'month' },
        { from: '2025-01-01', to: '2026-02-27', unit: 'week' },
        { from: '2026-02-28', to: null, unit: 'day' }] } },
    { id: 'east-asia', prefix: 'EA', label: 'East Asia', labelLong: 'East Asia', status: 'intake-only',
      aoi: { bbox: [115.0, 18.0, 146.0, 45.0], chokepoints: ['taiwan-strait', 'korea-strait'] },
      view2d: { center: [32.0, 128.0], zoom: 4 }, view3d: { lat: 32.0, lng: 128.0, heightKm: 6000 } },
    { id: 'caribbean', prefix: 'CB', label: 'Caribbean', labelLong: 'Caribbean', status: 'intake-only',
      aoi: { bbox: [-90.0, 8.0, -58.0, 27.0], chokepoints: ['windward-passage', 'venezuela-coast'] },
      view2d: { center: [17.5, -74.0], zoom: 4 }, view3d: { lat: 17.5, lng: -74.0, heightKm: 6000 } }
  ];

  /* ---- section 3: event records ---------------------------------------------------------------- */
  const events = [
    /* 1. Ghost that solidifies and moves into position: the worked example of ARCHITECTURE 3.1. */
    { id: 'IR-90001', theater: ['iran-war'], dateISO: d(-5), datePrecision: 'day', timeNote: 'Overnight', kind: 'strike',
      title: 'Sample: strike reported at Site A', place: 'Site A', country: 'Iran', lat: 32.65, lng: 51.68, geoPrecision: 'site',
      actors: { by: ['idf'], against: ['irgc'] }, tier: 'major',
      entries: [
        { n: 1, claimedBy: { actor: 'idf' }, stance: 'claims', published: d(-5),
          text: 'Says it struck a storage site in Province A overnight. (sample)', attributesTo: ['idf'],
          locations: [{ place: 'Province A', lat: 33.55, lng: 52.45, precision: 'region' }],
          figures: [{ what: 'sites-hit', value: 1 }],
          sources: [S('original', 'IDF Spokesperson (sample)', 'idf-spokesperson', d(-5), 'official-statement', 'ir-90001-1'),
                    S('carrier', 'Sample Wire One', 'wire-one', d(-5), 'wire'), S('carrier', 'Sample Wire Two', 'wire-two', d(-5), 'wire')] },
        { n: 2, claimedBy: { outlet: 'state-tv-ir' }, stance: 'acknowledges', published: d(-4), respondsTo: [1],
          text: 'Reports explosions at Site A; gives no cause. (sample)',
          locations: [{ place: 'Site A', lat: 32.65, lng: 51.68, precision: 'site' }],
          sources: [S('original', 'Sample State TV (Iran)', 'state-tv-ir', d(-4), 'report', 'ir-90001-2')] },
        { n: 3, claimedBy: { actor: 'irgc' }, stance: 'denies', scope: ['damage'], published: d(-4), respondsTo: [1],
          text: 'Says no equipment was damaged. (sample)',
          sources: [S('carrier', 'Sample State TV (Iran)', 'state-tv-ir', d(-4), 'report')] }
      ],
      checks: [{ step: 1, dateISO: d(-4), searched: ['state-tv-ir'], found: [2, 3] }],
      recordCheck: { status: 'checked', pass: 'intake-review', date: d(-4) }, detail: {}, rev: 3 },

    /* 2. One side only (ghost). Rated major, drawn at standard size until another side speaks (ruling 2). */
    { id: 'IR-90002', theater: ['iran-war'], dateISO: d(-2), datePrecision: 'day', kind: 'strike',
      title: 'Sample: drone launch reported toward Area B', place: 'Area B', country: 'Israel', lat: 32.75, lng: 35.4, geoPrecision: 'region',
      actors: { by: ['irgc'], against: ['israel'] }, tier: 'major',
      entries: [
        { n: 1, claimedBy: { actor: 'irgc' }, stance: 'claims', published: d(-2),
          text: 'Says it launched drones at targets in Area B. (sample)', attributesTo: ['irgc'],
          locations: [{ place: 'Area B', lat: 32.75, lng: 35.4, precision: 'region' }],
          figures: [{ what: 'projectiles-launched', value: 12, qualifier: 'about' }],
          sources: [S('original', 'Sample State TV (Iran)', 'state-tv-ir', d(-2), 'official-statement', 'ir-90002-1')] }
      ],
      checks: [{ step: 1, dateISO: d(-1), searched: ['idf-spokesperson'], found: [] }],
      recordCheck: { status: 'checked', pass: 'intake-review', date: d(-1) }, detail: {}, rev: 1 },

    /* 3. Claimed and denied (split). The denial comes from party media, so the side is on record through it. */
    { id: 'IR-90003', theater: ['iran-war'], dateISO: d(-3), datePrecision: 'day', kind: 'strike',
      title: 'Sample: strike reported on Port C', place: 'Port C', country: 'Lebanon', lat: 33.27, lng: 35.2, geoPrecision: 'site',
      actors: { by: ['idf'], against: ['hezbollah'] }, tier: 'major',
      entries: [
        { n: 1, claimedBy: { actor: 'idf' }, stance: 'claims', published: d(-3),
          text: 'Says it struck a weapons store at Port C. (sample)', attributesTo: ['idf'],
          locations: [{ place: 'Port C', lat: 33.27, lng: 35.2, precision: 'site' }],
          sources: [S('original', 'IDF Spokesperson (sample)', 'idf-spokesperson', d(-3), 'official-statement', 'ir-90003-1')] },
        { n: 2, claimedBy: { outlet: 'party-channel-hz' }, stance: 'denies', published: d(-2), respondsTo: [1],
          text: 'Reports that no strike took place at Port C. (sample)',
          sources: [S('original', 'Sample Party Channel (Hezbollah)', 'party-channel-hz', d(-2), 'report', 'ir-90003-2')] }
      ],
      checks: [{ step: 1, dateISO: d(-2), searched: ['party-channel-hz'], found: [2] }],
      recordCheck: { status: 'checked', pass: 'intake-review', date: d(-2) }, detail: {}, rev: 2 },

    /* 4. Two sides agree it happened and name different places: the marker stays at the first claim, the other
          place appears on tap; in Compare the two halves sit at the two places. */
    { id: 'IR-90004', theater: ['iran-war'], dateISO: d(-6), datePrecision: 'day', kind: 'strike',
      title: 'Sample: missile impact reported at Base D', place: 'Base D', country: 'Israel', lat: 31.2, lng: 34.8, geoPrecision: 'site',
      actors: { by: ['irgc'], against: ['idf'] }, tier: 'major',
      entries: [
        { n: 1, claimedBy: { actor: 'irgc' }, stance: 'claims', published: d(-6),
          text: 'Says its missiles hit Base D. (sample)', attributesTo: ['irgc'],
          locations: [{ place: 'Base D', lat: 31.2, lng: 34.8, precision: 'site' }],
          figures: [{ what: 'projectiles-launched', value: 8 }],
          sources: [S('original', 'Sample State TV (Iran)', 'state-tv-ir', d(-6), 'official-statement', 'ir-90004-1')] },
        { n: 2, claimedBy: { actor: 'idf' }, stance: 'acknowledges', published: d(-5), respondsTo: [1],
          text: 'Says one missile fell on open ground near Town E; the rest were intercepted. (sample)',
          locations: [{ place: 'open ground near Town E', lat: 31.62, lng: 35.12, precision: 'site' }],
          figures: [{ what: 'projectiles-launched', value: 6 }, { what: 'projectiles-intercepted', value: 5 }],
          sources: [S('original', 'IDF Spokesperson (sample)', 'idf-spokesperson', d(-5), 'official-statement', 'ir-90004-2')] },
        { n: 3, claimedBy: { actor: 'idf' }, stance: 'denies', scope: ['target', 'damage'], published: d(-5), respondsTo: [1],
          text: 'Denies that Base D was hit or damaged. (sample)',
          sources: [S('original', 'IDF Spokesperson (sample)', 'idf-spokesperson', d(-5), 'official-statement', 'ir-90004-2')] }
      ],
      checks: [{ step: 1, dateISO: d(-5), searched: ['idf-spokesperson'], found: [2, 3] }],
      recordCheck: { status: 'checked', pass: 'intake-review', date: d(-5) }, detail: {}, rev: 2 },

    /* 5. One statement naming several targets: one record; the further targets are ticks while it is open. */
    { id: 'IR-90005', theater: ['iran-war'], dateISO: d(-1), datePrecision: 'day', kind: 'strike',
      title: 'Sample: statement names five sites struck', place: 'Site F1', country: 'Iran', lat: 27.2, lng: 56.3, geoPrecision: 'site',
      actors: { by: ['centcom'], against: ['irgc'] }, tier: 'major',
      entries: [
        { n: 1, claimedBy: { actor: 'centcom' }, stance: 'claims', published: d(-1),
          text: 'Says it struck five launch sites along the coast. (sample)', attributesTo: ['centcom'],
          locations: [
            { place: 'Site F1', lat: 27.2, lng: 56.3, precision: 'site' }, { place: 'Site F2', lat: 26.6, lng: 54.9, precision: 'site' },
            { place: 'Site F3', lat: 27.9, lng: 52.6, precision: 'site' }, { place: 'Site F4', lat: 25.9, lng: 57.6, precision: 'site' },
            { place: 'Site F5', lat: 28.9, lng: 50.9, precision: 'site' }],
          figures: [{ what: 'sites-hit', value: 5 }],
          sources: [S('original', 'CENTCOM release (sample)', undefined, d(-1), 'official-statement', 'ir-90005-1'), S('carrier', 'Sample Wire Two', 'wire-two', d(-1), 'wire')] }
      ],
      recordCheck: { status: 'checked', pass: 'intake-review', date: d(-1) }, detail: {}, rev: 1 },

    /* 6. Still one side after the last look-again check (faded ghost). */
    { id: 'IR-90006', theater: ['iran-war'], dateISO: d(-40), datePrecision: 'day', kind: 'strike',
      title: 'Sample: explosion reported at Depot G', place: 'Depot G', country: 'Iran', lat: 34.3, lng: 47.1, geoPrecision: 'site',
      actors: { by: ['idf'], against: ['irgc'] }, tier: 'major',
      entries: [
        { n: 1, claimedBy: { actor: 'idf' }, stance: 'claims', published: d(-40),
          text: 'Says it destroyed a depot at Depot G. (sample)', attributesTo: ['idf'],
          locations: [{ place: 'Depot G', lat: 34.3, lng: 47.1, precision: 'site' }],
          sources: [S('original', 'IDF Spokesperson (sample)', 'idf-spokesperson', d(-40), 'official-statement', 'ir-90006-1')] }
      ],
      checks: [
        { step: 1, dateISO: d(-39), searched: ['state-tv-ir'], found: [] },
        { step: 3, dateISO: d(-37), searched: ['state-tv-ir'], found: [] },
        { step: 7, dateISO: d(-33), searched: ['state-tv-ir', 'blocked-daily'], blocked: ['blocked-daily'], found: [] },
        { step: 30, dateISO: d(-10), searched: ['state-tv-ir'], found: [] }],
      coverageGaps: [{ publisher: 'Sample Blocked Daily', reason: 'blocked', date: d(-33) }],
      recordCheck: { status: 'checked', pass: 'intake-review', date: d(-39) }, detail: {}, rev: 5 },

    /* 7. Who did it is disputed (split by attribution). */
    { id: 'IR-90007', theater: ['iran-war'], dateISO: d(-3), datePrecision: 'day', kind: 'shipping',
      title: 'Sample: tanker damage reported in the strait', place: 'Strait (representative point)', country: 'International waters',
      lat: 26.45, lng: 56.45, geoPrecision: 'representative',
      actors: { by: ['irgc'], against: ['usa'] }, tier: 'standard',
      entries: [
        { n: 1, claimedBy: { actor: 'centcom' }, stance: 'claims', published: d(-3),
          text: 'Says Iranian forces damaged a tanker in the strait. (sample)', attributesTo: ['irgc'],
          locations: [{ place: 'Strait (representative point)', lat: 26.45, lng: 56.45, precision: 'representative' }],
          figures: [{ what: 'vessels-hit', value: 1 }],
          sources: [S('original', 'CENTCOM release (sample)', undefined, d(-3), 'official-statement', 'ir-90007-1')] },
        { n: 2, claimedBy: { actor: 'iran' }, stance: 'denies', scope: ['attribution'], published: d(-2), respondsTo: [1],
          text: 'Says its forces were not involved. (sample)',
          sources: [S('original', 'Sample State TV (Iran)', 'state-tv-ir', d(-2), 'official-statement', 'ir-90007-2')] }
      ],
      recordCheck: { status: 'checked', pass: 'intake-review', date: d(-2) }, detail: {}, rev: 2 },

    /* 8. Claim taken back by its own claimant: listed with "No account in force", not drawn. */
    { id: 'IR-90008', theater: ['iran-war'], dateISO: d(-6), datePrecision: 'day', kind: 'air-defense',
      title: 'Sample: aircraft loss reported near Ridge H', place: 'Ridge H', country: 'Lebanon', lat: 33.6, lng: 35.85, geoPrecision: 'site',
      actors: { by: ['hezbollah'], against: ['idf'] }, tier: 'standard',
      entries: [
        { n: 1, claimedBy: { actor: 'hezbollah' }, stance: 'claims', published: d(-6),
          text: 'Says it brought down an aircraft near Ridge H. (sample)', attributesTo: ['hezbollah'],
          locations: [{ place: 'Ridge H', lat: 33.6, lng: 35.85, precision: 'site' }],
          figures: [{ what: 'aircraft-lost', value: 1 }],
          sources: [S('original', 'Sample Party Channel (Hezbollah)', 'party-channel-hz', d(-6), 'official-statement', 'ir-90008-1')] },
        { n: 2, claimedBy: { actor: 'hezbollah' }, stance: 'withdraws', published: d(-4), supersedes: 1,
          text: 'Withdraws the earlier statement. (sample)',
          sources: [S('original', 'Sample Party Channel (Hezbollah)', 'party-channel-hz', d(-4), 'official-statement', 'ir-90008-2')] }
      ],
      recordCheck: { status: 'checked', pass: 'intake-review', date: d(-4) }, detail: {}, rev: 2 },

    /* 9. Sides agree; one side revises its figure (the old entry stays, struck through); figures differ. */
    { id: 'IR-90009', theater: ['iran-war'], dateISO: d(-6), datePrecision: 'day', kind: 'strike',
      title: 'Sample: strike reported on Compound J', place: 'Compound J', country: 'Lebanon', lat: 33.85, lng: 35.55, geoPrecision: 'site',
      actors: { by: ['idf'], against: ['hezbollah'] }, tier: 'standard',
      entries: [
        { n: 1, claimedBy: { actor: 'idf' }, stance: 'claims', published: d(-6),
          text: 'Says it struck Compound J. (sample)', attributesTo: ['idf'],
          locations: [{ place: 'Compound J', lat: 33.85, lng: 35.55, precision: 'site' }],
          figures: [{ what: 'killed', value: 4, scope: 'fighters' }],
          sources: [S('original', 'IDF Spokesperson (sample)', 'idf-spokesperson', d(-6), 'official-statement', 'ir-90009-1')] },
        { n: 2, claimedBy: { actor: 'hezbollah' }, stance: 'acknowledges', published: d(-5), respondsTo: [1],
          text: 'Says two of its members were killed at Compound J. (sample)',
          figures: [{ what: 'killed', value: 2, scope: 'fighters' }],
          sources: [S('original', 'Sample Party Channel (Hezbollah)', 'party-channel-hz', d(-5), 'official-statement', 'ir-90009-2')] },
        { n: 3, claimedBy: { actor: 'hezbollah' }, stance: 'acknowledges', published: d(-3), respondsTo: [1], supersedes: 2,
          text: 'Revises its figure: five members killed at Compound J. (sample)',
          figures: [{ what: 'killed', value: 5, scope: 'fighters' }],
          sources: [S('original', 'Sample Party Channel (Hezbollah)', 'party-channel-hz', d(-3), 'official-statement', 'ir-90009-3')] }
      ],
      checks: [{ step: 1, dateISO: d(-5), searched: ['party-channel-hz'], found: [2] }],
      recordCheck: { status: 'checked', pass: 'intake-review', date: d(-3) }, detail: {}, rev: 3 },

    /* 10. One side through its state media, plus observers: still a ghost, because the other end is missing. */
    { id: 'IR-90010', theater: ['iran-war'], dateISO: d(-1), datePrecision: 'day', kind: 'infrastructure',
      title: 'Sample: damage reported at Water Plant K', place: 'Water Plant K', country: 'Iran', lat: 30.35, lng: 48.25, geoPrecision: 'site',
      actors: { by: ['israel'], against: ['iran'] }, tier: 'standard',
      entries: [
        { n: 1, claimedBy: { outlet: 'state-tv-ir' }, stance: 'claims', published: d(-1),
          text: 'Reports damage at Water Plant K and attributes it to an Israeli strike. (sample)', attributesTo: ['israel'],
          locations: [{ place: 'Water Plant K', lat: 30.35, lng: 48.25, precision: 'site' }],
          sources: [S('original', 'Sample State TV (Iran)', 'state-tv-ir', d(-1), 'report', 'ir-90010-1')] },
        { n: 2, claimedBy: { actor: 'un' }, stance: 'acknowledges', published: d(0), respondsTo: [1],
          text: 'Says the plant is out of service; does not say why. (sample)',
          sources: [S('original', 'UN office statement (sample)', undefined, d(0), 'official-statement', 'ir-90010-2')] },
        { n: 3, claimedBy: { outlet: 'imagery-co' }, stance: 'claims', published: d(0),
          text: 'Publishes an image of the site taken after the reported date. (sample)',
          media: [{ kind: 'satellite-image', publisher: 'Sample Imagery Co', registryId: 'imagery-co', url: URL + 'ir-90010-image' }],
          sources: [S('original', 'Sample Imagery Co', 'imagery-co', d(0), 'osint', 'ir-90010-3')] }
      ],
      recordCheck: { status: 'checked', pass: 'intake-review', date: d(0) }, detail: {}, rev: 2 },

    /* 11. An outlet citing an unnamed official: that does not put the official's side on record. */
    { id: 'IR-90011', theater: ['iran-war'], dateISO: d(-2), datePrecision: 'day', kind: 'strike',
      title: 'Sample: strike reported at Site L', place: 'Site L', country: 'Iran', lat: 36.3, lng: 59.55, geoPrecision: 'city',
      actors: { by: ['usa'], against: ['irgc'] }, tier: 'standard',
      entries: [
        { n: 1, claimedBy: { outlet: 'wire-one' }, citing: 'an unnamed US official', stance: 'claims', published: d(-2),
          text: 'Reports a US strike on Site L, citing an unnamed US official. (sample)', attributesTo: ['usa'],
          locations: [{ place: 'Site L', lat: 36.3, lng: 59.55, precision: 'city' }],
          sources: [S('original', 'Sample Wire One', 'wire-one', d(-2), 'wire', 'ir-90011-1')] }
      ],
      recordCheck: { status: 'checked', pass: 'intake-review', date: d(-2) }, detail: {}, rev: 1 },

    /* 12. A claim with no stated place: listed, never mapped. */
    { id: 'IR-90012', theater: ['iran-war'], dateISO: d(-3), datePrecision: 'day', kind: 'cyber',
      title: 'Sample: network intrusion claimed', place: 'No place stated', country: 'Not stated',
      actors: { by: ['iran'], against: ['israel'] }, tier: 'standard',
      entries: [
        { n: 1, claimedBy: { actor: 'iran' }, stance: 'claims', published: d(-3),
          text: 'Says it disrupted a logistics network. Names no place. (sample)', attributesTo: ['iran'],
          sources: [S('original', 'Sample State TV (Iran)', 'state-tv-ir', d(-3), 'official-statement', 'ir-90012-1')] }
      ],
      recordCheck: { status: 'checked', pass: 'intake-review', date: d(-3) }, detail: {}, rev: 1 },

    /* 13. A statement: the happening is the statement itself, so with its speaker on record it is solid. */
    { id: 'IR-90013', theater: ['iran-war'], dateISO: d(-2), datePrecision: 'day', kind: 'statement',
      title: 'Sample: readiness statement issued in City M', place: 'City M', country: 'Iran', lat: 35.7, lng: 51.4, geoPrecision: 'city',
      actors: { by: ['iran'], against: [] }, tier: 'standard',
      entries: [
        { n: 1, claimedBy: { actor: 'iran' }, stance: 'claims', published: d(-2),
          text: 'Says its forces will be at full readiness within weeks. (sample)',
          locations: [{ place: 'City M', lat: 35.7, lng: 51.4, precision: 'city' }],
          sources: [S('original', 'Sample State TV (Iran)', 'state-tv-ir', d(-2), 'official-statement', 'ir-90013-1')] }
      ],
      recordCheck: { status: 'checked', pass: 'intake-review', date: d(-2) }, detail: {}, rev: 1 },

    /* 14. A milestone more than one side has spoken on: full size, halo, label. */
    { id: 'IR-90014', theater: ['iran-war'], dateISO: d(-20), datePrecision: 'day', kind: 'strike',
      title: 'Sample milestone: large strike reported on Facility N', place: 'Facility N', country: 'Iran', lat: 33.72, lng: 51.73, geoPrecision: 'site',
      actors: { by: ['idf'], against: ['iran'] }, tier: 'milestone', significance: 'strategic',
      entries: [
        { n: 1, claimedBy: { actor: 'idf' }, stance: 'claims', published: d(-20),
          text: 'Says it struck Facility N. (sample)', attributesTo: ['idf'],
          locations: [{ place: 'Facility N', lat: 33.72, lng: 51.73, precision: 'site' }],
          sources: [S('original', 'IDF Spokesperson (sample)', 'idf-spokesperson', d(-20), 'official-statement', 'ir-90014-1')] },
        { n: 2, claimedBy: { actor: 'iran' }, stance: 'acknowledges', published: d(-19), respondsTo: [1],
          text: 'Says Facility N was attacked and that damage is limited. (sample)',
          locations: [{ place: 'Facility N', lat: 33.72, lng: 51.73, precision: 'site' }],
          sources: [S('original', 'Sample State TV (Iran)', 'state-tv-ir', d(-19), 'official-statement', 'ir-90014-2')] },
        { n: 3, claimedBy: { actor: 'iaea' }, stance: 'acknowledges', published: d(-18), respondsTo: [1],
          text: 'Says it was told of an attack on Facility N. (sample)',
          sources: [S('original', 'IAEA statement (sample)', undefined, d(-18), 'official-statement', 'ir-90014-3')] }
      ],
      checks: [{ step: 1, dateISO: d(-19), searched: ['state-tv-ir'], found: [2] }],
      recordCheck: { status: 'checked', pass: 'intake-review', date: d(-18) }, detail: {}, rev: 3 },

    /* 15. A milestone only one side has spoken on: standard size, no halo, no label (decision item d1). */
    { id: 'IR-90015', theater: ['iran-war'], dateISO: d(-4), datePrecision: 'day', kind: 'naval',
      title: 'Sample milestone: naval strike claimed in the Gulf', place: 'Gulf (representative point)', country: 'International waters',
      lat: 25.3, lng: 53.2, geoPrecision: 'representative',
      actors: { by: ['irgc'], against: ['usa'] }, tier: 'milestone', significance: 'escalatory',
      entries: [
        { n: 1, claimedBy: { actor: 'irgc' }, stance: 'claims', published: d(-4),
          text: 'Says it struck a warship in the Gulf. (sample)', attributesTo: ['irgc'],
          locations: [{ place: 'Gulf (representative point)', lat: 25.3, lng: 53.2, precision: 'representative' }],
          figures: [{ what: 'vessels-hit', value: 1 }],
          sources: [S('original', 'Sample State TV (Iran)', 'state-tv-ir', d(-4), 'official-statement', 'ir-90015-1')] }
      ],
      checks: [{ step: 1, dateISO: d(-3), searched: [], found: [] }, { step: 3, dateISO: d(-1), searched: [], found: [] }],
      recordCheck: { status: 'checked', pass: 'intake-review', date: d(-3) }, detail: {}, rev: 1 },

    /* 16. An event that belongs to two theaters, claimed and denied. */
    { id: 'IR-90016', theater: ['iran-war', 'russia-ukraine'], dateISO: d(-12), datePrecision: 'day', kind: 'shipping',
      title: 'Sample: cargo transfer reported at Port P', place: 'Port P', country: 'Iran', lat: 37.47, lng: 49.46, geoPrecision: 'site',
      actors: { by: ['iran'], against: [] }, tier: 'standard',
      entries: [
        { n: 1, claimedBy: { actor: 'ukraine' }, stance: 'claims', published: d(-12),
          text: 'Says a shipment of drone parts left Port P for Russia. (sample)', attributesTo: ['iran'],
          locations: [{ place: 'Port P', lat: 37.47, lng: 49.46, precision: 'site' }],
          sources: [S('original', 'Ukraine government statement (sample)', undefined, d(-12), 'official-statement', 'ir-90016-1')] },
        { n: 2, claimedBy: { actor: 'iran' }, stance: 'denies', published: d(-11), respondsTo: [1],
          text: 'Denies that any such shipment took place. (sample)',
          sources: [S('original', 'Sample State TV (Iran)', 'state-tv-ir', d(-11), 'official-statement', 'ir-90016-2')] }
      ],
      recordCheck: { status: 'checked', pass: 'intake-review', date: d(-11) }, detail: {}, rev: 2 },

    /* 17. An ongoing event: visible in every window after its start. */
    { id: 'IR-90017', theater: ['iran-war'], dateISO: d(-15), datePrecision: 'ongoing-from', kind: 'political',
      title: 'Sample: airspace closure announced over Region Q', place: 'Region Q', country: 'Iran', lat: 29.6, lng: 52.55, geoPrecision: 'region',
      actors: { by: ['iran'], against: [] }, tier: 'standard',
      entries: [
        { n: 1, claimedBy: { actor: 'iran' }, stance: 'claims', published: d(-15),
          text: 'Says the airspace over Region Q is closed until further notice. (sample)',
          locations: [{ place: 'Region Q', lat: 29.6, lng: 52.55, precision: 'region' }],
          sources: [S('original', 'Sample State TV (Iran)', 'state-tv-ir', d(-15), 'official-statement', 'ir-90017-1')] }
      ],
      recordCheck: { status: 'checked', pass: 'intake-review', date: d(-15) }, detail: {}, rev: 1 },

    /* 18. Exile media only: listed as an observer; it never stands in for a side (charter rule 2). */
    { id: 'IR-90018', theater: ['iran-war'], dateISO: d(-2), datePrecision: 'day', kind: 'political',
      title: 'Sample: unrest reported in City R', place: 'City R', country: 'Iran', lat: 38.07, lng: 46.3, geoPrecision: 'city',
      actors: { by: [], against: ['iran'] }, tier: 'standard',
      entries: [
        { n: 1, claimedBy: { outlet: 'exile-tv' }, stance: 'claims', published: d(-2),
          text: 'Reports street protests in City R. (sample)',
          locations: [{ place: 'City R', lat: 38.07, lng: 46.3, precision: 'city' }],
          sources: [S('original', 'Sample Exile TV', 'exile-tv', d(-2), 'report', 'ir-90018-1')] }
      ],
      recordCheck: { status: 'checked', pass: 'intake-review', date: d(-2) }, detail: {}, rev: 1 },

    /* 19. Evidence for a combat tripwire: one side only. */
    { id: 'IR-90019', theater: ['iran-war', 'russia-ukraine'], dateISO: d(-2), datePrecision: 'day', kind: 'interception',
      title: 'Sample: aircraft intercept reported over Area S', place: 'Area S', country: 'Syria', lat: 35.0, lng: 38.5, geoPrecision: 'region',
      actors: { by: ['russia'], against: ['usa'] }, tier: 'major',
      entries: [
        { n: 1, claimedBy: { actor: 'centcom' }, stance: 'claims', published: d(-2),
          text: 'Says a Russian aircraft fired on one of its drones over Area S. (sample)', attributesTo: ['russia'],
          locations: [{ place: 'Area S', lat: 35.0, lng: 38.5, precision: 'region' }],
          sources: [S('original', 'CENTCOM release (sample)', undefined, d(-2), 'official-statement', 'ir-90019-1')] }
      ],
      recordCheck: { status: 'checked', pass: 'intake-review', date: d(-2) }, detail: {}, rev: 1 },

    /* 20. A statement with no place (cited by a rhetoric item). */
    { id: 'IR-90020', theater: ['iran-war'], dateISO: d(-3), datePrecision: 'day', kind: 'statement',
      title: 'Sample: statement on enrichment levels', place: 'No place stated', country: 'Not stated',
      actors: { by: ['iran'], against: [] }, tier: 'standard',
      entries: [
        { n: 1, claimedBy: { actor: 'iran' }, stance: 'claims', published: d(-3),
          text: 'Says it may raise enrichment levels. (sample)',
          sources: [S('original', 'Sample State TV (Iran)', 'state-tv-ir', d(-3), 'official-statement', 'ir-90020-1')] }
      ],
      recordCheck: { status: 'checked', pass: 'intake-review', date: d(-3) }, detail: {}, rev: 1 },

    /* 21-23. Three one-sided claims close together: at theater zoom they form a group whose badge is outlined. */
    ...[['IR-90021', 'Site T1', 27.15, 60.1, -1], ['IR-90022', 'Site T2', 27.4, 60.45, -2], ['IR-90023', 'Site T3', 26.95, 60.5, -4]].map(([id, place, lat, lng, off]) => ({
      id, theater: ['iran-war'], dateISO: d(off), datePrecision: 'day', kind: 'strike',
      title: 'Sample: strike reported at ' + place, place, country: 'Iran', lat, lng, geoPrecision: 'site',
      actors: { by: ['centcom'], against: ['irgc'] }, tier: 'standard',
      entries: [
        { n: 1, claimedBy: { actor: 'centcom' }, stance: 'claims', published: d(off),
          text: 'Says it struck a radar position at ' + place + '. (sample)', attributesTo: ['centcom'],
          locations: [{ place, lat, lng, precision: 'site' }],
          sources: [S('original', 'CENTCOM release (sample)', undefined, d(off), 'official-statement', id.toLowerCase() + '-1')] }
      ],
      recordCheck: { status: 'checked', pass: 'intake-review', date: d(off) }, detail: {}, rev: 1 })),

    /* Records "carried over from v1": the shape the migration writes (ARCHITECTURE 7.1). No claimant is recorded,
       so no side can be named. Three carry a v1 fog note. Decision 6 is about how these should look. */
    ...[
      ['IR-90101', 9101, 'City U — sample carried-over event 1', 'City U', 35.55, 50.9, -1, 'iran', false],
      ['IR-90102', 9102, 'City U — sample carried-over event 2', 'City U', 35.8, 51.05, -2, 'us', true],
      ['IR-90103', 9103, 'City V — sample carried-over event 3', 'City V', 35.35, 51.6, -3, 'isr', false],
      ['IR-90104', 9104, 'City W — sample carried-over event 4', 'City W', 29.1, 50.85, -4, 'joint', false],
      ['IR-90105', 9105, 'City X — sample carried-over event 5', 'City X', 31.3, 48.7, -5, 'iran', true],
      ['IR-90106', 9106, 'City Y — sample carried-over event 6', 'City Y', 34.65, 50.9, -9, 'us', false],
      ['IR-90107', 9107, 'City Z — sample carried-over event 7', 'City Z', 32.4, 48.4, -16, 'joint', true],
      ['IR-90108', 9108, 'City Z — sample carried-over event 8', 'City Z', 32.2, 48.25, -25, 'isr', false]
    ].map(([id, legacyId, title, place, lat, lng, off, legacyType, fog]) => ({
      id, legacyId, theater: ['iran-war'], dateISO: d(off), datePrecision: 'day', kind: 'strike', legacyType,
      title, place, country: 'Iran', lat, lng, geoPrecision: 'unknown',
      actors: { by: [], against: [] }, attackerText: 'Sample attacker text carried over from v1',
      needs: ['kind', 'title', 'actors', 'claimant', 'published'],
      entries: [{ n: 1, stance: 'claims', published: d(off), sources: [{ publisher: 'Sample outlet named in v1' }] }],
      sourcesStatus: 'named-only', recordCheck: { status: 'none' },
      detail: { structuralDmg: 'Sample v1 damage text.', humanCasualties: 'Sample v1 casualty text.' },
      legacy: Object.assign({ time: 'Sample v1 time text' }, fog ? { fog: { note: 'Sample v1 fog note: accounts of this event differed.', checkpoint: d(off + 7) } } : {}),
      rev: 1 })),

    /* ---- Russia-Ukraine: lean history (month and week precision), then daily --------------------- */
    { id: 'RU-90001', theater: ['russia-ukraine'], dateISO: '2023-03-01', dateEndISO: '2023-03-31', datePrecision: 'month', kind: 'ground',
      title: 'Sample milestone: front-line change reported near City AA', place: 'City AA', country: 'Ukraine', lat: 49.6, lng: 37.3, geoPrecision: 'city',
      actors: { by: ['ukraine'], against: ['russia'] }, tier: 'milestone', significance: 'tactical-pivot',
      entries: [
        { n: 1, claimedBy: { actor: 'ukraine' }, stance: 'claims', published: '2023-03-14',
          text: 'Says its forces advanced near City AA. (sample)', attributesTo: ['ukraine'],
          locations: [{ place: 'City AA', lat: 49.6, lng: 37.3, precision: 'city' }],
          sources: [S('original', 'Ukraine government statement (sample)', undefined, '2023-03-14', 'official-statement', 'ru-90001-1')] },
        { n: 2, claimedBy: { actor: 'russia' }, stance: 'acknowledges', published: '2023-03-22', respondsTo: [1],
          text: 'Says its units regrouped to new lines near City AA. (sample)',
          sources: [S('original', 'Sample State Agency (Russia)', 'state-agency-ru', '2023-03-22', 'official-statement', 'ru-90001-2')] }
      ],
      recordCheck: { status: 'checked', pass: 'intake-review', date: '2023-03-22' }, detail: {}, rev: 2 },
    { id: 'RU-90002', theater: ['russia-ukraine'], dateISO: '2024-06-01', dateEndISO: '2024-06-30', datePrecision: 'month', kind: 'energy',
      title: 'Sample milestone: power-grid strikes reported', place: 'Region BB', country: 'Ukraine', lat: 49.0, lng: 32.0, geoPrecision: 'region',
      actors: { by: ['russia'], against: ['ukraine'] }, tier: 'milestone', significance: 'infrastructure',
      entries: [
        { n: 1, claimedBy: { actor: 'ukraine' }, stance: 'claims', published: '2024-06-09',
          text: 'Says a series of strikes cut power in Region BB. (sample)', attributesTo: ['russia'],
          locations: [{ place: 'Region BB', lat: 49.0, lng: 32.0, precision: 'region' }],
          sources: [S('original', 'Ukraine government statement (sample)', undefined, '2024-06-09', 'official-statement', 'ru-90002-1')] }
      ],
      checks: [{ step: 1, dateISO: '2024-06-10', searched: ['state-agency-ru'], found: [] }, { step: 3, dateISO: '2024-06-12', searched: ['state-agency-ru'], found: [] },
        { step: 7, dateISO: '2024-06-16', searched: ['state-agency-ru'], found: [] }, { step: 30, dateISO: '2024-07-09', searched: ['state-agency-ru'], found: [] }],
      recordCheck: { status: 'checked', pass: 'intake-review', date: '2024-06-10' }, detail: {}, rev: 5 },
    { id: 'RU-90003', theater: ['russia-ukraine'], dateISO: '2025-06-09', dateEndISO: '2025-06-15', datePrecision: 'week', kind: 'ground',
      title: 'Sample: week-long operation reported near Town CC', place: 'Town CC', country: 'Ukraine', lat: 47.9, lng: 35.4, geoPrecision: 'city',
      actors: { by: ['russia'], against: ['ukraine'] }, tier: 'major',
      entries: [
        { n: 1, claimedBy: { actor: 'russia' }, stance: 'claims', published: '2025-06-12',
          text: 'Says it began an operation near Town CC. (sample)', attributesTo: ['russia'],
          locations: [{ place: 'Town CC', lat: 47.9, lng: 35.4, precision: 'city' }],
          sources: [S('original', 'Sample State Agency (Russia)', 'state-agency-ru', '2025-06-12', 'official-statement', 'ru-90003-1')] },
        { n: 2, claimedBy: { actor: 'ukraine' }, stance: 'acknowledges', published: '2025-06-13', respondsTo: [1],
          text: 'Says fighting is under way near Town CC. (sample)',
          sources: [S('original', 'Ukraine government statement (sample)', undefined, '2025-06-13', 'official-statement', 'ru-90003-2')] }
      ],
      recordCheck: { status: 'checked', pass: 'intake-review', date: '2025-06-13' }, detail: {}, rev: 2 },
    { id: 'RU-90004', theater: ['russia-ukraine'], dateISO: d(-3), datePrecision: 'day', kind: 'energy',
      title: 'Sample: strike reported on Substation DD', place: 'Substation DD', country: 'Ukraine', lat: 48.46, lng: 35.04, geoPrecision: 'site',
      actors: { by: ['russia'], against: ['ukraine'] }, tier: 'major',
      entries: [
        { n: 1, claimedBy: { actor: 'ukraine' }, stance: 'claims', published: d(-3),
          text: 'Says a strike damaged Substation DD. (sample)', attributesTo: ['russia'],
          locations: [{ place: 'Substation DD', lat: 48.46, lng: 35.04, precision: 'site' }],
          figures: [{ what: 'wounded', value: 3, scope: 'civilians' }],
          sources: [S('original', 'Ukraine government statement (sample)', undefined, d(-3), 'official-statement', 'ru-90004-1'), S('carrier', 'Sample Kyiv Daily', 'kyiv-daily', d(-3), 'report')] },
        { n: 2, claimedBy: { actor: 'russia' }, stance: 'acknowledges', published: d(-2), respondsTo: [1],
          text: 'Says it struck energy facilities in the area. (sample)',
          sources: [S('original', 'Sample State Agency (Russia)', 'state-agency-ru', d(-2), 'official-statement', 'ru-90004-2')] }
      ],
      checks: [{ step: 1, dateISO: d(-2), searched: ['state-agency-ru'], found: [2] }],
      recordCheck: { status: 'checked', pass: 'intake-review', date: d(-2) }, detail: {}, rev: 2 },
    { id: 'RU-90005', theater: ['russia-ukraine'], dateISO: d(-1), datePrecision: 'day', kind: 'strike',
      title: 'Sample: drone strike reported on Depot EE', place: 'Depot EE', country: 'Russia', lat: 51.7, lng: 36.2, geoPrecision: 'site',
      actors: { by: ['ukraine'], against: ['russia'] }, tier: 'standard',
      entries: [
        { n: 1, claimedBy: { outlet: 'state-agency-ru' }, stance: 'claims', published: d(-1),
          text: 'Reports a drone strike on Depot EE. (sample)', attributesTo: ['ukraine'],
          locations: [{ place: 'Depot EE', lat: 51.7, lng: 36.2, precision: 'site' }],
          sources: [S('original', 'Sample State Agency (Russia)', 'state-agency-ru', d(-1), 'report', 'ru-90005-1')] }
      ],
      recordCheck: { status: 'checked', pass: 'intake-review', date: d(-1) }, detail: {}, rev: 1 },
    { id: 'RU-90006', theater: ['russia-ukraine'], dateISO: d(-4), datePrecision: 'day', kind: 'naval',
      title: 'Sample: vessel damage reported at sea', place: 'Sea (representative point)', country: 'International waters', lat: 44.3, lng: 33.0, geoPrecision: 'representative',
      actors: { by: ['ukraine'], against: ['russia'] }, tier: 'major',
      entries: [
        { n: 1, claimedBy: { actor: 'ukraine' }, stance: 'claims', published: d(-4),
          text: 'Says it damaged a vessel at sea. (sample)', attributesTo: ['ukraine'],
          locations: [{ place: 'Sea (representative point)', lat: 44.3, lng: 33.0, precision: 'representative' }],
          figures: [{ what: 'vessels-hit', value: 1 }],
          sources: [S('original', 'Ukraine government statement (sample)', undefined, d(-4), 'official-statement', 'ru-90006-1')] },
        { n: 2, claimedBy: { actor: 'russia' }, stance: 'denies', published: d(-3), respondsTo: [1],
          text: 'Denies that any vessel was hit. (sample)',
          sources: [S('original', 'Sample State Agency (Russia)', 'state-agency-ru', d(-3), 'official-statement', 'ru-90006-2')] }
      ],
      recordCheck: { status: 'checked', pass: 'intake-review', date: d(-3) }, detail: {}, rev: 2 },
    { id: 'RU-90007', theater: ['russia-ukraine'], dateISO: d(-5), datePrecision: 'day', kind: 'ground',
      title: 'Sample: capture of Village FF claimed', place: 'Village FF', country: 'Ukraine', lat: 48.0, lng: 37.8, geoPrecision: 'site',
      actors: { by: ['russia'], against: ['ukraine'] }, tier: 'standard',
      entries: [
        { n: 1, claimedBy: { actor: 'russia' }, stance: 'claims', published: d(-5),
          text: 'Says it took Village FF. (sample)', attributesTo: ['russia'],
          locations: [{ place: 'Village FF', lat: 48.0, lng: 37.8, precision: 'site' }],
          sources: [S('original', 'Sample State Agency (Russia)', 'state-agency-ru', d(-5), 'official-statement', 'ru-90007-1')] },
        { n: 2, claimedBy: { actor: 'ukraine' }, stance: 'denies', published: d(-5), respondsTo: [1],
          text: 'Denies that Village FF was taken. (sample)',
          sources: [S('original', 'Ukraine government statement (sample)', undefined, d(-5), 'official-statement', 'ru-90007-2')] }
      ],
      recordCheck: { status: 'checked', pass: 'intake-review', date: d(-5) }, detail: {}, rev: 2 },
    ...[['RU-90008', 'Village GG', 48.12, 37.95, -2], ['RU-90009', 'Village HH', 48.05, 38.1, -1]].map(([id, place, lat, lng, off]) => ({
      id, theater: ['russia-ukraine'], dateISO: d(off), datePrecision: 'day', kind: 'ground',
      title: 'Sample: shelling reported at ' + place, place, country: 'Ukraine', lat, lng, geoPrecision: 'site',
      actors: { by: ['russia'], against: ['ukraine'] }, tier: 'standard',
      entries: [
        { n: 1, claimedBy: { actor: 'ukraine' }, stance: 'claims', published: d(off),
          text: 'Says ' + place + ' was shelled. (sample)', attributesTo: ['russia'],
          locations: [{ place, lat, lng, precision: 'site' }],
          sources: [S('original', 'Ukraine government statement (sample)', undefined, d(off), 'official-statement', id.toLowerCase() + '-1')] }
      ],
      recordCheck: { status: 'checked', pass: 'intake-review', date: d(off) }, detail: {}, rev: 1 })),
    /* Tripwire evidence: one side, then a denial a day later. */
    { id: 'RU-90010', theater: ['russia-ukraine', 'iran-war'], dateISO: d(-9), datePrecision: 'day', kind: 'strike',
      title: 'Sample: missile strike reported at Site JJ', place: 'Site JJ', country: 'Ukraine', lat: 46.6, lng: 31.0, geoPrecision: 'site',
      actors: { by: ['iran'], against: ['ukraine'] }, tier: 'major',
      entries: [
        { n: 1, claimedBy: { actor: 'ukraine' }, stance: 'claims', published: d(-9),
          text: 'Says a missile operated by an Iranian crew hit Site JJ. (sample)', attributesTo: ['iran'],
          locations: [{ place: 'Site JJ', lat: 46.6, lng: 31.0, precision: 'site' }],
          sources: [S('original', 'Ukraine government statement (sample)', undefined, d(-9), 'official-statement', 'ru-90010-1')] },
        { n: 2, claimedBy: { actor: 'iran' }, stance: 'denies', published: d(-8), respondsTo: [1],
          text: 'Denies that any of its personnel are in the theater. (sample)',
          sources: [S('original', 'Sample State TV (Iran)', 'state-tv-ir', d(-8), 'official-statement', 'ru-90010-2')] }
      ],
      recordCheck: { status: 'checked', pass: 'intake-review', date: d(-8) }, detail: {}, rev: 2 },
    /* Tripwire evidence: stated by the actor named and by another party. */
    { id: 'RU-90011', theater: ['iran-war', 'russia-ukraine'], dateISO: d(-14), datePrecision: 'day', kind: 'naval',
      title: 'Sample: escort vessels reported in the strait', place: 'Strait (representative point)', country: 'International waters', lat: 26.2, lng: 56.75, geoPrecision: 'representative',
      actors: { by: ['russia'], against: [] }, tier: 'major',
      entries: [
        { n: 1, claimedBy: { actor: 'iran' }, stance: 'claims', published: d(-14),
          text: 'Says Russian vessels escorted tankers through the strait. (sample)', attributesTo: ['russia'],
          locations: [{ place: 'Strait (representative point)', lat: 26.2, lng: 56.75, precision: 'representative' }],
          sources: [S('original', 'Sample State TV (Iran)', 'state-tv-ir', d(-14), 'official-statement', 'ru-90011-1')] },
        { n: 2, claimedBy: { actor: 'russia' }, stance: 'acknowledges', published: d(-13), respondsTo: [1],
          text: 'Says two of its vessels accompanied merchant ships. (sample)',
          sources: [S('original', 'Sample State Agency (Russia)', 'state-agency-ru', d(-13), 'official-statement', 'ru-90011-2')] }
      ],
      recordCheck: { status: 'checked', pass: 'intake-review', date: d(-13) }, detail: {}, rev: 2 },
    /* Statements cited by the rhetoric track. */
    ...[['RU-90020', 'russia', 'Sample: statement on nuclear posture', 'Says it has changed the readiness of its nuclear forces. (sample)', -10, 'state-agency-ru'],
        ['RU-90021', 'russia', 'Sample: second statement on nuclear posture', 'Repeats that its nuclear forces are at higher readiness. (sample)', -6, 'state-agency-ru'],
        ['RU-90022', 'nato', 'Sample: alliance pledge statement', 'Says members pledged further support. (sample)', -5, undefined]].map(([id, by, title, text, off, reg]) => ({
      id, theater: ['russia-ukraine'], dateISO: d(off), datePrecision: 'day', kind: 'statement',
      title, place: 'No place stated', country: 'Not stated',
      actors: { by: [by], against: [] }, tier: 'standard',
      entries: [
        { n: 1, claimedBy: { actor: by }, stance: 'claims', published: d(off), text,
          sources: [S('original', reg ? 'Sample State Agency (Russia)' : 'NATO statement (sample)', reg, d(off), 'official-statement', id.toLowerCase() + '-1')] }
      ],
      recordCheck: { status: 'checked', pass: 'intake-review', date: d(off) }, detail: {}, rev: 1 }))
  ];
  // optional fields are omitted when not established: drop registryId where the helper was given none
  for (const e of events) for (const en of e.entries) for (const s of en.sources) if (s.registryId === undefined) delete s.registryId;

  /* ---- 4.1 links -------------------------------------------------------------------------------- */
  const L = (n, claimedBy, stance, published, record, covers, extra) => Object.assign({ n, claimedBy, stance, published, record, covers,
    sources: [{ role: 'original', publisher: 'Sample source for this statement', url: URL + 'link-statement', published, kind: 'official-statement', access: 'read' }] }, extra || {});
  const links = [
    { id: 'LK-90001', category: 'weapons-tech', from: 'iran', to: 'russia', direction: 'from-to', theaters: ['iran-war', 'russia-ukraine'],
      title: 'Sample link: drone transfers',
      summary: 'Sample text. Several parties say drones were transferred; Iran says a small number were sent before the war and denies transfers since; Russia denies it.',
      dateStartISO: d(-420), datePrecision: 'month',
      entries: [
        L(1, { actor: 'usa' }, 'claims', d(-400), 'sanctions-designation', 'Says a manufacturer supplied drones used in Ukraine. (sample)'),
        L(2, { actor: 'ukraine' }, 'claims', d(-200), 'wreckage-report', 'Says wreckage it recovered carries the maker’s markings. (sample)'),
        L(3, { actor: 'iran' }, 'acknowledges', d(-150), 'official-statement', 'Says a small number of drones were sent before the war. (sample)'),
        L(4, { actor: 'iran' }, 'denies', d(-150), 'official-statement', 'Denies any transfer during the war. (sample)'),
        L(5, { actor: 'russia' }, 'denies', d(-100), 'official-statement', 'Denies using drones from abroad. (sample)'),
        L(6, { actor: 'un' }, 'claims', d(-30), 'igo-report', 'Says a panel examined debris and traced parts to the manufacturer. (sample)'),
        L(7, { actor: 'nato' }, 'claims', d(-20), 'official-statement', 'Says transfers are continuing. (sample)', { events: ['IR-90016'] })
      ], rev: 4 },
    { id: 'LK-90002', category: 'energy-shipping', from: 'iran', to: 'russia', direction: 'both', theaters: ['iran-war', 'russia-ukraine'],
      title: 'Sample link: tanker routing',
      summary: 'Sample text. A monitoring group says tankers were re-routed between the two countries. Neither has said anything.',
      dateStartISO: d(-90), datePrecision: 'month',
      entries: [L(1, { actor: 'monitor-x' }, 'claims', d(-60), 'trade-data', 'Says tracking data shows tankers re-routed between ports of the two countries. (sample)')], rev: 1 },
    { id: 'LK-90003', category: 'intelligence', from: 'russia', to: 'iran', direction: 'from-to', theaters: ['iran-war', 'russia-ukraine'],
      title: 'Sample link: sharing of targeting data',
      summary: 'Sample text. One outlet reports it, citing an unnamed official. Neither party has said anything.',
      dateStartISO: d(-40), datePrecision: 'month',
      entries: [L(1, { outlet: 'wire-one' }, 'claims', d(-25), 'media-report', 'Reports that targeting data was shared, citing an unnamed official. (sample)', { citing: 'an unnamed official' })], rev: 1 },
    { id: 'LK-90004', category: 'backing-diplomatic', from: 'iran', to: 'hezbollah', direction: 'from-to', theaters: ['iran-war'],
      title: 'Sample link: stated support',
      summary: 'Sample text. Both parties say the support exists.',
      dateStartISO: d(-300), datePrecision: 'month',
      entries: [
        L(1, { actor: 'iran' }, 'acknowledges', d(-90), 'official-statement', 'Says it supports the group. (sample)'),
        L(2, { actor: 'hezbollah' }, 'acknowledges', d(-80), 'official-statement', 'Says it receives support. (sample)')], rev: 2 },
    { id: 'LK-90005', category: 'personnel', from: 'north-korea', to: 'russia', direction: 'from-to', theaters: ['east-asia', 'russia-ukraine'],
      title: 'Sample link: personnel sent abroad',
      summary: 'Sample text. Three parties say personnel were sent; Russia points to a treaty in force; North Korea has said nothing.',
      dateStartISO: d(-120), datePrecision: 'month',
      entries: [
        L(1, { actor: 'ukraine' }, 'claims', d(-50), 'official-statement', 'Says foreign personnel are present at the front. (sample)'),
        L(2, { actor: 'usa' }, 'claims', d(-45), 'official-statement', 'Says several thousand personnel were sent. (sample)'),
        L(3, { actor: 'nato' }, 'claims', d(-40), 'official-statement', 'Says it has seen the deployment. (sample)'),
        L(4, { actor: 'russia' }, 'acknowledges', d(-110), 'treaty-or-contract', 'Says a mutual-assistance treaty is in force. (sample)', { standing: true })], rev: 3 },
    { id: 'LK-90006', category: 'sanctions-finance', from: 'usa', to: 'ukraine', direction: 'from-to', theaters: ['russia-ukraine'],
      title: 'Sample link: financing package',
      summary: 'Sample text. Both parties announced it more than a year ago; no one has spoken about it in the last 180 days.',
      dateStartISO: d(-600), datePrecision: 'month',
      entries: [
        L(1, { actor: 'usa' }, 'claims', d(-560), 'official-statement', 'Announces a financing package. (sample)'),
        L(2, { actor: 'ukraine' }, 'acknowledges', d(-555), 'official-statement', 'Says it received the first payment. (sample)')], rev: 1 }
  ];

  /* ---- 4.2 watchlist ---------------------------------------------------------------------------- */
  // history entries are written with the look each cited event had on that date (reliedOn), as the schema requires
  const H = (dateISO, status, note, evts, relied) => ({ dateISO, status, note, evidence: { events: evts, links: [] }, reliedOn: relied, sources: [] });
  const watch = {
    combat: [
      { id: 'WL-90001', track: 'combat', title: 'Russian naval escorts in Hormuz',
        definition: 'Sample definition. Counts: a statement that Russian naval vessels escorted or accompanied shipping in the strait. Does not count: port visits or exercises elsewhere.',
        requires: { kinds: ['naval'], by: ['russia'] }, theaters: ['iran-war', 'russia-ukraine'], status: 'both-ends',
        history: [H(d(-30), 'none-on-file', 'Baseline at creation. (sample)', [], []),
                  H(d(-14), 'one-sided', 'A claim was recorded. (sample)', ['RU-90011'], [{ ref: 'RU-90011', look: 'ghost' }]),
                  H(d(-13), 'both-ends', 'The party named made its own statement. (sample)', ['RU-90011'], [{ ref: 'RU-90011', look: 'solid' }])], rev: 3 },
      { id: 'WL-90002', track: 'combat', title: 'Iranian personnel or missiles used directly against Ukraine or NATO',
        definition: 'Sample definition. Counts: a statement that Iranian personnel operated a weapon against Ukraine or a NATO member. Does not count: weapons supplied and operated by others.',
        requires: { kinds: ['strike', 'interception', 'ground', 'naval', 'air-defense'], by: ['iran'], against: ['ukraine', 'nato'] }, theaters: ['iran-war', 'russia-ukraine'], status: 'contested',
        history: [H(d(-30), 'none-on-file', 'Baseline at creation. (sample)', [], []),
                  H(d(-9), 'one-sided', 'A claim was recorded. (sample)', ['RU-90010'], [{ ref: 'RU-90010', look: 'ghost' }]),
                  H(d(-8), 'contested', 'The party named denied it. (sample)', ['RU-90010'], [{ ref: 'RU-90010', look: 'split' }])], rev: 3 },
      { id: 'WL-90003', track: 'combat', title: 'Russian forces engaging US or Israeli assets',
        definition: 'Sample definition. Counts: a statement that Russian forces fired on a US or Israeli asset. Does not count: close approaches without fire.',
        requires: { kinds: ['strike', 'interception', 'naval', 'air-defense'], by: ['russia'], against: ['usa', 'israel'] }, theaters: ['iran-war', 'russia-ukraine'], status: 'one-sided',
        history: [H(d(-30), 'none-on-file', 'Baseline at creation. (sample)', [], []),
                  H(d(-2), 'one-sided', 'A claim was recorded. (sample)', ['IR-90019'], [{ ref: 'IR-90019', look: 'ghost' }])], rev: 2 },
      { id: 'WL-90004', track: 'combat', title: 'NATO-Iran direct clash',
        definition: 'Sample definition. Counts: a statement of an exchange of fire between NATO forces and Iranian forces. Does not count: an incident involving one member acting alone.',
        requires: { kinds: ['strike', 'interception', 'ground', 'naval', 'air-defense'], by: ['iran', 'nato'], against: ['iran', 'nato'] }, theaters: ['iran-war', 'russia-ukraine'], status: 'none-on-file',
        history: [H(d(-30), 'none-on-file', 'Baseline at creation. (sample)', [], [])], rev: 1 }
    ],
    rhetoric: [
      { id: 'WL-90011', track: 'rhetoric', title: 'Nuclear signalling', definition: 'Sample definition. Counts: an official statement about nuclear forces, posture or enrichment.',
        requires: { kinds: ['statement', 'political'] }, theaters: ['iran-war', 'russia-ukraine'], status: 'elevated',
        history: [H(d(-10), 'noted', 'First statement cited. (sample)', ['RU-90020'], []), H(d(-6), 'noted', 'Second statement cited. (sample)', ['RU-90020', 'RU-90021'], []),
                  H(d(-3), 'elevated', 'Third statement cited. (sample)', ['RU-90020', 'RU-90021', 'IR-90020'], [])], rev: 3 },
      { id: 'WL-90012', track: 'rhetoric', title: 'Readiness-timeline statements', definition: 'Sample definition. Counts: an official statement giving a date or period for readiness.',
        requires: { kinds: ['statement', 'political'] }, theaters: ['iran-war', 'russia-ukraine'], status: 'noted',
        history: [H(d(-2), 'noted', 'First statement cited. (sample)', ['IR-90013'], [])], rev: 1 },
      { id: 'WL-90013', track: 'rhetoric', title: 'Defence-budget surges', definition: 'Sample definition. Counts: an announced rise in a defence budget above a stated threshold.',
        requires: { kinds: ['statement', 'political'] }, theaters: ['iran-war', 'russia-ukraine'], status: 'quiet',
        history: [H(d(-30), 'quiet', 'Baseline at creation. (sample)', [], [])], rev: 1 },
      { id: 'WL-90014', track: 'rhetoric', title: 'Conscription', definition: 'Sample definition. Counts: an announced widening of conscription or call-up.',
        requires: { kinds: ['statement', 'political'] }, theaters: ['iran-war', 'russia-ukraine'], status: 'quiet',
        history: [H(d(-30), 'quiet', 'Baseline at creation. (sample)', [], [])], rev: 1 },
      { id: 'WL-90015', track: 'rhetoric', title: 'Alliance pledges', definition: 'Sample definition. Counts: a public pledge of military support by an alliance or a state.',
        requires: { kinds: ['statement', 'political'] }, theaters: ['iran-war', 'russia-ukraine'], status: 'noted',
        history: [H(d(-5), 'noted', 'First statement cited. (sample)', ['RU-90022'], [])], rev: 1 }
    ],
    // prototype values; the real thresholds are set when the first real items are written (ARCHITECTURE 4.2)
    rhetoricConfig: { windowDays: 90, steps: [{ status: 'quiet', min: 0 }, { status: 'noted', min: 1 }, { status: 'elevated', min: 3 }, { status: 'sustained', min: 5 }] }
  };

  /* ---- OBSERVED tracks (sample): positions only, never claims ------------------------------------ */
  let seed = 20261115;
  const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
  const tracks = [];
  const boxes = [['aircraft', 24, 56, 29, 48, 44], ['aircraft', 44, 51, 28, 40, 26], ['vessel', 24, 28, 50, 58, 30], ['vessel', 42, 46, 29, 38, 14]];
  for (const [type, s, n, w, e, count] of boxes) for (let i = 0; i < count; i++) {
    const id = (type === 'aircraft' ? 'SMP' : 'SV') + String(tracks.length + 1).padStart(3, '0');
    tracks.push({ id, type, name: 'Sample ' + (type === 'aircraft' ? 'flight ' : 'vessel ') + id, lat: +(s + rnd() * (n - s)).toFixed(3), lng: +(w + rnd() * (e - w)).toFixed(3),
      heading: Math.floor(rnd() * 360), speedKt: type === 'aircraft' ? 380 + Math.floor(rnd() * 120) : 8 + Math.floor(rnd() * 12),
      altM: type === 'aircraft' ? 8000 + Math.floor(rnd() * 4) * 1000 : 0,
      observedAt: todayISO + 'T' + String(10 + Math.floor(rnd() * 4)).padStart(2, '0') + ':' + String(Math.floor(rnd() * 60)).padStart(2, '0') + 'Z', source: 'sample-provider' });
  }

  /* ---- layers menu (LAYOUT spec 8): stub rows keep the eventual shape of the menu ------------------ */
  const layers = [
    { group: 'Events', rows: [{ id: 'events', name: 'Events', note: 'always on', locked: true, on: true }] },
    { group: 'Theater outlines', rows: [{ id: 'outlines', name: 'Theater outlines', desc: 'The area each theater covers', on: true }] },
    { group: 'Connections', rows: [
      { id: 'links', name: 'Links', desc: 'Stated connections between parties, as arcs', note: 'sample data' },
      { id: 'watch-markers', name: 'Watchlist markers', desc: 'Where cited events are', disabled: true, note: 'not built yet' }] },
    { group: 'Air', rows: [
      { id: 'flights', name: 'Military flights', desc: 'OBSERVED transponder positions', note: 'today only · sample data', source: 'sample-provider' },
      { id: 'airspace', name: 'Airspace notices', disabled: true, note: 'not built yet' }] },
    { group: 'Sea', rows: [
      { id: 'vessels', name: 'Vessels', desc: 'OBSERVED transponder positions', note: 'today only · sample data', source: 'sample-provider' },
      { id: 'gnss', name: 'GNSS interference', disabled: true, note: 'not built yet · turns on with flights or vessels' }] },
    { group: 'Space', rows: [
      { id: 'sats', name: 'Satellites over theaters', disabled: true, note: 'needs the 3D view · not built yet' },
      { id: 'launches', name: 'Launches', disabled: true, note: 'not built yet' }] },
    { group: 'Ground context', rows: [
      { id: 'fires', name: 'Fires', disabled: true, note: 'not built yet' }, { id: 'installations', name: 'Installations', disabled: true, note: 'not built yet' },
      { id: 'cables', name: 'Cables', disabled: true, note: 'not built yet' }, { id: 'dams', name: 'Dams', disabled: true, note: 'not built yet' }] }
  ];

  const byId = xs => Object.fromEntries(xs.map(x => [x.id, x]));
  return { todayISO, actors, outlets, theaters, events, links, watch, tracks, layers,
    reg: { actors: byId(actors), outlets: byId(outlets) }, eventsById: byId(events), theatersById: byId(theaters), linksById: byId(links) };
};

/* Closed lists from ARCHITECTURE v1.3, used by the check script to test the sample against the schemas. */
WM.schema = {
  kinds: ['strike', 'interception', 'ground', 'naval', 'air-defense', 'infrastructure', 'energy', 'shipping', 'cyber', 'intel', 'deployment', 'political', 'diplomatic', 'economic', 'humanitarian', 'statement', 'unclassified'],
  datePrecision: ['day', 'range', 'week', 'month', 'year', 'ongoing-from'], geoPrecision: ['site', 'city', 'region', 'representative', 'unknown'],
  locPrecision: ['site', 'city', 'region', 'representative'], tier: ['milestone', 'major', 'standard'],
  significance: ['world-changing', 'strategic', 'escalatory', 'tactical-pivot', 'infrastructure', 'political'],
  stance: ['claims', 'acknowledges', 'denies', 'withdraws'], scope: ['happened', 'attribution', 'location', 'target', 'damage', 'casualties', 'weapon', 'timing'],
  figureWhat: ['killed', 'wounded', 'missing', 'detained', 'displaced', 'projectiles-launched', 'projectiles-intercepted', 'aircraft-lost', 'vessels-hit', 'sites-hit', 'other'],
  qualifier: ['at-least', 'about'], mediaKind: ['satellite-image', 'photo', 'video', 'document'],
  sourceKind: ['primary-document', 'official-statement', 'wire', 'report', 'monitor', 'osint', 'leaked'], access: ['read', 'snippet-only', 'archive', 'subscription', 'unrecorded'],
  role: ['original', 'carrier'], needs: ['kind', 'title', 'actors', 'claimant', 'published'], recordCheck: ['checked', 'corrected', 'none'],
  sourcesStatus: ['listed', 'named-only', 'legacy-unlisted'], gapReason: ['blocked', 'paywalled', 'removed'],
  actorKind: ['state', 'armed-force', 'armed-group', 'alliance', 'igo', 'monitor', 'company'],
  ownership: ['state', 'party', 'independent', 'exile', 'advocacy', 'international-public'], outletStatus: ['active', 'blocked', 'dropped'],
  linkCategory: ['weapons-tech', 'intelligence', 'sanctions-finance', 'energy-shipping', 'personnel', 'backing-diplomatic'], direction: ['from-to', 'both', 'undirected'],
  linkRecord: ['treaty-or-contract', 'court-judgment', 'official-statement', 'sanctions-designation', 'igo-report', 'wreckage-report', 'imagery', 'trade-data', 'media-report'],
  combatStatus: ['none-on-file', 'one-sided', 'contested', 'both-ends'], rhetoricStatus: ['quiet', 'noted', 'elevated', 'sustained'],
  theaterStatus: ['full', 'lean', 'intake-only'],
  eventKeys: ['id', 'legacyId', 'withdrawn', 'theater', 'dateISO', 'dateEndISO', 'datePrecision', 'timeNote', 'kind', 'legacyType', 'title', 'place', 'country', 'lat', 'lng', 'geoPrecision', 'actors', 'attackerText', 'needs', 'tier', 'significance', 'entries', 'relatedIds', 'checks', 'sourcesStatus', 'coverageGaps', 'recordCheck', 'detail', 'launch', 'legacy', 'rev'],
  entryKeys: ['n', 'claimedBy', 'citing', 'stance', 'scope', 'published', 'respondsTo', 'supersedes', 'text', 'attributesTo', 'locations', 'figures', 'media', 'sources', 'withdrawn', 'movedFrom'],
  linkEntryKeys: ['n', 'claimedBy', 'citing', 'stance', 'published', 'supersedes', 'withdrawn', 'sources', 'covers', 'record', 'events', 'standing', 'standingUntil'],
  sourceKeys: ['role', 'publisher', 'registryId', 'url', 'published', 'kind', 'access', 'recordCheckNote']
};
})();
