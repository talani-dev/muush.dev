import { type ComputedRef, computed, nextTick, type Ref, ref } from 'vue'
import {
  type ContactFieldId,
  type ContactFormErrors,
  type ContactFormValues,
  type ContactPreference,
  EMAIL_PATTERN,
  initialContactFormValues,
  NAME_MIN_LENGTH,
  NEED_MIN_LENGTH,
  WHATSAPP_MX_DIGIT_COUNT,
} from '@/features/forms/data/contactFields'

/**
 * The contact form's whole client-side state machine — and the file that
 * makes the "no fake success" guarantee structural rather than a rule to
 * remember.
 *
 * `ContactSubmitState` below has exactly two members, `'idle' | 'invalid'`.
 * There is no `sending`, no `success`, no `server-error` anywhere in this
 * file: no local variable, no branch, no timer that could ever assign one of
 * those three strings to `state`. `ContactForm.vue`'s `previewState` prop is
 * the **only** place those three strings exist in the shipped feature, and it
 * is a Storybook-only prop this composable never reads, never sets and does
 * not know exists (plan.md D-2). A reviewer can confirm the guarantee by
 * grepping this file for `sending`, `success` or `server-error` and finding
 * nothing.
 *
 * `onSubmit` runs **no** `await`, no `fetch`, no `XMLHttpRequest`, no
 * `setTimeout` standing in for a network round-trip (FR-008, FR-014). Its
 * only real effect on a passing validation is: nothing further.
 *
 * Plain Vue, no Nuxt composable — the same discipline `useHeroContent.ts`
 * documents, so this renders in a bare `mount()` and in Storybook with no
 * runtime present.
 */
export type ContactSubmitState = 'idle' | 'invalid'

export interface UseContactFormReturn {
  values: Ref<ContactFormValues>
  errors: ComputedRef<ContactFormErrors>
  state: Ref<ContactSubmitState>
  firstInvalidFieldId: ComputedRef<ContactFieldId | undefined>
  onSubmit: (event: Event) => void
  onContactPreferenceChange: (value: ContactPreference) => void
}

/**
 * One pure function per field, composed here. Exported so its rules are
 * unit-testable with no component and no composable instance
 * (`data-model.md` § 2).
 *
 * Runs synchronously over the field order `contactFields.ts` declares, so
 * "focus the first invalid field" is `Object.keys(errors)[0]` with no
 * separate sort (data-model.md § 2 point 2).
 */
export function validateContactForm(
  values: ContactFormValues
): ContactFormErrors {
  const errors: ContactFormErrors = {}

  if (values.name.trim().length < NAME_MIN_LENGTH) {
    errors.name = 'forms.contact.fields.name.errorRequired'
  }

  if (values.email.trim().length === 0) {
    errors.email = 'forms.contact.fields.email.errorRequired'
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'forms.contact.fields.email.errorFormat'
  }

  /* `company` is free text with no rule (spec A-07) — never assigned here. */

  if (values.identity === '') {
    errors.identity = 'forms.contact.fields.identity.errorRequired'
  }

  if (values.need.trim().length === 0) {
    errors.need = 'forms.contact.fields.need.errorRequired'
  } else if (values.need.trim().length < NEED_MIN_LENGTH) {
    errors.need = 'forms.contact.fields.need.errorLength'
  }

  /* `contactPreference` always holds one of its two literal values — a radio
     with a default can never be empty, so it carries no error of its own. */

  if (values.contactPreference === 'whatsapp') {
    const digits = values.whatsapp.replaceAll(/\D/g, '')
    if (digits.length === 0) {
      errors.whatsapp = 'forms.contact.fields.whatsapp.errorRequired'
    } else if (digits.length !== WHATSAPP_MX_DIGIT_COUNT) {
      errors.whatsapp = 'forms.contact.fields.whatsapp.errorDigits'
    }
  }

  return errors
}

export function useContactForm(
  initial?: Partial<ContactFormValues>
): UseContactFormReturn {
  const values = ref<ContactFormValues>({
    ...initialContactFormValues(),
    ...initial,
  }) as Ref<ContactFormValues>

  const state = ref<ContactSubmitState>('idle')
  const errors = computed<ContactFormErrors>(() =>
    validateContactForm(values.value)
  )

  const firstInvalidFieldId = computed<ContactFieldId | undefined>(() => {
    const [firstKey] = Object.keys(errors.value)
    return firstKey as ContactFieldId | undefined
  })

  function onSubmit(event: Event): void {
    event.preventDefault()

    if (Object.keys(errors.value).length === 0) {
      /* Validation passed. Nothing further: no request, no state change
         beyond staying `idle` (FR-014, `ui-map.md` § 7's "idle" row). */
      state.value = 'idle'
      return
    }

    state.value = 'invalid'
    void focusFirstInvalidField(firstInvalidFieldId.value)
  }

  /**
   * Resets `whatsapp` to `''` the moment the visitor leaves that branch, so a
   * later re-mount of the field always starts empty — the value was never
   * retained, rather than reset on unmount (FR-011, spec US3).
   */
  function onContactPreferenceChange(value: ContactPreference): void {
    values.value.contactPreference = value
    if (value !== 'whatsapp') {
      values.value.whatsapp = ''
    }
  }

  return {
    values,
    errors,
    state,
    firstInvalidFieldId,
    onSubmit,
    onContactPreferenceChange,
  }
}

/**
 * Moves focus to the first invalid field's control, in the next tick so the
 * error markup (and the field, in the WhatsApp case) has already rendered
 * (`ui-map.md` § 7: "foco al primer error").
 */
async function focusFirstInvalidField(
  fieldId: ContactFieldId | undefined
): Promise<void> {
  if (!fieldId) return
  await nextTick()
  const control = document.getElementById(fieldId)
  control?.focus()
}
