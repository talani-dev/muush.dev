import type {
  ClickTrackingEvent,
  FaqTopicId,
  TrackAttrs,
} from '@/shared/data/trackingEvents'

/**
 * The Preguntas content model (feature 51, data-model §§ 2–3).
 *
 * The `Faq*` shapes hold i18n **keys** and destination **descriptors**,
 * never copy or a resolved path: `logic/` turns them into the `Resolved*`
 * view model `ui/` renders. Nothing here imports from `logic/` or `ui/`
 * (Constitution Article II).
 */

/** The two locales; each topic has its own anchor in each. */
export type FaqLocale = 'es' | 'en'

/** A placeholder an answer names for an inline link (`{privacy}`). */
export type FaqLinkPlaceholder = 'privacy' | 'about'

/** The placeholder an answer or the card text names for the address. */
export const FAQ_EMAIL_PLACEHOLDER = 'email'

/**
 * Where an inline link goes, by route name (Constitution Article VI): the
 * privacy notice, or the About page's "Trabaja con muush" section.
 */
export type FaqLinkDestination =
  | { name: 'privacy' }
  | { name: 'about'; anchor: string }

export interface FaqLink {
  placeholder: FaqLinkPlaceholder
  /** i18n key of the link text, which the answer shows verbatim. */
  labelKey: string
  destination: FaqLinkDestination
}

export interface FaqQuestion {
  questionKey: string
  answerKey: string
  links?: readonly FaqLink[]
  /** The answer names `{email}`: `support@muush.dev` as a mail link. */
  email?: true
}

export interface FaqTopic {
  key: 't1' | 't2' | 't3' | 't4' | 't5'
  /** "01"…"05", drawn before the topic name. */
  number: string
  /** The topic's URL fragment in each locale (`#precios`, `#pricing`). */
  anchor: Readonly<Record<FaqLocale, string>>
  /** Locale-neutral id the question-open event reports (spec D6). */
  trackingId: FaqTopicId
  titleKey: string
  questions: readonly FaqQuestion[]
}

export interface FaqCard {
  titleKey: string
  /** Names `{email}`, the address as a mail link. */
  textKey: string
  buttonKey: string
  /** The call-booking page, opened in a new tab. */
  href: string
  track: ClickTrackingEvent
}

/** A run of an answer (or of the card text) as `ui/` renders it. */
export type FaqTextSegment =
  | { kind: 'text'; text: string }
  | { kind: 'link'; text: string; href: string }
  | { kind: 'email'; text: string; href: string; trackAttrs: TrackAttrs }

export interface ResolvedFaqQuestion {
  /** DOM id stem of the question's button and answer region. */
  id: string
  /** 1–20, its position across the five topics (spec D6). */
  number: number
  question: string
  /** The answer as segments: plain text, inline links, the mail link. */
  answer: readonly FaqTextSegment[]
  /** The answer as plain text: link texts and the address inline. */
  answerText: string
}

export interface ResolvedFaqTopic {
  /** The topic's anchor in the active locale. */
  anchor: string
  trackingId: FaqTopicId
  number: string
  title: string
  questions: readonly ResolvedFaqQuestion[]
}

export interface ResolvedFaqCard {
  title: string
  text: readonly FaqTextSegment[]
  button: { label: string; href: string; trackAttrs: TrackAttrs }
}

/** Everything `FaqSection` renders, resolved for the active locale. */
export interface ResolvedFaqContent {
  pill: string
  heading: { first: string; second: string }
  subtitle: string
  tabsLabel: string
  topics: readonly ResolvedFaqTopic[]
  card: ResolvedFaqCard
}
