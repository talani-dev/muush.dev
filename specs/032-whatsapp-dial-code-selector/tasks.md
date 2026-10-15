# Tasks: Dial-code selector before the WhatsApp number

**Input**: `specs/032-whatsapp-dial-code-selector/` — spec.md, plan.md, research.md, data-model.md, contracts/, quickstart.md
**Prerequisites**: human gate passed (spec OA-1..OA-10 answered). If the gate changes OA-3, OA-5, OA-6, OA-8 or OA-10, adjust the tasks named in each row before starting.
**Tests**: required (acceptance item 11 and Constitution X). Names follow `should <expected> when <condition>`.
**Do not deploy** before the backend accepts `whatsappDialCode` (spec OA-2).

All paths are relative to the repo root. `forms/` = `app/features/forms/`.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

- [x] T001 Run `./init.sh` and `wc -l forms/ui/*.vue`; record the baseline (expected `ApplicationForm.vue` 199) in `docs/harness/progress/current.md`

---

## Phase 2: Foundational (blocks every story)

- [x] T002 [P] Create `forms/data/countries.ts`: `CountryCode`, `CountryEntry`, `CountryOption` (`{ code, name, dialCode, flag }`), `COUNTRIES` (the 245 rows of data-model § 1, in code order, one `{ code, dialCode }` per row), `DEFAULT_COUNTRY = 'MX'`, `DIAL_CODE_PATTERN = /^\+[1-9]\d{0,3}$/`, `isCountryCode(value: string): value is CountryCode`. Header comment: source (ITU-T E.164 + libphonenumber region set, authoring-time only), shared codes (research R5), why names/flags are not stored. Imports nothing
- [x] T003 [P] Create `forms/data/countries.test.ts`: 245 entries; unique codes; every dialCode matches `DIAL_CODE_PATTERN`; `DEFAULT_COUNTRY` present with `+52`; every code has a non-code name from `new Intl.DisplayNames(['es-MX'], { type: 'region', fallback: 'none' })` and from `['en']`; spot values `US +1`, `CA +1`, `CO +57`, `ES +34`, `GB +44`, `KZ +7`, `XK +383`
- [x] T004 Create `forms/logic/countryOptions.ts` per data-model § 3: `detectDefaultCountry(languages)` (walk in order, `new Intl.Locale(tag).region` inside `try`, accept only `/^[A-Z]{2}$/` regions that pass `isCountryCode`, else `DEFAULT_COUNTRY`); `readBrowserLanguages()` (`typeof navigator === 'undefined' ? [] : navigator.languages`); `flagEmoji(code)` with a named `REGIONAL_INDICATOR_A = 0x1f1e6` constant; `dialCodeOf(code)` (throws on unknown); `buildCountryOptions(displayLocale)` (names via `Intl.DisplayNames` `fallback: 'none'` → code when undefined; sorted with `new Intl.Collator(displayLocale).compare`). Depends on T002
- [x] T005 Create `forms/logic/countryOptions.test.ts`: detection — `['en-US']`→US, `['es','es-CO']`→CO, `['es']`→MX, `['es-419']`→MX, `['en-ZZ']`→MX (unlisted), `['not a tag!']`→MX (malformed), `[]`→MX; `flagEmoji('MX') === '🇲🇽'`; `dialCodeOf('CO') === '+57'` and throws for `'QQ'`; `buildCountryOptions('es-MX')` has 245 entries, `MX` named "México", first entry "Afganistán", sorted per `Intl.Collator('es-MX')`; `buildCountryOptions('en')` names `MX` "Mexico"; `readBrowserLanguages` returns the stubbed `navigator.languages` (use `vi.stubGlobal`). Depends on T004
- [x] T006 Update `forms/data/contactFields.ts`: add `'whatsappCountry'` to `ContactFieldId` and to `CONTACT_FIELD_ORDER` before `'whatsapp'`; add `whatsappCountry: CountryCode` to `ContactFormValues` between `contactPreference` and `whatsapp`, initial `DEFAULT_COUNTRY`; delete `WHATSAPP_MX_DIGIT_COUNT` and its comment, add `WHATSAPP_MIN_DIGITS = 6`, `WHATSAPP_MAX_DIGITS = 14` with a comment citing the 2026-10-14 backend agreement (feature 32) superseding `form-api-contract.md` § 3; add `errorInvalid?: string` to `ContactFormFieldContent`; add `whatsappCountry: { label: string; errorInvalid: string; options: CountryOption[] }` to `ContactFormContent.fields`. Depends on T002
- [x] T007 Update `forms/data/applicationFields.ts` with the same changes as T006 (`ApplicationFieldId`, `APPLICATION_FIELD_ORDER`, `ApplicationFormValues`, initial value, `ApplicationFormFieldContent.errorInvalid`, `ApplicationFormContent.fields.whatsappCountry`); replace the `WHATSAPP_MX_DIGIT_COUNT` re-export with `WHATSAPP_MIN_DIGITS`/`WHATSAPP_MAX_DIGITS` and rewrite its comment. Depends on T006
- [x] T008 [P] Update `forms/data/submissionContract.ts`: add `whatsappDialCode?: string` before `whatsapp?` in `ContactPayload` and `CareersPayload`; doc comment: present only with WhatsApp, format `DIAL_CODE_PATTERN`, server rejects unknown keys → deploy order (spec OA-2)
- [x] T009 Add i18n keys in `i18n/locales/es.json` and `i18n/locales/en.json` under both `forms.contact.fields` and `forms.application.fields`: `whatsappCountry.label` ("Lada del país" / "Country code"), `whatsappCountry.errorInvalid` ("Elige la lada de tu país" / "Choose your country code"); change `whatsapp.errorDigits` to "Deben ser entre 6 y 14 dígitos" / "Must be 6 to 14 digits" (data-model § 7, spec OA-8)
- [x] T010 Update `forms/logic/useContactFormContent.ts` and `forms/logic/useApplicationFormContent.ts`: read `locale`/`locales` from `useI18n()`, resolve the display tag from the locale's `language` (`es-MX`/`en`, fallback to the code), add `fields.whatsappCountry = { label, errorInvalid, options: buildCountryOptions(tag) }`. Depends on T004, T006, T007, T009

