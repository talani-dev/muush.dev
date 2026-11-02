import { describe, expect, it } from 'vitest'
import { HERO_KEYS } from './heroContent'
import { keysOf, messageAt, readLocale } from './localeKeys.testing'

/** Feature 44 · data-model §§ 4–5. */
describe('HERO_KEYS', () => {
  it('should list the four services in the order the pill cycles when read', () => {
    expect(HERO_KEYS.pill).toEqual([
      'landing.hero.pill.strategy',
      'landing.hero.pill.software',
      'landing.hero.pill.automation',
      'landing.hero.pill.design',
    ])
  })

  for (const locale of ['es', 'en'] as const) {
    it(`should resolve every key to a non-empty string when the ${locale} locale is read`, () => {
      const tree = readLocale(locale)

      for (const key of keysOf(HERO_KEYS)) {
        const message = messageAt(tree, key)
        expect(typeof message, key).toBe('string')
        expect((message as string).length, key).toBeGreaterThan(0)
      }
    })
  }
})
