import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Feature 029 · configuration and credential hygiene, asserted on the files
 * themselves (spec FR-001/FR-003/FR-025, Constitution Articles V and XI).
 *
 * Files are read from disk with `node:fs` + `process.cwd()`, never through
 * `new URL(…, import.meta.url)`: the global environment is happy-dom, whose
 * `URL` `node:fs` rejects (docs/business/rules.md § R27).
 *
 * The forbidden literals are assembled from fragments so this file does not
 * itself become the thing it forbids if it is ever moved under `app/`.
 */
const ROOT = process.cwd()
const APP = join(ROOT, 'app')

function filesUnder(directory: string): string[] {
  return readdirSync(directory).flatMap(entry => {
    const path = join(directory, entry)
    return statSync(path).isDirectory() ? filesUnder(path) : [path]
  })
}

function sourcesUnder(directory: string): { path: string; source: string }[] {
  return filesUnder(directory)
    .filter(path => /\.(ts|vue|js|json)$/.test(path))
    .map(path => ({
      path: relative(ROOT, path),
      source: readFileSync(path, 'utf8'),
    }))
}

const APP_SOURCES = sourcesUnder(APP)

describe('forms config · nothing environment-specific lives in app/', () => {
  const forbidden = [
    ['execute', 'api'].join('-'),
    ['api', 'muush', 'dev'].join('.'),
    `1x${'0'.repeat(20)}BB`,
    `1x${'0'.repeat(20)}AA`,
  ]

  it('should find no API host or test sitekey literal in any file under app/', () => {
    expect(APP_SOURCES.length).toBeGreaterThan(0)
    for (const { path, source } of APP_SOURCES) {
      for (const literal of forbidden) {
        expect(source.includes(literal), `${path} contains ${literal}`).toBe(
          false
        )
      }
    }
  })

  it('should find no real-sitekey-shaped literal in any file under app/', () => {
    /* Cloudflare sitekeys are `0x` followed by a long base62 run. */
    for (const { path, source } of APP_SOURCES) {
      expect(source, path).not.toMatch(/\b0x[0-9A-Za-z_-]{20,}/)
    }
  })

  it('should never read process.env from application code', () => {
    for (const { path, source } of APP_SOURCES) {
      expect(source.includes('process.env'), path).toBe(false)
    }
  })
})

describe('forms config · .env.example', () => {
  const example = readFileSync(join(ROOT, '.env.example'), 'utf8')

  it('should declare both public form variables with placeholder values', () => {
    expect(example).toMatch(/^NUXT_PUBLIC_FORMS_API_BASE_URL=\S+$/m)
    expect(example).toMatch(/^NUXT_PUBLIC_TURNSTILE_SITE_KEY=\S+$/m)
  })

  it('should not carry the deployed API host or a real sitekey shape', () => {
    expect(example.includes(['execute', 'api'].join('-'))).toBe(false)
    expect(example).not.toMatch(/\b0x[0-9A-Za-z_-]{20,}/)
  })
})

describe('forms config · ui/ never touches the network (FR-025)', () => {
  it('should find no fetch or XMLHttpRequest in app/features/forms/ui/', () => {
    const uiSources = sourcesUnder(join(APP, 'features', 'forms', 'ui')).filter(
      ({ path }) => !/\.(test|stories)\.ts$/.test(path)
    )

    expect(uiSources.length).toBeGreaterThan(0)
    for (const { path, source } of uiSources) {
      expect(source, path).not.toMatch(/\bfetch\s*\(/)
      expect(source, path).not.toMatch(/new\s+XMLHttpRequest/)
      expect(source, path).not.toMatch(/\$fetch|useFetch|useRuntimeConfig/)
    }
  })
})

describe('forms config · one network call site in all of app/ (Article V, FR-011/FR-025)', () => {
  /*
   * Feature 029 made the forms submit, so "no fetch anywhere" no longer
   * holds. What replaces it is narrower and stricter. Across every
   * application source (tests and stories excluded), `fetch(` appears in
   * exactly one file, the API client. No `ui/` folder in any feature or in
   * `shared/` reaches for a Nuxt or browser network primitive. A stray call
   * in another `logic/` file, in a section that hosts a form, or in any
   * other `ui/` fails here.
   */
  const CLIENT = join('app', 'features', 'forms', 'logic', 'formsApiClient.ts')
  const appSources = APP_SOURCES.filter(
    ({ path }) => !/\.(test|stories)\.ts$/.test(path)
  )

  it('should find fetch( only in forms/logic/formsApiClient.ts', () => {
    const callers = appSources
      .filter(({ source }) => /\bfetch\s*\(/.test(source))
      .map(({ path }) => path)

    expect(callers).toEqual([CLIENT])
  })

  it('should find no $fetch, useFetch or XMLHttpRequest under any ui/ folder', () => {
    const uiSources = appSources.filter(({ path }) =>
      path.split(/[\\/]/).includes('ui')
    )

    expect(uiSources.length).toBeGreaterThan(0)
    for (const { path, source } of uiSources) {
      expect(source, path).not.toMatch(/\$fetch|useFetch|XMLHttpRequest/)
    }
  })
})

describe('forms config · previewState stays Storybook-only', () => {
  it('should find no page or section that passes previewState', () => {
    const consumers = [
      ...sourcesUnder(join(APP, 'pages')),
      ...sourcesUnder(join(APP, 'features', 'landing')),
      ...sourcesUnder(join(APP, 'features', 'about')),
    ]

    expect(consumers.length).toBeGreaterThan(0)
    for (const { path, source } of consumers) {
      expect(source, path).not.toMatch(/previewState|preview-state/)
    }
  })
})
