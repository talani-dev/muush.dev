import type { MapCopy } from '@/shared/data/mapCopy'

/**
 * "Dónde estamos" content model (feature 46, data-model § 2; copy in
 * `docs/business/muush-1.0.md` § 4.8, pen extract-46 §§ 1.3, 2). The map's
 * labels are the shared `map.*` keys the home reads too (spec FR-017), so
 * only the section's own copy is keyed here.
 */
export const WHERE_WE_ARE_KEYS = {
  pill: 'about.where.pill',
  headingFirst: 'about.where.heading.first',
  headingSecond: 'about.where.heading.second',
  body: 'about.where.body',
} as const

export interface WhereWeAreContent extends MapCopy {
  pill: string
  headingFirst: string
  headingSecond: string
  body: string
}
