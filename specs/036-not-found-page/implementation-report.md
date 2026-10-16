# Implementation report — feature 36 `not_found_page`

**Date:** 2026-10-15 · **Agent:** implementer · **Branch:** `feat/not-found-page`
**Status left:** `in_progress` (leader moves it to `reviewing`). No commit, no push, no deploy.

All 37 tasks of `tasks.md` are checked. Evidence labels: CONFIRMED (run/measured
here), INFERRED, UNVERIFIED.

## 1 · Files

New
- `app/error.vue` — thin Nuxt error page: `<NuxtLayout><NotFoundContent v-bind="content" /></NuxtLayout>`.
- `app/plugins/not-found-locale.ts` — **not in the plan**, see § 5 D1 and § 9 (universal since G6; replaced `not-found-locale.client.ts`).
- `app/features/shell/data/notFound.ts` (+ `.test.ts`) — keys, destinations, `NOT_FOUND_ROBOTS`, `NOT_FOUND_LOCALE_STATE_KEY`.
- `app/features/shell/logic/useShellItemResolver.ts` (+ `.test.ts`) — `resolveHref`/`resolveItem` lifted verbatim from `useShellNavigation`, as a pure `createShellItemResolver(deps)` plus the Nuxt-wired `useShellItemResolver()`.
- `app/features/shell/logic/useNotFoundContent.ts`, `useNotFoundDocument.ts`.
- `app/features/shell/logic/notFoundLocale.ts` (+ `.test.ts`) — § 5 D1 and § 9 (replaced `pinNotFoundLocale.ts`).
- `app/features/shell/ui/NotFoundContent.vue` (+ `.test.ts`, `.stories.ts`), `NotFoundRings.vue` (+ `.test.ts`).
- `tests/not-found-output.test.ts`, `tests/not-found-tokens.test.ts`.

Changed
- `nuxt.config.ts` — `NOT_FOUND_ROUTES`, `SPA_SHELL_ROUTES`, `nitro.prerender.routes`, `nitro.hooks['prerender:generate']`; `rootRedirect` comment lost its `200.html` clause.
- `app/features/shell/logic/useShellNavigation.ts` — uses the resolver; `navCta` is `undefined` while `useError()` is set.
- `app/features/shell/ui/SiteNav.vue` — `cta?:`; the CTA wrapper and its `<noscript>` override are `v-if="cta"`.
- `app/features/shell/ui/SiteNav.test.ts` (+2 tests), `SiteNav.stories.ts` (+`WithoutCallToAction`).
- `app/features/shell/index.ts` — exports `NotFoundContent`, `useNotFoundContent`, `NotFoundContentProps`, `useNotFoundDocument`, `applyNotFoundLocaleRule`.
- `app/assets/css/global.css` — 7 ring tokens in `:root`, 15 `--spacing-not-found-*` in `@theme inline`.
- `i18n/locales/{es,en}.json` — `pages.notFound.title`, `shell.notFound.*` (approved copy, verbatim).
- `biome.json` — § 5 D4.
- `docs/harness/findings.md` — R72. `specs/036-not-found-page/tasks.md` — ticked.

Untouched (verified by `git status`): `app/layouts/default.vue`, `app/pages/*`, `public/index.html`,
`app/shared/ui/SectionGlow.vue`/`SectionBackdrop.vue` and their tests, `tests/seo-output.test.ts`,
`tests/static-output.test.ts`, `package.json`, `pnpm-lock.yaml`, `docs/business/`.

## 2 · Checks

| Check | Result |
|---|---|
| `pnpm typecheck` | PASS |
| `pnpm check` (Biome, `--error-on-warnings`) | PASS (after § 5 D4) |
| `pnpm test` | PASS — 93 files / 1304 tests (baseline 86 / 1209). Feature 35's `seo-output` and `static-output` pass **unedited** |
| `pnpm generate` | PASS — log shows `/200.html (skipped)`, `/404.html (skipped)`, `/es/404`, `/en/404` written, no `ERROR`. The `H3Error/H3Event` rollup WARN is pre-existing (present in the baseline build) |
| `pnpm storybook:build` | PASS |
| `./init.sh` | **exit 1 — only** `feature_list.json check failed: More than 1 feature in_progress/reviewing: technical_seo_indexing, not_found_page`. Pre-existing (also failed in the T001 baseline): feature 35 is still `reviewing` after its reviewer approved. Every other section is OK. Not changed by me (not my feature) |
| No new dependency | CONFIRMED — `package.json`/`pnpm-lock.yaml` unchanged |
| Negative control | Reverting the `navCta` suppression made 4 output tests fail (one LED, no nav CTA × 2 locales); restored |

