/**
 * Which service card the carousel indicator marks (feature 44, spec FR-016;
 * research R7). The handoff's `iniciarCarrusel` rule, as a pure function:
 * the active card is the first whose right edge passes a line 35 % into
 * the visible width, and the last card once the scroll is within 4 px of
 * its end (where the last card cannot reach the start position).
 */

/** Where the "active line" sits, as a share of the visible width. */
export const ACTIVE_LINE_RATIO = 0.35
/** How close to the end of the scroll counts as the end, in px. */
export const END_TOLERANCE_PX = 4

export interface CarouselGeometry {
  scrollLeft: number
  clientWidth: number
  scrollWidth: number
  /** Each card's right edge (`offsetLeft + offsetWidth`), in order. */
  cardRightEdges: readonly number[]
}

export function activeCardIndex({
  scrollLeft,
  clientWidth,
  scrollWidth,
  cardRightEdges,
}: CarouselGeometry): number {
  const last = cardRightEdges.length - 1
  if (last < 0) return 0
  if (scrollLeft + clientWidth >= scrollWidth - END_TOLERANCE_PX) return last
  const line = scrollLeft + clientWidth * ACTIVE_LINE_RATIO
  const index = cardRightEdges.findIndex(edge => edge > line)
  return Math.max(0, index)
}
