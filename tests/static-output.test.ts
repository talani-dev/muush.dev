import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { CALL_BOOKING_URL } from '@/shared/data/callBooking'

/**
 * The deployed artefact, asserted directly.
 *
 * SC-001 ("4 routes resolve and `/` reaches the Spanish home"; the English
 * home since feature 37), SC-003 ("the toggle resolves correctly from all 4 routes in both directions") and
 * acceptance criterion 6 ("a layout renders the shell on every page;
 * `about.vue` resolves at `/es/nosotros` and `/en/about`") are all claims
 * about what `pnpm generate` writes. None of them is observable from a
 * mounted component: a component test cannot tell you that a route produced a
 * file, and the pure resolver's unit tests deliberately feed it hand-written
 * paths so that they test this repository rather than `@nuxtjs/i18n`. What is
 * missing there — and supplied here — is that the **real** route table
 * produces the paths those tests assume.
 *
 * `tests/global-setup.ts` rebuilds the site before this file runs, so these
 * assertions can never pass against a stale artefact.
 *
 * Paths are built with `node:path`, not `new URL`: the global environment is
 * `happy-dom`, whose `URL` implementation `node:fs` rejects
 * (docs/business/rules.md §§ R16, R27).
 */
const OUTPUT = join(process.cwd(), '.output', 'public')

/** Route path → the file Nitro writes for it. */
const DOCUMENTS = {
  '/es': join('es', 'index.html'),
  '/en': join('en', 'index.html'),
  '/es/nosotros': join('es', 'nosotros', 'index.html'),
  '/en/about': join('en', 'about', 'index.html'),
  /* Feature 46 · Preguntas (`i18n.pages.faq`). */
  '/es/preguntas': join('es', 'preguntas', 'index.html'),
  '/en/faq': join('en', 'faq', 'index.html'),
  /* Feature 48 · the legal pages (`i18n.pages.privacy`, `.terms`). */
  '/es/privacidad': join('es', 'privacidad', 'index.html'),
  '/en/privacy': join('en', 'privacy', 'index.html'),
  '/es/terminos': join('es', 'terminos', 'index.html'),
  '/en/terms': join('en', 'terms', 'index.html'),
} as const

type RoutePath = keyof typeof DOCUMENTS

/** The equivalent route in the other locale — the 8 transitions of SC-003. */
const EQUIVALENT_ROUTE: Record<RoutePath, RoutePath> = {
  '/es': '/en',
  '/en': '/es',
  '/es/nosotros': '/en/about',
  '/en/about': '/es/nosotros',
  '/es/preguntas': '/en/faq',
  '/en/faq': '/es/preguntas',
  '/es/privacidad': '/en/privacy',
  '/en/privacy': '/es/privacidad',
  '/es/terminos': '/en/terms',
  '/en/terms': '/es/terminos',
}

const ROUTES = Object.keys(DOCUMENTS) as RoutePath[]

function documentFor(route: RoutePath): string {
  return readFileSync(join(OUTPUT, DOCUMENTS[route]), 'utf8')
}

/** Every file under `.output/public`, recursively — the deployed file set. */
function everyEmittedFile(directory: string = OUTPUT): string[] {
  return readdirSync(directory).flatMap(entry => {
    const path = join(directory, entry)
    return statSync(path).isDirectory() ? everyEmittedFile(path) : [path]
  })
}

/** The emitted stylesheets, concatenated — where the font faces land. */
function emittedCss(): string {
  return everyEmittedFile(join(OUTPUT, '_nuxt'))
    .filter(path => path.endsWith('.css'))
    .map(path => readFileSync(path, 'utf8'))
    .join('\n')
}

/**
 * The locale toggle's rendered link. It is the only `<a>` carrying an
 * `hreflang`, because the mobile menu's copy of the toggle is behind the open
 * flag and is not server-rendered.
 */
function localeToggleLinks(html: string): { href: string; hreflang: string }[] {
  return [...html.matchAll(/<a href="([^"]*)"[^>]*hreflang="([a-z-]+)"/g)].map(
    match => ({ href: match[1] ?? '', hreflang: match[2] ?? '' })
  )
}

/**
 * A document's text as a reader gets it: tags and Vue's fragment comments
 * dropped, the entities SSR writes decoded, whitespace collapsed.
 */
function visibleText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<[^>]*>/g, '')
    .replaceAll('&#39;', "'")
    .replaceAll('&quot;', '"')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&')
    .replace(/\s+/g, ' ')
}

