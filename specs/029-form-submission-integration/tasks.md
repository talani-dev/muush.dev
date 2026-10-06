# Tasks: Form submission integration (contact + talent)

**Input**: `specs/029-form-submission-integration/` (spec.md, plan.md, research.md, data-model.md, contracts/, quickstart.md)
**Tests**: REQUIRED (feature_list acceptance 15, Constitution Art. X). Test names follow `should <expected> when <condition>`. Never real network; `fetchImpl` is injected, Turnstile is faked.

**Before T001**: the human gate must have decided spec.md "Open for approval" OA-1..OA-6. Where a decision differs from the proposal, change only the constant (OA-1), the i18n value (OA-2, OA-4) or the blocked-state mapping (OA-3) named in the task; nothing else depends on them.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: different file, no dependency on an incomplete task
- **[Story]**: US1 contact happy path · US2 application + CV · US3 errors and retry · US4 anti-spam

All paths are relative to the repo root.

---

## Phase 1: Setup

- [x] T001 Add `runtimeConfig.public.formsApiBaseUrl` (default: the base URL in `docs/business/landing/form-api-contract.md` § 1) and `runtimeConfig.public.turnstileSiteKey` (default `1x00000000000000000000BB`) to `nuxt.config.ts`, with a comment citing contract § 1/§ 9, research R1 (values baked at `pnpm generate`, override via `NUXT_PUBLIC_FORMS_API_BASE_URL` / `NUXT_PUBLIC_TURNSTILE_SITE_KEY`) and the Turnstile scoped-exception note (plan Complexity Tracking)
- [x] T002 [P] Rewrite `.env.example`: replace the "no variables yet" header; declare `NUXT_PUBLIC_FORMS_API_BASE_URL=https://api.example.invalid` and `NUXT_PUBLIC_TURNSTILE_SITE_KEY=your-invisible-turnstile-sitekey` under a "Form Submission API" heading, saying both are public identifiers, the real sitekey must be an *Invisible* key and goes only in `.env` / the production build env. Keep the existing deploy-credentials note. No real value
- [x] T003 [P] Create `tests/forms-config.test.ts`: (a) no file under `app/` contains `execute-api`, `api.muush.dev`, `1x00000000000000000000BB` or a `0x`-prefixed 20+ char sitekey literal; (b) `.env.example` declares both `NUXT_PUBLIC_*` keys; (c) no file under `app/` contains `process.env`. Read files from disk with `node:fs` + `process.cwd()` (`rules.md` § R27)

---

## Phase 2: Foundational (blocks every story)

### Types and constants

- [x] T004 Create `app/features/forms/data/submissionContract.ts`: `ContactPayload`, `CvUploadRequest`, `CvUploadGrant`, `CareersPayload`, `RoleId`, `ApiResult<T>`, `SubmissionOutcome`, `ContactSubmitter`, `ApplicationSubmitter` (data-model §§ 1–3, 6; `contracts/form-submitter.md`) and constants `API_PATHS`, `TURNSTILE_SCRIPT_URL`, `API_REQUEST_TIMEOUT_MS`, `CV_PUT_TIMEOUT_MS`, `TURNSTILE_TOKEN_TIMEOUT_MS`, `MIN_FILL_TIME_MS = 3_000` (comment: pending/approved OA-1), `HONEYPOT_FIELD_NAME` (data-model § 8). Types and constants only
- [x] T005 [P] Create `app/features/forms/data/turnstile.ts`: minimal `TurnstileApi` (`render`, `reset`, `execute`, `remove`) and `TurnstileRenderOptions` typing, plus a `declare global { interface Window { turnstile?: TurnstileApi } }`. Header comment: option names are UNVERIFIED in the spec session, confirm against Cloudflare's current docs via Context7 before relying on them (research R2)
- [x] T006 [P] In `app/features/forms/data/applicationFields.ts` export `ROLE_IDS` derived from `ROLE_CATALOG` (`flatMap`), typed so `RoleId` in T004 can use it

### Pure logic + tests

