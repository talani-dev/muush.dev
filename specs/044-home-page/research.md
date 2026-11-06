# Research · feature 44 home page

Each entry: **Decision**, **Rationale**, **Alternatives considered**. Labels
CONFIRMED / INFERRED / UNVERIFIED follow the organisation's evidence rule.
The spec author cannot open the `.pen`; every visual value comes from
`docs/harness/progress/pen-extract-44.md` (the leader's extract) or is marked
INFERRED.

## R1 · Quarantine of the v1 home

**Decision.** Move every v1 landing UI file (and its test and story) into
`app/features/landing/ui/legacy/`: `HeroSection`, `PurposeSection`,
`PurposeCard`, `PurposeCarousel`, `PurposeConstellation`, `ServicesSection`,
`ServiceItem`, `ServicesConnectors`, `ServicesConstellation`,
`ServicesTimeline`, and `ContactSection` (still rendered until 45). The v1
data and logic those components import move to `data/legacy/`
(`heroContent`, `purposeContent`, `servicesContent`) and `logic/legacy/`
(`usePurposeArcRadii`, `usePurposeCarousel`, `useServicesLyrics`). Their
stories keep their existing `Legacy v1/Landing/…` titles (already set by 43).
Relative imports inside moved files become aliases (Article XII) except
between files in the same `legacy/` folder.

The three i18n seams `useHeroContent`, `usePurposeContent` and
`useServicesContent` are **deleted**, with the v1 keys `landing.hero.*`,
`landing.purpose.*` and `landing.services.*`: after `index.vue` is rewritten
they have no reader (Article VIII, and 43's precedent: "Removed (no reader
after 43)"). The legacy stories already feed copy from inline fixtures, so
they keep rendering. Constants in `data/legacy/` that lose their only reader
(`HERO_KEYS`, `PURPOSE_KEYS`, `SERVICES_KEYS`, `HERO_DESTINATIONS`) are
deleted too; `pnpm typecheck` and `biome` decide what is still read.
`useContactContent` and `contactContent` stay where they are (live, no name
clash) for feature 45 to replace.

**Rationale.** Mirrors 42 (`app/shared/ui/legacy/`) and 43
(`app/features/shell/ui/legacy/`, including the still-rendered v1 404). The
v2 sections reuse the names `HeroSection` and `ServicesSection`, so the v1
files must leave `ui/` anyway. Quarantining the contact section too keeps
`landing/ui/` v2-only, so "no v2 file imports `legacy/`" is checkable by
path.

**Alternatives.** Delete the retired v1 sections now: rejected, feature 47
owns v1 deletion (feature_list 47) and the reviewer compares in Storybook.
Rename the v2 files to avoid the move: rejected, names would need a marker or
a worse name.

**Tests that follow the move** (INFERRED from grep, 2026-11-01):
`tests/tablet-layout-tokens.test.ts` (imports `SERVICE_NODE_CENTRES`, reads
`ContactSection.vue` and `PurposeSection.vue` by path),
`tests/static-output.test.ts` (§ "the landing hero" pins the v1 hero:
rewritten for v2), `tests/landing-copy.test.ts` (pins v1 hero/purpose/
services copy: rewritten for v2 copy), `tests/forms-copy.test.ts` line ~201
(asserts the contact's secondary CTA equals the v1 hero's; the v2 hero has no
"Agenda una llamada", so the assertion is removed with a comment), and
`tests/forms-config.test.ts` (scans `features/landing` recursively: still
valid).

## R2 · Section components and where the map lives

**Decision.** v2 landing UI (all in `app/features/landing/ui/`):
`HeroSection`, `WhoWeAreSection`, `ServicesSection` (+ `ServiceCard`,
`ServicesCarousel`, `CarouselIndicator`, `AlsoAvailable`), `HowWeWorkSection`
(+ `ProcessTimeline`, `ProcessStep`, `CommitmentChip`). The map is shared:
`app/shared/ui/WorldMap.vue` (+ `MapPin.vue`, `MapRegionTabs.vue`,
`MapLegend.vue`), `app/shared/data/mapPins.ts`, `app/shared/data/mapRegions.ts`,
`app/shared/utils/mapGeometry.ts`.

**Rationale.** Feature 46 reuses the map on Nosotros (`feature_list.json`
44 and 46: "Nosotros lo reutiliza"), and `about` may not import `landing`
internals (Article III); lifting now is a known, scheduled second consumer,
not speculation. All copy reaches the shared components as props
(043 contract rule: no shared component holds copy).

**Alternatives.** Keep the map in `landing` and lift in 46: rejected, it
would move tested files twice.

## R3 · The dotted map asset

**Decision.** Copy `docs/harness/progress/assets-44/world-dots.svg` to
`app/assets/map/world-dots.svg` unchanged (one path, `fill="currentColor"`,
viewBox `0 0 1408 470`, `aria-hidden`), import it with `?raw` and inline it
with `v-html` inside an `aria-hidden` wrapper, sized through `:deep(svg)`
(the `app/assets/icons/README.md` contract, rules § R14). Colour: a new
token `--mapa-punto` = Blanco at 18 % (`#F4F4F22E`), via `text-mapa-punto`.

**Rationale.** Inline markup is the only way `currentColor` takes a token
(rules § R8), and it makes the map part of the page: zero requests (SC-003).
Measured 2026-11-01: 78 170 bytes raw, **5 730 bytes gzipped** (CONFIRMED,
`gzip -c | wc -c`); the current `/es` page is 65 155 bytes raw. One instance
per page (R4), so the cost is paid once.

**Alternatives.** `<img src>` hashed asset: one same-origin request and the
colour baked into the file (token rule broken). Rasterised PNG crop as in the
`.pen`: explicitly rejected by the leader (pen extract § 2.1).

## R4 · One map, two views, zoom in pure CSS

**Decision.** A single `WorldMap` DOM serves both views. A "canvas" box
holds the inlined SVG and the pins, at the map's aspect ratio (1408 : 470).

- From `lg`: the canvas is the full map, `width: 100%`, `max-width` 1408 px
  token, no transform; the block has opacity 0.8 (token `--mapa-opacidad`).
- Below `lg`: a window box with a fixed aspect ratio 342 : 240 (the 390
  frame's box), radius 16, `overflow: clip`, width = content width capped at
  a new token `--mapa-ventana-max` (40rem, INFERRED latitude). The canvas
  inside gets `transform: translate(var(--mapa-tx), var(--mapa-ty))
  scale(var(--mapa-zoom))`, origin 0 0, applied only under `max-lg:`.

Because the window keeps a fixed aspect ratio, the "contain" fit of the
handoff's `iniciarMapa` (`s = min(W/w, H/h)`, centring offsets) reduces to
**constants per region**: a pure function
`regionTransform(region, windowAspect)` in `app/shared/utils/mapGeometry.ts`
returns `{ zoom, translateXPercent, translateYPercent }` (percentages of the
canvas box, so they hold at any width). Unit-tested against the handoff
formula at 342 × 240 and two other widths. Regions are the handoff's
`REGIONES` (CONFIRMED): America `[210, 95, 285, 200]`, Europe
`[645, 75, 190, 95]`.

Transition: `transform` over `--lento` with `--ease` (`duration-(--lento)
ease-muush`); `--lento` is 0 ms under reduced motion (feature 42 tokens) and
the element adds `motion-reduce:transition-none` (FR-012).

**Pins** are absolutely positioned children of the canvas at
`left: x / 1408 %`, `top: y / 470 %`, centred with `-translate-1/2`, and
counter-scaled by `1 / var(--mapa-zoom)` so they stay 28 × 28 on screen
(Clarifications Q4). From `lg` the map scales with width by layout (not
transform), so pins stay 28 px by construction. Pin positions are data
coordinates converted to percentages by a pure helper `pinPosition(pin)`;
they are geometry from data, not spacing literals (Article VII governs
design values; the 43 shell precedent sets inline custom properties the same
way, INFERRED).

**Rationale.** No `ResizeObserver`, no measurement, correct server render
and no-JS state (America shown), and the zoom is a compositor-only transform.

**Alternatives.** The handoff's measured transform (needs JS before the first
paint, flashes the full map on load). Two SVG copies (desktop and mobile):
doubles 78 KB of markup.

## R5 · Region tabs and the media query

**Decision.** `MapRegionTabs` implements the WAI-ARIA tabs pattern with
automatic activation: `role="tablist"` named by an i18n string
(Clarifications Q2), two `<button role="tab">` with `aria-selected`,
`aria-controls`, roving `tabindex` (0 on the selected, -1 on the other),
ArrowLeft/ArrowRight (wrapping), Home, End. Selection state lives in
`useMapRegion()` (`app/shared/logic/`): `{ region, select, onKeydown }`, the
key handling a pure function `nextRegion(current, key)` unit-tested.

The tab panel role and `aria-labelledby` exist only while the mobile view
applies. `useDesktopLayout()` (new, `app/shared/logic/`) returns a
`Readonly<Ref<boolean>>` from `matchMedia(DESKTOP_MEDIA_QUERY)`, `false` on the
server (mobile-first SSR). `DESKTOP_MEDIA_QUERY` (`(min-width: 64rem)`) moves
from `useMobileMenu.ts` to `app/shared/data/layout.ts`, and the shell imports
it from there (Article VIII DRY; shell → shared is allowed).

The tabs are hidden from `lg` (`lg:hidden`); the hidden city list (R6) shows
all cities from `lg`.

**Alternatives.** Manual activation (Enter/Space): rejected, two tabs with an
instant, cheap panel change is the APG's case for automatic activation.

## R6 · Map text alternative (Clarifications Q2, confirmed by Roberto 2026-11-01)

**Decision.** The inlined dots stay `aria-hidden`. A visually hidden list
(`sr-only`) groups the cities under the legend labels already in the copy
("Equipo", "Aliados") plus the soon label ("Estonia · pronto"). Each item has
a class that hides it below `lg` when its pin is outside the selected
region (`max-lg:hidden`), so below `lg` the tab panel exposes only the
selected region's cities and from `lg` all nine. Region membership is a pure
function `isInRegion(pin, region)`: every pin falls in exactly one region
(CONFIRMED by arithmetic on `map-pins.json`: all seven American pins lie in
`[210..495] × [95..295]`; Dublín, Ámsterdam and Estonia in
`[645..835] × [75..170]`). City names are i18n keys (new copy, confirmed by Roberto 2026-11-01).

## R7 · Carousel and indicator

**Decision.** `ServicesCarousel` is a `<ul>` that is a horizontal scroller
below `lg` (`snap-x snap-mandatory`, `scroll-padding-left` = gutter,
negative gutter margin so it bleeds to the screen edge, scrollbar hidden) and
`lg:grid lg:grid-cols-4` from `lg`. The scroller is `tabindex="0"` with
`role="region"` and `aria-labelledby` the section heading, so keyboard users
can scroll it (cards hold no focusable content). `useCarouselIndicator`
(`landing/logic/`) listens to `scroll` (passive, rAF-coalesced) and computes
the active index with the handoff's rule, extracted as the pure
`activeCardIndex({ scrollLeft, clientWidth, scrollWidth, cardEdges })`:
the first card whose right edge passes `scrollLeft + 0.35 × clientWidth`, or
the last card when within 4 px of the end. Constants named
(`ACTIVE_LINE_RATIO = 0.35`, `END_TOLERANCE_PX = 4`). The indicator is
`aria-hidden` (FR-016); the active mark changes width as well as colour
(forced colours).

**Alternatives.** IntersectionObserver per card: the "last card at the end"
rule is awkward with it; scroll arithmetic is what the handoff tested.

## R8 · Timeline progress

> **Amended 2026-11-02 (spec FR-042…FR-048).** The desktop half of this
> decision is superseded: there is no desktop scroll fill
> (`horizontalProgress`, `isStepLitHorizontal`, `HORIZONTAL_TRAVEL_RATIO`
> and the composable's `progress` were removed), no gradient track
> (`--proceso-linea` removed) and no static step halo. From `lg` the line
> rests Blanco 20 % with every column unlit and is lit only by the hover /
> keyboard preview (`useTimelineHover`). The mobile rail below is unchanged.

**Decision.** `useTimelineProgress(listRef)` (`landing/logic/`) translates
`iniciarLineaTiempo`. Pure core in `landing/logic/timelineProgress.ts`:

- horizontal (from `lg`): `p = clamp((vh − top) / (0.6 × vh))`; step *i* lit
  when `p ≥ stepLeft_i / listWidth`;
- vertical: `p = clamp((0.65 × vh − top) / height)`; step lit when its top
  `< 0.65 × vh`.

Named constants: `HORIZONTAL_TRAVEL_RATIO = 0.6`, `PEN_LINE_RATIO = 0.65`.
Scroll and resize listeners are passive and rAF-coalesced, computed once on
mount (so a jump to `#como-trabajamos` is right at once), removed on scope
dispose. The composable exposes `progress` (0–1) and `litCount`; the list
sets `--progreso` as an inline custom property; the fill is
`scale-x-(--progreso)` (desktop, origin left) or `scale-y-(--progreso)`
(mobile, origin top), with a 120 ms linear transition (handoff, new token
`--progreso-paso`), none under reduced motion.

**Initial state.** Server render and the no-JS state: `progress = 1`, all
lit (FR-020). Reduced motion: stays at 1, no listeners. Otherwise the first
client computation replaces it; the section is below the fold on first load,
so the switch is not seen (INFERRED: hero is ≥ 740 tall).

**Track** (Clarifications Q3, confirmed by Roberto 2026-11-01): desktop track is the drawn
gradient as a token `--proceso-linea`
(`linear-gradient(90deg, red-muush-500 0, coral-300 35%, arena-300 60%,
acero-200 85%, transparent 100%)`), fill solid Red muush 500 over it; mobile
track is one continuous Blanco 20 % line behind the dots (INFERRED: the
`.pen`'s 1 × 100 segments between dots read as one line; a continuous line
adapts to text height), fill Red muush 500 over it.

## R9 · Step-01 short sentence on mobile

**Decision.** Two keys, `landing.howWeWork.steps.assessment.description` and
`…descriptionShort`; `ProcessStep` renders the full one with `hidden
lg:inline` and the short one with `lg:hidden`. Only steps that have a short
version pass it (data says which).

**Rationale.** CSS swap keeps the server render right at both widths.
Screen readers read only the displayed one (`display: none` is hidden from
the accessibility tree).

## R10 · Forced title breaks

**Decision.** Card titles that break by design store the break as `\n` in
the locale file ("Software, web\ny nube", "Diseño de producto\ny UX"; EN
"Software, web\nand cloud", "Product design\nand UX"); `ServiceCard` applies
`lg:whitespace-pre-line`, so below `lg` the newline collapses to a space.
INFERRED EN break points: the same phrase boundary as ES.

## R11 · Icons

**Decision.** Nine lucide glyphs as normalised assets in `app/assets/icons/`
(contract in its README: square viewBox, `currentColor`, `<title>`, no
size): `compass`, `layout-dashboard`, `workflow`, `pen-tool`,
`message-circle-warning`, `sliders-horizontal`, `user-round`, `file-text`,
`key-round`. Stroke width via a token `--icono-trazo` applied through
`:deep(svg)`; value 1.5 for "weight 300" (INFERRED; lucide's default is 2 at
weight 400). **Source dependency:** the repo has no lucide package, and the
handoff demo's inline icons are approximations, not lucide. The glyphs must
be obtained from lucide's ISC sources by the leader (as with the map asset)
or downloaded by the implementer from the official repository; adding a
package such as `lucide-static` is **not** planned (it would need the
organisation's dependency review and Roberto's approval).

## R12 · Tokens

**Decision.** New `:root` tokens and `@theme inline` utilities, Spanish and
unprefixed like 42/43, each checked against the v1 theme keys before
landing (a collision renames the v1 key to `legacy-*`, the 42 rule). Values
in data-model § 5. Fluid values interpolate linearly between the 390 and 1440
anchors (`slope = (max − min) / 1050`) and clamp outside, the 42 formula.
`tests/design-tokens.test.ts` gains assertions for the new tokens at both
anchors; `tests/token-literals.test.ts` gains the new landing and shared
components to its scan list.

## R13 · aria-current on logo links

**Decision.** Add `:aria-current="undefined"` to the four logo `NuxtLink`s
(`SiteHeader`, `MobileMenu`, `SiteFooter`, `MobileFooter`), with the same
comment the header CTA carries. Pin it in each component test and in
`tests/static-output.test.ts` (the generated `/es` and `/en`: the logo link
has no `aria-current`, the Home item has `aria-current="page"`).

**Rationale.** RouterLink marks any exact-active link; the fallthrough
attribute overrides it. CONFIRMED precedent: the header CTA already does this
and `static-output.test.ts` asserts the generated HTML. All four logo links
are covered (FR-028), not only the header's, because the mobile menu shows the
Home item next to its own logo.

## R14 · Section composition and spacing

**Decision.** `app/pages/index.vue` composes `HeroSection`,
`WhoWeAreSection`, `ServicesSection`, `HowWeWorkSection`, `ContactSection`
(legacy, through the landing barrel), with no margin classes: v2 sections
sit flush with their own padding (FR-001). The v1 `mt-section-gap` the page
put on the contact section moves onto the quarantined `ContactSection` root
so the v1 look stays and the page uses no v1 token.

Each content composable is the module's i18n seam, as in v1:
`useHeroContent`, `useWhoWeAreContent`, `useServicesContent`,
`useHowWeWorkContent` (new, same names freed by R1), each returning inert
data; components never call `useI18n`.

**Values missing from the extract (INFERRED at spec time; since supplied by the leader in pen extract § 8, which wins — indicator top 24, mobile Servicios 72 / 24 with gap 24, mobile hero centred, mobile card inner sizes as desktop):**
Servicios mobile vertical padding and head/carousel gaps (uses
`--seccion-y` 72 and the desktop gaps' fluid minimums 24/22); carousel
indicator top margin (handoff 18); mobile hero vertical alignment (centred,
spec Assumptions); service card inner sizes on mobile (desktop values).

## R15 · SEO and anchors

**Decision.** `usePageSeo` call unchanged (same keys). Exactly one `h1`
(hero heading, `Heading level 1`). A new output test walks every `href`
with a fragment in the generated `/es` and `/en` and asserts the id exists in
the target document (FR-026); feature 35's SEO tests stay untouched and
must stay green.
