/**
 * The about module's only public API (Constitution Article III).
 *
 * `ABOUT_HERO_KEYS` / `WORK_KEYS` are deliberately not exported: each is its
 * own section's key list, not something another feature reads — the same
 * precedent `landing/index.ts` sets for `HERO_KEYS`.
 */

export type { AboutHeroContent } from './data/aboutHeroContent'
export type { WorkContent } from './data/workContent'
export { useAboutHeroContent } from './logic/useAboutHeroContent'
export { useWorkContent } from './logic/useWorkContent'
export { default as AboutHeroSection } from './ui/AboutHeroSection.vue'
export { default as WorkWithMuushSection } from './ui/WorkWithMuushSection.vue'
