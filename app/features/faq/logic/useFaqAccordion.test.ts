import { afterEach, describe, expect, it } from 'vitest'
import { ref } from 'vue'
import type { ResolvedFaqTopic } from '@/features/faq/data/types'
import type { TrackingEvent } from '@/shared/data/trackingEvents'
import { onTrackingEvent, resetTrackingBus } from '@/shared/logic/trackingBus'
import { useFaqAccordion } from './useFaqAccordion'

/** Feature 51 · spec FR-015, FR-024 (open only, never automatic). */
function topicWith(
  trackingId: ResolvedFaqTopic['trackingId'],
  numbers: number[]
): ResolvedFaqTopic {
  return {
    anchor: 'x',
    trackingId,
    number: '05',
    title: 'Trabaja con muush',
    questions: numbers.map(number => ({
      id: `q${number}`,
      number,
      question: `Pregunta ${number}`,
      answer: [{ kind: 'text', text: 'Respuesta' }],
      answerText: 'Respuesta',
    })),
  }
}

function listen() {
  const events: TrackingEvent[] = []
  onTrackingEvent(event => events.push(event))
  return events
}

afterEach(() => resetTrackingBus())

describe('useFaqAccordion', () => {
  it('should start with the first question open and send nothing when created', () => {
    const events = listen()
    const { openIndex } = useFaqAccordion(ref(topicWith('pricing', [6, 7])))

    expect(openIndex.value).toBe(0)
    expect(events).toEqual([])
  })

  it('should open one question and close the other when a closed one is toggled', () => {
    const { openIndex, toggle } = useFaqAccordion(
      ref(topicWith('pricing', [6, 7, 8]))
    )

    toggle(2)

    expect(openIndex.value).toBe(2)
  })

  it('should send one faq_question_open with the topic and number when a question opens', () => {
    const events = listen()
    const { toggle } = useFaqAccordion(
      ref(topicWith('work_with_muush', [18, 19, 20]))
    )

    toggle(1)

    expect(events).toEqual([
      {
        name: 'faq_question_open',
        params: { faq_topic: 'work_with_muush', faq_question: 19 },
      },
    ])
  })

  it('should close it and send nothing when the open question is toggled', () => {
    const events = listen()
    const { openIndex, toggle } = useFaqAccordion(
      ref(topicWith('pricing', [6, 7]))
    )

    toggle(0)

    expect(openIndex.value).toBeNull()
    expect(events).toEqual([])
  })

  it('should send two events when the same question is opened, closed and opened again', () => {
    const events = listen()
    const { toggle } = useFaqAccordion(ref(topicWith('process', [11, 12])))

    toggle(1)
    toggle(1)
    toggle(1)

    expect(events.map(event => event.params)).toEqual([
      { faq_topic: 'process', faq_question: 12 },
      { faq_topic: 'process', faq_question: 12 },
    ])
  })

  it('should reopen the first question and send nothing when reset', () => {
    const events = listen()
    const { openIndex, toggle, reset } = useFaqAccordion(
      ref(topicWith('delivery', [15, 16, 17]))
    )
    toggle(0)
    events.length = 0

    reset()

    expect(openIndex.value).toBe(0)
    expect(events).toEqual([])
  })

  it('should report only fixed ids and a number when it sends', () => {
    const events = listen()
    const { toggle } = useFaqAccordion(ref(topicWith('assessment', [1, 2])))

    toggle(1)

    const params = (events[0]?.params ?? {}) as Record<string, unknown>
    expect(Object.keys(params).sort()).toEqual(['faq_question', 'faq_topic'])
    expect(typeof params.faq_question).toBe('number')
  })
})