- [x] T007 [P] Write `app/features/forms/logic/submissionPayloads.test.ts` first (must fail): exact sorted key sets for contact email/whatsapp variants; `company: ""` when empty; trimming; whatsapp digits only; locale passthrough; careers key sets with/without portfolio, linkedin, whatsapp, cvId; never `cv`, honeypot, timestamp keys; `toRoleId` maps all 24 `${area}:${roleId}` values to exactly contract § 5's list and never yields `it`/`product`/`projectManagement`/`marketing`/`creative`; `ROLE_IDS` equals the contract's 24 ids literally; unknown option throws
- [x] T008 Implement `app/features/forms/logic/submissionPayloads.ts` (`buildContactPayload(values, locale, token)`, `buildCareersPayload(values, locale, token, cvId?)`, `toRoleId(optionValue)`) until T007 passes
- [x] T009 [P] Write `app/features/forms/logic/formsApiClient.test.ts` first: `classifyApiResponse` table of research R5 (200 ok, 200 without ok, 400 validation_failed, 400 invalid_json, 403 challenge_failed, 403 other, 500, 404, non-JSON body); client posts to `baseUrl + path` with `method: 'POST'`, `content-type: application/json`, exact JSON body, no other headers; a rejected `fetchImpl` and an abort-by-timeout (fake timers) both yield `failure`; `parseUploadGrant` rejects missing/mistyped fields; `putCv` passes `grant.headers` as the very same object (`toBe`) with `method` from the grant and the `File` as body, 2xx → ok, non-2xx/reject/timeout → failure
- [x] T010 Implement `app/features/forms/logic/formsApiClient.ts` (`createFormsApiClient({ baseUrl, fetchImpl = globalThis.fetch })` with `postContact`, `requestCvUpload`, `postCareers`, `putCv`; exported pure `classifyApiResponse`, `parseUploadGrant`; `AbortController` timeouts from T004) until T009 passes. Bodies typed `unknown` and narrowed
- [x] T011 [P] Write `app/features/forms/logic/sendWithFreshToken.test.ts` first: one token → one send on ok; on `challenge` a second, different token and exactly one resend; second `challenge` returned as-is (caller maps to failure), never a third send; `getToken` rejection → `failure` with zero sends
- [x] T012 Implement `app/features/forms/logic/sendWithFreshToken.ts` until T011 passes
- [x] T013 [P] Write `app/features/forms/logic/useTurnstile.test.ts` first, with a fake `window.turnstile` and a stubbed script insertion: script inserted once across many `engage` calls and only on `engage` (never at import/creation); `render` called once with the host, sitekey, `execution: 'execute'`, `appearance: 'interaction-only'`, `'response-field': false`; each `getToken()` calls `reset` then `execute` and resolves with the callback's token; two calls yield two tokens; `error-callback` and the token timeout reject; script load error rejects; nothing touches `window`/`document` when created outside the browser path
- [x] T014 Implement `app/features/forms/logic/useTurnstile.ts` (`createTurnstileTokenSource({ siteKey })` → `{ engage(host), getToken() }`, module-level script promise, one widget) until T013 passes. Header comment records the scoped third-party exception (FR-021, plan Complexity Tracking) and that it must never run during prerender
- [x] T015 [P] Write `app/features/forms/logic/serverFieldErrors.test.ts` first: research R9 table for both forms (visible → key; `company`, `contactPreference`, `locale`, `turnstileToken`, `cvId`, unknown → not mappable); `whatsapp` mappable only when preference is whatsapp; `activeServerErrors` drops a mark once the value differs from `valueAtMark`; `mergeErrors` keeps the form's field order with client errors winning
- [x] T016 Implement `app/features/forms/logic/serverFieldErrors.ts` until T015 passes
- [x] T017 [P] Write `app/features/forms/logic/submissionFlows.test.ts` first, with a fake client and a counting fake `getToken`: contact ok → success; contact validation (visible) → field-errors; (non-visible) → failure; challenge twice → failure; application without CV → one token, no upload, success `cvAttached: true`; with CV happy path → order upload → PUT → careers, two distinct tokens, careers payload has grant's `cvId`, second token requested only after PUT resolved; upload failure / malformed grant / upload validation / PUT failure / PUT timeout → careers sent without `cvId`, success `cvAttached: false`; CV ok but careers 500 → failure (no note); no flow ever throws
- [x] T018 Implement `app/features/forms/logic/submissionFlows.ts` (`submitContactFlow`, `submitApplicationFlow`, deps injected) until T017 passes, following `contracts/forms-api-client.md` § Flows exactly — *Implemented with `toOutcome` as the single place `success` is produced.*
- [x] T019 [P] Extract the duplicated `errorFor()` body of `ContactForm.vue`/`ApplicationForm.vue` into `app/features/forms/logic/fieldErrorMessage.ts` (pure: `(errorKey | undefined, fieldContent) → string | undefined`) with `fieldErrorMessage.test.ts`
- [x] T020 [P] Extract the duplicated `focusFirstInvalidField` of both composables into `app/features/forms/logic/focusField.ts` (`focusField(fieldId)`, next tick, `getElementById`)

