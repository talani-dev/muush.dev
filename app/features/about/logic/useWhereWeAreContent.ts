import { type ComputedRef, computed } from 'vue'
import {
  WHERE_WE_ARE_KEYS,
  type WhereWeAreContent,
} from '@/features/about/data/whereWeAreContent'
import { resolveMapCopy } from '@/shared/utils/mapCopy'

/**
 * "Dónde estamos"'s seam with the Nuxt runtime (feature 46): the only place
 * its keys meet `useI18n`. The map labels come from the shared
 * `resolveMapCopy`, the same source the home's "Qué es muush" reads
 * (spec FR-017).
 */
export function useWhereWeAreContent(): ComputedRef<WhereWeAreContent> {
  const { t } = useI18n()

  return computed<WhereWeAreContent>(() => ({
    pill: t(WHERE_WE_ARE_KEYS.pill),
    headingFirst: t(WHERE_WE_ARE_KEYS.headingFirst),
    headingSecond: t(WHERE_WE_ARE_KEYS.headingSecond),
    body: t(WHERE_WE_ARE_KEYS.body),
    ...resolveMapCopy(key => t(key)),
  }))
}
