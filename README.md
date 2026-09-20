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

## Turkish live conflict dashboard

The default `index.html` is now a small Turkish PWA dashboard for:

- Ukrayna–Rusya
- İran–ABD
- Suudi Arabistan–Yemen

It keeps the existing `warmaps-data.js` event archive available for map context, but renders
those points as **arşiv/demo — doğrulama gerekli** rather than as live facts. No fabricated live
events or casualty counters are generated. The written feed only displays items returned by
the configured public feeds and includes the publisher, timestamp, and a link to the original
report. Video links are YouTube search/channel pages; the app does not scrape or embed videos.

### Running locally

This is a static app. Serve the repository over HTTP (rather than opening `index.html` as a
`file://` URL), for example:

```sh
python -m http.server 8080
```

Then open `http://localhost:8080/`. The Leaflet and OpenStreetMap assets are loaded from public
CDNs, so an internet connection is required for the basemap and feeds.

### Feed adapter and CORS

`app.js` uses the public `rss2json.com` adapter by default. RSS publishers frequently block
browser CORS requests and public adapters may rate-limit requests. For production, set
`localStorage.warmapsProxy` to a serverless endpoint that accepts `?url=<encoded RSS URL>`,
validates an allowlist of feeds, applies timeouts/rate limits, and returns RSS/XML or the
rss2json-compatible JSON shape. No API key is required or bundled. A failed or empty feed is
shown as an error/empty state; it is never replaced with invented content.

### X links and Turkish translation

The dashboard includes public X profile/search links for relevant international, Arabic,
English, and Russian-language news accounts. These are navigation links only: the app does
not scrape X, claim that a post is true, or require the X API. Real-time X post ingestion
requires an authenticated, policy-compliant backend and is intentionally not bundled.

RSS items may be translated by setting `localStorage.warmapsTranslateProxy` to an HTTPS
endpoint. The endpoint receives `POST {"text":"...","source":"en|ar|ru","target":"tr"}` and
must return `{"translation":"..."}` (or `translatedText`). The UI labels translated titles
and keeps the original title visible. Without this proxy, original titles are shown; no
fake or silent translation is presented as fact. Do not put paid provider keys in the
browser.

### Map locations, verification, and media

The UI shows a red marker as live only when a configured feed/proxy supplies numeric
`lat`, `lng`, and optional `location` fields for that item. Otherwise markers are amber
archive/demo context and are explicitly labeled. Clicking a marker opens the related
headlines plus public YouTube, VK, X, and image-search links for that location. These links
are discovery tools, not endorsements or proof that a video/image depicts the event.

News cards show `tek kaynak` or `N kaynak` based on repeated matching titles from distinct
configured publishers. This is corroboration of reporting, not independent verification of
the event. A production proxy should preserve `source`, `published`, and optional location
metadata when normalizing feeds.

The interface also remembers the selected conflict and theme locally, offers a verification
filter and exports the currently loaded headlines as JSON. If a refresh fails, a previously
successful feed is shown with an `Önbellek` timestamp rather than being presented as current.
The app accepts only HTTP(S) source links and uses `noopener noreferrer` for external pages.

### Deployment

Deploy the repository as static hosting (GitHub Pages, Netlify, Cloudflare Pages, or an
equivalent host). If a proxy is needed, deploy it separately as a serverless function and set
`warmapsProxy` in the browser after deployment. Review publisher terms, cache responses, and
keep the disclaimer visible: feeds can be delayed, incomplete, or unverified.
