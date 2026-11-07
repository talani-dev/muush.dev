import {
  type ApplicationFormValues,
  ROLE_CATALOG,
  type RoleId,
} from '@/features/forms/data/applicationFields'
import {
  type ContactFormValues,
  WEBSITE_MAX_CODE_POINTS,
} from '@/features/forms/data/contactFields'
import type {
  CareersPayload,
  ContactPayload,
  SiteLocale,
} from '@/features/forms/data/submissionContract'
import { dialCodeOf } from './countryOptions'

/**
 * Form values → contract-exact JSON bodies (form-api-contract.md §§ 3, 5,
 * plus feature 32's `whatsappDialCode`, derived from the stored country).
 *
 * Built key by key from the values, never from the `<form>` element, so
 * nothing the DOM holds — the honeypot, a Turnstile hidden input, the file —
 * can leak into a request. The server rejects unknown keys (§ 6), which is
 * why optional keys are left out rather than sent empty, `company` being the
 * one key the contract says to send as `""`. Feature 49's `website` follows
 * the rule: trimmed, and absent when empty.
 *
 * Pure: no Vue, no Nuxt, no network. Throws only on a programming error the
 * client validation already rules out; the flows turn that into `failure`.
 */

const DIGITS_ONLY = /\D/g

/**
 * Every `${area}:${roleId}` value the "Área y rol" select can emit, mapped to
 * its role id. The select needs the qualified value (`sales` is both an area
 * and a role, research R7); the API accepts only the role id.
 */
const ROLE_ID_BY_OPTION_VALUE: ReadonlyMap<string, RoleId> = new Map(
  ROLE_CATALOG.flatMap(({ area, roleIds }) =>
    roleIds.map(roleId => [`${area}:${roleId}`, roleId] as const)
  )
)

export function toRoleId(optionValue: string): RoleId {
  const roleId = ROLE_ID_BY_OPTION_VALUE.get(optionValue)
  if (!roleId) {
    throw new Error(`Unknown areaRole option: "${optionValue}"`)
  }
  return roleId
}

/** The WhatsApp number as the API and Meta take it: digits only. */
export function whatsappDigits(raw: string): string {
  return raw.replaceAll(DIGITS_ONLY, '')
}

/**
 * `{ website }` trimmed, or nothing when it is empty (feature 49, FR-063).
 * Over `WEBSITE_MAX_CODE_POINTS` code points it throws: unreachable through
 * the input, whose `maxlength` counts UTF-16 units and so never lets more
 * code points through; `submitContactFlow` turns the throw into `failure`
 * before any request (FR-064).
 */
function websiteEntry(raw: string): { website?: string } {
  const website = raw.trim()
  if (website === '') return {}
  if (Array.from(website).length > WEBSITE_MAX_CODE_POINTS) {
    throw new Error('website is longer than the API accepts')
  }
  return { website }
}

export function buildContactPayload(
  values: ContactFormValues,
  locale: SiteLocale,
  turnstileToken: string
): ContactPayload {
  if (values.identity === '') {
    throw new Error('identity is empty; client validation should block this')
  }

  return {
    name: values.name.trim(),
    email: values.email.trim(),
    company: values.company.trim(),
    identity: values.identity,
    ...websiteEntry(values.website),
    need: values.need.trim(),
    contactPreference: values.contactPreference,
    ...(values.contactPreference === 'whatsapp' && {
      whatsappDialCode: dialCodeOf(values.whatsappCountry),
      whatsapp: whatsappDigits(values.whatsapp),
    }),
    locale,
    turnstileToken,
  }
}

export function buildCareersPayload(
  values: ApplicationFormValues,
  locale: SiteLocale,
  turnstileToken: string,
  cvId?: string
): CareersPayload {
  const portfolio = values.portfolio.trim()
  const linkedin = values.linkedin.trim()

  return {
    name: values.name.trim(),
    email: values.email.trim(),
    areaRole: toRoleId(values.areaRole),
    ...(portfolio !== '' && { portfolio }),
    ...(linkedin !== '' && { linkedin }),
    contactPreference: values.contactPreference,
    ...(values.contactPreference === 'whatsapp' && {
      whatsappDialCode: dialCodeOf(values.whatsappCountry),
      whatsapp: whatsappDigits(values.whatsapp),
    }),
    locale,
    ...(cvId !== undefined && { cvId }),
    turnstileToken,
  }
}
