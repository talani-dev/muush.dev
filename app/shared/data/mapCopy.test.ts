import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { MAP_COPY_KEYS } from '@/shared/data/mapCopy'
import { MAP_PINS } from '@/shared/data/mapPins'
import { MAP_REGIONS } from '@/shared/data/mapRegions'

/**
 * Feature 46 · FR-017, research R3. The locale files are read from disk,
 * never imported: the i18n transform turns an import into a message AST
 * (`docs/business/rules.md` § R27).
 */
function messageAt(locale: 'es' | 'en', key: string): unknown {
  const tree: unknown = JSON.parse(
    readFileSync(
      join(process.cwd(), 'i18n', 'locales', `${locale}.json`),
      'utf8'
    )
  )
  return key
    .split('.')
    .reduce<unknown>(
      (node, segment) =>
        node && typeof node === 'object'
          ? (node as Record<string, unknown>)[segment]
          : undefined,
      tree
    )
}

const ALL_KEYS = [
  ...Object.values(MAP_COPY_KEYS.legend),
  MAP_COPY_KEYS.regionsLabel,
  ...Object.values(MAP_COPY_KEYS.regions),
  ...Object.values(MAP_COPY_KEYS.cities),
]

describe('MAP_COPY_KEYS', () => {
  it('should name one city key per map pin when read', () => {
    expect(Object.keys(MAP_COPY_KEYS.cities).sort()).toEqual(
      MAP_PINS.map(pin => pin.city).sort()
    )
  })

  it('should name one tab per map region when read', () => {
    expect(Object.keys(MAP_COPY_KEYS.regions)).toEqual(
      MAP_REGIONS.map(region => region.name)
    )
  })

  for (const locale of ['es', 'en'] as const) {
    it(`should resolve every key to a non-empty string when the ${locale} locale is read`, () => {
      for (const key of ALL_KEYS) {
        const message = messageAt(locale, key)
        expect(typeof message, key).toBe('string')
        expect((message as string).length, key).toBeGreaterThan(0)
      }
    })
  }
})
