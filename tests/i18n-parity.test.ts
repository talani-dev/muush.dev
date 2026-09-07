import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Constitution Article III (i18n Parity) says every key must exist in both
 * locales. This guards it mechanically: adding a string to one file and
 * forgetting the other fails the suite instead of shipping a blank slot.
 *
 * The files are read from disk rather than imported. Nuxt's i18n Vite
 * transform compiles a locale JSON into a **message AST** on import, and an
 * AST node is never the empty string — so the emptiness check below would
 * pass on any input at all (docs/business/rules.md § R27).
 */
function readLocale(name: string): unknown {
  /* Built with node:path, not `new URL`: the DOM environment replaces the
     global `URL` with an implementation `fs` does not accept. */
  const file = join(process.cwd(), 'i18n', 'locales', `${name}.json`)
  return JSON.parse(readFileSync(file, 'utf8'))
}

const es = readLocale('es')
const en = readLocale('en')

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
