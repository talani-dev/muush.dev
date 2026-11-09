import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { runInNewContext } from 'node:vm'
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
type PageKey = 'home' | 'about' | 'faq' | 'privacy' | 'terms'

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
  /* Feature 46 · Preguntas, indexed from day one (Roberto 2026-10-31). */
  {
    path: '/es/preguntas',
    file: 'es/preguntas/index.html',
    locale: 'es',
    key: 'faq',
    counterpart: '/en/faq',
  },
  {
    path: '/en/faq',
    file: 'en/faq/index.html',
    locale: 'en',
    key: 'faq',
    counterpart: '/es/preguntas',
  },
  /* Feature 48 · the legal pages, indexed (Roberto 2026-10-31, 2026-11-05). */
  {
    path: '/es/privacidad',
    file: 'es/privacidad/index.html',
    locale: 'es',
    key: 'privacy',
    counterpart: '/en/privacy',
  },
  {
    path: '/en/privacy',
    file: 'en/privacy/index.html',
    locale: 'en',
    key: 'privacy',
    counterpart: '/es/privacidad',
  },
  {
    path: '/es/terminos',
    file: 'es/terminos/index.html',
    locale: 'es',
    key: 'terms',
    counterpart: '/en/terms',
  },
  {
    path: '/en/terms',
    file: 'en/terms/index.html',
    locale: 'en',
    key: 'terms',
    counterpart: '/es/terminos',
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

  it('should give every page pairwise distinct titles and descriptions when generated', () => {
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
      /* Feature 37: English is the default, so x-default names the English
         counterpart of the page — `/en` on both homes, `/en/about` on the
         About pair (i18n derives it per route; Roberto, D4). */
      expect(alternates(head, 'x-default')).toEqual([`${ORIGIN}${english}`])
      /* i18n's language-only catch-alls (spec A-04): tolerated, never doubled. */
      expect(alternates(head, 'es').length).toBeLessThanOrEqual(1)
      expect(alternates(head, 'en').length).toBeLessThanOrEqual(1)
    })
  }
})

