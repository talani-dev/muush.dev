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
} as const

type RoutePath = keyof typeof DOCUMENTS

/** The equivalent route in the other locale — the 8 transitions of SC-003. */
const EQUIVALENT_ROUTE: Record<RoutePath, RoutePath> = {
  '/es': '/en',
  '/en': '/es',
  '/es/nosotros': '/en/about',
  '/en/about': '/es/nosotros',
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
    const aboutPages = readdirSync(join(process.cwd(), 'app', 'pages')).filter(
      file => file !== 'index.vue'
    )

    expect(aboutPages).toEqual(['about.vue'])
    expect(documentFor('/es/nosotros')).toContain('id="trabaja-con-muush"')
    expect(documentFor('/en/about')).toContain('id="trabaja-con-muush"')
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
    /* The link bar only: the router itself also marks the logo "current
       page" on the home page, which is true. */
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
   * `lg`, the floating nav with its glass link bar from `lg`, Servicios and
   * Nosotros only until feature 46 adds Preguntas (spec FR-024).
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

    it(`should never render Proyectos or Preguntas inside the nav when the page is ${route}`, () => {
      /* Proyectos: feature 15 is `blocked` (features 21, 24). Preguntas: its
         route arrives with feature 46 (spec FR-024). */
      const nav = navMarkup(route)

      expect(nav, route).toBeDefined()
      for (const label of ['Proyectos', 'Projects', 'Preguntas', 'FAQ']) {
        expect(nav, `${route} · ${label}`).not.toContain(label)
      }
    })
  }

  it('should render no "Proyectos"/"Projects" text anywhere in the static document (feature 23, item 9)', () => {
    for (const route of ROUTES) {
      const html = documentFor(route)
      const locale = route.startsWith('/en') ? 'Projects' : 'Proyectos'

      expect(html, route).not.toContain(locale)
    }
  })

  it('should render the blog and the legal entries as text and no Preguntas link in the footer', () => {
    /*
     * Feature 43 (spec FR-031…FR-033, SC-006): "Blog · próximamente", the
     * privacy notice and the terms are text until their pages exist (feature
     * 48 for the legal two); Preguntas is absent until feature 46.
     */
    for (const route of ROUTES) {
      const footer = documentFor(route).match(/<footer[\s\S]*<\/footer>/)?.[0]
      const linked = [...(footer ?? '').matchAll(/<a [^>]*>([\s\S]*?)<\/a>/g)]
        .map(match => match[1] ?? '')
        .join(' ')

      expect(footer, route).toBeDefined()
      expect(footer, route).toContain('Blog')
      expect(linked, route).not.toContain('Blog')
      for (const label of [
        'Aviso de privacidad',
        'Privacy notice',
        'Términos',
        'Terms',
        'Preguntas',
        'FAQ',
      ]) {
        expect(linked, `${route} · ${label}`).not.toContain(label)
      }
      expect(footer, `${route} · Preguntas`).not.toMatch(/Preguntas|FAQ/)
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
      const html = documentFor(route)

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

describe('static output · the landing hero', () => {
  /*
   * Feature 009. Three claims that only the artefact can settle: that the
   * Hero's copy reaches the prerendered HTML in each locale, that the eyebrow
   * is deliberately *not* translated, and that the primary CTA emits no
   * destination while section 05 does not exist.
   *
   * The Hero costs zero JavaScript, so a browser with scripting disabled
   * renders exactly these documents — asserting on them is how the no-JS case
   * is verified at all (the discipline of `rules.md` §§ R25, R31).
   */
  const HERO_COPY = {
    es: {
      headline: 'Hablamos negocio y código.',
      subhead:
        'Diseñamos y construimos soluciones digitales alrededor de tu negocio.',
      ctaPrimary: 'Cuéntanos tu proyecto',
      ctaSecondary: 'Agenda una llamada',
    },
    en: {
      headline: 'We speak business and code.',
      subhead: 'We design and build digital solutions around your business.',
      ctaPrimary: 'Tell us about your project',
      ctaSecondary: 'Book a call',
    },
  } as const

  /** Identical in both locales, on purpose — verified in all four frames. */
  const EYEBROW = 'Technology solution studio'

  /** The rendered `<section>`, found by the one class only the Hero carries. */
  function heroSection(route: RoutePath): string | undefined {
    return documentFor(route).match(
      /<section class="[^"]*pt-hero-top[^"]*"[\s\S]*?<\/section>/
    )?.[0]
  }

  for (const route of ['/es', '/en'] as const) {
    const locale = route === '/en' ? 'en' : 'es'

    it(`should render the hero in its own locale when the page is ${route}`, () => {
      const hero = heroSection(route)

      expect(hero, route).toBeDefined()
      expect(hero, route).toContain(EYEBROW)
      for (const copy of Object.values(HERO_COPY[locale])) {
        expect(hero, `${route} · ${copy}`).toContain(copy)
      }
    })

    it(`should render the headline as the page's only h1 when the page is ${route}`, () => {
      const headings = [...documentFor(route).matchAll(/<h1[\s>]/g)]

      expect(headings, route).toHaveLength(1)
      expect(heroSection(route), route).toContain('<h1')
    })

    it(`should send the primary hero control to the contact section when the page is ${route}`, () => {
      /*
       * Feature 016 fills `HERO_DESTINATIONS.contactHash`: section `06 CTA
       * final` exists now, so the primary CTA turns from a `<button
       * type="button">` into a real link — no substitute destination, the
       * section this key was always reserved for (spec FR-002). It carries a
       * pointer cursor because it now does something when clicked
       * (`PrimaryButton.vue`'s `isClickable`).
       */
      const hero = heroSection(route)
      const primary = hero?.match(
        new RegExp(`<a href="${route}#diagnostico"[^>]*class="([^"]*)"`)
      )

      expect(hero, route).not.toContain('<button type="button"')
      expect(primary, route).toBeTruthy()
      expect(primary?.[1]?.split(' '), route).toContain('cursor-pointer')
    })

    it(`should send the secondary hero control to the booking page when the page is ${route}`, () => {
      /*
       * `decisions-open.md` #2 resolved on 2026-09-07. The guard against a
       * silent return to the inert branch, asserted on the artefact a visitor
       * actually receives: the Hero costs zero JavaScript, so this document is
       * also what a browser with scripting disabled renders.
       *
       * Anchored on `CALL_BOOKING_URL` rather than "the first `<a>`": the
       * primary CTA is a real anchor too now that `#diagnostico` exists, and it
       * renders first in document order.
       */
      const hero = heroSection(route)
      const locale = route === '/en' ? 'en' : 'es'
      const secondary = hero?.match(
        new RegExp(`<a href="${CALL_BOOKING_URL}"[^>]*>[\\s\\S]*?</a>`)
      )?.[0]

      expect(secondary, route).toBeDefined()
      expect(secondary, route).toContain(CALL_BOOKING_URL)
      expect(secondary, route).toContain('target="_blank"')
      expect(secondary, route).toContain('rel="noopener noreferrer"')
      expect(secondary, route).toContain('text-bone-100')
      expect(secondary, route).toContain(HERO_COPY[locale].ctaSecondary)
      expect(secondary, route).toContain('→')
      expect(hero, route).not.toContain('text-ink-300')
    })
  }

  it('should ship the primary control as a pill in every document', () => {
    /*
     * Feature 022. The hero shipped at the 12px control radius, because when
     * it was measured the design file had not yet been rounded; Roberto
     * resolved on 2026-09-08 that the pill applies to **every** instance, so
     * the code goes ahead of a half-propagated design file.
     *
     * Asserted on the artefact and not only on the component, because this is
     * a visible change to a page already in production and the two controls
     * that reach a prerendered document — the hero CTA and the nav CTA — arrive
     * through different call sites. The form Submits have no page yet.
     *
     * The class, not a pixel value: `happy-dom` paints nothing, so the rendered
     * band was reviewed in Chrome against `.output/public` instead (see
     * `PrimaryButton.vue`'s note on the ring). What this catches is the
     * regression a test can catch — the old radius coming back.
     */
    for (const route of ROUTES) {
      const controls = [
        ...documentFor(route).matchAll(
          /<(?:a|button)[^>]*class="(led [^"]*)"/g
        ),
      ].map(match => match[1]?.split(' ') ?? [])

      expect(controls.length, route).toBeGreaterThan(0)
      for (const classes of controls) {
        expect(classes, route).toContain('rounded-full')
        expect(classes, route).not.toContain('rounded-legacy-control')
        /* The fill is untouched: the nav CTA looks fill-less in the frame
           because the nav's own glass sits behind it (Roberto, 2026-09-08). */
        expect(classes, route).toContain('bg-glass-dark')
      }
    }
  })

  it('should give the pill utility a radius no control radius could reach', () => {
    /* A pill is "as round as the box allows", which the browser resolves by
       clamping an absurd radius down to half the shorter side. Pinning the
       literal would pin a Tailwind implementation detail, so what is asserted
       is the property that makes it a pill at any size: it dwarfs every radius
       in the token catalogue, the 12px control radius included. */
    const pillRadius = emittedCss().match(
      /\.rounded-full\{border-radius:([^}]+)\}/
    )?.[1]

    expect(pillRadius).toBeDefined()
    expect(Number.parseFloat(pillRadius ?? '0')).toBeGreaterThan(1000)
  })

  it('should carry the identical eyebrow in both landing documents', () => {
    /* ⚠️ Not a missing translation (spec FR-009). It is English inside the
       Spanish page by design. Until feature 43 the About pages inherited it
       through the footer's category; the Muush 1.0 footer reads
       "Technology Solution Studio." instead, in both locales. */
    for (const route of ['/es', '/en'] as const) {
      expect(documentFor(route), route).toContain(EYEBROW)
    }
    for (const route of ROUTES) {
      expect(documentFor(route), route).toContain('Technology Solution Studio.')
    }
  })
})

