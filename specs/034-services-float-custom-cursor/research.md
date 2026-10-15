# Research: Services float and custom cursor (feature 34)

Status labels follow the org rule and `rules.md` § R32: **CONFIRMED** (read in
the repository or a file), **DERIVED** (arithmetic shown), **INFERRED**
(reasoned from specs or source, not observed in a browser), **UNVERIFIED**
(no evidence available in this session).

> **Tooling note.** The Context7 documentation tools were not available to
> this subagent session (not surfaced in its tool list), and there is no web
> access. Browser-support statements below therefore come from (a) the
> `caniuse-lite@1.0.30001810` data already in `node_modules` where it has a
> matching feature, and (b) the specifications, and are labelled
> accordingly. Every UNVERIFIED item has a manual check in `quickstart.md`.
> Official references to confirm against: MDN `cursor`
> (developer.mozilla.org/en-US/docs/Web/CSS/cursor), MDN `@property`,
> MDN `sin()` / `atan()`, MDN `image-set()`.

---

## R1 · How the line ends stay glued to the moving radars (OA-1)

### The problem, precisely

Each connector is `<line x1 y1 x2 y2>` with endpoints from
`connectorEndpoints(SERVICE_NODE_CENTRES)` (CONFIRMED). `x1`..`y2` are SVG
geometry **attributes**, not CSS properties (CONFIRMED by the existing
comment in `ServicesConstellation.vue` and Biome's `noUnknownProperty`), so
CSS cannot animate them directly. The nodes are HTML. The float is vertical
only, so for connector *i* only the two y values change: end A by `dyA(t)`,
end B by `dyB(t)`, with `dyA ≠ dyB` most of the time (different phases).

**Key observation (DERIVED).** Moving only the y of both ends of a segment
is an affine **vertical shear plus translation** of the line:

```
y' = y + s·x + b,   s = (dyB − dyA) / (x2 − x1),   b = dyA − s·x1
check at x1:  y1 + s·x1 + dyA − s·x1           = y1 + dyA  ✓
check at x2:  y2 + s·x2 + dyA − s·x1 = y2 + s·(x2−x1) + dyA = y2 + dyB ✓
```

In CSS that is `transform: translate(0, b) skewY(atan(s))` with origin at the
SVG user-space origin (transform functions apply right to left to points,
and `tan(atan(s)) = s`). All four connectors have `x2 − x1 ≠ 0`
(280, 260, 260, 200; DERIVED from the centres), so `s` is always defined.
The shear tilts the stroke by at most `atan(14/200) ≈ 4°`, so stroke
thickness changes by under 0.3%; `vector-effect: non-scaling-stroke` removes
even that.

### Options

| Criterion | (A) Per-node keyframes + lines split per endpoint, or `<path>` with animated `d` | (B) SMIL `<animate>` on `y1`/`y2` | (C) Shared CSS clock: registered `<angle>` animated once per canvas; nodes and line ends compute `A·sin(phase + φ)` | (D) `requestAnimationFrame` loop in `logic/` writing custom properties |
|---|---|---|---|---|
| Drift risk | **High.** A line cannot be split per endpoint without a moving joint; CSS `d: path()` animation is not supported in Safari (INFERRED, to confirm on MDN `d`); keyframe interpolation of a `matrix()`/`skewY` between samples is not linear in the end positions, so lines and nodes disagree between keyframes | **High.** HTML nodes cannot use SMIL, so nodes run on the CSS clock and lines on the SVG document clock: two timelines with different start times; SMIL ignores `prefers-reduced-motion` without script | **None by construction.** One animated value per canvas; every node offset and every line end is a pure function of it, evaluated in the same style pass. No sampling, no second clock | **None by construction**: one loop writes all values in one frame |
| Thread / compositor | Node transforms could be compositor-only, lines not: under main-thread jank the nodes keep moving and the lines freeze, i.e. visible detachment | Main thread for lines, compositor possible for nodes: same jank split as (A) | Main thread for both (registered custom-property animations are not compositor-driven, INFERRED). Same thread is exactly what keeps them together. Only `transform`/`translate` change: style recalc + paint/composite, **no layout** | Main thread for both; same as (C) plus the script cost |
| SSR / static output | CSS only | Markup only | CSS only; the HTML gains only inline custom properties on the 4 lines | Static HTML is the rest state; motion starts after hydration; needs mount/unmount handling |
| Reduced motion / no JS | CSS media query; works without JS | Needs script or duplicated markup | CSS media query sets amplitude 0; works without JS | `matchMedia` in script; no float without JS (acceptable but different) |
| Pause off-screen / hidden tab | Browser stops ticking in hidden tabs; off-screen keeps ticking | Same | Same (R3) | Must add `IntersectionObserver` + `visibilitychange` itself |
| Constitution | OK | OK | OK; no client state (Art. V), no dependency (Art. VIII) | Tension with Art. V ("MUST NOT carry client-side state just to make it feel dynamic"): a loop and observers exist purely for decoration |
| Testability | Structural CSS tests | Hard | Structural CSS tests + pure helper for the per-line inline vars; glue verified manually by pausing | Best unit testability (pure `offsetAt(t, i)`, fake timers) |
| Degradation | n/a | n/a | No `sin()`: offsets invalid at computed time → no transform → static design layout, glued. `sin()` but no `@property`: the phase animates discretely from 0deg to 360deg, and `sin(0 + φ) = sin(360° + φ)`, so the layout is static, slightly offset per node, still glued | Works wherever JS runs |

**Decision: (C).** It is the only CSS option without drift, it keeps nodes
and lines on one thread so jank cannot separate them, and it adds no script.
The repository already registers and animates an `<angle>` property the
same way (`@property --led-angle` + `@keyframes led-spin` in `global.css`,
CONFIRMED), with the same "where `@property` is missing it simply does not
move" fallback reasoning.

**Fallback: (D)** if the manual matrix shows a browser rendering (C) wrong.
It would live in `app/features/landing/logic/useServicesFloat.ts`, write the
same custom properties, and keep the same CSS formulas.

**Support (INFERRED, confirm on MDN):** `@property` in Chrome 85+, Safari
16.4+, Firefox 128+; CSS trigonometric functions in Chrome 111+, Safari
15.4+, Firefox 108+; CSS `transform` on SVG elements with
`transform-box: view-box` in all three current engines.

### Unit consistency (DERIVED)

Offsets are computed as unitless **design pixels** (the 1440×910 frame's
own unit), because the slope `s` divides one offset by an x distance and
typed length division is not broadly supported.

- Nodes: `translate: 0 calc(dy * var(--services-frame-px))`, with
  `--services-frame-px: 0.0625rem` (one design pixel; the whole canvas is
  already authored in rem at 16 px per rem).
- Lines: `translate(0, calc(b * 1px))` inside the SVG, where a CSS px on an
  SVG element is one **user unit**. With the SVG sized to exactly
  `90rem × 56.875rem` for a `0 0 1440 910` viewBox, one user unit is
  `0.0625rem`, the same as a node's design pixel, at every root font size.

## R2 · Motion values (D-4, OA-2)

- **Amplitude 7** (design px), middle of the approved 6–8 range.
  Peak speed `A·2π/T = 7 × 6.283 / 6 ≈ 7.3 px/s` (DERIVED): slow enough
  that a 14 px brief remains readable while moving.
- **Period 6 s**, middle of 5–7.
- **Phase step 137.5° (golden angle)**, phase of node *i* = `i × 137.5°`:
  0°, 137.5°, 275°, 412.5° ≡ 52.5°, 550° ≡ 190° (DERIVED). In index order
  the five nodes go left to right, so an evenly spaced step (72°) would read
  as a travelling wave; the golden angle scatters peaks. Using a step token
  instead of five phase tokens gives one relation instead of five literals,
  and both compositions already know `index`.
- **Easing**: the phase advances linearly and the offset is a true `sin()`,
  so the motion is an exact sine (no cubic-bezier approximation).
- **Per-node periods (alternative)**: five registered properties
  (`--services-float-phase-1..5`), five `@keyframes`, five durations on the
  canvas. Still one element, one timeline, so still glued. Costs about 25
  more lines of CSS; chosen only if Roberto wants the pattern never to
  repeat.

## R3 · Performance and pausing

- Only `translate`/`transform` change; no property that affects layout
  (INFERRED from the CSS; verified manually with a Performance recording,
  SC-004).
- Per frame the browser recomputes style for the canvas subtree (about 40
  elements) because the phase inherits. Negligible at this size.
- **Hidden tab**: browsers stop producing frames, so the animation does not
  advance work (INFERRED, standard behaviour).
- **Off screen**: there is no script to pause. A CSS animation off screen
  still ticks style on the main thread in Chromium (INFERRED). Considered
  `content-visibility: auto` on the canvas to skip off-screen work: rejected
  for now (adds size containment and a new rendering mode to a section
  whose paint-order contract is fragile, § R28; the measured cost does not
  justify it). Revisit only if the Performance recording shows a cost.
- `will-change` is not added by default: promoting text to its own layer can
  change text antialiasing in Chromium (INFERRED). Implementer may add it
  to `.node` only if the recording shows paint cost, and must recheck text
  sharpness.
- `display: none` (the composition not in use at the current width) stops
  the animation entirely (CSS Animations: no boxes, no animation).

## R4 · Mobile and tablet trial (D-3): the vertical connector

The timeline's only connector is the **spine**: one static vertical 1 px
line (`--services-spine-x/y/h`, CONFIRMED). The rows move **vertically**,
i.e. parallel to the spine, so a row's horizontal relation to the spine
never changes and nothing can detach (DERIVED). The spine therefore stays
static and needs no computation. Its ends are not attached to any radar
today (feature 14 assumption A-01): the top end (y 86) is above radar 1's
centre (≈121) and the bottom end (836) is above radar 5's centre (≈861,
DERIVED from `72 + 4 × 185 + 98/2`). A ±7 offset keeps radar 1 within the
spine and does not change radar 5's existing overhang.

