---
description: "Task list for feature 44 — Muush 1.0 home page"
---

# Tasks: Muush 1.0 home page (feature 44)

**Input**: `specs/044-home-page/` — spec.md, plan.md, research.md, data-model.md, contracts/components.md, quickstart.md
**Tests**: required (Constitution Article X; spec FR-032). Test names follow `should <expected> when <condition>`.
**Visual values**: `docs/harness/progress/pen-extract-44.md` only. A value missing there is asked of the leader, never invented (constitution, Development Workflow). Copy: `docs/business/muush-1.0.md` § 4.2–4.5, verbatim.
**Branch**: `feat/v2-home`. No commit unless Roberto asks.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: parallelizable (different files, no dependency on an unfinished task)
- **[Story]**: US1 Hero · US2 Qué es muush · US3 Servicios · US4 Cómo trabajamos · US5 retirement, page, SEO · US6 logo `aria-current`

---

## Phase 1: Setup

- [x] T001 Copy `docs/harness/progress/assets-44/world-dots.svg` byte-for-byte to `app/assets/map/world-dots.svg`; add `app/assets/map/README.md` stating source (leader export from `muush.pen`, 2026-11-01), viewBox `0 0 1408 470`, 1693 dots, `fill="currentColor"`, consumed with `?raw` (research R3).
- [x] T002 [P] Add the nine lucide glyphs `compass`, `layout-dashboard`, `workflow`, `pen-tool`, `message-circle-warning`, `sliders-horizontal`, `user-round`, `file-text`, `key-round` as `app/assets/icons/<name>.svg` following the contract in `app/assets/icons/README.md` (square viewBox, `currentColor`, `<title>`, no width/height), and add one "Per file" entry each to that README. **Blocked until the SVG sources are available** (research R11): stop and ask the leader if they are not supplied; do not add an npm package.
- [x] T003 [P] Add the tokens of data-model § 6 to `app/assets/css/global.css` in the Muush 1.0 block (`:root` values, `@theme inline` utilities, the 0 ms reduced-motion override for `--progreso-paso`), with a comment citing pen extract-44 sections; before adding each `--text-*`, `--spacing-*`, `--radius-*`, `--color-*` key, grep the v1 theme for the same key and, on a collision, rename the v1 key to `legacy-*` and its v1 consumers (research R12). Reuse existing tokens where data-model § 6 says so (`--punto-halo2`, `--seccion-y`, `--radio-tile`, `--texto-suave`, `--texto-tenue`, `--linea`, `--linea-fuerte`, `--blanco-85`, `--blanco-15`, `--pill-fondo`, `--franja-fondo`, `--vidrio-fondo`).
- [x] T004 Extend `tests/design-tokens.test.ts` to pin every token added in T003 at the 390 and 1440 anchors (fluid clamps evaluated at both widths) and that none is declared twice.

---

## Phase 2: Foundational (blocks every story)

**Quarantine the v1 home first: the v2 files reuse its names (research R1).**

