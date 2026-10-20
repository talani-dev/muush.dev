# Implementation report: feature 39 `not_found_locale`

**Agent**: implementer · **Date**: 2026-10-19 · **Branch**: `feat/not-found-locale` (nothing committed)
**Spec**: `feature_list.json` id 39, description and acceptance (`sdd: false`)
**`./init.sh`**: exit 0. typecheck, Biome, 97 test files / 1389 tests, `pnpm generate` (both `/es/404` and `/en/404` prerendered), Storybook build.

## 1 · Deliverable 1: the contract (docs only)

`specs/036-not-found-page/contracts/edge-not-found.md`: the header, § 1 table and Stage 1 TTL note were updated. §§ 4–8 were rewritten. Stage 1 (§ 2) is kept as the live safety net, and its Stage 1 verification table is kept in § 7.

- **§ 4.1 Mechanism.** Lambda@Edge origin-response on the default (HTML) behaviour only. It runs only for origin `403`/`404` on `GET`/`HEAD`. The immutable behaviours are untouched. The contract notes that the G-VII.6 exception is muush-foundation's to record.
- **§ 4.2 Rule.** The order is cookie `muush_locale` (exact `es`/`en`, first occurrence decides, parsing of the raw Lambda@Edge cookie header specified) > path segment `es`/`en` (case-sensitive; `/esx`, `/EN`, `/english` are not prefixes) > `CloudFront-Viewer-Country` in the feature 33 `SPANISH_SPEAKING` list > `en`. The list is **referenced, not copied**, and the contract asks that both functions be rendered from one Terraform source. It also notes that `request.uri` arrives after request-router's rewrite, which only appends (CONFIRMED by reading request-router.js).
- **§ 4.3 Response.** 404 in place, no `location`, `noindex` (meta tag and `x-robots-tag`), no `Set-Cookie`, no `vary`.
  - The body is read from the bucket with `s3:GetObject`, scoped to the two keys, and cached in memory for at most `html_default_ttl_seconds`. Bundling the HTML into the function was rejected because of stale hashed `/_nuxt/` assets.
  - Any failure passes the origin response through, so Stage 1 serves English.
  - Measured sizes: 19 095 B (es) and 19 013 B (en).
- **§ 4.4 What reaches the function.** CONFIRMED: `viewer_country` forwards only `CloudFront-Viewer-Country`, with `cookie_behavior = "none"`. Required change: whitelist the `muush_locale` cookie in that origin request policy. The HTML cache policy must not change.
- **§ 4.5 Caching.**
  - Generated responses carry `cache-control: private, no-store`. The HTML policy's `min_ttl = 0` is CONFIRMED.
  - `error_caching_min_ttl` must be `0` for 403 and 404. The module default is 10 (CONFIRMED); the live value is UNVERIFIED.
  - Putting the cookie and country in the cache key is rejected, with the reason stated.
  - The cost is stated: every missing HTML URL reaches S3 and runs the function.
  - **The ordering between `custom_error_response` and a function-generated 404 is UNVERIFIED.** The contract fixes the required outcome, adds a test (E-0) and gives a fallback (keep only the 403 entry). If that also fails, muush-foundation must come back to muush.dev.
- **§ 4.6 Privacy.** The function never reads `clientIp`, and has no `console.*` at all.
- **§ 4.7 Reference shape.** Illustrative Node handler plus the infrastructure it implies: us-east-1, a published version, a role with `s3:GetObject` on the two keys only.
- **§ 4.8 Site behaviour.** Describes what feature 39 already ships on the site side.
- **§ 7 Verification.** Function cases L-1…L-19 cover cookie vs prefix vs country, invalid cookies, non-prefixes, `GQ`/`US`, pass-through, `HEAD`, S3 failure and headers. Live checks are E-0 and V-1…V-13, including V-6, which alternates cookies on one URL to prove nothing is cached.
- **§ 8 Change control.** Flags that the feature 33 cookie contract § 4 has to be amended (open question 1).