## 3 · Built output (`.output/public`, from the final `./init.sh` build)

| | `es/404/index.html` | `en/404/index.html` |
|---|---|---|
| `<html lang>` | `es-MX` (once) | `en-US` (once) |
| `<title>` | `Página no encontrada · muush` | `Page not found · muush` |
| robots meta | one, `noindex` | one, `noindex` |
| canonical / hreflang / description / og:url / og:locale(:alternate) / og:title / og:description in `<head>` | none | none |
| `<h1>` (only one) | `No encontramos esta página.` | `We couldn't find this page.` |
| LED controls | 1 — `<a href="/es" class="led …">Volver al inicio` | 1 — `<a href="/en" class="led …">Back to home` |
| Shortcuts (`<nav aria-label="Atajos"/"Shortcuts">`) | `/es#proposito`, `/es#servicios`, `/es/nosotros` | `/en#proposito`, `/en#servicios`, `/en/about` |
| Language toggle (`a[hreflang]`) | `/en` | `/es` |
| `site-nav__cta` in `<body>` (incl. `<noscript>`) | 0 | 0 |
| `_payload.json` | present | present |

Head still carries `og:type`, `og:site_name`, `twitter:card` and the Organization JSON-LD from the
layout's `useSiteSeo()` (research R3, kept by design).

- `sitemap.xml` `<loc>`: `https://muush.dev/en`, `/es`, `/en/about`, `/es/nosotros` — the same 4; the
  file differs from the baseline only in the generator's timestamp comment.
- `200.html`, `404.html`: **absent**.
- All `*/index.html`: `./index.html`, `./es/index.html`, `./en/index.html`, `./es/nosotros/index.html`,
  `./en/about/index.html`, `./es/404/index.html`, `./en/404/index.html`.
- `robots.txt`, root `index.html`: byte-identical to the baseline.

### Body diff of the 4 existing pages vs the T001 baseline (script-stripped `<body>`)

Byte-different only because `SiteNav.vue`'s scoped-style id changed (`data-v-1f8094ea` →
`data-v-208d9101`; Vue derives it from the file content, and the file was edited). With that id
normalised: **0 diff lines** on `/es`, `/en`, `/es/nosotros`, `/en/about`. The nav CTA markup on
those pages is unchanged (`invisible opacity-0 site-nav__cta …` on the homes, `visible opacity-100
site-nav__cta …` on About; output test asserts it).

`<head>` differences on those pages are bundling only: Nuxt's chunk graph changed now that
`error.vue` imports the shell barrel (19 → 11 files in `_nuxt/`), so the inlined-style order and
modulepreload list differ, and the shared entry CSS now also contains the not-found rules.
JS loaded per page went down slightly: `/es` 385 326 → 384 627 B raw (134 388 → 131 033 gzip);
`/es/nosotros` 370 769 → 370 079 B raw. The 404 document loads 319 081 B raw / 113 235 gzip.

## 4 · Browser check (quickstart § 3) — headless Chrome WAS available

Google Chrome headless (`--headless=new`) driven over CDP with the quickstart's `serve.mjs`/`probe.mjs`
(copied verbatim to the session scratchpad; the probe was extended only to print `innerWidth`).
Port 4310 was taken by a leftover research server serving the spec-time scratch build; its first
results were discarded and all runs below used ports 4322–4335 against this build.

**First run (before § 5 D1) FAILED in Stage 1** on `/es/nada`: the English document was switched to
Spanish on hydration, with `console.error: Hydration completed but contains mismatches.` and the
language button left at `/es`. Stage 2 and every other Stage 1 URL were clean. After D1, both
stages pass. Final outputs (port stripped):

<details><summary>Stage 1 (English document for every missing path)</summary>