describe('static output · the landing purpose section', () => {
  /*
   * Feature 013. Four claims only the artefact can settle: that both
   * compositions reach the prerendered HTML in each locale, that the three
   * labels are deliberately **not** translated, that the carousel ships its
   * no-JS state rather than its enhanced one, and that the anchor three shell
   * links already point at now exists.
   *
   * The desktop reveal costs zero JavaScript, so this document is also what a
   * browser with scripting disabled renders — asserting on it is how the no-JS
   * case is verified at all (the discipline of `rules.md` §§ R25, R31).
   */
  const PURPOSE_COPY = {
    es: {
      eyebrow: 'Propósito',
      why: 'El software rara vez falla por cómo se construye. Falla porque nadie tradujo el problema de negocio; saber qué vale la pena construir es lo que cambia el resultado.',
      how: 'Primero entendemos tu operación, después decidimos qué se construye. Traducimos antes de construir.',
      what: 'Diseñamos y construimos soluciones digitales que tu negocio usa todos los días.',
    },
    en: {
      eyebrow: 'Purpose',
      /*
       * `&#39;` rather than `'`: Nuxt's static HTML entity-encodes the
       * apostrophe, and this is asserted against the emitted document, not
       * against `i18n/locales/en.json` (`occurrences()` does a literal
       * substring match, so a straight quote here would never match and
       * silently read as "copy missing").
       */
      why: 'Software rarely fails because of how it&#39;s built. It fails because nobody translated the business problem; knowing what&#39;s worth building is what changes the outcome.',
      how: 'First, we understand how you operate; then we decide what gets built. We translate before we build.',
      what: 'We design and build digital solutions your business uses every day.',
    },
  } as const

  /** Identical in both locales, on purpose — read from the design file. */
  const LABELS = ['Why', 'How', 'What'] as const

  /**
   * The rendered `<section id="proposito">`, found by matching its own closing
   * tag rather than the first one.
   *
   * The mobile carousel is itself a named `<section>`, so a lazy
   * `[\s\S]*?</section>` would stop inside the section and every count below
   * would be off by one composition. Counting the nesting is what keeps this
   * correct when feature 14 puts another section after this one.
   */
  function purposeSection(route: RoutePath): string {
    const html = documentFor(route)
    const start = html.indexOf('<section id="proposito"')

    expect(start, route).toBeGreaterThan(-1)

    let depth = 0
    for (const tag of html.slice(start).matchAll(/<(\/?)section[\s>]/g)) {
      depth += tag[1] === '/' ? -1 : 1
      if (depth === 0) return html.slice(start, start + tag.index + 10)
    }

    throw new Error(`unbalanced purpose section in ${route}`)
  }

  function occurrences(haystack: string, needle: string): number {
    return haystack.split(needle).length - 1
  }

  for (const route of ['/es', '/en'] as const) {
    const locale = route === '/en' ? 'en' : 'es'

    it(`should render both compositions in their own locale when the page is ${route}`, () => {
      /*
       * Each copy block appears **twice** — once in the constellation and once
       * in the carousel — and that is by design, not a bug: both are in the
       * HTML and exactly one is `display: none` at any width (spec FR-002), so
       * only one is ever announced.
       */
      const section = purposeSection(route)
      const copy = PURPOSE_COPY[locale]

      expect(section, route).toContain(copy.eyebrow)
      for (const block of ['why', 'how', 'what'] as const) {
        expect(occurrences(section, copy[block]), `${route} · ${block}`).toBe(2)
      }
    })

    it(`should carry the untranslated labels when the page is ${route}`, () => {
      /* ⚠️ Not a missing translation. The design file draws `Why` / `How` /
         `What` in both locale frames, the same treatment
         `landing.hero.eyebrow` gets. Each appears three times: the
         constellation's word, the card's own label, and the carousel dot's
         accessible name is absent from the artefact, so it is twice per
         composition minus the dots. */
      const section = purposeSection(route)

      for (const label of LABELS) {
        expect(occurrences(section, `>${label}<`), `${route} · ${label}`).toBe(
          3
        )
      }
    })

    it(`should reveal nothing and hide nothing structurally when the page is ${route}`, () => {
      /*
       * FR-006 and FR-010 together, on the document a screen reader actually
       * receives: every card's copy is present, and no card is removed from
       * the accessibility tree to hide it. Hiding is `opacity` only, which
       * lives in the scoped stylesheet and cannot be asserted here — it is
       * measured in Chrome instead.
       */
      const section = purposeSection(route)

      expect(section, route).not.toContain('aria-hidden="true" class="node')
      expect(section, route).not.toMatch(/<article[^>]*\shidden\b/)
      expect(section, route).not.toMatch(/<article[^>]*class="[^"]*\bhidden\b/)
      expect(section, route).not.toMatch(/<article[^>]*class="[^"]*invisible/)
    })

    it(`should ship the carousel's no-JS state when the page is ${route}`, () => {
      /*
       * `ui-map.md` § 10: without scripting the carousel is a native snap
       * track with all three cards at **full size and full opacity**, never
       * dimmed by default (spec FR-023) — and no indicator, because three dots
       * that do nothing are three controls that look clickable and lead
       * nowhere (`findings.md` § R56).
       */
      const section = purposeSection(route)
      /* Scoped to the carousel's own `<section aria-label>`: the
         constellation's three triggers are `<button>`s too, and they are
         supposed to be — a real focusable control is what makes the desktop
         reveal reachable by keyboard (spec FR-009). */
      const carousel = section.slice(section.indexOf('<section aria-label='))

      expect(carousel, route).not.toContain('data-dimmed')
      expect(carousel, route).not.toContain('<button')
      expect(carousel, route).toContain('snap-x')
      expect(carousel, route).toContain('snap-center')
    })

    it(`should emit no destination from the section when the page is ${route}`, () => {
      /* The cards are not links and the triggers go nowhere (`ui-map.md` § 4,
         spec FR-009). The document-wide "no anchor without an href" assertion
         above covers the other half. */
      const section = purposeSection(route)

      expect(section, route).not.toContain('<a ')
      expect(section, route).not.toContain('cursor-pointer')
    })
  }

  it('should keep the purpose anchor, which the Muush 1.0 shell no longer links', () => {
    /*
     * The v1 shell linked `#proposito` from the footer and the mobile menu
     * (`rules.md` § R50). The Muush 1.0 home has no Propósito
     * (`muush-1.0.md` § 1), so feature 43's shell drops those links; only
     * the v1 404's shortcut still points here until feature 46. The section
     * keeps its id until feature 44 replaces it.
     */
    for (const route of ['/es', '/en'] as const) {
      expect(documentFor(route), route).toContain('<section id="proposito"')
      expect(documentFor(route), route).not.toContain(
        `href="${route}#proposito"`
      )
    }
  })

  it('should contribute the three glows without breaking the paint order', () => {
    /* FR-030 mechanically, on the artefact: the section is positioned, paints
       no background of its own, declares no stacking-context utility, and its
       backdrop holds all three glows — `Glow origen` included, which is what
       makes `SectionGlow`'s `'920'` variant not dead code. */
    for (const route of ['/es', '/en'] as const) {
      const section = purposeSection(route)
      const root = section.match(/<section id="proposito" class="([^"]*)"/)?.[1]

      expect(root?.split(' '), route).toContain('relative')
      expect(root?.split(' '), route).toContain('pt-purpose-top')
      expect(
        root?.split(' ').some(name => name.startsWith('bg-')),
        route
      ).toBe(false)
      expect(
        root
          ?.split(' ')
          .some(name =>
            /^(transform|translate|scale|rotate|filter|backdrop-|opacity-|isolate|will-change|contain-|fixed|sticky|overflow-)/.test(
              name
            )
          ),
        route
      ).toBe(false)

      expect(section, route).toContain('size-glow-1000-560')
      expect(section, route).toContain('size-glow-820-480')
      expect(section, route).toContain('size-glow-920')
      expect(section, route).toContain('overflow-clip')
    }
  })

  it('should emit every purpose anchor and the connector formula when generated', () => {
    /*
     * The § R18 check, on the **site** build and never the catalogue:
     * Storybook's content scan reaches `specs/` and `docs/`, so it emits theme
     * variables the site does not and cannot detect a token that failed to
     * resolve.
     *
     * The utilities land in `_nuxt/*.css`; the connector's `calc()` over
     * `--i` is a scoped rule, which Nuxt inlines per document.
     */
    const css = emittedCss()

    expect(css).toMatch(
      /\.pt-purpose-top\{padding-top:clamp\(5\.625rem,1\.8179rem \+ 15\.619vw,15\.875rem\)\}/
    )
    for (const anchor of [
      /\.top-purpose-glow-a-y\{top:clamp\(/,
      /\.top-purpose-glow-b-y\{top:clamp\(/,
      /\.left-purpose-glow-a-x\{left:clamp\(/,
      /\.left-purpose-glow-b-x\{left:clamp\(/,
      /\.left-purpose-origen-x\{left:-11\.25rem\}/,
    ]) {
      expect(css, String(anchor)).toMatch(anchor)
    }

    /* Every `:root` token the hand-written CSS names has to be reachable, or
       the declaration resolves to nothing in silence (`findings.md` § R46). */
    for (const token of [
      '--purpose-node-x:',
      '--purpose-node-step:',
      '--purpose-card-w:',
      '--purpose-link-offset:',
      '--purpose-arc-why:',
      '--purpose-arc-origin-x:',
      '--purpose-origin-y:',
      '--purpose-radar-rest-opacity:',
      '--purpose-card-scale:',
      '--purpose-card-air:',
      '--duration-purpose-reveal:',
    ]) {
      expect(css, token).toContain(token)
    }

    const document = documentFor('/es')

    expect(document).toContain('--purpose-link-revealed:calc(')
    expect(document).toContain('var(--i)*var(--purpose-node-step)')
    expect(document).toMatch(/\.trigger:hover~\.card\[data-v-[0-9a-f]+\]/)
  })

  it('should add no token to the closed glow namespace when generated', () => {
    /*
     * `rules.md` § R36. `app/shared/ui/legacy/SectionGlow.test.ts` asserts in both
     * directions over `--(?:color|spacing)-glow-[\w-]+`, so a token named
     * `--spacing-glow-purpose-…` would turn this feature red in a file it
     * never opened — and the instinct would be to relax that test. This is the
     * guard stated where this feature can see it.
     */
    const glowTokens = [
      ...emittedCss().matchAll(/--(?:color|spacing)-glow-[\w-]+(?=\s*:)/g),
    ].map(([token]) => token)

    expect(glowTokens.filter(token => token.includes('purpose'))).toEqual([])
  })
})

describe('static output · the landing services section', () => {
  /*
   * Feature 014. Claims only the artefact can settle: both compositions reach
   * the prerendered HTML in each locale with no card surface and no
   * destination, the mobile timeline ships its no-JS state (every item at
   * full strength, no `data-lyrics` attribute), and the anchor the shell
   * already links to now exists.
   *
   * The desktop scatter costs zero JavaScript and the mobile timeline's rest
   * state is the CSS default, so this document is also what a browser with
   * scripting disabled renders (`rules.md` §§ R25, R31).
   */
  const SERVICE_COPY = {
    es: {
      eyebrow: 'Servicios',
      names: [
        'Technology Consulting & Strategy',
        'Software & Digital Solutions',
        'Cloud, Infrastructure & DevOps',
        'Automation, Data & AI',
        'Product, UI/UX & Experience',
      ],
      delivery:
        'Y una capacidad que atraviesa las cinco: llevamos el proyecto de principio a fin, con alcance, tiempos, calidad y lanzamiento a nuestro cargo.',
    },
    en: {
      eyebrow: 'Services',
      names: [
        'Technology Consulting & Strategy',
        'Software & Digital Solutions',
        'Cloud, Infrastructure & DevOps',
        'Automation, Data & AI',
        'Product, UI/UX & Experience',
      ],
      delivery:
        'And one capability runs through all five: we carry the project from start to finish, including scope, timelines, quality and launch.',
    },
  } as const

  /** The rendered `<section id="servicios">`, balanced against nested `<section>`s. */
  function servicesSection(route: RoutePath): string {
    const html = documentFor(route)
    const start = html.indexOf('<section id="servicios"')

    expect(start, route).toBeGreaterThan(-1)

    let depth = 0
    for (const tag of html.slice(start).matchAll(/<(\/?)section[\s>]/g)) {
      depth += tag[1] === '/' ? -1 : 1
      if (depth === 0) return html.slice(start, start + tag.index + 10)
    }

    throw new Error(`unbalanced services section in ${route}`)
  }

  for (const route of ['/es', '/en'] as const) {
    const locale = route === '/en' ? 'en' : 'es'

    it(`should render both compositions in their own locale when the page is ${route}`, () => {
      /* Each name/brief appears **twice** — once per composition — and
         exactly one is `hidden` at any width (spec FR-002 analogue), so only
         one is ever announced. */
      const section = servicesSection(route)
      const copy = SERVICE_COPY[locale]

      expect(section, route).toContain(copy.eyebrow)
      for (const name of copy.names) {
        /* The rendered HTML escapes `&` to `&amp;`; the fixture above is the
           plain-text copy, so the search string is escaped the same way. */
        const rendered = name.replaceAll('&', '&amp;')
        expect(section.split(rendered).length - 1, `${route} · ${name}`).toBe(2)
      }
      expect(section.split(copy.delivery).length - 1, route).toBe(2)
    })

    it(`should render no card surface and no destination when the page is ${route}`, () => {
      /* `services.md`: "sin tarjetas." The five areas are not clickable
         (`ui-map.md` § 5). */
      const section = servicesSection(route)

      expect(section, route).not.toContain('<article')
      expect(section, route).not.toContain('<a ')
      expect(section, route).not.toContain('cursor-pointer')
    })

    it(`should ship the timeline's no-JS state when the page is ${route}`, () => {
      /* `ui-map.md` § 10: without scripting every item is at 100%, never
         dimmed by default. */
      const section = servicesSection(route)

      expect(section, route).not.toContain('data-lyrics')
    })
  }

  it('should close the shell dangling anchor on every landing document', () => {
    /* The header's link bar and the footer emit a link at this anchor, the
       shared `servicios` (feature 43); the shell resolves the fragment
       against the locale's home. */
    for (const route of ['/es', '/en'] as const) {
      expect(documentFor(route), route).toContain('<section id="servicios"')
      expect(documentFor(route), route).toContain(`href="${route}#servicios"`)
    }
  })

  it('should contribute the two glows without breaking the paint order', () => {
    for (const route of ['/es', '/en'] as const) {
      const section = servicesSection(route)
      const root = section.match(/<section id="servicios" class="([^"]*)"/)?.[1]

      expect(root?.split(' '), route).toContain('relative')
      expect(root?.split(' '), route).toContain('pt-services-top')
      expect(
        root?.split(' ').some(name => name.startsWith('bg-')),
        route
      ).toBe(false)
      expect(
        root
          ?.split(' ')
          .some(name =>
            /^(transform|translate|scale|rotate|filter|backdrop-|opacity-|isolate|will-change|contain-|fixed|sticky|overflow-)/.test(
              name
            )
          ),
        route
      ).toBe(false)

      expect(section, route).toContain('size-glow-900-520')
      expect(section, route).toContain('size-glow-860-480')
    }
  })

  it('should emit every services token and the connector geometry when generated', () => {
    const css = emittedCss()

    expect(css).toMatch(
      /\.pt-services-top\{padding-top:clamp\(3\.4375rem,2\.3696rem \+ 4\.381vw,6\.3125rem\)\}/
    )
    for (const anchor of [
      /\.top-services-glow-a-y\{top:clamp\(/,
      /\.top-services-glow-b-y\{top:clamp\(/,
      /\.left-services-glow-a-x\{left:clamp\(/,
      /\.left-services-glow-b-x\{left:clamp\(/,
    ]) {
      expect(css, String(anchor)).toMatch(anchor)
    }

    /* Every `:root` token the hand-written CSS names has to be reachable, or
       the declaration resolves to nothing in silence (`findings.md` § R46). */
    for (const token of [
      '--services-node-1-x:',
      '--services-node-5-y:',
      '--services-text-offset-x:',
      '--services-canvas-h:',
      '--services-link-color:',
      '--services-timeline-item-1-top:',
      '--services-timeline-item-step:',
      '--services-spine-x:',
      '--duration-services-lyrics:',
    ]) {
      expect(css, token).toContain(token)
    }

    const document = documentFor('/es')

    /* The connectors' generated geometry: `x1`/`y1`/`x2`/`y2` are SVG
       attributes, not CSS properties — Biome's `noUnknownProperty` correctly
       rejects them as CSS declarations, so each `<line>` is bound from
       `connectorEndpoints` over the five confirmed centres instead
       (FR-008). Each pair matches its neighbour exactly. */
    expect(document).toContain('<line x1="150" y1="330" x2="430" y2="200"')
    expect(document).toContain('<line x1="950" y1="250" x2="1150" y2="480"')
    /* The mobile timeline's one relation (FR-011). */
    expect(document).toContain(
      'top:calc(var(--services-timeline-item-1-top) + var(--i)*var(--services-timeline-item-step))'
    )
  })

  it('should add no token to the closed glow namespace when generated', () => {
    /* `rules.md` § R36 — the guard stated where this feature can see it. */
    const glowTokens = [
      ...emittedCss().matchAll(/--(?:color|spacing)-glow-[\w-]+(?=\s*:)/g),
    ].map(([token]) => token)

    expect(glowTokens.filter(token => token.includes('services'))).toEqual([])
  })
})

describe('static output · the landing contact section', () => {
  /*
   * Feature 016. Claims only the artefact can settle: both dangling CTAs
   * resolve to a real, existing section, the form ships `novalidate` and a
   * native submit with no `action`, and the compiled form chunk never uses
   * XMLHttpRequest (SC-002, SC-004). Feature 029 superseded the original
   * "no network call" claim: the form now submits through the single
   * `fetch(` in `forms/logic/formsApiClient.ts`, which is guarded below in
   * "form submission (feature 029)" and in `tests/forms-config.test.ts`.
   */
  function contactSection(route: RoutePath): string {
    const html = documentFor(route)
    const start = html.indexOf('<section id="diagnostico"')

    expect(start, route).toBeGreaterThan(-1)

    let depth = 0
    for (const tag of html.slice(start).matchAll(/<(\/?)section[\s>]/g)) {
      depth += tag[1] === '/' ? -1 : 1
      if (depth === 0) return html.slice(start, start + tag.index + 10)
    }

    throw new Error(`unbalanced contact section in ${route}`)
  }

  it('should carry id="diagnostico" and hold both CTAs on every landing document', () => {
    /*
     * The Hero's primary CTA and the header's "Diagnóstico gratis" both
     * point at the shared `diagnostico` anchor (feature 43, spec FR-025);
     * this v1 section is its target until feature 45 replaces it.
     */
    for (const route of ['/es', '/en'] as const) {
      expect(documentFor(route), route).toContain('<section id="diagnostico"')
      expect(documentFor(route), route).toContain(`href="${route}#diagnostico"`)
    }
  })

  it('should render a native, unactioned form with no destination when generated', () => {
    for (const route of ['/es', '/en'] as const) {
      const section = contactSection(route)
      const form = section.match(/<form[^>]*>/)?.[0]

      expect(form, route).toBeDefined()
      expect(form, route).toContain('novalidate')
      expect(form, route).not.toMatch(/\baction="/)
      expect(section, route).toContain('type="submit"')
    }
  })

  it('should contribute the three glows without breaking the paint order', () => {
    for (const route of ['/es', '/en'] as const) {
      const section = contactSection(route)
      const root = section.match(
        /<section id="diagnostico" class="([^"]*)"/
      )?.[1]

      expect(root?.split(' '), route).toContain('relative')
      expect(root?.split(' '), route).toContain('pt-contact-top')
      expect(
        root?.split(' ').some(name => name.startsWith('bg-')),
        route
      ).toBe(false)
      expect(
        root
          ?.split(' ')
          .some(name =>
            /^(transform|translate|scale|rotate|filter|backdrop-|opacity-|isolate|will-change|contain-|fixed|sticky|overflow-)/.test(
              name
            )
          ),
        route
      ).toBe(false)

      expect(section, route).toContain('size-glow-1500-760')
      expect(section, route).toContain('size-glow-1000-560')
      expect(section, route).toContain('size-glow-900-520')
    }
  })

  it('should add no token to the closed glow namespace when generated', () => {
    /* `rules.md` § R36 — the guard stated where this feature can see it. */
    const glowTokens = [
      ...emittedCss().matchAll(/--(?:color|spacing)-glow-[\w-]+(?=\s*:)/g),
    ].map(([token]) => token)

    expect(glowTokens.filter(token => token.includes('contact'))).toEqual([])
  })

  it('should ship no XMLHttpRequest from the compiled form chunk', () => {
    /*
     * Feature 016's "no network call at all" guarantee is superseded by
     * feature 029 (spec FR-011): the form now submits, through `fetch` in
     * `forms/logic/formsApiClient.ts`. What still holds is that nothing
     * reaches for XMLHttpRequest. The no-fake-success guarantee moved to the
     * flow and client unit tests (success only on 200 + ok:true), and
     * FR-025 (no fetch under `ui/`) is asserted on the sources in
     * `tests/forms-config.test.ts`.
     */
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
       43, spec FR-025) until feature 46 replaces this section. */
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

  it('should contribute the three reused glows without breaking the paint order', () => {
    for (const route of ['/es/nosotros', '/en/about'] as const) {
      const section = workSection(route)
      const root = section.match(
        /<section id="trabaja-con-muush" class="([^"]*)"/
      )?.[1]

      expect(root?.split(' '), route).toContain('relative')
      expect(root?.split(' '), route).toContain('pt-work-top')
      expect(
        root?.split(' ').some(name => name.startsWith('bg-')),
        route
      ).toBe(false)
      expect(
        root
          ?.split(' ')
          .some(name =>
            /^(transform|translate|scale|rotate|filter|backdrop-|opacity-|isolate|will-change|contain-|fixed|sticky|overflow-)/.test(
              name
            )
          ),
        route
      ).toBe(false)

      expect(section, route).toContain('size-glow-1500-760')
      expect(section, route).toContain('size-glow-1000-560')
      expect(section, route).toContain('size-glow-900-520')
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