**Checkpoint**: `pnpm typecheck` lists only the call sites the next phases fix; T003/T005 green.

---

## Phase 3: User Story 3 — The number rule fits any country (P1)

**Goal**: 6–14 digits without dial code on both forms. **Independent test**: validators accept 6 and 14, reject 5 and 15.

- [x] T011 [P] [US3] In `forms/logic/useContactForm.ts` replace the 10-digit check with `digits.length < WHATSAPP_MIN_DIGITS || digits.length > WHATSAPP_MAX_DIGITS` → `errorDigits`; keep `errorRequired` for 0 digits
- [x] T012 [P] [US3] Same change in `forms/logic/useApplicationForm.ts`
- [x] T013 [P] [US3] Update `forms/logic/useContactForm.test.ts`: replace every 10-digit assertion; add cases 0 (required), 5, 6, 14, 15 digits and "(55) 4433-2211" valid; preference email ignores the number
- [x] T014 [P] [US3] Same cases in `forms/logic/useApplicationForm.test.ts`
- [x] T015 [P] [US3] Update `tests/forms-copy.test.ts` and `tests/forms-application-copy.test.ts`: exact `errorDigits` strings (ES/EN), plus exact `whatsappCountry.label` and `whatsappCountry.errorInvalid` (ES/EN); add `whatsappCountry` to the typed shapes they parse

---

## Phase 4: User Story 1 — A visitor outside Mexico leaves a working number (P1)

**Goal**: selector visible before the number in both forms; picked country's dial code sent. **Independent test**: pick Colombia, submit, body has `whatsappDialCode: "+57"` and digits only.

### Payloads

