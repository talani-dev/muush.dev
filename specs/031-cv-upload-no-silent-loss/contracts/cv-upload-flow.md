# Contract: the application flow with a CV (client view)

Supersedes the "CV upload (S3)" and "Flows → Application" sections of
`specs/029-form-submission-integration/contracts/forms-api-client.md`.
Everything else in that file stays valid. Source of truth for the backend:
`docs/business/landing/form-api-contract.md` § 4–§ 6 (unchanged); for the
reversed § 9 / § 7.5 behaviour, this feature's spec (OA-1).

## PUT to S3 — `FormsApiClient.putCv(grant, file)`

```
fetch(grant.uploadUrl, {
  method: 'PUT',
  headers: { 'content-type': grant.contentType },   // ONLY this header
  body: file,                                       // the raw File, untouched
  signal,                                           // CV_PUT_TIMEOUT_MS
})
```

| Observed | Result |
|---|---|
| status 200 | `'uploaded'` |
| any other status (204, 403, 400, 500, …) | `'failed'` |
| `fetch` rejects (network, CORS block) | `'failed'` |
| abort after `CV_PUT_TIMEOUT_MS` | `'failed'` |

Tests assert: `init.method === 'PUT'`; `Object.keys(init.headers)` equals
exactly `['content-type']`; the value equals the grant's; no key named
`content-length` in any casing; `init.body` is the same `File` object.

## Grant parsing — `parseUploadGrant(body)`

Valid only if `cvId`, `uploadUrl` are non-empty strings, `method === 'PUT'`,
and `headers` holds a non-empty string under a key equal to `content-type`
ignoring case. Otherwise `undefined` → the attempt is `cv-upload-failed`.

## Application flow — `submitApplicationFlow(values, deps, progress?)`

```
if values.cv is null:
    result = sendWithFreshToken(→ POST /careers, no cvId)       # unchanged
    return toOutcome(result)

grant = sendWithFreshToken(→ POST /careers/upload {contentType, contentLength: file.size})
if grant is not ok:            return { kind: 'cv-upload-failed' }   # no PUT, no /careers
if putCv(grant, file) != 'uploaded':
                               return { kind: 'cv-upload-failed' }   # no /careers
progress?.cvUploaded()
result = sendWithFreshToken(→ POST /careers with cvId = grant.cvId)   # token minted only now
return toOutcome(result)
```

Invariants (each has a test):

1. `values.cv !== null` ⇒ `/careers` is called only after a PUT `'uploaded'`
   in the same call, and always carries that call's `grant.cvId`.
2. `values.cv !== null` and any CV step fails ⇒ `postCareers` is never
   called; the outcome is `cv-upload-failed`.
3. Two calls ⇒ two `requestCvUpload` calls, two PUTs to the two different
   `uploadUrl`s, and every token across both calls is distinct.
4. The flow keeps no state between calls (no module-level or closure cache
   of grants, URLs, `cvId`s or tokens).
5. Nothing is written to `console`; caught errors are discarded, never
   rethrown with the URL.
6. `success` never carries a CV flag; no outcome exists that means "sent
   without the CV the visitor chose".

## Result → outcome mapping (final `/careers` call)

Unchanged from feature 29, plus:

| Situation | Outcome |
|---|---|
| any CV step failed (grant not ok after its single 403 retry, malformed grant, token unobtainable before the grant, PUT not 200) | `cv-upload-failed` |
