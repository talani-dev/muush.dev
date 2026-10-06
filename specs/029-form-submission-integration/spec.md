# Feature Specification: Form submission integration (contact + talent)

**Feature Branch**: `029-form-submission-integration`
**Created**: 2026-10-05
**Status**: Draft (spec_ready, pending human approval)
**Input**: Feature 29 `form_submission_integration` in `feature_list.json`.
Primary source: `docs/business/landing/form-api-contract.md` (backend contract
derived from the deployed handler) and its § 9, Roberto's decisions of
2026-10-05, which are final.

---

## Open for approval (resolve at the gate)

Everything below is undecided by a human. Each item carries a proposal so the
gate is a yes/no, not a design session. Nothing else in this spec is open.

| # | Item | Proposal | Marker |
|---|---|---|---|
| OA-1 | Minimum fill time (contract § 9 asks the spec to propose it) | **3 seconds**, measured from the moment the form becomes interactive in the browser until submit. A person cannot type a name, an email, pick an option and write ten characters in under 3 s; browser autofill only fills name/email, so a real person never trips it | [NEEDS CLARIFICATION: approve 3 s or give another value] |
| OA-2 | ES/EN copy of the "CV could not be attached" note in the talent success state (contract § 9) | **ES:** "Tu perfil llegó, pero no pudimos adjuntar tu CV. Si quieres, mándalo a support@muush.dev." · **EN:** "Your profile came through, but we couldn't attach your CV. If you'd like, send it to support@muush.dev." | [NEEDS CLARIFICATION: approve or rewrite the copy] |
| OA-3 | What the visitor sees when the honeypot or the minimum time blocks a submit. § 9 says the submit "does not go out"; it does not say what is shown. A fake success is ruled out (contract § 7.2) | Show the **same generic error state** used for a server failure (approved copy, values kept, retry allowed). A real person who trips the timer just presses Enviar again; a bot gets nothing useful | [NEEDS CLARIFICATION: approve generic error, or choose silent no-op] |
| OA-4 | The approved contact success copy literally contains `[correo/WhatsApp]` / `[email/WhatsApp]`. Until now the state was story-only, so the bracket never mattered | Interpolate the channel the visitor chose: "…Te respondemos por **correo**…" / "…por **WhatsApp**…"; EN "…by **email**…" / "…by **WhatsApp**…". The rest of the sentence is unchanged | [NEEDS CLARIFICATION: approve the interpolation reading] |
| OA-5 | Observation, not a new decision: the originally decided dev/test sitekey `1x00000000000000000000AA` is, per Cloudflare's testing docs as recalled (UNVERIFIED in this session), the *visible-mode* always-pass key; `1x00000000000000000000BB` is the invisible-mode one | Keep `…AA` as decided. Consequence: in dev/Storybook a small widget may appear when Turnstile is triggered; "nothing visible" (FR-020) is verifiable only with an Invisible sitekey. The plan sets `appearance: interaction-only` so even `…AA` stays hidden unless Cloudflare demands an interaction | Confirm `…AA` stays, or switch the default to `…BB` |
| OA-6 | Data-processing consent for contact data and CVs. `ui-map.md` § 9 records "El consentimiento de datos sigue sin definirse"; this feature is the first one that actually transmits personal data and CV files | **Out of scope for this feature**; no consent checkbox or privacy link is added. If Roberto wants one before go-live it is a separate feature with its own approved copy | [NEEDS CLARIFICATION: confirm it does not block this feature] |

> ✅ **Approved at the human gate by Roberto, 2026-10-05: "aprobado como está".**
> Every proposal above is now a decision: OA-1 3 s; OA-2 the copy as written;
> OA-3 the generic error state with values kept; OA-4 interpolate the chosen
> channel; OA-5 the dev/test key is `1x00000000000000000000BB`, the *invisible*
> always-pass key (confirmed by the leader against Cloudflare's testing docs,
> where `…AA` is the visible one); OA-6 consent is out of scope and does not
> block. Wiring the real sitekey into the production deploy workflow is NOT
> part of this feature; Roberto owns it. Every [NEEDS CLARIFICATION] above is
> resolved by this note.

