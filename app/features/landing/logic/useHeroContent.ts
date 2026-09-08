import { type ComputedRef, computed } from 'vue'
import {
  HERO_DESTINATIONS,
  HERO_KEYS,
  type HeroContent,
} from '@/features/landing/data/heroContent'

/**
 * The landing module's single seam with the Nuxt runtime.
 *
 * This is the only file in `landing/` allowed to call `useI18n` or
 * `useLocalePath`. Everything it returns is inert data, which is what lets
 * `ui/HeroSection.vue` render with no i18n instance and no router present —
 * and what makes Storybook able to catch a component that cheats
 * (`docs/business/rules.md` § R23).
 *
 * It performs no fetch, holds no state and registers no listener.
 *
 * It imports **nothing** from `app/features/shell/` (Article III). The shell
 * has a `ShellDestination` union and a resolver that do the same two things;
 * borrowing either would couple this module to the shell's content model to
 * save ten lines, which Article III's own wording prefers to duplicate.
 */
export function useHeroContent(): ComputedRef<HeroContent> {
  const { t } = useI18n()
  const localePath = useLocalePath()

  return computed<HeroContent>(() => {
    const { callUrl, contactHash } = HERO_DESTINATIONS

    /*
     * The fragment resolves against the locale's home rather than being
     * emitted bare, so the link would work from anywhere the Hero is rendered
     * — the same rule the shell applies to its own anchors. Today there is no
     * hash, so nothing is emitted at all (spec FR-012).
     */
    const contactHref =
      contactHash === undefined
        ? undefined
        : `${localePath({ name: 'index' })}${contactHash}`

    return {
      eyebrow: t(HERO_KEYS.eyebrow),
      headline: t(HERO_KEYS.headline),
      subhead: t(HERO_KEYS.subhead),
      ctaPrimary: t(HERO_KEYS.ctaPrimary),
      ctaSecondary: t(HERO_KEYS.ctaSecondary),
      /* Omitted, never set to `undefined` — see `HeroContent`. */
      ...(contactHref === undefined ? {} : { contactHref }),
      /* An absolute external URL; there is nothing to resolve. */
      ...(callUrl === undefined ? {} : { callHref: callUrl }),
    }
  })
}
