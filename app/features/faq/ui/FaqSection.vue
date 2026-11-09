<script setup lang="ts">
import { computed, watch } from 'vue'
import type {
  ResolvedFaqCard,
  ResolvedFaqTopic,
} from '@/features/faq/data/types'
import { useFaqAccordion } from '@/features/faq/logic/useFaqAccordion'
import { useFaqTopics } from '@/features/faq/logic/useFaqTopics'
import Heading from '@/shared/ui/Heading.vue'
import Pill from '@/shared/ui/Pill.vue'
import FaqBand from './FaqBand.vue'
import FaqCard from './FaqCard.vue'
import FaqPanel from './FaqPanel.vue'
import FaqTopicTabs from './FaqTopicTabs.vue'

/**
 * The Preguntas page block (feature 51, spec FR-010…FR-020; contract
 * `ui-contract.md`; handoff `preguntas-muush-1.0`).
 *
 * Framing (spec FR-019, Roberto 2026-11-08, OQ-1 = B): the site-wide first
 * block, exactly as the heroes and the 404 — at least a large viewport
 * tall, the header's strip plus air above, air below, and the content
 * centred in the space below the header. The handoff's 300 / 200 and
 * 200 / 64 paddings are not used (fallback in `global.css`, "Preguntas").
 * The band is a sibling of the centred layer, placed from the block's top.
 *
 * From `lg` two columns, 420 and the rest, 72 apart: the header, the tabs
 * and the card on the left (36 apart), the questions on the right, 68
 * lower. Below `lg` one stack: header (gutters, gap 16), the chip row 28
 * below it, the questions 20 below the chips, the card section 32 below
 * them. The page's only `h1`; the card title is an `h2`, each question an
 * `h3`.
 *
 * State: `useFaqTopics` (the selected topic, the URL fragment) and
 * `useFaqAccordion` (the open question, `faq_question_open`). It emits
 * `topicNamed` with the topic the URL names, for the language switch.
 */
interface Props {
  pill: string
  heading: { first: string; second: string }
  subtitle: string
  tabsLabel: string
  topics: readonly ResolvedFaqTopic[]
  card: ResolvedFaqCard
  /** DOM id stem of the tabs, panels and questions. */
  idPrefix?: string
  /** The router's fragment (`route.hash`), from the page (`useFaqTopics`). */
  urlHash?: string
}

const {
  pill,
  heading,
  subtitle,
  tabsLabel,
  topics,
  card,
  idPrefix = 'faq',
  urlHash,
} = defineProps<Props>()

const emit = defineEmits<{ topicNamed: [index: number | null] }>()

const { selected, named, select, onKeydown } = useFaqTopics({
  anchors: () => topics.map(topic => topic.anchor),
  idPrefix,
  onSelect: () => accordion.reset(),
  hash: () => urlHash,
})
const selectedTopic = computed(() => topics[selected.value])
const accordion = useFaqAccordion(selectedTopic)
const { openIndex, toggle } = accordion

watch(named, index => emit('topicNamed', index))
</script>

<template>
  <section
    class="relative isolate flex min-h-portada-alto flex-col pt-seccion-arriba pb-seccion-aire"
    data-faq
  >
    <FaqBand />
    <div
      class="relative z-10 flex flex-1 flex-col justify-center lg:px-gutter-desktop"
    >
      <div
        class="mx-auto w-full max-w-contenido lg:grid lg:grid-cols-faq lg:grid-rows-faq lg:gap-x-faq-columnas lg:gap-y-faq-izquierda-gap"
      >
        <div
          class="flex flex-col items-start gap-faq-encabezado-gap px-gutter lg:col-start-1 lg:row-start-1 lg:px-0"
        >
          <Pill :label="pill" class="pill-aire" />
          <Heading
            :level="1"
            size="faq"
            :first="heading.first"
            :second="heading.second"
            class="lg:whitespace-nowrap"
          />
          <p class="font-texto text-faq-bajada text-texto-suave">
            {{ subtitle }}
          </p>
        </div>
        <FaqTopicTabs
          :topics="topics"
          :selected="selected"
          :label="tabsLabel"
          :id-prefix="idPrefix"
          class="pt-faq-chips-arriba lg:col-start-1 lg:row-start-2 lg:pt-0"
          @select="select"
          @keydown="onKeydown"
        />
        <div
          class="px-gutter pt-faq-preguntas-arriba lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:mt-faq-derecha-arriba lg:px-0 lg:pt-0"
        >
          <FaqPanel
            v-for="(topic, index) in topics"
            :key="topic.anchor"
            :topic="topic"
            :open-index="openIndex"
            :selected="index === selected"
            :id-prefix="idPrefix"
            @toggle="toggle"
          />
        </div>
        <div
          class="px-gutter pt-faq-tarjeta-arriba lg:col-start-1 lg:row-start-3 lg:self-start lg:px-0 lg:pt-0"
        >
          <FaqCard :card="card" />
        </div>
      </div>
    </div>
  </section>
</template>
