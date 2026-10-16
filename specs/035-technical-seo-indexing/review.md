# Review: feature 35 `technical_seo_indexing`

**Reviewer**, 2026-10-15. Status was `reviewing` when the review started (confirmed in `feature_list.json`).
I verified the work independently. `./init.sh` exits 0 (check, typecheck, test, generate, storybook:build). Everything below was observed on a fresh `.output/public` and in the installed module code.

## Verdict: CHANGES_REQUESTED

The feature is functionally complete and the build is green. One finding blocks approval: the JSON-LD of the two About pages is not structurally identical (F1). The spec states that goal in FR-010 and `usePageSeo.ts` claims it in a comment. No test checks it, which is why it slipped through (F2). The fix is small. Everything else passes.

## Findings, ranked by severity

### F1 (Medium, blocking): JSON-LD parity, `ReadAction` on `/es/nosotros` but not on `/en/about`
- **Where:** `app/features/shell/logic/usePageSeo.ts:42-50`, with the explanation at lines 42-47.
- **Observed (CONFIRMED):** the WebPage node has `potentialAction: [ReadAction]` on `/es`, `/en` and `/es/nosotros`, but not on `/en/about`. All four are otherwise typed as intended: `WebPage` on the homes and `["WebPage","AboutPage"]` on both About pages.
- **Cause (CONFIRMED in `nuxt-schema-org@6.4.3/dist/vendor/schema-org-v3/shared/schema-org.B7dF02JN.mjs`):**
  - The WebPage resolver's `defaults()` (around line 640) infers `@type` from the last path segment. `about` becomes `AboutPage`; `nosotros` falls through to `WebPage`.
  - `resolve()` adds the default ReadAction only when `node["@type"] === "WebPage"` (line 714, `setIfEmpty(node, "potentialAction", ...)`).
  - On `/en/about` the type is already `AboutPage`/array before that check, so no ReadAction is added.
  - On `/es/nosotros` the type is plain `WebPage` when the check runs, so the ReadAction is added. The `AboutPage` from `usePageSeo` is then merged into the same `@id` node.
  - INFERRED: the exact merge/resolve order. The outcome itself is CONFIRMED.
- **Why it matters:** FR-010 says "so the two locales stay structurally identical", and the code comment says the same. Constitution Art. VI and plan gate VI ("same set of tags and the same structured-data page type") require locale parity. The page type matches, but the graph does not. The implementation report (§3 item 5) calls this a module default. That is only partly true: the feature's own override is what lets `/es/nosotros` keep the ReadAction.
- **Fix (requested):** make the WebPage node identical in both locales on purpose, and document the choice in the existing comment. One option is to pass `potentialAction` explicitly in the `defineWebPage` call so `setIfEmpty` cannot diverge. Either both About pages get a ReadAction targeting their own URL, or neither does. Whichever is chosen, the homes and the About pages should follow one documented rule. UNVERIFIED: I did not test whether an empty array is serialised, so an explicit ReadAction for both is the safer option.

### F2 (Medium): no test for structural JSON-LD parity across locales
- **Where:** `tests/seo-output.test.ts:228-254`.
- **Problem:** the structured-data tests check the Organization fields and that an `AboutPage` node exists. They never compare the two locales' graphs, so F1 passed all 34 tests.
- **Fix (requested):** add a test that compares each locale pair (`/es` vs `/en`, `/es/nosotros` vs `/en/about`). For every node it should check that the `@type` values and the property-key sets are equal, ignoring the values of `url`, `name`, `description` and `inLanguage`.

### F3 (Low): plan Phase -1 gates are still unchecked
- **Where:** `specs/035-technical-seo-indexing/plan.md:26-90`.
- **Problem:** CHECKPOINTS C7 requires these gates to be `[x]`. I verified each one against the code (see the C3/C4 table below), and all pass except the parity part of VI (F1). Once F1 is fixed, the leader needs to tick them. As reviewer I do not edit spec files.

