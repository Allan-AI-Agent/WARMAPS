# Independent verification brief (WARMAPS backfill)
You did NOT write these events. Your job is to check them, skeptically, against sources.
For each event in your input file: open its source URL(s) (WebFetch; if a site blocks, try another
listed source or one quick WebSearch for the same story; never bypass blocks) and check:
1. DATE: the thing happened on `date` (allow the event's local date; flag if off by >=1 day).
2. CLAIM: the core claim in `misc` and any numbers in `humanCasualties` are supported by a source.
3. PLACE: city/country match; lat/lng roughly right (within ~50 km; sea events approximate is fine).
4. LABEL: if the claim is disputed or single-source from a party to the war, `fog` should be true.
Verdicts: PASS | FIX (give exact corrected field values) | DROP (unsupported, wrong, or duplicate).
Do not add new events. Do not rely on memory. Be brief.
Write a JSON array to the output path you are given: [{"vid": n, "verdict": "PASS|FIX|DROP",
"fix": {field: value} or {}, "note": "one line, what you checked / why"}]. Validate it parses.
Reply in 3-5 lines: counts by verdict and the most serious problems found.
