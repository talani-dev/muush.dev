import {
  I18N_ROUTE_NAME_SEPARATOR,
  PAGE_KEY_BY_ROUTE,
} from '@/features/tracking/data/trackingConfig'
import {
  type PageKey,
  SITE_LOCALES,
  type TrackedLocale,
} from '@/shared/data/trackingEvents'

/**
 * Route-change facts as pure functions of paths (feature 49, research R2,
 * spec FR-022). A vue-router `path` never holds the hash or the query, so
 * an in-page jump to `#diagnostico` keeps the same path and is not a page.
 */

/**
 * A new page view: the path changed. `undefined` is the router's start
 * location (the first navigation of the document), already recorded by the
 * grant itself.
 */
export function isNewPage(
  fromPath: string | undefined,
  toPath: string
): boolean {
  if (fromPath === undefined) return false
  return withoutTrailingSlash(fromPath) !== withoutTrailingSlash(toPath)
}

/**
 * `/es/` and `/es` are one page: the static host serves the folder URL and
 * the router settles on the bare one (measured with the built site in
 * Chrome, 2026-11-07: without this, the first load and the `#diagnostico`
 * jump each counted a second page view).
 */
function withoutTrailingSlash(path: string): string {
  return path.length > 1 ? path.replace(/\/+$/, '') : path
}

function localeOf(path: string): TrackedLocale | undefined {
  const segment = path.split('/')[1]
  return SITE_LOCALES.find(locale => locale === segment)
}

/** Both locales when the first path segment switches language, else null. */
export function localeChange(
  fromPath: string | undefined,
  toPath: string
): { from_locale: TrackedLocale; to_locale: TrackedLocale } | null {
  if (fromPath === undefined) return null
  const from = localeOf(fromPath)
  const to = localeOf(toPath)
  if (!from || !to || from === to) return null
  return { from_locale: from, to_locale: to }
}

/** Home or Nosotros, from a localized route name (`index___es`). */
export function pageKeyOf(routeName: string | undefined): PageKey | undefined {
  if (routeName === undefined) return undefined
  const [base = ''] = routeName.split(I18N_ROUTE_NAME_SEPARATOR)
  return PAGE_KEY_BY_ROUTE[base]
}
