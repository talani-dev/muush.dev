<script setup lang="ts">
import { LABEL_CLASSES } from './fieldAnatomy'

/**
 * SegmentedControl — "¿Cómo prefieres que te contactemos?" (feature 45,
 * spec FR-001, US5; pen extract-45 §§ 2, 4, 8).
 *
 * A radio group made of native radios, visually hidden inside their
 * labels: one Tab stop, the arrow keys move and select, the selected
 * option is announced, all by the browser (spec US5-2). The group is named
 * by the visible label.
 *
 * - Mobile: Carbón 800, radius 12, padding and gap 4; the selected option
 *   Blanco 10 %, radius 9, padding 8 / 14, 13 / 600 Blanco; no dot (§ 8).
 * - Desktop (`md`): a Carbón 800 pill with a flat Blanco 10 % edge,
 *   padding 5, gap 6; options 9 / 20, 14 px; the selected one Carbón 700,
 *   600 Blanco, with a 6 px Red muush dot; the others 500 Gris 400.
 *
 * The keyboard ring is drawn on the option whose radio has focus (`<style>`
 * below). Presentational.
 */
interface Option {
  value: string
  label: string
}

interface Props {
  id: string
  label: string
  modelValue: string
  options: Option[]
  readonly?: boolean
}

const {
  id,
  label,
  modelValue,
  options,
  readonly = false,
} = defineProps<Props>()

defineEmits<{ 'update:modelValue': [value: string] }>()

const OPTION_CLASSES =
  'segmento relative inline-flex cursor-pointer items-center gap-segmento-punto-gap rounded-pestana px-segmento-x py-segmento-y font-texto text-segmento font-semibold transition-colors duration-(--rapido) ease-muush md:rounded-pill md:px-segmento-x-escritorio md:py-segmento-y-escritorio md:text-segmento-escritorio'
const SELECTED_CLASSES = 'bg-blanco-10 text-blanco md:bg-carbon-700'
const UNSELECTED_CLASSES = 'text-gris-400 md:font-medium'
</script>

<template>
  <div class="flex min-w-0 flex-col gap-campo-gap md:gap-campo-gap-escritorio">
    <span :id="`${id}-label`" :class="LABEL_CLASSES">{{ label }}</span>
    <div
      :id="id"
      role="radiogroup"
      :aria-labelledby="`${id}-label`"
      class="relative inline-flex self-start gap-segmento-gap rounded-campo bg-carbon-800 p-segmento-caja md:gap-segmento-gap-escritorio md:rounded-pill md:p-segmento-caja-escritorio md:borde-luz md:borde-plano"
    >
      <label
        v-for="option in options"
        :key="option.value"
        :class="[
          OPTION_CLASSES,
          option.value === modelValue ? SELECTED_CLASSES : UNSELECTED_CLASSES,
        ]"
      >
        <input
          type="radio"
          class="sr-only"
          :name="id"
          :value="option.value"
          :checked="option.value === modelValue"
          :disabled="readonly"
          @change="$emit('update:modelValue', option.value)"
        >
        <span
          v-if="option.value === modelValue"
          aria-hidden="true"
          data-punto
          class="hidden size-punto-activo shrink-0 rounded-full bg-red-muush-500 md:block"
        />
        {{ option.label }}
      </label>
    </div>
  </div>
</template>

<style scoped>
/* The keyboard ring of the shared controls (`foco`: 2 px Blanco, 3 px
   away), drawn on the option, since its radio is visually hidden. */
.segmento:has(:focus-visible) {
  outline: var(--foco-ancho) solid var(--blanco);
  outline-offset: var(--foco-separacion);
}
</style>