Release prerequisites that are **not** questions but must be true before the
forms go live (recorded so nobody discovers them in production):

- The real Turnstile sitekey (configured as *Invisible* in Cloudflare) must be
  supplied to the production build. A production build that falls back to the
  test key produces a site where every submission fails, because the real
  server rejects test-key tokens (contract § 9).
- The production build must also receive the API base URL if it ever differs
  from the configured default (planned migration to `api.muush.dev`).
- The API routes must exist (contract § 0: they return 404 today).

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A prospect sends the contact form and it really arrives (Priority: P1)

A visitor on the landing (`/es/#contacto` or `/en/#contacto`) fills in the
seven fields of `ui-map.md` § 7 and presses Enviar / Send. The form shows a
sending state, the project request reaches muush, and the form is replaced by
the approved confirmation in the same card. Nothing about the anti-abuse
check is visible to the visitor.

**Why this priority**: It is the conversion point of the whole landing. Today
the button does nothing on a valid form; every lead is silently lost.

**Independent Test**: With the network mocked to answer 200 `{ok:true}`, fill
the contact form validly and submit: exactly one request with the contract's
fields is sent, the sending state appears, then the success copy replaces the
form. Verifiable without the talent form existing.

**Acceptance Scenarios**:

1. **Given** a valid contact form with preference "Correo", **When** the
   visitor submits, **Then** one request is sent carrying exactly `name`,
   `email`, `company`, `identity`, `need`, `contactPreference`, `locale`,
   `turnstileToken`, with no `whatsapp` property and no anti-spam data.
2. **Given** the visitor left "Empresa o proyecto" empty, **When** they
   submit, **Then** `company` is sent as an empty string.
3. **Given** preference "WhatsApp" with "55 1234 5678", **When** they submit,
   **Then** `whatsapp` is sent and holds the 10 digits.
4. **Given** the visitor is on `/en/`, **When** they submit, **Then**
   `locale` is `"en"` (and `"es"` on `/es/`), regardless of the language of
   anything they typed.
5. **Given** the request is in flight, **Then** the submit button is
   disabled, reads "Enviando…" / "Sending…", the fields are read-only, and a
   second press sends nothing.
6. **Given** the server answers 200 with `ok:true`, **Then** the form is
   replaced by the success copy in the same card, announced to assistive
   technology, and focus moves to the confirmation.
7. **Given** the server answers anything other than 200 with `ok:true`
   (including 200 without `ok:true`), **Then** success is never shown.

---

### User Story 2 - A candidate applies, with or without a CV (Priority: P1)

A visitor on Nosotros (`/es/nosotros#work`, `/en/about#work`) fills in the
application form. If they attached a PDF, it is uploaded first and then the
application is sent referencing it. If no CV was attached, the application is
sent on its own. If attaching the CV fails at any step, the application is
still sent and the success state says the CV did not make it.

**Why this priority**: Same as US1 for talent: today every applicant is lost.
Losing the attachment is acceptable; losing the candidate is not (contract
§ 7.5).

**Independent Test**: With mocked network, submit (a) without CV → one
application request without `cvId`; (b) with CV → upload authorization,
file upload with the returned headers, application request with `cvId`;
(c) with CV and a failing upload step → application request without `cvId`
and the success note visible.

**Acceptance Scenarios**:

1. **Given** a valid application with no CV, **When** submitted, **Then** one
   application request is sent with exactly `name`, `email`, `areaRole`,
   `contactPreference`, `locale`, `turnstileToken`, plus `portfolio` /
   `linkedin` only when filled, `whatsapp` only when preference is WhatsApp,
   and no `cvId`, no file, no anti-spam data.
2. **Given** the visitor picked "Backend" under the IT area, **Then**
   `areaRole` is `"backend"`, never an area id (`it`, `product`,
   `projectManagement`, `marketing`, `creative`) and never a composite like
   `"it:backend"`.