### Nuxt seam

- [x] T021 Create `app/features/forms/logic/useFormSubmission.ts`: `useContactSubmitter()` / `useApplicationSubmitter()` read `useRuntimeConfig().public` and `useI18n().locale`, build one client (T010) and one token source (T014), and return the `ContactSubmitter` / `ApplicationSubmitter` of `contracts/form-submitter.md` wrapping the flows (T018). The only file in `forms/` that calls `useRuntimeConfig`
- [x] T022 Export the submitter types and the two composables from `app/features/forms/index.ts` (exactly the additions listed in `contracts/form-submitter.md`)

### Component extractions (Art. V budget, research R10) — no behaviour change yet

- [x] T023 `git mv app/features/forms/ui/ApplicationWhatsappField.vue app/features/forms/ui/WhatsappField.vue` (and its test); rewrite its header comment (now shared by both forms, old non-sharing reason no longer applies); update `ApplicationForm.vue` import
- [x] T024 Replace `ContactForm.vue`'s inline WhatsApp `<Transition>` + `<style scoped>` block with `<WhatsappField>`; delete the now-dead CSS. Existing `ContactForm.test.ts` must stay green
- [x] T025 [P] Create `app/features/forms/ui/FormOutcome.vue` (+ `FormOutcome.test.ts`, `FormOutcome.stories.ts`): props `kind: 'success' | 'server-error'`, `message`, `note?`, `errorFallback`; success = `role="status"` container, message `<p tabindex="-1">` focused on mount, optional note below; server-error = `role="alert"` paragraph with the existing `mailto:support@muush.dev` link. Reuse the exact classes the current success/error markup uses; no new token
- [x] T026 [P] Create `app/features/forms/ui/HoneypotField.vue` (+ test): `v-model` string; wrapper `aria-hidden="true"` + `sr-only`; `<input name>` = `HONEYPOT_FIELD_NAME`, `tabindex="-1"`, `autocomplete="off"`, type text; no visible label text. Test: not focusable via Tab order, hidden from the accessibility tree
- [x] T027 Replace both forms' local `errorFor()` with `fieldErrorMessage` (T019) and their success/error markup with `<FormOutcome>` (T025). Run `wc -l` on both: each must be ≤ 185 before Phase 3 starts — *Measured: ContactForm 172, ApplicationForm 182. The option-list builders also moved to `logic/selectOptions.ts` (+ test) to reach ≤185.*

**Checkpoint**: `pnpm test` green; both forms render exactly as before; no network code reachable yet.

---

## Phase 3: User Story 1 — Contact form really sends (P1) MVP

**Goal**: valid contact submit → sending → success, only on 200 `ok:true`.
**Independent test**: component test with a stub submitter resolving `success`; flow tests from T017.

