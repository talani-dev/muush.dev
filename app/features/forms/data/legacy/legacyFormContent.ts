import type {
  AreaId,
  ContactPreference,
} from '@/features/forms/data/applicationFields'
import type { IdentityOption } from '@/features/forms/data/contactFields'
import type { CountryOption } from '@/features/forms/data/countries'

/**
 * The v1 form content shapes, quarantined with the v1 form UI in
 * `ui/legacy/` (feature 45, research R1). Verbatim copies of the
 * `ContactFormContent` / `ApplicationFormContent` interfaces the v1
 * components were built against, renamed `Legacy*` so the final names in
 * `contactFields.ts` / `applicationFields.ts` describe the v2 forms.
 *
 * Only the quarantined components, their stories and their tests read these;
 * nothing renders them and nothing exports them. Feature 47 deletes this
 * file with the code it types.
 */
export interface LegacyContactFormFieldContent {
  label: string
  placeholder?: string
  errorRequired?: string
  errorFormat?: string
  errorLength?: string
  errorDigits?: string
  errorInvalid?: string
}

export interface LegacyContactFormContent {
  fields: {
    name: LegacyContactFormFieldContent
    email: LegacyContactFormFieldContent
    company: LegacyContactFormFieldContent
    identity: LegacyContactFormFieldContent & {
      options: Record<IdentityOption, string>
    }
    need: LegacyContactFormFieldContent
    contactPreference: LegacyContactFormFieldContent & {
      options: Record<ContactPreference, string>
    }
    whatsappCountry: {
      label: string
      errorInvalid: string
      options: CountryOption[]
    }
    whatsapp: LegacyContactFormFieldContent
  }
  submit: string
  sending: string
  success: { titleByChannel: Record<ContactPreference, string> }
  error: { title: string; fallback: string }
}

export interface LegacyApplicationFormFieldContent {
  label: string
  placeholder?: string
  errorRequired?: string
  errorFormat?: string
  errorSize?: string
  errorDigits?: string
  errorInvalid?: string
}

export interface LegacyApplicationFormContent {
  fields: {
    name: LegacyApplicationFormFieldContent
    email: LegacyApplicationFormFieldContent
    areaRole: LegacyApplicationFormFieldContent & {
      placeholder: string
      areas: Record<AreaId, string>
      roles: Record<AreaId, Record<string, string>>
    }
    portfolio: LegacyApplicationFormFieldContent
    linkedin: LegacyApplicationFormFieldContent
    cv: LegacyApplicationFormFieldContent & { placeholder: string }
    contactPreference: LegacyApplicationFormFieldContent & {
      options: Record<ContactPreference, string>
    }
    whatsappCountry: {
      label: string
      errorInvalid: string
      options: CountryOption[]
    }
    whatsapp: LegacyApplicationFormFieldContent
  }
  submit: string
  sending: string
  uploading: string
  success: { title: string }
  cvUploadError: { message: string; retry: string; submitWithoutCv: string }
  error: { title: string; fallback: string }
}
