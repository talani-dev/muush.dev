<script setup lang="ts">
/**
 * TextareaField — the `textarea` variant of `FormField`: fixed height 92,
 * value in `ink-200` rather than `ink-100`, per
 * `docs/business/landing/design-extract.md` § FormField.
 */
interface Props {
  id: string
  label: string
  modelValue: string
  placeholder?: string
  error?: string
  required?: boolean
  readonly?: boolean
}

const {
  id,
  label,
  modelValue,
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
    <textarea
      :id="id"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :readonly="readonly"
      :aria-invalid="Boolean(error)"
      :aria-describedby="error ? `${id}-error` : undefined"
      class="h-contact-textarea-h resize-none rounded-control border bg-glass-bone px-field-x py-field-y font-instrument text-input-value text-ink-200 focus-visible:outline-red-400"
      :class="error ? 'border-red-400' : 'border-glass-line'"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
    <p
      v-if="error"
      :id="`${id}-error`"
      class="font-instrument text-form-label text-red-400"
    >
      {{ error }}
    </p>
  </div>
</template>
