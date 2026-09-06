# Phase 1 Data Model: Primitive UI layer

**Feature**: `specs/002-primitive-ui-layer` | **Date**: 2026-09-06

There is no runtime data in this feature — no store, no state, no fetch. The
"model" is the token vocabulary and the closed variant sets the eight
components accept. Everything below is build-time only.

---

## 1 · Token entities

### 1.1 Base colours (feature 001 — unchanged, listed for reference)

`--bone-100…500`, `--ink-100…500`, `--red-100…500`, `--wine-100…500` in
`:root`, mirrored into `@theme inline` as `--color-*`. **This feature adds to
this file and changes none of these values** (FR-008).

### 1.2 New base colour

| Token | Value | Why it exists |
|---|---|---|
| `--dark-glass` | `#1c1416` | The warm near-black behind every dark glass surface (Pill, BotonPrimario, SocialIcon, forms, mobile menu panel). Belongs to no brand ramp and is **not** `ink-500` `#262626`. FR-031. |

### 1.3 Derived glass colours (`@theme inline`, `--color-*` namespace)

Each is `color-mix(in srgb, <base> <alpha>%, transparent)`. Full table with
alpha derivations in `research.md` § R3.

| Token | Base | Alpha | Replaces |
|---|---|---|---|
| `--color-glass-red-strong` | `--red-400` | 17% | `#CF31472B` |
| `--color-glass-red-soft` | `--red-400` | 12% | `#CF31471F` |
| `--color-glass-red-strong-line` | `--red-400` | 47% | `#CF314778` |
| `--color-glass-red-soft-line` | `--red-400` | 35% | `#CF314759` |
| `--color-glass-bone-strong` | `--bone-100` | 10% | `#FBF8F61A` |
| `--color-glass-bone` | `--bone-100` | 6% | `#FBF8F60F` |
| `--color-glass-bone-faint` | `--bone-100` | 4% | `#FBF8F60A` |
| `--color-glass-line` | `--bone-100` | 18% | `#FBF8F62E` |
| `--color-glass-line-faint` | `--bone-100` | 16% | `#FBF8F229` (A-07) |
| `--color-glass-dark` | `--dark-glass` | 65% | `#1C1416A6` |
| `--color-glass-dark-line` | `--bone-100` | 23% | `#FBF8F63B` |
| `--color-radar-halo-outer` | `--red-400` | 12% | `#CF31471F` |
| `--color-radar-halo-mid` | `--red-400` | 30% | `#CF31474D` |

### 1.4 Type roles

22 roles, each a 4-tuple (size, line-height, letter-spacing, font-weight).
Values in `research.md` § R2. Invariants:

- Size is `clamp()` between the 390px and 1440px endpoints, or a single `rem`
  where the design documents no change (`service-brief`, `form-label`,
  `input-value`, `button-sm`, `link`).
