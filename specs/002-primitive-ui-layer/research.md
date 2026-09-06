# Phase 0 Research: Primitive UI layer

**Feature**: `specs/002-primitive-ui-layer` | **Date**: 2026-09-06

Every value below is either (a) copied from
`docs/business/landing/design-extract.md`, (b) computed from those values with
the arithmetic shown, or (c) verified against the packages actually installed
in this repo. Nothing here is estimated from memory.

**Verification status legend**: **CONFIRMED** = checked against a file in this
repo or in `node_modules`. **DERIVED** = computed from a confirmed value, with
the computation shown. **DECIDED** = a judgement call, with alternatives and
the reason recorded.

---

## R1 · How the fluid scale is expressed in Tailwind 4

**Decision**: Define every role in the existing `@theme inline` block of
`src/styles/global.css` using Tailwind 4's `--text-*` namespace with its
per-role sub-properties, so a component writes exactly one class:

```css
--text-display: clamp(2.875rem, 1.6679rem + 4.9524vw, 6.125rem);
--text-display--line-height: 0.98;
--text-display--letter-spacing: -0.036em;
--text-display--font-weight: 600;
```

`text-display` then emits `font-size`, `line-height`, `letter-spacing` and
`font-weight` together — size, rhythm and tracking all arrive from one token,
which is what FR-003 requires.

**CONFIRMED** against `tailwindcss@4.3.3` in this repo:
`node_modules/.../tailwindcss/theme.css` ships `--text-xs--line-height` style
sub-properties, and `dist/lib.js` resolves `--line-height`, `--letter-spacing`
and `--font-weight` sub-keys for the `text-*` utility.

Surfaces use the sibling namespaces: `--spacing-*` (drives `p-*`, `gap-*`,
`m-*`, `size-*`), `--radius-*` (drives `rounded-*`) and `--blur-*` (drives
both `blur-*` and `backdrop-blur-*`). All three are **CONFIRMED** present in
the installed `theme.css`.

**Alternatives rejected**:
- *Plain CSS classes in a `@layer components` block* — works, but every
  component would then hand-write `font-size`/`line-height`/`letter-spacing`,
  which is exactly the duplication Article IX forbids.
- *Tailwind's built-in `text-5xl`-style steps with arbitrary overrides* —
  requires `text-[98px]` arbitrary values, banned by Article IV.
- *A separate `@theme` (non-inline) block* — mixing modes in one file is a
  gratuitous inconsistency; the file already uses `@theme inline` and the
  fluid values are literals, so `inline` behaves identically for them.

## R2 · clamp() slope arithmetic (390px → 1440px)

**Decision**: interpolate between the two frame widths that actually exist in
the design file — 390px mobile and 1440px desktop (spec A-01) — using the
standard two-point form, expressed as `rem + vw` so the value still responds
to the user's root font-size instead of being pure-viewport (an accessibility
requirement: pure `vw` sizing defeats browser zoom).

For endpoints `min` (at 390px) and `max` (at 1440px):

```
slope     = (max - min) / (1440 - 390)
vw part   = slope × 100                       → the vw coefficient
rem part  = (min - slope × 390) / 16          → the intercept
value     = clamp(min/16 rem, rem-part + vw-part, max/16 rem)
```

**DERIVED — full type scale** (all values computed, endpoints verified: the
`display` expression evaluates to exactly 46px at a 390px viewport and exactly
98px at 1440px):

