/**
 * The `06 CTA final` section's own left-block content model — chrome only.
 * The seven-field form's content is `forms/`'s own (plan.md D-1); this file
 * never names a `forms.contact.*` key.
 */

/** The four `landing.contact.*` keys this section renders. */
export const CONTACT_KEYS = {
  eyebrow: 'landing.contact.eyebrow',
  /**
   * ⚠️ Placeholder pending Roberto/Clau (spec A-01). Not found documented
   * anywhere in `docs/business/` beyond the already-approved button labels —
   * a content gap, not a behavioural ambiguity. Reuses the approved
   * "Cuéntanos tu proyecto" string, capitalised and punctuated.
   */
  heading: 'landing.contact.heading',
  /** ⚠️ Placeholder pending Roberto/Clau (spec A-01). */
  body: 'landing.contact.body',
  /** Reuses the Hero's own approved string (spec data-model.md § 6). */
  ctaSecondary: 'landing.contact.ctaSecondary',
} as const

export interface ContactContent {
  eyebrow: string
  heading: string
  body: string
  ctaSecondary: string
  /** Resolved from `CALL_BOOKING_URL` — always present, unlike the Hero's
   * optional `callHref`: this section ships after the decision landed. */
  callHref: string
}
