/**
 * Servicios content model (feature 44, data-model §§ 4–5; copy in
 * `docs/business/muush-1.0.md` § 4.4, icons and edge lights in pen
 * extract-44 § 3.1). Card titles keep the design's forced line break as
 * `\n` in the locale files (pen extract-44 § 8).
 */
export type ServiceIcon =
  | 'compass'
  | 'layout-dashboard'
  | 'workflow'
  | 'pen-tool'

/** The card's edge light: colour and the corner it comes from. */
export type ServiceLight =
  | 'crimsonBottomLeft'
  | 'aceroBottomRight'
  | 'arenaTopRight'

export type ServiceKey = 'strategy' | 'software' | 'automation' | 'design'

export interface ServiceCardModel {
  key: ServiceKey
  icon: ServiceIcon
  light: ServiceLight
}

/** In the order the `.pen` draws them. */
export const SERVICE_CARDS: readonly ServiceCardModel[] = [
  { key: 'strategy', icon: 'compass', light: 'crimsonBottomLeft' },
  { key: 'software', icon: 'layout-dashboard', light: 'aceroBottomRight' },
  { key: 'automation', icon: 'workflow', light: 'crimsonBottomLeft' },
  { key: 'design', icon: 'pen-tool', light: 'arenaTopRight' },
]

export const SERVICES_KEYS = {
  pill: 'landing.services.pill',
  headingFirst: 'landing.services.heading.first',
  headingSecond: 'landing.services.heading.second',
  cardTitle: (key: ServiceKey) => `landing.services.cards.${key}.title`,
  cardDescription: (key: ServiceKey) =>
    `landing.services.cards.${key}.description`,
  alsoLabel: 'landing.services.also.label',
  alsoChips: [
    'landing.services.also.creative',
    'landing.services.also.marketing',
  ],
  alsoNote: 'landing.services.also.note',
} as const

export interface ServiceCardContent {
  title: string
  description: string
  icon: ServiceIcon
  light: ServiceLight
}

export interface ServicesContent {
  pill: string
  headingFirst: string
  headingSecond: string
  cards: ServiceCardContent[]
  also: { label: string; chips: string[]; note: string }
}
