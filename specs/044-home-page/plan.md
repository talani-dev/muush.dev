# Implementation Plan: Muush 1.0 home page

**Branch**: `feat/v2-home` (from `muush-v2`, merges back into `muush-v2`) | **Date**: 2026-11-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/044-home-page/spec.md`

## Summary

Build the four v2 home sections (Hero, Qué es muush, Servicios, Cómo
trabajamos) in `app/features/landing/ui/` on the feature-42 primitives and
presets, with a shared, reusable `WorldMap` in `app/shared/` (Nosotros reuses
it in 46). The map is one inlined SVG whose mobile region zoom is pure CSS
from constant per-region transforms; the carousel indicator and the timeline
fill translate the handoff's `iniciarCarrusel` and `iniciarLineaTiempo` into
composables over pure, unit-tested functions. Move the v1 home sections
(and the still-rendered v1 contact) into `landing/ui/legacy/`, delete their
now-readerless i18n seams and keys, rewrite `app/pages/index.vue`, clear
`aria-current` on the four logo links, and update the tests that pinned the
v1 home. Details: [research.md](./research.md),
[data-model.md](./data-model.md),
[contracts/components.md](./contracts/components.md),
[quickstart.md](./quickstart.md).

## Technical Context

**Language/Version**: TypeScript (strict) · Vue 3.5 `<script setup lang="ts">` · Nuxt 4 (`srcDir: app/`)
**Primary Dependencies**: Tailwind CSS 4 (v2 tokens from 42/43), `@nuxtjs/i18n` 10. **No new dependency** (lucide glyphs are copied as assets, research R11).
**Storage**: N/A
**Testing**: Vitest + Vue Test Utils + happy-dom; Storybook 10; build-output tests in `tests/`
**Target Platform**: Static site (`nitro.preset: 'static'`) on S3 + CloudFront; evergreen browsers
**Project Type**: Static web site (single Nuxt project)
**Performance Goals**: map adds ≈ 5.7 KB gzipped to the home HTML and zero requests; scroll handlers passive and rAF-coalesced; map zoom and timeline fill are transform-only; shaders as in 42 (paused off-screen)
**Constraints**: Articles IV, VI, VII; components < 200 lines; 390/1440 anchors; features 33/35/37/39/43 behaviour untouched
**Scale/Scope**: ~15 new components (11 landing, 4 shared), 4 content composables + 4 behaviour composables, 6 pure modules, ~70 i18n keys per locale (≈ 30 v1 keys removed), ~35 new tokens, ~11 v1 components moved, ~6 test files edited

## Constitution Check

*GATE: must pass before Phase 0 research. Re-checked after Phase 1 design.*

### Phase -1: Pre-Implementation Gates

#### I. Feature-Based + Capas architecture
- [x] Home sections live in `app/features/landing/{ui,logic,data}`; the map, its data, geometry and the desktop media query are cross-cutting (landing now, about in 46) and live in `app/shared/{ui,logic,data,utils}`; `app/pages/index.vue` only composes.
- [x] v1 home UI, data and logic are quarantined in `landing/{ui,data,logic}/legacy/` (research R1).

#### II. Dependency direction (NON-NEGOTIABLE)
- [x] `ui/` → `logic/`, `data/`; `logic/` → `data/`; `data/` imports only types and shared data. Pure geometry in `shared/utils`.

#### III. Feature isolation (NON-NEGOTIABLE)
- [x] Landing reads `SECTION_ANCHORS`, the map and the primitives from `@/shared/…`; the page uses only the `landing`, `forms` and `shell` barrels; the shell imports `DESKTOP_MEDIA_QUERY` from shared, never from landing.

#### IV. Static-site purity (NON-NEGOTIABLE)
- [x] No server route or runtime dependency. Prerendered HTML is the no-JS state (America region, timeline lit, all copy present).

#### V. Component discipline
- [x] `<script setup lang="ts">` only; every component < 200 lines (largest planned: `WorldMap` ≈ 120, `HowWeWorkSection` ≈ 90); sections split into card, carousel, indicator, strip, timeline, step, chip, pin, tabs, legend.
- [x] Scroll, keyboard and media-query logic in composables; components bind.
- [x] Interactivity opt-in: hero, section heads, cards and strip are static markup; only the tabs, carousel indicator and timeline carry client state.

#### VI. i18n parity (NON-NEGOTIABLE)
- [x] Every string (including mobile-only and the Q2 accessibility copy, confirmed by Roberto 2026-11-01) in both locale files; parity test green; v1 keys without a reader removed in both.
- [x] Hero links resolved by route name + typed section anchor; no path literal; language switch untouched.

#### VII. Design tokens discipline
- [x] All values via v2 tokens as utilities; new tokens listed in data-model § 6, named without version marker and checked against v1 keys; zero hex/rgb/px in new components (`tests/token-literals.test.ts` extended to them).
- [x] No v1 token in new code; the v1 `mt-section-gap` moves from the page into the quarantined contact section.
- [x] `lg` used only for the layout swaps the design draws (tabs ↔ full map, carousel ↔ grid, rail ↔ row, mobile ↔ desktop chip/strip/step-01 copy); size changes inside one layout use fluid tokens.
- [x] Map pin positions and region transforms are data geometry (percentages from map coordinates), not design spacing; recorded in research R4.

#### VIII. Clean code
- [x] Named constants (`ACTIVE_LINE_RATIO`, `END_TOLERANCE_PX`, `HORIZONTAL_TRAVEL_RATIO`, `PEN_LINE_RATIO`, `MAP_SIZE`, `MAP_WINDOW_ASPECT`); `DESKTOP_MEDIA_QUERY` de-duplicated into shared.
- [x] Dead code: v1 content composables, keys and readerless constants deleted; v1 UI quarantined for 47. `useNavCtaReveal`/`useHeroSentinel` keep one reader (the quarantined v1 hero) and stay for 47.

#### IX. TypeScript strict + Biome
- [x] No `any`; string-literal unions for cities, kinds, regions, icons, lights, step keys.

#### X. Testing discipline
- [x] Unit: `mapPins`, `mapRegions`, `mapGeometry`, `useMapRegion`/`nextRegion`, `useDesktopLayout`, `carouselIndicator`, `useCarouselIndicator`, `timelineProgress`, `useTimelineProgress`, landing data modules. Component tests and ES/EN stories at 390/1440 for every new component. Output tests: v2 hero, single `h1`, fragment targets, logo `aria-current`, SEO unchanged. Names `should … when …`.

#### XI. Configuration & credential hygiene (NON-NEGOTIABLE)
- [x] No environment variable, secret or external URL added.

#### XII. Absolute imports via alias
- [x] Aliases everywhere; moved files' relative imports rewritten except within the same `legacy/` folder.

**Result: PASS.** No Complexity Tracking entry.

**Open inputs (not gate failures):** four clarifications (all confirmed by Roberto 2026-11-01)
(spec § Clarifications) and the values research R14 marks INFERRED, all for
Roberto/leader at the spec_ready gate; the nine lucide SVGs (research R11)
must be supplied before tasks T035 and T045 (T002).

## Project Structure

### Documentation (this feature)

```text
specs/044-home-page/
├── spec.md
├── plan.md                  # this file
├── research.md              # R1–R15
├── data-model.md
├── quickstart.md
├── contracts/components.md
├── checklists/requirements.md
└── tasks.md                 # /speckit-tasks
```

### Source code (repository root)

```text
app/
├── assets/
│   ├── css/global.css                 # EDIT: tokens of data-model § 6
│   ├── map/world-dots.svg             # NEW (copy of assets-44)
│   └── icons/*.svg + README.md        # NEW: 9 lucide glyphs (R11)
├── pages/index.vue                    # REWRITE: v2 composition
├── shared/
│   ├── data/{mapPins,mapRegions,layout}.ts      # NEW (+ tests)
│   ├── utils/mapGeometry.ts                     # NEW (+ test)
│   ├── logic/{useMapRegion,useDesktopLayout}.ts # NEW (+ tests)
│   └── ui/{WorldMap,MapPin,MapRegionTabs,MapLegend}.vue  # NEW (+ stories, tests)
├── features/landing/
│   ├── index.ts                       # REWRITE
│   ├── data/{heroContent,whoWeAreContent,servicesContent,howWeWorkContent}.ts  # NEW (+ tests)
│   ├── data/legacy/                   # MOVED v1 data
│   ├── logic/use{Hero,WhoWeAre,Services,HowWeWork}Content.ts   # NEW
│   ├── logic/{carouselIndicator,timelineProgress}.ts, use{CarouselIndicator,TimelineProgress}.ts  # NEW (+ tests)
│   ├── logic/legacy/                  # MOVED v1 logic
│   ├── ui/{HeroSection,WhoWeAreSection,ServicesSection,ServiceCard,ServicesCarousel,
│   │      CarouselIndicator,AlsoAvailable,HowWeWorkSection,ProcessTimeline,
│   │      ProcessStep,CommitmentChip}.vue  # NEW (+ stories, tests)
│   └── ui/legacy/                     # MOVED v1 sections + ContactSection
└── features/shell/
    ├── logic/useMobileMenu.ts         # EDIT: import DESKTOP_MEDIA_QUERY
    └── ui/{SiteHeader,MobileMenu,SiteFooter,MobileFooter}.vue  # EDIT: logo aria-current (+ tests)
i18n/locales/{es,en}.json              # EDIT: v2 keys in, v1 keys out
tests/
├── landing-copy.test.ts               # REWRITE for v2 copy
├── static-output.test.ts              # EDIT: v2 hero, fragments, logo aria-current
├── tablet-layout-tokens.test.ts       # EDIT: legacy paths
├── forms-copy.test.ts                 # EDIT: drop v1 hero equality
├── design-tokens.test.ts              # EDIT: new tokens at both anchors
└── token-literals.test.ts             # EDIT: scan new components
```

**Structure Decision**: single Nuxt project; feature-based layout per
Constitution I, with the map lifted to `app/shared/` for its second consumer.

## Complexity Tracking

None.

## Agent context

`CLAUDE.md` has no `<!-- SPECKIT START -->` / `<!-- SPECKIT END -->` block and
is outside the spec author's write scope; no agent-context update was made.