```
### STAGE1 /en/no-existe @1440
{"vw":1440,"href":"/en/no-existe","lang":"en-US","title":"Page not found · muush","h1":"We couldn't find this page.","toggle":"/es","navCta":false,"leds":1,"links":0,"robots":"noindex"}
net 404 /en/no-existe
### STAGE1 /en/no-existe @390
{"vw":390,"href":"/en/no-existe","lang":"en-US","title":"Page not found · muush","h1":"We couldn't find this page.","toggle":"/es","navCta":false,"leds":1,"links":0,"robots":"noindex"}
net 404 /en/no-existe
### STAGE1 /es/nada @1440
{"vw":1440,"href":"/es/nada","lang":"en-US","title":"Page not found · muush","h1":"We couldn't find this page.","toggle":"/es","navCta":false,"leds":1,"links":0,"robots":"noindex"}
net 404 /es/nada
### STAGE1 /es/nada @390
{"vw":390,"href":"/es/nada","lang":"en-US","title":"Page not found · muush","h1":"We couldn't find this page.","toggle":"/es","navCta":false,"leds":1,"links":0,"robots":"noindex"}
net 404 /es/nada
### STAGE1 /xyz @1440
{"vw":1440,"href":"/xyz","lang":"en-US","title":"Page not found · muush","h1":"We couldn't find this page.","toggle":"/es","navCta":false,"leds":1,"links":0,"robots":"noindex"}
net 404 /xyz
### STAGE1 /xyz @390
{"vw":390,"href":"/xyz","lang":"en-US","title":"Page not found · muush","h1":"We couldn't find this page.","toggle":"/es","navCta":false,"leds":1,"links":0,"robots":"noindex"}
net 404 /xyz
### STAGE1 /fr/abc @1440
{"vw":1440,"href":"/fr/abc","lang":"en-US","title":"Page not found · muush","h1":"We couldn't find this page.","toggle":"/es","navCta":false,"leds":1,"links":0,"robots":"noindex"}
net 404 /fr/abc
### STAGE1 /fr/abc @390
{"vw":390,"href":"/fr/abc","lang":"en-US","title":"Page not found · muush","h1":"We couldn't find this page.","toggle":"/es","navCta":false,"leds":1,"links":0,"robots":"noindex"}
net 404 /fr/abc
### STAGE1 /en/about/zzz @1440
{"vw":1440,"href":"/en/about/zzz","lang":"en-US","title":"Page not found · muush","h1":"We couldn't find this page.","toggle":"/es","navCta":false,"leds":1,"links":0,"robots":"noindex"}
net 404 /en/about/zzz
### STAGE1 /en/about/zzz @390
{"vw":390,"href":"/en/about/zzz","lang":"en-US","title":"Page not found · muush","h1":"We couldn't find this page.","toggle":"/es","navCta":false,"leds":1,"links":0,"robots":"noindex"}
net 404 /en/about/zzz
### STAGE1 /en/zz?x=1#frag @1440
{"vw":1440,"href":"/en/zz?x=1#frag","lang":"en-US","title":"Page not found · muush","h1":"We couldn't find this page.","toggle":"/es","navCta":false,"leds":1,"links":0,"robots":"noindex"}
net 404 /en/zz?x=1
### STAGE1 /en/zz?x=1#frag @390
{"vw":390,"href":"/en/zz?x=1#frag","lang":"en-US","title":"Page not found · muush","h1":"We couldn't find this page.","toggle":"/es","navCta":false,"leds":1,"links":0,"robots":"noindex"}
net 404 /en/zz?x=1
### STAGE1 click toggle /en/no-existe
{"vw":1440,"href":"/es","lang":"es-MX","title":"Hablamos negocio y código · muush","h1":"Hablamos negocio y código.","toggle":"/en","navCta":true,"leds":3,"links":6}
net 404 /en/no-existe
### STAGE1 click led /es/nada
{"vw":1440,"href":"/en","lang":"en-US","title":"We speak business and code · muush","h1":"We speak business and code.","toggle":"/es","navCta":true,"leds":3,"links":6,"robots":"index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"}
net 404 /es/nada
### STAGE1 regression /en/about
{"vw":1440,"href":"/en/about","lang":"en-US","title":"About us · muush","h1":"We build the team around the project.","toggle":"/es/nosotros","navCta":true,"leds":2,"links":6,"robots":"index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"}
```
</details>