muush-foundation was only **read** (`modules/static-site/main.tf`, `variables.tf`, `functions/request-router.js`). Nothing there was edited.

## 2 · Deliverable 2: the site

| File | Change |
|---|---|
| `app/features/shell/logic/switchLocaleInPlace.ts` (new) + `.test.ts` | Loads the target locale's messages, then assigns `locale`. It deliberately does **not** call `setLocale()`: in @nuxtjs/i18n 10 that call navigates, and on an unmatched path the resolver produces `/es/fr/abc` (read in `node_modules/@nuxtjs/i18n/dist/runtime/routing/navigation.js`). |
| `logic/useShellNavigation.ts` | `localeSwitchInPlace = Boolean(useError().value)`, the same signal `navCta` uses, so SSR and client agree. `switchLocale(target)` falls back to `location.assign(localeSwitchHref)` if the messages fail to load. |
| `ui/LanguageToggle.vue` | New `inPlace` prop and `switchInPlace` emit. The cookie is still written first, on every click. On a plain primary click in place it calls `preventDefault` and emits. Modified clicks are left to the browser. In place it renders a plain `<a>`, because RouterLink's own click handler runs before a fallthrough listener. Outside the 404 the `NuxtLink` branch is unchanged apart from moving its class string into a shared constant. |
| `ui/SiteNav.vue`, `ui/MobileMenu.vue`, `app/layouts/default.vue` | Thread `localeSwitchInPlace` down and `switchLocale` up. |
| `logic/useNotFoundDocument.ts` | The title is now a getter, so it follows the locale. |
| `logic/notFoundLocale.ts`, `data/localePreference.ts` | Comment updates only. |
| `ui/LanguageToggle.stories.ts` | New `InPlaceOnNotFound` story. |
| Tests | `LanguageToggle.test.ts` gets 7 in-place cases. `SiteNav.test.ts` gets 2 (both toggles forward; the navigating toggle never emits). `MobileMenu.test.ts` gets 1. All existing LanguageToggle and resolveLocaleDestination tests are unchanged and pass. |

No copy changes, no new dependencies, no server code.

## 3 · Browser verification

Setup: headless Chrome over CDP against `pnpm generate` → `.output/public`. A scratchpad server simulated the edge by serving `es/404` or `en/404` with status 404 at any missing URL. A `window` marker detected reloads.

| Case | Result |
|---|---|
| `es/404` at `/fr/abc` | Hydrates `es-MX` with Spanish copy, no console errors and no hydration warning. Toggle `ES→/en`. Click: same URL, same document (marker kept); now `en-US`, title `Page not found · muush`, English h1; 404 links, nav and footer all `/en…`; toggle `EN→/es`; cookie `muush_locale=en`. |
| `en/404` at `/es/abc` | Stays `en-US`. Click: `es-MX`, Spanish title and copy, every link `/es…`, cookie `muush_locale=es`, URL unchanged. |
| Toggle twice | Back to Spanish, cookie `es`, still the same document. |
| 390 px, toggle inside the open mobile menu | Switches in place. The menu stays open, now showing `ES`. |
| After switching, click "Volver al inicio" | Goes to `/es`. This is a full document load, but it is **pre-existing**: the same happens on the 404 without switching. |
| Scripting disabled | Toggle href is `/en` (the other home), and the page is complete. |
| Regression on `/en/about` | Toggle navigates to `/es/nosotros` as before; cookie written. |

## 4 · Open questions / for the leader

1. **Feature 33 cookie contract.** `specs/033-ip-locale-root-redirect/contracts/locale-preference-cookie.md` § 4 says the edge reads the cookie "only at `/`". Stage 2 widens that. I did not edit that contract because it was agreed by Roberto at G4. It is flagged in edge-not-found § 8.
2. **E-0 is a real unknown.** Nobody knows yet whether CloudFront re-applies `custom_error_response` over a function-generated 404. It must be tested in muush-foundation before production.
3. **Mobile menu stays open after an in-place switch.** If Roberto prefers it to close, it is a one-line change in the layout or SiteNav.
4. **Status not moved to `reviewing`.** I changed feature 39 from `pending` to `in_progress` at the start. A later batched command was denied by the permission classifier ("Modify Shared Resources"). That batch would have:
   - set the status to `reviewing`,
   - appended a log line to `docs/harness/progress/current.md`,
   - checked `git status` in muush-foundation (read-only).

   I could not tell which part was flagged, so I did none of the three. **feature_list.json still says `in_progress`.** The leader needs to set `reviewing` and add the progress log line.
