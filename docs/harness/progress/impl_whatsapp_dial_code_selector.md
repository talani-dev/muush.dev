# Implementation report — feature 32 `whatsapp_dial_code_selector`

**Date**: 2026-10-14 · **Agent**: implementer · **Branch**: `feat/whatsapp-country-code`
**Spec package**: `specs/032-whatsapp-dial-code-selector/` (approved with the
baseline proposals OA-3..OA-9; OA-6 C appendix not implemented).
Status left at `in_progress`. Nothing committed.

## Result

- `./init.sh` exit 0: typecheck, `pnpm check`, tests (76 files / 1072
  tests, up from 73 / 965), `pnpm generate`, `pnpm storybook:build`.
- `.output/public` lists the same 16 `http(s)://` origins as before the
  feature (CONFIRMED by diff), so no new third-party origin.
- `wc -l app/features/forms/ui/*.vue`: max is `ApplicationForm.vue` at 199.
  `DialCodeSelect` 103, `WhatsappField` 125, `TextField` 82, `ContactForm` 175.
- No new npm dependency. No `docs/business/` edits.

## What was built

| Area | Files |
|---|---|
| Data set (245 rows, `DEFAULT_COUNTRY`, `DIAL_CODE_PATTERN`, `CountryOption`) | `app/features/forms/data/countries.ts` (+ `.test.ts`) |
| Detection / flags / dial code / localized sorted options | `app/features/forms/logic/countryOptions.ts` (+ `.test.ts`) |
| Field model: `whatsappCountry` id/value/order/content, 6–14 constants | `data/contactFields.ts`, `data/applicationFields.ts` |
| Payload type `whatsappDialCode?` | `data/submissionContract.ts` |
| Payload builder emits `whatsappDialCode` before `whatsapp` | `logic/submissionPayloads.ts` |
| Server alias `whatsappDialCode → whatsappCountry`, WhatsApp-only guard | `logic/serverFieldErrors.ts` |
| 6–14 rule, detection on the first switch, `onWhatsappCountryChange`, injectable `readLanguages` | `logic/useContactForm.ts`, `logic/useApplicationForm.ts` |
| Content: label, errorInvalid, options from `Intl.DisplayNames` in the locale's `language` | `logic/useContactFormContent.ts`, `logic/useApplicationFormContent.ts` |
| UI | `ui/DialCodeSelect.vue` (new), `ui/TextField.vue` (slots), `ui/WhatsappField.vue`, `ui/ContactForm.vue`, `ui/ApplicationForm.vue` |
| Copy (OA-8) | `i18n/locales/es.json`, `i18n/locales/en.json` |

## Tests added / updated

- Data set: count, uniqueness, regex, MX→+52, shared codes, a real name for
  every code in `es-MX` and `en`.
- Detection: `en-US`→US, `es,es-CO`→CO, `es`/`es-419`/`en-ZZ`/malformed/`[]`→MX;
  `readBrowserLanguages` with stubbed and missing `navigator`; flag emoji;
  `dialCodeOf` throw; ES/EN options sorted by collation, Åland before Zambia,
  code fallback when the browser has no name.
- Validation 5/15 rejected, 6/14/"(55) 4433-2211" accepted, separators ignored.
- Composables: default per language list, no read before the switch, picked
  country kept across email↔WhatsApp with the number emptied, `fetch` spy
  not called during detection, picked country reaches the submitter.
- Payloads: `MX/CO/CA` → `+52/+57/+1`, exact key order, absent with email,
  throw on an unknown code (both endpoints).
- Flows over a **mocked `fetch`** (real `createFormsApiClient`): `/contact`
  and `/careers` bodies carry `whatsappDialCode`; with email neither key; a 400
  `validation_failed` naming `whatsappDialCode` → `field-errors
  ['whatsappCountry']`; same with preference email → generic failure.
- Server marks: alias, guard, clear on country change, number mark survives a
  country change, selector ordered before the number.
- Components: `DialCodeSelect` (options text, face, emit, aria-label,
  aria-invalid/describedby, disabled, face after select for the focus rule),
  `WhatsappField` (DOM order, no positive tabindex, both errors in order,
  readonly), `TextField` (slot order, label target, no row without slot),
  both forms (selector before number, CO reaches submitter, length message,
  country kept, server mark focuses `#whatsappCountry` and clears on change).
- Exact copy for the new and changed strings in `tests/forms-copy.test.ts`
  and `tests/forms-application-copy.test.ts`.
