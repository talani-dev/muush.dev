import { describe, expect, it } from 'vitest'
import { CONSENT_RECORD_VERSION } from '@/features/legal/data/cookieCategories'
import {
  choiceForAll,
  createConsentRecord,
  parseConsentRecord,
} from './consentRecord'

const DECIDED = new Date('2026-11-05T12:00:00.000Z')

describe('consentRecord', () => {
  it('should set every optional category when choosing for all', () => {
    expect(choiceForAll(true)).toEqual({ advertising: true })
    expect(choiceForAll(false)).toEqual({ advertising: false })
  })

  it('should stamp the version and the decision time when created', () => {
    expect(createConsentRecord({ advertising: true }, DECIDED)).toEqual({
      version: CONSENT_RECORD_VERSION,
      decidedAt: '2026-11-05T12:00:00.000Z',
      categories: { advertising: true },
    })
  })

  it('should read back a record it wrote when parsed', () => {
    const record = createConsentRecord({ advertising: false }, DECIDED)

    expect(parseConsentRecord(JSON.stringify(record))).toEqual(record)
  })

  it('should return null when nothing is stored', () => {
    expect(parseConsentRecord(null)).toBeNull()
  })

  it('should return null when the stored value is not JSON', () => {
    expect(parseConsentRecord('{not json')).toBeNull()
  })

  it('should return null when the version differs', () => {
    const stored = { version: 99, decidedAt: 'x', categories: {} }

    expect(parseConsentRecord(JSON.stringify(stored))).toBeNull()
  })

  it('should return null when a category is missing so a new one asks again', () => {
    const stored = {
      version: CONSENT_RECORD_VERSION,
      decidedAt: DECIDED.toISOString(),
      categories: {},
    }

    expect(parseConsentRecord(JSON.stringify(stored))).toBeNull()
  })

  it('should return null when a category is not a boolean', () => {
    const stored = {
      version: CONSENT_RECORD_VERSION,
      decidedAt: DECIDED.toISOString(),
      categories: { advertising: 'yes' },
    }

    expect(parseConsentRecord(JSON.stringify(stored))).toBeNull()
  })

  it('should drop unknown categories when parsed', () => {
    const stored = {
      version: CONSENT_RECORD_VERSION,
      decidedAt: DECIDED.toISOString(),
      categories: { advertising: true, retired: true },
    }

    expect(parseConsentRecord(JSON.stringify(stored))?.categories).toEqual({
      advertising: true,
    })
  })
})
