import { afterEach, describe, expect, it } from 'vitest'
import {
  type AnchorBox,
  captureScrollSnapshot,
  holdLocaleSwitchPosition,
  isHeldFor,
  readScrollGeometry,
  resolveScrollTop,
  type ScrollGeometry,
  takeHeldLocaleSwitchPosition,
} from './localeSwitchScroll'

/**
 * Feature 43 · FR-061 (Language switch keeps position, Roberto 2026-11-01).
 * Geometry is given as plain numbers: an anchored section's `top` is its
 * distance from the viewport's top edge, as `getBoundingClientRect` reports.
 */
const READING_LINE = 76

function page(
  scrollTop: number,
  scrollRange: number,
  anchors: AnchorBox[]
): ScrollGeometry {
  return { scrollTop, scrollRange, readingLine: READING_LINE, anchors }
}

/** Builds boxes from document offsets, as seen at `scrollTop`. */
function boxesAt(
  scrollTop: number,
  sections: [id: string, offset: number, height: number][]
): AnchorBox[] {
  return sections.map(([id, offset, height]) => ({
    id,
    top: offset - scrollTop,
    height,
  }))
}

describe('captureScrollSnapshot', () => {
  const SPANISH: [string, number, number][] = [
    ['proposito', 900, 800],
    ['servicios', 1700, 1200],
    ['diagnostico', 2900, 1000],
  ]

  it('should anchor to the section the reading line is in, with its progress', () => {
    /* Reading line at document 2900 + 250 = 3150: a quarter into the form. */
    const scrollTop = 3150 - READING_LINE
    const snapshot = captureScrollSnapshot(
      page(scrollTop, 4500, boxesAt(scrollTop, SPANISH))
    )

    expect(snapshot.anchor).toEqual({ id: 'diagnostico', progress: 0.25 })
  })

  it('should be at progress 0 when a section was reached through its link', () => {
    /* An in-page jump leaves the section's top on the reading line. */
    const scrollTop = 1700 - READING_LINE
    const snapshot = captureScrollSnapshot(
      page(scrollTop, 4500, boxesAt(scrollTop, SPANISH))
    )

    expect(snapshot.anchor).toEqual({ id: 'servicios', progress: 0 })
  })

  it('should prefer the innermost section when anchored sections nest', () => {
    const snapshot = captureScrollSnapshot(
      page(1000, 4500, [
        { id: 'outer', top: -500, height: 2000 },
        { id: 'inner', top: 0, height: 400 },
      ])
    )

    expect(snapshot.anchor?.id).toBe('inner')
  })

  it('should carry only the page ratio when no anchored section is at the line', () => {
    /* The hero: above every anchored section. */
    const snapshot = captureScrollSnapshot(
      page(300, 4500, boxesAt(300, SPANISH))
    )

    expect(snapshot.anchor).toBeUndefined()
    expect(snapshot.ratio).toBeCloseTo(300 / 4500)
  })

  it('should always carry the page ratio, anchored or not', () => {
    const scrollTop = 1700 - READING_LINE
    const snapshot = captureScrollSnapshot(
      page(scrollTop, 4500, boxesAt(scrollTop, SPANISH))
    )

    expect(snapshot.ratio).toBeCloseTo(scrollTop / 4500)
  })

  it('should report ratio 0 when the page does not scroll', () => {
    expect(captureScrollSnapshot(page(0, 0, [])).ratio).toBe(0)
  })

  it('should ignore a section with no height', () => {
    const snapshot = captureScrollSnapshot(
      page(0, 100, [{ id: 'empty', top: READING_LINE, height: 0 }])
    )

    expect(snapshot.anchor).toBeUndefined()
  })
})

