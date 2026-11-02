import type { MapCity, MapPinKind } from '@/shared/data/mapPins'
import type { MapRegionName } from '@/shared/data/mapRegions'

/**
 * "Qué es muush" content model (feature 44, data-model §§ 4–5; copy in
 * `docs/business/muush-1.0.md` § 4.3 and pen extract-44 § 2.1). The
 * tab-list name and the city names are the accessibility copy of
 * Clarifications Q2, confirmed by Roberto 2026-11-01.
 */
export const WHO_WE_ARE_KEYS = {
  pill: 'landing.whoWeAre.pill',
  headingFirst: 'landing.whoWeAre.heading.first',
  headingSecond: 'landing.whoWeAre.heading.second',
  body: 'landing.whoWeAre.body',
  legend: {
    team: 'landing.whoWeAre.legend.team',
    partner: 'landing.whoWeAre.legend.partner',
    soon: 'landing.whoWeAre.legend.soon',
    anywhere: 'landing.whoWeAre.legend.anywhere',
  },
  regionsLabel: 'landing.whoWeAre.regions.label',
  regions: {
    america: 'landing.whoWeAre.regions.america',
    europe: 'landing.whoWeAre.regions.europe',
  },
  cities: {
    cdmx: 'landing.whoWeAre.cities.cdmx',
    puebla: 'landing.whoWeAre.cities.puebla',
    merida: 'landing.whoWeAre.cities.merida',
    dublin: 'landing.whoWeAre.cities.dublin',
    nyc: 'landing.whoWeAre.cities.nyc',
    sanFrancisco: 'landing.whoWeAre.cities.sanFrancisco',
    losAngeles: 'landing.whoWeAre.cities.losAngeles',
    amsterdam: 'landing.whoWeAre.cities.amsterdam',
    estonia: 'landing.whoWeAre.cities.estonia',
  },
} as const satisfies {
  legend: Record<MapPinKind | 'anywhere', string>
  regions: Record<MapRegionName, string>
  cities: Record<MapCity, string>
  [key: string]: unknown
}

export interface WhoWeAreContent {
  pill: string
  headingFirst: string
  headingSecond: string
  body: string
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
