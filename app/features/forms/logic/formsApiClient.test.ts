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
  contentType: 'application/pdf',
}

/** The `/careers/upload` body as contract § 4 shapes it. */
const grantBody = {
  ok: true,
  cvId: grant.cvId,
  uploadUrl: grant.uploadUrl,
  method: 'PUT',
  headers: { 'content-type': 'application/pdf', 'content-length': '4' },
  expiresInSeconds: 600,
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
  it('should extract cvId, uploadUrl and content-type when the body is well formed', () => {
    expect(parseUploadGrant(grantBody)).toEqual(grant)
  })

  it('should find content-type regardless of key casing', () => {
    const parsed = parseUploadGrant({
      ...grantBody,
      headers: { 'Content-Type': 'application/pdf' },
    })

    expect(parsed?.contentType).toBe('application/pdf')
  })

  it.each([
    ['POST', 'POST'],
    ['lower-case put', 'put'],
    ['missing', undefined],
  ])(
    'should return undefined when method is not PUT (%s)',
    (_label, method) => {
      expect(parseUploadGrant({ ...grantBody, method })).toBeUndefined()
    }
  )

  it.each([
    ['missing', { 'content-length': '4' }],
    ['empty', { 'content-type': '' }],
    ['not a string', { 'content-type': 7 }],
    ['headers absent', undefined],
  ])('should return undefined when content-type is %s', (_label, headers) => {
    expect(parseUploadGrant({ ...grantBody, headers })).toBeUndefined()
  })

  it.each([
    ['cvId missing', { ...grantBody, cvId: undefined }],
    ['cvId empty', { ...grantBody, cvId: '' }],
    ['uploadUrl missing', { ...grantBody, uploadUrl: undefined }],
    ['uploadUrl not a string', { ...grantBody, uploadUrl: 42 }],
    ['not an object', 'grant'],
  ])('should return undefined when %s', (_label, body) => {
    expect(parseUploadGrant(body)).toBeUndefined()
  })
})

describe('createFormsApiClient · putCv', () => {
  const file = new File(['%PDF'], 'cv.pdf', { type: 'application/pdf' })

  it('should PUT the original file with only the grant content-type when uploading', async () => {
    const fetchImpl = mockFetch(jsonResponse(200, {}))
    const client = createFormsApiClient({ baseUrl: BASE_URL, fetchImpl })

    expect(await client.putCv(grant, file)).toBe('uploaded')

    const [url, init] = fetchImpl.mock.calls[0] ?? []
    const headers = (init?.headers ?? {}) as Record<string, string>
    expect(url).toBe(grant.uploadUrl)
    expect(init?.method).toBe('PUT')
    expect(Object.keys(headers)).toEqual(['content-type'])
    expect(headers['content-type']).toBe(grant.contentType)
    expect(
      Object.keys(headers).some(key => key.toLowerCase() === 'content-length')
    ).toBe(false)
    expect(init?.body).toBe(file)
  })

  it.each([204, 403, 500])(
    'should report failed when S3 answers %i',
    async status => {
      const client = createFormsApiClient({
        baseUrl: BASE_URL,
        fetchImpl: mockFetch(jsonResponse(status, {})),
      })

      expect(await client.putCv(grant, file)).toBe('failed')
    }
  )

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
