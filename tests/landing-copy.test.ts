import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * The Hero's five strings, asserted against the files on disk.
 *
 * One of them is a trap for a later i18n pass: `landing.hero.eyebrow` reads
 * `Technology solution studio` in **both** locales, on purpose. It is English
 * inside the Spanish page, verified in all four design frames, and it is the
 * kind of thing a well-meaning translation sweep "fixes". This suite is what
 * stops that (spec FR-009, FR-037).
 *
 * Read from disk, never imported: Nuxt's i18n Vite transform compiles a locale
 * JSON into a message AST, and an assertion against a node of that AST passes
 * on any input at all (`docs/business/rules.md` § R27). The path is built with
 * `node:path` and `process.cwd()`, not `new URL` — the global environment is
 * `happy-dom`, whose `URL` `node:fs` rejects.
 */
interface LandingCopy {
  landing: {
    hero: {
      eyebrow: string
      headline: string
      subhead: string
      ctaPrimary: string
      ctaSecondary: string
    }
  }
}

function readLocale(name: string): LandingCopy {
  const file = join(process.cwd(), 'i18n', 'locales', `${name}.json`)
  return JSON.parse(readFileSync(file, 'utf8')) as LandingCopy
}

const es = readLocale('es').landing.hero
const en = readLocale('en').landing.hero

describe('landing copy', () => {
  it('should hold the identical eyebrow in both locales', () => {
    /* ⚠️ Not a missing translation. The design draws `Technology solution
       studio` in all four frames, Spanish ones included — the same treatment
       `shell.footer.category` already gets. Do not translate it. */
    expect(en.eyebrow).toBe(es.eyebrow)
    expect(es.eyebrow).toBe('Technology solution studio')
  })

  it('should translate every other hero string between the locales', () => {
    /* The complement of the assertion above: if the eyebrow check were passing
       because both files were simply copies of each other, this would fail. */
    for (const key of [
      'headline',
      'subhead',
      'ctaPrimary',
      'ctaSecondary',
    ] as const) {
      expect(en[key], key).not.toBe(es[key])
      expect(es[key], key).not.toBe('')
      expect(en[key], key).not.toBe('')
    }
  })

  it('should carry the approved headline and subhead in each locale', () => {
    /* Verbatim from `content.md` § Tagline and its *WHAT* block, which is what
       `messaging.md` approves. */
    expect(es.headline).toBe('Hablamos negocio y código.')
    expect(en.headline).toBe('We speak business and code.')
    expect(es.subhead).toBe(
      'Diseñamos y construimos soluciones digitales alrededor de tu negocio.'
    )
    expect(en.subhead).toBe(
      'We design and build digital solutions around your business.'
    )
  })

  it('should keep the arrow out of the secondary call to action in both locales', () => {
    /* The `.pen` bakes `→` into the label because a static mockup cannot draw
       a hover. `LinkArrow` owns the glyph precisely so the hover has something
       to move, and a glyph in the string would render twice the day the
       control goes live (spec FR-010, `rules.md` § R50). */
    expect(es.ctaSecondary).toBe('Agenda una llamada')
    expect(en.ctaSecondary).toBe('Book a call')
    expect(es.ctaSecondary).not.toContain('→')
    expect(en.ctaSecondary).not.toContain('→')
  })
})
