/* WARMAPS v2 PROTOTYPE — ui/strings.js
 * Every fixed string the interface shows in WARMAPS's own voice, in one place, so one script can check that none
 * of them grades truth (LAYOUT spec check 17; prototype/v2/check/check.js).
 * `fixed`, `help` and `tour` hold wording copied from the design documents; do not reword them here.
 */
(function () {
'use strict';
const root = typeof window !== 'undefined' ? window : globalThis;
const WM = root.WM = root.WM || {};

WM.strings = {
  stamp: 'PROTOTYPE SAMPLE - NOT REAL DATA',
  stampShort: 'SAMPLE - NOT REAL',
  // DESIGN_SYSTEM 2.3, 5, 2.8 and LAYOUT spec 8: fixed strings
  fixed: {
    chip: { ghost: 'ONE SIDE', solid: 'SIDES AGREE', split: 'CONTESTED', faded: 'UNRESOLVED', unattributed: 'NOT YET ATTRIBUTED', 'no-account': 'NO ACCOUNT IN FORCE' },
    legend: {
      solid: 'Solid = the sides on record agree it happened',
      ghost: 'Outline = one side’s account; a directly involved side has not been heard',
      split: 'Half = someone on record denies it, or disputes who did it',
      faded: 'Dashed = still one side’s account after our last check',
      unattributed: 'Plain = carried over from the first version; who said it is not yet recorded'
    },
    legendFooter: 'The marks show who has spoken, not what is true. WARMAPS records claims and their sources; it does not rule on them',
    legendFooterShort: 'The marks show who has spoken, not what is true.',
    linkLegend: 'Line weight counts how many separate parties and observers have affirmed this link in the last 180 days. It is not a judgement of importance or of truth. Solid: both actors say so. Dashed: someone on record denies it. Dotted: stated by others, or by one of the two.',
    linkNoRating: 'WARMAPS does not rate this link. It records who says it exists and who says it does not.',
    compareLegend: (a, b) => 'A (left) = ' + a + ' · B (right) = ' + b + ' · filled = says it happened · outline = the only one of the two to speak · slash = denies',
    linkChip: { both: 'BOTH ACTORS', one: 'ONE ACTOR', others: 'OTHERS ONLY', denied: 'DENIED BY SOMEONE' },
    watchChip: { 'none-on-file': 'NO CLAIM ON FILE', 'one-sided': 'CLAIMED BY ONE SIDE', contested: 'CLAIMED AND DENIED', 'both-ends': 'STATED BY BOTH ENDS' },
    rhetoricCaption: 'Statements and preparations. Counted separately. Cannot change a tripwire.',
    trackNote: 'Transponder data is self-reported. Absence is not evidence of no activity.',
    helpLegendNote: 'One-sided marks carry no label on the map and are never hidden by grouping; every record is named in the Events list.'
  },
  layer: { onRecord: 'On the record', fog: 'Fog', contested: 'Contested' },
  lens: {
    all: 'All accounts',
    banner: (who, hidden, onFile) => 'Showing ' + who + ' account only, not WARMAPS’s view · ' + hidden + ' other accounts hidden · accounts on file: ' + onFile,
    bannerShort: (who, hidden) => who + ' account only · ' + hidden + ' hidden',
    compare: (a, b, hidden) => 'Comparing A: ' + a + ' (left) with B: ' + b + ' (right) · not WARMAPS’s view · ' + hidden + ' other accounts hidden',
    compareShort: (a, b) => 'A: ' + a + ' | B: ' + b,
    nothing: who => who + ' has no account on file in this period'
  },
  empty: {
    theater: 'No curated events yet — intake only',
    window: range => 'No events in ' + range,
    fogOff: 'Only one-sided accounts in this period',
    showFog: 'Show fog', showAll: 'Show all'
  },
  watch: {
    headline: (n, m) => n + ' of ' + m + ' combat tripwires have a claim on record',
    headline2: (k, j) => k + ' stated by both ends · ' + j + ' denied',
    combat: 'Combat tripwires', rhetoric: 'Rhetoric and mobilization',
    steps: ['quiet', 'noted', 'elevated', 'sustained']
  },
  detail: {
    lite: 'Lite: plain panels, no blur, fewer labels, thinned tracks. Every record can still be opened.',
    standard: 'Standard: the theme as written; more labels and tracks.',
    full: 'Full: adds eased camera moves, terrain on the globe and the most labels.',
    offer: lvl => 'This device is working hard. Use ' + lvl + ' detail?',
    offer2d: 'The globe is working hard on this device. Switch to the 2D map?',
    thinned: (n, m) => 'showing ' + n + ' of ' + m
  },
  // LAYOUT spec 8a and 8d: fixed wording, shown in Help
  help: {
    marksTitle: 'What the marks mean',
    marks: [
      ['WARMAPS records who said what.', 'Every item on the map is something someone has said happened, with who said it, when, and where you can read it. WARMAPS does not decide whether it is true. You can follow each source and judge for yourself.'],
      ['Outline (ghost):', 'one side has said this. A side directly involved has not been heard. The card names who is missing.'],
      ['Solid:', 'the sides on record agree it happened. That is all it means. They may still disagree about damage, numbers or who is to blame, and the card says so.'],
      ['Half (split):', 'someone on record denies it, or disputes who did it.'],
      ['Dashed outline:', 'we looked again after 1, 3, 7 and 30 days and still have only one side’s account. The card says who has not answered and when we last looked.'],
      ['Plain:', 'carried over from the first version of WARMAPS. Who said it has not been recorded yet.'],
      ['Size', 'shows how much an event matters to the story of the war. A claim made by one side only is drawn small until another side speaks.'],
      ['Repeating is not agreeing.', 'Ten outlets carrying one statement are still one voice.'],
      ['A side’s own media counts for that side and is labelled.', 'Exile and opposition media are listed, and never stand in for the government or group they oppose.'],
      ['What we check:', 'that the statement was really made, by whom, and that the source says what we say it says. Nothing more.'],
      ['Lens', 'shows one party’s account only, or two side by side. The banner tells you whose account you are looking at. It is never WARMAPS’s view; WARMAPS has none.'],
      ['Aircraft, ships and satellites', 'are observations from transponders and orbital data, not claims. They are grey, shown for today only, and never take these marks.'],
      ['Opinion', 'appears only in notes signed by Allan Sanceau, kept apart from the record.']
    ],
    designTitle: 'How WARMAPS is designed',
    design: [
      ['A record, not a verdict.', 'WARMAPS keeps what each side has said, with the source, and leaves the judging to you. It has no view of its own.'],
      ['One happening, one record.', 'Every claim, denial and report about the same event is kept together, so you can see who said what about it and when.'],
      ['Every mark has one meaning.', 'Colour and shape tell you which war. Size tells you how much the event matters to the story. Fill tells you who has spoken. Nothing else is hidden in a colour.'],
      ['Quiet on purpose.', 'Nothing flashes or scrolls by itself. The map changes when you move through time, or when someone new speaks.'],
      ['What is missing is shown.', 'If a side directly involved has not been heard, the mark stays an outline and the card names who is missing.'],
      ['Themes change the dress, never the meaning.', 'You can change the colours, the map and the fonts. A circle is still the Iran war and an outline is still one side’s account, in every theme.'],
      ['Positions are kept apart from statements.', 'Aircraft, ships and satellites are positions reported by tracking services, each named on its card with the time. They are drawn in grey and never take the marks used for what people have said. WARMAPS passes them on as reported and does not vouch for them.']
    ],
    usingTitle: 'Using it',
    using: [
      ['The timeline and the 7-day band.', 'The map opens on the last 7 days. Drag the band on the lower row to move through the war, drag an edge to widen it, or pick 30 days, 90 days or All from the range button. Today brings the 7 days back.'],
      ['Record today and As known then.', 'Record today shows each event as the record stands now. As known then shows it as it stood on the date under the cursor; press Play to watch outlines appear, fill in, move, split or fade.'],
      ['Lens and Compare.', 'Lens shows one party’s account, at the places that party gives. Tick two parties and switch on Compare two to see them side by side: A on the left, B on the right.'],
      ['On the record, Fog, Contested.', 'Three switches at the corner of the map. Fog off leaves what more than one side has said. On the record off leaves where an account is missing. Contested shows only the split marks.'],
      ['Layers.', 'Links and positions of aircraft and ships are one tap away and off by default.'],
      ['Clean view.', 'One tap hides everything but the map. A tag on the map still says the period, the record date, the lens and any record layer that is off.'],
      ['Themes, map styles and detail.', 'In Settings. They change how things are drawn, never what a mark means or what you can open.']
    ]
  },
  tour: {
    offer: 'New here? A one-minute tour.',
    steps: [
      ['The marks', 'Colour and shape say which war. An outline is one side’s account; solid means the sides on record agree it happened; half means someone denies it; dashed means still one side after our last check.'],
      ['The timeline', 'The map shows the last 7 days. Drag the band to move through time, or widen it to any range or the whole war.'],
      ['A card', 'Tap a mark. The chip and the line under it say who is on record and who is missing, before you read anything else.'],
      ['On the record, Fog, Contested', 'These three switches count sides heard. None of them picks a side.'],
      ['Lens', 'See one party’s account only, or two side by side. A banner always says whose account is on screen.'],
      ['Layers, clean view and Help', 'Links and tracks are in Layers. Clean view leaves only the map. Help explains every mark and can replay this tour.']
    ]
  }
};
})();
