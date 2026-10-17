# Feature 37 · `english_default_locale`: Phase A audit (read-only)

- **Date:** 2026-10-16
- **Agent:** implementer, phase A
- **Branch:** `feat/english-default-locale` (status `in_progress`, not changed)
- **Contract:** `feature_list.json` feature 37 `description` + `acceptance` (`sdd: false`, no spec package)
- **Scope of this phase:** acceptance item 1, "before changing anything, give Roberto the list of everything that assumes `es` as the default." **Nothing under `app/`, `tests/`, `i18n/`, `public/`, `nuxt.config.ts`, package files or docs was modified.** The only repo writes are this file and one log line in `current.md`.

Labels: **CONFIRMED** means directly observed (source read, or measured in a scratch build). **INFERRED** means derived from the evidence. **UNVERIFIED** means it can't be checked from this repo.

---

## 0 · How the behaviour was measured

The installed versions are `@nuxtjs/i18n` 10.6.0, `@nuxtjs/sitemap` 8.6.2, `@nuxtjs/robots` 6.2.4, `nuxt-schema-org` 6.4.3 and `nuxt-site-config` 4.2.3 (CONFIRMED from `node_modules/*/package.json`).

**Scratch build, outside the repo.** I copied the repo with rsync into the session scratchpad, leaving out `node_modules`, `.output`, `.nuxt`, `.git`, `docs`, `specs` and `.husky`. In that copy I ran `pnpm install --offline --frozen-lockfile`, which gives it its own real `node_modules` from the pnpm store and no symlink. That avoids the findings R73 trap: no write reached this repo's `node_modules/.cache`. `git status` afterwards shows only the two files that were already modified at session start.

I ran three builds and tests in the scratch copy:

| Run | Change in the scratch copy | `pnpm generate` | `pnpm test` |
|---|---|---|---|
| **base** | none (HEAD) | exit 0 | (not run, HEAD is green per `current.md`) |
| **en-config** | `defaultLocale: 'en'`, `rootRedirect: '/en'` | exit 0 | **4 failed** / 1338 passed |
| **en-config + root** | the above, plus `public/index.html` switched to `/en` (lang, refresh, canonical, x-default, link) | exit 0 | **6 failed** / 1336 passed |

I then compared the generated output of **base** and **en-config** file by file (§ 5).

---

## 1 · Configuration (`nuxt.config.ts`)

| # | file:line | What it assumes today | Proposed change | Scope |
|---|---|---|---|---|
| 1 | `nuxt.config.ts:258` | `defaultLocale: 'es'` | `'en'` | **In scope** (acceptance 2) |
| 2 | `nuxt.config.ts:274` | `rootRedirect: '/es'` | `'/en'` | **In scope** (acceptance 2) |
| 3 | `nuxt.config.ts:263–273` | The comment cites the R25 experiment "with `rootRedirect: '/es'`" | Reword so it no longer reads as the current value. Keep the finding: no file is emitted. | In scope (comment only) |
| 4 | `nuxt.config.ts:232–235` | `locales` order `es`, `en` | **No change.** The order has no effect on any output: the sitemap is ordered `/en, /es, /en/about, /es/nosotros` in both builds (CONFIRMED), and x-default follows `defaultLocale`, not the order (CONFIRMED, § 4). Reordering would be churn. | No change |
| 5 | `nuxt.config.ts:259`, `:261` | `strategy: 'prefix'`, `detectBrowserLanguage: false` | **No change.** Detection lives at the edge (feature 33), and both locales stay prefixed (acceptance 7: no route changes). | No change |
| 6 | `nuxt.config.ts:113–117` (`site`) | No `defaultLocale` declared | **Recommend NOT adding one.** `nuxt-site-config` already derives it from the i18n default locale's `language` (`nuxt-site-config/dist/module.mjs:163–168`, `runtime/app/plugins/i18n.js:8–10`). In the en-config build, `window.__NUXT_SITE_CONFIG__.defaultLocale` is already `"en-US"` on all 6 documents (CONFIRMED). An explicit `site.defaultLocale: 'en-US'` would be a second copy of one value (Article VIII DRY), which is the same situation the `SITE_URL` comment guards against. → **Decision D3** | In scope ("si aplica"), recommend no-op |
| 7 | (absent) | No `fallbackLocale` / `i18n.config.ts` / `vueI18n` | **No change.** None is configured (CONFIRMED by grep), and i18n parity is enforced by `tests/i18n-parity.test.ts`, so a missing-key fallback never triggers (INFERRED). | No change |