| Role | 390 | 1440 | `--text-<name>` | line-height | weight | tracking | Source |
|---|---|---|---|---|---|---|---|
| `display` | 46 | 98 | `clamp(2.875rem, 1.6679rem + 4.9524vw, 6.125rem)` | 0.98 | 600 | -0.036em | § 9 Display |
| `h1` | 38 | 74 | `clamp(2.375rem, 1.5393rem + 3.4286vw, 4.625rem)` | 1.02 | 600 | -0.035em | § 9 H1 |
| `h2` | 38 | 62 | `clamp(2.375rem, 1.8179rem + 2.2857vw, 3.875rem)` | 1.02 | 600 | -0.034em | § 9 H2 CTA |
| `h2-alt` | 34 | 52 | `clamp(2.125rem, 1.7071rem + 1.7143vw, 3.25rem)` | 1.05 | 600 | -0.031em | § 9 H2 Proyectos |
| `h3` | 28 | 44 | `clamp(1.75rem, 1.3786rem + 1.5238vw, 2.75rem)` | 1.1 | 600 | -0.031em | § 9 H3 Work with muush (mobile derived, A-03) |
| `h3-alt` | 22 | 34 | `clamp(1.375rem, 1.0964rem + 1.1429vw, 2.125rem)` | 1.26 | 600 | -0.03em | § 9 H3 Network |
| `lead` | 22 | 30 | `clamp(1.375rem, 1.1893rem + 0.7619vw, 1.875rem)` | 1.35 | 500 | -0.02em | § 9 Lead (A-05) |
| `copy` | 19 | 24 | `clamp(1.1875rem, 1.0714rem + 0.4762vw, 1.5rem)` | 1.35 | 500 | -0.03em | § 9 Copy Delivery (mobile derived, A-03) |
| `body-lg` | 17 | 21 | `clamp(1.0625rem, 0.9696rem + 0.381vw, 1.3125rem)` | 1.5 | 400 | 0 | § 9 Body subhead hero |
| `body` | 16 | 20 | `clamp(1rem, 0.9071rem + 0.381vw, 1.25rem)` | 1.55 | 400 | 0 | § 9 Body intro Nosotros |
| `body-sm` | 16 | 18 | `clamp(1rem, 0.9536rem + 0.1905vw, 1.125rem)` | 1.6 | 400 | 0 | § 9 Body copy CTA |
| `service-name` | 18 | 19 | `clamp(1.125rem, 1.1018rem + 0.0952vw, 1.1875rem)` | 1.18 | 600 | -0.03em | § 9 Nombre de servicio |
| `service-brief` | 14 | 14 | `0.875rem` | 1.55 | 400 | 0 | § 9 Brief (fixed) |
| `form-label` | 12 | 12 | `0.75rem` | 1.4 | 500 | 0.042em | § 9 Label (fixed) |
| `input-value` | 15 | 15 | `0.9375rem` | 1.4 | 400 | 0 | § 9 Valor de input (fixed) |
| `pill` | 12 | 13 | `clamp(0.75rem, 0.7268rem + 0.0952vw, 0.8125rem)` | 1.2 | 500 | 0.054em | § 3 / § 9 Texto de Pill |
| `meta` | 11.5 | 12.5 | `clamp(0.7188rem, 0.6955rem + 0.0952vw, 0.7813rem)` | 1.4 | 500 | 0.04em | § 9 Meta (midpoint of the 12–13 / 11–12.5 ranges) |
| `wordmark` | 19 | 24 | `clamp(1.1875rem, 1.0714rem + 0.4762vw, 1.5rem)` | 1 | 600 | -0.03em | § 5 |
| `button` | 15 | 16 | `clamp(0.9375rem, 0.9143rem + 0.0952vw, 1rem)` | 1.2 | 600 | 0 | § 4 hero/submit |
| `button-sm` | 14 | 14 | `0.875rem` | 1.2 | 600 | 0 | § 4 nav (desktop only) |
| `link` | 16 | 16 | `1rem` | 1.4 | 600 | 0 | § 7 hero (A-06) |
| `link-lg` | 20 | 23 | `clamp(1.25rem, 1.1804rem + 0.2857vw, 1.4375rem)` | 1.3 | 600 | -0.03em | § 7 CTA final |