describe('seo output · site default locale', () => {
  /* Feature 37 (D3): `site.defaultLocale` is not declared in nuxt.config.ts;
     nuxt-site-config derives it from the i18n default locale's `language`.
     This pins the effective value that ships inline in every page. The
     payload is a minified IIFE whose literals are hoisted into parameters
     (`defaultLocale:b`), so a regex on the source cannot read it reliably;
     it is evaluated in an empty `node:vm` context instead — our own build
     artefact, with no access to this process. */
  const siteConfigOf = (html: string): Record<string, unknown> => {
    const source = html.match(
      /<script>window\.__NUXT_SITE_CONFIG__=([^<]*)<\/script>/
    )?.[1]
    expect(source).toBeDefined()
    return runInNewContext(`(${source})`, {}) as Record<string, unknown>
  }

  for (const page of PAGES) {
    it(`should ship en-US as the site default locale when the page is ${page.path}`, () => {
      const config = siteConfigOf(readOutput(page.file))

      expect(config.defaultLocale).toBe('en-US')
      expect(config.currentLocale).toBe(LANGUAGE_TAG[page.locale])
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

    it(`should emit the share image once with its size, type and alt and the large card when the page is ${page.path}`, () => {
      const head = headOf(page)

      expect(metaContents(head, 'og:image')).toEqual([SHARE_IMAGE.url])
      expect(metaContents(head, 'og:image:width')).toEqual([
        String(SHARE_IMAGE.width),
      ])
      expect(metaContents(head, 'og:image:height')).toEqual([
        String(SHARE_IMAGE.height),
      ])
      expect(metaContents(head, 'og:image:type')).toEqual([SHARE_IMAGE.type])
      expect(metaContents(head, 'og:image:alt')).toEqual([SHARE_IMAGE.alt])
      expect(metaContents(head, 'twitter:card')).toEqual([
        'summary_large_image',
      ])
      expect(metaContents(head, 'twitter:image')).toEqual([SHARE_IMAGE.url])
      /* The handoff asked for `og:image:alt` only; no twitter alt is set. */
      expect(metaContents(head, 'twitter:image:alt')).toEqual([])
    })

    it(`should emit one indexable robots meta tag when the page is ${page.path}`, () => {
      const robots = metaContents(headOf(page), 'robots')

      expect(robots).toHaveLength(1)
      expect(robots[0]?.startsWith('index, follow')).toBe(true)
    })
  }
})

describe('seo output · the share image file', () => {
  /*
   * The image is served from the assets bucket (`SHARE_IMAGE.url`); the site
   * ships no copy, so a stale duplicate can never be scraped instead.
   */
  it('should point at the assets bucket and ship no og-image of its own when generated', () => {
    expect(SHARE_IMAGE.url).toBe(
      'https://assets.muush.dev/brand/cover/og-image.png'
    )
    expect(existsSync(join(ROOT, 'public', 'og-image.png'))).toBe(false)
    expect(existsSync(join(OUTPUT, 'og-image.png'))).toBe(false)
  })
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

  it('should open the JSON-LD script with the module attributes on every page when generated', () => {
    /* Review-46 fix round 1: the Preguntas tag is written with `useHead`
       (see `usePageSeo.ts`) but reads the module's configured
       `scriptAttributes`, so its opening tag matches every other page. */
    const openingTag = (file: string): string =>
      readOutput(file).match(
        /<script type="application\/ld\+json"[^>]*>/
      )?.[0] ?? ''
    const home = openingTag(PAGES[0]?.file ?? '')

    expect(home).toContain('data-nuxt-schema-org="true"')
    for (const page of PAGES)
      expect(openingTag(page.file), page.path).toBe(home)
  })

  it('should declare both Preguntas pages as a plain WebPage, never FAQPage, when generated', () => {
    /* Feature 46 · FR-038: no questions yet, so no question-and-answer
       type; the schema-org default would infer FAQPage on /en/faq only. */
    for (const page of PAGES.filter(candidate => candidate.key === 'faq')) {
      const graph = graphOf(readOutput(page.file))
      const webPage = graph.find(node =>
        String(node['@id'] ?? '').endsWith('#webpage')
      )

      expect(webPage?.['@type'], page.path).toBe('WebPage')
      expect(nodeOfType(graph, 'FAQPage'), page.path).toBeUndefined()
      expect(nodeOfType(graph, 'AboutPage'), page.path).toBeUndefined()
    }
  })
})

/**
 * The locale-independent shape of a graph: per node, its `@id` fragment
 * (`#website`, `#webpage`, `#identity`, `#logo`), its `@type` set, its key
 * set and the `@type` of each `potentialAction`. Values that legitimately
 * differ per locale (urls, names, copy, `inLanguage`) are left out, as are
 * the two directed translation links (`workTranslation` on the default
 * locale's WebSite — English since feature 37 — and `translationOfWork` on the
 * other), which name each other.
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
    ['/es/preguntas', '/en/faq'],
    ['/es/privacidad', '/en/privacy'],
    ['/es/terminos', '/en/terms'],
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

  it('should list exactly the ten pages when generated', () => {
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

  it("should point every entry's x-default at the English counterpart when generated", () => {
    /* Feature 37: the sitemap's x-default follows `i18n.defaultLocale`. */
    for (const block of urlBlocks()) {
      const loc = block.match(/<loc>([^<]*)<\/loc>/)?.[1] ?? ''
      const page = PAGES.find(candidate => `${ORIGIN}${candidate.path}` === loc)
      const english = page?.locale === 'en' ? page.path : page?.counterpart

      expect(page, loc).toBeDefined()
      expect(block.match(/hreflang="x-default" href="([^"]*)"/)?.[1], loc).toBe(
        `${ORIGIN}${english}`
      )
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

  /*
   * Feature 49 · the AI crawlers in two explicit allow-all groups
   * (specs/049-consented-tracking/contracts/build-output.md § 3, research
   * R5–R6). Asserted as groups, not whitespace.
   */
  const AI_SEARCH_AGENTS = [
    'OAI-SearchBot',
    'ChatGPT-User',
    'Claude-SearchBot',
    'Claude-User',
    'PerplexityBot',
    'Perplexity-User',
  ]
  const AI_TRAINING_AGENTS = [
    'GPTBot',
    'ClaudeBot',
    'Google-Extended',
    'Applebot-Extended',
    'CCBot',
  ]

  /** Each group: its user agents and its rules, split on blank lines. */
  function groups(): { agents: string[]; rules: string[] }[] {
    return readOutput('robots.txt')
      .split(/\n\s*\n/)
      .map(block => block.split('\n').map(line => line.trim()))
      .map(block => ({
        agents: block
          .filter(line => line.startsWith('User-agent:'))
          .map(line => line.slice('User-agent:'.length).trim()),
        rules: block.filter(line => /^(Allow|Disallow):/.test(line)),
      }))
      .filter(group => group.agents.length > 0)
  }

  it('should name each of the 11 AI agents exactly once when generated', () => {
    for (const agent of [...AI_SEARCH_AGENTS, ...AI_TRAINING_AGENTS]) {
      expect(
        lines().filter(line => line === `User-agent: ${agent}`),
        agent
      ).toHaveLength(1)
    }
  })

  it('should put the search agents and the training agents in their own groups when generated', () => {
    const agentSets = groups().map(group => group.agents)

    expect(agentSets).toContainEqual(AI_SEARCH_AGENTS)
    expect(agentSets).toContainEqual(AI_TRAINING_AGENTS)
    expect(agentSets).toContainEqual(['*'])
  })

  it('should give every group the single allow-everything rule when generated', () => {
    for (const group of groups()) {
      expect(group.rules, group.agents.join(', ')).toEqual(['Disallow:'])
    }
  })
})

