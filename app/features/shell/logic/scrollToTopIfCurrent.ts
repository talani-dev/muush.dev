/**
 * The Home item's click on the page it points at (Home link added by
 * Roberto 2026-11-01).
 *
 * The router ignores a link to the URL already shown: vue-router reports a
 * duplicated navigation and Nuxt's scroll behaviour returns `false` for the
 * same path with no hash. So "Inicio" clicked on `/es`, scrolled down, would
 * do nothing. This scrolls to the top instead, as a plain anchor to the
 * same page would. With a hash in the URL (after a section jump) the router
 * already scrolls to the top, so nothing is done here.
 *
 * `scrollTo` without `behavior` follows `html`'s `scroll-behavior`: smooth
 * when motion is allowed, instant under reduced motion (global.css).
 */

type PageLocation = Pick<Location, 'href' | 'pathname' | 'hash'>

const withoutTrailingSlash = (path: string) => path.replace(/\/+$/, '') || '/'

/** Whether `href` is the page shown, with no hash on either side. */
export function isCurrentPageWithoutHash(
  href: string,
  location: PageLocation
): boolean {
  const target = new URL(href, location.href)
  if (target.hash || location.hash) return false
  return (
    withoutTrailingSlash(target.pathname) ===
    withoutTrailingSlash(location.pathname)
  )
}

/** Scrolls to the top when `href` is the page shown (see above). */
export function scrollToTopIfCurrent(href: string | undefined): void {
  if (!href || !isCurrentPageWithoutHash(href, window.location)) return
  window.scrollTo({ top: 0, left: 0 })
}
