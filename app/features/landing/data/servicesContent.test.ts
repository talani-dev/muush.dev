import { describe, expect, it } from 'vitest'
import { keysOf, messageAt, readLocale } from './localeKeys.testing'
import { SERVICE_CARDS, SERVICES_KEYS } from './servicesContent'

/** Feature 44 · FR-014, data-model §§ 4–5; pen extract-44 § 3.1. */
describe('SERVICE_CARDS', () => {
  it('should pair each service with its icon and light in drawn order when read', () => {
    expect(SERVICE_CARDS).toEqual([
      { key: 'strategy', icon: 'compass', light: 'crimsonBottomLeft' },
      { key: 'software', icon: 'layout-dashboard', light: 'aceroBottomRight' },
      { key: 'automation', icon: 'workflow', light: 'crimsonBottomLeft' },
      { key: 'design', icon: 'pen-tool', light: 'arenaTopRight' },
    ])
  })
})

describe('SERVICES_KEYS', () => {
  const allKeys = [
    ...keysOf(SERVICES_KEYS),
    ...SERVICE_CARDS.flatMap(card => [
      SERVICES_KEYS.cardTitle(card.key),
      SERVICES_KEYS.cardDescription(card.key),
    ]),
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

  it('should keep the forced title breaks the design draws when the locales are read', () => {
    const es = readLocale('es')
    const en = readLocale('en')

    expect(messageAt(es, SERVICES_KEYS.cardTitle('software'))).toBe(
      'Software, web\ny nube'
    )
    expect(messageAt(es, SERVICES_KEYS.cardTitle('design'))).toBe(
      'Diseño de producto\ny UX'
    )
    expect(messageAt(en, SERVICES_KEYS.cardTitle('strategy'))).toBe(
      'Technology\nstrategy'
    )
    expect(messageAt(en, SERVICES_KEYS.cardTitle('automation'))).toBe(
      'Automation,\ndata and AI'
    )
  })
})