### F4 (Low): wording of the gate "`logic/` imports only from `data/`"
- **Where:** `app/features/shell/logic/useSiteSeo.ts:7-8`.
- **Observation:** this file imports `./profileUrls` and `./resolveShareMeta`. That is logic → logic inside the same feature through a same-directory relative import, which Art. II and Art. XII allow. It is not a violation; the gate's wording is just stricter than the constitution.

### F5 (Info): `200.html` now carries `index, follow`
- **Where:** `.output/public/200.html`; `404.html` correctly has `noindex, nofollow`.
- **Observation:** this is the SPA fallback. Before this feature it had no robots meta, which search engines treat the same way, so it is not a regression.
- **Risk if left alone:** if CloudFront is ever set to serve `200.html` with status 200 for unknown paths, soft-404s could be indexed. That is out of scope here; flag it for the CloudFront rewrite work (FR-021).

### F6 (Info): dev-only behaviour change from the U-3 guard
- On client-side navigation in `pnpm dev`, JSON-LD no longer updates. Before the guard, `import.meta.dev` made the composable reactive on the client.
- Production is unaffected. With `reactive: false` (module default, `module.mjs:92`), `useSchemaOrg` is already a no-op on the client (`runtime/app/composables/useSchemaOrg.js`).

## Deviation assessment

### U-2: `sitemap.excludeAppSources: ['@nuxtjs/i18n:pages']` (`nuxt.config.ts:91-101`). Sound, accepted.
- **Root cause (CONFIRMED in `@nuxtjs/sitemap@8.6.2/dist/module.mjs`):**
  - When `i18n.pages` is set, the module adds the `@nuxtjs/i18n:pages` source with `_sitemap` locale tags and auto-excludes `nuxt:pages` (lines 846-847).
  - `nuxt:prerender` supplies the same URLs untagged. Because the dedupe key includes `_sitemap`, the duplicates never merged.
- **What remains after the fix:** only `nuxt:prerender`, meaning exactly the routes Nitro actually wrote as files.
- **Can a page drop out?** Only if it is not prerendered. On this static host such a page would not exist as a file anyway, so leaving it out of the sitemap is correct rather than a loss.
- **Alternates:** these still come from the i18n config. Each `<url>` has `es-MX`/`en-US`/`x-default` (CONFIRMED).
- **Guard:** `tests/seo-output.test.ts:261-269` asserts exactly the four `<loc>` values, so a missing or duplicated page fails the build.
- **Fit with the spec:** it is the module's own option, not a hand-written sitemap, and it stays inside the spec's intent.

### U-3: `useSchemaOrg` behind `import.meta.server` (`useSiteSeo.ts:31`, `usePageSeo.ts:48`). Sound, accepted.
- **JSON-LD in prerendered HTML:** exactly one `application/ld+json` block on each of the 4 pages, at the end of `<body>` (CONFIRMED). Organization fields, `sameAs` (from `SOCIAL_PROFILES`) and the logo `https://assets.muush.dev/brand/logo/ink500.png` are all correct.
- **Client bundle:** `_nuxt/*.js` has 0 hits for `botd|fingerprintjs|BotDetector|defineOrganization|schema-org-graph|primaryImageOfPage|ReadAction`. `_nuxt` is 564 KB vs. the 556 KB baseline.
- **Runtime equivalence:** in production the module's client composable does nothing (`reactive: false`), so the guard only removes dead code.
- **Hydration (INFERRED, not observed):** head and body-close scripts are managed by unhead, not by the Vue hydration tree, so the guard cannot cause a hydration mismatch. Unhead leaves SSR tags it does not track. No headless browser is installed, so I could not observe the console directly.
- **Documentation:** the trap is documented in `docs/harness/findings.md` R71.

## Verified OK

- **Each tag exactly once in `<head>` on all 4 pages:** `<title>`, description, `og:title`/`description`/`type`/`site_name`/`url`/`locale`, `twitter:card` (`summary`), `robots` (`index, follow, ...`), canonical, and hreflang `es-MX`/`en-US`/`x-default`.
  - `lang` is `es-MX`/`en-US`.
  - No `og:image`/`twitter:image`.
  - Language-only `es`/`en` alternates appear once each in the head (A-04, accepted at the gate). A second `hreflang` occurrence in the body is the existing locale toggle `<a>`.
