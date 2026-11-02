import { describe, expect, it } from 'vitest'
import { activeCardIndex } from './carouselIndicator'

/**
 * Feature 44 · FR-016, SC-005, research R7. The 390 layout: a 390-wide
 * scroller, 24 padding each side, four 290 cards with gap 14, so card i
 * starts at 24 + 304 i and the scroll width is 24 + 4 × 290 + 3 × 14 + 24.
 */
const CARD = 290
const GAP = 14
const PAD = 24
const WIDTH = 390
const SCROLL_WIDTH = PAD + 4 * CARD + 3 * GAP + PAD
const EDGES = [0, 1, 2, 3].map(i => PAD + i * (CARD + GAP) + CARD)

function at(scrollLeft: number) {
  return activeCardIndex({
    scrollLeft,
    clientWidth: WIDTH,
    scrollWidth: SCROLL_WIDTH,
    cardRightEdges: EDGES,
  })
}

describe('activeCardIndex', () => {
  it('should mark the first card when the carousel is at the start', () => {
    expect(at(0)).toBe(0)
  })

  it('should mark each card when the carousel rests on its snap point', () => {
    for (const i of [1, 2]) {
      expect(at(i * (CARD + GAP)), `card ${i}`).toBe(i)
    }
  })

  it('should switch once a card passes the active line when swiped half way', () => {
    /* Line at scrollLeft + 136.5: card 0 ends at 314. */
    expect(at(177)).toBe(0)
    expect(at(178)).toBe(1)
  })

  it('should mark the last card when the scroll reaches the end', () => {
    const end = SCROLL_WIDTH - WIDTH

    expect(at(end)).toBe(3)
    expect(at(end - 4)).toBe(3)
  })

  it('should fall back to the first card when there is no card', () => {
    expect(
      activeCardIndex({
        scrollLeft: 0,
        clientWidth: WIDTH,
        scrollWidth: WIDTH,
        cardRightEdges: [],
      })
    ).toBe(0)
  })
})
