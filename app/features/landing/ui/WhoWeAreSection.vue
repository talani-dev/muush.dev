<script setup lang="ts">
import type { WhoWeAreContent } from '@/features/landing/data/whoWeAreContent'
import Heading from '@/shared/ui/Heading.vue'
import MapLegend from '@/shared/ui/MapLegend.vue'
import Pill from '@/shared/ui/Pill.vue'
import WorldMap from '@/shared/ui/WorldMap.vue'

/**
 * "Qué es muush" (feature 44, US2, spec FR-007…FR-013; pen extract-44 § 2,
 * § 8; frames `esV29` desktop, `nfrT8` mobile), on the Negro 950 canvas.
 *
 * One centred column: pill, heading, the map (with its America / Europa
 * selector before it below `lg`), body and legend.
 *
 * - 1440: padding 110 / 0, gap 28; heading 56; the whole map 1408 × 470 at
 *   80 %; body 17 / 1.55 Gris 400, 640 wide; legend in one row.
 * - 390: padding 72 / 24, gap 24; heading 28 / 1.15; the 342 × 240 map box;
 *   body in Blanco 70 %; legend in two rows with the "Estonia · pronto" chip.
 *
 * From `lg` the section has no side padding so the map can reach its drawn
 * 1408 inside 1440; the heading keeps the gutter so it never meets the edge
 * between 1024 and 1440 (the body and legend are narrower than that).
 *
 * Feature 45, reopen 2 (Roberto 2026-11-02, spec 045 FR-041): the pill
 * carries `pill-aire`, 6 px more space above the heading below `lg` and
 * 8 px from it, a deliberate departure from the `.pen`.
 */
type Props = WhoWeAreContent

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
    class="flex flex-col items-center gap-mapa-gap px-gutter py-mapa-y text-center lg:px-0"
    data-track-section="who_we_are"
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
      class="max-w-medida font-texto text-cuerpo text-texto-suave lg:text-gris-400"
    >
      {{ body }}
    </p>
    <MapLegend :items="legend" :soon-label="soonLabel" />
  </section>
</template>