- Letter-spacing is always `em`, never `px` (so it tracks the fluid size).
- Weight is one of 400 / 500 / 600. **No 700 appears anywhere in this design.**
- Every role except `wordmark` renders in `--font-instrument`; `wordmark` is
  the only consumer of `--font-poppins`, per `branding.md` ("logo/wordmark,
  exclusive").

### 1.5 Surface roles

24 spacing / radius / blur tokens, values in `research.md` § R2. Invariants:

- Anything documented with two frame values is fluid; anything documented once
  is fixed.
- `--radius-panel` (22→18) and `--radius-panel-sm` (20→18) are distinct: the
  red variants use the first, bone and dark use the second.

## 2 · Component entities

### 2.1 GlassPanel

| Variant | Fill | Border | Blur | Radius | Padding |
|---|---|---|---|---|---|
| `red-strong` | `glass-red-strong` | `glass-red-strong-line` | `blur-glass-red` | `radius-panel` | `spacing-glass-red` |
| `red-soft` | `glass-red-soft` | `glass-red-soft-line` | `blur-glass-red` | `radius-panel` | `spacing-glass-red` |
| `bone-strong` | `glass-bone-strong` | `glass-line` | `blur-glass` | `radius-panel-sm` | `spacing-glass-bone` |
| `bone` | `glass-bone` | `glass-line` | `blur-glass` | `radius-panel-sm` | `spacing-glass-bone` |
| `bone-faint` | `glass-bone-faint` | `glass-line-faint` | `blur-glass` | `radius-panel-sm` | `spacing-glass-red` |
| `dark` | `glass-dark` | `glass-dark-line` | `blur-glass-dark` | `radius-panel-sm` | `spacing-glass-dark` |

Border width is 1px on every variant. `padding` is orthogonal to `variant`:
`'default'` (the variant's own value) · `'tight'` (`spacing-glass-tight`,
22→18, used by the photo frames) · `'none'`. FR-015.

Design source: design-extract § 1, verbatim.

### 2.2 Radar

| Size | Outer ⌀ | Middle ⌀ | Core ⌀ |
|---|---|---|---|
| `sm` | 20 | 14 | 7 |
| `md` | 30 | 20 | 12 |
| `sm-alt` | 22 | 16 | 10 |

Three concentric circles (concentricity verified in `research.md` § R7).
Colours are fixed for all sizes: outer `radar-halo-outer`, middle
`radar-halo-mid`, core `red-400`. `size` is the only prop.

### 2.3 Wordmark

Two forms, one prop (`form: 'full' | 'short'`). Three text runs with no gap:
`muush` (bone-100) · `.` (red-400, omitted in `short`) · `dev` (bone-100,
omitted in `short`). Typeface `--font-poppins`, role `--text-wordmark`.

### 2.4 Lockup

`Isotipo (on-ink asset) + gap + Wordmark`, cross-axis centred. Isotipo width is
`--spacing-isotipo` (40→52); height and stroke follow the viewBox
(`research.md` § R6). Gap is `--spacing-lockup-gap` (9→12). Passes its `form`
prop straight through to Wordmark.

### 2.5 Pill

`Radar sm + gap 11 + label`. Fully rounded, `glass-dark` fill,
`glass-line` 1px border, padding `9 / 20 / 9 / 10` (top / right / bottom /
left), label in `bone-200` at the `pill` role. One content prop: `label`.

### 2.6 BotonPrimario

| Variant | Padding Y | Padding X | Label role |
|---|---|---|---|
| `nav` | `spacing-btn-nav-y` (13) | `spacing-btn-nav-x` (24) | `button-sm` (14) |
| `hero` | `spacing-btn-y` (16→18) | `spacing-btn-hero-x` (26→32) | `button` (15→16) |
| `submit` | `spacing-btn-y` (16→18) | `spacing-btn-submit-x` (28→32) | `button` (15→16) |

Shared by all three: `glass-dark` fill, `radius-control` (12), label in
`bone-100`, and the 1.5px LED ring (`research.md` § R4). Renders as `<a>` when
`href` is set, otherwise `<button type={type}>` — the submit variant needs a
real button, the hero variant is an anchor to `#contacto`.

**LED states**: idle = static ring at gradient angle 0 · hover (pointer
devices only) = 2.6s linear rotation · reduced motion = flat red-400 · no
`@property` support = static gradient ring. There is no "in-flight/disabled"
state here; the form's sending state belongs to the form feature.

### 2.7 LinkArrow

Two sizes (`default` → `link` role 16; `large` → `link-lg` role 20→23), always
bone-100, always with a trailing `→`, never a background or border in any
state (FR-026). Hover affordance: underline or a small arrow translate, and
nothing else. External destinations get `target="_blank" rel="noopener
noreferrer"`.

### 2.8 SocialIcon

| Network | Normalized asset |
|---|---|
| `linkedin` | `src/assets/social/linkedin.svg` |
| `instagram` | `src/assets/social/instagram.svg` |
| `tiktok` | `src/assets/social/tiktok.svg` |

48×48 (`spacing-social`) `glass-dark` square, `radius-icon` (10), `glass-line`
1px border, glyph 24×24 (`spacing-social-glyph`) centred and inheriting
`bone-100` through `currentColor`. Requires `href` and an accessible `label`
(FR-028).

## 3 · Relationships

```text
Pill ────────────► Radar (size="sm")
Lockup ──────────► Wordmark
       └─────────► isotipo-on-ink.svg   (asset, feature 001)
SocialIcon ──────► {linkedin,instagram,tiktok}.svg   (assets, this feature)

GlassPanel   BotonPrimario   LinkArrow   Radar   Wordmark   — no dependencies
```

Exactly the two dependencies FR-013 permits. No component imports a layout, a
page, or anything from `src/islands/`.

## 4 · Validation rules

| Rule | Enforced by |
|---|---|
| Variant values are closed sets | String-literal union in each `Props` interface; `astro check` |
| No `any` | Article V; `astro check` under `astro/tsconfigs/strict` |
| No colour or size literal in markup | Review + `grep` gate in `quickstart.md` |
| Class names are complete strings, never concatenated | `const` lookup maps — required for Tailwind's scanner to emit the utility at all |
| No hardcoded ES/EN copy | All text arrives as props (FR-029) |
| Zero client JS | No `client:*` directive, no `<script>` in any of the eight files |
