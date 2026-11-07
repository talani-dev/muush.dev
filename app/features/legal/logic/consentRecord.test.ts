import { describe, expect, it } from 'vitest'
import { CONSENT_RECORD_VERSION } from '@/features/legal/data/cookieCategories'
import {
  choiceForAll,
  consentExpiresAt,
  createConsentRecord,
  parseConsentRecord,
} from './consentRecord'

const DECIDED = new Date('2026-11-05T12:00:00.000Z')
const SOON_AFTER = new Date('2026-11-06T12:00:00.000Z')
const BOTH_OFF = { analytics: false, advertising: false }

function stored(categories: unknown, decidedAt = DECIDED.toISOString()) {
  return JSON.stringify({
    version: CONSENT_RECORD_VERSION,
    decidedAt,
    categories,
  })
}

describe('consentRecord', () => {
  it('should set every optional category when choosing for all', () => {
    expect(choiceForAll(true)).toEqual({ analytics: true, advertising: true })
    expect(choiceForAll(false)).toEqual(BOTH_OFF)
  })

  it('should stamp the version and the decision time when created', () => {
    expect(createConsentRecord(BOTH_OFF, DECIDED)).toEqual({
      version: CONSENT_RECORD_VERSION,
      decidedAt: '2026-11-05T12:00:00.000Z',
      categories: BOTH_OFF,
    })
  })

  it('should read back a record it wrote when parsed', () => {
    const record = createConsentRecord(
      { analytics: true, advertising: false },
      DECIDED
    )

    expect(parseConsentRecord(JSON.stringify(record), SOON_AFTER)).toEqual(
      record
    )
  })

  it('should return null when nothing is stored', () => {
    expect(parseConsentRecord(null, SOON_AFTER)).toBeNull()
  })

  it('should return null when the stored value is not JSON', () => {
    expect(parseConsentRecord('{not json', SOON_AFTER)).toBeNull()
  })

  it('should return null when the version differs', () => {
    const value = { version: 99, decidedAt: 'x', categories: {} }

    expect(parseConsentRecord(JSON.stringify(value), SOON_AFTER)).toBeNull()
  })

  it('should return null when a category is missing so a new one asks again', () => {
    expect(parseConsentRecord(stored({}), SOON_AFTER)).toBeNull()
  })

  it('should return null when a feature 48 record answers only advertising', () => {
    expect(
      parseConsentRecord(stored({ advertising: true }), SOON_AFTER)
    ).toBeNull()
  })

  it('should return null when a category is not a boolean', () => {
    expect(
      parseConsentRecord(
        stored({ analytics: true, advertising: 'yes' }),
        SOON_AFTER
      )
    ).toBeNull()
  })

  it('should drop unknown categories when parsed', () => {
    const value = stored({ analytics: false, advertising: true, retired: true })

    expect(parseConsentRecord(value, SOON_AFTER)?.categories).toEqual({
      analytics: false,
      advertising: true,
    })
  })

  it('should return null when the decision date is not a date', () => {
    expect(
      parseConsentRecord(stored(BOTH_OFF, 'yesterday'), SOON_AFTER)
    ).toBeNull()
  })

  it('should return null when the decision date is in the future', () => {
    expect(
      parseConsentRecord(
        stored(BOTH_OFF, '2026-11-07T12:00:00.000Z'),
        SOON_AFTER
      )
    ).toBeNull()
  })

  it('should keep a choice one day before it is 12 months old', () => {
    const now = new Date('2027-11-04T12:00:00.000Z')

    expect(parseConsentRecord(stored(BOTH_OFF), now)).not.toBeNull()
  })

  it('should return null when the choice is exactly 12 months old', () => {
    const now = new Date('2027-11-05T12:00:00.000Z')

    expect(parseConsentRecord(stored(BOTH_OFF), now)).toBeNull()
  })

  it('should expire a refused choice the same as a granted one', () => {
    const now = new Date('2027-11-06T12:00:00.000Z')

    expect(
      parseConsentRecord(stored({ analytics: true, advertising: true }), now)
    ).toBeNull()
    expect(parseConsentRecord(stored(BOTH_OFF), now)).toBeNull()
  })

  it('should expire a choice made on Jan 31 at the end of January next year', () => {
    expect(consentExpiresAt(new Date('2026-01-31T10:00:00.000Z'))).toEqual(
      new Date('2027-01-31T10:00:00.000Z')
    )
  })

  it('should clamp to the last day of the month when that day does not exist', () => {
    expect(consentExpiresAt(new Date('2028-02-29T10:00:00.000Z'))).toEqual(
      new Date('2029-02-28T10:00:00.000Z')
    )
  })
})