- [x] T016 [US1] In `forms/logic/submissionPayloads.ts`, inside both `...(values.contactPreference === 'whatsapp' && { … })` spreads, emit `whatsappDialCode: dialCodeOf(values.whatsappCountry)` before `whatsapp`. Depends on T004, T008
- [x] T017 [US1] Update `forms/logic/submissionPayloads.test.ts`: contact and careers with WhatsApp (`MX` → `+52`, `CO` → `+57`, `CA` → `+1`) assert exact key order `contactPreference, whatsappDialCode, whatsapp` and digits-only number; with email assert both keys absent (`not.toHaveProperty`) even if `whatsappCountry`/`whatsapp` hold values; unknown country code → builder throws
- [x] T018 [P] [US1] Update fixtures in `forms/logic/submissionFlows.test.ts` and `forms/logic/fieldErrorMessage.test.ts` for the new `whatsappCountry` value / content (no behaviour change)

### UI

- [x] T019 [P] [US1] Add the optional `leading` named slot to `forms/ui/TextField.vue` per contracts/whatsapp-field-ui.md (absent → identical markup; present → flex row, `gap-field-label-gap`, input `min-w-0 flex-1`); extend `forms/ui/TextField.test.ts` with "should render the leading slot before the input when provided" and "should keep the input as the label's target when a leading slot is provided"
- [x] T020 [US1] Create `forms/ui/DialCodeSelect.vue` per contracts/whatsapp-field-ui.md (native `<select>` over an `aria-hidden` face with `{flag} {dialCode}` + `chevron-down.svg?raw`; option text `"{flag} {name} ({dialCode})"`; `aria-label`, `aria-invalid`, `aria-describedby`, `disabled` when readonly; only existing tokens from `TextField`/`SelectField`; a comment marking every visual class UNVERIFIED against the `.pen`, spec OA-10). Header comment: why native (research R6, feature 20 precedent)
- [x] T021 [P] [US1] Create `forms/ui/DialCodeSelect.test.ts`: renders one option per entry with flag, name and dial code; face shows selected flag + dial code; emits `update:modelValue` with the code on change; face updates when `modelValue` changes
- [x] T022 [P] [US1] Create `forms/ui/DialCodeSelect.stories.ts`: Default (MX, ES names), English, Colombia selected, Error, Readonly (options from `buildCountryOptions`)
- [x] T023 [US1] Rewrite `forms/ui/WhatsappField.vue` per contracts/whatsapp-field-ui.md: props `visible`, `modelValue`, `country`, `content`, `errors`, `readonly`; emits `update:modelValue`, `update:country`; `TextField id="whatsapp"` with `DialCodeSelect id="whatsappCountry"` in `#leading`; country error `<p id="whatsappCountry-error">` above the number's error, existing error style. Keep the transition CSS untouched. Depends on T019, T020
- [x] T024 [P] [US1] Update `forms/ui/WhatsappField.test.ts`: selector rendered before the number input (DOM order) when visible; neither when hidden; emits `update:country`; renders both errors; readonly disables the select. Create `forms/ui/WhatsappField.stories.ts` (ES, EN, both errors)
- [x] T025 [US1] In `forms/logic/useContactForm.ts` and `forms/logic/useApplicationForm.ts` add `onWhatsappCountryChange(code)` (sets `values.whatsappCountry`, sets a local `countryPicked` ref) and return it. Depends on T006, T007
- [x] T026 [US1] Update `forms/ui/ContactForm.vue`: replace the `WhatsappField` call with `v-model`, `v-model:country` wired to `onWhatsappCountryChange` (`:country` + `@update:country`), `:content="content.fields"`, `:errors="{ number: errorFor('whatsapp'), country: errorFor('whatsappCountry') }"`. Depends on T023, T025
- [x] T027 [US1] Same in `forms/ui/ApplicationForm.vue`, keeping the file ≤ 200 lines (research R9: consolidated props; fallbacks: drop the one-line `lg:` comment, or move `submitLabel` into `useApplicationForm`). Verify with `wc -l`. Depends on T023, T025
- [x] T028 [P] [US1] Update `forms/ui/ContactForm.test.ts`: selector appears before the number on switching to WhatsApp; picking `CO` then submitting passes `whatsappCountry: 'CO'` to the stub submitter; existing 10-digit fixtures → valid 6–14 digit fixtures
- [x] T029 [P] [US1] Same in `forms/ui/ApplicationForm.test.ts`
- [x] T030 [P] [US1] Update content fixtures (add `whatsappCountry` content; `errorDigits` text) in `forms/ui/ContactForm.stories.ts`, `forms/ui/ApplicationForm.stories.ts`, `app/features/landing/ui/ContactSection.stories.ts`, `app/features/landing/ui/ContactSection.test.ts`, `app/features/about/ui/WorkWithMuushSection.stories.ts`, `app/features/about/ui/WorkWithMuushSection.test.ts`; build options with `buildCountryOptions` only if importable through the barrel, otherwise a 3-entry literal fixture (Art. III)

