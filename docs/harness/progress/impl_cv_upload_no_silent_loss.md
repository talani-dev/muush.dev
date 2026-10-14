# Implementation · feature 31 `cv_upload_no_silent_loss`

**Date**: 2026-10-13 · **Agent**: implementer · **Status left at**: `in_progress` (leader moves it to `reviewing`)

Spec package: `specs/031-cv-upload-no-silent-loss/`. Approved by Roberto on
2026-10-13: OA-2 copy as given, OA-3 60 s PUT / 15 s API, OA-4 a retry continues to `/careers`.
OA-1 (docs/business) was not touched. OA-5 (visuals) is still unverified.

## Gate

`./init.sh` exit 0: `pnpm check`, `pnpm typecheck`, `pnpm test` (73 files, 965 tests),
`pnpm generate`, `pnpm storybook:build`.

## What changed (behaviour)

- `submitApplicationFlow(values, deps, progress?)`: if a CV was chosen and the grant fails
  (after its single 403 retry), the grant is malformed, no token is available before the grant,
  or the PUT is anything but 200 → `{ kind: 'cv-upload-failed' }`, and `postCareers` is never
  called. After a 200 PUT it calls `progress.cvUploaded()` and only then mints the `/careers` token.
  Nothing persists between calls (comment at the function).
- `putCv`: method `PUT` (constant), headers exactly `{ 'content-type': grant.contentType }`,
  body = the original `File`, success only when `status === 200` (`S3_PUT_SUCCESS_STATUS`).
  The comment next to the headers explains why `content-length` is not set.
- `parseUploadGrant` → `{ cvId, uploadUrl, contentType }`. It requires `method === 'PUT'` and finds
  a non-empty `content-type` regardless of the key's case.
- `useFormSubmitState`: new states `uploading` and `cv-upload-error`. `attemptSubmit()` is shared by
  Enviar, retry and send-without-CV. A `busyStateFor` option decides the busy state. `cvAttached` was removed.
- `useApplicationForm`: added `cvRejection`, `onCvReject`, `cvUploadFailed`, `onRetryCvUpload` and
  `onSubmitWithoutCv`. The last one acts only from `cv-upload-error`. Changing or removing the file,
  or a refused selection, dismisses the CV error back to `idle`. `cvNoteVisible` was removed.
- UI: new `CvUploadError.vue` (alert, two `type="button"`, focuses the retry button on mount).
  `FileField` gained a `describedBy` prop. `FormOutcome` lost its `note` prop.
  The submit label reads uploading / sending / submit.
- i18n: `forms.application.success.cvNote` is removed from both locales. Added `uploading` and
  `cvUploadError.{message,retry,submitWithoutCv}` in both locales, verbatim.

## Deviations from the plan

1. **`ui/CvField.vue` was added.** With the CV error wired inline, `ApplicationForm.vue` reached 220 lines.
   I applied research R9's fallback: `CvField.vue` wraps `FileField` and `CvUploadError` and maps a
   rejection to its message. Final line counts: ApplicationForm 199, CvField 82, CvUploadError 65,
   FileField 166, FormOutcome 59. `previewState` is typed as `Exclude<SubmitState, 'idle' | 'invalid'>`,
   which is the same union.
2. **Extra fixtures forced by the type change** (shape only, outside the plan's list):
   `app/features/landing/ui/ContactSection.{test,stories}.ts` and `app/features/forms/ui/ContactForm.test.ts`.
   `useContactForm.test.ts` "snapshot" now asserts on the first argument, because every submitter now also
   receives the (ignored) progress callback.
3. **`CvUploadError` uses `flex-wrap` on the actions row**, so the two actions wrap on narrow widths instead of
   overflowing. This is layout only: no new token or literal. It is part of the OA-5 look.
4. Tests were written right after each implementation step, not before it (they were not observed failing first).

## Not done

- **T055**: I did not look at the stories, because a subagent has no browser. Stories to compare against the `.pen`:
  - `Forms/ApplicationForm`: `Uploading`, `CvUploadError`, `CvUploadErrorEnglish`
  - `Forms/CvUploadError`: `Spanish`, `English`

  All classes come from research R8 and are UNVERIFIED against the design.

## For the leader / Roberto (not written anywhere else)

- OA-1 is still pending. `form-api-contract.md` § 4 ("Manda los headers tal cual vienen"), § 7.5 and § 9's last
  bullet describe the old behaviour.
- Infra: the bucket CORS rule must allow origin `https://muush.dev`, method `PUT` and request header `content-type`
  (preflight). Until then every production CV upload ends in the CV error.
- UNVERIFIED: browsers silently drop a script-set `Content-Length`. Research R2 says this is from the WHATWG list
  as recalled; it was not checked in a browser here.