- [x] T005 `git mv` the v1 UI files and their `.test.ts` / `.stories.ts` from `app/features/landing/ui/` to `app/features/landing/ui/legacy/`: `HeroSection`, `PurposeSection`, `PurposeCard`, `PurposeCarousel`, `PurposeConstellation`, `ServicesSection`, `ServiceItem`, `ServicesConnectors`, `ServicesConstellation`, `ServicesTimeline`, `ContactSection` (plus `ServicesTimeline.float.test.ts`). Keep their `Legacy v1/Landing/…` story titles.
- [x] T006 `git mv` `app/features/landing/data/{heroContent,purposeContent,servicesContent}.ts` (+ tests) to `app/features/landing/data/legacy/` and `app/features/landing/logic/{usePurposeArcRadii,usePurposeCarousel,useServicesLyrics,useHeroContent,usePurposeContent,useServicesContent}.ts` (+ tests) to `app/features/landing/logic/legacy/`.
- [x] T007 Rewrite every import in the moved files and in `app/features/landing/index.ts` to the new paths (aliases; relative only within the same folder); move the page's `mt-section-gap` onto the root `<section>` of `app/features/landing/ui/legacy/ContactSection.vue` and remove it from `app/pages/index.vue` (research R14).
- [x] T008 Update the path-dependent tests: `tests/tablet-layout-tokens.test.ts` (import `SERVICE_NODE_CENTRES` from `@/features/landing/data/legacy/servicesContent`; read `ContactSection.vue` and `PurposeSection.vue` from `ui/legacy/`). Run `pnpm typecheck && pnpm test`: the site must build and render exactly as before this phase.
- [x] T009 [P] Create `app/shared/data/layout.ts` exporting `DESKTOP_MEDIA_QUERY = '(min-width: 64rem)'` (moved from `app/features/shell/logic/useMobileMenu.ts`, which now imports it) with `layout.test.ts`.
- [x] T010 [P] Create `app/shared/logic/useDesktopLayout.ts` (`Readonly<Ref<boolean>>`, `false` on the server, `matchMedia(DESKTOP_MEDIA_QUERY)` listener removed on scope dispose) and `useDesktopLayout.test.ts`.

**Checkpoint**: v1 home unchanged on screen; `landing/ui/` holds no v1 file.

---

## Phase 3: User Story 1 — Hero (P1) 🎯 MVP

**Goal**: v2 hero over the listón with pill, h1, subtitle and two CTAs.
**Independent test**: Storybook `Landing/HeroSection` ES/EN at 390/1440 vs pen extract § 1; both links reach `#diagnostico` and `#como-trabajamos`.

- [x] T011 [P] [US1] Add the `landing.hero.*` v2 keys (data-model § 5) to `i18n/locales/es.json` and `i18n/locales/en.json`, replacing the v1 `landing.hero` object (its legacy component keeps inline story fixtures). Temporarily keep `landing.hero.ctaSecondary` only if `tests/forms-copy.test.ts` still reads it; T055 removes that dependency.
- [x] T012 [P] [US1] Create `app/features/landing/data/heroContent.ts` (`HERO_KEYS`, `HeroContent`) and `heroContent.test.ts` (four pill keys in order; every key present in both locale files, read from disk per rules § R27).
- [x] T013 [US1] Create `app/features/landing/logic/useHeroContent.ts`: resolves the keys and builds `primaryHref` / `secondaryHref` as `localePath({ name: 'index' })` + `#` + `SECTION_ANCHORS.assessment` / `.howWeWork`.
- [x] T014 [US1] Create `app/features/landing/ui/HeroSection.vue` per contract: `<section>` `relative isolate`, `ShaderBackground preset="homeHero"`, content `relative z-10`; `min-h-portada-alto`, `pt-portada-arriba`, `pb-portada-abajo`, `px-gutter`; column centred, `gap-portada-gap`; `RotatingPill`, `Heading level=1 size=hero` (second line Gris 400), subtitle `text-subtitulo text-texto-suave max-w-medida`, buttons row `flex flex-wrap justify-center gap-portada-botones-gap pt-portada-botones-arriba` (Clarifications Q1); mobile content vertically centred (`max-lg:justify-center`), desktop from the top.
- [x] T015 [P] [US1] Create `app/features/landing/ui/HeroSection.test.ts`: one `h1` with both lines; pill items passed; primary/secondary hrefs and labels; background preset `homeHero`; no hardcoded string.
- [x] T016 [P] [US1] Create `app/features/landing/ui/HeroSection.stories.ts` (`title: 'Landing/HeroSection'`, Negro 950 background, fullscreen): ES and EN at `mobile` and `desktop`, plus a 360 px story showing the wrapped button row.

---

## Phase 4: User Story 2 — Qué es muush and the map (P1)

