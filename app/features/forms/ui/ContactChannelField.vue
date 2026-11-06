<script setup lang="ts">
import { computed } from 'vue'
import type { ContactPreference } from '@/features/forms/data/contactFields'
import type {
  CountryCode,
  CountryOption,
} from '@/features/forms/data/countries'
import { toFieldOptions } from '@/features/forms/logic/selectOptions'
import SegmentedControl from './SegmentedControl.vue'
import WhatsappField from './WhatsappField.vue'

/**
 * ContactChannelField — the contact control of both forms (feature 45,
 * spec FR-019; pen extract-45 §§ 2, 4): the segmented Correo / WhatsApp
 * choice and, only while WhatsApp is chosen, the dial code and number.
 * One block, so the form can place it in step 1 or after its own fields
 * (research R2). Presentational: the parent owns the values.
 */
interface Props {
  preference: ContactPreference
  country: CountryCode
  number: string
  content: {
    contactPreference: {
      label: string
      options: Record<ContactPreference, string>
    }
    whatsapp: { label: string }
    whatsappCountry: { label: string; options: CountryOption[] }
  }
  errors?: { number?: string; country?: string }
  readonly?: boolean
}

const {
  preference,
  country,
  number,
  content,
  errors,
  readonly = false,
} = defineProps<Props>()

defineEmits<{
  'update:preference': [value: ContactPreference]
  'update:country': [code: CountryCode]
  'update:number': [value: string]
}>()

const options = computed(() =>
  toFieldOptions(content.contactPreference.options)
)
</script>

<template>
  <div
    class="flex flex-col gap-formulario-gap md:gap-formulario-gap-escritorio"
  >
    <SegmentedControl
      id="contactPreference"
      :label="content.contactPreference.label"
      :model-value="preference"
      :options="options"
      :readonly="readonly"
      @update:model-value="$emit('update:preference', $event as ContactPreference)"
    />
    <WhatsappField
      :visible="preference === 'whatsapp'"
      :model-value="number"
      :country="country"
      :content="content"
      :errors="errors"
      :readonly="readonly"
      @update:model-value="$emit('update:number', $event)"
      @update:country="$emit('update:country', $event)"
    />
  </div>
</template>
