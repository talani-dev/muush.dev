import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * The About Hero's three strings, asserted against the files on disk.
 *
 * The copy was marked BORRADOR (draft, pending Clau's approval) in
 * `docs/business/landing/decisions-open.md`. Roberto read it out and approved
 * it on 2026-09-08, so it ships here as final copy rather than a placeholder
 * — this suite is what pins it down instead of letting a later pass drift it.
 *
 * Read from disk, never imported: Nuxt's i18n Vite transform compiles a locale
 * JSON into a message AST, and an assertion against a node of that AST passes
 * on any input at all (`docs/business/rules.md` § R27). The path is built with
 * `node:path` and `process.cwd()`, not `new URL` — the global environment is
 * `happy-dom`, whose `URL` `node:fs` rejects.
 */
interface AboutCopy {
  about: {
    hero: {
      eyebrow: string
      headline: string
      intro: string
    }
  }
}

function readLocale(name: string): AboutCopy {
  const file = join(process.cwd(), 'i18n', 'locales', `${name}.json`)
  return JSON.parse(readFileSync(file, 'utf8')) as AboutCopy
}

const es = readLocale('es').about.hero
const en = readLocale('en').about.hero

describe('about copy', () => {
  it('should translate every hero string between the locales', () => {
    /* Unlike `landing.hero.eyebrow`, the About Pill's "Nosotros" DOES
       translate — it is the same word the shell already translates for the
       nav link and the footer column (`shell.nav.about`). */
    for (const key of ['eyebrow', 'headline', 'intro'] as const) {
      expect(en[key], key).not.toBe(es[key])
      expect(es[key], key).not.toBe('')
      expect(en[key], key).not.toBe('')
    }
  })

  it('should reuse the shell’s own translation of "Nosotros" for the eyebrow', () => {
    expect(es.eyebrow).toBe('Nosotros')
    expect(en.eyebrow).toBe('About us')
  })

  it('should carry the approved headline and intro in each locale', () => {
    /* Verbatim from the leader's 2026-09-08 brief for feature 17, read from
       the `.pen` and approved by Roberto the same night. */
    expect(es.headline).toBe('El equipo se arma alrededor del proyecto.')
    expect(en.headline).toBe('We build the team around the project.')
    expect(es.intro).toBe(
      'Reunimos al talento indicado para cada proyecto y le damos libertad de elegir en qué proyectos entra y desde dónde trabaja. Esa flexibilidad es lo que sostiene nuestro talent pool, y lo que nos permite entregar sin cargar una estructura pesada.'
    )
    expect(en.intro).toBe(
      'We bring together the right talent for each project and give them freedom to choose which projects they join and where they work from. That flexibility is what holds our talent pool together, and what lets us deliver without carrying a heavy structure.'
    )
  })
})
