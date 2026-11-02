# Contracts · feature 44 components and composables

No component calls a Nuxt composable or holds copy: strings arrive as props
(Article VI; 42/43 rule). Every component below has ES and EN stories at the
`mobile` (390) and `desktop` (1440) viewports on the Negro 950 background,
and a component test. Line budget < 200 each (Article V).

## Shared (`app/shared/`)

### `ui/WorldMap.vue`

| Prop | Type | Notes |
|---|---|---|
| `regions` | `{ name: MapRegionName; label: string }[]` | Tab labels, in tab order. |
| `regionsLabel` | `string` | Tab list name (Q2). |
| `groups` | `{ kind: MapPinKind; label: string }[]` | Hidden-list group headings (legend labels). |
| `cityNames` | `Record<MapCity, string>` | Hidden-list items. |
| `idPrefix` | `string` | Unique ids for tabs/panel (`useId()` default). |

Renders: `MapRegionTabs` (`lg:hidden`), the window/canvas (R4) with the
inlined dots and one `MapPin` per `MAP_PINS`, and the `sr-only` city list
(R6). Uses `useMapRegion`, `useDesktopLayout`. Emits nothing.

### `ui/MapPin.vue`

Props: `kind: MapPinKind`, `leftPercent: number`, `topPercent: number`.
`aria-hidden`. Three circles per kind (pen extract § 2.1); counter-scaled by
`--mapa-zoom`.

### `ui/MapRegionTabs.vue`

Props: `regions`, `selected: MapRegionName`, `label: string`,
`panelId: string`, `idPrefix: string`. Emits `select: [MapRegionName]`.
Keyboard per research R5 (handler from `useMapRegion`).

### `ui/MapLegend.vue`

Props: `items: { kind: MapPinKind | 'none'; label: string }[]`,
`soonLabel?: string` (renders the mobile-only chip, `lg:hidden`). Dots
`aria-hidden`.

### Logic and utils

```ts
// logic/useMapRegion.ts
export function nextRegion(current: MapRegionName, key: string): MapRegionName | null
export function useMapRegion(initial?: MapRegionName): {
  region: Readonly<Ref<MapRegionName>>
  select(name: MapRegionName): void
  onKeydown(event: KeyboardEvent): void   // moves selection and focus
}
// logic/useDesktopLayout.ts
export function useDesktopLayout(): Readonly<Ref<boolean>>   // false on server
// utils/mapGeometry.ts — data-model § 2
// data/mapPins.ts, data/mapRegions.ts, data/layout.ts — data-model § 1
```

## Landing (`app/features/landing/`) — exported through `index.ts`

### `ui/HeroSection.vue`

Props: `pillItems: string[]`, `headlineFirst`, `headlineSecond`, `subtitle`,
`primaryLabel`, `primaryHref`, `secondaryLabel`, `secondaryHref` (strings).
Root `<section>` `relative isolate`, `ShaderBackground preset="homeHero"`,
content `relative z-10`. Composes `RotatingPill`, `Heading level=1
size=hero`, `PrimaryButton size=hero`, `GlassButton`.

### `ui/WhoWeAreSection.vue`

Props: `WhoWeAreContent` (pill, heading first/second, body, legend labels,
soon label, regions, regions label, city names). Composes `Pill`, `Heading
level=2 size=seccion`, `WorldMap`, `MapLegend`. Mobile order puts the
selector before the map (inside `WorldMap`).

### `ui/ServicesSection.vue`

Props: `ServicesContent` (pill, heading, cards `{ title, description, icon,
light }[]`, also `{ label, chips: string[], note }`). Root carries
`:id="SECTION_ANCHORS.services"`. Composes `Pill`, `Heading`,
`ServicesCarousel`, `AlsoAvailable`.

- `ServiceCard.vue` — props `title`, `description`, `icon: ServiceIcon`,
  `light: ServiceLight`; `GlassSurface preset="servicio" as="article"`;
  title `h3`.
- `ServicesCarousel.vue` — props `cards`, `labelledBy: string`; uses
  `useCarouselIndicator`; renders `CarouselIndicator` (`lg:hidden`).
- `CarouselIndicator.vue` — props `count: number`, `active: number`;
  `aria-hidden`.
- `AlsoAvailable.vue` — props `label`, `chips`, `note`; desktop strip
  (`GlassSurface preset="franja"`, `hidden lg:flex`) and mobile card
  (`lg:hidden`).

### `ui/HowWeWorkSection.vue`

