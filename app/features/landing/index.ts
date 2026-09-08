/**
 * The landing module's only public API (Constitution Article III).
 *
 * `HERO_DESTINATIONS` and `HERO_KEYS` are deliberately not exported: they are
 * this module's own record of two open decisions and its own key list, not
 * something another feature reads.
 */

export type { HeroContent } from './data/heroContent'
export { useHeroContent } from './logic/useHeroContent'
export { default as HeroSection } from './ui/HeroSection.vue'
