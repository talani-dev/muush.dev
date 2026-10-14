# Review — feature 31 `cv_upload_no_silent_loss`

**Verdict: APPROVED**

Reviewer run on 2026-10-13 against the uncommitted working tree (33 modified files + untracked `CvField.vue`, `CvUploadError.{vue,test.ts,stories.ts}`, `specs/031-cv-upload-no-silent-loss/`).

## Preconditions
- CONFIRMED: `feature_list.json` #31 status is `reviewing`; it is the only active feature.
- CONFIRMED: `plan.md` Phase -1 gates all `[x]`. `tasks.md`: T001–T054, T056 `[x]`; T055 open (Storybook visual look, owned by leader/human — known, not blocking).

## ./init.sh (run by reviewer)
- Run 1: exit 1 — `pnpm test` (global setup) and `pnpm generate` failed with "Another Nuxt build is already running (PID 65070)", a lock held by a concurrent build outside this review. Not a code failure; the PID was gone moments later.
- Run 2: **exit 0**. typecheck OK, `biome check --error-on-warnings` OK, 73 test files / 965 tests passed, `pnpm generate` OK, `pnpm storybook:build` OK.

## Focus points (all CONFIRMED by reading code + tests)
- **No /careers after a failed upload/PUT when a CV was chosen**: `logic/submissionFlows.ts` `submitApplicationFlow` sends without `cvId` only when `values.cv === null`; otherwise `uploadCv(...).catch(() => undefined)` → `undefined` returns `{ kind: 'cv-upload-failed' }` before any `/careers` call. Tests: `cvFailures` `it.each`, "never call postCareers without cvId when a CV is chosen", and mocked-fetch "should not call /careers when /careers/upload answers 500 | PUT answers 403 | PUT rejects with a network error".
- **Only "Enviar sin CV" sends without cvId**: `useApplicationForm.onSubmitWithoutCv` is guarded by `cvUploadFailed`, sets `cv = null`, then `attemptSubmit()`. Removing/replacing the file by hand also dismisses the error (spec edge case, person's decision). Tested in composable and UI tests.
- **Fresh uploadUrl and Turnstile tokens every attempt**: no grant/url/token stored outside a flow call (comment at `submitApplicationFlow`); every API call goes through `sendWithFreshToken`. Tested: "request a new grant, PUT to the new uploadUrl and use only new tokens…" and "send /careers with the second cvId when the retried PUT answers 200".
- **PUT**: `formsApiClient.ts` `putCv` uses `method: 'PUT'`, headers `{ 'content-type': grant.contentType }` only, `body: file` (original File), success only when `status === 200` (204/403/500 → failed, tested), `CV_PUT_TIMEOUT_MS = 60_000` with abort (tested). `parseUploadGrant` rejects method ≠ PUT or missing content-type (case-insensitive key).
- **Client validation without request**: `FileField.vue` emits `reject` for non-PDF / `size > CV_MAX_BYTES` (5 242 880); `onCvReject` empties the field and sets `cvRejection`; `CvField.vue` shows the format/size message immediately. Tests cover non-PDF, >5242880, exactly 5242880, and "never call the submitter from onCvReject".
- **No uploadUrl/PII logging**: no `console.` in non-test `app/` sources; no analytics/Sentry SDK. Enforced by the new block in `tests/forms-config.test.ts`. All `catch` blocks discard errors.
- **i18n parity**: `uploading` + `cvUploadError.{message,retry,submitWithoutCv}` added to both `es.json`/`en.json` with the approved copy verbatim (OA-2 as written: EN "Submit without CV"); `success.cvNote` removed from both. `tests/forms-application-copy.test.ts` asserts both.
- **No fetch in ui/**: `CvUploadError.vue` and `CvField.vue` are props + emits only; grep for fetch/useNuxtApp in `ui/*.vue` is empty.
- **Feature 29 CV note gone**: `grep cvNote|cvAttached|SuccessWithCvNote|losingCv` over `app tests i18n` only hits the absence assertions; `FormOutcome.vue` lost its `note` prop.
- Uploading state: `busyStateFor` → `uploading` when a CV is chosen, `progress.cvUploaded()` → `sending`; button disabled and fields read-only in both; CV actions hidden while uploading. Tested.

## Checkpoints / Constitution
- C3: `ui → logic → data` direction respected; alias imports only; `ApplicationForm.vue` 199 lines (≤ 200), `CvField.vue` 82, `CvUploadError.vue` 65, `FileField.vue` 166.
- C4: no color/spacing literals (`text-red-400`, `text-bone-100`, `gap-field-label-gap`, `gap-form-gap` are existing tokens); no server route; `<script setup lang="ts">` everywhere; no debug prints.
- C5/C7: every acceptance item in `feature_list.json` #31 and every FR in `spec.md` has at least one test (see focus points). No `[NEEDS CLARIFICATION]`.
- C8: parity test green; no hardcoded user-facing string in the new components.

## Non-blocking notes
1. OA-1 (`docs/business/landing/form-api-contract.md` § 9 and § 7.5 still describe the reversed behaviour) — human-owned, open.
2. OA-5 / T055 — classes in `app/features/forms/ui/CvUploadError.vue` are UNVERIFIED against the `.pen`; Storybook visual look not captured. Leader/human-owned.
3. `specs/031-cv-upload-no-silent-loss/spec.md:5` header still reads "Draft (spec_ready, pending human approval)"; cosmetic, the leader may update it.
4. `CvField.vue` keeps showing a `cvRejection` message in every state (including while sending a submission without a CV) until a valid file is chosen. Consistent with spec US4-4; noted only as UX polish.
5. `CvUploadError.vue` uses `role="alert"` and also moves focus to the retry button; some screen readers may announce twice. Matches spec FR-003 as written.
6. C6 (`docs/harness/progress/history.md` entry, final status) is the leader's closing step, not evaluated here.