<details><summary>Stage 2 (STAGE=2, per-prefix)</summary>

```
### STAGE2 /en/no-existe @1440
{"vw":1440,"href":"/en/no-existe","lang":"en-US","title":"Page not found · muush","h1":"We couldn't find this page.","toggle":"/es","navCta":false,"leds":1,"links":0,"robots":"noindex"}
net 404 /en/no-existe
### STAGE2 /en/no-existe @390
{"vw":390,"href":"/en/no-existe","lang":"en-US","title":"Page not found · muush","h1":"We couldn't find this page.","toggle":"/es","navCta":false,"leds":1,"links":0,"robots":"noindex"}
net 404 /en/no-existe
### STAGE2 /es/nada @1440
{"vw":1440,"href":"/es/nada","lang":"es-MX","title":"Página no encontrada · muush","h1":"No encontramos esta página.","toggle":"/en","navCta":false,"leds":1,"links":0,"robots":"noindex"}
net 404 /es/nada
### STAGE2 /es/nada @390
{"vw":390,"href":"/es/nada","lang":"es-MX","title":"Página no encontrada · muush","h1":"No encontramos esta página.","toggle":"/en","navCta":false,"leds":1,"links":0,"robots":"noindex"}
net 404 /es/nada
### STAGE2 /xyz @1440
{"vw":1440,"href":"/xyz","lang":"es-MX","title":"Página no encontrada · muush","h1":"No encontramos esta página.","toggle":"/en","navCta":false,"leds":1,"links":0,"robots":"noindex"}
net 404 /xyz
### STAGE2 /xyz @390
{"vw":390,"href":"/xyz","lang":"es-MX","title":"Página no encontrada · muush","h1":"No encontramos esta página.","toggle":"/en","navCta":false,"leds":1,"links":0,"robots":"noindex"}
net 404 /xyz
### STAGE2 /fr/abc @1440
{"vw":1440,"href":"/fr/abc","lang":"es-MX","title":"Página no encontrada · muush","h1":"No encontramos esta página.","toggle":"/en","navCta":false,"leds":1,"links":0,"robots":"noindex"}
net 404 /fr/abc
### STAGE2 /fr/abc @390
{"vw":390,"href":"/fr/abc","lang":"es-MX","title":"Página no encontrada · muush","h1":"No encontramos esta página.","toggle":"/en","navCta":false,"leds":1,"links":0,"robots":"noindex"}
net 404 /fr/abc
### STAGE2 /en/about/zzz @1440
{"vw":1440,"href":"/en/about/zzz","lang":"en-US","title":"Page not found · muush","h1":"We couldn't find this page.","toggle":"/es","navCta":false,"leds":1,"links":0,"robots":"noindex"}
net 404 /en/about/zzz
### STAGE2 /en/about/zzz @390
{"vw":390,"href":"/en/about/zzz","lang":"en-US","title":"Page not found · muush","h1":"We couldn't find this page.","toggle":"/es","navCta":false,"leds":1,"links":0,"robots":"noindex"}
net 404 /en/about/zzz
### STAGE2 /en/zz?x=1#frag @1440
{"vw":1440,"href":"/en/zz?x=1#frag","lang":"en-US","title":"Page not found · muush","h1":"We couldn't find this page.","toggle":"/es","navCta":false,"leds":1,"links":0,"robots":"noindex"}
net 404 /en/zz?x=1
### STAGE2 /en/zz?x=1#frag @390
{"vw":390,"href":"/en/zz?x=1#frag","lang":"en-US","title":"Page not found · muush","h1":"We couldn't find this page.","toggle":"/es","navCta":false,"leds":1,"links":0,"robots":"noindex"}
net 404 /en/zz?x=1
### STAGE2 click toggle /en/no-existe
{"vw":1440,"href":"/es","lang":"es-MX","title":"Hablamos negocio y código · muush","h1":"Hablamos negocio y código.","toggle":"/en","navCta":true,"leds":3,"links":6}
net 404 /en/no-existe
### STAGE2 click led /es/nada
{"vw":1440,"href":"/es","lang":"es-MX","title":"Hablamos negocio y código · muush","h1":"Hablamos negocio y código.","toggle":"/en","navCta":true,"leds":3,"links":6,"robots":"index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"}
net 404 /es/nada
### STAGE2 regression /en/about
{"vw":1440,"href":"/en/about","lang":"en-US","title":"About us · muush","h1":"We build the team around the project.","toggle":"/es/nosotros","navCta":true,"leds":2,"links":6,"robots":"index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"}
```
</details>