**Tracking as `em` — DERIVED and verified.** The design's px tracking values
convert to a nearly constant ratio across both frames, so one `em` value per
role reproduces both endpoints and needs no interpolation:
display −3.5/98 = −0.0357 vs −1.7/46 = −0.0370 · h2 −2.1/62 = −0.0339 vs
−1.3/38 = −0.0342 · h2-alt −1.6/52 = −0.0308 vs −1.05/34 = −0.0309 ·
wordmark −0.72/24 = −0.030 vs −0.57/19 = −0.030 · service-name −0.57/19 =
−0.030 vs −0.54/18 = −0.030. This also matches `branding.md`'s "tracking −3%".
The single exception is `lead` (−0.020 desktop vs −0.030 mobile), resolved per
spec A-05.

**Line height — DECIDED**: fixed per role at the desktop value. Every
documented mobile deviation is ≤ 4% (display 0.98 vs 1.0, h2 1.02 vs 1.03,
h3-alt 1.24 vs 1.28 → 1.26 used as the midpoint, body-sm 1.6 vs 1.55), which
is imperceptible and not worth a second clamp per role.

**DERIVED — surface scale**:

| Token | 390 | 1440 | Value | Source |
|---|---|---|---|---|
| `--spacing-page` | 24 | 80 | `clamp(1.5rem, 0.2rem + 5.3333vw, 5rem)` | § 9 Margen de página |
| `--spacing-glass-red` | 22 | 32 | `clamp(1.375rem, 1.1429rem + 0.9524vw, 2rem)` | § 1 red-strong/red-soft/bone-faint padding |
| `--spacing-glass-bone` | 22 | 28 | `clamp(1.375rem, 1.2357rem + 0.5714vw, 1.75rem)` | § 1 bone/bone-strong padding |
| `--spacing-glass-dark` | 24 | 34 | `clamp(1.5rem, 1.2679rem + 0.9524vw, 2.125rem)` | § 1 dark padding |
| `--spacing-glass-tight` | 18 | 22 | `clamp(1.125rem, 1.0321rem + 0.381vw, 1.375rem)` | § 1 bone tight (photo) padding |
| `--spacing-form-gap` | 14 | 16 | `clamp(0.875rem, 0.8286rem + 0.1905vw, 1rem)` | § 9 Gap de formulario |
| `--spacing-lockup-gap` | 9 | 12 | `clamp(0.5625rem, 0.4929rem + 0.2857vw, 0.75rem)` | § 6 |
| `--spacing-isotipo` | 40 | 52 | `clamp(2.5rem, 2.2214rem + 1.1429vw, 3.25rem)` | § 6 isotipo width |
| `--spacing-pill-y` | 9 | 9 | `0.5625rem` | § 3 padding |
| `--spacing-pill-start` | 10 | 10 | `0.625rem` | § 3 padding-left |
| `--spacing-pill-end` | 20 | 20 | `1.25rem` | § 3 padding-right |
| `--spacing-pill-gap` | 11 | 11 | `0.6875rem` | § 3 gap |
| `--spacing-btn-y` | 16 | 18 | `clamp(1rem, 0.9536rem + 0.1905vw, 1.125rem)` | § 4 hero/submit |
| `--spacing-btn-hero-x` | 26 | 32 | `clamp(1.625rem, 1.4857rem + 0.5714vw, 2rem)` | § 4 hero |
| `--spacing-btn-submit-x` | 28 | 32 | `clamp(1.75rem, 1.6571rem + 0.381vw, 2rem)` | § 4 submit |
| `--spacing-btn-nav-y` | 13 | 13 | `0.8125rem` | § 4 nav |
| `--spacing-btn-nav-x` | 24 | 24 | `1.5rem` | § 4 nav |
| `--spacing-social` | 48 | 48 | `3rem` | § 8 button size |
| `--spacing-social-glyph` | 24 | 24 | `1.5rem` | A-09 |
| `--radius-panel` | 18 | 22 | `clamp(1.125rem, 1.0321rem + 0.381vw, 1.375rem)` | § 1 red variants |
| `--radius-panel-sm` | 18 | 20 | `clamp(1.125rem, 1.0786rem + 0.1905vw, 1.25rem)` | § 1 bone/dark variants |
| `--radius-control` | 12 | 12 | `0.75rem` | § 4 |
| `--radius-icon` | 10 | 10 | `0.625rem` | § 8 |
| `--blur-glass-red` | 20 | 22 | `clamp(1.25rem, 1.2036rem + 0.1905vw, 1.375rem)` | § 1 red variants |
| `--blur-glass` | 16 | 16 | `1rem` | § 1 bone variants |
| `--blur-glass-dark` | 22 | 22 | `1.375rem` | § 1 dark variant |

