/**
 * The Nosotros hero's content model (feature 46, data-model § 2; copy in
 * `docs/business/muush-1.0.md` § 4.8, pen extract-46 §§ 1.1, 2). Static,
 * no destinations: the section has no buttons.
 */
export const ABOUT_HERO_KEYS = {
  pill: 'about.hero.pill',
  headingFirst: 'about.hero.heading.first',
  headingSecond: 'about.hero.heading.second',
  intro: 'about.hero.intro',
} as const

/** What `logic/` hands `ui/`: already translated. */
export interface AboutHeroContent {
  pill: string
  headingFirst: string
  headingSecond: string
  intro: string
}
