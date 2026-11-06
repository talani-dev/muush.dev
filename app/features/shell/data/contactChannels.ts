import { FOOTER_DESTINATIONS } from './footerColumns'
import type { ContactChannel, ShellItem } from './types'

/**
 * The mobile footer's own models (feature 43, data-model § 4; pen
 * extract-43 § 6, frame `kJfw5`; `muush-1.0.md` § 4.9). Destinations are the
 * desktop columns' (`FOOTER_DESTINATIONS`), so the two footers cannot point
 * at different places.
 */

/** Contact first, as full-width buttons with a hint on the right. */
export const MOBILE_CONTACT_CHANNELS: ContactChannel[] = [
  {
    labelKey: 'shell.footer.contact.whatsapp',
    hintKey: 'shell.footer.contact.hints.whatsapp',
    destination: FOOTER_DESTINATIONS.whatsapp,
  },
  {
    labelKey: 'shell.footer.contact.call',
    hintKey: 'shell.footer.contact.hints.call',
    destination: FOOTER_DESTINATIONS.call,
  },
  {
    labelKey: 'shell.footer.contact.email',
    hintKey: 'shell.footer.contact.hints.email',
    destination: FOOTER_DESTINATIONS.email,
  },
]

/**
 * The links on one wrapped line, "Inicio" / "Home" first (added by Roberto
 * 2026-11-01). Preguntas follows Nosotros (feature 46, spec FR-031,
 * Roberto 2026-11-02); the blog is text until it exists.
 */
export const MOBILE_FOOTER_LINKS: ShellItem[] = [
  {
    labelKey: 'shell.footer.nav.home',
    destination: FOOTER_DESTINATIONS.home,
  },
  {
    labelKey: 'shell.footer.nav.services',
    destination: FOOTER_DESTINATIONS.services,
  },
  {
    labelKey: 'shell.footer.nav.howWeWork',
    destination: FOOTER_DESTINATIONS.howWeWork,
  },
  {
    labelKey: 'shell.footer.nav.about',
    destination: FOOTER_DESTINATIONS.about,
  },
  {
    labelKey: 'shell.footer.muush.faq',
    destination: FOOTER_DESTINATIONS.faq,
  },
  {
    labelKey: 'shell.footer.muush.work',
    destination: FOOTER_DESTINATIONS.workWithUs,
  },
  {
    labelKey: 'shell.footer.muush.blogInline',
    destination: FOOTER_DESTINATIONS.none,
  },
]

/**
 * Privacy notice and Terms, in both footers' bottom rows: their own pages
 * since feature 48 (`muush-1.0.md` § 1, pen-extract-48 § 4).
 */
export const LEGAL_ITEMS: ShellItem[] = [
  {
    labelKey: 'shell.footer.legal.privacy',
    destination: FOOTER_DESTINATIONS.privacy,
  },
  {
    labelKey: 'shell.footer.legal.terms',
    destination: FOOTER_DESTINATIONS.terms,
  },
]
