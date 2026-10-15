import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  SHARE_IMAGE,
  SITE_ALTERNATE_NAME,
  SITE_LOGO_URL,
} from '@/features/shell/data/siteIdentity'
import { SOCIAL_PROFILES } from '@/features/shell/data/socialProfiles'

/**
 * Feature 35 · the SEO output contract (specs/035-technical-seo-indexing/
 * contracts/build-output.md §§ 1–5), asserted on the deployed artefact.
 * `tests/global-setup.ts` regenerates `.output/public` before this runs.
 *
 * Copy is read from the locale files on disk, never imported and never
 * retyped (docs/business/rules.md § R27); paths use `node:path`, not
 * `new URL` (§ R16).
 */
const ROOT = process.cwd()
const OUTPUT = join(ROOT, '.output', 'public')
const ORIGIN = 'https://muush.dev'

type Locale = 'es' | 'en'
type PageKey = 'home' | 'about'

interface Page {
  path: string
  file: string
  locale: Locale
  key: PageKey
  /** The same page in the other locale. */
  counterpart: string
}

const PAGES: Page[] = [
  {
    path: '/es',
    file: 'es/index.html',
    locale: 'es',
    key: 'home',
    counterpart: '/en',
  },
  {
    path: '/en',
    file: 'en/index.html',
    locale: 'en',
    key: 'home',
    counterpart: '/es',
  },
  {
    path: '/es/nosotros',
    file: 'es/nosotros/index.html',
    locale: 'es',
    key: 'about',
    counterpart: '/en/about',
  },
  {
    path: '/en/about',
    file: 'en/about/index.html',
    locale: 'en',
    key: 'about',
    counterpart: '/es/nosotros',
  },
]

const LANGUAGE_TAG: Record<Locale, string> = { es: 'es-MX', en: 'en-US' }
const OG_LOCALE: Record<Locale, string> = { es: 'es_MX', en: 'en_US' }

function readOutput(file: string): string {
  return readFileSync(join(OUTPUT, file), 'utf8')
}

/** Only the `<head>`: the body carries SVG `<title>`s that are not the document title. */
function headOf(page: Page): string {
  return readOutput(page.file).match(/<head>(.*?)<\/head>/s)?.[1] ?? ''
}

function pageCopy(page: Page): { title: string; description: string } {
  const messages = JSON.parse(
    readFileSync(join(ROOT, 'i18n', 'locales', `${page.locale}.json`), 'utf8')
  )
  return messages.pages[page.key]
}

function count(haystack: string, pattern: RegExp): number {
  return [...haystack.matchAll(new RegExp(pattern.source, 'g'))].length
}

/** The `content` of every `<meta>` whose name/property is exactly `name`. */
function metaContents(head: string, name: string): string[] {
  const tags = [...head.matchAll(/<meta\b[^>]*>/g)].map(match => match[0])
  return tags
    .filter(
      tag =>
        tag.includes(`property="${name}"`) || tag.includes(`name="${name}"`)
    )
    .map(tag => tag.match(/content="([^"]*)"/)?.[1] ?? '')
}

/** `href` of every alternate link carrying exactly this `hreflang`. */
function alternates(head: string, hreflang: string): string[] {
  const links = [...head.matchAll(/<link\b[^>]*rel="alternate"[^>]*>/g)].map(
    m => m[0]
  )
  return links
    .filter(link => link.includes(`hreflang="${hreflang}"`))
    .map(link => link.match(/href="([^"]*)"/)?.[1] ?? '')
}

interface GraphNode {
  '@type': string | string[]
  [key: string]: unknown
}

/**
 * Searched in the whole document: `nuxt-schema-org` renders its one
 * `<script type="application/ld+json">` at the end of `<body>`, which is
 * still the prerendered HTML (FR-011) and is valid for search engines.
 */
function jsonLdBlocks(html: string): string[] {
  return [
    ...html.matchAll(
      /<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs
    ),
  ].map(match => match[1] ?? '')
}

function graphOf(html: string): GraphNode[] {
  return JSON.parse(jsonLdBlocks(html)[0] ?? '{}')['@graph'] ?? []
}

function nodeOfType(graph: GraphNode[], type: string): GraphNode | undefined {
  return graph.find(node => [node['@type']].flat().includes(type))
}

function decodeEntities(text: string): string {
  return text
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
}