The fully-rounded pill uses Tailwind's built-in `rounded-full` — no token is
added for `999px` (Article IX: don't re-declare what exists).

**Note on `backdrop-blur`**: Tailwind's `backdrop-blur-*` reads the `--blur-*`
namespace, so `backdrop-blur-glass-red` works from the table above without a
separate namespace.

## R3 · Glass fills without 8-digit hex in components

**Decision**: express every translucent value as
`color-mix(in srgb, var(--<ramp-token>) <alpha>%, transparent)` in the theme
block, exposed as `--color-glass-*` tokens so components write
`bg-glass-red-strong border-glass-red-strong-line`.

`color-mix(in srgb, X <a>%, transparent)` produces exactly `rgba(X, a/100)` —
the same pixel the 8-digit hex encodes — while keeping the base colour a
reference to the feature-001 ramp, which is what Article IV demands (change
the brand, change one file).

**DERIVED — alpha conversions** (hex byte ÷ 255, rounded):
`2B`=17% · `78`=47% · `1F`=12% · `59`=35% · `1A`=10% · `2E`=18% · `0F`=6% ·
`0A`=4% · `29`=16% · `A6`=65% · `3B`=23% · `4D`=30%.

| Token | Expression | Design value (§ 0/§ 1) |
|---|---|---|
| `--color-glass-red-strong` | `color-mix(in srgb, var(--red-400) 17%, transparent)` | `#CF31472B` |
| `--color-glass-red-soft` | `color-mix(in srgb, var(--red-400) 12%, transparent)` | `#CF31471F` |
| `--color-glass-red-strong-line` | `color-mix(in srgb, var(--red-400) 47%, transparent)` | `#CF314778` |
| `--color-glass-red-soft-line` | `color-mix(in srgb, var(--red-400) 35%, transparent)` | `#CF314759` |
| `--color-glass-bone-strong` | `color-mix(in srgb, var(--bone-100) 10%, transparent)` | `#FBF8F61A` |
| `--color-glass-bone` | `color-mix(in srgb, var(--bone-100) 6%, transparent)` | `#FBF8F60F` |
| `--color-glass-bone-faint` | `color-mix(in srgb, var(--bone-100) 4%, transparent)` | `#FBF8F60A` |
| `--color-glass-line` | `color-mix(in srgb, var(--bone-100) 18%, transparent)` | `#FBF8F62E` |
| `--color-glass-line-faint` | `color-mix(in srgb, var(--bone-100) 16%, transparent)` | `#FBF8F229` → bone-100 @16%, per A-07 |
| `--color-glass-dark` | `color-mix(in srgb, var(--dark-glass) 65%, transparent)` | `#1C1416A6` |
| `--color-glass-dark-line` | `color-mix(in srgb, var(--bone-100) 23%, transparent)` | `#FBF8F63B` |
| `--color-radar-halo-outer` | `color-mix(in srgb, var(--red-400) 12%, transparent)` | `#CF31471F` |
| `--color-radar-halo-mid` | `color-mix(in srgb, var(--red-400) 30%, transparent)` | `#CF31474D` |

**Two new base tokens** join the `:root` ramps (spec FR-031):

- `--dark-glass: #1c1416` — the warm near-black the design uses for every dark
  glass surface. **It is not `ink-500` (`#262626`)** and belongs to no ramp;
  giving it a name is the only way components stay literal-free.
- The `bone-faint` border's `#FBF8F2` is folded into `bone-100` at 16% (A-07)
  rather than earning a token, since the two differ by 4/255 in one channel at
  16% opacity.

**Alternatives rejected**: literal `rgba()` tokens (breaks the link to the
ramp — a brand change would then require editing 13 values instead of 4);
Tailwind opacity modifiers like `bg-red-400/17` (correct output, but the
17/12/47/35 magic numbers would then live in component markup, which is what
Article IV and Article IX both forbid).

## R4 · A conic-gradient LED border with no JavaScript

**Decision**: an absolutely-positioned `::before` ring, masked to the border
band with `mask-composite`, rotating an `@property`-registered angle.

```css
@property --led-angle {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}

.led { position: relative; --led-angle: 0deg; }

.led::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: var(--stroke-led);          /* 1.5px → 0.09375rem */
  background: conic-gradient(
    from var(--led-angle),
    var(--color-red-400) 0%,
    var(--color-bone-100) 50%,
    var(--color-red-400) 100%
  );
  mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  mask-composite: exclude;
  pointer-events: none;
}

@media (hover: hover) {
  .led:hover::before { animation: led-spin 2.6s linear infinite; }
}

@keyframes led-spin { to { --led-angle: 360deg; } }

@media (prefers-reduced-motion: reduce) {
  .led::before { animation: none; background: var(--color-red-400); }
}
```

Why each piece:

- **`mask-composite: exclude`** paints only the 1.5px band, so the button's own
  65%-opaque dark fill is never tinted by the gradient underneath it. The
  simpler `background-clip: padding-box, border-box` two-layer trick fails here
  precisely because the fill is translucent — the conic layer shows through the
  middle of the button.
- **`@property`** is what makes an angle animatable at all; CSS cannot
  interpolate an unregistered custom property. Where `@property` is
  unsupported, `--led-angle: 0deg` is still declared on the element, so the
  ring paints correctly and simply does not rotate — which is exactly the
  documented fallback in `ui-map.md` § 10.
- **`@media (hover: hover)`** implements spec A-02: a touch device never enters
  the hover state, so it gets the static ring. This is also the answer to
  `decisions-open.md` open decision #8 until Clau rules otherwise, and
  reversing it means deleting one media query.
- **`prefers-reduced-motion`** replaces the gradient with flat red-400, per
  FR-025 and `ui-map.md` § 10 ("Borde LED → borde estático en Red 400").
- The three stops are **red-400 → bone-100 → red-400**. Wine appears nowhere.
  `#cf3247` *is* `--red-400`, so the third stop reuses the token (FR-023,
  design-extract § 4 and § 11).

**Alternatives rejected**: a rotating pseudo-element clipped by
`overflow: hidden` (needs the pseudo to be a square at least as wide as the
button's diagonal — brittle for a button whose width comes from its text); an
SVG `<animateTransform>` ring (heavier, and the stroke would not follow the
rounded rect cleanly); any JavaScript (Articles I and II).

**Where the animation lives**: this is the one component with a `<style>`
block, and `@property` plus `@keyframes` are document-level at-rules — they go
in `src/styles/global.css` next to the tokens, not in a scoped component style,
so the rule is declared exactly once even if the button is rendered twice.

## R5 · Inlining SVG assets in Astro 7

**Decision**: use Astro's native SVG component import for both the isotipo
(Lockup) and the three social glyphs (SocialIcon):

```astro
import Isotipo from '@/assets/logo/isotipo-on-ink.svg'
<Isotipo class="..." />
```

**CONFIRMED** in `astro@7.2.8` installed here: `astro/client.d.ts` declares
`module '*.svg' { const Component: SvgComponent & ImageMetadata }`, and
`dist/assets/svg/utils.js` (`makeSvgComponent`) parses the file, drops the
root's size attributes and re-emits the children inline with any props spread
onto the `<svg>` element. Because the markup is inlined rather than referenced
through `<img>`, `fill="currentColor"` in the normalized glyphs resolves
against the container's colour — which is the entire point of the
normalization (FR-033).

**Alternatives rejected**: `?raw` + `set:html` (works, but bypasses type
checking and invites string surgery on the asset); `<img src>` (breaks
`currentColor` — the glyph could never take the bone-100 token); copying the
SVG markup into the component (duplicates geometry that `branding.md` defines
once — Article IX DRY).

**Consequence — one config change**: `tsconfig.json` has no `@/assets/*` path
alias today (it has `@/components`, `@/islands`, `@/layouts`, `@/i18n`,
`@/types`, `@/utils`). Article VI forbids a relative import that crosses a
directory boundary, so `"@/assets/*": ["src/assets/*"]` must be added. This is
a 1-line addition to an existing `paths` map, not a structural change.

## R6 · The isotipo stroke width needs no override

**DERIVED — and this simplifies Lockup considerably.** `design-extract.md` § 6
records that the isotipo's `strokeWidth` "no escala solo" and must be set per
instance via `12 × (ancho ÷ 70.5)`. That is true **inside Pencil**. In SVG it
is automatic: the asset declares `viewBox="14.5 38.5 70.5 39.5"` with
`stroke-width="12"` in user units (**CONFIRMED** by reading
`src/assets/logo/isotipo-on-ink.svg`), so rendering it at any CSS width scales
the stroke by the same factor the formula describes.

Check: 12 × 52 ÷ 70.5 = **8.851** (design says 8.85 ✓) and
12 × 40 ÷ 70.5 = **6.809** (design says 6.8 ✓). The heights corroborate it:
52 × 39.5 ÷ 70.5 = 29.13 ≈ 29 ✓ and 40 × 39.5 ÷ 70.5 = 22.41 ≈ 22 ✓ — the
design's isotipo boxes are exactly this viewBox scaled.

**Decision**: Lockup sets only the width (`--spacing-isotipo`, fluid 40→52)
and lets height and stroke follow the viewBox. No `strokeWidth` prop, no
computation, no helper in `src/utils/`.

**Consequence for testing (Article VII)**: the only candidate for a unit test
in this feature was that computation. It does not exist, so no new Vitest test
is added — consistent with Article VII's "component-level testing is deferred
until a component's logic is complex enough to warrant it" and with feature
001's precedent. The existing suite (`tests/i18n-utils.test.ts`) must keep
passing untouched.

## R7 · Radar geometry

**DERIVED — the three rings are exactly concentric**, so the component needs
one centre and three diameters, not the offsets the design file lists:

| Size | halo2 ⌀ | halo ⌀ | dot ⌀ | halo offset in `.pen` | (halo2−halo)/2 | dot offset | (halo2−dot)/2 |
|---|---|---|---|---|---|---|---|
| `sm` | 20 | 14 | 7 | 3,3 | **3** ✓ | 6.5,6.5 | **6.5** ✓ |
| `md` | 30 | 20 | 12 | 5,5 | **5** ✓ | 9,9 | **9** ✓ |
| `sm-alt` | 22 | 16 | 10 | — | 3 | — | 6 |

**Decision**: render as three nested rounded elements centred on each other
(`place-items: center` on a grid, or two absolutely-centred children), sized
from three `--size-radar-*` tokens per variant. Colours: outer
`--color-radar-halo-outer` (red-400 @12%), middle `--color-radar-halo-mid`
(red-400 @30%), core `--color-red-400` — from design-extract § 2 and § 0.

The mobile-services opacity ladder (0.18 / 0.45 / 1) belongs to the services
section, not to Radar — it is applied by the future consumer to the whole
radar+text group. Radar exposes no opacity prop (Article IX: no speculative
API).

## R8 · Normalizing the three social glyphs

**Decision**: normalize by hand into `src/assets/social/`, target
`viewBox="0 0 24 24"` on all three, one wrapping `<g transform>` per file, no
new dependency.

**CONFIRMED** by reading the three source files:

| File | Source viewBox | What is actually wrong |
|---|---|---|
| `Linkedin/linkedin-logo-white.svg` | `34.13333 34.13333 187.73333 187.73333` | Square already. One `<path fill="#ffffff" transform="scale(8.53333)">`; path coordinates run 4→26, i.e. a 22-unit square offset by 4 |
| `Instagram/Instagram_Glyph_White.svg` | `0 0 1000 1000` | Square. `<defs><style>.cls-1{fill:#fff;}</style></defs>` with `class="cls-1"` on the paths — a **global** class that collides when inlined |
| `TikTok/tiktok-logo-white.svg` | `0 0 1419 1627` | **Not square** (ratio 0.872). XML prolog + DOCTYPE + `xmlns:serif` metadata, `style="fill-rule:evenodd;clip-rule:evenodd;…"` on the root, and four nested `<g transform="matrix(…)">` |

**DERIVED — the transform each file needs**:

- **LinkedIn**: art occupies 22 units starting at (4,4) → scale `24 ÷ 22 =
  1.090909`, offset −4 before scaling:
  `<g transform="scale(1.090909) translate(-4 -4)">`. The original
  `scale(8.53333)` and the viewBox offset both disappear (FR-035).
- **Instagram**: `24 ÷ 1000 = 0.024` exactly →
  `<g transform="scale(0.024)">`. `<defs>`/`<style>` deleted, `class="cls-1"`
  replaced by `fill="currentColor"` on each path (FR-034).
- **TikTok**: fit the taller axis, then centre the narrower one.
  scale = `24 ÷ 1627 = 0.0147511`; rendered width = `1419 × 0.0147511 =
  20.93`; horizontal inset = `(24 − 20.93) ÷ 2 = 1.53` →
  `<g transform="translate(1.53 0) scale(0.0147511)">` wrapping the existing
  (geometry-preserving) matrix chain. That is the "optical centring" FR-035
  asks for.

**Carry-over detail that must not be lost**: TikTok's `fill-rule: evenodd` and
`clip-rule: evenodd` currently live in the root `style` attribute that gets
stripped. They must be re-attached as presentation attributes on the paths, or
the glyph's counters fill in solid.

**Every** `fill="#ffffff"` / `fill:#fff` becomes `fill="currentColor"`, so the
glyph takes `bone-100` (`#FBF8F6`) from its container instead of pure white —
the whole reason the normalization exists (`decisions-open.md`, FR-033).

**Alternatives rejected**: adding SVGO as a dependency (a build tool for a
one-time, three-file job — Article IX "no infrastructure ahead of an actual
need"); keeping three different viewBoxes and sizing each glyph individually
(pushes per-icon magic numbers into SocialIcon).

## R9 · Component prop typing under TypeScript strict

**Decision**: each `.astro` file declares `interface Props` in its frontmatter
with string-literal unions for variants, defaults via destructuring, and
`HTMLAttributes<'div'>`-style rest spreading only where a caller genuinely
needs it (GlassPanel and the three link-bearing components). No `any`, no
`@ts-ignore` (Article V).

Variant unions are exported as named types from each component file so future
consumers can reference them (`import type { GlassVariant } from
'@/components/GlassPanel.astro'`). No shared `src/types/ui.ts` barrel is
created — with one consumer each, that would be premature centralization.

The variant → class mapping is a `const` lookup object (`satisfies
Record<Variant, string>`), never string concatenation, because Tailwind's
scanner only sees complete class names in the source.

## R10 · Where the CSS actually lives

**Decision**: tokens, the `@property` registration and the `@keyframes` go in
`src/styles/global.css`, **appended** below the existing feature-001 content,
which is not modified. Component-specific rules that cannot be expressed as
utilities (the masked `::before` ring, the reduced-motion override) go in the
component's own scoped `<style>` block, referencing tokens only.

Appending rather than restructuring is what keeps this feature's diff on
`global.css` reviewable and satisfies FR-008 (no existing token value changes).

## Open items carried into implementation

None blocking. Two items are recorded as reversible decisions rather than
unknowns:

1. **LED on touch devices** — spec A-02, implemented as `@media (hover:
   hover)`. Pending `decisions-open.md` #8 (non-blocking); reversal is one
   media query in `global.css`.
2. **`meta` role's exact size** — the design documents a range (12–13 desktop,
   11–12.5 mobile) rather than one value; the midpoint is used and the
   consuming feature can refine it when a specific instance demands it.
