import { type ComputedRef, computed } from 'vue'
import {
  HERO_KEYS,
  type HeroContent,
} from '@/features/landing/data/heroContent'
import { SECTION_ANCHORS } from '@/shared/data/sectionAnchors'

/**
 * The hero's seam with the Nuxt runtime (feature 44, data-model § 4): the
 * only place its keys meet `useI18n` and `useLocalePath`, so
 * `ui/HeroSection.vue` renders with plain props (rules.md § R23).
 *
 * Both actions are the current locale's home plus a section anchor from the
 * shared list (feature 43), never a path literal (Article VI): the links
 * work without scripting and on any locale.
 */
export function useHeroContent(): ComputedRef<HeroContent> {
  const { t } = useI18n()
  const localePath = useLocalePath()

  return computed<HeroContent>(() => {
    const home = localePath({ name: 'index' })
    return {
      pillItems: HERO_KEYS.pill.map(key => t(key)),
      headlineFirst: t(HERO_KEYS.headlineFirst),
      headlineSecond: t(HERO_KEYS.headlineSecond),
      subtitle: t(HERO_KEYS.subtitle),
      primaryLabel: t(HERO_KEYS.primary),
      primaryHref: `${home}#${SECTION_ANCHORS.assessment}`,
      secondaryLabel: t(HERO_KEYS.secondary),
      secondaryHref: `${home}#${SECTION_ANCHORS.howWeWork}`,
    }
  })
}
