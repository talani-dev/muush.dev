<script setup lang="ts">
import {
  FaqSection,
  useFaqContent,
  useFaqLocaleSwitch,
  useFaqPageSeo,
} from '@/features/faq'

/**
 * Preguntas — `/es/preguntas` and `/en/faq` from this one file (feature 46;
 * the real questions since feature 51). The translated segment is declared
 * in `nuxt.config.ts` under `i18n.pages`, never here. A thin wrapper
 * (Constitution Article I): the `faq` module renders and resolves it.
 *
 * Indexed like every page (canonical, hreflang, the sitemap, no noindex).
 * All twenty answers are in the prerendered HTML, and the head carries the
 * approved meta copy and a `FAQPage` graph in both locales (spec D1, D4).
 * The topic its URL names (`#precios`) is handed to the language toggle,
 * so switching keeps the topic (spec FR-013).
 */
const content = useFaqContent()
const onTopicNamed = useFaqLocaleSwitch()
/* The fragment as the router holds it: on a direct load Nuxt restores it
   only after hydration (`useFaqTopics`, `hash`). */
const route = useRoute()

useFaqPageSeo(content)
</script>

<template>
  <FaqSection
    v-bind="content"
    :url-hash="route.hash"
    @topic-named="onTopicNamed"
  />
</template>
