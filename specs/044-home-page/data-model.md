# Data model · feature 44 home page

All data is static and compiled into the site. `data/` holds keys and
descriptors; `logic/` resolves them (the only place `useI18n` /
`useLocalePath` run); `ui/` receives resolved values.

## 1 · Map (shared, `app/shared/data/`)

### `mapPins.ts`

```ts
type MapPinKind = 'team' | 'partner' | 'soon'
type MapCity =
  | 'cdmx' | 'puebla' | 'merida' | 'dublin' | 'nyc'
  | 'sanFrancisco' | 'losAngeles' | 'amsterdam' | 'estonia'
interface MapPin { city: MapCity; x: number; y: number; kind: MapPinKind }
export const MAP_SIZE = { width: 1408, height: 470 } as const
export const MAP_PINS: readonly MapPin[]
```

Values transcribed from `docs/harness/progress/assets-44/map-pins.json`
(leader export, 2026-11-01):

| city | x | y | kind |
|---|---|---|---|
| cdmx | 338 | 254 | team |
| puebla | 342 | 255 | team |
| merida | 373 | 248 | team |
| dublin | 681 | 134 | team |
| nyc | 431 | 179 | team |
| amsterdam | 722 | 138 | partner |
| estonia | 795 | 113 | soon |
| sanFrancisco | 252 | 189 | team |
| losAngeles | 268 | 202 | team |

Unit tests: nine pins, unique cities, every pin inside `MAP_SIZE`, kinds as
listed, every pin in exactly one region.

### `mapRegions.ts`

```ts
type MapRegionName = 'america' | 'europe'
interface MapRegion { name: MapRegionName; x: number; y: number; width: number; height: number }
export const MAP_REGIONS: readonly MapRegion[]   // order = tab order
export const MAP_WINDOW_ASPECT = 342 / 240       // the 390 frame's map box
```

| name | x | y | width | height | source |
|---|---|---|---|---|---|
| america | 210 | 95 | 285 | 200 | handoff `REGIONES.america` |
| europe | 645 | 75 | 190 | 95 | handoff `REGIONES.europa` |

### `layout.ts`

`export const DESKTOP_MEDIA_QUERY = '(min-width: 64rem)'` — moved from
`app/features/shell/logic/useMobileMenu.ts` (research R5).

## 2 · Map geometry (`app/shared/utils/mapGeometry.ts`, pure)

```ts
interface RegionTransform { zoom: number; translateXPercent: number; translateYPercent: number }
export function regionTransform(region: MapRegion, windowAspect: number): RegionTransform
export function pinPosition(pin: MapPin): { leftPercent: number; topPercent: number }
export function isInRegion(pin: MapPin, region: MapRegion): boolean
```

`regionTransform` is the handoff's contain-fit with the window's width as
unit: `s = min(1408 / w, (1408 / windowAspect) / h)` relative to the
full-width canvas; offsets centre the region. Tests compare it with the
handoff formula evaluated at 342 × 240, 600 × 421 and 300 × 210.

## 3 · Map state (`app/shared/logic/useMapRegion.ts`)

| State | Values | Transitions |
|---|---|---|
| `region` | `MapRegionName`, initial `'america'` (SSR and no-JS) | `select(name)` ← tab click; `onKeydown` ← ArrowLeft/Right (wrap), Home, End on the tab list |

`nextRegion(current, key): MapRegionName | null` is pure and unit-tested.
`useDesktopLayout()` (`app/shared/logic/`): `isDesktop` ref, `false` on the
server, follows `matchMedia(DESKTOP_MEDIA_QUERY)` with a cleaned-up
listener.

## 4 · Landing data (`app/features/landing/data/`)

| File | Exports |
|---|---|
| `heroContent.ts` | `HERO_KEYS` (pill items ×4, headline first/second, subtitle, primary, secondary); `HeroContent` |
| `whoWeAreContent.ts` | `WHO_WE_ARE_KEYS` (pill, heading first/second, body, legend team/partner/soon/anywhere, tabs label, region labels, city names); `WhoWeAreContent` |
| `servicesContent.ts` | `SERVICE_CARDS: readonly ServiceCardModel[]` (key, icon, light); `SERVICES_KEYS` (pill, heading, also label/chips/note/mobile title); `ServicesContent` |
| `howWeWorkContent.ts` | `PROCESS_STEPS: readonly ProcessStepModel[]` (key, number, icon, hasShort); `HOW_WE_WORK_KEYS`; `HowWeWorkContent` |

