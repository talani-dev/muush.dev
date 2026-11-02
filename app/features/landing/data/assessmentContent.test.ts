import { describe, expect, it } from 'vitest'
import { ASSESSMENT_KEYS, RECEIVES_ORDER } from './assessmentContent'
import { keysOf, messageAt, readLocale } from './localeKeys.testing'

/** Feature 45 · data-model § 4; `muush-1.0.md` § 4.6. */
describe('ASSESSMENT_KEYS', () => {
  const allKeys = [
    ...keysOf(ASSESSMENT_KEYS),
    ...RECEIVES_ORDER.map(key => ASSESSMENT_KEYS.receives(key)),
  ]

  for (const locale of ['es', 'en'] as const) {
    it(`should resolve every key to a non-empty string when the ${locale} locale is read`, () => {
      const tree = readLocale(locale)

      for (const key of allKeys) {
        const message = messageAt(tree, key)
        expect(typeof message, key).toBe('string')
        expect((message as string).length, key).toBeGreaterThan(0)
      }
    })
  }

  it('should list the three receivables in the approved order when read', () => {
    expect(RECEIVES_ORDER).toEqual(['review', 'first', 'deeper'])
  })
})
