import { type ComputedRef, computed } from 'vue'
import {
  WHO_WE_ARE_KEYS,
  type WhoWeAreContent,
} from '@/features/landing/data/whoWeAreContent'
import { resolveMapCopy } from '@/shared/utils/mapCopy'

/**
 * "Qué es muush"'s seam with the Nuxt runtime (feature 44, data-model § 4):
 * the only place its keys meet `useI18n`. The map and the legend receive
 * plain strings, built from the shared map keys (feature 46, research R3).
 */
export function useWhoWeAreContent(): ComputedRef<WhoWeAreContent> {
  const { t } = useI18n()

  return computed<WhoWeAreContent>(() => ({
    pill: t(WHO_WE_ARE_KEYS.pill),
    headingFirst: t(WHO_WE_ARE_KEYS.headingFirst),
    headingSecond: t(WHO_WE_ARE_KEYS.headingSecond),
    body: t(WHO_WE_ARE_KEYS.body),
    ...resolveMapCopy(key => t(key)),
  }))
}
