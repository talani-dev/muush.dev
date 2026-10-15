<script setup lang="ts">
import { computed } from 'vue'
import chevronDown from '@/assets/icons/chevron-down.svg?raw'
import type {
  CountryCode,
  CountryOption,
} from '@/features/forms/data/countries'

/**
 * DialCodeSelect — the country/dial-code selector in front of the WhatsApp
 * number (feature 32, contracts/whatsapp-field-ui.md).
 *
 * A native `<select>`, not a custom combobox (spec OA-6, approved
 * 2026-10-14): keyboard, type-to-jump, the screen-reader role/value/change
 * announcement and the mobile picker all come from the browser — the same
 * reasoning as `SelectField` and feature 20's "Área y rol" (research R6).
 *
 * The select is stretched over a face showing only `{flag} {dialCode}` and
 * the chevron, and made fully transparent: color emoji ignore
 * `color: transparent`, so `opacity: 0` is the only way to hide its own
 * text. Every click and key still lands on the select; the face is
 * `aria-hidden` and draws the select's focus ring (`<style>` below).
 *
 * Every visual class here is reused from `TextField`/`SelectField` and is
 * UNVERIFIED against the `.pen` (spec OA-10): no frame for this control had
 * been extracted when it was built.
 */
interface Props {
  id: string
  modelValue: CountryCode
  /** Already localized and sorted (`logic/countryOptions.ts`). */
  options: CountryOption[]
  /** Accessible name — the visible label belongs to the number input. */
  label: string
  /** Absent → no error state. */
  error?: string
  /** Id of the rendered error message, for `aria-describedby`. */
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
      class="dial-select absolute inset-0 size-full cursor-pointer appearance-none opacity-0 disabled:cursor-default"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-for="option in options" :key="option.code" :value="option.code">
        {{ option.flag }} {{ option.name }} ({{ option.dialCode }})
      </option>
    </select>
    <span
      aria-hidden="true"
      class="dial-face pointer-events-none flex items-center gap-field-label-gap rounded-control border bg-glass-bone px-field-x py-field-y font-instrument text-input-value text-ink-100"
      :class="error ? 'border-red-400' : 'border-glass-line'"
    >
      <span>{{ selected?.flag }} {{ selected?.dialCode }}</span>
      <span class="flex text-bone-300" v-html="chevronDown" />
    </span>
  </div>
</template>

<style scoped>
/*
 * The invisible select's focus ring, drawn on the face: the same `auto` ring
 * in red-400 the other controls get from `focus-visible:outline-red-400`
 * (`ui-map.md` § 10). Tailwind has no `outline-style: auto` utility.
 */
.dial-select:focus-visible + .dial-face {
  outline: auto;
  outline-color: var(--color-red-400);
}

/* `:deep()`: `v-html` content is not rewritten by the scoped transform
   (`docs/business/rules.md` § R14). Same size as `SelectField`'s chevron. */
:deep(svg) {
  width: var(--spacing-field-icon);
  height: var(--spacing-field-icon);
}
</style>