describe('seo output · titles and descriptions', () => {
  for (const page of PAGES) {
    it(`should emit the approved title and description exactly once when the page is ${page.path}`, () => {
      const head = headOf(page)
      const { title, description } = pageCopy(page)

      expect(
        [...head.matchAll(/<title>([^<]*)<\/title>/g)].map(m => m[1])
      ).toEqual([title])
      expect(metaContents(head, 'description').map(decodeEntities)).toEqual([
        description,
      ])
      expect(title.endsWith(' · muush')).toBe(true)
    })
  }

  it('should give the four pages pairwise distinct titles and descriptions when generated', () => {
    const copies = PAGES.map(pageCopy)

    expect(new Set(copies.map(copy => copy.title)).size).toBe(PAGES.length)
    expect(new Set(copies.map(copy => copy.description)).size).toBe(
      PAGES.length
    )
  })
})

describe('seo output · language, canonical and alternates', () => {
  for (const page of PAGES) {
    it(`should declare lang, canonical and each regional alternate once when the page is ${page.path}`, () => {
      const html = readOutput(page.file)
      const head = headOf(page)
      const spanish = page.locale === 'es' ? page.path : page.counterpart
      const english = page.locale === 'en' ? page.path : page.counterpart

      expect(count(html, /<html\b[^>]*\blang="/)).toBe(1)
      expect(html).toMatch(
        new RegExp(`<html\\b[^>]*\\blang="${LANGUAGE_TAG[page.locale]}"`)
      )
      expect(count(head, /rel="canonical"/)).toBe(1)
      expect(head).toContain(`rel="canonical" href="${ORIGIN}${page.path}"`)
      expect(alternates(head, 'es-MX')).toEqual([`${ORIGIN}${spanish}`])
      expect(alternates(head, 'en-US')).toEqual([`${ORIGIN}${english}`])
      expect(alternates(head, 'x-default')).toEqual([`${ORIGIN}${spanish}`])
      /* i18n's language-only catch-alls (spec A-04): tolerated, never doubled. */
      expect(alternates(head, 'es').length).toBeLessThanOrEqual(1)
      expect(alternates(head, 'en').length).toBeLessThanOrEqual(1)
    })
  }
})

describe('seo output · social preview', () => {
  for (const page of PAGES) {
    it(`should emit each social tag exactly once when the page is ${page.path}`, () => {
      const head = headOf(page)
      const { title, description } = pageCopy(page)

      expect(metaContents(head, 'og:title')).toEqual([title])
      expect(metaContents(head, 'og:description').map(decodeEntities)).toEqual([
        description,
      ])
      expect(metaContents(head, 'og:type')).toEqual(['website'])
      expect(metaContents(head, 'og:site_name')).toEqual(['muush'])
      expect(metaContents(head, 'og:url')).toEqual([`${ORIGIN}${page.path}`])
      expect(metaContents(head, 'og:locale')).toEqual([OG_LOCALE[page.locale]])
    })

    it(`should use the small card and no image tag when no share image is set and the page is ${page.path}`, () => {
      const html = readOutput(page.file)

      expect(SHARE_IMAGE.url).toBeNull()
      expect(metaContents(headOf(page), 'twitter:card')).toEqual(['summary'])
      expect(html).not.toContain('og:image')
      expect(html).not.toContain('twitter:image')
    })

    it(`should emit one indexable robots meta tag when the page is ${page.path}`, () => {
      const robots = metaContents(headOf(page), 'robots')

      expect(robots).toHaveLength(1)
      expect(robots[0]?.startsWith('index, follow')).toBe(true)
    })
  }
})

describe('seo output · structured data', () => {
  for (const page of PAGES) {
    it(`should carry one graph with the muush Organization when the page is ${page.path}`, () => {
      const html = readOutput(page.file)
      const organization = nodeOfType(graphOf(html), 'Organization')
      const logo = nodeOfType(graphOf(html), 'ImageObject')

      expect(jsonLdBlocks(html)).toHaveLength(1)
      expect(organization?.name).toBe('muush')
      expect(organization?.alternateName).toBe(SITE_ALTERNATE_NAME)
      expect(String(organization?.url).replace(/\/$/, '')).toBe(ORIGIN)
      expect(organization?.sameAs).toEqual(
        SOCIAL_PROFILES.map(profile => profile.href)
      )
      expect(logo?.url).toBe(SITE_LOGO_URL)
    })
  }

  it('should declare both About pages as AboutPage when generated', () => {
    for (const page of PAGES.filter(candidate => candidate.key === 'about')) {
      expect(
        nodeOfType(graphOf(readOutput(page.file)), 'AboutPage'),
        page.path
      ).toBeDefined()
    }
  })
})

/**
 * The locale-independent shape of a graph: per node, its `@id` fragment
 * (`#website`, `#webpage`, `#identity`, `#logo`), its `@type` set, its key
 * set and the `@type` of each `potentialAction`. Values that legitimately
 * differ per locale (urls, names, copy, `inLanguage`) are left out, as are
 * the two directed translation links (`workTranslation` on the Spanish
 * WebSite, `translationOfWork` on the English one), which name each other.
 */
const TRANSLATION_LINKS = ['workTranslation', 'translationOfWork']

function graphShape(html: string): string[] {
  return graphOf(html)
    .map(node => {
      const id = String(node['@id'] ?? '').replace(/^[^#]*/, '')
      const types = [node['@type']].flat().sort().join('+')
      const keys = Object.keys(node)
        .filter(key => !TRANSLATION_LINKS.includes(key))
        .sort()
        .join(',')
      const actions = [node.potentialAction ?? []]
        .flat()
        .map(action => (action as GraphNode)['@type'])
        .join('+')
      return `${id} | ${types} | ${keys} | actions:${actions}`
    })
    .sort()
}

describe('seo output · structured-data parity across locales', () => {
  const PAIRS: [string, string][] = [
    ['/es', '/en'],
    ['/es/nosotros', '/en/about'],
  ]

  for (const [spanish, english] of PAIRS) {
    it(`should give ${spanish} and ${english} structurally identical graphs when generated`, () => {
      const fileFor = (path: string): string =>
        PAGES.find(page => page.path === path)?.file ?? ''

      expect(graphShape(readOutput(fileFor(english)))).toEqual(
        graphShape(readOutput(fileFor(spanish)))
      )
    })
  }
})

describe('seo output · sitemap.xml', () => {
  const sitemap = (): string => readOutput('sitemap.xml')
  const urlBlocks = (): string[] =>
    [...sitemap().matchAll(/<url>(.*?)<\/url>/gs)].map(m => m[1] ?? '')

  it('should list exactly the four pages when generated', () => {
    const locs = urlBlocks().map(
      block => block.match(/<loc>([^<]*)<\/loc>/)?.[1]
    )

    expect(locs.sort()).toEqual(
      PAGES.map(page => `${ORIGIN}${page.path}`).sort()
    )
  })

  it('should give every page exactly the es-MX, en-US and x-default alternates when generated', () => {
    for (const block of urlBlocks()) {
      const hreflangs = [...block.matchAll(/hreflang="([^"]*)"/g)].map(
        m => m[1]
      )

      expect(hreflangs.sort()).toEqual(['en-US', 'es-MX', 'x-default'])
    }
  })

  it('should write a single sitemap with no index, stylesheet or media entries when generated', () => {
    expect(existsSync(join(OUTPUT, 'sitemap_index.xml'))).toBe(false)
    expect(existsSync(join(OUTPUT, '__sitemap__'))).toBe(false)
    expect(sitemap()).not.toMatch(/<image:image>|<video:video>|xml-stylesheet/)
  })
})

describe('seo output · robots.txt', () => {
  const lines = (): string[] =>
    readOutput('robots.txt')
      .split('\n')
      .map(line => line.trim())

  it('should allow every user agent when generated whatever the build environment is called', () => {
    expect(
      readOutput('robots.txt').startsWith('# START nuxt-robots (indexable)')
    ).toBe(true)
    expect(lines()).toContain('User-agent: *')
    expect(lines()).not.toContain('Disallow: /')
  })

  it('should reference the sitemap exactly once when generated', () => {
    expect(lines().filter(line => line.startsWith('Sitemap:'))).toEqual([
      `Sitemap: ${ORIGIN}/sitemap.xml`,
    ])
  })

  it('should never keep a hand-written robots file in public when the repository is checked', () => {
    expect(existsSync(join(ROOT, 'public', 'robots.txt'))).toBe(false)
    expect(existsSync(join(ROOT, 'public', '_robots.txt'))).toBe(false)
  })
})

describe('seo output · root object and client bundle', () => {
  it('should keep the root object noindex with regional alternates when generated', () => {
    const root = readOutput('index.html')

    expect(root).toContain('<meta name="robots" content="noindex" />')
    expect(root).not.toContain('index, follow')
    expect(alternates(root, 'es-MX')).toEqual([`${ORIGIN}/es`])
    expect(alternates(root, 'en-US')).toEqual([`${ORIGIN}/en`])
    expect(alternates(root, 'x-default')).toEqual([`${ORIGIN}/es`])
    expect(alternates(root, 'en')).toEqual([])
  })

  it('should ship no bot-detection or schema-org graph code to the browser when generated', () => {
    const scripts = readdirSync(join(OUTPUT, '_nuxt'))
      .filter(file => file.endsWith('.js'))
      .map(file => readOutput(join('_nuxt', file)))
      .join('\n')

    expect(scripts).not.toMatch(/botd|fingerprintjs|BotDetector/)
    expect(scripts).not.toMatch(/schema-org-graph|primaryImageOfPage/)
  })
})
