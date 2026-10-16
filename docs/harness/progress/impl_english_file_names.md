# Implementation · feature 30 `english_file_names` (sdd: false)

Date: 2026-10-16 · Branch: `feat/english-file-names` · Status left at `in_progress` (not committed, not marked done).
Contract: the `acceptance` array of feature 30 in `feature_list.json` (no spec package).

## Result: PASS

`./init.sh` exit 0 (final run): biome check, typecheck, 95 test files / 1342 tests, generate, storybook:build.

## What changed

### Renames (`git mv`, staged as `R`)
| Old | New | Content change |
|---|---|---|
| `app/pages/nosotros.vue` | `app/pages/about.vue` | none (byte-identical) |
| `app/shared/ui/BotonPrimario.vue` | `app/shared/ui/PrimaryButton.vue` | 1 line: header comment name (`diff` vs `HEAD:` shows only line 5). Markup, script, styles untouched |
| `app/shared/ui/BotonPrimario.test.ts` | `app/shared/ui/PrimaryButton.test.ts` | identifier / import path / `describe('PrimaryButton')` |
| `app/shared/ui/BotonPrimario.stories.ts` | `app/shared/ui/PrimaryButton.stories.ts` | identifier / import path / `title: 'Shared/UI/PrimaryButton'` / template tags |
| `app/assets/logo/isotipo-on-{bone,ink,red}.svg` | `logomark-on-{bone,ink,red}.svg` | none (byte-identical) |

### Route name `nosotros` → `about`
- `nuxt.config.ts` `i18n.pages`: `about: { es: '/nosotros', en: '/about' }`.
- `app/features/shell/data/types.ts`: `ShellRouteName = 'index' | 'about'`.
- `{ kind: 'route'|'anchor', name: 'about' }` in `navigation.ts` (2), `footerColumns.ts` (2), `notFound.ts` (1); tests `notFound.test.ts`, `useShellItemResolver.test.ts` (PATHS key + `stubDeps('about')`).
- No `localePath('nosotros')` / `nosotros___es` string existed anywhere; every caller goes through `ShellRouteName`, so typecheck enforces completeness.

### Other code references
- Imports + `<PrimaryButton>` tags: `HeroSection.vue`, `SiteNav.vue`, `NotFoundContent.vue`, `ContactForm.vue`, `ApplicationForm.vue`. Biome's organizeImports then required re-sorting the import line in `HeroSection.vue`, `SiteNav.vue`, `NotFoundContent.vue` (safe fix, import order only).
- `Lockup.vue`: `@/assets/logo/logomark-on-ink.svg?raw`.
- Comments naming the files: `global.css` (2), `PurposeSection.vue`, `CursorSpotlight.vue`, `HeroSection.test.ts`, `SiteNav.test.ts`, `useWorkContent.ts`, `WorkWithMuushSection.vue`, `tests/static-output.test.ts`.
- `tests/static-output.test.ts:118`: page-file assertion now `['about.vue']`.
- `app/assets/logo/README.md`: file table, title and prose → "logomark" (keeps "(the brand's *isotipo*)" once for the brand term).

### Docs (Roberto's authorization for these renames only)
- `docs/business/rules.md` (1), `docs/business/landing/design-extract.md` (1), `docs/business/landing/component-contracts.md` (heading `## PrimaryButton`): `BotonPrimario` → `PrimaryButton`. No other edit in `docs/business/`.
- `docs/harness/findings.md` (4 mentions).
- Constitution, AGENTS.md, CLAUDE.md, `.claude/`, other `docs/harness/*.md`: no matches; they only mention `/es/nosotros` as a public URL, which stays.
- Not touched: `specs/`, `history.md`, `docs/harness/progress/*` reports from earlier features, earlier `feature_list.json` entries.

