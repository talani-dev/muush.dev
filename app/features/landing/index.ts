/**
 * The landing module's only public API (Constitution Article III).
 *
 * `HERO_DESTINATIONS`, `HERO_KEYS`, `PURPOSE_KEYS`, `PURPOSE_NODES`,
 * `SERVICES_KEYS`, `SERVICE_NODES` and `SERVICE_NODE_CENTRES` are deliberately
 * not exported: they are this module's own record of two open decisions and
 * its own key lists / geometry, not something another feature reads.
 */

export type { HeroContent } from './data/heroContent'
export type { PurposeContent } from './data/purposeContent'
export type { ServicesContent } from './data/servicesContent'
export { useHeroContent } from './logic/useHeroContent'
export { usePurposeContent } from './logic/usePurposeContent'
export { useServicesContent } from './logic/useServicesContent'
export { default as HeroSection } from './ui/HeroSection.vue'
export { default as PurposeSection } from './ui/PurposeSection.vue'
export { default as ServicesSection } from './ui/ServicesSection.vue'