describe('seo output · llms.txt (feature 49)', () => {
  /*
   * contracts/build-output.md § 4: the approved text of copy-drafts.md § C,
   * byte for byte, in the llmstxt.org shape, linking exactly the sitemap.
   * The contract's "no `@`" predates Roberto's approval of 2026-11-07, which
   * added `support@muush.dev` (already on every page); that one address is
   * the only one allowed.
   */
  const llms = () => readOutput('llms.txt')
  const sitemap = (): string => readOutput('sitemap.xml')

  function approvedBlock(): string {
    const drafts = readFileSync(
      join(ROOT, 'specs', '049-consented-tracking', 'copy-drafts.md'),
      'utf8'
    )
    const section = drafts.slice(drafts.indexOf('## C ·'))
    const fenced = section.match(/```markdown\n([\s\S]*?)\n```/)
    return fenced?.[1] ?? ''
  }

  it('should publish the file of public/ unchanged when generated', () => {
    expect(llms()).toBe(readFileSync(join(ROOT, 'public', 'llms.txt'), 'utf8'))
  })

  it('should carry the approved text of copy-drafts § C when generated', () => {
    expect(approvedBlock().length).toBeGreaterThan(0)
    expect(llms()).toBe(`${approvedBlock()}\n`)
  })

  it('should open with the H1 and a blockquote summary before the first section', () => {
    const text = llms()
    const firstSection = text.indexOf('\n## ')

    expect(text.startsWith('# muush\n')).toBe(true)
    expect(text.slice(0, firstSection)).toMatch(/\n> \S/)
  })

  it('should list only links in every section when generated', () => {
    const sections = llms().split('\n## ').slice(1)

    for (const section of sections) {
      const items = section.split('\n').slice(1).filter(Boolean)
      expect(items.length, section).toBeGreaterThan(0)
      for (const item of items) {
        expect(item).toMatch(
          /^- \[[^\]]+\]\(https:\/\/muush\.dev\/[^)]*\)(: .+)?$/
        )
      }
    }
  })

  it('should link exactly the sitemap URLs when generated', () => {
    const linked = [...llms().matchAll(/\]\((https:\/\/[^)]+)\)/g)].map(
      match => match[1]
    )
    const locs = [...sitemap().matchAll(/<loc>([^<]*)<\/loc>/g)].map(
      match => match[1]
    )

    expect(linked).toHaveLength(10)
    expect([...linked].sort()).toEqual([...locs].sort())
  })

  it('should carry no phone or WhatsApp and only the published support address', () => {
    const text = llms()

    expect(text).not.toMatch(/wa\.me|whatsapp|\+52|\d{8,}/i)
    expect(text.match(/\S+@\S+/g)).toEqual(['support@muush.dev,'])
  })
})

describe('seo output · no source maps (feature 49, FR-050)', () => {
  function filesUnder(directory: string): string[] {
    return readdirSync(directory, { withFileTypes: true }).flatMap(entry =>
      entry.isDirectory()
        ? filesUnder(join(directory, entry.name))
        : [join(directory, entry.name)]
    )
  }

  it('should publish no .map file and no sourceMappingURL when generated', () => {
    const files = filesUnder(OUTPUT)

    expect(files.filter(file => file.endsWith('.map'))).toEqual([])
    for (const file of files.filter(path => /\.(js|css)$/.test(path))) {
      expect(readFileSync(file, 'utf8'), file).not.toContain('sourceMappingURL')
    }
  })
})

describe('seo output · root object and client bundle', () => {
  it('should keep the root object noindex with regional alternates when generated', () => {
    const root = readOutput('index.html')

    expect(root).toContain('<meta name="robots" content="noindex" />')
    expect(root).not.toContain('index, follow')
    expect(alternates(root, 'es-MX')).toEqual([`${ORIGIN}/es`])
    expect(alternates(root, 'en-US')).toEqual([`${ORIGIN}/en`])
    expect(alternates(root, 'x-default')).toEqual([`${ORIGIN}/en`])
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
