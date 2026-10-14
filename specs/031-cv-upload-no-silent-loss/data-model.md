# Data Model: A chosen CV is never lost in silence

**Feature**: `specs/031-cv-upload-no-silent-loss` | **Date**: 2026-10-13

Changes relative to `specs/029-form-submission-integration/data-model.md`.
Anything not listed is unchanged. Types live in
`app/features/forms/data/`; functions in `app/features/forms/logic/`.

---

## 1 · `CvUploadGrant` (narrowed) — `data/submissionContract.ts`

Before: `{ cvId, uploadUrl, method: string, headers: Record<string,string> }`.

After — only what the PUT needs:

| Key | Type | Source | Rule |
|---|---|---|---|
| `cvId` | string | body `cvId` | non-empty |
| `uploadUrl` | string | body `uploadUrl` | non-empty; used for exactly one PUT, never stored past the attempt |
| `contentType` | string | body `headers['content-type']` (key looked up case-insensitively) | non-empty; sent verbatim as the PUT's `content-type` |

`parseUploadGrant` returns `undefined` (→ CV upload failure) when any of the
three is missing/mistyped **or** `body.method !== 'PUT'`. `content-length`
in the body is ignored on purpose (research R2). `expiresInSeconds` is not
read (no grant outlives its attempt).

## 2 · `SubmissionOutcome` — `data/submissionContract.ts`

```ts
type SubmissionOutcome<F extends string = string> =
  | { kind: 'success' }                    // cvAttached REMOVED (FR-006)
  | { kind: 'field-errors'; fields: F[] }
  | { kind: 'cv-upload-failed' }           // NEW: application NOT sent
  | { kind: 'failure' }
```

`cv-upload-failed` is produced only by `submitApplicationFlow`, only when
`values.cv !== null` and the grant or the PUT failed. The contact flow never
produces it.

## 3 · Submit progress — `data/submissionContract.ts`

```ts
interface SubmissionProgress {
  /** Called once, right after a PUT answered 200 and before /careers. */
  cvUploaded(): void
}

interface ApplicationSubmitter {
  engage(host: HTMLElement): void
  submit(values: ApplicationFormValues, progress?: SubmissionProgress):
    Promise<SubmissionOutcome<ApplicationFieldId>>
}
```

`ContactSubmitter` is unchanged. The shared `FormSubmitter<V, F>` in
`useFormSubmitState.ts` gains the same optional second parameter.

## 4 · Form state machine — `logic/useFormSubmitState.ts`

```ts
type SubmitState =
  | 'idle' | 'invalid' | 'uploading' | 'sending'
  | 'success' | 'server-error' | 'cv-upload-error'
```

New option: `busyStateFor(values: V): 'uploading' | 'sending'` (default
`() => 'sending'`; the application passes `v => v.cv ? 'uploading' : 'sending'`).

| From | Event / guard | To | Effect |
|---|---|---|---|
| idle · invalid · server-error · cv-upload-error | attempt, client errors | invalid | focus first invalid |
| idle · invalid · server-error · cv-upload-error | attempt, spam guard trips | server-error | nothing sent |
| idle · invalid · server-error · cv-upload-error | attempt, valid, CV chosen | **uploading** | flow starts; fields read-only, button disabled, label "Subiendo CV…" |
| idle · invalid · server-error · cv-upload-error | attempt, valid, no CV | sending | as feature 29 |
| uploading | `progress.cvUploaded()` | **sending** | label "Enviando…" |
| uploading · sending | attempt | (ignored) | no second flow |
| uploading · sending | outcome `success` | success | as feature 29, no note |
| uploading · sending | outcome `field-errors` | invalid | as feature 29 |
| uploading | outcome `cv-upload-failed` | **cv-upload-error** | values and file kept; CV error with two actions |
| uploading · sending | outcome `failure` | server-error | as feature 29 |
| cv-upload-error | file changed or removed | idle | CV error hidden |

"attempt" = form submit (Enviar), `onRetryCvUpload`, or `onSubmitWithoutCv`
(after it set `cv = null`). All three run one function, `attemptSubmit()`,
which `onSubmit(event)` calls after `preventDefault()`.

Removed: the `cvAttached` ref and its return field.

## 5 · `useApplicationForm` additions/removals

| Member | Kind | Behaviour |
|---|---|---|
| `cvNoteVisible` | **removed** | FR-006 |
| `cvRejection` | `Ref<'format' \| 'size' \| null>` | set by `onCvReject`, cleared by a valid `onCvChange` |
| `onCvReject(kind)` | function | `values.cv = null`; `cvRejection = kind`; sends nothing |
| `onCvChange(file)` | changed | stores file; clears `cvRejection`; if state is `cv-upload-error`, state → `idle` |
| `onRetryCvUpload()` | function | `attemptSubmit()` with the CV unchanged |
| `onSubmitWithoutCv()` | function | `values.cv = null`, then `attemptSubmit()` |
| `cvUploadFailed` | `ComputedRef<boolean>` | `state === 'cv-upload-error'` |

CV field error shown = rejection message if `cvRejection` is set, else the
feature-29 rule (client error only when `state === 'invalid'`).

## 6 · i18n keys

| Key | ES | EN | Status |
|---|---|---|---|
| `forms.application.uploading` | "Subiendo CV…" | "Uploading CV…" | new (given by Roberto) |
| `forms.application.cvUploadError.message` | "No pudimos subir tu CV. Inténtalo de nuevo o envía la postulación sin CV." | "We couldn't upload your CV. Try again or submit without a CV." | new (given) |
| `forms.application.cvUploadError.retry` | "Reintentar subida" | "Retry upload" | new (given) |
| `forms.application.cvUploadError.submitWithoutCv` | "Enviar sin CV" | "Submit without CV" (OA-2 alternative: "Send without CV") | new (given) |
| `forms.application.success.cvNote` | — | — | **removed** both locales |

`ApplicationFormContent` changes: `success: { title }` (no `cvNote`); adds
`uploading: string` and `cvUploadError: { message; retry; submitWithoutCv }`.
None of the new strings contains `@`, so no `{'@'}` escaping is needed
(`rules.md` § R26).

## 7 · Constants (`data/submissionContract.ts`)

| Constant | Value | Change |
|---|---|---|
| `CV_PUT_TIMEOUT_MS` | 60 000 | unchanged; comment cites OA-3 |
| `CV_UPLOAD_METHOD` | `'PUT'` | new; the only method `parseUploadGrant` accepts |
| `S3_PUT_SUCCESS_STATUS` | 200 | new; the only status `putCv` treats as uploaded |

`applicationFields.ts`: `CV_MAX_BYTES` value unchanged; comment updated to
cite contract § 4 (5 MiB) instead of "propuesto".
