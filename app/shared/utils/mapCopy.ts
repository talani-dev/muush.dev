import { MAP_COPY_KEYS, type MapCopy } from '@/shared/data/mapCopy'
import type { MapCity, MapPinKind } from '@/shared/data/mapPins'
import { MAP_REGIONS } from '@/shared/data/mapRegions'

/**
 * Builds the map's labels from a translate function (feature 46, research
 * R3). Pure: the caller passes its own `t`, so `useI18n` stays in the
 * feature seams (`useWhoWeAreContent`, `useWhereWeAreContent`) and nothing
 * in `app/shared/` needs the Nuxt runtime.
 *
 * Orders: the legend lists team, partner, then the "anywhere" line; the
 * hidden city list groups team, partner, then soon; the tabs follow
 * `MAP_REGIONS`.
 */
export function resolveMapCopy(translate: (key: string) => string): MapCopy {
  const legend = MAP_COPY_KEYS.legend
  const label = (kind: MapPinKind) => translate(legend[kind])
  const cityNames = Object.fromEntries(
    Object.entries(MAP_COPY_KEYS.cities).map(([city, key]) => [
      city,
      translate(key),
    ])
  ) as Record<MapCity, string>

  return {
    legend: [
      { kind: 'team', label: label('team') },
      { kind: 'partner', label: label('partner') },
      { kind: 'none', label: translate(legend.anywhere) },
    ],
    soonLabel: label('soon'),
    regions: MAP_REGIONS.map(region => ({
      name: region.name,
      label: translate(MAP_COPY_KEYS.regions[region.name]),
    })),
    regionsLabel: translate(MAP_COPY_KEYS.regionsLabel),
    groups: (['team', 'partner', 'soon'] as const).map(kind => ({
      kind,
      label: label(kind),
    })),
    cityNames,
  }
}
