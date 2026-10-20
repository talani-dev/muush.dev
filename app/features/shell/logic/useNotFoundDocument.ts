import {
  NOT_FOUND_COPY_KEYS,
  NOT_FOUND_LOCALE_STATE_KEY,
  NOT_FOUND_ROBOTS,
} from '@/features/shell/data/notFound'

/**
 * The not-found document's `useSeoMeta` input. The title is a getter, not a
 * string: the language toggle switches this page in place (feature 39), and
 * the title must follow the locale like the copy does.
 */
export function notFoundSeoMeta(t: (key: string) => string) {
  return {
    title: () => t(NOT_FOUND_COPY_KEYS.documentTitle),
    robots: NOT_FOUND_ROBOTS,
  }
}

/**
 * The head of a not-found document, and the one Nuxt-internal workaround it
 * needs (feature 36).
 *
 * Head: a title and `noindex`, nothing else. No description (the page is not
 * indexed and has nothing to describe), no Open Graph of its own, no
 * canonical; canonical and hreflang are absent by construction, because
 * `useLocaleHead()` has no route to resolve alternates for on an unmatched
 * path (`specs/036-not-found-page/research.md` R3 F19–F20).
 */
export function useNotFoundDocument(): void {
  const { t, locale } = useI18n()

  /*
   * Records the rendered locale in the payload so the client keeps it while
   * hydrating, whatever prefix the served URL carries
   * (`notFoundLocale.ts`).
   */
  useState(NOT_FOUND_LOCALE_STATE_KEY, () => locale.value)

  useSeoMeta(notFoundSeoMeta(t))

  /*
   * The layout's `useLocaleHead()` still emits `og:locale` and
   * `og:locale:alternate` on an unmatched route — they depend on the locale,
   * not the route (measured on the first build; research R3 F19 had them
   * absent). A not-found document carries neither (spec FR-012).
   *
   * Removed without touching the layout: unhead dedupes these two by
   * property across entries, the `high` priority makes this entry win over
   * the layout's (which registers later), and a `null` content is unhead's
   * removal value — the winning tag is dropped at render. Scoped to this
   * component, so the tags come back as soon as the error is cleared.
   */
  useHead(
    {
      meta: [
        { property: 'og:locale', content: null },
        { property: 'og:locale:alternate', content: null },
      ],
    },
    { tagPriority: 'high' }
  )

  /*
   * ⚠️ Nuxt internal, server-only — research R1 F7/F8, plan Complexity
   * Tracking.
   *
   * Nuxt serialises `payload.path`, the URL the document was RENDERED at
   * (`/en/404`). The edge serves that document at whatever missing URL the
   * visitor requested, and on hydration the client router sees the address
   * bar differ from `payload.path`, initialises at `payload.path` and
   * replaces the address bar with it — the visitor loses the URL they typed,
   * and a refresh would fetch the 200-served `/<locale>/404` object.
   * Without it the client initialises at the real address and renders the
   * same error component the server did (F8–F9). Nuxt 4.5 has no public
   * option for this.
   *
   * Guard: the headless-Chrome check in `specs/036-not-found-page/
   * quickstart.md` § 3. Re-run it after any Nuxt upgrade — the failure mode
   * is silent (the URL changes, nothing errors).
   */
  if (import.meta.server) delete useNuxtApp().payload.path
}
