import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Feature 36 · the not-found output contract
 * (specs/036-not-found-page/contracts/build-output.md §§ 1–3), asserted on
 * the deployed artefact. `tests/global-setup.ts` regenerates `.output/public`
 * before this runs.
 *
 * Copy is read from the locale files on disk, never imported and never
 * retyped (docs/business/rules.md § R27); paths use `node:path` (§ R16).
 *
 * One row per locale: every assertion below runs for both documents.
 */
const ROOT = process.cwd()
const OUTPUT = join(ROOT, '.output', 'public')

type Locale = 'es' | 'en'

interface NotFoundCopy {
  eyebrow: string
  headline: string
  body: string
  cta: string
  shortcutsLabel: string
  shortcuts: { purpose: string; services: string; about: string }
}

interface NotFoundDocument {
  locale: Locale
  other: Locale
  file: string
  lang: string
  home: string
  otherHome: string
  shortcutHrefs: [string, string, string]
}

const DOCUMENTS: NotFoundDocument[] = [
  {
    locale: 'es',
    other: 'en',
    file: join('es', '404', 'index.html'),
    lang: 'es-MX',
    home: '/es',
    otherHome: '/en',
    shortcutHrefs: ['/es#proposito', '/es#servicios', '/es/nosotros'],
  },
  {
    locale: 'en',
    other: 'es',
    file: join('en', '404', 'index.html'),
    lang: 'en-US',
    home: '/en',
    otherHome: '/es',
    shortcutHrefs: ['/en#proposito', '/en#servicios', '/en/about'],
  },
]

interface LocaleMessages {
  pages: { notFound: { title: string } }
  shell: { notFound: NotFoundCopy }
}

function messages(locale: Locale): LocaleMessages {
  return JSON.parse(
    readFileSync(join(ROOT, 'i18n', 'locales', `${locale}.json`), 'utf8')
  ) as LocaleMessages
}

function readOutput(file: string): string {
  return readFileSync(join(OUTPUT, file), 'utf8')
}

/** Only the `<head>`: the body carries SVG `<title>`s and the nav's `hreflang` toggle. */
function headOf(file: string): string {
  return readOutput(file).match(/<head>(.*?)<\/head>/s)?.[1] ?? ''
}

/**
 * The `<body>` without `<script>` and `<style>`: the head inlines component
 * CSS that names `.site-nav__cta`, and the payload script repeats copy.
 */
function markupOf(file: string): string {
  const body = readOutput(file).match(/<body[^>]*>(.*)<\/body>/s)?.[1] ?? ''
  return body
    .replace(/<script\b[^>]*>.*?<\/script>/gs, '')
    .replace(/<style\b[^>]*>.*?<\/style>/gs, '')
}

/** The not-found `<section>`, from its opening tag to the footer. */
function sectionOf(file: string): string {
  const markup = markupOf(file)
  const start = markup.indexOf('<section class="relative flex min-h-not-found')
  const end = markup.indexOf('<footer', start)
  return start === -1 ? '' : markup.slice(start, end)
}

function count(haystack: string, pattern: RegExp): number {
  return [...haystack.matchAll(pattern)].length
}

function textOf(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/'/g, '&#39;')
}

function shortcutsNav(file: string, label: string): string {
  const pattern = new RegExp(
    `<nav aria-label="${escapeHtml(label)}"[^>]*>(.*?)</nav>`,
    's'
  )
  return markupOf(file).match(pattern)?.[1] ?? ''
}

