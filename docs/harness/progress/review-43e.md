# Review 43e · feature 43 `m1_site_shell` · Reopen 4 (language switch keeps position)

**Verdict: APPROVED**

Scope: only reopen 4. That covers `feature_list.json` "REABIERTA 4" and acceptance item 5, spec FR-061, tasks T064–T066, and the implementer section "Reopened 4" in `impl_site_shell.md`. The status was `reviewing` before this review started (CONFIRMED). Reviews 43 through 43d cover the earlier work.

## Findings

### 1. Scroll capture and restore: correct (CONFIRMED)

- `app/features/shell/logic/localeSwitchScroll.ts:60-116`. The capture and resolve functions are pure. The snapshot records the innermost `main section[id]` that contains the reading line (`scroll-padding-top`) and how far through it the line is. It always carries the page ratio as a fallback. The restore is clamped to `[0, scrollRange]` and never uses absolute pixels.
- `localeSwitchScroll.ts:131-151`. `readScrollGeometry` uses only bounding rects (`-body.top`), so it reads correctly under the `body { position: fixed; top: -y }` lock in `useMobileMenu.ts:49-56`.
- `localeSwitchScroll.ts:173-193`. The hold is a single module slot. `take…` clears it on read, so it cannot leak. `isHeldFor` compares paths with any query, hash and trailing slash removed.
- `useLocaleSwitchScroll.ts:67-72`. `beforeEach` always takes the hold. It claims the hold only when `to.path` matches the held destination and differs from `from.path`. Only then does it set `to.meta.scrollToTop = false`, which is the per-location `meta`.
- `useLocaleSwitchScroll.ts:74-85`. `afterEach` always resets `pending`. It returns on a failure (cancelled, aborted or duplicated navigation) or when `fullPath` does not match. Before scrolling, it checks `currentRoute.fullPath` again, so a navigation that superseded this one wins.
- **Nuxt 4.5.2 interaction.** `node_modules/nuxt/dist/pages/runtime/router.options.js` returns `false` when `to.meta.scrollToTop === false` on a change of path, which is always the case for ES and EN. The restore waits for the same signal Nuxt waits for (`page:loading:end` plus a rAF). There is no custom `router.options.ts`.
- **Client-only.** `useLocaleSwitchScroll.ts:98` checks `import.meta.server`. The only caller is `useShellNavigation.ts:143`, which only `app/layouts/default.vue` uses, so it is installed once.
- **Reduced motion.** The restore uses `behavior: 'instant'` (`useLocaleSwitchScroll.ts:103`), which overrides `html { scroll-behavior: smooth }` (`global.css:1028-1032`). With reduced motion, `html` is not smooth at all.
- **Order.** The hold is taken synchronously in the click handler. Vue merges the NuxtLink handler and the fallthrough `onClick` into one native listener, and vue-router runs guards in promise microtasks, so the hold exists before `beforeEach`. The browser run below confirms this with real mouse events.

### 2. No regression in the language-switch contract (CONFIRMED)

- **Cookie.** `LanguageToggle.vue:140-144` calls `rememberLocalePreference(otherLocale)` first on every click, as before. In the feature-33 tests, every `remember` assertion is unchanged. In "record once when a hash is present", only the `location.assign('#work')` expectation was inverted. That is the deliberately superseded fragment behaviour.
- **404 in place.** `requestInPlaceSwitch` is unchanged, and the in-place branch never calls `keepPosition`. The feature-39 tests are unchanged in meaning. They gain a `takeHeld… === null` assertion. The `size-lang-circle` to `size-control` class change comes from the restyle in an earlier reopen, not from this one.
- **Route map.** `useShellNavigation.ts:145-150` still uses `switchLocalePath` with a `localePath({name:'index'})` fallback. `resolveLocaleDestination.ts:46` only strips a fragment. There is no prefix swap. The existing resolver tests are unchanged, and two were added (`resolveLocaleDestination.test.ts:91-103`).
- **No-JS href and hreflang.** The freshly generated `.output/public/es/index.html` contains `<a href="/en" hreflang="en" lang="en" aria-label="Cambiar a inglés">`. The `i18n-alt-*` and x-default links are present as before, and `tests/static-output.test.ts` passes.
- **Edited `LanguageToggle.test.ts` tests.** Four fragment or modifier tests now assert the hold or the absence of a hold, and no `assign`. Each change matches the superseded fragment behaviour. The modifier and secondary-button tests still assert that `assign` is not called, and they also assert that nothing is held. No assertion was weakened beyond the superseded clause.