**Checkpoint**: US1 + US3 deliver the agreed contract with MX as the fixed default.

---

## Phase 5: User Story 2 — The selector starts on the visitor's country (P1)

**Goal**: default from `navigator.languages`, MX fallback, no request, choice kept. **Independent test**: stubbed languages → expected default on switching.

- [x] T031 [US2] In `forms/logic/useContactForm.ts` and `forms/logic/useApplicationForm.ts`: add option `readLanguages?: () => readonly string[]` (default `readBrowserLanguages`); in `onContactPreferenceChange`, when switching to `'whatsapp'` and `countryPicked` is false, set `values.whatsappCountry = detectDefaultCountry(readLanguages())`; when switching away, clear only `whatsapp` (OA-9). Never call detection at setup. Comment why (prerender, research R1). Depends on T025
- [x] T032 [P] [US2] In `forms/logic/useContactForm.test.ts`: `['en-US']` → US on switch; `['es']` → MX; `[]` → MX; picked CO survives email→whatsapp; number cleared on that round trip; `readLanguages` not called before the switch; `globalThis.fetch` spy not called during detection
- [x] T033 [P] [US2] Same cases in `forms/logic/useApplicationForm.test.ts`

---

## Phase 6: User Story 4 — Keyboard and screen reader (P2)

**Goal**: role, name, value, keyboard. **Independent test**: accessibility attributes and tab order in component tests + manual VoiceOver pass.

- [x] T034 [US4] Extend `forms/ui/DialCodeSelect.test.ts`: the `<select>` has `aria-label` equal to the label prop; the face is `aria-hidden="true"`; `aria-invalid="true"` and `aria-describedby="whatsappCountry-error"` with an error; `disabled` when readonly; the face shows the focus-visible ring classes wired to the select's focus
- [x] T035 [US4] Extend `forms/ui/WhatsappField.test.ts`: tab order — the select precedes the number input and neither has a positive `tabindex`
- [ ] T036 [US4] Manual check per quickstart step 6 (VoiceOver: name "Lada del país", value, change announced; keyboard only); record result and browser/OS in `docs/harness/progress/current.md`

---

## Phase 7: User Story 5 — Rejected dial code marked on the selector (P3)

**Goal**: `validation_failed` with `whatsappDialCode` marks the selector. **Independent test**: mocked 400 marks, focuses, clears on change.

- [x] T037 [US5] In `forms/logic/serverFieldErrors.ts`: add `SERVER_FIELD_ALIASES = { whatsappDialCode: 'whatsappCountry' }`, map names through it in `resolveServerFields`, extend the WhatsApp-only guard to `whatsappCountry`; add `whatsappCountry` keys to `CONTACT_SERVER_ERROR_KEYS` and `APPLICATION_SERVER_ERROR_KEYS` (`…whatsappCountry.errorInvalid`). Update the file header (alias exists because the form stores a country code, research R8)
- [x] T038 [US5] Update `forms/logic/serverFieldErrors.test.ts`: `['whatsappDialCode']` with WhatsApp → `['whatsappCountry']`; with email → `undefined`; `['whatsappDialCode','whatsapp']` → both, merged order puts `whatsappCountry` first; mark active until the country changes; existing `errorDigits` assertions still pass
- [x] T039 [P] [US5] In `forms/ui/ContactForm.test.ts` and `forms/ui/ApplicationForm.test.ts`: stub submitter returning `{ kind: 'field-errors', fields: ['whatsappCountry'] }` → selector has `aria-invalid="true"`, message "Elige la lada de tu país" shown, `document.activeElement.id === 'whatsappCountry'`