describe('static output · routes', () => {
  it('should write a document for every route when generated', () => {
    for (const route of ROUTES) {
      expect(() => documentFor(route), route).not.toThrow()
      expect(documentFor(route), route).toContain('<html')
    }
  })

  it('should write a document at the root pointing at the English home', () => {
    /* `/` has no page and `i18n.rootRedirect` emits no file, so the object at
       the root is the committed `public/index.html`
       (docs/business/rules.md § R25). If that fallback is ever dropped, a
       visitor typing `muush.dev` reaches whatever the host does with a
       missing key — so its presence is asserted on the build, not on the
       source file. */
    const root = readFileSync(join(OUTPUT, 'index.html'), 'utf8')

    /* Feature 37: English is the site default, so every hand-written pointer
       in the root object names `/en`, matching `i18n.rootRedirect`. */
    expect(root).toContain('<html lang="en-US">')
    expect(root).toMatch(/<meta http-equiv="refresh" content="0; url=\/en"/)
    expect(root).toMatch(
      /<link rel="canonical" href="https:\/\/muush\.dev\/en"/
    )
    expect(root).toContain(
      '<link rel="alternate" hreflang="x-default" href="https://muush.dev/en" />'
    )
    expect(root).toContain('<a href="/en">')
    expect(root).not.toMatch(/url=\/es|href="\/es"|canonical" href="[^"]*\/es"/)
    /* Feature 35: the hand-written alternates mirror the i18n `language`
       tags, and the object stays out of the index. */
    expect(root).toContain(
      '<link rel="alternate" hreflang="en-US" href="https://muush.dev/en" />'
    )
    expect(root).toContain('<meta name="robots" content="noindex" />')
  })

  it('should resolve the About page at both localized paths from one page', () => {
    /* The segment is translated, so the two paths are not a prefix apart. One
       page component serves both; the `#trabaja-con-muush` target the footer
       points at (feature 43) is what proves the same component rendered. */
    const pages = readdirSync(join(process.cwd(), 'app', 'pages')).filter(
      file => file !== 'index.vue'
    )

    /* Feature 46 added `faq.vue`, feature 48 the two legal pages; still one
       file per page, both locales. */
    expect(pages).toEqual(['about.vue', 'faq.vue', 'privacy.vue', 'terms.vue'])
    expect(documentFor('/es/nosotros')).toContain('id="trabaja-con-muush"')
    expect(documentFor('/en/about')).toContain('id="trabaja-con-muush"')
  })

  it('should resolve Preguntas at both localized paths from one page', () => {
    /* Feature 46 · FR-030, FR-033: `/es/preguntas` ↔ `/en/faq`; the page
       title is the approved one since feature 51. */
    expect(visibleText(documentFor('/es/preguntas'))).toContain(
      'Preguntas frecuentes.'
    )
    expect(visibleText(documentFor('/en/faq'))).toContain(
      'Frequently asked questions.'
    )
  })

  it('should resolve the legal pages at both localized paths with their final text', () => {
    /* Feature 48 · pen-extract-48 § 4. The prerendered HTML carries the
       legal text and no cookie banner: the banner is client-only. */
    expect(documentFor('/es/privacidad')).toContain(
      'Última actualización: 7 de noviembre de 2026'
    )
    expect(documentFor('/en/privacy')).toContain('Courtesy translation.')
    expect(documentFor('/es/terminos')).toContain('Ley aplicable')
    expect(documentFor('/en/terms')).toContain('Governing law')
    for (const route of ROUTES) {
      expect(documentFor(route), route).not.toContain('aviso-cookies-titulo')
    }
  })

  it('should link both legal pages from the footer of every page', () => {
    for (const route of ROUTES) {
      const locale = route.startsWith('/es') ? 'es' : 'en'
      const [privacy, terms] =
        locale === 'es'
          ? ['/es/privacidad', '/es/terminos']
          : ['/en/privacy', '/en/terms']

      expect(documentFor(route), route).toContain(`href="${privacy}"`)
      expect(documentFor(route), route).toContain(`href="${terms}"`)
    }
  })

  it('should leave no anchor without a destination on any page', () => {
    for (const route of ROUTES) {
      const danglingAnchors = [
        ...documentFor(route).matchAll(/<a (?![^>]*href=)[^>]*>/g),
      ]

      expect(danglingAnchors, route).toEqual([])
    }
  })
})

describe('static output · locale equivalence', () => {
  for (const route of ROUTES) {
    const equivalent = EQUIVALENT_ROUTE[route]

    it(`should point the toggle at ${equivalent} when the page is ${route}`, () => {
      const links = localeToggleLinks(documentFor(route))

      expect(links).toHaveLength(1)
      expect(links[0]?.href).toBe(equivalent)
    })

    it(`should mark the toggle with the other locale when the page is ${route}`, () => {
      const [link] = localeToggleLinks(documentFor(route))

      expect(link?.hreflang).toBe(equivalent.startsWith('/en') ? 'en' : 'es')
    })
  }

  it('should never render the toggle with a fragment already attached', () => {
    /* A fragment does not exist at generate time, so the rendered href is
       anchorless and the fragment is appended at click time (spec FR-021,
       docs/business/rules.md § R9). A `#` here would mean something baked one
       in. */
    for (const route of ROUTES) {
      const [link] = localeToggleLinks(documentFor(route))

      expect(link?.href, route).not.toContain('#')
    }
  })

  it('should never render the toggle with an empty destination', () => {
    /* `switchLocalePath` returns `''` when a route has no counterpart, and an
       empty href silently means "this page" (docs/business/rules.md § R22). */
    for (const route of ROUTES) {
      const [link] = localeToggleLinks(documentFor(route))

      expect(link?.href, route).not.toBe('')
    }
  })

  it('should build the hreflang alternates from the same route table', () => {
    /* Emitting an alternate that does not resolve is the failure Constitution
       Article VI names. These come from `useLocaleHead`, which reads the same
       table the toggle does — this asserts the two agree. */
    const html = documentFor('/es/nosotros')

    expect(html).toContain(
      '<link id="i18n-alt-en" rel="alternate" href="https://muush.dev/en/about" hreflang="en">'
    )
    expect(html).toContain(
      '<link id="i18n-alt-es" rel="alternate" href="https://muush.dev/es/nosotros" hreflang="es">'
    )
    /* The regional tags (feature 35, D3). The language-only `en`/`es` lines
       above are i18n's catch-alls and are still emitted next to them
       (spec A-04, research U-4 — measured, not assumed). */
    expect(html).toContain(
      '<link id="i18n-alt-en-US" rel="alternate" href="https://muush.dev/en/about" hreflang="en-US">'
    )
    expect(html).toContain(
      '<link id="i18n-alt-es-MX" rel="alternate" href="https://muush.dev/es/nosotros" hreflang="es-MX">'
    )
  })
})

describe('static output · the layout wraps every page', () => {
  const FOOTER_COLUMN_TITLES: Record<'es' | 'en', string[]> = {
    es: ['Navegación', 'Contacto', 'muush', 'Redes'],
    en: ['Navigation', 'Contact', 'muush', 'Social'],
  }

  for (const route of ROUTES) {
    const locale = route.startsWith('/en') ? 'en' : 'es'

    it(`should render the nav and the footer when the page is ${route}`, () => {
      /* No page composes the shell itself (spec FR-004): if the layout stops
         supplying it, every page loses it at once. */
      const html = documentFor(route)

      expect(html).toMatch(/<nav aria-label="[^"]+"/)
      expect(html).toContain('<footer')
      for (const title of FOOTER_COLUMN_TITLES[locale]) {
        expect(html, `${route} · ${title}`).toContain(title)
      }
    })
  }

  for (const route of ROUTES) {
    it(`should paint the plain Negro 950 canvas with no dotted paper when the page is ${route}`, () => {
      /*
       * Feature 43 (spec FR-039, User Story 7) retires the v1 dotted paper,
       * the red-dot spotlight and the section glows. This **supersedes**
       * feature 42's acceptance "El cursor personalizado y el spotlight
       * (features 8 y 34) siguen funcionando" for the spotlight half
       * (Roberto, 2026-11-01); the "You" cursor half still holds
       * (`tests/brand-cursor.test.ts`).
       *
       * The layout root is still the page's single, positioned stacking
       * context and clips horizontally with `clip`, never `hidden`, so it is
       * not a scroll container.
       */
      const html = documentFor(route)
      const layoutRoot = html.match(
        /<div class="([^"]*bg-negro-950[^"]*)"/
      )?.[1]

      expect(layoutRoot, route).toBeDefined()
      for (const utility of ['relative', 'isolate', 'overflow-x-clip']) {
        expect(layoutRoot?.split(' '), `${route} · ${utility}`).toContain(
          utility
        )
      }
      expect(html, route).not.toContain('dot-grid')
    })
  }

  for (const route of ROUTES) {
    it(`should ship no cursor spotlight, markup or stylesheet, when the page is ${route}`, () => {
      /* Feature 43 supersedes feature 42's "spotlight sigue funcionando"
         (Roberto, 2026-11-01): the layout no longer mounts it, so neither its
         element nor its inlined scoped style reaches any document. */
      expect(documentFor(route), route).not.toContain('cursor-spotlight')
    })
  }

  for (const route of ROUTES) {
    it(`should hide every v1 section glow when the page is ${route}`, () => {
      /* Feature 43 (spec FR-040): the glows stay in the markup until features
         44–46 replace their sections, inside a wrapper that is never
         displayed. */
      const backdrops = [
        ...documentFor(route).matchAll(
          /<div[^>]*class="(section-backdrop[^"]*)"/g
        ),
      ].map(match => match[1]?.split(' ') ?? [])

      for (const classes of backdrops) {
        expect(classes, route).toContain('hidden')
      }
    })
  }

  for (const route of ['/es', '/en/about'] as const) {
    it(`should render the footer transparent over the canvas when the page is ${route}`, () => {
      /* Feature 43 (spec FR-030): the v1 footer's flat ink-500 band is gone;
         the footer is transparent with a 1 px Blanco 8 % rule on top. */
      const tag = documentFor(route).match(/<footer[^>]*>/)?.[0]
      const classes = tag?.match(/class="([^"]*)"/)?.[1]?.split(' ') ?? []

      expect(tag, route).toBeDefined()
      expect(classes, route).toEqual(
        expect.arrayContaining(['border-t', 'border-blanco-8'])
      )
      expect(
        classes.some(name => name.startsWith('bg-')),
        route
      ).toBe(false)
    })
  }

  it('should render the same header on the landing and on About except the current page', () => {
    /*
     * One responsive header with no per-page variant (feature 3, § 9.bis;
     * feature 43). Excluded from the comparison, and required to differ:
     * the destinations (the toggle resolves per page) and the current-page
     * marking (Nosotros on About: `aria-current`, the active fill and the
     * decorative dot, spec FR-027). The CTA no longer differs at all: it is
     * shown on every page (spec FR-004, confirmed by Roberto 2026-11-01).
     */
    const navMarkup = (route: RoutePath) =>
      documentFor(route)
        .match(/<nav[\s\S]*?<\/nav>/)?.[0]
        .replaceAll(/ href="[^"]*"/g, '')
        .replaceAll(' aria-current="page"', '')
        .replaceAll(/ ?router-link-(exact-)?active/g, '')
        .replaceAll(/<span data-punto[^>]*><\/span>/g, '<!---->')
        .replaceAll('bg-blanco-8 text-blanco', 'text-texto-suave')
        /* Collapse the whitespace the strips above leave behind. */
        .replaceAll(/class="\s+/g, 'class="')

    const landingNav = navMarkup('/es')

    expect(landingNav).toBeDefined()
    expect(navMarkup('/es/nosotros')).toBe(landingNav)
  })

  it('should mark Nosotros as the current page on About and only Home on the landing', () => {
    /* Spec FR-027, FR-028 (confirmed by Roberto 2026-11-01): route items
       are current on their own page; the scroll-spy runs only after mount,
       so the prerendered landing marks no section. It is at its top, so
       the Home item is lit there and nowhere else (Home link added by
       Roberto 2026-11-01). */
    /* The link bar only. Since feature 44 the logo links carry no
       `aria-current` at all (FR-028); "the Muush 1.0 home" block pins it. */
    const current = (route: RoutePath) =>
      [
        ...(documentFor(route).match(/<nav[\s\S]*?<\/ul>/)?.[0] ?? '').matchAll(
          /aria-current="([^"]+)"[^>]*>(?:<span[^>]*><\/span>)?\s*([^<]+?)\s*</g
        ),
      ].map(match => [match[1], match[2]])

    expect(current('/es')).toEqual([['page', 'Inicio']])
    expect(current('/en')).toEqual([['page', 'Home']])
    expect(current('/es/nosotros')).toEqual([['page', 'Nosotros']])
    expect(current('/en/about')).toEqual([['page', 'About']])
    /* Feature 51 · OQ-2 = A: Preguntas is lit on its own page only. */
    expect(current('/es/preguntas')).toEqual([['page', 'Preguntas']])
    expect(current('/en/faq')).toEqual([['page', 'FAQ']])
  })

  it('should show the header logo as the isotipo alone with its i18n name on every page', () => {
    /* Roberto 2026-11-01 (spec FR-059): no "muush.dev" wordmark in the
       header at any width; the footer keeps the full lockup. The wordmark's
       runs are the only `text-marca` text in the shell. */
    const logoLink = (route: RoutePath) =>
      documentFor(route).match(/<nav[^>]*>\s*(<a [\s\S]*?<\/a>)/)?.[1] ?? ''
    const footer = (route: RoutePath) =>
      documentFor(route).match(/<footer[\s\S]*<\/footer>/)?.[0] ?? ''

    for (const [route, name] of [
      ['/es', 'Inicio de muush'],
      ['/en', 'muush home'],
      ['/es/nosotros', 'Inicio de muush'],
      ['/en/about', 'muush home'],
    ] as const) {
      const link = logoLink(route)

      expect(link, route).toContain(`aria-label="${name}"`)
      expect(link, route).toContain('<svg')
      expect(link, route).not.toContain('text-marca')
      expect(footer(route), route).toContain('text-marca')
    }
  })

  it('should show the header CTA on every page from the first render', () => {
    /*
     * Feature 43 retires feature 9's hero reveal (spec FR-004, confirmed by
     * Roberto 2026-11-01): the CTA ships visible in every document, so there
     * is no hidden state and no `<noscript>` override any more (research R9).
     */
    for (const route of ROUTES) {
      const html = documentFor(route)
      const home = route.startsWith('/en') ? '/en' : '/es'
      const nav = html.match(/<nav[\s\S]*?<\/nav>/)?.[0]

      expect(nav, route).toMatch(
        new RegExp(`<a [^>]*href="${home}#diagnostico"`)
      )
      /* A link to a section of this page is not the current page. */
      expect(nav, route).not.toMatch(
        /aria-current="page" href="[^"]*#diagnostico"/
      )
      expect(html, route).not.toContain('site-nav__cta')
      expect(html, route).not.toMatch(/<noscript[^>]*><style>/)
    }
  })

  it('should send the footer call booking to the booking page on every route', () => {
    /*
     * `decisions-open.md` § Decisión 2 scopes the URL to the hero, the final
     * CTA and the footer. The footer renders on all four documents, so this is
     * where a silent return to `kind: 'none'` would be widest.
     */
    for (const route of ROUTES) {
      const footer = documentFor(route).match(/<footer[\s\S]*<\/footer>/)?.[0]
      const booking = footer?.match(
        new RegExp(`<a href="${CALL_BOOKING_URL}"[^>]*>`)
      )?.[0]

      expect(footer, route).toBeDefined()
      expect(booking, route).toBeDefined()
      expect(booking, route).toContain('target="_blank"')
      expect(booking, route).toContain('rel="noopener noreferrer"')
    }
  })

  it('should float the header fixed at the top without taking space in the flow', () => {
    /* Feature 43 (spec FR-009): `fixed`, so a section's background runs under
       it; visible in the prerendered state (the hide is client-only, so with
       no scripting it never hides); never printed. */
    for (const route of ROUTES) {
      const classes = documentFor(route)
        .match(/<header [^>]*class="([^"]*)"/)?.[1]
        ?.split(' ')

      expect(classes, route).toEqual(
        expect.arrayContaining([
          'fixed',
          'top-0',
          'inset-x-0',
          'print:hidden',
          'translate-y-0',
          'opacity-100',
        ])
      )
    }
  })
})

