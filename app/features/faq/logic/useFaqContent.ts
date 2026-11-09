import { type ComputedRef, computed } from 'vue'
import {
  FAQ_CARD,
  FAQ_COPY_KEYS,
  FAQ_EMAIL_TRACK,
  FAQ_TOPICS,
} from '@/features/faq/data/faqTopics'
import {
  FAQ_EMAIL_PLACEHOLDER,
  type FaqLink,
  type FaqLinkDestination,
  type FaqLocale,
  type FaqQuestion,
  type FaqTextSegment,
  type FaqTopic,
  type ResolvedFaqCard,
  type ResolvedFaqContent,
  type ResolvedFaqQuestion,
  type ResolvedFaqTopic,
} from '@/features/faq/data/types'
import { SUPPORT_EMAIL } from '@/shared/data/supportEmail'
import { trackAttrs } from '@/shared/data/trackingEvents'
import { faqPlainText, faqTextSegments, keepPlaceholders } from './faqSegments'

/** What resolution needs from Nuxt, and nothing else (unit-testable). */
export interface FaqContentDeps {
  t: (key: string, params?: Record<string, string>) => string
  localePath: (route: { name: string; hash?: string }) => string
  locale: FaqLocale
}

/** The DOM id stem of every tab, panel and question of the page. */
export const FAQ_ID_PREFIX = 'faq'

const PLACEHOLDERS = keepPlaceholders([
  'privacy',
  'about',
  FAQ_EMAIL_PLACEHOLDER,
])

/** `support@muush.dev` as a tracked mail link (spec FR-007, FR-023). */
const EMAIL_SEGMENT: FaqTextSegment = {
  kind: 'email',
  text: SUPPORT_EMAIL,
  href: `mailto:${SUPPORT_EMAIL}`,
  trackAttrs: trackAttrs(FAQ_EMAIL_TRACK),
}

function linkHref(
  destination: FaqLinkDestination,
  { localePath }: FaqContentDeps
): string {
  if (destination.name === 'about') {
    return localePath({ name: 'about', hash: `#${destination.anchor}` })
  }
  return localePath({ name: destination.name })
}

function linkSegment(link: FaqLink, deps: FaqContentDeps): FaqTextSegment {
  return {
    kind: 'link',
    text: deps.t(link.labelKey),
    href: linkHref(link.destination, deps),
  }
}

/** A translated string with its links and address as segments. */
function segmentsOf(
  key: string,
  links: readonly FaqLink[],
  withEmail: boolean,
  deps: FaqContentDeps
): FaqTextSegment[] {
  const parts: Record<string, FaqTextSegment> = Object.fromEntries(
    links.map(link => [link.placeholder, linkSegment(link, deps)])
  )
  if (withEmail) parts[FAQ_EMAIL_PLACEHOLDER] = EMAIL_SEGMENT
  return faqTextSegments(deps.t(key, PLACEHOLDERS), parts)
}

function resolveQuestion(
  question: FaqQuestion,
  topic: FaqTopic,
  number: number,
  deps: FaqContentDeps
): ResolvedFaqQuestion {
  const answer = segmentsOf(
    question.answerKey,
    question.links ?? [],
    Boolean(question.email),
    deps
  )
  return {
    id: `${FAQ_ID_PREFIX}-${topic.key}-q${number}`,
    number,
    question: deps.t(question.questionKey),
    answer,
    answerText: faqPlainText(answer),
  }
}

/** The five topics, each question numbered 1–20 across the page. */
export function resolveFaqTopics(deps: FaqContentDeps): ResolvedFaqTopic[] {
  let number = 0
  return FAQ_TOPICS.map(topic => ({
    anchor: topic.anchor[deps.locale],
    trackingId: topic.trackingId,
    number: topic.number,
    title: deps.t(topic.titleKey),
    questions: topic.questions.map(question => {
      number += 1
      return resolveQuestion(question, topic, number, deps)
    }),
  }))
}

function resolveCard(deps: FaqContentDeps): ResolvedFaqCard {
  return {
    title: deps.t(FAQ_CARD.titleKey),
    text: segmentsOf(FAQ_CARD.textKey, [], true, deps),
    button: {
      label: deps.t(FAQ_CARD.buttonKey),
      href: FAQ_CARD.href,
      trackAttrs: trackAttrs(FAQ_CARD.track),
    },
  }
}

/** Everything the page block renders, pure: the caller passes Nuxt in. */
export function resolveFaqContent(deps: FaqContentDeps): ResolvedFaqContent {
  return {
    pill: deps.t(FAQ_COPY_KEYS.pill),
    heading: {
      first: deps.t(FAQ_COPY_KEYS.headingFirst),
      second: deps.t(FAQ_COPY_KEYS.headingSecond),
    },
    subtitle: deps.t(FAQ_COPY_KEYS.subtitle),
    tabsLabel: deps.t(FAQ_COPY_KEYS.tabsLabel),
    topics: resolveFaqTopics(deps),
    card: resolveCard(deps),
  }
}

/**
 * The Preguntas page for the active locale (feature 51, data-model § 3):
 * copy from the locale files, inline links through the i18n route map
 * (never a written path, Constitution Article VI), the address and the
 * booking URL from `app/shared/data/`.
 */
export function useFaqContent(): ComputedRef<ResolvedFaqContent> {
  const { t, locale } = useI18n()
  const localePath = useLocalePath()

  return computed(() =>
    resolveFaqContent({
      t: (key, params) => (params ? t(key, params) : t(key)),
      localePath: route => localePath(route),
      locale: locale.value === 'en' ? 'en' : 'es',
    })
  )
}