---

## Phase 8: Polish & cross-cutting

- [x] T040 [P] Grep `forms/`, `app/features/landing/`, `app/features/about/`, `tests/` for `WHATSAPP_MX_DIGIT_COUNT`, "10 dígitos", "10 digits", "10-digit" and stale comments about Mexico-only numbers (e.g. `contactFields.ts` spec A-03 note, `WhatsappField.test.ts` "Deben ser 10 dígitos"); fix or delete each
- [x] T041 [P] Confirm no new third-party origin: `pnpm generate` then the grep in quickstart.md § Automated; confirm `tests/forms-config.test.ts` still passes (no `fetch` in `ui/`)
- [x] T042 `wc -l forms/ui/*.vue` — every file ≤ 200; fix before continuing
- [x] T043 Run `pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm generate`, `pnpm storybook:build`; all green
- [ ] T044 Manual quickstart steps 1–7 in `pnpm dev` on `/es/`, `/en/`, `/es/nosotros#work`, `/en/about#work`; record findings (including the actual Windows flag rendering if a Windows machine is available, OA-5) in `docs/harness/progress/current.md`
- [x] T045 Tick the Phase -1 gates in `specs/032-whatsapp-dial-code-selector/plan.md` against the code; report to the leader that `form-api-contract.md` § 3/§ 5 and `ui-map.md` § 7 still need the human update (OA-1) and that release waits on the backend (OA-2)

---

## Dependencies & execution order

- Phase 1 → Phase 2 (T002/T003/T008/T009 parallel; T004→T005; T002→T006→T007; T010 last).
- Phase 3 (US3) needs only T006/T007; can run in parallel with Phase 4.
- Phase 4 (US1): T016→T017; T019 and T020 parallel → T023 → T026/T027; T025 before T026/T027.
- Phase 5 (US2) needs T025. Phase 6 (US4) needs T020/T023. Phase 7 (US5) needs T006/T007/T009 and the forms from T026/T027 for T039.
- Phase 8 after all stories.

### Parallel examples

- Phase 2: T002, T008, T009 together; then T003 with T004.
- US3: T011–T015 all in parallel (different files).
- US1: T019 + T020 + T018 together; then T021, T022, T024 together; then T028, T029, T030 together.

## Implementation strategy

1. Phases 1–2, then US3 + US1 → contract-complete forms with MX default (MVP that can ship once the backend is live).
2. US2 (detection), US4 (a11y verification), US5 (server mark).
3. Polish. Stop at any checkpoint with green checks.

---

## Appendix A · Delta tasks if the gate picks OA-6 C (custom combobox)

Replace T020–T022 and T034 with the tasks below; everything else stays. Requires leader-supplied visual values for the popup (spec OA-10 f).

