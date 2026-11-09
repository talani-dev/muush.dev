import type { ResolvedFaqTopic } from '@/features/faq/data/types'

/**
 * The input of one schema.org `Question` node (`defineQuestion`). A type
 * alias, not an interface: the definer's input type has an index
 * signature, which an interface is never implicitly assignable to.
 */
export type FaqQuestionNodeInput = {
  name: string
  acceptedAnswer: { text: string }
}

/**
 * The 20 questions of the page, in page order, as the inputs of the
 * `Question` nodes of its `FAQPage` graph (feature 51, spec D1, FR-003;
 * data-model § 5). Built from the same resolved copy the page renders, so
 * the structured data can never disagree with it: the answer is its plain
 * text, inline links as their link text and the address written out.
 * Pure; `useFaqPageSeo` wraps each one with `defineQuestion` at prerender.
 */
export function faqQuestionNodes(
  topics: readonly ResolvedFaqTopic[]
): FaqQuestionNodeInput[] {
  return topics.flatMap(topic =>
    topic.questions.map(question => ({
      name: question.question,
      acceptedAnswer: { text: question.answerText },
    }))
  )
}