describe.each(DOCUMENTS)('not-found output · $file', document => {
  const copy = messages(document.locale).shell.notFound
  const otherCopy = messages(document.other).shell.notFound
  const title = messages(document.locale).pages.notFound.title

  it('should write the document and its payload when generated', () => {
    expect(existsSync(join(OUTPUT, document.file))).toBe(true)
    expect(
      existsSync(join(OUTPUT, document.locale, '404', '_payload.json'))
    ).toBe(true)
  })

  it('should declare the locale language once when generated', () => {
    const html = readOutput(document.file)

    expect(count(html, /<html\b[^>]*\blang="/g)).toBe(1)
    expect(html).toMatch(new RegExp(`<html\\b[^>]*\\blang="${document.lang}"`))
  })

  it('should render the site nav and footer exactly once when generated', () => {
    const markup = markupOf(document.file)

    expect(count(markup, /<nav aria-label="[^"]*" class="site-nav /g)).toBe(1)
    expect(count(markup, /<footer\b/g)).toBe(1)
  })

  it('should render the headline as the only h1 when generated', () => {
    const headings = [
      ...markupOf(document.file).matchAll(/<h1\b[^>]*>(.*?)<\/h1>/gs),
    ]

    expect(headings).toHaveLength(1)
    expect(textOf(headings[0]?.[1] ?? '')).toBe(escapeHtml(copy.headline))
  })

  it('should render the pill with its radar dot and label when generated', () => {
    /* From the Pill's own root to the heading that follows it. */
    const pill = sectionOf(document.file).match(
      /<span class="inline-flex items-center gap-pill-gap rounded-full border border-glass-line bg-glass-dark[^"]*"[^>]*>.*?(?=<h1\b)/s
    )?.[0]

    expect(pill).toBeDefined()
    expect(pill).toContain('ping')
    expect(pill).toContain(`>${copy.eyebrow}<`)
  })

  it('should render the subtitle when generated', () => {
    expect(sectionOf(document.file)).toContain(`>${escapeHtml(copy.body)}</p>`)
  })

  it('should render exactly one LED control, pointing at the same-locale home, when generated', () => {
    const markup = markupOf(document.file)
    const leds = [
      ...markup.matchAll(
        /<a href="([^"]*)" class="led [^"]*"[^>]*>(.*?)<\/a>/gs
      ),
    ]

    expect(count(markup, /class="led /g)).toBe(1)
    expect(leds).toHaveLength(1)
    expect(leds[0]?.[1]).toBe(document.home)
    expect(textOf(leds[0]?.[2] ?? '')).toBe(copy.cta)
  })

  it('should render no nav call to action, not even its noscript override, when generated', () => {
    const body = readOutput(document.file).match(
      /<body[^>]*>(.*)<\/body>/s
    )?.[1]

    expect(body).toBeDefined()
    expect(body).not.toContain('site-nav__cta')
    expect(body).not.toMatch(/<noscript>.*site-nav__cta/s)
  })

  it('should render the three shortcuts in order inside a named nav when generated', () => {
    const nav = shortcutsNav(document.file, copy.shortcutsLabel)
    const links = [...nav.matchAll(/<a href="([^"]*)"[^>]*>(.*?)<\/a>/gs)]

    expect(links.map(link => link[1])).toEqual(document.shortcutHrefs)
    expect(links.map(link => textOf(link[2] ?? ''))).toEqual([
      copy.shortcuts.purpose,
      copy.shortcuts.services,
      copy.shortcuts.about,
    ])
  })

  it('should hide the shortcut separators from assistive technology when generated', () => {
    const nav = shortcutsNav(document.file, copy.shortcutsLabel)
    const separators = [...nav.matchAll(/<span([^>]*)>·<\/span>/g)]

    expect(separators).toHaveLength(2)
    for (const separator of separators)
      expect(separator[1]).toContain('aria-hidden="true"')
  })

  it("should point the language button at the other locale's home when generated", () => {
    const toggle = markupOf(document.file).match(
      /<a href="([^"]*)"[^>]*\bhreflang="[^"]*"/
    )

    expect(toggle?.[1]).toBe(document.otherHome)
  })

  it('should render the decorative rings with three children when generated', () => {
    const rings = sectionOf(document.file).match(
      /<div aria-hidden="true" class="not-found-rings [^"]*"[^>]*>(.*?)<\/div>/s
    )

    expect(rings).not.toBeNull()
    expect(count(rings?.[1] ?? '', /<span\b/g)).toBe(3)
  })

  it('should render one aria-hidden backdrop with the red glow when generated', () => {
    const section = sectionOf(document.file)
    const backdrops = [
      ...section.matchAll(
        /<div aria-hidden="true" class="section-backdrop [^"]*"[^>]*>(.*?)<\/div>/gs
      ),
    ]

    expect(backdrops).toHaveLength(1)
    const glow = backdrops[0]?.[1] ?? ''
    for (const utility of [
      'from-glow-red-400-60',
      'size-glow-1400-700',
      'left-not-found-glow-x',
      'top-not-found-glow-y',
    ])
      expect(glow).toContain(utility)
  })

  it("should contain none of the other locale's not-found copy when generated", () => {
    const markup = markupOf(document.file)

    for (const text of [
      otherCopy.headline,
      otherCopy.body,
      otherCopy.cta,
      otherCopy.shortcutsLabel,
      otherCopy.shortcuts.purpose,
      otherCopy.shortcuts.about,
    ]) {
      expect(markup).not.toContain(escapeHtml(text))
    }
  })

  it('should serialise no payload path when generated, so the client keeps the visitor URL', () => {
    /*
     * Guards the server-only `delete useNuxtApp().payload.path` in
     * `useNotFoundDocument.ts` (research R1 F7/F8). With `path` present the
     * client router replaces the address bar with `/<locale>/404` — a silent
     * failure a Nuxt upgrade could reintroduce. The root object of the
     * devalue-serialised `__NUXT_DATA__` holds the payload's top-level keys;
     * real pages carry `path` there (asserted below as a control).
     */
    const rootKeys = (file: string): string[] => {
      const json = readOutput(file).match(
        /<script[^>]*id="__NUXT_DATA__"[^>]*>(.*?)<\/script>/s
      )?.[1]
      const [root] = JSON.parse(json ?? '[]') as [Record<string, unknown>?]
      return Object.keys(root ?? {})
    }

    expect(rootKeys(document.file)).toContain('error')
    expect(rootKeys(document.file)).not.toContain('path')
    expect(rootKeys(join(document.locale, 'index.html'))).toContain('path')
  })

  it('should carry no client-side language switch attributes when generated', () => {
    const html = readOutput(document.file)

    expect(html).not.toMatch(/data-en|data-href-en|data-aria-en/)
  })

  it('should render no anchor without an href when generated', () => {
    expect(markupOf(document.file)).not.toMatch(/<a(?![^>]*\bhref=)[^>]*>/)
  })

  it('should carry exactly one title and one noindex robots directive in the head when generated', () => {
    const head = headOf(document.file)

    expect(count(head, /<title>/g)).toBe(1)
    expect(head).toContain(`<title>${title}</title>`)
    expect(count(head, /<meta name="robots"/g)).toBe(1)
    expect(head).toContain('<meta name="robots" content="noindex">')
  })

  it('should carry no canonical, hreflang, description or page-level Open Graph in the head when generated', () => {
    const head = headOf(document.file)

    expect(head).not.toContain('rel="canonical"')
    expect(head).not.toContain('hreflang')
    expect(head).not.toContain('name="description"')
    expect(head).not.toMatch(
      /property="og:(?:url|locale|locale:alternate|title|description)"/
    )
  })
})

