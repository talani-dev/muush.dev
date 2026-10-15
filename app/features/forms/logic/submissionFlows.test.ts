import { describe, expect, it, vi } from 'vitest'
import {
  type ApplicationFormValues,
  initialApplicationFormValues,
} from '@/features/forms/data/applicationFields'
import {
  type ContactFormValues,
  initialContactFormValues,
} from '@/features/forms/data/contactFields'
import type {
  ApiResult,
  CareersPayload,
  CvUploadGrant,
} from '@/features/forms/data/submissionContract'
import {
  type CvUploadOutcome,
  createFormsApiClient,
  type FetchLike,
  type FormsApiClient,
} from './formsApiClient'
import { submitApplicationFlow, submitContactFlow } from './submissionFlows'

/** A client double recording the order of every call. No network. */
function fakeClient(script: {
  contact?: ApiResult<unknown>[]
  upload?: ApiResult<CvUploadGrant>[]
  put?: (CvUploadOutcome | Promise<CvUploadOutcome>)[]
  careers?: ApiResult<unknown>[]
}) {
  const log: string[] = []
  const careersPayloads: CareersPayload[] = []
  const next = <T>(queue: T[] | undefined, fallback: T): T =>
    queue?.shift() ?? fallback
  const OK = { kind: 'ok', body: { ok: true } } as const

  const client: FormsApiClient = {
    postContact: vi.fn(async payload => {
      log.push(`contact:${payload.turnstileToken}`)
      return next(script.contact, OK)
    }),
    requestCvUpload: vi.fn(async request => {
      log.push(`upload:${request.turnstileToken}`)
      return next(script.upload, { kind: 'ok', body: GRANT })
    }),
    putCv: vi.fn(async () => {
      log.push('put')
      return next(script.put, 'uploaded' as CvUploadOutcome)
    }),
    postCareers: vi.fn(async payload => {
      log.push(`careers:${payload.turnstileToken}`)
      careersPayloads.push(payload)
      return next(script.careers, OK)
    }),
  }
  return { client, log, careersPayloads }
}

function countingTokens(log?: string[]) {
  let issued = 0
  return vi.fn(async () => {
    const token = `token-${++issued}`
    log?.push(`token:${token}`)
    return token
  })
}

const GRANT: CvUploadGrant = {
  cvId: 'cv-uuid',
  uploadUrl: 'https://bucket.test.invalid/signed',
  contentType: 'application/pdf',
}

const CHALLENGE = { kind: 'challenge' } as const
const FAILURE = { kind: 'failure' } as const

const contact: ContactFormValues = {
  ...initialContactFormValues(),
  name: 'Ana',
  email: 'ana@muush.dev',
  identity: 'company',
  need: 'Necesitamos un sitio nuevo.',
}

const cv = new File(['%PDF-1.7'], 'cv.pdf', { type: 'application/pdf' })

function application(
  overrides: Partial<ApplicationFormValues> = {}
): ApplicationFormValues {
  return {
    ...initialApplicationFormValues(),
    name: 'Ana',
    email: 'ana@muush.dev',
    areaRole: 'it:backend',
    ...overrides,
  }
}

describe('submitContactFlow', () => {
  it('should succeed with one token when the API answers ok', async () => {
    const { client, log } = fakeClient({})
    const getToken = countingTokens()

    expect(
      await submitContactFlow(contact, { client, getToken, locale: 'es' })
    ).toEqual({ kind: 'success' })
    expect(log).toEqual(['contact:token-1'])
  })

  it('should return field errors when every rejected field is visible', async () => {
    const { client } = fakeClient({
      contact: [{ kind: 'validation', fields: ['email', 'need'] }],
    })

    expect(
      await submitContactFlow(contact, {
        client,
        getToken: countingTokens(),
        locale: 'es',
      })
    ).toEqual({ kind: 'field-errors', fields: ['email', 'need'] })
  })

  it('should fail when a rejected field is not visible to the visitor', async () => {
    const { client } = fakeClient({
      contact: [{ kind: 'validation', fields: ['email', 'locale'] }],
    })

    expect(
      await submitContactFlow(contact, {
        client,
        getToken: countingTokens(),
        locale: 'es',
      })
    ).toEqual(FAILURE)
  })

  it('should retry once with a fresh token and succeed when the first token was rejected', async () => {
    const { client, log } = fakeClient({ contact: [CHALLENGE] })

    expect(
      (
        await submitContactFlow(contact, {
          client,
          getToken: countingTokens(),
          locale: 'es',
        })
      ).kind
    ).toBe('success')
    expect(log).toEqual(['contact:token-1', 'contact:token-2'])
  })

  it('should fail after exactly two sends when both tokens are rejected', async () => {
    const { client, log } = fakeClient({ contact: [CHALLENGE, CHALLENGE] })

    expect(
      await submitContactFlow(contact, {
        client,
        getToken: countingTokens(),
        locale: 'es',
      })
    ).toEqual(FAILURE)
    expect(log).toHaveLength(2)
  })

  it('should fail with zero API calls when no token can be obtained', async () => {
    const { client, log } = fakeClient({})
    const getToken = vi.fn(async () => {
      throw new Error('script blocked')
    })

    expect(
      await submitContactFlow(contact, { client, getToken, locale: 'es' })
    ).toEqual(FAILURE)
    expect(log).toEqual([])
  })

  it('should resolve to failure rather than throw when the payload cannot be built', async () => {
    const { client } = fakeClient({})

    expect(
      await submitContactFlow(
        { ...contact, identity: '' },
        { client, getToken: countingTokens(), locale: 'es' }
      )
    ).toEqual(FAILURE)
  })
})

