/**
 * "Cómo se arma" content model (feature 46, data-model § 2; copy in
 * `docs/business/muush-1.0.md` § 4.8, pen extract-46 § 1.2): the pill, the
 * two-tone heading and the three ways people join a project, in the order
 * the `.pen` draws them. Each kind also names its dot colour in the card.
 */
export type CompositionKind = 'team' | 'pool' | 'partner'

export const COMPOSITION_ORDER: readonly CompositionKind[] = [
  'team',
  'pool',
  'partner',
]

export const TEAM_COMPOSITION_KEYS = {
  pill: 'about.composition.pill',
  headingFirst: 'about.composition.heading.first',
  headingSecond: 'about.composition.heading.second',
  card: (kind: CompositionKind) => ({
    label: `about.composition.cards.${kind}.label`,
    title: `about.composition.cards.${kind}.title`,
    text: `about.composition.cards.${kind}.text`,
  }),
} as const

export interface CompositionCardContent {
  kind: CompositionKind
  label: string
  title: string
  text: string
}

export interface TeamCompositionContent {
  pill: string
  headingFirst: string
  headingSecond: string
  cards: CompositionCardContent[]
}
