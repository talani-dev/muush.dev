import { describe, expect, it } from 'vitest'
import { messageAt } from './localeKeys.testing'
import { AREAS_ORDER, WORK_KEYS } from './workContent'

/** Feature 46 · FR-022, FR-023, data-model § 2. */
describe('workContent', () => {
  it('should order the areas engineering, design, creative when listed', () => {
    expect(AREAS_ORDER).toEqual(['engineering', 'design', 'creative'])
  })

  for (const locale of ['es', 'en'] as const) {
    it(`should resolve every key to a non-empty string when the ${locale} locale is read`, () => {
      const keys = [
        WORK_KEYS.pill,
        WORK_KEYS.headingFirst,
        WORK_KEYS.headingSecond,
        WORK_KEYS.body,
        WORK_KEYS.areasLabel,
        ...AREAS_ORDER.map(WORK_KEYS.area),
      ]
      for (const key of keys) {
        const message = messageAt(locale, key)
        expect(typeof message, key).toBe('string')
        expect((message as string).length, key).toBeGreaterThan(0)
      }
    })
  }
})
