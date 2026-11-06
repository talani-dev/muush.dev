import { SECTION_ANCHORS } from '@/shared/data/sectionAnchors'
import type { ShellItem } from './types'

/**
 * The header and mobile-menu models of Muush 1.0 (feature 43, data-model
 * § 3; pen extract-43 §§ 2, 4, 8; `muush-1.0.md` § 4.1).
 *
 * Anchors name a route plus a declared section id, never a bare fragment:
 * the same items render on Nosotros and on the 404, where `#servicios`
 * alone points at nothing (spec FR-026).
 *
 * The Home item comes first (added by Roberto 2026-11-01, superseding
 * "no Home item", pen extract-43 § 9 Q1): "Inicio" / "Home", the top of the
 * current locale's home, lit only there while no section is in view. The
 * logo stays a home link too.
 *
 * Preguntas is not in the link bar or the menu, permanently (Roberto,
 * feature 43; confirmed at the feature 46 gate, 2026-11-02): the bar stays
 * Inicio · Servicios · Nosotros, and the `.pen`'s "Preguntas" nav link is
 * ignored. The page is linked from both footers (`footerColumns.ts`,
 * `contactChannels.ts`) and listed in the sitemap.
 */
/** The Home item, shared by the link bar and the menu. */
export const NAV_HOME: ShellItem = {
  labelKey: 'shell.nav.homeLink',
  destination: { kind: 'top', name: 'index' },
}

export const NAV_ITEMS: ShellItem[] = [
  NAV_HOME,
  {
    labelKey: 'shell.nav.services',
    destination: {
      kind: 'anchor',
      name: 'index',
      anchor: SECTION_ANCHORS.services,
    },
  },
  {
    labelKey: 'shell.nav.about',
    destination: { kind: 'route', name: 'about' },
  },
]

/**
 * The desktop header's primary button, "Diagnóstico gratis" / "Free
 * assessment" (`muush-1.0.md` § 1). Shown on every page, the home page's top
 * and the 404 included (spec FR-004, confirmed by Roberto 2026-11-01). The
 * mobile bar has no CTA (pen extract-43 § 3).
 */
export const NAV_CTA: ShellItem = {
  labelKey: 'shell.nav.cta',
  destination: {
    kind: 'anchor',
    name: 'index',
    anchor: SECTION_ANCHORS.assessment,
  },
}

/** The open menu lists the same items as the link bar (pen extract-43 § 4). */
export const MENU_ITEMS: ShellItem[] = NAV_ITEMS
