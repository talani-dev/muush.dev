# Data Model: Form submission integration

**Feature**: `specs/029-form-submission-integration` | **Date**: 2026-10-05

All types live in `app/features/forms/data/` (no Vue, no Nuxt, no logic).
Functions live in `app/features/forms/logic/`.

---

## 1 · Payloads (contract §§ 3–5)

### 1.1 `ContactPayload`

| Key | Type | Source | Rule |
|---|---|---|---|
| `name` | string | `values.name.trim()` | |
| `email` | string | `values.email.trim()` | |
| `company` | string | `values.company.trim()` | `""` when empty (FR-005) |
| `identity` | `IdentityOption` | `values.identity` | never `''` (client validation guarantees) |
| `need` | string | `values.need.trim()` | |
| `contactPreference` | `'email' \| 'whatsapp'` | `values.contactPreference` | |
| `whatsapp` | string, **optional key** | digits of `values.whatsapp` | present iff preference is `whatsapp` (FR-006) |
| `locale` | `'es' \| 'en'` | active i18n locale | FR-009 |
| `turnstileToken` | string | fresh token | FR-013 |

Exact key sets (asserted with `Object.keys(...).sort()` in tests):
- email preference: 8 keys, no `whatsapp`.
- whatsapp preference: 9 keys.

### 1.2 `CvUploadRequest`

| Key | Type | Value |
|---|---|---|
| `contentType` | `'application/pdf'` | `CV_ACCEPTED_TYPE` (already in `applicationFields.ts`) |
| `contentLength` | number | `file.size` (FR-010) |
| `turnstileToken` | string | fresh token |

### 1.3 `CvUploadGrant` (response of `/careers/upload`)

`{ ok: true, cvId: string, uploadUrl: string, method: 'PUT', headers: Record<string,string>, expiresInSeconds: number }`.
Parsed defensively: if any of `cvId`, `uploadUrl`, `method`, `headers` is
missing or mistyped → treated as an upload failure (→ send without `cvId`).
`headers` is passed to the PUT **as the same object**, unmodified (FR-015).

### 1.4 `CareersPayload`

| Key | Type | Presence |
|---|---|---|
| `name`, `email` | string (trimmed) | always |
| `areaRole` | `RoleId` (24 values) | always; `toRoleId(values.areaRole)` (research R7) |
| `portfolio` | string (trimmed) | only when non-empty |
| `linkedin` | string (trimmed) | only when non-empty |
| `contactPreference` | `ContactPreference` | always |
| `whatsapp` | digits | only when preference is `whatsapp` |
| `locale` | `'es' \| 'en'` | always |
| `cvId` | string | only when the full CV flow succeeded |
| `turnstileToken` | string | always, a token distinct from the upload's |

Never present: `cv`, file name, honeypot, timestamps, area id.

### 1.5 `RoleId`

Union of the 24 ids, derived from `ROLE_CATALOG` (`ROLE_IDS =
ROLE_CATALOG.flatMap(e => e.roleIds)`). A test asserts the derived set equals
contract § 5's list exactly, so a future catalog edit that diverges from the
server fails CI (contract § 7.7: "si cambias una regla ahí, hay que cambiarla
también en el backend").

---

## 2 · API result classification

```ts
type ApiResult<T> =
  | { kind: 'ok'; body: T }
  | { kind: 'validation'; fields: string[] }
  | { kind: 'challenge' }
  | { kind: 'failure' }
```

Rules in research R5. Produced by `classifyApiResponse`; consumed by the
retry helper and the flows.

---

## 3 · Submission outcome (what the form receives)

```ts
type SubmissionOutcome =
  | { kind: 'success'; cvAttached: boolean }   // cvAttached: true when no CV was chosen
  | { kind: 'field-errors'; fields: FieldId[] } // all mapped to visible inputs
  | { kind: 'failure' }
```

- `cvAttached` is `false` only when a CV was chosen and any CV step failed;
  that is the sole trigger for the CV note (FR-016).
- `field-errors` is produced only when **every** server field maps to a
  visible input (research R9); otherwise `failure`.

---

## 4 · Form state machine (both forms)

```
type SubmitState = 'idle' | 'invalid' | 'sending' | 'success' | 'server-error'
```

| From | Event | Guard | To | Effect |
|---|---|---|---|---|
| idle / invalid / server-error | submit | client errors exist | invalid | focus first invalid |
| idle / invalid / server-error | submit | spam guard blocks (OA-1/OA-3) | server-error | nothing sent |
| idle / invalid / server-error | submit | valid, not blocked | sending | flow starts; fields read-only, button disabled |
| sending | submit | any | sending | ignored (no second request) |
| sending | outcome `success` | | success | form replaced, live announce, focus confirmation |
| sending | outcome `field-errors` | | invalid | server marks set, focus first marked |
| sending | outcome `failure` | | server-error | values preserved |

`success` is terminal for the page view (no "send another" control; none is
designed).

### 4.1 Server marks

`serverMarks: Partial<Record<FieldId, { key: string; valueAtMark: string }>>`.
A mark is active while the field's current value equals `valueAtMark`
(pure `activeServerErrors(serverMarks, values)`), so editing the field clears
it without watchers. Displayed errors = client errors, then active server
marks for fields with no client error, merged in the form's field order (keeps
"focus first invalid" = first key).

