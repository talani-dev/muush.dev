import { type ComputedRef, computed } from 'vue'
import {
  CONTACT_KEYS,
  type ContactContent,
} from '@/features/landing/data/contactContent'
import { CALL_BOOKING_URL } from '@/shared/data/callBooking'

/**
 * The landing module's contact-section seam with the Nuxt runtime — the same
 * discipline `useHeroContent.ts` and `useServicesContent.ts` already follow:
 * `ui/ContactSection.vue` renders with no i18n instance and no Nuxt runtime
 * present (`docs/business/rules.md` § R23).
 *
 * Imports nothing from `app/features/forms/` (Article III) — the form's own
 * content is `useContactFormContent`'s, called separately by
 * `ContactSection.vue` through the `forms` barrel.
 */
export function useContactContent(): ComputedRef<ContactContent> {
  const { t } = useI18n()

  return computed<ContactContent>(() => ({
    eyebrow: t(CONTACT_KEYS.eyebrow),
    heading: t(CONTACT_KEYS.heading),
    body: t(CONTACT_KEYS.body),
    ctaSecondary: t(CONTACT_KEYS.ctaSecondary),
    altQuestion: t(CONTACT_KEYS.altQuestion),
    callHref: CALL_BOOKING_URL,
  }))
}