```ts
type ServiceIcon = 'compass' | 'layout-dashboard' | 'workflow' | 'pen-tool'
type ServiceLight = 'crimsonBottomLeft' | 'aceroBottomRight' | 'arenaTopRight'
interface ServiceCardModel { key: 'strategy' | 'software' | 'automation' | 'design'; icon: ServiceIcon; light: ServiceLight }
// order: strategy/compass/crimsonBottomLeft, software/layout-dashboard/aceroBottomRight,
//        automation/workflow/crimsonBottomLeft, design/pen-tool/arenaTopRight

type StepIcon = 'message-circle-warning' | 'sliders-horizontal' | 'user-round' | 'file-text' | 'key-round'
interface ProcessStepModel { key: 'assessment' | 'proposal' | 'design' | 'build' | 'launch'; number: '01'|'02'|'03'|'04'|'05'; icon: StepIcon; hasShort: boolean }
// only 'assessment' hasShort: true
```

The `logic/use*Content.ts` composables resolve these into plain strings,
plus the hero hrefs (`localePath({ name: 'index' })` + `#` +
`SECTION_ANCHORS.assessment` / `.howWeWork`). Unit tests pin orders, icons,
lights and that every key exists in both locale files.

## 5 · i18n keys (both locales; copy from `muush-1.0.md` § 4.2–4.5 and pen extract)

| Key | ES | EN |
|---|---|---|
| `landing.hero.pill.strategy` / `software` / `automation` / `design` | Estrategia tecnológica · Software, web y nube · Automatización, datos e IA · Diseño de producto y UX | Technology strategy · Software, web and cloud · Automation, data and AI · Product design and UX |
| `landing.hero.headline.first` / `second` | Hablamos negocio · y código. | We speak business · and code. |
| `landing.hero.subtitle` | Diseñamos y construimos las soluciones digitales que tu negocio usa todos los días. | We design and build the digital solutions your business uses every day. |
| `landing.hero.primary` / `secondary` | Diagnóstico gratis · Cómo trabajamos | Free assessment · How we work |
| `landing.whoWeAre.pill` | Qué es muush | Who we are |
| `landing.whoWeAre.heading.first` / `second` | Un equipo base y aliados de confianza, · según lo que pida tu proyecto. | A core team and trusted partners, · shaped by what your project needs. |
| `landing.whoWeAre.body` | Estrategia, diseño e ingeniería trabajan juntos desde el primer día. Cuando el proyecto lo pide, sumamos aliados con el mismo estándar, estén donde estén. | Strategy, design and engineering work together from day one. When the project calls for it, we bring in partners held to the same standard, wherever they are. |
| `landing.whoWeAre.legend.team` / `partner` / `anywhere` | Equipo · Aliados · Trabajamos con clientes en cualquier país. | Team · Partners · We work with clients in any country. |
| `landing.whoWeAre.legend.soon` | Estonia · pronto | Estonia · soon |
| `landing.whoWeAre.regions.america` / `europe` | América · Europa | Americas · Europe |
| `landing.whoWeAre.regions.label` † | Región del mapa | Map region |
| `landing.whoWeAre.cities.<city>` † | CDMX · Puebla · Mérida · Dublín · NYC · San Francisco · Los Ángeles · Ámsterdam · Estonia | CDMX · Puebla · Mérida · Dublin · NYC · San Francisco · Los Angeles · Amsterdam · Estonia |
| `landing.services.pill` | Servicios | Services |
| `landing.services.heading.first` / `second` | Lo que hacemos · por tu negocio. | What we do · for your business. |
| `landing.services.cards.<key>.title` / `description` | § 4.4 (titles with `\n` for software and design, research R10) | § 4.4 |
| `landing.services.also.label` | También, si lo necesitas ‡ | Also, if you need it ‡ |
| `landing.services.also.creative` / `marketing` | Creativo · Marketing | Creative · Marketing |
| `landing.services.also.note` | Contenido, foto, video, redes y anuncios con nuestros aliados. Siempre se cotiza aparte. | Content, photo, video, social media and ads with our partners. Always quoted separately. |
| `landing.howWeWork.pill` | Cómo trabajamos | How we work |
| `landing.howWeWork.heading.first` / `second` | Primero entendemos tu operación, · después decidimos qué se construye. | First we understand how you operate, · then we decide what gets built. |
| `landing.howWeWork.steps.<key>.title` / `description` / `commitment` | § 4.5 | § 4.5 |
| `landing.howWeWork.steps.assessment.descriptionShort` | Una revisión rápida para ver qué conviene resolver. | A quick review to see what's worth solving. |

