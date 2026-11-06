import { describe, expect, it } from 'vitest'
import {
  dotProgress,
  isStepLitVertical,
  litAt,
  litUpTo,
  RUN_DELAY_MS,
  RUN_MS_PER_LINE,
  runPosition,
  runSchedule,
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
