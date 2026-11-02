import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Feature 45, reopen 2 · FR-041 (Roberto 2026-11-02: "sube todos los pills
 * de las sections, un poquito"). Every v2 section pill above a heading
 * carries the one shared `pill-aire` utility (6 px below `lg`, 8 px from
 * it), and the v1 quarantine is untouched. Read from disk with comments
 * stripped (rules.md § R27).
 */
const read = (...path: string[]) =>
  readFileSync(join(process.cwd(), ...path), 'utf8')
    .replaceAll(/\/\*[\s\S]*?\*\//g, '')
    .replaceAll(/<!--[\s\S]*?-->/g, '')

const css = read('app', 'assets', 'css', 'global.css')

const SECTIONS = [
  ['HeroSection', /<RotatingPill class="pill-aire"/],
  ['WhoWeAreSection', /<Pill class="pill-aire"/],
  ['ServicesSection', /<Pill class="pill-aire"/],
  ['HowWeWorkSection', /<Pill class="pill-aire"/],
  ['AssessmentSection', /<Pill class="pill-aire"/],
] as const

describe('pill air (feature 45, reopen 2)', () => {
  it('should add 6 px below lg and 8 px from lg through one token', () => {
    expect(css).toMatch(/:root\s*\{[^}]*--pill-aire:\s*0\.375rem;/)
    expect(css).toMatch(
      /@media \(width >= 64rem\)\s*\{\s*:root\s*\{[^}]*--pill-aire:\s*0\.5rem;/
    )
    expect(css.match(/--pill-aire:/g)).toHaveLength(2)
    expect(css).toMatch(
      /@utility pill-aire\s*\{\s*margin-block-end:\s*var\(--pill-aire\);\s*\}/
    )
  })

  for (const [name, pattern] of SECTIONS) {
    it(`should give the ${name} pill the shared air`, () => {
      expect(read('app', 'features', 'landing', 'ui', `${name}.vue`)).toMatch(
        pattern
      )
    })
  }

  it('should leave the pill component itself and the v1 quarantine untouched', () => {
    expect(read('app', 'shared', 'ui', 'Pill.vue')).not.toContain('pill-aire')
    expect(
      read('app', 'features', 'about', 'ui', 'WorkWithMuushSection.vue')
    ).not.toContain('pill-aire')
  })
})
