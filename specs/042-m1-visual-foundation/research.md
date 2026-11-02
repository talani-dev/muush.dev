# Research: Muush 1.0 visual foundation (feature 42)

Each entry follows **Decision / Rationale / Alternatives**. Evidence labels
follow the org convention: CONFIRMED (read in this repo or the toolchain),
INFERRED (derived), UNVERIFIED (needs a check by the implementer).

> **Naming reorganization approved by Roberto 2026-11-01.** Nothing in v2
> carries a version marker any more. Where an entry below speaks of an `m1`
> prefix, it records the original decision; the shipped names are:
> tokens without prefix (`--negro-950`, `bg-negro-950`, `text-hero`), the
> utilities `borde-luz`, `borde-*` and `foco`, and the components `Pill`,
> `PrimaryButton`, `GlassButton`, `GlassSurface`, `Heading`, `RotatingPill`
> and `ShaderBackground` in `app/shared/ui/`. The v1 components moved to
> `app/shared/ui/legacy/`, the colliding v1 theme keys became `legacy-*`, and
> v1 stories moved under `Legacy v1/`. Report:
> `docs/harness/progress/impl_42_naming.md`.

## R1 · Token layout in `global.css`

**Decision.** One new `:root` block, "Muush 1.0", holds every `--*`
variable of the handoff `tokens.css` under its handoff name (minus the
handoff's version prefix since 2026-11-01), plus the new
tokens this feature needs (fluid line-heights, button and pill metrics,
gradients, glass presets, focus ring, pill motion). A second `@theme inline`
block maps them into Tailwind namespaces (originally with a version prefix,
dropped 2026-11-01). The handoff's
`@media (prefers-reduced-motion: reduce)` block that zeroes the three
durations is ported next to the existing reduced-motion block.

**Rationale.** The repo already separates raw values (`:root`) from theme
aliases (`@theme inline`) (CONFIRMED, `global.css` lines 23 and 829). Values
read by hand-written CSS must live in `:root`, because `@theme inline` does
not emit variables (CONFIRMED by the comment at `global.css` ~170 and
`findings.md` § R46). Originally a version prefix avoided collisions with the
v1 theme. Superseded 2026-11-01: the names are unprefixed, and the seven v1
theme keys that collided (`--radius-control`, `--radius-panel`,
`--spacing-pill-gap`, `--spacing-pill-y`, `--text-pill` and its three
sub-properties) were renamed `legacy-*` instead. The two font stacks are
`--fuente-titulo`/`--fuente-texto` (an unprefixed `--font-*` would be its own
theme alias); the curve alias is `ease-muush` and the container alias
`max-w-contenido` (`max-w-max` is a Tailwind built-in).

**Alternatives.** Rename tokens to the existing English convention (rejected:
FR-001 requires the handoff names). A separate stylesheet for v2 tokens (rejected: the
constitution names `global.css` as the single token source).

## R2 · Tailwind v4 namespaces available

CONFIRMED in `node_modules/tailwindcss/theme.css` (4.3.3): `--color-*`,
`--font-*`, `--text-*` (with `--line-height`, `--letter-spacing`,
`--font-weight` sub-properties), `--radius-*`, `--spacing-*`, `--blur-*`
(drives both `blur-*` and `backdrop-blur-*`), `--shadow-*`, `--ease-*`,
`--container-*` (drives `max-w-*`), `--tracking-*`, `--leading-*`. There is
**no** duration and no z-index namespace (CONFIRMED by the comment in
`global.css` and `findings.md` § R46). Background images have no namespace.

**Decision.**

| Kind | Exposed as | Example utility |
|---|---|---|
| colour (14 + 5 text-alpha + surface fills) | `--color-*` | `bg-negro-950`, `text-gris-400` |
| fonts | `--font-titulo`, `--font-texto` | `font-titulo` |
| type | `--text-*` with sub-properties | `text-hero` |
| radii | `--radius-*` | `rounded-pill` |
| spacing | `--spacing-*` | `px-gutter`, `gap-pill` |
| blur | `--blur-*` | `backdrop-blur-vidrio` |
| shadow | `--shadow-*` | `shadow-boton` |
| ease | `--ease-muush` | `ease-muush` |
| container | `--container-contenido` | `max-w-contenido` |
| durations, gradients | `:root` only | `duration-(--rapido)`, `bg-(image:--btn-fondo)` |

`duration-(--x)` and `bg-(image:--x)` are Tailwind v4 variable shorthands.
They reference a token, not a literal, so Article VII holds. UNVERIFIED: the
implementer confirms both compile in 4.3.3 (one `pnpm generate` and a grep of
the emitted CSS).

## R3 · Units and "same value"

**Decision.** Author in `rem` (16 px = 1 rem), tracking included (heading
tracking is a fluid `rem` clamp, R4).
The 999 px pill radius becomes `62.4375rem`, the same computed 999 px.
Colour alphas keep the handoff's `rgba()` literal for
handoff tokens (so the value comparison is literal) and use
`color-mix(in srgb, var(--…) N%, transparent)` for new derived tokens.

**Rationale.** The whole repo authors in `rem` so type and the dot grid scale
together with the visitor's font size (CONFIRMED, `global.css` comments on
`--dot-paper-*` and `--spotlight-lit-radius`). The automated token test
(SC-001) converts both sides to px at 16 px per rem before comparing.

