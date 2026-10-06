# Implementation Plan: Form submission integration (contact + talent)

**Branch**: `029-form-submission-integration` | **Date**: 2026-10-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/029-form-submission-integration/spec.md`

## Summary

Replace the no-op `onSubmit` of `ContactForm` and `ApplicationForm` with real
submission to the external Form Submission API (`form-api-contract.md`). The
browser builds contract-exact JSON payloads with pure functions, obtains a
fresh Invisible Turnstile token per request (single 403 retry), uploads an
optional CV straight to S3 through a presigned PUT with the returned headers
untouched, and maps every response to one of three outcomes: success, field
errors, failure. All network code lives in `forms/logic/`; `ui/` receives a
`submitter` prop created by the pages. A client-only honeypot plus minimum
fill time stops bots before anything is sent. Turnstile's script is a scoped,
lazy, client-only third-party exception. Verification is unit/component tests
with mocked `fetch` and a fake Turnstile; the real API returns 404 today.

## Technical Context

**Language/Version**: TypeScript strict, Vue 3.5 `<script setup>`, Nuxt 4.5 (`ssr: true`, `nitro.preset: 'static'`)
**Primary Dependencies**: existing only (`nuxt`, `@nuxtjs/i18n`, Tailwind v4). **No new dependency**: `fetch`, `AbortController` and a hand-typed 4-function Turnstile interface suffice
**Storage**: N/A (the backend stores; the client keeps nothing)
**Testing**: Vitest 4 + `@nuxt/test-utils` + happy-dom (global env, `rules.md` § R16), Vue Test Utils, Storybook 10 for visual states
**Target Platform**: static files on S3 + CloudFront; modern browsers
**Project Type**: static web site (Nuxt SSG)
**Performance Goals**: zero bytes from Cloudflare for visitors who never touch a form; no added JS on pages without a form beyond the forms module already shipped
**Constraints**: Art. IV (no server), Art. V (≤200 lines, no fetch in `ui/`), Art. XI (runtimeConfig only), contract § 6 (unknown fields rejected), § 2 (single-use 300 s tokens)
**Scale/Scope**: 2 forms, 3 endpoints, ~10 new files in `forms/`, 4 thin wiring edits outside it

## Constitution Check

*GATE: evaluated before Phase 0 and re-evaluated after Phase 1 design. All
pass; the one deliberate exception (Turnstile runtime script) is recorded in
Complexity Tracking.*

### Phase -1: Pre-Implementation Gates

#### I · Feature-Based + Capas Architecture
- [x] Does all new code live in `app/features/forms/{data,logic,ui}`? → **Yes.** Outside `forms`, only wiring: two pages (call two barrel composables) and two sections (one pass-through prop each).
- [x] Do pages stay thin? → **Yes.** One composable call and one prop binding each, same pattern as `useContactFormContent`.
- [x] Anything added to `app/shared/`? → **No.** Everything is forms-specific.

#### II · Dependency Direction (NON-NEGOTIABLE)
- [x] `data/` imports nothing from `logic/`/`ui/`? → **Yes.** `submissionContract.ts` and `turnstile.ts` are types and constants; `submissionContract.ts` may import types from sibling `data/` files only.
- [x] `logic/` imports only `data/`? → **Yes.** Client, flows, payload builders, Turnstile and spam guard import `data/` only.
- [x] `ui/` imports `logic/`/`data/`/`@/shared/ui` only? → **Yes.**

#### III · Feature Isolation (NON-NEGOTIABLE)
- [x] `landing` and `about` reach `forms` only through `@/features/forms`? → **Yes.** They import the `ContactSubmitter`/`ApplicationSubmitter` *types* from the barrel; pages import the two composables from the barrel.

#### IV · Static-Site Purity (NON-NEGOTIABLE)
- [x] No `server/api/`, no server middleware, no request-time compute? → **Yes.** The requests are browser → external API and browser → S3, exactly what Art. IV's last paragraph permits.
- [x] `nitro.preset: 'static'` unchanged; `pnpm generate` still writes every route? → **Yes.** Turnstile and `fetch` only run in DOM event handlers, never during prerender; `tests/static-output.test.ts` asserts no Turnstile script in generated HTML.

#### V · Component Discipline
- [x] `ui/` never calls `fetch` or a Nuxt composable? → **Yes.** The `submitter` prop is the only door to the network (FR-025).
- [x] Every component under 200 lines? → **Requires extraction, planned.** `ContactForm.vue` is 221 and `ApplicationForm.vue` 205 today. Extract `WhatsappField.vue` (rename of `ApplicationWhatsappField.vue`, now shared), `FormOutcome.vue`, `HoneypotField.vue`, and move `errorFor()` into `logic/fieldErrorMessage.ts`. Target ≤185 each, verified with `wc -l` by the reviewer (research R10).
- [x] Complex logic out of `<script setup>`? → **Yes.** State machine in the two form composables; flows, retry, classification, payloads are pure `logic/` functions.

#### VI · i18n Parity (NON-NEGOTIABLE)
- [x] New keys in both locales? → **Yes**: `forms.contact.success.channel.{email,whatsapp}`, `forms.application.success.cvNote`, changed `forms.contact.success.title` (data-model § 7). `tests/i18n-parity.test.ts` enforces.
- [x] No hardcoded user-facing string? → **Yes.** Honeypot has no visible label text (aria-hidden); outcome copy comes through `content`.
- [x] New routes? → **None.**

#### VII · Design Tokens Discipline
- [x] Zero hex/arbitrary values? → **Yes.** `FormOutcome.vue` reuses the exact classes the current success/error markup uses; the honeypot uses Tailwind's `sr-only` core utility. No new token.

#### VIII · Clean Code Discipline
- [x] No magic numbers? → Timeouts, min fill time, paths and honeypot name are named constants in `data/submissionContract.ts`.
- [x] DRY? → The duplicated `errorFor()` and `focusFirstInvalidField()` become one `logic/` function each; the WhatsApp field becomes one component.
- [x] No speculative abstraction? → One client, one retry helper, two flows. No generic HTTP layer, no plugin, no module.
- [x] No dead code? → `ContactForm`'s inline WhatsApp markup/CSS is deleted, not left beside `WhatsappField`. Obsolete "no fetch here" comments in both composables are rewritten.

#### IX · TypeScript Strict + Biome
- [x] No `any`/`@ts-ignore`? → **Yes.** Response bodies are `unknown`, narrowed by `classifyApiResponse` and `parseUploadGrant`. `window.turnstile` typed via `data/turnstile.ts`.

#### X · Testing Discipline
- [x] Unit tests for logic with `should … when …` names? → **Yes**: payloads, classification, retry, both flows, Turnstile composable (fake API + fake script), spam guard, server-mark resolution, role-id mapping.
- [x] Component tests with stubbed submitter? → **Yes**, both forms: sending/readonly, success + live region + focus, field errors from server, generic error, CV note, honeypot not focusable, no request when blocked.
- [x] Stories updated? → **Yes**: stub submitter arg; new `SuccessWithCvNote` story.
- [x] No E2E, no real network? → **Yes** (Art. X; the API 404s today).

#### XI · Configuration & Credential Hygiene (NON-NEGOTIABLE)
- [x] Only `runtimeConfig`, no `process.env` in app code? → **Yes** (FR-001).
- [x] `.env.example` updated with placeholders? → **Yes** (FR-003).
- [x] No real credential anywhere? → **Yes.** The API has none (contract § 1). The sitekey default is Cloudflare's public test key; the real sitekey is never written to the repo or specs. A test greps `app/` for the API host and for sitekey-shaped literals.

#### XII · Absolute Imports via Alias
- [x] Cross-directory imports use `@/features/...`? → **Yes**; same-directory relative imports only.

## Design decisions

| ID | Decision | Detail |
|---|---|---|
| D-1 | Config in `nuxt.config.ts` `runtimeConfig.public` (`formsApiBaseUrl`, `turnstileSiteKey`) with defaults = contract URL / test key | research R1 |
| D-2 | `useContactSubmitter()` / `useApplicationSubmitter()` are the only Nuxt-aware pieces; pages create them and pass them down as props | research R11, `contracts/form-submitter.md` |
| D-3 | `createFormsApiClient({ baseUrl, fetchImpl, timeouts })` with `classifyApiResponse` pure; `fetchImpl` injected (default `globalThis.fetch`) so tests never stub globals | research R5, `contracts/forms-api-client.md` |
| D-4 | `sendWithFreshToken(getToken, send)` implements fresh-token-per-request + exactly one 403 retry | research R4 |
| D-5 | `submitContactFlow` / `submitApplicationFlow` pure async functions with injected deps; produce `SubmissionOutcome` | data-model § 3 |
| D-6 | `useTurnstile` = lazy script loader (module-level promise) + one explicit widget, `execution: 'execute'`, `appearance: 'interaction-only'`, reset + execute per token | research R2 (API UNVERIFIED, confirm via Context7) |
| D-7 | Spam guard in its own composable with injectable clock; min fill 3 s pending OA-1; blocked → `server-error` state pending OA-3 | research R8 |
| D-8 | Server marks resolved purely from `(marks, values)`; editing clears them | data-model § 4.1 |
| D-9 | Form state machine extends to five states; `previewState` survives as story-only display override | data-model § 4, research R12 |
| D-10 | Extract `WhatsappField`, `FormOutcome`, `HoneypotField`, `fieldErrorMessage`, `focusField` | research R10 |
| D-11 | Contact success copy interpolates `{channel}` pending OA-4; CV note key pending OA-2. Each is one i18n key, so approval changes copy only | data-model § 7 |

## Accessibility

- Sending: `BotonPrimario` receives `disabled` (falls through to its native
  `<button>`, as the current story path already does), label "Enviando…",
  all fields `readonly`. Add `aria-busy="true"` on the `<form>` while sending.
- Success: `FormOutcome` renders the confirmation in a `role="status"`
  container; the confirmation paragraph has `tabindex="-1"` and receives
  focus after render (the form, and the focused button, are removed).
- Server error: `role="alert"` paragraph (existing copy + `mailto:` link),
  form stays mounted, focus stays where it was (the button).
- Server field errors: identical treatment to client errors (`aria-invalid`,
  `aria-describedby`, red border) and focus to the first marked input, via
  the shared `focusField` helper.
- Honeypot: wrapper `aria-hidden="true"` + `sr-only`, input `tabindex="-1"`,
  `autocomplete="off"`; never focusable or announced.
- Turnstile host: empty `div`; with `interaction-only` it renders nothing in
  the normal flow.

## Project Structure

### Documentation (this feature)

```text
specs/029-form-submission-integration/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── forms-api-client.md
│   └── form-submitter.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
nuxt.config.ts                              # + runtimeConfig.public (D-1)
.env.example                                # + two NUXT_PUBLIC_* placeholders
i18n/locales/{es,en}.json                   # data-model § 7

