# WARMAPS

A global map that displays conflict events based on claims from international news sources
in their own language and/or if they have English language versions. News sources include:
from those countries involved in the conflict, from other countries affected, and/or
countries who are stakeholders in some manner.

Event types include kinetic strike claims, OSINT sources, political news and decisions
concerned with the conflict. Fog of War / Rumors are flagged as such. Source attribution is
shown on the event info cards associated with each map Event. Additional news sources also
display from a ticker that can be clicked on to take the user of the map to the original
news source. When available strike origin is also mapped and arc lines to the strike
destination is displayed.

---

## Source traceability — current status (honest accounting, 2026-08-31)

The editorial goal of this project is that **every claim can be traced back to the specific
report where it was made.** That goal is **not yet met.** Stating the position plainly rather
than implying otherwise:

| | Of 297 events |
|---|---|
| Carry a source attribution (outlet names) | 201 |
| Carry a link to the **specific article** | ~18 |
| Carry no source attribution at all | 96 |

What this means in practice: most event cards name the outlets a claim came from, but the
links resolve to the outlet rather than to the individual report. Roughly 6% of events can
currently be traced to a specific article.

**Work in progress.** A schema revision now underway makes an article-level URL mandatory on
every new event, and a backfill pass is being run over the existing record. This section will
be updated as coverage improves, and removed when the goal is actually met.

Until then, treat outlet attribution as a pointer to *who reported it*, not as verification
that a given report says what the card summarises.

*Fog of War flagging is present in the data on 15 events but is not yet rendered in the
interface. It is not currently visible to readers.*