**Alternatives.** Keep px (rejected: breaks the repo convention and
enlarged-text behaviour).

## R4 · Fluid heading scale (anchors 390 → 1440)

Formula: `slope = (max − min) / 1050`; `intercept = min − slope × 390`;
`clamp(min, intercept + slope·100vw, max)`. Line-heights and tracking are
interpolated as lengths, so both anchors are exact even though the unitless
ratio changes. Values from pen extract §§ 4 and 8.

| Token | Size clamp | Line-height clamp (390 → 1440) | Tracking |
|---|---|---|---|
| `--h-hero` 34 → 96 | `clamp(2.125rem, 0.6857rem + 5.9048vw, 6rem)` | 37.4 → 101.76 px: `clamp(2.3375rem, 0.8434rem + 6.1295vw, 6.36rem)` | 0 → −3.5 px: `clamp(-0.2188rem, 0.0813rem - 0.3333vw, 0rem)` |
| `--h-seccion` 28 → 56 | `clamp(1.75rem, 1.1rem + 2.6667vw, 3.5rem)` | 32.2 → 61.6: `clamp(2.0125rem, 1.33rem + 2.8vw, 3.85rem)` | 0 → −1.96 px: `clamp(-0.1225rem, 0.0455rem - 0.1867vw, 0rem)` |
| `--h-proceso` 28 → 52 | `clamp(1.75rem, 1.1929rem + 2.2857vw, 3.25rem)` | 32.2 → 57.2: `clamp(2.0125rem, 1.4321rem + 2.381vw, 3.575rem)` | 0 → −1.82 px: `clamp(-0.1138rem, 0.0423rem - 0.1733vw, 0rem)` |
| `--h-diagnostico` 34 → 64 | `clamp(2.125rem, 1.4286rem + 2.8571vw, 4rem)` | 39.1 → 69.12: `clamp(2.4438rem, 1.7469rem + 2.859vw, 4.32rem)` | 0 → −2.24 px: `clamp(-0.14rem, 0.052rem - 0.2133vw, 0rem)` |
| `--p-grande` 17 → 20 | `clamp(1.0625rem, 0.9929rem + 0.2857vw, 1.25rem)` | `1.5` (unitless; same at both) | — |

Tracking (pen extract § 8, leader re-check of `V2s7T`, `mJxKt`, `trkk7`):
every Poppins heading has **0** tracking at 390 and about −0.035 em at 1440
(96 → −3.5, 56 → −1.96, 52 → −1.82, 64 → −2.24 px). A fixed `em` value would
give the mobile hero −1.24 px and break the 390 anchor, so each tracking token
is a fluid clamp from 0 to the 1440 px value. Servicios' "Lo que hacemos"
draws −2 px instead of −1.96 at 1440; that 0.04 px is within the 1 px
tolerance of SC-002 and is left to feature 44.

Section size at 390 is **28** (Qué es muush, Cómo trabajamos). Other mobile
sizes in the `.pen` (Servicios 30, Nosotros hero 32, Cómo se arma 30, Trabaja
con muush 34) are per-use overrides decided by features 44 and 46; this
feature does not force one value (Clarifications Q2, resolved).

Service-card title (pen extract § 8): a fixed `--h-servicio: 1.5rem`
(24 px at both anchors) with `--tracking-servicio: -0.0375rem` (−0.6 px).
The handoff's `--h-tarjeta` (19 → 26) is still ported for parity.

