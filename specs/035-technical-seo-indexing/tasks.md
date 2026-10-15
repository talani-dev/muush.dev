# Tasks: Technical SEO for Google indexing (feature 35)

**Input**: `specs/035-technical-seo-indexing/` — spec.md, plan.md, research.md, data-model.md, contracts/build-output.md, quickstart.md
**Tests**: required — Constitution Art. X (pure helpers unit-tested) and the output contract asserted on `.output/public`.

**Hard stops for the implementer**
- If `pnpm add` / `pnpm install` fails for a registry or auth reason: **stop, report the exact error, change nothing else**. Never edit `.npmrc`, `~/.npmrc`, `pnpm config` or `npm config`.
- Never create `public/robots.txt` (the robots module would rename it inside the repo — research R5.5).
- Never set `NUXT_SEO_PRO_KEY` (research R1).
- The copy written in T008 is the text **Roberto approved at the gate**. If the approval message changed any cell of the spec's DRAFT table, use the approved version; if the approval is ambiguous, stop and ask the leader.

Format: `- [ ] Txxx [P?] [USn?] Description with file path`

## Phase 1: Setup

- [x] T001 Record the baseline before any change: run `pnpm generate`, note `du -sk .output/public/_nuxt` and save the `<body>` of `.output/public/{es,en,es/nosotros,en/about}/index.html` with `<script>` elements stripped (quickstart.md § Before installing) to a scratch location outside the repo; write the baseline size into `docs/harness/progress/current.md`.
- [x] T002 Add the three dependencies with `pnpm add @nuxtjs/sitemap@^8.6.2 @nuxtjs/robots@^6.2.4 nuxt-schema-org@^6.4.3` (updates `package.json`, `pnpm-lock.yaml`). Then confirm in `pnpm-lock.yaml`: sitemap 8.x, robots 6.x, schema-org 6.x, `nuxt-site-config` 4.x, `nuxt` still 4.5.x, and that `@nuxtjs/seo` and `nuxt-og-image` are absent. Any install-script prompt or failure → stop and report (research U-1, U-7).

## Phase 2: Foundational (blocks every story)

- [x] T003 In `nuxt.config.ts`: add `const SITE_URL = 'https://muush.dev'` above `defineNuxtConfig` and use it for `i18n.baseUrl`; append `'@nuxtjs/sitemap'`, `'@nuxtjs/robots'`, `'nuxt-schema-org'` to `modules` after `'@nuxtjs/i18n'`/`'@nuxt/fonts'`; add `site: { url: SITE_URL, name: 'muush', indexable: true }` with a comment citing research R5.4 (robots.txt must not depend on the build env name) and R8 (one URL for site and i18n).
- [x] T004 In `nuxt.config.ts` change the English locale to `language: 'en-US'` (keep `code: 'en'`, `file`, `name`), and extend the i18n comment to say the tag feeds `lang`, `hreflang`, `og:locale` and the sitemap alternates (feature 35, D3).
- [x] T005 [P] Create `app/features/shell/data/siteIdentity.ts` exporting `SITE_ALTERNATE_NAME = 'muush.dev'`, `SITE_LOGO_URL = 'https://assets.muush.dev/brand/logo/ink500.png'`, the `ShareImage` interface and `SHARE_IMAGE: ShareImage = { url: null, width: 1200, height: 630 }` with a `TODO(D6)` comment: Roberto uploads a 1200×630 image; paste its absolute URL in `url`; `twitter:card` switches to `summary_large_image` automatically; the cover banner `brand/cover/muush.png` was rejected (4:1, 2.8 MB). Doc comment states that `name`/`url` are NOT here (they come from `site` in `nuxt.config.ts`) and that `sameAs` comes from `socialProfiles.ts`. Imports nothing from `logic/` or `ui/`.

**Checkpoint**: `pnpm generate` still succeeds and the 4 pages still render (`pnpm test` may show the hreflang test needing T018).

