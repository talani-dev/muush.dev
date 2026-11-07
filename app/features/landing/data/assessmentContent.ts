/**
 * "Diagnóstico y contacto" content model (feature 45, data-model §§ 3–4;
 * copy in `docs/business/muush-1.0.md` § 4.6). Chrome only: the form's own
 * copy is `forms/`'s (`useContactFormContent`); this file names no
 * `forms.*` key.
 *
 * "Lo que recibes" is stored in sentence case and drawn uppercase by the
 * list (Roberto 2026-11-02).
 */
import type { ClickTrackingEvent } from '@/shared/data/trackingEvents'

/** What "¿Prefieres hablar? Agenda una llamada" reports (feature 49). */
export const ASSESSMENT_CALL_TRACK: ClickTrackingEvent = {
  name: 'book_call_click',
  params: { cta_location: 'assessment' },
}

export type ReceivesKey = 'review' | 'first' | 'deeper'

export const RECEIVES_ORDER: readonly ReceivesKey[] = [
  'review',
  'first',
  'deeper',
]

export const ASSESSMENT_KEYS = {
  pill: 'landing.assessment.pill',
  headingFirst: 'landing.assessment.headingFirst',
  headingSecond: 'landing.assessment.headingSecond',
  body: 'landing.assessment.body',
  receivesLabel: 'landing.assessment.receivesLabel',
  receives: (key: ReceivesKey) => `landing.assessment.receives.${key}`,
  callQuestion: 'landing.assessment.callQuestion',
  callLink: 'landing.assessment.callLink',
} as const

export interface AssessmentContent {
  pill: string
  headingFirst: string
  headingSecond: string
  body: string
  receivesLabel: string
  receives: readonly string[]
  callQuestion: string
  callLink: string
  /** The call-booking page: a destination, not copy. */
  callHref: string
}
