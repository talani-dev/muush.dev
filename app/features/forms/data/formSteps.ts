import type { ApplicationFieldId } from '@/features/forms/data/applicationFields'
import type { ContactFieldId } from '@/features/forms/data/contactFields'

/**
 * Which fields each form shows in each of its two mobile steps (feature 45,
 * spec FR-003; pen extract-45 §§ 4–5; data-model § 1).
 *
 * Step 1 is the same for both forms: Nombre, Correo and the contact channel
 * (the WhatsApp country and number belong with it). Step 2 is the form's own
 * fields; the privacy checkbox also sits there but is not a field id, since
 * it is never a form value (spec FR-010).
 *
 * The two lists of a form partition its `*_FIELD_ORDER` exactly
 * (`formSteps.test.ts`), so every error belongs to exactly one step.
 */

/** Below 768 px the form is two steps (the handoff's `max-width: 767px`,
 * spec FR-002). Forms-only, so it is not in `shared/data/layout.ts`. */
export const FORM_STEPS_MEDIA_QUERY = '(max-width: 47.9375rem)'

export type FormStep = 1 | 2

export const FORM_STEP_COUNT = 2

export type StepFields<F extends string> = Readonly<
  Record<FormStep, readonly F[]>
>

export const CONTACT_STEP_FIELDS = {
  1: ['name', 'email', 'contactPreference', 'whatsappCountry', 'whatsapp'],
  /* `website` (feature 49): step 2, between ¿Cómo te identificas? and ¿Qué
     necesitas?, the `.pen`'s position (leader extract, 2026-11-07). */
  2: ['company', 'identity', 'website', 'need'],
} as const satisfies StepFields<ContactFieldId>

export const APPLICATION_STEP_FIELDS = {
  1: ['name', 'email', 'contactPreference', 'whatsappCountry', 'whatsapp'],
  2: ['portfolio', 'areaRole', 'linkedin', 'cv'],
} as const satisfies StepFields<ApplicationFieldId>