describe('submitContactFlow · real client classification over a mocked fetch', () => {
  function clientAnswering(status: number, body: unknown) {
    const fetchImpl = vi.fn<FetchLike>().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      text: async () =>
        typeof body === 'string' ? body : JSON.stringify(body),
    })
    return createFormsApiClient({
      baseUrl: 'https://api.test.invalid',
      fetchImpl,
    })
  }

  it.each([
    ['400 invalid_json', 400, { ok: false, error: 'invalid_json' }],
    ['200 with ok:false', 200, { ok: false }],
    ['500 internal_error', 500, { ok: false, error: 'internal_error' }],
    ['404 while the routes do not exist', 404, { message: 'Not Found' }],
  ])('should fail when the API answers %s', async (_label, status, body) => {
    expect(
      await submitContactFlow(contact, {
        client: clientAnswering(status, body),
        getToken: countingTokens(),
        locale: 'es',
      })
    ).toEqual(FAILURE)
  })
})

describe('WhatsApp dial code over a mocked fetch (feature 32)', () => {
  const API = 'https://api.test.invalid'

  function answering(status: number, body: unknown) {
    const fetchImpl = vi.fn<FetchLike>().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      text: async () => JSON.stringify(body),
    })
    return {
      fetchImpl,
      client: createFormsApiClient({ baseUrl: API, fetchImpl }),
    }
  }

  function sentBody(
    fetchImpl: ReturnType<typeof vi.fn<FetchLike>>
  ): Record<string, unknown> {
    return JSON.parse(String(fetchImpl.mock.calls[0]?.[1]?.body))
  }

  const viaWhatsapp = {
    contactPreference: 'whatsapp',
    whatsappCountry: 'CO',
    whatsapp: '300 123 4567',
  } as const

  it('should post the dial code and the digits only when /contact is sent with WhatsApp', async () => {
    const { client, fetchImpl } = answering(200, { ok: true })

    await submitContactFlow(
      { ...contact, ...viaWhatsapp },
      { client, getToken: countingTokens(), locale: 'es' }
    )

    expect(sentBody(fetchImpl)).toMatchObject({
      whatsappDialCode: '+57',
      whatsapp: '3001234567',
    })
  })

  it('should post neither WhatsApp key when /contact is sent with email', async () => {
    const { client, fetchImpl } = answering(200, { ok: true })

    await submitContactFlow(
      { ...contact, whatsappCountry: 'CO', whatsapp: '3001234567' },
      { client, getToken: countingTokens(), locale: 'es' }
    )

    expect(sentBody(fetchImpl)).not.toHaveProperty('whatsappDialCode')
    expect(sentBody(fetchImpl)).not.toHaveProperty('whatsapp')
  })

  it('should post the dial code when /careers is sent with WhatsApp', async () => {
    const { client, fetchImpl } = answering(200, { ok: true })

    await submitApplicationFlow(application(viaWhatsapp), {
      client,
      getToken: countingTokens(),
      locale: 'en',
    })

    expect(fetchImpl.mock.calls[0]?.[0]).toBe(`${API}/careers`)
    expect(sentBody(fetchImpl)).toMatchObject({
      whatsappDialCode: '+57',
      whatsapp: '3001234567',
    })
  })

  it('should mark the selector when the server rejects whatsappDialCode', async () => {
    const { client } = answering(400, {
      ok: false,
      error: { code: 'validation_failed', fields: ['whatsappDialCode'] },
    })

    expect(
      await submitContactFlow(
        { ...contact, ...viaWhatsapp },
        { client, getToken: countingTokens(), locale: 'es' }
      )
    ).toEqual({ kind: 'field-errors', fields: ['whatsappCountry'] })
  })

  it('should fail generically when the server names whatsappDialCode while the preference is email', async () => {
    const { client } = answering(400, {
      ok: false,
      error: { code: 'validation_failed', fields: ['whatsappDialCode'] },
    })

    expect(
      await submitApplicationFlow(application(), {
        client,
        getToken: countingTokens(),
        locale: 'es',
      })
    ).toEqual(FAILURE)
  })
})

