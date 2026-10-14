# Tasks: A chosen CV is never lost in silence

**Input**: Design documents from `specs/031-cv-upload-no-silent-loss/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: REQUIRED — `feature_list.json` #31 acceptance item 14 lists the
mocked-fetch cases. Test names follow `should <expected> when <condition>`
(Art. X). Write each test task before its implementation task and see it
fail first.

**Scope fence**: edit only the files named below. Do not touch
`docs/business/` (human-only, spec OA-1), `nuxt.config.ts`, pages, or the
contact form's behaviour. All paths are relative to the repo root; `F` =
`app/features/forms`.

**Gate items pending (spec OA-1..OA-5)**: implement with the proposals as
written. If Roberto/the leader changes one, it changes only a constant
(`CV_PUT_TIMEOUT_MS`), an i18n string, or the class list of
`F/ui/CvUploadError.vue` / its placement in `F/ui/ApplicationForm.vue`.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

- [x] T001 Run `./init.sh` and confirm it exits 0 before any edit; record the baseline line counts of `F/ui/ApplicationForm.vue` (182) and `F/ui/FormOutcome.vue` (64) in `docs/harness/progress/current.md`

---

## Phase 2: Foundational (blocking — types, copy, removal of the CV note)

**Purpose**: the type and copy changes every story compiles against. After
this phase the suite is green again with the CV note gone and the new types
in place, but the flow still behaves as feature 29 (fixed in US1).

- [x] T002 In `F/data/submissionContract.ts`: narrow `CvUploadGrant` to `{ cvId: string; uploadUrl: string; contentType: string }`; change `SubmissionOutcome` to `success` without `cvAttached` plus new `{ kind: 'cv-upload-failed' }` (data-model § 2); add `SubmissionProgress { cvUploaded(): void }` and the optional `progress?: SubmissionProgress` second parameter on `ApplicationSubmitter.submit`; add constants `CV_UPLOAD_METHOD = 'PUT'` and `S3_PUT_SUCCESS_STATUS = 200`; update the `CV_PUT_TIMEOUT_MS` comment to cite spec OA-3 (value stays 60 000); rewrite the doc comments that describe "same headers object" and "cvAttached false when a CV step failed"
- [x] T003 In `F/data/applicationFields.ts`: `ApplicationFormContent.success` becomes `{ title: string }`; add `uploading: string` and `cvUploadError: { message: string; retry: string; submitWithoutCv: string }`; update the `CV_MAX_BYTES` comment to cite form-api-contract.md § 4 (5 MiB = 5 242 880 bytes) instead of "máximo 5MB propuesto"
- [x] T004 [P] In `i18n/locales/es.json`: delete `forms.application.success.cvNote`; add `forms.application.uploading` = "Subiendo CV…", `forms.application.cvUploadError.message` = "No pudimos subir tu CV. Inténtalo de nuevo o envía la postulación sin CV.", `.retry` = "Reintentar subida", `.submitWithoutCv` = "Enviar sin CV"
- [x] T005 [P] In `i18n/locales/en.json`: delete `forms.application.success.cvNote`; add `forms.application.uploading` = "Uploading CV…", `forms.application.cvUploadError.message` = "We couldn't upload your CV. Try again or submit without a CV.", `.retry` = "Retry upload", `.submitWithoutCv` = "Submit without CV"
- [x] T006 [P] In `tests/forms-application-copy.test.ts`: replace the CV-note test with (a) a test asserting `forms.application.success.cvNote` is absent in both locales and (b) a test asserting the four new strings of T004/T005 verbatim; update the local `success` type to `{ title: string }`
- [x] T007 In `F/logic/useApplicationFormContent.ts`: drop `cvNote`; resolve `uploading` and the three `cvUploadError` keys
- [x] T008 [P] In `F/ui/FormOutcome.vue`: remove the `note` prop and its `<p>`; rewrite the header comment's mention of the CV note. Update `F/ui/FormOutcome.test.ts` (delete both note tests) and `F/ui/FormOutcome.stories.ts` (delete `SuccessWithCvNote`)
- [x] T009 In `F/logic/useFormSubmitState.ts`: remove the `cvAttached` ref and return field; `applyOutcome` handles `success` with no flag
- [x] T010 In `F/logic/useApplicationForm.ts`: remove `cvNoteVisible` (interface, computed, return) and the header comment paragraph about it; in `F/ui/ApplicationForm.vue` remove `cvNoteVisible` and the `:note` binding on `FormOutcome`
- [x] T011 [P] Update fixtures to the new shapes (no behaviour change): `F/ui/ContactForm.stories.ts`, `F/logic/useContactForm.test.ts`, `F/logic/useApplicationForm.test.ts` (drop `cvAttached`; delete the "CV note" test and the `cvNoteVisible` assertion in the failure test), `F/ui/ApplicationForm.test.ts` (fixture `success: { title }` + `uploading` + `cvUploadError`; delete the "add the CV note" test; keep the "no CV note on failure" assertion only if rewritten to check the removed copy string is absent), `F/ui/ApplicationForm.stories.ts` (both content objects; delete `stubSubmitter(cvAttached)` parameter, `losingCv`, `successWithCvNote`, `SuccessWithCvNote`, `SuccessWithCvNoteEnglish` and their doc comments), `app/features/about/ui/WorkWithMuushSection.test.ts`, `app/features/about/ui/WorkWithMuushSection.stories.ts`
- [x] T012 Run `pnpm typecheck && pnpm test` — everything except the not-yet-updated `F/logic/submissionFlows.test.ts` and `F/logic/formsApiClient.test.ts` CV cases must be green; `grep -rn "cvNote\|cvAttached" app tests i18n` returns nothing outside those two test files

**Checkpoint**: CV note gone everywhere (spec FR-006, acceptance 11); new types compile.

---

## Phase 3: User Story 1 — A failed CV upload stops the application and shows the choice (P1) 🎯 MVP

**Goal**: no `/careers` after any CV failure; the PUT is correct; the form shows the CV error with two actions.

**Independent Test**: mocked upload failure / PUT 403 / PUT network error → no `/careers` request, CV error and both actions visible, values kept.

### Tests for User Story 1

- [x] T013 [P] [US1] In `F/logic/formsApiClient.test.ts` rewrite the `putCv` block: `should PUT the original file with only the grant content-type when uploading` (asserts `init.method === 'PUT'`, `Object.keys(init.headers)` equals `['content-type']`, value equals `grant.contentType`, no `content-length` key in any casing, `init.body` is the same `File`); `should report failed when S3 answers 204` and `… 403` and `… 500`; keep the reject and timeout cases. Update the shared `grant` fixture to the narrowed shape
- [x] T014 [P] [US1] In `F/logic/formsApiClient.test.ts` rewrite the `parseUploadGrant` block: `should extract cvId, uploadUrl and content-type when the body is well formed`; `should find content-type regardless of key casing`; `should return undefined when method is not PUT`; `… when content-type is missing or empty`; `… when cvId or uploadUrl is missing`
- [x] T015 [P] [US1] In `F/logic/submissionFlows.test.ts`: update `GRANT` to the narrowed shape; replace the `cvFailures` `it.each` with `should return cv-upload-failed and never call postCareers when %s` over: upload `FAILURE`, upload `validation`, two `CHALLENGE`s, PUT `'failed'`, and a `getToken` that rejects before the grant; replace `should fail with no CV note…` with `should fail when the CV uploaded but the application failed`; add `should never call postCareers without cvId when a CV is chosen` (all failure scripts, assert every recorded careers payload has `cvId`); keep `should not PUT when the upload request failed`
- [x] T016 [P] [US1] In `F/logic/submissionFlows.test.ts`, block "real client over mocked fetch" (create one for the application flow, mirroring the contact block): a `fetchImpl` routed by URL that answers `/careers/upload` with a grant body (`method: 'PUT'`, `headers: { 'content-type': 'application/pdf', 'content-length': '<size>' }`, `uploadUrl: 'https://bucket.test.invalid/signed-1'`). Cases: `should not call /careers when /careers/upload answers 500`, `… when the PUT answers 403`, `… when the PUT rejects with a network error`; each asserts no fetch call to a URL ending in `/careers` and the outcome `cv-upload-failed`
- [x] T017 [P] [US1] In `F/logic/useApplicationForm.test.ts`: `should enter cv-upload-error, keep every value and the file, and not succeed when the submitter reports cv-upload-failed`; `should clear cv-upload-error back to idle when the visitor picks another file`; `should clear cv-upload-error back to idle when the visitor removes the file`
- [x] T018 [P] [US1] Create `F/ui/CvUploadError.test.ts`: `should render the message in an alert region`; `should render both actions as type=button`; `should focus the retry action when mounted`; `should emit retry and submit-without-cv when the actions are clicked`; `should reference no fetch, XMLHttpRequest or Nuxt composable in its own source`
- [x] T019 [P] [US1] In `F/ui/ApplicationForm.test.ts`: `should show the CV error with both actions next to the CV field and keep every value when the submitter reports cv-upload-failed`; `should not show the success copy when the CV upload failed`; `should point the CV input's aria-describedby at the CV error while it is shown`

