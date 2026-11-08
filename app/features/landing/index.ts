/**
 * The landing module's only public API (Constitution Article III).
 *
 * Features 44–45: the five Muush 1.0 home sections, their content seams
 * and types. The key lists, card / step models and geometry stay internal.
 * The v1 sections were deleted in feature 47.
 */

export type { AssessmentContent } from './data/assessmentContent'
export type { HeroContent } from './data/heroContent'
export type { HowWeWorkContent } from './data/howWeWorkContent'
export type { ServicesContent } from './data/servicesContent'
export type { WhoWeAreContent } from './data/whoWeAreContent'
export { useAssessmentContent } from './logic/useAssessmentContent'
export { useHeroContent } from './logic/useHeroContent'
export { useHowWeWorkContent } from './logic/useHowWeWorkContent'
export { useServicesContent } from './logic/useServicesContent'
export { useWhoWeAreContent } from './logic/useWhoWeAreContent'
export { default as AssessmentSection } from './ui/AssessmentSection.vue'
export { default as HeroSection } from './ui/HeroSection.vue'
export { default as HowWeWorkSection } from './ui/HowWeWorkSection.vue'
export { default as ServicesSection } from './ui/ServicesSection.vue'
export { default as WhoWeAreSection } from './ui/WhoWeAreSection.vue'
