import { describe, expect, it } from 'vitest'
import en from '../i18n/locales/en.json'
import es from '../i18n/locales/es.json'

/**
 * Constitution Article III (i18n Parity) says every key must exist in both
 * locales. This guards it mechanically: adding a string to one file and
 * forgetting the other fails the suite instead of shipping a blank slot.
 */
function flatten(value: unknown, prefix = ''): string[] {
  if (value === null || typeof value !== 'object') return [prefix]
  return Object.entries(value as Record<string, unknown>).flatMap(
    ([key, child]) => flatten(child, prefix ? `${prefix}.${key}` : key)
  )
}

describe('i18n parity', () => {
  const esKeys = flatten(es).sort()
  const enKeys = flatten(en).sort()

  it('should expose the same keys in both locales', () => {
    expect(enKeys).toEqual(esKeys)
  })

  it('should have no empty string in either locale', () => {
    const empties = [
      ...flatten(es).filter(k => resolve(es, k) === ''),
      ...flatten(en).filter(k => resolve(en, k) === ''),
    ]
    expect(empties).toEqual([])
  })
})

function resolve(source: unknown, path: string): unknown {
  return path
    .split('.')
    .reduce<unknown>(
      (acc, key) =>
        acc && typeof acc === 'object'
          ? (acc as Record<string, unknown>)[key]
          : undefined,
      source
    )
}
