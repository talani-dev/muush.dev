# Implementation Plan: Technical SEO for Google indexing

**Branch**: `035-technical-seo-indexing` | **Date**: 2026-10-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/035-technical-seo-indexing/spec.md`

## Summary

Add per-page translated `<title>`/description and social tags through `useSeoMeta`, one global JSON-LD Organization through `nuxt-schema-org`, a single prerendered `sitemap.xml` with hreflang alternates through `@nuxtjs/sitemap`, and a prerendered `robots.txt` through `@nuxtjs/robots` — all three on the previous majors that support Nuxt 4.5.2 (Roberto's D1/D2). The English locale's language tag becomes `en-US` (D3), mirrored in `public/index.html`. Everything i18n already emits (`lang`, canonical, hreflang, `og:locale`, `og:url`) stays where it is and is not duplicated. Site identity lives in one shell data file; `sameAs` is derived from `SOCIAL_PROFILES`; the share image is a single `null` waiting for a URL (D6). Research in [research.md](./research.md); output contract in [contracts/build-output.md](./contracts/build-output.md).

## Technical Context

**Language/Version**: TypeScript (strict) · Vue 3.5 `<script setup>` · Nuxt 4.5.2 (stays on 4.5.x)
**Primary Dependencies**: existing `@nuxtjs/i18n` 10.6.0, `@nuxt/fonts`; **new** `@nuxtjs/sitemap` ^8.6.2, `@nuxtjs/robots` ^6.2.4, `nuxt-schema-org` ^6.4.3 (they bring `nuxt-site-config` 4.x)
**Storage**: N/A
**Testing**: Vitest (global `happy-dom`; `tests/global-setup.ts` runs `pnpm generate` first, so output assertions read the fresh artefact); Storybook build as a smoke check
**Target Platform**: static files on S3 + CloudFront (`nitro.preset: 'static'`, `pnpm generate` → `.output/public`)
**Project Type**: static website, 2 pages × 2 locales
**Performance Goals**: no measurable change to page weight beyond the `nuxt-site-config` client plugins (single-digit KB, measured and reported); zero client requests added
**Constraints**: no server runtime; no visual/content/route change; no `.npmrc`/global config edit; no deploy; no `public/robots.txt`
**Scale/Scope**: 4 URLs, ~10 head tags each, 1 sitemap, 1 robots file

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design (below).*

### Phase -1: Pre-Implementation Gates

#### I. Feature-Based + Capas (ui/logic/data)
- [x] Site identity constants live in `app/features/shell/data/`; the SEO composables live in `app/features/shell/logic/`; nothing SEO-related is added to `ui/`.
- [x] Pages stay thin: each page makes one `usePageSeo(...)` call and holds no SEO logic.

#### II. Dependency Direction (NON-NEGOTIABLE)
- [x] `data/siteIdentity.ts` imports nothing from `logic/` or `ui/`; `logic/` composables import only from `data/` and from other modules in `logic/` of the same feature *(wording amended 2026-10-15 after review round 2: the original "only from `data/`" was stricter than the constitution, which allows same-folder imports — e.g. `useSiteSeo.ts:7-8`)*.

#### III. Feature Isolation (NON-NEGOTIABLE)
- [x] The layout and the pages reach the composables only through `@/features/shell` (barrel). No other feature imports `socialProfiles.ts`.

#### IV. Static-Site Purity (NON-NEGOTIABLE)
- [x] `nitro.preset` stays `'static'`; no `server/` directory, no `server/api` route is added.
- [x] `sitemap.xml` and `robots.txt` are prerendered files in `.output/public`, not runtime handlers on the host (the modules' Nitro handlers run only during `pnpm generate`).
- [x] Structured data is in the prerendered HTML; no client-side request is added (schema-org `reactive: false`; robots `botDetection: false`).
- [x] No route-rule headers are configured that a static host would silently ignore (robots `header: false`).

#### V. Component Discipline
- [x] No component is added or modified under `ui/`; no client state is introduced.

#### VI. i18n Parity (NON-NEGOTIABLE)
- [x] Every new key (`pages.home.title`, `pages.home.description`, `pages.about.description`) exists in both `es.json` and `en.json`; `tests/i18n-parity.test.ts` passes.
- [x] Both locales get the same set of tags and the same structured-data page type (About = `AboutPage` in both).
- [x] hreflang still comes only from the i18n route table; the sitemap's alternates come from the same i18n config.
- [x] No user-facing string is hardcoded in a component or composable.

#### VII. Design Tokens
- [x] N/A — no visual change. Confirmed by the `<body>` comparison in T-verify.

#### VIII. Clean Code
- [x] Only the three modules Roberto chose are added; no `@nuxtjs/seo`, no `nuxt-og-image`.
- [x] The dead `site.title` key is removed; no config line that does nothing is left (`sitemap.xsl: false` and `robots.header: false` are deliberate, commented).
- [x] The share image is one value; no speculative OG-image generation.

#### IX. TypeScript Strict + Biome
- [x] No `any`, no `@ts-ignore`; `pnpm check` and `pnpm typecheck` pass.

#### X. Testing Discipline
- [x] Pure helpers (`resolveShareMeta`, `profileUrls`) have unit tests named `should … when …`.
- [x] The output contract is asserted on `.output/public` in a dedicated test file.
- [x] No test depends on another's state.

#### XI. Configuration & Credential Hygiene (NON-NEGOTIABLE)
- [x] No secret is introduced; all new values are public URLs/names.
- [x] `NUXT_SEO_PRO_KEY` is never set (research R1: it would make a build-time POST to nuxtseo.com).
- [x] `.npmrc` and global package-manager config are not edited, even if install fails. *(Repo has no `.npmrc`; the 2026-10-15 14:03 edit to `~/.npmrc` was made by Roberto himself — confirmed by him 2026-10-15.)*

#### XII. Absolute Imports via Alias
- [x] New files import via `@/features/...`/`@/shared/...`; relative imports only within the same directory.

**Pre-research verdict**: PASS — no violation requires Complexity Tracking. Three new build-time dependencies are a direct, recorded decision of Roberto (D1/D2) and add no runtime server.

## Design

### D-1 · Configuration (`nuxt.config.ts`)

```ts
const SITE_URL = 'https://muush.dev'          // single source for site.url and i18n.baseUrl

