import { CALL_BOOKING_URL } from '@/shared/data/callBooking'
import { SECTION_ANCHORS } from '@/shared/data/sectionAnchors'
import type { ShellItem } from './types'

/**
 * The Preguntas page's content model (feature 46, spec FR-033…FR-038,
 * data-model § 3; pen extract-46 § 3; copy `muush-1.0.md` § 4.9).
 *
 * "En construcción 🚧" with the two ways forward the home hero offers: the
 * free assessment and booking a call. It lives in the shell beside the 404
 * because it is built only from the shell's vocabulary (route names, the
 * `diagnostico` anchor, the call-booking URL, the resolver), the reason spec
 * 036 R5 gave for the 404 (research R1). When it gets real questions it
 * becomes its own module, which needs an Article I amendment.
 *
 * Keys and destination descriptors only; `logic/` resolves both.
 */

/** "Diagnóstico gratis": the same-locale home's diagnóstico section. */
export const FAQ_PRIMARY: ShellItem = {
  labelKey: 'shell.faq.assessment',
  destination: {
    kind: 'anchor',
    name: 'index',
    anchor: SECTION_ANCHORS.assessment,
  },
  track: { name: 'assessment_cta_click', params: { cta_location: 'faq' } },
}

/** "Agenda una llamada": the shared call-booking page, in a new tab. */
export const FAQ_SECONDARY: ShellItem = {
  labelKey: 'shell.faq.call',
  destination: { kind: 'external', href: CALL_BOOKING_URL },
  track: { name: 'book_call_click', params: { cta_location: 'faq' } },
}

export const FAQ_COPY_KEYS = {
  title: 'shell.faq.title',
} as const
