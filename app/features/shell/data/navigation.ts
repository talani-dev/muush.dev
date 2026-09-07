import type { ShellItem } from './types'

/**
 * The nav and mobile-menu models.
 *
 * Every anchor destination names a **route** plus a hash, never a bare
 * fragment: the same items render on the About page, where `#proyectos`
 * alone points at nothing (spec FR-041).
 */

/** The section ids the landing owns, plus the one on About. */
export const SHELL_ANCHORS = {
  purpose: '#proposito',
  services: '#servicios',
  projects: '#proyectos',
  contact: '#contacto',
  work: '#work',
} as const

/**
 * The desktop nav's two links. `Servicios` is deliberately absent — a
 * decision recorded in `docs/business/landing/ui-map.md` § 2: it is reached
 * by scrolling from the hero.
 */
export const NAV_ITEMS: ShellItem[] = [
  {
    labelKey: 'shell.nav.projects',
    destination: {
      kind: 'anchor',
      name: 'index',
      hash: SHELL_ANCHORS.projects,
    },
  },
  {
    labelKey: 'shell.nav.about',
    destination: { kind: 'route', name: 'nosotros' },
  },
]

/** The primary button of the desktop nav. It has no mobile counterpart. */
export const NAV_CTA: ShellItem = {
  labelKey: 'shell.nav.cta',
  destination: { kind: 'anchor', name: 'index', hash: SHELL_ANCHORS.contact },
}

/**
 * The mobile menu carries four items where the desktop nav carries two:
 * `Propósito` and `Servicios` are included because the mobile scroll is much
 * longer (`ui-map.md` § 2).
 */
export const MENU_ITEMS: ShellItem[] = [
  {
    labelKey: 'shell.menu.purpose',
    destination: { kind: 'anchor', name: 'index', hash: SHELL_ANCHORS.purpose },
  },
  {
    labelKey: 'shell.menu.services',
    destination: {
      kind: 'anchor',
      name: 'index',
      hash: SHELL_ANCHORS.services,
    },
  },
  {
    labelKey: 'shell.menu.projects',
    destination: {
      kind: 'anchor',
      name: 'index',
      hash: SHELL_ANCHORS.projects,
    },
  },
  {
    labelKey: 'shell.menu.about',
    destination: { kind: 'route', name: 'nosotros' },
  },
]
