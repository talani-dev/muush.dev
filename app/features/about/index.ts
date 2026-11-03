/**
 * The about module's only public API (Constitution Article III).
 *
 * Feature 46: the four Muush 1.0 Nosotros sections, their content seams and
 * types. The key lists and the card stay internal, the same precedent
 * `landing/index.ts` sets. Nothing v1 is left in this module.
 */

export type { AboutHeroContent } from './data/aboutHeroContent'
export type {
  CompositionKind,
  TeamCompositionContent,
} from './data/teamCompositionContent'
export type { WhereWeAreContent } from './data/whereWeAreContent'
export type { WorkContent } from './data/workContent'
export { useAboutHeroContent } from './logic/useAboutHeroContent'
export { useTeamCompositionContent } from './logic/useTeamCompositionContent'
export { useWhereWeAreContent } from './logic/useWhereWeAreContent'
export { useWorkContent } from './logic/useWorkContent'
export { default as AboutHeroSection } from './ui/AboutHeroSection.vue'
export { default as TeamCompositionSection } from './ui/TeamCompositionSection.vue'
export { default as WhereWeAreSection } from './ui/WhereWeAreSection.vue'
export { default as WorkWithMuushSection } from './ui/WorkWithMuushSection.vue'