## Phase 3: User Story 1 — right title and description per page, in its language (P1) 🎯 MVP

**Goal**: unique translated `<title>` + description on the 4 pages; `en-US` everywhere i18n emits it; root object aligned.
**Independent test**: contract § 1 rows `lang`…`x-default`, title, description; contract § 4.

- [x] T006 [P] [US1] Create `app/features/shell/logic/usePageSeo.ts`: `usePageSeo({ titleKey, descriptionKey, pageType? }: { titleKey: string; descriptionKey: string; pageType?: 'AboutPage' })` resolves both keys with `useI18n().t` and calls `useSeoMeta({ title, description, ogTitle: title, ogDescription: description })`. Use `useSeoMeta` as a Nuxt auto-import (no explicit import). The `pageType` branch is added in T014. Doc comment: lang/canonical/hreflang/og:locale/og:url are NOT set here (layout, `useLocaleHead`).
- [x] T007 [US1] Export `usePageSeo` from `app/features/shell/index.ts`.
- [x] T008 [P] [US1] In `i18n/locales/es.json` and `i18n/locales/en.json`: add `pages.home.title`, `pages.home.description`, `pages.about.description` with the gate-approved copy (spec § Proposed copy); keep `pages.about.title`; delete the `site` object (`site.title`). Values contain no `@` (rules.md § R26). Same keys in both files.
- [x] T009 [US1] In `app/pages/index.vue` replace `useHead({ title: t('site.title') })` with `usePageSeo({ titleKey: 'pages.home.title', descriptionKey: 'pages.home.description' })` imported from `@/features/shell`; remove `const { t } = useI18n()` if it becomes unused; fix the doc comment that says "`site.title` stays".
- [x] T010 [US1] In `app/pages/nosotros.vue` replace `useHead({ title: t('pages.about.title') })` with `usePageSeo({ titleKey: 'pages.about.title', descriptionKey: 'pages.about.description', pageType: 'AboutPage' })`; remove `t` if unused.
- [x] T011 [P] [US1] In `public/index.html` change only `<link rel="alternate" hreflang="en" …>` to `hreflang="en-US"` and add one sentence to the file comment: the hreflang values mirror the i18n `language` tags (`es-MX`, `en-US`) since feature 35; the file stays `noindex` and out of the sitemap. Nothing else changes.

**Checkpoint**: `pnpm generate`; the 4 heads show distinct titles/descriptions, `lang="en-US"` on EN pages.

## Phase 4: User Story 2 — brand tied to muush.dev and its profiles (P1)

**Goal**: one JSON-LD graph per page with the Organization; About = `AboutPage` in both locales.
**Independent test**: contract § 1 JSON-LD rows.

- [x] T012 [P] [US2] Create `app/features/shell/logic/profileUrls.ts`: pure `profileUrls(profiles: readonly SocialProfile[]): string[]` returning the `href`s in record order; plus `profileUrls.test.ts` with `should return the three profile hrefs in record order when given SOCIAL_PROFILES` and `should return an empty list when given no profiles`.
- [x] T013 [US2] Create `app/features/shell/logic/useSiteSeo.ts` (auto-imports only: `useSiteConfig`, `useSchemaOrg`, `defineOrganization`, `useSeoMeta` — research R3.2): read `name`/`url` from `useSiteConfig()`; call `useSchemaOrg([defineOrganization({ name, alternateName: SITE_ALTERNATE_NAME, url, logo: SITE_LOGO_URL, sameAs: profileUrls(SOCIAL_PROFILES) })])`. The social-meta half is added in T016. Export it from `app/features/shell/index.ts`.
- [x] T014 [US2] In `app/features/shell/logic/usePageSeo.ts` add: when `pageType === 'AboutPage'`, `useSchemaOrg([defineWebPage({ '@type': 'AboutPage' })])` (auto-imports), with a comment citing research R3.4 (otherwise only `/en/about` would be an AboutPage).
- [x] T015 [US2] In `app/layouts/default.vue` call `useSiteSeo()` (from the existing `@/features/shell` import) right after `useHead(useLocaleHead())`, and extend that comment with a 3-line map: i18n → lang/canonical/hreflang/og:locale/og:url; `useSiteSeo` → og:type/og:site_name/twitter:card/Organization; pages → title/description via `usePageSeo`.

