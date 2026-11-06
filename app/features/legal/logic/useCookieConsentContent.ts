import { type ComputedRef, computed } from 'vue'
import {
  COOKIE_CATEGORIES,
  type CookieConsentCopy,
} from '@/features/legal/data/cookieCategories'

/**
 * The banner's and the preferences dialog's copy, plus the privacy page's
 * localized path for the intro's "aviso de privacidad" link (feature 48).
 * The route is resolved by name through the i18n route map, never written.
 */
export function useCookieConsentContent(): ComputedRef<CookieConsentCopy> {
  const { t } = useI18n()
  const localePath = useLocalePath()

  return computed<CookieConsentCopy>(() => ({
    banner: {
      title: t('consent.banner.title'),
      body: t('consent.banner.body'),
      customize: t('consent.banner.customize'),
    },
    actions: {
      rejectAll: t('consent.actions.rejectAll'),
      acceptAll: t('consent.actions.acceptAll'),
      save: t('consent.actions.save'),
    },
    preferences: {
      title: t('consent.preferences.title'),
      close: t('consent.preferences.close'),
      intro: {
        before: t('consent.preferences.intro.before'),
        link: t('consent.preferences.intro.link'),
        after: t('consent.preferences.intro.after'),
        href: localePath({ name: 'privacy' }),
      },
    },
    alwaysOn: t('consent.categories.alwaysOn'),
    categories: COOKIE_CATEGORIES.map(category => ({
      id: category.id,
      name: t(category.nameKey),
      detail: t(category.detailKey),
      required: category.required,
    })),
  }))
}
