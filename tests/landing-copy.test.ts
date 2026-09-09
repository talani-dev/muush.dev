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

interface ServiceBlock {
  name: string
  brief: string
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
    services: {
      eyebrow: string
      consulting: ServiceBlock
      software: ServiceBlock
      cloud: ServiceBlock
      automation: ServiceBlock
      product: ServiceBlock
      delivery: { label: string; copy: string }
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
    /*
     * Feature 25: `content.md`'s Golden Circle blockquotes were never the
     * real copy — they were a placeholder that survived the whole feature 13
     * cycle unreplaced. The strings below are verbatim from the real `.pen`
     * nodes (`ZddCZ`/`OD567`/`qwVGc` ES, `l0DUl`/`w9zj30`/`F1Lku` EN), read by
     * the leader per `rules.md` § R32.
     */
    expect(spanish.purpose.why.copy).toBe(
      'El software rara vez falla por cómo se construye. Falla porque nadie tradujo el problema de negocio; saber qué vale la pena construir es lo que cambia el resultado.'
    )
    expect(english.purpose.why.copy).toBe(
      "Software rarely fails because of how it's built. It fails because nobody translated the business problem; knowing what's worth building is what changes the outcome."
    )
    expect(spanish.purpose.how.copy).toBe(
      'Primero entendemos tu operación, después decidimos qué se construye. Traducimos antes de construir.'
    )
    expect(english.purpose.how.copy).toBe(
      'First, we understand how you operate; then we decide what gets built. We translate before we build.'
    )
    expect(spanish.purpose.what.copy).toBe(
      'Diseñamos y construimos soluciones digitales que tu negocio usa todos los días.'
    )
    expect(english.purpose.what.copy).toBe(
      'We design and build digital solutions your business uses every day.'
    )
  })

  it('should no longer duplicate the hero subhead in the What block', () => {
    /*
     * ⚠️ Corrected 2026-09-08 (feature 25). Before this feature the What
     * block's placeholder copy happened to be the exact same sentence as
     * `hero.subhead`, and a previous version of this test asserted that
     * coincidence as if it were a rule. It never was one — nothing in
     * `content.md`, `ui-map.md` or the `.pen` ties the two together — and the
     * real Golden Circle copy for What is its own sentence. This test is the
     * new guard: it stops a future edit from silently re-coupling the two
     * sections by copy-pasting one string into the other.
     */
    expect(spanish.purpose.what.copy).not.toBe(spanish.hero.subhead)
    expect(english.purpose.what.copy).not.toBe(english.hero.subhead)
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

describe('landing copy · Servicios', () => {
  const AREAS = [
    'consulting',
    'software',
    'cloud',
    'automation',
    'product',
  ] as const

  it('should hold the twelve keys in both locales', () => {
    for (const locale of [spanish, english]) {
      expect(locale.services.eyebrow).not.toBe('')
      expect(locale.services.delivery.label).not.toBe('')
      expect(locale.services.delivery.copy).not.toBe('')
      for (const area of AREAS) {
        expect(locale.services[area].name, area).not.toBe('')
        expect(locale.services[area].brief, area).not.toBe('')
      }
    }
  })

  it('should hold the identical five names in both locales — ⚠️ O-01, not a missing translation', () => {
    /*
     * Roberto's 2026-09-08 instruction is that the five area names DO
     * translate for this feature (unlike `services.md`'s "kept English on
     * purpose" rule for the rest of the site) — but without the Spanish
     * names supplied yet. English ships as the placeholder in both locales
     * so the gap is visible rather than silently wrong. The day a Spanish
     * name lands, this assertion is what forces the update instead of
     * letting the two files drift apart unnoticed.
     */
    for (const area of AREAS) {
      expect(english.services[area].name, area).toBe(
        spanish.services[area].name
      )
    }

    expect(AREAS.map(area => spanish.services[area].name)).toEqual([
      'Technology Consulting & Strategy',
      'Software & Digital Solutions',
      'Cloud, Infrastructure & DevOps',
      'Automation, Data & AI',
      'Product, UI/UX & Experience',
    ])
  })

  it('should translate every brief and the delivery copy between the locales', () => {
    for (const area of AREAS) {
      expect(english.services[area].brief, area).not.toBe(
        spanish.services[area].brief
      )
    }

    expect(english.services.delivery.copy).not.toBe(
      spanish.services.delivery.copy
    )
    expect(english.services.eyebrow).not.toBe(spanish.services.eyebrow)
  })

  it('should carry the approved services.md briefs verbatim in each locale', () => {
    expect(spanish.services.consulting.brief).toBe(
      'Diagnosticamos tu situación real, diseñamos la solución y te decimos qué conviene hacer, incluso cuando la respuesta es hacer menos.'
    )
    expect(english.services.consulting.brief).toBe(
      "We diagnose your actual situation, design the solution, and tell you what's worth doing, even when the answer is to do less."
    )
    expect(spanish.services.software.brief).toBe(
      'Plataformas, sistemas internos, portales e integraciones construidos alrededor de cómo opera tu negocio, no al revés.'
    )
    expect(english.services.software.brief).toBe(
      'Platforms, internal systems, portals, and integrations built around how your business actually works, not the other way around.'
    )
    expect(spanish.services.cloud.brief).toBe(
      'Lo que sostiene todo una vez que está en producción: infraestructura, despliegues automatizados, monitoreo y seguridad. La parte que nadie nota hasta que hace falta.'
    )
    expect(english.services.cloud.brief).toBe(
      "What holds everything up once it's live: infrastructure, automated deploys, monitoring and security. The part nobody notices until it's needed."
    )
    expect(spanish.services.automation.brief).toBe(
      'Automatizamos lo repetitivo y convertimos tus datos en decisiones. AI donde sume, no solamente donde suene bien.'
    )
    expect(english.services.automation.brief).toBe(
      'We automate the repetitive and turn your data into decisions. AI where it adds value, not where it sounds good.'
    )
    expect(spanish.services.product.brief).toBe(
      'Convertimos tecnología compleja en algo que se usa sin manual. Producto y experiencia, de investigación a prototipo.'
    )
    expect(english.services.product.brief).toBe(
      'We turn complex technology into something people use without a manual. Product and experience, from research to prototype.'
    )
    expect(spanish.services.delivery.copy).toBe(
      'Y una capacidad que atraviesa las cinco: llevamos el proyecto de principio a fin, con alcance, tiempos, calidad y lanzamiento a nuestro cargo.'
    )
    expect(english.services.delivery.copy).toBe(
      'And one capability runs through all five: we carry the project from start to finish, including scope, timelines, quality and launch.'
    )
  })

  it('should give the delivery closer its own Pill label, distinct from the eyebrow', () => {
    /* `design-extract.md` § 3 lists `Delivery` among the landing's Pill
       instances — separate from `Servicios`/`Services`. */
    for (const locale of [spanish, english]) {
      expect(locale.services.delivery.label).toBe('Delivery')
      expect(locale.services.delivery.label).not.toBe(locale.services.eyebrow)
    }
  })
})