- [x] T028 [P] [US1] Extend `app/features/forms/logic/useContactForm.test.ts` first: options `{ submitter }`; valid submit → `state` `sending` then `success` on `{kind:'success'}`; a submit while `sending` calls the submitter once only; `failure` → `server-error` with values intact; second submit from `server-error` sends again; `engage(host)` called on `focusin` and before submit
- [x] T029 [US1] Extend `app/features/forms/logic/useContactForm.ts` to the five-state machine of data-model § 4 (spam-guard and server-mark rows land in US4/US3): `ContactSubmitState` gains `sending | success | server-error`; `onSubmit` async; accept `{ submitter, challengeHost }`; rewrite the header comment (the "no fetch here, no success state" guarantee is replaced by "success only from a classified ok response", FR-012) until T028 passes — *Done through a shared `logic/useFormSubmitState.ts` (both forms use it, Art. VIII DRY) instead of duplicating the machine in each composable.*
- [x] T030 [US1] i18n: in `i18n/locales/es.json` and `en.json` change `forms.contact.success.title` to the `{channel}` form and add `forms.contact.success.channel.{email,whatsapp}` (data-model § 7, OA-4 as approved); update `ContactFormContent.success` in `app/features/forms/data/contactFields.ts` to `{ titleByChannel: Record<ContactPreference, string> }` and `app/features/forms/logic/useContactFormContent.ts` to build both variants with `t(key, { channel })`
- [x] T031 [US1] Update `app/features/forms/ui/ContactForm.vue`: required `submitter` prop; Turnstile host `<div ref>` inside the card below the button; `@focusin` → `engage`; `aria-busy` while sending; button `:disabled` + `content.sending` driven by real state (or `previewState` override); fields `readonly` while sending; `<FormOutcome>` success with `titleByChannel[values.contactPreference]`. Stays ≤ 200 lines
- [x] T032 [P] [US1] Update `app/features/forms/ui/ContactForm.test.ts`: stub submitter; sending disables button, shows "Enviando…", fields readonly; success replaces the form, has `role="status"`, focuses the confirmation, shows the chosen channel; `failure` keeps every value and shows the alert; no `fetch` called (spy on `globalThis.fetch` stays at 0 calls)
- [x] T033 [P] [US1] Update `app/features/forms/ui/ContactForm.stories.ts`: stub submitter arg on every story; success stories for both channels; keep `Sending`/`ServerError` via `previewState`
- [x] T034 [US1] Wire: `app/pages/index.vue` calls `useContactSubmitter()` and passes it; `app/features/landing/ui/ContactSection.vue` gains required `formSubmitter: ContactSubmitter` (type from `@/features/forms`) passed to `<ContactForm :submitter>`; update `ContactSection.test.ts`/`.stories.ts` with a stub
- [x] T035 [P] [US1] Update `tests/forms-copy.test.ts` for the changed contact success copy and the two channel keys in both locales

**Checkpoint**: contact form submits end-to-end against mocks; US1 acceptance 1–7 covered by T017/T028/T032.

---

## Phase 4: User Story 2 — Application with optional CV (P1)

**Goal**: application sent with role id; CV flow with two tokens; CV failure → success + note.
**Independent test**: T017 application cases + component test with stub outcomes `cvAttached: true/false`.

- [x] T036 [P] [US2] Extend `app/features/forms/logic/useApplicationForm.test.ts` first: same state cases as T028; `success` with `cvAttached: false` exposes `cvNoteVisible === true`, with `true` it is false
- [x] T037 [US2] Extend `app/features/forms/logic/useApplicationForm.ts` to the five-state machine (same shape as T029) plus `cvNoteVisible`; rewrite its header comment and `onCvChange`'s ("never sent" is now "sent only through the presigned upload in `submissionFlows.ts`, never in a JSON payload") — *Same shared `useFormSubmitState.ts` as T029.*
- [x] T038 [US2] i18n: add `forms.application.success.cvNote` to both locale files with OA-2's approved copy, `@` written `{'@'}` (`rules.md` § R26); add `cvNote` to `ApplicationFormContent.success` in `app/features/forms/data/applicationFields.ts` and to `app/features/forms/logic/useApplicationFormContent.ts`
- [x] T039 [US2] Update `app/features/forms/ui/ApplicationForm.vue` exactly as T031 (submitter prop, host div, focusin engage, aria-busy, real sending state) plus `<FormOutcome :note="cvNoteVisible ? content.success.cvNote : undefined">`. Stays ≤ 200 lines
- [x] T040 [P] [US2] Update `app/features/forms/ui/ApplicationForm.test.ts`: stub submitter; sending/readonly; success without and with the CV note; failure keeps values incl. the chosen file; the submitter receives values whose `areaRole` is the qualified option (conversion happens in the payload builder, asserted in T007)
- [x] T041 [P] [US2] Update `app/features/forms/ui/ApplicationForm.stories.ts`: stub submitter; new `SuccessWithCvNote` story (ES and EN)
- [x] T042 [US2] Wire: `app/pages/nosotros.vue` calls `useApplicationSubmitter()`; `app/features/about/ui/WorkWithMuushSection.vue` gains `formSubmitter: ApplicationSubmitter` passed to `<ApplicationForm :submitter>`; update its test/stories with a stub
- [x] T043 [P] [US2] Update `tests/forms-application-copy.test.ts` to assert `cvNote` in both locales

