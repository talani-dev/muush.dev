<script setup lang="ts">
import { useId } from 'vue'
import type { ServicesContent } from '@/features/landing/data/servicesContent'
import { SECTION_ANCHORS } from '@/shared/data/sectionAnchors'
import Heading from '@/shared/ui/Heading.vue'
import Pill from '@/shared/ui/Pill.vue'
import AlsoAvailable from './AlsoAvailable.vue'
import ServicesCarousel from './ServicesCarousel.vue'

/**
 * Servicios (feature 44, US3, spec FR-014…FR-017; pen extract-44 § 3, § 8;
 * frames `TztwR` desktop, `HeOLx` mobile), on the Negro 950 canvas, at the
 * shared `servicios` anchor the nav links to.
 *
 * - 1440: padding 120 / 80, gap 44; a left-aligned head (pill and the
 *   56 / 1.1 heading, gap 22); the four cards; the 1280-wide strip.
 * - 390: padding 72 / 24, gap 24 everywhere (head, carousel, indicator,
 *   "También" card); the heading is 30 / 1.15, a per-use size the shared
 *   `Heading` takes as a class (`text-servicios-titulo`, its contract).
 *
 * The content never grows past the 1280 content width (1920 included).
 */
type Props = ServicesContent

const { pill, headingFirst, headingSecond, cards, also } = defineProps<Props>()

const headingId = `servicios-${useId()}`
</script>

<template>
  <section
    :id="SECTION_ANCHORS.services"
    class="px-gutter py-bloque-y lg:px-gutter-desktop"
  >
    <div class="mx-auto flex max-w-contenido flex-col gap-servicios-gap">
      <div class="flex flex-col items-start gap-cabeza-gap">
        <Pill :label="pill" />
        <Heading
          :id="headingId"
          :level="2"
          size="seccion"
          :first="headingFirst"
          :second="headingSecond"
          class="text-servicios-titulo"
        />
      </div>
      <ServicesCarousel :cards="cards" :labelled-by="headingId" />
      <AlsoAvailable
        :label="also.label"
        :chips="also.chips"
        :note="also.note"
      />
    </div>
  </section>
</template>
