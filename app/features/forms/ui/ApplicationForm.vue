<script setup lang="ts">
import { computed, onMounted, useTemplateRef } from 'vue'
import {
  type ApplicationFormContent,
  CV_REQUIRED,
} from '@/features/forms/data/applicationFields'
import type { ApplicationSubmitter } from '@/features/forms/data/submissionContract'
import { fieldErrorMessage } from '@/features/forms/logic/fieldErrorMessage'
import {
  toAreaRoleGroups,
  toFieldOptions,
} from '@/features/forms/logic/selectOptions'
import { useApplicationForm } from '@/features/forms/logic/useApplicationForm'
import BotonPrimario from '@/shared/ui/BotonPrimario.vue'
import FileField from './FileField.vue'
import FormOutcome from './FormOutcome.vue'
import HoneypotField from './HoneypotField.vue'
import RadioPillGroup from './RadioPillGroup.vue'
import SelectField from './SelectField.vue'
import TextField from './TextField.vue'
import WhatsappField from './WhatsappField.vue'

/**
 * ApplicationForm — the eight fields of `docs/business/landing/ui-map.md`
 * § 9 and the real submission flow of feature 029, including the optional
 * CV upload. Same seam as `ContactForm.vue`: the page creates the
 * `submitter` (`useApplicationSubmitter()`), this component never touches the
 * network (Article V, spec FR-025), and `previewState` is a Storybook-only
 * display override no page or section passes.
 *
 * "Área y rol" values are qualified `${area}:${roleId}` because `sales` is
 * both an area and a role; the payload builder converts them to the bare
 * role id the API accepts (research R7).
 */
interface Props {
  content: ApplicationFormContent
  submitter: ApplicationSubmitter
  previewState?: 'sending' | 'success' | 'server-error'
}

const { content, submitter, previewState } = defineProps<Props>()

const challengeHost = useTemplateRef<HTMLElement>('challengeHost')

const {
  values,
  errors,
  state,
  cvNoteVisible,
  honeypot,
  markInteractive,
  onEngage,
  onSubmit,
  onContactPreferenceChange,
  onCvChange,
} = useApplicationForm({ submitter, challengeHost })

onMounted(markInteractive)

const shownState = computed(() => previewState ?? state.value)
const readonly = computed(() => shownState.value === 'sending')

const contactPreferenceOptions = computed(() =>
  toFieldOptions(content.fields.contactPreference.options)
)
const areaRoleGroups = computed(() => toAreaRoleGroups(content.fields.areaRole))

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
      <SelectField
        id="areaRole"
        v-model="values.areaRole"
        :label="content.fields.areaRole.label"
        :placeholder="content.fields.areaRole.placeholder"
        :groups="areaRoleGroups"
        :error="errorFor('areaRole')"
        :readonly="readonly"
        required
      />
      <TextField
        id="portfolio"
        v-model="values.portfolio"
        :label="content.fields.portfolio.label"
        :placeholder="content.fields.portfolio.placeholder"
        :error="errorFor('portfolio')"
        :readonly="readonly"
      />
      <TextField
        id="linkedin"
        v-model="values.linkedin"
        :label="content.fields.linkedin.label"
        :placeholder="content.fields.linkedin.placeholder"
        :error="errorFor('linkedin')"
        :readonly="readonly"
      />
      <FileField
        id="cv"
        :model-value="values.cv"
        :label="content.fields.cv.label"
        :placeholder="content.fields.cv.placeholder"
        :error="errorFor('cv')"
        :readonly="readonly"
        :required="CV_REQUIRED"
        @update:model-value="onCvChange"
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
        :visible="values.contactPreference === 'whatsapp'"
        :label="content.fields.whatsapp.label"
        :error="errorFor('whatsapp')"
        :readonly="readonly"
      />
      <HoneypotField v-model="honeypot" />

      <!-- Same `lg:`-scoped width and centring as `ContactForm.vue`. -->
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
        shownState === 'success' ? content.success.title : content.error.title
      "
      :note="cvNoteVisible ? content.success.cvNote : undefined"
      :error-fallback="content.error.fallback"
    />

    <!-- Turnstile's host, outside the form: see `ContactForm.vue`. -->
    <div ref="challengeHost" />
  </div>
</template>
