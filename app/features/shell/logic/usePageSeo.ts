export interface PageSeoOptions {
  titleKey: string
  descriptionKey: string
  /**
   * Pins the WebPage type in both locales when the schema-org default would
   * infer another one from a URL segment, or only for one locale:
   * `AboutPage` for Nosotros (only `/en/about` would get it), `FAQPage` for
   * Preguntas (feature 51, spec D1, FR-003; only `/en/faq` would get it,
   * from its final `faq` segment). A plain `WebPage` is still available;
   * feature 46 used it for Preguntas (its FR-038, superseded by feature 51
   * D1).
   */
  pageType?: 'AboutPage' | 'WebPage' | 'FAQPage'
  /**
   * More nodes for the page's graph, written in the same tag as its WebPage
   * node: the 20 `Question`s of Preguntas, which the schema-org resolver
   * attaches to a `FAQPage`'s `mainEntity`. Called only during prerender,
   * so the caller's `define*` calls stay out of the client bundle.
   */
  extraNodes?: () => readonly object[]
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
  extraNodes,
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
   * targeting its own URL. Preguntas needs the type pinned for the same
   * reason (`/en/faq` alone would default to `FAQPage`; feature 51 makes
   * both `FAQPage`), and its node is replaced rather than merged
   * (`replaceWebPageNode` below), the mechanism feature 46 measured. `defineReadAction()` with no target resolves to
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
  if (import.meta.server && (pageType === 'WebPage' || pageType === 'FAQPage'))
    replaceWebPageNode(pageType, extraNodes?.() ?? [])
}

/**
 * A WebPage node of exactly `pageType` that no URL segment can retype,
 * followed by `extraNodes` in the same tag. Feature 46 wrote it for a plain
 * `WebPage` (its spec FR-038); feature 51 reuses it for `FAQPage`, the same
 * type in both locales, with the page's questions (spec D1, FR-003): a
 * separate `useSchemaOrg` tag would be dropped by this tag's `replace`.
 * Measured on nuxt-schema-org 6.4.3: the module's default
 * `defineWebPage()` infers `FAQPage` from a final `faq` segment, and a
 * second node with the same `@id` is MERGED, its `@type` arrays unioned, so
 * an explicit `'@type': 'WebPage'` still ships `["WebPage", "FAQPage"]` on
 * `/en/faq` while `/es/preguntas` gets `"WebPage"`. The graph resolver
 * replaces instead of merging a node whose tag carries
 * `tagDuplicateStrategy: 'replace'` (`resolveGraph`'s dedupe), which
 * `useSchemaOrg` cannot set, so this one tag is written with `useHead` in
 * the shape `useSchemaOrg` writes: the same key, and the script attributes
 * read from the same source the module reads them from (its server runtime
 * config, `nuxt-schema-org.scriptAttributes`, which `useSchemaOrgConfig`
 * defaults to `{}`), so a change to `schemaOrg.scriptAttributes` in
 * `nuxt.config.ts` reaches this tag too. The node is
 * resolved like any WebPage: name, description, url, `isPartOf` and the
 * logo still come from the page meta and the root-node resolver.
 */
function replaceWebPageNode(
  pageType: 'WebPage' | 'FAQPage',
  extraNodes: readonly object[]
): void {
  useHead({
    script: [
      {
        // @ts-expect-error unhead types `type` without `application/ld+json`
        // and has no `nodes`; this mirrors nuxt-schema-org's own
        // `useSchemaOrg`, which carries the same suppression.
        type: 'application/ld+json',
        key: 'schema-org-graph',
        tagPriority: 'high',
        tagDuplicateStrategy: 'replace',
        /* After `type`, as `useSchemaOrg` spreads them: same attribute order. */
        ...schemaOrgScriptAttributes(),
        nodes: [
          defineWebPage({
            '@type': pageType,
            potentialAction: [defineReadAction({})],
          }),
          ...extraNodes,
        ],
      },
    ],
  })
}

/** The module's configured `<script>` attributes (server runtime config). */
function schemaOrgScriptAttributes(): Record<string, unknown> {
  const config = useRuntimeConfig()['nuxt-schema-org'] as
    | { scriptAttributes?: Record<string, unknown> }
    | undefined
  return config?.scriptAttributes ?? {}
}
