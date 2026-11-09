<script setup lang="ts">
import type { WhereWeAreContent } from '@/features/about/data/whereWeAreContent'
import Heading from '@/shared/ui/Heading.vue'
import MapLegend from '@/shared/ui/MapLegend.vue'
import Pill from '@/shared/ui/Pill.vue'
import WorldMap from '@/shared/ui/WorldMap.vue'

/**
 * "Dónde estamos" (feature 46, US1, spec FR-015…FR-019; pen extract-46
 * §§ 1.3, 2; frames `sBV2H` desktop, `ab0j5` mobile), on the page black.
 *
 * The home's "Qué es muush" layout around the same shared map pieces
 * (research R4): the dotted map with its nine pins and radar ping, the
 * hidden city list, the America / Europa tabs and region zoom below `lg`,
 * and the legend (one row from `lg`; two rows with the "Estonia · pronto"
 * chip below). The labels are the shared `map.*` copy.
 *
 * - 1440: x padding 0, gap 28; heading 56 / 1.1; the map 1408 × 470 at
 *   80 %; body 17 / 1.55 Gris 400, 640 wide.
 * - 390: x padding 24, gap 24; heading 28 / 1.15; the 342 × 240 map box;
 *   body 16 / 1.5 Blanco 70 % (the one difference from the home, 17).
 *
 * Height and vertical padding are the section framing (`global.css`,
 * Roberto 2026-11-08): at least a full viewport with the header's strip
 * inside its top padding, the column centred below it.
 *
 * The pill carries `pill-aire` (spec 045 FR-041).
 */
type Props = WhereWeAreContent

const {
  pill,
  headingFirst,
  headingSecond,
  body,
  legend,
  soonLabel,
  regions,
  regionsLabel,
  groups,
  cityNames,
} = defineProps<Props>()
</script>

<template>
  <section
    class="flex min-h-seccion-alto flex-col items-center justify-center gap-mapa-gap px-gutter pt-seccion-arriba pb-seccion-aire text-center lg:px-0"
    data-track-section="where_we_are"
  >
    <Pill class="pill-aire" :label="pill" />
    <Heading
      :level="2"
      size="seccion"
      :first="headingFirst"
      :second="headingSecond"
      class="lg:px-gutter"
    />
    <WorldMap
      :regions="regions"
      :regions-label="regionsLabel"
      :groups="groups"
      :city-names="cityNames"
    />
    <p
      class="max-w-medida font-texto text-donde-cuerpo text-texto-suave lg:text-gris-400"
    >
      {{ body }}
    </p>
    <MapLegend :items="legend" :soon-label="soonLabel" />
  </section>
</template>
