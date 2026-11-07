<script setup lang="ts">
import { computed, onMounted, useTemplateRef } from 'vue'
import {
  type ApplicationFieldId,
  type ApplicationFormContent,
  type ApplicationFormValues,
  CV_REQUIRED,
} from '@/features/forms/data/applicationFields'
import {
  APPLICATION_STEP_FIELDS,
  type FormStep,
} from '@/features/forms/data/formSteps'
import type { ApplicationSubmitter } from '@/features/forms/data/submissionContract'
import { toAreaRoleGroups } from '@/features/forms/logic/selectOptions'
import { useApplicationForm } from '@/features/forms/logic/useApplicationForm'
import { useConsentGate } from '@/features/forms/logic/useConsentGate'
import { useFormSteps } from '@/features/forms/logic/useFormSteps'
import type { SubmitState } from '@/features/forms/logic/useFormSubmitState'
import { useFormView } from '@/features/forms/logic/useFormView'
import ContactChannelField from './ContactChannelField.vue'
import CvField from './CvField.vue'
import NameEmailRow from './NameEmailRow.vue'
import SelectField from './SelectField.vue'
import SendNotice from './SendNotice.vue'
import SteppedForm from './SteppedForm.vue'
import TextField from './TextField.vue'

/**
 * ApplicationForm — the v2 application form (feature 45, US4; pen
 * extract-45 § 5) in the shared `SteppedForm` ("Tu perfil" below 768 px).
 * The logic is the existing `useApplicationForm`, unchanged (CV upload
 * order, no silent CV loss, feature 031); a failed upload shows
 * `SendNotice` and the submit retries with the same file (Clarifications
 * Q2). Consent gates every submit path and is never sent. `previewState`,
 * `previewStep` and `initial` are Storybook-only.
 */
interface Props {
  content: ApplicationFormContent
  submitter: ApplicationSubmitter
  previewState?: Exclude<SubmitState, 'idle'>
  previewStep?: FormStep
  initial?: Partial<ApplicationFormValues>
}

const props = defineProps<Props>()

const shell = useTemplateRef<InstanceType<typeof SteppedForm>>('shell')
const panel = computed(() => (shell.value?.$el as HTMLElement | null) ?? null)
const challengeHost = computed(() => shell.value?.challengeHost ?? null)

const steps = useFormSteps({
  formId: 'application',
  stepFields: APPLICATION_STEP_FIELDS,
  panel,
})
const form = useApplicationForm({
  submitter: props.submitter,
  challengeHost,
  initial: props.initial,
  revealField: steps.revealField,
})
const { values, errors, cvRejection, honeypot } = form
const { accepted, guard } = useConsentGate()
const onGuardedSubmit = guard(form.onSubmit)
/* "Enviar sin CV" sends too, so it passes the same gate (FR-009). */
const onGuardedSubmitWithoutCv = guard(() => form.onSubmitWithoutCv())
const { isStepped, goBack } = steps
const {
  shownState,
  shownStep,
  shownAccepted,
  busy,
  labelKey,
  noticeKind,
  errorFor,
} = useFormView<ApplicationFieldId>({
  ...steps,
  state: form.state,
  accepted,
  errors,
  stepFields: APPLICATION_STEP_FIELDS,
  fieldContent: () => props.content.fields,
  previewState: () => props.previewState,
  previewStep: () => props.previewStep,
})

onMounted(form.markInteractive)

const areaRoleGroups = computed(() =>
  toAreaRoleGroups(props.content.fields.areaRole)
)
/* A refused file's message shows at once (feature 031 FR-013). */
const CV_REJECTION_KEY = { format: 'errorFormat', size: 'errorSize' } as const
const cvError = computed(() =>
  cvRejection.value
    ? props.content.fields.cv[CV_REJECTION_KEY[cvRejection.value]]
    : errorFor('cv')
)
</script>

<template>
  <SteppedForm
    ref="shell"
    data-track-form="application"
    v-model:honeypot="honeypot"
    :chrome="content"
    :is-stepped="isStepped"
    :step="shownStep"
    :accepted="shownAccepted"
    :submit-label="content[labelKey]"
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
          id="portfolio"
          v-model="values.portfolio"
          type="url"
          :label="content.fields.portfolio.label"
          :placeholder="content.fields.portfolio.placeholder"
          :error="errorFor('portfolio')"
          :readonly="busy"
        />
        <SelectField
          id="areaRole"
          v-model="values.areaRole"
          :label="content.fields.areaRole.label"
          :placeholder="content.fields.areaRole.placeholder"
          :groups="areaRoleGroups"
          :error="errorFor('areaRole')"
          :readonly="busy"
          required
        />
      </div>
      <TextField
        id="linkedin"
        v-model="values.linkedin"
        type="url"
        :label="content.fields.linkedin.label"
        :placeholder="content.fields.linkedin.placeholder"
        :error="errorFor('linkedin')"
        :readonly="busy"
      />
      <CvField
        id="cv"
        :model-value="values.cv"
        :label="content.fields.cv.label"
        :placeholder="content.fields.cv.placeholder"
        :error="cvError"
        :required="CV_REQUIRED"
        :readonly="busy"
        @update:model-value="form.onCvChange"
        @reject="form.onCvReject"
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
      <SendNotice
        :kind="noticeKind"
        :error="content.error"
        :cv-upload-error="content.cvUploadError"
        @submit-without-cv="onGuardedSubmitWithoutCv"
      />
    </template>
  </SteppedForm>
</template>
