<script setup lang="ts">
/**
 * TextField — the `text` / `email` / `tel` variants of `FormField`
 * (`docs/business/landing/design-extract.md` § FormField). Label above,
 * control below: fill `bg-glass-bone`, border `border-glass-line`, radius
 * `--radius-control`, padding `--spacing-field-y`/`-x` — all reused, already
 * generic tokens (`plan.md` § 5.1).
 *
 * Presentational only (Constitution Article V): no composable, no i18n. All
 * copy and the error message arrive already translated as props.
 */
export type TextFieldType = 'text' | 'email' | 'tel'

interface Props {
  id: string
  label: string
  modelValue: string
  type?: TextFieldType
  placeholder?: string
  /** Absent → no error state. */
  error?: string
  required?: boolean
  readonly?: boolean
}

const {
  id,
  label,
  modelValue,
  type = 'text',
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
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :readonly="readonly"
      :aria-invalid="Boolean(error)"
      :aria-describedby="error ? `${id}-error` : undefined"
      class="rounded-control border bg-glass-bone px-field-x py-field-y font-instrument text-input-value text-ink-100 focus-visible:outline-red-400"
      :class="error ? 'border-red-400' : 'border-glass-line'"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >
    <p
      v-if="error"
      :id="`${id}-error`"
      class="font-instrument text-form-label text-red-400"
    >
      {{ error }}
    </p>
  </div>
</template>
