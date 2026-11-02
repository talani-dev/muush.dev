<script setup lang="ts">
import { computed } from 'vue'
import chevronDown from '@/assets/icons/chevron-down.svg?raw'
import FieldBlock from './FieldBlock.vue'
import {
  describedBy,
  LINE_CONTROL_CLASSES,
  strokeClasses,
} from './fieldAnatomy'

/**
 * SelectField — a v2 select (feature 45, spec FR-021; pen extract-45 § 2):
 * the one-line anatomy plus the lucide `chevron-down` at 16 px in Gris 400.
 *
 * Native `<select>`, as since features 16 / 20: keyboard, Esc, type-ahead,
 * the screen-reader announcement and the mobile picker are the browser's.
 * Flat `options` or `groups` (`<optgroup>`, "Área y rol"). The placeholder is
 * a hidden, disabled empty option, so the empty value shows it and can never
 * be picked again. Presentational.
 */
interface Option {
  value: string
  label: string
}

interface OptionGroup {
  label: string
  options: Option[]
}

interface Props {
  id: string
  label: string
  modelValue: string
  placeholder: string
  options?: Option[]
  groups?: OptionGroup[]
  error?: string
  required?: boolean
  readonly?: boolean
}

const {
  id,
  label,
  modelValue,
  placeholder,
  options,
  groups,
  error,
  required = false,
  readonly = false,
} = defineProps<Props>()

defineEmits<{ 'update:modelValue': [value: string] }>()

const controlClasses = computed(() => [
  LINE_CONTROL_CLASSES,
  'cursor-pointer appearance-none pe-select-fin *:bg-carbon-800 *:text-blanco',
  modelValue === '' ? 'text-texto-tenue md:text-gris-400' : '',
  strokeClasses(Boolean(error)),
])
</script>

<template>
  <FieldBlock :id="id" :label="label" :error="error">
    <div class="relative">
      <select
        :id="id"
        :value="modelValue"
        :required="required"
        :disabled="readonly"
        :aria-invalid="Boolean(error)"
        :aria-describedby="describedBy(id, error)"
        :class="controlClasses"
        @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      >
        <option value="" disabled hidden>{{ placeholder }}</option>
        <template v-if="groups">
          <optgroup
            v-for="group in groups"
            :key="group.label"
            :label="group.label"
          >
            <option
              v-for="option in group.options"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </optgroup>
        </template>
        <template v-else>
          <option
            v-for="option in options"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </template>
      </select>
      <span
        aria-hidden="true"
        class="pointer-events-none absolute inset-y-0 end-campo-x flex items-center text-gris-400 md:end-campo-x-escritorio"
      >
        <span class="icono size-campo-icono" v-html="chevronDown" />
      </span>
    </div>
  </FieldBlock>
</template>

<style scoped>
/* `:deep()`: Vue's scoped transform does not reach `v-html` content
   (app/assets/icons/README.md). The wrapper's `size-campo-icono` (16 px,
   pen extract-45 § 2) decides the size; the glyph fills it. */
.icono :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
