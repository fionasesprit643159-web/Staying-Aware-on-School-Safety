# Shooting Safety practice app

This is a small, responsive browser app with a welcome screen, a guided practice screen, and the reflection/end screen. The reflection note is stored only in the browser on the device where it is entered.

## Open it

Open `end-page.html` in a browser to use the app.

To enable installable/offline PWA behavior, serve this folder from `localhost` or an HTTPS host (service workers do not run from `file://`). Keep `end-page.html`, `manifest.webmanifest`, and `sw.js` together in the same folder.

## Simulator feedback integration

Before opening the end page, the simulator can pass an outcome in either of these ways:

- Open `end-page.html?performance=needs-practice` or `end-page.html?performance=confident`.
- Set `localStorage.setItem('simulatorPerformance', 'needs-practice')` or `localStorage.setItem('simulatorPerformance', 'confident')` before navigating to the end page.

The page also accepts `low` / `bad` as `needs-practice`, and `good` / `high` / `strong` as `confident`. If no outcome is passed, the user can choose a reflection option on the page.
