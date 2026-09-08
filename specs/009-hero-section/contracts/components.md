# Component Contracts: Hero section

**Feature**: `specs/009-hero-section` | **Date**: 2026-09-07

This feature adds one module. Its public surface is the barrel
`app/features/landing/index.ts`, and that surface is deliberately two exports
wide.

Conventions, as in `specs/002-primitive-ui-layer/contracts/components.md` and
`specs/006-…/contracts/components.md`: `<script setup lang="ts">`, TypeScript
strict, no `any`, every visible string supplied by the caller, complete class
strings from closed maps and never assembled by concatenation.

---

## The module

```text
app/features/landing/
├── data/heroContent.ts       # keys, destinations, types — imports nothing
├── logic/useHeroContent.ts   # the only file that touches the Nuxt runtime
├── ui/HeroSection.vue        # presentational: props in, markup out
└── index.ts                  # the module's ONLY public API
```

```ts
// app/features/landing/index.ts
export { default as HeroSection } from './ui/HeroSection.vue'
export { useHeroContent } from './logic/useHeroContent'
export type { HeroContent } from './data/heroContent'
```

Nothing else is exported. `HERO_DESTINATIONS` stays internal: it is the
module's own record of two open decisions, not something another feature reads.

**Dependency direction** (Article II): `ui/` ← `logic/` ← `data/`. `ui/`
imports the `HeroContent` type from `data/` and five shared primitives; it
imports nothing from `logic/`, because everything reaches it as props.

**Isolation** (Article III): `landing` imports **no** file from
`app/features/shell/` — not through a deep path and not through the barrel.
Where the two need the same idea (a locale-correct path plus a fragment), the
Hero re-expresses it in ten lines rather than borrowing a model
(`research.md` § R6).

---

## `data/heroContent.ts`

```ts
/** The five i18n keys the Hero renders. Keys, never copy (Article VI). */
export const HERO_KEYS = {
  eyebrow: 'landing.hero.eyebrow',
  headline: 'landing.hero.headline',
  subhead: 'landing.hero.subhead',
  ctaPrimary: 'landing.hero.ctaPrimary',
  ctaSecondary: 'landing.hero.ctaSecondary',
} as const

/**
 * Where the Hero's two controls point. Both are absent, and each absence is a
 * recorded open decision rather than an oversight:
 *
 * - `callUrl` waits on `decisions-open.md` #2 (the Google Calendar link,
 *   owner Clau). While it is absent the secondary CTA renders as
 *   non-interactive `ink-300` text — the same treatment `FooterColumn.vue`
 *   gives the same phrase in the footer, and what `ui-map.md` § 3's
 *   "deshabilitado" asks for.
 * - `contactHash` waits on section 05, which does not exist. While it is
 *   absent the primary CTA renders as a real button and emits no fragment
 *   into the HTML.
 *
 * Filling either is a one-key change here. Neither may be filled with a
 * substitute destination (spec FR-014).
 */
export interface HeroDestinations {
  callUrl?: string
  contactHash?: string
}

export const HERO_DESTINATIONS: HeroDestinations = {}

/** What `logic/` hands `ui/`: already translated, already resolved. */
export interface HeroContent {
  eyebrow: string
  headline: string
  subhead: string
  ctaPrimary: string
  ctaSecondary: string
  /** Absent → the primary CTA is a button, not a link. */
  contactHref?: string
  /** Absent → the secondary CTA is text, not a link. */
  callHref?: string
}
```

**Deliberately not here**: a destination-kind union, a `none` variant, a
resolver, or an `external` flag. The shell has all four because it resolves
fourteen items of four kinds; the Hero has two optional strings, and Article
III prefers the duplication to a premature shared abstraction.

---

## `logic/useHeroContent.ts`

```ts
export function useHeroContent(): ComputedRef<HeroContent>
```

The module's single seam with the Nuxt runtime. It is the only file in
`landing/` that may call `useI18n` or `useLocalePath`.

- Translates the five keys.
- Resolves `contactHash` — when present — into the active locale's home path
  plus the fragment, so the link works from anywhere the Hero is rendered.
  When absent, `contactHref` is **omitted from the object**, not set to
  `undefined`, so an absent destination is structurally a label and nothing
  else (the shape `useShellNavigation` already uses).
- Passes `callUrl` straight through as `callHref`; it is an absolute external
  URL and needs no resolution.

It performs no fetch, holds no state, and registers no listener.

---

## `ui/HeroSection.vue`

