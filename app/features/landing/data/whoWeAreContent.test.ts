import { describe, expect, it } from 'vitest'
import { MAP_PINS } from '@/shared/data/mapPins'
import { MAP_REGIONS } from '@/shared/data/mapRegions'
import { keysOf, messageAt, readLocale } from './localeKeys.testing'
import { WHO_WE_ARE_KEYS } from './whoWeAreContent'

/** Feature 44 · data-model §§ 4–5, Clarifications Q2. */
describe('WHO_WE_ARE_KEYS', () => {
  it('should name one city key per map pin when read', () => {
    expect(Object.keys(WHO_WE_ARE_KEYS.cities).sort()).toEqual(
      MAP_PINS.map(pin => pin.city).sort()
    )
  })

  it('should name one tab per map region when read', () => {
    expect(Object.keys(WHO_WE_ARE_KEYS.regions)).toEqual(
      MAP_REGIONS.map(region => region.name)
    )
  })

  for (const locale of ['es', 'en'] as const) {
    it(`should resolve every key to a non-empty string when the ${locale} locale is read`, () => {
      const tree = readLocale(locale)

      for (const key of keysOf(WHO_WE_ARE_KEYS)) {
        const message = messageAt(tree, key)
        expect(typeof message, key).toBe('string')
        expect((message as string).length, key).toBeGreaterThan(0)
      }
    })
  }
})
