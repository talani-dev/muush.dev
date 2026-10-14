# Implementation Plan: A chosen CV is never lost in silence

**Branch**: `031-cv-upload-no-silent-loss` | **Date**: 2026-10-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/031-cv-upload-no-silent-loss/spec.md`

## Summary

Turn every CV upload failure of the application form into a terminal,
visible state instead of a silent downgrade. `submitApplicationFlow` stops
sending `/careers` when the grant or the S3 PUT fails and returns a new
`cv-upload-failed` outcome; the form enters a new `cv-upload-error` state
that keeps every value and shows a CV error with two actions ("Reintentar
subida", "Enviar sin CV"). Each attempt is a fresh call of the flow, so a
new grant and new Turnstile tokens are structural, not remembered. The PUT
sends only `content-type` (the browser derives `content-length`), method
`PUT`, success = status 200. A new `uploading` busy state shows "Subiendo
CV…". `FileField`'s existing `reject` event is finally wired so invalid
files error immediately. Feature 29's CV note is deleted everywhere. All
edits live in `app/features/forms/`, its i18n keys, and fixtures that the
type change forces.

## Technical Context

**Language/Version**: TypeScript strict, Vue 3.5 `<script setup>`, Nuxt 4 (`nitro.preset: 'static'`)
**Primary Dependencies**: existing only; no new dependency
**Storage**: N/A
**Testing**: Vitest 4 + `@nuxt/test-utils` + happy-dom (global env), Vue Test Utils, Storybook 10
**Target Platform**: static files on S3 + CloudFront, modern browsers
**Project Type**: static web site (Nuxt SSG)
**Performance Goals**: no added request on pages or paths without a CV; invalid files cost zero requests
**Constraints**: Art. IV (no server), Art. V (≤ 200 lines, no fetch in `ui/`), Art. VII (no literals), contract § 4 (signed PUT), § 2 (single-use tokens)
**Scale/Scope**: 1 form, ~10 source files modified, 1 new component, ~12 test/story files updated

No `NEEDS CLARIFICATION` remains: the five gate items (spec OA-1..OA-5)
carry proposals the plan is built on; each maps to a constant, copy key or
class list (Design decisions D-8..D-10).

## Constitution Check

*GATE: evaluated before Phase 0 and re-evaluated after Phase 1 design. All
pass. No exception needs Complexity Tracking.*

### Phase -1: Pre-Implementation Gates

#### I · Feature-Based + Capas Architecture
- [x] All behavioural code stays in `app/features/forms/{data,logic,ui}`? → **Yes.** Outside it, only i18n JSON, `tests/forms-*.test.ts`, and fixture objects in `about/ui/WorkWithMuushSection.{test,stories}.ts` that the `ApplicationFormContent` type change forces.
- [x] Pages stay thin? → **Yes.** No page changes.
- [x] Anything added to `app/shared/`? → **No.**

#### II · Dependency Direction (NON-NEGOTIABLE)
- [x] `data/` imports nothing from `logic/`/`ui/`? → **Yes.** New types (`SubmissionProgress`, `cv-upload-failed`) and constants live in `data/submissionContract.ts`.
- [x] `logic/` imports only `data/` (and same-dir logic)? → **Yes.**
- [x] `ui/` imports `logic/`/`data/`/`@/shared/ui` only? → **Yes.** `CvUploadError.vue` imports nothing but Vue.

#### III · Feature Isolation (NON-NEGOTIABLE)
- [x] `about` touches `forms` only through the barrel? → **Yes.** Its two fixture files already import `ApplicationFormContent` from `@/features/forms`; only the object literals change.

#### IV · Static-Site Purity (NON-NEGOTIABLE)
- [x] No server route, middleware or request-time compute? → **Yes.** Browser → API and browser → S3 only, as in feature 29. `nitro.preset: 'static'` untouched; `pnpm generate` in the done gate.

#### V · Component Discipline
- [x] `ui/` never calls `fetch` or a Nuxt composable? → **Yes.** `CvUploadError.vue` is props + emits; the actions call composable functions via `ApplicationForm`. `tests/forms-config.test.ts` still enforces it.
- [x] Every component ≤ 200 lines? → **Yes, planned.** `ApplicationForm.vue` 182 → ≈ 194 by extracting the error block into `CvUploadError.vue` (research R9). Reviewer checks `wc -l`.
- [x] Complex logic out of `<script setup>`? → **Yes.** State transitions in `useFormSubmitState` / `useApplicationForm`; flow in `submissionFlows.ts`.

#### VI · i18n Parity (NON-NEGOTIABLE)
- [x] New keys in both locales, removed key removed from both? → **Yes** (data-model § 6). `tests/i18n-parity.test.ts` enforces; `tests/forms-application-copy.test.ts` asserts the exact copy.
- [x] No hardcoded user-facing string? → **Yes.** All four new strings arrive via `ApplicationFormContent`.
- [x] New routes? → **None.**

#### VII · Design Tokens Discipline
- [x] Zero hex/oklch/arbitrary values, no new token? → **Yes.** Only classes already used in `FileField.vue`, `FormOutcome.vue`, `LinkArrow.vue` (research R8). Exact layout is **UNVERIFIED against the `.pen`** and owned by the leader (spec OA-5); a value the leader supplies that has no token is added as a token in `global.css`, never as a literal.

#### VIII · Clean Code Discipline
- [x] No magic numbers? → `CV_UPLOAD_METHOD`, `S3_PUT_SUCCESS_STATUS`, `CV_PUT_TIMEOUT_MS` named in `data/submissionContract.ts`.
- [x] DRY? → One `attemptSubmit()` path serves Enviar, retry and send-without-CV; file checks reuse `FileField`'s existing rejection.
- [x] No dead code? → `cvAttached`, `cvNoteVisible`, `FormOutcome.note`, the `cvNote` key, `SuccessWithCvNote*` stories and the old "both headers" test are deleted, not left beside the new code. Feature-29 comments that describe the old behaviour (`submissionFlows.ts` `uploadCv` doc, `useApplicationForm.ts` header, `submissionContract.ts` `CvUploadGrant`/`SubmissionOutcome` docs, `FileField.vue`) are rewritten.
- [x] No speculative abstraction? → No retry counter, no backoff, no cached grant.

#### IX · TypeScript Strict + Biome
- [x] No `any`/`@ts-ignore`? → **Yes.** Grant body stays `unknown`, narrowed in `parseUploadGrant`.

#### X · Testing Discipline
- [x] Unit tests for logic, `should … when …` names? → **Yes**: client PUT/grant parsing, flow (fake client and real client over mocked `fetch`), state machine, application composable.
- [x] Component tests with stubbed submitter? → **Yes**: `ApplicationForm`, `CvUploadError`, `FormOutcome`.
- [x] Stories? → `ApplicationForm`: `Uploading`, `CvUploadError`, `CvUploadErrorEnglish`; `CvUploadError` own stories; `SuccessWithCvNote*` removed.
- [x] No E2E, no real network? → **Yes.**

#### XI · Configuration & Credential Hygiene (NON-NEGOTIABLE)
- [x] No `process.env`, no credential? → **Yes.** Nothing configurable changes. Test fixtures use `https://bucket.test.invalid/...` URLs, never a real presigned URL.
- [x] The temporary credential (`uploadUrl`) is never logged? → **Yes.** FR-014; static test (research R6).

