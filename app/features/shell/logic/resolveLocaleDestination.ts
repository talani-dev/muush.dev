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
 *    so it cannot be baked into the rendered `href`. It is read at click time
 *    and composed here. With scripting unavailable the plain `href` still
 *    navigates to the equivalent route, landing at its top — a documented
 *    degradation, not a defect (spec FR-021).
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
  const destination = switchedPath || fallbackHome
  const fragment = (hash ?? '').replace(/^#+/, '')

  if (fragment === '') return destination

  return `${destination}#${fragment}`
}
