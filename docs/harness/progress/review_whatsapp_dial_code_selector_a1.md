# Review — feature 32 `whatsapp_dial_code_selector`, Amendment A1

APPROVED

Date: 2026-10-14. Scope: uncommitted tree on `feat/whatsapp-country-code`,
Amendment A1 (tasks.md Phase 9, T046–T067). Base feature 32 was already
approved in `review_whatsapp_dial_code_selector.md`.

## Gate checks

- Status before the review: `reviewing` (CONFIRMED). It is the only feature
  in `in_progress` or `reviewing`.
- `./init.sh` was run by the reviewer and exited 0: check, typecheck, 78 test
  files with 1120 tests passing, generate, and storybook:build (CONFIRMED).
- Phase 9 tasks T046–T067 are all `[x]`. The tasks still open in tasks.md
  are T036 and T044 (manual browser checks from the base feature) and TC01–TC07
  (option C, conditional and not chosen). They are unchanged since the base
  approval.
- plan.md: every A1 gate row is ticked except "Keeps muush-foundation
  G-VII.6". That row belongs to the other repo, and the leader listed it as a
  known non-defect.
- `nuxt.config.ts`, `package.json` and the lockfile are unchanged against
  master. There is no `server/` folder, and `nitro.preset` is still static
  (Art. IV).

## A1 behaviour, verified against the code and tests

| Requirement | Result | Evidence |
|---|---|---|
| Default Mexico (FR-A01) | CONFIRMED | `DEFAULT_COUNTRY` comes from the initial values. `useDefaultCountry.test.ts:34`, `ContactForm.test.ts:239`, `ApplicationForm.test.ts:304` |
| Only a valid alpha-2 code that is in the list is used (FR-A02/A03) | CONFIRMED | `countryOptions.ts` `toReportedCountry` (`/^[A-Z]{2}$/` + `isCountryCode`). Tested in `countryOptions.test.ts:9` |
| null, malformed, non-200, HTML, network error and the 3 s timeout all give Mexico | CONFIRMED | `edgeCountry.ts:35-62`: every path returns `undefined` and nothing throws. The abort also covers `json()`. `edgeCountry.test.ts:29-83` |
| No console output, no visible error | CONFIRMED | No `console.` in edgeCountry, useDefaultCountry or countryOptions. A rejecting stub is swallowed (`useDefaultCountry.ts`, `.then(applyReported, () => undefined)`) |
| Same origin, no credentials, bare GET | CONFIRMED | The relative path is `'/__geo'` with `credentials: 'omit'`, `cache: 'no-store'`, no headers and no body (`edgeCountry.test.ts:85`). The static output asserts that `/__geo` is a quoted relative literal |
| Requested once, and only on first focusin or the switch to WhatsApp (FR-A08, SC-A04) | CONFIRMED | `useContactForm.ts:139-163`, `useApplicationForm.ts:193-217`, `@focusin="onEngage"` in `ContactForm.vue:83` and `ApplicationForm.vue:99`. Memoized in `createEdgeCountryLookup` and guarded by `requested`. Tested in `useDefaultCountry.test.ts:114,129` and `edgeCountry.test.ts:104,114` |
| A late answer never overwrites a pick (FR-A07) | CONFIRMED | `picked` is set only in `onWhatsappCountryChange`. Tested both ways round in `useDefaultCountry.test.ts:88,101`, `useContactForm.test.ts:532`, `useApplicationForm.test.ts:810` |
| Typing a number is not a pick | CONFIRMED | `useContactForm.test.ts:556`, `useApplicationForm.test.ts:834` |
| Browser language not used (FR-A04) | CONFIRMED | No `navigator.languages`, `readLanguages`, `detectDefaultCountry`, `readBrowserLanguages` or `regionOf` in `app/`. `useContactForm.test.ts:492` stubs `en-US` and still gets MX |
| No Geolocation API, nothing stored, no third-party request (FR-A05/A06/A09) | CONFIRMED | Checked in `static-output.test.ts` (A1 describe). No storage or cookie API in `forms/logic` outside tests. The host check found no geo or IP host |
| `fetch` only in `logic/` (Art. V, FR-A10) | CONFIRMED | `fetch(` appears only in `forms/logic/formsApiClient.ts:143` and `forms/logic/edgeCountry.ts:36`. Tests check that `ui/` never fetches (`ContactForm.test.ts:434`, `ApplicationForm.test.ts:467`) |
| Works without the edge in dev, preview, Storybook and tests (FR-A11) | CONFIRMED (code and tests), UNVERIFIED (browser) | A port without `lookupCountry` means no request. The 404 HTML and JSON cases are tested. The browser-only parts of T066 are a known non-defect |
| No new copy (FR-A12) | CONFIRMED | A1 adds no locale keys, and i18n parity passes |

