import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Feature 34 · D-3, the mobile and tablet float TRIAL. Every assertion about
 * it lives in this file and nowhere else, so reverting the trial is: delete
 * the fenced block at the end of `ServicesTimeline.vue`'s `<style scoped>`
 * and delete this file (spec FR-012). Seen red first (`findings.md` § R39).
 */
const OPENING_FENCE = 'Feature 34 · D-3 mobile float trial'
const CLOSING_FENCE = 'end D-3'

/** The `<style scoped>` block, comments kept: the fence is made of them. */
function timelineStyle(): string {
  const source = readFileSync(
    join(
      process.cwd(),
      'app',
      'features',
      'landing',
      'ui',
      'ServicesTimeline.vue'
    ),
    'utf8'
  )
  return source.slice(source.lastIndexOf('<style scoped>'))
}

/** Comments stripped, whitespace collapsed (formatter-proof). */
function declarations(css: string): string {
  return css
    .replaceAll(/\/\*[\s\S]*?\*\//g, '')
    .replaceAll(/\s+/g, ' ')
    .replaceAll('( ', '(')
    .replaceAll(' )', ')')
}

function fencedBlock(): { inside: string; outside: string } {
  const style = timelineStyle()
  const start = style.indexOf(OPENING_FENCE)
  const end = style.indexOf(CLOSING_FENCE)
  if (start < 0 || end < start) return { inside: '', outside: style }
  return {
    inside: style.slice(start, end),
    outside: style.slice(0, start) + style.slice(end),
  }
}

describe('ServicesTimeline · D-3 float trial (feature 34)', () => {
  it('should keep the trial inside one fenced block', () => {
    const style = timelineStyle()

    expect(style).toContain(OPENING_FENCE)
    expect(style).toContain(CLOSING_FENCE)
    expect(style.indexOf(OPENING_FENCE)).toBeLessThan(
      style.indexOf(CLOSING_FENCE)
    )
  })

  it('should run the shared clock on the timeline canvas', () => {
    expect(declarations(fencedBlock().inside)).toMatch(
      /\.canvas \{[^}]*animation: services-float var\(--duration-services-float\) linear infinite/
    )
  })

  it('should offset each row by the same sine as the desktop nodes', () => {
    const inside = declarations(fencedBlock().inside)

    expect(inside).toContain(
      'sin(var(--services-float-phase) + var(--i) * var(--services-float-phase-step))'
    )
    expect(inside).toMatch(
      /\.item \{[^}]*translate:[^;]*var\(--services-frame-px\)/
    )
  })

  it('should stop the clock when reduced motion is requested', () => {
    expect(declarations(fencedBlock().inside)).toMatch(
      /@media \(prefers-reduced-motion: reduce\) \{ \.canvas \{ animation: none;? \}/
    )
  })

  it('should mention the float nowhere outside the fence', () => {
    expect(declarations(fencedBlock().outside)).not.toContain(
      '--services-float'
    )
  })

  it('should leave the spine static', () => {
    /* Rows move parallel to the spine, so nothing can detach (research R4). */
    const spine =
      declarations(timelineStyle()).match(/\.spine \{([^}]*)\}/)?.[1] ?? ''

    expect(spine).not.toBe('')
    expect(spine).not.toMatch(/transform|translate|animation/)
  })
})