The handoff `--h-hero` (max 84) and `--p-grande` (min 16) are the two
`.pen` overrides; each carries a comment citing pen extract § 4 and R32.
`--h-seccion` keeps the handoff's 28 → 56 range (re-expressed against the
390/1440 anchors, so its slope differs from `3vw + 14px`; at 390 it is 28 and
at 1440 56 in both, which is what the `.pen` requires). The handoff's
`--interlineado-titulo` (1.15) and `--interlineado-texto` (1.5) are
ported unchanged for parity, and headings use the per-size line-height tokens
above instead.

**Alternatives.** Breakpoint steps (rejected by Article VII: "reaching for a
breakpoint to change a font size is a signal the token is missing"). Copying
the handoff clamps verbatim (rejected: 84 px cap contradicts the `.pen`).

## R5 · Fonts

CONFIRMED: fonts are self-hosted by `@nuxt/fonts` 0.14 from the google
provider at build time (`nuxt.config.ts` `fonts.families`), with
`throwOnError: true`. Poppins is configured at weight 600 only.
`tests/static-output.test.ts` (~line 1670) pins the emitted faces.

**Decision.** Poppins weights become `[500, 600]`. 600 stays until feature 47
because v1 components use it. Add `{ family: 'Poppins', weight: 500 }` to the
test's `BRAND_FONT_WEIGHTS`. `--fuente-titulo` and `--fuente-texto` keep the
handoff stacks (`"Poppins", system-ui, sans-serif`). No `@import`.

**Alternatives.** Copy the handoff `@import` (forbidden by the task and by
Article IV's no-runtime-third-party practice).

## R6 · Gradient 1 px edge ("borde de luz")

The `.pen` draws a 1 px stroke whose colour is a vertical gradient. CSS
`border-color` cannot take a gradient on a rounded box.

**Decision.** A Tailwind `@utility borde-luz` in `global.css`: a
`::before` pseudo-element with `inset: 0`, `padding: var(--borde-ancho)`
(1 px token), `border-radius: inherit`, `background: var(--borde)`, and
`mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)`
(with the `-webkit-mask-composite: xor` fallback), `pointer-events: none`.
Variant utilities set `--borde` to one of four gradient tokens:
`borde-panel` (25 % → 4 %), `borde-tarjeta` (18 % → 4 %),
`borde-boton` (25 % → 6 %) and `borde-plano` (flat 10 %). The mask's
black is alpha-only, the same convention as `PrimaryButton.vue` and
`CursorSpotlight.vue` (CONFIRMED).

**Rationale.** One mechanism for every top-lit edge (glass surface, glass
button). `border-image` ignores `border-radius` (rejected). A
`background-clip: padding-box, border-box` double background cannot
coexist with a translucent fill (rejected).

## R7 · WebGL background architecture

Reference: `docs/handoff/muush-1.0/muush-gradient.js` (`MuushGradient`
class) and `MuushGradient.astro` (CONFIRMED read).

**Decision.**

- `app/shared/ui/ShaderBackground.vue` (presentational): an `aria-hidden`,
  `pointer-events-none`, `print:hidden` root absolutely filling its section;
  an `<img>` poster (`alt=""`, `object-cover`, `decoding="async"`,
  `loading` from the preset); a `<canvas>` above it that is transparent until
  the composable reports its first frame, and removed from view on fallback.
  Prop: `preset`.
- `app/shared/logic/useShaderCanvas.ts`: lifecycle and gating only. On mount
  it loads the shader source, creates the WebGL 1 context
  (`antialias: false`, `premultipliedAlpha: false`,
  `powerPreference: 'low-power'`, as the handoff), and wires a
  `ResizeObserver`, an `IntersectionObserver` (`rootMargin: '100px'`),
  `visibilitychange`, the reduced-motion query (live, via `useReducedMotion`)
  and `webglcontextlost`. It returns `isReady` and `isFallback`. On unmount it
  disconnects everything, cancels the frame and calls
  `WEBGL_lose_context.loseContext()` when available (FR-024: the handoff
  leaks all of these).
- `app/shared/logic/shaderRenderer.ts`: compile, link, the full-screen
  triangle, uniform location cache and `draw(time, uniforms)`; returns
  `null` on any compile or link failure, which the composable turns into
  fallback.
- `app/shared/utils/shaderFrame.ts` (pure, unit-tested): `capPixelRatio`,
  `canvasPixelSize`, `shouldAnimate`, `withShaderDefaults`.

**No `<ClientOnly>`.** The poster and an inert canvas are part of the
prerendered HTML, so the no-JS fallback is the server render itself and the
first client render matches it. The WebGL work starts in `onMounted`, which
never runs during prerender (Article IV).

**Alternatives.** A port of the class as-is (rejected: not Vue, never cleans
up, Article V). A third-party WebGL helper (rejected: FR-026 no dependency).
`<ClientOnly>` with a placeholder (rejected: the poster would need to be the
placeholder anyway, and it complicates SSR parity).

## R8 · Shipping shaders and posters

**Decision.** Copy (not move; `docs/handoff/` stays intact as reference)
the handoff's `shaders/m1-liston.glsl` and `shaders/m1-acanalado.glsl`
byte-for-byte to `app/assets/shaders/` (as `liston.glsl` and `acanalado.glsl`
since 2026-11-01), and the six `posters/*.webp` to
`app/assets/backgrounds/`. Shaders are loaded with a dynamic
`import('@/assets/shaders/liston.glsl?raw')` per preset, so a page bundles
only the shader it uses. Posters are imported as modules in the preset data
file, which gives hashed, cache-busting URLs under `_nuxt/`.

The GLSL files are data that must equal the `.pen`'s shaders (README:
"lo que se ve en Pencil es lo que se ve en la web"); copying them verbatim is
the requirement, not a violation of "translate, do not copy" (which is about
the Astro and JS code). `m1-brasa-acero.glsl` is not in the handoff folder
(CONFIRMED: only two shaders exist) and is not shipped.

**Amended 2026-11-01 (Roberto, feature 43 reopened 2, spec 043 FR-057).** The
shipped shaders are no longer byte-for-byte copies: in `finish()` the grain
hash is `hash(gl_FragCoord.xy)` instead of
`hash(gl_FragCoord.xy+fract(u_time*7.0)*91.0)`, so the grain is static
instead of flickering. That one line, plus a comment above it, is the only
divergence from the handoff.

CONFIRMED: Vite's client types declare `*?raw` (`vite/client.d.ts` line 249),
and the repo already imports `?raw` (`Lockup.vue`).

**Alternatives.** `public/` (rejected: unhashed, and the repo's precedent puts
inlined assets in `app/assets`). Fetching the GLSL at runtime as the handoff
demo does (rejected: an extra request and a failure mode).

## R9 · Background presets

From the handoff README (CONFIRMED). Every preset adds `u_flip: 1`; the
engine defaults are `u_speed: 1`, `u_grain: 0.07`; omitted uniforms take the
shader's `@default`.

| Preset | Shader | Uniforms | Poster | Priority |
|---|---|---|---|---|
| `homeHero` | listón | `u_tx .5, u_ty .53, u_trx .36, u_try .28, u_tdark 1, u_fadeB .06` | `hero-liston.webp` | eager, high |
| `howWeWork` | acanalado | `u_y0 .52, u_y1 .47, u_th .15, u_right .45, u_tx .5, u_ty .27, u_trx .42, u_try .22, u_tdark .9, u_fadeT .2, u_fadeB .15` | `como-trabajamos-acanalado.webp` | lazy |
| `assessment` | listón | `u_y0 1, u_y1 .35, u_th .11, u_amp .06, u_twist .5, u_tx .27, u_ty .45, u_trx .25, u_try .35, u_tdark .75, u_fadeT .3, u_fadeB .05` | `diagnostico-liston.webp` | lazy |
| `aboutHero` | listón | `u_tx .5, u_ty .55, u_trx .4, u_try .32, u_tdark 1, u_fadeB .08` | `nosotros-hero-liston.webp` | eager, high |
| `workWithUs` | listón | same as `assessment` | `diagnostico-liston.webp` (INFERRED, no own poster) | lazy |
| `faq` | acanalado | `u_y0 .84, u_y1 .76, u_th .13, u_right .6, u_tx .5, u_ty .5, u_trx .45, u_try .26, u_tdark 1, u_fadeT .1, u_fadeB .15` | `preguntas-acanalado.webp` | eager, high |
| `notFound` | acanalado | `u_y0 .98, u_y1 .92, u_th .11, u_right .6, u_tx .5, u_ty .5, u_trx .42, u_try .4, u_tdark 1, u_fadeT .1, u_fadeB .02` | `404-acanalado.webp` | eager, high |

"Eager" means the poster is above the fold on its page and may be the LCP
image: `loading="eager"` and `fetchpriority="high"`.

## R10 · Run gating, DPR and still frame

Translated from the handoff, with the three FR-020/022 numbers as named
constants in `shaderFrame.ts`:

- `shouldAnimate = visible && !documentHidden && !reducedMotion`.
- When not animating but visible, draw once (the handoff does the same, so a
  resize while paused still shows a correct frame).
- `capPixelRatio(dpr, viewportWidth) = min(dpr || 1, viewportWidth < 768 ? 1 : 1.5)`.
- Reduced motion uses the still time `12` s (`STILL_TIME_SECONDS`).
- Time is seconds since mount (`performance.now()`), so resuming after a pause
  jumps forward exactly as the handoff does. INFERRED acceptable: the motion
  is slow and continuous.

## R11 · First frame and the poster

**Decision.** The canvas has `opacity: 0` until `isReady` (set after the
first successful `drawArrays`), then fades in over `--medio` with
`--ease`. On `isFallback` it gets `hidden`. The poster `<img>` stays in the
DOM underneath at all times (it is the background of the canvas's
transparent first frame and the no-JS view).

## R12 · Rotating pill

Reference: `rotatePill` in `muush-gradient.js` (CONFIRMED): 2600 ms interval,
skips while `document.hidden`, out 220 ms ease-in to `translateY(-6px)` and
opacity 0, swap, in 260 ms ease-out from `translateY(6px)`. Under reduced
motion it never starts.

**Decision.**

- `app/shared/logic/useRotatingText.ts(items, { paused })`: returns the
  current index; a `setInterval` started in `onMounted` (so the prerender and
  no-JS show item 0); a tick is skipped when `document.hidden`, when `paused`
  is true (pointer hover, Clarifications Q4), or when reduced motion is on;
  cleared on unmount. One item or none: no interval.
- `RotatingPill.vue`: a `<Transition mode="out-in">` keyed on the index,
  with enter/leave classes reading `--pill-salida` (220 ms),
  `--pill-entrada` (260 ms) and `--pill-desliz` (0.375 rem = 6 px). The
  visible label is `aria-hidden`; a visually hidden `<ul>` lists all items once
  (no `aria-live`), which satisfies "accessible to screen readers" without an
  announcement every 2.6 s (SC-008).
- Root element is a `<div>` (inline-flex), so the `<ul>` is valid HTML.

**Alternatives.** `aria-live="polite"` (rejected: an announcement every
2.6 s). Joining the items into one string (rejected: needs a locale-specific
separator, i.e. a new i18n key, and a list is clearer). Web Animations API as
the handoff (rejected: Vue `<Transition>` is the idiomatic, testable form).

## R13 · `useReducedMotion`

**Decision.** A small shared composable returning a `Ref<boolean>` that
follows `(prefers-reduced-motion: reduce)` live (`change` listener, removed on
unmount); `false` during SSR. Used by `useShaderCanvas` and
`useRotatingText`. `useCursorSpotlight` keeps its own query (feature 8/34
code is not refactored in this feature).

## R14 · Primitive names and location

**Decision.** `app/shared/ui/GlassSurface.vue`, `Pill.vue`,
`RotatingPill.vue`, `PrimaryButton.vue`, `GlassButton.vue`,
`Heading.vue`, `ShaderBackground.vue`. These were first written with a version
prefix to keep them apart from v1 `GlassPanel`, `Pill` and `PrimaryButton`.
Superseded 2026-11-01: they carry the final names, and the v1 components moved
to `app/shared/ui/legacy/`. Every import is an explicit alias path (there is
no `components/` auto-import directory), so the two `Pill.vue` files never
resolve to each other.

## R15 · Buttons: link or button, sizes, states

- Render `<NuxtLink :to>` when `to` is given, a native `<button :type>`
  otherwise (the Storybook preview already stubs `NuxtLink`, CONFIRMED). An
  external `href` (for example a booking URL) renders `<a href>`.
- Primary sizes: `hero` (mobile metrics below `lg`, desktop metrics from
  `lg` = 64 rem = 1024 px; the 20 px arrow shows at every width, pen extract
  § 9, corrected 2026-11-01; Tailwind's default `lg`, which the repo
  does not override, CONFIRMED by grep), `nav` (fixed), and `block` (desktop
  metrics, full width). `icon` prop defaults to `true`; `false` removes the
  arrow at every size.
- Glass sizes: `hero` (mobile below `lg`, desktop from `lg`).
- States from `componentes.css` (handoff behaviour, the `.pen` draws none):
  hover `brightness(1.06)` on primary, `active:scale-[.98]` expressed as a
  token-backed scale, disabled opacity 70 % and `cursor: progress`. The
  focus ring is Clarifications Q3: `outline: var(--foco-ancho) solid
  var(--blanco); outline-offset: var(--foco-separacion)` on
  `:focus-visible`.
- The arrow icon is `app/assets/icons/arrow-right.svg` (lucide, ISC), added to
  that folder's README per its contract (`currentColor`, square viewBox, no
  size), inlined with `?raw` + `v-html` in an `aria-hidden` wrapper and sized
  with a `:deep(svg)` rule, as the folder README prescribes (CONFIRMED).

