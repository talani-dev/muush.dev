<script setup lang="ts">
import { HeroSection, useHeroContent } from '@/features/landing'

/**
 * The landing. A thin wrapper (Constitution Article I): it composes the Hero
 * and holds no Hero logic of its own.
 *
 * The placeholder `<h1>` that used to live here is gone rather than kept
 * alongside — the Hero's headline is the page's `<h1>` and a page has one
 * (spec FR-004). `site.title` stays: it is the document title and unrelated.
 */
const { t } = useI18n()
const hero = useHeroContent()

useHead({ title: t('site.title') })
</script>

<template>
  <HeroSection v-bind="hero" />
</template>