describe('not-found output · removed shells and sitemap', () => {
  it('should not write 200.html or 404.html at the output root when generated', () => {
    expect(existsSync(join(OUTPUT, '200.html'))).toBe(false)
    expect(existsSync(join(OUTPUT, '404.html'))).toBe(false)
  })

  it('should list no not-found document in sitemap.xml when generated', () => {
    const locs = [
      ...readOutput('sitemap.xml').matchAll(/<loc>([^<]*)<\/loc>/g),
    ].map(match => match[1] ?? '')

    expect(locs.length).toBeGreaterThan(0)
    for (const loc of locs) expect(loc).not.toContain('404')
  })
})

describe('not-found output · nav height parity (Roberto, 2026-10-15)', () => {
  const endGroupClass = (file: string): string =>
    markupOf(file).match(/<div class="([^"]*\bnav-row__end\b[^"]*)"/)?.[1] ?? ''

  it.each(DOCUMENTS.map(document => document.file))(
    'should hold the nav end group at the CTA height when %s is generated',
    file => {
      expect(endGroupClass(file)).toContain('lg:min-h-nav-cta-h')
    }
  )

  it.each([
    join('es', 'index.html'),
    join('en', 'index.html'),
    join('es', 'nosotros', 'index.html'),
    join('en', 'about', 'index.html'),
  ])('should leave the nav end group unchanged when %s is generated', file => {
    expect(endGroupClass(file)).toBe(
      'nav-row__end flex items-center gap-nav-end-gap'
    )
  })
})

describe('not-found output · other pages keep their nav call to action', () => {
  it('should keep the About call to action visible from the start when generated', () => {
    expect(markupOf(join('en', 'about', 'index.html'))).toContain(
      'visible opacity-100 site-nav__cta'
    )
  })

  it('should keep the home call to action hidden until the hero is left when generated', () => {
    expect(markupOf(join('en', 'index.html'))).toContain(
      'invisible opacity-0 site-nav__cta'
    )
  })
})
