import { nextTick, type Ref, readonly, ref } from 'vue'
import {
  DEFAULT_MAP_REGION,
  MAP_REGIONS,
  type MapRegionName,
} from '@/shared/data/mapRegions'

/**
 * The selected map region and its tabs' keyboard (feature 44, spec FR-011;
 * research R5): the WAI-ARIA tabs pattern with automatic activation, two
 * tabs whose panel change is instant and cheap. ArrowLeft / ArrowRight move
 * and wrap; Home and End jump to the first and last. Any other key is left
 * to the browser.
 */
const ORDER = MAP_REGIONS.map(region => region.name)

/** The region a key moves to from `current`, or `null` for other keys. */
export function nextRegion(
  current: MapRegionName,
  key: string
): MapRegionName | null {
  const index = ORDER.indexOf(current)
  const last = ORDER.length - 1
  const target: Record<string, number> = {
    ArrowRight: index === last ? 0 : index + 1,
    ArrowLeft: index === 0 ? last : index - 1,
    Home: 0,
    End: last,
  }
  const position = target[key]
  return position === undefined ? null : (ORDER[position] ?? null)
}

/**
 * `onKeydown` belongs on the tab list: it selects the target region and
 * moves focus to its tab, found as `[data-region]` inside the list
 * (`event.currentTarget`) once the roving `tabindex` has re-rendered.
 */
export function useMapRegion(initial: MapRegionName = DEFAULT_MAP_REGION): {
  region: Readonly<Ref<MapRegionName>>
  select: (name: MapRegionName) => void
  onKeydown: (event: KeyboardEvent) => void
} {
  const region = ref<MapRegionName>(initial)

  function select(name: MapRegionName) {
    region.value = name
  }

  function onKeydown(event: KeyboardEvent) {
    const target = nextRegion(region.value, event.key)
    if (!target) return
    event.preventDefault()
    select(target)
    const list = event.currentTarget
    if (!(list instanceof HTMLElement)) return
    nextTick(() => {
      list.querySelector<HTMLElement>(`[data-region="${target}"]`)?.focus()
    })
  }

  return { region: readonly(region), select, onKeydown }
}
