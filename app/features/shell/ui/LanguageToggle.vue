<script setup lang="ts">
import { computed } from 'vue'
import type { ShellLocale } from '@/features/shell/data/types'

/**
 * The language toggle of frame `tGVGq` (Banda 1) — feature 21's redesign of
 * the old `ES / EN` text pair: a single 44×44 dark-glass circle showing
 * **only the active locale's two-letter code**. There is nothing to read for
 * the locale not currently active — the minimal reading of "botón circular
 * con el idioma activo" consistent with there being exactly two locales
 * (spec Clarifications, Q4): a circle with one code showing is unambiguous
 * about what clicking it does, and inventing a flag or globe glyph would add
 * a symbol the design does not specify and localization the brand voice
 * does not use (`docs/business/branding.md`: "Sin referencias geográficas").
 *
 * The destination arrives resolved. Deciding *where* the other locale lives
 * is `logic/`'s job and goes through the route map, never through swapping
 * the locale prefix in the current path (Constitution Article VI).
 *
 * Stays a `<NuxtLink>`, not a `<button>`: it navigates to a real, resolvable
 * URL — the same one `resolveLocaleDestination.ts` already computes — which
 * a link gives for free, including with no scripting. A `<button>` would
 * need a manual `navigateTo()` in a click handler, which breaks the no-JS
 * path this component already has (`research.md` R-4).
 *
 * ## `switchLabel`: a prop `contracts/components.md` did not anticipate
 *
 * FR-018 requires the accessible name to describe the *destination* locale
 * ("Switch to English"), not just echo the two letters a sighted visitor
 * reads. That string is translated copy — Article VI forbids writing it
 * here — and resolving it with `useI18n()` from inside this file would make
 * it the first `ui/` component in this repository to call a Nuxt
 * composable, which `docs/business/rules.md` § R23's corollary and this
 * feature's own `plan.md` rule out (and which Storybook, with no i18n
 * plugin registered, would not catch). One more already-resolved string
 * prop is the only way to satisfy FR-018 without either violation — the
 * same shape `MobileMenu.vue`'s own `label`/`closeLabel` already use for the
 * identical reason. Reported as a spec deviation, not a silent one.
 */
interface Props {
  /** The active locale. */
  locale: ShellLocale
  /** The equivalent route in the other locale, without a fragment. */
  href: string
  /** Accessible name naming the destination locale, e.g. "Switch to English". */
  switchLabel: string
}

const { locale, href, switchLabel } = defineProps<Props>()

/**
 * The only locale this component ever links to. Derived from `locale`
 * rather than added as a second prop: with exactly two locales
 * (`SHELL_LOCALES`), the destination is always the one `locale` is not.
 */
const otherLocale = computed<ShellLocale>(() => (locale === 'es' ? 'en' : 'es'))

/**
 * The anchor enhancement (spec FR-021/FR-017). A URL fragment never reaches
 * the server and does not exist when the page is generated
 * (`docs/business/rules.md` § R9), so the rendered `href` is anchorless and a
 * visitor with no scripting still lands on the equivalent page, at its top.
 * Only the fragment — the one part that cannot exist before the click — is
 * read here.
 *
 * Modified clicks are left alone: intercepting a ⌘/Ctrl/middle-click would
 * cost the visitor "open in new tab" to buy a fragment they did not ask for.
 */
function preserveAnchor(event: MouseEvent) {
  const isModified =
    event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
  if (event.defaultPrevented || isModified || event.button !== 0) return

  const fragment = window.location.hash.replace(/^#+/, '')
  if (fragment === '') return

  event.preventDefault()
  window.location.assign(`${href}#${fragment}`)
}
</script>

<template>
  <NuxtLink
    :to="href"
    :hreflang="otherLocale"
    :lang="otherLocale"
    :aria-label="switchLabel"
    class="inline-grid size-lang-circle place-items-center rounded-full border border-glass-line bg-glass-dark font-instrument text-lang font-semibold text-bone-100 focus-visible:outline-red-400"
    @click="preserveAnchor"
  >
    {{ locale.toUpperCase() }}
  </NuxtLink>
</template>