### Implementation for User Story 1

- [x] T020 [US1] In `F/logic/formsApiClient.ts`: `parseUploadGrant` returns `{ cvId, uploadUrl, contentType }` and requires `method === CV_UPLOAD_METHOD` plus a non-empty string under a key equal to `content-type` ignoring case; `putCv` sends `method: CV_UPLOAD_METHOD`, `headers: { 'content-type': grant.contentType }`, `body: file`, and returns `'uploaded'` only when `response.status === S3_PUT_SUCCESS_STATUS`. Add a comment next to the headers explaining why `content-length` is not set (research R2: forbidden header; browser derives it from the untouched File, equal to the declared `contentLength`). Keep every `catch` discarding the error (no logging)
- [x] T021 [US1] In `F/logic/submissionFlows.ts`: `uploadCv` keeps returning `cvId | undefined`; `submitApplicationFlow(values, deps, progress?)` returns `{ kind: 'cv-upload-failed' }` when `values.cv` is set and `uploadCv` gave `undefined`, otherwise calls `progress?.cvUploaded()` then sends `/careers` with that `cvId`; `toOutcome` loses the `cvAttached` parameter. Rewrite the `uploadCv` doc comment (it currently cites contract § 7.5 "losing the attachment is acceptable") to cite spec FR-001/FR-002 and Roberto's 2026-10-13 decision
- [x] T022 [US1] In `F/logic/useFormSubmission.ts`: `useApplicationSubmitter().submit` forwards `(values, progress)` to `submitApplicationFlow(values, deps(), progress)`
- [x] T023 [US1] In `F/logic/useFormSubmitState.ts`: extend `SubmitState` with `'uploading' | 'cv-upload-error'`; `FormSubmitter.submit` gains optional `progress`; extract `attemptSubmit()` (validation → spam guard → engage → busy state → submit → applyOutcome) and make `onSubmit(event)` call it after `preventDefault()`; accept attempts from `cv-upload-error`, ignore them while `uploading`/`sending`/`success`; `applyOutcome` maps `cv-upload-failed` → `cv-upload-error`; return `attemptSubmit`. Update the transition table comment to data-model § 4
- [x] T024 [US1] In `F/logic/useApplicationForm.ts`: expose `cvUploadFailed` (computed `state === 'cv-upload-error'`); `onCvChange` resets state to `idle` when it was `cv-upload-error`; rewrite the header comment (no CV note; CV failure is a state the visitor resolves)
- [x] T025 [US1] Create `F/ui/CvUploadError.vue` per `contracts/application-form-ui.md`: props `id`, `message`, `retryLabel`, `submitWithoutCvLabel`; emits `retry`, `submit-without-cv`; root `role="alert"` with `id` on the message; two `<button type="button">`; focus the retry button in `onMounted`; classes from research R8 only, with a header comment stating they are UNVERIFIED against the `.pen` pending spec OA-5
- [x] T026 [US1] In `F/ui/ApplicationForm.vue`: render `<CvUploadError id="cv-upload-error" …>` right after `<FileField>` when `shownState === 'cv-upload-error'`, with message and labels from `content.cvUploadError` (the two emits are bound in T032 and T038, not here); pass `aria-describedby` support to the CV input through a new optional `describedBy` prop on `F/ui/FileField.vue` that is appended to its own `aria-describedby`; widen `previewState` to include `'cv-upload-error'`
- [x] T027 [P] [US1] Create `F/ui/CvUploadError.stories.ts` (`Spanish`, `English`) and add `CvUploadError` + `CvUploadErrorEnglish` stories to `F/ui/ApplicationForm.stories.ts` using `previewState: 'cv-upload-error'`

