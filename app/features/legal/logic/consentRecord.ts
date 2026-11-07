import {
  CONSENT_LIFETIME_MONTHS,
  CONSENT_RECORD_VERSION,
  type ConsentRecord,
  type CookieChoice,
  OPTIONAL_COOKIE_CATEGORIES,
} from '@/features/legal/data/cookieCategories'

/**
 * The stored cookie choice, as pure functions (feature 48): building the
 * record, and reading it back defensively. `localStorage` is visitor
 * controlled, so anything that is not exactly a current record is treated
 * as "no choice yet" and the banner asks again. Since feature 49 a record
 * also expires `CONSENT_LIFETIME_MONTHS` after it was decided (research R11).
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
 * When a choice made at `decidedAt` stops counting: the same day and time
 * `CONSENT_LIFETIME_MONTHS` calendar months later, clamped to the last day
 * of that month when the day does not exist (Feb 29 → Feb 28). UTC, so the
 * answer does not depend on the visitor's time zone.
 */
export function consentExpiresAt(decidedAt: Date): Date {
  const expires = new Date(decidedAt.getTime())
  const day = expires.getUTCDate()
  expires.setUTCDate(1)
  expires.setUTCMonth(expires.getUTCMonth() + CONSENT_LIFETIME_MONTHS)
  const lastDay = new Date(
    Date.UTC(expires.getUTCFullYear(), expires.getUTCMonth() + 1, 0)
  ).getUTCDate()
  expires.setUTCDate(Math.min(day, lastDay))
  return expires
}

/** Decided at a real date, not later than `now`, and not yet expired. */
function isCurrentDecision(decidedAt: string, now: Date): boolean {
  const decided = new Date(decidedAt)
  if (Number.isNaN(decided.getTime())) return false
  if (decided.getTime() > now.getTime()) return false
  return now.getTime() < consentExpiresAt(decided).getTime()
}

/**
 * The stored record, or `null` when there is none, it does not parse, it
 * has another version, it misses a category added since it was saved, or
 * its `decidedAt` is unreadable, in the future, or 12 months old or more
 * (spec FR-001, FR-002). `null` means the banner shows and nothing loads.
 */
export function parseConsentRecord(
  raw: string | null,
  now: Date
): ConsentRecord | null {
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
  if (!isCurrentDecision(parsed.decidedAt, now)) return null
  const categories = readChoice(parsed.categories)
  if (!categories) return null
  return {
    version: CONSENT_RECORD_VERSION,
    decidedAt: parsed.decidedAt,
    categories,
  }
}
