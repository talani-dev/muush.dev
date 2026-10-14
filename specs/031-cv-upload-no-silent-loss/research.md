# Research: A chosen CV is never lost in silence

**Feature**: `specs/031-cv-upload-no-silent-loss` | **Date**: 2026-10-13

Provenance tags: **CONFIRMED** (read in this repository on 2026-10-13, or in
`form-api-contract.md`), **INFERRED** (derived from confirmed facts),
**UNVERIFIED** (general platform knowledge; no docs tool or real browser was
available to this session; the implementer confirms before relying on it).

---

## R1 · What feature 29's code does today (CONFIRMED, read in the repo)

| Where | Today | Why it matters for feature 31 |
|---|---|---|
| `logic/submissionFlows.ts` `uploadCv` + `submitApplicationFlow` | Any upload failure returns `cvId = undefined` and the flow **still sends** `/careers`, then reports `success` with `cvAttached: false` | This is the defect. Must become a terminal `cv-upload-failed` outcome with no `/careers` call |
| `logic/formsApiClient.ts` `putCv` | `headers: grant.headers` (the signed object: `content-type` **and** `content-length`), `method: grant.method`, success = `response.ok` (any 2xx) | Must send only `content-type`, method `PUT`, success = status 200 exactly |
| `logic/formsApiClient.ts` `parseUploadGrant` | Accepts any non-empty `method`, any string `headers` record | Must require `method === 'PUT'` and a `content-type` header; extract only what the PUT uses |
| `logic/formsApiClient.test.ts` | Asserts `init.headers` **is** `grant.headers` and has keys `['content-type','content-length']` | That test encodes the old reading of contract § 4 and is rewritten (R2) |
| `ui/FileField.vue` | Emits `reject('format' \| 'size')` and clears the native input | `ui/ApplicationForm.vue` **does not listen** to `reject`: a rejected file vanishes with no message and the previous `values.cv` stays. FR-013 is unimplemented today |
| `logic/useFormSubmitState.ts` | Five states; `cvAttached` ref; single busy state `sending` | Gains `uploading` and `cv-upload-error`; `cvAttached` removed |
| `logic/useApplicationForm.ts` | `cvNoteVisible` | Removed; gains reject handling and the two CV actions |
| `ui/FormOutcome.vue` | Optional `note` prop, used only for the CV note | `note` prop removed (dead after FR-006) |
| `i18n/locales/{es,en}.json` | `forms.application.success.cvNote` | Removed; new keys in data-model § 6 |
| Fixtures with `cvNote` | `ApplicationForm.{test,stories}.ts`, `FormOutcome.{test,stories}.ts`, `about/ui/WorkWithMuushSection.{test,stories}.ts`, `tests/forms-application-copy.test.ts` | Type change forces each to be updated; the `about` edits are fixture-only |
| Fixtures with `cvAttached` | `ContactForm.stories.ts`, `useContactForm.test.ts`, `useApplicationForm.test.ts`, `submissionFlows.test.ts` | `success` loses `cvAttached` |
| Logging | `grep` over `app/`, `nuxt.config.ts`, `package.json`: **no** `console.*`, no Sentry, no analytics package | FR-014 holds today; a test locks it (R6) |

## R2 · Contract § 4 "send the headers exactly as returned" vs. "never set Content-Length"

- **Decision**: the PUT sends exactly one header, `content-type`, whose
  value is the grant's `headers['content-type']` byte for byte. It never
  sets `content-length`. The body is the visitor's original `File`
  (the raw object, `toRaw`, see `docs/harness/findings.md` § R66), never
  read, sliced, re-wrapped or converted.
- **Why this satisfies the contract's intent (INFERRED)**: § 4's concern is
  the signature: S3 compares the request against the headers that were
  signed into the URL, and "cualquier diferencia da 403". Both signed values
  still arrive identical:
  - `content-type`: sent by the site, exactly as returned.
  - `content-length`: the browser computes it from the `File` body, which
    is `file.size`, which is exactly the `contentLength` the site declared
    to `/careers/upload` (feature 29 FR-010, unchanged). Same value, so the
    signature still matches. This is why FR-009 requires the file untouched:
    any transformation would change the length and break the signature.
