/**
 * Composes the destination of the ES/EN toggle.
 *
 * Pure on purpose, and Nuxt-free on purpose. `useSwitchLocalePath` already
 * knows the route table; what it does **not** do is either of the two things
 * this repository is responsible for, and those two are what the unit tests
 * cover. A test asserting `switchLocalePath('en') === '/en/about'` would be
 * testing the library.
 *
 * 1. **Totality.** `SwitchLocalePathFunction` is typed `(locale) => string`
 *    and returns the **empty string** when the current route has no
 *    counterpart in the target locale. An empty `href` resolves to the
 *    current page: the visitor clicks the toggle, nothing happens, and there
 *    is no error anywhere to notice (`docs/business/rules.md` § R22). The
 *    other locale's home is a real destination; an empty string is not.
 *
 * 2. **The fragment.** A URL fragment is never sent to a server and does not
 *    exist when a static page is generated (`docs/business/rules.md` § R9),
 *    so it cannot be baked into the rendered `href`. Since spec FR-061 the
 *    toggle does not carry it at all: the fragment is dropped (point 3) and
 *    the visitor's position is kept by `useLocaleSwitchScroll` instead. With
 *    scripting unavailable the plain `href` still navigates to the equivalent
 *    route, landing at its top — a documented degradation, not a defect
 *    (spec FR-021).
 *
 * 3. **The fragment the library adds** (spec FR-061, Roberto 2026-11-01).
 *    `switchLocalePath` copies the current route's hash into the path it
 *    returns (`@nuxtjs/i18n` `routing.js`, `hash: route.hash`). On the
 *    client, after an in-page jump, the toggle's `href` therefore became
 *    `/en#servicios`, and Nuxt's router scrolled the other locale's page
 *    back to that section however far the visitor had scrolled since — the
 *    bug Roberto reported. Any fragment on `switchedPath` is dropped; only
 *    an explicit `hash` is ever appended. The toggle passes none since
 *    FR-061: it keeps the visitor's position instead
 *    (`localeSwitchScroll.ts`). Dropping it also keeps the client `href`
 *    equal to the prerendered one. The one exception is Preguntas
 *    (feature 51, spec FR-013): after mount, a topic its URL names is
 *    passed as the other locale's anchor (`localeSwitchHash.ts`), so
 *    `#precios` lands on `/en/faq#pricing`.
 *
 * @param switchedPath the other locale's path, possibly `''`
 * @param fallbackHome the other locale's home, used when there is no
 *   counterpart
 * @param hash the current fragment, with or without its leading `#`
 */
export function resolveLocaleDestination(
  switchedPath: string,
  fallbackHome: string,
  hash?: string
): string {
  const destination = withoutFragment(switchedPath) || fallbackHome
  const fragment = (hash ?? '').replace(/^#+/, '')

  if (fragment === '') return destination

  return `${destination}#${fragment}`
}

function withoutFragment(path: string): string {
  const index = path.indexOf('#')
  return index === -1 ? path : path.slice(0, index)
}
