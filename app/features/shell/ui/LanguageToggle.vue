<script setup lang="ts">
import { SHELL_LOCALES, type ShellLocale } from '@/features/shell/data/types'

/**
 * The ES/EN toggle of `design-extract.md` § 9.bis: both labels either side of
 * a divider, the active one in bone-100 at weight 600 and the inactive one in
 * ink-200 at weight 500.
 *
 * The destination arrives resolved. Deciding *where* the other locale lives
 * is `logic/`'s job and goes through the route map, never through swapping
 * the locale prefix in the current path (Constitution Article VI).
 *
 * The labels are the locale codes themselves, so there is no copy here to
 * translate — `ES` and `EN` read identically in both locales.
 */
interface Props {
  /** The active locale. */
  locale: ShellLocale
  /** The equivalent route in the other locale, without a fragment. */
  href: string
}

const { locale, href } = defineProps<Props>()

/**
 * The anchor enhancement (spec FR-021). A URL fragment never reaches the
 * server and does not exist when the page is generated
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
  <div class="inline-flex items-center gap-lang-gap font-instrument text-lang">
    <template v-for="(code, index) in SHELL_LOCALES" :key="code">
      <span v-if="index > 0" aria-hidden="true" class="text-ink-300">/</span>

      <span v-if="code === locale" class="font-semibold text-bone-100">
        {{ code.toUpperCase() }}
      </span>

      <NuxtLink
        v-else
        :to="href"
        :hreflang="code"
        :lang="code"
        class="text-ink-200 focus-visible:outline-red-400"
        @click="preserveAnchor"
      >
        {{ code.toUpperCase() }}
      </NuxtLink>
    </template>
  </div>
</template>
