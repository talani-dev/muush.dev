# Quickstart: verifying feature 31

All verification is local with mocked network (Constitution Art. X).

```bash
pnpm check && pnpm typecheck && pnpm test && pnpm generate && pnpm storybook:build
```

## Automated evidence to look for

| Acceptance (feature_list.json #31) | Test file |
|---|---|
| 1, 7 — no `/careers` after a CV failure; `cvId` only after PUT 200 | `logic/submissionFlows.test.ts` (fake client) and its "real client over mocked fetch" block |
| 2, 3 — CV error copy + two actions; "Enviar sin CV" | `ui/ApplicationForm.test.ts`, `ui/CvUploadError.test.ts`, `logic/useApplicationForm.test.ts` |
| 4, 5 — new `uploadUrl` and tokens on every retry | `logic/submissionFlows.test.ts` (two calls), `logic/useApplicationForm.test.ts` (retry calls submitter again) |
| 6 — PUT body/headers | `logic/formsApiClient.test.ts` |
| 8 — "Subiendo CV…" + disabled | `logic/useApplicationForm.test.ts`, `ui/ApplicationForm.test.ts` |
| 9 — type/size immediate, zero requests | `ui/ApplicationForm.test.ts`, `logic/useApplicationForm.test.ts` |
| 10 — no logging | `tests/forms-config.test.ts` |
| 11 — no CV note | `tests/forms-application-copy.test.ts`, `ui/FormOutcome.test.ts` |
| 12 — parity | `tests/i18n-parity.test.ts`, `tests/forms-application-copy.test.ts` |
| 13 — no fetch in `ui/` | `tests/forms-config.test.ts` (existing) |

## Manual look (Storybook)

`Forms/ApplicationForm` → stories `Uploading`, `CvUploadError`,
`CvUploadErrorEnglish`; `Forms/CvUploadError`. Compare against the frame the
leader supplies for OA-5.

## Manual smoke in production (after infra fixes bucket CORS)

Not part of this feature's gate. With DevTools open on `/es/nosotros#work`:
attach a small PDF, submit, and check that the PUT request carries only
`content-type` set by the page (the browser adds `content-length`), answers
200, and `/careers` carries `cvId`. Before the CORS fix, the same steps must
end in the CV error with both actions and **no** `/careers` request.
