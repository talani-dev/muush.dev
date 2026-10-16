# Implementation report: feature 33 · `ip_locale_root_redirect`

**Date**: 2026-10-15 · **Branch**: `feat/ip-locale-root-redirect` · **Agent**: implementer
**Status left at**: `in_progress` (the leader moves it to `reviewing`). No commit, push or deploy.

Provenance: **CONFIRMED** = measured in this session · **INFERRED** = reasoned · **UNVERIFIED** = not checkable here.

## 1 · Scope delivered

The edge redirect is muush-foundation's (`contracts/edge-root-locale-redirect.md`). This repository only adds the
`muush_locale` preference cookie, written by the language toggle on click.

| File | Change |
|---|---|
| `app/features/shell/data/localePreference.ts` | NEW. `LOCALE_PREFERENCE_COOKIE = 'muush_locale'`, `LOCALE_PREFERENCE_MAX_AGE_SECONDS = 31_536_000`, and `LocalePreference` (= `ShellLocale`). Header comment: only the toggle writes it, the site never reads it, the edge reads it at `/` only, link to the contract. |
| `app/features/shell/logic/localePreference.ts` | NEW. `serializeLocalePreference(locale)` returns the exact contract string. `rememberLocalePreference(locale, target = document)` assigns it to an injectable `Pick<Document, 'cookie'>`. No reader, no `typeof document` guard (plan § Design notes). |
| `app/features/shell/logic/localePreference.test.ts` | NEW. 7 tests: exact string for `en`/`es`, no `Domain`/`HttpOnly`/`Expires`, a type-level guard (`expectTypeOf` ⇒ `'es' \| 'en'`), one write per call via a setter spy, overwrite on a second call, and the real `document.cookie`. |
| `app/features/shell/ui/LanguageToggle.vue` | EDIT. The new `onToggleClick` calls `rememberLocalePreference(otherLocale.value)` first, then the unchanged `preserveAnchor(event)`. A comment explains why the write comes before the early returns. Props, template markup, classes and `aria-*` are unchanged. 108 lines. |
| `app/features/shell/ui/LanguageToggle.test.ts` | EDIT. The 11 existing tests are textually unchanged. New: a `vi.mock` that wraps the writer in a call-through spy, plus a new `describe` with 6 tests (plain click es→en and en→es, ⌘/Ctrl-click, hash + `location.assign`, render without a click, real cookie jar). |
| `tests/locale-preference-output.test.ts` | NEW. The name appears in ≥1 `_nuxt/*.js`. No `.html` under `.output/public` contains it. |
| `specs/033-…/contracts/edge-root-locale-redirect.md` | T002/T009: status set to "agreed at the gate". § 3 list now has 21 codes **with `GQ`**. `SPANISH_SPEAKING` in the reference code updated. R-2 says "20 other listed codes (including `GQ`)". R-3 notes `US` is excluded. G2 wording is final (`en`). |
| `specs/033-…/contracts/locale-preference-cookie.md` | Status: agreed at G4. |
| `specs/033-…/data-model.md` | § 2: 21 codes. Decision table row 5: G2 = `/en`. |
| `specs/033-…/spec.md` | Status line only: approved 2026-10-15. The "Gate — human approval" section was already written by the leader, so T002 did not add a duplicate. |
| `specs/033-…/tasks.md`, `plan.md` | T001–T016 ticked. Constitution Check boxes ticked after verifying the delivered code. |

**Untouched (CONFIRMED by `git diff master` showing nothing)**: `public/index.html`, `nuxt.config.ts`, `i18n/`, `app/pages`, `app/layouts`, `app/plugins`, `package.json`, `pnpm-lock.yaml`, `tests/static-output.test.ts`, `tests/seo-output.test.ts`, `tests/not-found-output.test.ts`, `tests/not-found-tokens.test.ts`, and the barrel `app/features/shell/index.ts`. Feature 37 work (defaultLocale, rootRedirect, x-default, `public/index.html`) was not done.

## 2 · Checks