Observation, pre-existing, out of scope: in the build the spine is at canvas
x 29 while the radar centres are at x 11 (a 22 px radar at the row's left
edge), so the spine does not pass through the radars (INFERRED from tokens;
listed for the leader in the spec's optional `.pen` checks).

**Reversibility (FR-012).** The mobile float is one block at the end of
`ServicesTimeline.vue`'s `<style scoped>`: the canvas animation, the row
offset and its reduced-motion override, fenced by a comment that says
"delete this block to revert the D-3 trial". It reads only the shared tokens
(which the desktop also uses, so they stay). Its tests live in their own
file, `ServicesTimeline.float.test.ts`. Its tasks form their own phase and
their own commit. Reverting = deleting the block and that test file (or
reverting that one commit).

**Interaction with the lyrics effect.** Lyrics writes `opacity` on `.item`;
the float writes `translate` on the same element. Independent properties,
no conflict. `opacity < 1` and `translate` each create a stacking context on
the item, which § R28 permits for leaves.

## R5 · SVG cursor support and the raster fallback (OA-6)

- `cursor: url(...) x y, <keyword>` with a fallback keyword is universally
  supported (caniuse-lite `css3-cursors`, CONFIRMED: Chrome 5+, Safari 5+,
  Firefox 4+).
- **SVG as the cursor image**: Chromium and Firefox are known to accept SVG
  cursor images with explicit `width`/`height` on the root element (the
  asset has `width="32" height="32"`). Safari support for SVG cursor images
  and the sharpness of SVG cursors on high-density screens in each engine
  are **UNVERIFIED** in this session.
- **Size limits** (INFERRED from MDN's documented limits, to confirm):
  Firefox and Chromium reject cursor images larger than 128×128; 32×32 is
  the recommended safe size. The asset is 32×32, so it is within limits.
  *Superseded by A1: the asset now renders at 64×64.*
- **`image-set()` in `cursor`**: caniuse-lite `css-image-set` (CONFIRMED for
  general `image-set()`): Chrome 113+ unprefixed, Safari 17+ full (14–16.6
  partial), Firefox 89+. Its support **inside `cursor`** specifically is
  UNVERIFIED.
- **Decision**: ship the SVG with keyword fallbacks only; the manual matrix
  (quickstart § 3) decides whether a PNG pair is needed. If it is, Roberto
  exports PNGs from his design source (the existing `01.png` is 62×62,
  CONFIRMED, not a 1x/2x size of 32, so it is not used). No agent
  rasterizes the brand asset, and no rasterizer dependency is added
  (Art. VIII; same reasoning as the favicon in `nuxt.config.ts`).

## R6 · Hotspot (OA-4)

Arrow path: `M4.829 14.713 L1 5 L10.899 8.829 L6.230 10.323 L4.829 14.713 Z`
with `stroke="#CF3147"`, default stroke width 1, default miter join, default
miter limit 4 (CONFIRMED from the file).

- Geometric tip vertex: **(1, 5)**.
- Edges from the tip: `u = (3.829, 9.713)`, `v = (9.899, 3.829)`; angle
  between them `acos(75.07 / (10.44 × 10.61)) ≈ 47.3°` (DERIVED).
- Miter ratio `1 / sin(23.65°) ≈ 2.49 < 4`, so the miter is drawn; it
  extends `0.5 × 2.49 ≈ 1.25` units beyond the vertex along the outward
  bisector `(−0.709, −0.705)`, so the drawn tip is at **≈ (0.12, 4.12)**
  (DERIVED).
- Recommendation: hotspot `1 5` (vertex, the leader's measurement; robust if
  the stroke ever changes). Alternative `0 4` is the pixel containing the
  drawn tip. The difference is ≈1.3 px.
- *Superseded by A1: at 64×64 the hotspot is `1 9`.*

## R7 · Contrast (OA-8)

WCAG relative luminance (DERIVED): `#CF3147` → 0.159; `#262626` (ink-500)
→ 0.019. Ratio `(0.159 + 0.05) / (0.019 + 0.05) ≈ 3.0:1`, the WCAG 1.4.11
minimum for non-text UI graphics. On Red 400 the arrow is invisible
(1:1). The pill's white glyphs on red: ≈ 4.0:1 (DERIVED: white 1.0 →
`1.05 / 0.209`). Forced colours: fall back to system cursors so the OS
high-contrast cursor applies.

## R8 · Where the asset lives and how CSS references it

- **`public/cursor/you.svg`**, referenced as `url("/cursor/you.svg")`.
  Reasons: (1) a file under `app/assets` would be processed by Vite, and a
  1.8 KB SVG is below Vite's default 4 KB inline limit, so it would become a
  `data:` URI and never exist as a file, which makes the "asset present in
  `.output/public`" test impossible and duplicates the bytes into the CSS
  (INFERRED from Vite's documented `assetsInlineLimit`); (2) the cursor does
  not need `currentColor` (a cursor image is an isolated document), so the
  § R8 reason for `app/assets` does not apply; (3) a root-relative path is
  unambiguous inside a custom property, where relative `url()` resolution
  base is a known trap.
- **Storybook** serves `public/` under `/brand` (CONFIRMED,
  `.storybook/main.ts`), so the path does not resolve in the catalogue and
  it shows system cursors. Accepted (spec edge cases). The task list runs
  `pnpm storybook:build` to confirm a root-relative URL that Vite cannot
  resolve there is a warning, not an error.
- **Colour literal**: the asset contains `#CF3147` and `white`. A cursor
  image cannot read CSS custom properties, so Article VII's token rule cannot
  apply inside it; a test asserts the literal equals `--red-400` in
  `global.css`, so a palette change fails loudly.
- **Cleanup**: delete exactly `<rect width="32" height="32" fill="white"/>`.
  Keep the root `<svg width="32" height="32" viewBox="0 0 32 32" fill="none">`,
  the arrow `<path>`, the pill `<rect x="8.19095" …>` and the glyph `<path>`.

## R9 · Applying the cursor (D-1, OA-5)

Facts (CONFIRMED in the repository): eight components declare Tailwind's
`cursor-pointer` utility and one `disabled:cursor-default`; `BotonPrimario`
and `SiteNav` comments record that native `<button>` gets `cursor: default`
from the user agent and Tailwind's preflight sets no cursor (findings
§ R56). `cursor` is inherited.

Rules, unlayered in `global.css` (an unlayered rule beats every Tailwind
layer regardless of specificity, the same technique the file already uses
for `html { background-color }`), wrapped in `@media (forced-colors: none)`
so forced-colours mode keeps system cursors:

1. `html { cursor: var(--cursor-brand) }`: inherited by everything that
   sets nothing.
2. Elements whose user-agent style sets a non-inherited cursor (`button`,
   `select`, `summary`, `label`, non-text `input` types): brand, arrow
   fallback.
3. `:any-link`, enabled `button`, `[role="button"]`, `.cursor-pointer`:
   brand, hand fallback (D-1).
4. Text-entry inputs, `textarea`, editable content: `cursor: text` (last,
   so it wins over 2 and 3).

Using `:where()` keeps specificity at zero, so order alone decides, which
is easy to read. Consequence: the layered `disabled:cursor-default` on the
country selector no longer changes the cursor; the image is the same, only
the unused fallback differs.

Touch: `cursor` has no effect without a pointer that hovers, so no media
query is needed for touch devices.

Locale: one asset, no `:lang()` rule (D-2). The "You" glyphs are image
paths, not a string, so Article VI's "no hardcoded user-facing string"
targets component text, not this image; recorded in the plan's gate.

## R10 · What tests can and cannot assert

Can (Vitest, happy-dom, reading files):

- The pure helper turns `connectorEndpoints` output into the inline
  custom properties of each line (x1, x2, both node indices), with no
  literal coordinates.
- The `<style scoped>` declarations contain the shared formulas
  (`sin(var(--services-float-phase)`, `skewY(atan(`,
  `vector-effect: non-scaling-stroke`) and the SVG is sized to the frame
  tokens instead of `size-full`.
- `global.css` registers `--services-float-phase` as `<angle>` inheriting,
  declares the keyframes 0deg → 360deg, has amplitude within 6–8, period
  within 5–7 s, and the reduced-motion override sets amplitude 0.
- The mobile float block exists, is fenced, and has its own reduced-motion
  override (own test file).
- `.output/public/cursor/you.svg` exists, has no full-size rect, keeps the
  pill rect and two paths, and its red equals `--red-400`.
- The emitted CSS in `.output/public/_nuxt/*.css` references
  `/cursor/you.svg` with the hotspot and both fallbacks, contains the
  `cursor:text` rule and the forced-colours guard, and still contains
  `sin(` (no build step folded it away).

Cannot (manual, quickstart): smoothness, readability while moving, the
glue at real widths (happy-dom resolves no `calc()`), performance, cursor
rendering and sharpness per browser, hotspot accuracy, contrast over red.

## R11 · Existing defect blocking acceptance 3 (OA-3)

`.canvas` width is `min(90rem, 100% + 2 × page padding)` (CONFIRMED), i.e.
narrower than 1440 px below a 1440 px viewport, while the radars sit at
fixed rem positions. The SVG is `size-full` with `viewBox="0 0 1440 910"`
and the default `preserveAspectRatio` (`xMidYMid meet`), so at a 1280 px
canvas it is scaled by `1280/1440 ≈ 0.889` and centred vertically with
`(910 − 809) / 2 ≈ 50` px offset (DERIVED). Connector 1's start then lands
near (133, 344) instead of (150, 330): about 22 px away (INFERRED, not
observed). Fix: size the SVG to `var(--services-canvas-w)` ×
`var(--services-canvas-h)` with `overflow: visible`, so its user space
matches the nodes' rem space at every width. The canvas's horizontal clip
below 1440 px is unchanged (the layout root clips overflow, CONFIRMED).

## A1 · Cursor size (amendment, 2026-10-14)

Roberto, after a local try: the cursor is too small. Change: render at
**64×64 CSS px** (2×) by setting only the root `width="64" height="64"`.
Sized from Roberto's reference screenshot (@2x): pill ≈48×31 CSS px, arrow
≈20 px, which is 2× the viewBox (pill 23.5×14.76 units → 47×29.5 px;
leader's measurement). Rounds 2 and 3 the same day set 48×48 and 64×64;
`viewBox="0 0 32 32"`, paths and colours unchanged. `diff` against
`01-Mouse.svg` now shows exactly: root `width`/`height`, the removed white
`<rect>`, and the provenance comment.

**Hotspot.** CSS cursor hotspots are given in the image's own pixel space
(here 64×64) and browsers expect integers (DERIVED from the property's
`<number>` coordinates and the usual integer handling; non-integer values
were not tested). Scaling R6 by 1.5:

| Point | 32×32 | 64×64 |
|---|---|---|
| Geometric vertex | (1, 5) | (2, 10) |
| Drawn miter tip | ≈(0.12, 4.12) | ≈(0.24, 8.24) (≈(0.2, 8.2) from the rounded (0.1, 4.1)) |

Integer candidates on the bisector: `1 9` lies between the drawn tip and the
vertex, inside the painted miter (which reaches ≈2.5 px beyond the vertex at
this scale): 1.1 px to the drawn tip, 1.4 px to the vertex, so the click
lands on the visible arrow tip. `2 10` is the vertex itself, 2.5 px behind
the visible tip; `0 8` is 0.3 px from the drawn tip but on the anti-aliased
outer edge of the stroke. **Chosen: `1 9`** (DERIVED). (Rounds 2 and 3, at
48×48 and 64×64, chose `1 7` and `1 9` by the same rule.)

**Size limits and caveats for cursors larger than 32 px.**

- CONFIRMED (MDN `cursor`, "Icon size limits", read 2026-10-14): Firefox and
  Chromium restrict cursor images to 128×128 by default and ignore larger
  ones; MDN recommends 32×32. 64×64 is within the hard limit but above the
  recommendation.
- UNVERIFIED: Chromium is reported to stop showing custom cursors larger
  than 32×32 (falling back to the keyword cursor) when the image would
  overlap browser UI outside the page, i.e. near the top or side edges of
  the viewport. Expected effect here: the system arrow/hand briefly near the
  viewport edge. Not confirmed from Chromium sources in this session.
- UNVERIFIED: on Windows, the OS pointer-size / accessibility scaling may or
  may not apply to custom page cursors, and very large device-pixel sizes
  (64 CSS px × DPR 2 = **exactly 128 device px, at the limit**; × DPR 3 =
  **192 device px, above it**, if a browser applies the limit in device
  pixels) may be clipped, downscaled or rejected or downscaled by the
  platform cursor API.
- UNVERIFIED: Safari's handling of SVG cursors above 32 px.

These go into the manual matrix (quickstart § 3, tasks T020): check the
cursor near each viewport edge and over the tab strip in Chrome, and on
Windows if available.

## A2 · Red lit dots, no glow, footer on the paper (amendment, 2026-10-14)

Roberto's decisions A2-1 to A2-5 are in spec § *Amendment A2* and are
approved. This section holds the evidence and the arithmetic behind the two
choices the spec makes inside them (A2-S1, A2-S2) and the footer audit.

### A2.1 · What "the glow" is in the code, and what goes with it

CONFIRMED by reading `app/shared/ui/CursorSpotlight.vue` and
`app/assets/css/global.css`:

| Piece | Role today | After A2 |
|---|---|---|
| `.cursor-spotlight__beam` `background-image` (two `radial-gradient`s), `background-position`, `background-repeat`, `background-size` | The light: an outer field red-400 42% → 17% at the mid stop → transparent, and a core at 37% | **Deleted.** The beam stays as the moving box that carries the mask and the lit sheet (`translate3d`, `will-change`) |
| `--spotlight-red-400-42`, `-17`, `-37` | Colours of the light | **Deleted** (only the beam used them) |
| `--spotlight-stop-mid` | Mid stop of the outer field | **Deleted** |
| `--spotlight-core-size` | Size of the core layer | **Deleted** |
| `--spotlight-outer-size` | Beam size, mask radius (×0.5), fallback position | **Replaced** by `--spotlight-lit-radius` (A2.3) |
| `--dot-paper-lit-color` | Lit dot colour, base recipe painted twice | **Kept**, value becomes `var(--red-400)` (A2.2) |
| `--duration-spotlight-fade`, `--layer-spotlight` | Fade, layer | **Kept** unchanged |

A `grep` over `app/`, `tests/` and `.storybook/` finds the deleted tokens in
`CursorSpotlight.vue`, `CursorSpotlight.test.ts`, `CursorSpotlight.stories.ts`
(prose), `tests/static-output.test.ts` (`--spotlight-outer-size:`) and
`global.css`, nowhere else (CONFIRMED). No token in the `--color-glow-*` /
`--spacing-glow-*` namespace is involved (`rules.md` § R36).

Points 2–4 of the component's "load-bearing" list survive unchanged in
substance (static mask, registration modulo the step, no blend mode); point 4's
argument about `screen` / `plus-lighter` was about the light over the dots and
becomes moot, but "no blend mode" still holds and its test stays.

### A2.2 · Centre colour: why red-400 at full opacity (A2-S1)

Values from `global.css`: red-400 `#CF3147`, ink-500 `#262626`, bone-100
`#FBF8F6`, ink-100 `#D9D9D9`, ink-200 `#A6A6A6`, ink-300 `#737373`. Contrast
ratios by WCAG relative luminance (DERIVED, computed in this session):

| Pair | Ratio |
|---|---|
| red-400 dot vs ink-500 page | 3.01 |
| base dot (ink-100 12% over ink-500 ≈ `#3B3B3B`) vs ink-500 | 1.35 |
| bone-100 text vs red-400 dot | 4.75 |
| ink-100 text vs red-400 dot | 3.56 |
| ink-200 text vs red-400 dot | 2.06 |
| ink-300 text vs red-400 dot | 1.06 |
| bone-100 text vs red-400 50% over ink-500 (≈ `#7A2C36`) | 8.86 |

Reasoning:

1. **Hue.** Red-400 at alpha *a* over ink-500 renders `a·#CF3147 + (1−a)·#262626`.
   For *a* < 1 that is a darker, greyer red (60% ≈ `#8B2D3A`, 50% ≈ `#7A2C36`)
   that is in no brand ramp. A2-2 forbids new red hues; the only centre value
   whose rendered pixel is a brand red is *a* = 1. The mask's falloff
   necessarily passes through those intermediate shades on the way out, which
   is the "fading with distance" A2-2 asks for; it is the peak that must be
   the brand tone.
2. **Readability.** The lit sheet is on `--layer-spotlight` (−1), below every
   piece of content (§ R37), so text always paints over a dot, never under
   it. Each dot is 2.5 px across on a 24 px grid: π·1.25² / 24² ≈ 0.85% of
   the area. The mask is linear, so a dot is at full strength only at the
   hotspot, where the 64×64 brand cursor's arrow tip sits, and at half
   strength 60 px out. Bone-100 text keeps 4.75:1 even against the strongest
   dot.
3. **Weak spot, recorded.** Ink-300 small text (footer category and bottom
   bar, 11–13 px) is 1.06:1 against a red-400 dot: a glyph pixel landing on
   a lit dot merges with it. Ink-300 on ink-500 is itself only 3.19:1. The
   effect is local (within the radius), transient (only while the pointer is
   there) and affects isolated points, so it is accepted at the spec level
   and put in the manual check (quickstart § 5). Fallback without a new hue
   token: `--dot-paper-lit-color: color-mix(in srgb, var(--red-400) N%,
   transparent)`, the same pattern `--color-glass-red-*` already uses.

### A2.3 · Radius and falloff (A2-3, A2-S2)

- Token: `--spotlight-lit-radius: 7.5rem` in `:root` (read only by
  hand-written CSS, `rules.md` § R18). 7.5 × 16 = 120 px at the default root.
- The mask stays `radial-gradient(circle R at center, black 0%, transparent
  100%)` with `R = var(--spotlight-lit-radius)` and `mask-repeat: no-repeat`:
  alpha `1 − d/R`, reaching 0 exactly at R, so no hard edge (feature 008
  FR-008).
- The beam's side becomes `2 × R` (240 px). The window and the lit sheet keep
  their one-step bleed (`inset: −step`), so the lit sheet is
  `2R + 4·step` = 336 px square at the default root; the registration
  arithmetic (`mod(beam-origin, step)`) is size-independent and unchanged.
- The fallback position for an unset `--spotlight-x/-y` stays a **length**
  (now derived from the radius), never a percentage: the component's own
  comment shows a percentage resolves against each element's box and the
  beam and the lit sheet differ in size. That argument is scale-invariant.
- Previous reach (CONFIRMED from source): mask radius `0.5 × 20.625rem` =
  165 px. The leader quoted about 354 px; not reconciled because the value
  is replaced.

### A2.4 · Footer audit (A2-4)

| Question | Finding | Status |
|---|---|---|
| Where does the footer's ink come from after the change? | The layout root is `bg-ink-500` and `html` carries the ink surface (`default.vue` comment, `global.css`), so the area stays ink-500 | CONFIRMED (repository) |
| Do the dots exist under the footer today? | `DotGrid` is `absolute inset-0` on the layout root, which contains the footer, so the sheet already spans it and is hidden by the footer's fill | CONFIRMED (repository) |
| Does anything scroll under the footer? | No. It is the last in-flow child; the nav is `sticky` on `--layer-nav` (+1) and paints above the footer as before. `ui-map.md` § 2's note that footer text can meet nav text on short viewports is about the nav having no surface and is unchanged | CONFIRMED (repository) |
| § R28 / § R37 layer order | Unchanged. The footer is normal flow; without a background it now follows the same "no opaque background" rule as sections. The sentence naming the footer as the only opaque block becomes false (docs list in spec A2) and is repeated in `SectionBackdrop.vue`'s doc comment, which is corrected in code (FR-028) | CONFIRMED (repository) |
| `overflow: clip` on the spotlight root ("beam near the footer") | Still required: with the effect now visible over the footer, the lit sheet near the document's end extends below the root and would otherwise grow the page. The comment's reason stands; wording updated to "near the end of the page" | CONFIRMED (repository), behaviour unchanged |
| Section glows under the footer | `SectionBackdrop` has no overflow rule, and Contacto's glow anchors (`wine` y 4520, `cierre` y 4630 in the 1440×5060 frame) sit at the footer's top edge (≈4660, DERIVED). What reaches below is hidden today and will show | INFERRED → spec OA-9 |
| Form cards | `bg-glass-dark-contact` (dark-glass 80%) + `backdrop-blur-glass-dark` on both forms' roots; they are content, so they paint over layers −3…−1 and keep covering the effect | CONFIRMED (repository); the blurred residue of a red dot under 80% glass is expected to be invisible (INFERRED, manual check) |
| Storybook | `SiteFooter.stories.ts` sets `backgrounds: { value: 'ink' }`, so the story still renders on ink without the class | CONFIRMED (repository) |
| Tests that pin the footer's background | None found in `SiteFooter.test.ts` | CONFIRMED (repository) |

### A2.5 · Tests that pin the new behaviour

- No glow: `CursorSpotlight.vue`'s style has no `background` / `background-image`
  on the beam or root, and exactly one `radial-gradient(` that paints colour
  (the lit sheet, with `var(--dot-paper-lit-color)`); the other is the mask.
- Lit colour: `global.css` declares `--dot-paper-lit-color: var(--red-400)`;
  the declared `--red-NNN` set is exactly 100…500; no other token's value is
  the literal `#cf3147`.
- Radius: `--spotlight-lit-radius: 7.5rem` (assert the rem value × 16 is in
  [112, 128] and equals 120 today); the mask uses `circle
  var(--spotlight-lit-radius)`.
- Footer: the rendered `<footer>` has no `bg-*` class.
- Forms: both form roots keep `bg-glass-dark-contact` and
  `backdrop-blur-glass-dark`.

What tests cannot show (manual, quickstart § 5): the red actually rendered,
the falloff's look, the absence of a visible edge, registration at real
scroll offsets, the footer's appearance, OA-9's glows, and the ink-300 weak
spot.
