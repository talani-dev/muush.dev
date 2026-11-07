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
 * The mobile steps' scroll emphasis (feature 50, Roberto 2026-11-06, iPhone
 * review; not in the `.pen` yet, rules.md § R32). Besides the rail, each
 * step's text responds to the scroll: the step at the rail's active point
 * (the pencil line, where the red fill ends) shows at scale 1 and opacity 1,
 * and the others shrink and fade in proportion to their distance from it,
 * continuously, never in jumps. Distance is in steps: 1 is a whole row away.
 *
 * The values are tokens in `global.css` (`--paso-enfasis-*`), read once by
 * `useTimelineProgress`, so Roberto can tune them without touching code;
 * the active step's 1 / 1 is the identity, not a tunable. Under reduced
 * motion only the opacity changes: no scale.
 */
export interface StepEmphasis {
  scale: number
  opacity: number
}

/** One row away, and the floor no step goes below. */
export interface EmphasisTokens {
  neighbourScale: number
  neighbourOpacity: number
  minScale: number
  minOpacity: number
}

export const NEUTRAL_EMPHASIS: StepEmphasis = { scale: 1, opacity: 1 }

/** Linear from 1 at the active point through `neighbour` one step away, floored at `min`. */
function towardsFloor(distance: number, neighbour: number, min: number) {
  return Math.max(min, 1 - (1 - neighbour) * Math.abs(distance))
}

export function stepEmphasis(
  distance: number,
  tokens: EmphasisTokens,
  reducedMotion: boolean
): StepEmphasis {
  return {
    scale: reducedMotion
      ? 1
      : towardsFloor(distance, tokens.neighbourScale, tokens.minScale),
    opacity: towardsFloor(distance, tokens.neighbourOpacity, tokens.minOpacity),
  }
}

/**
 * Where the pencil line is along the rail, in steps: 2 when it is exactly
 * at the third step's top, 2.5 halfway down that row. Clamped to the first
 * and last steps, so arriving at the section the first step leads and
 * scrolling past it the last one stays in front.
 */
export function railPosition(
  stepTops: readonly number[],
  viewportHeight: number
): number {
  const pencil = viewportHeight * PEN_LINE_RATIO
  const last = stepTops.length - 1
  if (last <= 0) return 0
  const passed = stepTops.filter(top => top <= pencil).length
  const index = Math.min(Math.max(passed - 1, 0), last - 1)
  const top = stepTops[index] ?? 0
  const rowHeight = (stepTops[index + 1] ?? top) - top
  if (rowHeight <= 0) return index
  return Math.min(last, Math.max(0, index + (pencil - top) / rowHeight))
}

/** Every step's emphasis for the rail's current position. */
export function emphasisAlongRail(
  stepTops: readonly number[],
  viewportHeight: number,
  tokens: EmphasisTokens,
  reducedMotion: boolean
): StepEmphasis[] {
  const position = railPosition(stepTops, viewportHeight)
  return stepTops.map((_, index) =>
    stepEmphasis(index - position, tokens, reducedMotion)
  )
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
