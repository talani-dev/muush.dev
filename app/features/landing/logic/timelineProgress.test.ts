import { describe, expect, it } from 'vitest'
import {
  dotProgress,
  emphasisAlongRail,
  isStepLitVertical,
  litAt,
  litUpTo,
  NEUTRAL_EMPHASIS,
  RUN_DELAY_MS,
  RUN_MS_PER_LINE,
  railPosition,
  runPosition,
  runSchedule,
  stepEmphasis,
  verticalProgress,
} from './timelineProgress'

/** Feature 44 · FR-019, research R8 (the handoff's `iniciarLineaTiempo`). */
const VH = 1000

describe('verticalProgress', () => {
  it('should be the share above the pencil line when crossing it', () => {
    expect(verticalProgress(650, 400, VH)).toBe(0)
    expect(verticalProgress(450, 400, VH)).toBeCloseTo(0.5, 6)
    expect(verticalProgress(100, 400, VH)).toBe(1)
  })

  it('should treat an empty stretch as a point when it has no height', () => {
    expect(verticalProgress(600, 0, VH)).toBe(1)
    expect(verticalProgress(700, 0, VH)).toBe(0)
  })
})

describe('isStepLitVertical', () => {
  it('should light a row once its top is above the pencil line', () => {
    expect(isStepLitVertical(649, VH)).toBe(true)
    expect(isStepLitVertical(650, VH)).toBe(false)
  })
})

/** Feature 44 · FR-042, FR-043 (Roberto review 2026-11-02): the hover preview. */
describe('dotProgress', () => {
  it('should be the dot centre as a share of the list width when inside it', () => {
    expect(dotProgress(14, 1280)).toBeCloseTo(14 / 1280, 6)
    expect(dotProgress(1054, 1280)).toBeCloseTo(1054 / 1280, 6)
  })

  it('should clamp to the line when the centre falls outside it', () => {
    expect(dotProgress(-4, 1280)).toBe(0)
    expect(dotProgress(1400, 1280)).toBe(1)
  })

  it('should be full when the list has no width yet', () => {
    expect(dotProgress(14, 0)).toBe(1)
  })
})

describe('litUpTo', () => {
  it('should light the steps up to and including the index when given one', () => {
    expect(litUpTo(0, 5)).toEqual([true, false, false, false, false])
    expect(litUpTo(2, 5)).toEqual([true, true, true, false, false])
    expect(litUpTo(4, 5)).toEqual([true, true, true, true, true])
  })
})

/** Feature 45, reopen 1 · FR-038: the desktop run. */
describe('the desktop run (FR-038)', () => {
  const SHARES = [0.01, 0.21, 0.41, 0.61, 0.81]

  it('should light every step whose dot the fill has reached and none at rest', () => {
    expect(litAt(0, SHARES)).toEqual([false, false, false, false, false])
    expect(litAt(0.41, SHARES)).toEqual([true, true, true, false, false])
  })

  it('should wait 150 ms then travel at 700 ms per line and light each dot as it is reached', () => {
    const plan = runSchedule(0, 0.41, SHARES)

    expect(RUN_DELAY_MS).toBe(150)
    expect(RUN_MS_PER_LINE).toBe(700)
    expect(plan.delayMs).toBe(150)
    expect(plan.durationMs).toBe(287)
    expect(plan.changes).toEqual([
      { index: 0, lit: true, atMs: 157 },
      { index: 1, lit: true, atMs: 297 },
      { index: 2, lit: true, atMs: 437 },
    ])
  })

  it('should put the later columns out in turn when running back', () => {
    const before = [true, true, true, true, true]
    const plan = runSchedule(0.81, 0.21, SHARES, before)

    expect(plan.changes.map(change => [change.index, change.lit])).toEqual([
      [2, false],
      [3, false],
      [4, false],
    ])
    const at = Object.fromEntries(
      plan.changes.map(change => [change.index, change.atMs])
    )
    expect(at[4]).toBeLessThan(at[3] ?? 0)
    expect(at[3]).toBeLessThan(at[2] ?? 0)
  })

  it('should place a run at its start during the delay, in between while travelling and at its end after', () => {
    const run = { from: 0.2, to: 0.6, delayMs: 150, durationMs: 280 }

    expect(runPosition(run, 100)).toBe(0.2)
    expect(runPosition(run, 150 + 140)).toBeCloseTo(0.4, 6)
    expect(runPosition(run, 2_000)).toBe(0.6)
  })
})

/**
 * Feature 50 (Roberto 2026-11-06): the mobile steps scale and fade with
 * their distance from the rail's active point. The tokens are the leader's
 * starting values (global.css `--paso-enfasis-*`); the maths must not
 * depend on them, so a second set is checked too.
 */
const TOKENS = {
  neighbourScale: 0.92,
  neighbourOpacity: 0.45,
  minScale: 0.9,
  minOpacity: 0.35,
}

