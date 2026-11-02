# Feature 44 `m1_home_page` · spec package summary

- **Package:** `specs/044-home-page/` (spec, plan, research R1–R15,
  data-model, contracts/components.md, quickstart, checklists, tasks
  T001–T066).
- **Status:** feature 44 set to `spec_ready`. `./init.sh` exits 0.
- **Branch:** `feat/v2-home`. No commit made.
- **Sources:** pen extract-44 and assets-44 (leader), `muush-1.0.md`
  § 4.2–4.5, and the handoff (`REGIONES`, carousel, timeline). The spec
  author did not open the `.pen`.

## Key decisions

1. **Quarantine (R1).** All v1 landing UI moves to
   `landing/ui/legacy/`, including the still-rendered `ContactSection`, as 43
   did with the 404. The v1 data and logic it imports move to
   `data/legacy/` and `logic/legacy/`, and the stories keep their
   `Legacy v1/` titles. The v1 i18n seams (`useHeroContent`,
   `usePurposeContent`, `useServicesContent`) and the v1 keys
   `landing.hero/purpose/services` are deleted because nothing reads them
   any more. The new v2 keys reuse the `landing.hero` and `landing.services`
   names.
2. **Shared map (R2–R6).** `WorldMap` lives in `app/shared/`, because
   Nosotros reuses it in feature 46. The SVG is inlined (5.7 KB gzipped,
   zero requests), with one DOM for both views. The mobile zoom is pure CSS:
   the map box keeps a fixed 342:240 shape, so each region's transform is a
   constant computed by a pure function. That means no measuring, correct
   server render and no-JS state (America shown), and an instant switch
   under reduced motion. The tabs follow the WAI-ARIA tabs pattern. The
   desktop breakpoint query moves into `app/shared/data/layout.ts`.
3. **Carousel (R7).** It uses the handoff's 0.35-line rule plus "last card
   at the end", as a pure function. The scroller can take focus and is
   labelled by the section heading. The indicator is hidden from screen
   readers (`aria-hidden`).
4. **Timeline (R8).** It translates the handoff formulas. On the server,
   without JS and under reduced motion, the line is full and every step is
   lit. The fill uses transforms only.
5. **Step 01 (R9).** The short and full sentences are two keys. CSS swaps
   them at `lg`.
6. **`aria-current` (R13).** All four logo links (header, mobile menu, both
   footers) are cleared, not only the header's. The fix is pinned in the
   component tests and the output tests.
7. **SEO.** `usePageSeo` is unchanged and there is exactly one `h1`. A new
   output test checks that every fragment link points at an id that exists
   on its target page.
8. **Tests changed on purpose.** `landing-copy` is rewritten for v2.
   `static-output` gets the v2 hero, the fragment check and `aria-current`.
   `tablet-layout-tokens` gets the legacy paths. `forms-copy` drops the
   "contact secondary CTA = v1 hero secondary CTA" equality, because the v2
   hero has no call CTA.

## Provisional answers for Roberto (spec § Clarifications)

- **Q1 · Mobile hero buttons.** One centred row with gap 8. It wraps below
  where it does not fit. It is estimated to fit at 390 and wrap at 360.
- **Q2 · Map accessibility, with new copy.** The pins are announced as a
  hidden list of cities, grouped by the legend labels. The tab list is named
  "Región del mapa" / "Map region". The city names are new strings: in EN,
  Dublin, Amsterdam and Los Angeles. The rest are the same as ES.
- **Q3 · Line versus fill.** The drawn gradient is the permanent track, and
  a solid red fill grows over it. When fully filled, the line is solid red.
- **Q4 · Pins.** They stay 28 × 28 on screen at every width and zoom.

## Missing or inferred values for the leader (not in pen extract-44)

- Servicios on mobile: the vertical padding (72 assumed), the head and
  section gaps, and the inner sizes of the 290 px card (desktop values
  assumed).
- Hero on mobile: the vertical alignment (centred assumed). The bottom
  padding at desktop (60 assumed).
- The carousel indicator's top margin (handoff value of 18 assumed).
- The partner pin's outer halo (Acero 200 at 12 % assumed, from "same
  rings").
- The card edge light: "size 1.5" is read as 150 % of the visual area.
- Lucide "weight 300": stroke 1.5 assumed.
- The mobile map box: its width cap (640 assumed) and opacity (0.8 assumed,
  as on desktop). The rail is drawn as one continuous line, not 1 × 100
  segments.
- The EN line breaks for the "Software, web / and cloud" and "Product
  design / and UX" card titles.
- **Blocking input.** The nine lucide SVGs (task T002) are not in the repo,
  and the handoff's inline icons are only approximations. The leader needs
  to supply them, or approve a download from the lucide repository (ISC
  licence). No npm package is planned.

## Visual changes on the integration build after 44

The page reads: header → v2 Hero over the listón (1000 px tall at 1440) →
Qué es muush with the dotted map → Servicios (cards and the "También" strip;
a carousel on phones) → Cómo trabajamos over the acanalado, with the filling
timeline → **the v1 contact section, unchanged, at `#diagnostico`** →
footer.

The v1 hero, Propósito and the v1 services timeline are gone. Proyectos was
never built. The hero's "Cómo trabajamos" and the footer link now reach a
real section. On phones the hero no longer sits under the header. The v1
contact styling clearly differs from the sections above it until feature 45.

## Notes

- `.specify/feature.json` now points at `specs/044-home-page` (the
  spec-kit skill writes it).
- `docs/harness/progress/assets-44/map-pins.json` was reformatted by Biome
  (whitespace only; the parsed JSON was compared before and after and is
  identical). Its 1-space indent was the one `./init.sh` failure.
- `CLAUDE.md` has no SPECKIT block, so the plan step made no agent-context
  update.
- No business rule was written. No new business rule surfaced, beyond the
  copy for Q2, which Roberto has to approve.
