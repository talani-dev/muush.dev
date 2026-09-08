/**
 * The forms module's only public API (Constitution Article III).
 *
 * Constitution Article I names this module explicitly: "the contact and
 * application forms, which appear on both pages". `landing/ContactSection.vue`
 * was its first consumer; `about/WorkWithMuushSection.vue` (feature 20) is
 * its second, through this same barrel and nothing else.
 *
 * The field primitives (`TextField`, `SelectField`, `TextareaField`,
 * `RadioPillGroup`, `FileField`) stay internal — composition detail of
 * `ContactForm`/`ApplicationForm`, matching how the shell keeps `MobileMenu`
 * unexported.
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
export { default as ApplicationForm } from './ui/ApplicationForm.vue'
export { default as ContactForm } from './ui/ContactForm.vue'
