import { type ComputedRef, computed, type Ref, ref } from 'vue'
import {
  APPLICATION_FIELD_ORDER,
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
import type { ApplicationSubmitter } from '@/features/forms/data/submissionContract'
import { APPLICATION_SERVER_ERROR_KEYS } from './serverFieldErrors'
import { type SubmitState, useFormSubmitState } from './useFormSubmitState'

/**
 * The application form's client-side state: its values, its validation
 * rules, the WhatsApp branch and the CV field. Submitting is
 * `useFormSubmitState`'s job, shared with the contact form.
 *
 * Until feature 029 this file guaranteed that no `sending`/`success`/
 * `server-error` existed here. That guarantee is replaced, not dropped (spec
 * FR-011/FR-012): `success` is produced only from a classified `ok`
 * response, in `submissionFlows.ts`.
 *
 * The CV is sent only through the presigned S3 upload in
 * `submissionFlows.ts`, never inside a JSON payload, never as `FormData`.
 * `cvNoteVisible` is true only after a success in which that upload failed
 * (spec FR-016).
 *
 * Plain Vue, no Nuxt composable, so it runs in a bare `mount()` and in
 * Storybook with no runtime present.
 */
export type ApplicationSubmitState = SubmitState

export interface UseApplicationFormOptions {
  submitter: ApplicationSubmitter
  /** The form's Turnstile host element (a template ref). */
  challengeHost?: Readonly<Ref<HTMLElement | null>>
  initial?: Partial<ApplicationFormValues>
  /** Injectable clock for the minimum fill time. */
  now?: () => number
}

export interface UseApplicationFormReturn {
  values: Ref<ApplicationFormValues>
  errors: ComputedRef<ApplicationFormErrors>
  state: Ref<ApplicationSubmitState>
  firstInvalidFieldId: ComputedRef<ApplicationFieldId | undefined>
  cvNoteVisible: ComputedRef<boolean>
  honeypot: Ref<string>
  markInteractive: () => void
  onEngage: () => void
  onSubmit: (event: Event) => Promise<void>
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
  options: UseApplicationFormOptions
): UseApplicationFormReturn {
  const values = ref<ApplicationFormValues>({
    ...initialApplicationFormValues(),
    ...options.initial,
  }) as Ref<ApplicationFormValues>

  const submission = useFormSubmitState({
    values,
    validate: validateApplicationForm,
    fieldOrder: APPLICATION_FIELD_ORDER,
    serverErrorKeys: APPLICATION_SERVER_ERROR_KEYS,
    submitter: options.submitter,
    challengeHost: options.challengeHost ?? ref(null),
    now: options.now,
  })

  const cvNoteVisible = computed(
    () => submission.state.value === 'success' && !submission.cvAttached.value
  )

  /**
   * Resets `whatsapp` to `''` the moment the visitor leaves that branch, so a
   * later re-mount of the field always starts empty (FR-013, spec US2),
   * identical mechanism to `useContactForm.ts`.
   */
  function onContactPreferenceChange(value: ContactPreference): void {
    values.value.contactPreference = value
    if (value !== 'whatsapp') {
      values.value.whatsapp = ''
    }
  }

  /** Stores the raw `File | null`. It leaves the browser only through the
   * presigned upload of `submissionFlows.ts`. */
  function onCvChange(file: File | null): void {
    values.value.cv = file
  }

  return {
    values,
    errors: submission.errors,
    state: submission.state,
    firstInvalidFieldId: submission.firstInvalidFieldId,
    cvNoteVisible,
    honeypot: submission.honeypot,
    markInteractive: submission.markInteractive,
    onEngage: submission.onEngage,
    onSubmit: submission.onSubmit,
    onContactPreferenceChange,
    onCvChange,
  }
}