#### XII · Absolute Imports via Alias
- [x] Cross-directory imports via `@/features/...`; same-dir relative only? → **Yes.**

## Design decisions

| ID | Decision | Detail |
|---|---|---|
| D-1 | New outcome `cv-upload-failed`; `success` loses `cvAttached` | data-model § 2 |
| D-2 | Flow returns `cv-upload-failed` before `/careers` on any CV failure; `progress.cvUploaded()` after PUT 200 | contracts/cv-upload-flow.md |
| D-3 | `CvUploadGrant` narrowed to `{ cvId, uploadUrl, contentType }`; parser requires `method === 'PUT'` | data-model § 1, research R2 |
| D-4 | PUT sends only `content-type`, never `content-length`; success = 200 only | research R2, R3 |
| D-5 | States `uploading` and `cv-upload-error`; one `attemptSubmit()` behind Enviar, retry and send-without-CV | data-model § 4 |
| D-6 | Immediate file errors through `FileField`'s existing `reject` → `onCvReject` | research R7 |
| D-7 | New presentational `CvUploadError.vue` (alert, two `type="button"`, focus retry on mount) | contracts/application-form-ui.md |
| D-8 | PUT timeout 60 s (OA-3 proposal) | research R4 |
| D-9 | Copy exactly as given by Roberto; EN "Submit without CV" pending OA-2 | data-model § 6 |
| D-10 | Visual treatment from existing classes, UNVERIFIED pending OA-5 | research R8 |
| D-11 | No state survives between attempts (no cached grant/URL/cvId/token) | research R5 |

