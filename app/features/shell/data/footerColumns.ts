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
 * Three items carry `kind: 'none'`, and that is the deliberate rendering of
 * an open question rather than a gap: `Agenda una llamada` waits on
 * `decisions-open.md` #2 (the Google Calendar link), `FAQ` on #3 (the page
 * does not exist), and `Blog · próximamente` is specified with no link by the
 * design itself. All three render as plain text, so the three read as one
 * consistent treatment (spec FR-039). No URL is invented here.
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
        labelKey: 'shell.footer.nav.projects',
        destination: {
          kind: 'anchor',
          name: 'index',
          hash: SHELL_ANCHORS.projects,
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
        // decisions-open.md #2 — the Google Calendar link does not exist yet.
        destination: { kind: 'none' },
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
      {
        labelKey: 'shell.footer.muush.faq',
        // decisions-open.md #3 — the FAQ page does not exist yet.
        destination: { kind: 'none' },
      },
      {
        /*
         * One item, not two. The `·` lives inside the string
         * (`Blog · próximamente` / `Blog · coming soon`); splitting on it
         * would produce a phantom fifth item in this column.
         */
        labelKey: 'shell.footer.muush.blog',
        destination: { kind: 'none' },
      },
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