**Goal**: map section with pins, legend, mobile tabs and zoom.
**Independent test**: Storybook `Shared/UI/WorldMap` and `Landing/WhoWeAreSection` at 390/768/1024/1440; keyboard on tabs; reduced motion; no network request.

- [x] T017 [P] [US2] Create `app/shared/data/mapPins.ts` (`MapPinKind`, `MapCity`, `MAP_SIZE`, `MAP_PINS` from data-model § 1) and `mapPins.test.ts` (nine unique cities, inside `MAP_SIZE`, kinds as tabulated).
- [x] T018 [P] [US2] Create `app/shared/data/mapRegions.ts` (`MAP_REGIONS` america/europe from the handoff `REGIONES`, `MAP_WINDOW_ASPECT = 342 / 240`) and `mapRegions.test.ts`.
- [x] T019 [US2] Create `app/shared/utils/mapGeometry.ts` (`regionTransform`, `pinPosition`, `isInRegion`) and `mapGeometry.test.ts`: transform equals the handoff's contain-fit at 342×240, 600×421 and 300×210 (translated to percentages); every pin is in exactly one region.
- [x] T020 [US2] Create `app/shared/logic/useMapRegion.ts` (`nextRegion` pure; `useMapRegion` with `region`, `select`, `onKeydown` moving selection and focus; ArrowLeft/Right wrap, Home, End) and `useMapRegion.test.ts`.
- [x] T021 [P] [US2] Create `app/shared/ui/MapPin.vue` (three circles per kind, pen extract § 2.1 table; `size-pin`; counter-scale `scale-[calc(1/var(--mapa-zoom))]` expressed via a utility in `global.css`, no literal; `aria-hidden`) with `MapPin.test.ts` and `MapPin.stories.ts` (`Shared/UI/MapPin`, three kinds).
- [x] T022 [P] [US2] Create `app/shared/ui/MapRegionTabs.vue` (tablist named by prop, roving tabindex, `aria-selected`, `aria-controls`; container `bg-carbon-800 rounded-control p-selector-pad gap-selector-pad`; active `bg-blanco-10 rounded-pestana text-pestana text-blanco`, inactive `text-gris-400`) with `MapRegionTabs.test.ts` (keyboard: arrows, Home, End; only selected tab in tab order; emits `select`) and stories.
- [x] T023 [P] [US2] Create `app/shared/ui/MapLegend.vue` (desktop row `gap-leyenda-gap`, 8 px dots red/acero; optional soon chip `lg:hidden` with `bg-vidrio-fondo rounded-pill borde-linea px-chip-x py-chip-y gap-chip-gap` and the hollow marker; "anywhere" line) with test and stories.
- [x] T024 [US2] Create `app/shared/ui/WorldMap.vue` per contract and research R4–R6: inlined `world-dots.svg?raw` (`text-mapa-punto`, `aria-hidden`), canvas with `MapPin`s at `pinPosition`, `lg:opacity-(--mapa-opacidad)` block, mobile window `aspect-[--mapa-ventana]` via token, `rounded-caja`, `overflow-clip`, `max-w-mapa-ventana-max`; `max-lg:` transform from `regionTransform` through inline custom properties `--mapa-tx`, `--mapa-ty`, `--mapa-zoom`; `transition-transform duration-(--lento) ease-muush motion-reduce:transition-none`; `role="tabpanel"` + `aria-labelledby` only while `useDesktopLayout()` is false; `sr-only` city list grouped by kind with `max-lg:hidden` on items outside the selected region.
- [x] T025 [P] [US2] Create `app/shared/ui/WorldMap.test.ts` (nine pins; America selected by default; Europe tab changes the custom properties; hidden list contents per region; dots `aria-hidden`; tabpanel role absent when desktop) and `WorldMap.stories.ts` (`Shared/UI/WorldMap`, ES/EN, mobile America, mobile Europe, desktop).
- [x] T026 [P] [US2] Add the `landing.whoWeAre.*` keys (data-model § 5, including the † keys, confirmed by Roberto 2026-11-01) to both locale files.
- [x] T027 [P] [US2] Create `app/features/landing/data/whoWeAreContent.ts` + test (keys in both locales; nine city keys match `MapCity`).
- [x] T028 [US2] Create `app/features/landing/logic/useWhoWeAreContent.ts`.
- [x] T029 [US2] Create `app/features/landing/ui/WhoWeAreSection.vue` (padding `py-mapa-y`, `gap-mapa-gap`, centred; `Pill`, `Heading size=seccion level=2` centred, `WorldMap` (selector inside, before the map below `lg`), body `text-cuerpo max-w-medida` Gris 400 from `lg` and `text-texto-suave` below, `MapLegend`) with `WhoWeAreSection.test.ts` and `WhoWeAreSection.stories.ts` (`Landing/WhoWeAreSection`, ES/EN × mobile/desktop).