app/features/forms/
├── index.ts                                # + submitter types, two composables
├── data/
│   ├── contactFields.ts                    # ContactFormContent.success shape change
│   ├── applicationFields.ts                # ApplicationFormContent.success.cvNote; ROLE_IDS
│   ├── submissionContract.ts               # NEW payload/result/outcome types, constants
│   └── turnstile.ts                        # NEW minimal TurnstileApi typing
├── logic/
│   ├── submissionPayloads.ts (+ .test.ts)  # NEW buildContactPayload, buildCareersPayload, toRoleId
│   ├── formsApiClient.ts (+ .test.ts)      # NEW client, classifyApiResponse, parseUploadGrant, putCv
│   ├── sendWithFreshToken.ts (+ .test.ts)  # NEW
│   ├── submissionFlows.ts (+ .test.ts)     # NEW submitContactFlow, submitApplicationFlow
│   ├── useTurnstile.ts (+ .test.ts)        # NEW
│   ├── useSpamGuard.ts (+ .test.ts)        # NEW
│   ├── serverFieldErrors.ts (+ .test.ts)   # NEW server field → key map, activeServerErrors, mergeErrors
│   ├── fieldErrorMessage.ts (+ .test.ts)   # NEW extracted errorFor body
│   ├── focusField.ts                       # NEW extracted focusFirstInvalidField
│   ├── useFormSubmission.ts                # NEW Nuxt seam: useContactSubmitter, useApplicationSubmitter
│   ├── useContactForm.ts (+ test)          # state machine extended
│   ├── useApplicationForm.ts (+ test)      # state machine extended
│   ├── useContactFormContent.ts            # success.titleByChannel
│   └── useApplicationFormContent.ts        # success.cvNote
└── ui/
    ├── ContactForm.vue (+ test, stories)   # submitter prop, extractions
    ├── ApplicationForm.vue (+ test, stories)
    ├── WhatsappField.vue (+ test)          # RENAMED from ApplicationWhatsappField.vue
    ├── FormOutcome.vue (+ test, stories)   # NEW
    └── HoneypotField.vue (+ test)          # NEW

