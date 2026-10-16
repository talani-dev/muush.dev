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

## Feature 36 · `not_found_page` — spec_author (2026-10-15)

- Package written: `specs/036-not-found-page/` (spec, plan, research, data-model, quickstart, tasks,
  contracts/{build-output,components,edge-not-found}.md, checklists/requirements.md, reference/ = Roberto's
  404.html + README.md copied verbatim, sha256 recorded in spec.md). No `[NEEDS CLARIFICATION]`; clarify not needed.
- Verified in a scratch clone (no repo file outside specs/ touched): Nitro never writes a non-200 route and
  Nuxt fails the build on it → `error.vue` + prerender `/es/404`, `/en/404` + `prerender:generate` hook clearing
  that 404 writes `es/404/index.html`, `en/404/index.html` in the right language, no canonical/hreflang, sitemap
  unchanged. Same hook skips `200.html`/`404.html` (decision: drop both). Headless Chrome vs a CloudFront
  simulator: language stable, no console errors, but the client rewrote the URL to `/en/404` until
  `payload.path` is removed server-side (then URL kept). Nav LED CTA ships visible on the 404 today → plan
  removes it (not hides) while an error is shown.
- Status → `spec_ready`. Gate questions G1–G5 in plan.md. Edge contract is Roberto's to apply in muush-foundation.
- 2026-10-15 · Gate answers recorded in specs/036-not-found-page (spec § Gate): G1 copy approved; G2/G3 reuse
  `text-display` + `BotonPrimario hero`; G4 red glow added (SectionGlow red-400/60/1400-700, 2 new position
  tokens `--spacing-not-found-glow-x/y`, tasks T035–T037); G5 Stage 1 = ENGLISH 404 for every missing path
  (Roberto's correction, differs from defaultLocale es / x-default), Stage 2 deferred to muush-foundation.
  Status stays `spec_ready`.
- 2026-10-15 · ⏸ Gate passed (feature 36): Roberto approved the spec incl. glow deltas and English Stage 1 fallback. Status → in_progress; implementer launched on branch feat/not-found-page.

## Feature 36 · `not_found_page` — implementer (2026-10-15)

- T001 baseline: `./init.sh` exit 1 before any change — `feature_list.json` check (35 `reviewing` + 36
  `in_progress`) and `pnpm check` (lint warnings inside the verbatim `reference/404.html`). Output had
  `200.html`, `404.html`, the 4 pages, `index.html`; script-stripped bodies saved to the scratchpad.
- Implemented T002–T037 (all ticked). `es/404/index.html` and `en/404/index.html` written via the
  `prerender:generate` hook; `200.html`/`404.html` skipped; sitemap still the same 4 URLs.
- Deviations (detail in `specs/036-not-found-page/implementation-report.md` § 5): D1 new
  `app/plugins/not-found-locale.client.ts` + `pinNotFoundLocale.ts` — Stage 1 served the English doc at
  `/es/*`, i18n flipped it to Spanish on hydration (mismatch error) until pinned via the public
  `i18n:beforeLocaleSwitch` hook; D2 `og:locale(:alternate)` removed on the 404s (research F19 was
  wrong); D3 `--spacing-not-found-glow-y` corrected from measurement (nav in-flow 68/78 → token
  172/162; bloom centre now page-y 240 at 1440 and 390); D4 `biome.json` excludes `specs/**/reference`
  and adds `app/error.vue` to the multi-word override; D6 nav pill 68 px tall on the 404 vs 72 elsewhere.
- Browser check (headless Chrome, quickstart § 3): Stage 1 and Stage 2, 6 URLs × 1440/390 + clicks — all
  pass after D1; outputs in the report § 4. Measurements in § 6 (rings 700/500/300 and 420/300/180).
- Body of the 4 existing pages identical to baseline modulo SiteNav's scoped-style id.
- Final `./init.sh`: everything OK (typecheck, check, 93 files / 1304 tests, generate, storybook) except
  the pre-existing `feature_list.json` check (feature 35 still `reviewing`). Status left `in_progress`.
- 2026-10-15 · Roberto confirmed he edited ~/.npmrc himself → feature 35 gate L72 ticked; sent to reviewer for close-out. Leftover scratch server on :4310 (all interfaces) stopped by leader. Feature 36: Roberto wants nav at 72 px on the 404 too (D6).
- 2026-10-15 · implementer, D6 (Roberto: nav 72 px on the 404 too): `--spacing-nav-cta-h` derived from
  btn-nav-y + text-button-sm; SiteNav end group gets `lg:min-h-nav-cta-h` only without a CTA. Measured
  72 px on the 404s; other pages' bodies unchanged. Glow-y re-derived to 168/162 (centre 240 at both widths).
  `./init.sh` exit 1, only because feature 35 is still `reviewing`; all else OK (1312 tests).
- 2026-10-15 · Feature 37 english_default_locale registered as pending (Roberto: after 36).
- 2026-10-15 · implementer, G6 (Roberto: runtime 404 language = prefix, else English): universal plugin
  `app/plugins/not-found-locale.ts` + `logic/notFoundLocale.ts` (replaces pinNotFoundLocale/.client plugin).
  Dev verified (/fr/es, /xyz, /en/xyz → en; /es/xyz → es; no mismatch). Prerendered 404s unchanged.
  `./init.sh` exit 1 only on feature_list (35 still reviewing). Open: edge contract Stage 2 unprefixed → es conflicts with G6.
- 2026-10-15 · Leader aligned edge contract + quickstart simulator Stage 2 with G6 (unprefixed → en). Implementer: runtime 404 locale rule done (/es→es, else en).
- 2026-10-15 · Feature 35 → done, explicitly authorized by Roberto ("si autoriza a marcarla como done"); reviewer had APPROVED (round 2) and all gates ticked. Feature 36 → reviewing.
- 2026-10-15 · Reviewer (36): CHANGES_REQUESTED — G6 doc alignment incomplete (fixed by leader in spec.md, edge contract, research F10); payload.path test + test names + plan Complexity Tracking + report §1 back to implementer. Status → in_progress.
- 2026-10-15 · implementer, review round 1: payload-`path` output guard (negative control: 2 red),
  16 test names → `should … when …`, plan Complexity Tracking +2 rows (locale plugin, og:locale override),
  report § 1/§ 9 fixed + § 10. `./init.sh` exit 0 (1326 tests). Status left `in_progress`.
- 2026-10-15 · Implementer fixed review items (payload test, 16 test names, plan rows, report). init.sh exit 0. Status → reviewing; reviewer round 2.
- 2026-10-15 · Reviewer (36) round 2: APPROVED. Leader fixed stale data-model/tasks lines. Reviewer reported accidentally deleting node_modules/.cache (build cache only; init.sh passed after).
- 2026-10-15 · Feature 36 → done, explicitly authorized by Roberto ("ponla en done"); reviewer APPROVED round 2.
- 2026-10-15 · Roberto: switch to feature 33 (ip_locale_root_redirect) before 37. Branch feat/ip-locale-root-redirect; spec_author launched.

## Feature 33 · `ip_locale_root_redirect` — spec_author (2026-10-15)

- Package written: `specs/033-ip-locale-root-redirect/` (spec, plan, research R1–R10, data-model, quickstart, tasks T001–T016,
  contracts/{edge-root-locale-redirect,locale-preference-cookie}.md, checklists/requirements.md). No `[NEEDS CLARIFICATION]`;
  clarify skipped. Leader proposals (a)–(e) plus the 2026-10-15 context are gate questions G1–G8 with recommendations
  (spec § Gate questions); none decided.
- Recommendations: edge 302 in `request-router`; unknown country → /en; feature 33 leaves public/index.html, rootRedirect and
  x-default untouched (feature 37 moves them to /en) and the "sin borde → /es" acceptance item is reworded; cookie
  `muush_locale` (es|en, Path=/, host-only, Secure, Lax, 365 d) written by the toggle; list of 20 codes, GQ include, US exclude,
  living only in the edge contract; replace the 301 in the same change and accept cached 301s; 302 + private, no-store, no Vary.
- Repo scope: `shell/data/localePreference.ts`, `shell/logic/localePreference.ts` (+test), `LanguageToggle.vue` (+test),
  `tests/locale-preference-output.test.ts`. CONFIRMED: nothing in `app/` reads/writes localStorage or cookies today
  (ui-map § 1 claims localStorage memory). Existing tests pin `/` → /es (static-output:97) and x-default → /es (seo-output:368).
- spec-kit scripts reject branch `feat/...`; ran them with `SPECIFY_FEATURE=033-ip-locale-root-redirect`. `.specify/feature.json`
  now points at specs/033 (written by /speckit-specify). CLAUDE.md has no SPECKIT markers → agent-context step skipped.
- Status → `spec_ready`. ⏸ Roberto answers G1–G8; edge contract is his to apply in muush-foundation.
- 2026-10-15 · ⏸ Gate passed (feature 33): Roberto approved G1–G8 as recommended (US → /en, GQ → /es, cookie muush_locale). Acceptance item reworded per G3. Status → in_progress; implementer launched.

## Feature 33 · `ip_locale_root_redirect` — implementer (2026-10-15)

- T001 baseline: `./init.sh` exit 0 before any change (93 files / 1326 tests; typecheck, check, generate,
  storybook OK). `grep -rn "document.cookie\|localStorage" app/` prints nothing (spec C4 CONFIRMED).
  Baseline `.output/public` copied to the session scratchpad (7 HTML docs incl. both 404s, 11 `_nuxt` files).
- T002/T009: gate answers applied to the spec package. Edge contract § 3 now has 21 codes (+GQ; US excluded), reference
  `SPANISH_SPEAKING`, R-2/R-3, G2 = en. Both contracts and the data model are marked agreed. Spec status line set to
  approved (the gate section already existed).
- T003–T008: `shell/data/localePreference.ts`, `shell/logic/localePreference.ts` (+7 unit tests incl. a type guard with a
  negative control), `LanguageToggle.vue` (`onToggleClick` writes first, then the unchanged `preserveAnchor`; +6 component
  tests, the 11 existing ones textually unchanged), `tests/locale-preference-output.test.ts`. Tests were red before the code.
- T010–T012/T015: `git diff master` is empty for pages/layouts/plugins/i18n/nuxt.config/public/index.html/package.json/lockfile
  and the 35/36 output tests. Same-environment control build: all 6 docs + both 404s + index.html/sitemap/robots are
  equal apart from build tokens. Only one JS chunk changed (+184 B raw / +90 B gzip).
- T014: headless Chrome 155 against a 127.0.0.1-only static server (both stopped afterwards). Cookie `muush_locale` is
  host-only, Path=/, Secure, SameSite=Lax, 365 d. Toggle navigation is unchanged (incl. /es/nosotros#work → /en/about#work).
  ⌘-click writes, middle-click does not, no-JS writes nothing, `/` → /es (G3).
- Finding: a scratch git worktree with symlinked node_modules builds into the MAIN repo's `node_modules/.cache/nuxt/.nuxt`
  (this repo's buildDir). Nothing was deleted; the symlink was unlinked before the worktree was removed; the cache was
  rebuilt by later runs.
- Final `./init.sh` exit 0 (95 files / 1341 tests). Report: `specs/033-ip-locale-root-redirect/implementation-report.md`.
  Status left `in_progress` for the leader.
- 2026-10-15 · Implementer finished feature 33 (init.sh exit 0, 1341 tests). Leader added findings R73. Status → reviewing.
- 2026-10-15 · Reviewer (33): CHANGES_REQUESTED — flaky cookie-cleanup test (back to implementer); FR-006/013/019/020 wording updated to approved values by leader. Status → in_progress.
- 2026-10-15 · implementer, review round 1 (finding 1, flaky cookie cleanup): happy-dom treats `Max-Age=0` as "expires
  now", which is not strictly in the past. Added a shared helper `shell/logic/localePreference.testing.ts` that expires
  the cookie at the epoch, used by both test files. The "only rendered → no cookie" assertion is unchanged. New
  same-millisecond regression test (fake timers) fails with `Max-Age=0` (negative control) and passes with the fix.
  The two files looped 25×: 25/25 pass. `./init.sh` ×2: exit 0 both times (1342 tests). spec.md untouched. Status in_progress.
- 2026-10-15 · Implementer fixed flaky cookie cleanup (25/25 loops, init.sh exit 0 ×2). Status → reviewing; reviewer round 2.
- 2026-10-15 · Reviewer (33) round 2: APPROVED. Leader wrote the missing history.md entries for 35 and 36 (C6).
- 2026-10-15 · Feature 33 → done, explicitly authorized by Roberto ("si, te autorizo"); history entry written. Next: /commit-flow with bump 1.6.0 on the branch.
