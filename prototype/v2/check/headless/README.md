Headless checks for the prototype (not part of the page).

    npm install --prefix . playwright leaflet@1.9.4 cesium@1.146.0 @fontsource/ibm-plex-sans@5.2.8 @fontsource/ibm-plex-sans-condensed@5.3.0 @fontsource/ibm-plex-mono@5.3.0 @fontsource/oswald@5.3.0 @fontsource/share-tech-mono@5.3.0
    node functional.js                       # 38 behaviour checks at 1280 x 760 (touch)
    node shot.js name 360x700 touch          # one screenshot; optional: query, hash, script to run first
    node globe.js 780x320 name               # the globe, both theaters, links on

Timers run slowly in a headless page (a 250 ms timer can take over a second), so waits are long on purpose.
`node_modules/` and `shots/` here are not committed.
