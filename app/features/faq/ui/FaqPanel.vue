<script setup lang="ts">
import type { ResolvedFaqTopic } from '@/features/faq/data/types'
import FaqQuestion from './FaqQuestion.vue'

/**
 * One topic's questions as a tab panel (feature 51, spec FR-010, FR-015;
 * contract `ui-contract.md`): `role="tabpanel"` labelled by its tab, and
 * `hidden` unless its topic is selected. Every panel is rendered, so all
 * twenty answers are in the prerendered HTML (spec D3). No heading of its
 * own: its tab names it. Gap 10 → 12 between questions.
 */
interface Props {
  topic: ResolvedFaqTopic
  /** The open question, or `null` when all are closed. */
  openIndex: number | null
  selected: boolean
  idPrefix: string
}

const { topic, openIndex, selected, idPrefix } = defineProps<Props>()

const emit = defineEmits<{ toggle: [index: number] }>()
</script>

<template>
  <div
    :id="`${idPrefix}-panel-${topic.anchor}`"
    role="tabpanel"
    :aria-labelledby="`${idPrefix}-tab-${topic.anchor}`"
    :hidden="!selected"
    class="flex flex-col gap-faq-preguntas-gap"
  >
    <FaqQuestion
      v-for="(question, index) in topic.questions"
      :key="question.id"
      :question="question"
      :open="selected && index === openIndex"
      @toggle="emit('toggle', index)"
    />
  </div>
</template>
