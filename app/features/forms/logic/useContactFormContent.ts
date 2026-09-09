import { type ComputedRef, computed } from 'vue'
import type { ContactFormContent } from '@/features/forms/data/contactFields'

/**
 * Resolves `forms.contact.*` into the shape `ContactForm.vue` renders.
 *
 * This module's own Nuxt seam (Constitution Article III): `forms/` keeps no
 * key namespaced under `landing.*` or `about.*`, so a future feature 20 can
 * add a sibling `useApplicationFormContent` under `forms.application.*` with
 * the same field-level conventions, with neither module reaching into the
 * other. `ContactSection.vue` calls this through the barrel, never through
 * `forms/logic/` directly (plan.md D-1, D-4).
 */
export function useContactFormContent(): ComputedRef<ContactFormContent> {
  const { t } = useI18n()

  return computed<ContactFormContent>(() => ({
    fields: {
      name: {
        label: t('forms.contact.fields.name.label'),
        errorRequired: t('forms.contact.fields.name.errorRequired'),
      },
      email: {
        label: t('forms.contact.fields.email.label'),
        errorRequired: t('forms.contact.fields.email.errorRequired'),
        errorFormat: t('forms.contact.fields.email.errorFormat'),
      },
      company: { label: t('forms.contact.fields.company.label') },
      identity: {
        label: t('forms.contact.fields.identity.label'),
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
      need: {
        label: t('forms.contact.fields.need.label'),
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
      whatsapp: {
        label: t('forms.contact.fields.whatsapp.label'),
        errorRequired: t('forms.contact.fields.whatsapp.errorRequired'),
        errorDigits: t('forms.contact.fields.whatsapp.errorDigits'),
      },
    },
    submit: t('forms.contact.submit'),
    sending: t('forms.contact.sending'),
    success: { title: t('forms.contact.success.title') },
    error: {
      title: t('forms.contact.error.title'),
      fallback: t('forms.contact.error.fallback'),
    },
  }))
}
