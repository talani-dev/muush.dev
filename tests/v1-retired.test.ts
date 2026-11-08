import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Feature 47 · the v1 design is deleted, not quarantined. Feature 42 put it
 * in quarantine (`legacy/` folders, `legacy-*` tokens, the Storybook group
 * `Legacy v1/`, Constitution VII); this file keeps it from coming back.
 * Read from disk with `node:path` + `process.cwd()` (rules.md § R27).
 * Token checks run on comment-stripped CSS, so a history note that names a
 * deleted token cannot fail them.
 */
const ROOT = process.cwd()
const APP = join(ROOT, 'app')
const STORYBOOK = join(ROOT, '.storybook')

function walk(directory: string): string[] {
  return readdirSync(directory).flatMap(entry => {
    const path = join(directory, entry)
    return statSync(path).isDirectory() ? [path, ...walk(path)] : [path]
  })
}

const SOURCE_FILE = /\.(ts|vue|css|html)$/
const sources = [...walk(APP), ...walk(STORYBOOK)]
  .filter(path => SOURCE_FILE.test(path))
  .map(path => ({
    path: relative(ROOT, path),
    source: readFileSync(path, 'utf8'),
  }))

const globalCss = readFileSync(
  join(APP, 'assets', 'css', 'global.css'),
  'utf8'
).replaceAll(/\/\*[\s\S]*?\*\//g, '')

describe('v1 retired · folders and stories', () => {
  it('should find no legacy folder when app/ is walked', () => {
    const folders = walk(APP)
      .filter(path => statSync(path).isDirectory())
      .filter(path => path.endsWith('/legacy'))

    expect(folders.map(path => relative(ROOT, path))).toEqual([])
    expect(existsSync(join(APP, 'shared', 'ui', 'legacy'))).toBe(false)
  })

  it('should title no story Legacy v1/ when the catalogue is built', () => {
    const titled = sources.filter(({ source }) => source.includes('Legacy v1'))

    expect(titled.map(({ path }) => path)).toEqual([])
  })
})

describe('v1 retired · tokens', () => {
  it('should name no v1 palette or legacy token when app/ and .storybook/ are read', () => {
    const V1_NAME = /--(?:bone|ink|wine)-\d|--red-\d|\blegacy-[\w-]+/

    const holders = sources.filter(({ source }) => V1_NAME.test(source))

    expect(holders.map(({ path }) => path)).toEqual([])
  })

  it('should declare no dotted paper, spotlight, glow or radar token when the stylesheet loads', () => {
    for (const pattern of [
      /--dot-paper-[\w-]+\s*:/,
      /--spotlight-[\w-]+\s*:/,
      /--layer-(?:glow|dots|spotlight)\s*:/,
      /--(?:color|spacing)-glow-[\w-]+\s*:/,
      /--[\w-]*radar[\w-]*\s*:/,
      /@keyframes\s+(?:radar-ping|led-spin|services-float)\b/,
      /@custom-variant\s+constellation\b/,
    ]) {
      expect(globalCss, String(pattern)).not.toMatch(pattern)
    }
  })

  it('should keep the You cursor when the v1 tokens are gone', () => {
    /* Roberto, 2026-11-01: the custom cursor stays; only the spotlight left. */
    expect(globalCss).toMatch(/--cursor-brand:\s*url\("\/cursor\/you\.svg"\)/)
  })
})

describe('v1 retired · inherited from review-43', () => {
  it('should not ship the v1 nav CTA reveal when shared/logic is read', () => {
    expect(existsSync(join(APP, 'shared', 'logic', 'useNavCtaReveal.ts'))).toBe(
      false
    )
  })

  it('should type social networks in shared/data when the shell data layer imports them', () => {
    const shellTypes = readFileSync(
      join(APP, 'features', 'shell', 'data', 'types.ts'),
      'utf8'
    )

    expect(shellTypes).toContain("from '@/shared/data/socialNetworks'")
    expect(shellTypes).not.toMatch(/from '@\/shared\/ui\//)
  })
})
