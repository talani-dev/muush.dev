import { describe, expect, it } from 'vitest'
import {
  DEFAULT_MAP_REGION,
  MAP_REGIONS,
  MAP_WINDOW_ASPECT,
} from '@/shared/data/mapRegions'

/** Feature 44 · FR-010, data-model § 1. */
describe('MAP_REGIONS', () => {
  it('should carry the handoff regions in tab order when read', () => {
    expect(MAP_REGIONS).toEqual([
      { name: 'america', x: 210, y: 95, width: 285, height: 200 },
      { name: 'europe', x: 645, y: 75, width: 190, height: 95 },
    ])
  })

  it('should start on America when the page loads', () => {
    expect(DEFAULT_MAP_REGION).toBe('america')
  })

  it('should keep the 390 frame box proportion when read', () => {
    expect(MAP_WINDOW_ASPECT).toBeCloseTo(1.425, 5)
  })
})