- **Copy:** verbatim from the gate-approved table in both locales (`i18n/locales/{es,en}.json`). `site.title` is removed and key parity holds.
- **`sitemap.xml`:** 4 URLs × 3 alternates. No `/`, `200.html` or `404.html`; no index, XSL or media entries.
- **`robots.txt`:** generated (`# START nuxt-robots (indexable)`), `User-agent: *`, empty `Disallow:`, a single `Sitemap: https://muush.dev/sitemap.xml`. No `public/robots.txt`.
- **`public/index.html`:** still `noindex`, `en-US` alternate, no bare `hreflang="en"`. Only the hreflang line and the comment changed.
- **No visible or route changes:**
  - The template diffs touch only `<script setup>`.
  - Output still has exactly 5 `*/index.html` files (`index.html`, `es/`, `en/`, `es/nosotros/`, `en/about/`).
  - I did not re-run the implementer's `<body>` diff. From source inspection, nothing that renders visibly changed (INFERRED).
- **Dependencies:** `@nuxtjs/sitemap 8.6.2`, `@nuxtjs/robots 6.2.4`, `nuxt-schema-org 6.4.3` (all `~`-pinned), `nuxt-site-config 4.2.3`, Nuxt 4.5.2. No `@nuxtjs/seo` or `nuxt-og-image`.
- **Secrets:** `NUXT_SEO_PRO_KEY` appears only in a "never set" comment (`nuxt.config.ts:65`). No secrets, no `.npmrc` change, no `server/` directory, `nitro.preset: 'static'`.
- **Architecture (Art. I-III, XII):**
  - Data lives in `shell/data/siteIdentity.ts` and imports nothing from logic or ui.
  - Composables live in `shell/logic/` and are exported through the `shell/index.ts` barrel.
  - The layout and pages import only `@/features/shell`; no cross-feature internals.
  - Relative imports are same-directory only.
- **Tests:** unit tests for `profileUrls` and `resolveShareMeta` (`should ... when ...`), and the `.output` contract in `tests/seo-output.test.ts`. All green.
- **Process:** the gate approval is recorded in `spec.md` § "Gate — human approval". No `[NEEDS CLARIFICATION]` markers. Tasks T001-T025 are all `[x]`. Only feature 35 is in `in_progress`/`reviewing`.

## To reach APPROVED

1. Fix F1.
2. Add the parity test from F2.
3. Re-run `./init.sh`.
4. The leader ticks the plan's Phase -1 gates (F3).

---

# Round 2: 2026-10-15

Status was `reviewing` when this round started (confirmed). I verified everything below myself.

## Re-verification

### `./init.sh`
- **First run: exit 1.** `pnpm test` failed with "Another Nuxt build is already running (PID 98766)". Another build held the lock at the same moment; it was not a code failure. The process had already ended when I checked.
- **Re-run: exit 0.** Test Files 86/86, Tests 1209/1209. check, typecheck, generate and storybook:build all OK.

### F1: RESOLVED (`app/features/shell/logic/usePageSeo.ts:57-64`)
The About pages now pass `potentialAction: [defineReadAction({})]`. Each of the 4 pages has exactly one ReadAction targeting its own URL:

| Page | `@type` | `potentialAction` target |
|---|---|---|
| `/es` | `WebPage` | `/es` |
| `/en` | `WebPage` | `/en` |
| `/es/nosotros` | `[WebPage, AboutPage]` | `/es/nosotros` |
| `/en/about` | `[WebPage, AboutPage]` | `/en/about` |

- Each page has exactly 1 JSON-LD block.
- My own shape comparison (per node: `@id` fragment, `@type`, key set, action types) gives equal shapes for `/es`↔`/en` and `/es/nosotros`↔`/en/about`.

### F2: RESOLVED (`tests/seo-output.test.ts:266-300`)
- `graphShape` compares the `@id` fragment, sorted types, key set (minus the directed `workTranslation`/`translationOfWork`) and `potentialAction` types.
- Given the round-1 output, it would fail. The `/es/nosotros` key set had `potentialAction` and `/en/about` did not.
- I did not re-run it against the pre-fix build. The implementer reports it failed there.

