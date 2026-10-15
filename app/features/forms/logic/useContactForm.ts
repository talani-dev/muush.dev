import { type ComputedRef, type Ref, ref } from 'vue'
import {
  CONTACT_FIELD_ORDER,
  type ContactFieldId,
  type ContactFormErrors,
  type ContactFormValues,
  type ContactPreference,
  EMAIL_PATTERN,
  initialContactFormValues,
  NAME_MIN_LENGTH,
  NEED_MIN_LENGTH,
  WHATSAPP_MAX_DIGITS,
  WHATSAPP_MIN_DIGITS,
} from '@/features/forms/data/contactFields'
import type { CountryCode } from '@/features/forms/data/countries'
import type { ContactSubmitter } from '@/features/forms/data/submissionContract'
import { CONTACT_SERVER_ERROR_KEYS } from './serverFieldErrors'
import { useDefaultCountry } from './useDefaultCountry'
import { type SubmitState, useFormSubmitState } from './useFormSubmitState'

/**
 * The contact form's client-side state: its values, its validation rules and
 * the WhatsApp branch. Submitting is `useFormSubmitState`'s job, shared with
 * the application form.
 *
 * Until feature 029 this file's guarantee was "no `sending`/`success`/
 * `server-error` exists here, so no fake success is possible". That guarantee
 * is replaced, not dropped (spec FR-011/FR-012): `success` now exists, and it
 * is produced only from a classified `ok` response — a 200 with `ok: true` —
 * in `submissionFlows.ts`. No `fetch` lives here; the network is behind the
 * injected `submitter`.
 *
 * Plain Vue, no Nuxt composable, so it runs in a bare `mount()` and in
 * Storybook with no runtime present.
 */
export type ContactSubmitState = SubmitState

export interface UseContactFormOptions {
  submitter: ContactSubmitter
  /** The form's Turnstile host element (a template ref). */
  challengeHost?: Readonly<Ref<HTMLElement | null>>
  initial?: Partial<ContactFormValues>
  /** Injectable clock for the minimum fill time. */
  now?: () => number
}

export interface UseContactFormReturn {
  values: Ref<ContactFormValues>
  errors: ComputedRef<ContactFormErrors>
  state: Ref<ContactSubmitState>
  firstInvalidFieldId: ComputedRef<ContactFieldId | undefined>
  honeypot: Ref<string>
  markInteractive: () => void
  onEngage: () => void
  onSubmit: (event: Event) => Promise<void>
  onContactPreferenceChange: (value: ContactPreference) => void
  onWhatsappCountryChange: (code: CountryCode) => void
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
    } else if (
      digits.length < WHATSAPP_MIN_DIGITS ||
      digits.length > WHATSAPP_MAX_DIGITS
    ) {
      errors.whatsapp = 'forms.contact.fields.whatsapp.errorDigits'
    }
  }

  return errors
}

export function useContactForm(
  options: UseContactFormOptions
): UseContactFormReturn {
  const values = ref<ContactFormValues>({
    ...initialContactFormValues(),
    ...options.initial,
  }) as Ref<ContactFormValues>

  const submission = useFormSubmitState({
    values,
    validate: validateContactForm,
    fieldOrder: CONTACT_FIELD_ORDER,
    serverErrorKeys: CONTACT_SERVER_ERROR_KEYS,
    submitter: options.submitter,
    challengeHost: options.challengeHost ?? ref(null),
    now: options.now,
  })

  const defaultCountry = useDefaultCountry({
    values,
    lookupCountry: options.submitter.lookupCountry,
  })

  /** The first focus in the form also asks the site's edge for the visitor's
   * country (feature 32 Amendment A1, IP-3), next to the Turnstile engage. */
  function onEngage(): void {
    submission.onEngage()
    defaultCountry.requestDefaultCountry()
  }

  /**
   * Resets `whatsapp` to `''` the moment the visitor leaves that branch, so a
   * later re-mount of the field always starts empty — the value was never
   * retained, rather than reset on unmount (FR-011, spec US3). A server mark
   * on `whatsapp` goes with the value. The country is kept (feature 32 spec
   * OA-9).
   *
   * Entering WhatsApp asks for the default country too (a no-op once asked),
   * for a visitor who reaches the radio without focusing the form first. It
   * never resets the country: Mexico, the reported one or the visitor's pick
   * stays (feature 32 Amendment A1).
   */
  function onContactPreferenceChange(value: ContactPreference): void {
    values.value.contactPreference = value
    if (value !== 'whatsapp') {
      values.value.whatsapp = ''
      return
    }
    defaultCountry.requestDefaultCountry()
  }

  return {
    values,
    errors: submission.errors,
    state: submission.state,
    firstInvalidFieldId: submission.firstInvalidFieldId,
    honeypot: submission.honeypot,
    markInteractive: submission.markInteractive,
    onEngage,
    onSubmit: submission.onSubmit,
    onContactPreferenceChange,
    onWhatsappCountryChange: defaultCountry.onWhatsappCountryChange,
  }
}
