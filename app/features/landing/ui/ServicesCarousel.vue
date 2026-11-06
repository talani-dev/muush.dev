<script setup lang="ts">
import { ref } from 'vue'
import type { ServiceCardContent } from '@/features/landing/data/servicesContent'
import { useCarouselIndicator } from '@/features/landing/logic/useCarouselIndicator'
import { useDesktopLayout } from '@/shared/logic/useDesktopLayout'
import CarouselIndicator from './CarouselIndicator.vue'
import ServiceCard from './ServiceCard.vue'

/**
 * The four service cards (feature 44, spec FR-015, FR-016; pen extract-44
 * §§ 3.1, 3.3, 8; research R7).
 *
 * - Below `lg`: a horizontal scroller with mandatory snapping, bleeding to
 *   the screen edges and starting at the gutter (x 24), cards 290 wide with
 *   gap 14 so the next one peeks in; scrollbar hidden. The indicator
 *   follows 24 below (the section gap, § 8).
 * - From `lg`: a 4-column grid, gap 20, cards top-aligned and as tall as
 *   their content; no indicator.
 *
 * The cards hold nothing focusable, so below `lg` the list itself takes
 * focus (named by the section heading) and the arrow keys scroll it. From
 * `lg` it does not scroll and leaves the tab order.
 */
interface Props {
  cards: ServiceCardContent[]
  labelledBy: string
}

const { cards, labelledBy } = defineProps<Props>()

const scroller = ref<HTMLElement | null>(null)
const isDesktop = useDesktopLayout()
const { activeIndex } = useCarouselIndicator(scroller)
</script>

<template>
  <div class="flex flex-col gap-servicios-gap">
    <ul
      ref="scroller"
      :aria-labelledby="labelledBy"
      :tabindex="isDesktop ? undefined : 0"
      class="relative -mx-gutter flex snap-x snap-mandatory scroll-pl-gutter gap-tarjetas-gap overflow-x-auto px-gutter foco [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-4 lg:items-start lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden"
    >
      <li
        v-for="card in cards"
        :key="card.icon + card.title"
        class="w-tarjeta-movil shrink-0 snap-start lg:w-auto"
      >
        <ServiceCard v-bind="card" />
      </li>
    </ul>
    <CarouselIndicator
      class="lg:hidden"
      :count="cards.length"
      :active="activeIndex"
    />
  </div>
</template>
