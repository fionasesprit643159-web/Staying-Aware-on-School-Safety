# Shooting Safety

A dependency-free browser app for exploring the Shooting Safety landing flow and its classroom, bathroom, outdoor, and simulation maps. It also includes a simulator completion page with reflection and feedback.

## Structure

- `index.html` — app landing page
- `pages/` — information, map-selection, map, and end-of-simulation pages
- `styles/` — page stylesheets
- `scripts/` — navigation and interaction scripts
- `assets/images/` — image assets
- `end-page.html` — simulator completion, reflection, and feedback page
- `manifest.webmanifest` and `sw.js` — installable/offline app support

## Run it

Serve this folder from `localhost` or an HTTPS host to use service-worker features. For example, run `python3 -m http.server 8000` and open `http://localhost:8000`.

The completion page can receive a simulator outcome through `end-page.html?performance=needs-practice` or `end-page.html?performance=confident`. The simulator may also set `localStorage.setItem('simulatorPerformance', 'needs-practice')` or `localStorage.setItem('simulatorPerformance', 'confident')` before navigating to `end-page.html`.
