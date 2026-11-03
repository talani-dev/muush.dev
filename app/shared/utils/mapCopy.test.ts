import { describe, expect, it } from 'vitest'
import { MAP_COPY_KEYS } from '@/shared/data/mapCopy'
import { MAP_PINS } from '@/shared/data/mapPins'
import { resolveMapCopy } from '@/shared/utils/mapCopy'

/** Feature 46 · FR-017, research R3. The fake translate echoes its key. */
const echo = (key: string) => key

describe('resolveMapCopy', () => {
  it('should build the legend team, partner then anywhere when resolved', () => {
    expect(resolveMapCopy(echo).legend).toEqual([
      { kind: 'team', label: 'map.legend.team' },
      { kind: 'partner', label: 'map.legend.partner' },
      { kind: 'none', label: 'map.legend.anywhere' },
    ])
  })

  it('should list team, partner and soon groups when resolved', () => {
    expect(resolveMapCopy(echo).groups).toEqual([
      { kind: 'team', label: 'map.legend.team' },
      { kind: 'partner', label: 'map.legend.partner' },
      { kind: 'soon', label: 'map.legend.soon' },
    ])
    expect(resolveMapCopy(echo).soonLabel).toBe('map.legend.soon')
  })

  it('should map every city to its translated name when resolved', () => {
    const { cityNames } = resolveMapCopy(echo)

    for (const pin of MAP_PINS) {
      expect(cityNames[pin.city]).toBe(`map.cities.${pin.city}`)
    }
    expect(Object.keys(cityNames)).toEqual(Object.keys(MAP_COPY_KEYS.cities))
  })

  it('should label the tabs in map-region order when resolved', () => {
    const copy = resolveMapCopy(echo)

    expect(copy.regions).toEqual([
      { name: 'america', label: 'map.regions.america' },
      { name: 'europe', label: 'map.regions.europe' },
    ])
    expect(copy.regionsLabel).toBe('map.regions.label')
  })
})
