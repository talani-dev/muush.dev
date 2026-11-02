import { describe, expect, it } from 'vitest'
import {
  dotProgress,
  isStepLitVertical,
  litUpTo,
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
