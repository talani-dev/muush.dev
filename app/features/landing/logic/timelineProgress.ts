/**
 * The "Cómo trabajamos" timeline state, as pure functions (feature 44, spec
 * FR-019; research R8).
 *
 * Below `lg` the rail fills with the scroll: the handoff's starting-point
 * animation (`iniciarLineaTiempo`, "punto de partida"; Clau may refine it
 * later), filled down to a "pencil" line 65 % down the viewport; a step
 * lights once its top is above the pencil.
 *
 * From `lg` there is no scroll fill (Roberto, clarification 2026-11-02,
 * FR-044): the line is unlit until a step is previewed, below.
 */
export const PEN_LINE_RATIO = 0.65

function clampUnit(value: number): number {
  return Math.min(1, Math.max(0, value))
}

/** How much of a vertical stretch (a rail segment, the whole list) is above the pencil. */
export function verticalProgress(
  rectTop: number,
  rectHeight: number,
  viewportHeight: number
): number {
  if (rectHeight <= 0) return rectTop < viewportHeight * PEN_LINE_RATIO ? 1 : 0
  return clampUnit((viewportHeight * PEN_LINE_RATIO - rectTop) / rectHeight)
}

export function isStepLitVertical(
  stepTop: number,
  viewportHeight: number
): boolean {
  return stepTop < viewportHeight * PEN_LINE_RATIO
}

/*
 * The desktop hover / focus preview (feature 44, FR-042…FR-044; Roberto
 * review 2026-11-02): pointing at a step paints the line red up to that
 * step's dot and lights the steps up to and including it.
 */

/** The share of the line, from its left end, that reaches a dot's centre. */
export function dotProgress(dotCentre: number, listWidth: number): number {
  if (listWidth <= 0) return 1
  return clampUnit(dotCentre / listWidth)
}

/** Lit for every step up to and including `index`, unlit after it. */
export function litUpTo(index: number, stepCount: number): boolean[] {
  return Array.from({ length: stepCount }, (_, step) => step <= index)
}
