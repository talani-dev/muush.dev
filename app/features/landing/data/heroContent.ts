import { CALL_BOOKING_URL } from '@/shared/data/callBooking'

/**
 * The Hero's content model: the keys it renders, its two destinations, and the
 * shape `logic/` hands `ui/`.
 *
 * Its one import is a shared constant from `app/shared/data/`, which is the
 * direction Article III allows and the only way `landing` and `shell` can name
 * the same URL without either reading the other's internals. It imports nothing
 * from `logic/` or from `ui/`, which is what Article II governs.
 */

/** The five i18n keys the Hero renders. Keys, never copy (Article VI). */
export const HERO_KEYS = {
  /**
   * ⚠️ `Technology solution studio` in **both** locales, on purpose. It is
   * English inside the Spanish page, verified in all four design frames, and
   * `tests/landing-copy.test.ts` holds the two files byte-identical for this
   * key so a later i18n pass cannot "fix" it (spec FR-009).
   */
  eyebrow: 'landing.hero.eyebrow',
  headline: 'landing.hero.headline',
  subhead: 'landing.hero.subhead',
  ctaPrimary: 'landing.hero.ctaPrimary',
  /** No `→` in the string: the arrow belongs to `LinkArrow` (spec FR-010). */
  ctaSecondary: 'landing.hero.ctaSecondary',
} as const

/**
 * Where the Hero's two controls point. One is now filled and one is still
 * blocked, and the record is the same shape for both:
 *
 * - `callUrl` **landed on 2026-09-07**. `decisions-open.md` #2 is resolved and
 *   the destination is `CALL_BOOKING_URL`. The secondary CTA is therefore a
 *   real `LinkArrow` in `bone-100`, with its arrow, opening in a new tab —
 *   which is what `ui-map.md` § 3 has always specified for it. The white text
 *   and the arrow arrived by construction with the href; neither was styled in.
 * - `contactHash` waits on section 05, which does not exist. While it is
 *   absent the primary CTA renders as a real button and emits no fragment
 *   into the generated HTML.
 *
 * Filling either is a one-key change **here**, with no component markup
 * touched. That was the claim the call link has now proven: the day the URL
 * arrived, this file was the only one that had to say so. Neither may be filled
 * with a substitute destination: not the footer, not `mailto:`, not WhatsApp,
 * not a scroll to an arbitrary position (spec FR-014).
 */
export interface HeroDestinations {
  callUrl?: string
  contactHash?: string
}

export const HERO_DESTINATIONS: HeroDestinations = {
  callUrl: CALL_BOOKING_URL,
}

/**
 * What `logic/` hands `ui/`: already translated, already resolved.
 *
 * An absent destination is an **absent key**, not `undefined` — the shape
 * `useShellNavigation` already uses, and what makes a control with no
 * destination structurally a label and nothing else.
 */
export interface HeroContent {
  eyebrow: string
  headline: string
  subhead: string
  ctaPrimary: string
  ctaSecondary: string
  /** Absent → the primary CTA is a `<button>`, not a link. */
  contactHref?: string
  /** Absent → the secondary CTA is a `<span>`, not a link. */
  callHref?: string
}
