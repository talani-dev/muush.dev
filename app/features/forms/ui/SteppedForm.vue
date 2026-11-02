<script setup lang="ts">
import { computed, useId, useTemplateRef } from 'vue'
import type { FormChromeContent } from '@/features/forms/data/formChrome'
import { FORM_STEP_COUNT, type FormStep } from '@/features/forms/data/formSteps'
import { CONSENT_FIELD_ID } from '@/features/forms/logic/useConsentGate'
import PrimaryButton from '@/shared/ui/PrimaryButton.vue'
import ConsentCheckbox from './ConsentCheckbox.vue'
import FormPanel from './FormPanel.vue'
import FormProgress from './FormProgress.vue'
import FormSuccess from './FormSuccess.vue'
import HoneypotField from './HoneypotField.vue'

/**
 * SteppedForm — the shell both v2 forms share (feature 45, spec FR-001…
 * FR-014; research R2; contracts/components.md). It owns the panel, the
 * progress, the two step groups, the place of the contact block, the
 * consent, the notice slot, the actions and the "Enviado" swap; each form
 * passes only its fields, through three slots:
 *
 * - stepped (below 768 px): progress · step 1 [`details`, `channel`,
 *   Continuar] · step 2 [`profile`, privacy, `notice`, submit, ← Atrás];
 * - single: `details` · `profile` · `channel` · privacy · `notice` · submit.
 *
 * `channel` renders in exactly one place, so DOM order, visual order and
 * focus order agree in both views (FR-003). Steps use `v-show`, so a hidden
 * step keeps its DOM (native select state, the chosen file). While stepped,
 * each group is a `group` named by the progress label.
 *
 * The `<form>` is a size container (`@container`): its two-field rows go
 * side by side from 32rem of form width, so they follow the panel's real
 * width rather than the viewport's.
 *
 * Enter in a step-1 field continues instead of submitting. The submit is
 * `unavailable` until consent (FR-009) and `disabled` while busy (FR-011).
 * The Turnstile host and the honeypot stay inside the panel, outside the
 * swapped content. Presentational: the form decides everything.
 */
interface Props {
  chrome: Pick<FormChromeContent, 'progress' | 'continue' | 'back' | 'privacy'>
  isStepped: boolean
  step: FormStep
  accepted: boolean
  honeypot: string
  submitLabel: string
  busy: boolean
  /** Present → the "Enviado" stack replaces the form. */
  success?: FormChromeContent['success']
}

const {
  chrome,
  isStepped,
  step,
  accepted,
  honeypot,
  submitLabel,
  busy,
  success,
} = defineProps<Props>()

const emit = defineEmits<{
  submit: [event: Event]
  continue: []
  back: []
  engage: []
  'update:accepted': [value: boolean]
  'update:honeypot': [value: string]
}>()

const challengeHost = useTemplateRef<HTMLElement>('challengeHost')
defineExpose({ challengeHost })

const progressId = useId()
const hintId = useId()

const groupAttrs = computed(() =>
  isStepped ? { role: 'group', 'aria-labelledby': progressId } : {}
)
const GROUP_CLASSES =
  'flex flex-col gap-formulario-gap md:gap-formulario-gap-escritorio'

function onSubmit(event: Event): void {
  if (isStepped && step === 1) {
    event.preventDefault()
    emit('continue')
    return
  }
  emit('submit', event)
}
</script>

<template>
  <FormPanel>
    <FormSuccess v-if="success" v-bind="success" />
    <form
      v-else
      novalidate
      :class="['@container', GROUP_CLASSES]"
      :aria-busy="busy"
      @submit="onSubmit"
      @focusin="emit('engage')"
    >
      <FormProgress
        v-if="isStepped"
        :id="progressId"
        :label="chrome.progress[step]"
        :step="step"
        :total="FORM_STEP_COUNT"
      />
      <div
        v-show="!isStepped || step === 1"
        v-bind="groupAttrs"
        :class="GROUP_CLASSES"
      >
        <slot name="details" />
        <slot v-if="isStepped" name="channel" />
        <PrimaryButton
          v-if="isStepped"
          size="block"
          :label="chrome.continue"
          @click="emit('continue')"
        />
      </div>
      <div
        v-show="!isStepped || step === 2"
        v-bind="groupAttrs"
        :class="GROUP_CLASSES"
      >
        <slot name="profile" />
        <slot v-if="!isStepped" name="channel" />
        <ConsentCheckbox
          :id="CONSENT_FIELD_ID"
          :label="chrome.privacy.label"
          :model-value="accepted"
          :disabled="busy"
          @update:model-value="emit('update:accepted', $event)"
        />
        <slot name="notice" />
        <p v-if="!accepted" :id="hintId" class="sr-only">
          {{ chrome.privacy.requiredHint }}
        </p>
        <PrimaryButton
          type="submit"
          size="block"
          :class="isStepped ? '' : 'self-center md:w-auto'"
          :label="submitLabel"
          :disabled="busy"
          :unavailable="!accepted && !busy"
          :described-by="accepted ? undefined : hintId"
        />
        <button
          v-if="isStepped"
          type="button"
          class="self-center px-atras-x py-atras-y font-texto text-nota text-gris-400 foco"
          @click="emit('back')"
        >
          {{ chrome.back }}
        </button>
      </div>
      <HoneypotField
        :model-value="honeypot"
        @update:model-value="emit('update:honeypot', $event)"
      />
    </form>
    <!-- Turnstile's host: empty in the normal flow (Invisible key). Outside
         the form so it survives the "Enviado" swap. -->
    <div ref="challengeHost" />
  </FormPanel>
</template>