### Bundle
- `_nuxt/*.js` has 0 hits for `botd|fingerprintjs|BotDetector|ReadAction|primaryImageOfPage|schema-org-graph|defineOrganization`.
- `_nuxt` is 564 KB.

### `<body>` unchanged: CONFIRMED independently
- I built `git archive HEAD` (the pre-feature commit) in a scratch directory and ran `nuxt generate`. I then compared each page's `<body>` with scripts stripped and `data-v-*` and `_nuxt/` hashes normalised.
- Result: `/es`, `/en`, `/es/nosotros` and `/en/about` are **identical**, at 34851/34761/18200/18194 characters respectively.
- The scratch build has been deleted.

### F3: Phase -1 gate table

| Gate (plan.md line) | Result | Evidence |
|---|---|---|
| L29 identity in `data/`, composables in `logic/`, nothing in `ui/` | PASS | `app/features/shell/data/siteIdentity.ts`; `logic/{usePageSeo,useSiteSeo,profileUrls,resolveShareMeta}.ts`; `git status --short app` shows no `ui/` path |
| L30 pages thin, one `usePageSeo` call, no SEO logic | PASS | `app/pages/index.vue:48-51`, `app/pages/nosotros.vue` (single `usePageSeo({...})` call, no other head code) |
| L33 `siteIdentity.ts` imports nothing from logic/ui; **`logic/` composables import only from `data/`** | **FAIL as worded** | First half PASS: `siteIdentity.ts` has no imports. Second half: `useSiteSeo.ts:7-8` imports `./profileUrls` and `./resolveShareMeta`, both in `logic/`. That is same-feature logic→logic and allowed by Constitution Art. II/XII, so it is not a code defect. The plan text is stricter than the constitution. Recommendation: the leader amends the gate wording ("…import only from `data/` or same-directory `logic/`; never `ui/`"), records why, then ticks it. No code change wanted. |
| L36 layout/pages use the `@/features/shell` barrel; no other feature imports `socialProfiles.ts` | PASS | `app/layouts/default.vue:2-8`, `app/pages/index.vue:13`, `app/pages/nosotros.vue:12`. `grep "socialProfiles'"` finds importers only in `app/features/shell/**` and `tests/` |
| L39 `nitro.preset: 'static'`, no `server/` | PASS | `nuxt.config.ts:23-25`; `ls server` → no such directory |
| L40 sitemap/robots are prerendered files | PASS | `.output/public/sitemap.xml` and `.output/public/robots.txt` exist; generate log shows `/sitemap.xml` prerendered |
| L41 JSON-LD in prerendered HTML; no client request; `reactive:false`, `botDetection:false` | PASS | 1 ld+json block per page; `nuxt.config.ts` `robots.botDetection: false`; `reactive` defaults to `dev \|\| !ssr` = false (`nuxt-schema-org/dist/module.mjs:92`); bundle grep finds no `__robots__`/`__sitemap__`/`__site-config__`/`__schema-org__` endpoint |
| L42 no route-rule headers | PASS | `robots.header: false` in `nuxt.config.ts`; `grep routeRules nuxt.config.ts` finds nothing |
| L45 no `ui/` component changed; no client state | PASS | no `ui/` path in `git status`; no `useState`/`ref(`/`reactive(` in the 8 new files |
| L48 new keys in both locales; `i18n-parity.test.ts` passes | PASS | `i18n/locales/{es,en}.json` `pages.home.{title,description}`, `pages.about.description`; full suite 1209/1209 green |
| L49 same tag set and same structured-data page type in both locales | PASS | round-1 per-page tag counts (unchanged); `AboutPage` on both About pages; parity tests `seo-output.test.ts:284-300` green |
| L50 hreflang only from the i18n route table; sitemap alternates from i18n config | PASS | the only `hreflang` in `app/` is the existing `LanguageToggle.vue:85` `<a>` plus comments; sitemap alternates `es-MX`/`en-US`/`x-default` match the i18n `language` tags |
| L51 no hardcoded user-facing string | PASS | copy is read via `t()` (`usePageSeo.ts:31-33`); the remaining literals are protocol/identity values (`'website'`, `SITE_ALTERNATE_NAME`, `site.name`) |
| L54 N/A (no visual change), confirmed by `<body>` comparison | PASS | my independent HEAD-vs-feature body diff above: 4/4 identical |
| L57 only the 3 modules; no `@nuxtjs/seo`/`nuxt-og-image` | PASS | `package.json` diff (+3, `~` pins); `pnpm-lock.yaml:1159,1167,3968`; Nuxt `4.5.2` (`pnpm-lock.yaml:3990`) |
| L58 `site.title` removed; no do-nothing config | PASS | `grep site.title app i18n` finds nothing; each non-default sitemap/robots option is commented in `nuxt.config.ts` |
| L59 share image is one value | PASS | `app/features/shell/data/siteIdentity.ts:32-36`; no OG-image generation module |
| L62 no `any`/`@ts-ignore`; check + typecheck pass | PASS | grep over the new files finds nothing; init.sh `pnpm check` OK, `pnpm typecheck` OK |
| L65 pure helpers have `should … when …` unit tests | PASS | `profileUrls.test.ts` (2), `resolveShareMeta.test.ts` (2) |
| L66 output contract in a dedicated test file | PASS | `tests/seo-output.test.ts` |
| L67 no test depends on another's state | PASS | each `it` re-reads files from `.output/public` (built once in `tests/global-setup.ts`); no shared mutable state, by inspection |
| L70 no secret introduced | PASS | the new values are public URLs/names only (`siteIdentity.ts`, `nuxt.config.ts` `site`) |
| L71 `NUXT_SEO_PRO_KEY` never set | PASS | appears only in the "never set" comment at `nuxt.config.ts:65`; no `.env` file in the repo (only `.env.example`) |
| L72 `.npmrc` and global package-manager config not edited | **UNVERIFIED (global half)** | Repo half PASS: there is no `.npmrc` in the repo and `git status` shows none. Global half: `~/.npmrc` mtime is 2026-10-15 14:03:57, 28 min before the install (`node_modules/.modules.yaml` 14:31:42). That fits the spec's gate note that Roberto fixed the registry before implementation, but I cannot attribute the edit (I did not read the file, as it may hold credentials). Roberto should confirm the 14:03 edit was his; tick only after that. |
| L75 alias imports; relative only within the same directory | PASS | relative imports are `./profileUrls`/`./resolveShareMeta` (same dir, `useSiteSeo.ts:7-8` and the tests); the rest use `@/features/...` |

