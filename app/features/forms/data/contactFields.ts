/**
 * The contact form's field model. Source of truth:
 * `docs/business/landing/ui-map.md` § 7.
 *
 * Plain types and named constants only — no Vue, no Nuxt, no validation
 * logic. `logic/useContactForm.ts` imports this; this file imports nothing
 * (Constitution Article II).
 */

export type ContactFieldId =
  | 'name'
  | 'email'
  | 'company'
  | 'identity'
  | 'need'
  | 'contactPreference'
  | 'whatsapp'

/**
 * The six real options, given verbatim by Roberto (feature 24, 2026-09-08),
 * in this exact order — supersedes the previous five-option set from
 * `docs/business/landing/content.md`.
 *
 * `realEstate` is the one genuinely new option ("Bienes raíces/inmobiliaria")
 * — still distinct from the `.pen`'s undocumented "Restaurante o bar", which
 * remains unapproved copy and still does not appear here. The other five
 * keys are unchanged: only `creator` and `company`'s rendered text changed,
 * `independent`/`startup`/`other` are untouched (spec A-02 is superseded by
 * this direct instruction, not silently contradicted).
 */
export type IdentityOption =
  | 'realEstate'
  | 'creator'
  | 'company'
  | 'independent'
  | 'startup'
  | 'other'

export const IDENTITY_OPTIONS: IdentityOption[] = [
  'realEstate',
  'creator',
  'company',
  'independent',
  'startup',
  'other',
]

export type ContactPreference = 'email' | 'whatsapp'

/**
 * Field order also fixes the "focus first invalid field" order
 * (`data-model.md` § 2): `Object.keys(errors)` walks a plain object in
 * insertion order, so building the values (and the errors they can produce)
 * in this exact order is what makes that rule free rather than a second
 * sort step.
 */
export interface ContactFormValues {
  name: string
  email: string
  company: string
  identity: IdentityOption | ''
  need: string
  contactPreference: ContactPreference
  /** `''` unless `contactPreference === 'whatsapp'` (FR-010, FR-011). */
  whatsapp: string
}

export type ContactFormErrors = Partial<Record<ContactFieldId, string>>

/** `docs/business/landing/ui-map.md` § 7: "Mínimo 2 caracteres". */
export const NAME_MIN_LENGTH = 2

/** `docs/business/landing/ui-map.md` § 7: "Mínimo 10 caracteres". */
export const NEED_MIN_LENGTH = 10

/**
 * `docs/business/landing/ui-map.md` § 7: "10 dígitos para +52, default
 * México" (spec A-03 — no other country is offered in this feature).
 */
export const WHATSAPP_MX_DIGIT_COUNT = 10

/** Same-shape check as the native `type="email"` constraint (FR-008, spec
 * data-model.md § 1) — not RFC-complete, and not meant to be. */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * What `logic/`/`ui/` receive: already-translated field content, resolved by
 * whichever module composes `ContactForm` (`landing` for this feature,
 * `about` for feature 20's application form — same field vocabulary, a
 * sibling i18n namespace, per plan.md D-1/D-4).
 */
export interface ContactFormFieldContent {
  label: string
  placeholder?: string
  errorRequired?: string
  errorFormat?: string
  errorLength?: string
  errorDigits?: string
}

export interface ContactFormContent {
  fields: {
    name: ContactFormFieldContent
    email: ContactFormFieldContent
    company: ContactFormFieldContent
    identity: ContactFormFieldContent & {
      options: Record<IdentityOption, string>
    }
    need: ContactFormFieldContent
    contactPreference: ContactFormFieldContent & {
      options: Record<ContactPreference, string>
    }
    whatsapp: ContactFormFieldContent
  }
  submit: string
  /** Story-only copy — the shipped page never reaches this state (FR-014). */
  sending: string
  success: { title: string }
  error: { title: string; fallback: string }
}

export function initialContactFormValues(): ContactFormValues {
  return {
    name: '',
    email: '',
    company: '',
    identity: '',
    need: '',
    contactPreference: 'email',
    whatsapp: '',
  }
}