## Phase 5: User Story 4 — shared links preview as muush (P2)

**Goal**: og/twitter tags; image as a one-value TODO.
**Independent test**: contract § 1 og/twitter rows; flipping `SHARE_IMAGE.url` in the unit test flips the card.

- [x] T016 [P] [US4] Create `app/features/shell/logic/resolveShareMeta.ts`: pure `resolveShareMeta(image: ShareImage)` → `{ twitterCard: 'summary' }` when `url === null`, else `{ twitterCard: 'summary_large_image', ogImage: { url, width, height }, twitterImage: url }`; plus `resolveShareMeta.test.ts` with `should return a summary card and no image when the url is null` and `should return a large card with the image and its size when the url is set`.
- [x] T017 [US4] In `app/features/shell/logic/useSiteSeo.ts` add `useSeoMeta({ ogType: 'website', ogSiteName: name, ...resolveShareMeta(SHARE_IMAGE) })`.

## Phase 6: User Story 3 — crawler discovers the 4 pages (P1)

**Goal**: one prerendered `sitemap.xml` with alternates; generated allow-all `robots.txt`.
**Independent test**: contract §§ 2–3.

- [x] T018 [US3] In `nuxt.config.ts` add `sitemap: { sitemaps: false, xsl: false, discoverImages: false, discoverVideos: false }`, each with a comment: `sitemaps: false` — the i18n default is a per-locale index plus a `/sitemap.xml` redirect a static host cannot serve (research R2.3); `xsl`/discover — keep the file to the 4 URLs + alternates (R2.5). No `urls`/`exclude` additions.
- [x] T019 [US3] In `nuxt.config.ts` add `robots: { botDetection: false, header: false, mergeWithRobotsTxtPath: false }`, commenting each: bot detection off so `@fingerprintjs/botd` cannot reach the browser (R5.7); `header: false` because route-rule headers never reach a static host (R5.8, rules.md § R25); `mergeWithRobotsTxtPath: false` so a `public/robots.txt` can never be renamed in the repo (R5.5). Do not add `robots.sitemap` (the sitemap module adds it — R2.6).

## Phase 7: User Story 5 + verification (P1)

