import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  type Ref,
  readonly,
  ref,
} from 'vue'
import {
  FORM_STEPS_MEDIA_QUERY,
  type FormStep,
  type StepFields,
} from '@/features/forms/data/formSteps'
import type { FormId } from '@/shared/data/trackingEvents'
import { emitTrackingEvent } from '@/shared/logic/trackingBus'
import { useReducedMotion } from '@/shared/logic/useReducedMotion'
import { focusField } from './focusField'
import { firstErrorInStep, stepOfField } from './formSteps'

/**
 * The two-step view of a form below 768 px (feature 45, spec FR-002…FR-007,
 * research R2–R3; handoff `iniciarFormulario`).
 *
 * `isStepped` is `false` on the server and until mount, so the prerendered
 * (and no-script) page is the single view and hydration agrees; the media
 * query is read in `onMounted` and followed live, its listener removed on
 * unmount (the `useDesktopLayout` pattern). Values are never touched here:
 * the step only decides what is shown, so moving between steps loses
 * nothing (FR-006, SC-005).
 *
 * Call it before any `onMounted` of your own that reads `isStepped`.
 * `goNext` takes the form's current errors as an argument, so the form
 * composable can receive `revealField` without a circular setup.
 */
export interface UseFormStepsOptions<F extends string> {
  /** Which form this is, in the `form_step` it reports (feature 49). */
  formId: FormId
  stepFields: StepFields<F>
  /** The panel whose top is brought into view when the step changes. */
  panel: Readonly<Ref<HTMLElement | null>>
}

export interface UseFormStepsReturn<F extends string> {
  isStepped: Readonly<Ref<boolean>>
  step: Readonly<Ref<FormStep>>
  /** The step whose "Continuar" found errors, until it is passed. */
  attemptedStep: Readonly<Ref<FormStep | null>>
  goNext: (errors: Partial<Record<F, string>>) => Promise<void>
  goBack: () => Promise<void>
  revealField: (fieldId: F) => void
}

export function useFormSteps<F extends string>(
  options: UseFormStepsOptions<F>
): UseFormStepsReturn<F> {
  const { stepFields, panel } = options
  const isReducedMotion = useReducedMotion()
  const isStepped = ref(false)
  const step = ref<FormStep>(1)
  const attemptedStep = ref<FormStep | null>(null)
  let query: MediaQueryList | undefined

  function follow(event: MediaQueryListEvent): void {
    isStepped.value = event.matches
  }

  onMounted(() => {
    query = window.matchMedia(FORM_STEPS_MEDIA_QUERY)
    isStepped.value = query.matches
    query.addEventListener('change', follow)
  })

  onBeforeUnmount(() => {
    query?.removeEventListener('change', follow)
  })

  /* Shows `target`, focuses its first control without the browser's own
     scroll, then brings the panel top into view: smooth unless the visitor
     reduces motion (handoff). */
  async function showStep(target: FormStep): Promise<void> {
    step.value = target
    emitTrackingEvent({
      name: 'form_step',
      params: { form: options.formId, step: target },
    })
    await nextTick()
    const first = stepFields[target][0]
    if (first) document.getElementById(first)?.focus({ preventScroll: true })
    panel.value?.scrollIntoView({
      block: 'start',
      behavior: isReducedMotion.value ? 'auto' : 'smooth',
    })
  }

  /** "Continuar": validates step 1 only (FR-005). */
  async function goNext(errors: Partial<Record<F, string>>): Promise<void> {
    const firstError = firstErrorInStep(errors, stepFields[1], stepFields[1])
    if (firstError) {
      attemptedStep.value = 1
      await focusField(firstError)
      return
    }
    attemptedStep.value = null
    await showStep(2)
  }

  /** "← Atrás": no validation, nothing cleared (FR-006). */
  function goBack(): Promise<void> {
    return showStep(1)
  }

  /** Before a submit focuses an invalid field, show its step (FR-007). */
  function revealField(fieldId: F): void {
    if (!isStepped.value) return
    step.value = stepOfField(stepFields, fieldId)
  }

  return {
    isStepped: readonly(isStepped),
    step: readonly(step),
    attemptedStep: readonly(attemptedStep),
    goNext,
    goBack,
    revealField,
  }
}
