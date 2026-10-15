import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Feature 34 · the shared float clock and its tokens (spec FR-001, FR-004;
 * data-model §§ 1, 2). Read from disk with `node:path` + `process.cwd()`
 * (rules.md § R27), comments stripped so a value quoted in a comment cannot
 * satisfy an assertion.
 */
const globalCss = readFileSync(
  join(process.cwd(), 'app', 'assets', 'css', 'global.css'),
  'utf8'
).replaceAll(/\/\*[\s\S]*?\*\//g, '')

/** The first declaration of `name` in the file (the `:root` one). */
function declared(name: string): string | undefined {
  return globalCss.match(new RegExp(`${name}:\\s*([^;]+);`))?.[1]?.trim()
}

describe('services float · the shared clock', () => {
  it('should register the phase as an inheriting angle when the stylesheet loads', () => {
    const rule = globalCss.match(
      /@property\s+--services-float-phase\s*\{([^}]*)\}/
    )?.[1]

    expect(rule).toBeDefined()
    expect(rule).toMatch(/syntax:\s*"<angle>"/)
    expect(rule).toMatch(/inherits:\s*true/)
    expect(rule).toMatch(/initial-value:\s*0deg/)
  })

  it('should advance the phase one full turn per cycle when animated', () => {
    const keyframes = globalCss.match(
      /@keyframes\s+services-float\s*\{([\s\S]*?\}\s*)\}/
    )?.[1]

    expect(keyframes).toBeDefined()
    expect(keyframes).toMatch(
      /from\s*\{\s*--services-float-phase:\s*0deg;?\s*\}/
    )
    expect(keyframes).toMatch(
      /to\s*\{\s*--services-float-phase:\s*360deg;?\s*\}/
    )
  })
})

describe('services float · the motion tokens (D-4, OA-2)', () => {
  it('should keep the amplitude inside the approved 6 to 8 px range when declared', () => {
    const amplitude = Number(declared('--services-float-amplitude'))

    expect(amplitude).toBeGreaterThanOrEqual(6)
    expect(amplitude).toBeLessThanOrEqual(8)
  })

  it('should keep the period inside the approved 5 to 7 s range when declared', () => {
    const period = declared('--duration-services-float')

    expect(period).toMatch(/^[\d.]+s$/)
    const seconds = Number.parseFloat(period ?? '')
    expect(seconds).toBeGreaterThanOrEqual(5)
    expect(seconds).toBeLessThanOrEqual(7)
  })

  it('should declare the per-node phase step as an angle when declared', () => {
    expect(declared('--services-float-phase-step')).toMatch(/^[\d.]+deg$/)
  })

  it('should express one design pixel in rem when declared', () => {
    expect(declared('--services-frame-px')).toBe('0.0625rem')
  })

  it('should drop the amplitude to zero when reduced motion is requested', () => {
    expect(globalCss).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{\s*:root\s*\{[^}]*--services-float-amplitude:\s*0\s*;/
    )
  })
})
