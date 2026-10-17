import type { NuxtApp } from '#app'
import { NOT_FOUND_LOCALE_STATE_KEY } from '@/features/shell/data/notFound'
import type { ShellLocale } from '@/features/shell/data/types'

/**
 * Which language the not-found page renders in (feature 36), applied through
 * `@nuxtjs/i18n`'s public `i18n:beforeLocaleSwitch` hook, whose documented
 * contract is "mutate `data.newLocale`".
 *
 * Two rules, in order:
 *
 * 1. **Hydration keeps the served document's language** (spec FR-002). The
 *    edge serves a prerendered not-found document at whatever missing URL was
 *    requested — in Stage 1 (gate G5) the ENGLISH one for every path, `/es/*`
 *    included. Left alone, i18n detects `es` from `/es/nada` and switches
 *    before Vue hydrates: Spanish copy, a hydration mismatch, and a language
 *    button pointing at the language already showing (measured in headless
 *    Chrome, implementation report § 4). So while hydrating, the locale the
 *    server recorded wins.
 *
 * 2. **A not-found page rendered at runtime picks its language by prefix,
 *    defaulting to English** (Roberto, 2026-10-15, spec § Gate G6): `/es…` →
 *    es, `/en…` → en, any other path (`/xyz`, `/fr/es`) → en. Since feature 37
 *    i18n's own fallback there (`defaultLocale`) is also en, but this rule is
 *    kept explicit so it never depends on that setting. It applies only to
 *    the initial locale of a request whose path matches no route; every page
 *    that exists, and `/` (rootRedirect), are left to i18n untouched. The
 *    prerendered `/es/404` and `/en/404` resolve to es/en by their prefix, so
 *    the two documents are unchanged.
 *
 * Every later switch — the visitor following a link or the language button —
 * is left alone.
 */

/** Locale of a path for the not-found page: its prefix, else English. */
export function notFoundLocaleForPath(path: string): ShellLocale {
  const prefix = path.split('/')[1]
  return prefix === 'es' ? 'es' : 'en'
}

export interface LocaleSwitchRequest<L extends string> {
  /** The locale `@nuxtjs/i18n` is about to switch to. */
  requested: L
  /** The locale a server-rendered not-found document recorded, if any. */
  rendered: L | undefined
  /** True while the server-rendered document is being hydrated. */
  hydrating: boolean
  /** True for the request's initial locale, false for later switches. */
  initialSetup: boolean
  /** The request path when it matches no route (and is not `/`), else undefined. */
  unmatchedPath: string | undefined
}

/** The locale to switch to, per the two rules above. */
export function resolveNotFoundLocale<L extends string>({
  requested,
  rendered,
  hydrating,
  initialSetup,
  unmatchedPath,
}: LocaleSwitchRequest<L>): L | ShellLocale {
  if (hydrating && rendered) return rendered
  if (initialSetup && unmatchedPath !== undefined)
    return notFoundLocaleForPath(unmatchedPath)
  return requested
}

/**
 * The URL being rendered. On the server this is `ssrContext.url`, not
 * `useRequestURL()`: when Nuxt renders an error at runtime (`nuxt dev`) the
 * request is re-issued as `/__nuxt_error?url=…`, and only `ssrContext.url`
 * carries the visitor's path (it is what the router initialises from).
 */
function renderedPath(nuxtApp: NuxtApp): string {
  const url = import.meta.server
    ? (nuxtApp.ssrContext?.url ?? '/')
    : window.location.pathname
  return new URL(url, 'http://localhost').pathname
}

/** The rendered path if no route matches it; `/` is the rootRedirect's, never a 404. */
function unmatchedRenderedPath(nuxtApp: NuxtApp): string | undefined {
  const pathname = renderedPath(nuxtApp)
  if (pathname === '/') return undefined
  return nuxtApp.$router.resolve(pathname).matched.length === 0
    ? pathname
    : undefined
}

/**
 * Registers the hook, on the server and on the client. Called from
 * `app/plugins/` with `enforce: 'pre'`, so it is in place before
 * `@nuxtjs/i18n` detects the initial locale. State and path are read inside
 * the hook, after the payload has been revived and the router installed.
 */
export function applyNotFoundLocaleRule(nuxtApp: NuxtApp): void {
  const rendered = useState<ShellLocale | undefined>(NOT_FOUND_LOCALE_STATE_KEY)

  nuxtApp.hook('i18n:beforeLocaleSwitch', switchRequest => {
    const resolved = resolveNotFoundLocale({
      requested: switchRequest.newLocale,
      rendered: rendered.value,
      hydrating: import.meta.client && nuxtApp.isHydrating === true,
      initialSetup: switchRequest.initialSetup,
      unmatchedPath: switchRequest.initialSetup
        ? unmatchedRenderedPath(nuxtApp)
        : undefined,
    })
    switchRequest.newLocale = resolved
  })
}
