<script setup lang="ts">
import { computed } from 'vue'
import FieldBlock from './FieldBlock.vue'
import {
  describedBy,
  LINE_CONTROL_CLASSES,
  strokeClasses,
} from './fieldAnatomy'

/**
 * TextField — a one-line v2 field (feature 45, pen extract-45 §§ 2, 4):
 * 46 / 50 tall, Carbón 800, the anatomy of `fieldAnatomy.ts`, the 1 px Red
 * muush stroke and help line when invalid (§ 3). Presentational.
 */
interface Props {
  id: string
  label: string
  modelValue: string
  type?: 'text' | 'email' | 'url' | 'tel'
  placeholder?: string
  error?: string
  required?: boolean
  readonly?: boolean
  autocomplete?: string
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
  autocomplete,
} = defineProps<Props>()

defineEmits<{ 'update:modelValue': [value: string] }>()

const controlClasses = computed(() => [
  LINE_CONTROL_CLASSES,
  strokeClasses(Boolean(error)),
])
</script>

<template>
  <FieldBlock :id="id" :label="label" :error="error">
    <input
      :id="id"
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :required="required"
      :readonly="readonly"
      :autocomplete="autocomplete"
      :aria-invalid="Boolean(error)"
      :aria-describedby="describedBy(id, error)"
      :class="controlClasses"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >
  </FieldBlock>
</template>