---

## Phase 5: User Story 3 — Servicios (P1)

**Goal**: four cards, carousel with indicator, "También" strip, `#servicios`.
**Independent test**: Storybook `Landing/ServicesSection` at 390/1024/1440; scroll the carousel by touch and keyboard; indicator.

- [x] T030 [P] [US3] Create `app/features/landing/logic/carouselIndicator.ts` (`activeCardIndex`, `ACTIVE_LINE_RATIO`, `END_TOLERANCE_PX`) and its test (start, each snap point, mid-swipe, end-of-scroll → last).
- [x] T031 [US3] Create `app/features/landing/logic/useCarouselIndicator.ts` (passive scroll, rAF-coalesced, computed on mount, listener removed on dispose) and its test.
- [x] T032 [P] [US3] Replace the v1 `landing.services` object in both locale files with the v2 keys (data-model § 5; titles with `\n` for software and design, research R10).
- [x] T033 [P] [US3] Create `app/features/landing/data/servicesContent.ts` (`SERVICE_CARDS` order/icon/light, `SERVICES_KEYS`, `ServicesContent`) + test.
- [x] T034 [US3] Create `app/features/landing/logic/useServicesContent.ts`.
- [x] T035 [P] [US3] Create `app/features/landing/ui/ServiceCard.vue` (`GlassSurface preset="servicio" as="article"`; visual `h-tarjeta-visual` with `bg-(image:--luz-…)` per `light`; tile `size-tile rounded-tile bg-(image:--tile-fondo)` + `borde-tile` edge + `shadow-(--tile-sombra)` + `backdrop-blur-boton`, icon `size-tile-icono` via `?raw` in an `aria-hidden` wrapper with `stroke-width: var(--icono-trazo)`; text block padding/gap tokens; `h3 text-servicio lg:whitespace-pre-line`; description `text-p text-texto-suave`) with test and stories (four variants).
- [x] T036 [P] [US3] Create `app/features/landing/ui/CarouselIndicator.vue` (`aria-hidden`; active `w-indicador-activo bg-red-muush-500`, others `size-indicador-punto bg-blanco-25`, `rounded-indicador`, width transition `duration-(--medio)`) with test and stories.
- [x] T037 [US3] Create `app/features/landing/ui/ServicesCarousel.vue` (`<ul>` scroller below `lg`: `flex gap-tarjetas-gap overflow-x-auto snap-x snap-mandatory scroll-pl-gutter -mx-gutter px-gutter` scrollbar hidden, items `w-tarjeta-movil shrink-0 snap-start`; from `lg` `grid grid-cols-4 items-start overflow-visible mx-0 px-0`; `tabindex="0"`, `role="region"`, `aria-labelledby`; `CarouselIndicator lg:hidden`) with test (indicator follows a simulated scroll; grid classes at `lg`) and stories.
- [x] T038 [P] [US3] Create `app/features/landing/ui/AlsoAvailable.vue` (desktop `GlassSurface preset="franja"` `hidden lg:flex justify-between`, label `text-rotulo uppercase text-gris-400`, chips `rounded-pill border border-blanco-15 px-chip-x py-chip-y gap-chip-gap` with 6 px Acero 200 dot and `text-nota text-blanco`, note `text-nota text-gris-400`; mobile card `lg:hidden rounded-caja borde-linea p-tambien-pad gap-tambien-gap`, label `text-rotulo-movil`, "Creativo · Marketing" `text-tambien` with `aria-hidden` separator, note `text-nota text-texto-suave`) with test and stories.
- [x] T039 [US3] Create `app/features/landing/ui/ServicesSection.vue` (`:id="SECTION_ANCHORS.services"`, `py-servicios-y lg:px-gutter-desktop px-gutter`, `gap-servicios-gap`, head left `gap-servicios-cabeza`, `Heading size=seccion level=2` with an id for `aria-labelledby`) with `ServicesSection.test.ts` and `ServicesSection.stories.ts` (`Landing/ServicesSection`, ES/EN × mobile/desktop, plus 1024).