**Checkpoint**: T013–T019 green; acceptance 1, 2 (display), 6, 7.

---

## Phase 4: User Story 2 — Retry gets a fresh grant and tokens every time (P1)

**Goal**: "Reintentar subida" and a repeated Enviar re-run the whole attempt with a new grant, new upload address, new tokens.

**Independent Test**: first attempt PUT fails, second succeeds → two different upload URLs, all tokens distinct, `/careers` carries the second grant's `cvId`.

### Tests for User Story 2

- [x] T028 [P] [US2] In `F/logic/submissionFlows.test.ts`: `should request a new grant, PUT to the new uploadUrl and use only new tokens when the flow runs again after a failed PUT` (fake client returning grants `cv-1`/`signed-1` then `cv-2`/`signed-2`; assert PUT URLs `['…signed-1','…signed-2']`, the token log has no duplicates, and the single careers payload carries `cvId: 'cv-2'`); also in the mocked-fetch block: `should send /careers with the second cvId when the retried PUT answers 200`
- [x] T029 [P] [US2] In `F/logic/useApplicationForm.test.ts`: `should call the submitter again with the same file when onRetryCvUpload runs from cv-upload-error`; `should call the submitter again with the file when the form is submitted from cv-upload-error`; `should ignore onRetryCvUpload while uploading or sending`
- [x] T030 [P] [US2] In `F/ui/ApplicationForm.test.ts`: `should call the submitter again with the chosen file when Reintentar subida is clicked`

