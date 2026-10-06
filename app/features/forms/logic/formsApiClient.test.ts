import { afterEach, describe, expect, it, vi } from 'vitest'
import type {
  ContactPayload,
  CvUploadGrant,
} from '@/features/forms/data/submissionContract'
import {
  API_REQUEST_TIMEOUT_MS,
  CV_PUT_TIMEOUT_MS,
} from '@/features/forms/data/submissionContract'
import {
  classifyApiResponse,
  createFormsApiClient,
  type FetchLike,
  parseUploadGrant,
} from './formsApiClient'

/**
 * Every network call here goes to a mock `fetchImpl`. The real API is never
 * reached (it returns 404 until infra completes, contract § 0).
 */
const BASE_URL = 'https://api.test.invalid'

function jsonResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
  }
}

function mockFetch(
  ...responses: ReturnType<typeof jsonResponse>[]
): ReturnType<typeof vi.fn<FetchLike>> {
  const fetchImpl = vi.fn<FetchLike>()
  for (const response of responses) fetchImpl.mockResolvedValueOnce(response)
  return fetchImpl
}

/** A fetch that only settles when its signal aborts. */
function hangingFetch(): FetchLike {
  return (_input, init) =>
    new Promise((_resolve, reject) => {
      init.signal?.addEventListener('abort', () =>
        reject(new DOMException('aborted', 'AbortError'))
      )
    })
}

const contactPayload: ContactPayload = {
  name: 'Ana',
  email: 'ana@muush.dev',
  company: '',
  identity: 'company',
  need: 'Necesitamos un sitio.',
  contactPreference: 'email',
  locale: 'es',
  turnstileToken: 'tok',
}

const grant: CvUploadGrant = {
  cvId: '6f1b-cv',
  uploadUrl: 'https://bucket.s3.test.invalid/signed?X-Amz-Signature=abc',
  method: 'PUT',
  headers: { 'content-type': 'application/pdf', 'content-length': '4' },
}

afterEach(() => {
  vi.useRealTimers()
})

describe('classifyApiResponse', () => {
  it.each([
    ['200 with ok:true', 200, { ok: true, received: true }, 'ok'],
    ['200 without ok', 200, { received: true }, 'failure'],
    ['200 with ok:false', 200, { ok: false }, 'failure'],
    [
      '400 validation_failed',
      400,
      { ok: false, error: { code: 'validation_failed', fields: ['email'] } },
      'validation',
    ],
    [
      '400 validation_failed with malformed fields',
      400,
      { ok: false, error: { code: 'validation_failed', fields: 'email' } },
      'failure',
    ],
    ['400 invalid_json', 400, { ok: false, error: 'invalid_json' }, 'failure'],
    [
      '403 challenge_failed',
      403,
      { ok: false, error: 'challenge_failed' },
      'challenge',
    ],
    ['403 other', 403, { ok: false, error: 'forbidden' }, 'failure'],
    ['500', 500, { ok: false, error: 'internal_error' }, 'failure'],
    ['404', 404, { message: 'Not Found' }, 'failure'],
    ['non-JSON body', 200, undefined, 'failure'],
  ])(
    'should classify %s as the right kind when received',
    (_label, status, body, kind) => {
      expect(classifyApiResponse(status, body).kind).toBe(kind)
    }
  )

  it('should return the server field names when validation fails', () => {
    expect(
      classifyApiResponse(400, {
        ok: false,
        error: { code: 'validation_failed', fields: ['email', 'whatsapp'] },
      })
    ).toEqual({ kind: 'validation', fields: ['email', 'whatsapp'] })
  })
})

