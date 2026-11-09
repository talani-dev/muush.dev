import { describe, expect, it } from 'vitest'
import type { ResolvedFaqTopic } from '@/features/faq/data/types'
import { faqQuestionNodes } from './faqStructuredData'

/** Feature 51 · spec D1, FR-003; data-model § 5. */
const TOPICS: ResolvedFaqTopic[] = [
  {
    anchor: 'entrega',
    trackingId: 'delivery',
    number: '04',
    title: 'Entrega',
    questions: [
      {
        id: 'faq-t4-q17',
        number: 17,
        question: '¿Firman acuerdo de confidencialidad?',
        answer: [
          { kind: 'text', text: 'Como lo explica nuestro ' },
          { kind: 'link', text: 'Aviso de privacidad', href: '/es/privacidad' },
          { kind: 'text', text: '.' },
        ],
        answerText: 'Como lo explica nuestro Aviso de privacidad.',
      },
    ],
  },
  {
    anchor: 'trabaja-con-muush',
    trackingId: 'work_with_muush',
    number: '05',
    title: 'Trabaja con muush',
    questions: [
      {
        id: 'faq-t5-q19',
        number: 19,
        question: '¿Cuándo me van a contactar?',
        answer: [{ kind: 'text', text: 'Escríbenos.' }],
        answerText: 'Escríbenos.',
      },
    ],
  },
]

describe('faqQuestionNodes', () => {
  it('should give one question node per question in page order when built', () => {
    expect(faqQuestionNodes(TOPICS)).toEqual([
      {
        name: '¿Firman acuerdo de confidencialidad?',
        acceptedAnswer: {
          text: 'Como lo explica nuestro Aviso de privacidad.',
        },
      },
      {
        name: '¿Cuándo me van a contactar?',
        acceptedAnswer: { text: 'Escríbenos.' },
      },
    ])
  })

  it('should give no node when there are no topics', () => {
    expect(faqQuestionNodes([])).toEqual([])
  })
})
