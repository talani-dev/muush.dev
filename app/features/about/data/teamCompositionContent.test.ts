import { describe, expect, it } from 'vitest'
import { messageAt } from './localeKeys.testing'
import {
  COMPOSITION_ORDER,
  TEAM_COMPOSITION_KEYS,
} from './teamCompositionContent'

/** Feature 46 · FR-011, data-model § 2. */
describe('teamCompositionContent', () => {
  it('should order the cards team, pool, partner when listed', () => {
    expect(COMPOSITION_ORDER).toEqual(['team', 'pool', 'partner'])
  })

  for (const locale of ['es', 'en'] as const) {
    it(`should resolve every key to a non-empty string when the ${locale} locale is read`, () => {
      const keys = [
        TEAM_COMPOSITION_KEYS.pill,
        TEAM_COMPOSITION_KEYS.headingFirst,
        TEAM_COMPOSITION_KEYS.headingSecond,
        ...COMPOSITION_ORDER.flatMap(kind =>
          Object.values(TEAM_COMPOSITION_KEYS.card(kind))
        ),
      ]
      for (const key of keys) {
        const message = messageAt(locale, key)
        expect(typeof message, key).toBe('string')
        expect((message as string).length, key).toBeGreaterThan(0)
      }
    })
  }
})
