/**
 * The landing module's only public API (Constitution Article III).
 *
 * `HERO_DESTINATIONS`, `HERO_KEYS`, `PURPOSE_KEYS` and `PURPOSE_NODES` are
 * deliberately not exported: they are this module's own record of two open
 * decisions and its own key lists, not something another feature reads.
 */

export type { HeroContent } from './data/heroContent'
export type { PurposeContent } from './data/purposeContent'
export { useHeroContent } from './logic/useHeroContent'
export { usePurposeContent } from './logic/usePurposeContent'
export { default as HeroSection } from './ui/HeroSection.vue'
export { default as PurposeSection } from './ui/PurposeSection.vue'
