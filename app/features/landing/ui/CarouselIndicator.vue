<script setup lang="ts">
/**
 * The services carousel indicator (feature 44, spec FR-016; pen extract-44
 * § 3.3): one mark per card, gap 6. The active mark is a 22 × 6 Red muush
 * 500 pill, the others 6 × 6 in Blanco 25 %, radius 3; the change animates
 * width and colour over `--medio` (0 under reduced motion).
 *
 * A visual aid only, hidden from assistive technology: every card is in
 * reading order already. Forced colours drop backgrounds, so the marks are
 * repainted in the text colour there; the active one stays wider.
 */
interface Props {
  count: number
  active: number
}

const { count, active } = defineProps<Props>()
</script>

<template>
  <div aria-hidden="true" class="flex gap-indicador-gap">
    <span
      v-for="index in count"
      :key="index"
      :data-activo="index - 1 === active || undefined"
      :class="[
        'h-indicador-punto rounded-indicador transition-[width,background-color] duration-(--medio) ease-muush motion-reduce:transition-none forced-colors:bg-[CanvasText]',
        index - 1 === active
          ? 'w-indicador-activo bg-red-muush-500'
          : 'w-indicador-punto bg-blanco-25',
      ]"
    />
  </div>
</template>
