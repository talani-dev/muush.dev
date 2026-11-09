/**
 * Where the mobile chip row must scroll so the selected chip is fully in
 * view (feature 51, spec FR-014, User Story 3 scenario 4). Pure: boxes in,
 * a `scrollLeft` out, so the carousel never moves the page vertically, as
 * `scrollIntoView` could.
 *
 * Boxes are viewport rectangles (`getBoundingClientRect`); `startInset` is
 * the row's start padding, the gutter the first chip rests at. A chip
 * already in view leaves the row where it is.
 */
export interface ChipScrollBoxes {
  scrollLeft: number
  row: { left: number; right: number }
  chip: { left: number; right: number }
  startInset: number
}

export function chipScrollLeft({
  scrollLeft,
  row,
  chip,
  startInset,
}: ChipScrollBoxes): number {
  const visibleStart = row.left + startInset
  if (chip.left < visibleStart) return scrollLeft - (visibleStart - chip.left)
  if (chip.right > row.right) return scrollLeft + (chip.right - row.right)
  return scrollLeft
}
