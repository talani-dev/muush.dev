<script setup lang="ts">
import type { MapRegionName } from '@/shared/data/mapRegions'

/**
 * The America / Europa selector of the mobile map (feature 44, spec
 * FR-010, FR-011; pen extract-44 § 2.1): a Carbón 800 track, radius 12,
 * padding and gap 4; the active tab Blanco 10 %, radius 9, 8 / 16, 14 / 600
 * Blanco; the inactive one transparent in Gris 400.
 *
 * The WAI-ARIA tabs pattern: a named `tablist`, `tab` buttons with
 * `aria-selected` and `aria-controls`, and a roving `tabindex` so only the
 * selected tab is in the tab order. Clicking a tab emits `select`; the
 * arrow keys, Home and End are the caller's `@keydown` on this root
 * (`useMapRegion().onKeydown`), which selects and moves focus. Forced
 * colours drop the fill, so the selected tab is also underlined there.
 */
interface Props {
  regions: { name: MapRegionName; label: string }[]
  selected: MapRegionName
  label: string
  panelId: string
  idPrefix: string
}

const { regions, selected, label, panelId, idPrefix } = defineProps<Props>()

const emit = defineEmits<{ select: [name: MapRegionName] }>()
</script>

<template>
  <div
    role="tablist"
    :aria-label="label"
    class="inline-flex gap-selector rounded-control bg-carbon-800 p-selector"
  >
    <button
      v-for="region in regions"
      :id="`${idPrefix}-tab-${region.name}`"
      :key="region.name"
      type="button"
      role="tab"
      :data-region="region.name"
      :aria-selected="region.name === selected"
      :aria-controls="panelId"
      :tabindex="region.name === selected ? 0 : -1"
      :class="[
        'rounded-pestana px-pestana-x py-pestana-y font-texto text-pestana transition-colors duration-(--rapido) ease-muush foco forced-colors:aria-selected:underline',
        region.name === selected ? 'bg-blanco-10 text-blanco' : 'text-gris-400',
      ]"
      @click="emit('select', region.name)"
    >
      {{ region.label }}
    </button>
  </div>
</template>
