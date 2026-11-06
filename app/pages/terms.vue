<script setup lang="ts">
import {
  LegalArticle,
  TERMS_AND_CONDITIONS,
  useLegalPageContent,
  useLegalScrollSpy,
} from '@/features/legal'
import { usePageSeo } from '@/features/shell'

/**
 * Términos y condiciones — `/es/terminos` and `/en/terms` from this one
 * file (feature 48). Same contract as `privacy.vue`: the segment lives in
 * `i18n.pages`, the page is indexed, and it is a thin wrapper.
 */
const content = useLegalPageContent(TERMS_AND_CONDITIONS)
const { activeId } = useLegalScrollSpy(
  TERMS_AND_CONDITIONS.sections.map(section => section.id)
)

usePageSeo({
  titleKey: 'pages.terms.title',
  descriptionKey: 'pages.terms.description',
  pageType: 'WebPage',
})
</script>

<template>
  <LegalArticle :content="content" :active-id="activeId" />
</template>
