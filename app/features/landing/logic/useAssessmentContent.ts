import { type ComputedRef, computed } from 'vue'
import {
  ASSESSMENT_KEYS,
  type AssessmentContent,
  RECEIVES_ORDER,
} from '@/features/landing/data/assessmentContent'
import { CALL_BOOKING_URL } from '@/shared/data/callBooking'

/**
 * "Diagnóstico y contacto"'s seam with the Nuxt runtime (feature 45,
 * data-model § 3): the only place its keys meet `useI18n`. Imports nothing
 * from `forms/` (Article III); the page resolves the form's content itself.
 */
export function useAssessmentContent(): ComputedRef<AssessmentContent> {
  const { t } = useI18n()

  return computed<AssessmentContent>(() => ({
    pill: t(ASSESSMENT_KEYS.pill),
    headingFirst: t(ASSESSMENT_KEYS.headingFirst),
    headingSecond: t(ASSESSMENT_KEYS.headingSecond),
    body: t(ASSESSMENT_KEYS.body),
    receivesLabel: t(ASSESSMENT_KEYS.receivesLabel),
    receives: RECEIVES_ORDER.map(key => t(ASSESSMENT_KEYS.receives(key))),
    callQuestion: t(ASSESSMENT_KEYS.callQuestion),
    callLink: t(ASSESSMENT_KEYS.callLink),
    callHref: CALL_BOOKING_URL,
  }))
}
