import {
  type CountryCode,
  type CountryOption,
  DEFAULT_COUNTRY,
} from '@/features/forms/data/countries'
import type { FormChromeContent } from '@/features/forms/data/formChrome'

/**
 * The contact form's field model. Source of truth:
 * `docs/business/landing/ui-map.md` § 7.
 *
 * Plain types and named constants only — no Vue, no Nuxt, no validation
 * logic. `logic/useContactForm.ts` imports this; this file imports only
 * `countries.ts` and the type of `formChrome.ts`, sibling `data/` files
 * (Constitution Article II).
 */

export type ContactFieldId =
  | 'name'
  | 'email'
  | 'company'
  | 'identity'
  | 'website'
  | 'need'
  | 'contactPreference'
  | 'whatsappCountry'
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
  /**
   * "Tu sitio web o redes (opcional)": free text as typed (a site, a domain,
   * a handle), never required, never validated (feature 49, FR-060–FR-063).
   * Roberto's decision of 2026-11-07 supersedes "no se construye por ahora"
   * of `docs/business/muush-1.0.md` § 1. Sent trimmed as `website`, or left
   * out when empty (`logic/submissionPayloads.ts`).
   */
  website: string
  need: string
  contactPreference: ContactPreference
  /** The dial-code selector's country (feature 32). Never empty; kept when
   * the preference goes to email and back (spec OA-9), sent only as the
   * derived `whatsappDialCode` and only with WhatsApp. */
  whatsappCountry: CountryCode
  /** `''` unless `contactPreference === 'whatsapp'` (FR-010, FR-011). */
  whatsapp: string
}

export type ContactFormErrors = Partial<Record<ContactFieldId, string>>

/** The form's field order — the order errors are merged in, so "focus the
 * first invalid field" stays `Object.keys(errors)[0]` once server marks join
 * the client errors (feature 029, data-model § 4.1). */
export const CONTACT_FIELD_ORDER: readonly ContactFieldId[] = [
  'name',
  'email',
  'company',
  'identity',
  'website',
  'need',
  'contactPreference',
  'whatsappCountry',
  'whatsapp',
]

/** `docs/business/landing/ui-map.md` § 7: "Mínimo 2 caracteres". */
export const NAME_MIN_LENGTH = 2

/** `docs/business/landing/ui-map.md` § 7: "Mínimo 10 caracteres". */
export const NEED_MIN_LENGTH = 10

/**
 * The national number's length, dial code excluded, counted after removing
 * every non-digit: 6 to 14 digits. Agreed by Roberto with the backend on
 * 2026-10-14 (feature 32); supersedes the "10 dígitos para +52" rule of
 * `form-api-contract.md` § 3 and `ui-map.md` § 7 until those documents are
 * rewritten by a human (feature 32 spec OA-1).
 */
export const WHATSAPP_MIN_DIGITS = 6
export const WHATSAPP_MAX_DIGITS = 14

/**
 * The longest `website` the Form Submission API accepts, in Unicode code
 * points after trimming (`Array.from(value).length`), mirroring
 * `validateWebsite` of the API (muush-foundation `modules/form-submission-api/
 * src/shared/validation.js`, specs/049-consented-tracking/contracts/
 * contact-website.md). If the API rule changes, this changes with it.
 */
export const WEBSITE_MAX_CODE_POINTS = 300

/** Same-shape check as the native `type="email"` constraint (FR-008, spec
 * data-model.md § 1) — not RFC-complete, and not meant to be. */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * What `logic/`/`ui/` receive: already-translated field content, resolved by
 * `useContactFormContent` from `forms.contact.*`. Since feature 45 the v2
 * shape: the shared form chrome (`formChrome.ts`) plus the fields; the v1
 * shape lives on as `LegacyContactFormContent` in `data/legacy/`.
 */
export interface ContactFormFieldContent {
  label: string
  placeholder?: string
  errorRequired?: string
  errorFormat?: string
  errorLength?: string
  errorDigits?: string
  errorInvalid?: string
}

export interface ContactFormContent extends FormChromeContent {
  fields: {
    name: ContactFormFieldContent
    email: ContactFormFieldContent
    company: ContactFormFieldContent
    /** `placeholder` is required: the select's empty option shows it. */
    identity: ContactFormFieldContent & {
      placeholder: string
      options: Record<IdentityOption, string>
    }
    /** Label and placeholder only: the field has no error of its own. */
    website: ContactFormFieldContent
    need: ContactFormFieldContent
    contactPreference: ContactFormFieldContent & {
      options: Record<ContactPreference, string>
    }
    /** `label` is the selector's accessible name; `options` are already
     * localized and sorted (`logic/countryOptions.ts`). */
    whatsappCountry: {
      label: string
      errorInvalid: string
      options: CountryOption[]
    }
    whatsapp: ContactFormFieldContent
  }
}

export function initialContactFormValues(): ContactFormValues {
  return {
    name: '',
    email: '',
    company: '',
    identity: '',
    website: '',
    need: '',
    contactPreference: 'email',
    whatsappCountry: DEFAULT_COUNTRY,
    whatsapp: '',
  }
}