describe('static output · the header (feature 43)', () => {
  /*
   * The Muush 1.0 header (spec FR-001…FR-008): the mobile glass bar below
   * `lg`, the floating nav with its glass link bar from `lg`: Inicio ·
   * Servicios · Nosotros · Preguntas (Roberto 2026-11-08, feature 51
   * OQ-2 = A, which revoked the features 43 / 46 "footers only" ruling).
   */
  function navMarkup(route: RoutePath): string | undefined {
    return documentFor(route).match(/<nav[\s\S]*?<\/nav>/)?.[0]
  }

  for (const route of ROUTES) {
    it(`should carry the mobile bar below lg and the link bar from lg when the page is ${route}`, () => {
      const nav = navMarkup(route)
      const bar = nav?.match(/^<nav [^>]*class="([^"]*)"/)?.[1]?.split(' ')
      const linkBar = nav?.match(/<ul class="([^"]*)"/)?.[1]?.split(' ')

      expect(bar, route).toEqual(
        expect.arrayContaining([
          'rounded-header',
          'bg-nav-fondo',
          'border-linea',
          'backdrop-blur-header',
          'lg:bg-transparent',
          'lg:border-0',
          'max-w-contenido',
        ])
      )
      expect(linkBar, route).toEqual(
        expect.arrayContaining([
          'rounded-pill',
          'bg-nav-fondo',
          'backdrop-blur-cristal',
          'borde-luz',
          'borde-barra',
        ])
      )
    })

    it(`should never render Proyectos inside the nav when the page is ${route}`, () => {
      /* Proyectos: feature 15 is `blocked` (features 21, 24). */
      const nav = navMarkup(route)

      expect(nav, route).toBeDefined()
      for (const label of ['Proyectos', 'Projects']) {
        expect(nav, `${route} · ${label}`).not.toContain(label)
      }
    })

    it(`should list the four nav items in order, Preguntas last by route, when the page is ${route}`, () => {
      /* Feature 51 · OQ-2 = A; contract `build-output.md` § 1b. */
      const list = navMarkup(route)?.match(/<ul[\s\S]*?<\/ul>/)?.[0] ?? ''
      const links = [
        ...list.matchAll(/<a [^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g),
      ].map(match => [
        (match[2] ?? '').replace(/<[^>]*>/g, '').trim(),
        match[1],
      ])
      const spanish = !route.startsWith('/en')

      expect(
        links.map(([label]) => label),
        route
      ).toEqual(
        spanish
          ? ['Inicio', 'Servicios', 'Nosotros', 'Preguntas']
          : ['Home', 'Services', 'About', 'FAQ']
      )
      expect(links.at(-1)?.[1], route).toBe(
        spanish ? '/es/preguntas' : '/en/faq'
      )
    })
  }

  it('should render no "Proyectos"/"Projects" text anywhere in the static document (feature 23, item 9)', () => {
    /* Feature 48: the Términos' own legal text has a "Proyectos y
       propuestas" / "Projects and proposals" section, Roberto's wording,
       not the retired Projects section this guards against. Only that
       page's article is set aside. */
    const LEGAL_TERMS: RoutePath[] = ['/es/terminos', '/en/terms']
    for (const route of ROUTES) {
      const document = documentFor(route)
      const html = LEGAL_TERMS.includes(route)
        ? document.replace(/<article[\s\S]*<\/article>/, '')
        : document
      const locale = route.startsWith('/en') ? 'Projects' : 'Proyectos'

      expect(html, route).not.toContain(locale)
    }
  })

  it('should render the blog as text and the legal entries as links in the footer', () => {
    /*
     * Feature 43 (spec FR-031…FR-033, SC-006): "Blog · próximamente" is text
     * until its page exists. The privacy notice and the terms link to their
     * pages since feature 48.
     */
    for (const route of ROUTES) {
      const footer = documentFor(route).match(/<footer[\s\S]*<\/footer>/)?.[0]
      const linked = [...(footer ?? '').matchAll(/<a [^>]*>([\s\S]*?)<\/a>/g)]
        .map(match => match[1] ?? '')
        .join(' ')

      expect(footer, route).toBeDefined()
      expect(footer, route).toContain('Blog')
      expect(linked, route).not.toContain('Blog')
      const labels = route.startsWith('/es')
        ? ['Aviso de privacidad', 'Términos y condiciones']
        : ['Privacy notice', 'Terms and conditions']
      for (const label of labels) {
        expect(linked, `${route} · ${label}`).toContain(label)
      }
    }
  })

  it('should link Preguntas from the footer to the same-locale route', () => {
    /* Feature 46 · FR-031 (Roberto 2026-11-02): the desktop MUUSH column and
       the mobile link line, by route name, so `/es/preguntas` ↔ `/en/faq`. */
    for (const route of ROUTES) {
      const footer = documentFor(route).match(/<footer[\s\S]*<\/footer>/)?.[0]
      const spanish = !route.startsWith('/en')
      const label = spanish ? 'Preguntas' : 'FAQ'
      const href = spanish ? '/es/preguntas' : '/en/faq'
      const links = [
        ...(footer ?? '').matchAll(
          /<a [^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g
        ),
      ].filter(
        match => (match[2] ?? '').replace(/<[^>]*>/g, '').trim() === label
      )

      expect(links.length, route).toBe(2)
      for (const link of links) expect(link[1], route).toBe(href)
    }
  })

  it('should carry the arrow on the nav CTA as a separate element, after the label, never inside the copy', () => {
    /* The v2 primary button draws the lucide arrow after the label, hidden
       from assistive technology (feature 42); the copy carries no arrow. */
    for (const route of ROUTES) {
      const cta = navMarkup(route)?.match(
        /<a [^>]*href="[^"]*#diagnostico"[^>]*>([\s\S]*?)<\/a>/
      )?.[1]

      expect(cta, route).toBeDefined()
      expect(cta, route).toMatch(/^<span[^>]*>[^<]+<\/span><span data-icono/)
      expect(cta, route).toContain('aria-hidden="true"')
    }

    const locales = ['es', 'en'] as const
    for (const localeFile of locales) {
      const raw = readFileSync(
        join(process.cwd(), 'i18n', 'locales', `${localeFile}.json`),
        'utf8'
      )
      const parsed = JSON.parse(raw) as { shell: { nav: { cta: string } } }

      expect(parsed.shell.nav.cta, localeFile).not.toContain('→')
    }
  })

  it('should render exactly one language toggle per document', () => {
    for (const route of ROUTES) {
      const [toggle] = localeToggleLinks(documentFor(route))

      expect(toggle, route).toBeDefined()
    }
  })

  it('should render no menu button and no open menu in the prerendered document', () => {
    /* Spec FR-008: the menu needs scripting, so its button appears only after
       mount and the dialog only when open. Without scripting the footer is
       the full navigation on phones. */
    for (const route of ROUTES) {
      /* Feature 51 · the Preguntas accordion's questions carry their own
         `aria-expanded`; the block is set aside, the shell is what is
         checked. */
      const html = documentFor(route).replace(
        /<section[^>]*data-faq[\s\S]*?<footer/,
        '<footer'
      )

      expect(html, route).not.toContain('role="dialog"')
      expect(html, route).not.toContain('aria-expanded')
    }
  })
})

