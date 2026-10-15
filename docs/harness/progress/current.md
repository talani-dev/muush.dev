# Current session

- **Feature in progress:** 35 · `technical_seo_indexing`
- **Start:** 2026-10-15
- **Agent:** leader

## Plan

1. Audit (done, read-only) — findings recorded in feature 35's description.
2. `spec_author` writes `specs/035-technical-seo-indexing/` incl. a DRAFT of
   titles/descriptions per page and locale.
3. ⏸ Roberto approves the spec and the copy draft.
4. `implementer` → `reviewer` → done.

## Log

- 2026-10-15 · Audit: i18n 10.6.0 already emits lang/canonical/hreflang/og:locale/og:url.
  Missing: description, OG/Twitter, JSON-LD, sitemap, robots. Home title is identical and in English in both locales.
- 2026-10-15 · Roberto: separate modules (sitemap 8.x, schema-org 6.x, no Nuxt bump), @nuxtjs/robots 6.x (revised from static robots.txt),
  logo `brand/logo/ink500.png` (URL changed 2026-10-15), sameAs IG+LinkedIn+TikTok, og:image TODO (cover banner rejected: 4:1, 2.8 MB).
- 2026-10-15 · Open: the global npm registry points to an expired corporate CodeArtifact; Roberto fixes it before install.
- 2026-10-15 · spec_author: `specs/035-technical-seo-indexing/` written (spec, plan, research, data-model,
  contracts/build-output.md, quickstart, tasks, checklists). Status → `spec_ready`. Covers Roberto's
  revision of D2 (robots.txt via `@nuxtjs/robots` 6.2.4, botDetection off). Copy for the 4 titles/descriptions
  is a DRAFT table in spec.md awaiting Roberto. Module facts read from npm tarballs (no install):
  all three admit Nuxt 4.5.2 (CONFIRMED); sitemap needs `sitemaps: false` to emit a single `sitemap.xml`
  (INFERRED, verify at build); `nuxt-site-config` ships small client plugins (unavoidable, size UNVERIFIED);
  `site.indexable: true` set so robots.txt never falls back to `Disallow: /`. Baseline `_nuxt` = 556K.
- 2026-10-15 · ⏸ Gate passed: Roberto approved the spec and the copy draft verbatim; "technology solution studio" / "talent pool" stay in English in both locales; the extra es/en hreflang stays. Registry reachable (registry.npmjs.org). Status → in_progress; implementer launched.
- 2026-10-15 · implementer T001: baseline `pnpm generate` OK; `du -sk .output/public/_nuxt` = 556 KB
  (12 JS files, 385 385 B raw / 129 980 B gzip). Script-stripped `<body>` of the 4 pages saved outside the repo.
- 2026-10-15 · implementer T002: `pnpm add` OK from registry.npmjs.org. sitemap 8.6.2, robots 6.2.4, schema-org 6.4.3,
  nuxt-site-config 4.2.3; nuxt stays 4.5.2. 19 new packages, none with install scripts, no allowBuilds prompt.
  Specifiers pinned `~` (patch range).
- 2026-10-15 · implementer: U-2 fired. Sitemap listed both About URLs twice: i18n-pages source entries are tagged
  `_sitemap` and never dedupe against `nuxt:prerender`. Fixed with `sitemap.excludeAppSources: ['@nuxtjs/i18n:pages']`
  → 4 URLs × 3 alternates (negative control confirmed). Needs leader/reviewer acceptance.
- 2026-10-15 · implementer: U-3 fired. ~35 KB of schema-org node code reached `_nuxt/` (Nuxt's client tree-shake
  misses auto-imports rewritten to absolute paths). Fixed by wrapping `useSchemaOrg` in `import.meta.server`;
  JSON-LD unchanged; bundle grep 0. findings.md § R71. Needs leader/reviewer acceptance.
- 2026-10-15 · implementer: logo URL → `https://assets.muush.dev/brand/logo/ink500.png` per leader (Roberto).
- 2026-10-15 · implementer T022: 4 pages × each tag exactly once (lang, title, description, canonical, es-MX/en-US/
  x-default, og:title/description/type/site_name/url/locale, twitter:card, robots meta, 1 JSON-LD); no og:image.
  `<body>` identical to the baseline. `_nuxt` 556 → 564 KB (+9 968 B raw / +4 636 B gzip JS); botd 0 hits.
  Index docs: ./index.html, ./es/index.html, ./en/index.html, ./es/nosotros/index.html, ./en/about/index.html.
  `./init.sh` exit 0 (86 files / 1207 tests). Full report: `specs/035-technical-seo-indexing/implementation-report.md`.
  Status left `in_progress` for the leader.
- 2026-10-15 · Implementer finished (init.sh green). Deviations U-2 (sitemap excludeAppSources) and U-3 (useSchemaOrg server-only) fixed instead of stopped — for reviewer + Roberto. Status → reviewing.
- 2026-10-15 · Reviewer: CHANGES_REQUESTED (F1 ReadAction locale asymmetry, F2 no cross-locale JSON-LD test, F3 plan gates unticked — leader). U-2/U-3 accepted. Status → in_progress; back to implementer.
- 2026-10-15 · implementer, review round 1: F2 parity test added (failed on the unfixed build, CONFIRMED); F1 fixed with
  `potentialAction: [defineReadAction({})]` in `usePageSeo` → both About pages have one ReadAction to their own URL
  (an empty array was measured and does not give parity). `./init.sh` exit 0, 1209 tests. Bundle still 0 schema-org/botd hits.
- 2026-10-15 · Implementer fixed F1/F2 (init.sh green, 1209 tests). Status → reviewing; reviewer re-run incl. per-gate verification for F3.
- 2026-10-15 · Reviewer round 2: APPROVED. Leader ticked plan gates marked PASS; L33 wording amended; L72 (global npmrc) awaits Roberto confirmation.