```ts
interface Props {
  eyebrow: string
  headline: string
  subhead: string
  ctaPrimary: string
  ctaSecondary: string
  contactHref?: string
  callHref?: string
}
```

No emits. No slots. No `variant`, no `size`, no `align`, no `as` — the design
draws exactly one Hero and Article VIII forbids inventing a second before a
consumer asks for it.

**It calls no Nuxt composable.** That is a contract, not an accident: it is
what lets the component render in Storybook and in a bare mount, and it is why
the catalogue can catch a component that cheats (`rules.md` § R23).

Renders, in effect:

```
<section class="relative pt-hero-top">                ← positioning reference;
  <SectionBackdrop>                                     no bg, no stacking context
    <SectionGlow color="red-400"  :opacity="65" size="1500-700"
      class="absolute left-hero-glow-foco-x   top-hero-glow-foco-y   -translate-x-1/2 -translate-y-1/2" />
    <SectionGlow color="wine-300" :opacity="40" size="1100-520"
      class="absolute left-hero-glow-wine-x   top-hero-glow-wine-y   -translate-x-1/2 -translate-y-1/2" />
    <SectionGlow color="wine-400" :opacity="30" size="900-520"
      class="absolute left-hero-glow-cierre-x top-hero-glow-cierre-y -translate-x-1/2 -translate-y-1/2" />
  </SectionBackdrop>

  <div class="flex max-w-hero-body flex-col items-start gap-hero-gap">
    <Pill :label="eyebrow" />
    <h1 class="w-full font-instrument text-display text-bone-100">…</h1>
    <p  class="w-full max-w-hero-measure font-instrument text-body-lg text-ink-100">…</p>

    <div class="flex flex-col items-start gap-hero-cta-gap pt-hero-cta-top
                lg:flex-row lg:items-center">
      <BotonPrimario variant="hero" :href="contactHref">…</BotonPrimario>

      <LinkArrow v-if="callHref" :href="callHref" external>…</LinkArrow>
      <span v-else class="font-instrument text-link text-ink-300">…</span>
    </div>
  </div>
</section>
```

(The shape above is the contract; the class order Biome settles.)

### The five rules this component must not break

1. **No stacking context, anywhere except on an individual glow.** Not on the
   section, not on the stack, not on the CTA row. The failure is silent: the
   glows move above the dot sheet and nothing complains.
2. **No opaque background on the section.** It would hide its own glows.
3. **No bottom padding.** The next block owns the separation — the convention
   `app/layouts/default.vue` already states for the footer.
4. **No horizontal padding.** `<main>` already applies `px-page`; re-declaring
   it puts the Hero at twice the gutter.
5. **No `href` invented for either control.** `contactHref` absent means a
   `<button>`; `callHref` absent means a `<span>`. Neither may fall back to a
   substitute target.

### Accessibility

- The headline is the page's `<h1>` and the page's only one.
- The section carries no `aria-label` and no `id`: it contains the `<h1>` that
  conveys the structure, nothing points at it, and naming it would add a
  landmark the design never asked for (spec A-08).
- The dead secondary CTA is **not** an anchor element, so it is neither
  focusable nor announced as a link — which is the point.
- The dead primary CTA remains a focusable button. No `disabled` attribute is
  added: that would require changing a `done` primitive and would grey out the
  one control the design draws as a box.
- Everything decorative — the three glows, the radar inside the `Pill` — is
  already `aria-hidden` inside the primitives that own it.

---

## `app/pages/index.vue`

```vue
<script setup lang="ts">
import { HeroSection, useHeroContent } from '@/features/landing'

const { t } = useI18n()
const hero = useHeroContent()

useHead({ title: t('site.title') })
</script>

<template>
  <HeroSection v-bind="hero" />
</template>
```

A thin wrapper (Article I). Its current placeholder `<h1>` is **removed**, not
kept alongside the Hero's — a page has one `<h1>`. The `site.title` key stays;
it is the document title and is unrelated.

The layout, `app/layouts/default.vue`, is **not touched**. It already provides
the positioned, isolated root, the ink base, the page-wide dot sheet, the
cursor spotlight and the `<main class="mx-auto max-w-shell-max px-page">`
wrapper the Hero renders inside — and that wrapper sets none of the properties
rule 1 above forbids, which was verified rather than assumed.

---

## What must show zero lines changed

