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
 *
 * `mt-section-gap` on every section but the Hero (feature 23, items 3/8):
 * the `.pen` draws sections flush against each other and each section's own
 * `pt-*-top` is calibrated exactly against that (`rules.md` § R49), so the
 * gap Roberto asked for is a margin added at this composition layer rather
 * than a change to any of those calibrated paddings.
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
  <PurposeSection class="mt-section-gap" v-bind="purpose" />
  <ServicesSection class="mt-section-gap" v-bind="services" />
  <ContactSection
    class="mt-section-gap"
    v-bind="contact"
    :form-content="contactForm"
  />
</template>