describe('stepEmphasis', () => {
  it('should show the active step whole when it is at the active point', () => {
    expect(stepEmphasis(0, TOKENS, false)).toEqual(NEUTRAL_EMPHASIS)
  })

  it('should reach the one-step values when a whole row away, on either side', () => {
    for (const distance of [1, -1]) {
      const emphasis = stepEmphasis(distance, TOKENS, false)
      expect(emphasis.scale).toBeCloseTo(0.92, 6)
      expect(emphasis.opacity).toBeCloseTo(0.45, 6)
    }
  })

  it('should change in proportion to the distance when between two steps', () => {
    const emphasis = stepEmphasis(0.5, TOKENS, false)

    expect(emphasis.scale).toBeCloseTo(0.96, 6)
    expect(emphasis.opacity).toBeCloseTo(0.725, 6)
    expect(stepEmphasis(0.25, TOKENS, false).opacity).toBeGreaterThan(
      emphasis.opacity
    )
  })

  it('should stop at the floor when the step is far from the active point', () => {
    expect(stepEmphasis(3, TOKENS, false)).toEqual({
      scale: 0.9,
      opacity: 0.35,
    })
    /* The floors bite at 1.25 (scale) and about 1.18 (opacity) steps. */
    expect(stepEmphasis(1.2, TOKENS, false).scale).toBeCloseTo(0.904, 6)
    expect(stepEmphasis(1.2, TOKENS, false).opacity).toBe(0.35)
  })

  it('should fade but never scale when the visitor reduces motion', () => {
    for (const distance of [0, 0.5, 1, 4]) {
      const reduced = stepEmphasis(distance, TOKENS, true)
      expect(reduced.scale).toBe(1)
      expect(reduced.opacity).toBe(
        stepEmphasis(distance, TOKENS, false).opacity
      )
    }
    expect(stepEmphasis(1, TOKENS, true).opacity).toBeCloseTo(0.45, 6)
  })

  it('should follow the tokens when they are tuned', () => {
    const tuned = {
      neighbourScale: 0.8,
      neighbourOpacity: 0.6,
      minScale: 0.7,
      minOpacity: 0.5,
    }

    expect(stepEmphasis(0.5, tuned, false).scale).toBeCloseTo(0.9, 6)
    expect(stepEmphasis(0.5, tuned, false).opacity).toBeCloseTo(0.8, 6)
    expect(stepEmphasis(9, tuned, false)).toEqual({ scale: 0.7, opacity: 0.5 })
  })
})

describe('railPosition', () => {
  /* Pencil at 650 of a 1000 viewport; rows 112 tall. */
  const tops = (first: number) => [0, 1, 2, 3, 4].map(i => first + i * 112)

  it('should be the step index when the pencil is exactly at its top', () => {
    expect(railPosition(tops(650), VH)).toBe(0)
    expect(railPosition(tops(650 - 2 * 112), VH)).toBe(2)
  })

  it('should move continuously through a row when the pencil is inside it', () => {
    expect(railPosition(tops(650 - 2 * 112 - 28), VH)).toBeCloseTo(2.25, 6)
    expect(railPosition(tops(650 - 56), VH)).toBeCloseTo(0.5, 6)
  })

  it('should follow rows of different heights when the text wraps', () => {
    /* Second row 160 tall: 80 into it is halfway. */
    expect(railPosition([500, 570, 730, 842], VH)).toBeCloseTo(1.5, 6)
  })

  it('should hold at the first and last steps when the pencil is outside the list', () => {
    expect(railPosition(tops(900), VH)).toBe(0)
    expect(railPosition(tops(-2000), VH)).toBe(4)
  })

  it('should not divide by zero when the rows have no height yet', () => {
    const collapsed = railPosition([0, 0, 0], VH)

    expect(Number.isFinite(collapsed)).toBe(true)
    expect(collapsed).toBeGreaterThanOrEqual(0)
    expect(collapsed).toBeLessThanOrEqual(2)
    expect(railPosition([100], VH)).toBe(0)
  })
})

describe('emphasisAlongRail', () => {
  it('should lead with the active step and fade its neighbours when the pencil is on a step', () => {
    const steps = emphasisAlongRail(
      [0, 1, 2, 3, 4].map(i => 650 - 112 + i * 112),
      VH,
      TOKENS,
      false
    )

    expect(steps[1]).toEqual(NEUTRAL_EMPHASIS)
    expect(steps[0]?.opacity).toBeCloseTo(0.45, 6)
    expect(steps[2]?.opacity).toBeCloseTo(0.45, 6)
    expect(steps[4]).toEqual({ scale: 0.9, opacity: 0.35 })
  })

  it('should keep every step at scale 1 when the visitor reduces motion', () => {
    const steps = emphasisAlongRail([600, 712, 824], VH, TOKENS, true)

    expect(steps.every(step => step.scale === 1)).toBe(true)
    expect(steps[2]?.opacity).toBeLessThan(1)
  })
})
