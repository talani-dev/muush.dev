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
  whatsapp: 'forms.contact.fields.whatsapp.errorDigits',
}

export const APPLICATION_SERVER_ERROR_KEYS: ErrorKeyMap<ApplicationFieldId> = {
  name: 'forms.application.fields.name.errorRequired',
  email: 'forms.application.fields.email.errorFormat',
  areaRole: 'forms.application.fields.areaRole.errorRequired',
  portfolio: 'forms.application.fields.portfolio.errorFormat',
  linkedin: 'forms.application.fields.linkedin.errorFormat',
  whatsapp: 'forms.application.fields.whatsapp.errorDigits',
}

export type MarkableValues = ContactFormValues | ApplicationFormValues

/**
 * The server's field names as this form's field ids, or `undefined` when any
 * of them has no visible input. `whatsapp` is visible only while the
 * preference is WhatsApp.
 */
export function resolveServerFields<F extends string>(
  serverFields: readonly string[],
  keys: ErrorKeyMap<F>,
  values: MarkableValues
): F[] | undefined {
  if (serverFields.length === 0) return undefined
  const resolved: F[] = []
  for (const field of serverFields) {
    if (!Object.hasOwn(keys, field)) return undefined
    if (field === 'whatsapp' && values.contactPreference !== 'whatsapp') {
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

/** The marks whose field still holds the value the server rejected. */
export function activeServerErrors<F extends string>(
  marks: ServerMarks<F>,
  values: MarkableValues
): Partial<Record<F, string>> {
  const active: Partial<Record<F, string>> = {}
  for (const field of Object.keys(marks) as F[]) {
    const mark = marks[field]
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
