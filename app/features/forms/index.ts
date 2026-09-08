/**
 * The forms module's only public API (Constitution Article III).
 *
 * Constitution Article I names this module explicitly: "the contact and
 * application forms, which appear on both pages". `landing/ContactSection.vue`
 * is its first consumer; a future feature 20 (`work_with_muush_section`)
 * reuses the same field vocabulary through this same barrel.
 *
 * The five field primitives (`TextField`, `SelectField`, `TextareaField`,
 * `RadioPillGroup`) stay internal — composition detail of `ContactForm`,
 * matching how the shell keeps `MobileMenu` unexported.
 */

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
  ContactSubmitState,
  UseContactFormReturn,
} from './logic/useContactForm'
export { useContactForm } from './logic/useContactForm'
export { useContactFormContent } from './logic/useContactFormContent'
export { default as ContactForm } from './ui/ContactForm.vue'