5. `feature_list.json` was also reformatted by Biome. The leader's uncommitted entry had a multi-line `depends_on` that failed `pnpm check`.

---

# Round 2

**Agent**: implementer · **Date**: 2026-10-20 · **Branch**: `feat/not-found-locale` (nothing committed, per Roberto)
**Input**: the four changes Roberto approved on 2026-10-20, relayed by the leader, plus reviewer notes N1 and N2.
**`./init.sh`**: exit 0. typecheck, Biome, 98 test files / 1395 tests, `pnpm generate` (both 404 documents prerendered), Storybook build.

## R2.1 · The menu closes after an in-place switch made from inside it

- `ui/SiteNav.vue`: the open menu's `switchLocale` now goes to `switchLocaleFromMenu(target)`. That function forwards the request (`emit('switchLocale')`) and then calls the existing `close()` from `useMobileMenu`. Because it uses the normal close path, the scroll lock is released and the existing `watch(isOpen)` returns focus to the hamburger. A comment next to the function records the decision (Roberto, 2026-10-20).
- Nothing changed elsewhere:
  - The nav-row toggle still only re-emits.
  - `MobileMenu.vue` still only re-emits. The parent owns the close, the same pattern as `itemChosen`.
  - Off the 404, the toggle never emits `switchInPlace`, so this path cannot run there.
- Tests in `ui/SiteNav.test.ts`:
  - The existing "every toggle forwards" test is kept.
  - New: an in-place switch from the open menu emits `['en']`, the shared `isOpen` becomes `false`, and the dialog unmounts.
  - New: with the menu open, the nav-row toggle emits but does **not** close the menu. jsdom does not enforce `inert`, which is what makes this reachable in a unit test. The test proves the close is wired to the menu toggle only.

## R2.2 · `MobileMenu.vue` is back under 200 lines

205 → **199**. Only comments were condensed (the `localeSwitchLabel` and `label` prop docs, the close-button `cursor-pointer` note and the social-row note), and none of their references were dropped. The `switchLocale` emit doc now says the parent closes the panel. The script logic and the template markup are unchanged.

## R2.3 · Unit tests the reviewer flagged (N2)

The suite runs in happy-dom without a Nuxt app (`vitest.config.ts`), so I followed the repo's pure-core pattern (as in `useShellItemResolver`) rather than mocking auto-imports:

- `logic/switchLocaleInPlace.ts`: new `switchLocaleWithFallback(target, deps, fallback)`, a try/catch around `switchLocaleInPlace`. `useShellNavigation.switchLocale` now calls it, passing `() => window.location.assign(localeSwitchHref.value)` as the fallback. Behaviour is identical to round 1. Tests added to `switchLocaleInPlace.test.ts`:
  - success: the locale switches and the fallback is not called;
  - load failure: the fallback is called once, the locale is unchanged, and the promise resolves (it does not reject).
- `logic/useNotFoundDocument.ts`: new exported `notFoundSeoMeta(t)`, which returns `{ title: () => t(key), robots }`. `useNotFoundDocument` passes it to `useSeoMeta`. New `logic/useNotFoundDocument.test.ts`:
  - the title is a function and re-resolves after the locale changes;
  - robots is `NOT_FOUND_ROBOTS`.
- Still not unit-tested: the one-line `localeSwitchInPlace = Boolean(useError().value)` signal. Testing it needs a Nuxt runtime. The browser run below covers it (the toggle switches in place on the 404 and navigates on `/en/about`).

## R2.4 · Contracts