### Implementation for User Story 2

- [x] T031 [US2] In `F/logic/useApplicationForm.ts`: add `onRetryCvUpload()` → `attemptSubmit()`; export it on the return interface
- [x] T032 [US2] In `F/ui/ApplicationForm.vue`: bind `@retry="onRetryCvUpload"` on `CvUploadError`
- [x] T033 [US2] Verify by reading `F/logic/submissionFlows.ts`, `F/logic/useFormSubmission.ts` and `F/logic/formsApiClient.ts` that no grant, `uploadUrl`, `cvId` or token is stored outside a single flow call (no module-level or closure variable); add a one-line comment at `submitApplicationFlow` stating this invariant (spec FR-007, research R5)

**Checkpoint**: acceptance 4, 5.

---

## Phase 5: User Story 3 — Send without the CV (P1)

**Goal**: the only path to an application without `cvId` after choosing a CV is the person's explicit action.

**Independent Test**: from the CV error, "Enviar sin CV" empties the field and sends one `/careers` without `cvId`, no upload.

### Tests for User Story 3

- [x] T034 [P] [US3] In `F/logic/useApplicationForm.test.ts`: `should clear the file and call the submitter with cv null when onSubmitWithoutCv runs`; `should show the generic error and keep the CV removed when sending without CV fails`
- [x] T035 [P] [US3] In `F/logic/submissionFlows.test.ts`: `should send one application without cvId and no upload when cv is null` (rename/extend the existing no-CV test so it asserts `requestCvUpload` and `putCv` were not called)
- [x] T036 [P] [US3] In `F/ui/ApplicationForm.test.ts`: `should empty the CV field and submit without the file when Enviar sin CV is clicked`; `should show the standard success copy and no extra note when sending without CV succeeds`

