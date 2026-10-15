import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Feature 34 · Part B, the site's own cursor, asserted on the deployed
 * artefact (`.output/public`, rebuilt by `tests/global-setup.ts`). Paths use
 * `node:path` + `process.cwd()` (rules.md §§ R16, R27).
 *
 * What a browser does with the image (rendering, sharpness, hotspot accuracy,
 * fallback when blocked) is the manual matrix in the feature's quickstart § 3;
 * this file proves the asset and the rules that reference it shipped.
 */
const OUTPUT = join(process.cwd(), '.output', 'public')
const CURSOR_FILE = join(OUTPUT, 'cursor', 'you.svg')

function everyEmittedFile(directory: string): string[] {
  return readdirSync(directory).flatMap(entry => {
    const path = join(directory, entry)
    return statSync(path).isDirectory() ? everyEmittedFile(path) : [path]
  })
}

/** Every emitted stylesheet, concatenated. */
function emittedCss(): string {
  return everyEmittedFile(join(OUTPUT, '_nuxt'))
    .filter(path => path.endsWith('.css'))
    .map(path => readFileSync(path, 'utf8'))
    .join('\n')
}

function cursorSvg(): string {
  return readFileSync(CURSOR_FILE, 'utf8')
}

/** `--red-400` as declared in the source stylesheet. */
function red400(): string {
  const globalCss = readFileSync(
    join(process.cwd(), 'app', 'assets', 'css', 'global.css'),
    'utf8'
  )
  const value = globalCss.match(/--red-400:\s*(#[0-9a-f]{6})\s*;/i)?.[1]
  if (!value) throw new Error('--red-400 not found in global.css')
  return value
}

/**
 * `url(<path to cursor/you.svg>) 1 9, <keyword>` in any quoting / minified
 * spacing. The source writes the root-relative `/cursor/you.svg`; Nuxt's
 * build rewrites public-file URLs in CSS relative to the stylesheet
 * (`../cursor/you.svg` from `_nuxt/`), so both forms are accepted and
 * `should resolve every cursor url to the shipped file` checks where it lands.
 */
function brandCursorValue(keyword: string): RegExp {
  return new RegExp(
    `url\\(\\s*["']?(?:\\.\\./|/)cursor/you\\.svg["']?\\s*\\)\\s*1\\s+9\\s*,\\s*${keyword}\\b`
  )
}

describe('brand cursor · the asset (FR-013, OA-7)', () => {
  it('should ship the cursor file when the site is generated', () => {
    expect(existsSync(CURSOR_FILE)).toBe(true)
  })

  it('should keep every XML comment free of a double hyphen so the image decodes', () => {
    /* `--` is illegal inside an XML comment. A CSS token name written in one
       (`--red-400`) made Chrome refuse to decode the file, which would have
       left every page on the system cursor with no error anywhere. */
    const comments = [...cursorSvg().matchAll(/<!--([\s\S]*?)-->/g)].map(
      match => match[1] ?? ''
    )

    for (const comment of comments) expect(comment).not.toContain('--')
  })

  it('should render at 64×64 over the untouched 32×32 viewBox when served', () => {
    /* Amendment A1 (2026-10-14): the only root change from the source is
       width/height 32 → 64 (round 4, from Roberto's reference screenshot), so
       the vector scales ×2 and the hotspot in the rules (`1 9`) is measured
       in that 64×64 space. 64 is under the 128 px
       cursor-image limit. */
    const root = cursorSvg().match(/<svg\b[^>]*>/)?.[0] ?? ''

    expect(root).toContain('width="64"')
    expect(root).toContain('height="64"')
    expect(root).toContain('viewBox="0 0 32 32"')
  })

  it('should have no full-size background rect when served', () => {
    /* The removed `<rect width="32" height="32" fill="white"/>` is the only
       rect without an `x`: its absence is what removes the white square. */
    const rects = cursorSvg().match(/<rect\b[^>]*>/g) ?? []

    expect(rects.every(rect => /\bx="/.test(rect))).toBe(true)
  })

  it('should keep the pill and the two paths when served', () => {
    const svg = cursorSvg()
    const rects = svg.match(/<rect\b[^>]*>/g) ?? []

    expect(rects).toHaveLength(1)
    expect(rects[0]).toContain('x="8.19095"')
    expect(svg.match(/<path\b/g)).toHaveLength(2)
  })

  it('should paint the arrow and pill in the --red-400 token value', () => {
    /* A cursor image cannot read CSS variables, so the literal stays in the
       file; this pins it to the token so a palette change fails loudly. */
    const fills = [...cursorSvg().matchAll(/(?:fill|stroke)="(#[0-9a-f]+)"/gi)]
      .map(match => match[1]?.toLowerCase())
      .filter(Boolean)

    expect(fills.length).toBeGreaterThan(0)
    expect(new Set(fills)).toEqual(new Set([red400().toLowerCase()]))
  })
})

describe('brand cursor · the rules (FR-014 to FR-019)', () => {
  it('should reference the same-origin image with the arrow fallback', () => {
    expect(emittedCss()).toMatch(brandCursorValue('auto'))
  })

  it('should reference the same image with the hand fallback for pointer state', () => {
    expect(emittedCss()).toMatch(brandCursorValue('pointer'))
  })

  it('should resolve every cursor url to the shipped file', () => {
    const stylesheets = everyEmittedFile(join(OUTPUT, '_nuxt')).filter(path =>
      path.endsWith('.css')
    )
    const resolved = stylesheets.flatMap(path =>
      [
        ...readFileSync(path, 'utf8').matchAll(
          /url\(\s*["']?([^"')]*cursor\/you\.svg)["']?\s*\)/g
        ),
      ].map(match => {
        const url = match[1] ?? ''
        return url.startsWith('/') ? join(OUTPUT, url) : join(path, '..', url)
      })
    )

    expect(resolved.length).toBeGreaterThan(0)
    for (const file of resolved) expect(file).toBe(CURSOR_FILE)
  })

  it('should give text areas the system text cursor', () => {
    expect(emittedCss()).toMatch(/textarea[^{}]*\{[^}]*cursor:\s*text/)
  })

  it('should apply the brand cursor only when forced colours are off', () => {
    expect(emittedCss()).toMatch(
      /@media\s*\(\s*forced-colors:\s*none\s*\)\s*\{[\s\S]*?cursor:\s*var\(--cursor-brand\)/
    )
  })

  it('should reference no cursor image on another host', () => {
    const css = emittedCss()
    const cursorValues = [
      ...css.matchAll(/(?:cursor|--cursor-[\w-]+):([^;}]*)/g),
    ].map(match => match[1] ?? '')

    expect(cursorValues.length).toBeGreaterThan(0)
    for (const value of cursorValues) {
      expect(value, value).not.toMatch(/url\(\s*["']?(?:[a-z]+:)?\/\//i)
    }
  })
})
