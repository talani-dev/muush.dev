import { SHELL_ANCHORS } from './navigation'
import type { ShellItem } from './types'

/**
 * The not-found page's content model (feature 36).
 *
 * Source of truth for content and order: Roberto's reference
 * (`specs/036-not-found-page/reference/404.html` and its `README.md`, § Qué
 * hay en la página). The page lives in the shell rather than in a module of
 * its own because it is built only from the shell's vocabulary — route names,
 * `SHELL_ANCHORS`, the destination resolver — and is reachable from every
 * path (`specs/036-not-found-page/research.md` R5).
 *
 * Keys and destination descriptors only; `logic/` resolves both
 * (Constitution Article II). No path literal: the About segment is translated
 * and lives in `nuxt.config.ts` alone.
 */

/** The LED button: the same-locale home. */
export const NOT_FOUND_HOME: ShellItem = {
  labelKey: 'shell.notFound.cta',
  destination: { kind: 'route', name: 'index' },
}

/** The shortcuts row, in render order (reference README § Qué hay en la página). */
export const NOT_FOUND_SHORTCUTS: ShellItem[] = [
  {
    labelKey: 'shell.notFound.shortcuts.purpose',
    destination: { kind: 'anchor', name: 'index', hash: SHELL_ANCHORS.purpose },
  },
  {
    labelKey: 'shell.notFound.shortcuts.services',
    destination: {
      kind: 'anchor',
      name: 'index',
      hash: SHELL_ANCHORS.services,
    },
  },
  {
    labelKey: 'shell.notFound.shortcuts.about',
    destination: { kind: 'route', name: 'about' },
  },
]

/** The other i18n keys of the page. */
export const NOT_FOUND_COPY_KEYS = {
  documentTitle: 'pages.notFound.title',
  eyebrow: 'shell.notFound.eyebrow',
  headline: 'shell.notFound.headline',
  body: 'shell.notFound.body',
  shortcutsLabel: 'shell.notFound.shortcutsLabel',
} as const

/**
 * The reference's robots value, verbatim. A not-found document must never be
 * indexed (spec FR-012); it also carries no canonical and no hreflang, which
 * holds by construction on an unmatched route (research R3 F19).
 */
export const NOT_FOUND_ROBOTS = 'noindex'

/**
 * `useState` key carrying the locale a not-found document was rendered in,
 * from the server to the client (see `logic/notFoundLocale.ts`).
 */
export const NOT_FOUND_LOCALE_STATE_KEY = 'shell:not-found-locale'
