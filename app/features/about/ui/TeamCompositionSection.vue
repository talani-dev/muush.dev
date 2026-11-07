<script setup lang="ts">
import type { TeamCompositionContent } from '@/features/about/data/teamCompositionContent'
import Heading from '@/shared/ui/Heading.vue'
import Pill from '@/shared/ui/Pill.vue'
import CompositionCard from './CompositionCard.vue'

/**
 * "Cómo se arma" (feature 46, US1, spec FR-008…FR-014; pen extract-46
 * §§ 1.2, 2; frames `Wy3iH` desktop, `jRvnu` mobile), on the page black.
 *
 * - 1440: centred; padding 100 / 80 / 80, gap 40; heading 56 / 1.1; the
 *   three cards in one row, gap 24, each 400 wide and all the same height.
 * - 390: start-aligned (pill and heading at x 24); padding 72 / 24, gap 24;
 *   heading 30 / 1.15; the cards stacked full width, gap 14.
 *
 * The heading takes the 30 → 56 scale as a class (`text-servicios-titulo`,
 * the same 30 / 1.15 → 56 / 1.1 the Servicios heading draws). The cards
 * are one list so assistive technology announces three items. Between 768
 * and 1024 they stay stacked (responsive latitude); the row starts at `lg`.
 * The pill carries `pill-aire` (spec 045 FR-041).
 */
type Props = TeamCompositionContent

const { pill, headingFirst, headingSecond, cards } = defineProps<Props>()
</script>

<template>
  <section
    class="flex flex-col items-start gap-composicion-gap px-gutter pt-composicion-arriba pb-composicion-abajo lg:items-center lg:px-gutter-desktop lg:text-center"
    data-track-section="how_it_comes_together"
  >
    <Pill class="pill-aire" :label="pill" />
    <Heading
      :level="2"
      :first="headingFirst"
      :second="headingSecond"
      class="text-servicios-titulo"
    />
    <ul
      class="grid w-full max-w-composicion gap-composicion-tarjetas lg:grid-cols-3"
    >
      <CompositionCard
        v-for="card in cards"
        :key="card.kind"
        :kind="card.kind"
        :label="card.label"
        :title="card.title"
        :text="card.text"
      />
    </ul>
  </section>
</template>
