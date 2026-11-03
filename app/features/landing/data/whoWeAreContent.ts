import type { MapCopy } from '@/shared/data/mapCopy'

/**
 * "Qué es muush" content model (feature 44, data-model §§ 4–5; copy in
 * `docs/business/muush-1.0.md` § 4.3 and pen extract-44 § 2.1).
 *
 * Feature 46 (spec FR-017, research R3): the map's labels (legend, tabs,
 * cities) moved to the shared `map.*` keys of `@/shared/data/mapCopy`, so
 * the home and Nosotros read one source. Only the section's own copy stays
 * here.
 */
export const WHO_WE_ARE_KEYS = {
  pill: 'landing.whoWeAre.pill',
  headingFirst: 'landing.whoWeAre.heading.first',
  headingSecond: 'landing.whoWeAre.heading.second',
  body: 'landing.whoWeAre.body',
} as const

export interface WhoWeAreContent extends MapCopy {
  pill: string
  headingFirst: string
  headingSecond: string
  body: string
}
