import { type ComputedRef, computed } from 'vue'
import {
  ABOUT_HERO_KEYS,
  type AboutHeroContent,
} from '@/features/about/data/aboutHeroContent'

/**
 * The Nosotros hero's seam with the Nuxt runtime (`docs/business/rules.md`
 * § R23): the only place its keys meet `useI18n`, so
 * `ui/AboutHeroSection.vue` renders with no i18n instance present. No
 * fetch, no state, no destination.
 */
export function useAboutHeroContent(): ComputedRef<AboutHeroContent> {
  const { t } = useI18n()

  return computed<AboutHeroContent>(() => ({
    pill: t(ABOUT_HERO_KEYS.pill),
    headingFirst: t(ABOUT_HERO_KEYS.headingFirst),
    headingSecond: t(ABOUT_HERO_KEYS.headingSecond),
    intro: t(ABOUT_HERO_KEYS.intro),
  }))
}
