import type { ShellLocale } from '@/features/shell/data/types'

/** What the switch needs from `useI18n()`, and nothing else. */
export interface InPlaceLocaleSwitchDeps {
  /** `@nuxtjs/i18n`'s loader; a no-op for a locale already loaded. */
  loadLocaleMessages: (locale: ShellLocale) => Promise<void>
  /** The active locale, writable. */
  locale: { value: string }
}

/**
 * Switches the language of the page being shown without navigating
 * (feature 39). Used only on the not-found page, which has no route to
 * switch to: the visitor stays at the URL they typed and the copy, the
 * links, `<html lang>` and the title follow the locale reactively.
 *
 * Deliberately NOT `setLocale()`: `@nuxtjs/i18n` 10 follows it with a
 * navigation, and on an unmatched path its resolver falls back to prefixing
 * the current path (`/fr/abc` → `/es/fr/abc`), which is another miss — a new
 * request, a reload, and a URL the visitor never typed
 * (`node_modules/@nuxtjs/i18n/dist/runtime/routing/navigation.js`). Loading the
 * messages first and then assigning the locale is the same pair of steps
 * without the navigation. The `i18n:beforeLocaleSwitch` hook is not called,
 * which is what `notFoundLocale.ts` wants: its rules govern the initial
 * locale and hydration only.
 *
 * The messages are loaded **before** the assignment so the page never renders
 * a frame of untranslated keys.
 */
export async function switchLocaleInPlace(
  target: ShellLocale,
  { loadLocaleMessages, locale }: InPlaceLocaleSwitchDeps
): Promise<void> {
  if (locale.value === target) return

  await loadLocaleMessages(target)
  locale.value = target
}

/**
 * The switch as the toggle requests it: in place, or — if the other locale's
 * messages cannot be loaded (offline, a stale deploy) — `fallback`, which the
 * caller wires to a real navigation to the toggle's own href. Split from
 * `useShellNavigation` so the failure path is unit-testable without a Nuxt
 * app.
 */
export async function switchLocaleWithFallback(
  target: ShellLocale,
  deps: InPlaceLocaleSwitchDeps,
  fallback: () => void
): Promise<void> {
  try {
    await switchLocaleInPlace(target, deps)
  } catch {
    fallback()
  }
}