describe('static output · the canvas under the document', () => {
  /*
   * Feature 010, the white band.
   *
   * The layout root is a `<div>`. A `<div>` does not paint the canvas, so
   * wherever the document reached past it — the Hero's `cierre` glow made it
   * 159px taller at 1440 (`findings.md` § R54) — and wherever a visitor
   * overscrolls past the end, the browser painted its own white. On a site that
   * is dark end to end that is `rgb(255,255,255)` below the footer, and the
   * overscroll case happens at **any** page height, so no future section can
   * mask it.
   *
   * Two mechanisms, asserted separately because neither substitutes for the
   * other and either one can be reverted alone:
   *
   * 1. `html` carries the ink surface, so the canvas inherits it (CSS
   *    Backgrounds 3 § 3.11.2). This is the one that covers overscroll.
   * 2. The layout root clips **both** axes, so decoration cannot lengthen the
   *    document past the content that defines its height.
   *
   * ⚠️ These are assertions about the emitted artefact, not about pixels.
   * `happy-dom` paints nothing, so a test claiming to measure a colour here
   * would be green forever (`rules.md` § R27). The pixels were measured in
   * Chrome against this same `.output/public` and recorded in `findings.md`;
   * what this file can prove is that the two declarations survive, which is
   * what a future glow would silently take away.
   */

  it('should paint the document canvas with the Negro 950 base when the site is generated', () => {
    const css = emittedCss()

    /* On `html`, not on `body`: the canvas takes the root element's background
       and falls through to `body` only when the root's is transparent, so
       declaring it on `html` is what makes ONE declaration decide the canvas
       instead of two. `body` alone would also paint it — measured, not assumed
       (reviewer, 2026-09-08) — but it would leave the outcome depending on
       `html` staying transparent. What can never paint the canvas is the
       layout root, because it is a `<div>`, and that is the actual defect. */
    /* Feature 42: the v2 canvas is Negro 950 (spec FR-009). */
    expect(css).toMatch(/html\s*\{[^}]*background-color:\s*var\(--negro-950\)/)
    /* And the token it names has to be reachable, or the rule resolves to
       nothing in silence — the trap `findings.md` § R46 records. */
    expect(css).toMatch(/--negro-950:\s*#050505/i)
  })

  it('should leave no other background on the root or the body when the site is generated', () => {
    /* The complement: one declaration decides the canvas. A second one, on
       either element, would decide it instead depending on order — which is how
       this defect would come back without anybody editing the rule above. */
    const backgroundsOnCanvasElements = [
      ...emittedCss().matchAll(/(^|[\s,}])(html|body)\s*\{([^}]*)\}/g),
    ].filter(rule => /background(-color|-image)?\s*:/.test(rule[3] ?? ''))

    expect(backgroundsOnCanvasElements).toHaveLength(1)
  })

  for (const route of ROUTES) {
    it(`should clip the layout root horizontally only when the page is ${route}`, () => {
      /*
       * `clip`, not `hidden`, so the root never becomes a scroll container
       * (feature 006 `research.md` § R3). Feature 010 also clipped the
       * vertical axis, only because the v1 glows could lengthen the document;
       * feature 43 retired the glows, so only the horizontal clip remains,
       * for full-bleed sections (contract § 10).
       */
      const layoutRoot = documentFor(route)
        .match(/<div class="([^"]*bg-negro-950[^"]*)"/)?.[1]
        ?.split(' ')

      expect(layoutRoot, route).toContain('overflow-x-clip')
      expect(layoutRoot, route).not.toContain('overflow-clip')
      expect(layoutRoot, route).not.toContain('overflow-hidden')
    })
  }
})

