import {
  LOCALE_PREFERENCE_COOKIE,
  LOCALE_PREFERENCE_MAX_AGE_SECONDS,
  type LocalePreference,
} from '@/features/shell/data/localePreference'

/**
 * The exact `Set-Cookie`-style string of
 * `specs/033-ip-locale-root-redirect/contracts/locale-preference-cookie.md`
 * § 1. The attribute order is fixed so a test can assert equality.
 *
 * `Path=/` is what lets the edge see it at `/` (the toggle runs under
 * `/es/…` and `/en/…`). No `Domain`: host-only, never sent to a subdomain.
 */
export function serializeLocalePreference(locale: LocalePreference): string {
  return `${LOCALE_PREFERENCE_COOKIE}=${locale}; Path=/; Max-Age=${LOCALE_PREFERENCE_MAX_AGE_SECONDS}; SameSite=Lax; Secure`
}

/**
 * Records the visitor's explicit choice. Only the language toggle calls
 * this, from its click handler — which never runs during prerender, so no
 * `typeof document` guard is needed. The site never reads the value back.
 *
 * `target` is injectable so tests can count writes without touching the
 * real cookie jar.
 */
export function rememberLocalePreference(
  locale: LocalePreference,
  target: Pick<Document, 'cookie'> = document
): void {
  target.cookie = serializeLocalePreference(locale)
}
