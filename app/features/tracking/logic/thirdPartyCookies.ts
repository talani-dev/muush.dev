/**
 * Removes a revoked tool's first-party cookies from muush.dev (feature 49,
 * spec FR-012, research R3). Google and Meta write theirs on the widest
 * domain they can (`.muush.dev`), so each name is expired both host-only and
 * on the dot-domain, at path `/`. Cookies set by the vendors on their own
 * domains are out of the site's reach (spec Assumptions).
 */

/** A host-only write plus `.host`, and `.example.com` for a subdomain. */
function cookieDomains(hostname: string): (string | undefined)[] {
  const labels = hostname.split('.')
  if (labels.length < 2) return [undefined]
  const registrable = labels.slice(-2).join('.')
  return [...new Set([undefined, `.${hostname}`, `.${registrable}`])]
}

export function expireCookies(
  names: readonly string[],
  hostname: string,
  jar: { cookie: string }
): void {
  for (const name of names) {
    for (const domain of cookieDomains(hostname)) {
      const scope = domain === undefined ? '' : `; domain=${domain}`
      jar.cookie = `${name}=; max-age=0; path=/${scope}`
    }
  }
}
