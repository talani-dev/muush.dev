/**
 * The visitor's explicit language choice, kept as a first-party cookie.
 *
 * - Written **only** by the language toggle, on click, with the destination
 *   locale (`logic/localePreference.ts`).
 * - **Never read by the site.** Nothing in a page changes because of it.
 * - Read only by muush-foundation's edge function, and only at `/`, to
 *   choose between `/es` and `/en` before the country rule applies.
 * - Holds only `es` or `en` (`ShellLocale`): no identifier, timestamp or
 *   country.
 *
 * The name and lifetime are a cross-repository contract:
 * `specs/033-ip-locale-root-redirect/contracts/locale-preference-cookie.md`.
 * Renaming either breaks the edge's reader silently.
 */
import type { ShellLocale } from '@/features/shell/data/types'

/** Not `i18n_redirected`: that is `@nuxtjs/i18n`'s own cookie (research R6). */
export const LOCALE_PREFERENCE_COOKIE = 'muush_locale'

/** 365 days, renewed on every toggle click (gate G4). */
export const LOCALE_PREFERENCE_MAX_AGE_SECONDS = 31_536_000

/** The only values the cookie ever holds. */
export type LocalePreference = ShellLocale
