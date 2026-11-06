<script setup lang="ts">
import {
  LegalArticle,
  PRIVACY_NOTICE,
  useCookieConsent,
  useLegalPageContent,
  useLegalScrollSpy,
} from '@/features/legal'
import { usePageSeo } from '@/features/shell'

/**
 * Aviso de privacidad — `/es/privacidad` and `/en/privacy` from this one
 * file (feature 48). The translated segment is declared in
 * `nuxt.config.ts` under `i18n.pages`, never here. A thin wrapper
 * (Constitution Article I). Indexed like every page (Roberto 2026-10-31):
 * canonical, hreflang, the sitemap, no noindex.
 *
 * "Cambiar mis preferencias" reopens the cookie preferences the layout
 * renders, pre-filled with the stored choice.
 */
const content = useLegalPageContent(PRIVACY_NOTICE)
const { activeId } = useLegalScrollSpy(
  PRIVACY_NOTICE.sections.map(section => section.id)
)
const { openPreferences } = useCookieConsent()

usePageSeo({
  titleKey: 'pages.privacy.title',
  descriptionKey: 'pages.privacy.description',
  pageType: 'WebPage',
})
</script>

<template>
  <LegalArticle
    :content="content"
    :active-id="activeId"
    @open-preferences="openPreferences"
  />
</template>