† New copy from Clarifications Q2, **confirmed by Roberto 2026-11-01**.
‡ Drawn uppercase; stored in sentence case and rendered with `uppercase`
(43's convention, so screen readers do not spell it). The mobile card's
"Creativo · Marketing" line is the two chip keys joined by a decorative
`·` (`aria-hidden`).

Removed in both locales (no reader after R1): `landing.hero.eyebrow`,
`headline`, `subhead`, `ctaPrimary`, `ctaSecondary` (v1); `landing.purpose.*`;
`landing.services.eyebrow`, `consulting`, `software`, `cloud`, `automation`,
`product`, `delivery` (v1). `landing.contact.*` and `pages.home.*` unchanged.

## 6 · New tokens (`app/assets/css/global.css`)

Anchors 390 → 1440; "fluid" = the 42 clamp formula. Names are checked
against the v1 theme before landing (research R12). INFERRED values marked.

### Colour (`:root` + `--color-*` theme alias)

| Token | Value | Use |
|---|---|---|
| `--mapa-punto` | Blanco 18 % (`#F4F4F22E`) | map dots |
| `--pin-equipo-halo` / `-nucleo-halo` | Red 12 % (`--punto-halo2` reused) / Red 33 % (`#E5352F55`) | team pin rings |
| `--pin-aliado-halo` / `-nucleo-halo` | Acero 200 12 % / Acero 200 33 % (`#A6B6B255`) | partner pin rings (12 % INFERRED: "same rings in acero-200") |
| `--blanco-6`, `--blanco-10`, `--blanco-25` | Blanco 6 / 10 / 25 % | active tab, inactive indicator (check 42/43 first; add only if absent). The step halo use was removed 2026-11-02 (FR-048): no timeline dot paints a static halo |
| `--rojo-10`, `--rojo-15`, `--rojo-20`, `--rojo-25` | Red muush 500 at 10 / 15 / 20 / 25 % | mobile chip fill, icon bubble, lit halo, mobile chip stroke |
| `--compromiso-icono` | `#E98A77` | commitment icons (pen value, no palette match) |

### Gradients, edges and shadows (`:root` only)

| Token | Value |
|---|---|
| ~~`--proceso-linea`~~ | **Removed 2026-11-02, superseded by FR-044**: the desktop line is `linea-fuerte` (Blanco 20 %) at rest and red only up to a previewed step. Do not reintroduce. (Was the `.pen` gradient Red muush 500 → Coral 300 35 % → Arena 300 60 % → Acero 200 85 % → transparent.) |
| `--luz-crimson`, `--luz-acero`, `--luz-arena` | radial light, 150 % of the visual area (INFERRED from "size 1.5"), centred bottom-left / bottom-right / top-right, from Crimson 600 50 % / Acero 400 50 % / Arena 300 30 % to transparent |
| `--tile-fondo` | `linear-gradient(200deg, #2C2C2CCC, #141414B3)` |
| `--borde-tile` | `linear-gradient(200deg, Blanco 40 % 0, Blanco 5 % 60 %, Blanco 15 % 100 %)` |
| `--tile-sombra` | `0.3125rem 0.5rem 2.25rem #000000CC` (outer, blur 36, offset 5 / 8) |
| `--borde-chip` | Blanco 20 % → 4 %, 180deg (top-lit) |

### Type (`@theme` `--text-*`)

| Utility | Size | LH | Tracking | Weight |
|---|---|---|---|---|
| `text-paso` | fluid 17 → 22 | 1.2 | fluid 0 → −0.4 px | 500 (Poppins) |
| `text-paso-numero` | 13 | normal | 1 px | 600 |
| `text-paso-texto` | fluid 14 → 15 | fluid 1.45 → 1.5 | — | — |
| `text-compromiso` | 13 (desktop chip) | normal | — | 500 |
| `text-compromiso-movil` | 12 | normal | — | — |
| `text-pestana` | 14 | normal | — | 600 |
| `text-rotulo` | 11 | normal | 1 px | 600 |
| `text-rotulo-movil` | 12 | normal | 1.2 px | 600 |
| `text-tambien` | 18 | 1.2 | — | 500 (Poppins) |
| `text-nota` | 14 | 1.5 | — | 400 |

Reused: `text-hero`, `text-seccion` (Qué es muush, Servicios), `text-proceso`,
`text-subtitulo` (hero), `text-cuerpo` (map body), `text-servicio`, `text-p`,
`text-p-chico` (legend).

### Space, size, radius (`@theme` `--spacing-*`, `--radius-*`)

| Token | 390 | 1440 | Notes |
|---|---|---|---|
| `portada-alto` (min-height) | 740 | 1000 | fluid |
| `portada-arriba` | 110 | 290 | fluid; desktop content starts at y 290 |
| `portada-abajo` | 60 | 60 INFERRED | |
| `portada-gap` | 22 | 28 | fluid |
| `portada-botones-gap` | 8 | 14 | fluid; mobile row wraps (Q1) |
| `portada-botones-arriba` | 8 | 0 | |
| `medida` (max width) | — | 640 | subtitle and map body |
| `mapa-y` | 72 | 110 | fluid section padding |
| `mapa-gap` | 24 | 28 | fluid |
| `mapa-max` | — | 1408 | |
| `mapa-ventana-max` | 640 (accepted, pen extract § 8) | — | mobile window cap; the box is opaque below `lg` |
| `pin` / `pin-halo` / `pin-nucleo` | 28 / 16 / 8 | same | |
| `leyenda-gap` / `leyenda-punto` | 16 / 8 | 22 / 8 | row gap 16 on mobile |
| selector: `selector-pad` 4, `pestana-y` 8, `pestana-x` 16, `radius-pestana` 9 | | | |
| chip: `chip-y` 7, `chip-x` 11 (soon) / 14 (strip), `chip-gap` 6 / 8, `chip-punto` 6 | | | |
| `radius-caja` | 16 | — | mobile map window and "También" card |
| `servicios-y` | 72 (pen extract § 8) | 120 | |
| `servicios-gap` | 24 (pen extract § 8) | 44 | |
| `tarjetas-gap` | 14 | 20 | |
| `tarjeta-movil` | 290 | — | carousel card width |
| `tarjeta-visual` | 210 | 210 | |
| `tile` / `tile-icono` | 96 / 40 | same | `radius-tile` (28) reused |
| tarjeta text padding | 22 / 24 / 28 / 24, gap 10 | same | |
| `franja-grupo-gap` | — | 18 | strip left group |
| `tambien-pad` / `tambien-gap` | 20 / 8 | — | |
| indicator `indicador-activo` 22, `indicador-punto` 6, `radius-indicador` 3, gap 6, top 24 (the section gap, pen extract § 8) | | | |
| `servicios-cabeza` (head gap) | 24 (pen extract § 8) | 22 | |
| `proceso-y` | 72 | 120 | `--seccion-y` values: reuse if identical |
| `proceso-gap` | 24 | 64 | fluid |
| `pasos-gap` | 22 INFERRED (handoff) | 20 | |
| `paso-gap` | 6 | 16 | |
| `paso-punto` / `paso-nucleo` | 12 rail dot / — | 28 / 12 | |
| `riel` | 14 | — | mobile rail column |
| `linea-proceso` | 1 (mobile) | 2 | |
| `burbuja` / `burbuja-icono` | — | 22 / 12 | |
| `chip-compromiso-alto` | — | 38 | padding ≈ 8 |
| `chip-movil-y` / `-x` / `-punto` | 6 / 10 / 5 | — | |

### Motion (`:root`)

`--progreso-paso: 120ms` (handoff linear fill transition; 0 ms under reduced
motion, alongside the 42 tokens).

## 7 · Runtime state (landing composables)

| Composable | State | Transitions |
|---|---|---|
| `useCarouselIndicator(scroller, count)` | `activeIndex` 0 | scroll (rAF) → `activeCardIndex(...)` |
| `useTimelineProgress(list, steps)` | mobile rail only: `lit` all true, `fills` all 1 (SSR, no-JS, reduced) | mount (motion allowed) → computed below `lg`; scroll/resize (rAF) → recomputed below `lg`, skipped from `lg` (FR-044); dispose → listeners removed |
| `useTimelineHover(list, steps)` | desktop preview: `active`, `progress`, `lit` all `null` (rest: every column unlit, grey line; also SSR, no-JS, reduced) | pointer enter / `:focus-visible` focus from `lg` → previewed step (pointer wins); leave / blur → rest (FR-042…FR-045) |

## 8 · Amendment: radar ping on markers (Roberto 2026-11-01)

Pen extract-44 § 9 replaces the static pin and Pill rings with the radar
ping: the pin ring colours of § 6 (`--pin-equipo-*`, `--pin-aliado-*`) and the
`pin-halo` size are not added, and the feature-42 Pill ring tokens
(`--punto-halo`, `--punto-halo2`, `--spacing-pill-halo`) are removed with the
rings. New: `--pulso: 2.4s` (`:root`), `@keyframes pulso` (scale 1 → 3,
opacity 0.6 → 0) and the `pulso` utility (ghost in the dot's own colour, no
ghost under reduced motion).

## 9 · Amendment: § 10 values and the lit step ping (2026-11-01)

- `--text-servicio--line-height` becomes 34 px (its only use is the card
  title); `--text-paso--line-height` 1.41; `--text-paso-numero--line-height`
  1.23 (pen extract § 10).
- Commitment chip: `--spacing-compromiso` 8 (top, bottom, start) and the new
  `--spacing-compromiso-fin` 10 (end); gap `chip-gap` 6; blur `blur-pill` 16.
- The "Estonia · pronto" legend chip marker is `size-chip-punto` (6) in
  Acero 400.
- The lit step's Red 20 % halo is the radar ping (pen extract § 11):
  `--rojo-20` is not kept; the lit core and the lit rail dot use `pulso`.

