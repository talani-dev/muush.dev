/**
 * The landing module's only public API (Constitution Article III).
 *
 * Feature 44: the four Muush 1.0 home sections, their content seams and
 * types. The key lists, card / step models and geometry stay internal.
 *
 * The one export from a quarantine folder is the v1 contact section, still
 * rendered at `#diagnostico` until feature 45 replaces it; nothing else from
 * `legacy/` leaves this module.
 */

export type { ContactContent } from './data/contactContent'
export type { HeroContent } from './data/heroContent'
export type { HowWeWorkContent } from './data/howWeWorkContent'
export type { ServicesContent } from './data/servicesContent'
export type { WhoWeAreContent } from './data/whoWeAreContent'
export { useContactContent } from './logic/useContactContent'
export { useHeroContent } from './logic/useHeroContent'
export { useHowWeWorkContent } from './logic/useHowWeWorkContent'
export { useServicesContent } from './logic/useServicesContent'
export { useWhoWeAreContent } from './logic/useWhoWeAreContent'
export { default as HeroSection } from './ui/HeroSection.vue'
export { default as HowWeWorkSection } from './ui/HowWeWorkSection.vue'
export { default as ContactSection } from './ui/legacy/ContactSection.vue'
export { default as ServicesSection } from './ui/ServicesSection.vue'
export { default as WhoWeAreSection } from './ui/WhoWeAreSection.vue'