## Acceptance check
1. Files moved with `git mv`; old paths gone. CONFIRMED (`git status`: 7 `R` entries).
2. `grep -rnE "BotonPrimario|isotipo-|Boton|'nosotros'|nosotros:|nosotros___"` over app/, tests/, i18n/, .storybook/, .github/, nuxt.config.ts, biome.json, vitest.config.ts, package.json, tsconfig.json → only `join('es','nosotros','index.html')` in two output tests (public Spanish path). CONFIRMED.
3. `i18n.pages` key `about`, es `/nosotros`, en `/about`. CONFIRMED.
4. `.output/public/es/nosotros/index.html` and `en/about/index.html` exist; LanguageToggle on `/es/nosotros` is `href="/en/about"` and vice versa (also asserted by `tests/static-output.test.ts`, passing). CONFIRMED.
5. Zero behavior/visual change — see next section. CONFIRMED with one non-visual note.
6. Storybook: `storybook-static/index.json` has `"title":"Shared/UI/PrimaryButton"`, ids `shared-ui-primarybutton--*` (6 stories). CONFIRMED.
7. Current docs updated, historical records untouched. CONFIRMED (list above, plus the items below that I left alone on purpose).
8. All five commands pass. CONFIRMED.

## Output comparison (baseline vs. post-change)
Baseline: `pnpm generate` on the pre-change tree, saved to the session scratchpad (outside the repo).
Normalized: `/_nuxt/*` asset names, build UUIDs, `data-v-*` ids, 13-digit timestamps.

- Root `index.html`: identical.
- Every page: **multiset-identical** (sorted by tag). The only ordered difference is that PrimaryButton's inline scoped `<style>` block (`.led[data-v-…]`) now comes after Radar's (`.ping[data-v-…]`) instead of before it. They are separate components with separate scope ids and no shared selectors, so the cascade is unaffected.
- Emitted CSS: identical rule set (5 files before and after; chunk names shift, e.g. `nosotros-*.css` → `about-*.css`).
- `_payload.json` files and `sitemap.xml`: identical modulo timestamps. Non-`_nuxt` file set identical.
- `data-v-*` ids changed only for components whose source text changed (PrimaryButton, SiteNav, Lockup, CursorSpotlight, PurposeSection, …). Expected for a production build.

**Pre-existing nondeterminism found (not caused by this feature):** compared against the first baseline, `/es` and `/en` showed `$si18n:cached-locale-configs` as `{}` in `__NUXT_DATA__` instead of `{es:…, en:…}`. I rebuilt pristine `HEAD` three times in a scratchpad git worktree (since removed): run 1 had it populated, runs 2 and 3 had it empty. The value is `event.context.nuxtI18n?.localeConfigs || {}` in `@nuxtjs/i18n` `runtime/plugins/i18n.js`, and it depends on the order Nitro's concurrent prerender happens to use. HEAD run 3 compared with the post-change build is identical except for the style-block order above. This could be a findings.md entry if the leader wants it recorded; I did not write one.

Side effect: my first worktree attempt symlinked the main repo's `node_modules`, so two failed builds wrote into the main `node_modules/.cache/nuxt`. That is a build cache only. The final `./init.sh` rebuilt it from the current tree and passed.

## Items for Roberto / the leader
1. **The brand word "isotipo" is still used** in identifiers and prose that are not filenames: the CSS token `--spacing-isotipo` / class `w-isotipo` (in `global.css`, `Lockup.vue`, `Lockup.test.ts`), comments in `SiteNav.vue`, `Lockup.vue`, `Lockup.stories.ts`, `SiteNav.test.ts`, `tests/static-output.test.ts`, `public/favicon.svg`, `.storybook/manager-head.html`, `app/assets/icons/README.md`, `app/assets/social/README.md`, and the SVGs' own `<title>` text. Renaming the token changes the rendered `class` attribute, and changing the `<title>` changes the inlined SVG markup. Both conflict with "zero behavior/visual change" and are beyond the file-name scope, so I left them. If Roberto wants them in English too, that should be its own feature.
2. `tests/static-output.test.ts:12` quotes an older acceptance criterion ("`nosotros.vue` resolves at …"). It now reads `about.vue`, because the test it describes now checks `about.vue`. Revert if the quote should stay verbatim.
3. Old progress reports (`docs/harness/progress/impl_*.md`, `review_*.md`) still say `BotonPrimario`. They were left alone as historical records under `progress/`.
4. `docs/business/` prose uses "Nosotros" as the page's public name (a Spanish label/URL), not a file or route name. Left unchanged.
