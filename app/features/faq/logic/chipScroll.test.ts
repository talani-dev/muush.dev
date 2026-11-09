import { describe, expect, it } from 'vitest'
import { chipScrollLeft } from './chipScroll'

/** Feature 51 · spec FR-014: the selected chip comes into view. */
const ROW = { left: 0, right: 390 }

describe('chipScrollLeft', () => {
  it('should keep the row still when the chip is already in view', () => {
    expect(
      chipScrollLeft({
        scrollLeft: 0,
        row: ROW,
        chip: { left: 24, right: 262 },
        startInset: 24,
      })
    ).toBe(0)
  })

  it('should scroll forward by the hidden part when the chip runs past the end', () => {
    expect(
      chipScrollLeft({
        scrollLeft: 0,
        row: ROW,
        chip: { left: 270, right: 430 },
        startInset: 24,
      })
    ).toBe(40)
  })

  it('should scroll back to the gutter when the chip starts before it', () => {
    expect(
      chipScrollLeft({
        scrollLeft: 300,
        row: ROW,
        chip: { left: -100, right: 120 },
        startInset: 24,
      })
    ).toBe(176)
  })
})