---

## 5 · Spam guard

| Name | Type | Notes |
|---|---|---|
| `honeypot` | `Ref<string>` | bound to `HoneypotField`; never read by payload builders |
| `readyAt` | `number \| null` | set by `markInteractive()` in `onMounted` |
| `MIN_FILL_TIME_MS` | `3_000` | OA-1, pending approval |
| `HONEYPOT_FIELD_NAME` | `'muush_website'` | not an autofill token |

`isSubmissionBlocked({ honeypot, readyAt, now, minFillMs })`: true if
`honeypot.trim() !== ''`, or `readyAt === null`, or `now - readyAt < minFillMs`.

---

## 6 · Submitter (the seam between pages and forms)

```ts
interface ContactSubmitter {
  engage(host: HTMLElement): void          // first focusin/submit: lazy-load Turnstile
  submit(values: ContactFormValues): Promise<SubmissionOutcome>
}
interface ApplicationSubmitter {
  engage(host: HTMLElement): void
  submit(values: ApplicationFormValues): Promise<SubmissionOutcome>
}
```

Created by `useContactSubmitter()` / `useApplicationSubmitter()` (the only
Nuxt-aware code: runtime config + locale). Stories and component tests pass
stubs. Detailed in `contracts/form-submitter.md`.

---

## 7 · i18n keys

| Key | ES | EN | Status |
|---|---|---|---|
| `forms.contact.success.title` | "Listo, ya lo recibimos. Te respondemos por {channel} en menos de 24 horas hábiles." | "Got it. We'll get back to you by {channel} within one business day." | changed, OA-4 |
| `forms.contact.success.channel.email` | "correo" | "email" | new, OA-4 |
| `forms.contact.success.channel.whatsapp` | "WhatsApp" | "WhatsApp" | new, OA-4 |
| `forms.application.success.cvNote` | "Tu perfil llegó, pero no pudimos adjuntar tu CV. Si quieres, mándalo a support{'@'}muush.dev." | "Your profile came through, but we couldn't attach your CV. If you'd like, send it to support{'@'}muush.dev." | new, OA-2 |

`@` is escaped as `{'@'}` (`rules.md` § R26). Everything else (sending, error
title, fallback, field errors) already exists and is reused unchanged.
`ContactFormContent.success` changes from `{ title }` to
`{ titleByChannel: Record<ContactPreference, string> }`;
`ApplicationFormContent.success` gains `cvNote: string`.

---

## 8 · Constants (`data/submissionContract.ts`)

| Constant | Value | Source |
|---|---|---|
| `API_PATHS` | `{ contact: '/contact', careersUpload: '/careers/upload', careers: '/careers' }` | contract § 1 |
| `TURNSTILE_SCRIPT_URL` | `https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit` | contract § 2, research R2 |
| `API_REQUEST_TIMEOUT_MS` | 15 000 | research R6 |
| `CV_PUT_TIMEOUT_MS` | 60 000 | research R6 |
| `TURNSTILE_TOKEN_TIMEOUT_MS` | 20 000 | research R6 |
| `MIN_FILL_TIME_MS` | 3 000 | OA-1 |
| `HONEYPOT_FIELD_NAME` | `'muush_website'` | research R8 |

No base URL and no sitekey here: those are runtime config (FR-001).
