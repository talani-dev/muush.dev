import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Feature 51 · the Preguntas copy equals the approved handoff, word for word
 * (spec FR-006, FR-007, SC-001; `data-model.md` § 1).
 *
 * The fixtures are the two `contenido/preguntas-{es,en}.json` files of the
 * handoff `preguntas-muush-1.0` (approved by Roberto and Clau, 2026-11-08),
 * copied verbatim into `tests/fixtures/` so the suite does not read a path
 * outside the repository.
 *
 * Locale files are read from disk, never imported: Nuxt's i18n transform
 * turns them into a message AST (rules.md § R27). Inline links and the
 * address are placeholders in the locale files (`{privacy}`, `{about}`,
 * `{email}`; the address never as a literal `@`, rules.md § R26); filled
 * with their link texts and the address, every answer equals the JSON.
 */
interface ApprovedQuestion {
  pregunta: string
  respuesta: string
  enlaces?: { texto: string; url: string }[]
}

interface Approved {
  meta: { title: string; description: string }
  encabezado: { pill: string; titulo: [string, string]; bajada: string }
  tarjeta: { titulo: string; texto: string; boton: { texto: string } }
  temas: {
    id: string
    numero: string
    titulo: string
    preguntas: ApprovedQuestion[]
  }[]
}

interface LocaleQuestion {
  question: string
  answer: string
}

interface LocaleCopy {
  pages: { faq: { title: string; description: string } }
  faq: {
    pill: string
    heading: { first: string; second: string }
    subtitle: string
    tabsLabel: string
    links: { privacy: string; about: string }
    card: { title: string; text: string; button: string }
    topics: Record<
      string,
      { title: string; questions: Record<string, LocaleQuestion> }
    >
  }
  shell: { nav: Record<string, string>; faq?: unknown }
}

const SUPPORT_ADDRESS = 'support@muush.dev'

function readJson<T>(...segments: string[]): T {
  /* node:path, not `new URL`: happy-dom's `URL` is not accepted by `fs`
     (rules.md § R27). */
  return JSON.parse(readFileSync(join(process.cwd(), ...segments), 'utf8')) as T
}

function fill(text: string, links: LocaleCopy['faq']['links']): string {
  return text
    .replaceAll('{privacy}', links.privacy)
    .replaceAll('{about}', links.about)
    .replaceAll('{email}', SUPPORT_ADDRESS)
}

for (const locale of ['es', 'en'] as const) {
  const approved = readJson<Approved>(
    'tests',
    'fixtures',
    `faq-approved.${locale}.json`
  )
  const copy = readJson<LocaleCopy>('i18n', 'locales', `${locale}.json`)
  const topics = Object.values(copy.faq.topics)

  describe(`faq copy · ${locale}`, () => {
    it('should hold five topics of 5, 5, 4, 3 and 3 questions when read', () => {
      expect(Object.keys(copy.faq.topics)).toEqual([
        't1',
        't2',
        't3',
        't4',
        't5',
      ])
      expect(topics.map(topic => Object.keys(topic.questions).length)).toEqual([
        5, 5, 4, 3, 3,
      ])
    })

    it('should match every topic title and question of the approved JSON when read', () => {
      expect(topics.map(topic => topic.title)).toEqual(
        approved.temas.map(tema => tema.titulo)
      )
      expect(
        topics.flatMap(topic =>
          Object.values(topic.questions).map(q => q.question)
        )
      ).toEqual(
        approved.temas.flatMap(tema => tema.preguntas.map(p => p.pregunta))
      )
    })

    it('should match every answer of the approved JSON when its placeholders are filled', () => {
      expect(
        topics.flatMap(topic =>
          Object.values(topic.questions).map(q =>
            fill(q.answer, copy.faq.links)
          )
        )
      ).toEqual(
        approved.temas.flatMap(tema => tema.preguntas.map(p => p.respuesta))
      )
    })

    it('should name each link by the approved link text when read', () => {
      const linkTexts = approved.temas.flatMap(tema =>
        tema.preguntas.flatMap(p => (p.enlaces ?? []).map(e => e.texto))
      )

      expect(linkTexts).toEqual([copy.faq.links.privacy, copy.faq.links.about])
    })

    it('should match the header, the card and the meta copy when read', () => {
      expect(copy.faq.pill).toBe(approved.encabezado.pill)
      expect([copy.faq.heading.first, copy.faq.heading.second]).toEqual(
        approved.encabezado.titulo
      )
      expect(copy.faq.subtitle).toBe(approved.encabezado.bajada)
      expect(copy.faq.card.title).toBe(approved.tarjeta.titulo)
      expect(fill(copy.faq.card.text, copy.faq.links)).toBe(
        approved.tarjeta.texto
      )
      expect(copy.faq.card.button).toBe(approved.tarjeta.boton.texto)
      expect(copy.pages.faq).toEqual(approved.meta)
    })

    it('should write no literal at sign and no placeholder text when read', () => {
      const serialized = JSON.stringify(copy.faq)

      expect(serialized).not.toContain('@')
      expect(serialized).not.toMatch(/Mientras tanto|In the meantime/)
      expect(JSON.stringify(copy.pages.faq)).not.toMatch(
        /Mientras tanto|In the meantime/
      )
    })

    it('should drop the feature 46 status copy when read', () => {
      expect(copy.shell.faq).toBeUndefined()
      expect(JSON.stringify(copy)).not.toMatch(
        /En construcción|Under construction/
      )
    })
  })
}
