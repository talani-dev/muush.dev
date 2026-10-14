import type {
  ApiResult,
  CareersPayload,
  ContactPayload,
  CvUploadGrant,
  CvUploadRequest,
} from '@/features/forms/data/submissionContract'
import {
  API_PATHS,
  API_REQUEST_TIMEOUT_MS,
  CV_PUT_TIMEOUT_MS,
  CV_UPLOAD_METHOD,
  S3_PUT_SUCCESS_STATUS,
} from '@/features/forms/data/submissionContract'

/**
 * The only code in the site that talks to the Form Submission API
 * (form-api-contract.md) or to S3. Browser → external API, which is what
 * Constitution Article IV permits; no server route exists or is added.
 *
 * `fetchImpl` is injected so tests hand in a mock and never stub a global,
 * and never reach the real API (it returns 404 until the infra apply
 * completes, contract § 0). Every path resolves; nothing here throws.
 */

export type FetchLike = (
  input: string,
  init: RequestInit
) => Promise<Pick<Response, 'ok' | 'status' | 'text'>>

export type CvUploadOutcome = 'uploaded' | 'failed'

export interface FormsApiClient {
  postContact(payload: ContactPayload): Promise<ApiResult<unknown>>
  requestCvUpload(request: CvUploadRequest): Promise<ApiResult<CvUploadGrant>>
  postCareers(payload: CareersPayload): Promise<ApiResult<unknown>>
  putCv(grant: CvUploadGrant, file: File): Promise<CvUploadOutcome>
}

export interface FormsApiClientOptions {
  baseUrl: string
  fetchImpl?: FetchLike
  requestTimeoutMs?: number
  putTimeoutMs?: number
}

const FAILURE = { kind: 'failure' } as const

const HTTP_OK = 200
const HTTP_BAD_REQUEST = 400
const HTTP_FORBIDDEN = 403

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string')
}

/**
 * Status + parsed body → one of four results (research R5). Success needs
 * BOTH a 200 and `ok: true` (spec FR-012); only `challenge_failed` is
 * retryable; anything undocumented is `failure`.
 */
export function classifyApiResponse(
  status: number,
  body: unknown
): ApiResult<unknown> {
  if (!isRecord(body)) return FAILURE

  if (status === HTTP_OK && body.ok === true) return { kind: 'ok', body }

  if (status === HTTP_BAD_REQUEST && isRecord(body.error)) {
    const { code, fields } = body.error
    if (code === 'validation_failed' && isStringArray(fields)) {
      return { kind: 'validation', fields }
    }
  }

  if (status === HTTP_FORBIDDEN && body.error === 'challenge_failed') {
    return { kind: 'challenge' }
  }

  return FAILURE
}

const CONTENT_TYPE_HEADER = 'content-type'

/** The grant's `content-type` value, its key matched ignoring case so a
 * server that re-cases it is not a false CV failure (research R2). */
function readContentType(headers: unknown): string | undefined {
  if (!isRecord(headers)) return undefined
  const key = Object.keys(headers).find(
    name => name.toLowerCase() === CONTENT_TYPE_HEADER
  )
  const value = key === undefined ? undefined : headers[key]
  return typeof value === 'string' && value !== '' ? value : undefined
}

/**
 * `undefined` (→ a CV upload failure) when any field the PUT needs is missing
 * or mistyped, or the method is not `PUT` (feature 031, data-model § 1). The
 * signed `content-length` and `expiresInSeconds` are ignored on purpose.
 */
export function parseUploadGrant(body: unknown): CvUploadGrant | undefined {
  if (!isRecord(body)) return undefined
  const { cvId, uploadUrl, method, headers } = body
  if (typeof cvId !== 'string' || cvId === '') return undefined
  if (typeof uploadUrl !== 'string' || uploadUrl === '') return undefined
  if (method !== CV_UPLOAD_METHOD) return undefined
  const contentType = readContentType(headers)
  if (contentType === undefined) return undefined
  return { cvId, uploadUrl, contentType }
}

async function readJsonBody(
  response: Pick<Response, 'text'>
): Promise<unknown> {
  try {
    return JSON.parse(await response.text())
  } catch {
    return undefined
  }
}

/** Runs `request` with an abort signal that fires after `timeoutMs`. */
async function withTimeout<T>(
  timeoutMs: number,
  request: (signal: AbortSignal) => Promise<T>
): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await request(controller.signal)
  } finally {
    clearTimeout(timer)
  }
}

export function createFormsApiClient({
  baseUrl,
  fetchImpl = (input, init) => globalThis.fetch(input, init),
  requestTimeoutMs = API_REQUEST_TIMEOUT_MS,
  putTimeoutMs = CV_PUT_TIMEOUT_MS,
}: FormsApiClientOptions): FormsApiClient {
  const origin = baseUrl.replace(/\/+$/, '')

  async function postJson(
    path: string,
    payload: object
  ): Promise<ApiResult<unknown>> {
    try {
      return await withTimeout(requestTimeoutMs, async signal => {
        const response = await fetchImpl(`${origin}${path}`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
          signal,
        })
        return classifyApiResponse(
          response.status,
          await readJsonBody(response)
        )
      })
    } catch {
      return FAILURE
    }
  }

  async function requestCvUpload(
    request: CvUploadRequest
  ): Promise<ApiResult<CvUploadGrant>> {
    const result = await postJson(API_PATHS.careersUpload, request)
    if (result.kind !== 'ok') return result
    const grant = parseUploadGrant(result.body)
    return grant ? { kind: 'ok', body: grant } : FAILURE
  }

  async function putCv(
    grant: CvUploadGrant,
    file: File
  ): Promise<CvUploadOutcome> {
    try {
      return await withTimeout(putTimeoutMs, async signal => {
        const response = await fetchImpl(grant.uploadUrl, {
          method: CV_UPLOAD_METHOD,
          /* Only `content-type`, verbatim from the grant. `content-length` is
             signed too but is a forbidden request header in browsers: setting
             it is silently ignored, and the browser derives it from the
             untouched `File`, whose size is exactly the `contentLength`
             declared to /careers/upload, so the signature still matches
             (feature 031 research R2). */
          headers: { [CONTENT_TYPE_HEADER]: grant.contentType },
          /* The visitor's original File: never read, sliced or re-wrapped,
             or its length would no longer match the signature. */
          body: file,
          signal,
        })
        return response.status === S3_PUT_SUCCESS_STATUS ? 'uploaded' : 'failed'
      })
    } catch {
      return 'failed'
    }
  }

  return {
    postContact: payload => postJson(API_PATHS.contact, payload),
    requestCvUpload,
    postCareers: payload => postJson(API_PATHS.careers, payload),
    putCv,
  }
}