| File | Why |
|---|---|
| `app/shared/ui/SectionGlow.vue` | `done` contract (feature 5). Its stale doc comment and dead `'920'` variant belong to **feature 7** and must be left exactly as they are |
| `app/shared/ui/SectionBackdrop.vue` | `done` contract (feature 6) — this feature is its first consumer, not its author |
| `app/shared/ui/DotGrid.vue` | `done` contract (feature 6) |
| `app/shared/ui/Pill.vue` | `done` contract (feature 2), consumed with its one prop |
| `app/shared/ui/BotonPrimario.vue` | `done` contract (feature 2), consumed at `variant="hero"` |
| `app/shared/ui/LinkArrow.vue` | `done` contract (feature 2), gains its first consumer without changing |
| `--layer-glow`, `--layer-dots`, `--layer-spotlight` | The relation is the contract (`rules.md` §§ R28, R37) |
| `app/layouts/default.vue` | A section contributes glows without touching the layout — that is feature 6's FR-006, and this is its first real test |
| `app/features/shell/**` | Article III |

---

# Addendum 2026-09-07 · the nav CTA reveal

Roberto's added scope (`ui-map.md` § 2). One new shared file, one amendment to
this feature's own contract, and one added prop on a `done` component.

## `app/shared/logic/useNavCtaReveal.ts` (new)

```ts
/** Watches the section that suppresses the nav CTA. Call from that section. */
export function useHeroSentinel(
  target: Readonly<ShallowRef<HTMLElement | null>>
): void

/**
 * Resolves whether the nav CTA should be showing.
 * `suppressedByRoute` is true on routes that render their own CTA above the
 * fold — today only the landing.
 */
export function useNavCtaReveal(
  suppressedByRoute: MaybeRefOrGetter<boolean>
): ComputedRef<boolean>
```

It owns one module-scoped `shallowRef`, `isHeroOnScreen`, initialised `true`.

- **Written only from `IntersectionObserver`**, which never runs on the server,
  so every prerendered document carries the initial value and no route can leak
  state into the next. Same argument, same shape as `useMobileMenu`'s flag.
- **`IntersectionObserver`, not a scroll listener.** It expresses "while the
  Hero is in view" directly, fires only on change, and reads no geometry on a
  per-frame path — the cost `findings.md` § R41 measured. A scroll threshold
  would need the Hero's height on load and on resize, and a comparison per
  scroll event, to answer a question the platform already answers.
- **Degrades by construction**: a route with no Hero calls `useHeroSentinel`
  never, so `isHeroOnScreen` keeps its initial value and `useNavCtaReveal`
  returns `true`. Absence of a Hero is not a case to handle; it is the default.
- No-ops where `IntersectionObserver` is undefined (the server, and a test
  environment without it), and disconnects on `onScopeDispose`.

It imports nothing from `app/features/` — the route predicate arrives as an
argument, so `app/shared/` never depends on a feature (Article II).

## `ui/HeroSection.vue` — amendment

The component gains a template ref on its root `<section>` and one call to
`useHeroSentinel`. **This narrows, but does not break, the "calls no
composable" rule stated above**: the rule exists so the component renders with
no Nuxt runtime present, and `useHeroSentinel` is a plain Vue composable over
`IntersectionObserver` and lifecycle hooks. It still mounts in Storybook and in
a bare Vue Test Utils mount.

## `app/features/shell/` — added, never changed

| File | Change |
|---|---|
| `logic/useShellNavigation.ts` | returns one more value, `showNavCta`, from `useNavCtaReveal(computed(() => currentRouteName.value === 'index'))`. The route knowledge stays where routes already live |
| `ui/SiteNav.vue` | one **added** prop `showCta: boolean`; the nav row becomes sticky at `--layer-nav`; the existing `<div class="hidden lg:block">` CTA wrapper carries the opacity/visibility pair, the fade and `motion-reduce:transition-none` |
| `app/layouts/default.vue` | passes `:show-cta="showNavCta"` |

No existing prop is renamed, retyped or removed.

**Hiding uses `visibility` as well as `opacity`.** Opacity alone leaves the
button focusable and clickable while invisible (FR-048); `visibility: hidden`
removes it from both, and still transitions.

**The no-scripting override is CSS, not script** — a `<noscript>` block in the
shell carrying a rule that forces the button visible. It is the only mechanism
that satisfies FR-045 and FR-046 at once: the button ships hidden in the
landing's HTML so it cannot flash, and a browser without scripting applies the
override instead. Doing it the other way round — ship visible, hide on mount —
is the flash FR-045 forbids.

**No fade on a page that starts visible** is structural: a CSS transition needs
a change to run, and on Nosotros the server and client render the same visible
state, so there is nothing to transition from. It is not a duration set to zero.
