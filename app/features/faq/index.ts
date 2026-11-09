/**
 * The faq module's only public API (Constitution Article III; Article I
 * lists `faq` since amendment 2.1.5, feature 51).
 *
 * The Preguntas page: its block, its content seam and its head and
 * language-switch hooks. Topics data, the accordion, the tabs and their
 * parts stay internal.
 */

export type { ResolvedFaqContent } from './data/types'
export { useFaqContent } from './logic/useFaqContent'
export { useFaqLocaleSwitch, useFaqPageSeo } from './logic/useFaqPage'
export { default as FaqSection } from './ui/FaqSection.vue'
