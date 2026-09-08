<script setup lang="ts">
import { AboutHeroSection, useAboutHeroContent } from '@/features/about'

/**
 * About — `/es/nosotros` and `/en/about` from this one file. The translated
 * segment is declared in `nuxt.config.ts` under `i18n.pages`, never here.
 *
 * `AboutHeroSection` (feature 17) supplies the page's `<h1>` — the placeholder
 * heading that used to live here is gone rather than kept alongside, the same
 * move `index.vue` made when the landing Hero landed (spec-equivalent to that
 * page's own rationale). Team, network and the application form's *content*
 * still belong to a later feature. The `#work` heading below is not that
 * content — it exists only so the nav's About link and the footer's
 * `Work with muush` item resolve to a real anchor instead of a dead fragment.
 */
const { t } = useI18n()
const aboutHero = useAboutHeroContent()

useHead({ title: t('pages.about.title') })
</script>

<template>
  <AboutHeroSection v-bind="aboutHero" />

  <!--
    The target the footer's `Work with muush` item points at. A heading is the
    whole of it: a shell destination that lands on a page with no such id is a
    dead fragment, which is the failure ui-map.md § 8 names. The application
    form that will fill this section is out of scope.
  -->
  <section id="work">
    <h2 class="font-instrument text-h3 text-bone-100">
      {{ t('pages.about.work') }}
    </h2>
  </section>
</template>