## Race conditions

- **Answer after unmount.** The promise writes into the component's orphaned
  `values` ref. It cannot throw or reach the DOM, so the effect is harmless.
  The request is not aborted on unmount, which is acceptable because it is a
  single small GET with a 3 s cap. There is no dedicated test (INFERRED safe
  from the code).
- **Two forms on one page.** This cannot happen today:
  `pages/index.vue:45` creates one contact submitter and
  `pages/nosotros.vue:37` creates one application submitter. If both forms
  ever share a page, each submitter memoizes its own lookup, so that page
  would make two requests. Non-blocking.
- **Client-side navigation.** Going from `/` to `/nosotros` and back without
  a reload creates a new submitter on each page view, so a session can make
  one request per form page view rather than one per hard load. This matches
  plan D-14 ("once per port") and the "per page view" row in research R13.
  It is a stricter reading of FR-A08 than the code meets, but it is
  non-blocking. To make it strict, memoize the lookup at module level in
  `edgeCountry.ts`.

## Base feature 32: no regression

Payload and validation behaviour is unchanged:
- `whatsappDialCode` is sent only with WhatsApp.
- The number must be 6–14 digits and is sent without the dial code.
- A `whatsappDialCode` server mark lands on the selector.

The suites `submissionPayloads.test.ts`, `submissionFlows.test.ts`,
`serverFieldErrors.test.ts`, `useContactForm.test.ts` and
`useApplicationForm.test.ts` (dial-code mark at :359 and :584) and the ui
tests (:280 and :323 contact, :345 and :388 application) all pass. A1 changed
no `.vue` files, because the composable return shapes are unchanged.

## Implementer deviations

1. **`tests/forms-config.test.ts` now allows exactly two fetch files.**
   ACCEPTED. The assertion is still an exact `toEqual` on a sorted list, so a
   third call site still fails it. This is the minimal change that
   data-model § 8.2 requires.
2. **T061 `navigator.languages` assertion scoped to the `/__geo` chunk.**
   ACCEPTED, non-blocking. The reviewer CONFIRMED the following:
   - `nuxt.config.ts:130` sets `detectBrowserLanguage: false`.
   - That setting is identical on master and dates from a5950f0 (the Nuxt
     migration).
   - The only emitted reference is the `@nuxtjs/i18n` runtime's
     navigator-detector helper (`.output/public/_nuxt/B8-MOLcc.js`).
   - The forms chunk (`BBESmzyH.js`) does not reference it.

   With detection disabled the helper is dead code (INFERRED from the
   config), so it does not conflict with `ui-map.md` § 1, and this branch did
   not introduce it. Recommendation: keep the scoped assertion. Optionally,
   add a separate guard test that `i18n.detectBrowserLanguage === false` in
   `nuxt.config.ts`, so that `ui-map.md` § 1 is enforced by config rather
   than by grepping chunks.

## Checkpoints C1–C8

- C1, C2, C5, C7 and C8: green. C7 has only the known non-defect G-VII.6 row
  open.
- C3: the new logic files are small and plain Vue. The `data/` → `logic/`
  direction is respected.
- C4: no colors, no relative imports across directories, no server route,
  and no debug prints.
- C6: history and current.md were updated by the implementer, and the status
  is coherent.

## Open items for humans, not defects of A1

- OA-1: docs, owned by Roberto.
- OA-10: visual values.
- G-VII.6: muush-foundation.
- Browser-only steps of T066: the Network panel, the `/__geo` override, and
  the Slow 3G "pick Peru first" check.
- OA-2: the backend must be deployed before this front.