### 3. Spec amendment (CONFIRMED)

- `specs/043-site-shell/spec.md:809-834`. FR-061 is new and unique. It explicitly supersedes User Story 2 scenario 2 and the "fragment preserved at click time" clause of FR-029.
- `tasks.md:194-200`. T064–T066 are `[x]`, and no task in the file is unchecked.

### 4. Constitution v2.1.2 (CONFIRMED)

- The logic is in `logic/`. There is a pure helper plus a composable, and `installLocaleSwitchScroll` can be faked for tests. The UI only calls `holdLocaleSwitchPosition`.
- There are no hex or px literals, and the selector is a named constant. There are no version markers.
- Both new files are added to the `tests/token-literals.test.ts` scan (lines 70-71).
- There is no new copy and no locale change. No relative import crosses directories (`./` stays within `logic/`).

### Advisories (non-blocking)

- A1. `resolveLocaleDestination.ts:17-22`. Doc point 2 still says the fragment "is read at click time and composed here". That contradicts point 3 and FR-061 and should be reworded.
- A2. `spec.md:113-114` (US2 scenario 2) and `spec.md:444-445` (FR-029) carry no inline "superseded by FR-061" marker. The earlier amendment at `spec.md:48` uses one. The supersession is explicit in the amendment, but readers of FR-029 alone will not see it.
- A3. `useLocaleSwitchScroll.ts:79-84` does not await `nuxtApp['~transitionPromise']` as Nuxt's own scroll does. This is harmless today because no page transition is configured, but the restore would run mid-transition if one were added.
- A4. The implementer's statement that the old `preserveAnchor` path never ran in the real app is INFERRED. It is plausible and does not affect the verdict.

## What I verified myself

- `./init.sh` exited 0. typecheck, check, test (135 files and 1954 tests), generate and storybook:build all passed. The log is at `/tmp/review43e_init.log`.
- I ran headless Chrome over CDP against the fresh `.output/public`, served by `python3 -m http.server` on 127.0.0.1:4191 with Chrome on port 9391. Clicks were real `Input.dispatchMouseEvent` clicks on the visible toggle. Both servers were stopped afterwards, and 0 processes remained.

| Run | Before | After |
|---|---|---|
| 1440, ES home, form at 0.3 | `/es/`, `diagnostico`@0.3, y 3049 | `/en`, `diagnostico`@0.3, y 3018 |
| 1440, ES home after a click on Servicios | `/es#servicios`, `diagnostico`@0.3, href `/en` | `/en` (no hash), `diagnostico`@0.3 |
| 390 mobile, ES home after `#servicios` | `/es#servicios`, `diagnostico`@0.3 | `/en` (no hash), `diagnostico`@0.3 |
| 1440, EN About, Work with muush at 0.4 | `/en/about/`, `trabaja-con-muush`@0.4 | `/es/nosotros`, `trabaja-con-muush`@0.4 |

I did not rerun these myself: the open-menu case, reduced motion, the 404 in-place switch, and the cookie value in the browser. For those I rely on the implementer's CDP evidence and on the unit tests, and the code paths above are consistent with them.

## Security

- No changes to `package.json`, `pnpm-lock.yaml`, `.claude/`, `.husky/` or `.github/`.
- The new files contain no new URLs, network calls, secrets or hooks. The only hook is Nuxt's internal `page:loading:end`.
- I found no text aimed at agents and no prompt-injection content in the reopen-4 files or the implementer report.
- The scope matches reopen 4. The resolver, the toggle, the two new logic files and their tests, the scan list, the spec, tasks and the progress doc changed.
- My probe scripts are outside the repo, in `/tmp/review43e/`. I edited no repo file other than this review.
