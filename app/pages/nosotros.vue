<script setup lang="ts">
import {
  AboutHeroSection,
  useAboutHeroContent,
  useWorkContent,
  WorkWithMuushSection,
} from '@/features/about'
import { useApplicationFormContent } from '@/features/forms'

/**
 * About — `/es/nosotros` and `/en/about` from this one file. The translated
 * segment is declared in `nuxt.config.ts` under `i18n.pages`, never here.
 *
 * `AboutHeroSection` (feature 17) supplies the page's `<h1>`.
 * `WorkWithMuushSection` (feature 20) is the page's second section and the
 * target the footer's `Work with muush` item and the nav's `#work` anchor
 * resolve to — no more placeholder heading. Team and Network still belong to
 * later, `blocked` features (spec Assumptions).
 *
 * `useApplicationFormContent` is called here, not inside
 * `WorkWithMuushSection.vue` or `forms/`'s own components, so that neither
 * module reaches into the other beyond its barrel (Constitution Article III,
 * plan.md D-1) — the same pattern `index.vue` already uses for
 * `useContactFormContent`.
 *
 * `mt-section-gap` on `WorkWithMuushSection` (feature 23, items 3/8) —
 * same reasoning as `index.vue`'s own comment on the same class.
 */
const { t } = useI18n()
const aboutHero = useAboutHeroContent()
const work = useWorkContent()
const applicationFormContent = useApplicationFormContent()

useHead({ title: t('pages.about.title') })
</script>

<template>
  <AboutHeroSection v-bind="aboutHero" />
  <WorkWithMuushSection
    class="mt-section-gap"
    v-bind="work"
    :form-content="applicationFormContent"
  />
</template>
