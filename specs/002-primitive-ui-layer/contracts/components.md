# Component Contracts: Primitive UI layer

**Feature**: `specs/002-primitive-ui-layer` | **Date**: 2026-09-06

The public interface this feature exposes is not an API or a CLI — it is the
**prop surface of eight Vue components** that later features compose. This
file is that contract. Feature 3 (site shell) and every landing/About feature
after it depend on these signatures; changing one after the fact is a breaking
change to every consumer.

**Provenance**: these signatures come from
`docs/business/landing/component-contracts.md`, recovered from the
pre-migration implementation (git `1bd5570`). They were derived from the real
per-instance overrides in the design file and passed review. They are
**adapted from Astro to Vue, not redesigned.**

## Conventions for all eight

- `<script setup lang="ts">` with a type-only `defineProps<Props>()` and
  **destructured defaults** — no `withDefaults` (`research.md` § R5).
- Variant props are string-literal unions, exported from the component that
  owns them, each with a documented default.
- **`class` is NOT declared as a prop.** It arrives through fallthrough
  attributes and Vue merges it with the root element's own class. Every
  component has a single root and none sets `inheritAttrs: false`
  (`research.md` § R6). This is the one change from the Astro contracts, and
  their own header called for it.
- `<slot />` is unchanged from the Astro contracts.
- `as?: 'div' | 'article'` becomes `<component :is="as">`.
- Every visible string arrives from the caller. No ES/EN copy inside a
  component (FR-005).
- The variant → class map is a `const … satisfies Record<Variant, string>`
  lookup with complete class names, never built by concatenation.
- No client-side script of any kind.

Measurements live in `data-model.md` and ultimately in
`docs/business/landing/design-extract.md`, not here.

---

## GlassPanel

```ts
export type GlassVariant =
  | 'red-strong' | 'red-soft'
  | 'bone-strong' | 'bone' | 'bone-faint'
  | 'dark'

export type GlassPadding = 'default' | 'tight' | 'none'
export type GlassElement = 'div' | 'article' | 'section' | 'aside'

interface Props {
  variant: GlassVariant          // required — no sensible default among six
  padding?: GlassPadding         // default 'default'
  as?: GlassElement              // default 'div'
}
```

Slot: default, unconstrained. Supplies fill, 1px border, backdrop blur, radius
and padding, and nothing else (FR-016). Per-variant values in `data-model.md`
§ 2.

## Radar

```ts
export type RadarSize = 'sm' | 'md' | 'sm-alt'

interface Props {
  size?: RadarSize               // default 'sm'
}
```

No slot. Decorative: renders `aria-hidden="true"`.

## Wordmark

```ts
export type WordmarkForm = 'full' | 'short'   // 'muush.dev' | 'muush'

interface Props {
  form?: WordmarkForm            // default 'full'
}
```

No slot. The literal `muush` / `.` / `dev` runs are brand identity, not copy —
the one string set deliberately hardcoded, and locale-invariant.

## Lockup

```ts
interface Props {
  form?: WordmarkForm            // default 'full', forwarded to Wordmark
}
```

No slot. Renders the on-ink isotipo at `w-isotipo` plus a Wordmark, cross-axis
centred, gap `gap-lockup-gap`. **Not a link** — the nav/footer decides where it
points, so the caller wraps it. **No stroke width anywhere** (FR-023).

## Pill

```ts
interface Props {
  label: string                  // required, caller-supplied (i18n lives there)
}
```

No slot. Composes `<Radar size="sm" />`. One real prop, exactly as
`design-extract.md` § 3 concludes.

## BotonPrimario

```ts
export type ButtonVariant = 'nav' | 'hero' | 'submit'

interface Props {
  variant?: ButtonVariant        // default 'hero'
  href?: string                  // when set → <a>; otherwise → <button>
  type?: 'button' | 'submit'     // default 'submit' when variant='submit',
                                 // else 'button'; ignored when href is set
}
```

Slot: default — the label. Never a hardcoded string; the ES/EN copy
(`Cuéntanos tu proyecto` / `Tell us about your project`) lives in `i18n/`, a
later feature.

LED behaviour is not a prop. It is intrinsic and governed by the media queries
in `research.md` § R3. A caller cannot turn it off, because `branding.md`
allows exactly one primary button per screen anyway.

## LinkArrow

```ts
export type LinkArrowSize = 'default' | 'large'

interface Props {
  href: string                   // required
  size?: LinkArrowSize           // default 'default'
  external?: boolean             // default false → true adds
                                 // target="_blank" rel="noopener noreferrer"
}
```

Slot: default — the label text. The `→` glyph is appended by the component,
not by the caller, so the hover animation has something to move.

## SocialIcon

```ts
export type SocialNetwork = 'linkedin' | 'instagram' | 'tiktok'

interface Props {
  network: SocialNetwork         // required
  href: string                   // required — the profile URL
  label: string                  // required — accessible name, caller-supplied
}
```

No slot. Renders `<a :href :aria-label="label" target="_blank"
rel="noopener noreferrer">` around a 48×48 glass square containing the
normalized 24×24 glyph.

---

## Type export mechanism

Each union is exported from its own `<script setup>` block. **CONFIRMED**
(`research.md` § R5) that `@vue/compiler-sfc@3.5.42` hoists `export type` out
of `setup()` into module scope, so the declaration compiles.

A consumer then writes:

```ts
import type { GlassVariant } from '@/shared/ui/GlassPanel.vue'
```

**This must be verified with `pnpm typecheck` on the first component written.**
If Volar does not re-export the type, the fallback is a colocated
`app/shared/ui/types.ts` holding the seven unions — one file, zero interface
change. No barrel is pre-created (Article VIII).

## Asset contract — already satisfied, do not touch

The three social glyphs in `app/assets/social/` and the three isotipos in
`app/assets/logo/` were delivered by feature 1 and already satisfy their
contracts, documented in the README beside each. This feature **consumes** them
via `?raw` and **must not** re-normalize, re-scale, edit or relocate them
(FR-043, FR-044).

## Deliberately NOT in this contract

No `theme`, `color`, `tone`, `align`, `fullWidth`, `loading`, `disabled`,
`animated`, `class`, `as`-anything-else, or any `size` prop beyond the ones
above. Each was considered and rejected: the design documents exactly six glass
variants, three radar sizes, two wordmark forms, three button variants, two
link sizes and three networks, and Article VIII forbids inventing a seventh of
anything before a consumer asks for it.