### Implementation for User Story 3

- [x] T037 [US3] In `F/logic/useApplicationForm.ts`: add `onSubmitWithoutCv()` → `values.value.cv = null`, then `attemptSubmit()`; export it
- [x] T038 [US3] In `F/ui/ApplicationForm.vue`: bind `@submit-without-cv="onSubmitWithoutCv"` on `CvUploadError`

**Checkpoint**: acceptance 3.

---

## Phase 6: User Story 4 — Invalid file refused on selection (P2)

**Goal**: type/size errors appear immediately; zero requests.

**Independent Test**: select `.docx` and a 6 MB PDF → immediate error, field empty, no submitter call.

### Tests for User Story 4

- [x] T039 [P] [US4] In `F/logic/useApplicationForm.test.ts`: `should clear the file and expose a format rejection when onCvReject receives format`; `… size rejection …`; `should clear the rejection when a valid file is chosen`; `should never call the submitter from onCvReject`
- [x] T040 [P] [US4] In `F/ui/ApplicationForm.test.ts`: `should show the format error immediately and send nothing when a non-PDF is selected`; `should show the size error immediately and send nothing when a PDF over 5242880 bytes is selected`; `should accept a PDF of exactly 5242880 bytes`
- [x] T041 [P] [US4] In `F/ui/FileField.test.ts`: add `should accept a PDF of exactly CV_MAX_BYTES when selected` (boundary)

### Implementation for User Story 4

- [x] T042 [US4] In `F/logic/useApplicationForm.ts`: add `cvRejection` ref and `onCvReject(kind)` (data-model § 5); `onCvChange` clears `cvRejection`; export both
- [x] T043 [US4] In `F/ui/ApplicationForm.vue`: listen `@reject="onCvReject"` on `FileField`; CV `:error` = the rejection message (`content.fields.cv.errorFormat` / `errorSize`) when `cvRejection` is set, else the existing `errorFor('cv')`. Keep the logic in a small function in `<script setup>` or in `F/logic/fieldErrorMessage.ts` if it exceeds a few lines
- [x] T044 [US4] In `F/ui/FileField.vue`: update the header comment — `reject` now has a listener (`ApplicationForm`), and the size limit is contract § 4's, not a proposal

**Checkpoint**: acceptance 9.

---

## Phase 7: User Story 5 — "Subiendo CV…" while uploading (P2)

**Goal**: distinct, disabled uploading state, then "Enviando…".

**Independent Test**: pending PUT → disabled button reads uploading label, second press ignored; resolve → sending label.

### Tests for User Story 5

- [x] T045 [P] [US5] In `F/logic/useApplicationForm.test.ts`: `should go uploading, then sending after progress.cvUploaded, then success when a CV is chosen`; `should go straight to sending when no CV is chosen`; `should call the submitter once when submit fires again while uploading`
- [x] T046 [P] [US5] In `F/logic/submissionFlows.test.ts`: `should call progress.cvUploaded once, after the PUT and before the careers token` and `should never call progress.cvUploaded when the CV upload failed`
- [x] T047 [P] [US5] In `F/ui/ApplicationForm.test.ts`: `should disable the button, show the uploading label and lock the fields while uploading`; `should not render the CV actions while uploading`

### Implementation for User Story 5

- [x] T048 [US5] In `F/logic/useFormSubmitState.ts`: add option `busyStateFor(values)` (default `() => 'sending'`); `attemptSubmit` enters that state and passes `{ cvUploaded: () => { state.value = 'sending' } }` as `progress` to `submitter.submit`
- [x] T049 [US5] In `F/logic/useApplicationForm.ts`: pass `busyStateFor: v => (v.cv ? 'uploading' : 'sending')`
- [x] T050 [US5] In `F/ui/ApplicationForm.vue`: `readonly` true for `uploading` and `sending`; submit label `content.uploading` / `content.sending` / `content.submit`; `aria-busy` for both busy states; widen `previewState` to include `'uploading'`; add `Uploading` story in `F/ui/ApplicationForm.stories.ts`

