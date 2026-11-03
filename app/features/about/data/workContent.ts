/**
 * "Trabaja con muush" content model (feature 46, data-model § 2; copy in
 * `docs/business/muush-1.0.md` § 4.8, pen extract-46 § 1.4). Chrome only:
 * the application form's own copy is `forms/`'s
 * (`useApplicationFormContent`), resolved by the page (Article III).
 *
 * "Áreas que sumamos" is stored in sentence case and drawn uppercase by
 * the shared `ReceivesList`, like "Lo que recibes".
 */
export type AreaKey = 'engineering' | 'design' | 'creative'

export const AREAS_ORDER: readonly AreaKey[] = [
  'engineering',
  'design',
  'creative',
]

export const WORK_KEYS = {
  pill: 'about.work.pill',
  headingFirst: 'about.work.heading.first',
  headingSecond: 'about.work.heading.second',
  body: 'about.work.body',
  areasLabel: 'about.work.areasLabel',
  area: (key: AreaKey) => `about.work.areas.${key}`,
} as const

/** What `logic/` hands `ui/`: already translated. */
export interface WorkContent {
  pill: string
  headingFirst: string
  headingSecond: string
  body: string
  areasLabel: string
  areas: readonly string[]
}