describe('createFormsApiClient · JSON posts', () => {
  it('should post the exact JSON body to baseUrl + path with only content-type when sending contact', async () => {
    const fetchImpl = mockFetch(jsonResponse(200, { ok: true }))
    const client = createFormsApiClient({ baseUrl: `${BASE_URL}/`, fetchImpl })

    const result = await client.postContact(contactPayload)

    expect(result.kind).toBe('ok')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    const [url, init] = fetchImpl.mock.calls[0] ?? []
    expect(url).toBe(`${BASE_URL}/contact`)
    expect(init?.method).toBe('POST')
    expect(init?.headers).toEqual({ 'content-type': 'application/json' })
    expect(JSON.parse(String(init?.body))).toEqual(contactPayload)
    expect(init?.credentials).toBeUndefined()
  })

  it('should post to /careers and /careers/upload when asked', async () => {
    const fetchImpl = mockFetch(
      jsonResponse(200, { ok: true, ...grant, expiresInSeconds: 600 }),
      jsonResponse(200, { ok: true })
    )
    const client = createFormsApiClient({ baseUrl: BASE_URL, fetchImpl })

    await client.requestCvUpload({
      contentType: 'application/pdf',
      contentLength: 4,
      turnstileToken: 't',
    })
    await client.postCareers({
      name: 'Ana',
      email: 'ana@muush.dev',
      areaRole: 'backend',
      contactPreference: 'email',
      locale: 'es',
      turnstileToken: 't2',
    })

    expect(fetchImpl.mock.calls.map(([url]) => url)).toEqual([
      `${BASE_URL}/careers/upload`,
      `${BASE_URL}/careers`,
    ])
  })

  it('should resolve to failure when fetch rejects', async () => {
    const fetchImpl = vi.fn<FetchLike>().mockRejectedValue(new TypeError('net'))
    const client = createFormsApiClient({ baseUrl: BASE_URL, fetchImpl })

    expect(await client.postContact(contactPayload)).toEqual({
      kind: 'failure',
    })
  })

  it('should resolve to failure when the body is not JSON', async () => {
    const fetchImpl = vi.fn<FetchLike>().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => '<html>gateway</html>',
    })
    const client = createFormsApiClient({ baseUrl: BASE_URL, fetchImpl })

    expect((await client.postContact(contactPayload)).kind).toBe('failure')
  })

  it('should abort and resolve to failure when the API never answers', async () => {
    vi.useFakeTimers()
    const client = createFormsApiClient({
      baseUrl: BASE_URL,
      fetchImpl: hangingFetch(),
    })

    const pending = client.postContact(contactPayload)
    await vi.advanceTimersByTimeAsync(API_REQUEST_TIMEOUT_MS)

    expect(await pending).toEqual({ kind: 'failure' })
  })

  it('should treat a malformed upload grant as failure when the server answers 200', async () => {
    const fetchImpl = mockFetch(jsonResponse(200, { ok: true, cvId: 'x' }))
    const client = createFormsApiClient({ baseUrl: BASE_URL, fetchImpl })

    const result = await client.requestCvUpload({
      contentType: 'application/pdf',
      contentLength: 4,
      turnstileToken: 't',
    })

    expect(result).toEqual({ kind: 'failure' })
  })
})

describe('parseUploadGrant', () => {
  const valid = { ok: true, ...grant, expiresInSeconds: 600 }

  it('should return the grant with the very same headers object when well formed', () => {
    const parsed = parseUploadGrant(valid)

    expect(parsed?.cvId).toBe(grant.cvId)
    expect(parsed?.headers).toBe(valid.headers)
  })

  it.each([
    ['cvId missing', { ...valid, cvId: undefined }],
    ['uploadUrl not a string', { ...valid, uploadUrl: 42 }],
    ['method missing', { ...valid, method: undefined }],
    ['headers missing', { ...valid, headers: undefined }],
    ['headers with a non-string value', { ...valid, headers: { a: 1 } }],
    ['not an object', 'grant'],
  ])('should reject the grant when %s', (_label, body) => {
    expect(parseUploadGrant(body)).toBeUndefined()
  })
})

describe('createFormsApiClient · putCv', () => {
  const file = new File(['%PDF'], 'cv.pdf', { type: 'application/pdf' })

  it('should PUT the file with exactly the grant method and the same headers object', async () => {
    const fetchImpl = mockFetch(jsonResponse(200, {}))
    const client = createFormsApiClient({ baseUrl: BASE_URL, fetchImpl })

    expect(await client.putCv(grant, file)).toBe('uploaded')

    const [url, init] = fetchImpl.mock.calls[0] ?? []
    expect(url).toBe(grant.uploadUrl)
    expect(init?.method).toBe('PUT')
    expect(init?.headers).toBe(grant.headers)
    expect(Object.keys(init?.headers ?? {})).toEqual([
      'content-type',
      'content-length',
    ])
    expect(init?.body).toBe(file)
  })

  it('should report failed when S3 answers non-2xx', async () => {
    const client = createFormsApiClient({
      baseUrl: BASE_URL,
      fetchImpl: mockFetch(jsonResponse(403, {})),
    })

    expect(await client.putCv(grant, file)).toBe('failed')
  })

  it('should report failed when the PUT rejects', async () => {
    const client = createFormsApiClient({
      baseUrl: BASE_URL,
      fetchImpl: vi.fn<FetchLike>().mockRejectedValue(new TypeError('net')),
    })

    expect(await client.putCv(grant, file)).toBe('failed')
  })

  it('should report failed when the PUT outlives its timeout', async () => {
    vi.useFakeTimers()
    const client = createFormsApiClient({
      baseUrl: BASE_URL,
      fetchImpl: hangingFetch(),
    })

    const pending = client.putCv(grant, file)
    await vi.advanceTimersByTimeAsync(CV_PUT_TIMEOUT_MS)

    expect(await pending).toBe('failed')
  })
})
