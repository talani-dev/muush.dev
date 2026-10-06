# Research: Form submission integration

**Feature**: `specs/029-form-submission-integration` | **Date**: 2026-10-05

Provenance tags: **CONFIRMED** (read in the repository or in
`form-api-contract.md`), **INFERRED** (derived from confirmed facts),
**UNVERIFIED** (from general knowledge; no docs tool was available to this
session; the implementer MUST confirm against Cloudflare's current Turnstile
docs via Context7 before coding the item).

---

## R1 · Where the configuration lives, and when it is read

- **Decision**: `nuxt.config.ts` gains
  `runtimeConfig.public.formsApiBaseUrl` and
  `runtimeConfig.public.turnstileSiteKey`. Nuxt maps them to
  `NUXT_PUBLIC_FORMS_API_BASE_URL` and `NUXT_PUBLIC_TURNSTILE_SITE_KEY`.
  Defaults: the contract's current base URL (public, not a credential,
  contract § 1) and the decided test sitekey `1x00000000000000000000BB`
  (§ 9). Only `logic/useFormSubmission.ts` calls `useRuntimeConfig()`.
- **Rationale**: Art. XI (no `process.env` in app code), contract § 1 ("léela
  desde configuración… un cambio de configuración, no de código"). Defaulting
  the base URL in `nuxt.config.ts` (configuration, outside `app/`) means a
  build without `.env` still targets the right API; the future
  `api.muush.dev` migration is one env var.
- **Static-site nuance (INFERRED from Nuxt's static output)**: with
  `nitro.preset: 'static'` there is no server at request time, so the public
  runtime config is serialized into the generated pages **at `pnpm generate`
  time**. The env vars must be present when the site is generated, not when it
  is served. This is why the real sitekey must reach the deploy build
  (release prerequisite in spec.md).
- **Alternatives rejected**: base URL default `''` (a deploy without the var
  ships a form that can never submit, silently); app-level constants file
  (violates FR-001/acceptance 1).

## R2 · Turnstile integration shape (UNVERIFIED API details)

- **Decision**: explicit rendering of **one** widget per page, created lazily
  and reused:
  1. Load `https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit`
     by inserting a `<script>` element **once per page lifetime** (module-level
     promise), only in the browser, triggered by the first `focusin` inside the
     form or by submit, whichever comes first.
  2. `turnstile.render(hostElement, { sitekey, execution: 'execute',
     appearance: 'interaction-only', 'response-field': false, callback,
     'error-callback', 'expired-callback' })` once, keep the widget id.
  3. Per request: `turnstile.reset(widgetId)` then `turnstile.execute(widgetId)`;
     the `callback(token)` resolves the pending promise, `error-callback`
     rejects it. A bounded wait (`TURNSTILE_TOKEN_TIMEOUT_MS`) rejects too.
- **Rationale**: § 9 "Invisible" + "fresh token per request". `execution:
  'execute'` decouples rendering from token generation, so a token is minted
  at the moment of each request (contract § 2: single use, 300 s). Reset
  before execute guarantees a new token rather than the cached one.
  `appearance: 'interaction-only'` keeps the widget hidden unless Cloudflare
  demands interaction, which also hides it with the visible-mode test key
  (spec OA-5). `'response-field': false` stops the widget injecting a hidden
  input into the DOM; the payload is built from values, never from the form
  element, but this removes the ambiguity entirely.
- **Host element**: an empty `<div>` rendered by the form component inside
  the card, below the submit button, passed to the submitter on first
  engagement. If Cloudflare ever needs an interactive challenge, it appears in
  context instead of at the end of `<body>`.
- **UNVERIFIED, must be confirmed by the implementer**: exact option names
  (`execution`, `appearance`, `response-field`, callback keys), that
  `reset` + `execute` yields a new token each time, the `?render=explicit`
  parameter, and the dev/test key is `1x00000000000000000000BB` (invisible
  always-pass; `…AA` is the visible one, confirmed by the leader against
  Cloudflare's testing docs on 2026-10-05). If any differs, adjust `logic/useTurnstile.ts` only;
  nothing else depends on Turnstile's surface.
- **Typing**: a minimal `TurnstileApi` interface in `data/turnstile.ts`
  covering only `render`, `reset`, `execute`, `remove`. **No new
  dependency** (no `@types/…`, no Nuxt Turnstile module): one script, four
  functions, and a module would add supply-chain surface for no gain
  (Art. VIII, `rules.md` § R14 reasoning).
- **Alternatives rejected**: implicit rendering (`cf-turnstile` class, auto
  token on load: the token would age from page load and be reused); a Nuxt
  Turnstile module (new dependency, and some render the script in SSR head,
  breaking FR-021); loading the script in `app.head` (every page, every
  visitor, before engagement; contradicts the scoped exception).

## R3 · The branding.md "no third-party runtime request" practice

- **CONFIRMED**: `branding.md` § Tipografía and `nuxt.config.ts` record that
  fonts are self-hosted so "the deployed artefact makes no request to a third
  party at runtime". That is a statement about fonts, enforced by
  `@nuxt/fonts`.
- **Decision**: Turnstile is a **deliberate, scoped exception**, recorded in
  plan.md Complexity Tracking and in a comment in `logic/useTurnstile.ts`:
  only pages with a form, only after engagement, only in the browser. The
  external API and the S3 upload are not "third parties" in that sense; they
  are muush's own backend (Art. IV explicitly allows the browser call).
- **Verification**: `tests/static-output.test.ts` asserts no generated page
  contains a `challenges.cloudflare.com` script tag.

## R4 · Fresh token count per flow (CONFIRMED from contract § 2)

| Flow | Tokens |
|---|---|
| Contact, happy path | 1 |
| Contact, one 403 then OK | 2 |
| Application without CV | 1 |
| Application with CV, happy path | 2 (upload, careers) |
| CV, 403 on upload then 403 on careers, both retried | 4 |

The S3 `PUT` needs no token. The second token is requested **after** the PUT
resolves (spec edge case "slow CV upload").

## R5 · Response classification

- **Decision**: one pure function `classifyApiResponse(status, body)` →

| Input | Result |
|---|---|
| 200 and `body.ok === true` | `ok` (with body) |
| 400 and `body.error.code === 'validation_failed'` and `fields` is a string array | `validation` (fields) |
| 403 and `body.error === 'challenge_failed'` | `challenge` |
| 400 `invalid_json`, 500, any other status, 200 without `ok:true`, unparseable JSON | `failure` |
| `fetch` rejects, or aborted by timeout | `failure` |

- **Rationale**: FR-012 (success only on 200 + ok:true), FR-014, FR-017,
  FR-018. A 403 with a different `error` is still treated as `failure`, not
  retried, because only `challenge_failed` is documented as retryable.

## R6 · Timeouts (technical, not business)

- **Decision**: `API_REQUEST_TIMEOUT_MS = 15_000`, `CV_PUT_TIMEOUT_MS = 60_000`
  (5 MiB at ~1 Mbit/s ≈ 42 s), `TURNSTILE_TOKEN_TIMEOUT_MS = 20_000`, via
  `AbortController`. Named constants in `data/submissionContract.ts`.
- **Rationale**: spec edge case "request hangs". The PUT URL lives 10 min
  (contract § 4), well above the PUT bound plus the second token.
- **Known trade-off**: a request that times out client-side may still have
  been processed; a retry could duplicate a lead. Accepted: a duplicate lead
  is cheaper than a lost one, matching the contract's own priority.

## R7 · `areaRole`: the select emits `${area}:${roleId}` (CONFIRMED)

- `ApplicationForm.vue` builds option values as `` `${area}:${roleId}` ``
  (feature 20 plan D-6). Sending that would be rejected (contract § 5).
- **Decision**: the payload builder converts with `toRoleId(optionValue)`
  (text after the first `:`), and validates membership in the set derived
  from `ROLE_CATALOG`; an unknown value throws (a programming error, caught
  by the flow and surfaced as `failure`). The UI keeps the qualified value
  (the select still needs unique option values; `sales` exists as both an
  area and a role).
- **Test**: every one of the 24 option values maps to exactly the contract's
  24 role ids, and no area id is ever produced.

## R8 · Anti-spam guard

- **Decision**: `useSpamGuard({ now })` exposes `honeypot` (a ref bound to a
  hidden input) and `markInteractive()` (called in `onMounted`, the moment the
  form is interactive in the browser), plus a pure
  `isSubmissionBlocked({ honeypot, readyAt, now, minFillMs })`.
  `MIN_FILL_TIME_MS = 3_000` pending spec OA-1. A blocked submit sends nothing
  and produces the OA-3 state.
- **Honeypot markup**: an `<input>` with an innocuous non-autofill name
  (`HONEYPOT_FIELD_NAME = 'muush_website'`), `tabindex="-1"`,
  `autocomplete="off"`, inside a wrapper with `aria-hidden="true"` that is
  visually hidden through an existing screen-reader-only utility
  (`sr-only` is a Tailwind core utility, no token needed). It is **not**
  `type="hidden"` (bots skip those) and **not** bound to any payload.
- **Rationale**: ui-map.md § 7, § 9 decision 3. The clock is injectable so
  tests never sleep.

## R9 · Server field errors → existing messages (CONFIRMED keys)

The existing `errorFor()` resolves a key's last segment against the field's
content. Server marks reuse the existing keys, so no new copy is needed:

| Form | Server field | Key suffix used | Visible input |
|---|---|---|---|
| contact | `name` | `errorRequired` | yes |
| contact | `email` | `errorFormat` | yes |
| contact | `identity` | `errorRequired` | yes |
| contact | `need` | `errorLength` | yes |
| contact | `whatsapp` | `errorDigits` | yes, only when preference is WhatsApp |
| application | `name` | `errorRequired` | yes |
| application | `email` | `errorFormat` | yes |
| application | `areaRole` | `errorRequired` | yes |
| application | `portfolio` | `errorFormat` | yes |
| application | `linkedin` | `errorFormat` | yes |
| application | `whatsapp` | `errorDigits` | yes, only when preference is WhatsApp |
| either | `company`, `contactPreference`, `locale`, `turnstileToken`, `cvId`, unknown | none | **no → generic error** |

`company` has no client rule and no message; `contactPreference` is a radio
with a default and no error slot. Either being rejected means the site sent
something it should not have, i.e. a site defect (spec US3-6).

## R10 · Line budget of the two form components (CONFIRMED)

`ContactForm.vue` is 221 lines and `ApplicationForm.vue` 205 today, both over
Art. V's 200. This feature adds behaviour to both, so extraction is mandatory,
not optional:

- `WhatsappField.vue`: rename of `ApplicationWhatsappField.vue`, now used by
  both forms (removes ~45 lines of inline field + transition CSS from
  `ContactForm.vue`). Its own header comment explains why it was not shared
  before; that reason (ContactForm out of scope) no longer holds.
- `FormOutcome.vue`: success panel (live region, focus target, optional CV
  note) and server-error message (live region, support link).
- `HoneypotField.vue`: the trap input.
- `logic/fieldErrorMessage.ts`: the duplicated `errorFor()` body becomes one
  pure function used by both (Art. VIII DRY).

Target: each form ≤ 185 lines; reviewer verifies with `wc -l`.

## R11 · Where the submitter is created (CONFIRMED wiring)

- `app/pages/index.vue` already calls `useContactFormContent()` from the
  `forms` barrel and passes it down through `ContactSection` as
  `formContent`. Same for `nosotros.vue` / `WorkWithMuushSection`.
- **Decision**: pages also call `useContactSubmitter()` /
  `useApplicationSubmitter()` from the barrel and pass the result as a
  `submitter` prop through the section to the form. `ui/` never calls a Nuxt
  composable (keeps Storybook and bare `mount()` working, `rules.md` § R23
  corollary) and never touches `fetch`.
- **Alternatives rejected**: the form calling `useRuntimeConfig()` itself
  (breaks Storybook, mixes Nuxt into `ui/`); `provide/inject` (invisible
  dependency, harder to test than a prop).

## R12 · `previewState`

Kept as the Storybook-only display override (stories cannot drive a real
network flow without a play-function toolchain this repo does not install).
Its meaning changes from "the only place these states exist" to "forces the
displayed state". A test asserts no page or section passes it. The
"structural no-fake-success" guarantee moves to FR-012's tests on the flow
functions: success is only ever produced from a classified `ok` response.

## R13 · Things deliberately not done

- No change to `.github/workflows/deploy.yml`: passing the real sitekey to
  the production build is a production-deploy change and needs Roberto's
  explicit go-ahead (release prerequisite in spec.md).
- No CSP work: the site sets none today (INFERRED from `nuxt.config.ts`). If
  one is added later it must allow `challenges.cloudflare.com` (script,
  frame), the API origin and the S3 upload origin (connect).
- No E2E (Art. X), no real network in tests.