app/features/landing/ui/ContactSection.vue (+ test/stories)   # formSubmitter pass-through
app/features/about/ui/WorkWithMuushSection.vue (+ test/stories)
app/pages/index.vue, app/pages/nosotros.vue                    # create submitters

tests/
├── forms-config.test.ts                    # NEW: no API host / sitekey literal in app/; .env.example keys
├── forms-copy.test.ts, forms-application-copy.test.ts  # updated copy assertions
└── static-output.test.ts                   # + no Turnstile script in generated HTML; no previewState leak
```

**Structure Decision**: everything behavioural stays in the existing `forms`
module (Constitution Art. I names it as the owner of both forms). The only
edits outside it are wiring that already exists for `formContent`.

## Risks

| Risk | Mitigation |
|---|---|
| Production build ships the test sitekey → every submit fails (server rejects test tokens) | Release prerequisite in spec + quickstart; deploy workflow change left to Roberto (research R13) |
| Turnstile option names differ from research R2 | Isolated in `useTurnstile.ts`; implementer confirms via Context7 before coding |
| Server email regex stricter than client | Handled as field error (US3-1) |
| Client timeout after server processed → duplicate lead on retry | Accepted (research R6) |
| `areaRole` composite value leaks into payload | `toRoleId` + 24-id equality test (research R7) |

## Complexity Tracking

| Exception | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| Runtime third-party script (`challenges.cloudflare.com`), against the "no third-party request at runtime" practice `branding.md`/`nuxt.config.ts` record for fonts | The API rejects every request without a Turnstile token (contract § 2); the token can only be produced by Cloudflare's script in the visitor's browser | Self-hosting the script is unsupported by Cloudflare (UNVERIFIED, standard guidance) and would break on their updates; no token = no submission. Scope limited to: pages with a form, after engagement, client-only (FR-021) |
| Default API base URL lives in `nuxt.config.ts` | Builds without `.env` must still target the deployed API | `''` default ships a silently broken form when an env var is forgotten |