- **Why not pass the object as feature 29 did (UNVERIFIED, WHATWG Fetch
  standard as recalled; implementer confirms against MDN "Forbidden request
  header" before coding)**: `Content-Length` is a *forbidden request-header
  name*. In a browser, setting it from script is silently ignored, so
  feature 29's code was in practice already sending only `content-type`.
  Keeping it in the code is still wrong: it claims a control the site does
  not have, Node/undici (where tests run) does not apply the same rule, and
  a test that asserts "both headers sent" passes in Vitest while describing
  something no browser does.
- **Is it part of the production bug? INFERRED: no.** The browser drops the
  header, and a CORS failure (feature 31 description: the bucket lacks a
  CORS rule) rejects before any S3 status exists. The production defect is
  the silent degradation in R1's first row; the header change is a
  correctness/clarity fix done in the same place. Not verified in a real
  browser in this session.
- **Re-casing**: the key is written lower-case `content-type`, as the
  contract returns it. HTTP header names are case-insensitive on the wire,
  so this is fidelity to the contract text, not a functional need. The
  grant parser looks the key up case-insensitively so a server that
  re-cases it does not turn into a false CV failure.
- **For the human gate (OA-1)**: § 4's sentence "Manda los headers tal cual
  vienen… no omitas ninguno" should be rewritten by Roberto when he updates
  § 9 / § 7.5, so the next reader does not reintroduce `content-length`.
- **Infra note, not this repo's work (INFERRED)**: `application/pdf` is not
  a CORS-safelisted content type, so every PUT triggers a preflight. The
  bucket's CORS rule must allow origin `https://muush.dev`, method `PUT` and
  request header `content-type`. Passed to the leader for infra; nothing in
  the site changes it.

## R3 · What counts as a successful PUT

- **Decision**: `response.status === 200` → uploaded. Anything else
  (including 204 or other 2xx), a rejected `fetch` (network or CORS block,
  both surface as a `TypeError` with no status), or the abort timer →
  failed.
- **Rationale**: feature 31 description: "Éxito del PUT = 200 de S3;
  cualquier otra cosa … es fallo". S3 answers a successful presigned PUT
  with 200 (UNVERIFIED as a universal guarantee; it is the documented
  behaviour of PutObject).

## R4 · Time bounds (OA-3)

- **Decision (proposal for the gate)**: `CV_PUT_TIMEOUT_MS = 60_000`
  unchanged; `API_REQUEST_TIMEOUT_MS = 15_000` unchanged for
  `/careers/upload` and `/careers`.
- **Rationale**: 5 MiB at about 1 Mbit/s uplink is about 42 s; 60 s leaves
  margin without leaving the visitor on "Subiendo CV…" for minutes. The
  grant lives 600 s (contract § 4), far above 60 s plus the authorization.
- **Alternatives**: 30 s (fails legitimate slow-mobile uploads near 5 MiB);
  120 s (the honest error arrives too late to be useful). A timeout now ends
  in the CV error with a retry, not in a silent loss, so erring short is
  cheaper than before.

## R5 · Retry semantics and "fresh everything"

- **Decision**: every attempt is one call to `submitApplicationFlow`, which
  holds nothing across calls. "Reintentar subida", a new Enviar, and the
  first submit are the same code path, so each necessarily requests a new
  grant (new `uploadUrl`, new `cvId`) and new tokens through the existing
  `sendWithFreshToken` (feature 29). No grant, URL, `cvId` or token is
  stored on the form, the composable or the submitter.
- **Why it guarantees FR-007/FR-008 structurally**: there is no variable in
  which an old `uploadUrl` could survive. The test calls the flow twice and
  asserts the two PUT URLs and all tokens differ.
- **OA-4**: the retry continues to `/careers` after a 200 PUT. The visitor
  already expressed intent to submit.
- **Kept from feature 29**: a single silent retry on 403
  `challenge_failed` of `/careers/upload` (contract § 7.6), inside the
  attempt. A second refusal ends the attempt as `cv-upload-failed`.
- **Alternative rejected**: caching a successful `cvId` for the next attempt
  when `/careers` later fails. Saves a re-upload but adds state that can go
  stale, and the backend's object lifecycle is unknown. Recorded as a spec
  assumption.

## R6 · No logging of `uploadUrl` or personal data (FR-014)

- **Decision**: lock the current state with a static test in
  `tests/forms-config.test.ts`: no `console.` in any non-test file under
  `app/features/forms/`, and no import of an analytics or error-reporting
  SDK anywhere in `app/` (patterns: `@sentry/`, `posthog`, `gtag`,
  `plausible`, `umami`, `analytics`). The flow never throws an `Error`
  carrying the URL, and `catch` blocks keep discarding the caught value.
- **Scope note (INFERRED)**: a CORS block makes the **browser** print the
  blocked URL in DevTools. That is not site code and cannot be suppressed;
  the presigned URL expires in 600 s and authorises one PUT of one object.
  Recorded in spec Edge Cases.

## R7 · Immediate file checks (FR-013)

- **Decision**: reuse `FileField`'s existing `reject` event. `ApplicationForm`
  forwards it to a new `onCvReject(kind)` in `useApplicationForm`, which sets
  `values.cv = null` and a `cvRejection` ref (`'format' | 'size' | null`).
  The CV field's error is shown when `cvRejection` is set, independent of
  the submit state. A valid selection or a successful submit attempt clears
  it. Constants unchanged: `CV_ACCEPTED_TYPE = 'application/pdf'`,
  `CV_MAX_BYTES = 5 * 1024 * 1024` (= 5,242,880, equal to contract § 4).
- **Rationale**: the check already exists in two places (`FileField` and
  `validateApplicationForm`); only the wiring is missing. No new rule, so
  no backend change (contract § 7.7). The `CV_MAX_BYTES` comment ("máximo
  5MB propuesto … not a confirmed value") is updated to cite contract § 4,
  which now confirms it.
- **Boundary**: `size > CV_MAX_BYTES` rejects, so exactly 5,242,880 passes
  (spec US4-5).

## R8 · Visual building blocks (Art. VII; values UNVERIFIED against `.pen`)

Everything below reuses classes already in the forms module. No new token,
no new literal. Each is a placeholder for OA-5 until the leader confirms.

| Element | Reused from | Classes |
|---|---|---|
| CV error message | `FileField.vue` field error | `font-instrument text-form-label text-red-400` |
| Two actions | `FormOutcome.vue` support link (text, underlined, no box) | `font-instrument text-body-sm text-bone-100 underline` plus `focus-visible:outline-red-400` (`LinkArrow.vue`, ui-map § 10 "foco visible en Red 400") |
| Gap between message and actions, and between actions | `--spacing-field-label-gap` (field label ↔ control) and `--spacing-form-gap` | `gap-field-label-gap` (column), `gap-form-gap` (row) |
| Uploading state | `BotonPrimario` disabled + label swap, exactly as "Enviando…" | no new class |

- **Why not `BotonPrimario` for the actions**: `branding.md` allows one
  primary (LED) button per screen; the form's Enviar already is it.
- **Why not `LinkArrow`**: it renders an `<a href>` and adds a `→`; these
  are in-page actions, so they must be `<button type="button">` (they must
  not submit the form or navigate).
- **Open for the leader (OA-5)**: whether a frame exists; row vs. stacked;
  exact gaps; text-link vs. another treatment.

## R9 · Line budget (Art. V, ≤ 200 lines)

CONFIRMED `wc -l`: `ApplicationForm.vue` 182, `FileField.vue` 154,
`FormOutcome.vue` 64. Adding the CV error inline would push
`ApplicationForm.vue` near or past 200. **Decision**: new presentational
component `ui/CvUploadError.vue` (message + two buttons + focus on mount),
rendered by `ApplicationForm.vue` directly after `FileField`. Net change to
`ApplicationForm.vue` ≈ +12 lines (≈ 194); reviewer verifies with `wc -l`.
If it exceeds 200, the CV field and its error move into one `CvField.vue`
wrapper (fallback, not planned work).

## R10 · Things deliberately not done

- No change to the contact form's behaviour (it never had a CV).
- No change to `docs/business/` (human-only; OA-1).
- No change to bucket CORS (infra; R2 note).
- No new dependency, no Storybook play-function tooling.
- No caching of `cvId` across attempts (R5).
- `CLAUDE.md` has no `<!-- SPECKIT START/END -->` markers, so the agent
  context update step of `/speckit-plan` has nothing to update (and
  `spec_author` may not edit `CLAUDE.md`).
