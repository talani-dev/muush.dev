<script setup lang="ts">
import { computed } from 'vue'
import type { ShellLocale } from '@/features/shell/data/types'
import { rememberLocalePreference } from '@/features/shell/logic/localePreference'
import { holdLocaleSwitchPosition } from '@/features/shell/logic/localeSwitchScroll'

/**
 * The language toggle (feature 21; restyled for Muush 1.0 by feature 43,
 * spec FR-004, FR-007, FR-029, contract § 2): one control showing **only
 * the active locale's two-letter code** ("ES" on Spanish pages).
 *
 * Feature 43 changes its look and nothing else. Two variants (pen
 * extract-43 §§ 2–4):
 *
 * - `header` (default): the mobile bar's 36 × 36 radius-12 control with a
 *   1 px Blanco 20 % stroke and no fill below `lg`; from `lg`, the desktop
 *   nav's 40 × 40 pill in Negro 900 45 % with a 1 px Blanco 15 % stroke and
 *   a 20 px blur. One element for both layouts, so each page carries exactly
 *   one toggle link (the build test of feature 21 counts them).
 * - `menu`: the 36 × 36 control at every width, in the open menu's bar.
 *
 * Text Instrument Sans 12 / 600 Blanco in both.
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
  /**
   * Feature 39 · the not-found page. A plain click switches the language of
   * the page being shown instead of navigating: it emits `switchInPlace` and
   * the URL stays the one the visitor typed. `href` stays a real destination
   * (the other locale's home) for a visitor with no scripting, a click before
   * hydration, and a modified click opening a new tab.
   */
  inPlace?: boolean
  /** Look only; see above. Default `header`. */
  variant?: 'header' | 'menu'
}

const {
  locale,
  href,
  switchLabel,
  inPlace = false,
  variant = 'header',
} = defineProps<Props>()

const emit = defineEmits<{
  /** The visitor chose `locale` on a page that switches in place. */
  switchInPlace: [locale: ShellLocale]
}>()

const BASE_CLASSES =
  'inline-grid size-control shrink-0 place-items-center rounded-control border border-linea-fuerte font-texto text-etiqueta font-semibold text-blanco foco'

const VARIANT_CLASSES = {
  header:
    'lg:size-idioma lg:rounded-pill lg:border-blanco-15 lg:bg-nav-fondo lg:backdrop-blur-header',
  menu: '',
} satisfies Record<NonNullable<Props['variant']>, string>

const toggleClasses = computed(() => [BASE_CLASSES, VARIANT_CLASSES[variant]])

/**
 * The only locale this component ever links to. Derived from `locale`
 * rather than added as a second prop: with exactly two locales
 * (`SHELL_LOCALES`), the destination is always the one `locale` is not.
 */
const otherLocale = computed<ShellLocale>(() => (locale === 'es' ? 'en' : 'es'))

/**
 * Keeps the visitor's place (spec FR-061, "Language switch keeps position",
 * Roberto 2026-11-01; replaces the fragment carrying of FR-029 and User
 * Story 2 scenario 2).
 *
 * The link navigates to `href`, the anchorless equivalent route, through
 * the router, so the URL drops whatever fragment the visitor last jumped to.
 * Before it does, the click holds where the visitor is (which anchored
 * section and how far through it); `logic/` restores that on the other
 * locale's page. Holding only measures the page, it never navigates, so the
 * link's own behaviour is untouched: with no scripting, or a click before
 * hydration, the plain `href` still lands on the equivalent page, at its top.
 *
 * Modified clicks are left alone: a ⌘/Ctrl/middle-click opens a new tab,
 * and the page left behind does not move. `defaultPrevented` is not
 * consulted here: the router link's own handler runs first and prevents the
 * default of every click it navigates on, so it is always set by now.
 */
function isModifiedOrSecondaryClick(event: MouseEvent): boolean {
  const isModified =
    event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
  return isModified || event.button !== 0
}

/** Feature 39 · whether the in-place switch should handle this click. */
function isPlainPrimaryClick(event: MouseEvent): boolean {
  return !event.defaultPrevented && !isModifiedOrSecondaryClick(event)
}

function keepPosition(event: MouseEvent) {
  if (!isModifiedOrSecondaryClick(event)) holdLocaleSwitchPosition(href)
}

/**
 * Feature 33: every click is an explicit language choice, so the
 * destination locale is recorded **first**, before `keepPosition`'s early
 * returns — a ⌘/Ctrl-click that opens a new tab is still a choice
 * (`specs/033-ip-locale-root-redirect/contracts/locale-preference-cookie.md`
 * § 2). The edge reads it only at `/`; nothing on this page reads it, so the
 * link's navigation and markup are unchanged. With no scripting nothing is
 * written and the link still navigates (accepted degradation).
 */
function onToggleClick(event: MouseEvent) {
  rememberLocalePreference(otherLocale.value)
  if (inPlace) requestInPlaceSwitch(event)
  else keepPosition(event)
}

/**
 * Feature 39. Modified clicks are left to the browser, exactly like
 * `keepPosition`: ⌘/Ctrl-click still opens the other locale's home in a new
 * tab. The cookie was already written by `onToggleClick`, with the same
 * destination locale as on every other page.
 */
function requestInPlaceSwitch(event: MouseEvent) {
  if (!isPlainPrimaryClick(event)) return

  event.preventDefault()
  emit('switchInPlace', otherLocale.value)
}
</script>

<template>
  <!--
    In place (the not-found page): a plain `<a>`, not a `<NuxtLink>`. The
    router link's own click handler runs before this component's and would
    already have started the navigation by the time `preventDefault` ran.
    The rendered markup is the same anchor either way.
  -->
  <a
    v-if="inPlace"
    :href="href"
    :hreflang="otherLocale"
    :lang="otherLocale"
    :aria-label="switchLabel"
    :class="toggleClasses"
    @click="onToggleClick"
  >
    {{ locale.toUpperCase() }}
  </a>
  <NuxtLink
    v-else
    :to="href"
    :hreflang="otherLocale"
    :lang="otherLocale"
    :aria-label="switchLabel"
    :class="toggleClasses"
    @click="onToggleClick"
  >
    {{ locale.toUpperCase() }}
  </NuxtLink>
</template>