Props: `HowWeWorkContent` (pill, heading, steps `{ number, title,
description, descriptionShort?, commitment, icon }[]`). Root carries
`:id="SECTION_ANCHORS.howWeWork"`, `ShaderBackground preset="howWeWork"`.
Head centred from `lg`, left-aligned below.

- `ProcessTimeline.vue` — props `steps`; `<ol>`; uses `useTimelineProgress`
  (mobile rail) and `useTimelineHover` (desktop preview); sets `--progreso`
  from the preview only (0 at rest); draws the desktop line as a
  `bg-linea-fuerte` track with the red fill over it, no gradient (FR-042,
  FR-044, amended 2026-11-02; supersedes the R8 desktop track + scroll fill).
- `ProcessStep.vue` — props step fields + `lit: boolean` (mobile rail,
  scroll) + `columnLit?: boolean` (desktop, preview only, default false) +
  `raised?`, `focusable?` (FR-043); the desktop dot wrapper is
  `[data-punto-paso]` and paints no static halo; every dot pings, red when
  lit and grey (`pulso pulso-tenue`) when not (FR-047, FR-048); numbers in
  Blanco (FR-046); `<li>` with the
  number as an `aria-hidden` span (the `<ol>` already numbers the steps) and
  the title as `h3`; below `lg` number and title share one line ("01
  Diagnóstico"), from `lg` they stack under the dot.
- `CommitmentChip.vue` — props `text`, `icon`; desktop chip with icon
  bubble (`hidden lg:inline-flex`) and mobile chip (`lg:hidden`).

### Logic

```ts
// logic/carouselIndicator.ts (pure)
export const ACTIVE_LINE_RATIO = 0.35
export const END_TOLERANCE_PX = 4
export function activeCardIndex(input: {
  scrollLeft: number; clientWidth: number; scrollWidth: number
  cardRightEdges: readonly number[]
}): number
// logic/useCarouselIndicator.ts
export function useCarouselIndicator(scroller: Ref<HTMLElement | null>): { activeIndex: Readonly<Ref<number>> }

// logic/timelineProgress.ts (pure)
// Amended 2026-11-02 (FR-044): HORIZONTAL_TRAVEL_RATIO, horizontalProgress
// and isStepLitHorizontal were removed with the desktop scroll fill. Do not
// reintroduce them; the desktop is lit by the preview only.
export const PEN_LINE_RATIO = 0.65
export function verticalProgress(rectTop: number, rectHeight: number, viewportHeight: number): number
export function isStepLitVertical(stepTop: number, viewportHeight: number): boolean
export function dotProgress(dotCentre: number, listWidth: number): number   // FR-042
export function litUpTo(index: number, stepCount: number): boolean[]        // FR-042
// logic/useTimelineProgress.ts — mobile rail only; does not measure from lg
export function useTimelineProgress(list: Ref<HTMLElement | null>, stepCount: number): {
  lit: Readonly<Ref<readonly boolean[]>>     // all true on server / no-JS / reduced motion
  fills: Readonly<Ref<readonly number[]>>    // rail segment fills, 1 likewise
}
// logic/useTimelineHover.ts — desktop preview (FR-042…FR-045)
export function useTimelineHover(list: Ref<HTMLElement | null>, stepCount: number): {
  active: ComputedRef<number | null>         // pointer ?? keyboard focus; null below lg
  progress: ComputedRef<number | null>       // dot-centre share; null at rest
  lit: ComputedRef<boolean[] | null>         // litUpTo(active); null at rest
  focusable: Readonly<Ref<boolean>>          // columns are tab stops from lg only
  pointIn(i), pointOut(i), focusIn(i, e), focusOut(i, e)
}

// logic/useHeroContent.ts, useWhoWeAreContent.ts, useServicesContent.ts,
// useHowWeWorkContent.ts — ComputedRef<…Content>, the only useI18n callers
```

### Barrel (`index.ts`) after 44

Exports the four v2 sections, their content composables and types, and the
quarantined `ContactSection` (path `./ui/legacy/ContactSection.vue`) with
`useContactContent` / `ContactContent` until 45. Nothing else from
`legacy/`.

## Shell edits

`SiteHeader`, `MobileMenu`, `SiteFooter`, `MobileFooter`: the logo
`NuxtLink` gains `:aria-current="undefined"` (R13). `useMobileMenu` imports
`DESKTOP_MEDIA_QUERY` from `@/shared/data/layout`.
