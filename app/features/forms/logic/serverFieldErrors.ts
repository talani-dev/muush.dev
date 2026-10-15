import type {
  ApplicationFieldId,
  ApplicationFormValues,
} from '@/features/forms/data/applicationFields'
import type {
  ContactFieldId,
  ContactFormValues,
} from '@/features/forms/data/contactFields'

/**
 * 400 `validation_failed` → marks on the visitor's own inputs
 * (form-api-contract.md § 6, spec FR-017, research R9).
 *
 * Each server field reuses the error key — and therefore the message — the
 * client already has for that input. No new copy. A field with no visible
 * input (`company`, `contactPreference`, `locale`, `turnstileToken`, `cvId`,
 * anything unknown) means the site sent something it should not have: a site
 * defect, so the whole outcome becomes the generic error instead.
 *
 * A mark lives exactly as long as the field still holds the value the server
 * rejected; editing the field clears it with no watcher (data-model § 4.1).
 *
 * Feature 32: the server names the dial code `whatsappDialCode`, but the form
 * stores a country code in `whatsappCountry` (several countries share one
 * dial code, research R5/R8). `SERVER_FIELD_ALIASES` maps the name before
 * anything else; picking another country changes the stored code and so
 * clears the mark.
 */

export type ServerMarks<F extends string> = Partial<
  Record<F, { key: string; valueAtMark: string }>
>

export type ErrorKeyMap<F extends string> = Partial<Record<F, string>>

export const CONTACT_SERVER_ERROR_KEYS: ErrorKeyMap<ContactFieldId> = {
  name: 'forms.contact.fields.name.errorRequired',
  email: 'forms.contact.fields.email.errorFormat',
  identity: 'forms.contact.fields.identity.errorRequired',
  need: 'forms.contact.fields.need.errorLength',
  whatsappCountry: 'forms.contact.fields.whatsappCountry.errorInvalid',
  whatsapp: 'forms.contact.fields.whatsapp.errorDigits',
}

export const APPLICATION_SERVER_ERROR_KEYS: ErrorKeyMap<ApplicationFieldId> = {
  name: 'forms.application.fields.name.errorRequired',
  email: 'forms.application.fields.email.errorFormat',
  areaRole: 'forms.application.fields.areaRole.errorRequired',
  portfolio: 'forms.application.fields.portfolio.errorFormat',
  linkedin: 'forms.application.fields.linkedin.errorFormat',
  whatsappCountry: 'forms.application.fields.whatsappCountry.errorInvalid',
  whatsapp: 'forms.application.fields.whatsapp.errorDigits',
}

export type MarkableValues = ContactFormValues | ApplicationFormValues

/** Server field name → form field id, where they differ. */
export const SERVER_FIELD_ALIASES: Readonly<Record<string, string>> = {
  whatsappDialCode: 'whatsappCountry',
}

/** Fields that have a visible input only while the preference is WhatsApp. */
const WHATSAPP_ONLY_FIELDS: ReadonlySet<string> = new Set([
  'whatsappCountry',
  'whatsapp',
])

/**
 * The server's field names as this form's field ids, or `undefined` when any
 * of them has no visible input. `whatsapp` and the dial-code selector are
 * visible only while the preference is WhatsApp.
 */
export function resolveServerFields<F extends string>(
  serverFields: readonly string[],
  keys: ErrorKeyMap<F>,
  values: MarkableValues
): F[] | undefined {
  if (serverFields.length === 0) return undefined
  const resolved: F[] = []
  for (const serverField of serverFields) {
    const field = SERVER_FIELD_ALIASES[serverField] ?? serverField
    if (!Object.hasOwn(keys, field)) return undefined
    if (
      WHATSAPP_ONLY_FIELDS.has(field) &&
      values.contactPreference !== 'whatsapp'
    ) {
      return undefined
    }
    resolved.push(field as F)
  }
  return resolved
}

/** A field's current value as the string a mark compares against. Every
 * markable field is a string input; the file field is never markable. */
function markValue(values: MarkableValues, field: string): string {
  const value: unknown = (values as unknown as Record<string, unknown>)[field]
  return typeof value === 'string' ? value : ''
}

export function createServerMarks<F extends string>(
  fields: readonly F[],
  keys: ErrorKeyMap<F>,
  values: MarkableValues
): ServerMarks<F> {
  const marks: ServerMarks<F> = {}
  for (const field of fields) {
    const key = keys[field]
    if (key) marks[field] = { key, valueAtMark: markValue(values, field) }
  }
  return marks
}

/**
 * The marks whose field still holds the value the server rejected and is
 * visible. The visibility check matters for `whatsappCountry`: unlike the
 * number, the country survives a switch to email (feature 32 spec OA-9), so
 * its value alone would keep a mark alive on a hidden field and block every
 * submit.
 */
export function activeServerErrors<F extends string>(
  marks: ServerMarks<F>,
  values: MarkableValues
): Partial<Record<F, string>> {
  const active: Partial<Record<F, string>> = {}
  for (const field of Object.keys(marks) as F[]) {
    const mark = marks[field]
    if (
      WHATSAPP_ONLY_FIELDS.has(field) &&
      values.contactPreference !== 'whatsapp'
    ) {
      continue
    }
    if (mark && markValue(values, field) === mark.valueAtMark) {
      active[field] = mark.key
    }
  }
  return active
}

/**
 * Client errors first, then server marks for fields with no client error,
 * laid out in the form's field order so the first key is the first invalid
 * input on screen.
 */
export function mergeErrors<F extends string>(
  clientErrors: Partial<Record<F, string>>,
  serverErrors: Partial<Record<F, string>>,
  fieldOrder: readonly F[]
): Partial<Record<F, string>> {
  const merged: Partial<Record<F, string>> = {}
  for (const field of fieldOrder) {
    const key = clientErrors[field] ?? serverErrors[field]
    if (key) merged[field] = key
  }
  return merged
}