Every missing URL: address bar kept, language as expected for the stage, `navCta:false`, `leds:1`,
`links:0`, `robots:"noindex"`, no console line, no exception, no non-200 request besides the document's
own 404. (`leds:3`/`links:6` lines are the destination homes after a click; the home without a robots
meta after client navigation is research F12, unchanged.) Extra Stage 1 clicks from `/es/nada`:
language button → `/es` (Spanish home), About shortcut → `/en/about`, Purpose shortcut → `/en#proposito`.

## 5 · Deviations and decisions

- **D1 · Locale pinned during hydration (new plugin, not in the plan).** The quickstart check failed
  as described in § 4: `@nuxtjs/i18n` takes the initial client locale from the URL prefix, so any
  `/es/*` URL served the English document (Stage 1, G5) flipped to Spanish with a hydration mismatch,
  violating FR-002 and the spec's own Stage 1 edge case. Fix: `useNotFoundDocument` records the
  rendered locale with `useState('shell:not-found-locale')`; `app/plugins/not-found-locale.client.ts` (since § 9: `not-found-locale.ts`)
  (`enforce: 'pre'`, thin) registers the module's **public** `i18n:beforeLocaleSwitch` hook, which
  redirects the switch to the recorded locale **only while hydrating** (`resolveHydrationLocale`,
  unit-tested). No-op on every other page (no state recorded). It prevents a switch rather than
  performing one, so D1 of the spec (no client language switch) holds. Needs reviewer/Roberto
  acceptance; Stage 2 alone would not need it, Stage 1 does.
- **D2 · `og:locale` / `og:locale:alternate` removed on the 404s.** Research F19 said the layout's
  `useLocaleHead()` emits no `og:locale` on an unmatched route; the first build showed it does (it
  depends on the locale, not the route). FR-012 forbids it, the layout may not be edited, so
  `useNotFoundDocument` overrides both with `content: null` at `tagPriority: 'high'` (unhead dedupes
  by property; a `null` content is dropped at render). Scoped to `error.vue`.
- **D3 · `--spacing-not-found-glow-y` corrected from measurement** (§ 6), as the spec instructs.
- **D4 · `biome.json`:** `!specs/**/reference` added to `files.includes` — `pnpm check` failed (also in
  the baseline) on 5 lint warnings inside Roberto's verbatim `reference/404.html`, which must keep its
  recorded sha256; and `app/error.vue` added to the `useVueMultiWordComponentNames` override (Nuxt
  fixes the file name; same reasoning as `app/pages`/`app/layouts`).
- **D5 · Resolver test** stubs the Nuxt composables by passing them to the pure
  `createShellItemResolver(deps)`; there was no existing shell-logic stubbing pattern to copy.
