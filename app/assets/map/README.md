# Map asset

## `world-dots.svg`

| | |
|---|---|
| Source | Leader export from `muush.pen`, 2026-11-01 (`docs/harness/progress/assets-44/world-dots.svg`, pen extract-44 § 2.1). Copied byte for byte. |
| viewBox | `0 0 1408 470` |
| Content | One `<path fill="currentColor">`: 1693 dots, 3 px each, on an 11 px grid |
| Size | 78 170 bytes raw, 5 730 bytes gzipped (measured 2026-11-01) |

The dot colour is the caller's `currentColor` (the `text-mapa-punto` token,
Blanco at about 18 %), which only works for inlined markup
(`docs/business/rules.md` § R8). It is therefore consumed with `?raw` and
`v-html` inside an `aria-hidden` wrapper (§ R14), never as an `<img>` or a
URL, so the map adds no request to the page (spec SC-003).

A few dots of the export sit below `y 470` (the last rows reach `y 502`).
They are outside the viewBox and the inline `<svg>` clips them, which is
what the `.pen`'s clipped map block draws.

Consumer: `app/shared/ui/WorldMap.vue` (feature 44; Nosotros reuses it in
feature 46). The pins are data (`app/shared/data/mapPins.ts`), never part of
this file.
