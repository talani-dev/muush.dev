import { describe, expect, it } from 'vitest'
import { MAP_COPY_KEYS } from '@/shared/data/mapCopy'
import { keysOf, messageAt, readLocale } from './localeKeys.testing'
import { WHO_WE_ARE_KEYS } from './whoWeAreContent'

/**
 * Feature 44 · data-model §§ 4–5, Clarifications Q2. Feature 46 moved the
 * map labels to the shared `MAP_COPY_KEYS`; both sets must resolve.
 */
describe('WHO_WE_ARE_KEYS', () => {
  it('should keep only the section copy when the map labels are shared', () => {
    expect(Object.keys(WHO_WE_ARE_KEYS)).toEqual([
      'pill',
      'headingFirst',
      'headingSecond',
      'body',
    ])
  })

  for (const locale of ['es', 'en'] as const) {
    it(`should resolve every key to a non-empty string when the ${locale} locale is read`, () => {
      const tree = readLocale(locale)

      for (const key of keysOf([WHO_WE_ARE_KEYS, MAP_COPY_KEYS])) {
        const message = messageAt(tree, key)
        expect(typeof message, key).toBe('string')
        expect((message as string).length, key).toBeGreaterThan(0)
      }
    })
  }
})