## 2 · The root document (`public/index.html`)

**CONFIRMED** (R25, again in this audit): `rootRedirect` writes no file. In both builds, `.output/public/index.html` is byte-identical (`cmp`) and is the copy of `public/index.html`. Changing the config alone leaves `/` pointing at Spanish. So the file has to change together with item 2. Feature 33 G3 assigned it to this feature (§ 7).

| # | file:line | Today | Proposed | Scope |
|---|---|---|---|---|
| 8 | `public/index.html:57` | `<html lang="es">` | `lang="en-US"` (mirrors the i18n `language` tag). The alternative is `"en"`. → **Decision D2** | In scope |
| 9 | `public/index.html:61` | `meta refresh … url=/es` | `url=/en` | In scope |
| 10 | `public/index.html:64` | `canonical` → `https://muush.dev/es` | `https://muush.dev/en` | In scope |
| 11 | `public/index.html:67` | `x-default` → `https://muush.dev/es` | `https://muush.dev/en` | In scope |
| 12 | `public/index.html:88` | `<a href="/es">muush.dev</a>` (the accessibility fallback from feature 27) | `href="/en"`. The link and its styling stay exactly as they are. | In scope |
| 13 | `public/index.html:1–55` (comment) | Says "canonical pointing at the Spanish home", "Spanish is the default and the language is never detected from IP or `Accept-Language`", "redirects to `/es`" | Rewrite to the English default. The "never detected from IP" claim has been false since feature 33 (edge 302 by cookie or country). Point to the edge contract instead. | In scope (comment only) |

- `<title>` is already English ("muush · Technology Solution Studio"), so no change is needed there.
- `noindex` stays, and the file stays out of the sitemap. Both are asserted already and unaffected.

## 3 · Application code (`app/`)

| # | file:line | What it assumes | Proposed | Scope |
|---|---|---|---|---|
| 14 | Logo/home, nav, footer, menu (`SiteNav.vue:235`, `SiteFooter.vue:64`, via `useShellNavigation.ts:48` `localePath({ name: 'index' })`) | Nothing. Every destination is resolved per active locale. **No `'/es'` literal exists in production code** (CONFIRMED by grep; the hits are only in tests, stories and comments). | No change | n/a |
| 15 | `app/layouts/default.vue:149` `useHead(useLocaleHead())` | x-default is derived from `defaultLocale` (CONFIRMED, § 4) | No change. It follows item 1 automatically. | n/a |
| 16 | `app/features/shell/data/types.ts:12` | Doc comment: "Spanish is the default." | Update the comment | In scope (comment only) |
| 17 | `app/features/shell/logic/notFoundLocale.ts:20–27` | Comment: "i18n alone falls back to `defaultLocale` (es) there … keep the site's `es` default untouched" | Update the comment. **Keep the code.** With `defaultLocale: 'en'`, rule 2 now agrees with i18n's own fallback for `/xyz`, but it is still the explicit G6 rule ("`/es…` → es, else en") and should not silently depend on whatever `defaultLocale` is (INFERRED). Its tests (`notFoundLocale.test.ts`) are pure and pass under the en-config build (CONFIRMED). | In scope (comment only) |
| 18 | `app/features/forms/logic/useFormSubmission.ts:33–35` `toSiteLocale` (`code === 'en' ? 'en' : 'es'`) | Maps any non-`en` value to `es` | **No change.** There are exactly two locales, so this is a type-narrowing for `SiteLocale`, not a default: the input is always `es` or `en`. Flipping it would change nothing observable (INFERRED). | No change (out of scope) |
| 19 | `app/features/shell/logic/useShellNavigation.ts:41–46`, `app/features/shell/ui/LanguageToggle.vue:57` | Same binary narrowing (`'en' ? 'en' : 'es'`, and "other of es is en") | No change, for the same reason | No change |
| 20 | Language toggle + cookie `muush_locale` (`shell/data/localePreference.ts:19`, `shell/logic/localePreference.ts`) | Nothing. The toggle writes the visitor's explicit choice, and only the edge reads it at `/`. | No change. `tests/locale-preference-output.test.ts` passes under both en-config builds (CONFIRMED). That test has no `/ → /es` assertion. The "G3 `/ → /es`" pin the brief mentions is in `static-output`/`seo-output` (§ 6). | n/a |
| 21 | `app/plugins/not-found-locale.ts` | Thin wrapper over item 17 | No change | n/a |
| 22 | `app/error.vue`, `/es/404`, `/en/404` | Nothing. Each document's language comes from its prefix. | No change. Under en-config the 404 documents keep `lang` (`en-US`/`es-MX`), carry no canonical/hreflang, and have **identical JSON-LD** (CONFIRMED). The only byte difference is the inlined `__NUXT_SITE_CONFIG__.defaultLocale` (`es-MX` → `en-US`), which is harmless. Feature 36's Stage 1 (English 404 for every path) is unaffected and now also matches the site default. | n/a |