describe('static output · the Muush 1.0 home (feature 44)', () => {
  /*
   * Claims only the artefact can settle (spec US1, US5, FR-001, FR-006,
   * FR-020, FR-026, FR-027, SC-003, SC-007): the v2 sections reach the
   * prerendered HTML in order and in each locale, both hero actions are
   * plain links to sections that exist, no link anywhere points at a
   * missing id, the map is inline, and the no-script state is America and
   * a full, lit timeline. A browser without scripting renders exactly these
   * documents.
   */
  const HERO = {
    es: {
      headline: ['Hablamos negocio', 'y código.'],
      subtitle:
        'Diseñamos y construimos las soluciones digitales que tu negocio usa todos los días.',
      primary: 'Diagnóstico gratis',
      secondary: 'Cómo trabajamos',
    },
    en: {
      headline: ['We speak business', 'and code.'],
      subtitle:
        'We design and build the digital solutions your business uses every day.',
      primary: 'Free assessment',
      secondary: 'How we work',
    },
  } as const

  /** The hero `<section>`, found by the one class only it carries on the home. */
  function heroSection(route: RoutePath): string {
    const hero = documentFor(route).match(
      /<section class="[^"]*min-h-portada-alto[^"]*"[\s\S]*?<\/section>/
    )?.[0]
    expect(hero, route).toBeDefined()
    return hero ?? ''
  }

  /** The `<a>` whose text includes `label`, with its attributes. */
  function linkTo(html: string, label: string): string | undefined {
    return [...html.matchAll(/<a [^>]*>[\s\S]*?<\/a>/g)]
      .map(match => match[0])
      .find(
        link =>
          link.includes(`<span>${label}</span>`) || link.includes(`>${label}<`)
      )
  }

  for (const route of ['/es', '/en'] as const) {
    const locale = route === '/en' ? 'en' : 'es'

    it(`should render the v2 hero in its own locale when the page is ${route}`, () => {
      const hero = heroSection(route)
      const copy = HERO[locale]

      for (const text of [
        ...copy.headline,
        copy.subtitle,
        copy.primary,
        copy.secondary,
      ]) {
        expect(hero, `${route} · ${text}`).toContain(text)
      }
    })

    it(`should render the hero headline as the page's only h1 when the page is ${route}`, () => {
      const headings = [
        ...documentFor(route).matchAll(/<h1[\s>][\s\S]*?<\/h1>/g),
      ]

      expect(headings, route).toHaveLength(1)
      expect(heroSection(route), route).toContain(headings[0]?.[0])
    })

    it(`should link both hero actions to sections of the home when the page is ${route}`, () => {
      const hero = heroSection(route)
      const primary = linkTo(hero, HERO[locale].primary)
      const secondary = linkTo(hero, HERO[locale].secondary)

      expect(primary, route).toContain(`href="${route}#diagnostico"`)
      expect(secondary, route).toContain(`href="${route}#como-trabajamos"`)
      expect(primary, route).not.toContain('aria-current')
      expect(secondary, route).not.toContain('aria-current')
    })

    it(`should render the sections in the design's order when the page is ${route}`, () => {
      const html = documentFor(route)
      const positions = [
        html.indexOf('min-h-portada-alto'),
        html.indexOf('data-mapa'),
        html.indexOf('<section id="servicios"'),
        html.indexOf('<section id="como-trabajamos"'),
        html.indexOf('<section id="diagnostico"'),
        html.indexOf('<footer'),
      ]

      expect(
        positions.every(position => position > -1),
        route
      ).toBe(true)
      expect(
        [...positions].sort((a, b) => a - b),
        route
      ).toEqual(positions)
    })

    it(`should carry no retired section and no link to one when the page is ${route}`, () => {
      const html = documentFor(route)

      expect(html, route).not.toContain('id="proposito"')
      expect(html, route).not.toMatch(/href="[^"]*#(proposito|proyectos)"/)
      expect(html, route).not.toContain('pt-hero-top')
      expect(html, route).not.toContain('pt-services-top')
    })

    it(`should inline the dotted map and show America with no script when the page is ${route}`, () => {
      const html = documentFor(route)
      const panel = html.match(/<div[^>]*data-mapa[^>]*>/)?.[0] ?? ''

      expect(html, route).toContain('viewBox="0 0 1408 470"')
      expect(panel, route).toContain('role="tabpanel"')
      expect(panel, route).toMatch(/--mapa-ancho:\s*494\.03/)
      expect(html, route).toMatch(
        /aria-selected="true"[^>]*>\s*(América|Americas)\s*</
      )
    })

    it(`should prerender the rail full and the desktop columns unlit when the page is ${route}`, () => {
      /* FR-020 for the mobile rail (full and lit without scripting);
         FR-044 for desktop (Roberto, clarification 2026-11-02): no scroll
         fill, so no red on the line and no column lit until previewed. */
      const html = documentFor(route)
      const start = html.indexOf('<section id="como-trabajamos"')
      const section = html.slice(start, html.indexOf('</ol>', start))

      expect(section, route).toMatch(/--progreso:\s*0[;"]/)
      expect(section.match(/<li data-lit="true"/g), route).toHaveLength(5)
      expect(section, route).not.toContain('data-column-lit')
    })
  }

  it('should make the map no request of its own when the site is generated', () => {
    const files = everyEmittedFile()

    expect(files.filter(path => path.includes('world-dots'))).toEqual([])
    for (const route of ['/es', '/en'] as const) {
      expect(documentFor(route), route).not.toContain('world-dots')
    }
  })

  it('should point every fragment link at an id its target page carries when generated', () => {
    /* FR-026, SC-007: home, About and the 404 in both locales. Internal
       links only (a path or a bare fragment); an external URL's `#` is not
       a fragment of this site (e.g. an escaped `&#39;` in the WhatsApp
       text). */
    const PAGES: Record<string, string> = {
      '/es': join('es', 'index.html'),
      '/en': join('en', 'index.html'),
      '/es/nosotros': join('es', 'nosotros', 'index.html'),
      '/en/about': join('en', 'about', 'index.html'),
      '/es/404': join('es', '404', 'index.html'),
      '/en/404': join('en', '404', 'index.html'),
    }
    const read = (path: string) => readFileSync(join(OUTPUT, path), 'utf8')
    const idsOf = (html: string) =>
      new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]))

    const checked: string[] = []
    for (const [page, file] of Object.entries(PAGES)) {
      const html = read(file)
      for (const match of html.matchAll(/href="(\/[^"#]*)?#([^"]+)"/g)) {
        const path = match[1] || page
        const target = PAGES[path.replace(/\/$/, '')]
        expect(target, `${page} → ${match[0]}`).toBeDefined()
        expect(
          idsOf(read(target ?? file)).has(match[2]),
          `${page} → ${match[0]}`
        ).toBe(true)
        checked.push(match[0])
      }
    }
    /* A check of nothing passes forever (rules.md § R39). */
    expect(checked.length).toBeGreaterThan(10)
  })

  it('should mark only the Home nav item, never a logo link, as the current page on the home', () => {
    /* FR-028, SC-009 (review-43c nit 5). The logo links are named by
       `shell.nav.home`; the header, the desktop and the mobile footer each
       render one (the open menu is not prerendered). */
    for (const [route, logo, home] of [
      ['/es', 'Inicio de muush', 'Inicio'],
      ['/en', 'muush home', 'Home'],
    ] as const) {
      const html = documentFor(route)
      const logos = [
        ...html.matchAll(/<a [^>]*aria-label="([^"]*)"[^>]*>/g),
      ].filter(match => match[1] === logo)
      const header = html.match(/<header[\s\S]*?<\/header>/)?.[0] ?? ''
      const current = [
        ...header.matchAll(/aria-current="page"[^>]*>[\s\S]*?<\/a>/g),
      ]

      expect(logos.length, route).toBeGreaterThanOrEqual(3)
      for (const link of logos) {
        expect(link[0], route).not.toContain('aria-current')
      }
      expect(current, route).toHaveLength(1)
      expect(current[0]?.[0], route).toContain(home)
    }
  })
})

