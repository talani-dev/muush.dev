# Review: feature 33 · `ip_locale_root_redirect`

**Reviewer**: reviewer agent · **Date**: 2026-10-15 · **Branch**: `feat/ip-locale-root-redirect` (uncommitted working tree)
**Precondition**: `feature_list.json` status = `reviewing` (CONFIRMED).

## Verdict: CHANGES_REQUESTED

The only blocker is that `./init.sh` exits 1, because a new test is flaky (finding 1). Everything else passes: the contracts match G1–G8, the cookie writer is correct, nothing from feature 37 leaked in, and the layering holds. Once finding 1 is fixed and `./init.sh` passes on several runs in a row, this should be approvable.

## Findings (ranked)

### 1. BLOCKER: a flaky test makes `./init.sh` exit 1 (C1, C5, FR-024, acceptance item 8)
- `app/features/shell/ui/LanguageToggle.test.ts:211`, `expect(document.cookie).not.toContain('muush_locale')`, fails with `Received: "muush_locale="`.
- CONFIRMED: `./init.sh` exited 1 (typecheck, check, generate and storybook passed; `pnpm test` gave 1 failed / 1340 passed). Running the two feature test files 3 more times gave 1 pass and 2 failures.
- Root cause, CONFIRMED in `node_modules/.pnpm/happy-dom@20.14.0/.../cookie/urilities/CookieStringUtility.js:42` and `CookieExpireUtility.js:12`: `Max-Age=0` becomes `expires = Date.now()`, and a cookie only counts as expired when `expires < Date.now()` (strict). If the cleanup and the read happen in the same millisecond, the cookie stays in the jar as `muush_locale=` with an empty value. The cleanup in `clearPreferenceCookie()` (`LanguageToggle.test.ts:149`) and in `logic/localePreference.test.ts:91` both use `Max-Age=0`.
- The implementer's report says init exited 0 with 1341 tests. That is not reproducible as a stable result: it depends on timing.
- Possible fixes (implementer's choice): expire with `Max-Age=-1` or an `Expires` date in the past, or assert `not.toMatch(/muush_locale=(es|en)/)`, or make the "only rendered" test rely on the spy alone. After the fix, run the suite several times.

### 2. MINOR: the spec body still uses pre-gate "proposed/recommended" wording
- `specs/033-ip-locale-root-redirect/spec.md:141` (FR-006), `:154` (FR-013), `:166` (FR-019) and `:170` (FR-020) still say "Proposed/Recommended". The gate section (`:235-246`) and the contracts have the final values, so nothing contradicts them, but the FRs should state the approved values (G2 `/en`, G4 365 days, G6, G3).

### 3. NOTE: the file-wide call-through mock (report deviation 4) is acceptable
- `LanguageToggle.test.ts:8-17` wraps `rememberLocalePreference` in `vi.fn(actual…)`. The 11 existing tests are unchanged and still check real behaviour (href, `location.assign`, labels), because the spy calls the real writer. Side effect: the existing click tests write to the real happy-dom cookie jar and never clean up. Only the new `describe` clears it, which is why finding 1 matters.

### 4. NOTE: the biome suppressions (report deviation 3) are acceptable
- `LanguageToggle.test.ts:148` and `logic/localePreference.test.ts:90`: `noDocumentCookie` is suppressed only in test cleanup, with a reason given. Production code writes through the injected `target.cookie` (`logic/localePreference.ts:31`), which is not flagged. Fix both cleanup lines together with finding 1.

## Focus points checked

1. **Cookie written only on explicit activation**. CONFIRMED:
   - The only writer is `LanguageToggle.vue:91-94` (`onToggleClick`, called from `@click`).
   - `grep` of `app/` shows no other `document.cookie`, `localStorage` or `muush_locale` use outside tests.
   - The shipped chunk `_nuxt/BH4yehhj.js` contains exactly `muush_locale=${e}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`: no Domain (host-only), no HttpOnly, value typed `'es'|'en'`, no PII.
   - No `.html` in `.output/public` mentions the cookie.
   - The link is still a real `<a href>` (NuxtLink), so it degrades without JS.
   - Browser checks for `auxclick`, no-JS behaviour and actual attributes: implementer CONFIRMED (headless Chrome); I did not re-run them.
2. **No feature 37 leakage**. CONFIRMED:
   - `git diff master` is empty for `public/`, `nuxt.config.ts`, `i18n/`, `app/pages`, `app/layouts`, `app/plugins`, `tests/` (existing files), `package.json`, `pnpm-lock.yaml` and `.storybook`.
   - `nuxt.config.ts:258,274` still has `defaultLocale: 'es'` and `rootRedirect: '/es'`.
   - Generated `x-default` is still `https://muush.dev/es`, and `index.html` is unchanged.
   - The sitemap has exactly /en, /es, /en/about and /es/nosotros; robots.txt is unchanged; `/es/404` and `/en/404` are present.
   - The claim that output is byte-identical apart from build ids is from the implementer's same-environment control. I did not rebuild `master`. INFERRED to hold, because the only template change is the `@click` handler, which renders no attribute.
3. **Edge contract matches G1–G8**. CONFIRMED (`contracts/edge-root-locale-redirect.md`):
   - The list has 21 codes, including GQ and excluding US (§ 3, and the reference array matches).
   - Unknown or malformed country goes to `en`, only an exact `/` with GET/HEAD is matched, and a valid cookie beats the country.
   - The response is 302 with `private, no-store`, no Vary, no set-cookie, and no user-agent rule.
   - The 301 is replaced in the same change (§ 6).
   - Test cases R-1..R-13, N-1..N-7 and V-1..V-8 cover the list, the default, the precedence, junk cookies, the query string and non-root paths.
   - Privacy (§ 4, § 8, V-8): it never reads `event.viewer.ip` and never logs or forwards the IP, country or cookie.
   - The contract asks nothing of this repo except the cookie writer.
4. **Deviations 3–4**: see findings 3 and 4.
5. **Architecture and hygiene**. CONFIRMED:
   - `data/localePreference.ts` imports only `data/types`; `logic/` imports only `data/`; `ui/` imports `logic/` through the `@/` alias, with no relative cross-directory imports.
   - The barrel is unchanged, which is appropriate because nothing outside shell uses the writer.
   - `LanguageToggle.vue` is 108 lines and its functions are small.
   - All new test names follow `should … when …`. The two exceptions (`:48`, `:85`) predate this feature.
   - No new dependencies, third parties, secrets, server routes, colours or i18n keys.

## Checkpoints
- C1: FAIL, because `./init.sh` exits 1 (finding 1). The other C1 items pass.
- C2: OK. Only feature 33 is active, in `reviewing`.
- C3: OK.
- C4: OK.
- C5: FAIL, because `pnpm test` is not reliably green. generate and storybook:build pass.
- C6: the leader's responsibility at close-out (history.md).
- C7: OK. tasks T001–T016 are `[x]`, plan gates are checked, there is no NEEDS CLARIFICATION, and every in-repo acceptance item (cookie, no third party, contract with cases, G3 fallback) has a test or a contract artefact. The edge-side items are the contract's responsibility (muush-foundation).
- C8: OK. No routes or keys changed.

The reviewer does not set `done`.

---

## Round 2 (2026-10-15)

**Precondition**: `feature_list.json` status = `reviewing` (CONFIRMED).

### Verdict: APPROVED

Both round-1 findings are fixed.

- **Finding 1 (flaky test): fixed. CONFIRMED.**
  - **The new helper:**
    - `app/features/shell/logic/localePreference.testing.ts` expires the cookie with an `Expires` date at the epoch instead of `Max-Age=0`.
    - It is used for cleanup in `LanguageToggle.test.ts` (`:149-157`, before and after each test) and in `logic/localePreference.test.ts` (in `afterEach`).
    - A new frozen-clock regression test, `localePreference.test.ts` "should leave no preference cookie when cleared within the same millisecond", makes the old failure deterministic.
  - **Runs:**
    - I ran the two test files 15 times in a loop: 15 passed, 0 failed (25/25 tests each run).
    - `./init.sh` exited 0, with 95 files and 1342 tests passing, and generate and storybook:build OK.
  - **The "rendering writes no cookie" assertion is intact.** `LanguageToggle.test.ts:206-207` still checks that the spy was never called and that `document.cookie` does not contain `muush_locale`.
- **The helper cannot leak into the app bundle. CONFIRMED.**
  - No application file imports it: a `grep` of `app/` for `localePreference.testing` outside `*.test.ts` finds nothing.
  - Vitest does not collect it, because its name does not end in `.test.ts`.
  - Neither `.output/public` nor `storybook-static` contains `clearLocalePreferenceCookie`, `01 Jan 1970` or `localePreference.testing`.
  - The only `muush_locale` string in the output is still the writer in the toggle chunk (`_nuxt/D_Y038gg.js`), with the contracted attributes. No `.html` file contains it.
  - Residual note: the helper lives in `logic/`. It could only reach the bundle if application code imported it, and nothing does today.
- **Finding 2 (pre-gate wording): fixed. CONFIRMED.** `spec.md` FR-006 (`:141`), FR-013 (`:154`), FR-019 (`:166`) and FR-020 (`:170`) now state the approved values from G2, G4, G6 and G3.
- **Nothing else changed in scope.** Feature 37 has still not leaked in, and the round-1 conclusions on the contract, the cookie, the architecture and the absence of dependencies or third parties still hold.

**Checkpoints:**
- C1–C5, C7 and C8 pass.
- C6 is the leader's job at close-out.

The reviewer does not set `done`.
