import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * The deployed artefact, asserted directly.
 *
 * SC-001 ("4 routes resolve and `/` reaches the Spanish home"), SC-003 ("the
 * toggle resolves correctly from all 4 routes in both directions") and
 * acceptance criterion 6 ("a layout renders the shell on every page;
 * `nosotros.vue` resolves at `/es/nosotros` and `/en/about`") are all claims
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

  it('should write a document at the root pointing at the Spanish home', () => {
    /* `/` has no page and `i18n.rootRedirect` emits no file, so the object at
       the root is the committed `public/index.html`
       (docs/business/rules.md § R25). If that fallback is ever dropped, a
       visitor typing `muush.dev` reaches whatever the host does with a
       missing key — so its presence is asserted on the build, not on the
       source file. */
    const root = readFileSync(join(OUTPUT, 'index.html'), 'utf8')

    expect(root).toMatch(/<meta http-equiv="refresh" content="0; url=\/es"/)
    expect(root).toMatch(
      /<link rel="canonical" href="https:\/\/muush\.dev\/es"/
    )
    expect(root).toContain('<a href="/es">')
  })

  it('should resolve the About page at both localized paths from one page', () => {
    /* The segment is translated, so the two paths are not a prefix apart. One
       page component serves both; the `#work` target the footer points at is
       what proves the same component rendered. */
    const aboutPages = readdirSync(join(process.cwd(), 'app', 'pages')).filter(
      file => file !== 'index.vue'
    )

    expect(aboutPages).toEqual(['nosotros.vue'])
    expect(documentFor('/es/nosotros')).toContain('id="work"')
    expect(documentFor('/en/about')).toContain('id="work"')
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
    it(`should paint the background layers when the page is ${route}`, () => {
      /*
       * The background costs zero JavaScript (spec FR-009) and is the
       * layout's, not a page's (FR-004) — so it must already be in the
       * prerendered document, on every route, in both locales. A mounted
       * component cannot show either of those things.
       *
       * What is asserted is the host contract plus the sheet: the layout root
       * is the page's single stacking context (`isolate`), is positioned, and
       * clips horizontal overflow with `clip` rather than `hidden` so the
       * off-canvas glows never turn the page into a scroll container
       * (feature 006 `research.md` § R3). Paint order itself is not testable
       * here — `happy-dom` does no painting, and pretending otherwise would
       * ship a test that always passes (`rules.md` § R27). It is reviewed in
       * the `DotGrid` / `SectionBackdrop` stories instead.
       */
      const html = documentFor(route)

      const layoutRoot = html.match(/<div class="([^"]*bg-ink-500[^"]*)"/)?.[1]

      expect(layoutRoot, route).toBeDefined()
      for (const utility of ['relative', 'isolate', 'overflow-x-clip']) {
        expect(layoutRoot?.split(' '), `${route} · ${utility}`).toContain(
          utility
        )
      }

      expect(html, route).toMatch(/<div aria-hidden="true" class="dot-grid/)
    })
  }

  it('should render the same nav markup on the landing and on About', () => {
    /*
     * § 9.bis verified the two pages' chrome is byte-identical, which is why
     * there is one responsive nav and no `variant` prop. Two things are
     * excluded from the comparison, and both are required to differ:
     *
     * - **Destinations.** The toggle resolves to `/en` from the landing and to
     *   `/en/about` from About; a nav whose hrefs matched across pages would
     *   mean SC-003 was broken.
     * - **The active-page marking**, which is announced to assistive
     *   technology and deliberately not drawn (spec A-04).
     *
     * What is compared is everything else: the elements, the controls and
     * every class. That is what would change if a per-page variant crept in.
     */
    const navMarkup = (route: RoutePath) =>
      documentFor(route)
        .match(/<nav[\s\S]*?<\/nav>/)?.[0]
        .replaceAll(/ href="[^"]*"/g, '')
        .replaceAll(' aria-current="page"', '')
        .replaceAll(/ ?router-link-(exact-)?active/g, '')
        /* Collapse the whitespace the two strips above leave behind. */
        .replaceAll(/class="\s+/g, 'class="')

    const landingNav = navMarkup('/es')

    expect(landingNav).toBeDefined()
    expect(navMarkup('/es/nosotros')).toBe(landingNav)
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

    /* Adaptive, with the light scheme as the unconditional default. */
    expect(icon).toContain('#262626')
    expect(icon).toMatch(/@media \(prefers-color-scheme: dark\)/)
    expect(icon).toContain('#FBF8F6')
    expect(icon).toContain('#CF3147')

    /* The `.ico` is deleted, not replaced (spec A-06). */
    expect(existsSync(join(OUTPUT, 'favicon.ico'))).toBe(false)
  })
})
