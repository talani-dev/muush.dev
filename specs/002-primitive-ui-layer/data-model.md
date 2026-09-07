# Phase 1 Data Model: Primitive UI layer

**Feature**: `specs/002-primitive-ui-layer` | **Date**: 2026-09-06

There is no runtime data in this feature — no store, no state, no fetch, no
persistence. The "model" is the **closed variant sets** the eight components
accept and the **utility classes** each variant resolves to. Everything below
is build-time.

Every class name in this file was verified to compile against the real
`app/assets/css/global.css` (`research.md` § R1). None of them is added by this
feature.

---

## 1 · Component dependency graph

```text
Pill ──────────► Radar (size="sm")
Lockup ────────► Wordmark
       └───────► @/assets/logo/isotipo-on-ink.svg?raw
SocialIcon ────► @/assets/social/{linkedin,instagram,tiktok}.svg?raw

GlassPanel   BotonPrimario   LinkArrow   Radar   Wordmark   — no dependencies
```

Exactly the two component dependencies FR-003 permits. Nothing imports a
feature, a layout or a page (Articles II and III). There is no `logic/` or
`data/` layer in this feature, so Article II is satisfied by having no
cross-layer import to get wrong.

## 2 · GlassPanel

```ts
export type GlassVariant =
  | 'red-strong' | 'red-soft'
  | 'bone-strong' | 'bone' | 'bone-faint'
  | 'dark'

export type GlassPadding = 'default' | 'tight' | 'none'
export type GlassElement = 'div' | 'article' | 'section' | 'aside'
```

| Variant | Fill | Border | Backdrop blur | Radius | Default padding |
|---|---|---|---|---|---|
| `red-strong` | `bg-glass-red-strong` | `border-glass-red-strong-line` | `backdrop-blur-glass-red` | `rounded-panel` | `p-glass-red` |
| `red-soft` | `bg-glass-red-soft` | `border-glass-red-soft-line` | `backdrop-blur-glass-red` | `rounded-panel` | `p-glass-red` |
| `bone-strong` | `bg-glass-bone-strong` | `border-glass-line` | `backdrop-blur-glass` | `rounded-panel-sm` | `p-glass-bone` |
| `bone` | `bg-glass-bone` | `border-glass-line` | `backdrop-blur-glass` | `rounded-panel-sm` | `p-glass-bone` |
| `bone-faint` | `bg-glass-bone-faint` | `border-glass-line-faint` | `backdrop-blur-glass` | `rounded-panel-sm` | `p-glass-red` |
| `dark` | `bg-glass-dark` | `border-glass-dark-line` | `backdrop-blur-glass-dark` | `rounded-panel-sm` | `p-glass-dark` |

Shared by every variant: `border` (1px). Source: `design-extract.md` § 1,
verbatim; the underlying `--color-glass-*` mixes and their alpha derivations
are in `global.css` and were derived in the pre-migration `research.md` § R3.

The design's 8-digit hex → token mapping, for review against the design file:

