import { type ComputedRef, computed } from 'vue'
import {
  WHO_WE_ARE_KEYS,
  type WhoWeAreContent,
} from '@/features/landing/data/whoWeAreContent'
import type { MapCity, MapPinKind } from '@/shared/data/mapPins'
import { MAP_REGIONS } from '@/shared/data/mapRegions'

/**
 * "Qué es muush"'s seam with the Nuxt runtime (feature 44, data-model § 4):
 * the only place its keys meet `useI18n`. The map and the legend receive
 * plain strings.
 */
export function useWhoWeAreContent(): ComputedRef<WhoWeAreContent> {
  const { t } = useI18n()

  return computed<WhoWeAreContent>(() => {
    const legend = WHO_WE_ARE_KEYS.legend
    const label = (kind: MapPinKind) => t(legend[kind])
    const cityNames = Object.fromEntries(
      Object.entries(WHO_WE_ARE_KEYS.cities).map(([city, key]) => [
        city,
        t(key),
      ])
    ) as Record<MapCity, string>
    return {
      pill: t(WHO_WE_ARE_KEYS.pill),
      headingFirst: t(WHO_WE_ARE_KEYS.headingFirst),
      headingSecond: t(WHO_WE_ARE_KEYS.headingSecond),
      body: t(WHO_WE_ARE_KEYS.body),
      legend: [
        { kind: 'team', label: label('team') },
        { kind: 'partner', label: label('partner') },
        { kind: 'none', label: t(legend.anywhere) },
      ],
      soonLabel: label('soon'),
      regions: MAP_REGIONS.map(region => ({
        name: region.name,
        label: t(WHO_WE_ARE_KEYS.regions[region.name]),
      })),
      regionsLabel: t(WHO_WE_ARE_KEYS.regionsLabel),
      groups: (['team', 'partner', 'soon'] as const).map(kind => ({
        kind,
        label: label(kind),
      })),
      cityNames,
    }
  })
}
