# Component and composable contracts (feature 36)

All inside `app/features/shell/`, reached from outside only through `index.ts` (Constitution Article III). `ui/` components call no Nuxt composable (`rules.md` § R23); everything arrives resolved as props.

## `ui/NotFoundContent.vue` (exported)

```ts
interface Props {
  eyebrow: string
  headline: string
  body: string
  cta: { label: string; href: string }
  shortcutsLabel: string
  shortcuts: { label: string; href: string }[]   // exactly 3
}
```

Renders, inside one `<section class="relative …">` (no stacking context, no opaque background — `SectionBackdrop.vue` section contract):

0. `<SectionBackdrop><SectionGlow color="red-400" :opacity="60" size="1400-700" class="absolute top-not-found-glow-y left-not-found-glow-x -translate-x-1/2 -translate-y-1/2" /></SectionBackdrop>` (gate G4; both from `@/shared/ui`, unchanged)
1. `<NotFoundRings />` (decorative)
2. a `relative` content block, centred, max width `--spacing-not-found-content`:
   `<Pill :label="eyebrow" />` → `<h1 class="text-display …">` → `<p class="text-body-sm text-ink-100 max-w-not-found-measure">` → `<BotonPrimario variant="hero" :href="cta.href">` → `<nav :aria-label="shortcutsLabel">` with three `NuxtLink`s separated by `<span aria-hidden="true">·</span>`.

No emits, no state, no client script. Under 200 lines.

## `ui/NotFoundRings.vue` (internal)

No props, no slot. `<div aria-hidden="true" class="not-found-rings pointer-events-none absolute …">` with three `<span>` rings; geometry and colours from the `--not-found-ring-*` tokens in a `<style scoped>` block (hand-written CSS reads ramp-root tokens, never `--color-*` theme names, § R18).

## `ui/SiteNav.vue` (changed)

- `cta: ResolvedShellItem` → `cta?: ResolvedShellItem`.
- The CTA wrapper `div.site-nav__cta` **and** the `<noscript>` override render only when `cta` is set (`v-if`). Everything else unchanged; with `cta` set the rendered markup is byte-identical to today.

## `logic/useShellItemResolver.ts` (new, internal)

```ts
export function useShellItemResolver(): {
  resolveHref(item: ShellItem): string | undefined
  resolveItem(item: ShellItem): ResolvedShellItem
}
```

The two functions currently private to `useShellNavigation`, moved verbatim (including `current` from `useRouteBaseName`). `useShellNavigation` calls it; behaviour unchanged.

## `logic/useShellNavigation.ts` (changed)

- Reads `useError()`; `navCta` becomes `computed<ResolvedShellItem | undefined>(() => error.value ? undefined : resolveItem(NAV_CTA))`.

## `logic/useNotFoundContent.ts` (exported)

```ts
export function useNotFoundContent(): ComputedRef<NotFoundContentProps>
```

Resolves `NOT_FOUND_HOME`, `NOT_FOUND_SHORTCUTS` and `NOT_FOUND_COPY_KEYS` (data-model §§ 1–3) through `useShellItemResolver` and `useI18n().t`.

## `logic/useNotFoundDocument.ts` (exported)

```ts
export function useNotFoundDocument(): void
```

- `useSeoMeta({ title: t('pages.notFound.title'), robots: NOT_FOUND_ROBOTS })`.
- `if (import.meta.server) delete useNuxtApp().payload.path` — with the comment explaining `research.md` R1 F7/F8 (otherwise the client rewrites the address bar to `/<locale>/404`).
- Nothing else: no description, no OG, no canonical (R3).

## `app/error.vue` (new, Nuxt-native)

```vue
<script setup lang="ts">
import type { NuxtError } from '#app'
import { NotFoundContent, useNotFoundContent, useNotFoundDocument } from '@/features/shell'
defineProps<{ error: NuxtError }>()   // declared so it does not fall through as an attribute
const content = useNotFoundContent()
useNotFoundDocument()
</script>
<template>
  <NuxtLayout>
    <NotFoundContent v-bind="content" />
  </NuxtLayout>
</template>
```

Thin wrapper; no logic (Article I). The layout is not edited.

## `nuxt.config.ts` (changed)

```ts
const NOT_FOUND_ROUTES = ['/es/404', '/en/404']   // one per locale; keep in step with i18n.locales
nitro: {
  preset: 'static',
  prerender: { routes: NOT_FOUND_ROUTES },
  hooks: {
    'prerender:generate'(route) {
      // research R1 F1–F3: keep the two rendered 404s instead of failing the build
      if (NOT_FOUND_ROUTES.includes(route.route) && route.error?.statusCode === 404) delete route.error
      // research R2: the SPA shells are not shipped
      if (route.route === '/200.html' || route.route === '/404.html') route.skip = true
    },
  },
},
```

Plus: the `i18n.rootRedirect` comment drops its `200.html` clause.
