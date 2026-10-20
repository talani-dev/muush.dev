# Review: feature 39 `not_found_locale`

**Reviewer**: reviewer agent · **Date**: 2026-10-19 · **Branch**: `feat/not-found-locale` (uncommitted)

## Verdict: APPROVED

No blocking findings. The non-blocking notes (N1–N5) can be handled now or as follow-ups.

## Protocol note (step 0)

`feature_list.json` still shows feature 39 as `in_progress`, not `reviewing`. The implementer's status change was blocked by the permission classifier (impl report § 4.4), and the leader told me in advance not to treat this as a defect. I ran the review anyway, at the leader's instruction. Before marking the feature `done`, the leader must move it to `in_progress` → `reviewing` → `done` so the harness history stays honest (C2).

## `./init.sh`

Exit code 0. typecheck, Biome, tests, `pnpm generate` and `pnpm storybook:build` all pass. Nitro prerendered both `/es/404` and `/en/404` (both `.output/public/{es,en}/404/index.html` exist).

## Acceptance criteria

| # | Criterion | Result | Evidence |
|---|---|---|---|
| 1 | Contract: 4-step rule, list cited not copied, verification table, Stage 1 safety net | PASS | edge-not-found.md § 4.2 (rule), § 4.2 "Country" + § 4.7 `${spanish_speaking_json}` (list referenced, no copy), § 7 L-1…L-19 / E-0 / V-1…V-13, § 2 + § 4.3 "Failure = Stage 1" + § 6.5 rollback |
| 2 | Contract resolves caching; says what reaches origin-response | PASS | § 4.5 (`private, no-store` + `error_caching_min_ttl = 0`; cache-key option rejected with reason), § 4.4 (`muush_locale` whitelisted in the `viewer_country` origin request policy, cache policy unchanged) |
| 3 | 404 without redirect, URL intact, noindex, no Set-Cookie, never IP | PASS | § 4.3, § 4.6, § 5, L-19, V-7, V-12 |
| 4 | es/404 at `/fr/abc` hydrates es; en/404 at `/es/abc` stays en | PASS | Headless Chrome (below). `notFoundLocale.ts` logic is unchanged, and its tests from feature 36 still pass |
| 5 | Toggle switches in place, writes cookie, no-JS href is real | PASS | Browser check plus `LanguageToggle.test.ts` (7 cases) and `switchLocaleInPlace.test.ts` |
| 6 | After switching: links, nav, footer, `<html lang>`, `<title>` follow | PASS | Browser check. The title getter is in `useNotFoundDocument.ts`. `lang` comes from the layout's `useLocaleHead()` |
| 7 | Toggle outside the 404 unchanged; existing tests intact | PASS | Diff: the `NuxtLink` branch is only reshaped (class moved into a constant), and the existing test blocks are untouched. Browser check on `/en/about` |
| 8 | typecheck / lint / test / generate pass; 404 prerenders exist | PASS | `./init.sh` |

## Contract claims checked against muush-foundation (read-only)

I read `modules/static-site/main.tf`, `variables.tf` and `functions/request-router.js`. Nothing was edited.

- CONFIRMED: the `viewer_country` origin request policy has `cookie_behavior = "none"` and whitelists only `CloudFront-Viewer-Country`.
- CONFIRMED: the HTML cache policy has `min_ttl = 0` and no cookie, header or query string in its key.
- CONFIRMED: `error_caching_min_ttl = var.error_caching_min_ttl_seconds`, with a default of 10.
- CONFIRMED: `html_default_ttl_seconds` defaults to 300.
- CONFIRMED: the immutable patterns are `/_nuxt/*`, `/_fonts/*` and `/_i18n/*`.
- CONFIRMED: the bucket uses SSE-S3 (AES256).
- CONFIRMED: the bucket policy has no `s3:ListBucket`, so a missing key returns 403.
- CONFIRMED: job 4 of `request-router.js` only appends `index.html` / `/index.html`, so the first path segment is preserved.
- CONFIRMED: job 1's canonical rule would 301 `/en/404/index.html`, which is why the contract rejects fetching the body through CloudFront.
- Every AWS-behaviour claim the contract cannot confirm from code is labelled INFERRED or UNVERIFIED. The biggest unknown is how `custom_error_response` and a function-generated 404 interact. The contract handles it correctly: it states the required outcome, gives a test (E-0), a fallback (keep only the 403 entry) and an escalation path.
- The rule order and parsing are correct:
  - The cookie must match exactly; the first occurrence wins; values like ` en` are not trimmed and are rejected.
  - The prefix is a case-sensitive segment match.
  - The country must match `^[A-Z]{2}$`.
  - The default is `en`.
  - The reference handler matches the rule, wraps everything in try/catch so a failure passes the origin response through, never logs anything, and never reads `clientIp`.

## Browser verification (my own run)

