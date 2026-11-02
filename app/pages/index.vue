<script setup lang="ts">
import { useContactFormContent, useContactSubmitter } from '@/features/forms'
import {
  ContactSection,
  HeroSection,
  HowWeWorkSection,
  ServicesSection,
  useContactContent,
  useHeroContent,
  useHowWeWorkContent,
  useServicesContent,
  useWhoWeAreContent,
  WhoWeAreSection,
} from '@/features/landing'
import { usePageSeo } from '@/features/shell'

/**
 * The home. A thin wrapper (Constitution Article I): it composes the
 * sections and holds none of their logic of its own.
 *
 * Muush 1.0 order (feature 44; `muush-1.0.md` § 3): Hero over the listón →
 * Qué es muush → Servicios → Cómo trabajamos over the acanalado → the
 * contact section → footer. Propósito was retired by Roberto on 2026-10-31
 * (`muush-1.0.md` § 1); Proyectos was never built (feature 15 stayed
 * blocked). The contact section is still the v1 one, at `#diagnostico`,
 * until feature 45 replaces it.
 *
 * The sections sit flush: each carries its own drawn padding, so no margin
 * is added here. The Hero's headline is the page's only `<h1>`; the
 * document title and description are the page's own, from the locale
 * files, through `usePageSeo` (feature 35).
 *
 * `useContactFormContent` is imported from `forms`, not `landing`: the page
 * composes both modules' barrels, which Article III permits — only a
 * *feature* may not reach into another feature's internals.
 */
const hero = useHeroContent()
const whoWeAre = useWhoWeAreContent()
const services = useServicesContent()
const howWeWork = useHowWeWorkContent()
const contact = useContactContent()
const contactForm = useContactFormContent()
/* Feature 029: the form's only door to the network. Creating it loads
   nothing; Turnstile and the API are reached only after the visitor engages
   the form. */
const contactSubmitter = useContactSubmitter()

/* Full-bleed sections: the layout drops the v1 page frame (feature 44). */
definePageMeta({ fullBleed: true })

usePageSeo({
  titleKey: 'pages.home.title',
  descriptionKey: 'pages.home.description',
})
</script>

<template>
  <HeroSection v-bind="hero" />
  <WhoWeAreSection v-bind="whoWeAre" />
  <ServicesSection v-bind="services" />
  <HowWeWorkSection v-bind="howWeWork" />
  <ContactSection
    v-bind="contact"
    :form-content="contactForm"
    :form-submitter="contactSubmitter"
  />
</template>