modules: ['@nuxtjs/i18n', '@nuxt/fonts', '@nuxtjs/sitemap', '@nuxtjs/robots', 'nuxt-schema-org'],

site: { url: SITE_URL, name: 'muush', indexable: true },   // research R5.4

i18n: { locales: [ { code: 'es', language: 'es-MX', … }, { code: 'en', language: 'en-US', … } ],
        baseUrl: SITE_URL, … }                                // D3

sitemap: { sitemaps: false, xsl: false, discoverImages: false, discoverVideos: false },  // research R2.3, R2.5
robots:  { botDetection: false, header: false, mergeWithRobotsTxtPath: false },          // research R5.5, R5.7, R5.8
// schemaOrg: defaults are correct (reactive=false in production; WebSite/WebPage defaults kept)
```

Each non-default option gets a comment naming the research item that justifies it, following the file's existing style. No `robots.sitemap` entry: the sitemap module adds `/sitemap.xml` itself (R2.6).

### D-2 · Shell data — `app/features/shell/data/siteIdentity.ts` (new)

`SITE_ALTERNATE_NAME`, `SITE_LOGO_URL`, `SHARE_IMAGE` (`url: null` + `// TODO(D6)` comment explaining what to paste and that `twitter:card` flips automatically). See [data-model.md](./data-model.md) § 2. `socialProfiles.ts` is not edited.

### D-3 · Shell logic (new)

