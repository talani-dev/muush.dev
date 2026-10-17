# Feature 37 · `english_default_locale`: Phase B implementation

- **Date:** 2026-10-16
- **Agent:** implementer, phase B
- **Branch:** `feat/english-default-locale`. Status stays `in_progress`. Nothing was committed and the status was not changed.
- **Contract:** `feature_list.json` feature 37 (`sdd: false`), the phase A audit (`docs/harness/progress/audit_english_default_locale.md`), and Roberto's decisions D1–D9 (approved 2026-10-16, see the `current.md` log)
- **Result:** `./init.sh` → **exit 0**: check, typecheck, test (95 files, **1347 passed**), generate and storybook:build all pass.

Labels: **CONFIRMED** means observed (source or build). **INFERRED** means derived from evidence.

---

## 1 · Changes (all in the D1 scope)

| File | Change | Audit item |
|---|---|---|
| `nuxt.config.ts` | `defaultLocale: 'es'` → `'en'`, with a comment explaining that it drives `x-default` and the derived `site.defaultLocale` (D3: not declared). `rootRedirect: '/es'` → `'/en'`. The R25 comment no longer names `/es` as the current value; the finding itself is kept. | 1, 2, 3 |
| `public/index.html` | `lang="en-US"` (D2), refresh `url=/en`, canonical `https://muush.dev/en`, x-default `https://muush.dev/en`, fallback `<a href="/en">`. The header comment now describes the English default and the edge contract (feature 33) instead of "never detected from IP". The feature 27 history note is kept, with `/en` noted. Styling, `noindex`, title and the `es-MX`/`en-US` alternates are untouched. | 8–13 |
| `app/features/shell/data/types.ts` | Comment only: "Spanish is the default" → English (feature 37), and the array order carries no meaning. | 16 |
| `app/features/shell/logic/notFoundLocale.ts` | Comment only. The rule is kept explicit even though i18n's fallback is now also `en`. **No code change.** | 17 |
| `tests/seo-output.test.ts` | Per page, x-default = the English counterpart (`/en` for both homes, `/en/about` for the About pair, D4). Root x-default → `/en`. **New:** sitemap x-default per entry = the English counterpart. **New (D3):** 4 tests that evaluate the inline `__NUXT_SITE_CONFIG__` in an empty `node:vm` context and assert `defaultLocale === 'en-US'` and `currentLocale` = the page's tag. The translation-links comment is reworded for D5. | 23, 24, D3, D4 |
| `tests/static-output.test.ts` | The root test was renamed to "…English home". It asserts `lang="en-US"`, refresh/canonical/x-default/link → `/en`, and no `/es` pointer. The SC-001 header comment keeps the original quote and adds a note. | 25, 26 |
| `.specify/memory/constitution.md` | Article VI: "Spanish (default) and English … (`/es/`, `/en/`)" → "English (default) and Spanish … (`/en/`, `/es/`)". **2.0.0 → 2.0.1 (PATCH**, wording only, no principle change). Last Amended 2026-10-16. A new Sync Impact Report at the top records the motivation, Roberto's ratification ("si", 2026-10-16, D6) and the template check. The 2.0.0 report is kept below it. | D6 |
| `README.md` | The i18n section was rewritten. It was Astro-era (`astro.config.mjs`, `src/i18n/ui.ts`, `useTranslations`, `getLangFromUrl`), none of which exist now. It now covers `@nuxtjs/i18n`, the `en` default, `prefix`, translated segments, how `/` is resolved (rootRedirect in dev, `public/index.html` in static, the edge in production), x-default, the locale files and the parity test. | D8 |

**Not touched**, as agreed: routes, copy, translations, design, stories, the 404 behaviour, the `muush_locale` cookie, `site` config (D3), `docs/business/` (D7), and `specs/` / `history.md` (D9).

A note on the README: my first draft said "only `logic/` composables call `useI18n()`". A grep showed that is false: `LanguageToggle.vue`, `SiteNav.vue`, `MobileMenu.vue` and `layouts/default.vue` call it too. I corrected the sentence to what is true ("normally in `logic/`; no component hardcodes a visible string").

## 2 · Acceptance verification

| # | Acceptance | Evidence | |
|---|---|---|---|
| 1 | Inventory before changes, approved | Phase A audit, plus Roberto's "si" on 2026-10-16 | CONFIRMED |
| 2 | `defaultLocale 'en'`, `rootRedirect '/en'`; site defaultLocale en-US | Config, plus a built runtime config showing `defaultLocale:"en",rootRedirect:"/en"`. Site config `defaultLocale` evaluates to `en-US` on all 4 pages (new test). | CONFIRMED |
| 3 | x-default on /en and /es → `https://muush.dev/en` | Built `<link id="i18n-xd">` on both homes, asserted in seo-output. About pair → `/en/about` (D4). | CONFIRMED |
| 4 | Canonical and lang unchanged | The `<html>` tag and canonical are byte-identical to the baseline on all 4 pages (§ 3). | CONFIRMED |
| 5 | Sitemap has exactly the 4 URLs with alternates | Same 4 `<loc>` entries, each with es-MX/en-US/x-default. Only the x-default hrefs changed (now the English counterpart, asserted). | CONFIRMED |
| 6 | JSON-LD present and valid | One `ld+json` block per page; all of them parse (4 pages + 2 404s). | CONFIRMED |
| 7 | No route, content, translation or design changes | Same output file set, and the script-free `<body>` is identical on all 6 documents (§ 3). | CONFIRMED |
| 8 | Separate branch, no deploy or merge | `feat/english-default-locale`, uncommitted | CONFIRMED |
| 9 | check, typecheck, test, generate, storybook:build | `./init.sh` exit 0 | CONFIRMED |

