<script setup lang="ts">
import { computed } from 'vue'
import type { MapPinKind } from '@/shared/data/mapPins'

/**
 * The map legend (feature 44, spec FR-013; pen extract-44 § 2, § 2.1).
 *
 * - From `lg`: one row, gap 22: Equipo (8 px Red muush 500 dot), Aliados
 *   (8 px Acero 200 dot) and the "anywhere" line, all 13 / 400 Gris 400,
 *   dot-text gap 8.
 * - Below `lg`: two rows, gap 8. The first, gap 16, adds the "Estonia ·
 *   pronto" chip (Negro 900 70 %, radius 99, 1 px Blanco 12 %, padding
 *   7 / 11, gap 6, the hollow Estonia marker); the second is the line.
 *
 * Items with `kind: 'none'` are lines without a dot. The chip renders only
 * with `soonLabel`, and only below `lg`; its text is 13 / 400 Blanco and its
 * marker a 6 px solid Acero 400 dot, not the map's hollow ring (pen
 * extract-44 § 10). Dots are decorative.
 */
interface Props {
  items: { kind: MapPinKind | 'none'; label: string }[]
  soonLabel?: string
}

const { items, soonLabel } = defineProps<Props>()

const DOT_CLASSES = {
  team: 'bg-red-muush-500',
  partner: 'bg-acero-200',
} satisfies Record<Exclude<MapPinKind, 'soon'>, string>

const marked = computed(() => items.filter(item => item.kind !== 'none'))
const lines = computed(() => items.filter(item => item.kind === 'none'))
</script>

<template>
  <div
    class="flex flex-col items-center gap-leyenda-filas font-texto text-p-chico text-gris-400 lg:flex-row lg:gap-leyenda-gap"
  >
    <ul class="flex flex-wrap items-center justify-center gap-leyenda-gap">
      <li
        v-for="item in marked"
        :key="item.label"
        class="flex items-center gap-leyenda-item"
      >
        <span
          aria-hidden="true"
          :class="[
            'size-leyenda-punto shrink-0 rounded-full',
            item.kind === 'none' || item.kind === 'soon'
              ? ''
              : DOT_CLASSES[item.kind],
          ]"
        />
        {{ item.label }}
      </li>
      <li
        v-if="soonLabel"
        class="relative flex items-center gap-chip-gap rounded-pill bg-vidrio-fondo px-chip-x py-chip-y text-blanco borde-luz borde-linea lg:hidden"
      >
        <span
          aria-hidden="true"
          class="size-chip-punto shrink-0 rounded-full bg-acero-400"
        />
        {{ soonLabel }}
      </li>
    </ul>
    <p v-for="line in lines" :key="line.label">{{ line.label }}</p>
  </div>
</template>
