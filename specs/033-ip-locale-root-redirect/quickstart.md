# Quickstart: verifying feature 33

## 1 · This repository (implementer and reviewer)

```sh
./init.sh                      # check, typecheck, test, generate, storybook:build
```

Targeted checks:

```sh
pnpm vitest run app/features/shell/logic/localePreference.test.ts \
                app/features/shell/ui/LanguageToggle.test.ts \
                tests/locale-preference-output.test.ts
git diff master -- public/index.html nuxt.config.ts i18n/ package.json pnpm-lock.yaml   # must be empty (G3, no new dependency)
grep -rl muush_locale .output/public --include='*.html'      # must print nothing
grep -l  muush_locale .output/public/_nuxt/*.js              # at least one chunk (the toggle's)
```

The existing `tests/static-output.test.ts` already asserts that `/` reaches the Spanish home through `public/index.html`. It must stay green and unchanged (G3). Feature 37 changes it, on purpose.

Manual, with `pnpm generate && pnpm preview` (no new tool; `pnpm preview` serves the build with Nitro's preview, so a Secure cookie on `http://localhost` works in Chromium/Firefox):

1. Open `/es`, open DevTools → Application → Cookies: no `muush_locale`.
2. Click the toggle → you are on `/en`, and the cookie `muush_locale=en` exists with `Path=/`, `SameSite=Lax`, `Secure`, about one year of expiry, and no domain dot.
3. Click again → `muush_locale=es`.
4. Open `/es/nosotros#work` and click the toggle → `/en/about#work` (anchor behaviour unchanged) and the cookie is `en`.
5. ⌘/Ctrl-click the toggle → new tab and cookie updated. Middle-click → new tab, cookie unchanged.
6. Open `/` → the static `public/index.html` still sends you to `/es`. That is expected: no edge locally (G3).

## 2 · muush-foundation (Roberto)

`contracts/edge-root-locale-redirect.md` § 6 (rollout) and § 7 (TestFunction cases R-1..R-13, regressions N-1..N-7, live checks V-1..V-8).

## 3 · After feature 37

Re-run § 1. `public/index.html` will then name `/en`, and feature 37 updates the `/` assertion in `tests/static-output.test.ts`. The cookie tests of this feature do not change.
