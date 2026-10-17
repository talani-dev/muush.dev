# Review · feature 37 `english_default_locale`

APPROVED

- Date: 2026-10-16 · Reviewer: reviewer agent · Branch: `feat/english-default-locale` (uncommitted working tree vs `master`)
- Criteria: feature 37 `description` + `acceptance` (sdd: false, no specs/ package), D1–D9 (gate line in `current.md`), `docs/harness/CHECKPOINTS.md`, constitution.
- Precondition: status in `feature_list.json` is `reviewing`. CONFIRMED.

## Evidence

| # | Check | Result |
|---|---|---|
| 1 | Acceptance 1: audit delivered and scope approved before changes | CONFIRMED (`audit_english_default_locale.md`; gate line D1–D9 "si" in `current.md`) |
| 2 | `i18n.defaultLocale: 'en'`, `rootRedirect: '/en'`; `site` not declaring a second copy (D3), derived `defaultLocale` = `en-US` | CONFIRMED (nuxt.config.ts diff; `window.__NUXT_SITE_CONFIG__` asserted by new test on all 4 pages) |
| 3 | `public/index.html`: `lang="en-US"`, refresh, canonical, x-default, fallback link all `/en`; es-MX/en-US alternates kept; `noindex` kept | CONFIRMED (source and `.output/public/index.html`) |
| 4 | x-default on `/en` and `/es` = `https://muush.dev/en`; About pair = `/en/about` (D4) | CONFIRMED (built heads) |
| 5 | Canonical absolute and `lang` per page (en-US / es-MX), byte-identical `<html>` tag vs master | CONFIRMED |
| 6 | sitemap.xml: exactly `/en`, `/es`, `/en/about`, `/es/nosotros`, each with es-MX/en-US/x-default; vs master only the 4 x-default lines differ | CONFIRMED |
| 7 | JSON-LD: one parseable block on each of the 4 pages (and both 404s); only change vs master is the translation direction (`workTranslation` now on the English WebSite, `translationOfWork` on the Spanish) = D5 | CONFIRMED |
| 8 | No route/content/translation/design change: independent master build (git archive into session scratchpad, own `pnpm install --offline`, nothing written into the repo; R73 avoided). Body markup (scripts stripped) identical on all 6 documents; head differs only in x-default and build-hash links; `_i18n` messages identical; `robots.txt` identical; same file set | CONFIRMED |
| 9 | 404 docs and `muush_locale` cookie untouched: `/es/404`, `/en/404` bodies, heads and JSON-LD identical modulo build hash; `app/` diff is comments only (`shell/data/types.ts`, `shell/logic/notFoundLocale.ts`) | CONFIRMED |
| 10 | Constitution amendment: description + motivation, version 2.0.0 → 2.0.1, Last Amended 2026-10-16 (Ratified date kept), template sync check listed, ratification recorded (D6); only Article VI's default-language sentence and prefix order changed | CONFIRMED. PATCH is a defensible category: no principle added, removed or redefined; the parity rules are unchanged |
| 11 | `docs/business/`, closed `specs/`, `history.md`, `i18n/` untouched | CONFIRMED (no diff, no untracked files there). D7 line list for Roberto is in `impl_english_default_locale.md` § 4 |
| 12 | README i18n section accurate (`@nuxtjs/i18n`, prefix strategy, `i18n.pages`, rootRedirect only in dev, `public/index.html`, edge order cookie → country → `en` per `specs/033-.../contracts/edge-root-locale-redirect.md`, `tests/i18n-parity.test.ts` exists) | CONFIRMED |
| 13 | Tests updated for the new default (root object, x-default per page, sitemap x-default, site-config en-US) | CONFIRMED |
| 14 | `feature_list.json`: only the dated leader note and status change | CONFIRMED |
| 15 | Acceptance "rama aparte; sin deploy ni merge" | CONFIRMED for this repo (branch, uncommitted). Live CloudFront behaviour UNVERIFIED (out of repo) |
| 16 | `./init.sh` | CONFIRMED exit 0: check, typecheck, 1347/1347 tests, generate, storybook:build |

## Checkpoints

- C1, C2: green (one feature in `reviewing`). C3/C4: no new imports, components or colors; `public/index.html` colors are pre-existing and untouched; no `server/` route, preset static. C5: green via init.sh. C6: session still open (history entry due at close-out). C7: n/a (sdd: false). C8: parity test passes; routes unchanged.

## Non-blocking notes

1. `tests/static-output.test.ts` header comment: the reworded SC-001 line is now longer than the rest of the comment block (Biome passes, style only).
2. `SHELL_LOCALES` keeps the order `['es', 'en']`. The new comment says the order means nothing. Leaving it unchanged was the right call for this feature's scope.
