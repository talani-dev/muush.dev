<script setup lang="ts">
import type {
  CountryCode,
  CountryOption,
} from '@/features/forms/data/countries'
import DialCodeSelect from './DialCodeSelect.vue'
import TextField from './TextField.vue'

/**
 * WhatsappField — the conditional WhatsApp number field and its mount/unmount
 * transition (`ui-map.md` § 7: "transición de alto y opacidad"), shared by
 * `ContactForm.vue` and `ApplicationForm.vue`.
 *
 * Extracted from `ApplicationForm.vue` in feature 20 and, in feature 029, made
 * the one copy both forms use: the reason it was not shared before
 * (`ContactForm.vue` was out of scope then) no longer holds, and keeping two
 * identical copies of the markup and its transition CSS would violate
 * Article VIII's DRY rule as well as push `ContactForm.vue` past Article V's
 * 200 lines.
 *
 * Feature 32 puts the dial-code selector in front of the number, on the same
 * row, with its own error under the row before the number's. `content` and
 * `errors` are one prop each so the forms' call sites stay short
 * (`ApplicationForm.vue` sits at the 200-line limit, research R9).
 *
 * Visibility is the parent's decision (`values.contactPreference ===
 * 'whatsapp'`), passed in as `visible`, so this stays a plain presentational
 * field like every other one in `forms/ui/` (Constitution Article V).
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
  /** Already translated. */
  errors?: { number?: string; country?: string }
  readonly?: boolean
}

defineProps<Props>()
defineEmits<{
  'update:modelValue': [value: string]
  'update:country': [code: CountryCode]
}>()

const COUNTRY_ERROR_ID = 'whatsappCountry-error'
</script>

<template>
  <Transition name="whatsapp-field">
    <TextField
      v-if="visible"
      id="whatsapp"
      :model-value="modelValue"
      type="tel"
      :label="content.whatsapp.label"
      :error="errors?.number"
      :readonly="readonly"
      required
      @update:model-value="$emit('update:modelValue', $event)"
    >
      <template #leading>
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
      </template>
      <template v-if="errors?.country" #leading-error>
        <p
          :id="COUNTRY_ERROR_ID"
          class="font-instrument text-form-label text-red-400"
        >
          {{ errors.country }}
        </p>
      </template>
    </TextField>
  </Transition>
</template>

<style scoped>
/*
 * The tokens keep their `contact-` names from feature 16, where they were
 * measured; both forms' field markup is identical, so one height estimate
 * serves both. `max-height`, not `height`: the error message varies its own
 * height.
 */
.whatsapp-field-enter-active,
.whatsapp-field-leave-active {
  overflow: clip;
  transition:
    max-height var(--duration-contact-whatsapp-toggle) ease,
    opacity var(--duration-contact-whatsapp-toggle) ease;
}

.whatsapp-field-enter-from,
.whatsapp-field-leave-to {
  max-height: 0;
  opacity: 0;
}

.whatsapp-field-enter-to,
.whatsapp-field-leave-from {
  max-height: var(--spacing-contact-whatsapp-h);
  opacity: 1;
}

/* Dropped, not shortened: the field still mounts/unmounts, only the animated
   step is removed (`findings.md` § R53 discipline). */
@media (prefers-reduced-motion: reduce) {
  .whatsapp-field-enter-active,
  .whatsapp-field-leave-active {
    transition: none;
  }
}
</style>