describe('static output · the Diagnóstico y contacto section (feature 45)', () => {
  /*
   * Feature 45 replaced the v1 contact section with the Muush 1.0
   * "Diagnóstico y contacto" over the listón (spec FR-022…FR-025). Claims
   * only the artefact can settle: the shared anchor resolves on both homes,
   * the form ships `novalidate` with no `action`, the prerendered (and
   * no-script) page is the single view with every field, the optional
   * website field included since feature 49, the privacy box unticked and the submit unavailable until it is ticked
   * (FR-008, FR-009, FR-016). The network guards stay in "form submission
   * (feature 029)" below and in `tests/forms-config.test.ts`.
   */
  function assessmentSection(route: RoutePath): string {
    const html = documentFor(route)
    const start = html.indexOf('<section id="diagnostico"')

    expect(start, route).toBeGreaterThan(-1)

    let depth = 0
    for (const tag of html.slice(start).matchAll(/<(\/?)section[\s>]/g)) {
      depth += tag[1] === '/' ? -1 : 1
      if (depth === 0) return html.slice(start, start + tag.index + 10)
    }

    throw new Error(`unbalanced assessment section in ${route}`)
  }

  const HOMES = ['/es', '/en'] as const

  it('should carry id="diagnostico" and the CTAs that point at it on both homes', () => {
    for (const route of HOMES) {
      expect(documentFor(route), route).toContain('<section id="diagnostico"')
      expect(documentFor(route), route).toContain(`href="${route}#diagnostico"`)
    }
  })

  it('should paint the section over the listón with no v1 glow when generated', () => {
    for (const route of HOMES) {
      const section = assessmentSection(route)
      const root = section.match(
        /<section id="diagnostico" class="([^"]*)"/
      )?.[1]

      expect(root?.split(' '), route).toEqual(
        expect.arrayContaining(['relative', 'isolate'])
      )
      expect(section, route).toContain('<canvas')
      expect(section, route).toMatch(/<img[^>]*src="[^"]*\.webp"/)
      expect(section, route).not.toContain('size-glow-')
      expect(section, route).not.toContain('pt-contact-top')
    }
  })

  it('should render a native, unactioned form in the single view with every field when generated', () => {
    for (const route of HOMES) {
      const section = assessmentSection(route)
      const form = section.match(/<form[^>]*>/)?.[0]

      expect(form, route).toContain('novalidate')
      expect(form, route).not.toMatch(/\baction="/)
      for (const id of [
        'name',
        'email',
        'company',
        'identity',
        'need',
        'privacy',
      ]) {
        expect(section, `${route} #${id}`).toContain(`id="${id}"`)
      }
      expect(section, route).toContain('role="radiogroup"')
      expect(section, route).not.toContain('aria-live="polite"')
    }
  })

  it('should build the optional website field and no social field when generated', () => {
    /* Feature 49 (FR-060–FR-063): a plain, optional text input of at most
       300 characters, between "¿Cómo te identificas?" and "¿Qué necesitas?". */
    for (const route of HOMES) {
      const section = assessmentSection(route)
      const input = section.match(/<input[^>]*id="website"[^>]*>/)?.[0] ?? ''

      expect(input, route).toContain('type="text"')
      expect(input, route).toContain('maxlength="300"')
      expect(input, route).toContain('placeholder="https://"')
      expect(input, route).not.toContain('required')
      expect(input, route).not.toContain('name="muush_website"')
      expect(section.indexOf('id="identity"'), route).toBeLessThan(
        section.indexOf('id="website"')
      )
      expect(section.indexOf('id="website"'), route).toBeLessThan(
        section.indexOf('id="need"')
      )
      expect(section, route).not.toMatch(/id="social"/)
    }
    expect(assessmentSection('/es')).toContain(
      'Tu sitio web o redes (opcional)'
    )
    expect(assessmentSection('/en')).toContain(
      'Your website or social media (optional)'
    )
  })

  it('should ship the privacy box unticked and the submit unavailable until it is ticked', () => {
    for (const route of HOMES) {
      const section = assessmentSection(route)
      const box = section.match(/<input[^>]*id="privacy"[^>]*>/)?.[0]
      const submit = section.match(/<button[^>]*type="submit"[^>]*>/)?.[0]

      expect(box, route).toContain('type="checkbox"')
      /* The attribute, not the `checked:` / `disabled:` class variants. */
      expect(box, route).not.toMatch(/\schecked(=|\s|>)/)
      expect(submit, route).toContain('aria-disabled="true"')
      expect(submit, route).not.toMatch(/\sdisabled(=|\s|>)/)
      const hintId = submit?.match(/aria-describedby="([^"]+)"/)?.[1]
      expect(section, route).toMatch(
        new RegExp(`<p id="${hintId}" class="sr-only">`)
      )
    }
  })

  it("should title the section with an h2 under the hero's only h1", () => {
    for (const route of HOMES) {
      const section = assessmentSection(route)

      expect(section, route).toMatch(/<h2[\s>]/)
      expect(section, route).not.toMatch(/<h1[\s>]/)
    }
  })

  it('should ship no XMLHttpRequest from the compiled form chunk', () => {
    const scripts = everyEmittedFile(join(OUTPUT, '_nuxt'))
      .filter(path => path.endsWith('.js'))
      .map(path => readFileSync(path, 'utf8'))
      .filter(
        source =>
          source.includes('ContactForm') || source.includes('useContactForm')
      )

    expect(scripts.length).toBeGreaterThan(0)
    for (const source of scripts) {
      expect(source).not.toContain('XMLHttpRequest')
    }
  })
})

describe('static output · the about work section', () => {
  /*
   * Feature 020. Claims only the artefact can settle: `#work` (`#trabaja-con-muush` since feature 43) resolves to
   * the real section on both localized About documents (no more placeholder
   * heading), the eight-field form ships `novalidate` and a native submit
   * with no `action`, the three reused glows paint without breaking the
   * paint order, and the compiled application-form chunk never serializes
   * the CV as FormData or an object URL and never uses XMLHttpRequest.
   * Feature 029 superseded the original "no network call" claim: the form
   * and the CV now leave the browser, but only through the single `fetch(`
   * in `forms/logic/formsApiClient.ts`, which is guarded below in "form
   * submission (feature 029)" and in `tests/forms-config.test.ts`.
   */
  function workSection(route: RoutePath): string {
    const html = documentFor(route)
    const start = html.indexOf('<section id="trabaja-con-muush"')

    expect(start, route).toBeGreaterThan(-1)

    let depth = 0
    for (const tag of html.slice(start).matchAll(/<(\/?)section[\s>]/g)) {
      depth += tag[1] === '/' ? -1 : 1
      if (depth === 0) return html.slice(start, start + tag.index + 10)
    }

    throw new Error(`unbalanced work section in ${route}`)
  }

  it('should carry id="trabaja-con-muush" on both About documents', () => {
    /* The shared anchor the footer's "Trabaja con muush" links to (feature
       43, spec FR-025), on the v2 section since feature 46 (FR-020). */
    for (const route of ['/es/nosotros', '/en/about'] as const) {
      expect(documentFor(route), route).toContain(
        '<section id="trabaja-con-muush"'
      )
    }
  })

  it('should render a native, unactioned eight-field form with no destination when generated', () => {
    for (const route of ['/es/nosotros', '/en/about'] as const) {
      const section = workSection(route)
      const form = section.match(/<form[^>]*>/)?.[0]

      expect(form, route).toBeDefined()
      expect(form, route).toContain('novalidate')
      expect(form, route).not.toMatch(/\baction="/)
      expect(section, route).toContain('type="submit"')
      expect(section, route).toContain('type="file"')
      expect([...section.matchAll(/<optgroup/g)].length, route).toBe(6)
    }
  })

  it('should paint the section over the listón with no v1 glow when generated', () => {
    /* Feature 46 · FR-020, FR-027: the v1 glows and padding left with the v1
       section; the v2 one hosts the `workWithUs` shader over its poster. */
    for (const route of ['/es/nosotros', '/en/about'] as const) {
      const section = workSection(route)
      const root = section.match(
        /<section id="trabaja-con-muush" class="([^"]*)"/
      )?.[1]

      expect(root?.split(' '), route).toEqual(
        expect.arrayContaining(['relative', 'isolate'])
      )
      expect(root?.split(' '), route).not.toContain('pt-work-top')
      expect(section, route).toContain('<canvas')
      expect(section, route).toMatch(/<img[^>]*diagnostico-liston[^>]*>/)
      expect(section, route).not.toMatch(/size-glow-|data-section-glow/)
    }
  })

  it('should add no token to the closed glow namespace when generated', () => {
    /* `rules.md` § R36 — the guard stated where this feature can see it. */
    const glowTokens = [
      ...emittedCss().matchAll(/--(?:color|spacing)-glow-[\w-]+(?=\s*:)/g),
    ].map(([token]) => token)

    expect(glowTokens.filter(token => token.includes('work'))).toEqual([])
  })

  it('should never serialize the CV as FormData or an object URL in the compiled application-form chunk', () => {
    /*
     * Feature 020's "no network call" guarantee is superseded by feature 029
     * (spec FR-011): the CV now leaves the browser, but only as the raw body
     * of the presigned S3 PUT (contract § 4) — never as `FormData`, never as
     * an object URL, never through XMLHttpRequest.
     */
    const scripts = everyEmittedFile(join(OUTPUT, '_nuxt'))
      .filter(path => path.endsWith('.js'))
      .map(path => readFileSync(path, 'utf8'))
      .filter(
        source =>
          source.includes('ApplicationForm') ||
          source.includes('useApplicationForm') ||
          source.includes('FileField')
      )

    expect(scripts.length).toBeGreaterThan(0)
    for (const source of scripts) {
      expect(source).not.toContain('XMLHttpRequest')
      expect(source).not.toMatch(/new FormData\(/)
      expect(source).not.toContain('createObjectURL')
    }
  })
})

