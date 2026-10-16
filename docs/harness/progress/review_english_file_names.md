# Review · feature 30 `english_file_names` (sdd: false)

Date: 2026-10-16 · Branch: `feat/english-file-names` (uncommitted tree vs `master`) · Reviewer run, independent of the implementer report.

## Verdict: APPROVED

Precondition: feature 30 is `reviewing` in `feature_list.json`, and it is the only feature in `in_progress`/`reviewing` (C2). CONFIRMED.

## Acceptance criteria

1. **git mv renames, old names gone.** `git status` shows 7 staged `R` entries. `app/pages/nosotros.vue`, `app/shared/ui/BotonPrimario.*` and `app/assets/logo/isotipo-on-*.svg` no longer exist. `about.vue` and the three SVGs are byte-identical to their `master` originals (`diff`/`cmp`). CONFIRMED.
2. **No references in app/, tests/, i18n/, .storybook/, .github/, nuxt.config.ts or root configs.** I grepped for `BotonPrimario|Boton|isotipo-|'nosotros'|"nosotros"|nosotros:|nosotros___`. The only hits are `join('es','nosotros','index.html')` in `tests/static-output.test.ts:33` and `tests/not-found-output.test.ts:352`, and both are the public Spanish output path, which the criterion allows. `ShellRouteName` is now `'index' | 'about'`, so typecheck enforces that every route-name caller was updated. CONFIRMED.
3. **i18n.pages.** `nuxt.config.ts:286-291` reads `about: { es: '/nosotros', en: '/about' }`. CONFIRMED.
4. **Static output.** `.output/public/es/nosotros/index.html` and `.output/public/en/about/index.html` both exist. The ES page contains `href="/en/about"` and the EN page contains `href="/es/nosotros"`, and `tests/static-output.test.ts` asserts the toggle and passes. CONFIRMED.
5. **PrimaryButton identical to BotonPrimario.** Comparing `git show master:app/shared/ui/BotonPrimario.vue` with `PrimaryButton.vue`, the only difference is line 5, the header comment name. Template, script and `<style scoped>` are byte-identical. The test file changes only identifiers, import paths and the `describe` name. CONFIRMED.
6. **Story title.** `title: 'Shared/UI/PrimaryButton'`. In `storybook-static/index.json` that title is present and `BotonPrimario` appears 0 times. CONFIRMED.
7. **Docs.** Current docs were updated: `docs/harness/findings.md` (4), `app/assets/logo/README.md`, and in `docs/business/` exactly 3 one-line `BotonPrimario -> PrimaryButton` edits (`rules.md`, `landing/design-extract.md`, `landing/component-contracts.md`). Nothing beyond the authorized renames. `git diff master` shows no change to `specs/` or `docs/harness/progress/history.md`. The only `feature_list.json` change is feature 30's own status line. No other current doc still names an old file; the remaining hits are this feature's own entry, `current.md` and historical progress reports. CONFIRMED.
8. **Commands.** `./init.sh` exits 0: check, typecheck, 95 files / 1342 tests passed, generate (16 routes), storybook:build. CONFIRMED.

## Checkpoints
- C1/C5: `./init.sh` green; `PrimaryButton` keeps its story and test. CONFIRMED.
- C2: only one active feature, and it is in `reviewing`. CONFIRMED.
- C3/C4: no new imports across features. All imports use the `@/` alias, and `Lockup.vue`'s pre-existing `./Wordmark.vue` stays in the same directory. No new colors or tokens, no server route, and `nitro.preset` is unchanged. Import re-sorting in 3 files is Biome organizeImports only. CONFIRMED.
- C6: history entry and close-out are the leader's job after approval. Not applicable before this verdict.
- C7: n/a (`sdd: false`).
- C8: no new page or keys; both locales still resolve. CONFIRMED.

## Judgments on the implementer's notes
- **"isotipo" style token, comments and SVG `<title>` left out of scope: AGREE.** The feature covers file names only. Renaming `--spacing-isotipo`/`w-isotipo` would change rendered `class` attributes, and editing `<title>` would change the inlined SVG markup. Both would break criterion 5 ("cero cambios de comportamiento o visuales"). None of them matches the criterion-2 pattern `isotipo-`. If Roberto wants it, it should be a separate feature. (Non-blocking: the local import identifier `isotipo` in `Lockup.vue` belongs to the same follow-up.)
- **Scoped `<style>` reordering in built HTML: ACCEPTABLE.** PrimaryButton's `.led[data-v-*]` block now comes after Radar's `.ping[data-v-*]`. The two have different scope ids and share no selectors, so the specificity and cascade results are unchanged. The reorder comes from the bundler's chunk/module order after the rename, not from a source change. I did not re-run the baseline comparison myself. The multiset-identical claim is UNVERIFIED by me, but it is consistent with criterion 5, which I did verify at the source level.
- **`tests/static-output.test.ts:12` quote updated to `about.vue`: ACCEPTABLE.** The comment describes the assertion right below it, which now checks `about.vue`.
- **i18n prerender nondeterminism (`$si18n:cached-locale-configs`):** existing before this feature and outside its scope. I recommend the leader record it in `findings.md` separately.

## Non-blocking follow-ups
1. A possible future feature to anglicize the "isotipo" token, class, identifier, comments and SVG titles, if Roberto wants it.
2. Record the i18n prerender nondeterminism in `docs/harness/findings.md`.