- [x] T020 [P] [US5] Create `tests/seo-output.test.ts` asserting contract §§ 1–5 on `.output/public` (pattern of `tests/static-output.test.ts`: `node:path` `join(process.cwd(), …)`, `readFileSync`, no `new URL` — rules.md §§ R16, R27). Read expected titles/descriptions from `i18n/locales/*.json` via `readFileSync` + `JSON.parse` (never import them, never hardcode copy). Compare `sameAs` to `SOCIAL_PROFILES.map(p => p.href)` imported from `@/features/shell/data/socialProfiles`. Cover: each tag exactly once per page; titles pairwise distinct and ending ` · muush`; no `og:image`/`twitter:image` while `SHARE_IMAGE.url` is null; one `ld+json` per page with the Organization fields; `AboutPage` on both About pages; sitemap has exactly the 4 `<loc>` and 3 alternates each, none of `/`, `200.html`, `404.html`, no `sitemap_index.xml`/`__sitemap__/`; robots.txt has `User-agent: *`, no `Disallow: /` line, exactly one `Sitemap: https://muush.dev/sitemap.xml`; root `index.html` keeps `noindex` and has `en-US`/`es-MX`/`x-default` and no bare `hreflang="en"`; no `_nuxt/*.js` contains `botd`/`fingerprintjs`; `public/robots.txt` and `public/_robots.txt` do not exist. Test names follow `should … when …`.
- [x] T021 [US5] In `tests/static-output.test.ts`: extend `should build the hreflang alternates from the same route table` to also expect `hreflang="en-US"` → `https://muush.dev/en/about` and `hreflang="es-MX"` → `https://muush.dev/es/nosotros`; extend `should write a document at the root pointing at the Spanish home` to expect `hreflang="en-US"` and `noindex`. Keep the existing `i18n-alt-en` assertion only if the build still emits it (research U-4); if not, replace it and note why in the test comment.
- [x] T022 [US5] **Verification task (manual, after `pnpm generate`)** — run quickstart.md § Inspect the output and paste the results into `docs/harness/progress/current.md`:
  1. For each of `.output/public/{es,en,es/nosotros,en/about}/index.html`: `<html lang>`, `<title>`, meta description, canonical, every `hreflang` alternate, `og:*`, `twitter:*`, `<meta name="robots">`, and the count of `application/ld+json` — confirm each appears **exactly once** (catch-all `es`/`en` alternates noted, not counted as duplicates).
  2. Pretty-print the JSON-LD of one ES and one EN page; confirm the Organization fields and `sameAs`.
  3. List every `<loc>` and `hreflang` in `.output/public/sitemap.xml`, and the full text of `.output/public/robots.txt`.
  4. Diff each page's script-stripped `<body>` against the T001 baseline; any difference other than hashes/payload is a regression → stop.
  5. `du -sk .output/public/_nuxt` vs. the T001 baseline (report the delta), and grep `_nuxt/*.js` for `botd|fingerprintjs|BotDetector` and for `defineOrganization|schema-org-graph` (research U-3). A hit for botd or the schema-org builder → stop and report to the leader for the gate.
  6. **List every `*/index.html` under `.output/public`** (`find .output/public -name index.html | sort`) — report-only, for the CloudFront index-document rewrite (FR-021). Do not implement the rewrite.

## Phase 8: Polish & gate

- [x] T023 Run `pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm generate`, `pnpm storybook:build`; all must pass (FR-020, research U-6). Fix only within this feature's files.
- [x] T024 Confirm `git status` touches only: `nuxt.config.ts`, `package.json`, `pnpm-lock.yaml`, `public/index.html`, `i18n/locales/{es,en}.json`, `app/features/shell/{data/siteIdentity.ts,logic/{usePageSeo,useSiteSeo,profileUrls,resolveShareMeta}.ts,logic/*.test.ts,index.ts}`, `app/layouts/default.vue`, `app/pages/{index,nosotros}.vue`, `tests/seo-output.test.ts`, `tests/static-output.test.ts`, harness files. No `.npmrc`, no `public/robots.txt`, no `docs/business/`.
- [x] T025 Update `docs/harness/progress/current.md` with the T022 report (including the `*/index.html` list and the bundle delta) and any technical finding (in `docs/harness/findings.md`, not in `docs/business/`).

## Dependencies & order

- T001 → T002 → T003 → T004 → everything else. T005 after T003.
- US1: T006 → T007 → T009/T010; T008 and T011 parallel. US2 needs T005, T007 (barrel) and T006 (for T014). US4 extends `useSiteSeo` (T013 → T017). US3 (T018, T019) needs only T003 and can run in parallel with US1/US2/US4 (same file as T003/T004 — do them sequentially in `nuxt.config.ts`).
- T020/T021 after all implementation; T022 after T020/T021 pass; T023–T025 last.

## Parallel examples

- After T005: `T006`, `T008`, `T011`, `T012`, `T016` touch different files.
- `T018` and `T019` both edit `nuxt.config.ts` — sequential.

## Implementation strategy

MVP = Phase 1–3 (titles, descriptions, `en-US`) — fixes the duplicate English home title, the request's first symptom. Then US2 (identity), US4 (social), US3 (sitemap/robots), and the verification phase. The feature is only `reviewing`-ready after T022–T025.
