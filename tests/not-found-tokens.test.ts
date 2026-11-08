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
 * the glow anchors had no other reader and were deleted. Feature 47 deleted
 * the last one, the v1 nav CTA height, with the v1 nav that read it.
 */
const globalCss = readFileSync(
  join(process.cwd(), 'app', 'assets', 'css', 'global.css'),
  'utf8'
).replaceAll(/\/\*[\s\S]*?\*\//g, '')

describe('not-found tokens', () => {
  it('should leave no v1 not-found token behind when the stylesheet loads', () => {
    expect(globalCss).not.toMatch(/--(?:spacing-)?not-found-[\w-]+:/)
  })
})
