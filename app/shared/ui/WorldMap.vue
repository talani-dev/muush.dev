<script setup lang="ts">
import { computed, useId } from 'vue'
import worldDots from '@/assets/map/world-dots.svg?raw'
import { MAP_PINS, type MapCity, type MapPinKind } from '@/shared/data/mapPins'
import {
  MAP_REGIONS,
  MAP_WINDOW_ASPECT,
  type MapRegionName,
} from '@/shared/data/mapRegions'
import { useDesktopLayout } from '@/shared/logic/useDesktopLayout'
import { useMapRegion } from '@/shared/logic/useMapRegion'
import MapPin from '@/shared/ui/MapPin.vue'
import MapRegionTabs from '@/shared/ui/MapRegionTabs.vue'
import { mapCityGroups } from '@/shared/utils/mapCityList'
import { pinPosition, regionTransform } from '@/shared/utils/mapGeometry'

/**
 * The dotted world map with the team's pins (feature 44, spec FR-007…
 * FR-012, FR-011a; research R3–R6; pen extract-44 § 2.1, § 8). Shared:
 * Nosotros reuses it in feature 46. All copy arrives as props.
 *
 * ONE map serves both views:
 *
 * - From `lg` the canvas is the whole 1408 × 470 map, scaled to the width
 *   available (capped at 1408), at 80 % opacity, with no tabs.
 * - Below `lg` a 342 : 240 box (radius 16, opaque, capped at 640) shows one
 *   region of the same canvas, chosen with the America / Europa tabs. The
 *   zoom is `translate + scale` from constants per region
 *   (`regionTransform`), animated over `--lento` with the Muush ease, and
 *   instant under reduced motion. America is the server and no-script state.
 *
 * The dots are inlined (`?raw`), so the map makes no request and its colour
 * is a token. They are hidden from assistive technology; the pins are
 * exposed as a visually hidden list of cities grouped under the legend
 * labels, all of them from `lg` and only the selected region's below
 * (Clarifications Q2, confirmed by Roberto 2026-11-01). The box is the tab
 * panel only while the tabs exist (`useDesktopLayout`); with no focusable
 * content of its own it takes `tabindex="0"` then, as the APG advises.
 */
interface Props {
  regions: { name: MapRegionName; label: string }[]
  regionsLabel: string
  groups: { kind: MapPinKind; label: string }[]
  cityNames: Record<MapCity, string>
  idPrefix?: string
}

const { regions, regionsLabel, groups, cityNames, idPrefix } =
  defineProps<Props>()

const generatedId = useId()
const prefix = computed(() => idPrefix ?? `mapa-${generatedId}`)
const panelId = computed(() => `${prefix.value}-panel`)

const isDesktop = useDesktopLayout()
const { region, select, onKeydown } = useMapRegion()

const zoomStyle = computed(() => {
  const current = MAP_REGIONS.find(entry => entry.name === region.value)
  if (!current) return {}
  const { zoom, translateXPercent, translateYPercent } = regionTransform(
    current,
    MAP_WINDOW_ASPECT
  )
  return {
    '--mapa-tx': `${translateXPercent}%`,
    '--mapa-ty': `${translateYPercent}%`,
    '--mapa-zoom': `${zoom}`,
    '--mapa-contra': `${1 / zoom}`,
  }
})

const pins = computed(() =>
  MAP_PINS.map(pin => ({ ...pin, ...pinPosition(pin) }))
)

/** Below `lg`, a city outside the selected region leaves the hidden list. */
const cityGroups = computed(() =>
  mapCityGroups(
    groups,
    cityNames,
    MAP_REGIONS.find(entry => entry.name === region.value)
  )
)
</script>

<template>
  <div class="flex w-full flex-col items-center gap-mapa-gap">
    <MapRegionTabs
      class="lg:hidden"
      :regions="regions"
      :selected="region"
      :label="regionsLabel"
      :panel-id="panelId"
      :id-prefix="prefix"
      @select="select"
      @keydown="onKeydown"
    />
    <div
      :id="panelId"
      :role="isDesktop ? undefined : 'tabpanel'"
      :aria-labelledby="isDesktop ? undefined : `${prefix}-tab-${region}`"
      :tabindex="isDesktop ? undefined : 0"
      :style="zoomStyle"
      data-mapa
      class="relative aspect-mapa-ventana w-full max-w-mapa-ventana overflow-clip rounded-caja foco lg:aspect-mapa lg:max-w-mapa lg:rounded-none lg:opacity-(--mapa-opacidad)"
    >
      <div
        data-lienzo
        class="absolute inset-x-0 top-0 aspect-mapa w-full origin-top-left transition-transform duration-(--lento) ease-muush motion-reduce:transition-none max-lg:translate-x-(--mapa-tx) max-lg:translate-y-(--mapa-ty) max-lg:scale-(--mapa-zoom)"
      >
        <div
          aria-hidden="true"
          class="mapa-puntos absolute inset-0 text-mapa-punto"
          v-html="worldDots"
        />
        <MapPin
          v-for="pin in pins"
          :key="pin.city"
          :kind="pin.kind"
          :left-percent="pin.leftPercent"
          :top-percent="pin.topPercent"
        />
      </div>
      <ul class="sr-only">
        <li
          v-for="group in cityGroups"
          :key="group.kind"
          :class="{ 'max-lg:hidden': !group.inRegion }"
        >
          {{ group.label }}
          <ul>
            <li
              v-for="city in group.cities"
              :key="city.name"
              :class="{ 'max-lg:hidden': !city.inRegion }"
            >
              {{ city.name }}
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
/*
 * `:deep()` is required: Vue's scoped transform does not rewrite `v-html`
 * content (app/assets/icons/README.md). The canvas has the map's own
 * proportion, so the SVG fills it exactly.
 */
.mapa-puntos :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
