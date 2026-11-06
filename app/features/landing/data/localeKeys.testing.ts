import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Test-only helpers for the landing content modules (feature 44). The
 * locale files are read from disk, never imported: the i18n transform turns
 * an import into a message AST (rules.md § R27).
 */
export type Locale = 'es' | 'en'

export function readLocale(locale: Locale): unknown {
  return JSON.parse(
    readFileSync(
      join(process.cwd(), 'i18n', 'locales', `${locale}.json`),
      'utf8'
    )
  )
}

/** The string at a dotted key, or `undefined` when any segment is missing. */
export function messageAt(tree: unknown, key: string): unknown {
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

/** Every string leaf of a nested key object, flattened. */
export function keysOf(model: unknown): string[] {
  if (typeof model === 'string') return [model]
  if (Array.isArray(model)) return model.flatMap(keysOf)
  if (model && typeof model === 'object')
    return Object.values(model).flatMap(keysOf)
  return []
}
