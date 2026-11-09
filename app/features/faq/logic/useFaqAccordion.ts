import { type Ref, readonly, ref } from 'vue'
import type { ResolvedFaqTopic } from '@/features/faq/data/types'
import { emitTrackingEvent } from '@/shared/logic/trackingBus'

/**
 * The questions of the selected topic as a one-open-at-a-time accordion
 * (feature 51, spec FR-012, FR-015, FR-024; research R3).
 *
 * `openIndex` is the open question of the selected topic, or `null` when
 * all are closed. It starts at the first question (the entry state the
 * README draws, also what the prerendered HTML shows without scripts).
 *
 * `toggle(i)` is a visitor activating question `i` (pointer, Enter or
 * Space on its button): it opens `i`, closing any other, or closes `i` if
 * it was open. Only an open sends `faq_question_open` through the shared
 * bus, with the topic's locale-neutral id and the question's number; with
 * no consent nothing listens and nothing is sent (feature 49). `reset()`
 * is the automatic state (entry, a topic link, a topic switch): the first
 * question open, and never an event.
 */
export function useFaqAccordion(
  topic: Readonly<Ref<ResolvedFaqTopic | undefined>>
): {
  openIndex: Readonly<Ref<number | null>>
  toggle: (index: number) => void
  reset: () => void
} {
  const openIndex = ref<number | null>(0)

  function toggle(index: number) {
    if (openIndex.value === index) {
      openIndex.value = null
      return
    }
    openIndex.value = index
    reportOpen(index)
  }

  function reportOpen(index: number) {
    const question = topic.value?.questions[index]
    if (!topic.value || !question) return
    emitTrackingEvent({
      name: 'faq_question_open',
      params: {
        faq_topic: topic.value.trackingId,
        faq_question: question.number,
      },
    })
  }

  function reset() {
    openIndex.value = 0
  }

  return { openIndex: readonly(openIndex), toggle, reset }
}
