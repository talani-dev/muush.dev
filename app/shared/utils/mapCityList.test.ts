import { describe, expect, it } from 'vitest'
import { MAP_REGIONS } from '@/shared/data/mapRegions'
import { MAP_COPY } from '@/shared/ui/mapFixtures.testing'
import { mapCityGroups } from '@/shared/utils/mapCityList'

/** Feature 44 · FR-011a, research R6 (review-44 advisory 6). */
const [america, europe] = MAP_REGIONS
const { groups, cityNames } = MAP_COPY.es

const inRegion = (region: (typeof MAP_REGIONS)[number] | undefined) =>
  mapCityGroups(groups, cityNames, region).flatMap(group =>
    group.cities.filter(city => city.inRegion).map(city => city.name)
  )

describe('mapCityGroups', () => {
  it('should group the cities under the legend labels in legend order when listed', () => {
    const result = mapCityGroups(groups, cityNames, america)

    expect(result.map(group => group.label)).toEqual([
      'Equipo',
      'Aliados',
      'Estonia · pronto',
    ])
    expect(result[1]?.cities.map(city => city.name)).toEqual(['Ámsterdam'])
  })

  it('should flag only the American cities when America is selected', () => {
    expect(inRegion(america)).toEqual([
      'CDMX',
      'Puebla',
      'Mérida',
      'NYC',
      'San Francisco',
      'Los Ángeles',
    ])
    expect(
      mapCityGroups(groups, cityNames, america).map(group => group.inRegion)
    ).toEqual([true, false, false])
  })

  it('should flag only the European cities when Europe is selected', () => {
    expect(inRegion(europe)).toEqual(['Dublín', 'Ámsterdam', 'Estonia'])
  })

  it('should flag every city when no region is given', () => {
    expect(inRegion(undefined)).toHaveLength(9)
  })

  it('should leave out a kind that has no label when listed', () => {
    const result = mapCityGroups(groups.slice(0, 1), cityNames, america)

    expect(result.map(group => group.kind)).toEqual(['team'])
  })
})
