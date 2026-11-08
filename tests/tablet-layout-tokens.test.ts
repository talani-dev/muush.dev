import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Feature 38 · the tokens and breakpoints that keep the tablet range
 * (1024–1439) inside the page while leaving 1440 unchanged. Read from disk
 * (rules.md § R27), comments stripped so a value quoted in a comment cannot
 * satisfy an assertion. The rendered widths are measured in Chrome and
 * recorded in docs/harness/progress/impl_tablet_layout_and_pill_fixes.md.
 * The v1 Services constellation and Propósito checks left with that code in
 * feature 47.
 */
function source(...segments: string[]): string {
  return readFileSync(join(process.cwd(), ...segments), 'utf8')
    .replaceAll(/\/\*[\s\S]*?\*\//g, '')
    .replaceAll(/\s+/g, ' ')
}

const globalCss = source('app', 'assets', 'css', 'global.css')

/*
 * Feature 45 retired the v1 Contacto section and its `--contact-*` tracks,
 * feature 46 the v1 Work with muush section and its `--work-*` tracks: both
 * v2 split sections lay out with the `diagnostico` grid tokens
 * (tests/design-tokens.test.ts), side by side from `lg` (64rem), the
 * feature 38 rule.
 */
describe('tablet layout · the form sections go side by side from 64rem', () => {
  for (const file of [
    ['app', 'features', 'landing', 'ui', 'AssessmentSection.vue'],
    ['app', 'features', 'about', 'ui', 'WorkWithMuushSection.vue'],
  ]) {
    it(`should switch ${file.at(-1)} to the diagnostico columns from lg when styled`, () => {
      const markup = source(...file)

      expect(markup).toContain('lg:grid-cols-diagnostico')
      expect(markup).not.toContain('grid-template-areas')
    })
  }

  it('should leave no fixed column width behind when declared', () => {
    for (const name of [
      '--contact-cols',
      '--contact-col-gap',
      '--contact-left-w',
      '--contact-form-w',
      '--work-cols',
      '--work-col-gap',
      '--work-stack-gap',
      '--work-form-y-offset',
      '--work-left-w',
      '--work-form-w',
    ]) {
      expect(globalCss, name).not.toContain(`${name}:`)
    }
  })
})
