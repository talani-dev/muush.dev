/**
 * The Work with muush section's content model: the three i18n keys its left
 * text block renders. Sibling to `aboutHeroContent.ts` — same reasoning:
 * `ui/WorkWithMuushSection.vue` renders the Pill, headline and body from
 * already-translated props, and the eight-field form's own content is
 * resolved separately, by `forms/useApplicationFormContent` (Constitution
 * Article III — `about/` never reaches into `forms/logic/` internals,
 * only its barrel).
 *
 * No import at all — the trivial case of Article II's dependency direction
 * rule: this file has nothing to depend on.
 */

/** The three i18n keys the section's left block renders. Keys, never copy
 * (Article VI). */
export const WORK_KEYS = {
  /** Pill instance — `design-extract.md` § 3 lists it alongside `Nosotros`,
   * `Equipo` and `Network` for this page. */
  eyebrow: 'about.work.eyebrow',
  headline: 'about.work.headline',
  body: 'about.work.body',
} as const

/** What `logic/` hands `ui/`: already translated. */
export interface WorkContent {
  eyebrow: string
  headline: string
  body: string
}
