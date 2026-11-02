<script setup lang="ts">
import { computed, onMounted, useTemplateRef } from 'vue'
import type {
  ContactFieldId,
  ContactFormContent,
  ContactFormValues,
} from '@/features/forms/data/contactFields'
import {
  CONTACT_STEP_FIELDS,
  type FormStep,
} from '@/features/forms/data/formSteps'
import type { ContactSubmitter } from '@/features/forms/data/submissionContract'
import { toFieldOptions } from '@/features/forms/logic/selectOptions'
import { useConsentGate } from '@/features/forms/logic/useConsentGate'
import { useContactForm } from '@/features/forms/logic/useContactForm'
import { useFormSteps } from '@/features/forms/logic/useFormSteps'
import { useFormView } from '@/features/forms/logic/useFormView'
import ContactChannelField from './ContactChannelField.vue'
import NameEmailRow from './NameEmailRow.vue'
import SelectField from './SelectField.vue'
import SendNotice from './SendNotice.vue'
import SteppedForm from './SteppedForm.vue'
import TextareaField from './TextareaField.vue'
import TextField from './TextField.vue'

/**
 * ContactForm — the v2 diagnóstico form (feature 45, US1–US3; pen
 * extract-45 §§ 2–4): Nombre | Correo, Empresa o proyecto | ¿Cómo te
 * identificas?, ¿Qué necesitas?, the contact channel, the privacy consent and
 * "Quiero mi diagnóstico", in the shared `SteppedForm` (two steps below
 * 768 px). No website field (Roberto 2026-10-31).
 *
 * The logic is the existing `useContactForm` (validation, Turnstile, spam
 * guard, server marks, dial code), unchanged; `useFormSteps` adds the steps,
 * `useConsentGate` blocks every submit path until the box is ticked (FR-009)
 * and `useFormView` derives what is shown. Consent is never a form value, so
 * it never reaches the payload. The page passes the `submitter`.
 *
 * `previewState` / `previewStep` / `initial` are Storybook-only display
 * aids; no page or section passes them (`tests/forms-config.test.ts`).
 */
interface Props {
  content: ContactFormContent
  submitter: ContactSubmitter
  previewState?: 'invalid' | 'sending' | 'server-error' | 'success'
  previewStep?: FormStep
  initial?: Partial<ContactFormValues>
}

const props = defineProps<Props>()

const shell = useTemplateRef<InstanceType<typeof SteppedForm>>('shell')
const panel = computed(() => (shell.value?.$el as HTMLElement | null) ?? null)
const challengeHost = computed(() => shell.value?.challengeHost ?? null)

const steps = useFormSteps({ stepFields: CONTACT_STEP_FIELDS, panel })
const form = useContactForm({
  submitter: props.submitter,
  challengeHost,
  initial: props.initial,
  revealField: steps.revealField,
})
const { values, errors, honeypot } = form
const { accepted, guard } = useConsentGate()
const onGuardedSubmit = guard(form.onSubmit)
const { isStepped, goBack } = steps
const {
  shownState,
  shownStep,
  shownAccepted,
  busy,
  labelKey,
  noticeKind,
  errorFor,
} = useFormView<ContactFieldId>({
  ...steps,
  state: form.state,
  accepted,
  errors,
  stepFields: CONTACT_STEP_FIELDS,
  fieldContent: () => props.content.fields,
  previewState: () => props.previewState,
  previewStep: () => props.previewStep,
})

onMounted(form.markInteractive)

/* Contact never uploads, so its label is one of the other three. */
const submitLabel = computed(() =>
  labelKey.value === 'uploading'
    ? props.content.sending
    : props.content[labelKey.value]
)
const identityOptions = computed(() =>
  toFieldOptions(props.content.fields.identity.options)
)
</script>

<template>
  <SteppedForm
    ref="shell"
    v-model:honeypot="honeypot"
    :chrome="content"
    :is-stepped="isStepped"
    :step="shownStep"
    :accepted="shownAccepted"
    :submit-label="submitLabel"
    :busy="busy"
    :success="shownState === 'success' ? content.success : undefined"
    @update:accepted="accepted = $event"
    @submit="onGuardedSubmit"
    @continue="steps.goNext(errors)"
    @back="goBack"
    @engage="form.onEngage"
  >
    <template #details>
      <NameEmailRow
        v-model:name="values.name"
        v-model:email="values.email"
        :content="content.fields"
        :errors="{ name: errorFor('name'), email: errorFor('email') }"
        :readonly="busy"
      />
    </template>
    <template #profile>
      <div class="grid gap-formulario-fila @lg:grid-cols-2">
        <TextField
          id="company"
          v-model="values.company"
          autocomplete="organization"
          :label="content.fields.company.label"
          :placeholder="content.fields.company.placeholder"
          :readonly="busy"
        />
        <SelectField
          id="identity"
          v-model="values.identity"
          :label="content.fields.identity.label"
          :placeholder="content.fields.identity.placeholder"
          :options="identityOptions"
          :error="errorFor('identity')"
          :readonly="busy"
          required
        />
      </div>
      <TextareaField
        id="need"
        v-model="values.need"
        :label="content.fields.need.label"
        :placeholder="content.fields.need.placeholder"
        :error="errorFor('need')"
        :readonly="busy"
        required
      />
    </template>
    <template #channel>
      <ContactChannelField
        :preference="values.contactPreference"
        :country="values.whatsappCountry"
        :number="values.whatsapp"
        :content="content.fields"
        :errors="{ number: errorFor('whatsapp'), country: errorFor('whatsappCountry') }"
        :readonly="busy"
        @update:preference="form.onContactPreferenceChange"
        @update:country="form.onWhatsappCountryChange"
        @update:number="values.whatsapp = $event"
      />
    </template>
    <template v-if="noticeKind" #notice>
      <SendNotice :kind="noticeKind" :error="content.error" />
    </template>
  </SteppedForm>
</template>
