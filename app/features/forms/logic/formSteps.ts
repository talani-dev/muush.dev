import type { FormStep, StepFields } from '@/features/forms/data/formSteps'
import type { SubmitState } from './useFormSubmitState'

/**
 * Pure step rules shared by both forms (feature 45, research R3).
 */

/** The step a field lives in; a field in no list is treated as step 1. */
export function stepOfField<F extends string>(
  stepFields: StepFields<F>,
  fieldId: F
): FormStep {
  return stepFields[2].includes(fieldId) ? 2 : 1
}

/** The first field of `step`, in form order, that has an error. */
export function firstErrorInStep<F extends string>(
  errors: Partial<Record<F, string>>,
  fieldOrder: readonly F[],
  stepFieldIds: readonly F[]
): F | undefined {
  return fieldOrder.find(
    fieldId => stepFieldIds.includes(fieldId) && Boolean(errors[fieldId])
  )
}

export interface ErrorVisibility<F extends string> {
  state: SubmitState
  /** Set when "Continuar" found errors in that step; `null` otherwise. */
  attemptedStep: FormStep | null
  stepFields: StepFields<F>
}

/**
 * Whether a field's error is shown. Errors appear only after an attempt
 * (`ui-map.md` § 7: the idle form shows none): every error once a submit
 * found the form invalid, and only the step's own errors after "Continuar"
 * found that step invalid (spec FR-005, FR-012).
 */
export function isErrorVisible<F extends string>(
  fieldId: F,
  { state, attemptedStep, stepFields }: ErrorVisibility<F>
): boolean {
  if (state === 'invalid') return true
  if (attemptedStep === null) return false
  return stepFields[attemptedStep].includes(fieldId)
}
