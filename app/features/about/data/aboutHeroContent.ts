/**
 * The About Hero's content model: the three i18n keys it renders.
 *
 * Unlike the landing Hero (`landing/data/heroContent.ts`), this section has no
 * destinations to resolve — `ui-map.md` § 9 documents "Hero About" as
 * "Estático, sin botones", so there is no CTA row and nothing here mirrors
 * `HeroDestinations`.
 *
 * No import at all, which is what Article II calls the trivial case of the
 * dependency direction rule: this file has nothing to depend on.
 */

/** The three i18n keys the About Hero renders. Keys, never copy (Article VI). */
export const ABOUT_HERO_KEYS = {
  /**
   * "Nosotros" — the Pill instance `design-extract.md` § 3 lists for this
   * page's Hero, alongside `Equipo`, `Network` and `Work with muush`.
   */
  eyebrow: 'about.hero.eyebrow',
  headline: 'about.hero.headline',
  intro: 'about.hero.intro',
} as const

/**
 * What `logic/` hands `ui/`: already translated. No optional destination
 * field — every field here always renders (contrast with `HeroContent` in
 * `landing/data/heroContent.ts`, whose two href fields are each optional).
 */
export interface AboutHeroContent {
  eyebrow: string
  headline: string
  intro: string
}