## 4 · @nuxtjs/i18n 10.6.0: actual behaviour (source + build)

- **x-default (CONFIRMED, source).** `dist/runtime/kit/head.js:60–63` prepends an `x-default` link whose href is **the current route's alternate in `defaultLocale`**. `defaultLocale` comes from `ctx.config.defaultLocale` (`composable-context.js:46–50`). So:
  - `/es` and `/en` → x-default `https://muush.dev/en`. This matches acceptance 3 (CONFIRMED in the en-config build).
  - `/es/nosotros` and `/en/about` → x-default `https://muush.dev/en/about`, **not** `/en` (CONFIRMED in the build). Today it is `/es/nosotros`. → **Decision D4**
- **rootRedirect (CONFIRMED, source).** `resolveRootRedirect` (`shared/utils.js:19–27`) gives `{ path: '/en', code: 302 }`. It is applied by the server redirect resolver (`server/utils/redirect.js:25–28`) and by the client navigation guard (`routing/navigation.js:33–34`). Both are runtime-only. The generated runtime config carries `defaultLocale:"en",rootRedirect:"/en"` (CONFIRMED in the build), and no root file is written (CONFIRMED, § 2). `nuxt dev` will 302 `/` → `/en` (INFERRED from source; I did not run a dev server).
- **Canonical, lang, og:locale (CONFIRMED in the build).** These are unchanged on all 4 pages: canonicals are absolute and self-referencing, `lang` is `es-MX`/`en-US`, and `og:locale` / `og:locale:alternate` are unchanged. Acceptance 4 holds.

## 5 · Generated SEO artefacts: base vs en-config (CONFIRMED by diff)

| Artefact | Effect |
|---|---|
| Page `<head>` (4 pages) | Only `<link id="i18n-xd" … hreflang="x-default">` changes (§ 4). The language-only `es`/`en` and regional `es-MX`/`en-US` alternates and the canonical are identical. |
| `sitemap.xml` | Still exactly 4 `<loc>` (`/en`, `/es`, `/en/about`, `/es/nosotros`), in the **same order**, with es-MX/en-US/x-default alternates each. Only the x-default hrefs change: `/es` → `/en` on the homes, `/es/nosotros` → `/en/about` on the About pair. Acceptance 5 holds. |
| JSON-LD (4 pages) | Still present, one `ld+json` block per page, and still valid JSON. **One semantic flip:** `nuxt-schema-org`'s i18n defaults (`runtime/app/plugins/i18n/defaults.js:79–84`) mark the default-locale `WebSite` as the original. So today `/es` carries `workTranslation` and `/en` carries `translationOfWork`, and after the change it is the reverse. The `seo-output` parity test already excludes these two keys, which is why it still passes. → **Decision D5** |
| JSON-LD (404 pages) | Identical |
| `robots.txt` | Identical |
| `index.html` (root) | Identical. It is `public/`'s copy (§ 2). |
| `__NUXT_SITE_CONFIG__` (inline) | `defaultLocale` `es-MX` → `en-US` on all documents (item 6) |

## 6 · Tests that pin `es` as the default

All of these are **in scope**: they have to move with items 1–12, because acceptance 9 requires `pnpm test` to pass.

