import { describe, expect, it } from 'vitest'
import {
  canvasPixelSize,
  capPixelRatio,
  DESKTOP_MAX_PIXEL_RATIO,
  MOBILE_MAX_WIDTH,
  MOBILE_PIXEL_RATIO,
  SHADER_DEFAULTS,
  STILL_TIME_SECONDS,
  shouldAnimate,
  withShaderDefaults,
} from '@/shared/utils/shaderFrame'

/** Feature 42 · FR-019, FR-020, FR-022, contract § 8, research R10. */
describe('shaderFrame · constants', () => {
  it('should mirror the handoff thresholds when imported', () => {
    expect(MOBILE_MAX_WIDTH).toBe(768)
    expect(MOBILE_PIXEL_RATIO).toBe(1)
    expect(DESKTOP_MAX_PIXEL_RATIO).toBe(1.5)
    expect(STILL_TIME_SECONDS).toBe(12)
    expect(SHADER_DEFAULTS).toEqual({ u_speed: 1, u_flip: 1, u_grain: 0.07 })
  })
})

describe('capPixelRatio', () => {
  it('should draw at 1x when the viewport is below 768 px', () => {
    expect(capPixelRatio(3, 767)).toBe(1)
  })

  it('should cap at 1.5x when the viewport is 768 px or wider', () => {
    expect(capPixelRatio(3, 768)).toBe(1.5)
    expect(capPixelRatio(2, 1440)).toBe(1.5)
  })

  it('should keep a lower device ratio when the device is below the cap', () => {
    expect(capPixelRatio(1, 1440)).toBe(1)
  })

  it('should fall back to 1x when the device ratio is missing or zero', () => {
    expect(capPixelRatio(0, 1440)).toBe(1)
    expect(capPixelRatio(Number.NaN, 1440)).toBe(1)
  })
})

describe('canvasPixelSize', () => {
  it('should round the CSS size times the ratio when given one', () => {
    expect(canvasPixelSize(1440, 1000, 1.5)).toEqual({
      width: 2160,
      height: 1500,
    })
    expect(canvasPixelSize(100.4, 50.6, 1)).toEqual({ width: 100, height: 51 })
  })

  it('should never go below one pixel when the element is collapsed', () => {
    expect(canvasPixelSize(0, 0, 1.5)).toEqual({ width: 1, height: 1 })
  })
})

describe('shouldAnimate', () => {
  for (const visible of [true, false]) {
    for (const documentHidden of [true, false]) {
      for (const reducedMotion of [true, false]) {
        const expected = visible && !documentHidden && !reducedMotion
        it(`should be ${expected} when visible=${visible}, hidden=${documentHidden}, reduced=${reducedMotion}`, () => {
          expect(
            shouldAnimate({ visible, documentHidden, reducedMotion })
          ).toBe(expected)
        })
      }
    }
  }
})

describe('withShaderDefaults', () => {
  it('should add the engine defaults when the preset omits them', () => {
    expect(withShaderDefaults({ u_tx: 0.5 })).toEqual({
      u_speed: 1,
      u_flip: 1,
      u_grain: 0.07,
      u_tx: 0.5,
    })
  })

  it('should let preset values win when they name a default', () => {
    expect(withShaderDefaults({ u_flip: 0, u_grain: 0.1 })).toMatchObject({
      u_flip: 0,
      u_grain: 0.1,
      u_speed: 1,
    })
  })
})
