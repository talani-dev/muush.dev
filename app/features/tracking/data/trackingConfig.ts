import type { PageKey, TrackingEventName } from '@/shared/data/trackingEvents'

/**
 * The tracking feature's constants (feature 49, data-model §§ 4–5). The two
 * IDs are not here: they are public runtime configuration in
 * `nuxt.config.ts`, never written under `app/` (Constitution Article XI).
 */

/** gtag.js, loaded as `${GA_SCRIPT_URL}?id=<measurement id>`. */
export const GA_SCRIPT_URL = 'https://www.googletagmanager.com/gtag/js'

/** The Meta Pixel base code's own script (Meta's standard install). */
export const META_SCRIPT_URL = 'https://connect.facebook.net/en_US/fbevents.js'

/**
 * The `_ga` cookie lifetime, in seconds (`cookie_expires`, Google tag
 * docs "Configure and customize cookies", checked 2026-11-07): 420 days.
 * Fourteen calendar months are never shorter than 424 days, so this is
 * always within the notice's "hasta 14 meses" (Roberto 2026-11-05, spec
 * FR-014, research R3).
 */
export const GA_COOKIE_LIFETIME_SECONDS = 36_288_000

/** GA4's first-party cookies: `_ga` and `_ga_<measurement id without G->`. */
export function gaCookieNames(measurementId: string): string[] {
  return ['_ga', `_ga_${measurementId.replace(/^G-/, '')}`]
}

/** The Meta Pixel's first-party cookie. */
export const META_COOKIE_NAMES = ['_fbp'] as const

/**
 * The only events Meta receives besides `PageView` (spec FR-025). The
 * talent application and every other event never reach it.
 */
export const META_EVENT_BY_NAME: Partial<Record<TrackingEventName, string>> = {
  book_call_click: 'Schedule',
  contact_click: 'Contact',
  generate_lead: 'Lead',
}

/** Section visits shorter than this are not reported (tracking plan § 5). */
export const MIN_VISIT_MS = 1000

/** A longer visit is reported as this many seconds (a forgotten tab). */
export const MAX_VISIT_SECONDS = 600

/**
 * "In view": at least this share of the section, or of the viewport for a
 * section taller than it, is visible (tracking plan § 5).
 */
export const IN_VIEW_SHARE = 0.5

/**
 * The observer's thresholds. Denser than research R8's `[0, 0.5, 1]`: a
 * section taller than the viewport reaches "half the viewport" at no fixed
 * ratio of its own, so the observer must call back often enough to notice.
 */
export const SECTION_OBSERVER_THRESHOLDS = Array.from(
  { length: 21 },
  (_, step) => step / 20
)

/** The pages whose sections are timed, by route base name. */
export const PAGE_KEY_BY_ROUTE: Readonly<Record<string, PageKey>> = {
  index: 'home',
  about: 'about',
}

/**
 * `@nuxtjs/i18n` names each localized route `<base>___<locale>` (its
 * default `routesNameSeparator`, not overridden in `nuxt.config.ts`).
 */
export const I18N_ROUTE_NAME_SEPARATOR = '___'