| # | file:line | Pin | Proposed | Fails under |
|---|---|---|---|---|
| 23 | `tests/seo-output.test.ts:175,186` | `x-default` = `${ORIGIN}${spanish}` for each of the 4 pages | Expect the English counterpart (`english`) instead. That gives `/en` for the homes and `/en/about` for About (D4). | en-config (4 tests, CONFIRMED) |
| 24 | `tests/seo-output.test.ts:368` | Root `x-default` → `/es` | → `/en` | en-config + root (CONFIRMED) |
| 25 | `tests/static-output.test.ts:88–101` | Test "…root pointing at the **Spanish** home", plus refresh `url=/es`, canonical `/es`, `<a href="/es">` | Rename it to the English home, switch the three assertions to `/en`, and optionally assert root `x-default` `/en` | en-config + root (CONFIRMED) |
| 26 | `tests/static-output.test.ts:9` | Header comment: "SC-001 (… `/` reaches the Spanish home)" | Update the comment | n/a (comment) |

**Not default pins (no change):** `'es'` fixtures in `forms/logic/*.test.ts`, `HeroSection.test.ts`, `useShellItemResolver.test.ts`, `resolveLocaleDestination.test.ts`, `notFoundLocale.test.ts`, `not-found-output.test.ts`, `localePreference.test.ts`, and the per-locale route tables in `static-output`/`seo-output`. These exercise the Spanish locale; they don't assume it is the default. All of them pass under both en-config builds (CONFIRMED: only the 6 tests above fail).

## 7 · Feature 33 (`ip_locale_root_redirect`, **done**)

- The edge contract (`specs/033-ip-locale-root-redirect/contracts/edge-root-locale-redirect.md` § 3) resolves `/` by cookie → country → `DEFAULT_LOCALE = "en"` (G2). Gate G3 (`spec.md:191`, FR-020, A7) explicitly left `public/index.html`, `rootRedirect` and `x-default` to feature 37. **Items 2 and 8–12 close G3 exactly as approved.** After this feature, the edge default, the static fallback, `rootRedirect` and x-default all name `en`. **No code-level conflict remains** (INFERRED from the contract plus this inventory).
- Feature 33's spec (C8 at `spec.md:26`) and feature 37's own `description` in `feature_list.json` still describe 33 as "pending". That is stale text, with no effect. The leader may want to fix the `description` wording; `feature_list.json` is not mine to touch in this phase.
- **UNVERIFIED from this repo:** whether muush-foundation has already replaced the fixed 301 `/` → `/en` with the 302 decision. `current.md` says the 301 is still live. Either way, production `/` already lands on `/en` for visitors with no cookie and a non-Spanish-speaking country, so the root file is not reached in production (spec G3 note). This feature makes the plain-static fallback agree with that.
- **Conflict that remains, in human-only docs (not code):** `ui-map.md` § 1 and `messaging.md` rule 4 still say the language is never detected by IP. Feature 33 made that false. See § 9.

## 8 · Storybook, CI, README and other docs outside `docs/business/`

| # | Where | What | Proposed | Scope |
|---|---|---|---|---|
| 27 | `*.stories.ts` (SiteNav, MobileMenu, SiteFooter, LanguageToggle, NotFoundContent, HeroSection) | Spanish stories are exported first, so Storybook opens on Spanish. Fixtures use `/es…` hrefs. | **No change.** These are review fixtures, both locales have stories, and reordering them is a design-review change (acceptance 7). | Out of scope |
| 28 | `.storybook/preview.ts` | No locale default | No change | n/a |
| 29 | `.github/workflows/*`, `init.sh` | Nothing locale-specific (CONFIRMED by grep) | No change | n/a |
| 30 | `.github/PULL_REQUEST_TEMPLATE.md:61` | "screenshots for both /es/ and /en/" | Neutral, no change | n/a |
| 31 | `README.md:51–56` | "`es` (default) … La raíz (`/`) redirige a `/es/`" (also stale since the Astro era: `astro.config.mjs`, `src/i18n/ui.ts`, `useTranslations`) | Update in phase B, or leave for a docs pass. → **Decision D8** | Leader-editable, Roberto decides |
| 32 | `.specify/memory/constitution.md` Article VI | "The site ships in Spanish (default) and English" | One word changes, but the Constitution's Governance section requires a description, a version bump and **explicit written ratification** for any amendment. An implementer must not edit it. → **Decision D6** | **Human-only** |
| 33 | `specs/036-not-found-page/contracts/edge-not-found.md:30` | "The site's default locale is Spanish (`i18n.defaultLocale: 'es'`, `x-default` → `/es`, root `/` → `/es`)" | This is a historical record of a done feature. Recommend leaving it, or adding a dated "superseded by feature 37" note. → **Decision D9** | Roberto decides |
| 34 | `docs/business/rules.md` § R25 (`:501–530`) and `:420` | A historical measurement made "with `rootRedirect: '/es'`" | Historical, and still true as a finding (no file is emitted). Human-only. | **Human-only**, likely no change |

