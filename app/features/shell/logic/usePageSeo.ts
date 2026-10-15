export interface PageSeoOptions {
  titleKey: string
  descriptionKey: string
  pageType?: 'AboutPage'
}

/**
 * A page's own head: its `<title>`, meta description and the matching
 * `og:title`/`og:description`, all from the locale files (feature 35,
 * FR-001/FR-002). Called once from each page.
 *
 * `lang`, the canonical, `hreflang`, `og:locale` and `og:url` are NOT set
 * here: they come from `useLocaleHead()` in the layout, and setting them
 * twice is what FR-004 forbids. Site-wide tags live in `useSiteSeo`.
 *
 * Structured data is written only during prerender (`import.meta.server`).
 * The guard is load-bearing, measured on feature 35: `nuxt-schema-org`
 * registers its composables for Nuxt's client tree-shake, but that transform
 * runs after unimport has rewritten the auto-import to an absolute file path
 * and only matches the `'nuxt-schema-org'`/`#imports` specifiers, so the call
 * survived and ~35 KB of schema-org node code reached `_nuxt/`. With the
 * guard, Vite drops the branch and its imports from the client build. On the
 * client `useSchemaOrg` is a no-op anyway (`reactive: false` in production,
 * research R3.2), so the prerendered HTML is unchanged.
 */
export function usePageSeo({
  titleKey,
  descriptionKey,
  pageType,
}: PageSeoOptions): void {
  const { t } = useI18n()
  const title = t(titleKey)
  const description = t(descriptionKey)

  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
  })

  /*
   * Both About pages must be structurally identical in structured data
   * (FR-010; `tests/seo-output.test.ts` › parity across locales). Two
   * module defaults break that unless both values are set here:
   * - the schema-org defaults infer `AboutPage` from a final `about`
   *   segment, so only `/en/about` would get it (research R3.4);
   * - the default `ReadAction` is added only while the node's type is still
   *   plain `WebPage`. `/en/about` is already `AboutPage` by then and got
   *   none, while `/es/nosotros` got one (review F1, measured).
   * The rule is the homes' rule: every WebPage carries one `ReadAction`
   * targeting its own URL. `defineReadAction()` with no target resolves to
   * the page's canonical URL. Same-`@id` WebPage nodes merge.
   * `potentialAction: []` does NOT work (measured): the merge keeps the
   * default ReadAction on `/es/nosotros` and renders `[]` on `/en/about`.
   */
  if (import.meta.server && pageType === 'AboutPage') {
    useSchemaOrg([
      defineWebPage({
        '@type': 'AboutPage',
        potentialAction: [defineReadAction({})],
      }),
    ])
  }
}
