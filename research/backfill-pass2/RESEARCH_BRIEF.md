# WARMAPS backfill research brief (shared by all chunk agents)

WARMAPS is a public map of the 2026 war that began Feb 28, 2026 (Day 1): US + Israel vs Iran,
plus every party drawn in: Lebanon/Hezbollah, Gaza and West Bank, Houthis/Ansarullah (Yemen),
Iraq, Syria, Saudi Arabia, Jordan, the GCC states, Strait of Hormuz / Red Sea shipping, and
the diplomacy around it (US–Iran talks via Qatar/Oman, sanctions, UN).

The live data ends Aug 16, 2026 (Day 170). You research ONE date range and return candidate
events. Today is Nov 8, 2026 (Day 254).

## Hard rules
- Only report what you found in sources during this task (WebSearch/WebFetch). Never fill gaps
  from memory or inference. If unsure of a date or figure, leave it out or mark it fog of war.
- Every event needs at least one source URL you actually opened or saw in search results, and the
  event DATE must be the date the thing happened (not the article date if they differ).
- Prefer two independent sources for milestone/major items. Note provenance (e.g. "IRGC claim",
  "IDF statement", "Lebanese Health Ministry"); provenance is never a credibility rating.
- Disputed or unconfirmed claims: keep them only if significant, and start `misc` with
  "FOG OF WAR: " explaining what is disputed.
- Use the LATEST figure when sources disagree over time, and give its as-of date.
- Do not use Times of Israel or Haaretz via automated fetch if they refuse access; never bypass blocks.

## Selection (quality over quantity)
Aim for roughly 1–3 events per day on average, about 35–55 for a three-week range. Include:
milestones (new fronts, ceasefires, major strikes, leadership deaths, talks breakthroughs or
collapses), major strikes with casualties, shipping incidents (Hormuz, Red Sea, Gulf of Oman),
energy shocks, key diplomatic moves, significant Lebanon/Gaza/West Bank/Houthi/Iraq events.
Skip routine repetition (combine a day's similar strikes into one event).

## Output: write ONE JSON file (array) at the path you are given. Each element:
{
  "date": "YYYY-MM-DD",
  "type": one of: joint | isr | us | iran | launch | naval | energy | intel | political | hez | global,
  "city": "place name", "country": "country or 'International waters'",
  "lat": number, "lng": number,          (best available; approximate ok, say so in misc)
  "attacker": "who acted, or 'N/A — statement' etc.",
  "weapon": "or N/A", "weaponCap": "or N/A", "target": "or N/A",
  "structuralDmg": "or N/A / Not itemized.", "humanCasualties": "with source attribution, or N/A",
  "launchOrigin": "origin or actor",
  "misc": "2–4 sentence plain-text summary, then 'Source: <outlet> <url> ; <outlet> <url>'",
  "tier": "milestone | major | standard",
  "fog": true/false,
  "sources": ["url", "url"]
}
Type guide (match existing data): US strikes on Iran 'us'; Israeli strikes on Iran 'isr'; joint US+Israeli 'joint';
Iranian/IRGC attacks anywhere 'iran'; Israeli strikes in Lebanon 'hez' (Lebanon theater); Israeli
strikes in Gaza / West Bank events 'isr'; Houthi actions 'global'; shipping/oil/market items
'energy'; naval movements/incidents 'naval'; intelligence findings 'intel'; statements, talks,
sanctions, votes 'political'; other countries / wider 'global'; missile launch events 'launch'.
Use plain ASCII quotes inside strings where possible; no backticks.

## Finally, in your reply (not the file): 5–10 lines: count by tier, the 3–5 most important
items, anything you could not confirm, and sites that refused access.
