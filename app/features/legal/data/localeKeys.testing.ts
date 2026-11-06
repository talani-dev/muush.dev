import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Test-only reader for the legal module (feature 48). The locale files are
 * read from disk, never imported: the i18n transform turns an import into a
 * message AST (`docs/business/rules.md` § R27). `{'@'}`, vue-i18n's escape
 * for a literal at sign (§ R26), is returned as the `@` a visitor reads.
 */
function readLocale(locale: 'es' | 'en'): unknown {
  return JSON.parse(
    readFileSync(
      join(process.cwd(), 'i18n', 'locales', `${locale}.json`),
      'utf8'
    )
  )
}

export function messageAt(locale: 'es' | 'en', key: string): unknown {
  return key
    .split('.')
    .reduce<unknown>(
      (node, segment) =>
        node && typeof node === 'object'
          ? (node as Record<string, unknown>)[segment]
          : undefined,
      readLocale(locale)
    )
}

/** A `t` over the real locale file, rendered as the visitor reads it. */
export function translatorFor(locale: 'es' | 'en'): (key: string) => string {
  return key => {
    const message = messageAt(locale, key)
    if (typeof message !== 'string') throw new Error(`missing ${locale} ${key}`)
    return message.replaceAll("{'@'}", '@')
  }
}