describe('static output · form submission (feature 029)', () => {
  const FORM_PAGES = ['/es', '/en', '/es/nosotros', '/en/about'] as const

  it('should render a form on all four pages that carry one', () => {
    for (const route of FORM_PAGES) {
      expect(documentFor(route), route).toMatch(/<form[^>]*novalidate/)
    }
  })

  it('should put no Turnstile script in any generated page (it loads only after engagement)', () => {
    /* Spec FR-021: the third-party script is inserted by the browser on the
       visitor's first focus in the form, never prerendered. */
    for (const route of ROUTES) {
      const scripts = documentFor(route).match(/<script[^>]*>/g) ?? []
      for (const tag of scripts) {
        expect(tag, route).not.toContain('challenges.cloudflare.com')
      }
    }
  })

  it('should render no preview state in the generated forms', () => {
    for (const route of FORM_PAGES) {
      const html = documentFor(route)
      expect(html, route).not.toMatch(/preview-?state/i)
      expect(html, route).not.toContain('role="status"')
      expect(html, route).not.toContain('role="alert"')
    }
  })

  it('should compile exactly two fetch( and no API host literal into the form chunk(s)', () => {
    /*
     * The artefact half of the network guard (the source half is in
     * `tests/forms-config.test.ts`). The two call sites, `globalThis.fetch(`
     * in `forms/logic/formsApiClient.ts` and in `forms/logic/edgeCountry.ts`
     * (feature 32 Amendment A1, same-origin `/__geo`), are bundled into the
     * form chunk(s). One more `fetch(` there means a third call site reached
     * the browser.
     *
     * The host check is scoped to the form chunk(s) ON PURPOSE. The base
     * URL default lives in `runtimeConfig.public.formsApiBaseUrl`
     * (`nuxt.config.ts`), so the host legitimately appears in the
     * serialized Nuxt config and payload in the generated HTML. It must
     * reach the browser only that way, never as a literal compiled into the
     * form code. The host is read from `nuxt.config.ts`, so changing the
     * default keeps this test in step.
     */
    const baseUrl = readFileSync(
      join(process.cwd(), 'nuxt.config.ts'),
      'utf8'
    ).match(/formsApiBaseUrl:\s*'([^']+)'/)?.[1]
    expect(baseUrl).toBeDefined()
    const host = new URL(baseUrl ?? '').host
    expect(host.length).toBeGreaterThan(0)

    const formChunks = everyEmittedFile(join(OUTPUT, '_nuxt'))
      .filter(path => path.endsWith('.js'))
      .map(path => readFileSync(path, 'utf8'))
      .filter(source =>
        /ContactForm|ApplicationForm|useContactForm|useApplicationForm|FileField/.test(
          source
        )
      )

    expect(formChunks.length).toBeGreaterThan(0)
    const fetchCalls = formChunks.reduce(
      (count, source) => count + [...source.matchAll(/\bfetch\s*\(/g)].length,
      0
    )
    expect(fetchCalls).toBe(2)
    for (const source of formChunks) {
      expect(source.includes(host)).toBe(false)
    }
  })

  it('should render the honeypot hidden from assistive technology on every form page', () => {
    for (const route of FORM_PAGES) {
      expect(documentFor(route), route).toMatch(
        /<div aria-hidden="true" class="sr-only"><input type="text" name="muush_website"[^>]*tabindex="-1"[^>]*autocomplete="off"/
      )
    }
  })
})

