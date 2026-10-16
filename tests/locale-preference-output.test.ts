import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { LOCALE_PREFERENCE_COOKIE } from '@/features/shell/data/localePreference'

/**
 * Feature 33 · the `muush_locale` preference, asserted on the artefact.
 *
 * The cookie is written by the language toggle's click handler and read only
 * by the edge at `/` (`specs/033-ip-locale-root-redirect/contracts/
 * locale-preference-cookie.md`). So its name must ship in the client bundle,
 * and must never appear in a generated document: a document that mentioned
 * it would mean the site writes or reads it at build/render time, which the
 * contract forbids (§ 3).
 *
 * `tests/global-setup.ts` rebuilds the site first. Paths use `node:path`
 * because happy-dom's `URL` is rejected by `node:fs` (rules.md § R27).
 */
const OUTPUT = join(process.cwd(), '.output', 'public')

function filesUnder(directory: string): string[] {
  return readdirSync(directory).flatMap(entry => {
    const path = join(directory, entry)
    return statSync(path).isDirectory() ? filesUnder(path) : [path]
  })
}

function filesMentioningPreference(paths: string[]): string[] {
  return paths.filter(path =>
    readFileSync(path, 'utf8').includes(LOCALE_PREFERENCE_COOKIE)
  )
}

describe('locale preference cookie in the generated output', () => {
  it('should ship the preference cookie name in the client bundle when generated', () => {
    const chunks = filesUnder(join(OUTPUT, '_nuxt')).filter(path =>
      path.endsWith('.js')
    )

    expect(filesMentioningPreference(chunks).length).toBeGreaterThan(0)
  })

  it('should never write the preference into a generated document when generated', () => {
    const documents = filesUnder(OUTPUT).filter(path => path.endsWith('.html'))

    expect(documents.length).toBeGreaterThan(0)
    expect(filesMentioningPreference(documents)).toEqual([])
  })
})