| Check | Result |
|---|---|
| T001 baseline `./init.sh` | exit 0. 93 files / 1326 tests. `grep -rn "document.cookie\|localStorage" app/` printed nothing (C4 CONFIRMED). |
| Unit tests red before the code (T004) | CONFIRMED: the import failed before `logic/localePreference.ts` existed. |
| Component tests red before the toggle edit (T006) | CONFIRMED: 5 failed and 12 passed (11 existing tests + "render without click"). |
| Type guard negative control | Changing the expected type to `'es' \| 'en' \| 'fr'` made `pnpm typecheck` fail with TS2344. Reverted afterwards. |
| Bundle output-test negative control | The `master` build has 0 `_nuxt` files containing `muush_locale`, so the "ships in bundle" assertion would fail there. |
| Final `./init.sh` | **exit 0.** typecheck, check (Biome, `--error-on-warnings`), test **95 files / 1341 tests** (+2 files, +15 tests), generate and storybook:build all OK. |
| Features 35/36 tests | Pass with no change: none of their files are modified, and the full suite is green. |
| No new dependency / third party (T015) | `git diff master -- package.json pnpm-lock.yaml` is empty. `grep http` on both new source files prints nothing. The changed chunk adds no new URL host. |

### Cookie attributes in a real browser (T014): headless Chrome 155, CONFIRMED

Server: a scratchpad Node static server bound to **127.0.0.1:4333**. It serves `.output/public` with the directory-index rewrite and has no edge rule. Chrome ran headless with its debugging port on 127.0.0.1 and was driven through CDP using Node's built-in `WebSocket`. Both processes were stopped afterwards and the ports were checked as free.

| Step | Observed |
|---|---|
| 1 `/es`, then `/es/nosotros` and `/en` with no click | no `muush_locale` cookie |
| 2 click toggle on `/es` | URL `/en`. Cookie `muush_locale=en`, domain `127.0.0.1` (host-only, no leading dot), path `/`, `Secure`, not `HttpOnly`, `SameSite=Lax`, persistent, expires in **365 days** |
| 3 click again | URL `/es`, cookie `es`, same attributes |
| 4 `/es/nosotros#work` → scroll up to reveal the nav → click | URL **`/en/about#work`**, cookie `en` |
| 5 ⌘-click on `/en/about` | this tab stays on `/en/about`, a new tab opens `/es/nosotros`, cookie is now `es` |
| 5b middle-click on `/es` (cookie `es`, destination `en`) | a new tab opens `/en`, cookie **stays `es`** (`auxclick` does not write, contract § 2) |
| 6 `/` | static `public/index.html` → `/es` (G3: unchanged, no edge locally) |
| extra: toggle on a not-found page | records the destination locale like any other page |
| extra: scripting disabled | the link still navigates `/es` → `/en`, no cookie is written (documented degradation) |
| console / exceptions | none, apart from the expected 404 status of the not-found request |

### Generated output unchanged (CONFIRMED, same build environment)

I built a control with `master`'s `LanguageToggle.vue` swapped in (so none of the feature's code reaches the bundle), and compared it with the branch build:
- Same file set.
- Byte-equal after normalising the chunk hash, build id and `prerenderedAt` timestamps: all 6 page documents (`/es`, `/en`, `/es/nosotros`, `/en/about`, `/es/404`, `/en/404`), `index.html`, `sitemap.xml`, `robots.txt`, `_i18n/*`, all CSS and the 4 other JS chunks. The `_payload.json` files differ only in the timestamp.
- **Only difference**: one JS chunk carries the toggle: **+184 B raw / +90 B gzip** (315 962 → 316 146 B). `muush_locale` appears in no `.html`.

## 3 · Deviations and findings