**Checkpoint**: both forms submit against mocks; US2 acceptance 1–6 covered.

---

## Phase 5: User Story 3 — Errors, retry, nothing lost (P2)

**Goal**: server field errors marked per input; 403 retried once; failures generic with values kept.
**Independent test**: composable + component tests feeding `field-errors` / `failure` outcomes; T011/T017 for retry.

- [x] T044 [P] [US3] Extend both composable tests (`useContactForm.test.ts`, `useApplicationForm.test.ts`) first: `{kind:'field-errors', fields:['email','whatsapp']}` → `state` `invalid`, `errors` contain the R9 keys for those fields, focus goes to the first in form order; editing `email` clears only its mark; switching WhatsApp → Correo drops the `whatsapp` mark with the value
- [x] T045 [US3] Add `serverMarks` handling to `useContactForm.ts` and `useApplicationForm.ts` using `serverFieldErrors.ts` (T016) and `focusField` (T020): displayed `errors` = `mergeErrors(client, activeServerErrors(marks, values))`; `firstInvalidFieldId` follows it
- [x] T046 [P] [US3] Component tests in `ContactForm.test.ts` and `ApplicationForm.test.ts`: server-marked input shows red border, its existing message, `aria-invalid="true"`, and receives focus; no `role="alert"` generic error in that case
- [x] T047 [P] [US3] Add to `submissionFlows.test.ts` (if not already covered by T017): 400 `invalid_json` → failure; 200 with `ok:false` → failure; `getToken` rejection (script blocked) → failure with zero API calls

**Checkpoint**: US3 acceptance 1–7 covered.

---

## Phase 6: User Story 4 — Bots stopped in the browser (P3)

**Goal**: honeypot or sub-minimum fill time → nothing sent, OA-3 state.

- [x] T048 [P] [US4] Write `app/features/forms/logic/useSpamGuard.test.ts` first (injected clock): blocked when honeypot non-blank; blocked when `readyAt` null; blocked when `now - readyAt < MIN_FILL_TIME_MS`; allowed at exactly the minimum; honeypot value never appears in any payload built by T008 (cross-check)
- [x] T049 [US4] Implement `app/features/forms/logic/useSpamGuard.ts` (`honeypot` ref, `markInteractive()` on `onMounted`, pure exported `isSubmissionBlocked`) until T048 passes
- [x] T050 [US4] Use the guard in `useContactForm.ts` and `useApplicationForm.ts`: after client validation passes, a blocked submit sets `state` to `server-error` (OA-3 as approved) and never calls `submitter.submit`; expose `honeypot` for binding. Extend both composable tests: zero submitter calls when blocked; a submit after the minimum proceeds
- [x] T051 [US4] Render `<HoneypotField v-model="honeypot">` inside both forms' `<form>` (`ContactForm.vue`, `ApplicationForm.vue`); component tests assert it is present, not tabbable, and that filling it results in no submitter call

**Checkpoint**: US4 acceptance 1–4 covered.

---

## Phase 7: Polish & cross-cutting

