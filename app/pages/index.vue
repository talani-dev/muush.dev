<script setup lang="ts">
import { useContactFormContent } from '@/features/forms'
import {
  ContactSection,
  HeroSection,
  PurposeSection,
  ServicesSection,
  useContactContent,
  useHeroContent,
  usePurposeContent,
  useServicesContent,
} from '@/features/landing'

/**
 * The landing. A thin wrapper (Constitution Article I): it composes the
 * sections and holds none of their logic of its own.
 *
 * The placeholder `<h1>` that used to live here is gone rather than kept
 * alongside — the Hero's headline is the page's `<h1>` and a page has one
 * (spec FR-004). `site.title` stays: it is the document title and unrelated.
 *
 * `05 Proyectos` (feature 15) is `blocked` indefinitely, so `ContactSection`
 * renders directly after `ServicesSection` rather than after Proyectos as the
 * full design draws (recorded in `docs/harness/findings.md`, not silently).
 *
 * `useContactFormContent` is imported from `forms`, not `landing`: the page
 * composes both modules' barrels, which Article III permits — only a
 * *feature* may not reach into another feature's internals.
 */
const { t } = useI18n()
const hero = useHeroContent()
const purpose = usePurposeContent()
const services = useServicesContent()
const contact = useContactContent()
const contactForm = useContactFormContent()

useHead({ title: t('site.title') })
</script>

<template>
  <HeroSection v-bind="hero" />
  <PurposeSection v-bind="purpose" />
  <ServicesSection v-bind="services" />
  <ContactSection v-bind="contact" :form-content="contactForm" />
</template>