- `resolveShareMeta.ts` — pure: `ShareImage` → `{ twitterCard, ogImage?, twitterImage? }`.
- `profileUrls.ts` (or a function inside `useSiteSeo.ts` if it stays one line — implementer's call, but it must be exported for its test) — pure: `SocialProfile[]` → `string[]`.
- `useSiteSeo.ts` — called once from the layout. Reads `useSiteConfig()` for `name`/`url`; calls
  `useSeoMeta({ ogType: 'website', ogSiteName: name, ...resolveShareMeta(SHARE_IMAGE) })` and
  `useSchemaOrg([defineOrganization({ name, alternateName: SITE_ALTERNATE_NAME, url, logo: SITE_LOGO_URL, sameAs: profileUrls(SOCIAL_PROFILES) })])`.
- `usePageSeo.ts` — called from each page with `{ titleKey, descriptionKey, pageType? }`. Resolves both keys with `useI18n().t` and calls `useSeoMeta({ title, description, ogTitle: title, ogDescription: description })`; if `pageType === 'AboutPage'` also `useSchemaOrg([defineWebPage({ '@type': 'AboutPage' })])`.
- `useSeoMeta`, `useSchemaOrg`, `defineOrganization`, `defineWebPage`, `useSiteConfig` are used as **Nuxt auto-imports**, never explicitly imported — the schema-org client tree-shake depends on it (research R3.2).
- Both composables exported from `app/features/shell/index.ts`.

### D-4 · Layout and pages

- `app/layouts/default.vue`: add `useSiteSeo()` next to the existing `useHead(useLocaleHead())`, with a short comment on which tags come from where (research R7 table, condensed).
- `app/pages/index.vue`: replace `useHead({ title: t('site.title') })` with `usePageSeo({ titleKey: 'pages.home.title', descriptionKey: 'pages.home.description' })`; drop the now-unused `t` if nothing else uses it; update the doc comment that mentions `site.title`.
- `app/pages/nosotros.vue`: replace `useHead({ title: t('pages.about.title') })` with `usePageSeo({ titleKey: 'pages.about.title', descriptionKey: 'pages.about.description', pageType: 'AboutPage' })`.

### D-5 · Locales

Add the gate-approved copy (spec DRAFT table) under `pages.home.{title,description}` and `pages.about.description` in both files; delete `site`.

### D-6 · `public/index.html`

Only the alternate line `hreflang="en"` → `hreflang="en-US"`, plus one sentence in the file comment saying the values mirror the i18n `language` tags (feature 35). Nothing else in the file changes.

### D-7 · Tests

- `app/features/shell/logic/resolveShareMeta.test.ts`, `profileUrls.test.ts` (unit).
- `tests/seo-output.test.ts` (new) — asserts [contracts/build-output.md](./contracts/build-output.md) §§ 1–5 against `.output/public`, reusing the `node:path` + `readFileSync` pattern of `static-output.test.ts` (`rules.md` §§ R16, R27). `sameAs` is compared against `SOCIAL_PROFILES` imported from the shell data (proves derivation). Copy assertions read the locale JSON from disk (§ R27), never hardcode the copy.
- `tests/static-output.test.ts`: the existing hreflang test additionally asserts `hreflang="en-US"`; the root-object test additionally asserts `en-US` and `noindex`.

## Project Structure

### Documentation (this feature)

```text
specs/035-technical-seo-indexing/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/build-output.md
├── checklists/requirements.md
└── tasks.md            # /speckit-tasks
```

### Source Code (repository root)

```text
nuxt.config.ts                                  # modules, site, sitemap, robots, i18n en-US
package.json, pnpm-lock.yaml                    # 3 new deps (via pnpm add only)
public/index.html                               # hreflang en → en-US
i18n/locales/es.json, en.json                   # pages.home.*, pages.about.description; site removed
app/features/shell/
├── data/siteIdentity.ts                        # new
├── logic/resolveShareMeta.ts (+ .test.ts)      # new
├── logic/profileUrls.ts (+ .test.ts)           # new
├── logic/useSiteSeo.ts                         # new
├── logic/usePageSeo.ts                         # new
└── index.ts                                    # export the two composables
app/layouts/default.vue                         # useSiteSeo()
app/pages/index.vue, nosotros.vue               # usePageSeo(...)
tests/seo-output.test.ts                        # new
tests/static-output.test.ts                     # hreflang assertions extended
```

**Structure Decision**: The shell already owns "the chrome every page inherits" and the social-profile record; site-wide head data is the same kind of thing and keeps `sameAs` next to its only source. Putting it in `app/shared/` would make `shared` depend on a feature's data, inverting the dependency direction.

## Post-design Constitution re-check

All gates above remain satisfiable by this design; no item needed a Complexity Tracking entry. Gates stay unchecked `[ ]` here — the reviewer ticks them against the implementation.

## Risks carried to implementation

See research.md § UNVERIFIED (U-1 … U-7). The two that would change the design if they fail:
- **U-2**: if `sitemaps: false` still yields an index or duplicate entries → stop and report; do not hand-write a sitemap.
- **U-3**: if `botd` or the schema-org builder appears in `_nuxt/` → stop and report to the leader for the gate (acceptance #8 allows "documented and approved" as the fallback, which only Roberto can grant).

## Complexity Tracking

No violations to justify.