## 3 · Comparison with the pre-change baseline

I made the baseline from an rsync copy of HEAD in the session scratchpad. It excludes `node_modules`, `.output`, `.nuxt`, `.git`, `docs`, `specs` and `.husky`, and got its own `pnpm install --offline --frozen-lockfile` and `pnpm generate` (exit 0). Nothing was written into this repo's `node_modules`.

I normalised both outputs first: build UUIDs, `_nuxt`/`_i18n` hashes and timestamps.

- **File set:** identical, apart from the build-meta UUID file name.
- **`<html>` tag and `<body>` with `<script>` stripped:** **identical** on `/en`, `/es`, `/en/about`, `/es/nosotros`, `/en/404` and `/es/404`.
- **`<head>`:** only `<link id="i18n-xd" … hreflang="x-default">` changed on the 4 pages (homes `/es` → `/en`, About `/es/nosotros` → `/en/about`). The 404 heads are identical.
- **Scripts that changed:**
  - inline `__NUXT_SITE_CONFIG__`: `defaultLocale` `es-MX` → `en-US`
  - `window.__NUXT__.config`: `i18n.defaultLocale`/`rootRedirect`
  - `__NUXT_DATA__`: the i18n default-locale state scalars
  - **JSON-LD (D5):** the only change is that `workTranslation` and `translationOfWork` swapped on the `WebSite` node. `/en` and `/en/about` now carry `workTranslation → /es#website`; `/es` and `/es/nosotros` carry `translationOfWork → /en#website`. `inLanguage` and every other value are unchanged. The 404 JSON-LD is identical.
- **`sitemap.xml`:** only the 4 x-default hrefs and the generation timestamp changed.
- **`robots.txt`:** byte-identical.
- **`index.html` (root):** only the five `/en` and `lang` values plus the comment changed. It is a copy of `public/index.html`.

These are exactly the expected differences: head/hreflang/x-default, `public/index.html`, and the config/state scripts that carry the default.

## 4 · D7: lines in `docs/business/` that Roberto (a human) must edit

I have not edited any of these.

| file:line | Current text | Why it is stale |
|---|---|---|
| `docs/business/landing/ui-map.md:22` | "Raíz · `/` redirige a `/es/`" | The default is now `/en/` (feature 37) |
| `docs/business/landing/ui-map.md:33–36` | "**Español de México es el default — no se detecta idioma por IP ni por `Accept-Language`** … se recuerda en `localStorage`" | The default is English (feature 37). `/` is decided at the edge by cookie, then country (feature 33). The preference lives in the `muush_locale` cookie, not `localStorage` (feature 33). |
| `docs/business/landing/decisions-open.md:148` | "Raíz · `/` → redirect a `/es/` (ya existe en `src/pages/index.astro`)" | The redirect goes to `/en/`. The Astro reference is also stale; the root object is `public/index.html`. |
| `docs/business/messaging.md:40–42` (rule 4) | "…por eso tampoco se detecta idioma por IP ni `Accept-Language`" | Contradicted by feature 33 (already done), not by 37 |
| `docs/business/rules.md:503, 515–516` (§ R25) | The measurement was made with `rootRedirect: '/es'` | Historical, and the finding still holds. **Probably no edit is needed.** |

## 5 · Notes for the reviewer

- The new site-config test evaluates our own build artefact with `node:vm` `runInNewContext` and an empty context. I chose this because the payload is a minified IIFE that hoists repeated literals into parameters. On `/en`, `defaultLocale` and `currentLocale` are both `en-US`, so the value appears as `defaultLocale:b`. My first regex version failed there for exactly that reason (CONFIRMED). The comment in the test says this.
- `notFoundLocale.ts`'s rule 2 is still explicit code. With `defaultLocale: 'en'` it now agrees with i18n's own fallback (INFERRED), and keeping it means the 404 language does not depend on that setting.
- `nuxt dev` 302 `/` → `/en` is INFERRED from the i18n source (audit § 4). I did not run a dev server.
- The muush-foundation edge (the live 301 vs the feature 33 302) is still UNVERIFIED from this repo.
- After this change, `feature_list.json`'s feature 37 `description` still calls feature 33 "pending". It is stale text, and the leader owns that field.