---

## Phase 6: User Story 4 — Cómo trabajamos (P2)

**Goal**: five-step timeline with scroll fill, lit states, mobile rail.
**Independent test**: Storybook `Landing/HowWeWorkSection` (progress control story) and the generated page scrolled at 390/1440, with reduced motion.

- [x] T040 [P] [US4] Create `app/features/landing/logic/timelineProgress.ts` (functions and constants of the contract) and its test (clamps at 0 and 1; lit thresholds both orientations).
- [x] T041 [US4] Create `app/features/landing/logic/useTimelineProgress.ts` (initial `progress = 1`, all lit; reduced motion → no listeners; otherwise compute on mount and on passive scroll/resize via rAF, orientation from `useDesktopLayout`; cleanup) and its test (server/reduced state lit; scroll updates; dispose removes listeners).
- [x] T042 [P] [US4] Add `landing.howWeWork.*` keys (data-model § 5, incl. `steps.assessment.descriptionShort`) to both locale files.
- [x] T043 [P] [US4] Create `app/features/landing/data/howWeWorkContent.ts` (`PROCESS_STEPS` keys/numbers/icons/`hasShort`, `HOW_WE_WORK_KEYS`) + test.
- [x] T044 [US4] Create `app/features/landing/logic/useHowWeWorkContent.ts`.
- [x] T045 [P] [US4] Create `app/features/landing/ui/CommitmentChip.vue` (desktop `hidden lg:inline-flex` `bg-pill-fondo rounded-pill` top-lit `borde-chip`, `backdrop-blur-pill`, `h-chip-compromiso-alto`, icon bubble `size-burbuja bg-rojo-15 rounded-full` with icon `size-burbuja-icono text-compromiso-icono`, text `text-compromiso text-blanco`; mobile `lg:hidden` `bg-rojo-10 border border-rojo-25 rounded-pill px-chip-movil-x py-chip-movil-y` with 5 px red dot and `text-compromiso-movil`) with test and stories.
- [x] T046 [P] [US4] Create `app/features/landing/ui/ProcessStep.vue` (`<li>`, `lit` prop driving `data-lit`; desktop: dot `size-paso-punto` halo `bg-blanco-6`/`bg-rojo-20` + core `size-paso-nucleo` `bg-negro-950 border-texto-tenue`/`bg-red-muush-500`, number `text-paso-numero` Gris 400/Coral 300 `aria-hidden`, `h3 text-paso text-blanco`, description `text-paso-texto` Gris 400/`text-blanco-85`; mobile row with `w-riel` rail dot; step-01 full `hidden lg:inline` / short `lg:hidden` (R9); `CommitmentChip`; colour transitions `duration-(--medio)` `motion-reduce:transition-none`) with test (both states, short/full copy) and stories (lit, not lit).
- [x] T047 [US4] Create `app/features/landing/ui/ProcessTimeline.vue` (`<ol>` `grid gap-pasos-gap lg:grid-cols-5`; `style="--progreso: …"` from `useTimelineProgress`; desktop track `h-linea-proceso bg-(image:--proceso-linea)` behind the dots and fill `bg-red-muush-500 origin-left scale-x-(--progreso)`; mobile track `w-linea-proceso bg-linea-fuerte` + fill `origin-top scale-y-(--progreso)`; both `transition-transform duration-(--progreso-paso) ease-linear motion-reduce:transition-none`; passes `lit[i]`) with test and stories (progress 0, 0.5, 1).
- [x] T048 [US4] Create `app/features/landing/ui/HowWeWorkSection.vue` (`:id="SECTION_ANCHORS.howWeWork"`, `relative isolate`, `ShaderBackground preset="howWeWork"`, content `relative z-10 py-proceso-y px-gutter lg:px-gutter-desktop gap-proceso-gap`; head centred from `lg`, left below; `Heading size=proceso level=2`) with `HowWeWorkSection.test.ts` and `HowWeWorkSection.stories.ts` (`Landing/HowWeWorkSection`, ES/EN × mobile/desktop, reduced-motion note).