describe('submitApplicationFlow', () => {
  it('should send one application without cvId and no upload when cv is null', async () => {
    const { client, log, careersPayloads } = fakeClient({})

    expect(
      await submitApplicationFlow(application(), {
        client,
        getToken: countingTokens(),
        locale: 'en',
      })
    ).toEqual({ kind: 'success' })
    expect(log).toEqual(['careers:token-1'])
    expect(careersPayloads[0]).not.toHaveProperty('cvId')
    expect(client.requestCvUpload).not.toHaveBeenCalled()
    expect(client.putCv).not.toHaveBeenCalled()
  })

  it('should upload, PUT, then apply with the grant cvId and two distinct tokens when a CV is chosen', async () => {
    const { client, log, careersPayloads } = fakeClient({})

    expect(
      await submitApplicationFlow(application({ cv }), {
        client,
        getToken: countingTokens(),
        locale: 'es',
      })
    ).toEqual({ kind: 'success' })
    expect(log).toEqual(['upload:token-1', 'put', 'careers:token-2'])
    expect(careersPayloads[0]?.cvId).toBe(GRANT.cvId)
    expect(client.requestCvUpload).toHaveBeenCalledWith({
      contentType: 'application/pdf',
      contentLength: cv.size,
      turnstileToken: 'token-1',
    })
    expect(client.putCv).toHaveBeenCalledWith(GRANT, cv)
  })

  it('should request the second token only after the PUT resolved', async () => {
    let finishPut: (outcome: CvUploadOutcome) => void = () => undefined
    const slowPut = new Promise<CvUploadOutcome>(resolve => {
      finishPut = resolve
    })
    const log: string[] = []
    const { client } = fakeClient({ put: [slowPut] })
    const getToken = countingTokens(log)

    const flow = submitApplicationFlow(application({ cv }), {
      client,
      getToken,
      locale: 'es',
    })
    await vi.waitFor(() => expect(client.putCv).toHaveBeenCalled())
    expect(getToken).toHaveBeenCalledTimes(1)

    finishPut('uploaded')
    await flow
    expect(getToken).toHaveBeenCalledTimes(2)
  })

  /* A factory: `fakeClient` consumes its script queues, so every test gets
     fresh ones. */
  const cvFailures = (): [string, Parameters<typeof fakeClient>[0]][] => [
    ['the upload request fails', { upload: [FAILURE] }],
    [
      'the upload request is rejected as invalid',
      { upload: [{ kind: 'validation', fields: ['contentLength'] }] },
    ],
    ['both upload tokens are rejected', { upload: [CHALLENGE, CHALLENGE] }],
    ['the PUT fails, answers non-200 or times out', { put: ['failed'] }],
  ]

  it.each(cvFailures())(
    'should return cv-upload-failed and never call postCareers when %s',
    async (_label, script) => {
      const { client, careersPayloads } = fakeClient(script)

      expect(
        await submitApplicationFlow(application({ cv }), {
          client,
          getToken: countingTokens(),
          locale: 'es',
        })
      ).toEqual({ kind: 'cv-upload-failed' })
      expect(client.postCareers).not.toHaveBeenCalled()
      expect(careersPayloads).toHaveLength(0)
    }
  )

  it('should return cv-upload-failed and never call postCareers when no token can be obtained before the grant', async () => {
    const { client, log } = fakeClient({})
    const getToken = vi.fn(async (): Promise<string> => {
      throw new Error('script blocked')
    })

    expect(
      await submitApplicationFlow(application({ cv }), {
        client,
        getToken,
        locale: 'es',
      })
    ).toEqual({ kind: 'cv-upload-failed' })
    expect(log).toEqual([])
  })

  it('should never call postCareers without cvId when a CV is chosen', async () => {
    const scripts = [...cvFailures().map(([, script]) => script), {}]
    for (const script of scripts) {
      const { client, careersPayloads } = fakeClient(script)
      await submitApplicationFlow(application({ cv }), {
        client,
        getToken: countingTokens(),
        locale: 'es',
      })
      for (const payload of careersPayloads) {
        expect(payload.cvId).toBe(GRANT.cvId)
      }
    }
  })

  it('should call progress.cvUploaded once, after the PUT and before the careers token', async () => {
    const log: string[] = []
    const { client } = fakeClient({})
    const getToken = countingTokens(log)
    const cvUploaded = vi.fn(() => {
      log.push('cvUploaded')
    })
    client.putCv = vi.fn(async () => {
      log.push('put')
      return 'uploaded' as const
    })

    await submitApplicationFlow(
      application({ cv }),
      { client, getToken, locale: 'es' },
      { cvUploaded }
    )

    expect(cvUploaded).toHaveBeenCalledTimes(1)
    expect(log).toEqual(['token:token-1', 'put', 'cvUploaded', 'token:token-2'])
  })

  it('should never call progress.cvUploaded when the CV upload failed', async () => {
    const cvUploaded = vi.fn()
    for (const [, script] of cvFailures()) {
      await submitApplicationFlow(
        application({ cv }),
        {
          client: fakeClient(script).client,
          getToken: countingTokens(),
          locale: 'es',
        },
        { cvUploaded }
      )
    }

    expect(cvUploaded).not.toHaveBeenCalled()
  })

  it('should request a new grant, PUT to the new uploadUrl and use only new tokens when the flow runs again after a failed PUT', async () => {
    const second: CvUploadGrant = {
      cvId: 'cv-2',
      uploadUrl: 'https://bucket.test.invalid/signed-2',
      contentType: 'application/pdf',
    }
    const first: CvUploadGrant = {
      ...second,
      cvId: 'cv-1',
      uploadUrl: 'https://bucket.test.invalid/signed-1',
    }
    const { client, log, careersPayloads } = fakeClient({
      upload: [
        { kind: 'ok', body: first },
        { kind: 'ok', body: second },
      ],
      put: ['failed', 'uploaded'],
    })
    const deps = { client, getToken: countingTokens(), locale: 'es' } as const

    expect(await submitApplicationFlow(application({ cv }), deps)).toEqual({
      kind: 'cv-upload-failed',
    })
    expect(await submitApplicationFlow(application({ cv }), deps)).toEqual({
      kind: 'success',
    })

    const putUrls = vi
      .mocked(client.putCv)
      .mock.calls.map(([grant]) => grant.uploadUrl)
    expect(putUrls).toEqual([first.uploadUrl, second.uploadUrl])
    const tokens = log.filter(entry => entry.includes(':'))
    expect(tokens).toEqual([
      'upload:token-1',
      'upload:token-2',
      'careers:token-3',
    ])
    expect(careersPayloads).toHaveLength(1)
    expect(careersPayloads[0]?.cvId).toBe('cv-2')
  })

  it('should not PUT when the upload request failed', async () => {
    const { client } = fakeClient({ upload: [FAILURE] })

    await submitApplicationFlow(application({ cv }), {
      client,
      getToken: countingTokens(),
      locale: 'es',
    })

    expect(client.putCv).not.toHaveBeenCalled()
  })

  it('should fail when the CV uploaded but the application failed', async () => {
    const { client } = fakeClient({ careers: [FAILURE] })

    expect(
      await submitApplicationFlow(application({ cv }), {
        client,
        getToken: countingTokens(),
        locale: 'es',
      })
    ).toEqual(FAILURE)
  })

  it('should return field errors for the role when the server rejects areaRole', async () => {
    const { client } = fakeClient({
      careers: [{ kind: 'validation', fields: ['areaRole'] }],
    })

    expect(
      await submitApplicationFlow(application(), {
        client,
        getToken: countingTokens(),
        locale: 'es',
      })
    ).toEqual({ kind: 'field-errors', fields: ['areaRole'] })
  })

  it('should fail when the server rejects cvId, which the visitor cannot fix', async () => {
    const { client } = fakeClient({
      careers: [{ kind: 'validation', fields: ['cvId'] }],
    })

    expect(
      await submitApplicationFlow(application({ cv }), {
        client,
        getToken: countingTokens(),
        locale: 'es',
      })
    ).toEqual(FAILURE)
  })

  it('should resolve to failure rather than throw when the role is not a select option', async () => {
    const { client } = fakeClient({})

    expect(
      await submitApplicationFlow(application({ areaRole: 'it' }), {
        client,
        getToken: countingTokens(),
        locale: 'es',
      })
    ).toEqual(FAILURE)
  })
})