## R16 · Page canvas

CONFIRMED: `html { background-color: var(--ink-500) }` in `global.css` and
`bg-ink-500` on the layout root; `tests/static-output.test.ts` pins both
(~lines 246, 622–625, 652) and asserts exactly one background on
`html`/`body`.

**Decision.** `html` → `var(--negro-950)`; layout root →
`bg-negro-950`. Update the three test sites to the new token (keep their
intent). Do **not** add a `body` background (the "exactly one" test). The
footer's `bg-ink-500` stays (pinned by feature 34 A2 rev 1; feature 43
replaces the footer).

## R17 · Cursor and spotlight on dark

CONFIRMED: the spotlight's lit dots read `--dot-paper-lit-color:
var(--red-400)`; `tests/spotlight-red-dots-tokens.test.ts` pins that value.
The cursor `public/cursor/you.svg` uses `#CF3147` in fill and stroke;
`tests/brand-cursor.test.ts` asserts the SVG's colours equal `--red-400`'s
hex.

**Decision.** `--dot-paper-lit-color: var(--red-muush-500)`; recolour the
three `#CF3147` occurrences in `you.svg` to `#E5352F` and update its comment;
`brand-cursor.test.ts` reads `--red-muush-500` instead of `--red-400`;
the spotlight test pins the new value. All other spotlight and cursor
assertions stay. Red lit dots over `#050505` and a red cursor with a white
"You" both read well on the dark canvas (INFERRED; reviewed by eye).