Setup:
- Headless Chrome driven over CDP, against `.output/public` from this branch's `pnpm generate`.
- A scratchpad Node server served existing objects with 200. For every missing HTML path it played a simplified Stage 2 edge: it picked the document by cookie, then prefix, then `en`, and answered with status 404 and `private, no-store`.
- A `window` marker detected reloads.

| Case | Observed |
|---|---|
| es/404 at `/fr/abc` (cookie es) | Before: `es-MX`, Spanish title and h1, toggle `ES→/en`, no console errors or warnings. Click: URL `/fr/abc`, marker kept (no reload), `en-US`, `Page not found · muush`, English h1, cookie `muush_locale=en`. 404, nav and footer links all `/en…` (`/en/about`). The toggle then reads `EN→/es`. A second click returns to Spanish (cookie `es`, still no reload). Reload: Spanish, chosen by the cookie. |
| en/404 at `/es/abc` (cookie en) | Before: stays `en-US` (served document wins). Click: `es-MX`, Spanish title and copy, links `/es…` (`/es/nosotros`), cookie `es`, same URL, no reload. |
| Scripting disabled, `/es/nada` | Toggle `ES→/en`, a real destination. |
| `/en/about` toggle (regression) | Navigates to `/es/nosotros` as before, `es-MX`, cookie `es`. |
| After an in-place switch to es, click nav `/es/nosotros` | Client-side navigation to `/es/nosotros`, `es-MX`, correct page. The not-found hydration state does not interfere. |

## Constitution / CHECKPOINTS

- C1: PASS.
- C2: one feature is active (39). Its status is still `in_progress`; see the step 0 note.
- C3: PASS on layering. `switchLocaleInPlace.ts` is pure, lives in `logic/`, and is injected with `useI18n` deps. The only new relative import is the same-directory `./switchLocaleInPlace`. No cross-feature imports. See N1 for component size.
- C4: PASS.
  - No colour or spacing literals: `TOGGLE_CLASS` uses only existing tokens.
  - No new breakpoints, aliases or server routes; `nitro.preset` untouched.
  - All touched components use `<script setup lang="ts">`.
  - No `console.*` or TODO in app code.
- C5: PASS. New logic has Vitest tests, and the new toggle mode has a Storybook story.
- C8: PASS. No copy changes, no new keys; the locale switcher still resolves through the route map off the 404.
- Article XI: no credentials anywhere in the diff.

## Non-blocking notes

- **N1 · component size.** `MobileMenu.vue` grows from 198 to 205 lines and now crosses the Article V / C3 limit of 200 lines. `SiteNav.vue` grows from 540 to 556, but it was already far over. Several other components were already over 200 before this feature, so this is a repo-wide pattern, not a regression introduced here. Trimming one doc comment in `MobileMenu.vue` would bring it back under.
- **N2 · untested glue.**
  - Not covered by any unit test: the `localeSwitchInPlace` signal in `useShellNavigation` and the `switchLocale` fallback (`window.location.assign(localeSwitchHref)` when messages fail to load).
  - Also uncovered: the title getter in `useNotFoundDocument`.
  - The browser run above covers the happy path, not the fallback. A small test of the `catch` path would make it durable.
- **N3 · request collapsing (contract).** § 4.5 rules out the cache. It does not mention CloudFront request collapsing: two simultaneous misses for the same path can share one origin fetch, and so one origin-response result. Whether CloudFront collapses requests when the response is `private, no-store` with a 0 error TTL is UNVERIFIED. The risk is negligible, since it needs concurrent visitors with different cookies on the same random missing URL. Still, a line in § 4.5 plus a concurrent variant of V-6 would close it explicitly.
- **N4 · single source of the country list.** CONFIRMED: today `SPANISH_SPEAKING` is a literal inside `request-router.js`, not rendered from a Terraform local. The contract's "same single source" request therefore also means refactoring `request-router` in muush-foundation. It is worth saying so explicitly in § 4.2 or § 6 so that cost is not discovered late.
- **N5 · open items carried by the implementer.** These stay with the leader and Roberto:
  - The feature 33 cookie-contract § 4 amendment (flagged in § 8 and not written; correct, because that needs G4-level approval).
  - E-0 is still unknown.
  - The mobile menu stays open after an in-place switch (a UX preference, not a defect).

No files outside this review were modified. muush-foundation was only read.

---

# Round 2

**Reviewer**: reviewer agent · **Date**: 2026-10-20 · **Branch**: `feat/not-found-locale` (uncommitted)
**Scope**: the four changes Roberto approved on 2026-10-20 (impl report "Round 2").

## Verdict: APPROVED

All four approved changes are present. There is no scope creep and `./init.sh` passes. One pre-existing focus defect was found (F1). It was not introduced by this round and does not block it.

## Step 0

CONFIRMED: `feature_list.json` id 39 has status `reviewing`.

## `./init.sh`

Exit 0. typecheck, Biome (`--error-on-warnings`), 98 test files / 1395 tests, `pnpm generate` and the Storybook build all pass. Both `.output/public/{es,en}/404/index.html` exist.

