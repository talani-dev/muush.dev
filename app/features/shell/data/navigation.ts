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
 * The desktop nav's two links, as of the floating-nav redesign (feature 21):
 * `Servicios` then `Nosotros`.
 *
 * ⚠️ **Two deliberate divergences from the redesigned `.pen` frame
 * (`WGhSI`'s `Links` child), in opposite directions — do not "restore"
 * either one by comparing this array against the design file.**
 *
 * - **`Proyectos` is deliberately absent**, even though the frame draws it.
 *   Roberto's explicit instruction (2026-09-08): feature 15
 *   (`projects_section`) is `blocked` indefinitely, and a nav link to a
 *   section that does not exist yet reads as a broken site
 *   (`docs/business/landing/ui-map.md` § 6 — "un espacio reservado que
 *   parece clickeable y no lleva a nada"). A human decision that overrides
 *   the design file, not an inference (spec FR-006). Restoring it the day
 *   feature 15 ships is a one-entry change, back to `SHELL_ANCHORS.projects`.
 * - **`Servicios` is present**, even though
 *   `docs/business/landing/content.md` states "Servicios no está en el nav"
 *   as a settled decision. The redesigned frame postdates that document and
 *   wins per `docs/business/rules.md` § R32 (spec FR-007). This is a
 *   contradiction reported for a human to reconcile in `content.md` — not an
 *   agent's to fix, per the read-only policy on `docs/business/`.
 *
 * Order is render order, matching the frame's `Links` child and spec User
 * Story 2. `Nosotros` was already here and is unchanged.
 */
export const NAV_ITEMS: ShellItem[] = [
  {
    labelKey: 'shell.nav.services',
    destination: {
      kind: 'anchor',
      name: 'index',
      hash: SHELL_ANCHORS.services,
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
