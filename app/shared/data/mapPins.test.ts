import { describe, expect, it } from 'vitest'
import { MAP_PIN_KINDS, MAP_PINS, MAP_SIZE } from '@/shared/data/mapPins'

/** Feature 44 · FR-008, data-model § 1. */
describe('MAP_PINS', () => {
  it('should hold nine pins with unique cities when read', () => {
    const cities = MAP_PINS.map(pin => pin.city)

    expect(MAP_PINS).toHaveLength(9)
    expect(new Set(cities).size).toBe(9)
  })

  it('should place every pin inside the map when read', () => {
    for (const pin of MAP_PINS) {
      expect(pin.x, pin.city).toBeGreaterThan(0)
      expect(pin.x, pin.city).toBeLessThan(MAP_SIZE.width)
      expect(pin.y, pin.city).toBeGreaterThan(0)
      expect(pin.y, pin.city).toBeLessThan(MAP_SIZE.height)
    }
  })

  it('should give the kinds the .pen draws when read', () => {
    const byKind = (kind: string) =>
      MAP_PINS.filter(pin => pin.kind === kind).map(pin => pin.city)

    expect(byKind('team')).toEqual([
      'cdmx',
      'puebla',
      'merida',
      'dublin',
      'nyc',
      'sanFrancisco',
      'losAngeles',
    ])
    expect(byKind('partner')).toEqual(['amsterdam'])
    expect(byKind('soon')).toEqual(['estonia'])
  })

  it('should transcribe the leader export exactly when read', () => {
    expect(MAP_PINS.find(pin => pin.city === 'cdmx')).toEqual({
      city: 'cdmx',
      x: 338,
      y: 254,
      kind: 'team',
    })
    expect(MAP_PINS.find(pin => pin.city === 'estonia')).toMatchObject({
      x: 795,
      y: 113,
    })
  })

  it('should list the kinds in legend order when read', () => {
    expect(MAP_PIN_KINDS).toEqual(['team', 'partner', 'soon'])
  })
})
