/**
 * The about module's only public API (Constitution Article III).
 *
 * `ABOUT_HERO_KEYS` is deliberately not exported: it is this module's own key
 * list, not something another feature reads — the same precedent
 * `landing/index.ts` sets for `HERO_KEYS`.
 */

export type { AboutHeroContent } from './data/aboutHeroContent'
export { useAboutHeroContent } from './logic/useAboutHeroContent'
export { default as AboutHeroSection } from './ui/AboutHeroSection.vue'
