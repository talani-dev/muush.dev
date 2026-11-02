import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Feature 44 · the Muush 1.0 home copy, asserted verbatim against the files
 * on disk (spec FR-025, FR-030; `docs/business/muush-1.0.md` § 4.2–4.5,
 * pen extract-44 §§ 2.1, 4, 8). The approved copy is the `.pen`'s; a
 * translation sweep that "improves" a string must fail here first.
 *
 * Labels drawn uppercase are stored in sentence case and uppercased by CSS,
 * so a screen reader does not spell them (feature 43's convention). The
 * mobile-only strings (tab labels, "Estonia · pronto", the short step-01
 * sentence) and the accessibility copy of Clarifications Q2 (the tab-list
 * name and the city names, confirmed by Roberto 2026-11-01) live here too.
 *
 * Read from disk, never imported: Nuxt's i18n transform compiles a locale
 * JSON into a message AST (`docs/business/rules.md` § R27).
 */
type Tree = { [key: string]: string | Tree }

function readLanding(locale: 'es' | 'en'): Tree {
  const file = join(process.cwd(), 'i18n', 'locales', `${locale}.json`)
  return (JSON.parse(readFileSync(file, 'utf8')) as { landing: Tree }).landing
}

const EXPECTED: Record<'es' | 'en', Tree> = {
  es: {
    hero: {
      pill: {
        strategy: 'Estrategia tecnológica',
        software: 'Software, web y nube',
        automation: 'Automatización, datos e IA',
        design: 'Diseño de producto y UX',
      },
      headline: { first: 'Hablamos negocio', second: 'y código.' },
      subtitle:
        'Diseñamos y construimos las soluciones digitales que tu negocio usa todos los días.',
      primary: 'Diagnóstico gratis',
      secondary: 'Cómo trabajamos',
    },
    whoWeAre: {
      pill: 'Qué es muush',
      heading: {
        first: 'Un equipo base y aliados de confianza,',
        second: 'según lo que pida tu proyecto.',
      },
      body: 'Estrategia, diseño e ingeniería trabajan juntos desde el primer día. Cuando el proyecto lo pide, sumamos aliados con el mismo estándar, estén donde estén.',
      legend: {
        team: 'Equipo',
        partner: 'Aliados',
        soon: 'Estonia · pronto',
        anywhere: 'Trabajamos con clientes en cualquier país.',
      },
      regions: {
        label: 'Región del mapa',
        america: 'América',
        europe: 'Europa',
      },
      cities: {
        cdmx: 'CDMX',
        puebla: 'Puebla',
        merida: 'Mérida',
        dublin: 'Dublín',
        nyc: 'NYC',
        sanFrancisco: 'San Francisco',
        losAngeles: 'Los Ángeles',
        amsterdam: 'Ámsterdam',
        estonia: 'Estonia',
      },
    },
    services: {
      pill: 'Servicios',
      heading: { first: 'Lo que hacemos', second: 'por tu negocio.' },
      cards: {
        strategy: {
          title: 'Estrategia tecnológica',
          description:
            'Un diagnóstico claro y un plan de qué hacer y en qué orden, antes de invertir.',
        },
        software: {
          title: 'Software, web\ny nube',
          description:
            'Sitios, sistemas, portales y apps, con la nube donde viven y tus herramientas conectadas.',
        },
        automation: {
          title: 'Automatización, datos e IA',
          description:
            'Procesos que corren solos, datos que se vuelven decisiones e IA donde sí suma.',
        },
        design: {
          title: 'Diseño de producto\ny UX',
          description: 'Pantallas tan claras que tu equipo las usa sin manual.',
        },
      },
      also: {
        label: 'También, si lo necesitas',
        creative: 'Creativo',
        marketing: 'Marketing',
        note: 'Contenido, foto, video, redes y anuncios con nuestros aliados. Siempre se cotiza aparte.',
      },
    },
    howWeWork: {
      pill: 'Cómo trabajamos',
      heading: {
        first: 'Primero entendemos tu operación,',
        second: 'después decidimos qué se construye.',
      },
      steps: {
        assessment: {
          title: 'Diagnóstico',
          description:
            'Una revisión rápida para ver qué conviene resolver. Si hace falta ir a fondo, se cotiza aparte.',
          descriptionShort:
            'Una revisión rápida para ver qué conviene resolver.',
          commitment: 'Te decimos qué te conviene',
        },
        proposal: {
          title: 'Propuesta',
          description: 'Alcance, tiempos y costo por escrito.',
          commitment: 'Solo lo que necesitas',
        },
        design: {
          title: 'Diseño',
          description: 'Ves cómo va a funcionar antes de construir nada.',
          commitment: 'Tú apruebas cada pantalla',
        },
        build: {
          title: 'Construcción',
          description: 'Avanzamos por etapas y te mostramos cada avance.',
          commitment: 'Un solo punto de contacto',
        },
        launch: {
          title: 'Lanzamiento y soporte',
          description: 'Lo ponemos en marcha y preparamos a tu equipo.',
          commitment: 'Todo documentado y tuyo',
        },
      },
    },
  },
  en: {
    hero: {
      pill: {
        strategy: 'Technology strategy',
        software: 'Software, web and cloud',
        automation: 'Automation, data and AI',
        design: 'Product design and UX',
      },
      headline: { first: 'We speak business', second: 'and code.' },
      subtitle:
        'We design and build the digital solutions your business uses every day.',
      primary: 'Free assessment',
      secondary: 'How we work',
    },
    whoWeAre: {
      pill: 'Who we are',
      heading: {
        first: 'A core team and trusted partners,',
        second: 'shaped by what your project needs.',
      },
      body: 'Strategy, design and engineering work together from day one. When the project calls for it, we bring in partners held to the same standard, wherever they are.',
      legend: {
        team: 'Team',
        partner: 'Partners',
        soon: 'Estonia · soon',
        anywhere: 'We work with clients in any country.',
      },
      regions: { label: 'Map region', america: 'Americas', europe: 'Europe' },
      cities: {
        cdmx: 'CDMX',
        puebla: 'Puebla',
        merida: 'Mérida',
        dublin: 'Dublin',
        nyc: 'NYC',
        sanFrancisco: 'San Francisco',
        losAngeles: 'Los Angeles',
        amsterdam: 'Amsterdam',
        estonia: 'Estonia',
      },
    },
    services: {
      pill: 'Services',
      heading: { first: 'What we do', second: 'for your business.' },
      cards: {
        strategy: {
          title: 'Technology\nstrategy',
          description:
            'A clear diagnosis and a plan for what to do, and in what order, before you invest.',
        },
        software: {
          title: 'Software, web\nand cloud',
          description:
            'Websites, systems, portals and apps, with the cloud they run on and your tools connected.',
        },
        automation: {
          title: 'Automation,\ndata and AI',
          description:
            'Processes that run themselves, data that turns into decisions, and AI where it truly helps.',
        },
        design: {
          title: 'Product design\nand UX',
          description: 'Screens so clear your team uses them without a manual.',
        },
      },
      also: {
        label: 'Also, if you need it',
        creative: 'Creative',
        marketing: 'Marketing',
        note: 'Content, photo, video, social media and ads with our partners. Always quoted separately.',
      },
    },
    howWeWork: {
      pill: 'How we work',
      heading: {
        first: 'First we understand how you operate,',
        second: 'then we decide what gets built.',
      },
      steps: {
        assessment: {
          title: 'Assessment',
          description:
            "A quick review to see what's worth solving. If it needs a deeper look, that's quoted separately.",
          descriptionShort: "A quick review to see what's worth solving.",
          commitment: 'We tell you what fits best',
        },
        proposal: {
          title: 'Proposal',
          description: 'Scope, timeline and cost in writing.',
          commitment: 'Only what you need',
        },
        design: {
          title: 'Design',
          description: 'You see how it works before anything is built.',
          commitment: 'You approve every screen',
        },
        build: {
          title: 'Build',
          description: 'We work in stages and show you every step.',
          commitment: 'One point of contact',
        },
        launch: {
          title: 'Launch and support',
          description: 'We launch it and get your team ready.',
          commitment: 'Documented and all yours',
        },
      },
    },
  },
}

const SECTIONS = ['hero', 'whoWeAre', 'services', 'howWeWork'] as const

describe('landing copy · the Muush 1.0 home (FR-030)', () => {
  for (const locale of ['es', 'en'] as const) {
    for (const section of SECTIONS) {
      it(`should hold the approved ${section} copy verbatim when the ${locale} locale is read`, () => {
        expect(readLanding(locale)[section]).toEqual(EXPECTED[locale][section])
      })
    }
  }

  it('should carry only the v2 sections and the v1 contact when the locales are read', () => {
    /* FR-025: the v1 Propósito, hero and services keys have no reader. */
    for (const locale of ['es', 'en'] as const) {
      expect(Object.keys(readLanding(locale)), locale).toEqual([
        'hero',
        'whoWeAre',
        'services',
        'howWeWork',
        'contact',
      ])
    }
  })

  it('should store the uppercase-drawn label in sentence case when the locales are read', () => {
    const es = readLanding('es').services as Tree
    const en = readLanding('en').services as Tree

    expect((es.also as Tree).label).not.toBe(
      ((es.also as Tree).label as string).toUpperCase()
    )
    expect((en.also as Tree).label).toBe('Also, if you need it')
  })

  it('should keep no dash pause and no arrow in the home copy when the locales are read', () => {
    /* messaging.md rule 1; the arrow belongs to the button (rules.md § R50). */
    for (const locale of ['es', 'en'] as const) {
      const text = JSON.stringify(
        SECTIONS.map(section => readLanding(locale)[section])
      )
      expect(text, locale).not.toMatch(/—|→/)
    }
  })
})
