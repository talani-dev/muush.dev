import {
  CONSENT_RECORD_VERSION,
  type ConsentRecord,
  type CookieChoice,
  OPTIONAL_COOKIE_CATEGORIES,
} from '@/features/legal/data/cookieCategories'

/**
 * The stored cookie choice, as pure functions (feature 48): building the
 * record, and reading it back defensively. `localStorage` is visitor
 * controlled, so anything that is not exactly a current record is treated
 * as "no choice yet" and the banner asks again.
 */

/** Every optional category set to `granted`: "Aceptar todo" / "Rechazar todo". */
export function choiceForAll(granted: boolean): CookieChoice {
  return Object.fromEntries(
    OPTIONAL_COOKIE_CATEGORIES.map(category => [category, granted])
  ) as CookieChoice
}

export function createConsentRecord(
  choice: CookieChoice,
  decidedAt: Date
): ConsentRecord {
  return {
    version: CONSENT_RECORD_VERSION,
    decidedAt: decidedAt.toISOString(),
    categories: { ...choice },
  }
}

function isRecordObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** The stored categories, only if every optional one is a boolean. */
function readChoice(value: unknown): CookieChoice | null {
  if (!isRecordObject(value)) return null
  const complete = OPTIONAL_COOKIE_CATEGORIES.every(
    category => typeof value[category] === 'boolean'
  )
  if (!complete) return null
  return Object.fromEntries(
    OPTIONAL_COOKIE_CATEGORIES.map(category => [category, value[category]])
  ) as CookieChoice
}

/**
 * The stored record, or `null` when there is none, it does not parse, it
 * has another version, or it misses a category added since it was saved.
 */
export function parseConsentRecord(raw: string | null): ConsentRecord | null {
  if (raw === null) return null
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  if (!isRecordObject(parsed)) return null
  if (parsed.version !== CONSENT_RECORD_VERSION) return null
  if (typeof parsed.decidedAt !== 'string') return null
  const categories = readChoice(parsed.categories)
  if (!categories) return null
  return {
    version: CONSENT_RECORD_VERSION,
    decidedAt: parsed.decidedAt,
    categories,
  }
}
