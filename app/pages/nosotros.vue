<script setup lang="ts">
/**
 * About — `/es/nosotros` and `/en/about` from this one file. The translated
 * segment is declared in `nuxt.config.ts` under `i18n.pages`, never here.
 *
 * The page exists so the nav's About link and the footer's `Work with muush`
 * item resolve instead of 404ing on every page of the site. Its *content* —
 * team, network and the application form — belongs to a later feature
 * (spec FR-006). Nothing below is that content.
 */
const { t } = useI18n()

useHead({ title: t('pages.about.title') })
</script>

<template>
  <div class="flex flex-col gap-page">
    <h1 class="font-instrument text-h1 text-bone-100">
      {{ t('pages.about.heading') }}
    </h1>

    <!--
      The target the footer's `Work with muush` item points at. A heading is
      the whole of it: a shell destination that lands on a page with no such
      id is a dead fragment, which is the failure ui-map.md § 8 names. The
      application form that will fill this section is out of scope.
    -->
    <section id="work">
      <h2 class="font-instrument text-h3 text-bone-100">
        {{ t('pages.about.work') }}
      </h2>
    </section>
  </div>
</template>