describe('resolveScrollTop', () => {
  /* The English copy is shorter: every section moves up and shrinks. */
  const ENGLISH: [string, number, number][] = [
    ['proposito', 850, 700],
    ['servicios', 1550, 1000],
    ['diagnostico', 2550, 1200],
  ]

  it('should land at the same progress through the same section, not the same pixels', () => {
    /* Measured on the new page before restoring, i.e. still at 0. */
    const top = resolveScrollTop(
      { anchor: { id: 'diagnostico', progress: 0.25 }, ratio: 0.5 },
      page(0, 4000, boxesAt(0, ENGLISH))
    )

    expect(top).toBe(2550 + 0.25 * 1200 - READING_LINE)
  })

  it('should be independent of where the new page happens to be scrolled when measured', () => {
    const snapshot = {
      anchor: { id: 'servicios', progress: 0.5 },
      ratio: 0.1,
    }

    expect(resolveScrollTop(snapshot, page(0, 4000, boxesAt(0, ENGLISH)))).toBe(
      resolveScrollTop(snapshot, page(1234, 4000, boxesAt(1234, ENGLISH)))
    )
  })

  it('should put a section reached through its link back on the reading line', () => {
    const top = resolveScrollTop(
      { anchor: { id: 'servicios', progress: 0 }, ratio: 0 },
      page(0, 4000, boxesAt(0, ENGLISH))
    )

    expect(top).toBe(1550 - READING_LINE)
  })

  it('should fall back to the page ratio when the section is missing', () => {
    const top = resolveScrollTop(
      { anchor: { id: 'como-trabajamos', progress: 0.5 }, ratio: 0.25 },
      page(0, 4000, boxesAt(0, ENGLISH))
    )

    expect(top).toBe(1000)
  })

  it('should restore the page ratio when nothing was anchored', () => {
    expect(resolveScrollTop({ ratio: 0.1 }, page(0, 4000, []))).toBe(400)
  })

  it('should never scroll past the bottom of a shorter page', () => {
    const top = resolveScrollTop(
      { anchor: { id: 'diagnostico', progress: 1 }, ratio: 1 },
      page(0, 2600, boxesAt(0, ENGLISH))
    )

    expect(top).toBe(2600)
  })

  it('should never return a negative position', () => {
    const top = resolveScrollTop(
      { anchor: { id: 'proposito', progress: 0 }, ratio: 0 },
      page(0, 4000, [{ id: 'proposito', top: 10, height: 500 }])
    )

    expect(top).toBe(0)
  })

  it('should round trip ES to EN and back to the same place', () => {
    const SPANISH: [string, number, number][] = [
      ['proposito', 900, 800],
      ['servicios', 1700, 1200],
      ['diagnostico', 2900, 1000],
    ]
    const start = 3150 - READING_LINE
    const inSpanish = captureScrollSnapshot(
      page(start, 4500, boxesAt(start, SPANISH))
    )
    const inEnglish = resolveScrollTop(
      inSpanish,
      page(0, 4000, boxesAt(0, ENGLISH))
    )
    const back = resolveScrollTop(
      captureScrollSnapshot(page(inEnglish, 4000, boxesAt(inEnglish, ENGLISH))),
      page(0, 4500, boxesAt(0, SPANISH))
    )

    expect(back).toBe(start)
  })
})

describe('the held position', () => {
  afterEach(() => {
    takeHeldLocaleSwitchPosition()
    document.body.innerHTML = ''
  })

  it('should be handed over once and then forgotten', () => {
    holdLocaleSwitchPosition('/en/about')

    expect(takeHeldLocaleSwitchPosition()?.destination).toBe('/en/about')
    expect(takeHeldLocaleSwitchPosition()).toBeNull()
  })

  it('should belong only to a navigation to its destination path', () => {
    holdLocaleSwitchPosition('/en/about')
    const held = takeHeldLocaleSwitchPosition()
    if (!held) throw new Error('nothing held')

    expect(isHeldFor(held, '/en/about')).toBe(true)
    expect(isHeldFor(held, '/en/about/')).toBe(true)
    expect(isHeldFor(held, '/en')).toBe(false)
    expect(isHeldFor(held, '/es/nosotros')).toBe(false)
  })

  it('should match a destination that carries a query or fragment by path', () => {
    holdLocaleSwitchPosition('/en?x=1#top')
    const held = takeHeldLocaleSwitchPosition()
    if (!held) throw new Error('nothing held')

    expect(isHeldFor(held, '/en')).toBe(true)
  })
})

describe('readScrollGeometry', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('should measure only id-carrying sections inside main', () => {
    document.body.innerHTML = `
      <main>
        <section id="servicios"><input id="name"></section>
        <section></section>
      </main>
      <section id="outside"></section>`

    const ids = readScrollGeometry().anchors.map(anchor => anchor.id)

    expect(ids).toEqual(['servicios'])
  })
})
