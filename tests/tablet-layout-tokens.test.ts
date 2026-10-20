import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Feature 38 · the tokens and breakpoints that keep the tablet range
 * (1024–1439) inside the page while leaving 1440 unchanged. Read from disk
 * (rules.md § R27), comments stripped so a value quoted in a comment cannot
 * satisfy an assertion. The rendered widths are measured in Chrome and
 * recorded in docs/harness/progress/impl_tablet_layout_and_pill_fixes.md.
 */
function source(...segments: string[]): string {
  return readFileSync(join(process.cwd(), ...segments), 'utf8')
    .replaceAll(/\/\*[\s\S]*?\*\//g, '')
    .replaceAll(/\s+/g, ' ')
}

const globalCss = source('app', 'assets', 'css', 'global.css')

/** The first declaration of `name` in the file (the `:root` one). */
function declared(name: string): string {
  return globalCss.match(new RegExp(`${name}:\\s*([^;]+);`))?.[1]?.trim() ?? ''
}

const REM = 16
/** The design frame and its content box at the 80px page margin. */
const FRAME_W = 1440
const CONTENT_W_AT_FRAME = FRAME_W - 2 * 80

/** `minmax(0, Afr) minmax(0, Bfr)` → [A, B]. */
function trackRatios(tracks: string): number[] {
  return [...tracks.matchAll(/minmax\(0,\s*([\d.]+)fr\)/g)].map(match =>
    Number(match[1])
  )
}

describe('tablet layout · the two forms go side by side from 64rem', () => {
  const sections = [
    {
      name: 'Contacto',
      file: ['app', 'features', 'landing', 'ui', 'ContactSection.vue'],
      tracks: '--contact-cols',
      gap: '--contact-col-gap',
    },
    {
      name: 'Work with muush',
      file: ['app', 'features', 'about', 'ui', 'WorkWithMuushSection.vue'],
      tracks: '--work-cols',
      gap: '--work-col-gap',
    },
  ]

  for (const section of sections) {
    it(`should switch ${section.name} to two columns from 64rem when styled`, () => {
      /* Round 2 (Roberto, 2026-10-19): text and form side by side from 1024,
         stacked below it as on master — round 1's 80rem stack was rejected. */
      const style = source(...section.file)

      expect(style).toContain('@media (width >= 64rem)')
      expect(style).not.toContain('80rem')
      expect(style).toContain(`grid-template-columns: var(${section.tracks})`)
    })

    it(`should fill exactly the 1440 content box with ${section.name}'s tracks when declared`, () => {
      /* Proportional tracks reproduce the frame only if the two ratios plus
         the gap add up to the content box at 1440 — then 1440 is unchanged
         and every narrower width shrinks both columns together. */
      const ratios = trackRatios(declared(section.tracks))
      const gapPx = Number.parseFloat(declared(section.gap)) * REM

      expect(ratios).toHaveLength(2)
      expect(ratios[1]).toBe(660)
      expect((ratios[0] ?? 0) + (ratios[1] ?? 0) + gapPx).toBe(
        CONTENT_W_AT_FRAME
      )
    })
  }

  it('should leave no fixed column width behind when declared', () => {
    for (const name of [
      '--contact-left-w',
      '--contact-form-w',
      '--work-left-w',
      '--work-form-w',
    ]) {
      expect(globalCss, name).not.toContain(`${name}:`)
    }
  })
})