describe('submitApplicationFlow · real client over a mocked fetch', () => {
  const API = 'https://api.test.invalid'

  interface Route {
    status: number
    body?: unknown
  }

  function grantBody(n: number) {
    return {
      ok: true,
      cvId: `cv-${n}`,
      uploadUrl: `https://bucket.test.invalid/signed-${n}`,
      method: 'PUT',
      headers: {
        'content-type': 'application/pdf',
        'content-length': String(cv.size),
      },
      expiresInSeconds: 600,
    }
  }

  /** Answers by URL; `put` entries may be an Error to simulate a network
   * or CORS rejection (a `TypeError` with no status, as in browsers). */
  function routedFetch(routes: {
    upload?: Route[]
    put?: (Route | Error)[]
    careers?: Route[]
  }) {
    let grants = 0
    const fetchImpl = vi.fn<FetchLike>(async (url, init) => {
      const respond = ({ status, body }: Route) => ({
        ok: status >= 200 && status < 300,
        status,
        text: async () => JSON.stringify(body ?? {}),
      })
      if (url === `${API}/careers/upload`) {
        grants += 1
        return respond(
          routes.upload?.shift() ?? { status: 200, body: grantBody(grants) }
        )
      }
      if (url === `${API}/careers`) {
        return respond(
          routes.careers?.shift() ?? { status: 200, body: { ok: true } }
        )
      }
      expect(init.method).toBe('PUT')
      const answer = routes.put?.shift() ?? { status: 200 }
      if (answer instanceof Error) throw answer
      return respond(answer)
    })
    return {
      fetchImpl,
      client: createFormsApiClient({ baseUrl: API, fetchImpl }),
    }
  }

  function calledUrls(fetchImpl: ReturnType<typeof vi.fn<FetchLike>>) {
    return fetchImpl.mock.calls.map(([url]) => url)
  }

  function bodyOf(init: RequestInit | undefined): Record<string, unknown> {
    return JSON.parse(String(init?.body))
  }

  it.each([
    [
      '/careers/upload answers 500',
      {
        upload: [{ status: 500, body: { ok: false, error: 'internal_error' } }],
      },
    ],
    ['the PUT answers 403', { put: [{ status: 403 }] }],
    [
      'the PUT rejects with a network error',
      { put: [new TypeError('Failed to fetch')] },
    ],
  ])('should not call /careers when %s', async (_label, routes) => {
    const { client, fetchImpl } = routedFetch(routes)

    expect(
      await submitApplicationFlow(application({ cv }), {
        client,
        getToken: countingTokens(),
        locale: 'es',
      })
    ).toEqual({ kind: 'cv-upload-failed' })
    expect(calledUrls(fetchImpl).some(url => url.endsWith('/careers'))).toBe(
      false
    )
  })

  it('should send /careers with the cvId only after the PUT answered 200', async () => {
    const { client, fetchImpl } = routedFetch({})

    expect(
      await submitApplicationFlow(application({ cv }), {
        client,
        getToken: countingTokens(),
        locale: 'es',
      })
    ).toEqual({ kind: 'success' })
    expect(calledUrls(fetchImpl)).toEqual([
      `${API}/careers/upload`,
      'https://bucket.test.invalid/signed-1',
      `${API}/careers`,
    ])
    expect(bodyOf(fetchImpl.mock.calls[2]?.[1]).cvId).toBe('cv-1')
  })

  it('should send /careers with the second cvId when the retried PUT answers 200', async () => {
    const { client, fetchImpl } = routedFetch({ put: [{ status: 403 }] })
    const deps = { client, getToken: countingTokens(), locale: 'es' } as const

    await submitApplicationFlow(application({ cv }), deps)
    expect(await submitApplicationFlow(application({ cv }), deps)).toEqual({
      kind: 'success',
    })

    const calls = fetchImpl.mock.calls
    const putUrls = calls
      .filter(([, init]) => init.method === 'PUT')
      .map(([url]) => url)
    expect(putUrls).toEqual([
      'https://bucket.test.invalid/signed-1',
      'https://bucket.test.invalid/signed-2',
    ])
    const tokens = calls
      .filter(([, init]) => init.method === 'POST')
      .map(([, init]) => bodyOf(init).turnstileToken)
    expect(new Set(tokens).size).toBe(tokens.length)
    const careers = calls.filter(([url]) => url === `${API}/careers`)
    expect(careers).toHaveLength(1)
    expect(bodyOf(careers[0]?.[1]).cvId).toBe('cv-2')
  })
})
