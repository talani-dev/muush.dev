import { onScopeDispose, type Ref } from 'vue'
import { FAQ_TOPICS } from '@/features/faq/data/faqTopics'
import type { ResolvedFaqContent } from '@/features/faq/data/types'
import { useLocaleSwitchHash, usePageSeo } from '@/features/shell'
import { faqQuestionNodes } from './faqStructuredData'
import { counterpartAnchor } from './topicHash'

/**
 * The page's head (feature 51, spec FR-002, FR-003, D1, D4): the approved
 * meta title and description, and a `FAQPage` graph in both locales whose
 * `mainEntity` is the 20 questions of the page's own language. The
 * `defineQuestion` calls run only during prerender (`import.meta.server`,
 * the guard `usePageSeo` documents), so no schema-org code reaches the
 * client bundle.
 */
export function useFaqPageSeo(content: Readonly<Ref<ResolvedFaqContent>>) {
  usePageSeo({
    titleKey: 'pages.faq.title',
    descriptionKey: 'pages.faq.description',
    pageType: 'FAQPage',
    extraNodes: () =>
      import.meta.server
        ? faqQuestionNodes(content.value.topics).map(node =>
            defineQuestion(node)
          )
        : [],
  })
}

/**
 * Keeps the topic across the language switch (feature 51, spec FR-013,
 * OQ-6 = A): given the topic the URL names (`FaqSection`'s `topicNamed`),
 * it hands the language toggle the other locale's anchor for the same
 * topic, or none. Cleared when the page is left, so the toggle of every
 * other page is unchanged.
 */
export function useFaqLocaleSwitch(): (index: number | null) => void {
  const { locale } = useI18n()
  const switchHash = useLocaleSwitchHash()

  onScopeDispose(() => {
    switchHash.value = undefined
  })

  return index => {
    const other = locale.value === 'en' ? 'es' : 'en'
    switchHash.value = counterpartAnchor(
      index,
      FAQ_TOPICS.map(topic => topic.anchor[other])
    )
  }
}