**Checkpoint**: acceptance 8.

---

## Phase 8: Polish & Cross-Cutting

- [x] T051 [P] In `tests/forms-config.test.ts` add a block `forms config · nothing logs uploadUrl or form data (FR-014)`: `should find no console. call in any non-test source under app/features/forms/`; `should find no analytics or error-reporting SDK import anywhere under app/` (patterns `@sentry/`, `posthog`, `gtag`, `plausible`, `umami`, `analytics` as an import specifier). Confirm the existing `previewState` test still passes with the widened union
- [x] T052 [P] Run `wc -l F/ui/ApplicationForm.vue F/ui/CvUploadError.vue F/ui/FormOutcome.vue F/ui/FileField.vue`; every file ≤ 200. If `ApplicationForm.vue` exceeds 200, move `FileField` + `CvUploadError` into a new `F/ui/CvField.vue` (research R9) and re-run the UI tests
- [x] T053 [P] `grep -rn "content-length" app/` returns only the explanatory comment in `F/logic/formsApiClient.ts` and test assertions that it is absent; `grep -rn "cvNote\|cvAttached\|SuccessWithCvNote" app tests i18n` returns nothing
- [x] T054 Run `pnpm check && pnpm typecheck && pnpm test && pnpm generate && pnpm storybook:build` (acceptance 15); all pass
- [ ] T055 (NOT DONE by implementer: no browser available to a subagent; stories build in `pnpm storybook:build` and are listed in docs/harness/progress/current.md for the leader's OA-5 look) Open Storybook stories `Forms/ApplicationForm` → `Uploading`, `CvUploadError`, `CvUploadErrorEnglish`, and `Forms/CvUploadError`; capture what they look like for the leader's OA-5 comparison against the `.pen` (do not adjust visuals without the leader's values)
- [x] T056 Log progress, the line counts, and any technical finding (e.g. browser behaviour of `content-length`) in `docs/harness/progress/current.md` or as a code comment; technical findings never go to `docs/business/`

---

## Dependencies & Execution Order

- **Phase 1 → Phase 2**: T001 first. Within Phase 2: T002, T003 first (types); T004/T005/T006 parallel; T007 after T003; T008 parallel; T009 → T010 → T011 → T012.
- **US1 (Phase 3)** depends on Phase 2. It delivers the fix: no silent loss. T020 → T021 → T022; T023 → T024; T025 → T026.
- **US2, US3** depend on US1's `attemptSubmit` (T023) and `CvUploadError` (T025/T026). US2 and US3 are independent of each other.
- **US4** depends only on Phase 2 (touches `onCvChange`/`FileField` wiring); can run in parallel with US1 if different people edit `useApplicationForm.ts` carefully (same file: serialize T042 with T024/T031/T037).
- **US5** depends on T023 (`attemptSubmit`) and T021 (`progress`).
- **Polish** after all stories.

Same-file serialization: `F/logic/useApplicationForm.ts` (T010, T024, T031, T037, T042, T049), `F/ui/ApplicationForm.vue` (T010, T026, T032, T038, T043, T050), `F/logic/useFormSubmitState.ts` (T009, T023, T048), and the test files they share — never run those tasks in parallel with each other.

## Parallel Example: User Story 1

```text
T013, T014 (formsApiClient.test.ts — same file, one agent)
T015, T016 (submissionFlows.test.ts — same file, one agent)
T017 (useApplicationForm.test.ts)
T018 (CvUploadError.test.ts)
T019 (ApplicationForm.test.ts)
```

## Implementation Strategy

1. **MVP = Phase 2 + US1**: after it, no production path can send an
   application without the chosen CV; the visitor sees the error. Retry and
   send-without-CV can still be done by pressing Enviar again or removing
   the file by hand, so even the MVP never loses a CV silently.
2. Add US2 + US3 (the two explicit actions), then US4 and US5.
3. Polish, full gate (T054), Storybook look for the leader (T055).
