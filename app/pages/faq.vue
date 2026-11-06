<script setup lang="ts">
import { StatusSection, useFaqContent, usePageSeo } from '@/features/shell'

/**
 * Preguntas — `/es/preguntas` and `/en/faq` from this one file (feature
 * 46). The translated segment is declared in `nuxt.config.ts` under
 * `i18n.pages`, never here. A thin wrapper (Constitution Article I).
 *
 * For now one block, "En construcción 🚧" with the free assessment and a
 * call (`muush-1.0.md` § 3). A thin page on purpose, and indexed anyway:
 * Roberto 2026-10-31 (`muush-1.0.md` § 1), canonical, hreflang, the
 * sitemap and no noindex, like every page of the site. Reached from the
 * footer only; the header link bar stays Inicio · Servicios · Nosotros
 * (Roberto, feature 43; spec 046 Clarifications).
 *
 * Structured data: a plain `WebPage` in both locales (spec FR-038). The
 * schema-org default would infer `FAQPage` from the final `faq` segment of
 * `/en/faq` only, which this page is not (it has no questions yet) and
 * which would make the pair differ.
 */
const content = useFaqContent()

usePageSeo({
  titleKey: 'pages.faq.title',
  descriptionKey: 'pages.faq.description',
  pageType: 'WebPage',
})
</script>

<template>
  <StatusSection v-bind="content" />
</template>