- **D6 · Nav pill is 68 px tall on the 404 at ≥ 1024 px, 72 px elsewhere** (measured): with the CTA
  removed the tallest row item is the language circle. Not corrected (would touch every page's nav);
  reported for a human decision.
- **D7 · Not-found code ships in the shared entry chunk** (the error component is part of the app
  root); net per-page JS went down (§ 3), so accepted and reported.

## 6 · Measurements (quickstart § 4) — headless Chrome, Stage 2 server

| | 1440 × 900 | 1024 × 800 | 390 × 844 |
|---|---|---|---|
| Rings (outer/mid/inner, `getBoundingClientRect().width`) | 700 / 500.03 / 300.03 | 589.06 / 420.78 / 252.47 | 420 / 300.03 / 180.03 |
| Ring strokes (computed) | bone-100 @ 0.08 / bone-100 @ 0.12 / red-400 @ 0.24 | same | same |
| `scrollWidth` = viewport (no horizontal scroll) | 1440 = 1440 | 1024 = 1024 | 390 = 390 |
| `scrollHeight` vs layout root height | 1138 vs 1137.81 (es) · 1088 vs 1088.02 (en) | 1043 vs 1042.97 | 1239 vs 1239.13 |
| Backdrop / dots `z-index` | −3 / −2 | −3 / −2 | −3 / −2 |
| Glow diameter | 1400 | — | 700 |
| Nav in-flow height (section top) | **68** (sticky pill drawn at y 24–92) | 68 | **78** |
| Pill top (page y) | 164 | 154.5 (es) / 166.9 (en) | 178.5 |
| `<h1>` font size | 98 px (2 lines) | — | 46 px |
| LED button height | 55.19 | — | 50 |

**`--spacing-not-found-glow-y` (spec/research R6b instruction).** With research's token
(`clamp(9rem, 10.7143rem - 1.9048vw, 10.25rem)` = 144 @1440 / 164 @390, derived from the reference's
96/76 px header) the bloom centre measured **(1279.98, 212)** at 1440 — 28 px above the reference's
page-y 240 — and **(230, 242)** at 390. Cause: the site nav's in-flow height is 68/78, not 96/76.
Corrected to `clamp(10.125rem, 9.8929rem + 0.9524vw, 10.75rem)` = 240 − 68 = **172 @1440**,
240 − 78 = **162 @390**. Re-measured centre: **(1279.98, 240)** at 1440, **(230, 240)** at 390,
(863.99, 236.03) at 1024 (interpolated width; reference: (864, 240)). x needed no change.
The token test asserts the corrected value.

**No-JS** (`Emulation.setScriptExecutionDisabled`): page complete, same geometry, 1 LED, no nav CTA,
3 shortcuts. **Reduced motion** (`prefers-reduced-motion: reduce` emulated, `matchMedia` true): the
Pill ping's `::before` computes `content: none` (off). The LED ring computed no animation at rest in
all modes; hover was not emulated (UNVERIFIED by this check, unchanged `BotonPrimario` behaviour).
**Pill top vs reference:** the reference places content by flex-centring in a min-height box under a
96 px header; the site measures 164 px at 1440 / 178.5 px at 390 — reported, not adjusted.

## 7 · Not done here / for the leader

- `contracts/edge-not-found.md` is Roberto's to apply in muush-foundation; nothing deployed.
- `./init.sh` will stay red until feature 35's status leaves `reviewing` (leader/implementer of 35).
- D1, D2, D6 need reviewer and/or Roberto acceptance.

## 8 · Follow-up — D6 resolved (Roberto, 2026-10-15: nav 72 px on the 404 too)

- **Token:** `--spacing-nav-cta-h` (`@theme inline`) =
  `calc(var(--spacing-btn-nav-y) * 2 + var(--text-button-sm) * var(--text-button-sm--line-height))`.
  That is 15 + 15 + 18 = 48 px, derived from the same tokens that size the nav CTA (`BotonPrimario variant="nav"`:
  `py-btn-nav-y` and `text-button-sm`). No new literal. Tailwind emits the three referenced variables in
  the entry CSS (CONFIRMED in `.output/public/_nuxt/entry.*.css`).
- **`SiteNav.vue`:** `.nav-row__end` gets `lg:min-h-nav-cta-h` **only when `cta` is absent**
  (`:class="{ 'lg:min-h-nav-cta-h': !cta }"`). Pages that have a CTA render exactly the same class string as before.
- **Measured (headless Chrome):** nav pill **72 px** at 1440 and 1024 on `/es/nada` and `/en/nada`, the
  same as `/es` and `/en/about`. Mobile stays 78 px on every page.
- **Knock-on effect, glow position:** the nav's in-flow height is now 72 px instead of 68 px, so the
  glow-y token was re-derived: `--spacing-not-found-glow-y: clamp(10.125rem, 9.9857rem + 0.5714vw, 10.5rem)`,
  which is 240 − 72 = 168 px at 1440 and 240 − 78 = 162 px at 390. This replaces § 6's 172/162 value.
  Re-measured glow centre: (1279.98, 239.98) at 1440, (230, 240) at 390, (863.99, 237.61) at 1024.
  `scrollWidth` still equals the viewport width at every width.
- **Tests added:**
  - `tests/not-found-output.test.ts`: both 404s carry `lg:min-h-nav-cta-h`; the four existing pages keep
    `nav-row__end flex items-center gap-nav-end-gap` exactly.
  - `SiteNav.test.ts`: the class appears only without `cta`, and the CTA still uses `py-btn-nav-y` and
    `text-button-sm`, which guards the derivation.
  - `tests/not-found-tokens.test.ts`: pins the `--spacing-nav-cta-h` expression and the new glow-y value.
- **Body diff of the 4 existing pages:** 0 lines once SiteNav's scoped id is normalised (now `data-v-f525ec94`).
- **`./init.sh` (re-run):** exit 1. typecheck, check, test (93 files / 1312 tests), generate and
  storybook:build all OK. The only failure is still `feature_list.json check failed: More than 1 feature
  in_progress/reviewing: technical_seo_indexing, not_found_page`, because feature 35 is still `reviewing`
  in `feature_list.json` at the time of this run. Once 35 is `done` that check should pass; it was not re-run after that.

## 9 · Follow-up — G6: runtime not-found language (Roberto's decision, 2026-10-15)

**Decision (Roberto):** `pnpm dev` rendered `/fr/es` in Spanish, because i18n falls back to
`defaultLocale` (`es`). For a not-found page that Nuxt renders at runtime (dev, and the client), the
language is chosen by path prefix: `/es…` → es, `/en…` → en, and any other path → **en**. The site's
`defaultLocale` stays `es` for every real page and for `/`. This is recorded in `spec.md` § Gate as G6.

**Implementation.** `logic/pinNotFoundLocale.ts` (+ its test) is replaced by
`app/features/shell/logic/notFoundLocale.ts` (+ `.test.ts`), and `app/plugins/not-found-locale.client.ts`
is replaced by the universal `app/plugins/not-found-locale.ts` (`enforce: 'pre'`, server and client).
The barrel now exports `applyNotFoundLocaleRule`. The same public `i18n:beforeLocaleSwitch` hook applies
two rules, in this order:
1. While hydrating, the locale the server recorded wins. This is D1 unchanged: a served document keeps
   its own language, with no mismatch.
2. Otherwise, for the request's initial locale, if the path matches no route and is not `/`, the locale
   comes from `notFoundLocaleForPath(path)`: an `es` prefix gives es, anything else gives en. Later
   switches (links, the language button) are left alone.

**Finding.** On the server, the path has to come from `ssrContext.url`, not `useRequestURL()`. In dev,
Nuxt re-issues an error render as `/__nuxt_error?url=…`. The first attempt used `useRequestURL()` and
rendered `/es/xyz` in English; reading `ssrContext.url` fixed it.

**Verification.**
- **Unit tests** (`notFoundLocale.test.ts`): 9 paths covering prefix → locale, plus 6 precedence cases
  (hydration pin, runtime rule, matched path, later switch).
- **Prerendered documents:** the script-stripped bodies of `es/404` and `en/404` are byte-identical to
  the D6 build. The existing output tests pass. Production Stage 1 and Stage 2 probes re-run: 12/12
  pass each; Stage 1 `/es/nada` and `/xyz` stay en-US; Stage 2 `/es/nada` and `/xyz` stay es-MX
  (the served document wins).
- **`pnpm dev`, server render:** I ran my own dev server on port 3036. Roberto's dev server on :3000
  exited during this work, and I did not restart it.

  | URL | status | lang | title | toggle |
  |---|---|---|---|---|
  | `/fr/es` | 404 | en-US | Page not found · muush | `/es` |
  | `/xyz` | 404 | en-US | Page not found · muush | `/es` |
  | `/es/xyz` | 404 | es-MX | Página no encontrada · muush | `/en` |
  | `/en/xyz` | 404 | en-US | Page not found · muush | `/es` |

  Real pages are unchanged: `/es` es-MX, `/en` en-US, `/es/nosotros` es-MX, `/en/about` en-US.
- **`pnpm dev`, headless Chrome** (1440 and 390, after hydration):
  - `/fr/es`, `/xyz` and `/en/xyz` are all en-US. LED button → `/en`; shortcuts → `/en#proposito`,
    `/en#servicios`, `/en/about`; nav links → `/en#servicios`, `/en/about`; language toggle → `/es`.
    This is the same as `/en/404`.
  - `/es/xyz` is es-MX, with every link pointing into `/es`.
  - Address bar kept, 1 LED, no nav CTA, `noindex`.
  - 0 lines matching hydration / mismatch / exception / console.error. The only console output is
    dev-mode vue-router "No match found" warnings for the missing path, plus Nuxt DevTools / Suspense info.
  - Clicking the toggle on `/fr/es` lands on the Spanish home.
- **No automated dev-render test.** Booting a dev server from Vitest is not set up in this repository.
  The rule is covered by the unit tests, and dev behaviour by the manual check above.
- **Not covered:** client-side navigation to a missing route after load. No link on the site produces
  one. i18n keeps the current locale in that case.
- **`./init.sh`:** exit 1. typecheck, check, test (93 files / 1324 tests), generate and storybook:build
  are all OK. The only failure is still the `feature_list.json` check, because feature 35 is still
  `reviewing` at the time of this run.
- ~~⚠️ Open: the edge contract's Stage 2 fallback disagreed with G6.~~ Resolved by the leader after
  review: `contracts/edge-not-found.md` and `spec.md` now send unprefixed paths to the English document
  in Stage 2 too (see § 10).

## 10 · Review round 1 (reviewer CHANGES_REQUESTED, `review.md`)

The leader fixed the blocking item himself (G6 alignment in `spec.md`, the edge contract and research
F10). I did not touch those files. This round covers the reviewer's findings 2–5.

**Finding 2 · automated guard for the `payload.path` deletion.** I added one test to
`tests/not-found-output.test.ts`, run for both locales: "should serialise no payload path when
generated, so the client keeps the visitor URL". It parses the root object of each 404's
`__NUXT_DATA__` and checks two things:
- that object has `error` and has no `path`;
- the same-locale home's root object does have `path`. This control proves the parser reads the right
  object.

Negative control: I commented out `delete useNuxtApp().payload.path` in `useNotFoundDocument.ts`. Both
locale rows failed (2 failed / 46 passed). I then restored the line.

**Finding 3 · `plan.md` Complexity Tracking.** I added two rows, each with why it is needed and which
simpler alternative was rejected:
- the universal `app/plugins/not-found-locale.ts` plus the `i18n:beforeLocaleSwitch` hook (D1/G6);
- the `og:locale` / `og:locale:alternate` `content: null` + `tagPriority: 'high'` override (D2).

**Finding 4 · test names.** 16 names I added lacked the "when" half of `should … when …`. The
reviewer listed 14; I also found the D6 `%s` pair. All 16 are renamed:
- `tests/not-found-output.test.ts` (11):
  - one LED control
  - no nav call to action / noscript
  - separators hidden
  - language button → other home
  - none of the other locale's copy
  - no client-side language switch attributes
  - no anchor without href
  - one title + one noindex
  - no canonical/hreflang/description/OG
  - nav end group held at CTA height (`%s`)
  - nav end group unchanged (`%s`)

  Each now ends in "when generated" or "when %s is generated".
- `app/features/shell/ui/NotFoundContent.test.ts` (3): three shortcuts in a named nav, backdrop with
  the red glow before the rings, section free of stacking context or opaque background. Each now ends
  in "when rendered".
- `app/features/shell/logic/notFoundLocale.test.ts` (2):
  - "…over the path rule while hydrating" → "…when hydrating";
  - "…for a later switch" → "…when the switch is not the initial one".

The pre-existing `SiteNav.test.ts` names from earlier features are not mine and were left as they are.

**Finding 5 · this report.** § 1 now lists the files that exist: `not-found-locale.ts`,
`notFoundLocale.ts`, and the `applyNotFoundLocaleRule` export. The § 9 "⚠️ Open" note is marked
resolved. I did not touch the `spec.md` header, which the leader owns.

**`./init.sh`: exit 0.**
- The `feature_list.json` check passes; only one feature is active.
- typecheck, check, generate and storybook:build OK.
- Tests: 93 files / 1326 tests pass.
