<script setup lang="ts">
import { computed, onMounted, useTemplateRef } from 'vue'
import type { ContactFormContent } from '@/features/forms/data/contactFields'
import type { ContactSubmitter } from '@/features/forms/data/submissionContract'
import { fieldErrorMessage } from '@/features/forms/logic/fieldErrorMessage'
import { toFieldOptions } from '@/features/forms/logic/selectOptions'
import { useContactForm } from '@/features/forms/logic/useContactForm'
import BotonPrimario from '@/shared/ui/BotonPrimario.vue'
import FormOutcome from './FormOutcome.vue'
import HoneypotField from './HoneypotField.vue'
import RadioPillGroup from './RadioPillGroup.vue'
import SelectField from './SelectField.vue'
import TextareaField from './TextareaField.vue'
import TextField from './TextField.vue'
import WhatsappField from './WhatsappField.vue'

/**
 * ContactForm — the seven fields of `docs/business/landing/ui-map.md` § 7 and
 * the real submission flow of feature 029: idle → sending → success |
 * server-error | invalid.
 *
 * This component never touches the network (Constitution Article V, spec
 * FR-025). The page creates a `submitter` with `useContactSubmitter()` and
 * hands it down; stories and tests hand in a stub. `success` comes only from
 * the submitter's classified `ok` response (spec FR-012).
 *
 * `previewState` is a Storybook-only display override: it forces what is
 * shown, never what is sent. No page or section passes it
 * (`tests/forms-config.test.ts` asserts that).
 */
interface Props {
  content: ContactFormContent
  submitter: ContactSubmitter
  previewState?: 'sending' | 'success' | 'server-error'
}

const { content, submitter, previewState } = defineProps<Props>()

const challengeHost = useTemplateRef<HTMLElement>('challengeHost')

const {
  values,
  errors,
  state,
  honeypot,
  markInteractive,
  onEngage,
  onSubmit,
  onContactPreferenceChange,
  onWhatsappCountryChange,
} = useContactForm({ submitter, challengeHost })

onMounted(markInteractive)

const shownState = computed(() => previewState ?? state.value)
const readonly = computed(() => shownState.value === 'sending')

const identityOptions = computed(() =>
  toFieldOptions(content.fields.identity.options)
)
const contactPreferenceOptions = computed(() =>
  toFieldOptions(content.fields.contactPreference.options)
)

/** Error treatment appears only once a submit was attempted (`ui-map.md`
 * § 7: the idle form shows no errors at all). */
function errorFor(field: keyof typeof errors.value): string | undefined {
  if (state.value !== 'invalid') return undefined
  return fieldErrorMessage(errors.value[field], content.fields[field])
}
</script>

<template>
  <div
    class="rounded-panel-sm border border-glass-dark-line bg-glass-dark-contact p-glass-dark backdrop-blur-glass-dark"
  >
    <form
      v-if="shownState !== 'success'"
      novalidate
      class="flex flex-col gap-form-gap"
      :aria-busy="shownState === 'sending'"
      @submit="onSubmit"
      @focusin="onEngage"
    >
      <TextField
        id="name"
        v-model="values.name"
        :label="content.fields.name.label"
        :error="errorFor('name')"
        :readonly="readonly"
        required
      />
      <TextField
        id="email"
        v-model="values.email"
        type="email"
        :label="content.fields.email.label"
        :error="errorFor('email')"
        :readonly="readonly"
        required
      />
      <TextField
        id="company"
        v-model="values.company"
        :label="content.fields.company.label"
        :readonly="readonly"
      />
      <SelectField
        id="identity"
        v-model="values.identity"
        :label="content.fields.identity.label"
        :placeholder="content.fields.identity.label"
        :options="identityOptions"
        :error="errorFor('identity')"
        :readonly="readonly"
        required
      />
      <TextareaField
        id="need"
        v-model="values.need"
        :label="content.fields.need.label"
        :error="errorFor('need')"
        :readonly="readonly"
        required
      />
      <RadioPillGroup
        id="contactPreference"
        :model-value="values.contactPreference"
        :label="content.fields.contactPreference.label"
        :options="contactPreferenceOptions"
        :readonly="readonly"
        @update:model-value="onContactPreferenceChange($event as 'email' | 'whatsapp')"
      />
      <WhatsappField
        v-model="values.whatsapp"
        :country="values.whatsappCountry"
        :visible="values.contactPreference === 'whatsapp'"
        :content="content.fields"
        :errors="{ number: errorFor('whatsapp'), country: errorFor('whatsappCountry') }"
        :readonly="readonly"
        @update:country="onWhatsappCountryChange"
      />
      <HoneypotField v-model="honeypot" />

      <!--
        `width: 216` explicit at `lg`, `fill_container` below it (the `.pen`
        node `bTYw7`, feature 025), so both classes stay scoped to `lg:` and
        mobile keeps stretching to the form's width.
      -->
      <BotonPrimario
        variant="submit"
        type="submit"
        :disabled="readonly"
        class="lg:w-btn-submit-w lg:self-center"
      >
        {{ readonly ? content.sending : content.submit }}
      </BotonPrimario>
    </form>

    <FormOutcome
      v-if="shownState === 'success' || shownState === 'server-error'"
      :kind="shownState"
      :message="
        shownState === 'success'
          ? content.success.titleByChannel[values.contactPreference]
          : content.error.title
      "
      :error-fallback="content.error.fallback"
    />

    <!-- Turnstile's host: empty in the normal flow (Invisible key). Outside
         the form so the widget survives the form being replaced. -->
    <div ref="challengeHost" />
  </div>
</template>
