import {
  MAP_PIN_KINDS,
  MAP_PINS,
  type MapCity,
  type MapPinKind,
} from '@/shared/data/mapPins'
import type { MapRegion } from '@/shared/data/mapRegions'
import { isInRegion } from '@/shared/utils/mapGeometry'

/**
 * The map's visually hidden city list (feature 44, FR-011a; research R6):
 * the pins grouped under the legend labels, in legend order, each city and
 * group flagged with whether it lies in the selected region. `WorldMap`
 * hides the flagged-out ones below `lg` only, so from `lg` all nine are
 * listed. A kind without a label is left out; with no region, everything
 * counts as in.
 */
export interface MapCityGroup {
  kind: MapPinKind
  label: string
  inRegion: boolean
  cities: { name: string; inRegion: boolean }[]
}

export function mapCityGroups(
  groups: readonly { kind: MapPinKind; label: string }[],
  cityNames: Readonly<Record<MapCity, string>>,
  region: MapRegion | undefined
): MapCityGroup[] {
  return MAP_PIN_KINDS.flatMap(kind => {
    const label = groups.find(group => group.kind === kind)?.label
    if (!label) return []
    const cities = MAP_PINS.filter(pin => pin.kind === kind).map(pin => ({
      name: cityNames[pin.city],
      inRegion: region ? isInRegion(pin, region) : true,
    }))
    return [
      { kind, label, cities, inRegion: cities.some(city => city.inRegion) },
    ]
  })
}
