import { CALL_BOOKING_URL } from '@/shared/data/callBooking'
import { SECTION_ANCHORS } from '@/shared/data/sectionAnchors'
import type { ClickTrackingEvent } from '@/shared/data/trackingEvents'
import type { FaqCard, FaqLink, FaqQuestion, FaqTopic } from './types'

/**
 * The five topics and twenty questions of Preguntas, in page order
 * (feature 51, data-model § 2; copy in `i18n/locales/*.json` under `faq.*`,
 * verbatim from the handoff `preguntas-muush-1.0` JSON, approved by Roberto
 * and Clau 2026-11-08).
 *
 * Anchors are the handoff's topic `id`s, one per locale, used as the URL
 * fragment that selects a topic (`/es/preguntas#precios`,
 * `/en/faq#pricing`). Tracking ids are locale-neutral (spec D6). A
 * question's number (1–20, the `faq_question` parameter) is its position
 * across the topics, so it is derived, never written.
 */

const TOPIC_KEY = 'faq.topics'

/** "Aviso de privacidad" / "Privacy notice", in the confidentiality answer. */
const PRIVACY_LINK: FaqLink = {
  placeholder: 'privacy',
  labelKey: 'faq.links.privacy',
  destination: { name: 'privacy' },
}

/** "Nosotros" / "About", in the talent-pool answer: its join section. */
const ABOUT_LINK: FaqLink = {
  placeholder: 'about',
  labelKey: 'faq.links.about',
  destination: { name: 'about', anchor: SECTION_ANCHORS.workWithUs },
}

/** The question `q<n>` of topic `t`, with its optional link or address. */
function question(
  topic: FaqTopic['key'],
  index: number,
  extra: Pick<FaqQuestion, 'links' | 'email'> = {}
): FaqQuestion {
  const base = `${TOPIC_KEY}.${topic}.questions.q${index}`
  return {
    questionKey: `${base}.question`,
    answerKey: `${base}.answer`,
    ...extra,
  }
}

/** Questions 1…`count` of topic `t`, with extras keyed by their index. */
function questions(
  topic: FaqTopic['key'],
  count: number,
  extras: Record<number, Pick<FaqQuestion, 'links' | 'email'>> = {}
): FaqQuestion[] {
  return Array.from({ length: count }, (_, offset) =>
    question(topic, offset + 1, extras[offset + 1])
  )
}

export const FAQ_TOPICS: readonly FaqTopic[] = [
  {
    key: 't1',
    number: '01',
    anchor: { es: 'diagnostico', en: 'assessment' },
    trackingId: 'assessment',
    titleKey: `${TOPIC_KEY}.t1.title`,
    questions: questions('t1', 5),
  },
  {
    key: 't2',
    number: '02',
    anchor: { es: 'precios', en: 'pricing' },
    trackingId: 'pricing',
    titleKey: `${TOPIC_KEY}.t2.title`,
    questions: questions('t2', 5),
  },
  {
    key: 't3',
    number: '03',
    anchor: { es: 'proceso', en: 'process' },
    trackingId: 'process',
    titleKey: `${TOPIC_KEY}.t3.title`,
    questions: questions('t3', 4),
  },
  {
    key: 't4',
    number: '04',
    anchor: { es: 'entrega', en: 'delivery' },
    trackingId: 'delivery',
    titleKey: `${TOPIC_KEY}.t4.title`,
    questions: questions('t4', 3, { 3: { links: [PRIVACY_LINK] } }),
  },
  {
    key: 't5',
    number: '05',
    anchor: { es: 'trabaja-con-muush', en: 'work-with-muush' },
    trackingId: 'work_with_muush',
    titleKey: `${TOPIC_KEY}.t5.title`,
    /* q2 is question 19, "¿Cuándo me van a contactar?". */
    questions: questions('t5', 3, {
      1: { links: [ABOUT_LINK] },
      2: { email: true },
    }),
  },
]

/** What the two mail links report (card and question 19, spec FR-023). */
export const FAQ_EMAIL_TRACK: ClickTrackingEvent = {
  name: 'contact_click',
  params: { channel: 'email', cta_location: 'faq' },
}

/** "¿Tienes otra pregunta?": one booking button, no "Diagnóstico gratis". */
export const FAQ_CARD: FaqCard = {
  titleKey: 'faq.card.title',
  textKey: 'faq.card.text',
  buttonKey: 'faq.card.button',
  href: CALL_BOOKING_URL,
  track: { name: 'book_call_click', params: { cta_location: 'faq' } },
}

/** The page header's keys. */
export const FAQ_COPY_KEYS = {
  pill: 'faq.pill',
  headingFirst: 'faq.heading.first',
  headingSecond: 'faq.heading.second',
  subtitle: 'faq.subtitle',
  tabsLabel: 'faq.tabsLabel',
} as const
