import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Feature 34, amendment A2 · red lit dots, no glow (spec FR-022…FR-024,
 * SC-012; data-model § 6). Read from disk with `node:path` + `process.cwd()`
 * (rules.md § R27), comments stripped so a value quoted in a comment cannot
 * satisfy an assertion — or fail one.
 */
const globalCss = readFileSync(
  join(process.cwd(), 'app', 'assets', 'css', 'global.css'),
  'utf8'
).replaceAll(/\/\*[\s\S]*?\*\//g, '')

/** px per rem at the browser's default root font size. */
const DEFAULT_ROOT_PX = 16

/** The first declaration of `name` in the file (the `:root` one). */
function declared(name: string): string | undefined {
  return globalCss.match(new RegExp(`${name}:\\s*([^;]+);`))?.[1]?.trim()
}

describe('spotlight · red lit dots (amendment A2)', () => {
  it('should paint lit dots in the existing red-400 when the stylesheet loads', () => {
    expect(declared('--dot-paper-lit-color')).toBe('var(--red-400)')
  })

  it('should declare exactly the five brand reds when the stylesheet loads', () => {
    /* A2-2: no new red hue and no new colour token. Anchored so the
       `--color-red-*` theme aliases are not counted. */
    const reds = [...globalCss.matchAll(/^\s*(--red-\d+):/gm)].map(
      match => match[1]
    )

    expect(reds).toEqual([
      '--red-100',
      '--red-200',
      '--red-300',
      '--red-400',
      '--red-500',
    ])
  })

  it('should hold the red-400 hex in red-400 only when the stylesheet loads', () => {
    const holders = [...globalCss.matchAll(/(--[\w-]+):\s*#cf3147\s*;/gi)].map(
      match => match[1]
    )

    expect(holders).toEqual(['--red-400'])
  })

  it('should size the effect from a rem radius of about 120px when the stylesheet loads', () => {
    const radius = declared('--spotlight-lit-radius')

    expect(radius).toMatch(/^\d+(\.\d+)?rem$/)
    const px = Number.parseFloat(radius ?? '') * DEFAULT_ROOT_PX
    expect(px).toBeGreaterThanOrEqual(112)
    expect(px).toBeLessThanOrEqual(128)
    expect(px).toBe(120)
  })

  it('should declare none of the glow tokens when the stylesheet loads', () => {
    /* A2-1 removes the light; its tokens go with it (FR-022, SC-012). */
    for (const pattern of [
      /--spotlight-red-400-[\w-]*\s*:/,
      /--spotlight-stop-mid\s*:/,
      /--spotlight-core-size\s*:/,
      /--spotlight-outer-size\s*:/,
    ]) {
      expect(globalCss, String(pattern)).not.toMatch(pattern)
    }
  })
})
