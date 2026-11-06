<script setup lang="ts">
import { computed } from 'vue'
import chevronDown from '@/assets/icons/chevron-down.svg?raw'
import type {
  CountryCode,
  CountryOption,
} from '@/features/forms/data/countries'
import { LINE_CONTROL_CLASSES, strokeClasses } from './fieldAnatomy'

/**
 * DialCodeSelect — the WhatsApp dial-code selector in the v2 anatomy
 * (feature 45, spec FR-019; feature 32's mechanism unchanged).
 *
 * A native `<select>` stretched over a face showing `{flag} {dialCode}` and
 * the 16 px chevron, made fully transparent (color emoji ignore
 * `color: transparent`, so `opacity: 0` is the only way to hide its own
 * text). Every click and key lands on the select; the face is
 * `aria-hidden` and draws the select's focus ring (`<style>` below). The
 * `.pen` draws no v2 frame for it, so it takes the field anatomy (pen
 * extract-45 § 2). Presentational.
 */
interface Props {
  id: string
  modelValue: CountryCode
  options: CountryOption[]
  /** Accessible name; the visible label belongs to the number. */
  label: string
  error?: string
  /** Id of the rendered error, for `aria-describedby`. */
  errorId?: string
  readonly?: boolean
}

const {
  id,
  modelValue,
  options,
  label,
  error,
  errorId,
  readonly = false,
} = defineProps<Props>()

defineEmits<{ 'update:modelValue': [code: CountryCode] }>()

const selected = computed(() =>
  options.find(option => option.code === modelValue)
)
const faceClasses = computed(() => [
  LINE_CONTROL_CLASSES,
  'cara pointer-events-none flex w-auto items-center gap-campo-gap md:gap-campo-gap-escritorio',
  strokeClasses(Boolean(error)),
])
</script>

<template>
  <div class="relative flex shrink-0">
    <select
      :id="id"
      :value="modelValue"
      :aria-label="label"
      :aria-invalid="Boolean(error)"
      :aria-describedby="error ? errorId : undefined"
      :disabled="readonly"
      class="selector absolute inset-0 size-full cursor-pointer appearance-none opacity-0"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-for="option in options" :key="option.code" :value="option.code">
        {{ option.flag }} {{ option.name }} ({{ option.dialCode }})
      </option>
    </select>
    <span aria-hidden="true" :class="faceClasses">
      <span class="whitespace-nowrap"
        >{{ selected?.flag }} {{ selected?.dialCode }}</span
      >
      <span class="icono size-campo-icono text-gris-400" v-html="chevronDown" />
    </span>
  </div>
</template>

<style scoped>
/* The invisible select's keyboard ring, drawn on the face (`foco`). */
.selector:focus-visible + .cara {
  outline: var(--foco-ancho) solid var(--blanco);
  outline-offset: var(--foco-separacion);
}

/* `:deep()`: Vue's scoped transform does not reach `v-html` content. */
.icono :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