## The four approved changes

| # | Change | Result | Evidence |
|---|---|---|---|
| 1 | On the 404, the menu closes after an in-place ES/EN switch made from inside it, and nothing else changes | PASS | `SiteNav.vue`: `@switch-locale="switchLocaleFromMenu"` on `MobileMenu`, which emits and then calls the shared `close()` (this releases the scroll lock and triggers the existing `watch(isOpen)` focus return). The nav-row toggle still only re-emits. The event can only fire when `localeSwitchInPlace` is true (`Boolean(error.value)`), so pages other than the 404 cannot reach it. Off the 404, the in-menu toggle still navigates and does not close the menu, which is pre-existing behaviour and correctly left alone. Tests: `SiteNav.test.ts` "should close the open menu after switching in place from inside it" and "should close the menu only from the menu toggle, not from the nav-row toggle". |
| 2 | `MobileMenu.vue` under 200 lines, with no behaviour change | PASS | 199 lines. The diff against master shows that, apart from the feature 39 additions already reviewed in round 1 (prop, emit, two toggle bindings), only comments changed. Script logic and template markup are unchanged. |
| 3 | Unit tests for the `switchLocale` fallback and the title getter | PASS | `switchLocaleWithFallback` (pure, in `switchLocaleInPlace.ts`) is now what `useShellNavigation.switchLocale` calls, with the same `location.assign(localeSwitchHref)` fallback as round 1. `switchLocaleInPlace.test.ts` tests both outcomes: when loading succeeds the fallback is not called; when it fails the fallback is called once, the locale is unchanged and the promise does not reject. `notFoundSeoMeta(t)` is what `useNotFoundDocument` now passes to `useSeoMeta`. `useNotFoundDocument.test.ts` checks that the title is a function that re-resolves after a locale change, and checks robots. The one-line `localeSwitchInPlace` signal is still untested at unit level; it needs a Nuxt runtime. This is acceptable and stated in the report. |
| 4 | Cookie contract § 4 amended; in edge-not-found only the § 8 note changed | PASS | `locale-preference-cookie.md`: only the Reader line, the Status line, the first bullet of § 4 and a dated amendment note changed. § 1–§ 3 and the other two § 4 bullets are byte-identical (git diff). `edge-not-found.md`: **CONFIRMED byte-identical to round 1 except the last § 8 bullet**. I rebuilt the round-1 text from the round-1 reviewer's own read of the file (session transcript, 2026-10-20T04:31Z) and diffed it against the current file. The only difference is line 310 (the § 8 amendment bullet), plus a trailing newline. § 1–§ 7, including § 4–§ 7, are unchanged, so the muush-foundation session is implementing from text that has not moved. |

## Scope creep

None. Files modified after round 1:
- the nine files listed in impl R2.6;
- `feature_list.json` (status) and `docs/harness/progress/current.md` (leader/harness);
- the impl report.

There are no copy changes, no new dependencies and no new server routes. The only colours and tokens are those already reviewed in round 1. The only new import is the same-directory `./switchLocaleInPlace` in `useShellNavigation.ts`.

## Focus handling when the menu closes (code reading)

- In the new path, focus returns through the same mechanism as every other close (close button, Escape, choosing an item, breakpoint): `close()` sets `isOpen` to false, then `watch(isOpen)` calls `menuTrigger.value?.focus()`. The clicked toggle is inside the dialog, which unmounts, so there is no other focus target competing. On parity with the existing closes, this round is correct.
- **F1 (INFERRED, pre-existing, non-blocking; the change to fix it was not approved in this round).**
  - The hamburger (`menuTrigger`) is inside `.nav-row`, which is bound `:inert="isOpen"` in the same component (`SiteNav.vue` around line 256).
  - The focus-return `watch(isOpen, …)` uses Vue's default `flush: 'pre'`, so it runs *before* SiteNav re-renders, while the row still carries `inert`.
  - Per the HTML spec, an inert element is not focusable, so `focus()` should be a no-op in a real browser and focus would fall to `<body>`.
  - This applies to every close path and dates from the commit that added the mobile menu (`6d50ad8`), not from feature 39.
  - Happy-dom and jsdom do not enforce `inert`, and the implementer's headless run could not observe focus, which is why it was never caught.
  - Suggested follow-up, for a separate approval: `watch(isOpen, …, { flush: 'post' })` (or `nextTick`), plus a real-browser check of `document.activeElement` after closing.
  - UNVERIFIED in a browser.

## Notes carried from round 1

- N3 (request collapsing) and N4 (single source of the country list) are contract wording notes on § 4.5 and § 4.2/§ 6. They were correctly **not** applied, because § 4–§ 7 must stay frozen for muush-foundation. If wanted, they belong in a later, separately approved revision.
- E-0 is still UNVERIFIED and is muush-foundation's to test.

No files other than this review were modified. muush-foundation was not accessed this round.