- Stories: `DialCodeSelect.stories.ts` (Default, English, Colombia,
  WithError, Readonly), `WhatsappField.stories.ts` (Spanish, English,
  BothErrors); form/section fixtures updated.

## Deviations from the plan

1. **Hidden server mark on the country (bug the plan did not cover).** The
   country survives a switch to email (OA-9), so a `whatsappCountry` server
   mark would stay active on a hidden field and block every later submit.
   `activeServerErrors` now ignores WhatsApp-only marks while the preference
   is email (comment in `serverFieldErrors.ts`, test added).
2. **`TextField` has a second slot, `leading-error`.** The contract asks for
   the country error "under the row, before the number error". The number
   error is rendered inside `TextField`, so the only way to get that order
   was a second slot. Without the slots the wrapper is `display: contents`, so
   the layout is the same as before. The DOM gains one wrapper `div`.
3. **Focus ring of the selector is a scoped CSS rule**
   (`.dial-select:focus-visible + .dial-face { outline: auto; outline-color:
   var(--color-red-400) }`). The select must be `opacity: 0` because color
   emoji ignore `color: transparent`, and Tailwind v4 has no
   `outline-style: auto` utility. Uses the existing token, no literal.
4. **`ApplicationForm.vue` line budget.** Wiring took it to 202. I dropped the
   one-line `lg:` comment (the plan's listed fallback), shortened the
   `errorFor` doc comment to one line, and removed the blank line before the
   submit button. Now 199. I did not move `submitLabel` into the composable:
   it depends on the `previewState` prop.
5. **T018:** no change was needed. `submissionFlows.test.ts` and
   `fieldErrorMessage.test.ts` build values from the initial-value factories.
   New flow tests were added to the first file anyway (above).
6. Landing/about fixtures use a 3-entry literal options list.
   `buildCountryOptions` is not exported from the forms barrel (Art. III).

## Not done

- **T036**: manual VoiceOver/keyboard pass. **T044**: manual quickstart steps
  1–7 in `pnpm dev`, plus Windows flag rendering. A subagent has no browser
  or screen reader. Both need a human run, recorded in `current.md`.
- Appendix A (OA-6 C): not selected at the gate.

## Visual values (OA-10): UNVERIFIED

Everything visual reuses existing classes and tokens from `TextField`/`SelectField`:
`rounded-control`, `border-glass-line`/`border-red-400`, `bg-glass-bone`,
`px-field-x`, `py-field-y`, `text-input-value`, `text-ink-100`,
`text-bone-300` chevron at `--spacing-field-icon`, and `gap-field-label-gap`
both as the row gap and as the gap between dial code and chevron. Layout is
one row at every width. None of it is checked against the `.pen`. The leader
should compare it with the design. `--spacing-contact-whatsapp-h` (the
transition's max height) was not changed. It holds one control row, which
still fits.

## Data check

I spot-checked every dial code in the 245 rows against my own knowledge of
the E.164 assignments, shared codes (R5) included, and found no mismatch.
This is INFERRED, not checked against the ITU list in this session. The
reviewer should sample it.

## For the leader / a human (not acted on)

- OA-1: `form-api-contract.md` § 3/§ 5 and `ui-map.md` § 7 still describe
  the 10-digit rule. Only a human may rewrite them.
- OA-2: do not deploy before the backend accepts `whatsappDialCode`.
- The `outline: auto` ring color on the face should be eyeballed in Safari
  and Firefox (Chrome honours `outline-color` with `auto`).

---

# Amendment A1 (2026-10-14): default country from `GET /__geo`

Tasks T046–T067 (tasks.md Phase 9) are checked off. `./init.sh` was green
before the first edit (76 files, 1072 tests) and is green at the end
(78 files, 1120 tests; check, typecheck, generate and storybook:build OK).

## What changed

- `app/features/forms/data/submissionContract.ts`: both submitter ports
  gain the optional `lookupCountry?: () => Promise<string | undefined>`.
- `app/features/forms/logic/edgeCountry.ts` (new): `EDGE_COUNTRY_PATH`,
  `EDGE_COUNTRY_TIMEOUT_MS`, `fetchEdgeCountry` and
  `createEdgeCountryLookup`. It sends one relative GET with
  `credentials: 'omit'` and `cache: 'no-store'`, aborts after 3000 ms, never
  throws, and narrows the `unknown` body.
- `app/features/forms/logic/countryOptions.ts`: `detectDefaultCountry`,
  `readBrowserLanguages` and `regionOf` are deleted. `toReportedCountry` is
  added and checks the alpha-2 shape and list membership.
- `app/features/forms/logic/useDefaultCountry.ts` (new): one copy of the
  rule, shared by both forms. It looks up at most once, applies the answer
  only while the visitor has not picked, and treats a pick as permanent.
  Typing a number does not count as a pick.
- `app/features/forms/logic/useContactForm.ts` and `useApplicationForm.ts`:
  the `readLanguages` option and the local `countryPicked` are gone. Both
  now use `useDefaultCountry`. `onEngage` (first `focusin`) and the switch
  to WhatsApp each request the default. The return shapes are unchanged,
  so no `.vue` file changed.
- `app/features/forms/logic/useFormSubmission.ts`: each page submitter gets
  `lookupCountry: createEdgeCountryLookup()`.
- `app/features/forms/data/countries.ts`: only the comment on
  `DEFAULT_COUNTRY` changed.
- Tests: `edgeCountry.test.ts` and `useDefaultCountry.test.ts` are new.
  `countryOptions.test.ts` and the default-country suites in
  `useContactForm.test.ts` and `useApplicationForm.test.ts` were replaced
  (A1-1 and A1-3). `ContactForm.test.ts` and `ApplicationForm.test.ts` gain
  no-edge tests (Mexico, `fetch` never called) and port-answers-CO tests.
  `tests/static-output.test.ts` gains a new A1 `describe`.
- Stories: `ReportedCountryColombia` in `ContactForm.stories.ts` and
  `ApplicationForm.stories.ts`.

## Deviations from tasks.md

1. **`tests/forms-config.test.ts` was edited, which is outside the Phase 9
   scope guard.** Its guard "fetch( only in formsApiClient.ts" failed as
   soon as `edgeCountry.ts` existed, as data-model § 8.2 requires. I
   widened it to exactly two files: `formsApiClient.ts` and
   `edgeCountry.ts`. It still fails if a third call site appears. In the
   same spirit, the existing static-output test "exactly one fetch( in the
   form chunk(s)" now expects exactly two.
2. **T061, "no emitted JS contains `navigator.languages`".** This cannot
   hold for every script. The `@nuxtjs/i18n` entry chunk ships its own
   browser-language helper (CONFIRMED in `.output/public/_nuxt`); it
   predates A1 and is not forms code. The assertion is therefore scoped to
   the chunk(s) holding `/__geo`. `navigator.geolocation` and
   `getCurrentPosition` are asserted absent from every emitted script. The
   origin check asserts that no host in any emitted script contains
   `geo`/`ip`, and that `/__geo` is a quoted relative literal. I recorded
   this in plan.md next to the ticked row. *Whether that i18n helper ever
   runs (browser-language detection must be off per `ui-map.md` § 1) is
   outside this feature and was not investigated. It is UNVERIFIED here and
   the leader may want to check it.*
3. Quickstart A1 step 1 expects the `pnpm dev` response to `/__geo` to be a
   "404, HTML". It is actually **404 `application/json`** (Nuxt's dev error
   JSON). The site's behaviour is the same, since a non-2xx response means
   Mexico.

## T066: quickstart A1 walk

- CONFIRMED: `pnpm dev` returns `GET /__geo` → 404 (JSON error body).
- CONFIRMED: a static server over `.output/public` returns `/__geo` → 404
  (`text/html`).
- CONFIRMED by tests, with no browser involved: both answers resolve to
  Mexico (`edgeCountry.test.ts`, 404 and HTML cases); no lookup happens
  before interaction; at most one lookup per page; browser language is
  ignored; a pick is never overwritten.
- CONFIRMED: `grep -l __geo .output/public/_nuxt/*.js` finds the form chunk
  and only that chunk. That chunk has no `navigator.languages` and no
  geolocation.
- UNVERIFIED (a subagent has no browser): the Network-panel steps 1–6, the
  DevTools override of `/__geo` → `{"country":"CO"}`, and the Slow-3G
  "pick Peru first" check. These need a human run.

## For the leader / a human (not acted on)

- OA-1 is still open. `form-api-contract.md` § 3/§ 5 and `ui-map.md` § 7
  (including "default México", which A1 changes to "país de la IP vía
  `GET /__geo`; México si no se conoce") are human-only edits.
- OA-10 (visual values) is still open.
- `contracts/edge-geo-endpoint.md` is ready to hand to muush-foundation.
  Nothing in that repo was touched.
- IP-6: there is no deploy order between the two repos. The site works
  (Mexico) with or without the edge piece. OA-2's backend-first order for
  `whatsappDialCode` still holds.
- plan.md row "Keeps muush-foundation G-VII.6" stays unticked. Only
  muush-foundation can verify it.
