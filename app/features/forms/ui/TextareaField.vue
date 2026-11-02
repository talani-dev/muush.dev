<script setup lang="ts">
import { computed } from 'vue'
import FieldBlock from './FieldBlock.vue'
import {
  AREA_CONTROL_CLASSES,
  describedBy,
  strokeClasses,
} from './fieldAnatomy'

/**
 * TextareaField — "¿Qué necesitas?" (feature 45, pen extract-45 § 2): 96
 * tall, padding 14 / 16 (12 / 14 on mobile, the handoff's `.m1-campo
 * textarea`). Not resizable: the handoff allows a vertical resize, but the
 * `.pen` draws a fixed 96 box with no grip, and the `.pen` wins (R32);
 * longer text scrolls inside it. Presentational.
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

const controlClasses = computed(() => [
  AREA_CONTROL_CLASSES,
  'h-area-alto resize-none',
  strokeClasses(Boolean(error)),
])
</script>

<template>
  <FieldBlock :id="id" :label="label" :error="error">
    <textarea
      :id="id"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :readonly="readonly"
      :aria-invalid="Boolean(error)"
      :aria-describedby="describedBy(id, error)"
      :class="controlClasses"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
  </FieldBlock>
</template>
