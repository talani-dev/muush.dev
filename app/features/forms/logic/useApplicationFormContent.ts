import { type ComputedRef, computed } from 'vue'
import {
  type ApplicationFormContent,
  ROLE_CATALOG,
} from '@/features/forms/data/applicationFields'

/**
 * Resolves `forms.application.*` into the shape `ApplicationForm.vue` renders
 * — sibling to `useContactFormContent.ts`, same module isolation reasoning
 * (Constitution Article III): `forms/` keeps no key namespaced under
 * `about.*`, so `about/`'s `WorkWithMuushSection.vue` calls this through the
 * barrel and never reaches into `forms/logic/` directly (plan.md D-1, D-4).
 */
export function useApplicationFormContent(): ComputedRef<ApplicationFormContent> {
  const { t } = useI18n()

  return computed<ApplicationFormContent>(() => ({
    fields: {
      name: {
        label: t('forms.application.fields.name.label'),
        errorRequired: t('forms.application.fields.name.errorRequired'),
      },
      email: {
        label: t('forms.application.fields.email.label'),
        errorRequired: t('forms.application.fields.email.errorRequired'),
        errorFormat: t('forms.application.fields.email.errorFormat'),
      },
      areaRole: {
        label: t('forms.application.fields.areaRole.label'),
        placeholder: t('forms.application.fields.areaRole.placeholder'),
        errorRequired: t('forms.application.fields.areaRole.errorRequired'),
        areas: {
          it: t('forms.application.fields.areaRole.areas.it'),
          product: t('forms.application.fields.areaRole.areas.product'),
          projectManagement: t(
            'forms.application.fields.areaRole.areas.projectManagement'
          ),
          sales: t('forms.application.fields.areaRole.areas.sales'),
          marketing: t('forms.application.fields.areaRole.areas.marketing'),
          creative: t('forms.application.fields.areaRole.areas.creative'),
        },
        roles: Object.fromEntries(
          ROLE_CATALOG.map(({ area, roleIds }) => [
            area,
            Object.fromEntries(
              roleIds.map(roleId => [
                roleId,
                t(`forms.application.fields.areaRole.roles.${area}.${roleId}`),
              ])
            ),
          ])
        ) as ApplicationFormContent['fields']['areaRole']['roles'],
      },
      portfolio: {
        label: t('forms.application.fields.portfolio.label'),
        placeholder: t('forms.application.fields.portfolio.placeholder'),
        errorFormat: t('forms.application.fields.portfolio.errorFormat'),
      },
      linkedin: {
        label: t('forms.application.fields.linkedin.label'),
        placeholder: t('forms.application.fields.linkedin.placeholder'),
        errorFormat: t('forms.application.fields.linkedin.errorFormat'),
      },
      cv: {
        label: t('forms.application.fields.cv.label'),
        placeholder: t('forms.application.fields.cv.placeholder'),
        errorFormat: t('forms.application.fields.cv.errorFormat'),
        errorSize: t('forms.application.fields.cv.errorSize'),
        /* Only rendered if `CV_REQUIRED` ever flips to `true` (plan.md D-5) —
           the key ships today so that flip needs no i18n change. */
        errorRequired: t('forms.application.fields.cv.errorRequired'),
      },
      contactPreference: {
        label: t('forms.application.fields.contactPreference.label'),
        options: {
          email: t('forms.application.fields.contactPreference.options.email'),
          whatsapp: t(
            'forms.application.fields.contactPreference.options.whatsapp'
          ),
        },
      },
      whatsapp: {
        label: t('forms.application.fields.whatsapp.label'),
        errorRequired: t('forms.application.fields.whatsapp.errorRequired'),
        errorDigits: t('forms.application.fields.whatsapp.errorDigits'),
      },
    },
    submit: t('forms.application.submit'),
    sending: t('forms.application.sending'),
    success: { title: t('forms.application.success.title') },
    error: {
      title: t('forms.application.error.title'),
      fallback: t('forms.application.error.fallback'),
    },
  }))
}
