import { readdirSync, readFileSync } from 'node:fs'
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
