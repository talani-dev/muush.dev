import { type ComputedRef, computed } from 'vue'
import type { ContactFormContent } from '@/features/forms/data/contactFields'
import { CALL_BOOKING_URL } from '@/shared/data/callBooking'
import { buildCountryOptions } from './countryOptions'
import { resolveFormChrome } from './formChromeContent'

/**
 * Resolves `forms.contact.*` into the shape `ContactForm.vue` renders.
 *
 * This module's own Nuxt seam (Constitution Article III): `forms/` keeps no
 * key namespaced under `landing.*` or `about.*`, so a future feature 20 can
 * add a sibling `useApplicationFormContent` under `forms.application.*` with
 * the same field-level conventions, with neither module reaching into the
 * other. `pages/index.vue` calls this through the barrel, never through
 * `forms/logic/` directly (plan.md D-1, D-4).
 *
 * Feature 45: the v2 shape — placeholders, the shared chrome
 * (`formChromeContent.ts`), and the "Enviado" action to the call-booking
 * page, a destination rather than copy (`shared/data/callBooking.ts`).
 */
export function useContactFormContent(): ComputedRef<ContactFormContent> {
  const { t, locale, localeProperties } = useI18n()
  const localePath = useLocalePath()
  /* Country names come from the browser in the page language (`es-MX` /
     `en`, the locale's `language` in `nuxt.config.ts`), not from locale
     keys: one source for both languages (feature 32 research R2). */
  const countryOptions = computed(() =>
    buildCountryOptions(localeProperties.value.language ?? locale.value)
  )

  return computed<ContactFormContent>(() => ({
    fields: {
      name: {
        label: t('forms.contact.fields.name.label'),
        placeholder: t('forms.contact.fields.name.placeholder'),
        errorRequired: t('forms.contact.fields.name.errorRequired'),
      },
      email: {
        label: t('forms.contact.fields.email.label'),
        placeholder: t('forms.contact.fields.email.placeholder'),
        errorRequired: t('forms.contact.fields.email.errorRequired'),
        errorFormat: t('forms.contact.fields.email.errorFormat'),
      },
      company: {
        label: t('forms.contact.fields.company.label'),
        placeholder: t('forms.contact.fields.company.placeholder'),
      },
      identity: {
        label: t('forms.contact.fields.identity.label'),
        placeholder: t('forms.contact.fields.identity.placeholder'),
        errorRequired: t('forms.contact.fields.identity.errorRequired'),
        /*
         * Order is significant: `ContactForm.vue` walks
         * `Object.entries(options)` to build the select's option list, so
         * this literal's key order IS the render order — the six options
         * Roberto gave verbatim (feature 24, 2026-09-08).
         */
        options: {
          realEstate: t('forms.contact.fields.identity.options.realEstate'),
          creator: t('forms.contact.fields.identity.options.creator'),
          company: t('forms.contact.fields.identity.options.company'),
          independent: t('forms.contact.fields.identity.options.independent'),
          startup: t('forms.contact.fields.identity.options.startup'),
          other: t('forms.contact.fields.identity.options.other'),
        },
      },
      /* Feature 49 (copy-drafts § D): label and placeholder only. */
      website: {
        label: t('forms.contact.fields.website.label'),
        placeholder: t('forms.contact.fields.website.placeholder'),
      },
      need: {
        label: t('forms.contact.fields.need.label'),
        placeholder: t('forms.contact.fields.need.placeholder'),
        errorRequired: t('forms.contact.fields.need.errorRequired'),
        errorLength: t('forms.contact.fields.need.errorLength'),
      },
      contactPreference: {
        label: t('forms.contact.fields.contactPreference.label'),
        options: {
          email: t('forms.contact.fields.contactPreference.options.email'),
          whatsapp: t(
            'forms.contact.fields.contactPreference.options.whatsapp'
          ),
        },
      },
      whatsappCountry: {
        label: t('forms.contact.fields.whatsappCountry.label'),
        errorInvalid: t('forms.contact.fields.whatsappCountry.errorInvalid'),
        options: countryOptions.value,
      },
      whatsapp: {
        label: t('forms.contact.fields.whatsapp.label'),
        errorRequired: t('forms.contact.fields.whatsapp.errorRequired'),
        errorDigits: t('forms.contact.fields.whatsapp.errorDigits'),
      },
    },
    ...resolveFormChrome(
      t,
      'forms.contact',
      {
        label: t('forms.contact.success.action'),
        href: CALL_BOOKING_URL,
        track: {
          name: 'book_call_click',
          params: { cta_location: 'form_success' },
        },
      },
      localePath({ name: 'privacy' })
    ),
  }))
}
