import { SECTION_ANCHORS } from '@/shared/data/sectionAnchors'
import type { ShellItem } from './types'

/**
 * The not-found page's content model (feature 36; Muush 1.0 since feature
 * 46, spec FR-039…FR-044, data-model § 3; pen extract-46 § 4; copy
 * `muush-1.0.md` § 4.9).
 *
 * The page lives in the shell rather than in a module of its own because it
 * is built only from the shell's vocabulary — route names, section anchors,
 * the destination resolver — and is reachable from every path
 * (`specs/036-not-found-page/research.md` R5).
 *
 * Feature 46 retired the v1 body (Roberto 2026-11-02): the "Error 404"
 * pill, the subtitle and the Servicios · Nosotros shortcuts are gone, per
 * the design. The page's `h1` no longer says "not found"; the document
 * title still does.
 *
 * Keys and destination descriptors only; `logic/` resolves both
 * (Constitution Article II).
 */

/** The primary button: the same-locale home. */
export const NOT_FOUND_HOME: ShellItem = {
  labelKey: 'shell.notFound.cta',
  destination: { kind: 'route', name: 'index' },
}

/** The glass button: the same-locale home's diagnóstico section. */
export const NOT_FOUND_ASSESSMENT: ShellItem = {
  labelKey: 'shell.notFound.assessment',
  destination: {
    kind: 'anchor',
    name: 'index',
    anchor: SECTION_ANCHORS.assessment,
  },
  track: {
    name: 'assessment_cta_click',
    params: { cta_location: 'not_found' },
  },
}

/** The other i18n keys of the page. */
export const NOT_FOUND_COPY_KEYS = {
  documentTitle: 'pages.notFound.title',
  headingFirst: 'shell.notFound.heading.first',
  headingSecond: 'shell.notFound.heading.second',
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
