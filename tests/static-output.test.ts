import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { CALL_BOOKING_URL } from '@/shared/data/callBooking'

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
       * clips overflow with `clip` rather than `hidden` so the off-canvas
       * glows never turn the page into a scroll container (feature 006
       * `research.md` § R3). Paint order itself is not testable here —
       * `happy-dom` does no painting, and pretending otherwise would ship a
       * test that always passes (`rules.md` § R27). It is reviewed in the
       * `DotGrid` / `SectionBackdrop` stories instead.
       */
      const html = documentFor(route)

      const layoutRoot = html.match(/<div class="([^"]*bg-ink-500[^"]*)"/)?.[1]

      expect(layoutRoot, route).toBeDefined()
      for (const utility of ['relative', 'isolate', 'overflow-clip']) {
        expect(layoutRoot?.split(' '), `${route} · ${utility}`).toContain(
          utility
        )
      }

      expect(html, route).toMatch(/<div aria-hidden="true" class="dot-grid/)
    })
  }

  for (const route of ROUTES) {
    it(`should ship no cursor spotlight markup when the page is ${route}`, () => {
      /*
       * Feature 008, FR-012 / SC-003. The spotlight is the one background
       * layer that depends on JavaScript, and `ui-map.md` § 10 specifies its
       * absence as a complete state — "fondo normal, sin glow — no se pierde
       * contenido". That absence is mechanical rather than promised:
       * `useCursorSpotlight` returns `isActive: false` on the server and until
       * the first mouse event, so the element cannot reach the artefact.
       *
       * This is also how the no-JS fallback is verified at all. A browser with
       * scripting disabled renders exactly this document, so proving the
       * markup is not here proves the fallback — the same discipline
       * `rules.md` §§ R25 and R31 apply to everything else about `.output`.
       *
       * ⚠️ **The body, not the document.** Nuxt inlines a component's scoped
       * CSS into every prerendered page in the route's module graph, whether
       * or not the component ever renders — so `cursor-spotlight` *does*
       * appear in the `<head>` of all four documents, inside a `<style>` tag,
       * with `<!---->` where the `v-if` declined to render. A grep over the
       * whole document cannot tell markup from stylesheet and would fail this
       * feature for shipping exactly what it is supposed to ship
       * (`rules.md` § R40).
       */
      const body = documentFor(route).match(/<body[\s\S]*<\/body>/)?.[0]

      expect(body, route).toBeDefined()
      expect(body, route).not.toContain('cursor-spotlight')
    })
  }

  it('should still ship the spotlight stylesheet when the site is generated', () => {
    /* The complement of the assertion above, and the reason it is not simply
       "the feature is missing": the styles are in the artefact and only the
       element waits for a mouse. The tokens live in the emitted stylesheet;
       the layer's own rules are inlined per document. */
    const css = emittedCss()

    for (const token of [
      '--layer-spotlight:',
      '--spotlight-outer-size:',
      '--dot-paper-lit-color:',
    ]) {
      expect(css, token).toContain(token)
    }

    expect(documentFor('/es')).toContain('.cursor-spotlight')
  })

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
     * - **The call to action's visibility pair** — added by feature 009. The
     *   landing suppresses the nav CTA because its Hero already offers the
     *   same control (`ui-map.md` § 2, Roberto, 2026-09-07), so the two
     *   documents now differ by exactly `invisible opacity-0` against
     *   `visible opacity-100`. That difference is the feature; the assertion
     *   below is what proves it is the **only** one, which is spec SC-017.
     *
     * What is compared is everything else: the elements, the controls and
     * every class. That is what would change if a per-page variant crept in.
     *
     * The pattern is **anchored on the CTA wrapper's own class** with a
     * lookahead rather than matching the pair anywhere in the nav. Without the
     * anchor, any other nav element that happened to gain literally
     * `invisible opacity-0 ` would be stripped too and the comparison would
     * stop seeing it — the one hole a mutation test found in this exclusion
     * (reviewer, 2026-09-07). It costs nothing: there is one match per
     * document and it is the wrapper.
     */
    const CTA_STATE = /(in)?visible opacity-(0|100) (?=site-nav__cta)/g

    const navMarkup = (route: RoutePath) =>
      documentFor(route)
        .match(/<nav[\s\S]*?<\/nav>/)?.[0]
        .replaceAll(/ href="[^"]*"/g, '')
        .replaceAll(' aria-current="page"', '')
        .replaceAll(/ ?router-link-(exact-)?active/g, '')
        .replaceAll(CTA_STATE, '')
        /* Collapse the whitespace the strips above leave behind. */
        .replaceAll(/class="\s+/g, 'class="')

    const landingNav = navMarkup('/es')

    expect(landingNav).toBeDefined()
    expect(navMarkup('/es/nosotros')).toBe(landingNav)
  })

  it('should differ between the landing and About in the call to action alone', () => {
    /*
     * Feature 009, SC-014 and SC-017. The complement of the assertion above,
     * and the half that would otherwise be untested: the landing ships the
     * button **hidden in the HTML** — not hidden on mount, which is the flash
     * spec FR-045 forbids — and every route without a Hero ships it visible,
     * so there is nothing for a transition to run from on load (FR-044).
     */
    const ctaState = (route: RoutePath) =>
      documentFor(route).match(/class="([^"]*site-nav__cta[^"]*)"/)?.[1]

    expect(ctaState('/es')).toContain('invisible opacity-0')
    expect(ctaState('/en')).toContain('invisible opacity-0')
    expect(ctaState('/es/nosotros')).toContain('visible opacity-100')
    expect(ctaState('/en/about')).toContain('visible opacity-100')

    for (const route of ROUTES) {
      expect(ctaState(route), route).toContain('lg:block')
    }
  })

  it('should ship the no-scripting override for the call to action on every page', () => {
    /* The only mechanism that satisfies FR-045 and FR-046 together. Without
       it the landing's button would stay hidden forever for a visitor with
       scripting off, because the observer that reveals it never runs. */
    for (const route of ROUTES) {
      expect(documentFor(route), route).toMatch(
        /<noscript[^>]*><style>\.site-nav__cta\.site-nav__cta\{opacity:1;visibility:visible\}<\/style><\/noscript>/
      )
    }
  })

  it('should send the footer call booking to the booking page on every route', () => {
    /*
     * `decisions-open.md` § Decisión 2 scopes the URL to the hero, the final
     * CTA and the footer. The footer renders on all four documents, so this is
     * where a silent return to `kind: 'none'` would be widest — and it would
     * look like nothing more than a slightly greyer line in a column.
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

  it('should offer a pointer on every clickable control it ships', () => {
    /*
     * Nothing in the emitted stylesheet declared a cursor before this change,
     * so a native `<button>` kept the user agent's `default` and only anchors
     * looked right — by accident (`findings.md` § R56). The nav CTA is the one
     * control here that renders as a link and would have passed anyway; it is
     * included so the class is asserted rather than the element type.
     *
     * The hamburger and the close control cannot be asserted here: both are
     * behind `isScriptingAvailable` / the open flag and never reach a
     * prerendered document. Their component tests cover them.
     */
    for (const route of ROUTES) {
      const nav = documentFor(route).match(/<nav[\s\S]*?<\/nav>/)?.[0]
      const cta = nav?.match(
        /<a href="[^"]*#contacto"[^>]*class="([^"]*)"/
      )?.[1]

      expect(cta?.split(' '), route).toContain('cursor-pointer')
    }
  })

  it('should pin the nav without changing anything else about it', () => {
    /* `sticky`, not `fixed`: the nav stays in normal flow, so `<main>` needs no
       compensating top padding and every section's top padding stays
       `design y − nav height` (spec A-13, `rules.md` § R49). */
    for (const route of ROUTES) {
      const navClasses = documentFor(route)
        .match(/<nav [^>]*class="([^"]*)"/)?.[1]
        ?.split(' ')

      expect(navClasses, route).toContain('sticky')
      expect(navClasses, route).toContain('top-0')
      /* No background, no height and no opacity of its own — FR-042, and the
         reason spec D-07 is reported rather than fixed here. */
      expect(
        navClasses?.some(name => /^(bg-|h-|opacity-|backdrop-)/.test(name)),
        route
      ).toBe(false)
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

  it('should paint the document canvas with the ink base when the site is generated', () => {
    const css = emittedCss()

    /* On `html`, not on `body`: the canvas takes the root element's background
       and falls through to `body` only when the root's is transparent, so
       declaring it on `html` is what makes ONE declaration decide the canvas
       instead of two. `body` alone would also paint it — measured, not assumed
       (reviewer, 2026-09-08) — but it would leave the outcome depending on
       `html` staying transparent. What can never paint the canvas is the
       layout root, because it is a `<div>`, and that is the actual defect. */
    expect(css).toMatch(/html\s*\{[^}]*background-color:\s*var\(--ink-500\)/)
    /* And the token it names has to be reachable, or the rule resolves to
       nothing in silence — the trap `findings.md` § R46 records. */
    expect(css).toMatch(/--ink-500:\s*#262626/i)
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
    it(`should clip both axes on the layout root when the page is ${route}`, () => {
      /*
       * The vertical axis is decided, not defaulted (feature 010). `clip` and
       * not `hidden` on both, so the root never becomes a scroll container and
       * the pinned nav keeps working (feature 006 `research.md` § R3); and both
       * axes rather than one, because a glow is decoration and decoration must
       * not change how far the document scrolls on either.
       *
       * `overflow-x-clip` is asserted absent on purpose: it is what this
       * replaced, and it is exactly what a revert would put back.
       */
      const layoutRoot = documentFor(route)
        .match(/<div class="([^"]*bg-ink-500[^"]*)"/)?.[1]
        ?.split(' ')

      expect(layoutRoot, route).toContain('overflow-clip')
      expect(layoutRoot, route).not.toContain('overflow-x-clip')
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

    it(`should emit no destination from the primary hero control when the page is ${route}`, () => {
      /*
       * Section 05 does not exist, so the primary CTA renders its absence
       * rather than inventing a substitute (spec FR-012, FR-014): a real
       * `<button type="button">` that emits no fragment — stricter than the
       * shell, whose five links to sections that do not exist yet are a
       * recorded inconsistency (spec D-03, Roberto's).
       *
       * It also carries **no pointer cursor**, because it does nothing when
       * clicked. `ui-map.md` § 6 rules on that shape for the Proyectos slots:
       * a reserved control that looks clickable and leads nowhere reads as a
       * broken site.
       */
      const hero = heroSection(route)

      expect(hero, route).toContain('<button type="button"')
      expect(hero, route).not.toContain('#contacto')

      const primary = hero?.match(/<button type="button" class="([^"]*)"/)?.[1]

      expect(primary, route).toBeDefined()
      expect(primary?.split(' '), route).not.toContain('cursor-pointer')
    })

    it(`should send the secondary hero control to the booking page when the page is ${route}`, () => {
      /*
       * `decisions-open.md` #2 resolved on 2026-09-07. The guard against a
       * silent return to the inert branch, asserted on the artefact a visitor
       * actually receives: the Hero costs zero JavaScript, so this document is
       * also what a browser with scripting disabled renders.
       *
       * The arrow is `LinkArrow`'s and never the copy's, so it is asserted
       * inside the anchor rather than in the locale files, which are held free
       * of it by `tests/landing-copy.test.ts`.
       */
      const hero = heroSection(route)
      const locale = route === '/en' ? 'en' : 'es'
      const secondary = hero?.match(/<a href="([^"]*)"[^>]*>[\s\S]*?<\/a>/)?.[0]

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
     * `BotonPrimario.vue`'s note on the ring). What this catches is the
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
        expect(classes, route).not.toContain('rounded-control')
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

  it('should carry the identical eyebrow in all four documents', () => {
    /* ⚠️ Not a missing translation (spec FR-009). It is English inside the
       Spanish page by design, and the About page inherits it through the
       footer's `Categoría` item, which is the same string. */
    for (const route of ROUTES) {
      expect(documentFor(route), route).toContain(EYEBROW)
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
      why: 'Construimos con el estándar de las aplicaciones que admiramos. Tu negocio merece estar a la misma altura.',
      how: 'Con precisión: lo que tu negocio necesita, sin relleno. Un technology solution studio que responde como un solo equipo.',
      what: 'Diseñamos y construimos soluciones digitales alrededor de tu negocio.',
    },
    en: {
      eyebrow: 'Purpose',
      why: 'We build to the standard of the apps we admire. Your business deserves to be held to it.',
      how: 'With precision: what your business needs, nothing padded. A technology solution studio that answers as one team.',
      what: 'We design and build digital solutions around your business.',
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

  it('should close three of the shell dangling anchors on every landing document', () => {
    /*
     * The footer's *Navegación* column and the mobile menu already emit three
     * links at this anchor (`rules.md` § R50), and until this section existed
     * clicking any of them changed the URL and moved nothing.
     *
     * ⚠️ The shell resolves the fragment against the locale's home, so what it
     * emits is `/es#proposito` and `/en#proposito`, never a bare `#proposito`.
     * Asserting the bare form would have looked like the shell was broken.
     * The `id` is Spanish in both locales because Article VI keeps translated
     * route segments and Spanish anchors.
     */
    for (const route of ['/es', '/en'] as const) {
      expect(documentFor(route), route).toContain('<section id="proposito"')
      expect(documentFor(route), route).toContain(`href="${route}#proposito"`)
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
     * `rules.md` § R36. `app/shared/ui/SectionGlow.test.ts` asserts in both
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