**Known interactions reported for later features (not changed here):**

1. Feature 43 removes the dotted paper. `CursorSpotlight` paints its own
   masked dot sheet, so after 43 the spotlight would show red dots only near
   the pointer on a plain black canvas. Whether that is the intended v2 look
   is Roberto's call (reported).
2. The spotlight sits at `--layer-spotlight` (−1), below normal flow. A section
   that places `ShaderBackground` (44–46) covers the spotlight in that
   section. Reported for 44.
3. A red cursor over the red primary button has low contrast. Reported; not
   changed (behaviour and design of the cursor are fixed).

## R18 · Storybook

CONFIRMED: `.storybook/preview.ts` has viewports `mobile` (390) and `desktop`
(1440) and backgrounds `ink`, `bone`, `red`. There is no locale toolbar;
stories pass copy as args.

**Decision.** Add a `negro: { name: 'Negro 950', value: '#050505' }`
background option (the preview file holds swatch literals for Storybook's own
UI, as it does today). Every v2 story file sets
`globals: { backgrounds: { value: 'negro' } }` in its meta. Each primitive has
`Es` and `En` stories (approved copy from `muush-1.0.md` § 4) and the
`Mobile390`/`Desktop1440` viewport variants; the tokens story renders the
palette, the type scale and the radii.

## R19 · Automated checks added

- `tests/design-tokens.test.ts`: every handoff variable name exists in `:root`
  with the same value at 16 px/rem (expected table embedded in the test, so
  it does not read `docs/`), except the two recorded overrides; every family
  of FR-003 has its `@theme` alias; no `@import` of `fonts.googleapis.com` in
  `global.css`; no token for `#CF3147` other than v1 `--red-400`.
- `tests/token-literals.test.ts`: the files this feature creates under
  `app/shared/ui/` (an explicit list of the seven primitives, their stories
  and `tokens.stories.ts`) contain no `#hex`, `rgb(`, `\dpx` and no
  `--bone-|--ink-|--red-|--wine-` and no v1 utility (`-ink-`, `-bone-`,
  `-red-`, `-wine-`).
- Unit tests: `shaderFrame.test.ts`, `useRotatingText.test.ts`,
  `useReducedMotion.test.ts`, `useShaderCanvas.test.ts` (happy-dom has no
  WebGL: the null-context path proves fallback; a stubbed context proves the
  gating and cleanup).
- Component tests for the seven components.
