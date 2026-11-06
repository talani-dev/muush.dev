import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Feature 36 · the not-found page's tokens
 * (specs/036-not-found-page/research.md R6 and R6b). Read from disk with
 * `node:path` + `process.cwd()` (rules.md § R27), comments stripped so a
 * value quoted in a comment cannot satisfy an assertion.
 *
 * Feature 46 (spec FR-044, research R9) replaced the v1 404 body with the
 * Muush 1.0 `StatusSection` (its tokens are pinned in
 * `tests/design-tokens.test.ts`). The v1 rings, the section spacings and
 * the glow anchors had no other reader and were deleted; what is left here
 * is the one token of this family another v1 file still reads.
 */
const globalCss = readFileSync(
  join(process.cwd(), 'app', 'assets', 'css', 'global.css'),
  'utf8'
).replaceAll(/\/\*[\s\S]*?\*\//g, '')

/** The `@theme inline { … }` block (the first one, the v1 theme). */
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

describe('not-found tokens', () => {
  it('should leave no v1 not-found token behind when the stylesheet loads', () => {
    expect(globalCss).not.toMatch(/--(?:spacing-)?not-found-[\w-]+:/)
  })

  it('should keep the nav CTA height the quarantined v1 nav still reads when the stylesheet loads', () => {
    /* `legacy/SiteNav.vue` holds its end group at this height on the 404;
       feature 47 deletes both. */
    expect(declaredIn(themeBlock, '--spacing-nav-cta-h')).toBe(
      'calc(var(--spacing-btn-nav-y) * 2 + var(--text-button-sm) * var(--text-button-sm--line-height))'
    )
  })
})
