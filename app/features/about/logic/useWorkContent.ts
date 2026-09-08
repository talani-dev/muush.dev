import { type ComputedRef, computed } from 'vue'
import { WORK_KEYS, type WorkContent } from '@/features/about/data/workContent'

/**
 * The about module's second Nuxt seam (`docs/business/rules.md` § R23), same
 * role `useAboutHeroContent.ts` plays for the Hero: the only file in this
 * section's own tree allowed to call `useI18n`, so `ui/
 * WorkWithMuushSection.vue` renders with no i18n instance present.
 *
 * The eight-field form's own content comes from `forms/useApplicationFormContent`
 * — a sibling call, resolved by whoever composes the page
 * (`app/pages/nosotros.vue`), never by this composable or by
 * `WorkWithMuushSection.vue` itself (Constitution Article III).
 *
 * It performs no fetch, holds no state, registers no listener, and resolves
 * no destination — this section has none.
 */
export function useWorkContent(): ComputedRef<WorkContent> {
  const { t } = useI18n()

  return computed<WorkContent>(() => ({
    eyebrow: t(WORK_KEYS.eyebrow),
    headline: t(WORK_KEYS.headline),
    body: t(WORK_KEYS.body),
  }))
}
