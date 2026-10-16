import { LOCALE_PREFERENCE_COOKIE } from '@/features/shell/data/localePreference'

/**
 * Test-only: removes the preference cookie from the test DOM's jar so no test
 * sees another's write (Constitution Article X). Not collected by Vitest
 * (`*.test.ts` only) and imported by no application code.
 *
 * Expires at the epoch, **not** `Max-Age=0`: happy-dom 20 turns `Max-Age=0`
 * into "expires now" and only drops a cookie whose expiry is strictly in the
 * past, so a read in the same millisecond still saw `muush_locale=` and made
 * the "only rendered" toggle test flaky (feature 33 review, finding 1).
 */
export function clearLocalePreferenceCookie(): void {
  // biome-ignore lint/suspicious/noDocumentCookie: test cleanup of the real jar; happy-dom has no Cookie Store API
  document.cookie = `${LOCALE_PREFERENCE_COOKIE}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
}
