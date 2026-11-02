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

/*
 * The desktop run (feature 45, reopen 1, Roberto 2026-11-02, FR-038): the
 * red fill no longer jumps to the previewed dot. After `RUN_DELAY_MS` it
 * travels at a constant speed, `RUN_MS_PER_LINE` for the whole line (so
 * from the start to the last dot, at about 83 % of the line, ≈ 580 ms), and
 * each column lights as the fill reaches its dot, or goes out as the fill
 * passes back over it. Linear on purpose: a constant speed is what keeps a
 * dot lighting exactly when the fill reaches it.
 */
export const RUN_DELAY_MS = 150
export const RUN_MS_PER_LINE = 700

/** A dot counts as reached within this share of the line (float noise). */
const REACHED_EPSILON = 1e-6

export interface RunChange {
  index: number
  lit: boolean
  /** When it changes, from the start of the run, in ms. */
  atMs: number
}

export interface RunPlan {
  delayMs: number
  durationMs: number
  changes: RunChange[]
}

/** Lit for every step whose dot the fill has reached; none at rest (0). */
export function litAt(progress: number, shares: readonly number[]): boolean[] {
  return shares.map(
    share => progress > 0 && share <= progress + REACHED_EPSILON
  )
}

/**
 * The fill's travel from `from` to `to` and when each column changes.
 * `before` is what is lit now (by default, what `from` lights); a column
 * already in its final state does not change.
 */
export function runSchedule(
  from: number,
  to: number,
  shares: readonly number[],
  before: readonly boolean[] = litAt(from, shares),
  timing = { delayMs: RUN_DELAY_MS, msPerLine: RUN_MS_PER_LINE }
): RunPlan {
  const after = litAt(to, shares)
  const changes = shares.flatMap((share, index) =>
    before[index] === after[index]
      ? []
      : [
          {
            index,
            lit: after[index] ?? false,
            atMs:
              timing.delayMs +
              Math.round(Math.abs(share - from) * timing.msPerLine),
          },
        ]
  )
  return {
    delayMs: timing.delayMs,
    durationMs: Math.round(Math.abs(to - from) * timing.msPerLine),
    changes,
  }
}

/** Where a run that left `from` for `to` is, `elapsedMs` after it began. */
export function runPosition(
  run: { from: number; to: number; delayMs: number; durationMs: number },
  elapsedMs: number
): number {
  const travelled = elapsedMs - run.delayMs
  if (travelled <= 0) return run.from
  if (run.durationMs <= 0 || travelled >= run.durationMs) return run.to
  return run.from + ((run.to - run.from) * travelled) / run.durationMs
}
