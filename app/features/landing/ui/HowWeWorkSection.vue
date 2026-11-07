<script setup lang="ts">
import type { HowWeWorkContent } from '@/features/landing/data/howWeWorkContent'
import { SECTION_ANCHORS } from '@/shared/data/sectionAnchors'
import Heading from '@/shared/ui/Heading.vue'
import Pill from '@/shared/ui/Pill.vue'
import ShaderBackground from '@/shared/ui/ShaderBackground.vue'
import ProcessTimeline from './ProcessTimeline.vue'

/**
 * Cómo trabajamos (feature 44, US4, spec FR-018…FR-022; pen extract-44
 * § 4; frames `KYUSn` desktop, `H5atpX` mobile), over the vidrio acanalado
 * (`howWeWork` preset, poster as fallback), at the shared
 * `como-trabajamos` anchor the hero and the footer link to.
 *
 * - 1440: padding 120 / 80, gap 64; a centred head (pill and the 52 px
 *   heading, gap 22) and the 1280-wide process; 730 tall with it, the
 *   acanalado frame `XC9xg`.
 * - 390: padding 72 / 24, gap 24; the head left-aligned (heading 28 / 1.15)
 *   and the vertical rail.
 *
 * The acanalado fades to black at its bottom edge, so the section after it
 * starts on the canvas.
 *
 * Feature 45, reopen 2 (Roberto 2026-11-02, spec 045 FR-041): the pill
 * carries `pill-aire`, 6 px more space above the heading below `lg` and
 * 8 px from it, a deliberate departure from the `.pen`.
 */
type Props = HowWeWorkContent

const { pill, headingFirst, headingSecond, steps } = defineProps<Props>()
</script>

<template>
  <section
    :id="SECTION_ANCHORS.howWeWork"
    class="relative isolate"
    data-track-section="how_we_work"
  >
    <ShaderBackground preset="howWeWork" />
    <div class="relative z-10 px-gutter py-bloque-y lg:px-gutter-desktop">
      <div class="mx-auto flex max-w-contenido flex-col gap-proceso-gap">
        <div
          class="flex flex-col items-start gap-cabeza-gap lg:items-center lg:text-center"
        >
          <Pill class="pill-aire" :label="pill" />
          <Heading
            :level="2"
            size="proceso"
            :first="headingFirst"
            :second="headingSecond"
          />
        </div>
        <ProcessTimeline :steps="steps" />
      </div>
    </div>
  </section>
</template>