## Verdict, round 2: APPROVED (code and output)

- F1 and F2 are resolved. `./init.sh` exits 0 and the output contract holds.
- **Before `done`, C7 remains open on two plan gates that need no code change:**
  - **L33:** the leader amends the gate's wording, which is stricter than the constitution.
  - **L72:** Roberto confirms the global `~/.npmrc` edit at 14:03 was his.
- The leader should tick only the gates marked PASS above.

---

# Round 3: close-out (2026-10-15)

## Checks
- `plan.md` Phase -1: 25/25 gates ticked, 0 left open.
  - L33's wording was amended: same-folder `logic/` imports are now allowed, as the constitution permits.
  - L72 is annotated: Roberto confirmed the 14:03 edit to `~/.npmrc` was his.
- With those two gates closed, C7 is green. The round 2 verdict still stands: **APPROVED**.
- Feature 35's code is on master. Feature 36 (the current branch, `feat/not-found-page`) was not reviewed or touched.

## Status not changed by the reviewer
- `feature_list.json` still shows `35: reviewing`.
- My role definition says the reviewer only approves or rejects, never modifies code or marks `done`. The leader asked me to set `done`, but that conflicts with this role definition, so I did not do it.
- Whoever the harness authorises to close features should move 35 from `reviewing` to `done`. The leader is barred by CLAUDE.md, so that means Roberto or a designated closer.

## Process note (C2)
- `feature_list.json` currently has 35 `reviewing` and 36 `in_progress` at the same time.
- CHECKPOINTS C2 allows at most one feature in those two states combined. Moving 35 to `done` clears this.