- [ ] TC01 Create `forms/logic/useDialCodeCombobox.ts`: query, filtered options (match name accent/case-insensitive via `normalize('NFD')` + diacritic strip, dial-code digits, code), `activeIndex`, `open/close`, key handler (Down/Up/Home/End/PageUp/PageDown, Enter choose, Escape close + restore query, Tab close, Alt+Down open), result-count text for a polite live region
- [ ] TC02 [P] Create `forms/logic/useDialCodeCombobox.test.ts`: filtering ("mex", "méx", "52", "+57", "co"), each key, wrap/no-wrap at ends, Escape restores, choose emits code
- [ ] TC03 Create `forms/ui/DialCodeCombobox.vue` (APG "Editable Combobox With List Autocomplete"): `<input role="combobox" aria-expanded aria-controls aria-autocomplete="list" aria-activedescendant>`, `<ul role="listbox">` of `<li role="option" :aria-selected>` with `aria-hidden` flag + name + dial code, active option scrolled into view, outside click closes, live region; same props/emits as `DialCodeSelect`; ≤ 200 lines (split listbox into `DialCodeListbox.vue` if needed)
- [ ] TC04 [P] Create `forms/ui/DialCodeCombobox.test.ts` (ARIA attributes per state, keyboard selection end to end, outside click, readonly) and `forms/ui/DialCodeCombobox.stories.ts` (closed, open, filtered, empty result, error)
- [ ] TC05 Swap `DialCodeSelect` for `DialCodeCombobox` in `forms/ui/WhatsappField.vue`; delete `DialCodeSelect.*`; add copy keys for the search placeholder and "no results"/result-count text in both locales and both forms (copy to the gate)
- [ ] TC06 If OA-5 picks local SVG flags: vendor the chosen set (licence file + `README.md` with source and version) under `app/assets/flags/` or `public/flags/`, render with `<img alt="" loading="lazy">` from own origin; add a test that no flag URL is absolute
- [ ] TC07 Manual VoiceOver (macOS Safari) and NVDA (Windows Firefox/Chrome) pass; record in `docs/harness/progress/current.md`

---

## Phase 9: Amendment A1 (2026-10-14) — default country from `GET /__geo`

**Input**: spec.md § Amendment A1 (gate IP-1..IP-6 approved by Roberto on 2026-10-14), plan.md D-12..D-17 and the A1 gate rows, research R10–R14, data-model § 8, [contracts/edge-geo-endpoint.md](./contracts/edge-geo-endpoint.md).
**Replaces in code**: the behaviour delivered by T004 (detection part), T005 (detection cases), T025 (local `countryPicked`) and T031–T033 (language default). Those tasks stay checked as history; this phase removes their language-based detection.
**Scope guard**: only `forms/{data,logic}`, form test/story files and `tests/static-output.test.ts`. No `.vue`, page, section, locale or config change. Nothing in muush-foundation (the contract is handed over by the leader). No `public/__geo` fixture, no dev proxy.
**Goal**: Mexico by default; the `/__geo` country when valid and listed; never overwrite a pick; zero third-party requests; works without the edge in dev, preview, Storybook and tests.

### Setup

- [x] T046 Run `./init.sh` on the current tree before any edit; record the test count in `docs/harness/progress/current.md`

### Foundational

