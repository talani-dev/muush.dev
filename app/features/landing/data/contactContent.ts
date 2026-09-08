/**
 * The `06 CTA final` section's own left-block content model — chrome only.
 * The seven-field form's content is `forms/`'s own (plan.md D-1); this file
 * never names a `forms.contact.*` key.
 */

/** The five `landing.contact.*` keys this section renders. */
export const CONTACT_KEYS = {
  eyebrow: 'landing.contact.eyebrow',
  /**
   * ⚠️ Placeholder pending Roberto/Clau (spec A-01). Not found documented
   * anywhere in `docs/business/` beyond the already-approved button labels —
   * a content gap, not a behavioural ambiguity. Reuses the approved
   * "Cuéntanos tu proyecto" string, capitalised and punctuated.
   */
  heading: 'landing.contact.heading',
  /**
   * ✅ Resolved (feature 23, 2026-09-08). The A-01 placeholder here was the
   * feature 16 session reading the wrong `.pen` node — `tNN0K`, a copy inside
   * the `DEMO spotlight cursor` frame, not the real landing (`bdyCz`/`nMffw`).
   * The real copy is now in `i18n/locales/{es,en}.json`.
   */
  body: 'landing.contact.body',
  /** Reuses the Hero's own approved string (spec data-model.md § 6). */
  ctaSecondary: 'landing.contact.ctaSecondary',
  /**
   * The alternate route's own lead-in question, e.g. "¿Ya sabes qué
   * necesitas?" — new in feature 23. Read from the same correct `.pen` node
   * as `body` above; the section shipped with no question line at all until
   * now, only the `ctaSecondary` link.
   */
  altQuestion: 'landing.contact.altQuestion',
} as const

export interface ContactContent {
  eyebrow: string
  heading: string
  body: string
  ctaSecondary: string
  /** The alternate route's lead-in question, rendered above `ctaSecondary`. */
  altQuestion: string
  /** Resolved from `CALL_BOOKING_URL` — always present, unlike the Hero's
   * optional `callHref`: this section ships after the decision landed. */
  callHref: string
}
