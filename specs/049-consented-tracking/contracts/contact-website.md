# Contract — `website` on `POST /contact` (site side; amendment 2026-11-07)

Mirror of the Form Submission API rule. Source (read-only):
`muush-foundation` `specs/008-email-templates-muush-1-0/contracts/payload-delta.md`
and `modules/form-submission-api/src/shared/validation.js` `validateWebsite`
(commit `af491cb`). If the API rule changes, this contract and
`WEBSITE_MAX_CODE_POINTS` change with it (form-api-contract.md § 7.7).

## 1 · Request

| Key | Endpoint | Present when | Value |
|---|---|---|---|
| `website` | `POST /contact` only | the trimmed field value is non-empty | the trimmed value, as typed, ≤ 300 Unicode code points (`Array.from(value).length`) |

- Never `null`, never `""`, never a non-string.
- Never on `POST /careers` or `POST /careers/upload` (the API rejects it there
  as an unknown field).
- Never under the honeypot name `muush_website`; the honeypot is never sent.
- No URL parsing or normalisation: `@handle`, `casaolivo.mx`,
  `https://casaolivo.mx/x` are sent as typed (trimmed).

## 2 · Input

`<input id="website" type="text" autocomplete="url" maxlength="300">`, not
required, rendered by `TextField`; label/placeholder from
`forms.contact.fields.website.*` (copy-drafts § D).

## 3 · Failure handling

| Case | Site behaviour |
|---|---|
| trimmed value > 300 code points at send time | no request; outcome `failure` (generic send error) |
| `400 validation_failed` with `fields` containing `website` | outcome `failure` (generic send error), values kept, retry possible |

## 4 · Never

- In any GA4/Meta event, parameter or advanced-matching user data.
- Logged or stored by the site outside the in-memory form values.

## 5 · Release order (R43)

API release accepting `website` live (Roberto confirms) → then the site
release that sends it. A precondition of this feature's deploy.