- `specs/033-ip-locale-root-redirect/contracts/locale-preference-cookie.md`:
  - **Reader** line: now names the not-found origin-response function as well as `request-router`.
  - **Status** line: records the amendment.
  - § 4 first bullet: the edge reads the cookie at `/` **and** on the not-found responses of `edge-not-found.md` § 4.
  - A dated amendment note (Roberto, 2026-10-20, feature 39) quotes the original G4 text and points to § 4.2, § 4.4 and § 4.5 of edge-not-found.
  - Everything else is unchanged, including § 1–§ 3 and the other two § 4 bullets.
- `specs/036-not-found-page/contracts/edge-not-found.md`: **only the last § 8 bullet** changed. It no longer says the amendment is "flagged … not yet written"; it now says the amendment is made, and that any further reader of the cookie is a change to the cookie contract. § 4–§ 7 were not touched, and the header and § 1 were not edited this round.

## R2.5 · Browser verification (headless Chrome over CDP, 390 × 844, mobile)

Setup:
- Served `.output/public` from this round's `pnpm generate`.
- A scratchpad Node server acted as a simplified Stage 2 edge: existing objects return 200; a missing path gets the cookie > prefix > `en` document with status 404 and `private, no-store`.
- A `window` marker detected reloads.

| Case | Observed |
|---|---|
| es/404 at `/fr/abc`, cookie `es` | Menu opened from the hamburger (dialog present, `body` `position: fixed`). Menu toggle `ES→/en` clicked. Result: **dialog gone, `body` position cleared**, URL still `/fr/abc`, no reload, `en-US`, `Page not found · muush`, English h1, main links `/en…` (`/en/about`), cookie `muush_locale=en`, toggle `EN→/es`, hamburger label `Open menu`. |
| en/404 at `/es/abc`, cookie `en` | Same flow in reverse. **Menu closed**, `es-MX`, Spanish title and h1, links `/es…` (`/es/nosotros`), cookie `es`, same URL, no reload. |
| `/en/about`, menu toggle (regression) | Navigates client-side to `/es/nosotros` (`es-MX`, cookie `es`), as before this round. |
| Console | No errors, warnings or exceptions across the run. |

**Not verifiable in this headless setup (UNVERIFIED in the browser):** where focus lands after the close. `document.activeElement` read `BODY` throughout, including right after the menu *opened*, when `MobileMenu` focuses its close control. This happened even with `Emulation.setFocusEmulationEnabled`, so the harness does not expose focus. The close uses the same `close()` and the same `watch(isOpen)` focus return as the close button.

**Observation (pre-existing, out of scope, not changed):** in the `/en/about` regression, the menu was still open after the navigating toggle took the visitor to `/es/nosotros`. That is how the navigating toggle inside the menu behaved before feature 39 too: neither `MobileMenu` nor `SiteNav` closes on it, and a client-side navigation does not fire `popstate`. Roberto's change 1 was scoped to the not-found page, so I left it alone. Flagging it in case the same treatment is wanted on every page. That would be a separate, explicit decision.

## R2.6 · Files touched this round

- `app/features/shell/ui/SiteNav.vue`, `app/features/shell/ui/SiteNav.test.ts`
- `app/features/shell/ui/MobileMenu.vue`
- `app/features/shell/logic/switchLocaleInPlace.ts`, `app/features/shell/logic/switchLocaleInPlace.test.ts`
- `app/features/shell/logic/useShellNavigation.ts`
- `app/features/shell/logic/useNotFoundDocument.ts`, `app/features/shell/logic/useNotFoundDocument.test.ts` (new)
- `specs/033-ip-locale-root-redirect/contracts/locale-preference-cookie.md`
- `specs/036-not-found-page/contracts/edge-not-found.md` (§ 8 only)

Things I did not do:
- No copy changes, no new dependencies, no commits. muush-foundation was not touched.
- `feature_list.json` is still at `reviewing`. `history.md` and `current.md` are untouched. Close-out waits for the leader's confirmation that the reviewer approved round 2.