3. **Given** a valid application with a PDF, **When** submitted, **Then** the
   sequence is: upload authorization (declaring `application/pdf` and the
   file's real byte size) → file upload to the returned address using exactly
   the returned headers → application request including the returned `cvId`.
4. **Given** the CV flow, **Then** the upload authorization and the
   application request each carry a different, freshly obtained anti-abuse
   token.
5. **Given** the upload authorization fails, or the file upload fails, or the
   upload address has expired, **When** the flow continues, **Then** the
   application is sent without `cvId`, and on 200 `ok:true` the success state
   shows the approved success copy **plus** the CV note (OA-2).
6. **Given** the CV uploaded fine and the application request fails,
   **Then** the generic error is shown (the CV note is never shown on an
   error).

---

### User Story 3 - Something goes wrong and nothing typed is lost (Priority: P2)

When the server rejects or fails, the visitor sees an accurate outcome: the
specific fields the server objected to are marked; an expired or failed
anti-abuse check is retried once silently; a server or network failure shows
the approved generic error with the support address, and everything typed
stays in place so they can retry.

**Why this priority**: The happy path (US1, US2) delivers the value; this
story keeps a failed attempt from costing the lead.

**Independent Test**: With mocked responses for 400 `validation_failed`, 403
`challenge_failed` (once, then twice), 500, a network rejection and a 400
`invalid_json`, observe the resulting state and request count.

**Acceptance Scenarios**:

1. **Given** the server answers 400 `validation_failed` with
   `fields: ["email","whatsapp"]`, **Then** those two inputs show their
   existing per-field error message (red border, short message,
   `aria-invalid`), focus moves to the first of them in form order, no
   global error is shown, and no value is cleared.
2. **Given** the visitor edits a field the server marked, **Then** that
   field's server mark is cleared (client validation applies again as usual).
3. **Given** the server answers 403 `challenge_failed`, **Then** a new token
   is obtained and the same request is sent again exactly once; if the retry
   succeeds the visitor only ever sees sending → success.
4. **Given** the retry also answers 403, **Then** the generic error is shown
   and no third request is sent.
5. **Given** a 500, a network failure, or a response that cannot be read,
   **Then** the generic error (approved copy, `ui-map.md` § 7) is shown, all
   captured values remain, and pressing Enviar again starts a fresh attempt.
6. **Given** a 400 `invalid_json`, or a `validation_failed` naming a field the
   visitor cannot see or fix (e.g. `locale`, `turnstileToken`, `cvId`), **Then**
   the generic error is shown: it is a site defect, not the visitor's.
7. **Given** the anti-abuse script cannot load or cannot produce a token
   (blocked, offline), **Then** the generic error is shown, values remain.

---

### User Story 4 - Bots are turned away before anything is sent (Priority: P3)

Automated submissions that fill the hidden trap field, or submit faster than
a person could, are stopped in the browser and never reach the server; their
trap data never appears in any request.

**Why this priority**: Defense in depth on top of the mandatory server-side
check; low visitor impact.

**Independent Test**: Fill the hidden field, or submit before the minimum
time, and observe zero requests and the state chosen in OA-3.

**Acceptance Scenarios**:

1. **Given** the hidden trap field has any value, **When** submit, **Then** no
   request is sent and the OA-3 state is shown.
2. **Given** less than the minimum fill time (OA-1) has elapsed since the
   form became interactive, **When** submit, **Then** no request is sent and
   the OA-3 state is shown; submitting again after the time has elapsed
   proceeds normally.
3. **Given** any submission that does go out, **Then** neither the trap value
   nor any timestamp is part of the request.
4. The trap field is not reachable by keyboard, not announced by screen
   readers, not offered by browser autofill, and not visible.

---

### Edge Cases

- **Token expiry (300 s)**: a token is obtained immediately before each
  request, never earlier, so a form left open for ten minutes still sends a
  valid token; the single 403 retry covers the residual case.
- **Slow CV upload**: the second token (for the application request) is
  obtained only after the file upload finishes, never in parallel with it.
- **Server and client rules disagree** (e.g. the server's email check is
  stricter): handled by US3-1, the field is marked with its existing message.
- **Double submit**: impossible while sending (button disabled, form
  read-only); a second submit event during sending is ignored.
- **Visitor switches WhatsApp → Correo after a server mark on `whatsapp`**:
  the field and its value are discarded as today, and its mark with it.
- **Locale switched mid-form**: navigation reloads the page in the other
  locale; nothing persists across it (existing behaviour, unchanged).
- **No JavaScript**: the form cannot submit (it never could); no request, no
  false success. Unchanged from features 16/20.
- **Page prerendering**: the anti-abuse script is never part of the
  generated HTML; it loads only in the browser, only on pages with a form.
- **Server answers 200 with `ok:false` or an unexpected body**: generic error.
- **Request hangs**: an attempt that receives no answer within a bounded time
  ends in the generic error rather than "Enviando…" forever (bound in plan).

---

## Requirements *(mandatory)*

Numbering is new for this feature. Where a requirement supersedes one from
features 16 or 20 it says so.

### Configuration

- **FR-001**: The API base address and the Turnstile sitekey MUST come from
  public runtime configuration, overridable at build time through
  environment variables. Neither value may appear in any file under `app/`.
- **FR-002**: The default sitekey MUST be Cloudflare's always-pass test key
  `1x00000000000000000000BB` (decision § 9). The real key lives only in the
  gitignored `.env` and the deploy environment.
- **FR-003**: `.env.example` MUST declare both variables with placeholder
  values and a comment saying which is public and where the real value goes.
  No real credential is written anywhere (Constitution Art. XI); none exists
  for this API (contract § 1).

### Payloads

- **FR-004**: The contact request MUST carry exactly the contract § 3 keys:
  `name`, `email`, `company`, `identity`, `need`, `contactPreference`,
  `locale`, `turnstileToken`, plus `whatsapp` only when the preference is
  WhatsApp. No other key.
- **FR-005**: `company` MUST be sent as `""` when empty.
- **FR-006**: `whatsapp` MUST be omitted when the preference is email.
- **FR-007**: The application request MUST carry exactly `name`, `email`,
  `areaRole`, `contactPreference`, `locale`, `turnstileToken`, plus
  `portfolio` / `linkedin` only when non-empty, `whatsapp` only when the
  preference is WhatsApp, and `cvId` only when a CV upload fully succeeded.
  No other key (in particular no file, no file name, no trap value, no
  timestamp).
- **FR-008**: `areaRole` MUST be one of the 24 role ids of contract § 5 and
  never an area id.
- **FR-009**: `locale` MUST be the active site locale (`es` / `en`), never
  derived from field content.
- **FR-010**: The upload authorization MUST declare `contentType`
  `application/pdf` and `contentLength` equal to the file's real size.

### Flow and states

- **FR-011**: Supersedes 016 FR-013/FR-014 and 020 FR-003/FR-005/FR-011. A
  valid submit MUST send the request(s) and move through the real states
  idle → sending → success | server-error | invalid. These three states are
  no longer story-only.
- **FR-012**: Success MUST be shown only after a 200 response whose body has
  `ok: true`, for `/contact` or `/careers`. Nothing else may produce it.
- **FR-013**: Every request to the API MUST use a token obtained for that
  request alone; a token is never reused. The CV flow therefore uses two
  distinct tokens, and a 403 retry a third.
- **FR-014**: On 403 `challenge_failed` the client MUST obtain a new token
  and resend the same request exactly once; a second 403 ends in the generic
  error.
- **FR-015**: CV flow order MUST be upload authorization → file upload →
  application. The file upload MUST use the returned method, address and
  headers exactly as returned: no header added, removed, renamed or
  re-cased.
- **FR-016**: Any failure in the upload authorization (any non-success
  answer, including after its own 403 retry) or in the file upload (any
  non-2xx, network failure, or expired address) MUST lead to the
  application being sent without `cvId`; on its success the CV note (OA-2)
  is shown under the success copy.
- **FR-017**: On 400 `validation_failed`, every name in `fields[]` that maps
  to a visible input MUST be marked with that input's existing error message
  and focus MUST go to the first marked input in form order. If any name does
  not map to a visible input, the generic error is shown instead.
- **FR-018**: On 500, network failure, timeout, unreadable or unexpected
  response, or 400 `invalid_json`, the generic error copy of `ui-map.md` § 7
  MUST be shown, all values preserved, retry allowed.
- **FR-019**: During sending the submit control MUST be disabled and show
  "Enviando…" / "Sending…" (existing copy), fields read-only.

### Anti-abuse

- **FR-020**: The Turnstile check MUST run in Invisible mode: in the normal
  flow nothing is shown to the visitor (subject to OA-5 in dev).
- **FR-021**: The third-party Turnstile script MUST load only in the browser,
  only on pages that contain a form, and not before the visitor engages the
  form (first focus in the form, or submit). It MUST NOT appear in
  prerendered HTML. Supersedes, for this script only, the "no third-party
  request at runtime" practice `branding.md` records for fonts.
- **FR-022**: Supersedes 016 FR-017. Both forms MUST include a hidden trap
  field and a minimum fill time (OA-1); either blocks the submit in the
  browser (OA-3), and neither ever appears in a request.

### Accessibility and copy

- **FR-023**: Success and error outcomes MUST be announced through a live
  region; on success, focus MUST move to the confirmation so it is not lost
  when the form is removed.
- **FR-024**: Every new or changed string (CV note, contact success channel
  interpolation) MUST exist in both `es.json` and `en.json`; no string is
  hardcoded in a component.

### Architecture constraints (from the constitution, testable)

- **FR-025**: No component under `ui/` performs a network request; all
  network code lives in `logic/` (Art. V).
- **FR-026**: No server route, server middleware or runtime server is added;
  the requests go from the browser to the external API (Art. IV).

### Key Entities

- **Contact submission**: the eight/nine contract § 3 keys built from the
  contact form values and the active locale.
- **Application submission**: the contract § 5 keys built from the
  application form values, the active locale and, optionally, a `cvId`.
- **CV upload grant**: `cvId`, upload address, method, headers, lifetime;
  returned by the upload authorization, used once, never shown.
- **Submission outcome**: success (with `cvAttached` for applications),
  field errors (list of form fields), or failure.
- **Anti-abuse token**: single-use, short-lived proof obtained per request.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: With the API answering normally, 100% of valid contact and
  application submissions reach the server, and 0 show success without a
  confirmed receipt.
- **SC-002**: A visitor who leaves the form open for over 5 minutes before
  submitting still succeeds on the first press (no visible error).
- **SC-003**: When attaching the CV fails, 100% of those applications still
  arrive, and every such visitor is told the CV did not attach.
- **SC-004**: After any failed attempt, 100% of typed values are still
  present and the visitor can resend with one press.
- **SC-005**: Zero requests contain a key outside the contract's tables
  (verified by automated tests over every payload variant).
- **SC-006**: Visitors who never interact with a form download nothing from
  the anti-abuse provider.
- **SC-007**: In the normal flow, visitors see no captcha or challenge UI.

## Assumptions

- The contract in `form-api-contract.md` is authoritative for field names,
  rules and error shapes; the client mirrors the server, never the reverse
  (contract § 7.7). Client validation rules are unchanged by this feature.
- Strings are sent trimmed; `whatsapp` is sent as its digits only (the server
  strips non-digits anyway, contract § 3).
- `portfolio` and `linkedin` are omitted when empty rather than sent as `""`,
  because the contract only defines them "si va" and unknown/empty handling
  is not documented for them; `company` is the only field the contract says
  to send as `""`.
- CV remains optional (`CV_REQUIRED = false`, decisions-open #7 unchanged).
- The real API returns 404 until the infra apply completes (contract § 0);
  all verification uses mocked network. No end-to-end tests (Art. X).
- SES sandbox means confirmation emails may not arrive; not a defect of this
  feature (contract § 0).
- CORS allows only `https://muush.dev`, so local development cannot reach the
  real API; this is expected.
- Only one form exists per page, so one anti-abuse widget per page suffices.
