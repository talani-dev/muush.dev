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
 *
 * Optional `leading` slot (feature 32): a control placed before the input on
 * the same row, with the field's own label gap as the horizontal gap, and
 * `leading-error` for that control's message. The label still targets the
 * input. Without the slots the layout is unchanged. Row layout UNVERIFIED
 * against the `.pen` (feature 32 spec OA-10).
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
    <!-- `contents` without the slot: the wrapper generates no box, so the
         layout is exactly the label → input column it was before. -->
    <div :class="$slots.leading ? 'flex gap-field-label-gap' : 'contents'">
      <slot name="leading" />
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
        :class="[
          error ? 'border-red-400' : 'border-glass-line',
          { 'min-w-0 flex-1': $slots.leading },
        ]"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      >
    </div>
    <!-- The leading control's own error: under the row, before the input's. -->
    <slot name="leading-error" />
    <p
      v-if="error"
      :id="`${id}-error`"
      class="font-instrument text-form-label text-red-400"
    >
      {{ error }}
    </p>
  </div>
</template>