- [x] T047 In `forms/data/submissionContract.ts` add the optional member `lookupCountry?: () => Promise<string | undefined>` to both `ContactSubmitter` and `ApplicationSubmitter`, doc comment per data-model § 8.4 (raw value from the site's own edge; absent = unknown, as in stories and tests)
- [x] T048 [P] Create `forms/logic/edgeCountry.ts` per data-model § 8.2: `EDGE_COUNTRY_PATH = '/__geo'`, `EDGE_COUNTRY_TIMEOUT_MS = 3000` (comment citing `specs/032-whatsapp-dial-code-selector/contracts/edge-geo-endpoint.md`); `fetchEdgeCountry({ fetchImpl?, timeoutMs? })` calling `fetchImpl(EDGE_COUNTRY_PATH, { method: 'GET', credentials: 'omit', cache: 'no-store', signal })` with an `AbortController` aborted by `setTimeout(timeoutMs)` and cleared in `finally`; returns the `country` string of a `response.ok` JSON body (`unknown`, narrowed), else `undefined`; catches every error, never throws; `createEdgeCountryLookup(fetchOnce = () => fetchEdgeCountry())` memoizing the first promise. Default `fetchImpl` = `(input, init) => globalThis.fetch(input, init)` (same convention as `formsApiClient.ts`)
- [x] T049 [P] Create `forms/logic/edgeCountry.test.ts` with an injected `fetchImpl` mock (never the real network): `{"country":"CO"}` → `'CO'`; `{"country":null}`, `{}`, `{"country":5}` → `undefined`; 404 → `undefined`; HTML body `'<!DOCTYPE html>'` with status 200 and 404 (what `pnpm dev` and a static preview return) → `undefined`; rejected fetch → `undefined`; timeout with `vi.useFakeTimers()` (mock pending until aborted; advance 3000 ms) → `undefined` and the signal aborted; the call uses exactly `'/__geo'` (relative, no host), `method: 'GET'`, `credentials: 'omit'`, no `body`, no `headers`; `createEdgeCountryLookup` calls `fetchOnce` once for three calls. Depends on T048
- [x] T050 In `forms/logic/countryOptions.ts` delete `detectDefaultCountry`, `readBrowserLanguages`, `regionOf` and what only they use; add `toReportedCountry(value: unknown): CountryCode | undefined` (string, `/^[A-Z]{2}$/`, `isCountryCode`); rewrite the header comment (no language reading; the default comes from `/__geo`, Amendment A1). Keep `flagEmoji`, `dialCodeOf`, `buildCountryOptions`
- [x] T051 In `forms/logic/countryOptions.test.ts` delete the `detectDefaultCountry`/`readBrowserLanguages` suites; add `toReportedCountry`: `'MX'`, `'CO'`, `'CA'` → themselves; `'mx'`, `'MEX'`, `'M1'`, `''`, `null`, `undefined`, `52`, `{}` → `undefined`; `'XX'`, `'AQ'`, `'EU'` (well-formed, not listed) → `undefined`. Depends on T050
- [x] T052 Create `forms/logic/useDefaultCountry.ts` per data-model § 8.5: `useDefaultCountry({ values, lookupCountry })` returning `requestDefaultCountry()` (first call only; no-op without `lookupCountry`; on resolve `toReportedCountry(raw)`; if defined and not `picked`, set `values.value.whatsappCountry`) and `onWhatsappCountryChange(code)` (sets the value, `picked = true`, never back). Plain Vue, no Nuxt. Comment IP-3/IP-4. Depends on T047, T050
- [x] T053 [P] Create `forms/logic/useDefaultCountry.test.ts` with a controllable deferred `lookupCountry`: no port → `MX`, no throw; `'CO'` → `CO`; invalid/unlisted/`undefined` → `MX`; pick `PE` then resolve `'CO'` → `PE`; resolve then pick → pick wins; three `requestDefaultCountry()` calls → one lookup; nothing happens before the first `requestDefaultCountry()`. Depends on T052

### A1-1 + A1-2 — reported country, else Mexico (P1)

- [x] T054 [A1-1] In `forms/logic/useContactForm.ts`: remove the `readLanguages` option (import, doc), `countryPicked`, the detection branch in `onContactPreferenceChange` and the local `onWhatsappCountryChange`; compose `useDefaultCountry({ values, lookupCountry: options.submitter.lookupCountry })`; return its `onWhatsappCountryChange`; switching to `'whatsapp'` calls `requestDefaultCountry()` without resetting the country; returned `onEngage` = `submission.onEngage()` then `requestDefaultCountry()`. Update comments citing `navigator.languages`/research R1. Return type unchanged. Depends on T052
- [x] T055 [A1-1] Same change in `forms/logic/useApplicationForm.ts`. Depends on T052
- [x] T056 [P] [A1-1] In `forms/logic/useContactForm.test.ts` replace the language-default suite (T032): stub `lookupCountry` resolving `'CO'` → `CO` after `onEngage()` and switch to WhatsApp; `undefined`/`'xx'`/`'ZZ'` → `MX`; no `lookupCountry` → `MX`; `vi.stubGlobal('navigator', { languages: ['en-US'] })` with lookup `'MX'` → `MX` (language ignored, FR-A04); lookup not called before `onEngage`/switch; called once after focus + switch + switch back; `globalThis.fetch` spy never called. Depends on T054
- [x] T057 [P] [A1-1] Same suite in `forms/logic/useApplicationForm.test.ts` (replaces T033). Depends on T055
- [x] T058 [A1-1] In `forms/logic/useFormSubmission.ts` give both ports `lookupCountry: createEdgeCountryLookup()` (one per `useFlowDeps` call, i.e. per page); update the header comment (still the only Nuxt-aware network file; the lookup is browser-only because it runs from `engage`/a click). Depends on T047, T048
- [x] T059 [P] [A1-2] In `forms/ui/ContactForm.stories.ts` and `forms/ui/ApplicationForm.stories.ts` add a variant whose stub submitter has `lookupCountry: async () => 'CO'` (e.g. `ReportedCountryColombia`); comment that the other stubs omit it on purpose (= Mexico, no request, the Storybook-without-edge case). Depends on T047

### A1-3 — a pick is never overwritten (P1)

- [x] T060 [A1-3] In `forms/logic/useContactForm.test.ts` and `forms/logic/useApplicationForm.test.ts`: deferred lookup, `onWhatsappCountryChange('PE')`, then resolve `'CO'` → `PE`; pick `PE`, switch to email and back → `PE` and number `''`; type digits only (no pick), resolve `'CO'` → `CO` (typing is not picking). Depends on T056, T057

### A1-4 — privacy, static output, no edge (P1)

- [x] T061 [A1-4] In `tests/static-output.test.ts` assert over `.output/public`: some `_nuxt/*.js` chunk contains `/__geo`; no emitted JS contains `navigator.geolocation`, `getCurrentPosition` or `navigator.languages`; no emitted HTML contains a `"country":` literal; no new absolute origin in emitted JS (reuse the existing third-party-origin check if present; else assert the set of `https?://` hosts is unchanged and none mentions `geo`/`ip`); no `__geo` file under `.output/public` or `public/`. Depends on T058
- [x] T062 [P] [A1-4] In `forms/ui/ContactForm.test.ts` and `forms/ui/ApplicationForm.test.ts` (no-edge behaviour, as in dev and Storybook): with the existing stub submitter (no `lookupCountry`) and a `globalThis.fetch` spy, focus the form and switch to WhatsApp → the selector shows `MX` and `fetch` is never called; with a stub whose `lookupCountry` resolves `'CO'` → the selector shows `CO` after `await flushPromises()`. Depends on T054, T055
- [x] T063 [P] [A1-4] Confirm `nuxt.config.ts` still has `nitro.preset: 'static'`, no `server/` directory exists, and no dependency was added to `package.json` (diff against the T046 baseline). Depends on T061

### Polish

- [x] T064 Grep `app/` and `tests/` for `readLanguages`, `detectDefaultCountry`, `readBrowserLanguages`, `navigator.languages`, `regionOf`: zero hits outside comments explaining the removal (Art. VIII). Depends on T054–T057, T060
- [x] T065 Run `pnpm check && pnpm typecheck && pnpm test && pnpm generate && pnpm storybook:build` (or `./init.sh`); all green. Depends on all A1 tasks above
- [x] T066 Walk quickstart.md § "Amendment A1 — without the edge piece" steps in `pnpm dev` and a static preview of `.output/public`; record results (CONFIRMED/UNVERIFIED) in `docs/harness/progress/current.md`. Depends on T065
- [x] T067 Tick the **A1** Phase -1 gate rows in `specs/032-whatsapp-dial-code-selector/plan.md` against the code; report to the leader that OA-1 (`form-api-contract.md` § 3/§ 5 and `ui-map.md` § 7 including "default México") and OA-10 are still open, that `contracts/edge-geo-endpoint.md` is ready to hand to muush-foundation, and that no deploy order exists between the two repos (IP-6) while OA-2's backend order still holds. Depends on T065

### Phase 9 dependencies

```
T046 → T047, T048, T050
T048 → T049, T058
T050 → T051 ; T047 + T050 → T052 → T053, T054, T055
T054 → T056 ; T055 → T057 ; T056 + T057 → T060
T047 → T059 ; T058 → T061 → T063 ; T054 + T055 → T062
all → T064 → T065 → T066, T067
```

Parallel: after T046, T048 ‖ T050; then T049 ‖ T051. After T052: T053 ‖ T054 ‖ T055; then T056 ‖ T057 ‖ T059 ‖ T062.