describe('static output · default country from the edge (feature 32 Amendment A1)', () => {
  /*
   * The default dial code comes from a same-origin `GET /__geo` answered by
   * muush-foundation's CloudFront function, never from the browser's
   * language, the Geolocation API or a third party (spec FR-A04..FR-A10).
   * The site ships no stand-in for that path: without the edge it is a 404
   * and the form stays on Mexico.
   */
  const scripts = () =>
    everyEmittedFile(join(OUTPUT, '_nuxt'))
      .filter(path => path.endsWith('.js'))
      .map(path => ({ path, source: readFileSync(path, 'utf8') }))
  const hostsIn = (source: string) =>
    [...source.matchAll(/https?:\/\/([a-z0-9.-]+)/gi)].map(match =>
      (match[1] ?? '').toLowerCase()
    )

  it('should compile the relative /__geo path into a client chunk', () => {
    /* The path as a whole quoted literal: relative, never part of a URL. */
    const withGeo = scripts().filter(
      ({ source }) =>
        source.includes('`/__geo`') ||
        source.includes("'/__geo'") ||
        source.includes('"/__geo"')
    )
    expect(withGeo.length).toBeGreaterThan(0)
    for (const { source } of withGeo) {
      expect(source).not.toMatch(/https?:\/\/[^"'`\s]*\/__geo/)
    }
  })

  it('should ship no Geolocation API call in any emitted script', () => {
    for (const { path, source } of scripts()) {
      expect(source, path).not.toContain('navigator.geolocation')
      expect(source, path).not.toContain('getCurrentPosition')
    }
  })

  it('should read no browser language in the chunk that asks for the country', () => {
    /* Scoped to the chunk(s) holding `/__geo`: the i18n module's own entry
       chunk carries a `navigator.languages` helper that the forms never
       use, and that is outside this feature. */
    const withGeo = scripts().filter(({ source }) => source.includes('/__geo'))
    expect(withGeo.length).toBeGreaterThan(0)
    for (const { path, source } of withGeo) {
      expect(source, path).not.toContain('navigator.languages')
    }
  })

  it('should prerender no country into any document', () => {
    for (const route of ROUTES) {
      expect(documentFor(route), route).not.toContain('"country":')
    }
  })

  it('should reach no geo or IP lookup host from any emitted script', () => {
    const hosts = new Set(scripts().flatMap(({ source }) => hostsIn(source)))
    for (const host of hosts) {
      expect(host).not.toMatch(/geo|(^|[.-])ip([.-]|$)/)
    }
  })

  it('should ship no /__geo file in the output or in public/', () => {
    const fixtures = [
      ...everyEmittedFile(),
      ...everyEmittedFile(join(process.cwd(), 'public')),
    ].filter(path => path.includes('__geo'))

    expect(fixtures).toEqual([])
  })
})

describe('static output · the brand type is self-hosted', () => {
  /*
   * Feature 006, FR-015 / SC-007. `@nuxt/fonts` resolves the families from
   * Google at **build** time and writes the binaries into
   * `.output/public/_fonts`; the deployed artefact must therefore be
   * self-contained, with no runtime request to a third party (Constitution
   * Article IV).
   *
   * This is the mechanical half of the check. The other half — that the site
   * visibly renders in Poppins and Instrument Sans rather than in a fallback
   * that happens to be loaded — cannot be asserted here and is a by-eye task
   * (feature 006 `quickstart.md` § 4, `research.md` § R7).
   *
   * The rule this enforces is the standing one: verify against
   * `.output/public`, never against the dev server or the catalogue
   * (docs/business/rules.md §§ R25, R31).
   */
  const BRAND_FONT_WEIGHTS = [
    /* Feature 42: Poppins 500 for the v2 headings. Feature 43: the wordmark
       draws "muush." at 600 and "dev" at 400 (Constitution 2.1.2 VII). */
    { family: 'Poppins', weight: 400 },
    { family: 'Poppins', weight: 500 },
    { family: 'Poppins', weight: 600 },
    { family: 'Instrument Sans', weight: 400 },
    { family: 'Instrument Sans', weight: 500 },
    { family: 'Instrument Sans', weight: 600 },
  ] as const

  it('should emit a face for every brand weight when the site is generated', () => {
    /* The closed set of `branding.md` § Tipografía: Poppins is the wordmark's
       alone, everything else is Instrument Sans. A weight missing here is a
       weight the browser synthesises (FR-017). */
    const css = emittedCss()

    for (const { family, weight } of BRAND_FONT_WEIGHTS) {
      const face = new RegExp(
        `@font-face\\{font-family:${family}[^}]*font-weight:${weight}[^}]*\\}`
      )

      expect(css, `${family} ${weight}`).toMatch(face)
    }
  })

  it('should serve every font binary from its own origin when the site is generated', () => {
    const fontsDirectory = join(OUTPUT, '_fonts')

    expect(existsSync(fontsDirectory)).toBe(true)
    expect(readdirSync(fontsDirectory).length).toBeGreaterThan(0)

    /* Emitted from `_nuxt/*.css`, so `../_fonts/…` is `/_fonts/…`. Any
       absolute URL here would be a runtime dependency on someone else. */
    const sources = [...emittedCss().matchAll(/src:([^;}]*)/g)].map(
      ([, value]) => value ?? ''
    )
    const remoteSources = sources.filter(value => value.includes('url(http'))

    expect(remoteSources).toEqual([])
  })

  it('should reach no third-party font host from any emitted file', () => {
    const offenders = everyEmittedFile().filter(path => {
      const contents = readFileSync(path, 'utf8')
      return (
        contents.includes('fonts.gstatic.com') ||
        contents.includes('fonts.googleapis.com')
      )
    })

    expect(offenders).toEqual([])
  })

  it('should leave no trace of the deleted hand-written faces when the site is generated', () => {
    /* The four `/fonts/*.woff2` paths pointed at files that never existed, and
       every one produced a `[VUE_ROUTER_R0004]` warning in dev (FR-013,
       FR-016). */
    const deletedPaths = [
      '/fonts/Poppins-Regular.woff2',
      '/fonts/Poppins-Bold.woff2',
      '/fonts/InstrumentSans-Regular.woff2',
      '/fonts/InstrumentSans-Bold.woff2',
    ]

    const offenders = everyEmittedFile().filter(path => {
      const contents = readFileSync(path, 'utf8')
      return deletedPaths.some(deleted => contents.includes(deleted))
    })

    expect(offenders).toEqual([])
  })
})

describe('static output · the muush mark', () => {
  /*
   * Feature 006, FR-024 / FR-025 / SC-010. Nothing declared an icon before:
   * Nuxt served `public/favicon.ico` by convention and that file was the stock
   * Nuxt logo. The declaration is now explicit, in `app.head.link`, so every
   * prerendered page in both locales carries it.
   *
   * What a test cannot do is look at a tab. Whether a browser honours
   * `prefers-color-scheme` inside an SVG favicon is a by-eye check
   * (spec A-08), and the light-scheme colours are the file's unconditional
   * default so that a browser which ignores the query still shows a correct
   * mark.
   */
  for (const route of ROUTES) {
    it(`should declare the muush icon when the page is ${route}`, () => {
      expect(documentFor(route)).toContain(
        '<link rel="icon" type="image/svg+xml" href="/favicon.svg">'
      )
    })
  }

  it('should emit the isotipo geometry and no stock icon when the site is generated', () => {
    const icon = readFileSync(join(OUTPUT, 'favicon.svg'), 'utf8')

    /* The geometry `app/assets/logo/README.md` records, in the square
       avatar framing `branding.md` § Isotipo documents (FR-021, FR-022). */
    expect(icon).toContain('viewBox="0 0 100 100"')
    expect(icon).toContain('transform="translate(3, -8)"')
    expect(icon).toContain('cx="21" cy="45" r="6.5"')
    expect(icon).toContain('M21 72a17 17 0 0 1 34 0 12 12 0 0 1 24 0')
    expect(icon).toContain('stroke-width="12"')
    expect(icon).toContain('stroke-linecap="round"')

    /* Adaptive, with the light scheme as the unconditional default. Feature
       43 (Roberto, 2026-11-01): the Muush 1.0 colours, the dot in Red muush
       500, the stroke Negro 950 on light chrome and Blanco on dark; no v1
       value remains. */
    expect(icon).toMatch(/\.stroke \{ stroke: #050505; \}/)
    expect(icon).toMatch(/@media \(prefers-color-scheme: dark\)/)
    expect(icon).toMatch(/\.stroke \{ stroke: #F4F4F2; \}/)
    expect(icon).toContain('fill="#E5352F"')
    for (const v1 of ['#262626', '#FBF8F6', '#CF3147']) {
      expect(icon.toUpperCase(), v1).not.toContain(v1)
    }

    /* The `.ico` is deleted, not replaced (spec A-06). */
    expect(existsSync(join(OUTPUT, 'favicon.ico'))).toBe(false)
  })
})

/*
 * Feature 51 · the Preguntas page with the real questions (contract
 * `build-output.md` § 1). Copy is compared against the locale files read
 * from disk (rules.md § R27), placeholders filled with the link texts and
 * the address, the way the page renders them.
 */
describe('static output · Preguntas (feature 51)', () => {
  const FAQ_ROUTES = ['/es/preguntas', '/en/faq'] as const

  interface FaqCopy {
    faq: {
      links: { privacy: string; about: string }
      topics: Record<
        string,
        { questions: Record<string, { question: string; answer: string }> }
      >
    }
  }

  function faqCopy(route: (typeof FAQ_ROUTES)[number]) {
    const locale = route.startsWith('/en') ? 'en' : 'es'
    const copy = JSON.parse(
      readFileSync(
        join(process.cwd(), 'i18n', 'locales', `${locale}.json`),
        'utf8'
      )
    ) as FaqCopy
    const questions = Object.values(copy.faq.topics).flatMap(topic =>
      Object.values(topic.questions)
    )
    return questions.map(({ question, answer }) => ({
      question,
      answer: answer
        .replace('{privacy}', copy.faq.links.privacy)
        .replace('{about}', copy.faq.links.about)
        .replace('{email}', 'support@muush.dev'),
    }))
  }

  for (const route of FAQ_ROUTES) {
    it(`should carry all twenty questions and answers in the HTML when the page is ${route}`, () => {
      const text = visibleText(documentFor(route))
      const questions = faqCopy(route)

      expect(questions).toHaveLength(20)
      for (const { question, answer } of questions) {
        expect(text, question).toContain(question)
        expect(text, question).toContain(answer)
      }
    })

    it(`should carry no status or placeholder copy when the page is ${route}`, () => {
      const html = documentFor(route)

      for (const gone of [
        'En construcción',
        'Under construction',
        'Mientras tanto',
        'In the meantime',
      ]) {
        expect(html, gone).not.toContain(gone)
      }
    })

    it(`should render one tab list, five tabs, five panels and one open question when the page is ${route}`, () => {
      const html = documentFor(route)
      const panels = [...html.matchAll(/<div[^>]*role="tabpanel"[^>]*>/g)].map(
        match => match[0]
      )

      expect(html.match(/role="tablist"/g)).toHaveLength(1)
      expect(html.match(/role="tab"/g)).toHaveLength(5)
      expect(panels).toHaveLength(5)
      expect(panels.filter(panel => / hidden[\s>=]/.test(panel))).toHaveLength(
        4
      )
      expect(html.match(/aria-expanded="true"/g)).toHaveLength(1)
    })

    it(`should link the answers and the card through the route map when the page is ${route}`, () => {
      const html = documentFor(route)
      const spanish = route.startsWith('/es')

      expect(html).toContain(
        `href="${spanish ? '/es/privacidad' : '/en/privacy'}"`
      )
      expect(html).toContain(
        `href="${spanish ? '/es/nosotros' : '/en/about'}#trabaja-con-muush"`
      )
      /* The page block runs from its `data-faq` section to the footer. */
      const block = html.slice(
        html.indexOf('data-faq'),
        html.indexOf('<footer')
      )
      expect(block.match(/href="mailto:support@muush\.dev"/g)).toHaveLength(2)
      const booking = [...block.matchAll(/<a\b[^>]*>/g)]
        .map(match => match[0])
        .filter(tag => tag.includes(`href="${CALL_BOOKING_URL}"`))
      expect(booking).toHaveLength(1)
      for (const attribute of [
        'target="_blank"',
        'rel="noopener noreferrer"',
        'data-track="book_call_click"',
        'data-track-location="faq"',
      ]) {
        expect(booking[0], attribute).toContain(attribute)
      }
    })

    it(`should frame the page block like the other first blocks when the page is ${route}`, () => {
      const block = documentFor(route).match(/<section[^>]*data-faq[^>]*>/)?.[0]

      expect(block).toBeDefined()
      for (const name of [
        'min-h-portada-alto',
        'pt-seccion-arriba',
        'pb-seccion-aire',
      ]) {
        expect(block, name).toContain(name)
      }
      expect(documentFor(route)).not.toMatch(/faq-arriba|faq-abajo/)
    })
  }
})
