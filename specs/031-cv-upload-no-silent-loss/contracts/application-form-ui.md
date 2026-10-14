# Contract: ApplicationForm UI surface after feature 31

## `ui/CvUploadError.vue` (new, presentational)

```ts
interface Props {
  id: string            // DOM id of the message, for aria-describedby on the CV input
  message: string
  retryLabel: string
  submitWithoutCvLabel: string
}
emits: { retry: []; 'submit-without-cv': [] }
```

- Root: `role="alert"`. On mount, focus moves to the retry button (spec
  FR-003).
- Both actions are `<button type="button">`: they never submit the form by
  themselves and never navigate. The parent decides what they do.
- No composable, no i18n, no network, no Nuxt API (Art. V, `rules.md`
  § R23 corollary).
- Classes: research R8 only (UNVERIFIED against the `.pen`, OA-5).

## `ui/ApplicationForm.vue` (changed)

- Renders `<CvUploadError>` directly after `<FileField>` while
  `shownState === 'cv-upload-error'`; `@retry` → `onRetryCvUpload`,
  `@submit-without-cv` → `onSubmitWithoutCv`.
- `<FileField @reject="onCvReject">`; CV `error` prop = rejection message
  when set, else the feature-29 rule.
- Submit label: `uploading` state → `content.uploading`; `sending` →
  `content.sending`; else `content.submit`. Disabled and fields read-only in
  both busy states.
- `FormOutcome` no longer receives `note`.
- `previewState` (Storybook-only) widens to
  `'uploading' | 'sending' | 'success' | 'server-error' | 'cv-upload-error'`.
  `tests/forms-config.test.ts` still asserts no page/section passes it.
- Stays ≤ 200 lines (research R9).

## `ui/FileField.vue`

Unchanged behaviour. Comment updated: `reject` now has a listener, and the
"5MB propuesto" wording points at contract § 4.

## `ui/FormOutcome.vue`

`note` prop and its `<p>` removed. Everything else unchanged.

## Barrel `index.ts`

No new export. `SubmissionOutcome` type (already exported) changes shape;
`ApplicationSubmitter` gains the optional `progress` parameter. Consumers
outside `forms` (`about`, pages) pass the submitter through untouched, so
only their fixtures change.
