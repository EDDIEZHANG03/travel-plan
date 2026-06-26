# Turkey + Egypt 2026 Trip Plan

This repository contains the current mobile-first travel plan for a July 2026 route from Wuhan to Turkey and Egypt.

- `index.html`: deployable Leaflet itinerary map for phones
- `trip_plan.md`: detailed readable itinerary notes
- `data/*.json`: itinerary, places, flight query cards, FX rates, sources, and query log
- `assets/js/*.js`: map, cards, link builders, currency conversion, and schedule validation helpers
- `scripts/*.mjs` and `tests/*.mjs`: local validation before pushing updates

Current route: Wuhan -> Istanbul -> Cappadocia -> Antalya -> Fethiye -> Cairo -> Hurghada -> Shanghai/Wuhan.

## Local validation

```bash
npm install
npm run validate
```

The site is static and can be served by GitHub Pages. For local preview:

```bash
python3 -m http.server 4173
```

## Research notes

Login-bound research for Xiaohongshu, Dianping, Google Maps, or booking platforms must be done manually in a browser session when required. Do not commit cookies, browser profiles, tokens, storage state, or session files. If a place has not been manually rechecked, keep its data marked as `needs_recheck`.
