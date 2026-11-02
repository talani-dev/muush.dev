<script setup lang="ts">
import { computed } from 'vue'
import type {
  CountryCode,
  CountryOption,
} from '@/features/forms/data/countries'
import DialCodeSelect from './DialCodeSelect.vue'
import FieldBlock from './FieldBlock.vue'
import {
  describedBy,
  HELP_CLASSES,
  LINE_CONTROL_CLASSES,
  strokeClasses,
} from './fieldAnatomy'

/**
 * WhatsappField — the conditional WhatsApp number in the v2 anatomy
 * (feature 45, spec FR-019): the dial-code control and the number on one
 * row, gap 7 / 8 (the field block gap; the `.pen` draws no v2 frame for
 * it). Label "Número de WhatsApp"; the dial code's error above the
 * number's, as since feature 32.
 *
 * It mounts and unmounts with a height + opacity transition (`ui-map.md`
 * § 7), timed by `--medio`, which is zeroed under reduced motion; the
 * `<style>` also drops the transition there (spec US5-6). Visibility is the
 * parent's decision (`visible`). Presentational.
 */
interface Props {
  visible: boolean
  /** The national number, as typed. */
  modelValue: string
  country: CountryCode
  content: {
    whatsapp: { label: string }
    whatsappCountry: { label: string; options: CountryOption[] }
  }
  errors?: { number?: string; country?: string }
  readonly?: boolean
}

const {
  visible,
  modelValue,
  country,
  content,
  errors,
  readonly = false,
} = defineProps<Props>()

defineEmits<{
  'update:modelValue': [value: string]
  'update:country': [code: CountryCode]
}>()

const COUNTRY_ERROR_ID = 'whatsappCountry-error'

const numberClasses = computed(() => [
  LINE_CONTROL_CLASSES,
  strokeClasses(Boolean(errors?.number)),
])
</script>

<template>
  <Transition name="whatsapp">
    <FieldBlock
      v-if="visible"
      id="whatsapp"
      :label="content.whatsapp.label"
      :error="errors?.number"
    >
      <div class="flex gap-campo-gap md:gap-campo-gap-escritorio">
        <DialCodeSelect
          id="whatsappCountry"
          :model-value="country"
          :options="content.whatsappCountry.options"
          :label="content.whatsappCountry.label"
          :error="errors?.country"
          :error-id="COUNTRY_ERROR_ID"
          :readonly="readonly"
          @update:model-value="$emit('update:country', $event)"
        />
        <input
          id="whatsapp"
          :value="modelValue"
          type="tel"
          autocomplete="tel-national"
          required
          :readonly="readonly"
          :aria-invalid="Boolean(errors?.number)"
          :aria-describedby="describedBy('whatsapp', errors?.number)"
          :class="numberClasses"
          @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        >
      </div>
      <p v-if="errors?.country" :id="COUNTRY_ERROR_ID" :class="HELP_CLASSES">
        {{ errors.country }}
      </p>
    </FieldBlock>
  </Transition>
</template>

<style scoped>
/* `max-height`, not `height`: the help lines vary the open height. */
.whatsapp-enter-active,
.whatsapp-leave-active {
  overflow: clip;
  transition:
    max-height var(--medio) var(--ease),
    opacity var(--medio) var(--ease);
}

.whatsapp-enter-from,
.whatsapp-leave-to {
  max-height: 0;
  opacity: 0;
}

.whatsapp-enter-to,
.whatsapp-leave-from {
  max-height: var(--whatsapp-alto);
  opacity: 1;
}

/* Dropped, not shortened: the field still mounts and unmounts at once. */
@media (prefers-reduced-motion: reduce) {
  .whatsapp-enter-active,
  .whatsapp-leave-active {
    transition: none;
  }
}
</style>
