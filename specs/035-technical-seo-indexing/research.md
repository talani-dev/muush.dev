# Research: Technical SEO for Google indexing (feature 35)

**Date**: 2026-10-15 · **Author**: spec_author

## Method and evidence labels

Nothing could be installed (the device's npm registry points at an expired corporate CodeArtifact). Every module was read from its **published npm tarball**, fetched over public HTTP from `registry.npmjs.org` into a scratch directory outside the repo, and from the registry metadata. The tarballs read:

| Package | Version read | Published | Integrity (sha512, from registry) |
|---|---|---|---|
| `@nuxtjs/sitemap` | 8.6.2 (`latest-8` dist-tag) | 2026-10-12 | `TmHKPGWq7Xlu…GmoA==` |
| `nuxt-schema-org` | 6.4.3 (last 6.x) | 2026-09-30 | `2iZC8iyELkRo…f1aJeQ==` |
| `@nuxtjs/robots` | 6.2.4 (last 6.x) | 2026-09-29 | `+MyHUT6fAqJH…ned9ccfmwGPKA==` |
| `nuxt-site-config` | 4.2.3 (last 4.x; what `^4.2.3` resolves to) | 2026-08-16 | `m0CK1Q43T3qt…HSBYeDHav…` |
| `nuxtseo-shared` | 5.3.16 (last 5.x) | — | — |
| `site-config-stack`, `nuxt-site-config-kit` | 4.2.3 | — | — |

Labels, per the org rule and `rules.md` § R32:

- **CONFIRMED** — read directly in the shipped code/metadata of the exact version above, or in the current build output of this repo.
- **INFERRED** — follows from that code by reasoning, but was not observed running.
- **UNVERIFIED** — could not be established without installing/building; owner and the task that settles it are named.

The bundled `skills/*/SKILL.md` files inside the tarballs were read **as documentation only** (third-party content, treated as data).

---

## R1 · Compatibility with Nuxt 4.5.2

| Module | `meta.compatibility.nuxt` (`dist/module.json`) | Other constraints | Verdict |
|---|---|---|---|
| `@nuxtjs/sitemap` 8.6.2 | `>=3.9.0` | dep `@nuxt/kit ^4.5.2`; peer `zod >=3` (optional) | **CONFIRMED** admits 4.5.2 |
| `nuxt-schema-org` 6.4.3 | `>=3.16.0` | dep `@nuxt/kit ^4.5.2`; peers `unhead`/`@unhead/vue ^2 \|\| ^3` (optional), `zod` (optional) | **CONFIRMED** admits 4.5.2 |
| `@nuxtjs/robots` 6.2.4 | `>=3.6.1` | dep `@nuxt/kit ^4.5.2`; peer `zod >=3` (optional) | **CONFIRMED** admits 4.5.2 |
| `nuxt-site-config` 4.2.3 | `>=3.9.0` | dep `@nuxt/kit ^4.5.2`; peer `vue ^3.5.30` (repo: 3.5.42) | **CONFIRMED** |
| `nuxtseo-shared` 5.3.16 | — | peers `nuxt ^3.16 \|\| ^4 \|\| ^5`, `nuxt-site-config ^3.2 \|\| ^4`, `zod ^3.23 \|\| ^4` | **CONFIRMED** |

The next majors (sitemap 9.x, schema-org 7.x, robots 7.x, site-config 5.x) all declare `@nuxt/kit ^4.6.0` and peer `nuxt ^4.6.0 || ^5.0.0` — **CONFIRMED** in registry metadata; this is why Roberto chose the previous majors.

`@unhead/vue` in this repo is **3.4.0** (CONFIRMED, `node_modules/.pnpm`). `nuxt-schema-org` 6.4.3 **vendors** both `@unhead/schema-org` majors in `dist/vendor/schema-org-v2|v3` and picks v3 for this repo (CONFIRMED, `schemaOrgVendor()` in `dist/module.mjs`), so no extra `@unhead/schema-org` package is installed.

**Install-time scripts**: none of the four top-level packages declares `preinstall`/`install`/`postinstall` (CONFIRMED). Transitive packages were not all audited (**UNVERIFIED**); pnpm 10 blocks build scripts not listed in `pnpm-workspace.yaml` `allowBuilds` (today only `esbuild`, `sharp`), so an unexpected script would fail loudly rather than run.

**Supply-chain notes** (for the gate, not blockers):

- `nuxtseo-shared` 5.3.16 depends on `@nuxt/devtools-kit` **`4.0.0-alpha.7`** (an exact alpha pin), plus `nypm`, `sirv`, `birpc`, `@clack/prompts` — build/dev tooling. CONFIRMED in metadata.
- `nuxtseo-shared/pro` contains a build-time POST to `https://nuxtseo.com/api/pro/verify` with the site URL and name. It runs **only** when `NUXT_SEO_PRO_KEY` / `runtimeConfig.seoProKey` is set, and none of the three modules imports `nuxtseo-shared/pro` (CONFIRMED by grep over the three `dist/`). With no key, no request. Never set that variable.
- `@nuxtjs/robots` depends on `@fingerprintjs/botd ^2.0.0` (CONFIRMED). It is installed into `node_modules`; whether it reaches the browser is R5.

## R2 · How `@nuxtjs/sitemap` 8.6.2 handles `@nuxtjs/i18n` 10 (`strategy: 'prefix'` + `customRoutes: 'config'`)

All CONFIRMED from `dist/module.mjs` and `nuxtseo-shared/dist/i18n.mjs` unless marked.

1. The module reads the i18n options and normalises the locales. Each locale's **`_hreflang` = `locale.language || locale.code`** (`nuxtseo-shared` i18n.mjs:101). With `es → language 'es-MX'` and, after D3, `en → language 'en-US'`, the sitemap alternates are **`es-MX`, `en-US`** plus **`x-default` → the default locale (`es`) URL**. No language-only `es`/`en` alternate is added in the sitemap.
2. Because `i18n.pages` is non-empty (`nosotros: { es: '/nosotros', en: '/about' }`), it adds an `@nuxtjs/i18n:pages` source that emits `/es/nosotros` and `/en/about` with alternates. The `index` pages come from the `nuxt:pages` app source, grouped by the `___<locale>` route-name suffix, with the same alternates. **INFERRED** that the two sources de-duplicate `/es/nosotros` and `/en/about` (the normaliser dedupes by `loc`); settled by the T-verify task.
3. **The default is wrong for a static host.** With i18n and `prefix`, `canI18nMap` is true and the module rewrites `sitemaps` into **one sitemap per locale** (`/__sitemap__/es-MX.xml`, `/__sitemap__/en-US.xml`) behind `/sitemap_index.xml`, and registers `routeRules['/sitemap.xml'] = { redirect: '/sitemap_index.xml' }`. A redirect route rule produces no XML file at `/sitemap.xml` on S3. **Decision: `sitemap.sitemaps: false`.** That makes `canI18nMap` false (`config.sitemaps !== false` check) while `resolvedAutoI18n` is still computed, so alternates are still generated and a single `sitemap.xml` is written. CONFIRMED by reading the branch; the output shape is **INFERRED** until the build.
4. Under `nuxt generate`, `prerenderSitemap = isNuxtGenerate()` is true, so `sitemap.xml` is prerendered into `.output/public` (CONFIRMED). The `prerender:generate` hook skips `/200.html` and `/404.html` explicitly (CONFIRMED, line 94). `/` is not a Nuxt route (the root object is the static `public/index.html`), so it cannot enter via `nuxt:pages`; it is not prerendered, so it cannot enter via `nuxt:prerender` (INFERRED).
5. Other defaults worth overriding: `xsl: '/__sitemap__/style.xsl'` (adds a stylesheet reference and a prerendered XSL file) → **`xsl: false`**, raw XML only; `discoverImages`/`discoverVideos: true` (adds `<image:image>` for `<img>` inside `<main>`) → **`false`**, so the sitemap carries exactly the 4 URLs and their alternates (FR-012). `exclude` already contains `/_**` and the build-assets dir. `credits: true` adds an XML comment — harmless, kept.
6. When `@nuxtjs/robots` is present, the sitemap module hooks `robots:config` and pushes `/${sitemapName}` (i.e. `/sitemap.xml`, since not multi-sitemap) into the robots sitemap list (CONFIRMED, lines 911–912). The robots route makes it absolute with the site URL (R5). So **no manual `robots.sitemap` entry is needed** — adding one would duplicate the line.

## R3 · `nuxt-schema-org` 6.4.3 — duplicates, client runtime, i18n

1. **No duplicate tags.** The module emits exactly one `<script type="application/ld+json" data-nuxt-schema-org>` with `key: 'schema-org-graph'`; every `useSchemaOrg()` call merges into it (CONFIRMED, `runtime/app/composables/useSchemaOrg.js`). It does **not** emit `lang`, canonical, `hreflang`, `og:*` or `twitter:*` (CONFIRMED by reading all `runtime/app/plugins/**`: `init` installs the Unhead schema plugin, `meta` pushes `templateParams.schemaOrg`, `defaults` adds `WebSite` + `WebPage` nodes). It *reads* the canonical/route to build `@id`s, it does not write them.
2. **No client runtime request, no client graph.** `reactive` defaults to `nuxt.options.dev || !nuxt.options.ssr` → **false** here (`ssr: true`, production build). All three plugins are then registered `mode: 'server'`; `useSchemaOrg()` returns early on the client unless `reactive`; and the module adds every `defineX`/`useSchemaOrg` name to `optimization.treeShake.composables.client` (CONFIRMED, `dist/module.mjs`). There is no `fetch`/`$fetch` anywhere in its app runtime (CONFIRMED by grep). The JSON-LD therefore exists only in the prerendered HTML (FR-011).
   - **INFERRED**: tree-shaking only rewrites calls by auto-import name, so `useSchemaOrg`/`defineOrganization`/`defineWebPage` must be used as **auto-imports** (no explicit import) for the vendored schema-org library to stay out of the client bundle. Verified by the bundle grep in T-verify.
3. **i18n**: the `defaults` plugin builds one `WebSite` node per locale (`inLanguage` = the locale's `language`, so `en-US`/`es-MX` after D3), linked by `workTranslation`/`translationOfWork`, and a `WebPage` node whose `name` comes from the page `<title>` (CONFIRMED). On unhead v3 the page's meta description also reaches `WebPage` (vendor SKILL.md, CONFIRMED as documentation).
4. **About-page asymmetry.** The `WebPage` subtype is inferred from the last path segment: `about` → `AboutPage`. So `/en/about` becomes `AboutPage` and `/es/nosotros` stays `WebPage` (vendor SKILL.md; INFERRED for this repo). Same-`@id` nodes merge, so a page-level `defineWebPage({ '@type': 'AboutPage' })` on the About page fixes both locales (FR-010).
5. **Identity**: a `defineOrganization()` in the graph becomes the `#identity` node (SKILL.md, CONFIRMED as documentation). Roberto's decision D5 uses `useSchemaOrg + defineOrganization` rather than the `schemaOrg.identity` config key; that is also what lets `sameAs` be derived from the app's own data at render time instead of being retyped in `nuxt.config.ts`.

## R4 · Does any module ship JavaScript to the browser, and how much?

| Module | Client code | Evidence |
|---|---|---|
| `@nuxtjs/sitemap` 8.6.2 | **None.** `dist/runtime/` has only `server/` and pure utils; `module.mjs` imports no `addPlugin` | CONFIRMED |
| `nuxt-schema-org` 6.4.3 | **None expected** in production (plugins `mode: 'server'`, composables tree-shaken) | CONFIRMED (config) / INFERRED (bundle) |
| `@nuxtjs/robots` 6.2.4 | **No plugin** (only `robot-meta.server`). Its robots config is copied to **public** runtime config, so it is serialised into every page's inline `__NUXT__` config (a few hundred bytes of JSON, not code) | CONFIRMED |
| `nuxt-site-config` 4.2.3 | **Yes, small.** Two universal plugins: `0.siteConfig` (builds a config stack, reads `useState('site-config')` from the payload) and `i18n` (watches the locale). Pulls `site-config-stack` (~4.6 KB unminified) and part of `nuxtseo-shared/i18n-runtime`. Also puts the resolved site config into each page's payload state | CONFIRMED (registration) |

Estimated client cost: **single-digit KB minified, before compression** (INFERRED from ~26 KB of unminified source across the files involved, much of it tree-shakable). **UNVERIFIED** until measured: T-verify records the `_nuxt/` total before and after (baseline today: **556 K**, `du -sh .output/public/_nuxt`, CONFIRMED 2026-10-15). There is no option in `nuxt-site-config` 4.x to make its plugins server-only; it is a hard dependency of all three modules (Roberto's D1 accepted it).

## R5 · `@nuxtjs/robots` 6.2.4 specifics (decision D2, revised 2026-10-15)

All from `dist/module.mjs` and `dist/runtime/**` of 6.2.4.

1. **Compatibility**: `meta.compatibility.nuxt: '>=3.6.1'` — **CONFIRMED** admits 4.5.2. 7.x requires `^4.6.0` (CONFIRMED, registry).
2. **Static output**: with `nuxt generate` it calls `addPrerenderRoutes('/robots.txt')` (CONFIRMED), so `.output/public/robots.txt` is written at build time. Nothing runs on the host.
3. **Content**: default group `User-agent: *` with `Disallow:` (empty = allow all) (CONFIRMED, `modules:done` hook). Sitemap lines are made absolute with `withSiteUrl()` → `Sitemap: https://muush.dev/sitemap.xml` (CONFIRMED, `routes/robots-txt.js`; INFERRED final text). With `credits: true` it is wrapped in `# START nuxt-robots (indexable)` … `# END nuxt-robots` (CONFIRMED).
4. **The indexable trap.** If the site is not "indexable", the route ignores the config and emits `User-agent: * / Disallow: /` (CONFIRMED). Indexable = `site.indexable` if set, else `site.env === 'production'`, where `env` defaults to `nuxt.options.envName || process.env.NODE_ENV` (CONFIRMED, `nuxt-site-config-kit` and `getSiteIndexable.js`). `pnpm generate` normally runs with `NODE_ENV=production` (INFERRED), but `NUXT_SITE_ENV`/`NUXT_SITE_INDEXABLE` env vars can override (`envSiteConfig(process.env)`, CONFIRMED). **Decision: set `site.indexable: true` explicitly** — the site has one target, and an allow-all robots.txt must not depend on how a shell names its environment. A test asserts no `Disallow: /` (FR-015).
5. **The `public/robots.txt` trap.** `mergeWithRobotsTxtPath: true` (default) looks for `public/robots.txt`; if found, it **renames the file in the repository** to `public/_robots.txt` (CONFIRMED, `fsp.rename`). This repo has no `public/robots.txt` today (CONFIRMED) and must never get one (FR-016). Setting `mergeWithRobotsTxtPath: false` removes the trap entirely; **decision: set it**.
6. **i18n with `strategy: 'prefix'`**: `resolveI18nConfig()` is used only to expand `allow`/`disallow` path rules per locale (`splitPathForI18nLocales`) (CONFIRMED). With no custom rules there is nothing to expand: no effect on the output (INFERRED).
7. **Bot detection / `@fingerprintjs/botd`**: the module registers **no client plugin** for it. `botd` is reached only through `useBotDetection({ fingerprint: true })` → `runtime/app/utils/fingerprinting.js` → dynamic `import('@fingerprintjs/botd')` (CONFIRMED). Nothing in this repo calls `useBotDetection`, so no chunk is generated for it (INFERRED). **Decision: `botDetection: false`** — the module then aliases `useBotDetection` to a mock and drops the server `getBotDetection` composables (CONFIRMED). Combined, `botd` cannot reach the browser; the T-verify bundle grep proves it (FR-014). (Side note, CONFIRMED: `fingerprinting.js` imports `@vueuse/core`, which 6.2.4 does not declare as a dependency — another reason to keep that path unreachable.)
8. **Meta tag and header vs. `public/index.html`'s `noindex`**:
   - `metaTag: true` (default) registers `robot-meta.server`, which adds one `<meta name="robots" content="index, follow, …">` to each **Nuxt-rendered** page (CONFIRMED). `public/index.html` is a public asset copied verbatim by Nitro; no Nuxt plugin renders it, so its own `<meta name="robots" content="noindex">` is untouched and nothing is added to it (CONFIRMED by mechanism, INFERRED for the output; asserted in T-verify). **Kept**: one explicit directive per page, and it is the hook a future `noindex` page would need.
   - `header: true` (default) writes `X-Robots-Tag` into Nitro **route rules**. A static S3 host never sees route-rule headers, so for this site they are configuration that does nothing (cf. `rules.md` § R25). It never targets `/` here (only `/_nuxt/**` → noindex, and the whole site only when non-indexable) (CONFIRMED). **Decision: `header: false`**, so the config does not promise headers the host will not send.

## R6 · i18n output after D3 (`en` → `en-US`)

CONFIRMED from today's build (`.output/public/es/index.html`, `en/about/index.html`), with the predicted change:

| Tag today | After D3 |
|---|---|
| `<html lang="en">` on EN pages | `lang="en-US"` |
| `hreflang="en"` (`i18n-alt-en`) | `i18n-alt-en` **stays** as the language-only catch-all (`hreflang="en"`) **and** `i18n-alt-en-US` (`hreflang="en-US"`) appears — INFERRED from the existing `es` + `es-MX` pair |
| `og:locale` `en` | `en_US` (INFERRED from `es-MX` → `es_MX`) |

Consequences:

- Each value (`en-US`, `es-MX`, `x-default`, and the catch-alls `es`, `en`) still appears once per page — acceptance #3 holds. Spec A-04 records keeping the catch-alls.
- `tests/static-output.test.ts` › *should build the hreflang alternates from the same route table* asserts the `i18n-alt-en` line; it should keep passing (catch-all) but is updated to also assert `en-US`.
- `LanguageToggle`'s `<a hreflang>` uses the locale **code** (`en`/`es`), not the language tag — unchanged and still valid BCP 47 (CONFIRMED, `LanguageToggle.vue:85`).

## R7 · Head composition — where each tag comes from

| Tag | Source | Called where |
|---|---|---|
| `lang`, canonical, `hreflang`, `og:locale`, `og:url` | `useHead(useLocaleHead())` (unchanged) | layout |
| `<title>`, description, `og:title`, `og:description` | `useSeoMeta` from locale keys | each page, through one shell composable |
| `og:type`, `og:site_name`, `twitter:card`, (`og:image` when set) | `useSeoMeta` | layout, through one shell composable |
| Organization (+ default `WebSite`/`WebPage`) | `useSchemaOrg([defineOrganization(...)])` | layout, same composable |
| `AboutPage` subtype | `useSchemaOrg([defineWebPage({ '@type': 'AboutPage' })])` | About page, through the page composable |
| `<meta name="robots">` | `@nuxtjs/robots` server plugin | automatic |

`useSeoMeta` drops keys whose value is `undefined`, so an unset share image produces no tag at all (INFERRED from Unhead behaviour; asserted in T-verify).

## R8 · Site name and URL — one source each

`site.url` and `i18n.baseUrl` must be the same string; `nuxt-site-config`'s i18n plugin logs an error when their hosts differ (CONFIRMED, `runtime/app/plugins/i18n.js`). Decision: one `const SITE_URL = 'https://muush.dev'` at the top of `nuxt.config.ts`, used by both. The Organization reads `name` and `url` from `useSiteConfig()` at render time, so neither is retyped in app code.

## UNVERIFIED — settled only by building (owner: implementer, task T-verify)

| # | Risk | How it is settled |
|---|---|---|
| U-1 | `pnpm install` reaches the public registry at all (device registry problem) | Install step; stop and report on failure |
| U-2 | Single `sitemap.xml` with exactly 4 `<url>` and 3 alternates each, no duplicates from the two i18n sources | Read `.output/public/sitemap.xml` |
| U-3 | Client bundle contains no `botd`, no `@unhead/schema-org` code, and the size delta from `nuxt-site-config` | grep + `du` on `.output/public/_nuxt` |
| U-4 | `og:locale` becomes `en_US` and the `en` catch-all stays | Read EN heads |
| U-5 | `robots.txt` text and absence of `Disallow: /` | Read `.output/public/robots.txt` |
| U-6 | Storybook still builds when the shell barrel exports composables that use Nuxt auto-imports | `pnpm storybook:build` |
| U-7 | Transitive packages' install scripts | pnpm's `allowBuilds` gate during install |
