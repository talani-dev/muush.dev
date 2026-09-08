import { CALL_BOOKING_URL } from '@/shared/data/callBooking'
import { SHELL_ANCHORS } from './navigation'
import { SOCIAL_PROFILES } from './socialProfiles'
import type { FooterColumnModel } from './types'

/** The public mailbox and the public WhatsApp Business line (`overview.md`). */
export const SUPPORT_EMAIL = 'support@muush.dev'
export const WHATSAPP_URL = 'https://wa.me/525639060739'

/**
 * The four footer columns, in the order the design fixes. Exactly four exist,
 * and both their order and their contents come from
 * `design-extract.md` § 9.bis and § 10 — they are a constant, not a
 * parameter.
 *
 * `ui-map.md` § 8 lists the Navegación column in a different order
 * (Servicios first). It is **superseded** by `decisions-open.md` D4, which
 * settled the order as Propósito → Servicios → Proyectos → Nosotros in both
 * viewports.
 *
 * `Agenda una llamada` was the third `kind: 'none'` item until 2026-09-07,
 * when `decisions-open.md` #2 resolved and gave it a real destination. Its
 * href is the shared constant, not a literal: the same URL is the Hero's
 * secondary CTA and will be the final CTA's, and the decision scoped it to
 * all three at once.
 *
 * ⚠️ **Feature 23 (2026-09-08), Roberto's explicit call — same class of
 * decision as dropping `Proyectos` from the main nav in feature 21.** The
 * `.pen` still draws all three of `Proyectos` (Navegación column), `FAQ` and
 * `Blog · próximamente` (muush column). They shipped as inert placeholders
 * (`kind: 'none'`, or an anchor to a section that does not exist) rather than
 * being absent, and Roberto asked for them to be gone entirely, not merely
 * inert:
 *
 * - `Proyectos` pointed at `#proyectos`, and feature 15 (`projects_section`)
 *   is `blocked` indefinitely — same reasoning `navigation.ts` already
 *   records for dropping it from the nav.
 * - `FAQ` was `kind: 'none'` under `decisions-open.md` #3 (the page does not
 *   exist).
 * - `Blog · próximamente` was `kind: 'none'` by the design's own "próximamente"
 *   label.
 *
 * Restoring any of the three is a one-entry change, back to the shapes this
 * comment describes, the day its blocker resolves.
 */
export const FOOTER_COLUMNS: FooterColumnModel[] = [
  {
    titleKey: 'shell.footer.nav.title',
    items: [
      {
        labelKey: 'shell.footer.nav.purpose',
        destination: {
          kind: 'anchor',
          name: 'index',
          hash: SHELL_ANCHORS.purpose,
        },
      },
      {
        labelKey: 'shell.footer.nav.services',
        destination: {
          kind: 'anchor',
          name: 'index',
          hash: SHELL_ANCHORS.services,
        },
      },
      {
        labelKey: 'shell.footer.nav.about',
        destination: { kind: 'route', name: 'nosotros' },
      },
    ],
  },
  {
    titleKey: 'shell.footer.contact.title',
    items: [
      {
        labelKey: 'shell.footer.contact.call',
        /*
         * decisions-open.md #2, resolved 2026-09-07. `external` is what gives
         * it the new tab and the severed opener the decision asks for; the
         * href is never written here, only named.
         */
        destination: { kind: 'external', href: CALL_BOOKING_URL },
      },
      {
        labelKey: 'shell.footer.contact.email',
        destination: { kind: 'external', href: `mailto:${SUPPORT_EMAIL}` },
      },
      {
        labelKey: 'shell.footer.contact.whatsapp',
        destination: {
          kind: 'external',
          href: WHATSAPP_URL,
          messageKey: 'shell.footer.whatsappMessage',
        },
      },
    ],
  },
  {
    titleKey: 'shell.footer.muush.title',
    items: [
      {
        labelKey: 'shell.footer.muush.work',
        destination: {
          kind: 'anchor',
          name: 'nosotros',
          hash: SHELL_ANCHORS.work,
        },
      },
      // FAQ and `Blog · próximamente` removed entirely, feature 23 — see the
      // divergence note above this array.
    ],
  },
  {
    titleKey: 'shell.footer.social.title',
    /*
     * Text links, not the 48×48 `SocialIcon` buttons — those appear only in
     * the mobile menu (`design-extract.md` § 8). The URLs are read from the
     * one record that owns them, so the footer and the menu can never drift.
     */
    items: SOCIAL_PROFILES.map(profile => ({
      labelKey: profile.labelKey,
      destination: { kind: 'external' as const, href: profile.href },
    })),
  },
]
