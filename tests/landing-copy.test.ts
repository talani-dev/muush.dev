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
interface PurposeBlock {
  label: string
  copy: string
}

interface LandingCopy {
  landing: {
    hero: {
      eyebrow: string
      headline: string
      subhead: string
      ctaPrimary: string
      ctaSecondary: string
    }
    purpose: {
      eyebrow: string
      carouselLabel: string
      why: PurposeBlock
      how: PurposeBlock
      what: PurposeBlock
    }
  }
}

function readLocale(name: string): LandingCopy {
  const file = join(process.cwd(), 'i18n', 'locales', `${name}.json`)
  return JSON.parse(readFileSync(file, 'utf8')) as LandingCopy
}

const spanish = readLocale('es').landing
const english = readLocale('en').landing

const es = spanish.hero
const en = english.hero

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

describe('landing copy · Propósito', () => {
  const BLOCKS = ['why', 'how', 'what'] as const

  it('should hold all nine keys in both locales', () => {
    for (const locale of [spanish, english]) {
      expect(locale.purpose.eyebrow).not.toBe('')
      expect(locale.purpose.carouselLabel).not.toBe('')
      for (const block of BLOCKS) {
        expect(locale.purpose[block].label, block).not.toBe('')
        expect(locale.purpose[block].copy, block).not.toBe('')
      }
    }
  })

  it('should hold the identical three labels in both locales', () => {
    /*
     * ⚠️ **Not a missing translation.** Read from the design file on
     * 2026-09-08: the ES and EN frames both draw `Why` / `How` / `What`. It is
     * the same case as `landing.hero.eyebrow` and `shell.footer.category`,
     * and it is exactly the kind of thing a well-meaning translation sweep
     * "fixes". `content.md`'s block headings (`WHY · por qué existe muush`)
     * are titles in a document, not the label the design draws.
     */
    for (const block of BLOCKS) {
      expect(english.purpose[block].label, block).toBe(
        spanish.purpose[block].label
      )
    }

    expect(BLOCKS.map(block => spanish.purpose[block].label)).toEqual([
      'Why',
      'How',
      'What',
    ])
  })

  it('should translate every copy block between the locales', () => {
    /* The complement of the assertion above: if the label check were passing
       because the two files were copies of each other, this would fail. */
    for (const block of BLOCKS) {
      expect(english.purpose[block].copy, block).not.toBe(
        spanish.purpose[block].copy
      )
    }

    expect(english.purpose.eyebrow).not.toBe(spanish.purpose.eyebrow)
  })

  it('should carry the approved Golden Circle copy in each locale', () => {
    /* Verbatim from `content.md` § *Propósito · Golden Circle ✅ aprobado*,
       whose two-line blockquotes join into one paragraph. */
    expect(spanish.purpose.why.copy).toBe(
      'Construimos con el estándar de las aplicaciones que admiramos. Tu negocio merece estar a la misma altura.'
    )
    expect(english.purpose.why.copy).toBe(
      'We build to the standard of the apps we admire. Your business deserves to be held to it.'
    )
    expect(spanish.purpose.how.copy).toBe(
      'Con precisión: lo que tu negocio necesita, sin relleno. Un technology solution studio que responde como un solo equipo.'
    )
    expect(english.purpose.how.copy).toBe(
      'With precision: what your business needs, nothing padded. A technology solution studio that answers as one team.'
    )
    expect(spanish.purpose.what.copy).toBe(
      'Diseñamos y construimos soluciones digitales alrededor de tu negocio.'
    )
    expect(english.purpose.what.copy).toBe(
      'We design and build digital solutions around your business.'
    )
  })

  it('should keep the What block and the hero subhead the same sentence', () => {
    /*
     * ⚠️ Asserted rather than discovered later as a bug. Both are approved
     * copy in `content.md` — the *WHAT* block and the Hero's subhead are
     * literally the same sentence — so the feature ships it as written and
     * reports the duplication instead of collapsing two keys into one, which
     * would couple two sections. This test is what stops either drifting
     * silently.
     */
    expect(spanish.purpose.what.copy).toBe(spanish.hero.subhead)
    expect(english.purpose.what.copy).toBe(english.hero.subhead)
  })

  it('should reuse the eyebrow word for the carousel in both locales', () => {
    /* Two keys, one value, two roles: the Pill's label and the mobile track's
       accessible name. Kept apart so naming the track never edits the
       eyebrow. */
    for (const locale of [spanish, english]) {
      expect(locale.purpose.carouselLabel).toBe(locale.purpose.eyebrow)
    }
  })
})
