Headless checks for the prototype (not part of the page). Playwright is expected in the workspace already.

    npm install --prefix . leaflet@1.9.4 cesium@1.146.0 @fontsource/ibm-plex-sans@5.2.8 @fontsource/ibm-plex-sans-condensed@5.3.0 @fontsource/ibm-plex-mono@5.3.0 @fontsource/oswald@5.3.0 @fontsource/share-tech-mono@5.3.0
    mkdir -p shots
    node functional.js                       # 38 behaviour checks at 1280 x 760 (touch)
    node sweep.js [sizes] [states]           # five sizes x states: a screenshot and a measured audit each (pp,pl,tp,tl,pc)
    node checks2.js                          # 64 checks: the rest of LAYOUT spec section 11, and contrast as drawn
    node shot.js name 360x700 touch          # one screenshot; optional: query, hash, script to run first
    node globe.js 780x320 name               # the globe, both theaters, links on

Timers run slowly in a headless page (a 250 ms timer can take over a second), so waits are long on purpose.
Map tiles are answered with a blank pixel, so nothing here shows the map over real imagery.
`node_modules/` and `shots/` here are not committed.
