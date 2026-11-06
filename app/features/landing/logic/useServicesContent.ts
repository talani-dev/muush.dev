import { type ComputedRef, computed } from 'vue'
import {
  SERVICE_CARDS,
  SERVICES_KEYS,
  type ServicesContent,
} from '@/features/landing/data/servicesContent'

/**
 * Servicios' seam with the Nuxt runtime (feature 44, data-model § 4): the
 * only place its keys meet `useI18n`.
 */
export function useServicesContent(): ComputedRef<ServicesContent> {
  const { t } = useI18n()

  return computed<ServicesContent>(() => ({
    pill: t(SERVICES_KEYS.pill),
    headingFirst: t(SERVICES_KEYS.headingFirst),
    headingSecond: t(SERVICES_KEYS.headingSecond),
    cards: SERVICE_CARDS.map(card => ({
      title: t(SERVICES_KEYS.cardTitle(card.key)),
      description: t(SERVICES_KEYS.cardDescription(card.key)),
      icon: card.icon,
      light: card.light,
    })),
    also: {
      label: t(SERVICES_KEYS.alsoLabel),
      chips: SERVICES_KEYS.alsoChips.map(key => t(key)),
      note: t(SERVICES_KEYS.alsoNote),
    },
  }))
}
