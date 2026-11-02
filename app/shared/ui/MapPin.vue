<script setup lang="ts">
import { computed } from 'vue'
import type { MapPinKind } from '@/shared/data/mapPins'

/**
 * One pin of the dotted map (feature 44, spec FR-009; pen extract-44
 * § 2.1, § 8, § 9): an 8 px dot centred in a 28 × 28 footprint.
 *
 * | kind    | dot                          | radar ping |
 * |---------|------------------------------|------------|
 * | team    | Red muush 500                | yes        |
 * | partner | Acero 200                    | yes        |
 * | soon    | hollow, 1.5 stroke Gris 400  | no         |
 *
 * The 16 / 28 halos the `.pen` draws are the radar ping (`pulso`, Roberto
 * 2026-11-01), not rings: at rest only the dot shows, and the ghost grows
 * 1 → 3 in the dot's colour, fading out; none under reduced motion.
 *
 * Centred on its point (`left` / `top` in percent of the map canvas). Below
 * `lg` the canvas is zoomed by `--mapa-zoom`; the pin is counter-scaled by
 * `--mapa-contra` (its inverse, set by `WorldMap`) so it keeps 28 × 28 on
 * screen at any zoom (Clarifications Q4, confirmed by Roberto 2026-11-01),
 * animating with the canvas. Decorative: `WorldMap` exposes the cities as
 * text.
 */
interface Props {
  kind: MapPinKind
  leftPercent: number
  topPercent: number
}

const { kind, leftPercent, topPercent } = defineProps<Props>()

const DOT_CLASSES = {
  team: 'bg-red-muush-500 pulso',
  partner: 'bg-acero-200 pulso',
  soon: 'border-(length:--trazo-anillo) border-gris-400',
} satisfies Record<MapPinKind, string>

const position = computed(() => ({
  left: `${leftPercent}%`,
  top: `${topPercent}%`,
}))
</script>

<template>
  <span
    aria-hidden="true"
    :data-pin="kind"
    :style="position"
    class="absolute grid size-pin -translate-1/2 place-items-center transition-transform duration-(--lento) ease-muush motion-reduce:transition-none max-lg:scale-(--mapa-contra)"
  >
    <span
      :class="['relative size-pin-nucleo rounded-full', DOT_CLASSES[kind]]"
    />
  </span>
</template>