- [x] T052 [P] `tests/static-output.test.ts`: assert no generated page (`/es`, `/en`, `/es/nosotros`, `/en/about`) contains `challenges.cloudflare.com` in a `<script` tag, and none contains `preview-state`/`previewState` markup leakage; assert the four pages still render their form — *Also rewrote the two feature 016/020 "no `fetch(` in the compiled form chunk" assertions, which this feature supersedes (FR-011); they now assert no XMLHttpRequest / FormData / createObjectURL.*
- [x] T053 [P] Add a test (in `ContactSection.test.ts` and `WorkWithMuushSection.test.ts`, or a grep test in `tests/forms-config.test.ts`) that no file under `app/pages/` or `app/features/{landing,about}/` passes `previewState` — *Grep test in `tests/forms-config.test.ts`.*
- [x] T054 [P] Grep-verify FR-025: no `fetch(` / `XMLHttpRequest` under `app/features/forms/ui/`; add it to `tests/forms-config.test.ts`
- [x] T055 Run `wc -l app/features/forms/ui/*.vue`; every file < 200 (Art. V). Record the numbers in `docs/harness/progress/current.md` — *Numbers recorded in `docs/harness/progress/impl_form_submission_integration.md`.*
- [x] T056 Confirm the Turnstile option names used in `useTurnstile.ts` against Cloudflare's current docs (Context7) and record the outcome, including whether `1x00000000000000000000BB` is visible-mode (spec OA-5), in `docs/harness/findings.md` (technical finding, not a business rule) — *Context7 was not exposed to this subagent; verified by reading Cloudflare's public docs (markdown) directly. Recorded in `docs/harness/findings.md` § R65.*
- [x] T057 Run `pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm generate`, `pnpm storybook:build`; all must pass. Then the manual smoke of `quickstart.md` (expect CORS/404 from localhost, not success) — *All five commands pass. The manual browser smoke of `quickstart.md` was NOT run (no browser in this session); left for the reviewer / Roberto.*
- [x] T058 Check every Phase -1 gate in `plan.md` against the built result and leave each `[x]` only if it still holds

---

## Dependencies & Execution Order

- Phase 1 → Phase 2 → stories. Phase 2 is the bulk: types (T004–T006), pure logic with test-first pairs (T007–T020), seam (T021–T022), extractions (T023–T027, must land before any story touches the forms).
- US1 (Phase 3) and US2 (Phase 4) are independent of each other after Phase 2; they touch different form/composable/page files except the i18n JSON files (do T030 and T038 sequentially).
- US3 depends on US1 and US2 (it extends the same composables and form tests).
- US4 depends on US1 and US2 for the same reason; independent of US3 except for shared composable files (run sequentially).
- Phase 7 last.

### Parallel opportunities

- Phase 1: T002, T003 together.
- Phase 2: all test-first tasks T007, T009, T011, T013, T015, T017 can be written in parallel; then their implementations in any order (T018 needs T008, T010, T012). T019, T020, T025, T026 in parallel.
- US1: T032, T033, T035 in parallel after T031. US2: T040, T041, T043 in parallel after T039.

### Parallel example: Phase 2 tests

```text
T007 submissionPayloads.test.ts
T009 formsApiClient.test.ts
T011 sendWithFreshToken.test.ts
T013 useTurnstile.test.ts
T015 serverFieldErrors.test.ts
T017 submissionFlows.test.ts
```

## Implementation Strategy

1. MVP = Phases 1–3: the contact form submits for real (the landing's conversion point).
2. Add Phase 4 (talent) — same infrastructure, adds the CV flow.
3. Phases 5–6 harden failure and abuse paths; Phase 7 verifies the whole.
4. Nothing goes live until the release checklist in `quickstart.md` is done (API routes deployed, real Invisible sitekey in the production build). That is Roberto's, not the implementer's.

## Notes

- Do not edit `docs/business/`. Do not edit `.github/workflows/deploy.yml` (production deploy change needs Roberto's explicit approval).
- Never write a real sitekey or any credential into the repo, specs, tests or commit messages.