1. **Preview server.** Quickstart says `pnpm preview`, which runs `nuxt preview`. I used a 40-line loopback-only Node static server in the scratchpad instead, because `nuxt preview` for the static preset may fetch a package and bind other interfaces (the leader's constraint). Behaviour at `/` is the same: no edge rule, so `public/index.html` answers.
2. **The scroll-reveal nav hides the toggle at `#work`.** Arriving at `/es/nosotros#work` scrolls the page, and the nav sits at `translateY(-96px)`. The toggle cannot be clicked until the visitor scrolls up. This is existing behaviour (feature 21/useNavScrollReveal) and the feature does not change it. The browser check scrolls up first, as a person would.
3. **Biome `noDocumentCookie`.** The two test cleanup lines that expire the cookie carry a `biome-ignore` with a reason: happy-dom has no Cookie Store API, and cleanup keeps tests independent (Article X). Production code assigns `target.cookie` on the injected target and is not flagged.
4. **`vi.mock` with call-through** in `LanguageToggle.test.ts` is file-wide, so the 11 existing tests now run against a spy that still writes the real cookie. Their text and assertions are unchanged, and the new `describe` clears the cookie before and after each test.
5. **Scratch-worktree side effect (finding for `docs/harness/findings.md`, leader's call).** A first attempt built `master` in a `git worktree` with `node_modules` symlinked. This repo's production Nuxt build dir is `node_modules/.cache/nuxt/.nuxt`, so the worktree build wrote into the **main repo's build cache** through the symlink. Later worktree builds then failed (`#internal/nuxt/paths` not defined). Nothing was deleted: I removed the symlink with `unlink` before `git worktree remove`. Subsequent main-repo `pnpm generate` runs and the final `./init.sh` rebuilt the cache and passed. Inline i18n state on `/es` and `/en` differed between that worktree build and branch builds, but the same-environment control above shows it is environmental, not caused by this feature. Recommendation: scratch copies should set their own `buildDir`, or not share `node_modules/.cache`.
6. **Order of the final checks.** During the control/branch comparison builds, `LanguageToggle.vue` was temporarily swapped for `master`'s copy and then restored from a backup (diff verified as identical to before). `./init.sh` was then re-run after every build and edit: **exit 0, 95 files / 1341 tests**.

## 4 · Business-document findings (for the leader to take to Roberto; not written)

Unchanged from plan § Business-document findings: `ui-map.md` § 1 ("no se detecta idioma por IP", "se recuerda en `localStorage`", "Raíz → `/es/`"), `decisions-open.md` § Estrategia de rutas i18n, `messaging.md` rule 4. With G5 approved, the 21-code list lives only in the edge contract (G6).

## 5 · Hand-off

**For Roberto / muush-foundation:** apply `contracts/edge-root-locale-redirect.md` §§ 6–7 in muush-foundation, starting with step 0 (record today's 301). Either side can ship first: until the site deploys, the cookie is simply absent and the rule falls through to the country.

## 6 · Review round 1 (2026-10-15): fix for `review.md` finding 1 (flaky test)

**Cause** (CONFIRMED in `happy-dom@20.14.0` `CookieStringUtility.js` / `CookieExpireUtility.js`): `Max-Age=0` sets `expires = Date.now()`, and a cookie counts as expired only when `expires < Date.now()`. When the cleanup and the next read happened in the same millisecond, `muush_locale=` stayed in the jar. My earlier "init exit 0" depended on timing, as the reviewer said.

**Fix**
- New shared test helper `app/features/shell/logic/localePreference.testing.ts`, exporting `clearLocalePreferenceCookie()`.
  - It expires the cookie at the epoch (`Expires=Thu, 01 Jan 1970 00:00:00 GMT`) and builds the name from `LOCALE_PREFERENCE_COOKIE`.
  - It carries the single `biome-ignore` (the reason is test cleanup with no Cookie Store API in happy-dom).
  - Vitest does not collect it (only `*.test.ts` is), and no application code imports it.
- `LanguageToggle.test.ts`: the local `Max-Age=0` function is removed. The `beforeEach`/`afterEach` hooks of the feature 33 `describe` call the helper.
- `logic/localePreference.test.ts`: the inline cleanup is removed. The `rememberLocalePreference` `describe` now cleans up in `afterEach`, so cleanup also runs when an assertion fails.
- The assertion `expect(document.cookie).not.toContain('muush_locale')` in "should never record a preference when the toggle is only rendered" is **unchanged**.
- New deterministic regression test: "should leave no preference cookie when cleared within the same millisecond". It freezes the clock with fake timers, then writes, clears and reads. **Negative control:** with the helper switched back to `Max-Age=0`, it failed (1 failed / 7 passed). With the fix it passes. The helper was restored and verified afterwards.

**Runs**
- The two feature test files (`LanguageToggle.test.ts` and `logic/localePreference.test.ts`) were run in a loop **25 times: 25 passed, 0 failed** (25 tests each run).
- `./init.sh` was run **twice: exit 0 both times**, 95 files / **1342** tests each time (+1 regression test). Typecheck, check, generate and storybook:build passed both times.

`spec.md` was not touched (review finding 2 belongs to the leader). Status stays `in_progress`. No commits.
