import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Test-only helper for the about content modules (feature 46). The locale
 * files are read from disk, never imported: the i18n transform turns an
 * import into a message AST (`docs/business/rules.md` § R27).
 */
export function messageAt(locale: 'es' | 'en', key: string): unknown {
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
