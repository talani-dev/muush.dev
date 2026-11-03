import { type ComputedRef, computed } from 'vue'
import {
  AREAS_ORDER,
  WORK_KEYS,
  type WorkContent,
} from '@/features/about/data/workContent'

/**
 * "Trabaja con muush"'s seam with the Nuxt runtime (`docs/business/
 * rules.md` § R23): the only place its keys meet `useI18n`. The form's own
 * content comes from `forms/useApplicationFormContent`, called by the page
 * (`app/pages/about.vue`), never here (Constitution Article III).
 */
export function useWorkContent(): ComputedRef<WorkContent> {
  const { t } = useI18n()

  return computed<WorkContent>(() => ({
    pill: t(WORK_KEYS.pill),
    headingFirst: t(WORK_KEYS.headingFirst),
    headingSecond: t(WORK_KEYS.headingSecond),
    body: t(WORK_KEYS.body),
    areasLabel: t(WORK_KEYS.areasLabel),
    areas: AREAS_ORDER.map(key => t(WORK_KEYS.area(key))),
  }))
}
