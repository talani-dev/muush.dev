import type { MapCity, MapPinKind } from '@/shared/data/mapPins'
import type { MapRegionName } from '@/shared/data/mapRegions'

/**
 * The world map's labels, one source for every page that shows the map
 * (feature 46, spec FR-017, SC-007; research R3): the legend, the "soon"
 * chip, the America / Europa tabs and their list name, and the city names
 * of the hidden city list. The home's "Qué es muush" and Nosotros' "Dónde
 * estamos" both read these keys, so the two can never disagree.
 *
 * Copy: `docs/business/muush-1.0.md` § 4.3 and pen extract-44 § 2.1; the
 * tab-list name and the city names are feature 44's Clarifications Q2,
 * confirmed by Roberto 2026-11-01. Moved from `landing.whoWeAre.*` to the
 * top-level `map.*` namespace in feature 46, values unchanged.
 */
export const MAP_COPY_KEYS = {
  legend: {
    team: 'map.legend.team',
    partner: 'map.legend.partner',
    soon: 'map.legend.soon',
    anywhere: 'map.legend.anywhere',
  },
  regionsLabel: 'map.regions.label',
  regions: {
    america: 'map.regions.america',
    europe: 'map.regions.europe',
  },
  cities: {
    cdmx: 'map.cities.cdmx',
    puebla: 'map.cities.puebla',
    merida: 'map.cities.merida',
    dublin: 'map.cities.dublin',
    nyc: 'map.cities.nyc',
    sanFrancisco: 'map.cities.sanFrancisco',
    losAngeles: 'map.cities.losAngeles',
    amsterdam: 'map.cities.amsterdam',
    estonia: 'map.cities.estonia',
  },
} as const satisfies {
  legend: Record<MapPinKind | 'anywhere', string>
  regionsLabel: string
  regions: Record<MapRegionName, string>
  cities: Record<MapCity, string>
}

/** What `WorldMap` and `MapLegend` receive, already translated. */
export interface MapCopy {
  /** Legend items: the two pin kinds, then the "anywhere" line. */
  legend: { kind: MapPinKind | 'none'; label: string }[]
  /** "Estonia · pronto": the mobile legend chip. */
  soonLabel: string
  regions: { name: MapRegionName; label: string }[]
  regionsLabel: string
  /** The hidden city list's group headings (the legend labels). */
  groups: { kind: MapPinKind; label: string }[]
  cityNames: Record<MapCity, string>
}