## 9 · Human-only docs (`docs/business/`): reported, not edited

| # | file:line | Text | Conflict |
|---|---|---|---|
| 35 | `docs/business/landing/ui-map.md:22` (§ 1 table) | "Raíz · `/` redirige a `/es/`" | Becomes `/en/` |
| 36 | `docs/business/landing/ui-map.md:33–36` (§ 1) | "**Español de México es el default — no se detecta idioma por IP ni por `Accept-Language`** … La elección se recuerda en `localStorage`" | The default becomes English (feature 37). IP/country detection at `/` exists (feature 33). The preference lives in the `muush_locale` cookie, not `localStorage` (feature 33). |
| 37 | `docs/business/landing/decisions-open.md:148` | "Raíz · `/` → redirect a `/es/` (ya existe en `src/pages/index.astro`)" | Becomes `/en/`. The Astro reference is also stale. |
| 38 | `docs/business/messaging.md:40–42` (rule 4) | "…por eso tampoco se detecta idioma por IP ni `Accept-Language`" | Contradicted by feature 33, which is already done. Not caused by feature 37, but in the same family. |
| 39 | `docs/business/rules.md` § R25 | See item 34 | Historical |

`overview.md`, `services.md`, `branding.md`, `content.md`, `design-extract.md`, `component-contracts.md` and `form-api-contract.md` make no claim about the default locale (CONFIRMED by grep). `content.md:16` says "Bilingüe ES + EN" and is neutral.

---

## 10 · Proposed phase B scope (for Roberto's approval)

**Behaviour, which produces acceptance 2–5:**
- Items 1 and 2: `defaultLocale: 'en'`, `rootRedirect: '/en'`.
- Items 8–12: `public/index.html` → `/en` (lang, refresh, canonical, x-default, link).
- Items 23–25: update the 6 tests that pin the Spanish default.

**Comments only:** items 3, 13, 16, 17, 26.

**Explicitly not touched:** item 6 (site defaultLocale, derived automatically), items 4, 5, 7, 18–22, 27–30, and all routes, copy, translations and design.

Measured result of exactly this behaviour change in scratch: `pnpm generate` exit 0. The 6 named tests fail until items 23–25 update them, and every other test passes. I did not run `pnpm check`, `typecheck` or `storybook:build` in scratch; those are for phase B.

## 11 · Decisions Roberto must take

- **D1.** Approve the phase B scope in § 10 (acceptance 1 gate).
- **D2.** `lang` of the root redirect document: `en-US` (recommended, mirrors i18n) or `en`.
- **D3.** `site.defaultLocale`: leave it derived from i18n (recommended; it is already `en-US`, CONFIRMED), or declare `'en-US'` explicitly as a second source.
- **D4.** On the About pair, x-default becomes `https://muush.dev/en/about` (the module's per-page behaviour), not `/en`. Acceptance 3 names only `/en` and `/es`. Confirm this is the intended reading.
- **D5.** JSON-LD translation direction flips: English becomes the "original" `WebSite` (`workTranslation`), and Spanish carries `translationOfWork`. This is automatic, valid, and not asserted by any test. Accept it, or override it (overriding would be new code and isn't recommended).
- **D6.** Constitution Article VI "Spanish (default)": amend it (needs your written ratification and a version bump; it could be a PATCH wording fix) as part of this feature or separately.
- **D7.** Human-only docs (§ 9, items 35–38): you or another human update `ui-map.md` § 1, `decisions-open.md` and `messaging.md` rule 4. Items 36 and 38 are already stale because of feature 33.
- **D8.** README i18n section (item 31): update in phase B (the leader may edit docs outside `app/`/`tests/`), or leave it.
- **D9.** Done-feature spec text that says the site default is Spanish (item 33): leave it as history (recommended), or add a superseded note.
