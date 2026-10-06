# Contract: browser → Form Submission API (client view)

Source of truth: `docs/business/landing/form-api-contract.md`. This file
restates only what the client must do, so tests can be written against it.
If the two ever disagree, the business document wins and this file is wrong.

## Requests

All: `POST`, `content-type: application/json`, body = `JSON.stringify(payload)`,
no credentials, no auth header, no extra headers. URL = `runtimeConfig.public.formsApiBaseUrl` + path.

| Call | Path | Body | Success body |
|---|---|---|---|
| contact | `/contact` | `ContactPayload` (data-model § 1.1) | `{ ok: true, received: true }` |
| upload grant | `/careers/upload` | `CvUploadRequest` (§ 1.2) | `CvUploadGrant` (§ 1.3) |
| application | `/careers` | `CareersPayload` (§ 1.4) | `{ ok: true, received: true }` |

## CV upload (S3)

```
fetch(grant.uploadUrl, { method: grant.method, headers: grant.headers, body: file })
```

- `headers` is the grant's object itself. Tests assert identity/deep-equality
  with the grant and that no key was added, removed or re-cased.
- Success: any 2xx. Anything else, a rejection, or the timeout → CV failure.
- No `turnstileToken`, no JSON, no base URL.

## Retry rule

`sendWithFreshToken(getToken, send)`:

1. `token1 = await getToken()`; `r = await send(token1)`.
2. If `r.kind === 'challenge'`: `token2 = await getToken()`; return `await send(token2)`.
3. Otherwise return `r`.

Never more than two sends per logical request. `getToken` rejecting →
`failure`.

## Flows

**Contact**: `sendWithFreshToken(→ POST /contact)` → map result to outcome.

**Application**:

```
cvId = undefined
if values.cv:
    grant = sendWithFreshToken(→ POST /careers/upload)
    if grant ok and well-formed:
        put = PUT grant.uploadUrl
        if put 2xx: cvId = grant.cvId
result = sendWithFreshToken(→ POST /careers with cvId if set)   # token requested only now
success → { kind: 'success', cvAttached: !values.cv || cvId !== undefined }
```

Upload-step `validation` results (e.g. server disagrees on size) are treated
as CV failure, not field errors: the visitor can do nothing about them at
that point, and the application must still go out (contract § 7.5).

## Result → outcome mapping

| `ApiResult` of the final call | Outcome |
|---|---|
| `ok` | `success` |
| `validation`, all fields visible (research R9) | `field-errors` |
| `validation`, any field not visible | `failure` |
| `challenge` (after the retry) | `failure` |
| `failure` | `failure` |