---

## Phase 7: User Story 5 — Page composition, retirement, links and SEO (P2)

**Goal**: the home renders the v2 sections and the v1 contact only; no dead anchor; SEO intact.
**Independent test**: generated `/es` and `/en` (quickstart § 3–4).

- [x] T049 [US5] Rewrite `app/features/landing/index.ts` per contract (v2 sections, content composables and types; `ContactSection` from `./ui/legacy/ContactSection.vue`, `useContactContent`, `ContactContent`).
- [x] T050 [US5] Rewrite `app/pages/index.vue`: `HeroSection`, `WhoWeAreSection`, `ServicesSection`, `HowWeWorkSection`, `ContactSection` (unchanged props and form wiring), no margin classes, same `usePageSeo` call; update its doc comment (Proyectos never built; Propósito retired by Roberto 2026-10-31).
- [x] T051 [US5] Delete `app/features/landing/logic/legacy/{useHeroContent,usePurposeContent,useServicesContent}.ts`, then delete the constants and types in `app/features/landing/data/legacy/` that `pnpm typecheck` and `biome` report unread (`HERO_KEYS`, `HERO_DESTINATIONS`, `PURPOSE_KEYS`, `SERVICES_KEYS`, and their tests' cases), keeping what the legacy UI imports.
- [x] T052 [US5] Remove from both locale files every v1 key with no reader: `landing.purpose.*` and any remaining v1 `landing.hero` / `landing.services` leaf (data-model § 5, "Removed"); confirm with a grep of `app/` for each removed key.
- [x] T053 [US5] Rewrite `tests/landing-copy.test.ts` for the v2 copy (exact ES/EN strings of § 4.2–4.5, the short step-01 sentence, the uppercase-by-CSS labels stored in sentence case).
- [x] T054 [US5] Edit `tests/static-output.test.ts` § "the landing hero": find the v2 hero by its `h1`; assert ES/EN copy, exactly one `h1`, primary `href="<home>#diagnostico"`, secondary `href="<home>#como-trabajamos"`; assert sections in order with ids `servicios`, `como-trabajamos`, `diagnostico`; assert no `id="proposito"` and no link to `#proposito`/`#proyectos`; add a check that every `href` with a fragment in the generated `es`/`en` home, about and 404 documents names an id present in its target document (FR-026); assert the map dots are inline (no `world-dots` URL in the output).
- [x] T055 [US5] Edit `tests/forms-copy.test.ts`: remove the assertion that `landing.contact.ctaSecondary` equals `landing.hero.ctaSecondary` (the v2 hero has no call CTA) with a one-line comment citing this feature; then drop any temporary `landing.hero.ctaSecondary` key left by T011.
- [x] T056 [US5] Run `tests/seo-output.test.ts` unchanged: title, description, canonical, hreflang, robots, structured data and sitemap for `/es` and `/en` must pass without edits (FR-027). If it fails, fix the code, not the test.

---

## Phase 8: User Story 6 — Logo `aria-current` (P3)

**Goal**: no logo link carries `aria-current`.
**Independent test**: generated `/es` header at top: only "Inicio" is current.

- [x] T057 [P] [US6] Add `:aria-current="undefined"` with the CTA's explanatory comment to the logo `NuxtLink` in `app/features/shell/ui/SiteHeader.vue`, and a case in `SiteHeader.test.ts`.
- [x] T058 [P] [US6] Same in `app/features/shell/ui/MobileMenu.vue` + `MobileMenu.test.ts`.
- [x] T059 [P] [US6] Same in `app/features/shell/ui/SiteFooter.vue` + `SiteFooter.test.ts`.
- [x] T060 [P] [US6] Same in `app/features/shell/ui/MobileFooter.vue` + `MobileFooter.test.ts`.
- [x] T061 [US6] In `tests/static-output.test.ts`, assert that on generated `/es` and `/en` no link whose `aria-label` is the logo's (`shell.nav.home`) carries `aria-current`, and the Home nav item carries `aria-current="page"`.

---

## Phase 9: Polish & cross-cutting

- [x] T062 Extend `tests/token-literals.test.ts` to scan every new `.vue` and `.stories.ts` of this feature (landing and shared) for hex/rgb/px literals and v1 token utilities (`bone-`, `ink-`, `red-<n>`, `wine-`, `legacy-`).
- [x] T063 [P] Verify no v2 file imports a quarantine path: `grep -rn "legacy/" app/features/landing/ui/*.vue app/features/landing/logic/*.ts app/features/landing/data/*.ts app/shared/ui/*.vue` returns only the barrel's `ContactSection`/contact lines; and no story outside `legacy/` has a `Legacy v1/` title, none inside lacks it.
- [x] T064 [P] Verify every component file is < 200 lines (`wc -l app/features/landing/ui/*.vue app/shared/ui/{WorldMap,MapPin,MapRegionTabs,MapLegend}.vue`); split if not.
- [x] T065 Visual pass in a real browser on the generated site at 360, 390, 768, 1024, 1280, 1440, 1920 (ES and EN), with reduced motion on, with JavaScript off and without WebGL, per `quickstart.md`; record results and any deviation in `docs/harness/progress/current.md` (Technical findings go to `docs/harness/findings.md`, never to `docs/business/`).
- [x] T066 Run `./init.sh` (check, typecheck, test, generate, storybook:build) until it exits 0; update `docs/harness/progress/current.md`.

---

## Amendment: Radar ping on markers (Roberto 2026-11-01)

Spec § Amendments, FR-034…FR-038; pen extract-44 § 9.

- [x] T067 Add `--pulso`, `@keyframes pulso` and the `pulso` utility to `app/assets/css/global.css` (v2 vocabulary, no v1 keyframes); remove the static ring tokens; pin them in `tests/design-tokens.test.ts`.
- [x] T068 Rebuild the `Pill` dot as a 7 px pinging dot in its 20 px footprint (covers `RotatingPill`); update `Pill.test.ts` and `Pill.stories.ts`.
- [x] T069 Rebuild `MapPin` as an 8 px dot in its 28 px footprint, pinging for team (red) and partner (Acero 200), none for soon; update `MapPin.test.ts` and `MapPin.stories.ts`.
- [x] T070 Verify in headless Chrome: ping running, footprints 36 / 28, no ghost under reduced motion.
- [x] T071 Apply pen extract § 10: card title 34 px line box, step title 1.41, step number 1.23, commitment chip 8 / 10 / 8 / 8 with gap 6 and blur 16, "Estonia · pronto" chip 13 / 400 Blanco with a 6 px Acero 400 dot; update tests; re-measure 407 / 384 cards, 730 section, carousel end ≈ 633.
- [x] T072 Lit step dots ping (desktop core and mobile rail dot), no static halo, unlit and reduced motion without ping (FR-039, pen extract § 11); update `ProcessStep.test.ts`; verify in headless Chrome.

## Dependencies & execution order

- **Transient state:** from T011/T032 until T050–T053, the still-mounted v1 sections read keys that no longer exist and `tests/landing-copy.test.ts` pins v1 copy; both are expected to fail until US5 lands. Do not run `./init.sh` as a gate before T053.

- **Phase 1** → **Phase 2** → stories. T003 (tokens) before any component task; T002 (icons) before T035, T045.
- **Phase 2** blocks all stories (names freed, `useDesktopLayout`, `DESKTOP_MEDIA_QUERY`).
- **US1, US2, US3, US4** are independent of each other after Phase 2 (each adds its own keys, data, logic, UI); US4's `ProcessTimeline` uses `useDesktopLayout` from Phase 2 only.
- **US5** depends on US1–US4 (composes them) and closes the v1 keys.
- **US6** is independent (shell only) and can run any time after Phase 2; T061 after T054 (same test file).
- **Polish** last.

Within a story: keys and data → logic (+ tests) → leaf components → section → stories.

## Parallel examples

- Phase 1: T002 ∥ T003.
- US2: T017 ∥ T018 ∥ T026 ∥ T027; then T021 ∥ T022 ∥ T023 after T019–T020.
- US3: T030 ∥ T032 ∥ T033; then T035 ∥ T036 ∥ T038.
- US4: T040 ∥ T042 ∥ T043; then T045 ∥ T046.
- US6: T057 ∥ T058 ∥ T059 ∥ T060.

## Implementation strategy

1. MVP: Phases 1–2, then US1 (hero) — reviewable in Storybook.
2. Add US2, US3, US4 (any order; Storybook-reviewable one by one).
3. US5 switches the page over and retires v1; US6 at any point.
4. Polish, `./init.sh` green → status `reviewing` via the leader, reviewer run.

## Amendment: Roberto review 2026-11-02

Spec § Amendments, FR-040…FR-047.

- [x] T073 Centre the header link bar: `lg:grid lg:grid-cols-cabecera` (`--grid-template-columns-cabecera: 1fr auto 1fr`) on the nav, `lg:justify-self-start` / `lg:justify-self-end` on the outer slots; test in `SiteHeader.test.ts`; pin the token (FR-040).
- [x] T074 Ping the desktop "También" chip dots (`relative … pulso`); update `AlsoAvailable.test.ts` and its story notes (FR-041).
- [x] T075 Add `dotProgress` and `litUpTo` to `timelineProgress.ts`; create `useTimelineHover.ts` with tests (FR-042, FR-043, FR-045).
- [x] T076 Remove the desktop scroll fill: drop `horizontalProgress`, `isStepLitHorizontal`, `HORIZONTAL_TRAVEL_RATIO`, the composable's `progress` and its desktop branch, and the `--proceso-linea` token; the line rests `bg-linea-fuerte` with the red fill at `--progreso` 0 (FR-044).
- [x] T077 `ProcessStep`: `columnLit` (desktop) apart from `lit` (rail), `raised`, `focusable`, `data-punto-paso`; numbers `text-blanco`; unlit dots `pulso pulso-tenue` (FR-043, FR-044, FR-046, FR-047); update tests and stories.
- [x] T078 `ProcessTimeline`: wire `useTimelineHover`; update tests, stories and `tests/static-output.test.ts` (desktop unlit in the generated HTML, rail full).
- [x] T079 Verify in headless Chrome and run `./init.sh` to exit 0.
- [x] T080 One trail (FR-048): drop the unlit desktop dot's `bg-blanco-6` halo; `pulso` ghost at `inset: calc(-1 * var(--pulso-borde, 0rem))`, `pulso-tenue` sets `--pulso-borde: var(--trazo-anillo)`; tests pin both; frames captured in headless Chrome.
