import { describe, expect, it } from 'vitest'
import { messageAt } from './localeKeys.testing'
import { WHERE_WE_ARE_KEYS } from './whereWeAreContent'

/** Feature 46 · FR-015…FR-019, data-model § 2. */
describe('WHERE_WE_ARE_KEYS', () => {
  it('should key only the section copy when the map labels are shared', () => {
    expect(Object.keys(WHERE_WE_ARE_KEYS)).toEqual([
      'pill',
      'headingFirst',
      'headingSecond',
      'body',
    ])
  })

  for (const locale of ['es', 'en'] as const) {
    it(`should resolve every key to a non-empty string when the ${locale} locale is read`, () => {
      for (const key of Object.values(WHERE_WE_ARE_KEYS)) {
        const message = messageAt(locale, key)
        expect(typeof message, key).toBe('string')
        expect((message as string).length, key).toBeGreaterThan(0)
      }
    })
  }
})
