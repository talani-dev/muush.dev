import { type ComputedRef, computed, type Ref } from 'vue'
import type { FormStep, StepFields } from '@/features/forms/data/formSteps'
import { fieldErrorMessage } from './fieldErrorMessage'
import { isErrorVisible } from './formSteps'
import type { SubmitState } from './useFormSubmitState'

/**
 * What a v2 form shows, derived from its state (feature 45): the shown
 * state, step and consent (a Storybook-only preview may pin them; no page
 * does), whether it is busy, the submit label's key and each field's
 * visible error. Shared by `ContactForm` and `ApplicationForm`, so the rules
 * live once and the components only bind (Articles V, VIII).
 */
export type SubmitLabelKey = 'submit' | 'sending' | 'uploading' | 'retry'

/** The "Aviso" above the submit: a failed send, or a failed CV upload. */
export type NoticeKind = 'server-error' | 'cv-upload-error'

const SUBMIT_LABEL_KEY: Partial<Record<SubmitState, SubmitLabelKey>> = {
  uploading: 'uploading',
  sending: 'sending',
  'server-error': 'retry',
  'cv-upload-error': 'retry',
}

/** "Subiendo CV…", "Enviando…", "Intentar de nuevo" or the submit (FR-011,
 * FR-013, FR-034). */
export function submitLabelKey(state: SubmitState): SubmitLabelKey {
  return SUBMIT_LABEL_KEY[state] ?? 'submit'
}

export interface UseFormViewOptions<F extends string> {
  state: Readonly<Ref<SubmitState>>
  step: Readonly<Ref<FormStep>>
  accepted: Readonly<Ref<boolean>>
  attemptedStep: Readonly<Ref<FormStep | null>>
  errors: ComputedRef<Partial<Record<F, string>>>
  stepFields: StepFields<F>
  /** Each field's translated content, where its error messages live. */
  fieldContent: () => Record<F, object>
  previewState: () => SubmitState | undefined
  previewStep: () => FormStep | undefined
}

export interface UseFormViewReturn<F extends string> {
  shownState: ComputedRef<SubmitState>
  shownStep: ComputedRef<FormStep>
  shownAccepted: ComputedRef<boolean>
  busy: ComputedRef<boolean>
  labelKey: ComputedRef<SubmitLabelKey>
  /** Which notice shows, if any (FR-013, FR-034). */
  noticeKind: ComputedRef<NoticeKind | undefined>
  errorFor: (fieldId: F) => string | undefined
}

export function useFormView<F extends string>(
  options: UseFormViewOptions<F>
): UseFormViewReturn<F> {
  const shownState = computed(
    () => options.previewState() ?? options.state.value
  )
  const shownStep = computed(() => options.previewStep() ?? options.step.value)
  /* A previewed state is one only a ticked form reaches. */
  const shownAccepted = computed(
    () => Boolean(options.previewState()) || options.accepted.value
  )
  const busy = computed(
    () => shownState.value === 'uploading' || shownState.value === 'sending'
  )
  const labelKey = computed(() => submitLabelKey(shownState.value))
  const noticeKind = computed(() =>
    shownState.value === 'server-error' ||
    shownState.value === 'cv-upload-error'
      ? shownState.value
      : undefined
  )

  /** Shown only after an attempt: a submit, or Continuar on step 1. */
  function errorFor(fieldId: F): string | undefined {
    const visible = isErrorVisible(fieldId, {
      state: shownState.value,
      attemptedStep: options.attemptedStep.value,
      stepFields: options.stepFields,
    })
    if (!visible) return undefined
    return fieldErrorMessage(
      options.errors.value[fieldId],
      options.fieldContent()[fieldId]
    )
  }

  return {
    shownState,
    shownStep,
    shownAccepted,
    busy,
    labelKey,
    noticeKind,
    errorFor,
  }
}
