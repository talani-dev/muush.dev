import { type ComputedRef, computed } from 'vue'
import {
  ABOUT_HERO_KEYS,
  type AboutHeroContent,
} from '@/features/about/data/aboutHeroContent'

/**
 * The about module's only seam with the Nuxt runtime, same role
 * `useHeroContent` plays for `landing/` (`docs/business/rules.md` § R23):
 * this is the only file in `about/` allowed to call `useI18n`, so
 * `ui/AboutHeroSection.vue` renders with no i18n instance present.
 *
 * It performs no fetch, holds no state, registers no listener, and — unlike
 * `useHeroContent` — resolves no destination, because this section has none.
 */
export function useAboutHeroContent(): ComputedRef<AboutHeroContent> {
  const { t } = useI18n()

  return computed<AboutHeroContent>(() => ({
    eyebrow: t(ABOUT_HERO_KEYS.eyebrow),
    headline: t(ABOUT_HERO_KEYS.headline),
    intro: t(ABOUT_HERO_KEYS.intro),
  }))
}
