<script setup lang="ts">
import chevronDown from '@/assets/icons/chevron-down.svg?raw'

/**
 * SelectField — the `select` variant of `FormField`: same control recipe as
 * `TextField`, plus the `chevron-down` affordance
 * (`docs/business/landing/design-extract.md` § FormField).
 *
 * A native `<select>`, not a custom listbox: the seven-field form needs no
 * custom option rendering, and a native control keeps keyboard and
 * assistive-technology behaviour for free.
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
  /** The unselected placeholder option's label. */
  placeholder: string
  error?: string
  required?: boolean
  readonly?: boolean
}

const {
  id,
  label,
  modelValue,
  options,
  placeholder,
  error,
  required = false,
  readonly = false,
} = defineProps<Props>()

defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div class="flex flex-col gap-field-label-gap">
    <label :for="id" class="font-instrument text-form-label text-bone-300">{{
      label
    }}</label>
    <div class="relative">
      <select
        :id="id"
        :value="modelValue"
        :required="required"
        :disabled="readonly"
        :aria-invalid="Boolean(error)"
        :aria-describedby="error ? `${id}-error` : undefined"
        class="w-full appearance-none rounded-control border bg-glass-bone px-field-x py-field-y font-instrument text-input-value text-ink-100 focus-visible:outline-red-400"
        :class="error ? 'border-red-400' : 'border-glass-line'"
        @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      >
        <option value="" disabled hidden>{{ placeholder }}</option>
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
      <span
        aria-hidden="true"
        class="pointer-events-none absolute inset-y-0 end-field-x flex items-center text-bone-300"
        v-html="chevronDown"
      />
    </div>
    <p
      v-if="error"
      :id="`${id}-error`"
      class="font-instrument text-form-label text-red-400"
    >
      {{ error }}
    </p>
  </div>
</template>

<style scoped>
/*
 * `:deep()` is required: content injected by `v-html` is not rewritten by
 * Vue's scoped-style transform (`docs/business/rules.md` § R14).
 */
:deep(svg) {
  width: var(--spacing-field-icon);
  height: var(--spacing-field-icon);
}
</style>
