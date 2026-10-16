import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Feature 36 · the not-found page's tokens
 * (specs/036-not-found-page/research.md R6 and R6b). Read from disk with
 * `node:path` + `process.cwd()` (rules.md § R27), comments stripped so a
 * value quoted in a comment cannot satisfy an assertion.
 */
const globalCss = readFileSync(
  join(process.cwd(), 'app', 'assets', 'css', 'global.css'),
  'utf8'
).replaceAll(/\/\*[\s\S]*?\*\//g, '')

/** The `:root { … }` block that holds the ramps (the first one in the file). */
const rootBlock = globalCss.match(/:root\s*\{([\s\S]*?)\n\}/)?.[1] ?? ''
/** The `@theme inline { … }` block. */
const themeBlock =
  globalCss.match(/@theme inline\s*\{([\s\S]*?)\n\}/)?.[1] ?? ''

/** A declaration's value with its whitespace collapsed (Biome wraps long ones). */
function declaredIn(block: string, name: string): string | undefined {
  return block
    .match(new RegExp(`${name}:\\s*([^;]+);`))?.[1]
    ?.replace(/\s+/g, ' ')
    .replace(/\( /g, '(')
    .replace(/ \)/g, ')')
    .trim()
}

const RING_TOKENS: Record<string, string> = {
  '--not-found-rings': 'clamp(26.25rem, 19.75rem + 26.6667vw, 43.75rem)',
  '--not-found-ring-mid-inset': '14.2857%',
  '--not-found-ring-inner-inset': '28.5714%',
  '--not-found-ring-w': '0.0625rem',
  '--not-found-ring-outer-color':
    'color-mix(in srgb, var(--bone-100) 8%, transparent)',
  '--not-found-ring-mid-color':
    'color-mix(in srgb, var(--bone-100) 12%, transparent)',
  '--not-found-ring-inner-color':
    'color-mix(in srgb, var(--red-400) 24%, transparent)',
}

const SPACING_TOKENS: Record<string, string> = {
  '--spacing-not-found-top': 'clamp(4.5rem, 3.9429rem + 2.2857vw, 6rem)',
  '--spacing-not-found-bottom': 'clamp(2.5rem, 4.5571rem - 2.2857vw, 4rem)',
  '--spacing-not-found-min-h': 'clamp(35.5rem, 35.1286rem + 1.5238vw, 36.5rem)',
  '--spacing-not-found-content': '45rem',
  '--spacing-not-found-measure': '30rem',
  '--spacing-not-found-pill-gap': '1.75rem',
  '--spacing-not-found-title-gap': '1.25rem',
  '--spacing-not-found-body-gap': '2.25rem',
  '--spacing-not-found-cta-gap': '1.75rem',
  '--spacing-not-found-shortcut-gap-x': '0.875rem',
  '--spacing-not-found-shortcut-gap-y': '0.625rem',
  '--spacing-not-found-shortcut-x': '0.125rem',
  '--spacing-not-found-shortcut-y': '0.375rem',
  /* Nav CTA height, derived from the tokens that already set it (72px pill). */
  '--spacing-nav-cta-h':
    'calc(var(--spacing-btn-nav-y) * 2 + var(--text-button-sm) * var(--text-button-sm--line-height))',
  '--spacing-not-found-glow-x': 'clamp(12.875rem, -10.2rem + 94.6667vw, 75rem)',
  /* Corrected from the built-page measurement (implementation report),
     not research R6b's 144/164 derivation. */
  '--spacing-not-found-glow-y':
    'clamp(10.125rem, 9.9857rem + 0.5714vw, 10.5rem)',
}

describe('not-found tokens', () => {
  it.each(Object.entries(RING_TOKENS))(
    'should declare %s in :root with its research value when the stylesheet loads',
    (name, value) => {
      expect(declaredIn(rootBlock, name)).toBe(value)
    }
  )

  it.each(Object.keys(RING_TOKENS))(
    'should keep %s out of @theme inline when the stylesheet loads',
    name => {
      expect(declaredIn(themeBlock, name)).toBeUndefined()
    }
  )

  it.each(Object.entries(SPACING_TOKENS))(
    'should declare %s in @theme inline with its research value when the stylesheet loads',
    (name, value) => {
      expect(declaredIn(themeBlock, name)).toBe(value)
    }
  )

  it('should add no token to the closed glow namespace when the stylesheet loads', () => {
    const names = [...Object.keys(RING_TOKENS), ...Object.keys(SPACING_TOKENS)]

    for (const name of names)
      expect(name).not.toMatch(/--(?:color|spacing)-glow-/)
  })
})
