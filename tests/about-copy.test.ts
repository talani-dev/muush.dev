import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Feature 46 · the Muush 1.0 Nosotros copy, asserted verbatim against the
 * files on disk (spec FR-007, FR-011, FR-018, FR-022, FR-023, FR-048;
 * `docs/business/muush-1.0.md` § 4.8, pen extract-46 § 1). The approved copy
 * is the `.pen`'s; a translation sweep that "improves" a string must fail
 * here first. "Áreas que sumamos" is stored in sentence case and drawn
 * uppercase by `ReceivesList`, like "Lo que recibes".
 *
 * Read from disk, never imported: Nuxt's i18n Vite transform compiles a
 * locale JSON into a message AST, and an assertion against a node of that
 * AST passes on any input at all (`docs/business/rules.md` § R27).
 */
type Tree = { [key: string]: string | Tree }

function readAbout(locale: 'es' | 'en'): Tree {
  const file = join(process.cwd(), 'i18n', 'locales', `${locale}.json`)
  return (JSON.parse(readFileSync(file, 'utf8')) as { about: Tree }).about
}

const EXPECTED: Record<'es' | 'en', Tree> = {
  es: {
    hero: {
      pill: 'Nosotros',
      heading: {
        first: 'El equipo se arma',
        second: 'alrededor del proyecto.',
      },
      intro:
        'Reunimos al talento indicado para cada proyecto y le damos libertad de elegir en qué proyectos entra y desde dónde trabaja. Esa flexibilidad sostiene nuestro talent pool y nos permite entregar con una estructura ligera.',
    },
    composition: {
      pill: 'Cómo se arma',
      heading: { first: 'Quién entra', second: 'a tu proyecto.' },
      cards: {
        team: {
          label: 'Equipo base',
          title: 'Siempre en tu proyecto',
          text: 'Estrategia, diseño e ingeniería, de principio a fin.',
        },
        pool: {
          label: 'Talent pool',
          title: 'Cuando el proyecto lo pide',
          text: 'Especialistas que entran con el mismo estándar de entrega.',
        },
        partner: {
          label: 'Aliados',
          title: 'Creativo y marketing',
          text: 'Estudios de confianza, coordinados por nosotros.',
        },
      },
    },
    where: {
      pill: 'Dónde estamos',
      heading: {
        first: 'Un talent pool que crece',
        second: 'por sector y por proyecto.',
      },
      body: 'Todos trabajamos con las mismas reglas y el mismo estándar de entrega.',
    },
    work: {
      pill: 'Trabaja con muush',
      heading: { first: 'Tú eliges en qué', second: 'proyectos entras.' },
      body: 'Con quién y desde dónde, también. Si trabajas en tecnología, diseño o producción, cuéntanos qué haces y te buscamos cuando haya un proyecto para ti.',
      areasLabel: 'Áreas que sumamos',
      areas: {
        engineering: 'Ingeniería y desarrollo',
        design: 'Diseño de producto y UX',
        creative: 'Creativo, contenido y marketing',
      },
    },
  },
  en: {
    hero: {
      pill: 'About',
      heading: { first: 'The team takes shape', second: 'around the project.' },
      intro:
        'We bring together the right talent for each project and give them the freedom to choose which projects they join and where they work from. That flexibility sustains our talent pool and lets us deliver with a lean structure.',
    },
    composition: {
      pill: 'How it comes together',
      heading: { first: 'Who joins', second: 'your project.' },
      cards: {
        team: {
          label: 'Core team',
          title: 'Always on your project',
          text: 'Strategy, design and engineering, from start to finish.',
        },
        pool: {
          label: 'Talent pool',
          title: 'When the project calls for it',
          text: 'Specialists who join with the same delivery standard.',
        },
        partner: {
          label: 'Partners',
          title: 'Creative and marketing',
          text: 'Trusted studios, coordinated by us.',
        },
      },
    },
    where: {
      pill: 'Where we are',
      heading: {
        first: 'A talent pool that grows',
        second: 'by industry and by project.',
      },
      body: 'We all work under the same rules and the same delivery standard.',
    },
    work: {
      pill: 'Work with muush',
      heading: { first: 'You choose which', second: 'projects you join.' },
      body: "Who you work with and where from, too. If you work in technology, design or production, tell us what you do and we'll reach out when there's a project for you.",
      areasLabel: 'Areas we bring in',
      areas: {
        engineering: 'Engineering and development',
        design: 'Product design and UX',
        creative: 'Creative, content and marketing',
      },
    },
  },
}

const SECTIONS = ['hero', 'composition', 'where', 'work'] as const

describe('about copy · the Muush 1.0 Nosotros (FR-007)', () => {
  for (const locale of ['es', 'en'] as const) {
    for (const section of SECTIONS) {
      it(`should hold the approved ${section} copy verbatim when the ${locale} locale is read`, () => {
        expect(readAbout(locale)[section]).toEqual(EXPECTED[locale][section])
      })
    }
  }

  it('should carry only the v2 sections when the locales are read', () => {
    /* FR-027: the v1 eyebrow and headline keys left with their sections. */
    for (const locale of ['es', 'en'] as const) {
      expect(Object.keys(readAbout(locale)), locale).toEqual([...SECTIONS])
    }
  })

  it('should store the uppercase-drawn areas caption in sentence case when the locales are read', () => {
    for (const locale of ['es', 'en'] as const) {
      const label = (readAbout(locale).work as Tree).areasLabel as string
      expect(label, locale).not.toBe(label.toUpperCase())
    }
  })

  it('should keep no dash pause and no arrow in the Nosotros copy when the locales are read', () => {
    /* messaging.md rule 1; the arrow belongs to the button (rules.md § R50). */
    for (const locale of ['es', 'en'] as const) {
      expect(JSON.stringify(readAbout(locale)), locale).not.toMatch(/—|→/)
    }
  })
})
