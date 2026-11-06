/**
 * The forms module's only public API (Constitution Article III).
 *
 * Constitution Article I names this module explicitly: "the contact and
 * application forms, which appear on both pages". The home's
 * `landing/AssessmentSection.vue` and Nosotros' `about/WorkWithMuushSection.vue`
 * consume them through this barrel and nothing else.
 *
 * Since feature 45 `ContactForm` and `ApplicationForm` are the Muush 1.0
 * forms (the shared `SteppedForm` shell). The v1 form UI is quarantined in
 * `ui/legacy/` and is never exported from here; feature 47 deletes it. The
 * field parts stay internal — composition detail of the two forms.
 */

export type {
  ApplicationFieldId,
  ApplicationFormContent,
  ApplicationFormErrors,
  ApplicationFormFieldContent,
  ApplicationFormValues,
  AreaId,
  RoleCatalogEntry,
} from './data/applicationFields'
export type {
  ContactFieldId,
  ContactFormContent,
  ContactFormErrors,
  ContactFormFieldContent,
  ContactFormValues,
  ContactPreference,
  IdentityOption,
} from './data/contactFields'
export type {
  ApplicationSubmitter,
  ContactSubmitter,
  SubmissionOutcome,
} from './data/submissionContract'
export type {
  ApplicationSubmitState,
  UseApplicationFormReturn,
} from './logic/useApplicationForm'
export { useApplicationForm } from './logic/useApplicationForm'
export { useApplicationFormContent } from './logic/useApplicationFormContent'
export type {
  ContactSubmitState,
  UseContactFormReturn,
} from './logic/useContactForm'
export { useContactForm } from './logic/useContactForm'
export { useContactFormContent } from './logic/useContactFormContent'
export {
  useApplicationSubmitter,
  useContactSubmitter,
} from './logic/useFormSubmission'
export { default as ApplicationForm } from './ui/ApplicationForm.vue'
export { default as ContactForm } from './ui/ContactForm.vue'