## Accessibility

- CV error: `role="alert"`, so it is announced when it appears; focus moves
  to "Reintentar subida" on mount. The CV `<input>` gets
  `aria-describedby` pointing at the error message while it is shown.
- Uploading: same treatment as sending (`aria-busy` on the form, disabled
  button whose label is the status text, read-only fields). The CV actions
  are not rendered while busy.
- Immediate file error: rendered through `FileField`'s existing error slot
  (`aria-invalid`, `aria-describedby`); no focus move, since the visitor is
  already on the control.
- Actions keep a visible red-400 focus indicator (`ui-map.md` § 10).

## Project Structure

### Documentation (this feature)

```text
specs/031-cv-upload-no-silent-loss/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── cv-upload-flow.md
│   └── application-form-ui.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
i18n/locales/{es,en}.json                         # data-model § 6

app/features/forms/
├── data/
│   ├── submissionContract.ts                     # CvUploadGrant narrowed, SubmissionOutcome, SubmissionProgress, constants
│   └── applicationFields.ts                      # ApplicationFormContent shape; CV_MAX_BYTES comment
├── logic/
│   ├── formsApiClient.ts (+ .test.ts)            # parseUploadGrant, putCv (D-3, D-4)
│   ├── submissionFlows.ts (+ .test.ts)           # D-2, D-11
│   ├── useFormSubmission.ts                      # pass progress through to the flow
│   ├── useFormSubmitState.ts                     # D-5
│   ├── useApplicationForm.ts (+ .test.ts)        # D-5, D-6
│   ├── useApplicationFormContent.ts              # new keys, cvNote removed
│   └── useContactForm.test.ts                    # fixture: success without cvAttached
└── ui/
    ├── ApplicationForm.vue (+ .test.ts, .stories.ts)
    ├── CvUploadError.vue (+ .test.ts, .stories.ts)   # NEW (D-7)
    ├── FileField.vue                             # comment only
    ├── FormOutcome.vue (+ .test.ts, .stories.ts) # note removed
    └── ContactForm.stories.ts                    # fixture: success without cvAttached

app/features/about/ui/WorkWithMuushSection.{test,stories}.ts   # fixture shape only

tests/
├── forms-application-copy.test.ts                # new copy, cvNote absent
└── forms-config.test.ts                          # no console./analytics/Sentry (FR-014)
```

**Structure Decision**: everything stays in the `forms` module that owns
both forms (Constitution Art. I). The only edits outside are locale JSON,
repo-level tests, and fixtures forced by a type change.

## Risks

| Risk | Mitigation |
|---|---|
| Until infra adds the bucket CORS rule, every production CV upload ends in the CV error | Intended honest outcome; candidates can still choose "Enviar sin CV". Infra requirement recorded in research R2 for the leader |
| Removing `content-length` breaks the signature | It is a forbidden header the browser already drops; the browser sends the true length (= declared `contentLength`). Confirm in the post-CORS smoke (quickstart) |
| A real PDF reported with an empty MIME type by some OS is refused | Existing behaviour, unchanged; contract requires `application/pdf`. Note for Roberto if candidates report it |
| Re-uploads after a `/careers` failure leave unreferenced objects in the bucket | Backend lifecycle concern, recorded in spec Assumptions |
| `ApplicationForm.vue` crosses 200 lines | `CvUploadError.vue` extraction planned; fallback `CvField.vue` wrapper (research R9) |

## Complexity Tracking

No constitution violation to justify.