| Design value | Token |
|---|---|
| `#CF31472B` / `#CF314778` | red-400 @17% / @47% |
| `#CF31471F` / `#CF314759` | red-400 @12% / @35% |
| `#FBF8F61A` / `#FBF8F60F` / `#FBF8F60A` | bone-100 @10% / @6% / @4% |
| `#FBF8F62E` / `#FBF8F63B` | bone-100 @18% / @23% |
| `#FBF8F229` | bone-100 @16% (`rules.md` § R2 — the design's `#FBF8F2` base is folded into bone-100) |
| `#1C1416A6` | `--dark-glass` @65% (`rules.md` § R1 — belongs to no ramp, is **not** ink-500) |

**Padding is orthogonal to variant** (FR-014):

| `padding` | Resolves to |
|---|---|
| `'default'` | the variant's own value from the table above |
| `'tight'` | `p-glass-tight` (22 desktop / 18 mobile — the photo frames) |
| `'none'` | no padding class |

`variant` is **required** (FR-013). `padding` defaults to `'default'`, `as`
defaults to `'div'`.

Slot: default, unconstrained. The panel supplies fill, border, blur, radius and
padding and nothing else — no width, no layout, no typography (FR-016).

## 3 · Radar

```ts
export type RadarSize = 'sm' | 'md' | 'sm-alt'
```

| Size | Outer ⌀ | Middle ⌀ | Core ⌀ | Outer class | Middle class | Core class |
|---|---|---|---|---|---|---|
| `sm` | 20 | 14 | 7 | `size-radar-sm` | `size-radar-sm-halo` | `size-radar-sm-core` |
| `md` | 30 | 20 | 12 | `size-radar-md` | `size-radar-md-halo` | `size-radar-md-core` |
| `sm-alt` | 22 | 16 | 10 | `size-radar-alt` | `size-radar-alt-halo` | `size-radar-alt-core` |

One colour recipe for all three sizes: outer `bg-radar-halo-outer` (red-400
@12%), middle `bg-radar-halo-mid` (red-400 @30%), core `bg-red-400`. Every ring
is `rounded-full`; the outer two are `grid place-items-center` so the next ring
sits concentric (`research.md` § R4).

`size` defaults to `'sm'`. No slot. `aria-hidden="true"` — decorative, the
adjacent label always carries the information (FR-019). No opacity or colour
control (FR-020): the mobile services opacity ladder (0.18 / 0.45 / 1) is
applied by that section to the whole radar-plus-text group, not by Radar.

## 4 · Wordmark

```ts
export type WordmarkForm = 'full' | 'short'   // 'muush.dev' | 'muush'
```

| Run | Colour | Present in `full` | Present in `short` |
|---|---|---|---|
| `muush` | `text-bone-100` | yes | yes |
| `.` | `text-red-400` | yes | no |
| `dev` | `text-bone-100` | yes | no |

Typeface `font-poppins` — the only component in this layer permitted to use it
(FR-011, `branding.md`: logo/wordmark exclusive). Type role `text-wordmark`
(19 → 24, weight 600, −0.03em, from `design-extract.md` § 5). The three runs
sit flush with no gap.

`form` defaults to `'full'`. No slot. These three literals are the one
deliberately hardcoded string set in the layer: brand identity, locale-
invariant, always lowercase (`messaging.md` rule 6).

## 5 · Lockup

```ts
interface Props { form?: WordmarkForm }   // default 'full', forwarded
```

```text
<span class="inline-flex items-center gap-lockup-gap">
  <span aria-hidden="true" class="w-isotipo" v-html="isotipo" />   ← :deep(svg) sizes it
  <Wordmark :form="form" />
</span>
```

| Piece | Value | Source |
|---|---|---|
| Gap | `gap-lockup-gap` (9 → 12) | § 6 |
| Isotipo width | `w-isotipo` (40 → 52) | § 6 |
| Isotipo height | **not set** — follows the viewBox | § 6, `rules.md` § R3 |
| Isotipo stroke | **not set** — follows the viewBox | FR-023 |
| Asset | `isotipo-on-ink.svg` | spec A-09, the site is dark end to end |

**The stroke width is the load-bearing detail.** The asset declares
`viewBox="14.5 38.5 70.5 39.5"` with `stroke-width="12"` in user units, so
rendering it at width *w* scales the stroke by *w* ÷ 70.5 automatically.
**DERIVED**: 12 × 52 ÷ 70.5 = **8.851** (design records 8.85 ✓) and
12 × 40 ÷ 70.5 = **6.809** (design records 6.8 ✓). Heights corroborate:
52 × 39.5 ÷ 70.5 = 29.13 ≈ 29 ✓ and 40 × 39.5 ÷ 70.5 = 22.41 ≈ 22 ✓.

Writing the formula into code would apply the scale twice and thicken the
mark. The formula stays correct for print and for other design tools; it is a
Pencil workaround in a browser (`design-extract.md` § 6).

Not a link (FR-024) — the nav and footer wrap it.

## 6 · Pill

```ts
interface Props { label: string }   // required
```

```text
<span class="inline-flex items-center gap-pill-gap rounded-full border
             border-glass-line bg-glass-dark py-pill-y ps-pill-start pe-pill-end">
  <Radar size="sm" />
  <span class="text-pill text-bone-200">{{ label }}</span>
</span>
```

| Piece | Value | Source |
|---|---|---|
| Fill / border | `bg-glass-dark` / `border-glass-line` 1px | § 3 |
| Radius | `rounded-full` (999) | § 3 |
| Gap | `gap-pill-gap` (11) | § 3 |
| Padding | `py-pill-y` (9), `ps-pill-start` (10), `pe-pill-end` (20) | § 3 |
| Label | `text-pill` (12 → 13, weight 500, +0.054em), `text-bone-200` | § 3, § 9 |

One real prop, exactly as `design-extract.md` § 3 concludes across its eleven
instances. The 13 → 12 difference is carried by the fluid role, not a `size`
prop (FR-026). The asymmetric padding is logical (`ps`/`pe`), not physical, so
it survives a future RTL locale without a second rule.

## 7 · BotonPrimario

```ts
export type ButtonVariant = 'nav' | 'hero' | 'submit'

interface Props {
  variant?: ButtonVariant           // default 'hero'
  href?: string                     // set → <a>, otherwise → <button>
  type?: 'button' | 'submit'        // default 'submit' when variant='submit',
}                                   // else 'button'; ignored when href is set
```

| Variant | Padding Y | Padding X | Label role | Design |
|---|---|---|---|---|
| `nav` | `py-btn-nav-y` (13) | `px-btn-nav-x` (24) | `text-button-sm` (14) | nav CTA, desktop only |
| `hero` | `py-btn-y` (16 → 18) | `px-btn-hero-x` (26 → 32) | `text-button` (15 → 16) | hero primary CTA |
| `submit` | `py-btn-y` (16 → 18) | `px-btn-submit-x` (28 → 32) | `text-button` (15 → 16) | both forms' Enviar |

Shared: `relative inline-flex items-center justify-center rounded-control
bg-glass-dark text-bone-100`, plus the LED ring pseudo-element.

**LED ring** (`research.md` § R3, `design-extract.md` § 4):

| State | Ring |
|---|---|
| Idle | static conic gradient at 0deg, 1.5px (`--stroke-led`) |
| Hover, pointer device | one linear turn every 2.6s |
| Touch device (no hover) | static — spec A-02, **open decision**, reversible |
| `prefers-reduced-motion: reduce` | flat `red-400`, no animation |
| No `@property` support | static gradient, no rotation |

Gradient stops: `var(--color-red-400)` 0% → `var(--color-bone-100)` 50% →
`var(--color-red-400)` 100%. **Three stops. No wine.**

Slot: default — the label. LED is not a prop (FR-034): `branding.md` permits
one primary button per screen, so there is nothing to switch off. There is no
disabled or in-flight state here — the form's "Enviando…" state belongs to the
form feature.

## 8 · LinkArrow

```ts
export type LinkArrowSize = 'default' | 'large'

interface Props {
  href: string                  // required
  size?: LinkArrowSize          // default 'default'
  external?: boolean            // default false
}
```

| Size | Role | Resolves to | Design instance |
|---|---|---|---|
| `default` | `text-link` | 16, weight 600 | hero, both viewports |
| `large` | `text-link-lg` | 20 → 23, weight 600, −0.03em | CTA final |

Always `text-bone-100`. **No background and no border in any state** (FR-036) —
`design-extract.md` § 7 and `ui-map.md` § 3 both say loose text, "nunca un
fondo". The trailing `→` is rendered by the component inside an `aria-hidden`
span so the hover translate has something to move (FR-037, FR-041); hover
translates the arrow (spec A-04). `external` adds
`target="_blank" rel="noopener noreferrer"`.

Slot: default — the label text.

`design-extract.md` § 7 records four instances with three weights and four
tracking values; the two roles resolve them at weight 600, the value 3 of the 4
instances use (spec A-03, settled when the roles were tokenized).

## 9 · SocialIcon

```ts
export type SocialNetwork = 'linkedin' | 'instagram' | 'tiktok'

interface Props {
  network: SocialNetwork        // required
  href: string                  // required — the profile URL
  label: string                 // required — accessible name, caller-supplied
}
```

| Network | Asset |
|---|---|
| `linkedin` | `@/assets/social/linkedin.svg?raw` |
| `instagram` | `@/assets/social/instagram.svg?raw` |
| `tiktok` | `@/assets/social/tiktok.svg?raw` |

| Piece | Value | Source |
|---|---|---|
| Square | `size-social` (48) | § 8 |
| Fill / border | `bg-glass-dark` / `border-glass-line` 1px | § 8 |
| Radius | `rounded-icon` (10) | § 8 |
| Glyph | `size-social-glyph` (24), colour inherited via `currentColor` | § 8, spec A-06 |
| Colour | `text-bone-100` on the square, inherited by the glyph | § 8 |

Renders `<a :href :aria-label="label" target="_blank" rel="noopener
noreferrer">` around the square (FR-040, FR-045). The glyph wrapper is
`aria-hidden` so the asset's own `<title>` is not announced alongside the
caller's label.

All three assets already satisfy the contract in
`app/assets/social/README.md`: shared `viewBox="0 0 24 24"`, no `width`/
`height`, every `fill="currentColor"`, one wrapping `<g transform>`, one
`<title>`, no `<defs>`/`<style>`/DOCTYPE/metadata. **They are consumed as-is**
(FR-044). The design's 18px `L`/`I`/`T` glyphs were placeholder letters, not
art (spec A-06).

## 10 · Validation rules

| Rule | Enforced by |
|---|---|
| Variant values are a closed set | String-literal union in `defineProps<Props>()`; `pnpm typecheck` |
| Every variant has a class entry | `const … satisfies Record<Variant, string>` — a missing key is a type error |
| Class names are complete strings | The same map. Concatenation produces a class Tailwind never emits (`research.md` § R1) |
| No `any`, no `@ts-ignore` | Article IX; `pnpm typecheck` |
| No colour or size literal in markup | FR-050 grep gate; `quickstart.md` gives the command |
| No hardcoded ES/EN copy | Every string is a prop or a slot (FR-005) |
| Zero client JavaScript | No `onMounted`, no event handler that changes appearance, no `ref` driving a style. The LED is CSS |
| Structural invariants | Component tests (FR-051) — see `quickstart.md` |
