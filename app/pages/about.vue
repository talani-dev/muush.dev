<script setup lang="ts">
import {
  AboutHeroSection,
  TeamCompositionSection,
  useAboutHeroContent,
  useTeamCompositionContent,
  useWhereWeAreContent,
  useWorkContent,
  WhereWeAreSection,
  WorkWithMuushSection,
} from '@/features/about'
import {
  useApplicationFormContent,
  useApplicationSubmitter,
} from '@/features/forms'
import { usePageSeo } from '@/features/shell'

/**
 * Nosotros — `/es/nosotros` and `/en/about` from this one file. The
 * translated segment is declared in `nuxt.config.ts` under `i18n.pages`,
 * never here. A thin wrapper (Constitution Article I).
 *
 * Muush 1.0 order (feature 46; `muush-1.0.md` § 3): Hero over the listón →
 * Cómo se arma → Dónde estamos (the shared map) → Trabaja con muush over
 * the listón, at `#trabaja-con-muush`, with the application form →
 * footer. The sections sit flush, each with its own drawn padding; the
 * hero's heading is the page's only `<h1>`.
 *
 * `useApplicationFormContent` is called here, not inside
 * `WorkWithMuushSection.vue`, so neither module reaches into the other
 * beyond its barrel (Constitution Article III) — the pattern `index.vue`
 * uses for `useContactFormContent`.
 */
const aboutHero = useAboutHeroContent()
const composition = useTeamCompositionContent()
const whereWeAre = useWhereWeAreContent()
const work = useWorkContent()
const applicationFormContent = useApplicationFormContent()
/* Feature 029: same seam as `index.vue`'s `useContactSubmitter()`. */
const applicationSubmitter = useApplicationSubmitter()

/* `AboutPage` in both locales: the schema-org default would give it only to
   `/en/about`, from its URL segment (feature 35, FR-010). */
usePageSeo({
  titleKey: 'pages.about.title',
  descriptionKey: 'pages.about.description',
  pageType: 'AboutPage',
})
</script>

<template>
  <AboutHeroSection v-bind="aboutHero" />
  <TeamCompositionSection v-bind="composition" />
  <WhereWeAreSection v-bind="whereWeAre" />
  <WorkWithMuushSection
    v-bind="work"
    :form-content="applicationFormContent"
    :form-submitter="applicationSubmitter"
  />
</template>
