import { type ComputedRef, computed, nextTick, type Ref, ref } from 'vue'
import {
  type ApplicationFieldId,
  type ApplicationFormErrors,
  type ApplicationFormValues,
  CV_ACCEPTED_TYPE,
  CV_MAX_BYTES,
  CV_REQUIRED,
  EMAIL_PATTERN,
  initialApplicationFormValues,
  NAME_MIN_LENGTH,
  WHATSAPP_MX_DIGIT_COUNT,
} from '@/features/forms/data/applicationFields'
import type { ContactPreference } from '@/features/forms/data/contactFields'

/**
 * The application form's whole client-side state machine — the literal
 * extension of `useContactForm.ts`'s "no fake success" guarantee to a file
 * field (plan.md D-1, mirroring feature 16's D-2).
 *
 * `ApplicationSubmitState` below has exactly two members, `'idle' |
 * 'invalid'`. There is no `sending`, no `success`, no `server-error`
 * anywhere in this file: no local variable, no branch, no timer that could
 * ever assign one of those three strings to `state`. `ApplicationForm.vue`'s
 * `previewState` prop is the **only** place those three strings exist in the
 * shipped feature, and it is a Storybook-only prop this composable never
 * reads, never sets and does not know exists. A reviewer can confirm the
 * guarantee by grepping this file for `sending`, `success` or `server-error`
 * and finding nothing.
 *
 * `onSubmit` runs **no** `await`, no `fetch`, no `XMLHttpRequest`, no
 * `FormData`, no `setTimeout` standing in for a network round-trip (FR-003,
 * FR-011). Its only real effect on a passing validation is: nothing further.
 * `onCvChange` stores the raw `File | null` with no serialization — never
 * read into a `FormData`, never base64-encoded, never kept as an object URL
 * past this ref's own lifetime.
 *
 * Plain Vue, no Nuxt composable — same discipline `useContactForm.ts`
 * documents, so this renders in a bare `mount()` and in Storybook with no
 * runtime present.
 */
export type ApplicationSubmitState = 'idle' | 'invalid'

export interface UseApplicationFormReturn {
  values: Ref<ApplicationFormValues>
  errors: ComputedRef<ApplicationFormErrors>
  state: Ref<ApplicationSubmitState>
  firstInvalidFieldId: ComputedRef<ApplicationFieldId | undefined>
  onSubmit: (event: Event) => void
  onContactPreferenceChange: (value: ContactPreference) => void
  onCvChange: (file: File | null) => void
}

/**
 * One pure function per field, composed here. Exported so its rules are
 * unit-testable with no component and no composable instance
 * (`data-model.md` § 4).
 *
 * Runs synchronously over the field order `applicationFields.ts` declares,
 * so "focus the first invalid field" is `Object.keys(errors)[0]` with no
 * separate sort (data-model.md § 4 point 4).
 */
export function validateApplicationForm(
  values: ApplicationFormValues
): ApplicationFormErrors {
  const errors: ApplicationFormErrors = {}

  if (values.name.trim().length < NAME_MIN_LENGTH) {
    errors.name = 'forms.application.fields.name.errorRequired'
  }

  if (values.email.trim().length === 0) {
    errors.email = 'forms.application.fields.email.errorRequired'
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'forms.application.fields.email.errorFormat'
  }

  if (values.areaRole === '') {
    errors.areaRole = 'forms.application.fields.areaRole.errorRequired'
  }

  /* `portfolio`/`linkedin`: never validated when empty (FR-009) — well-formed
     URL only applies to a non-empty value. */
  if (
    values.portfolio.trim().length > 0 &&
    !isWellFormedUrl(values.portfolio)
  ) {
    errors.portfolio = 'forms.application.fields.portfolio.errorFormat'
  }
  if (values.linkedin.trim().length > 0 && !isWellFormedUrl(values.linkedin)) {
    errors.linkedin = 'forms.application.fields.linkedin.errorFormat'
  }

  /*
   * CV: format/size is validated whenever a file is present, regardless of
   * `CV_REQUIRED`; its *absence* is an error only when `CV_REQUIRED` is true
   * (data-model.md § 4 point 2). `CV_REQUIRED` is the one, isolated flip
   * point for the open business decision (plan.md D-5).
   */
  if (values.cv === null) {
    if (CV_REQUIRED) {
      errors.cv = 'forms.application.fields.cv.errorRequired'
    }
  } else if (values.cv.type !== CV_ACCEPTED_TYPE) {
    errors.cv = 'forms.application.fields.cv.errorFormat'
  } else if (values.cv.size > CV_MAX_BYTES) {
    errors.cv = 'forms.application.fields.cv.errorSize'
  }

  /* `contactPreference` always holds one of its two literal values — a radio
     with a default can never be empty, so it carries no error of its own. */

  if (values.contactPreference === 'whatsapp') {
    const digits = values.whatsapp.replaceAll(/\D/g, '')
    if (digits.length === 0) {
      errors.whatsapp = 'forms.application.fields.whatsapp.errorRequired'
    } else if (digits.length !== WHATSAPP_MX_DIGIT_COUNT) {
      errors.whatsapp = 'forms.application.fields.whatsapp.errorDigits'
    }
  }

  return errors
}

/** Same-shape check as the native `type="url"` constraint — not exhaustive,
 * and not meant to be. */
function isWellFormedUrl(value: string): boolean {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

export function useApplicationForm(
  initial?: Partial<ApplicationFormValues>
): UseApplicationFormReturn {
  const values = ref<ApplicationFormValues>({
    ...initialApplicationFormValues(),
    ...initial,
  }) as Ref<ApplicationFormValues>

  const state = ref<ApplicationSubmitState>('idle')
  const errors = computed<ApplicationFormErrors>(() =>
    validateApplicationForm(values.value)
  )

  const firstInvalidFieldId = computed<ApplicationFieldId | undefined>(() => {
    const [firstKey] = Object.keys(errors.value)
    return firstKey as ApplicationFieldId | undefined
  })

  function onSubmit(event: Event): void {
    event.preventDefault()

    if (Object.keys(errors.value).length === 0) {
      /* Validation passed. Nothing further: no request, no state change
         beyond staying `idle` (FR-003, FR-005). */
      state.value = 'idle'
      return
    }

    state.value = 'invalid'
    void focusFirstInvalidField(firstInvalidFieldId.value)
  }

  /**
   * Resets `whatsapp` to `''` the moment the visitor leaves that branch, so a
   * later re-mount of the field always starts empty — the value was never
   * retained, rather than reset on unmount (FR-013, spec US2), identical
   * mechanism to `useContactForm.ts`.
   */
  function onContactPreferenceChange(value: ContactPreference): void {
    values.value.contactPreference = value
    if (value !== 'whatsapp') {
      values.value.whatsapp = ''
    }
  }

  /**
   * Stores the raw `File | null` — the whole of it. No `FormData`, no
   * `fetch`, no object URL kept past this ref's own lifetime (FR-011).
   */
  function onCvChange(file: File | null): void {
    values.value.cv = file
  }

  return {
    values,
    errors,
    state,
    firstInvalidFieldId,
    onSubmit,
    onContactPreferenceChange,
    onCvChange,
  }
}

/**
 * Moves focus to the first invalid field's control, in the next tick so the
 * error markup (and the field, in the WhatsApp case) has already rendered
 * (`ui-map.md` § 7's "foco al primer error", reused for this form).
 */
async function focusFirstInvalidField(
  fieldId: ApplicationFieldId | undefined
): Promise<void> {
  if (!fieldId) return
  await nextTick()
  const control = document.getElementById(fieldId)
  control?.focus()
}
