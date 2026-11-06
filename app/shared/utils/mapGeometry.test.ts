import { describe, expect, it } from 'vitest'
import { MAP_PINS, MAP_SIZE } from '@/shared/data/mapPins'
import { MAP_REGIONS, MAP_WINDOW_ASPECT } from '@/shared/data/mapRegions'
import {
  isInRegion,
  pinPosition,
  regionTransform,
} from '@/shared/utils/mapGeometry'

/**
 * Feature 44 · research R4, data-model § 2. The reference is the handoff's
 * `iniciarMapa`, in pixels, on a 1408-wide canvas inside a W × H window:
 * `s = min(W / w, H / h)`, `ox = (W − w s) / 2 − x s`,
 * `oy = (H − h s) / 2 − y s`. Our transform is relative to a canvas as wide
 * as the window, so mapping a map point through both must land on the same
 * window pixel.
 */
function handoff(W: number, H: number, region: (typeof MAP_REGIONS)[number]) {
  const s = Math.min(W / region.width, H / region.height)
  return {
    s,
    ox: (W - region.width * s) / 2 - region.x * s,
    oy: (H - region.height * s) / 2 - region.y * s,
  }
}

function ours(W: number, region: (typeof MAP_REGIONS)[number]) {
  const t = regionTransform(region, MAP_WINDOW_ASPECT)
  const canvasHeight = (W * MAP_SIZE.height) / MAP_SIZE.width
  const base = W / MAP_SIZE.width
  return {
    project: (x: number, y: number) => ({
      x: (t.translateXPercent / 100) * W + t.zoom * base * x,
      y: (t.translateYPercent / 100) * canvasHeight + t.zoom * base * y,
    }),
  }
}

describe('regionTransform', () => {
  const windows: [number, number][] = [
    [342, 240],
    [600, 600 / MAP_WINDOW_ASPECT],
    [300, 300 / MAP_WINDOW_ASPECT],
  ]

  for (const region of MAP_REGIONS) {
    for (const [W, H] of windows) {
      it(`should match the handoff contain-fit when ${region.name} shows in a ${Math.round(W)} × ${Math.round(H)} window`, () => {
        const reference = handoff(W, H, region)
        const projection = ours(W, region)

        for (const [x, y] of [
          [region.x, region.y],
          [region.x + region.width, region.y + region.height],
          [704, 235],
        ] as const) {
          const expected = {
            x: reference.ox + reference.s * x,
            y: reference.oy + reference.s * y,
          }
          const actual = projection.project(x, y)
          expect(actual.x).toBeCloseTo(expected.x, 6)
          expect(actual.y).toBeCloseTo(expected.y, 6)
        }
      })
    }
  }

  it('should zoom America about 4.94 times and Europe about 7.41 times when computed at the 390 box', () => {
    const [america, europe] = MAP_REGIONS
    if (!america || !europe) throw new Error('regions missing')

    expect(regionTransform(america, MAP_WINDOW_ASPECT).zoom).toBeCloseTo(
      1408 / 285,
      6
    )
    expect(regionTransform(europe, MAP_WINDOW_ASPECT).zoom).toBeCloseTo(
      1408 / 190,
      6
    )
  })
})

describe('pinPosition', () => {
  it('should convert map coordinates to percent of the canvas when given a pin', () => {
    expect(pinPosition({ city: 'cdmx', x: 352, y: 235, kind: 'team' })).toEqual(
      { leftPercent: 25, topPercent: 50 }
    )
  })
})

describe('isInRegion', () => {
  it('should place every pin in exactly one region when checked', () => {
    for (const pin of MAP_PINS) {
      const regions = MAP_REGIONS.filter(region => isInRegion(pin, region))
      expect(regions, pin.city).toHaveLength(1)
    }
  })

  it('should put the three European cities in Europe when checked', () => {
    const europe = MAP_REGIONS.find(region => region.name === 'europe')
    if (!europe) throw new Error('europe missing')

    expect(
      MAP_PINS.filter(pin => isInRegion(pin, europe)).map(pin => pin.city)
    ).toEqual(['dublin', 'amsterdam', 'estonia'])
  })
})
