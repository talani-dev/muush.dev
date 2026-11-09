<script setup lang="ts">
import { ref, watch } from 'vue'
import chevronRight from '@/assets/icons/chevron-right.svg?raw'
import type { ResolvedFaqTopic } from '@/features/faq/data/types'
import { chipScrollLeft } from '@/features/faq/logic/chipScroll'
import { useReducedMotion } from '@/shared/logic/useReducedMotion'

/**
 * The five Preguntas topics (feature 51, spec FR-010, FR-014; contract
 * `ui-contract.md`; handoff README "Pestañas de temas").
 *
 * The WAI-ARIA tabs pattern, like `MapRegionTabs`: a named `tablist`,
 * `tab` buttons with `aria-selected` and `aria-controls`, and a roving
 * `tabindex`. A click emits `select`; the arrow keys, Home and End are the
 * caller's `@keydown` on this root (`useFaqTopics().onKeydown`).
 *
 * From `lg` a column of tabs (padding 16 / 18, radius 14, number, name
 * and `chevron-right` 18); below it a chip carousel (padding 10 / 14, full
 * radius, no chevron) that scrolls inside itself with scroll snap, starts
 * at the gutter and has no end padding, so the next chip peeks. The
 * selected chip is scrolled into view, instantly under reduced motion.
 * Active: Carbón 800 60 %, the gradient edge, number Red muush, name and
 * chevron Blanco. Inactive: Negro 900 40 %, Blanco 6 % edge, all Gris 400.
 * Blur 18. Forced colours drop the fills, so the selected tab is also
 * underlined there.
 */
interface Props {
  topics: readonly Pick<ResolvedFaqTopic, 'anchor' | 'number' | 'title'>[]
  selected: number
  label: string
  idPrefix: string
}

const { topics, selected, label, idPrefix } = defineProps<Props>()

const emit = defineEmits<{ select: [index: number] }>()

const isReduced = useReducedMotion()
const row = ref<HTMLElement | null>(null)

/** Brings the selected chip into the row; the page itself never moves. */
function revealSelected() {
  const container = row.value
  const anchor = topics[selected]?.anchor
  const chip = anchor ? document.getElementById(tabId(anchor)) : null
  if (!container || !chip) return
  const left = chipScrollLeft({
    scrollLeft: container.scrollLeft,
    row: container.getBoundingClientRect(),
    chip: chip.getBoundingClientRect(),
    startInset: Number.parseFloat(getComputedStyle(container).paddingLeft),
  })
  if (left === container.scrollLeft) return
  container.scrollTo({ left, behavior: isReduced.value ? 'instant' : 'smooth' })
}

watch(() => selected, revealSelected, { flush: 'post' })

function tabId(anchor: string): string {
  return `${idPrefix}-tab-${anchor}`
}
</script>

<template>
  <div
    ref="row"
    role="tablist"
    :aria-label="label"
    class="flex snap-x snap-mandatory scroll-pl-gutter gap-faq-pestanas-gap overflow-x-auto ps-gutter [scrollbar-width:none] lg:flex-col lg:overflow-visible lg:ps-0 [&::-webkit-scrollbar]:hidden"
  >
    <button
      v-for="(topic, index) in topics"
      :id="tabId(topic.anchor)"
      :key="topic.anchor"
      type="button"
      role="tab"
      :aria-selected="index === selected"
      :aria-controls="`${idPrefix}-panel-${topic.anchor}`"
      :tabindex="index === selected ? 0 : -1"
      :class="[
        'relative flex shrink-0 snap-start items-center gap-faq-pestana-gap whitespace-nowrap rounded-pill px-faq-pestana-x py-faq-pestana-y font-texto backdrop-blur-faq borde-luz transition-colors duration-(--rapido) ease-muush foco forced-colors:aria-selected:underline lg:rounded-faq-pestana lg:text-start',
        index === selected
          ? 'bg-carbon-800/60 text-blanco borde-faq-activo'
          : 'bg-negro-900/40 text-gris-400 borde-faq-tenue',
      ]"
      @click="emit('select', index)"
    >
      <span
        :class="[
          'text-faq-numero',
          index === selected ? 'text-red-muush-500' : 'text-gris-400',
        ]"
        >{{
          topic.number
        }}</span
      >
      <span class="text-faq-tema lg:flex-1">{{ topic.title }}</span>
      <span
        aria-hidden="true"
        data-icono
        class="icono hidden size-faq-chevron shrink-0 lg:block"
        v-html="chevronRight"
      />
    </button>
  </div>
</template>

<style scoped>
/* `:deep()` is required: the scoped transform does not reach `v-html`
   content (app/assets/icons/README.md). */
.icono :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
