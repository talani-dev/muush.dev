import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Feature 49 · nothing is tracked before consent, asserted on the artefact
 * that is deployed (contracts/build-output.md §§ 1–2, spec FR-010, FR-013,
 * FR-015). `tests/global-setup.ts` has just run `pnpm generate`.
 *
 * Read with `node:fs` + `process.cwd()` (docs/business/rules.md § R27). The
 * two IDs are assembled from fragments so this file never carries them.
 */
const ROOT = process.cwd()
const OUTPUT = join(ROOT, '.output', 'public')
const APP = join(ROOT, 'app')

const GA_ID = ['G', 'RHZC650SQS'].join('-')
const META_ID = ['1488638', '740001981'].join('')

function filesUnder(directory: string): string[] {
  return readdirSync(directory).flatMap(entry => {
    const path = join(directory, entry)
    return statSync(path).isDirectory() ? filesUnder(path) : [path]
  })
}

const HTML = filesUnder(OUTPUT)
  .filter(path => path.endsWith('.html'))
  .map(path => ({
    path: relative(OUTPUT, path),
    html: readFileSync(path, 'utf8'),
  }))

/** Every `<script …>` opening tag of a document. */
function scriptTags(html: string): string[] {
  return html.match(/<script\b[^>]*>/gi) ?? []
}

/** The document with its serialized Nuxt payload/config scripts removed. */
function withoutNuxtData(html: string): string {
  return html
    .replace(/<script[^>]*id="__NUXT_DATA__"[^>]*>[\s\S]*?<\/script>/g, '')
    .replace(/<script>window\.__NUXT__=[\s\S]*?<\/script>/g, '')
}

describe('tracking output · prerendered HTML', () => {
  it('should prerender every page and both not-found documents', () => {
    const paths = HTML.map(page => page.path)

    expect(paths.length).toBeGreaterThanOrEqual(12)
    expect(paths).toContain(join('es', '404', 'index.html'))
    expect(paths).toContain(join('en', '404', 'index.html'))
  })

  it('should carry no vendor script tag in any document', () => {
    for (const { path, html } of HTML) {
      for (const tag of scriptTags(html)) {
        expect(tag, path).not.toMatch(
          /googletagmanager|fbevents|connect\.facebook\.net/
        )
      }
    }
  })

  it('should carry no inline gtag or fbq bootstrap in any document', () => {
    for (const { path, html } of HTML) {
      expect(html, path).not.toMatch(/\bfbq\(|\bgtag\(/)
    }
  })

  it('should carry no noscript image pixel in any document', () => {
    for (const { path, html } of HTML) {
      const noscripts = html.match(/<noscript[\s\S]*?<\/noscript>/gi) ?? []
      for (const block of noscripts) {
        expect(block, path).not.toMatch(/facebook\.com\/tr|google/)
      }
    }
  })

  it('should print the two ids only inside the serialized runtime config', () => {
    for (const { path, html } of HTML) {
      const rest = withoutNuxtData(html)
      expect(rest.includes(GA_ID), path).toBe(false)
      expect(rest.includes(META_ID), path).toBe(false)
    }
  })
})

describe('tracking output · source hygiene', () => {
  it('should write neither id in any file under app/', () => {
    const sources = filesUnder(APP).filter(path =>
      /\.(ts|vue|js|json)$/.test(path)
    )

    expect(sources.length).toBeGreaterThan(0)
    for (const path of sources) {
      const source = readFileSync(path, 'utf8')
      expect(source.includes(GA_ID), relative(ROOT, path)).toBe(false)
      expect(source.includes(META_ID), relative(ROOT, path)).toBe(false)
    }
  })

  it('should declare both ids in the public runtime config', () => {
    const config = readFileSync(join(ROOT, 'nuxt.config.ts'), 'utf8')

    expect(config).toContain(`gaMeasurementId: '${GA_ID}'`)
    expect(config).toContain(`metaPixelId: '${META_ID}'`)
  })

  it('should list both overrides with blank values in .env.example', () => {
    const example = readFileSync(join(ROOT, '.env.example'), 'utf8')

    expect(example).toMatch(/^NUXT_PUBLIC_GA_MEASUREMENT_ID=$/m)
    expect(example).toMatch(/^NUXT_PUBLIC_META_PIXEL_ID=$/m)
  })
})
